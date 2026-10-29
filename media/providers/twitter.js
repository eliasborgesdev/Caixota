/**
 * providers/twitter.js — Provider do Twitter / X.
 *
 * Fontes de dados (tentadas nesta ordem):
 *   1. API pública de "syndication" do próprio Twitter (a mesma usada pelos
 *      tweets incorporados em sites). Não exige login nem chave.
 *   2. API pública do FxTwitter (api.fxtwitter.com), como plano B.
 *
 * Cada fonte é convertida para o mesmo formato (ExtractionResult), então a UI
 * não sabe de onde os dados vieram. Se o Twitter mudar algo, normalmente basta
 * ajustar a função `fromSyndication` ou `fromFxTwitter`.
 *
 * Dependências de permissão (manifest → host_permissions):
 *   https://cdn.syndication.twimg.com/*  e  https://api.fxtwitter.com/*
 */

import { fetchJson } from '../core/http.js';
import { hostMatches, extensionFromUrl } from '../core/url-utils.js';
import { MediaNotFoundError, ProviderError } from '../core/errors.js';

const PLATFORM_ID = 'twitter';
const PLATFORM_NAME = 'Twitter / X';

/** Domínios aceitos (inclui espelhos comuns, pois o usuário pode colar qualquer um). */
const HOSTS = ['twitter.com', 'x.com', 'fxtwitter.com', 'vxtwitter.com', 'fixupx.com'];

// ───────────────────────────── Detecção do link ─────────────────────────────

/**
 * Reconhece links de tweet, como:
 *   https://x.com/usuario/status/1234567890
 *   https://twitter.com/i/web/status/1234567890
 *   https://x.com/usuario/status/1234567890/video/1
 * @param {URL} url
 * @returns {import('../core/types.js').ParsedLink | null}
 */
function matches(url) {
  if (!hostMatches(url, HOSTS)) return null;

  const match = url.pathname.match(/\/status(?:es)?\/(\d+)/);
  if (!match) return null;

  return {
    platform: PLATFORM_ID,
    kind: 'tweet',
    kindLabel: 'Tweet',
    id: match[1],
    sourceUrl: url.href,
  };
}

// ───────────────────────────── Helpers de mídia ─────────────────────────────

/**
 * Ajusta o tamanho de uma imagem do Twitter (pbs.twimg.com) via parâmetro `name`.
 * Valores úteis: "orig" (original), "large", "medium", "small".
 * @param {string} baseUrl
 * @param {string} size
 * @returns {string}
 */
function withImageSize(baseUrl, size) {
  const url = new URL(baseUrl);
  url.searchParams.set('name', size);
  return url.href;
}

/**
 * Descobre o rótulo de qualidade de um MP4 do Twitter.
 * As URLs costumam conter a resolução: .../vid/avc1/1280x720/arquivo.mp4
 * @param {string} url
 * @param {number} [bitrate]
 * @returns {string}
 */
function qualityLabel(url, bitrate) {
  const match = url.match(/\/(\d{2,4})x(\d{2,4})\//);
  if (match) return `${Math.min(Number(match[1]), Number(match[2]))}p`;
  return bitrate ? `${Math.round(bitrate / 1000)} kbps` : 'Original';
}

/**
 * Filtra os MP4 de uma lista de variantes do Twitter e ordena do melhor ao pior.
 * (Os `.m3u8` são streaming segmentado e não servem para download direto.)
 * @param {Array<{content_type?: string, url: string, bitrate?: number}>} [variants]
 * @returns {import('../core/types.js').MediaVariant[]}
 */
function buildVideoVariants(variants = []) {
  return variants
    .filter((variant) => variant.content_type === 'video/mp4')
    .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))
    .map((variant) => ({
      label: qualityLabel(variant.url, variant.bitrate),
      url: variant.url,
      bitrate: variant.bitrate,
    }));
}

/** Remove os links encurtados (t.co) que o Twitter anexa ao texto. */
function cleanText(text) {
  return String(text ?? '').replace(/https:\/\/t\.co\/\w+/g, '').trim();
}

/**
 * Monta o ExtractionResult final (e garante que existe ao menos uma mídia).
 * @returns {import('../core/types.js').ExtractionResult}
 */
function buildResult(link, author, text, items) {
  if (!items.length) {
    throw new MediaNotFoundError('Este tweet não tem vídeo, imagem ou GIF para baixar.');
  }
  return {
    platform: PLATFORM_ID,
    platformName: PLATFORM_NAME,
    sourceUrl: link.sourceUrl,
    sourceId: link.id,
    author: author ?? 'twitter',
    text: cleanText(text),
    items,
  };
}

// ─────────────────────── Fonte 1: API de syndication ────────────────────────

/**
 * Token exigido pela API de syndication. Algoritmo usado pelo próprio widget
 * de tweets incorporados do Twitter.
 * @param {string} tweetId
 * @returns {string}
 */
export function syndicationToken(tweetId) {
  return ((Number(tweetId) / 1e15) * Math.PI).toString(6 ** 2).replace(/(0+|\.)/g, '');
}

/**
 * Converte um item de `mediaDetails` (syndication) em MediaItem.
 * @returns {import('../core/types.js').MediaItem | null}
 */
function mapSyndicationMedia(media, index) {
  const size = { width: media.original_info?.width, height: media.original_info?.height };

  if (media.type === 'photo') {
    const base = media.media_url_https;
    return {
      id: String(index),
      kind: 'image',
      url: withImageSize(base, 'orig'),
      thumbnailUrl: withImageSize(base, 'medium'),
      extension: extensionFromUrl(base, 'jpg'),
      ...size,
    };
  }

  if (media.type === 'video' || media.type === 'animated_gif') {
    const variants = buildVideoVariants(media.video_info?.variants);
    if (!variants.length) return null;
    return {
      id: String(index),
      kind: media.type === 'video' ? 'video' : 'gif',
      url: variants[0].url,
      thumbnailUrl: media.media_url_https ?? '',
      extension: 'mp4',
      variants,
      ...size,
    };
  }

  return null;
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromSyndication(link) {
  const token = syndicationToken(link.id);
  const url = `https://cdn.syndication.twimg.com/tweet-result?id=${link.id}&lang=en&token=${token}`;
  const data = await fetchJson(url);

  // "Tombstone" = tweet apagado, protegido ou bloqueado para esta API.
  if (!data?.id_str || data.__typename === 'TweetTombstone') {
    throw new ProviderError('Tweet indisponível na API pública.');
  }

  const items = (data.mediaDetails ?? []).map(mapSyndicationMedia).filter(Boolean);
  return buildResult(link, data.user?.screen_name, data.text, items);
}

// ───────────────────────── Fonte 2: API do FxTwitter ────────────────────────

/**
 * Converte um item de `tweet.media.all` (FxTwitter) em MediaItem.
 * @returns {import('../core/types.js').MediaItem | null}
 */
function mapFxMedia(media, index) {
  const size = { width: media.width, height: media.height };

  if (media.type === 'photo') {
    return {
      id: String(index),
      kind: 'image',
      url: withImageSize(media.url, 'orig'),
      thumbnailUrl: withImageSize(media.url, 'medium'),
      extension: extensionFromUrl(media.url, 'jpg'),
      ...size,
    };
  }

  if (media.type === 'video' || media.type === 'gif') {
    return {
      id: String(index),
      kind: media.type === 'gif' ? 'gif' : 'video',
      url: media.url,
      thumbnailUrl: media.thumbnail_url ?? '',
      extension: 'mp4',
      variants: [{ label: 'Original', url: media.url }],
      ...size,
    };
  }

  return null;
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromFxTwitter(link) {
  const data = await fetchJson(`https://api.fxtwitter.com/i/status/${link.id}`);
  const tweet = data?.tweet;
  if (!tweet) throw new ProviderError('Tweet indisponível no FxTwitter.');

  const items = (tweet.media?.all ?? []).map(mapFxMedia).filter(Boolean);
  return buildResult(link, tweet.author?.screen_name, tweet.text, items);
}

// ─────────────────────────────── Orquestração ───────────────────────────────

/**
 * Tenta cada fonte em ordem. "Sem mídia" é uma resposta válida e encerra a
 * busca; qualquer outra falha passa para a próxima fonte.
 * @param {import('../core/types.js').ParsedLink} link
 * @returns {Promise<import('../core/types.js').ExtractionResult>}
 */
async function extract(link) {
  const causes = [];

  for (const strategy of [fromSyndication, fromFxTwitter]) {
    try {
      return await strategy(link);
    } catch (error) {
      if (error instanceof MediaNotFoundError) throw error;
      causes.push(error);
    }
  }

  throw new ProviderError(
    'Não foi possível ler este tweet. Ele pode ter sido apagado, ser de uma conta protegida ou ter conteúdo sensível.',
    { cause: causes }
  );
}

/** @type {import('../core/types.js').Provider} */
export const twitterProvider = {
  id: PLATFORM_ID,
  name: PLATFORM_NAME,
  matches,
  extract,
};


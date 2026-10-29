/**
 * providers/instagram.js — Provider do Instagram.
 *
 * O Instagram NÃO tem API pública para isso, então este provider usa duas
 * estratégias, da mais completa para a mais simples:
 *
 *   1. API interna (/api/v1/media/{id}/info/), usando a sessão que o usuário já
 *      tem aberta no navegador (cookies). Entrega carrosséis completos, reels,
 *      stories e a melhor qualidade. Exige estar logado em instagram.com.
 *   2. Página de "embed" (/p/{código}/embed/captioned/). Não exige login, mas
 *      é menos completa: em carrosséis, é "melhor esforço".
 *
 * ATENÇÃO: o Instagram muda esses formatos com frequência. Se parar de
 * funcionar, o ponto de ajuste é `mapApiNode` (estratégia 1) ou
 * `fromEmbedPage` (estratégia 2). O restante do projeto não precisa mudar.
 *
 * Dependências de permissão (manifest → host_permissions):
 *   https://www.instagram.com/*
 */

import { fetchJson, fetchText } from '../core/http.js';
import { hostMatches, extensionFromUrl } from '../core/url-utils.js';
import { ProviderError } from '../core/errors.js';

const PLATFORM_ID = 'instagram';
const PLATFORM_NAME = 'Instagram';

/** Id público do app web do Instagram (o mesmo que o site envia nas próprias chamadas). */
const WEB_APP_ID = '936619743392459';

/** Alfabeto usado pelo Instagram para converter o id numérico em "código curto". */
const SHORTCODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

// ───────────────────────────── Detecção do link ─────────────────────────────

/**
 * Reconhece:
 *   /p/CODIGO/         → post (foto, vídeo ou carrossel)
 *   /reel/CODIGO/      → reel      (também /reels/CODIGO/)
 *   /tv/CODIGO/        → IGTV
 *   /usuario/p/CODIGO/ → variação com o nome do usuário no caminho
 *   /stories/usuario/ID/ → story
 * @param {URL} url
 * @returns {import('../core/types.js').ParsedLink | null}
 */
function matches(url) {
  if (!hostMatches(url, ['instagram.com'])) return null;

  const post = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/);
  if (post) {
    const labels = { p: 'Post', reel: 'Reel', reels: 'Reel', tv: 'IGTV' };
    return {
      platform: PLATFORM_ID,
      kind: post[1] === 'p' ? 'post' : post[1] === 'tv' ? 'igtv' : 'reel',
      kindLabel: labels[post[1]],
      id: post[2],
      sourceUrl: url.href,
    };
  }

  const story = url.pathname.match(/^\/stories\/([\w.]+)\/(\d+)/);
  if (story && story[1] !== 'highlights') {
    return {
      platform: PLATFORM_ID,
      kind: 'story',
      kindLabel: 'Story',
      id: story[2],
      mediaId: story[2], // em stories, o id da URL já é o id numérico da mídia
      username: story[1],
      sourceUrl: url.href,
    };
  }

  return null;
}

// ───────────────────────────── Helpers ──────────────────────────────────────

/**
 * Converte o "código curto" da URL (ex.: "CvXn7UAyqCp") no id numérico da mídia.
 * É uma conversão base-64 com o alfabeto do Instagram.
 * @param {string} shortcode
 * @returns {string}
 */
export function shortcodeToMediaId(shortcode) {
  // Links de contas privadas trazem um sufixo extra de 28 caracteres: descartamos.
  const code = shortcode.length > 28 ? shortcode.slice(0, -28) : shortcode;

  let id = 0n;
  for (const char of code) {
    const value = SHORTCODE_ALPHABET.indexOf(char);
    if (value < 0) throw new ProviderError('Código do post inválido.');
    id = id * 64n + BigInt(value);
  }
  return id.toString();
}

/** @returns {import('../core/types.js').ExtractionResult} */
function buildResult(link, author, text, items) {
  if (!items.length) throw new ProviderError('Nenhuma mídia encontrada neste conteúdo.');
  return {
    platform: PLATFORM_ID,
    platformName: PLATFORM_NAME,
    sourceUrl: link.sourceUrl,
    sourceId: link.id,
    author: author ?? 'instagram',
    text: String(text ?? '').trim(),
    items,
  };
}

// ─────────────────── Estratégia 1: API interna (com login) ──────────────────

/**
 * Converte um nó da API (o próprio post ou um filho de carrossel) em MediaItem.
 * Campos relevantes da API:
 *   video_versions[]            → arquivos de vídeo
 *   image_versions2.candidates[] → imagens em vários tamanhos
 * @returns {import('../core/types.js').MediaItem | null}
 */
function mapApiNode(node, index) {
  const images = [...(node.image_versions2?.candidates ?? [])].sort((a, b) => b.width - a.width);
  const bestImage = images[0];
  const video = node.video_versions?.[0];

  if (video) {
    return {
      id: String(index),
      kind: 'video',
      url: video.url,
      thumbnailUrl: bestImage?.url ?? '',
      extension: extensionFromUrl(video.url, 'mp4'),
      width: video.width,
      height: video.height,
    };
  }

  if (bestImage) {
    return {
      id: String(index),
      kind: 'image',
      url: bestImage.url,
      thumbnailUrl: bestImage.url,
      extension: extensionFromUrl(bestImage.url, 'jpg'),
      width: bestImage.width,
      height: bestImage.height,
    };
  }

  return null;
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromPrivateApi(link) {
  const mediaId = link.mediaId ?? shortcodeToMediaId(link.id);

  const data = await fetchJson(`https://www.instagram.com/api/v1/media/${mediaId}/info/`, {
    credentials: 'include', // envia os cookies da sessão do usuário
    headers: {
      'X-IG-App-ID': WEB_APP_ID,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });

  const media = data?.items?.[0];
  if (!media) throw new ProviderError('A API do Instagram não retornou este conteúdo.');

  // Carrossel: cada slide fica em carousel_media. Post simples: o próprio objeto.
  const nodes = media.carousel_media?.length ? media.carousel_media : [media];
  const items = nodes.map(mapApiNode).filter(Boolean);

  return buildResult(link, media.user?.username, media.caption?.text, items);
}

// ───────────────────── Estratégia 2: página de embed (sem login) ────────────

/**
 * A página de embed traz os dados dentro de um JSON "escapado" dentro do HTML.
 * Removemos as barras invertidas que protegem aspas e "/" para que possamos
 * localizar chaves com expressões regulares simples.
 * (Só usamos o resultado para buscar valores; não o interpretamos como JSON.)
 * @param {string} html
 * @returns {string}
 */
function normalizeEscapes(html) {
  return html
    .replace(/\\+u0026/g, '&')
    .replace(/\\+(["/])/g, '$1')
    .replace(/&amp;/g, '&');
}

/** Todos os valores distintos capturados pelo grupo 1 da regex (que precisa ter a flag g). */
function uniqueMatches(text, regex) {
  return [...new Set([...text.matchAll(regex)].map((match) => match[1]))];
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromEmbedPage(link) {
  const html = await fetchText(`https://www.instagram.com/p/${link.id}/embed/captioned/`, {
    credentials: 'omit', // o embed é público; evita redirecionamentos de login
  });
  const text = normalizeEscapes(html);

  // Imagem principal exibida pelo embed: <img class="EmbeddedMediaImage" src="...">
  const imgTag = text.match(/<img[^>]*EmbeddedMediaImage[^>]*>/)?.[0] ?? '';
  const embeddedImage = imgTag.match(/\ssrc="([^"]+)"/)?.[1];

  // Em carrosséis, só olhamos a partir da lista de filhos para não pegar mídia alheia.
  const carouselIndex = text.indexOf('"edge_sidecar_to_children"');
  const isCarousel = carouselIndex >= 0;
  const region = isCarousel ? text.slice(carouselIndex) : text;

  let videos = uniqueMatches(region, /"video_url":"([^"]+)"/g);
  let images = uniqueMatches(region, /"display_url":"([^"]+)"/g);

  // Post simples: só a mídia principal (o resto da página pode citar outros posts).
  if (!isCarousel) {
    videos = videos.slice(0, 1);
    images = embeddedImage ? [embeddedImage] : images.slice(0, 1);
  }

  /** @type {import('../core/types.js').MediaItem[]} */
  const items = videos.length
    ? videos.map((url, index) => ({
        id: String(index),
        kind: 'video',
        url,
        thumbnailUrl: images[index] ?? embeddedImage ?? '',
        extension: extensionFromUrl(url, 'mp4'),
      }))
    : images.map((url, index) => ({
        id: String(index),
        kind: 'image',
        url,
        thumbnailUrl: url,
        extension: extensionFromUrl(url, 'jpg'),
      }));

  const author = text.match(/"username":"([^"]+)"/)?.[1];
  return buildResult(link, author, '', items);
}

// ─────────────────────────────── Orquestração ───────────────────────────────

const LOGIN_HINT =
  'Não foi possível acessar este conteúdo. Se a conta for privada ou o Instagram exigir login, ' +
  'entre em instagram.com neste mesmo navegador e tente de novo.';

/**
 * @param {import('../core/types.js').ParsedLink} link
 * @returns {Promise<import('../core/types.js').ExtractionResult>}
 */
async function extract(link) {
  // Stories só existem na API interna (e exigem login).
  const strategies = link.kind === 'story' ? [fromPrivateApi] : [fromPrivateApi, fromEmbedPage];
  const causes = [];

  for (const strategy of strategies) {
    try {
      return await strategy(link);
    } catch (error) {
      causes.push(error);
    }
  }

  const message =
    link.kind === 'story'
      ? 'Stories só podem ser lidos com a sessão aberta. Entre em instagram.com neste navegador e tente de novo.'
      : LOGIN_HINT;
  throw new ProviderError(message, { cause: causes });
}

/** @type {import('../core/types.js').Provider} */
export const instagramProvider = {
  id: PLATFORM_ID,
  name: PLATFORM_NAME,
  matches,
  extract,
};

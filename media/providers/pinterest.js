/**
 * providers/pinterest.js — Provider do Pinterest.
 *
 * Suporta pins de imagem, GIF e vídeo, além de "story pins" (várias páginas).
 *
 * Fontes de dados (tentadas nesta ordem):
 *   1. Endpoint interno que o próprio site usa (/resource/PinResource/get/).
 *      Não exige login e traz a imagem original e os vídeos em MP4.
 *   2. Metadados da página do pin (og:image / og:video), como plano B.
 *
 * Links curtos (pin.it/xxxx) são resolvidos seguindo o redirecionamento.
 *
 * ATENÇÃO: o Pinterest pode mudar esses formatos. Pontos de ajuste:
 * `itemsFromPin` (fonte 1) e `fromPinPage` (fonte 2).
 *
 * Permissões (manifest → host_permissions):
 *   https://*.pinterest.com/*  e  https://pin.it/*
 */

import { fetchJson, fetchText, fetchWithTimeout } from '../core/http.js';
import { extensionFromUrl } from '../core/url-utils.js';
import { ProviderError } from '../core/errors.js';

const PLATFORM_ID = 'pinterest';
const PLATFORM_NAME = 'Pinterest';

/** pinterest.com, br.pinterest.com, pinterest.com.br, pinterest.co.uk... */
const PINTEREST_HOST = /(^|\.)pinterest\.[a-z]{2,3}(\.[a-z]{2})?$/i;

/** Caminhos de pin: /pin/123/  ou  /pin/titulo-do-pin--123/ */
const PIN_PATH = /\/pin\/(?:[^/]*?--)?(\d+)/;

// ───────────────────────────── Detecção do link ─────────────────────────────

/**
 * @param {URL} url
 * @returns {import('../core/types.js').ParsedLink | null}
 */
function matches(url) {
  const host = url.hostname.toLowerCase();

  // Link curto: https://pin.it/AbC123
  if (host === 'pin.it') {
    const short = url.pathname.match(/^\/([\w-]+)\/?$/);
    return short
      ? { platform: PLATFORM_ID, kind: 'short', kindLabel: 'Pin', id: short[1], sourceUrl: url.href }
      : null;
  }

  if (!PINTEREST_HOST.test(host)) return null;

  const pin = url.pathname.match(PIN_PATH);
  return pin
    ? { platform: PLATFORM_ID, kind: 'pin', kindLabel: 'Pin', id: pin[1], sourceUrl: url.href }
    : null;
}

/** Segue o redirecionamento de um link curto e devolve o link do pin completo. */
async function resolveShortLink(link) {
  const response = await fetchWithTimeout(link.sourceUrl);
  const pin = response.url.match(PIN_PATH);
  if (!pin) throw new ProviderError('Não foi possível abrir este link curto do Pinterest.');
  return { ...link, kind: 'pin', id: pin[1] };
}

// ───────────────────────────── Helpers ──────────────────────────────────────

/** @returns {import('../core/types.js').ExtractionResult} */
function buildResult(link, author, text, items) {
  if (!items.length) throw new ProviderError('Nenhuma mídia encontrada neste pin.');
  return {
    platform: PLATFORM_ID,
    platformName: PLATFORM_NAME,
    sourceUrl: link.sourceUrl,
    sourceId: link.id,
    author: author ?? 'pinterest',
    text: String(text ?? '').trim(),
    items,
  };
}

/**
 * Cria um item de imagem. Se o arquivo for .gif, o item é um GIF de verdade.
 * @returns {import('../core/types.js').MediaItem}
 */
function imageItem(index, url, thumbnailUrl, size = {}) {
  const extension = extensionFromUrl(url, 'jpg');
  return {
    id: String(index),
    kind: extension === 'gif' ? 'gif' : 'image',
    url,
    thumbnailUrl: thumbnailUrl || url,
    extension,
    width: size.width,
    height: size.height,
  };
}

/**
 * Cria um item de vídeo a partir do `video_list` do Pinterest.
 * As chaves do objeto são formatos (V_720P, V_EXP7, V_HLSV3_MOBILE...).
 * Só MP4 serve para download direto; o HLS (.m3u8) é streaming segmentado.
 * @returns {import('../core/types.js').MediaItem | null}
 */
function videoItem(index, videoList, thumbnailUrl) {
  const entries = Object.values(videoList ?? {}).filter((entry) => entry?.url);

  const variants = entries
    .filter((entry) => /\.mp4(\?|$)/i.test(entry.url))
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map((entry) => ({ label: entry.height ? `${Math.min(entry.height, entry.width || entry.height)}p` : 'Original', url: entry.url }));

  // Plano B conhecido: o MP4 fica no mesmo caminho do HLS, trocando "hls" por "720p".
  if (!variants.length) {
    const hls = entries.find((entry) => /\.m3u8(\?|$)/i.test(entry.url));
    if (hls) {
      variants.push({
        label: '720p',
        url: hls.url.replace('/hls/', '/720p/').replace(/\.m3u8(\?.*)?$/, '.mp4'),
      });
    }
  }
  if (!variants.length) return null;

  const best = entries.find((entry) => entry.url === variants[0].url);
  return {
    id: String(index),
    kind: 'video',
    url: variants[0].url,
    thumbnailUrl: thumbnailUrl ?? '',
    extension: 'mp4',
    width: best?.width,
    height: best?.height,
    variants,
  };
}

// ───────────────── Fonte 1: endpoint interno do site ────────────────────────

/** Converte as páginas de um "story pin" em itens (imagens e vídeos). */
function itemsFromStoryPages(pages) {
  const items = [];
  for (const page of pages ?? []) {
    for (const block of page.blocks ?? []) {
      const index = items.length;
      if (block.video?.video_list) {
        const item = videoItem(index, block.video.video_list, block.video.cover_image_url);
        if (item) items.push(item);
      } else if (block.image?.images) {
        const original = block.image.images.originals ?? Object.values(block.image.images)[0];
        if (original?.url) items.push(imageItem(index, original.url, original.url, original));
      }
    }
  }
  return items;
}

/**
 * Extrai os itens baixáveis de um objeto "pin" do Pinterest.
 * Prioridade: story pin → vídeo → imagem/GIF.
 * @returns {import('../core/types.js').MediaItem[]}
 */
function itemsFromPin(pin) {
  const storyItems = itemsFromStoryPages(pin.story_pin_data?.pages);
  if (storyItems.length) return storyItems;

  const original = pin.images?.orig;
  const thumbnail = pin.images?.['736x']?.url ?? original?.url;

  if (pin.videos?.video_list) {
    const video = videoItem(0, pin.videos.video_list, thumbnail);
    if (video) return [video];
  }

  return original?.url ? [imageItem(0, original.url, thumbnail, original)] : [];
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromResourceApi(link) {
  const payload = { options: { id: link.id, field_set_key: 'detailed', noCache: true }, context: {} };
  const url =
    'https://www.pinterest.com/resource/PinResource/get/' +
    `?source_url=${encodeURIComponent(`/pin/${link.id}/`)}` +
    `&data=${encodeURIComponent(JSON.stringify(payload))}`;

  const json = await fetchJson(url, {
    credentials: 'omit',
    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  });

  const pin = json?.resource_response?.data;
  if (!pin?.id) throw new ProviderError('O Pinterest não retornou este pin.');

  const author = pin.pinner?.username ?? pin.native_creator?.username;
  return buildResult(link, author, pin.title || pin.description, itemsFromPin(pin));
}

// ───────────────── Fonte 2: metadados da página do pin ──────────────────────

/** Lê o conteúdo de uma <meta property="..."> (aceita os atributos em qualquer ordem). */
function readMeta(html, property) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    if (!new RegExp(`(?:property|name)="${property}"`, 'i').test(tag)) continue;
    const content = tag.match(/content="([^"]*)"/i)?.[1];
    if (content) return content.replace(/&amp;/g, '&');
  }
  return null;
}

/** @returns {Promise<import('../core/types.js').ExtractionResult>} */
async function fromPinPage(link) {
  const html = await fetchText(`https://www.pinterest.com/pin/${link.id}/`);

  const ogImage = readMeta(html, 'og:image');
  const ogVideo = readMeta(html, 'og:video');
  const title = readMeta(html, 'og:title') ?? '';

  /** @type {import('../core/types.js').MediaItem[]} */
  const items = [];

  if (ogVideo && /\.mp4(\?|$)/i.test(ogVideo)) {
    items.push({
      id: '0',
      kind: 'video',
      url: ogVideo,
      thumbnailUrl: ogImage ?? '',
      extension: 'mp4',
    });
  } else if (ogImage) {
    // A página só expõe a versão reduzida (ex.: /736x/); o original fica em /originals/.
    const original = ogImage.replace(/\/\d+x\//, '/originals/');
    items.push(imageItem(0, original, ogImage));
  }

  return buildResult(link, null, title, items);
}

// ─────────────────────────────── Orquestração ───────────────────────────────

/**
 * @param {import('../core/types.js').ParsedLink} link
 * @returns {Promise<import('../core/types.js').ExtractionResult>}
 */
async function extract(link) {
  const pinLink = link.kind === 'short' ? await resolveShortLink(link) : link;
  const causes = [];

  for (const strategy of [fromResourceApi, fromPinPage]) {
    try {
      return await strategy(pinLink);
    } catch (error) {
      causes.push(error);
    }
  }

  throw new ProviderError(
    'Não foi possível ler este pin. Ele pode ter sido removido ou estar em um quadro privado.',
    { cause: causes }
  );
}

/** @type {import('../core/types.js').Provider} */
export const pinterestProvider = {
  id: PLATFORM_ID,
  name: PLATFORM_NAME,
  matches,
  extract,
};

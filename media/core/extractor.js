/**
 * core/extractor.js — Ponto de entrada do núcleo.
 *
 * Mantém a lista de providers e expõe duas funções:
 *   detectLink(texto)   → descobre plataforma + tipo de conteúdo (sem rede).
 *   extractMedia(texto) → detecta e busca a mídia (atalho de uma chamada só).
 *
 * Para suportar uma nova plataforma: crie um arquivo em providers/ que cumpra o
 * contrato `Provider` (veja types.js) e adicione-o à lista abaixo.
 */

import { toUrl } from './url-utils.js';
import { UnsupportedUrlError } from './errors.js';
import { twitterProvider } from '../providers/twitter.js';
import { instagramProvider } from '../providers/instagram.js';
import { pinterestProvider } from '../providers/pinterest.js';

/** Providers registrados. A ordem não importa: os domínios não se sobrepõem. */
export const providers = [twitterProvider, instagramProvider, pinterestProvider];

/**
 * Identifica a plataforma e o tipo de conteúdo de um link. Não faz requisições.
 * @param {string} rawText Texto colado pelo usuário.
 * @returns {{ provider: import('./types.js').Provider, link: import('./types.js').ParsedLink }}
 */
export function detectLink(rawText) {
  const url = toUrl(rawText);

  for (const provider of providers) {
    const link = provider.matches(url);
    if (link) return { provider, link };
  }

  throw new UnsupportedUrlError(
    'Link não reconhecido. Use o link de um post do X, Instagram ou Pinterest (post, reel, story ou pin).'
  );
}

/**
 * Detecta o link e busca a mídia.
 * @param {string} rawText
 * @returns {Promise<import('./types.js').ExtractionResult>}
 */
export async function extractMedia(rawText) {
  const { provider, link } = detectLink(rawText);
  return provider.extract(link);
}

/**
 * core/url-utils.js — Funções puras para trabalhar com URLs.
 */

import { InvalidUrlError } from './errors.js';

/**
 * Converte o texto colado pelo usuário em um objeto URL.
 * - Procura a primeira URL dentro do texto (o usuário pode colar frases inteiras).
 * - Aceita links sem "https://".
 * @param {string} raw
 * @returns {URL}
 */
export function toUrl(raw) {
  const text = String(raw ?? '').trim();
  if (!text) throw new InvalidUrlError('Cole um link para começar.');

  const found = text.match(/https?:\/\/\S+/i);
  const candidate = found ? found[0] : text;
  const withScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    return new URL(withScheme);
  } catch (error) {
    throw new InvalidUrlError('Esse texto não parece ser um link válido.', { cause: error });
  }
}

/**
 * Verifica se o host da URL é um dos domínios (ou subdomínio de um deles).
 * Ex.: hostMatches(new URL('https://www.x.com/a'), ['x.com']) → true
 * @param {URL} url
 * @param {string[]} domains
 * @returns {boolean}
 */
export function hostMatches(url, domains) {
  const host = url.hostname.toLowerCase();
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

/**
 * Lê a extensão do arquivo no caminho da URL (ignora a query string).
 * @param {string} url
 * @param {string} fallback Usada quando a URL não tem extensão reconhecível.
 * @returns {string}
 */
export function extensionFromUrl(url, fallback) {
  try {
    const match = new URL(url).pathname.match(/\.([a-z0-9]{2,4})$/i);
    return match ? match[1].toLowerCase() : fallback;
  } catch {
    return fallback;
  }
}

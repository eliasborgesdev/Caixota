/**
 * core/http.js — Helpers de rede (fetch com timeout e erros tipados).
 *
 * Só usa `fetch` e `AbortController`, que existem em qualquer navegador e em
 * service workers. Dentro de uma extensão, os domínios acessados precisam estar
 * em `host_permissions` no manifest para escapar das restrições de CORS.
 */

import { AppError, HttpError, ProviderError } from './errors.js';

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * fetch com timeout. Lança HttpError se o status não for 2xx.
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs]
 * @returns {Promise<Response>}
 */
export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) throw new HttpError(response.status, url);
    return response;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error?.name === 'AbortError') {
      throw new ProviderError('O servidor demorou demais para responder. Tente de novo.', { cause: error });
    }
    throw new ProviderError('Não foi possível conectar. Verifique sua internet.', { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * GET que devolve JSON já interpretado.
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs]
 * @returns {Promise<any>}
 */
export async function fetchJson(url, options, timeoutMs) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  try {
    return await response.json();
  } catch (error) {
    throw new ProviderError('O servidor respondeu em um formato inesperado.', { cause: error });
  }
}

/**
 * GET que devolve texto (HTML, por exemplo).
 * @param {string} url
 * @param {RequestInit} [options]
 * @param {number} [timeoutMs]
 * @returns {Promise<string>}
 */
export async function fetchText(url, options, timeoutMs) {
  const response = await fetchWithTimeout(url, options, timeoutMs);
  return response.text();
}

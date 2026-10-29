/**
 * core/filename.js — Monta nomes de arquivo seguros para o download.
 */

/**
 * Deixa só letras, números, ponto, hífen e sublinhado.
 * @param {string} part
 * @returns {string}
 */
export function sanitize(part) {
  return String(part ?? '')
    .replace(/[^\w.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

/**
 * Nome no formato: plataforma_autor_idDoPost[_n].extensão
 * O sufixo _n (1, 2, 3...) só aparece quando o post tem mais de uma mídia.
 * @param {import('./types.js').ExtractionResult} result
 * @param {import('./types.js').MediaItem} item
 * @param {number} index Posição do item em `result.items`.
 * @returns {string}
 */
export function buildFilename(result, item, index) {
  const parts = [result.platform, sanitize(result.author), sanitize(result.sourceId)];
  if (result.items.length > 1) parts.push(String(index + 1));
  return `${parts.filter(Boolean).join('_')}.${item.extension}`;
}

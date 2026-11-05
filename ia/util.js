/**
 * util.js — utilitários pequenos e sem dependências do módulo IA da Caixota.
 * (ES module: usado pelo service worker e pela página de opções.)
 */

/**
 * Erro com um "código" estável. O content script usa o código para decidir
 * o que mostrar (ex.: botão "Abrir configurações" quando for SEM_CHAVE).
 *
 * Códigos usados:
 *  SEM_CHAVE        → usuário ainda não configurou a chave da API
 *  CHAVE_INVALIDA   → o Gemini recusou a chave
 *  LIMITE           → limite do plano gratuito atingido (429)
 *  MODELO           → modelo inexistente / sem acesso (interno: dispara fallback)
 *  FERRAMENTA       → a busca do Google embutida não está disponível (interno)
 *  BLOQUEADO        → a IA recusou responder (filtro de segurança)
 *  SEM_FONTES       → nenhuma fonte foi encontrada
 *  REDE             → falha de conexão
 *  GENERICO         → qualquer outra coisa
 */
export class TTError extends Error {
  constructor(codigo, mensagem) {
    super(mensagem);
    this.name = 'TTError';
    this.codigo = codigo;
  }
}

/** Extrai o domínio "limpo" (sem www.) de uma URL. Retorna '' se inválida. */
export function dominioDe(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Chave para detectar fontes duplicadas (ignora www, #hash e "/" final). */
export function chaveUrl(url) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '') + u.search).toLowerCase();
  } catch {
    return String(url).toLowerCase();
  }
}

/** Só aceita http/https (evita javascript: e afins vindos de respostas externas). */
export function urlSegura(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Remove tags HTML e espaços extras de um trecho de texto. */
export function limparTexto(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

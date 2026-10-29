/**
 * core/errors.js — Erros tipados do projeto.
 *
 * Todo erro "esperado" estende AppError e carrega `userMessage`, um texto já
 * pronto (em português) para mostrar ao usuário. Qualquer outro tipo de erro é
 * tratado pela UI como falha inesperada.
 */

export class AppError extends Error {
  /**
   * @param {string} userMessage Mensagem amigável para exibir na interface.
   * @param {{cause?: unknown}} [options]
   */
  constructor(userMessage, options = {}) {
    super(userMessage, options);
    this.name = this.constructor.name;
    this.userMessage = userMessage;
  }
}

/** O texto colado não é uma URL válida. */
export class InvalidUrlError extends AppError {}

/** A URL é válida, mas nenhum provider a reconhece. */
export class UnsupportedUrlError extends AppError {}

/** O post foi encontrado, porém não tem mídia baixável. */
export class MediaNotFoundError extends AppError {}

/** Falha ao consultar a plataforma (rede, bloqueio, formato inesperado...). */
export class ProviderError extends AppError {}

/** Resposta HTTP com status de erro. */
export class HttpError extends AppError {
  /**
   * @param {number} status
   * @param {string} url
   */
  constructor(status, url) {
    super(`A requisição falhou (HTTP ${status}).`);
    this.status = status;
    this.url = url;
  }
}

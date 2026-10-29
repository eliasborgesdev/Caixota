/**
 * core/types.js — Contratos de dados do projeto (somente JSDoc, sem código).
 *
 * Tudo que circula entre as camadas (providers → UI → downloader) segue os
 * formatos descritos aqui. Se você for portar este código, é isto que precisa
 * ser respeitado; o resto pode ser reescrito.
 */

/**
 * Tipo da mídia.
 * Obs.: "gif" do Twitter é, na verdade, um MP4 curto em loop. Por isso um item
 * `gif` normalmente tem `extension: 'mp4'`.
 * @typedef {'video' | 'image' | 'gif'} MediaKind
 */

/**
 * Uma versão alternativa do mesmo arquivo (ex.: 1080p, 720p, 480p).
 * @typedef {Object} MediaVariant
 * @property {string} label    Texto exibido ao usuário (ex.: "720p").
 * @property {string} url      URL direta do arquivo.
 * @property {number} [bitrate]
 */

/**
 * Um arquivo baixável.
 * @typedef {Object} MediaItem
 * @property {string}    id            Identificador dentro do post ("0", "1", ...).
 * @property {MediaKind} kind
 * @property {string}    url           URL direta da melhor qualidade disponível.
 * @property {string}    thumbnailUrl  URL da prévia (pode ser string vazia).
 * @property {string}    extension     Extensão do arquivo, sem ponto ("mp4", "jpg").
 * @property {number}    [width]
 * @property {number}    [height]
 * @property {MediaVariant[]} [variants]  Qualidades alternativas (a primeira é a melhor).
 */

/**
 * Resultado da análise de um link (antes de buscar a mídia).
 * Cada provider define campos extras livremente.
 * @typedef {Object} ParsedLink
 * @property {string} platform    Id do provider ("twitter", "instagram").
 * @property {string} kind        Tipo de conteúdo ("tweet", "reel", "post", "story"...).
 * @property {string} kindLabel   Rótulo para exibir ("Tweet", "Reel"...).
 * @property {string} id          Id do conteúdo na plataforma.
 * @property {string} sourceUrl   URL original colada pelo usuário.
 */

/**
 * Resultado final de uma extração.
 * @typedef {Object} ExtractionResult
 * @property {string}      platform      Id do provider.
 * @property {string}      platformName  Nome legível ("Twitter / X").
 * @property {string}      sourceUrl
 * @property {string}      sourceId      Id do post (usado no nome do arquivo).
 * @property {string}      author        Usuário, sem "@".
 * @property {string}      text          Legenda/texto do post (pode ser vazio).
 * @property {MediaItem[]} items         Sempre com pelo menos 1 item.
 */

/**
 * Contrato que todo provider precisa cumprir.
 * @typedef {Object} Provider
 * @property {string} id
 * @property {string} name
 * @property {(url: URL) => (ParsedLink | null)} matches
 *           Devolve um ParsedLink se a URL é desta plataforma e de um conteúdo
 *           suportado; caso contrário, null. NÃO deve fazer requisições.
 * @property {(link: ParsedLink) => Promise<ExtractionResult>} extract
 *           Busca a mídia. Em caso de falha, lança um AppError (core/errors.js).
 */

export {};

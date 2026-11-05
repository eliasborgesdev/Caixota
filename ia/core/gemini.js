
/**
 * gemini.js — chamada única à API REST do serviço de IA (generateContent).
 * ---------------------------------------------------------------------------
 * Só faz uma coisa: enviar um prompt e devolver { texto, fontesGrounding }.
 * A lógica de "qual modelo tentar" fica em llm.js.
 *
 * A chave vai no header "x-goog-api-key" (nunca na URL, para não vazar em logs).
 */

import { TTError, urlSegura, dominioDe } from '../util.js';

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models/';

/**
 * @param {object}  p
 * @param {string}  p.key         chave da API
 * @param {string}  p.model       id do modelo (ex.: "gemini-2.5-flash")
 * @param {string}  p.sistema     instrução de sistema
 * @param {string}  p.usuario     texto do usuário
 * @param {boolean} [p.grounding] liga a ferramenta google_search
 * @param {boolean} [p.json]      pede resposta em JSON (não combina com grounding)
 * @param {number}  [p.temperatura] 0 a 1 (padrão 0.2)
 * @param {AbortSignal} [p.signal]
 * @returns {Promise<{texto:string, fontesGrounding:Array<{titulo:string,url:string,dominio:string}>}>}
 */
export async function gerar({ key, model, sistema, usuario, grounding = false, json = false, temperatura = 0.2, signal, imagem }) {
  const corpo = {
    systemInstruction: { parts: [{ text: sistema }] },
    contents: [{ role: 'user', parts: [{ text: usuario }, ...(imagem ? [{inlineData: imagem}] : [])] }],
    generationConfig: { temperature: temperatura },
  };
  if (json && !grounding) corpo.generationConfig.responseMimeType = 'application/json';
  if (grounding) corpo.tools = [{ google_search: {} }];

  let res;
  try {
    res = await fetch(`${BASE}${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(corpo),
      signal,
    });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    throw new TTError('REDE', 'Não consegui falar com o serviço de IA. Verifique sua conexão com a internet.');
  }

  const dados = await res.json().catch(() => null);
  if (!res.ok) throw classificarErro(res.status, dados?.error?.message || '', grounding);

  if (dados?.promptFeedback?.blockReason) {
    throw new TTError('BLOQUEADO', 'A IA se recusou a analisar este trecho.');
  }

  const candidato = dados?.candidates?.[0];
  const texto = (candidato?.content?.parts || [])
    .filter((p) => typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('')
    .trim();

  if (!texto) {
    throw new TTError('GENERICO', 'O serviço de IA não devolveu nenhuma resposta. Tente novamente.');
  }

  // Fontes da busca do Google (só vem preenchido quando grounding=true).
  // Observação: as URLs costumam ser links de redirecionamento do Google
  // (vertexaisearch...), que levam à página real ao serem abertos.
  const fontesGrounding = (candidato?.groundingMetadata?.groundingChunks || [])
    .map((c) => c?.web)
    .filter((w) => w?.uri && urlSegura(w.uri))
    .map((w) => ({ titulo: w.title || dominioDe(w.uri), url: w.uri, dominio: w.title || dominioDe(w.uri) }));

  return { texto, fontesGrounding };
}

/** Traduz erros HTTP do serviço de IA em TTError com código estável. */
function classificarErro(status, msg, usouGrounding) {
  const m = msg.toLowerCase();

  if (/api key not valid|api_key_invalid|api key expired|invalid api key/.test(m)) {
    return new TTError('CHAVE_INVALIDA', 'A chave da API é inválida. Confira nas configurações.');
  }
  if (usouGrounding && /google_search|grounding|search tool|tool/.test(m) && status !== 429 && status < 500) {
    return new TTError('FERRAMENTA', 'Busca do Google indisponível para este modelo/plano.');
  }
  if (status === 429) {
    // Se estava usando grounding, a cota específica dele pode ter acabado:
    // o pipeline tenta de novo sem grounding.
    return new TTError(usouGrounding ? 'FERRAMENTA' : 'LIMITE', usouGrounding
      ? 'Cota da busca do Google esgotada.'
      : 'Você atingiu o limite gratuito do serviço de IA por agora. Aguarde um pouco e tente de novo.');
  }
  if (status === 404 || /not found|no longer available|not supported|does not exist|permission/.test(m)) {
    if (status === 401 || (status === 403 && /api key|credential/.test(m))) {
      return new TTError('CHAVE_INVALIDA', 'A chave da API foi recusada. Confira nas configurações.');
    }
    return new TTError('MODELO', `Modelo indisponível: ${msg || status}`);
  }
  if (status === 401 || status === 403) {
    return new TTError('CHAVE_INVALIDA', 'A chave da API foi recusada. Confira nas configurações.');
  }
  if (status >= 500) {
    return new TTError('GENERICO', 'O serviço de IA está instável no momento. Tente novamente em instantes.');
  }
  return new TTError('GENERICO', `Erro do serviço de IA (${status}): ${msg || 'sem detalhes'}`);
}

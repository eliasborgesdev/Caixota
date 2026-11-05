/**
 * settings.js — configurações do módulo IA da Caixota (todas as ferramentas).
 * ---------------------------------------------------------------------------
 * Tudo fica em UMA única chave de chrome.storage.local ("tiraTeima"), então
 * não há risco de colidir com as chaves da sua extensão maior.
 * (Usamos "local" e não "sync" de propósito: chaves de API não devem ser
 * sincronizadas entre dispositivos.)
 *
 * Formato salvo:
 * {
 *   geminiKey, model, idiomaResposta,            // configurações GLOBAIS
 *   useGrounding, useWikipedia, braveKey,        // (globais usadas pelo Verificar)
 *   ferramentas: {                               // configurações POR FERRAMENTA
 *     resumir:    { ativa: true, tamanho: 'medio' },
 *     reescrever: { ativa: true, tomPadrao: 'formal', ... },
 *     ...
 *   }
 * }
 * O que cada ferramenta aceita configurar é declarado no definicao.js dela.
 */

export const STORAGE_KEY = 'tiraTeima';

/** Nome da porta (chrome.runtime.connect) entre content script e background. */
export const PORT_NAME = 'tira-teima';

/** Mensagem usada pelo content script para pedir a abertura das opções. */
export const MSG_ABRIR_OPCOES = 'tira-teima:abrir-opcoes';

export const DEFAULTS = Object.freeze({
  /** Chave gratuita do Google AI Studio (https://aistudio.google.com/apikey). */
  geminiKey: '',
  /** "auto" = a extensão escolhe e faz fallback sozinha. Ou um id de modelo. */
  model: 'auto',
  /** Idioma das respostas: 'pt-BR' | 'mesmo' (idioma do texto) | 'en' | 'es'. */
  idiomaResposta: 'pt-BR',
  /** (Verificar) tenta usar a busca do Google embutida no Gemini. */
  useGrounding: true,
  /** (Verificar) usa a Wikipédia como fonte (grátis, sem chave). */
  useWikipedia: true,
  /** (Verificar) opcional: chave do Brave Search API. */
  braveKey: '',
  /** Configurações por ferramenta (ver definicao.js de cada uma). */
  ferramentas: {},
});

/**
 * Cadeias de modelos tentadas no modo "auto". Se um modelo não existir mais
 * ou a conta não tiver acesso, passa para o próximo. Os nomes de modelo do
 * Gemini mudam com frequência: se algum parar de funcionar, ajuste AQUI
 * (ou escolha um modelo manualmente na página de opções).
 *
 * - Com busca do Google (grounding): só os modelos 2.5 têm cota gratuita.
 * - Sem grounding: começamos pelo mais novo "lite" (rápido e gratuito).
 */
export const CADEIA_COM_GROUNDING = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash-lite'];
export const CADEIA_SEM_GROUNDING = ['gemini-3.5-flash-lite', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];

/** Modelos que aceitam a ferramenta google_search no plano gratuito. */
export const MODELOS_COM_GROUNDING_GRATIS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

/** Sugestões exibidas no campo de modelo da página de opções. */
export const MODELOS_SUGERIDOS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
];

export async function getSettings() {
  const r = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULTS, ...(r[STORAGE_KEY] || {}) };
}

export async function saveSettings(parcial) {
  const atual = await getSettings();
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...atual, ...parcial } });
}

/**
 * Configuração efetiva de UMA ferramenta: padrões do definicao.js
 * sobrepostos pelo que o usuário salvou.
 * @param {object} settings  resultado de getSettings()
 * @param {{id:string, padroes?:object}} definicao
 */
export function configFerramenta(settings, definicao) {
  return { ativa: true, ...(definicao.padroes || {}), ...(settings.ferramentas?.[definicao.id] || {}) };
}

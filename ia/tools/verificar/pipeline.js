/**
 * pipeline.js — o "cérebro" do IA da Caixota. Sem nenhuma dependência de UI.
 * ---------------------------------------------------------------------------
 * verificar() recebe o texto selecionado e devolve:
 *
 *   {
 *     veredito: 'apoiado' | 'contradito' | 'parcial' | 'inconclusivo' | 'informativo' | null,
 *     resposta: string,            // texto da IA (markdown simples, com citações [1], [2]...)
 *     fontes:   [{titulo,url,dominio,trecho,origem}],
 *     aviso:    string | null,     // ex.: "só encontrei 2 fontes"
 *     modelo:   string,
 *     usouBuscaGoogle: boolean
 *   }
 *
 * Fluxo:
 *  1. Busca fontes reais (Wikipédia / Brave) em paralelo.
 *  2. Manda texto + trechos para o Gemini, que resume SOMENTE com base neles
 *     (e, opcionalmente, com a busca do Google embutida).
 *  3. Junta as fontes e devolve. Os links NUNCA são escritos pela IA.
 *
 * Esta função não sabe nada de chrome.runtime: pode ser testada no Node.
 */

import { gerarComFallback, regraIdioma, blocoDados, REGRA_DADOS } from '../../core/llm.js';
import { buscarWikipedia, buscarBrave, fontePertinente } from './sources.js';
import { TTError, chaveUrl } from '../../util.js';

const MAX_FONTES_PARA_IA = 8;
const MAX_FONTES_EXTRAS_GOOGLE = 4;
const MINIMO_FONTES = 3;

const instrucaoSistema = (settings) => `Você é o motor de resposta rápida de uma extensão de navegador chamada IA da Caixota.
O usuário selecionou um trecho de uma página e quer saber, em segundos, se aquilo é confiável.
O trecho pode ser uma afirmação, uma negação, uma pergunta ou apenas um termo.

REGRAS
- Baseie-se SOMENTE nas fontes numeradas em <fontes> ; use a busca do Google apenas para localizar fontes adicionais. Não use memória para afirmar fatos que as fontes não sustentam.
- Responda ao trecho exato. Para pergunta de sim ou não, avalie a proposição implícita: abra a resposta com “Sim”, “Não” ou uma condição que responda à pergunta (no idioma solicitado), antes do contexto. Use APOIADO, CONTRADITO ou PARCIAL conforme a evidência. Não use INFORMATIVO como atalho para perguntas de sim ou não.
- Para pergunta aberta (quem, quando, como, por quê etc.), dê a informação pedida na primeira frase. Não comece descrevendo o assunto ou reescrevendo a pergunta.
- Se as fontes não bastarem para concluir, diga isso claramente (INCONCLUSIVO). Nunca invente fatos, números, citações ou links.
- ${REGRA_DADOS}
- Cite as fontes no texto com colchetes, ex.: [1] ou [2][3], usando os números de <fontes>. Cite pelo menos 2 fontes quando houver.
- ${regraIdioma(settings)}
- Seja direto: comece pela conclusão. Máximo de ~150 palavras, em 1 a 3 parágrafos curtos. Pode usar **negrito** em termos-chave e listas com "- ". Sem títulos, sem tabelas, sem emojis.
- Se houver divergência entre as fontes, diga qual é o ponto de divergência.

FORMATO OBRIGATÓRIO
Primeira linha, exatamente assim:
VEREDITO: <APOIADO | CONTRADITO | PARCIAL | INCONCLUSIVO | INFORMATIVO>
Depois uma linha em branco e a resposta.

Significado:
APOIADO = as fontes sustentam a afirmação. CONTRADITO = as fontes a contradizem. PARCIAL = parte é correta, parte não / falta contexto.
INCONCLUSIVO = as fontes não permitem concluir. INFORMATIVO = não é uma afirmação checável (é um termo ou uma pergunta aberta); dê a definição ou a resposta direta.`;

/**
 * @param {object} p
 * @param {string} p.texto       texto selecionado
 * @param {object} p.settings    resultado de getSettings()
 * @param {AbortSignal} [p.signal]
 * @param {(etapa:'buscando'|'analisando')=>void} [p.onProgress]
 */
export async function verificar({ texto, settings, signal, onProgress = () => {} }) {
  if (!settings.geminiKey) {
    throw new TTError('SEM_CHAVE', 'Configure sua chave da API para começar.');
  }

  // 1) Fontes reais ---------------------------------------------------------
  onProgress('buscando');
  const [brave, wiki] = await Promise.all([
    buscarBrave(texto, { key: settings.braveKey, signal }),
    settings.useWikipedia ? buscarWikipedia(texto, { signal }) : [],
  ]);

  // Brave primeiro (melhor para notícias/atualidades), depois Wikipédia; sem duplicatas.
  const fontes = [];
  const vistas = new Set();
  for (const f of [...brave.slice(0, 5), ...wiki]) {
    if(!fontePertinente(texto,f))continue;
    const k = chaveUrl(f.url);
    if (vistas.has(k)) continue;
    vistas.add(k);
    fontes.push(f);
    if (fontes.length >= MAX_FONTES_PARA_IA) break;
  }

  const semEvidencia=()=>({veredito:'inconclusivo',resposta:'Não encontrei evidências pertinentes para verificar este trecho.',fontes:[],aviso:'Tente selecionar uma afirmação mais específica ou habilitar outra fonte.'});
  if(!fontes.length&&!settings.useGrounding)return semEvidencia();
  onProgress('analisando');
  const {texto:bruto,fontesGrounding,modelo,usouBuscaGoogle}=await gerarComFallback({
    settings,sistema:instrucaoSistema(settings),usuario:montarPrompt(texto,fontes),grounding:settings.useGrounding,signal
  });
  // Metadados da busca podem enriquecer a lista, mas só fontes numeradas no
  // prompt sustentam um veredito: a API não garante a ordem das citações geradas.
  const extras=fontesGrounding.filter(f=>fontePertinente(texto,f)&&!vistas.has(chaveUrl(f.url))).slice(0,MAX_FONTES_EXTRAS_GOOGLE);
  if(!fontes.length)return {...semEvidencia(),fontes:extras};
  const {veredito,resposta}=interpretarResposta(bruto);
  const refs=[...resposta.matchAll(/\[(\d+)\]/g)].map(m=>Number(m[1]));
  if(!veredito||veredito==='inconclusivo'||!refs.length||refs.some(n=>n<1||n>fontes.length))return {...semEvidencia(),fontes:[...fontes,...extras]};
  const todas=[...fontes,...extras];

  return {
    veredito,
    resposta,
    fontes: todas,
    aviso:
      todas.length < MINIMO_FONTES
        ? `Só encontrei ${todas.length} fonte${todas.length > 1 ? 's' : ''} para este trecho. Leia com cautela.`
        : null,
    modelo,
    usouBuscaGoogle,
  };
}

// ---------------------------------------------------------------------------

function montarPrompt(texto, fontes) {
  const seguro = (s) => String(s).replace(/</g, '‹');
  const blocos = fontes
    .map((f, i) => `[${i + 1}] ${seguro(f.titulo)} (${seguro(f.dominio)})\n${seguro(f.trecho)}`)
    .join('\n\n');
  return (
    blocoDados('texto_selecionado', texto) +
    '\n\n' +
    blocoDados('fontes', blocos || '(nenhuma fonte foi encontrada pela extensão)')
  );
}

const VEREDITOS = {
  APOIADO: 'apoiado',
  CONTRADITO: 'contradito',
  PARCIAL: 'parcial',
  INCONCLUSIVO: 'inconclusivo',
  INFORMATIVO: 'informativo',
};

/** Separa "VEREDITO: X" do corpo da resposta. Tolerante a variações do modelo. */
export function interpretarResposta(bruto) {
  let texto = bruto.trim();
  let veredito = null;

  const m = texto.match(/^\W*VEREDITO\s*:\s*\**\s*([A-Za-zÀ-ú]+)\**[^\n]*\n?/i);
  if (m) {
    const chave = m[1]
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase();
    veredito = VEREDITOS[chave] ?? null;
    texto = texto.slice(m[0].length).trim();
  }
  return { veredito, resposta: texto };
}

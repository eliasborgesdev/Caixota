/**
 * tools/dicionario/background.js — handler da ferramenta "Dicionário inteligente".
 * Pede ao Gemini um verbete em JSON; se o JSON vier quebrado, devolve o texto cru.
 * Retorno: { dados: {...} | null, texto: string (versão em texto, usada ao copiar), modelo }
 */
import { gerarComFallback, regraIdioma, blocoDados, REGRA_DADOS, limparSaida } from '../../core/llm.js';

const str = (v, max = 400) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const lista = (v, n, max = 300) =>
  (Array.isArray(v) ? v : []).map((x) => str(x, max)).filter(Boolean).slice(0, n);

/** Converte a saída do modelo em um verbete limpo (ou null se não for JSON utilizável). */
export function interpretarVerbete(bruto, opcoes = {}) {
  let obj = null;
  const t = limparSaida(bruto);
  try {
    const ini = t.indexOf('{');
    const fim = t.lastIndexOf('}');
    obj = JSON.parse(t.slice(ini, fim + 1));
  } catch {
    return null;
  }
  if (!obj || typeof obj !== 'object') return null;

  const dados = {
    palavra: str(obj.palavra, 120),
    classe: str(obj.classe, 60),
    pronuncia: str(obj.pronuncia, 80),
    traducao: str(obj.traducao, 120),
    significadoContexto: str(obj.significado_contexto, 500),
    definicoes: lista(obj.definicoes, 3),
    sinonimos: opcoes.mostrarSinonimos === false ? [] : lista(obj.sinonimos, 6, 60),
    exemplos: opcoes.mostrarExemplos === false ? [] : lista(obj.exemplos, 2),
    origem: opcoes.mostrarOrigem ? str(obj.origem, 400) : '',
  };
  if (!dados.palavra && !dados.significadoContexto && !dados.definicoes.length) return null;
  return dados;
}

/** Versão em texto puro do verbete (para copiar). */
export function verbeteParaTexto(d) {
  const linhas = [];
  linhas.push([d.palavra, d.classe && `(${d.classe})`, d.pronuncia && `/${d.pronuncia}/`].filter(Boolean).join(' '));
  if (d.traducao) linhas.push(`Tradução: ${d.traducao}`);
  if (d.significadoContexto) linhas.push(`\nNeste contexto: ${d.significadoContexto}`);
  if (d.definicoes.length) linhas.push('\nSignificados:\n' + d.definicoes.map((x, i) => `${i + 1}. ${x}`).join('\n'));
  if (d.sinonimos.length) linhas.push(`\nSinônimos: ${d.sinonimos.join(', ')}`);
  if (d.exemplos.length) linhas.push('\nExemplos:\n' + d.exemplos.map((x) => `- ${x}`).join('\n'));
  if (d.origem) linhas.push(`\nOrigem: ${d.origem}`);
  return linhas.join('\n').trim();
}

export async function executar({ texto, contexto, opcoes, settings, signal }) {
  const sistema = `Você é o módulo "Dicionário inteligente" de uma extensão de navegador.
Tarefa: criar um verbete para a palavra ou expressão dentro de <texto>.
Se existir <contexto>, ele é a frase/parágrafo onde a palavra aparece: o campo "significado_contexto" DEVE explicar o sentido que ela tem ali.

Responda SOMENTE com um objeto JSON (sem comentários, sem cercas de código) com estas chaves:
{
  "palavra": "forma de dicionário (infinitivo, singular...) ou a própria expressão",
  "classe": "classe gramatical (ex.: substantivo, verbo, adjetivo, expressão idiomática)",
  "pronuncia": "só se a palavra for de outro idioma que não o da resposta; senão \\"\\"",
  "traducao": "só se a palavra for de outro idioma que não o da resposta: tradução curta; senão \\"\\"",
  "significado_contexto": "1 a 2 frases: o que significa NESTE contexto (se não houver contexto, o sentido mais comum)",
  "definicoes": ["até 3 significados principais, curtos"],
  "sinonimos": ["até 6 sinônimos"],
  "exemplos": ["até 2 frases de exemplo curtas"],
  "origem": "etimologia em 1 frase, ou \\"\\" se não tiver certeza"
}
Regras:
- ${regraIdioma(settings)} (vale para os textos explicativos; exemplos e sinônimos ficam no idioma da palavra).
- Nunca invente significados ou etimologias: se não tiver certeza, deixe vazio.
- Se o texto não for uma palavra ou expressão (ex.: for uma frase inteira), explique o termo mais relevante dela.
- ${REGRA_DADOS}`;

  const usuario =
    blocoDados('texto', texto) + (contexto ? '\n\n' + blocoDados('contexto', contexto) : '');

  const { texto: saida, modelo } = await gerarComFallback({
    settings,
    sistema,
    usuario,
    json: true,
    temperatura: 0.2,
    signal,
  });

  const dados = interpretarVerbete(saida, opcoes);
  return { dados, texto: dados ? verbeteParaTexto(dados) : limparSaida(saida), modelo };
}

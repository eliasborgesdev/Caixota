/**
 * sources.js — busca de FONTES REAIS (links vêm sempre de buscadores,
 * nunca são escritos pela IA, então não existem links inventados).
 * ---------------------------------------------------------------------------
 * Formato de uma fonte, igual para todos os provedores:
 *   { titulo, url, dominio, trecho, origem }
 *
 * Provedores:
 *  - Wikipédia (pt, depois en): grátis, sem chave.
 *  - Brave Search API: opcional, precisa de chave do usuário.
 */

import { dominioDe, limparTexto, urlSegura } from '../../util.js';

// ---------------------------------------------------------------------------
// Palavras-chave: frases inteiras costumam dar 0 resultado na busca da
// Wikipédia, então reduzimos o texto às palavras mais informativas.
// ---------------------------------------------------------------------------
const STOPWORDS = new Set(
  (
    // português
    'a o as os um uma uns umas de do da dos das em no na nos nas por para com sem sobre entre e ou mas que se como mais menos ' +
    'muito muita muitos muitas já ja não nao é foi ser são sao está esta estão estao tem têm tinha há ha ao aos à às pelo pela ' +
    'pelos pelas seu sua seus suas este estes estas esse essa esses essas isso isto aquilo ele ela eles elas eu tu você voce nós ' +
    'lhe me te qual quais quando onde porque pois também tambem só so até ate depois antes cada todo toda todos todas outro outra ' +
    'ainda sempre nunca fazer faz fez pode podem ter vai vão vao era eram sido sendo ' +
    // inglês
    'the of and or to in on at for with without about between is are was were be been being it its this that these those by from ' +
    'has have had not no yes does did can could will would should ' +
    // espanhol
    'el la los las un una unos unas y pero del al es son fue están con sin por para si más'
  ).split(/\s+/)
);

/**
 * Reduz um texto às palavras mais "buscáveis" (nomes próprios, números e
 * palavras longas ganham prioridade), preservando a ordem original.
 */
export function extrairPalavrasChave(texto, max = 7) {
  const tokens = texto.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || [];
  const vistos = new Set();
  const candidatos = [];

  tokens.forEach((t, i) => {
    const baixo = t.toLowerCase();
    const temDigito = /\d/.test(baixo);
    if (STOPWORDS.has(baixo) || vistos.has(baixo)) return;
    if (baixo.length < 3 && !temDigito) return;
    vistos.add(baixo);
    const nomeProprio = i > 0 && /^\p{Lu}/u.test(t);
    const pontos = (nomeProprio ? 3 : 0) + (temDigito ? 3 : 0) + Math.min(baixo.length, 10) / 10;
    candidatos.push({ t, i, pontos });
  });

  return candidatos
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, max)
    .sort((a, b) => a.i - b.i)
    .map((c) => c.t);
}

// Prioriza o assunto da afirmação e descarta coincidências em palavras periféricas.
const canon=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase();
const termos=s=>new Set(canon(s).match(/[\p{L}\p{N}]+/gu)||[]);
export function assunto(texto){
 return (texto.match(/[\p{L}\p{N}]+/gu)||[]).filter(t=>t.length>=3&&!canon(t).endsWith('mente')&&!STOPWORDS.has(t.toLowerCase())).slice(0,2);
}
export function fontePertinente(texto,fonte){
 const [a,b]=assunto(texto).map(canon);if(!a)return false;
 const titulo=termos(fonte.titulo),trecho=termos(fonte.trecho);
 return titulo.has(a)||(trecho.has(a)&&!!b&&(titulo.has(b)||trecho.has(b)));
}

// ---------------------------------------------------------------------------
// Wikipédia
// ---------------------------------------------------------------------------
async function wikipediaUma(palavras, lang, limite, signal) {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: palavras.join(' '),
    gsrlimit: String(limite),
    gsrnamespace: '0',
    prop: 'extracts|info',
    exintro: '1',
    explaintext: '1',
    exchars: '800',
    exlimit: 'max',
    inprop: 'url',
  }).toString();

  let res;
  try {
    res = await fetch(url, { signal });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    return []; // sem rede/CORS: apenas ignora este provedor
  }
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);
  const paginas = json?.query?.pages || [];

  return paginas
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .filter((p) => p.extract && p.fullurl)
    // páginas de desambiguação ("X pode referir-se a...") não servem como fonte
    .filter((p) => !/pode referir-se a|may refer to|puede referirse a|pode significar/i.test(p.extract.slice(0, 200)))
    .map((p) => ({
      titulo: `${p.title} — Wikipédia`,
      url: p.fullurl,
      dominio: `${lang}.wikipedia.org`,
      trecho: limparTexto(p.extract),
      origem: 'wikipedia',
    }));
}

/**
 * Busca na Wikipédia tentando consultas cada vez mais curtas até achar algo.
 * Começa em português; completa com inglês se vierem poucos resultados.
 */
export async function buscarWikipedia(texto, { signal, minimo = 3 } = {}) {
  const todas = [...new Set([...assunto(texto),...extrairPalavrasChave(texto, 5)])];
  if (!todas.length) return [];

  const tamanhos = [...new Set([Math.min(todas.length,4), 2, 1])].filter((n) => n >= 1 && n <= todas.length);
  const achados = [];
  const jaTem = new Set();
  const adicionar = (lista) => {
    for (const f of lista) {
      if (!jaTem.has(f.url)) {
        jaTem.add(f.url);
        achados.push(f);
      }
    }
  };

  for (const lang of ['pt', 'en']) {
    for (const n of tamanhos) {
      adicionar((await wikipediaUma(todas.slice(0, n), lang, 4, signal)).filter(f=>fontePertinente(texto,f)));
      if (achados.length >= minimo + 1) return achados;
      // se o idioma já devolveu algo razoável, não afrouxa mais a consulta
      if (achados.length >= 2 && lang === 'pt') break;
    }
  }
  return achados;
}

// ---------------------------------------------------------------------------
// Brave Search API (opcional)
// ---------------------------------------------------------------------------
export async function buscarBrave(texto, { key, signal } = {}) {
  if (!key) return [];
  const consulta = texto.replace(/\s+/g, ' ').slice(0, 300);
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.search = new URLSearchParams({ q: consulta, count: '6', text_decorations: 'false', safesearch: 'moderate' }).toString();

  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json', 'X-Subscription-Token': key }, signal });
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    return [];
  }
  if (!res.ok) return [];
  const json = await res.json().catch(() => null);

  return (json?.web?.results || [])
    .filter((r) => r?.url && urlSegura(r.url))
    .map((r) => ({
      titulo: limparTexto(r.title) || dominioDe(r.url),
      url: r.url,
      dominio: dominioDe(r.url),
      trecho: limparTexto([r.description, ...(r.extra_snippets || [])].filter(Boolean).join(' ')).slice(0, 800),
      origem: 'brave',
    }))
    .filter((r) => r.trecho);
}

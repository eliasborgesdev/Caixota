
/**
 * ia/background.js — PONTO DE ENTRADA DO MÓDULO NO SERVICE WORKER
 * ---------------------------------------------------------------------------
 * Exporta UMA função: init(). Chame-a uma vez no seu service worker.
 *
 *     import { init as iniciarTiraTeima } from './ia/background.js';
 *     iniciarTiraTeima();
 *
 * O que init() registra (tudo com nomes próprios, para não conflitar com o
 * resto da sua extensão):
 *   1. chrome.runtime.onConnect  → só reage a portas chamadas "tira-teima".
 *   2. chrome.runtime.onMessage  → só reage a mensagens "tira-teima:*".
 *      (retorna `false`, então NÃO interfere nos seus listeners)
 *
 * Protocolo da porta (content ⇄ background), igual para TODAS as ferramentas:
 *   content → bg : { type: 'executar', ferramenta, texto, contexto, opcoes }
 *   bg → content : { type: 'progresso', etapa }                (opcional)
 *   bg → content : { type: 'resultado', ferramenta, ...retorno do handler }
 *   bg → content : { type: 'erro', codigo, mensagem }
 * Se o content script fechar a porta (usuário fechou o popup ou trocou de
 * ferramenta), as requisições em andamento são canceladas (AbortController).
 */

import { getSettings, configFerramenta, PORT_NAME, MSG_ABRIR_OPCOES } from './settings.js';
import { DEFINICOES } from './tools/index.js';
import { HANDLERS } from './tools/handlers.js';
import { TTError } from './util.js';

const TAMANHO_MAXIMO_CONTEXTO = 800;

/** postMessage que ignora o erro "porta já fechada". */
function enviar(porta, msg) {
  try {
    porta.postMessage(msg);
  } catch {
    /* popup já foi fechado */
  }
}

/** Executa uma ferramenta (separado do chrome.runtime para facilitar testes). */
export async function executarFerramenta({ id, texto, contexto, opcoes, signal, onProgress, imagem }) {
  const definicao = DEFINICOES.find((d) => d.id === id);
  const handler = HANDLERS[id];
  if (!definicao || !handler) throw new TTError('GENERICO', 'Ferramenta desconhecida.');

  const settings = await getSettings();
  const config = configFerramenta(settings, definicao);


  const limpo = String(texto || '').replace(/\s+/g, ' ').trim();
  const max = definicao.limites?.max ?? 1500;
  if(limpo.length>max)throw new TTError('GENERICO','O texto ultrapassa o limite desta ferramenta.');
  const textoFinal = limpo;
  if (textoFinal.length < (definicao.limites?.min ?? 1)) throw new TTError('GENERICO', 'Nenhum texto para processar.');
  if (!settings.geminiKey) throw new TTError('SEM_CHAVE', 'Configure sua chave da API para começar.');

  const ctx = String(contexto || '').replace(/\s+/g, ' ').trim().slice(0, TAMANHO_MAXIMO_CONTEXTO);

  const resultado = await handler({
    texto: textoFinal,
    contexto: ['dicionario','explicar'].includes(id) && ctx !== textoFinal ? ctx : '',
    // opções do popup (ex.: tom escolhido) sobrepõem os padrões salvos
    opcoes: { ...config, ...(opcoes && typeof opcoes === 'object' ? opcoes : {}) },
    settings,
    signal, imagem,
    onProgress,
  });
  return { ferramenta: id, ...resultado };
}

export function init() {
  chrome.runtime.onConnect.addListener((porta) => {
    if (porta.name !== PORT_NAME) return;

    const controlador = new AbortController();
    porta.onDisconnect.addListener(() => controlador.abort());

    let executando=false;
    porta.onMessage.addListener(async (msg) => {
      if (msg?.type !== 'executar' || executando) return;
      executando=true;
      try {
        const r = await executarFerramenta({
          id: msg.ferramenta, imagem: msg.imagem,
          texto: msg.texto,
          contexto: msg.contexto,
          opcoes: msg.opcoes,
          signal: controlador.signal,
          onProgress: (etapa) => enviar(porta, { type: 'progresso', etapa }),
        });
        enviar(porta, { type: 'resultado', ...r });
      } catch (e) {
        if (controlador.signal.aborted) return; // usuário fechou: não há quem ouça
        enviar(porta, {
          type: 'erro',
          codigo: e?.codigo || 'GENERICO',
          mensagem: e?.codigo ? e.message : 'Algo deu errado. Tente novamente.',
        });
        if (!e?.codigo) console.error('[IA da Caixota]', e);
      }
    });
  });

  // Content scripts não podem abrir páginas da extensão: pedem ao background.
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === MSG_ABRIR_OPCOES) {
      chrome.tabs.create({ url: chrome.runtime.getURL('panel.html#ia-settings') });
    }
    return false; // não segura o canal de resposta
  });
}

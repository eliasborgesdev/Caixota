// Caixota 0.3.13 · ponte mínima entre o popup contextual e o processador de áudio.
// O acesso é por aba e não oferece API pública para sites de terceiros.
'use strict';
const CX_VOLUME_TARGET = 'cx-volume-v2';
const CX_VOLUME_DOCUMENT = 'caixota-volume-offscreen.html';
let volumeDocumentCreation;
async function ensureVolumeProcessor() {
  if (volumeDocumentCreation) return volumeDocumentCreation;
  volumeDocumentCreation = (async () => {
    const documentUrl = chrome.runtime.getURL(CX_VOLUME_DOCUMENT);
    const existing = await chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT'],documentUrls:[documentUrl]});
    if (existing.length === 0) {
      await chrome.offscreen.createDocument({
        url: CX_VOLUME_DOCUMENT,
        reasons: ['USER_MEDIA'],
        justification: 'Processamento local de áudio capturado da aba selecionada pelo usuário.'
      });
    }
  })();
  try { await volumeDocumentCreation; } finally { volumeDocumentCreation = null; }
}
async function processorMessage(type,tabId,extra = {}) {
  const url = chrome.runtime.getURL(CX_VOLUME_DOCUMENT);
  const existing = await chrome.runtime.getContexts({contextTypes:['OFFSCREEN_DOCUMENT'],documentUrls:[url]});
  if (!existing.length) return {ok:true,enabled:false,boost:0};
  return chrome.runtime.sendMessage({channel:'cx-volume-processor',type,tabId,...extra});
}
async function volumeRequest(message, sender) {
  const tabId = sender.tab?.id;
  const tabUrl = sender.tab?.url || '';
  if (!Number.isSafeInteger(tabId) || !/^https?:\/\//i.test(tabUrl)) throw Error('Use o popup da Caixota em uma página web para controlar o som.');
  const type = String(message.type);
  if (!['status','start','adjust','stop'].includes(type)) throw Error('Comando não reconhecido.');
  if (type === 'status' || type === 'stop') return processorMessage(type,tabId);
  const boost = Number(message.boost);
  if (!Number.isInteger(boost) || boost < 0 || boost > 200) throw Error('O reforço deve estar entre 0% e 200%.');
  if (type === 'adjust') return processorMessage('adjust',tabId,{boost});
  // Não lista nem seleciona outras abas: o alvo é a aba que originou o popup.
  // Esse método utiliza o gesto de invocação da extensão no menu de contexto.
  const current = await processorMessage('status',tabId);
  if (current.enabled) return processorMessage('adjust',tabId,{boost});
  const streamId = await chrome.tabCapture.getMediaStreamId({targetTabId:tabId});
  await ensureVolumeProcessor();
  return processorMessage('start',tabId,{boost,streamId});
}
chrome.runtime.onMessage.addListener((message,sender,reply) => {
  if (message?.channel !== CX_VOLUME_TARGET) return;
  // Somente content script da extensão, executando no frame principal da aba.
  if (sender.id !== chrome.runtime.id || !sender.tab || sender.frameId !== 0) {
    reply({ok:false,error:'Origem não autorizada.'}); return;
  }
  volumeRequest(message,sender)
    .then(result => reply(result))
    .catch(error => reply({ok:false,error:String(error?.message||error)}));
  return true;
});
chrome.tabs.onRemoved.addListener(id=>{processorMessage('stop',id).catch(()=>{});});
chrome.tabCapture.onStatusChanged.addListener(info=>{
  if (['stopped','error'].includes(info.status)) processorMessage('stop',info.tabId).catch(()=>{});
});

/**
 * adapters/chrome-downloader.js — Salva arquivos usando a API chrome.downloads.
 *
 * É a ÚNICA parte do projeto que depende de uma API exclusiva de extensões
 * Chromium. Para portar o projeto para outro ambiente (Firefox, app web,
 * Electron...), basta criar outro adaptador que exporte a mesma função:
 *
 *     saveFile(url: string, filename: string): Promise<void>
 *
 * Permissão necessária (manifest → permissions): "downloads".
 */

/** Subpasta dentro de "Downloads" onde os arquivos são salvos. */
const DOWNLOAD_FOLDER = 'Caixota/Midias';

/**
 * Baixa `url` e só resolve quando o navegador terminar o download.
 * Rejeita com Error se o download for interrompido.
 * @param {string} url       URL direta do arquivo.
 * @param {string} filename  Nome do arquivo (sem pasta).
 * @returns {Promise<void>}
 */
export async function saveFile(url, filename) {
  const downloadId = await startDownload(url, `${DOWNLOAD_FOLDER}/${filename}`);
  await waitForCompletion(downloadId);
  // Só avisamos depois que o navegador confirmou o fim do download.
  // O gerenciador da Caixota exibe essa notificação na campainha.
  try {
    const key='caixotaNotificationsV3';
    const data=await chrome.storage.local.get(key);
    const notifications=Array.isArray(data[key])?data[key]:[];
    notifications.unshift({id:`download-${downloadId}-${Date.now()}`,kind:'download',title:'Seu arquivo está pronto! 📥',message:filename,downloadId,read:false,at:Date.now()});
    await chrome.storage.local.set({[key]:notifications.slice(0,40)});
  } catch (error) { console.warn('Não consegui mostrar a notificação de download.',error); }
}

/** Inicia o download e devolve o id dele. */
function startDownload(url, path) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      { url, filename: path, conflictAction: 'uniquify', saveAs: false },
      (downloadId) => {
        const lastError = chrome.runtime.lastError;
        if (lastError || downloadId === undefined) {
          reject(new Error(lastError?.message ?? 'Não foi possível iniciar o download.'));
        } else {
          resolve(downloadId);
        }
      }
    );
  });
}

/** Espera o estado do download virar "complete" ou "interrupted". */
function waitForCompletion(downloadId) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (callback) => {
      if (settled) return;
      settled = true;
      chrome.downloads.onChanged.removeListener(onChanged);
      callback();
    };

    const handleState = (state) => {
      if (state === 'complete') finish(resolve);
      if (state === 'interrupted') {
        finish(() => reject(new Error('O navegador interrompeu o download.')));
      }
    };

    const onChanged = (delta) => {
      if (delta.id === downloadId && delta.state) handleState(delta.state.current);
    };

    chrome.downloads.onChanged.addListener(onChanged);

    // Cobre o caso de o download já ter terminado antes de o listener existir.
    chrome.downloads.search({ id: downloadId }, ([item]) => handleState(item?.state));
  });
}

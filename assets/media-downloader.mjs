/* Baixador integrado: a extração e os providers são os módulos originais
   do projeto enviado. A interface é Caixota e não duplica navegação. */
import {detectLink} from '../media/core/extractor.js';
import {buildFilename} from '../media/core/filename.js';
import {saveFile} from '../media/adapters/chrome-downloader.js';

const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const supportedKinds={video:'Vídeo',image:'Imagem',gif:'GIF (MP4)'};
let generation=0;
let lastResult=null;
let selectedVariants=new Map();
let busy=false;
const linkLimit=2400;
const validatedUrl=url=>{const parsed=new URL(url);if(parsed.protocol!=='https:')throw Error('Endereço de mídia inseguro.');return parsed.href;};

export function mediaDownloaderMarkup(icon){
 return `<section class="page-entry media-page-title"><span class="overline">UTILITÁRIOS / MÍDIA</span><h1>Baixador de Mídia <span class="tiny-badge">NOVO</span></h1><p>Achou um vídeo ou uma imagem legal? Cole o link do post e a Caixota procura o arquivo pra você. 📥</p></section>
 <section class="glass-section media-downloader-shell"><div class="media-tool-heading"><div class="media-platform-icons"><span class="media-platform-badge">𝕏</span><span class="media-platform-badge">◎</span><span class="media-platform-badge">P</span></div><div><strong>X / Twitter, Instagram e Pinterest</strong><p>Posts, reels, carrosséis e stories disponíveis</p></div><span class="meta-tag online">Internet</span></div>
 <form id="cxMediaForm" class="media-input-form"><label for="cxMediaUrl">Link do post</label><div class="media-input-group"><input id="cxMediaUrl" type="url" autocomplete="url" maxlength="${linkLimit}" placeholder="https://www.instagram.com/reel/..." required spellcheck="false"><button type="button" class="button-outline" id="cxMediaPaste">${icon('clipboard',17)} Colar</button><button type="submit" class="button-primary" id="cxMediaSearch">${icon('search',17)} Buscar mídia</button></div><div class="media-link-feedback" id="cxMediaDetection" aria-live="polite">Pode colar um link do Instagram, Pinterest ou do X.</div></form>
 <div class="media-result-status" id="cxMediaStatus" role="status" aria-live="polite" hidden></div><div id="cxMediaResults" aria-live="polite"></div>
 <div class="media-help-row"><span>${icon('shield',17)} A Caixota só acessa o link que você escolher.</span><span>${icon('info',17)} Alguns posts exigem login e nem todos ficam disponíveis para baixar.</span></div></section>`;
}

function updateDetection(){const input=document.getElementById('cxMediaUrl');const feedback=document.getElementById('cxMediaDetection');if(!input||!feedback)return;
 if(!input.value.trim()){feedback.textContent='Pode colar um link do Instagram, Pinterest ou do X.';feedback.dataset.valid='';return;}
 try{const found=detectLink(input.value);feedback.textContent=`✓ ${found.link.kindLabel} do ${found.provider.name} reconhecido!`;feedback.dataset.valid='yes';}catch{feedback.textContent='Esse link ainda não parece ser de um post compatível.';feedback.dataset.valid='no';}
}
function status(message,type='info'){const box=document.getElementById('cxMediaStatus');if(!box)return;box.hidden=!message;box.className=`media-result-status ${type}`;box.textContent=message||'';}
function setBusy(active){busy=active;const button=document.getElementById('cxMediaSearch');if(button){button.disabled=active;button.textContent=active?'Procurando…':'Buscar mídia';}}
function previewMarkup(item){const url=escapeHTML(validatedUrl(item.thumbnailUrl||item.url));const direct=escapeHTML(validatedUrl(item.url));if(item.kind==='image')return `<img src="${url}" alt="Prévia da imagem" loading="lazy" referrerpolicy="no-referrer">`;
 return `<video src="${direct}" ${item.thumbnailUrl?`poster="${url}"`:''} preload="metadata" playsinline muted ${item.kind==='gif'?'loop autoplay':'controls'}></video>`;
}
function showResult(result){lastResult=result;selectedVariants.clear();const host=document.getElementById('cxMediaResults');if(!host)return;
 const safeAuthor=escapeHTML(result.author||'criador');const items=result.items.slice(0,30);
 host.innerHTML=`<div class="media-result-head"><div><span class="overline">ARQUIVOS ENCONTRADOS</span><h2>${items.length} ${items.length===1?'arquivo':'arquivos'} no post</h2><p>${safeAuthor.startsWith('@')?'':'@'}${safeAuthor}${result.text?` · ${escapeHTML(result.text.slice(0,160))}`:''}</p></div>${items.length>1?`<button class="button-outline" id="cxMediaDownloadAll">Baixar todos (${items.length})</button>`:''}</div><div class="media-download-grid">${items.map((item,i)=>{
 let media='';try{media=previewMarkup(item);}catch{media='<div class="media-no-preview">Prévia indisponível</div>';}
 const variants=(item.variants||[]).filter(v=>{try{return new URL(v.url).protocol==='https:';}catch{return false;}});
 return `<article class="media-file-card"><div class="media-file-preview">${media}</div><div class="media-file-info"><div class="media-file-tags"><span class="meta-tag">${supportedKinds[item.kind]||'Mídia'}</span>${item.width&&item.height?`<small>${item.width} × ${item.height}</small>`:''}</div>${variants.length>1?`<label class="media-quality-label">Qualidade<select data-media-quality="${i}">${variants.map((v,j)=>`<option value="${j}">${escapeHTML(v.label)}</option>`).join('')}</select></label>`:''}<button class="button-primary media-save-button" data-media-download="${i}">Baixar ${items.length>1?`arquivo ${i+1}`:'arquivo'}</button></div></article>`;
 }).join('')}</div><p class="media-results-note">Só baixe arquivos que você tem permissão para salvar. GIFs do X são geralmente arquivos MP4.</p>`;
}
async function saveOne(index){const result=lastResult;if(!result)return;const item=result.items[index];if(!item)return;
 let url=item.url;const selected=selectedVariants.get(index);if(item.variants&&selected!==undefined)url=item.variants[selected]?.url||url;
 url=validatedUrl(url);const path=buildFilename(result,item,index);await saveFile(url,path);
}
async function searchMedia(){const input=document.getElementById('cxMediaUrl');if(!input||busy)return;const raw=input.value.trim();if(raw.length>linkLimit){status('Esse link ficou grande demais. Tente copiar só o endereço do post.','error');return;}
 const request=++generation;lastResult=null;setBusy(true);document.getElementById('cxMediaResults')?.replaceChildren();status('Buscando a mídia…');
 try{const {provider,link}=detectLink(raw);const result=await provider.extract(link);if(request!==generation)return;status(`${result.items.length} ${result.items.length===1?'arquivo encontrado':'arquivos encontrados'}!`,'success');showResult(result);}
 catch(error){if(request!==generation)return;status(error?.userMessage||'Não consegui encontrar a mídia. Confira o link, o login e tente novamente.','error');console.error('Caixota: falha na busca de mídia',error);}
 finally{if(request===generation)setBusy(false);}
}
export function bindMediaDownloader(){const form=document.getElementById('cxMediaForm');if(!form)return;
 form.addEventListener('submit',e=>{e.preventDefault();searchMedia();});
 const input=document.getElementById('cxMediaUrl');input.addEventListener('input',updateDetection);
 input.addEventListener('paste',()=>setTimeout(()=>{updateDetection();if(input.value.trim())searchMedia();},0));
 document.getElementById('cxMediaPaste').addEventListener('click',async()=>{try{input.value=await navigator.clipboard.readText();updateDetection();if(input.value.trim())searchMedia();}catch{status('Não consegui colar automaticamente. Use Ctrl + V no campo.','error');}});
 const result=document.getElementById('cxMediaResults');result.addEventListener('change',e=>{if(e.target.matches('[data-media-quality]'))selectedVariants.set(Number(e.target.dataset.mediaQuality),Number(e.target.value));});
 result.addEventListener('click',async e=>{const button=e.target.closest('[data-media-download],#cxMediaDownloadAll');if(!button||button.disabled)return;button.disabled=true;const original=button.textContent;button.textContent='Baixando…';try{if(button.id==='cxMediaDownloadAll'){let errors=0;for(let i=0;i<Math.min(lastResult.items.length,30);i++)try{await saveOne(i);}catch{errors++;}status(errors?`${errors} arquivo(s) não foram baixados. Confira seus Downloads.`:'Downloads concluídos! Veja a pasta Caixota/Midias.','success');}else{await saveOne(Number(button.dataset.mediaDownload));status('Arquivo salvo! Veja sua pasta Downloads.','success');}button.textContent='Baixado ✓';}catch(error){status(error?.message||'Não foi possível baixar este arquivo.','error');button.textContent='Tentar novamente';}finally{button.disabled=false;setTimeout(()=>{if(button.isConnected)button.textContent=original;},1900);}});
 const url=new URLSearchParams(location.search).get('media');if(url){input.value=url;updateDetection();}
}
export function stopMediaDownloader(){generation++;lastResult=null;selectedVariants.clear();busy=false;}

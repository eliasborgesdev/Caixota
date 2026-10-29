/* Internal tools share the panel document. Shadow DOM scopes their styles;
   scoped events and an AbortController give each opening its own lifecycle. */
import {translateShell} from './shell-locale.mjs';
let active=null,serial=0;
const productive=new Set(['text-markdown','text-regex','text-yaml','generator-lorem','generator-palette','generator-qr-batch','image-batch','image-metadata-clean']);
const styles=['panel.css','pdf-tools.css','converter-tools.css','video-tools.css','local-tools.css','productivity-tools.css','assets/native-tools.css'];
let qrReady;
function ensureQr(){return qrReady??=new Promise((resolve,reject)=>{if(globalThis.qrcode)return resolve();const s=document.createElement('script');s.src='vendor/qrcode-generator.js';s.onload=resolve;s.onerror=()=>reject(new Error('Não foi possível carregar o gerador QR.'));document.head.append(s);});}
export function stopNativeTool(){serial++;if(!active)return;active.root.dispatchEvent(new CustomEvent('caixota:reset-direct-tools',{detail:{category:'all'}}));active.observer?.disconnect();active.abort.abort();active=null;}
export function updateNativeTool(ui,lang){if(!active)return;const b=active.body;b.dataset.sound=ui.sound===false?'off':'on';b.dataset.volume=ui.volume;b.dataset.quality=ui.quality;b.dataset.effects=ui.effects===false?'off':'on';b.dataset.theme=document.documentElement.dataset.theme||'light';active.soundEnabled=ui.sound!==false;active.lang=lang;translateShell(b,lang);}
export async function mountNativeTool(tool,ui,lang,sound){
 stopNativeTool();const generation=serial,host=document.getElementById('nativeToolHost');if(!host||!tool)return;
 const root=host.attachShadow({mode:'open'}),body=document.createElement('div');body.className='native-tool-body';
 const links=styles.map(href=>{const l=document.createElement('link');l.rel='stylesheet';l.href=href;root.append(l);return new Promise((yes,no)=>{l.onload=yes;l.onerror=()=>no(new Error('Não foi possível carregar o estilo da ferramenta.'));});});
 body.innerHTML='<div id="textCatalogPane" hidden></div><div id="imageCatalogPane" hidden></div><div id="generatorCatalogPane" hidden></div><div id="textDirectToolsContainer"></div><div id="generatorToolsContainer"></div><div id="converterToolsContainer"></div><div id="pdfToolsContainer"></div><div id="videoToolsContainer"></div>';
 root.append(body);const abort=new AbortController();active={host,root,body,abort,lang,soundEnabled:ui.sound!==false};const instance=active;
 const add=(target,type,fn,options)=>target.addEventListener(type,fn,{...(typeof options==='boolean'?{capture:options}:options),signal:abort.signal});
 const scoped=new Proxy(document,{get(target,key){if(key==='body'||key==='documentElement')return body;if(key==='head')return root;if(key==='activeElement')return root.activeElement;if(key==='getElementById')return id=>root.getElementById(id);if(key==='querySelector'||key==='querySelectorAll')return root[key].bind(root);if(key==='addEventListener')return(type,fn,opts)=>add(root,type,fn,opts);if(key==='removeEventListener'||key==='dispatchEvent')return root[key].bind(root);const value=target[key];return typeof value==='function'?value.bind(target):value;}});
 const scopedWindow=new Proxy(window,{get(target,key){if(key==='addEventListener')return(type,fn,opts)=>add(target,type,fn,opts);if(key==='removeEventListener'||key==='matchMedia')return target[key].bind(target);return target[key];}});
 const bridge={getToolLabel:(_cat,id,fallback)=>id===tool.id?tool.label:fallback,createNetworkBadge:()=>{const n=document.createElement('span');n.className='network-badge';n.textContent='Offline';return n;}};
 const engine=productive.has(tool.id)?'productivity-tools':({pdf:'pdf-tools',video:'video-tools',images:'converter-tools'}[tool.category]||'local-tools');
 const modules=[await import('../'+engine+'.js')];await Promise.all([...links,...(tool.id==='generator-qr-batch'?[ensureQr()]:[])]);
 if(active!==instance||serial!==generation||!host.isConnected)return;
 for(const mod of modules)mod.initialize(scoped,scopedWindow,bridge);
 for(const c of body.children)c.hidden=true;
 const containerId={text:'textDirectToolsContainer',generators:'generatorToolsContainer',sorteio:'generatorToolsContainer',images:'converterToolsContainer',pdf:'pdfToolsContainer',video:'videoToolsContainer'}[tool.category];if(containerId)root.getElementById(containerId).hidden=false;
 updateNativeTool(ui,lang);
 root.dispatchEvent(new CustomEvent('caixota:open-direct-tool',{detail:{category:tool.id==='generator-wheel'?'generators':tool.category,toolId:tool.id}}));
 document.getElementById('toolLoading')?.remove();
 // Only translate generated interface labels, never edits, previews or file data.
 const protectContent=()=>body.querySelectorAll('.cxprod-markdown-preview,.cxprod-regex-results,[contenteditable],.note-content,.name-generated-item,.caixota-wheel-dialog-result,.converter-file-info strong').forEach(n=>n.setAttribute('data-no-translate',''));protectContent();
 let queued=false;
 instance.observer=new MutationObserver(records=>{if(queued||!records.some(r=>r.addedNodes.length))return;queued=true;queueMicrotask(()=>{queued=false;if(active===instance){protectContent();translateShell(body,instance.lang);}});});
 instance.observer.observe(body,{childList:true,subtree:true});translateShell(body,lang);
 add(root,'click',e=>{const link=e.target.closest('a[download]');if(link?.href.startsWith('blob:'))document.dispatchEvent(new CustomEvent('caixota:export-started',{detail:{filename:String(link.download||'Arquivo').slice(0,150)}}));if(e.target.closest('button')&&instance.soundEnabled)sound();});
}

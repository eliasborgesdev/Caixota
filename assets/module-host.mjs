import {keyOf,COLOR_KEYS,BUILTIN_CATEGORIES} from './module-package.mjs';
import {escapeHtml as e} from './module-ui.mjs';
let records=[],faces=[],soundData='',mountedFrame=null,listener=null;
export function moduleRecords(){return records;}
export function activeContents(){return records.filter(m=>m.enabled).flatMap(m=>m.contents.filter(x=>m.selected.includes(x.id)).map(x=>({...x,moduleId:m.id,key:keyOf(m.id,x.id),pkg:m})));}
export function dataUrl(bytes,path){const type=/\.woff2$/i.test(path)?'font/woff2':/\.woff$/i.test(path)?'font/woff':/\.(ttf|otf)$/i.test(path)?'font/ttf':/\.wav$/i.test(path)?'audio/wav':/\.mp3$/i.test(path)?'audio/mpeg':/\.ogg$/i.test(path)?'audio/ogg':/\.png$/i.test(path)?'image/png':/\.jpe?g$/i.test(path)?'image/jpeg':/\.webp$/i.test(path)?'image/webp':'application/octet-stream';let bin='';for(let n=0;n<bytes.length;n+=8192)bin+=String.fromCharCode(...bytes.subarray(n,n+8192));return 'data:'+type+';base64,'+btoa(bin);}
export function configureModules(items){records=items;for(const face of faces)document.fonts.delete(face);faces=[];for(const x of activeContents().filter(x=>x.type==='font')){const face=new FontFace(x.key,'url('+dataUrl(x.pkg.assets[x.file],x.file)+')');faces.push(face);document.fonts.add(face);face.load().catch(()=>{});}}
export function moduleBase(key){return activeContents().find(x=>x.key===key&&x.type==='theme')?.base;}
export function moduleAppearance(ui){
 const root=document.documentElement;
 for(const key of COLOR_KEYS)root.style.removeProperty('--'+key);
 root.style.removeProperty('--v3-font');root.style.removeProperty('--font');root.style.removeProperty('--font-family');
 const theme=activeContents().find(x=>x.key===ui.theme&&x.type==='theme');
 if(theme){const c=theme.colors;const defaults={'surface-solid':c.surface,'surface-strong':c.surface,'surface-faint':c.surface,'subtle':c.muted,'primary-dark':c.primary,'primary-soft':c.surface,'line':c.stroke};for(const [key,value]of Object.entries({...defaults,...c}))root.style.setProperty('--'+key,value);}
 const font=activeContents().find(x=>x.key===ui.font&&x.type==='font');
 if(font){root.style.setProperty('--v3-font','"'+font.key+'", monospace');root.style.setProperty('--v3-effective-font','"'+font.key+'", monospace');root.style.setProperty('--font','"'+font.key+'", monospace');root.style.fontFamily='"'+font.key+'", monospace';}else root.style.removeProperty('font-family');
 const sound=activeContents().find(x=>x.key===ui.moduleSound&&x.type==='sound');
 soundData=sound?dataUrl(sound.pkg.assets[sound.file],sound.file):'';
 if(!ui.sound||!soundData)window.__cxModuleAudio?.pause();window.__caixotaModuleClickSound=soundData;
 for(const t of activeContents().filter(x=>x.type==='theme')){
  const card=document.querySelector('[data-v3-theme="'+t.key+'"] .v3-theme-art');if(!card)continue;
  card.style.background=t.colors.bg;[...card.children].forEach((n,i)=>n.style.background=i===2?t.colors.primary:t.colors.surface);
 }

}
export function themePayload(ui){
 const cs=getComputedStyle(document.documentElement),colors={};for(const key of COLOR_KEYS)colors[key]=cs.getPropertyValue('--'+key).trim();
 const f=activeContents().find(x=>x.key===ui.font&&x.type==='font');
 return {colors,font:getComputedStyle(document.body).fontFamily,fontFace:f?{family:f.key,url:dataUrl(f.pkg.assets[f.file],f.file)}:null,quality:ui.quality,effects:ui.effects,sound:ui.sound,volume:ui.volume};
}
export function moduleToolMarkup(tool){return '<section class="page-entry"><span class="overline">MÓDULO · LOCAL</span><h1 data-no-translate>'+e(tool.label)+'</h1><p data-no-translate>'+e(tool.description)+'</p></section><section class="cx-tool-workspace"><p id="moduleRuntimeStatus" role="status">Preparando ferramenta…</p><iframe class="cx-module-frame" id="moduleRuntimeFrame" src="module-runtime.html" sandbox="allow-scripts" allow="camera \'none\'; microphone \'none\'; geolocation \'none\'; clipboard-read \'none\'; clipboard-write \'none\'" title="'+e(tool.label)+'"></iframe><button class="button-outline" data-route="modules">Fechar e gerenciar módulo</button></section>';}
export function stopModuleRuntime(){if(listener)window.removeEventListener('message',listener);listener=null;mountedFrame=null;}
export function updateModuleRuntime(ui){mountedFrame?.contentWindow?.postMessage({source:'caixota-host',type:'preferences',preferences:themePayload(ui)},'*');}
export function bindModuleRuntime(tool,ui,sound){
 stopModuleRuntime();const frame=document.getElementById('moduleRuntimeFrame');if(!frame)return;
 mountedFrame=frame;const pkg=records.find(x=>x.id===tool.moduleId),item=pkg?.contents.find(x=>keyOf(pkg.id,x.id)===tool.id);
 if(!pkg?.enabled||!item)return;
 let loaded=false,lastSound=0;
 listener=event=>{
  if(event.source!==frame.contentWindow||event.data?.source!=='caixota-module')return;
  const d=event.data;
  if(d.type==='ready'&&!loaded){loaded=true;frame.contentWindow.postMessage({source:'caixota-host',type:'load',html:new TextDecoder().decode(pkg.assets[item.file]),assets:Object.fromEntries(Object.entries(pkg.assets).filter(([p])=>/\.(png|jpg|jpeg|webp|woff2?|ttf|otf|wav|mp3|ogg)$/i.test(p)).map(([p,b])=>[p,dataUrl(b,p)])),preferences:themePayload(ui)},'*');}
  if(d.type==='loaded')document.getElementById('moduleRuntimeStatus')?.remove();
  if(d.type==='error'){let n=document.getElementById('moduleRuntimeStatus');if(!n){n=document.createElement('p');n.id='moduleRuntimeStatus';n.setAttribute('role','alert');frame.before(n);}n.textContent='Não foi possível executar: '+String(d.message).slice(0,200);}
  if(d.type==='height'&&Number.isFinite(d.height))frame.style.height=Math.max(200,Math.min(16000,d.height))+'px';
  if(d.type==='sound'&&performance.now()-lastSound>120){lastSound=performance.now();sound();}
 };
 window.addEventListener('message',listener);
}

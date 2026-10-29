/* This file runs ONLY in the manifest sandbox; never in the privileged shell. */
(()=>{
 let preferences={},assets={},loaded=false,observer,failed=false;
 const send=(type,extra={})=>parent.postMessage({source:'caixota-module',type,...extra},'*');
 const style=document.createElement('style');document.head.append(style);
 const baseStyle=`*{box-sizing:border-box}html,body{margin:0;background:transparent;color:var(--text);font-family:var(--font,system-ui);font-size:15px;line-height:1.6}h1,h2,h3,strong,label{color:var(--title)}p,small{color:var(--muted)}button,input,select,textarea{font:inherit;color:var(--text);border:1px solid var(--stroke);border-radius:12px;padding:12px 16px;background:var(--surface);max-width:100%}button{cursor:pointer}button.primary{background:var(--primary);color:var(--bg);font-weight:bold}button:hover{filter:brightness(1.08)}textarea{width:100%;min-height:140px}.card{border:1px solid var(--stroke);border-radius:16px;padding:20px;margin:16px 0;background:var(--surface)}:focus-visible{outline:2px solid var(--primary);outline-offset:3px}html[data-quality="eco"] *,html[data-effects="off"] *{animation:none!important;transition:none!important;box-shadow:none!important;filter:none!important;backdrop-filter:none!important}@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;
 style.textContent=baseStyle;
 const apply=p=>{preferences=p||{};for(const [k,v]of Object.entries(preferences.colors||{}))document.documentElement.style.setProperty('--'+k,v);document.documentElement.style.setProperty('--font',preferences.font||'system-ui');document.documentElement.dataset.quality=preferences.quality;document.documentElement.dataset.effects=preferences.effects===false?'off':'on';if(preferences.fontFace){const f=preferences.fontFace;const font=new FontFace(f.family,'url('+f.url+')');document.fonts.add(font);font.load().catch(()=>{});}window.dispatchEvent(new CustomEvent('caixota:preferences',{detail:preferences}));};
 Object.defineProperty(window,'Caixota',{value:Object.freeze({get preferences(){return structuredClone(preferences)},asset:path=>assets[path]||'',sound:()=>send('sound')}),writable:false});
 const resize=()=>send('height',{height:Math.ceil(document.getElementById('moduleRoot').getBoundingClientRect().height+24)});
 window.addEventListener('message',event=>{
  if(event.source!==parent||event.data?.source!=='caixota-host')return;const data=event.data;
  if(data.type==='preferences'){apply(data.preferences);return;}
  if(data.type!=='load'||loaded)return;loaded=true;
  try{
   assets=data.assets||{};apply(data.preferences);
   const parsed=new DOMParser().parseFromString(data.html,'text/html');
   // Modules use inline classic scripts. No <base>, remote URLs, embeds or imports.
   parsed.querySelectorAll('base,meta,iframe,object,embed,link').forEach(n=>n.remove());
   const scripts=[...parsed.querySelectorAll('script')].map(n=>{if(n.src||n.type==='module')throw Error('Inclua JavaScript clássico no HTML, sem src nem imports.');const code=n.textContent;n.remove();return code;});
   for(const n of parsed.querySelectorAll('[src],[href]')){for(const a of ['src','href'])if(n.hasAttribute(a)){const path=n.getAttribute(a);if(assets[path])n.setAttribute(a,assets[path]);else if(!path.startsWith('#')&&!path.startsWith('data:'))n.removeAttribute(a);}}
   const root=document.getElementById('moduleRoot');root.innerHTML=parsed.head.innerHTML+parsed.body.innerHTML;
   // Style defaults stay after package styles so eco/disabled effects keep priority.
   document.body.append(style);
   for(const code of scripts){const script=document.createElement('script');script.textContent=code;root.append(script);if(failed)break;}
   document.addEventListener('click',event=>{if(event.target.closest('button'))send('sound');if(event.target.closest('a'))event.preventDefault();});
   observer=new ResizeObserver(resize);observer.observe(root);resize();if(!failed)send('loaded');
  }catch(error){send('error',{message:String(error.message)});}
 });
 window.addEventListener('error',event=>{failed=true;send('error',{message:event.message});});
 send('ready');
})();

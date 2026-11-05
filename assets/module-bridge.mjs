/* Browser operations are explicit, scoped to one selected tab and restricted
   to the verified tool HTML from the Caixota Code 1.0.1 release. */
const official={"cookies": "bab190e2e409282d7fc41a15db51a3fd36d046e137edd8c5ca4f1b76ed8d0150", "detect": "ade2fd9b555873521bb7a8b907a1df10715561a535615aac56caed8d6d278cef", "inspect": "0dfe43e38045f6d2632d18d86640db655c49c2443b6200d8610a703ff0653828"};
const permission={detect:'scripting',inspect:'scripting',javascript:'contentSettings',cookies:'cookies'};
export function attachBridge(pkg,item,frame){
 const box=document.createElement('div');box.className='cx-module-access';let target=null,closed=false,pending=false;
 const verified=(async()=>pkg.id==='caixota-code'&&Object.hasOwn(official,item.id)&&
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',pkg.assets[item.file])),x=>x.toString(16).padStart(2,'0')).join('')===official[item.id])();
 if(item.capabilities?.length){
  const select=document.createElement('select'),button=document.createElement('button'),label=document.createElement('label'),status=document.createElement('p');
  button.disabled=true;verified.then(ok=>{button.disabled=!ok;if(!ok)status.textContent='Esta versão da ferramenta não está autorizada.';}).catch(()=>{status.textContent='Não foi possível verificar a ferramenta.';});
  label.textContent='Aba do site: ';label.append(select);button.textContent='Autorizar acesso nesta aba';box.append(label,button,status);frame.before(box);
  chrome.tabs.query({currentWindow:true}).then(tabs=>{for(const tab of tabs){if(!/^https?:\/\//.test(tab.url||''))continue;const option=new Option(new URL(tab.url).hostname+' — '+(tab.title||'').slice(0,80),String(tab.id));select.append(option);}}).catch(()=>{status.textContent='Não foi possível listar as abas.';});
  select.onchange=()=>{target=null;status.textContent='Autorize a aba selecionada.';};
  button.onclick=async()=>{
   if(!select.value||button.disabled)return;
   const id=Number(select.value);button.disabled=true;target=null;
   try{
    const permissions=[...new Set(item.capabilities.map(x=>permission[x]).filter(Boolean))];
    // Request directly in the trusted click handler to retain user activation.
    if(!await chrome.permissions.request({permissions}))throw Error('Permissão recusada.');
    if(!await verified)throw Error('Esta versão da ferramenta não está autorizada.');
    const tab=await chrome.tabs.get(id),url=new URL(tab.url);
    if(!/^https?:$/.test(url.protocol)||closed||id!==Number(select.value))return;
    target={id,origin:url.origin};status.textContent='Acesso autorizado: '+url.hostname;
   }catch(e){status.textContent=e.message;}finally{button.disabled=false;}
  };
 }
 const key='caixotaModuleDraft:'+pkg.id;
 async function request(op,d={}){
  if(closed)throw Error('Ferramenta fechada.');
  if(op==='storageGet')return (await chrome.storage.local.get(key))[key]||{};
  if(op==='storageSet'){
   if(!d||typeof d!=='object'||JSON.stringify(d).length>2000000)throw Error('Rascunho grande demais.');
   await chrome.storage.local.set({[key]:d});return true;
  }
  if(op==='saveFile'){
   if(typeof d.content!=='string'||d.content.length>2000000||typeof d.name!=='string'||!d.name.trim())throw Error('Arquivo inválido.');
   const filename=d.name.slice(0,120).replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/^\.+/,'_');
   const url=URL.createObjectURL(new Blob([d.content],{type:'text/plain;charset=utf-8'}));
   try{return await chrome.downloads.download({url,filename,saveAs:true});}finally{setTimeout(()=>URL.revokeObjectURL(url),60000);}
  }
  const cap=op.startsWith('cookie')?'cookies':op;
  if(!Object.hasOwn(permission,cap)||!item.capabilities?.includes(cap)||!await verified||!target||pending)throw Error('Autorize uma aba do site no painel acima.');
  pending=true;
  try{
   const granted=target,tab=await chrome.tabs.get(granted.id),url=new URL(tab.url);
   if(closed||target!==granted||url.origin!==granted.origin)throw Error('O site mudou. Autorize a aba novamente.');
   if(op==='detect'||op==='inspect'){
    const [{result}]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:pageTool,args:[url.origin,op,d.action==='close']});return result;
   }
   if(op==='javascript'){
    if(!['allow','block'].includes(d.setting)||!confirm('Alterar a permissão de JavaScript para '+url.hostname+'?'))throw Error('Operação cancelada.');
    await chrome.contentSettings.javascript.set({primaryPattern:url.origin+'/*',setting:d.setting,scope:tab.incognito?'incognito_session_only':'regular'});return true;
   }
   const store=(await chrome.cookies.getAllCookieStores()).find(x=>x.tabIds.includes(tab.id));
   if(!store)throw Error('Armazenamento de cookies indisponível.');
   const cookies=await chrome.cookies.getAll({url:url.href,storeId:store.id});
   if(op==='cookieList')return cookies;
   if(!['cookieSave','cookieDelete'].includes(op)||typeof d.name!=='string'||!d.name||d.name.length>256||typeof d.path!=='string'||!d.path.startsWith('/')||d.path.length>1024)throw Error('Cookie inválido.');
   const existing=cookies.find(c=>!c.partitionKey&&c.name===d.name&&c.domain===d.domain&&c.path===d.path);
   if((d.domain||op==='cookieDelete')&&!existing)throw Error('Cookie não encontrado nesta aba.');
   if(!confirm('Alterar o cookie “'+d.name+'” de '+url.hostname+'?'))throw Error('Operação cancelada.');
   const cookieUrl=new URL(url.origin);cookieUrl.pathname=d.path;
   if(op==='cookieDelete')return chrome.cookies.remove({url:cookieUrl.href,name:d.name,storeId:store.id});
   if(typeof d.value!=='string'||d.value.length>4096)throw Error('Valor inválido.');
   const options={url:cookieUrl.href,name:d.name,value:d.value,path:d.path,secure:!!d.secure,httpOnly:!!d.httpOnly,storeId:store.id};
   if(existing&&!existing.hostOnly)options.domain=existing.domain;
   if(['unspecified','no_restriction','lax','strict'].includes(d.sameSite))options.sameSite=d.sameSite;
   if(Number.isFinite(d.expirationDate)&&d.expirationDate>0)options.expirationDate=d.expirationDate;
   return chrome.cookies.set(options);
  }finally{pending=false;}
 }
 return {request,close(){closed=true;target=null;box.remove();}};
}
function pageTool(origin,op,close){
 if(location.origin!==origin)throw Error('O site mudou.');
 if(op==='detect'){
  const technologies=[],add=(name,evidence)=>{if(!technologies.some(x=>x.name===name))technologies.push({name,evidence});};
  const generator=document.querySelector('meta[name="generator"]')?.content;
  if(generator)add(generator.slice(0,120),'Meta generator');
  const sources=[...document.scripts].slice(0,400).map(x=>x.src).join(' ');
  for(const [name,re]of [['WordPress',/wp-(content|includes)/i],['React',/react(?:-dom)?[./-]/i],['Vue',/vue[./-]/i],['jQuery',/jquery[./-]/i],['Next.js',/\/_next\//i],['Shopify',/cdn\.shopify\.com/i]])if(re.test(sources))add(name,'Arquivos carregados na página');
  if(document.querySelector('#__NEXT_DATA__,#__next'))add('Next.js','Estrutura da página');
  if(document.querySelector('[ng-version]'))add('Angular','Atributo ng-version');
  return {note:'Detecção local por indícios; a lista pode estar incompleta.',technologies};
 }
 globalThis.__cxCodeInspector?.();
 if(close)return true;
 const host=document.createElement('div');host.style.cssText='position:fixed;z-index:2147483647;bottom:10px;left:10px;max-width:90vw';const shadow=host.attachShadow({mode:'closed'});
 const bar=document.createElement('div');bar.style.cssText='background:#181b1a;color:white;padding:10px;border-radius:8px;font:14px monospace';const output=document.createElement('span'),end=document.createElement('button');end.textContent='Fechar inspetor';bar.append(end,output);shadow.append(bar);document.documentElement.append(host);
 const move=e=>{const n=e.target;if(n===host||!(n instanceof Element))return;const r=n.getBoundingClientRect();output.textContent=' '+n.tagName.toLowerCase()+(n.id?'#'+n.id:'')+' · '+Math.round(r.width)+' × '+Math.round(r.height);};
 const cleanup=()=>{document.removeEventListener('pointermove',move,true);host.remove();delete globalThis.__cxCodeInspector;};
 globalThis.__cxCodeInspector=cleanup;document.addEventListener('pointermove',move,true);end.onclick=cleanup;return true;
}

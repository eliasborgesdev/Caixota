/* Runs only inside the opaque-origin module sandbox. */
(()=>{
 const pending=new Map(),workers=new Set();
 let engines=[],files={};
 const send=(type,data)=>parent.postMessage({source:'caixota-module',type,...data},'*');
 window.initModuleEngines=(list,bytes)=>{engines=list;files=bytes;};
 window.moduleRequest=(op,data={})=>new Promise((resolve,reject)=>{
  if(pending.size>=8){reject(Error('Aguarde as operações anteriores.'));return;}
  const id=crypto.randomUUID(),timer=setTimeout(()=>{pending.delete(id);reject(Error('Tempo de espera esgotado.'));},120000);
  pending.set(id,{resolve,reject,timer});send('request',{id,op,data});
 });
 addEventListener('message',({source,data})=>{
  if(source!==parent||data?.source!=='caixota-host'||data.type!=='response')return;
  const p=pending.get(data.id);if(!p)return;clearTimeout(p.timer);pending.delete(data.id);
  if(data.error)p.reject(Error(data.error));else p.resolve(data.result);
 });
 window.moduleRuntime=Object.freeze({version:2,createWorker(id,{timeoutMs=30000}={}){
  const engine=engines.find(x=>x.id===id);
  if(!engine||workers.size>=4||!Number.isFinite(timeoutMs)||timeoutMs<100||timeoutMs>120000)throw Error('Motor ou prazo inválido.');
  const bootstrap=`self.onmessage=({data})=>{
   self.onmessage=null;
   const files=data.files,urls=new Map();
   const readFile=p=>{if(!Object.hasOwn(files,p))throw Error('Arquivo do motor não encontrado: '+p);return new Uint8Array(files[p]);};
   const asset=p=>{if(!urls.has(p))urls.set(p,URL.createObjectURL(new Blob([readFile(p)],{type:p.endsWith('.wasm')?'application/wasm':'text/javascript'})));return urls.get(p);};
   self.CaixotaRuntime=Object.freeze({asset,readFile,instantiateWasm:(p,i)=>WebAssembly.instantiate(readFile(p),i)});
   for(const level of ['log','info','warn','error'])console[level]=(...args)=>postMessage({type:'console',level,args:args.slice(0,16).map(x=>{try{return String(typeof x==='string'?x:JSON.stringify(x)).slice(0,16384)}catch{return String(x).slice(0,16384)}})});
   importScripts(asset(data.entry));postMessage({type:'ready'});
  };`;
  const url=URL.createObjectURL(new Blob([bootstrap],{type:'text/javascript'}));
  let w;try{w=new Worker(url);}catch(e){URL.revokeObjectURL(url);throw e;}
  let timer,remaining=timeoutMs,started=0,waiting=false,closed=false;
  const terminate=w.terminate.bind(w);
  w.terminate=()=>{if(closed)return;closed=true;clearTimeout(timer);terminate();workers.delete(w);URL.revokeObjectURL(url);};
  const arm=ms=>{clearTimeout(timer);started=performance.now();timer=setTimeout(()=>{w.terminate();w.dispatchEvent(new MessageEvent('message',{data:{type:'timeout',message:'Tempo de execução esgotado.'}}));},ms);};
  w.setWaitingForInput=value=>{if(closed||waiting===!!value)return;if(value)remaining=Math.max(0,remaining-(performance.now()-started));waiting=!!value;arm(waiting?600000:remaining);};
  workers.add(w);w.addEventListener('error',()=>w.terminate());arm(remaining);
  w.postMessage({entry:engine.file,files:Object.fromEntries(engine.files.map(p=>[p,files[p]]))});return w;
 }});
 addEventListener('pagehide',()=>{for(const w of workers)w.terminate();});
})();

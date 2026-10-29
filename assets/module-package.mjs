/* ZIP reader and schema for local modules. No imported code executes here. */
export const CORE_VERSION='0.1.0', DEMO_CORE_VERSION=CORE_VERSION;
export const KINDS=['category','theme','font','sound','tool','game'];
export const BUILTIN_CATEGORIES=['text','images','video','pdf','generators','utilities','games','sorteio'];
export const COLOR_KEYS=['bg','surface','surface-solid','surface-strong','surface-faint','title','text','muted','subtle','primary','primary-dark','primary-soft','stroke','line'];
const MAX_ZIP=20*1024*1024,MAX_EXPANDED=40*1024*1024,MAX_FILE=8*1024*1024;
const decoder=new TextDecoder('utf-8',{fatal:true});
const ident=/^(?!.*--)[a-z][a-z0-9-]{0,46}[a-z0-9]$/,version=/^\d+\.\d+\.\d+$/;
export const keyOf=(moduleId,itemId)=>'mod-'+moduleId+'--'+itemId;
const text=(x,n=160)=>typeof x==='string'?x.trim().slice(0,n):'';
export function compareVersions(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return Math.sign(x[i]-y[i]);return 0;}
function pathOK(p){return typeof p==='string'&&p.length<200&&!/[\\\x00-\x1f:]/.test(p)&&!p.startsWith('/')&&p.split('/').every(x=>x&&x!=='.'&&x!=='..');}
export function validateModule(raw,assets={}){
 if(!raw||raw.schemaVersion!==2||!ident.test(raw.id)||!version.test(raw.version)||!version.test(raw.minCoreVersion))throw Error('Manifesto inválido. Use schemaVersion 2, ID simples e versões como 0.1.0.');
 if(raw.maxCoreVersion&&!version.test(raw.maxCoreVersion))throw Error('maxCoreVersion inválida.');
 if(!text(raw.name,80)||!Array.isArray(raw.contents)||!raw.contents.length||raw.contents.length>100)throw Error('Informe nome e entre 1 e 100 conteúdos.');
 const ids=new Set(),contents=raw.contents.map(x=>{
  if(!x||!ident.test(x.id)||ids.has(x.id)||!KINDS.includes(x.type)||!text(x.name,80))throw Error('Conteúdo inválido ou ID repetido.');
  ids.add(x.id);const item={id:x.id,type:x.type,name:text(x.name,80),description:text(x.description,240)};
  if(['font','sound','tool','game'].includes(x.type)){
   if(!pathOK(x.file)||!Object.hasOwn(assets,x.file))throw Error('Arquivo ausente ou inválido: '+String(x.file));
   const patterns={font:/\.(woff2?|ttf|otf)$/i,sound:/\.(wav|mp3|ogg)$/i,tool:/\.html$/i,game:/\.html$/i};
   if(!patterns[x.type].test(x.file))throw Error('Formato de arquivo incompatível: '+x.file);
   item.file=x.file;
  }
  if(x.type==='theme'){
   if(!['light','dark'].includes(x.base)||!x.colors||typeof x.colors!=='object')throw Error('Tema precisa de base light/dark e cores.');
   item.base=x.base;item.colors={};
   for(const [k,v] of Object.entries(x.colors)){if(!COLOR_KEYS.includes(k)||!/^#[0-9a-f]{6}$/i.test(v))throw Error('Use apenas cores hexadecimais de seis dígitos nos tokens do tema.');item.colors[k]=v;}
   for(const k of ['bg','surface','title','text','muted','primary','stroke'])if(!item.colors[k])throw Error('Tema sem token: '+k);
  }
  if(x.type==='tool'||x.type==='game')item.category=x.category||(x.type==='game'?'games':'utilities');
  return item;
 });
 const categories=new Set([...BUILTIN_CATEGORIES,...contents.filter(x=>x.type==='category').map(x=>x.id)]);
 for(const item of contents)if(item.category&&!categories.has(item.category))throw Error('Categoria não declarada: '+item.category);
 return {schemaVersion:2,id:raw.id,name:text(raw.name,80),version:raw.version,minCoreVersion:raw.minCoreVersion,maxCoreVersion:raw.maxCoreVersion||null,author:text(raw.author,100)||'Autor não informado',description:text(raw.description,300),contents,compatible:compareVersions(CORE_VERSION,raw.minCoreVersion)>=0&&(!raw.maxCoreVersion||compareVersions(CORE_VERSION,raw.maxCoreVersion)<=0)};
}
export function validateSelection(m,selected){
 const set=new Set(selected);if(!set.size)throw Error('Escolha pelo menos um conteúdo.');
 for(const id of set)if(!m.contents.some(x=>x.id===id))throw Error('Seleção inválida.');
 for(const x of m.contents)if(set.has(x.id)&&x.category&&!BUILTIN_CATEGORIES.includes(x.category)&&!set.has(x.category))throw Error('Selecione também a categoria de '+x.name+'.');
 return [...set];
}
const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
export async function parsePackage(file){
 if(!file||!/\.zip$/i.test(file.name)||file.size>MAX_ZIP)throw Error('Escolha um ZIP de até 20 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer()),dv=new DataView(bytes.buffer);
 if(bytes.length<22)throw Error('ZIP incompleto.');
 let end=-1;for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(dv.getUint32(i,true)===0x06054b50&&i+22+dv.getUint16(i+20,true)===bytes.length){end=i;break;}
 if(end<0)throw Error('ZIP inválido.');
 const count=dv.getUint16(end+10,true),start=dv.getUint32(end+16,true),size=dv.getUint32(end+12,true);
 if(dv.getUint16(end+4,true)||dv.getUint16(end+6,true)||count!==dv.getUint16(end+8,true)||count>500||start+size!==end)throw Error('ZIP dividido, ZIP64 ou índice inválido.');
 const assets=Object.create(null);let offset=start,total=0;
 for(let i=0;i<count;i++){
  if(offset+46>end||dv.getUint32(offset,true)!==0x02014b50)throw Error('Índice ZIP danificado.');
  const flags=dv.getUint16(offset+8,true),method=dv.getUint16(offset+10,true),crc=dv.getUint32(offset+16,true),compressed=dv.getUint32(offset+20,true),original=dv.getUint32(offset+24,true),nl=dv.getUint16(offset+28,true),el=dv.getUint16(offset+30,true),cl=dv.getUint16(offset+32,true),lo=dv.getUint32(offset+42,true);
  if(offset+46+nl+el+cl>end)throw Error('Nome truncado.');
  const name=decoder.decode(bytes.subarray(offset+46,offset+46+nl));offset+=46+nl+el+cl;
  if(name.endsWith('/')){if(!pathOK(name.slice(0,-1)))throw Error('Pasta inválida.');continue;}
  if(!pathOK(name)||Object.hasOwn(assets,name)||flags&1||![0,8].includes(method))throw Error('Entrada insegura, duplicada, cifrada ou não suportada.');
  total+=original;if(original>MAX_FILE||total>MAX_EXPANDED||lo+30>start||dv.getUint32(lo,true)!==0x04034b50)throw Error('Pacote excede os limites ou contém entrada inválida.');
  const localNameLen=dv.getUint16(lo+26,true),data=lo+30+localNameLen+dv.getUint16(lo+28,true);
  if(data+compressed>start||dv.getUint16(lo+8,true)!==method||decoder.decode(bytes.subarray(lo+30,lo+30+localNameLen))!==name)throw Error('Entrada ZIP inconsistente.');
  let payload=bytes.slice(data,data+compressed);
  if(method===8){
   const reader=new Blob([payload]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader(),chunks=[];let length=0;
   try{for(;;){const r=await reader.read();if(r.done)break;length+=r.value.length;if(length>original||length>MAX_FILE)throw Error('Arquivo descompactado excede o limite.');chunks.push(r.value);}}
   catch(e){await reader.cancel().catch(()=>{});throw e;}finally{reader.releaseLock();}
   payload=new Uint8Array(length);let n=0;for(const c of chunks){payload.set(c,n);n+=c.length;}
  }
  if(payload.length!==original||crc32(payload)!==crc)throw Error('Arquivo corrompido: '+name);
  assets[name]=payload;
 }
 if(offset!==end)throw Error('Índice ZIP inconsistente.');
 const manifests=Object.keys(assets).filter(p=>/(^|\/)caixota-module.json$/.test(p));
 if(manifests.length!==1||assets[manifests[0]].length>65536)throw Error('Use exatamente um caixota-module.json (até 64 KB).');
 const prefix=manifests[0].slice(0,-'caixota-module.json'.length),normalized=Object.create(null);
 for(const [path,data] of Object.entries(assets)){if(!path.startsWith(prefix))throw Error('Arquivos fora da pasta do módulo.');normalized[path.slice(prefix.length)]=data;}
 let raw;try{raw=JSON.parse(decoder.decode(assets[manifests[0]]));}catch{throw Error('Manifesto JSON inválido.');}
 return {...validateModule(raw,normalized),assets:normalized,bytes:total};
}
export async function parseModuleFiles(){throw Error('Na versão 0.1.0, selecione o pacote ZIP completo.');}

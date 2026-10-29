import {validateSelection} from './module-package.mjs';
export const MODULE_REVISION_KEY='caixotaModulesRevision040';
const open=()=>new Promise((resolve,reject)=>{const r=indexedDB.open('caixota-modules-040',1);r.onupgradeneeded=()=>r.result.createObjectStore('packages',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export async function listModules(){const db=await open();try{return await new Promise((resolve,reject)=>{const r=db.transaction('packages').objectStore('packages').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}finally{db.close();}}
async function mutate(action){const db=await open();try{await new Promise((resolve,reject)=>{const tx=db.transaction('packages','readwrite');try{action(tx.objectStore('packages'),tx);}catch(e){tx.abort();reject(e);}tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Operação cancelada.'));});}finally{db.close();}await chrome.storage.local.set({[MODULE_REVISION_KEY]:crypto.randomUUID()});}
export async function installModule(pkg,selection){
 if(!pkg.compatible)throw Error('O pacote não é compatível com a Caixota 0.1.0.');
 const selected=validateSelection(pkg,selection),record={...pkg,selected,enabled:true,installedAt:Date.now()};
 await mutate((store,tx)=>{const q=store.getAll();q.onsuccess=()=>{const others=q.result.filter(x=>x.id!==pkg.id);if(others.length>=24||others.reduce((n,x)=>n+x.bytes,0)+pkg.bytes>80*1024*1024){tx.abort();return;}store.put(record);};});
}
export async function toggleModule(id){await mutate(store=>{const q=store.get(id);q.onsuccess=()=>{if(q.result)store.put({...q.result,enabled:!q.result.enabled});};});}
export async function removeModule(id){await mutate(store=>store.delete(id));}

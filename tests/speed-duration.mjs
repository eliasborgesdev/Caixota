// Isolated UI/transport test; does not measure a real connection.
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {bindSpeedTest,stopSpeedTest} from '../assets/speed-test.mjs';
const nodes=new Map();
class Node {constructor(){this.textContent='';this.style={};this.dataset={};this.attrs={};this.disabled=false;this.listeners={};}
 addEventListener(name,fn){this.listeners[name]=fn;}
 setAttribute(name,value){this.attrs[name]=value;}
}
globalThis.document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);}};
Object.defineProperty(globalThis.navigator,'onLine',{value:true,configurable:true});
globalThis.fetch=async function(url,options={}){if(options.signal?.aborted)throw new DOMException('Canceled','AbortError');if(String(url).includes('__up'))return new Response('',{status:200});let length=Number(new URL(url).searchParams.get('bytes')||0);return new Response(new Uint8Array(length),{status:200});};
bindSpeedTest();
const start=performance.now();
await nodes.get('cxSpeedStart').listeners.click();
const elapsed=performance.now()-start;
assert(elapsed>=14980,`A medição terminou antes de 15s: ${elapsed}`);
assert.match(nodes.get('cxSpeedStatus').textContent,/concluído/i);
assert(nodes.get('cxSpeedTimelineFill').style.width==='100%');
stopSpeedTest();
console.log(`OK: teste simulado (requisições fictícias), duração mínima ${elapsed.toFixed(0)} ms, status concluído.`);

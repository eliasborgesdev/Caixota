// Regressões do motor de volume contextual v0.3.13 (substitui o recurso de 0.3.12).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const manifest=JSON.parse(read('manifest.json'));
assert.equal(manifest.version,'0.3.18');
assert(manifest.permissions.includes('tabCapture') && manifest.permissions.includes('offscreen'));
assert.equal(manifest.commands['open-page-popup'].suggested_key.default,'Ctrl+Shift+Period');
assert(!fs.existsSync(new URL('../audio-service.js',import.meta.url)));
assert(!fs.existsSync(new URL('../audio-offscreen.js',import.meta.url)));
assert(!fs.existsSync(new URL('../assets/audio-booster.mjs',import.meta.url)));
assert(!read('shell.js').includes('audioBoosterMarkup'));
assert(read('content.js').includes('function renderPageVolumeMenu()'));
assert(read('background.js').includes('caixota-open-volume'));
assert(read('workbench.html').includes('file-drop-unified.css'));
assert(read('workbench-bridge.js').includes("type:'content-height'"));
// Validar o processador sem API de áudio real.
const handlers=[];let recorded=0,stopped=0,gain=0,closed=0;
const track={addEventListener(){},stop(){stopped++;}};
const stream={getAudioTracks:()=>[track],getTracks:()=>[track]};
class FakeContext {
 currentTime=0;destination={};
 createMediaStreamSource(){return {connect(){},disconnect(){}};}
 createGain(){return {gain:{value:0,setTargetAtTime(n){gain=n;}},connect(){},disconnect(){}};}
 resume(){return Promise.resolve();}
 close(){closed++;return Promise.resolve();}
}
const chrome={runtime:{id:'test',onMessage:{addListener(f){handlers.push(f);}}}};
vm.runInNewContext(read('caixota-volume-processor.js'),{
 chrome,AudioContext:FakeContext,navigator:{mediaDevices:{getUserMedia:async args=>{assert.equal(args.audio.mandatory.chromeMediaSource,'tab');recorded++;return stream;}}},console
});
const call=msg=>new Promise(resolve=>handlers[0]({channel:'cx-volume-processor',tabId:42,...msg},{id:'test'},resolve));
assert.equal((await call({type:'status'})).enabled,false);
assert.equal((await call({type:'start',streamId:'from-chrome',boost:100})).boost,100);
assert.equal(recorded,1);
assert.equal((await call({type:'adjust',boost:200})).boost,200);
assert.equal(gain,3);
assert.equal((await call({type:'stop'})).enabled,false);
assert(stopped&&closed);
// Análise do broker e política de aba originadora.
const bridge=read('caixota-volume-engine.js');
assert(bridge.includes('sender.tab?.id'));
assert(bridge.includes("message?.channel !== CX_VOLUME_TARGET"));
assert(bridge.includes('chrome.tabCapture.getMediaStreamId({targetTabId:tabId})'));
assert(bridge.includes('sender.frameId !== 0'));
console.log('OK 0.3.13: popup, atalhos, remoção da implementação antiga e motor de ganho 1-3×.');

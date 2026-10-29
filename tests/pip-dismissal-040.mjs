import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../page-features.js',import.meta.url),'utf8');
const KEY='caixotaBrowserFeatures0310';

async function startPage(){
  const listeners={};let onStorageChange;let requests=0;
  const doc={
    documentElement:{classList:{toggle(){}},dataset:{}},
    visibilityState:'hidden',pictureInPictureEnabled:true,pictureInPictureElement:null,
    hasFocus:()=>false,querySelectorAll:()=>[video],
    addEventListener(name,fn){listeners['document:'+name]=fn;},
    removeEventListener(){},
  };
  const video={tagName:'VIDEO',paused:false,ended:false,readyState:3,disablePictureInPicture:false,
    getBoundingClientRect:()=>({width:500,height:300}),
    async requestPictureInPicture(){requests++;doc.pictureInPictureElement=this;},
    pause(){this.paused=true;},
  };
  doc.querySelectorAll=()=>[video];
  const context={
    chrome:{storage:{local:{get:async()=>({[KEY]:{pip:false}})},onChanged:{addListener(fn){onStorageChange=fn;}}},runtime:{onMessage:{addListener(){}}}},
    document:doc,navigator:{mediaSession:{setActionHandler(){}}},
    window:{addEventListener(name,fn){listeners['window:'+name]=fn;},removeEventListener(){}},
    Date,console,
  };
  vm.runInNewContext(source,context,{filename:'page-features.js'});
  await Promise.resolve();await Promise.resolve();
  onStorageChange({[KEY]:{newValue:{pip:true}}},'local');
  listeners['window:blur']();
  await Promise.resolve();await Promise.resolve();
  return {doc,video,listeners,get requests(){return requests;}};
}

const page=await startPage();
assert.equal(page.requests,1,'PiP opens when the page loses focus');
page.video.paused=false;
page.doc.pictureInPictureElement=null; // the browser clears this before firing leavepictureinpicture.
page.listeners['document:leavepictureinpicture']({target:page.video});
assert.equal(page.video.paused,true,'closing the PiP window pauses its source video');
page.video.paused=false; // even if the user resumes playback, dismissal remains in effect.
page.listeners['window:blur']();
assert.equal(page.requests,1,'closing PiP suppresses automatic reopening until reload');

const refreshed=await startPage();
assert.equal(refreshed.requests,1,'a fresh document can open PiP again');
console.log('OK: close pauses video, blocks PiP re-entry for this page, reload resets block.');

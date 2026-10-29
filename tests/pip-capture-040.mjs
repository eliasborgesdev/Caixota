import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const script=readFileSync(new URL('../page-features.js',import.meta.url),'utf8');
const browser=await chromium.launch({
  executablePath:process.env.CAIXOTA_CHROMIUM||'/workspace/scratch/1890ef31a4d1/tests/browser/chromium',
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
});
try{
  const page=await browser.newPage();
  await page.goto('data:text/html,<video></video>');
  await page.evaluate(()=>{
    let playing=true;let pip=null;window.__pipRequests=0;
    const video=document.querySelector('video');
    Object.defineProperty(video,'paused',{configurable:true,get:()=>!playing});
    Object.defineProperty(video,'ended',{configurable:true,get:()=>false});
    Object.defineProperty(video,'readyState',{configurable:true,get:()=>3});
    Object.defineProperty(video,'disablePictureInPicture',{configurable:true,get:()=>false});
    video.getBoundingClientRect=()=>({width:500,height:300});
    video.pause=()=>{playing=false;window.__pausedByClose=true;};
    video.requestPictureInPicture=async()=>{window.__pipRequests++;pip=video;};
    Object.defineProperty(document,'pictureInPictureElement',{configurable:true,get:()=>pip});
    Object.defineProperty(document,'pictureInPictureEnabled',{configurable:true,value:true});
    document.hasFocus=()=>false;
    window.chrome={storage:{local:{get:async()=>({caixotaBrowserFeatures0310:{pip:true}})},onChanged:{addListener(){}}},runtime:{onMessage:{addListener(){}}}};
  });
  await page.addScriptTag({content:script});
  await page.waitForTimeout(20);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.waitForFunction(()=>window.__pipRequests===1);
  await page.evaluate(()=>{
    const video=document.querySelector('video');
    video.dispatchEvent(new Event('leavepictureinpicture'));
  });
  assert.equal(await page.evaluate(()=>window.__pausedByClose),true,'non-bubbling leave event reaches document capture and pauses the video');
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(50);
  assert.equal(await page.evaluate(()=>window.__pipRequests),1,'no automatic reopen after close');
  console.log('OK: Chromium capture listener handles leavepictureinpicture and prevents automatic reopen.');
}finally{await browser.close();}

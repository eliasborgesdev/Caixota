import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const css=readFileSync(new URL('../instagram-progress.css',import.meta.url),'utf8');
const source=readFileSync(new URL('../instagram-progress.js',import.meta.url),'utf8');

const browser=await chromium.launch({
  executablePath:process.env.CAIXOTA_CHROMIUM||'/workspace/scratch/1890ef31a4d1/tests/browser/chromium',
  headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],
});
try{
  const context=await browser.newContext({viewport:{width:1000,height:700}});
  await context.route('https://www.instagram.com/**',route=>route.fulfill({status:200,contentType:'text/html',body:`<!doctype html><html><head><style>
    body{margin:0;background:#151820;color:white;font:16px system-ui;min-height:100vh}
    .player{position:relative;margin:80px auto;width:620px;height:360px;background:#634c3c}
    video{display:block;width:100%;height:100%;object-fit:contain}
  </style></head><body><main class="player"><video></video></main></body></html>`}));
  await context.addInitScript(()=>{window.chrome={storage:{local:{get:async()=>({caixotaBrowserFeatures0310:{instagramProgress:true}})},onChanged:{addListener(){}}}};});
  const page=await context.newPage();
  await page.goto('https://www.instagram.com/');
  await page.evaluate(()=>{
    const video=document.querySelector('video');
    Object.defineProperties(video,{
      duration:{configurable:true,get:()=>20},currentTime:{configurable:true,get:()=>3,set:()=>{}},
      paused:{configurable:true,get:()=>false},ended:{configurable:true,get:()=>false},
    });
  });
  await page.addStyleTag({content:css});
  await page.addScriptTag({content:source});
  const bar=page.locator('#cx-ig-timeline-root');
  await page.waitForFunction(()=>{const el=document.querySelector('#cx-ig-timeline-root');return el&&!el.hidden;});
  await page.evaluate(()=>{
    const dialog=document.createElement('div');dialog.id='media-viewer';
    dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
    dialog.style.cssText='position:fixed;inset:0;background:#222;z-index:2147483647';
    dialog.innerHTML='<img alt="open image" style="width:100%;height:100%;object-fit:contain">';
    document.body.append(dialog);
  });
  await page.waitForFunction(()=>document.querySelector('#cx-ig-timeline-root')?.hidden===true);
  assert.equal(await bar.evaluate(el=>el.hidden),true,'bar hides behind the foreground media dialog');
  await page.locator('#media-viewer').evaluate(el=>el.remove());
  await page.waitForFunction(()=>document.querySelector('#cx-ig-timeline-root')?.hidden===false);
  assert.equal(await bar.evaluate(el=>el.hidden),false,'bar returns when its video is again in the foreground');
  console.log('OK: Instagram progress hides behind the media dialog and returns after it closes.');
  await context.close();
}finally{await browser.close();}

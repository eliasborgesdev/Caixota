from playwright.sync_api import sync_playwright
from pathlib import Path
import json
base=Path(__file__).resolve().parent.parent
html='''<!doctype html><html><head><style>
body{margin:0;background:#171922;color:white;font:18px system-ui;min-height:1300px;}
.player{position:relative;margin:85px auto;width:620px;height:355px;background:radial-gradient(ellipse,#8b5f47,#30251c 45%,#10151d);overflow:hidden;border-radius:14px;}
video{display:block;width:100%;height:100%;object-fit:contain;}
.layer{position:absolute;inset:0;background:linear-gradient(0deg,transparent 60%,#0004);z-index:9999;}
</style></head><body><main class=player><video></video><div class=layer>Camada de controles do Instagram</div></main></body></html>'''
with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=browser.new_page(viewport={'width':1000,'height':650},device_scale_factor=1)
  page.set_content(html)
  page.evaluate('''() => { window.chrome = {storage:{local:{get:async()=>({caixotaBrowserFeatures0310:{instagramProgress:true}})},onChanged:{addListener(fn){window.__changePrefs=fn}}}};const v=document.querySelector('video');v.__t=3;Object.defineProperty(v,'duration',{configurable:true,get(){return 20}});Object.defineProperty(v,'currentTime',{configurable:true,get(){return this.__t},set(t){this.__t=t}});Object.defineProperty(v,'paused',{configurable:true,get(){return false}}); }''')
  page.add_style_tag(content=(base/'instagram-progress.css').read_text())
  script=(base/'instagram-progress.js').read_text().replace("if (location.hostname !== 'www.instagram.com' && location.hostname !== 'instagram.com') return;", 'if (false) return;')
  page.add_script_tag(content=script)
  page.wait_for_selector('#cx-ig-timeline-root:not([hidden])')
  bar=page.locator('#cx-ig-timeline-root .cx-ig-timeline')
  track=page.locator('#cx-ig-timeline-root .cx-ig-track')
  label=page.locator('#cx-ig-timeline-root .cx-ig-time')
  print('initial label',label.inner_text())
  assert label.inner_text()=='0:03 / 0:20'
  rect=track.bounding_box()
  print('bounding',rect)
  page.mouse.move(rect['x']+rect['width']/2,rect['y']+rect['height']/2)
  page.wait_for_timeout(220)
  assert float(page.locator('#cx-ig-timeline-root .cx-ig-time').evaluate('(el)=>getComputedStyle(el).opacity')) > .95
  # Screenshot is optional; this test makes assertions against the live DOM.
  page.mouse.click(rect['x']+rect['width']*.75,rect['y']+rect['height']/2)
  t=page.evaluate('document.querySelector("video").currentTime')
  print('click-seek',t)
  assert abs(t-15)<.1
  page.mouse.move(rect['x']+rect['width']*.75,rect['y']+rect['height']/2)
  page.mouse.down()
  page.mouse.move(rect['x']+rect['width']*.25,rect['y']+rect['height']/2,steps=5)
  page.mouse.up()
  t=page.evaluate('document.querySelector("video").currentTime')
  print('drag-seek',t)
  assert abs(t-5)<.3
  assert label.inner_text()=='0:05 / 0:20'
  # The view should also handle a video whose duration changes after loading.
  page.evaluate("() => { const v=document.querySelector('video');Object.defineProperty(v,'duration',{configurable:true,get(){return 40}});v.dispatchEvent(new Event('durationchange')) }")
  assert label.inner_text()=='0:05 / 0:40'
  # Instagram's feed reuses its container while replacing video elements.
  page.evaluate("""() => {
    const old=document.querySelector('video');
    const replacement=document.createElement('video');
    replacement.style.cssText='display:block;width:100%;height:100%;object-fit:contain';
    replacement.__t=2;
    Object.defineProperty(replacement,'duration',{get(){return 33}});
    Object.defineProperty(replacement,'currentTime',{get(){return this.__t},set(t){this.__t=t}});
    Object.defineProperty(replacement,'paused',{get(){return false}});
    old.replaceWith(replacement);
  }""")
  page.wait_for_function("document.querySelector('#cx-ig-timeline-root .cx-ig-time')?.textContent === '0:02 / 0:33'",timeout=3000)
  # A foreground Instagram media viewer can cover a still-playing feed video.
  # The progress bar must disappear while that dialog covers the video, then
  # return when the viewer closes.
  page.evaluate("""() => {
    const viewer=document.createElement('div');viewer.id='test-media-viewer';
    viewer.setAttribute('role','dialog');viewer.setAttribute('aria-modal','true');
    viewer.style.cssText='position:fixed;inset:0;background:#222;z-index:2147483647';
    viewer.innerHTML='<img alt="opened photo" style="width:100%;height:100%;object-fit:contain">';
    document.body.appendChild(viewer);
  }""")
  page.wait_for_timeout(500)
  assert page.locator('#cx-ig-timeline-root').evaluate('(el)=>el.hidden')
  page.locator('#test-media-viewer').evaluate('(el)=>el.remove()')
  page.wait_for_function("!document.querySelector('#cx-ig-timeline-root')?.hidden",timeout=2000)
  page.evaluate("window.__changePrefs({caixotaBrowserFeatures0310:{newValue:{instagramProgress:false}}},'local')")
  page.wait_for_timeout(70)
  assert page.locator('#cx-ig-timeline-root').count()==0
  print('PASSED: seek, drag, dialog occlusion/recovery, disable; player overlay present')
  browser.close()

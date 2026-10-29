from pathlib import Path
import asyncio, json
from playwright.async_api import async_playwright

ROOT=Path('/mnt/data/caixota-v0.3.13')
async def main():
 async with async_playwright() as p:
  browser = await p.chromium.launch_persistent_context('/tmp/caixota_chromium_0313',headless=True,executable_path='/usr/bin/chromium',args=[f'--disable-extensions-except={ROOT}',f'--load-extension={ROOT}','--no-sandbox','--disable-dev-shm-usage'],viewport={'width':1440,'height':900})
  print('serviceworkers',[(w.url) for w in browser.service_workers])
  for i in range(20):
   sw=browser.service_workers
   if sw:break
   await asyncio.sleep(.25)
  if not sw:
   print('NO SW'); await browser.close();return
  extension_id=sw[0].url.split('/')[2]
  page=await browser.new_page()
  await page.goto(f'chrome-extension://{extension_id}/panel.html#tool/generator-wheel',wait_until='domcontentloaded',timeout=30000)
  await page.wait_for_timeout(4000)
  print('title',await page.title())
  print('wheel?',await page.locator('iframe#v3WorkbenchFrame').count())
  info=await page.evaluate('''()=>{const i=document.querySelector('#v3WorkbenchFrame');return {iframeHeight:i?.getBoundingClientRect().height, documentHeight:document.documentElement.scrollHeight,viewport:innerHeight,frameReady:i?.classList.contains('ready'),iframeParent:i?.closest('.cx-tool-workspace')?.className}}''')
  print('info',info)
  iframe=page.frame_locator('#v3WorkbenchFrame')
  print('innerWheel',await iframe.locator('.caixota-wheel-stage').count())
  await page.screenshot(path='/mnt/data/caixota_0313_wheel.png',full_page=True)
  print('screen /mnt/data/caixota_0313_wheel.png')
  await browser.close()
asyncio.run(main())

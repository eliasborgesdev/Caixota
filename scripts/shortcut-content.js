// Optional site-local shortcut. The Ctrl+. global shortcut still belongs to
// chrome.commands; browsers prohibit arbitrary global rebinding in page code.
(() => {
 let custom='Ctrl+Period';
 const read=()=>chrome.storage.local.get('caixotaUiV3').then(data=>{custom=data.caixotaUiV3?.shortcut||'Ctrl+Period';}).catch(()=>{});
 read();
 chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.caixotaUiV3)custom=changes.caixotaUiV3.newValue?.shortcut||'Ctrl+Period';});
 document.addEventListener('keydown',event=>{
  if(event.repeat||event.isComposing||event.defaultPrevented)return;
  const el=event.target;
  if(el?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(el?.tagName))return;
  const keys=custom.split('+');const shift=keys.includes('Shift'),alt=keys.includes('Alt');
  const ctrl=keys.includes('Ctrl')||keys.includes('Command');
  const expected=keys[keys.length-1];
  const code=event.code;
  if(!!(event.ctrlKey||event.metaKey)!==ctrl||event.shiftKey!==shift||event.altKey!==alt)return;
  if(code!==expected)return;
  // For the default, let the browser's global chrome.commands handle it.
  if(custom==='Ctrl+Period')return;
  event.preventDefault();
  chrome.runtime.sendMessage({type:'CAIXOTA_OPEN_PANEL_FROM_SITE'}).catch(()=>{});
 },{capture:true});
})();

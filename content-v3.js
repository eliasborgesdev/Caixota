// Theme bridge for the existing fully functional contextual menu. Read only
// UI preferences and apply presentation attributes. No selected text leaves
// the browser and the original content.js retains all behavior.
(() => {
  let ui={theme:'glass-light',quality:'auto',effects:true,font:'system'};
  const root=()=>document.getElementById('trem-selection-root');
  const update=()=>{const node=root();if(!node)return;
    node.dataset.v3Theme=ui.theme||'glass-light';
    node.dataset.v3Quality=ui.quality||'auto';
    node.dataset.v3Effects=ui.effects!==false?'on':'off';
    node.dataset.v3Font=ui.font||'system';
  };
  try{
   chrome.storage.local.get('caixotaUiV3').then(data=>{ui={...ui,...(data.caixotaUiV3||{})};update();});
   chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.caixotaUiV3){ui={...ui,...(changes.caixotaUiV3.newValue||{})};update();}});
  }catch{}
  // A single observer is needed until the original menu root is created.
  // Disconnect once found to avoid walking every future mutation on busy sites.
  if(!root()){
    const obs=new MutationObserver(records=>{
      if(!records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&(n.id==='trem-selection-root'||n.querySelector?.('#trem-selection-root')))))return;
      update();obs.disconnect();
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  } else update();
})();

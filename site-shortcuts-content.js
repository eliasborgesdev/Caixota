// Escuta combinações apenas enquanto páginas permitidas estiverem em foco.
// Não interfere em formulários e jamais abre URLs não validadas pelo background.
(()=>{'use strict';const KEY='caixotaSiteShortcuts0311';let mappings=[];
 const modifiers=['Ctrl','Alt','Shift','Meta'];
 function normal(text){const parts=String(text||'').split('+');const key=parts.pop();return [...modifiers.filter(x=>parts.includes(x)),key].join('+');}
 function refresh(){chrome.storage.local.get(KEY).then(d=>{mappings=Array.isArray(d[KEY])?d[KEY].slice(0,50):[];}).catch(()=>{});}
 refresh();chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[KEY])refresh();});
 window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.repeat||e.isComposing||!e.isTrusted)return;
 const target=e.target;
 if(target?.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]'))return;
 const mods=[e.ctrlKey?'Ctrl':'',e.altKey?'Alt':'',e.shiftKey?'Shift':'',e.metaKey?'Meta':''].filter(Boolean);
 if(!mods.length)return;
 let key=e.code==='Period'?'.':e.key.length===1?e.key.toUpperCase():e.key;
 const chord=normal([...mods,key].join('+'));
 if(!mappings.some(x=>x.chord===chord))return;
 e.preventDefault();e.stopPropagation();
 chrome.runtime.sendMessage({type:'CAIXOTA_OPEN_SHORTCUT_SITES',chord}).catch(()=>{});
 },true);
})();

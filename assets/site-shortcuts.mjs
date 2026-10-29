// Atalhos de sites: só HTTP(S), sem código remoto e sem alterar atalhos do Chromium.
export const SHORTCUT_KEY='caixotaSiteShortcuts0311';
export const MAX_SHORTCUTS=50;
export function normalizeChord(text){
 const raw=String(text||'').trim();if(!raw)return '';
 const parts=raw.split('+').map(x=>x.trim().toLowerCase()).filter(Boolean);
 const mods=new Set(parts.filter(x=>['ctrl','control','alt','shift','meta','cmd','command'].includes(x)).map(x=>x==='ctrl'||x==='control'?'Ctrl':x==='command'||x==='cmd'||x==='meta'?'Meta':x==='alt'?'Alt':'Shift'));
 const keys=parts.filter(x=>!['ctrl','control','alt','shift','meta','cmd','command'].includes(x));
 if(keys.length!==1||!mods.size)return '';
 const keyName=keys[0].toLowerCase();
 const k=keyName.length===1?keyName.toUpperCase():(/^f(?:[1-9]|1[0-2])$/.test(keyName)?keyName.toUpperCase():({'arrowup':'ArrowUp','arrowdown':'ArrowDown','arrowleft':'ArrowLeft','arrowright':'ArrowRight','enter':'Enter','escape':'Escape','space':'Space'}[keyName]||''));
 if(!/^[A-Z0-9.]$/.test(k)&&!/^F(?:[1-9]|1[0-2])$/.test(k)&&!['Enter','Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(k))return '';
 return [...['Ctrl','Alt','Shift','Meta'].filter(x=>mods.has(x)),k].join('+');
}
export function chordFromEvent(e){
 if(!e||['Control','Alt','Shift','Meta'].includes(e.key))return '';
 const mods=[e.ctrlKey?'Ctrl':null,e.altKey?'Alt':null,e.shiftKey?'Shift':null,e.metaKey?'Meta':null].filter(Boolean);
 let key=e.key===' '?'Space':e.key.length===1?e.key.toUpperCase():e.key;
 if(e.code==='Period')key='.';
 return normalizeChord([...mods,key].join('+'));
}
export function safeSiteUrl(value){
 try{const input=String(value||'').trim();if(!input||input.length>2000)return '';
 const url=new URL(/^[a-z][a-z\d+.-]*:/i.test(input)?input:'https://'+input);
 if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)return '';
 return url.href;
 }catch{return '';}
}
export function cleanShortcuts(data){if(!Array.isArray(data))return [];
 return data.slice(0,MAX_SHORTCUTS).flatMap((row,index)=>{
 const url=safeSiteUrl(row?.url),chord=normalizeChord(row?.chord);
 if(!url||!chord)return [];
 return [{id:typeof row.id==='string'&&row.id.length<80?row.id:'entry-'+index,url,chord}];
 });
}
export function shortcutMarkup(ico){return `<section class="cx-shortcuts-page"><div class="cx-shortcuts-intro"><span class="overline">UTILITÁRIOS · ATALHOS</span><h1>Abrir Site com Atalho ⌨️</h1><p>Escolha seus sites e as teclas. Um atalho pode abrir quantos sites você quiser, cada um em uma nova aba!</p></div><div class="cx-shortcuts-panel"><form id="cxShortcutForm" class="cx-shortcut-form"><label>Endereço do site<input id="cxShortcutUrl" type="text" inputmode="url" required placeholder="https://exemplo.com" maxlength="2000" autocomplete="url"></label><label>Atalho do teclado<button type="button" id="cxShortcutCapture" class="cx-shortcut-capture" aria-label="Gravar atalho">Clique e pressione as teclas</button><input id="cxShortcutChord" type="hidden"></label><button type="submit" class="button-primary">${ico('plus',16)} Adicionar site</button></form><p class="cx-shortcut-help" id="cxShortcutHelp" role="status">Os atalhos funcionam enquanto uma página comum estiver em foco. Algumas combinações já pertencem ao navegador e não podem ser usadas aqui.</p><div id="cxShortcutList" class="cx-shortcuts-list" aria-live="polite"></div></div></section>`;}
let abort=null;
export function stopShortcutEditor(){abort?.abort();abort=null;}
export function bindShortcutEditor(){stopShortcutEditor();const root=document.querySelector('.cx-shortcuts-page');if(!root)return;
 abort=new AbortController();const {signal}=abort;const list=root.querySelector('#cxShortcutList'),form=root.querySelector('#cxShortcutForm'),url=root.querySelector('#cxShortcutUrl'),chord=root.querySelector('#cxShortcutChord'),capture=root.querySelector('#cxShortcutCapture'),help=root.querySelector('#cxShortcutHelp');
 let entries=[];let recording=false;
 const draw=()=>{const counts={};entries.forEach(x=>counts[x.chord]=(counts[x.chord]||0)+1);
 list.replaceChildren();if(!entries.length){const empty=document.createElement('p');empty.className='cx-shortcut-empty';empty.textContent='Nenhum site por aqui ainda. Adicione seu primeiro atalho!';list.append(empty);return;}
 entries.forEach(row=>{const item=document.createElement('div');item.className='cx-shortcut-item';const info=document.createElement('div');info.className='cx-shortcut-item-info';const strong=document.createElement('strong');strong.textContent=row.url;const small=document.createElement('small');small.textContent=row.chord;info.append(strong,small);if(counts[row.chord]>1){const notice=document.createElement('span');notice.className='cx-shortcut-duplicate';notice.title='Este atalho abre mais de um site';notice.textContent='⚠ Atalho compartilhado';info.append(notice);}const remove=document.createElement('button');remove.type='button';remove.className='button-outline';remove.textContent='Remover';remove.addEventListener('click',()=>{entries=entries.filter(x=>x.id!==row.id);save();},{signal});item.append(info,remove);list.append(item);});};
 const save=()=>chrome.storage.local.set({[SHORTCUT_KEY]:entries}).then(draw).catch(()=>{help.textContent='Não conseguimos salvar os atalhos. Tente novamente.';});
 chrome.storage.local.get(SHORTCUT_KEY).then(data=>{if(signal.aborted)return;entries=cleanShortcuts(data[SHORTCUT_KEY]);draw();}).catch(()=>{});
 capture.addEventListener('click',()=>{recording=true;capture.textContent='Pressione a combinação…';capture.classList.add('recording');capture.focus();},{signal});
 capture.addEventListener('keydown',e=>{if(!recording)return;e.preventDefault();e.stopPropagation();if(e.key==='Escape'){recording=false;capture.textContent=chord.value||'Clique e pressione as teclas';capture.classList.remove('recording');return;}const value=chordFromEvent(e);if(!value)return;chord.value=value;capture.textContent=value;recording=false;capture.classList.remove('recording');},{signal});
 form.addEventListener('submit',e=>{e.preventDefault();const safe=safeSiteUrl(url.value),keys=normalizeChord(chord.value);if(!safe||!keys){help.textContent='Escolha um endereço HTTP(S) válido e uma combinação com Ctrl, Alt, Shift ou Command.';return;}if(entries.length>=MAX_SHORTCUTS){help.textContent='O limite é de 50 sites por enquanto.';return;}entries.push({id:crypto.randomUUID(),url:safe,chord:keys});save();url.value='';chord.value='';capture.textContent='Clique e pressione as teclas';help.textContent='Site adicionado! Se houver outro com a mesma combinação, os dois serão abertos.';},{signal});
}

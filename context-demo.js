/* Caixota 0.3.0 — contextual interface prototype.
   Inspired by the selection/image launch sequence of Caixota 0.2.11.
   Demo only: no file access, OCR, translation, network calls or page changes. */
(() => {
  'use strict';
  if (window.__caixotaLabContextDemo) return;
  window.__caixotaLabContextDemo = true;

  const HOST_ID = 'caixota-lab-context-032';
  const MAX_SELECTION = 2000;
  const MIN_IMAGE_SIZE = 28;
  const path = chrome.runtime.getURL;
  const clamp = (n, low, high) => Math.max(low, Math.min(n, high));
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g,
    c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const glyph = (name, size=18) => {
    const paths = {
      close:'<path d="M18 6 6 18M6 6l12 12"/>',
      arrow:'<path d="m9 18 6-6-6-6"/>',
      left:'<path d="m15 18-6-6 6-6"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
      star:'<path d="m12 3 2.9 6 6.6.9-4.7 4.6 1.1 6.5L12 18l-5.9 3 1.1-6.5-4.7-4.6 6.6-.9z"/>',
      translate:'<path d="M3 5h12M9 3v2m3 0c-.4 5-3 8-7 10m1-7c.5 2.6 2.4 4.5 5 6M14 12l5 9m-7 0 5-9 5 9"/>',
      book:'<path d="M4 5c4-2 7-2 8 0 1-2 4-2 8 0v14c-4-2-7-2-8 0-1-2-4-2-8 0zM12 5v14"/>',
      coin:'<ellipse cx="12" cy="12" rx="9" ry="9"/><path d="M14 8c-1-1-5-1-5 1 0 3 6 2 6 5 0 2-4 3-6 1m3-9v12"/>',
      ruler:'<path d="m5 21 16-16-4-4L1 17l4 4ZM8 14l2 2m1-5 2 2m1-5 2 2"/>',
      image:'<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1"/><path d="m3 17 5-5 4 4 3-3 6 6"/>',
      scan:'<path d="M5 3H3v5m16-5h2v5M3 16v5h5m13-5v5h-5M7 12h10m-7 3h4"/>',
      file:'<path d="M7 3h7l5 5v13H7zM14 3v6h5M9 13h7M9 17h7"/>',
      info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
      check:'<path d="m5 12 5 5L20 7"/>',
      copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
      spark:'<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z"/>'
    };
    return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.spark}</svg>`;
  };
  const toolSets = {
    text:[
      {id:'translate',name:'Tradutor',desc:'Traduza para o idioma definido nas configurações',icon:'translate',online:true},
      {id:'dictionary',name:'Dicionário',desc:'Consulte significados e classes gramaticais',icon:'book',online:true},
      {id:'currency',name:'Conversor de Moedas',desc:'Converta símbolos e valores de moedas',icon:'coin',online:true},
      {id:'units',name:'Conversor de Unidades',desc:'Converta medidas com precisão',icon:'ruler',online:false},
    ],
    image:[
      {id:'qr',name:'Ler QR Code',desc:'Identifique códigos em imagens',icon:'scan',online:false},
      {id:'ocr',name:'Extrair Texto',desc:'Reconheça texto presente na imagem',icon:'file',online:true},
      {id:'image-info',name:'Informações',desc:'Veja dimensões e propriedades',icon:'info',online:false},
      {id:'image-convert',name:'Converter Imagem',desc:'Escolha um novo formato',icon:'image',online:false},
    ]
  };
  let theme='oled', host, shadow, trigger, overlay, uiSettings={};
  let mode='text', selected='', anchor=null, stage='closed', activeTool=null;
  let favorites=new Set(), selectionTimer=0;

  function initHost() {
    if(host?.isConnected) return;
    host=document.createElement('div');
    host.id=HOST_ID;
    host.setAttribute('aria-label','Caixota — demonstração contextual');
    shadow=host.attachShadow({mode:'open'});
    const sheet=document.createElement('link');
    sheet.rel='stylesheet'; sheet.href=chrome.runtime.getURL('context-demo.css');
    shadow.appendChild(sheet);
    const frame=document.createElement('div');frame.className='lab-context-frame';
    shadow.appendChild(frame);
    document.documentElement.appendChild(host);
    host.dataset.theme=theme;
    host.dataset.quality=uiSettings.quality||'auto';
    host.dataset.effects=uiSettings.effects===false?'off':'on';
    host.style.setProperty('--lab-font',({system:'system-ui,sans-serif',pixel:'Consolas,monospace',georgia:'Georgia,serif',trebuchet:'Trebuchet MS,sans-serif',manrope:'Manrope,sans-serif'}[uiSettings.font]||'system-ui,sans-serif'));
  }
  function frame(){return shadow?.querySelector('.lab-context-frame');}
  function clear(){stage='closed';activeTool=null;host?.remove();host=null;shadow=null;trigger=null;overlay=null;}
  function selectText() {
    const sel=window.getSelection();
    if(!sel || sel.rangeCount===0)return null;
    const value=sel.toString().trim();
    if(!value || value.length>MAX_SELECTION)return null;
    const rect=sel.getRangeAt(0).getBoundingClientRect();
    if(!rect || !(rect.width>0||rect.height>0))return null;
    return {value,rect};
  }
  function showLauncher(nextMode,nextValue,rect){
    mode=nextMode;selected=String(nextValue||'');anchor=rect;
    stage='launcher';activeTool=null;
    initHost();
    host.dataset.theme=theme;
    const f=frame();
    f.innerHTML=`<button type="button" class="lab-quick" aria-label="Abrir as ferramentas da Caixota">
      <span class="lab-quick-icon"><img alt="" src="${chrome.runtime.getURL('icons/icon32.png')}"></span>
      <span class="lab-quick-label"><strong>Caixota</strong><small>${mode==='text'?'Texto selecionado':'Imagem selecionada'}</small></span>
      ${glyph('arrow',16)}
    </button>`;
    trigger=f.querySelector('.lab-quick');
    trigger.addEventListener('pointerdown',e=>e.stopPropagation());
    trigger.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showMenu();});
    requestAnimationFrame(()=>{
      if(stage!=='launcher'||!trigger)return;
      const width=trigger.getBoundingClientRect().width;
      const height=trigger.getBoundingClientRect().height;
      const x=clamp((rect.left+rect.right)/2-width/2,12,Math.max(12,innerWidth-width-12));
      const preferred=rect.top-height-12;
      const y=preferred>=12?preferred:clamp(rect.bottom+12,12,innerHeight-height-12);
      trigger.style.left=`${Math.round(x)}px`;
      trigger.style.top=`${Math.round(y)}px`;
    });
  }
  function renderTools(items){
    const first=items.slice(0,2), second=items.slice(2);
    const section=(label,list)=>list.length?`<section class="lab-group"><div class="lab-group-heading"><span>${label}</span><span class="lab-group-count">${list.length}</span></div>${list.map(t=>`<div class="lab-tool-row"><button type="button" class="lab-tool" data-open-tool="${t.id}"><span class="lab-tool-icon">${glyph(t.icon,18)}</span><span class="lab-tool-copy"><strong>${t.name}</strong><small>${t.desc}</small></span><span class="lab-network ${t.online?'online':'offline'}">${t.online?'Internet':'Offline'}</span></button><button class="lab-favorite ${favorites.has(t.id)?'selected':''}" data-fav="${t.id}" type="button" aria-label="${favorites.has(t.id)?'Remover dos favoritos':'Favoritar'}: ${t.name}" aria-pressed="${favorites.has(t.id)}">${glyph('star',16)}</button></div>`).join('')}</section>`:'';
    return section('Recentes',first)+section('Outras ferramentas',second);
  }
  function menuMarkup(){
    const isText=mode==='text';
    return `<div class="lab-backdrop" data-dismiss="1"></div><section class="lab-panel" role="dialog" aria-modal="true" aria-label="Ferramentas Caixota">
      <header class="lab-panel-header"><span class="lab-panel-mark"><img alt="" src="${chrome.runtime.getURL('icons/icon32.png')}"></span><span class="lab-panel-title"><small>CAIXOTA <span>· DESIGN LAB</span></small><strong>${isText?'Texto selecionado':'Imagem selecionada'}</strong><em>${isText?'“'+escapeHTML(selected.slice(0,70))+(selected.length>70?'…':'')+'”':'Prévia visual, sem processar a imagem'}</em></span><button type="button" class="lab-close" data-close="1" aria-label="Fechar popup">${glyph('close',17)}</button></header>
      <div class="lab-search">${glyph('search',18)}<input type="search" placeholder="Buscar nas ferramentas de ${isText?'texto':'imagem'}" aria-label="Buscar ferramentas" autocomplete="off"><kbd>/</kbd></div>
      <div class="lab-tool-list" id="labToolList">${renderTools(toolSets[mode])}</div>
      <footer class="lab-footer"><span id="labCount">${toolSets[mode].length} ferramentas disponíveis</span><div><kbd>↑↓</kbd> navega <kbd>Esc</kbd> fecha</div></footer>
    </section>`;
  }
  function resultMarkup(){
    const tool=toolSets[mode].find(t=>t.id===activeTool);
    return `<div class="lab-backdrop" data-dismiss="1"></div><section class="lab-panel lab-result" role="dialog" aria-modal="true" aria-label="Prévia da ferramenta ${tool.name}">
      <header class="lab-result-header"><span class="lab-panel-mark">${glyph(tool.icon,20)}</span><span><small>CAIXOTA LAB · PRÉVIA</small><strong>${tool.name}</strong></span><button class="lab-close" data-close="1" type="button" aria-label="Fechar popup">${glyph('close',17)}</button></header>
      <div class="lab-result-content"><span class="lab-result-eyebrow">INTERFACE DEMONSTRATIVA</span><div class="lab-result-symbol">${glyph(tool.icon,33)}</div><p class="lab-result-source">${mode==='text'?escapeHTML(selected.slice(0,140)):'Imagem selecionada para demonstração'}</p><div class="lab-result-callout"><strong>Prévia da ferramenta</strong><p>Os botões, as transições e o layout podem ser testados. Esta versão não consulta APIs e não processa o conteúdo.</p></div><button class="lab-primary-action" type="button" data-demo="1">${glyph('spark',16)} Experimentar interação</button></div>
      <footer class="lab-footer"><button class="lab-back" type="button" data-back="1">${glyph('left',15)} Ferramentas</button><span>Demo offline</span></footer>
    </section>`;
  }
  function showMenu(){
    stage='menu';initHost();host.dataset.theme=theme;
    const f=frame();f.innerHTML=menuMarkup();
    f.querySelector('[data-close]').addEventListener('click',clear);
    f.querySelector('[data-dismiss]').addEventListener('click',clear);
    f.querySelector('input').addEventListener('input',e=>filterTools(e.target.value));
    f.querySelector('.lab-tool-list').addEventListener('click',onToolListClick);
    requestAnimationFrame(()=>f.querySelector('.lab-search input')?.focus());
  }
  function filterTools(query){
    const q=String(query||'').toLocaleLowerCase('pt-BR').trim();
    const list=toolSets[mode].filter(t=>`${t.name} ${t.desc}`.toLocaleLowerCase('pt-BR').includes(q));
    const listElement=frame().querySelector('#labToolList');
    if(listElement)listElement.innerHTML=renderTools(list)||'<div class="lab-empty">Nenhuma ferramenta encontrada.</div>';
    const count=frame().querySelector('#labCount');if(count)count.textContent=`${list.length} ferramentas disponíveis`;
  }
  function onToolListClick(e){
    const star=e.target.closest('[data-fav]');
    if(star){const id=star.dataset.fav;favorites.has(id)?favorites.delete(id):favorites.add(id);
      const search=frame().querySelector('.lab-search input');filterTools(search?.value||'');return;}
    const button=e.target.closest('[data-open-tool]');if(button){activeTool=button.dataset.openTool;showResult();}
  }
  function showResult(){stage='result';frame().innerHTML=resultMarkup();
    frame().querySelector('[data-close]').addEventListener('click',clear);
    frame().querySelector('[data-dismiss]').addEventListener('click',clear);
    frame().querySelector('[data-back]').addEventListener('click',showMenu);
    frame().querySelector('[data-demo]').addEventListener('click',e=>{
      const btn=e.currentTarget;btn.innerHTML=`${glyph('check',16)} Interação demonstrada`;
      btn.disabled=true;setTimeout(()=>{if(btn.isConnected){btn.innerHTML=`${glyph('spark',16)} Experimentar interação`;btn.disabled=false;}},1100);
    });
  }
  function onSelectionChange(e){
    if(stage==='menu'||stage==='result')return;
    if(e?.composedPath?.().includes(host))return;
    clearTimeout(selectionTimer);
    selectionTimer=setTimeout(()=>{
      if(stage==='menu'||stage==='result')return;
      const selection=selectText();
      if(!selection){if(stage==='launcher')clear();return;}
      showLauncher('text',selection.value,selection.rect);
    },35);
  }
  function onImageClick(e){
    if(stage==='menu'||stage==='result')return;
    if(e.composedPath?.().includes(host))return;
    const image=e.target?.closest?.('img');
    if(!image || image.naturalWidth<MIN_IMAGE_SIZE || image.naturalHeight<MIN_IMAGE_SIZE)return;
    const rect=image.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    clearTimeout(selectionTimer);
    const name=(image.alt||image.currentSrc?.split('/').pop()||'Imagem da página').slice(0,110);
    const x=clamp(e.clientX,rect.left,rect.right), y=clamp(e.clientY,rect.top,rect.bottom);
    showLauncher('image',name,{left:x-8,right:x+8,top:y-8,bottom:y+8});
  }
  function outsidePointer(e){
    if(!host||stage!=='launcher')return;
    if(e.composedPath?.().includes(host))return;
    // Click on another part of the document dismisses the quick launcher.
    if(!e.target.closest?.('img'))clear();
  }
  function onKey(e){
    if(!host)return;
    if(e.key==='Escape'){clear();return;}
    if(stage!=='menu')return;
    if(e.key==='ArrowDown'||e.key==='ArrowUp'){
      const buttons=[...frame().querySelectorAll('.lab-tool:not([disabled])')];
      if(!buttons.length)return;
      e.preventDefault();let i=buttons.indexOf(shadow.activeElement);
      i=e.key==='ArrowDown'?(i+1)%buttons.length:(i<1?buttons.length-1:i-1);
      buttons[i].focus();
    }
    if(e.key==='/' && shadow.activeElement?.tagName!=='INPUT'){
      e.preventDefault();frame().querySelector('.lab-search input')?.focus();
    }
  }
  const deriveTheme=preset=>['oled','glass-dark','glass-light','warm','aero','retro-90','cyberpunk','pastel','matrix'].includes(preset)?preset:'oled';
  chrome.storage.local.get(['caixotaUiV3'],data=>{
    uiSettings=data.caixotaUiV3||{};theme=deriveTheme(uiSettings.theme);if(host){host.dataset.theme=theme;host.dataset.quality=uiSettings.quality||'auto';host.dataset.effects=uiSettings.effects===false?'off':'on';}
    host.dataset.quality=uiSettings.quality||'auto';
    host.dataset.effects=uiSettings.effects===false?'off':'on';
    host.style.setProperty('--lab-font',({system:'system-ui,sans-serif',pixel:'Consolas,monospace',georgia:'Georgia,serif',trebuchet:'Trebuchet MS,sans-serif',manrope:'Manrope,sans-serif'}[uiSettings.font]||'system-ui,sans-serif'));
  });
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==='local' && changes.caixotaUiV3){
      uiSettings=changes.caixotaUiV3.newValue||{};theme=deriveTheme(uiSettings.theme);
      if(host){host.dataset.theme=theme;host.dataset.quality=uiSettings.quality||'auto';host.dataset.effects=uiSettings.effects===false?'off':'on';}
    }
  });
  document.addEventListener('mouseup',onSelectionChange,true);
  document.addEventListener('keyup',e=>{if(['Shift','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))onSelectionChange(e);},true);
  document.addEventListener('click',onImageClick,true);
  document.addEventListener('pointerdown',outsidePointer,true);
  document.addEventListener('keydown',onKey,true);
  window.addEventListener('resize',()=>{if(stage==='launcher')clear();},{passive:true});
  window.addEventListener('scroll',()=>{if(stage==='launcher')clear();},{passive:true,capture:true});
})();

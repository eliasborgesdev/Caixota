// Functional workbench adapter. The parent shell and this document share the
// same extension origin. No executable content from external module packages.
(() => {
  document.body.classList.add('cx-workbench');
  let pending=null;
  let activeLanguage='pt';
  let toolObserver=null,toolMutationObserver=null,resizeHandle=0,activeToolId=null,lastContentHeight=0;
  const measurement = import('./assets/workbench-size.mjs');
  const sendContentHeight=async()=>{
    resizeHandle=0;
    const toolId=activeToolId;
    if(!toolId)return;
    try{
      const {measureWorkbenchHeight}=await measurement;
      if(toolId!==activeToolId)return;
      const height=measureWorkbenchHeight(document);
      if(!height || Math.abs(lastContentHeight-height)<2)return;
      lastContentHeight=height;
      parent.postMessage({source:'caixota-workbench',type:'content-height',toolId,height},location.origin);
    }catch(error){console.warn('Caixota: não foi possível ajustar a altura da ferramenta.',error);}
  };
  const scheduleResize=()=>{if(!resizeHandle)resizeHandle=requestAnimationFrame(sendContentHeight);};
  function updateToolLayout(toolId){
    toolObserver?.disconnect();toolMutationObserver?.disconnect();
    activeToolId=toolId;lastContentHeight=0;
    document.body.classList.toggle('cx-wheel-direct',toolId==='generator-wheel');
    const page=document.querySelector('.app-main');if(!page)return;
    toolObserver=new ResizeObserver(scheduleResize);
    toolObserver.observe(page);
    for(const item of page.querySelectorAll('.is-active,.local-tool-screen,.pdf-tool-screen,.video-tool-screen,.converter-tool-screen,.generator-data-screen')){
      if(item.getClientRects().length)toolObserver.observe(item);
    }
    toolMutationObserver=new MutationObserver(scheduleResize);
    toolMutationObserver.observe(page,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style','hidden']});
    scheduleResize();setTimeout(scheduleResize,160);setTimeout(scheduleResize,650);
  }
  async function translateTool(){
    try{const mod=await import('./assets/shell-locale.mjs');mod.translateShell(document.querySelector('.app-main')||document.body,activeLanguage);}catch(error){console.warn('Caixota: não foi possível traduzir estes rótulos.',error);}
  }
  async function open(category,toolId){
    if(!category||!toolId)return;
    // Native processors listen for caixota:open-direct-tool. Keep them unmodified.
    document.querySelector('[data-nav-view="tools"]')?.click();
    document.querySelector(`[data-tools-view="${CSS.escape(category)}"]`)?.click();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    document.dispatchEvent(new CustomEvent('caixota:open-direct-tool',{detail:{category,toolId}}));
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    document.documentElement.dataset.toolLoaded='true';
    await translateTool();
    updateToolLayout(toolId);
    try{parent.postMessage({source:'caixota-workbench',type:'tool-opened',toolId},location.origin);}catch{}
  }
  window.addEventListener('message',e=>{
    if(e.origin!==location.origin||e.source!==parent)return;
    if(e.data?.source!=='caixota-shell')return;
    if(e.data.type==='open-tool'){
      const category=e.data.category,id=e.data.toolId;
      if(typeof category==='string'&&typeof id==='string')open(category,id);
    }
    if(e.data.type==='refresh-theme'){activeLanguage=e.data.language||'pt';const theme=e.data.theme||'oled';document.documentElement.dataset.themeV3=theme;document.body.dataset.themeV3=theme;document.body.dataset.theme=['oled','glass-dark','cyberpunk','matrix'].includes(theme)?'dark':'light';if(typeof e.data.background==='string'&&CSS.supports('color',e.data.background)){document.documentElement.style.setProperty('--cx-workbench-canvas',e.data.background);}const fonts={system:'system-ui, sans-serif',inter:'Inter,system-ui,sans-serif',manrope:'Manrope, Trebuchet MS, sans-serif',trebuchet:'Trebuchet MS, sans-serif',georgia:'Georgia, serif',roboto:'Roboto, Arial, sans-serif',montserrat:'Montserrat, Trebuchet MS, sans-serif',poppins:'Poppins, Trebuchet MS, sans-serif',opensans:'Open Sans, Arial, sans-serif',lato:'Lato, Arial, sans-serif',pixel:'Courier New, monospace'};document.body.style.setProperty('--workbench-font',fonts[e.data.font]||fonts.system);document.body.dataset.quality=e.data.quality||'auto';document.body.dataset.effects=e.data.effects===false?'off':'on';if(e.data.tokens){
 const v=e.data.tokens;for(const [key,value]of Object.entries(v.colors||{}))if(/^[a-z-]+$/.test(key)&&CSS.supports('color',value))document.body.style.setProperty('--host-'+key,value);
 document.body.style.setProperty('--workbench-font',v.font||fonts.system);
 if(v.fontFace){const face=new FontFace(v.fontFace.family,'url('+v.fontFace.url+')');document.fonts.add(face);face.load().catch(()=>{});}
 }scheduleResize();}
  });
  // A locally-generated blob is ready for the user's browser download flow.
  // This does not imply that the OS finished writing the file.
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('a[download]');if(!link||!link.href.startsWith('blob:'))return;
    try{parent.postMessage({source:'caixota-workbench',type:'export-started',filename:String(link.download||'Arquivo').slice(0,150)},location.origin);}catch{}
  },true);
  window.addEventListener('load',()=>{
    let tries=0;const announce=()=>{
      if(window.__caixotaPanelReady || tries++>=80){
        parent.postMessage({source:'caixota-workbench',type:'ready',initialized:!!window.__caixotaPanelReady},location.origin);return;
      }
      setTimeout(announce,50);
    };announce();
  });
})();

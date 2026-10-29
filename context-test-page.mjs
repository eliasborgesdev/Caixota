import {translateShell,languageCode} from './assets/shell-locale.mjs';
const THEMES=new Set(['glass-light','glass-dark','oled','warm','aero','retro-90','cyberpunk','pastel','matrix']);
const FONTS={system:'system-ui, sans-serif',inter:'Inter,system-ui,sans-serif',manrope:'Manrope,system-ui,sans-serif',trebuchet:'Trebuchet MS,sans-serif',georgia:'Georgia,serif',roboto:'Roboto,Arial,sans-serif',montserrat:'Montserrat,Arial,sans-serif',poppins:'Poppins,Arial,sans-serif',opensans:'Open Sans,Arial,sans-serif',lato:'Lato,Arial,sans-serif',pixel:'Consolas,monospace'};
async function syncPage(){
 try{
  const prefs=await chrome.storage.local.get(['caixotaUiV3','tremSettings']);
  const ui=prefs.caixotaUiV3||{},settings=prefs.tremSettings||{};
  const preset=THEMES.has(ui.theme)?ui.theme:'glass-light';
  const root=document.documentElement;
  root.dataset.preset=preset;root.dataset.quality=ui.quality||'auto';root.dataset.effects=ui.effects===false?'off':'on';
  root.style.setProperty('--font',FONTS[ui.font]||FONTS.system);
  const language=languageCode(settings.interfaceLanguage||'auto');
  // Source text is static in the document, so translation is performed only once.
  if(root.dataset.translatedLang!==language){
   if(!root.dataset.translatedLang){translateShell(document.body,language);root.dataset.translatedLang=language;}
   else window.location.reload();
  }
 }catch(error){console.warn('Caixota: preferências locais indisponíveis para o teste.',error);}
}
chrome.storage.onChanged.addListener((changes,area)=>{
 if(area==='local'&&(changes.caixotaUiV3||changes.tremSettings))syncPage();
});
syncPage();

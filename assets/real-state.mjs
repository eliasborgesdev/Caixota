// Bridges the redesigned shell to existing Caixota storage. Never replaces the
// original tremSettings object, including legacy theme presets and saved fonts.
export const UI_KEY='caixotaUiV3';
export const SETTINGS_KEY='tremSettings';
export const FAVORITE_KEYS=Object.freeze({text:'favorites',images:'imageFavorites',video:'videoFavorites',pdf:'pdfFavorites',generators:'generatorFavorites',utilities:'utilityFavorites',sorteio:'sorteioFavorites',games:'gameFavorites',modules:'moduleFavorites'});
export const THEMES=(['glass-light','glass-dark','oled','warm','aero','retro-90','cyberpunk','pastel','matrix','psx']);
export const FONTS=(['system','inter','manrope','trebuchet','georgia','roboto','montserrat','poppins','opensans','lato','pixel','vhs']);
export const QUALITY=Object.freeze(['auto','full','eco']);
export const DEFAULT_TOPBAR=Object.freeze({search:true,performance:true,language:true,notifications:true,sound:true,theme:true,profile:true});
export const DEFAULT_UI=Object.freeze({theme:'glass-light',font:'system',quality:'auto',effects:true,sound:true,volume:25,shortcut:'Ctrl+Period',organizeSidebar:true,topbar:DEFAULT_TOPBAR});
export const LEGACY_THEME={ 'glass-light':'light','glass-dark':'dark',oled:'oled',warm:'light',aero:'light','retro-90':'light',cyberpunk:'dark',pastel:'light',matrix:'dark',psx:'dark'};
export const CATEGORY_TO_USAGE={text:'text',images:'image',video:'video',pdf:'pdf',generators:'generator',utilities:'utilities',sorteio:'sorteio',games:'games'};
const safeRead=()=>chrome.storage.local.get([UI_KEY,SETTINGS_KEY,'tremUsage','caixotaLocalProfile']);
export function normalizeUi(input={}){return {
 theme:THEMES.includes(input?.theme)?input.theme:DEFAULT_UI.theme,
 font:FONTS.includes(input?.font)?input.font:DEFAULT_UI.font,
 quality:QUALITY.includes(input?.quality)?input.quality:DEFAULT_UI.quality,
 moduleSound:typeof input?.moduleSound==='string'?input.moduleSound:'',
 effects:input?.effects!==false,
 sound:input?.sound!==false,
 volume:Number.isFinite(Number(input?.volume))?Math.max(0,Math.min(100,Math.round(Number(input.volume)))):25,
 shortcut:typeof input?.shortcut==='string'&&input.shortcut.length<45?input.shortcut:DEFAULT_UI.shortcut,
 organizeSidebar:input?.organizeSidebar!==false,
 topbar:Object.fromEntries(Object.keys(DEFAULT_TOPBAR).map(key=>[key,input?.topbar?.[key]!==false]))
};}
export async function loadSnapshot(){let data=await safeRead();return {
 ui:normalizeUi(data[UI_KEY]), settings:data[SETTINGS_KEY]||{}, usage:data.tremUsage||{}, profile:data.caixotaLocalProfile||{}
};}
export async function updateUi(patch){
 const data=await chrome.storage.local.get([UI_KEY,SETTINGS_KEY]);
 const ui=normalizeUi({...data[UI_KEY],...patch});
 const old=data[SETTINGS_KEY]||{};
 const fontPatch=Object.prototype.hasOwnProperty.call(patch,'font')?{fontFamily:({system:'default',inter:'default',manrope:'default',trebuchet:'trebuchet',georgia:'georgia',roboto:'default',montserrat:'default',poppins:'default',opensans:'default',lato:'default',pixel:'courier'}[ui.font]||'default')}:{};
 await chrome.storage.local.set({[UI_KEY]:ui,[SETTINGS_KEY]:{...old,theme:LEGACY_THEME[ui.theme]||'dark',visualEffectsEnabled:ui.effects,...fontPatch}});
 return ui;
}
export async function updateSetting(key,value){let data=await chrome.storage.local.get(SETTINGS_KEY);await chrome.storage.local.set({[SETTINGS_KEY]:{...(data[SETTINGS_KEY]||{}),[key]:value}});}
export async function toggleFavorite(category,id){
 const key=FAVORITE_KEYS[category]||(String(id).startsWith('mod-')?'moduleFavorites':null);if(!key)return [];
 const data=await chrome.storage.local.get(SETTINGS_KEY);const old=data[SETTINGS_KEY]||{};
 const list=new Set(Array.isArray(old[key])?old[key]:[]);
 // Migrar a roleta dos favoritos de Geradores e Utilitários para Sorteio.
 if(category==='sorteio'&&id==='generator-wheel'){
  const legacy=new Set(Array.isArray(old.generatorFavorites)?old.generatorFavorites:[]);
  const oldUtil=new Set(Array.isArray(old.utilityFavorites)?old.utilityFavorites:[]);const existed=list.has(id)||legacy.has(id)||oldUtil.has(id);
  legacy.delete(id);oldUtil.delete(id);if(existed)list.delete(id);else list.add(id);
  await chrome.storage.local.set({[SETTINGS_KEY]:{...old,generatorFavorites:[...legacy],utilityFavorites:[...oldUtil],[key]:[...list]}});
  return [...list];
 }
 if(list.has(id))list.delete(id);else list.add(id);
 await chrome.storage.local.set({[SETTINGS_KEY]:{...old,[key]:[...list]}});
 return [...list];
}
export async function toggleContext(settingId,currentEnabled=true){
 const data=await chrome.storage.local.get(SETTINGS_KEY);const old=data[SETTINGS_KEY]||{};
 // Caller supplies the actual effective state, including default-off tools.
 const next=!currentEnabled;
 await chrome.storage.local.set({[SETTINGS_KEY]:{...old,[settingId]:next}});
 return next;
}
export function favoritesFromSettings(settings={}){
 const out=new Set();for(const key of Object.values(FAVORITE_KEYS)){
  const values=settings[key];if(Array.isArray(values))values.forEach(id=>out.add(id));
 }return out;
}
export function togglesFromSettings(catalogs,settings={}){
 const out=new Set();for(const group of Object.values(catalogs))for(const tool of group)if(tool.settingId&&settings[tool.settingId]!==false)out.add(tool.id);
 return out;
}
export function recentsFromUsage(usage={}){
 if(Array.isArray(usage.timeline))return [...new Set([...usage.timeline].sort((a,b)=>(b.at||0)-(a.at||0)).map(x=>x.id))].slice(0,12);
 return Object.values(usage.recent||{}).flat().slice(0,12);
}
export async function recordShellUse(category,id){
 // The original engine records actual executions. Do not invent usage when opening a tool.
 // An entry may be added here only if we later expose an explicit launch event from the engine.
 return {category,id};
}

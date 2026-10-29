import {installUiAudio,setUiSoundVolume} from './assets/ux-sounds.mjs';
import {listModules} from './assets/module-store.mjs';
import {dataUrl} from './assets/module-host.mjs';
import {keyOf} from './assets/module-package.mjs';
let enabled=true,theme='oled';
async function sync(){
 const prefs=(await chrome.storage.local.get('caixotaUiV3')).caixotaUiV3||{};
 enabled=prefs.sound!==false;if(!enabled)window.__cxModuleAudio?.pause();theme=prefs.theme||'oled';setUiSoundVolume(prefs.volume??25);
 window.__caixotaModuleClickSound='';
 if(prefs.moduleSound)for(const m of await listModules())if(m.enabled)for(const x of m.contents)if(x.type==='sound'&&m.selected.includes(x.id)&&keyOf(m.id,x.id)===prefs.moduleSound)window.__caixotaModuleClickSound=dataUrl(m.assets[x.file],x.file);
}
sync().catch(()=>{});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&(changes.caixotaUiV3||changes.caixotaModulesRevision040))sync().catch(()=>{});});
installUiAudio({enabled:()=>enabled,theme:()=>theme});

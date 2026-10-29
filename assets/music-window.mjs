import {musicMarkup,bindMusic,acceptMusicTransfer} from './music-player.mjs';
import {loadSnapshot} from './real-state.mjs';
import {languageCode} from './shell-locale.mjs';
import {configureModules,moduleAppearance,moduleBase} from './module-host.mjs';
import {listModules,MODULE_REVISION_KEY} from './module-store.mjs';
import {installUiAudio,setUiSoundVolume} from './ux-sounds.mjs';
let ui;
async function render(){configureModules(await listModules());const snapshot=await loadSnapshot();ui=snapshot.ui;const root=document.documentElement;root.dataset.preset=ui.theme;root.dataset.font=ui.font;root.dataset.theme=moduleBase(ui.theme)||(['oled','glass-dark','cyberpunk','matrix','psx'].includes(ui.theme)?'dark':'light');root.dataset.effects=ui.effects?'on':'off';root.dataset.quality=ui.quality;moduleAppearance(ui);setUiSoundVolume(ui.volume);document.getElementById('miniPlayer').innerHTML=musicMarkup();await bindMusic(ui,languageCode(snapshot.settings.interfaceLanguage));}
await render();await acceptMusicTransfer();
installUiAudio({enabled:()=>ui.sound!==false,theme:()=>ui.theme});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&(changes.caixotaUiV3||changes.tremSettings||changes[MODULE_REVISION_KEY]))render().catch(()=>{});});

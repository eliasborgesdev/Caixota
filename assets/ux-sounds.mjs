/* Efeitos sonoros locais: nenhuma gravação remota, baixa amplitude,
   envelope suave e bloqueio de repetição para evitar ruído em hover rápido. */
let ctx=null;
let lastHover=0,lastClick=0;
let volumePercent=25;
export function setUiSoundVolume(value){volumePercent=Math.max(0,Math.min(100,Number(value)||0));if(window.__cxModuleAudio)window.__cxModuleAudio.volume=volumePercent/100;}
const THEMES={
 'glass-light':{hover:[560,610],click:[470,670],wave:'sine'},
 'glass-dark':{hover:[420,520],click:[360,570],wave:'sine'},
 oled:{hover:[345,380],click:[320,470],wave:'sine'},
 warm:{hover:[480,530],click:[410,610],wave:'sine'},
 aero:{hover:[660,930],click:[520,784],wave:'sine'},
 'retro-90':{hover:[340,420],click:[300,450],wave:'square'},
 cyberpunk:{hover:[230,410],click:[220,560],wave:'triangle'},
 pastel:{hover:[675,790],click:[550,820],wave:'sine'},
 psx:{hover:[196,261.63],click:[130.81,392],wave:'triangle'},
 matrix:{hover:[210,315],click:[185,440],wave:'triangle'}
};
const ramp=(param,time,value)=>param.exponentialRampToValueAtTime(Math.max(value,.00001),time);
function voice(freq,time,duration,shape,volume){const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
 osc.type=shape;osc.frequency.setValueAtTime(freq,time);osc.frequency.exponentialRampToValueAtTime(freq*.985,time+duration);
 filter.type='lowpass';filter.frequency.value=shape==='square'?940:2100;
 osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
 gain.gain.setValueAtTime(.00001,time);ramp(gain.gain,time+.014,volume);ramp(gain.gain,time+duration,.00001);
 osc.start(time);osc.stop(time+duration+.02);
}
function play(kind,theme){try{
 if(kind==='click'&&window.__caixotaModuleClickSound){if(!volumePercent)return;window.__cxModuleAudio?.pause();const a=new Audio(window.__caixotaModuleClickSound);window.__cxModuleAudio=a;a.volume=Math.min(1,volumePercent/100);a.play().then(()=>setTimeout(()=>a.pause(),1000)).catch(()=>{});return;}
 const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
 if(!ctx)ctx=new AudioContext();if(ctx.state==='suspended'){ctx.resume().then(()=>{if(ctx?.state==='running')play(kind,theme);}).catch(()=>{});return;}
 const preset=THEMES[theme]||THEMES['glass-light'];const now=ctx.currentTime;const notes=preset[kind]||preset.click;
 const volume=(kind==='hover'?.0055:.017)*(volumePercent/25);
 voice(notes[0],now,kind==='hover'?.07:.13,preset.wave,volume);
 if(kind==='click')voice(notes[1],now+.048,.14,preset.wave,volume*.65);
 }catch{/* Audio is optional; never break a button. */}}
export function installUiAudio({enabled,theme,toggleSelector='[data-action="sound"]'}){
 const clickable='button,[role="button"],.category-card,.tool-card .tool-open';
 document.addEventListener('pointerover',e=>{
  if(!enabled()||e.pointerType==='touch')return;const node=e.target.closest(clickable);if(!node||node.disabled||node.contains(e.relatedTarget))return;
  const now=performance.now();if(now-lastHover<150)return;lastHover=now;play('hover',theme());
 },{passive:true});
 document.addEventListener('click',e=>{
  if(!enabled()||e.target.closest(toggleSelector)||e.target.closest('[data-folder],[data-donation-celebrate]'))return;
  const node=e.target.closest(clickable);if(!node||node.disabled)return;
  const now=performance.now();if(now-lastClick<75)return;lastClick=now;play('click',theme());
 },{passive:true});
}
export function previewSound(theme){play('click',theme);}

/** Sinal curto de abrir/recolher pastas, sem tocar se a interface estiver muda. */
export function playFolderSound(theme,opening=true){
  play('click',theme);
  if(opening) setTimeout(()=>play('hover',theme),95);
}
/** Pequena sequência para a animação opcional do QR Code. */
export function playDonationSound(theme){
  play('click',theme);
  setTimeout(()=>play('click',theme),155);
  setTimeout(()=>play('hover',theme),320);
}

export function gameCue(kind,ui){if(ui?.sound===false)return;setUiSoundVolume(ui?.volume??25);play('click',ui?.theme||'glass-light');if(kind==='win')setTimeout(()=>{if(ui.sound!==false)play('hover',ui.theme||'glass-light');},140);}

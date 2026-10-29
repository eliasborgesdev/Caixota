// Caixota · Processador de áudio local, sem rede, armazenamento ou gravação.
'use strict';
class LocalTabMixer {
  constructor() { this.channels = new Map(); }
  static safeBoost(input) { return Math.min(200,Math.max(0,Math.round(Number(input)||0))); }
  details(id) {
    const channel = this.channels.get(id);
    return {ok:true,enabled:!!channel,boost:channel?.boost??0};
  }
  async enable(id,streamId,boost) {
    if (this.channels.has(id)) return this.change(id,boost);
    let audio,context;
    try {
      audio=await navigator.mediaDevices.getUserMedia({
        audio:{mandatory:{chromeMediaSource:'tab',chromeMediaSourceId:streamId}},video:false
      });
      context=new AudioContext({latencyHint:'interactive'});
      const input=context.createMediaStreamSource(audio);
      const amplifier=context.createGain();
      const chosen=LocalTabMixer.safeBoost(boost);
      amplifier.gain.value=1+chosen/100;
      input.connect(amplifier);
      amplifier.connect(context.destination);
      const record={audio,context,input,amplifier,boost:chosen};
      this.channels.set(id,record);
      audio.getAudioTracks().forEach(track=>{track.addEventListener('ended',()=>this.disable(id),{once:true});});
      await context.resume();
      return this.details(id);
    } catch(error) {
      audio?.getTracks().forEach(track=>track.stop());
      if(context) await context.close().catch(()=>{});
      return {ok:false,error:`Falha ao iniciar o áudio da aba: ${error.message||String(error)}`};
    }
  }
  change(id,boost) {
    const record=this.channels.get(id);
    if (!record) return {ok:false,error:'A aba ainda não está com o reforço ativado.'};
    record.boost=LocalTabMixer.safeBoost(boost);
    record.amplifier.gain.setTargetAtTime(1+record.boost/100,record.context.currentTime,0.02);
    return this.details(id);
  }
  disable(id) {
    const record=this.channels.get(id);
    if (!record) return this.details(id);
    this.channels.delete(id);
    record.audio.getTracks().forEach(track=>{track.stop();});
    record.input.disconnect();record.amplifier.disconnect();
    record.context.close().catch(()=>{});
    return this.details(id);
  }
}
const mixer=new LocalTabMixer();
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.channel!=='cx-volume-processor')return;
  if(sender.id!==chrome.runtime.id || sender.tab){respond({ok:false,error:'Origem inválida.'});return;}
  const tabId=message.tabId;
  if(!Number.isSafeInteger(tabId)){respond({ok:false,error:'Aba inválida.'});return;}
  if(message.type==='status'){respond(mixer.details(tabId));return;}
  if(message.type==='stop'){respond(mixer.disable(tabId));return;}
  if(message.type==='adjust'){respond(mixer.change(tabId,message.boost));return;}
  if(message.type==='start'){
    mixer.enable(tabId,message.streamId,message.boost)
      .then(respond).catch(error=>respond({ok:false,error:String(error)}));
    return true;
  }
  respond({ok:false,error:'Comando desconhecido.'});
});

// Caixota v0.3.1 — consent-based, bounded network diagnostics.
// No fake metrics. HTTP round-trip latency is NOT ICMP ping.
const ENDPOINT='https://speed.cloudflare.com';
const MAX_DOWN=1024*1024;
const MAX_TOTAL_DOWN=64*1024*1024;
const MAX_TOTAL_UP=16*1024*1024;
const MIN_TEST_MS=15000;
const PHASE_MS=MIN_TEST_MS/2;
const MAX_UP=256*1024;
let active=null;
const number=(n,d=1)=>Number.isFinite(n)?n.toLocaleString(document.documentElement?.lang||'pt-BR',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const q=id=>document.getElementById(id);
const iconSvg=(name)=>name==='down'?'↓':name==='up'?'↑':'◷';
export function speedTestMarkup(icon){return `
 <section class="page-entry cx-speed-heading"><span class="overline">UTILITÁRIOS · REDE</span><div class="page-heading"><div><h1>Teste de Velocidade</h1><p>Descubra como sua conexão está respondendo agora, com uma medição real e limitada.</p></div></div></section>
 <section class="cx-speed-layout">
 <div class="cx-speed-main glass-section"><div class="cx-speed-top"><span class="cx-speed-status"><i id="cxSpeedDot"></i><span id="cxSpeedStatus">Pronto para começar</span></span><span class="cx-speed-provider">${icon('globe',16)} Rede Cloudflare</span></div>
 <div class="cx-speed-gauge"><svg viewBox="0 0 320 205" aria-hidden="true"><defs><linearGradient id="cxGaugePaint" x1="0" x2="1"><stop offset="0%" stop-color="#67c5df"/><stop offset="100%" stop-color="#3e82b4"/></linearGradient></defs><path class="cx-gauge-base" d="M42 166 A118 118 0 0 1 278 166" fill="none" stroke-width="16" stroke-linecap="round"/><path id="cxSpeedArc" d="M42 166 A118 118 0 0 1 278 166" fill="none" stroke="url(#cxGaugePaint)" stroke-width="16" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100"/><g class="cx-gauge-ticks">${Array.from({length:19},(_,i)=>{const a=Math.PI-i*Math.PI/18;const x=160+99*Math.cos(a),y=166-99*Math.sin(a);const x2=160+108*Math.cos(a),y2=166-108*Math.sin(a);return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}"/>`}).join('')}</g></svg><div class="cx-speed-readout"><span id="cxSpeedKind">REDE / MEDIÇÃO</span><strong id="cxSpeedValue">0,0</strong><small id="cxSpeedUnit">Mbps</small></div></div>
 <div class="cx-speed-results"><div><span>${iconSvg('ping')} Latência HTTP</span><strong id="cxSpeedLatency">—</strong><small>ms</small></div><div><span>${iconSvg('down')} Download</span><strong id="cxSpeedDownload">—</strong><small>Mbps</small></div><div><span>${iconSvg('up')} Upload</span><strong id="cxSpeedUpload">—</strong><small>Mbps</small></div></div>
 <div class="cx-speed-actions"><button class="button-primary" id="cxSpeedStart">${icon('activity',19)} Iniciar teste</button><button class="button-outline" id="cxSpeedCancel" disabled>Cancelar</button></div><div class="cx-speed-timeline"><span id="cxSpeedTimer">00:00 / 00:15</span><div class="cx-speed-timeline-track"><i id="cxSpeedTimelineFill"></i></div></div><div class="cx-speed-progress" role="status" aria-live="polite" id="cxSpeedMessage">Teste de cerca de 15 segundos, com amostras reais durante toda a medição.</div></div>
 <aside class="cx-speed-info glass-section"><div class="cx-speed-info-icon">${icon('shield',27)}</div><span class="overline">ANTES DE COMEÇAR</span><h2>Medição com transparência.</h2><p>Este teste coleta amostras ao longo de aproximadamente 15 segundos, realizando requisições limitadas à infraestrutura pública da Cloudflare, usando sua conexão atual.</p><div class="cx-speed-info-row"><strong>Consumo máximo previsto</strong><span>até ~ 80 MB (limites de download e upload)</span></div><div class="cx-speed-info-row"><strong>Precisão</strong><span>Indicativa</span></div><div class="cx-speed-info-row"><strong>IP e conexão</strong><span>Visíveis ao servidor</span></div><div class="cx-speed-info-row"><strong>Arquivos pessoais</strong><span>Nunca enviados</span></div><p class="cx-speed-disclaimer">A latência é uma ida e volta HTTP, não ping ICMP. Os resultados variam com carga de rede, servidor e navegador. A Cloudflare poderá ver seu IP. Se o limite de dados for atingido antes, avisaremos e o teste terminará cedo. Não simulamos medições. Não equivale a um teste com múltiplas conexões simultâneas.</p><div class="cx-speed-offline" id="cxSpeedOffline">${icon('wifi',17)} <span>O estado da conexão será verificado ao iniciar.</span></div></aside>
 </section>`;}
function setText(id,txt){const el=q(id);if(el)el.textContent=txt;}
function setArc(value){const a=q('cxSpeedArc');if(a)a.setAttribute('stroke-dasharray',`${Math.max(0,Math.min(100,Math.log1p(Math.max(0,value))/Math.log1p(300)*100))} 100`);}
function show(value,unit='Mbps',kind='MEDIÇÃO'){setText('cxSpeedValue',number(value));setText('cxSpeedUnit',unit);setText('cxSpeedKind',kind);setArc(unit==='Mbps'?value:0);}
function status(msg,kind='working'){setText('cxSpeedStatus',msg);let dot=q('cxSpeedDot');if(dot)dot.dataset.status=kind;}
async function timedFetch(url,opts={},ms=9000){const control=active?.controller;if(!control)throw Error('Teste cancelado');const timer=setTimeout(()=>control.abort('timeout'),ms);try{return await fetch(url,{...opts,signal:control.signal,cache:'no-store',credentials:'omit'});}finally{clearTimeout(timer);}}
const url=(bytes)=>`${ENDPOINT}/__down?bytes=${bytes}&t=${Date.now()}-${Math.random().toString(36).slice(2)}`;
async function latency(){const samples=[];for(let i=0;i<3;i++){if(!active)throw Error('Cancelado');status(`Latência: amostra ${i+1} de 3`);setText('cxSpeedMessage','Calculando o tempo de resposta do servidor...');const start=performance.now();const response=await timedFetch(url(0),{},7000);if(!response.ok)throw Error(`Servidor respondeu HTTP ${response.status}`);await response.arrayBuffer();samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);const v=samples[1];setText('cxSpeedLatency',number(v,0));show(v,'ms','LATÊNCIA HTTP');return v;}
// Os 15 segundos são um período de AMOSTRAGEM, nunca uma espera após o teste.
// Pausas entre amostras não entram no cálculo de Mbps.
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function download(deadline){
 status('Medindo download');setText('cxSpeedMessage','Recebendo dados reais e atualizando o velocímetro…');let bytes=0,secondsActive=0,samples=0;
 do{
  if(!active)throw new DOMException('Cancelado','AbortError');
  const size=Math.min(MAX_DOWN,MAX_TOTAL_DOWN-bytes);if(size<=0){active.cap='download';break;}
  const began=performance.now();const response=await timedFetch(url(size),{},12000);if(!response.ok)throw Error(`Servidor respondeu HTTP ${response.status}`);
  const reader=response.body?.getReader();let got=0;
  if(reader){while(true){const {value,done}=await reader.read();if(done)break;got+=value.byteLength;if(!active)throw new DOMException('Cancelado','AbortError');}}
  else got=(await response.arrayBuffer()).byteLength;
  const elapsed=Math.max((performance.now()-began)/1000,.001);if(got<512)throw Error('O servidor não enviou dados suficientes.');
  bytes+=got;secondsActive+=elapsed;samples++;const mbps=bytes*8/secondsActive/1e6;setText('cxSpeedDownload',number(mbps));show(mbps,'Mbps','DOWNLOAD');
  if(performance.now()<deadline)await delay(Math.min(120,Math.max(0,deadline-performance.now())));
 }while(performance.now()<deadline);
 return {mbps:bytes*8/Math.max(secondsActive,.001)/1e6,bytes,samples};
}
async function upload(deadline){
 status('Medindo upload');setText('cxSpeedMessage','Enviando blocos de teste, sem arquivos pessoais…');let bytes=0,secondsActive=0,samples=0;
 const payload=new Uint8Array(MAX_UP);for(let i=0;i<payload.length;i+=65536)crypto.getRandomValues(payload.subarray(i,Math.min(payload.length,i+65536)));
 do{
  if(!active)throw new DOMException('Cancelado','AbortError');
  if(bytes+payload.byteLength>MAX_TOTAL_UP){active.cap='upload';break;}
  const started=performance.now();const response=await timedFetch(`${ENDPOINT}/__up?t=${Date.now()}-${samples}`,{method:'POST',headers:{'Content-Type':'application/octet-stream'},body:payload},12000);
  if(!response.ok)throw Error(`Servidor respondeu HTTP ${response.status}`);await response.arrayBuffer();
  const elapsed=Math.max((performance.now()-started)/1000,.001);secondsActive+=elapsed;bytes+=payload.byteLength;samples++;
  const mbps=bytes*8/secondsActive/1e6;show(mbps,'Mbps','UPLOAD');setText('cxSpeedUpload',number(mbps));
  if(performance.now()<deadline)await delay(Math.min(120,Math.max(0,deadline-performance.now())));
 }while(performance.now()<deadline);
 return {mbps:bytes*8/Math.max(secondsActive,.001)/1e6,bytes,samples};
}
function updateTimer(){const elapsed=Math.max(0,performance.now()-(active?.startedAt||performance.now()));const seconds=Math.min(15,Math.floor(elapsed/1000)),mm=String(Math.floor(seconds/60)).padStart(2,'0'),ss=String(seconds%60).padStart(2,'0');setText('cxSpeedTimer',`${mm}:${ss} / 00:15`);const bar=q('cxSpeedTimelineFill');if(bar)bar.style.width=`${Math.min(100,elapsed/MIN_TEST_MS*100)}%`;}
export function stopSpeedTest(){if(active){active.controller.abort('cancelled');clearInterval(active.timer);active=null;} }
export function bindSpeedTest(){const btn=q('cxSpeedStart');if(!btn||btn.dataset.wired==='yes')return;btn.dataset.wired='yes';const cancel=q('cxSpeedCancel');const updateConnection=()=>{const node=q('cxSpeedOffline');if(node)node.textContent=navigator.onLine?'Rede detectada pelo navegador. Isso não garante internet.':'O navegador informa ausência de conexão.';};updateConnection();
 cancel.addEventListener('click',()=>{stopSpeedTest();status('Teste cancelado','error');setText('cxSpeedMessage','O teste foi cancelado por você.');btn.disabled=false;cancel.disabled=true;});
 btn.addEventListener('click',async()=>{if(active)return;active={controller:new AbortController(),startedAt:performance.now(),timer:null,lastUI:0};active.timer=setInterval(updateTimer,120);updateTimer();btn.disabled=true;cancel.disabled=false;['cxSpeedLatency','cxSpeedDownload','cxSpeedUpload'].forEach(k=>setText(k,'—'));show(0);
 try{if(!navigator.onLine)throw Error('O navegador informa que está sem conexão.');await latency();
  active.startedAt=performance.now(); // latência é medida antes das duas fases iguais
  const downUntil=active.startedAt+PHASE_MS;
  const down=await download(downUntil);
  const upUntil=performance.now()+PHASE_MS; // mesmos 7,5 s para cada etapa
  const up=await upload(upUntil);
  if(!active)return;
  const capped=!!active.cap;
  status(capped?'Teste concluído (limite de dados)':'Teste concluído','success');
  setText('cxSpeedMessage',capped?`O limite de dados para ${active.cap} foi atingido. Resultados das amostras reais, sem espera artificial.`:`Pronto! ${down.samples} amostras de download e ${up.samples} de upload, coletadas durante o teste.`);
  updateTimer();}
 catch(err){if(err.name==='AbortError'||!active){status('Teste interrompido','error');setText('cxSpeedMessage','A medição foi interrompida.');}else{status('Não foi possível medir','error');setText('cxSpeedMessage',`Erro: ${err.message}. Confirme a rede e tente novamente.`);}}
 finally{if(active){clearInterval(active.timer);updateTimer();active=null;}btn.disabled=false;cancel.disabled=true;}
 });
}

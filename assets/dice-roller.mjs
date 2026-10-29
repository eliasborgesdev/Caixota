// Gerador de dados da Caixota: interpreta somente somas de NdS e constantes.
// Nada de eval, sem dados externos e sem dependências de rede.
const MAX_GROUPS=24,MAX_DICE=500,MAX_SIDES=1000;
const $=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parseDice(text){
 const raw=String(text).replace(/\s+/g,'').toLowerCase();
 if(!raw||raw.length>180)throw Error('Escreva uma rolagem: 2d6, 1d20 ou 1d12 + 3d6 + 3.');
 const tokens=raw.match(/[+-]?\d*d\d+|[+-]?\d+/g);
 if(!tokens||tokens.join('')!==raw)throw Error('Use apenas dados como 2d6 e números somados ou subtraídos.');
 if(tokens.length>MAX_GROUPS)throw Error('Muitas parcelas! Use até 24 grupos.');
 let count=0;
 const terms=tokens.map((token,i)=>{
  const sign=token.startsWith('-')?-1:1;const clean=token.replace(/^[+-]/,'');
  if(clean.includes('d')){
   const [a,b]=clean.split('d');const qty=a===''?1:Number(a),sides=Number(b);
   if(!Number.isSafeInteger(qty)||qty<1||qty>MAX_DICE||!Number.isSafeInteger(sides)||sides<2||sides>MAX_SIDES)throw Error('Cada dado precisa de 2 a 1000 lados. O máximo é 500 dados por rolagem.');
   count+=qty;if(count>MAX_DICE)throw Error('O limite é 500 dados no total.');
   return {kind:'dice',qty,sides,sign,label:`${sign<0?'-':''}${qty}d${sides}`};
  }
  const value=Number(clean);if(!Number.isSafeInteger(value)||value>1000000)throw Error('Use bônus de até 1 milhão.');
  return {kind:'flat',value,sign,label:`${sign<0?'-':''}${value}`};
 });
 return terms;
}
export function randomDie(sides){if(!Number.isInteger(sides)||sides<2||sides>MAX_SIDES)throw Error('Dado inválido.');const scale=2**32;const ceiling=Math.floor(scale/sides)*sides;const random=new Uint32Array(1);do{crypto.getRandomValues(random)}while(random[0]>=ceiling);return random[0]%sides+1;}
export function rollDice(input){const terms=Array.isArray(input)?input:parseDice(input);let total=0;const detail=terms.map(t=>{
 if(t.kind==='flat'){total+=t.sign*t.value;return {...t,values:[],subtotal:t.sign*t.value};}
 const values=Array.from({length:t.qty},()=>randomDie(t.sides));const subtotal=t.sign*values.reduce((a,b)=>a+b,0);total+=subtotal;return {...t,values,subtotal};
 });return {total,detail};}
let audio;let soundsAllowed=true;
function diceSound(){if(!soundsAllowed)return;try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;audio??=new Ctx();if(audio.state==='suspended')audio.resume();let t=audio.currentTime;for(let i=0;i<5;i++){const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.value=180+randomDie(8)*45;gain.gain.setValueAtTime(.0001,t+i*.064);gain.gain.exponentialRampToValueAtTime(.022,t+i*.064+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+i*.064+.055);osc.connect(gain).connect(audio.destination);osc.start(t+i*.064);osc.stop(t+i*.064+.07);}}catch{}}
export function diceMarkup(icon){return `<section class="page-entry"><span class="overline">UTILITÁRIOS · SORTEIOS</span><h1>Dados de RPG 🎲</h1><p>Quem precisa de uma mesa inteira quando dá pra rolar os dados aqui? Funciona offline!</p></section>
<section class="glass-section cx-dice-shell"><div class="cx-dice-top"><div><h2>Qual vai ser a rolagem?</h2><p>Escreva seus dados ou escolha um atalho.</p></div><span class="meta-tag">Offline</span></div>
<form id="cxDiceForm"><label class="cx-dice-label" for="cxDiceExpression">Rolagem</label><div class="cx-dice-controls"><input id="cxDiceExpression" value="1d20 + 2d4" maxlength="180" spellcheck="false" placeholder="Ex.: 1d12 + 3d6 + 3" autocomplete="off" aria-describedby="cxDiceHelp"><button type="submit" class="button-primary" id="cxDiceRoll">${icon('dice',18)} Rolar dados</button></div></form><p id="cxDiceHelp" class="cx-dice-help">Vale 2d6, 1d20, 1d12 + 3d6 + 3 e até subtrações. Até 500 dados por vez.</p>
<div class="cx-dice-presets">${['1d4','1d6','1d8','1d10','1d12','1d20','2d6','1d20 + 2d4'].map(s=>`<button type="button" data-dice-preset="${s}">${s}</button>`).join('')}</div><div class="cx-dice-stage"><div class="cx-dice-art" id="cxDiceArt" aria-hidden="true"><span>⚄</span><span>⚅</span><span>◆</span></div><div class="cx-dice-total"><span>TOTAL</span><strong id="cxDiceTotal">?</strong><small id="cxDiceStatus">Pronto pra jogar!</small></div></div>
<div class="cx-dice-breakdown"><h3>Resultado dos dados</h3><div id="cxDiceDetails" aria-live="polite">Depois de rolar, cada dado aparece aqui.</div></div><div class="cx-dice-history"><div class="cx-dice-top"><h3>Últimas rolagens</h3><button type="button" class="button-outline" id="cxDiceClear">Limpar</button></div><ol id="cxDiceHistory"></ol></div></section>`;}
export function bindDice(){try{chrome.storage.local.get('caixotaUiV3').then(data=>{soundsAllowed=data?.caixotaUiV3?.sound!==false;});}catch{}const form=$('cxDiceForm');if(!form||form.dataset.ready)return;form.dataset.ready='yes';const input=$('cxDiceExpression'),total=$('cxDiceTotal'),details=$('cxDiceDetails'),art=$('cxDiceArt'),status=$('cxDiceStatus'),history=$('cxDiceHistory'),roll=$('cxDiceRoll');let last=0;
 document.querySelectorAll('[data-dice-preset]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.dicePreset;input.focus()}));
 $('cxDiceClear').addEventListener('click',()=>history.replaceChildren());
 form.addEventListener('submit',async e=>{e.preventDefault();try{
 const expr=input.value;const result=rollDice(expr);try{const data=await chrome.storage.local.get('caixotaUiV3');soundsAllowed=data?.caixotaUiV3?.sound!==false;}catch{}diceSound();art.classList.remove('rolling');void art.offsetWidth;art.classList.add('rolling');total.textContent=String(result.total);status.textContent='Rolagem concluída!';details.innerHTML=result.detail.map(t=>`<div class="cx-dice-result-row"><strong>${safe(t.label)}</strong><span>${t.kind==='flat'?'Bônus: '+t.subtotal:t.values.map(x=>`<em>${x}</em>`).join(' ')}</span><b>${t.subtotal>=0?'+':''}${t.subtotal}</b></div>`).join('');
 const li=document.createElement('li');li.textContent=`${expr} = ${result.total}`;history.prepend(li);while(history.children.length>10)history.lastElementChild.remove();
 }catch(err){status.textContent=err.message;details.textContent='Confira a expressão e tente de novo.';}});
}

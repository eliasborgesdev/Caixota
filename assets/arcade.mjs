/* Caixota Arcade v0.3.9: jogos offline, controles independentes e dificuldade configurável. */
let active=null;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={pong:'Pong',breakout:'Quebra-Blocos',mines:'Campo Minado'};
const descriptions={pong:'Rebata a bolinha e desafie o computador. Jogue por pontos ou contra o relógio!',breakout:'Controle a plataforma, destrua os blocos e proteja suas vidas.',mines:'Revele quadrados seguros, marque minas e escolha sua dificuldade.'};
const diff=[{name:'Fácil',size:9,mines:10},{name:'Médio',size:16,mines:40},{name:'Difícil',size:20,mines:75}];
export function arcadeMarkup(game){return `<section class="cx-arcade-shell" data-arcade="${esc(game)}">
 <div class="cx-arcade-intro"><div><span class="overline">JOGOS · OFFLINE</span><h1>${esc(names[game]||'Arcade')}</h1><p>${esc(descriptions[game]||'')}</p></div><button class="cx-game-sound" type="button" data-arcade-sound aria-pressed="true">Som ligado ♪</button></div>
 ${game==='pong'?`<div class="cx-arcade-options" aria-label="Modo de jogo"><strong>Modo:</strong><button type="button" class="cx-arcade-mode" data-pong-mode="points" aria-pressed="true">🏆 Por pontos</button><button type="button" class="cx-arcade-mode" data-pong-mode="timed" aria-pressed="false">⏱ Por tempo (60 s)</button><span class="cx-arcade-time" id="cxPongTime" hidden>01:00</span></div>`:''}
 ${game==='mines'?`<div class="cx-mines-difficulty" aria-label="Dificuldade"><strong>Dificuldade:</strong>${diff.map((d,i)=>`<button type="button" class="cx-arcade-mode" data-mines-difficulty="${i}" aria-pressed="${i===0}">${d.name} · ${d.size}×${d.size}</button>`).join('')}</div>`:`<div class="cx-arcade-options"><strong>Controles:</strong><button type="button" class="cx-arcade-choice" data-arcade-control="mouse" aria-pressed="true" title="Habilitar/desabilitar mouse">🖱 Mouse / toque</button><button type="button" class="cx-arcade-choice" data-arcade-control="keyboard" aria-pressed="true" title="Habilitar/desabilitar teclado">⌨ Teclado</button><small>${game==='pong'?'↑ ↓ ou W S':'← → ou A D'} · Espaço pausa</small></div>`}
 <div class="cx-arcade-stage">${game==='mines'?`<div class="cx-mines-top"><strong id="cxMinesFlags">💣 10</strong><span id="cxMinesTimer">00:00</span></div><div class="cx-mines-grid" id="cxMinesGrid" role="grid" aria-label="Campo Minado"></div>`:`<div class="cx-canvas-wrap"><canvas id="cxArcadeCanvas" width="800" height="460" tabindex="0" aria-label="${esc(names[game])}"></canvas></div>`}<div class="cx-arcade-status" id="cxArcadeStatus" aria-live="polite">${game==='mines'?'Clique em um quadradinho para começar.':'Clique em Começar ou pressione Espaço.'}</div></div>
 <div class="cx-arcade-actions"><button type="button" class="button-primary" data-arcade-start>▶ ${game==='mines'?'Novo campo':'Começar'}</button>${game==='mines'?'':`<button type="button" class="button-outline" data-arcade-pause>Pausar</button>`}<span>${game==='mines'?'Clique direito ou segure para marcar uma mina.':'Mouse, toque ou teclado. Você escolhe!'}</span></div></section>`;}
function playTone(f=440,d=.06){const obj=active;if(!obj?.sound)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;obj.ac??=new AC();if(obj.ac.state==='suspended')obj.ac.resume();const o=obj.ac.createOscillator(),g=obj.ac.createGain(),t=obj.ac.currentTime;o.type='sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(100,f*.75),t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.023,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+d+.008);o.connect(g).connect(obj.ac.destination);o.start(t);o.stop(t+d+.025);}catch{}}
export function stopArcade(){const obj=active;if(!obj)return;active=null;obj.controller.abort();cancelAnimationFrame(obj.frame||0);if(obj.timer)clearInterval(obj.timer);obj.ac?.close().catch(()=>{});}
export function bindArcade(game,enabled=true){stopArcade();const root=document.querySelector('.cx-arcade-shell');if(!root)return;const controller=new AbortController(),signal=controller.signal;const obj={game,root,controller,sound:enabled,ac:null,frame:0,timer:null,playing:false,controls:{mouse:true,keyboard:true},mode:'points'};active=obj;
 const status=text=>{if(active===obj){const el=root.querySelector('#cxArcadeStatus');if(el)el.textContent=text;}};
 const soundBtn=root.querySelector('[data-arcade-sound]');soundBtn?.addEventListener('click',()=>{obj.sound=!obj.sound;soundBtn.textContent=obj.sound?'Som ligado ♪':'Som desligado';soundBtn.setAttribute('aria-pressed',String(obj.sound));if(obj.sound)playTone(520);},{signal});
 if(game==='mines')return bindMines(obj,status,signal);
 bindCanvas(obj,status,signal);
}
function bindCanvas(obj,status,signal){const root=obj.root,canvas=root.querySelector('#cxArcadeCanvas'),ctx=canvas.getContext('2d',{alpha:false}),W=800,H=460,keys=new Set();let last=0,pointer=null;const eco=document.documentElement.dataset.quality==='eco'||document.documentElement.dataset.effects==='off'||matchMedia('(prefers-reduced-motion:reduce)').matches;
 const modeButtons=[...root.querySelectorAll('[data-pong-mode]')],timeEl=root.querySelector('#cxPongTime');
 const randomDirection=()=>Math.random()>.5?1:-1;
 const serve=()=>{obj.ball.x=W/2;obj.ball.y=H/2;obj.ball.vx=randomDirection()*245;obj.ball.vy=randomDirection()*140;obj.trail=[];};
 const reset=()=>{obj.playing=false;obj.ended=false;obj.left=0;obj.right=0;obj.lives=3;obj.score=0;obj.elapsed=0;obj.effects=[];obj.paddle={x:W/2-47,y:H/2-45,w:94,h:90};obj.enemy={y:H/2-45};obj.bricks=Array.from({length:5},(_,r)=>Array.from({length:10},(_,c)=>({x:45+c*72,y:65+r*28,w:66,h:21,alive:true,r}))).flat();obj.ball={x:W/2,y:H/2,vx:245,vy:150,r:9};serve();status('Pronto! Clique em Começar.');render();};
 const start=()=>{if(obj.ended)reset();obj.playing=true;canvas.focus({preventScroll:true});status(obj.game==='pong'?(obj.mode==='timed'?'Marque mais pontos antes do tempo acabar!':'Primeiro a marcar 5 pontos ganha!'):'Quebre os blocos e não deixe a bolinha cair!');playTone(500);};
 const pause=()=>{if(obj.ended)return;obj.playing=!obj.playing;status(obj.playing?'Valendo!':'Pausado. Pressione Espaço para continuar.');};
 root.querySelector('[data-arcade-start]').addEventListener('click',start,{signal});root.querySelector('[data-arcade-pause]').addEventListener('click',pause,{signal});
 for(const b of root.querySelectorAll('[data-arcade-control]'))b.addEventListener('click',()=>{const which=b.dataset.arcadeControl;obj.controls[which]=!obj.controls[which];b.setAttribute('aria-pressed',String(obj.controls[which]));if(which==='mouse'&&!obj.controls.mouse)pointer=null;playTone(obj.controls[which]?630:260);status(obj.controls.mouse||obj.controls.keyboard?'Controle atualizado.':'Ative o mouse ou o teclado para controlar a plataforma.');},{signal});
 for(const b of modeButtons)b.addEventListener('click',()=>{obj.mode=b.dataset.pongMode;modeButtons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));if(timeEl)timeEl.hidden=obj.mode!=='timed';reset();playTone(550);},{signal});
 const controlKey=(k)=>obj.game==='pong'?['arrowup','arrowdown','w','s'].includes(k):['arrowleft','arrowright','a','d'].includes(k);
 window.addEventListener('keydown',e=>{if(active!==obj||e.target.closest('input,textarea,[contenteditable]'))return;const k=e.key.toLowerCase();if(k===' '){e.preventDefault();obj.playing?pause():start();return;}if(!obj.controls.keyboard||!controlKey(k))return;e.preventDefault();keys.add(k);},{signal});
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()),{signal});
 canvas.addEventListener('pointermove',e=>{if(!obj.controls.mouse)return;const r=canvas.getBoundingClientRect();pointer=obj.game==='pong'?(e.clientY-r.top)*H/r.height:(e.clientX-r.left)*W/r.width;},{signal});
 canvas.addEventListener('pointerdown',e=>{if(!obj.controls.mouse)return;const r=canvas.getBoundingClientRect();pointer=obj.game==='pong'?(e.clientY-r.top)*H/r.height:(e.clientX-r.left)*W/r.width;if(!obj.playing)start();},{signal});
 const autoPause=()=>{if(obj.playing&&(document.hidden||!document.hasFocus())){obj.playing=false;status('Pausado enquanto você estava fora.');}};
 document.addEventListener('visibilitychange',autoPause,{signal});window.addEventListener('blur',autoPause,{signal});
 const particle=(x,y,color)=>{if(eco)return;for(let i=0;i<5;i++)obj.effects.push({x,y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*145,life:.3,color});if(obj.effects.length>95)obj.effects.splice(0,obj.effects.length-95);};
 const roundPoint=()=>{playTone(260,.13);if(obj.mode==='points'&&(obj.left>=5||obj.right>=5)){obj.playing=false;obj.ended=true;status(obj.left>=5?'Você ganhou! 🎉':'O computador ganhou. Mais uma?');}else serve();};
 function update(dt){const b=obj.ball,up=keys.has('arrowup')||keys.has('w'),down=keys.has('arrowdown')||keys.has('s'),left=keys.has('arrowleft')||keys.has('a'),right=keys.has('arrowright')||keys.has('d');const move=(up?-1:0)+(down?1:0),hmove=(left?-1:0)+(right?1:0);
 if(obj.game==='pong'){
  obj.elapsed+=dt;
  if(obj.mode==='timed'&&obj.elapsed>=60){obj.elapsed=60;obj.ended=true;obj.playing=false;status(obj.left===obj.right?'Tempo esgotado: empate!':obj.left>obj.right?'Tempo esgotado: você venceu! 🎉':'Tempo esgotado: o computador venceu.');return;}
  if(obj.controls.mouse&&pointer!==null)obj.paddle.y=pointer-obj.paddle.h/2;
  else if(obj.controls.keyboard)obj.paddle.y+=move*410*dt;
  obj.paddle.y=Math.max(12,Math.min(H-obj.paddle.h-12,obj.paddle.y));
  const target=b.y-45;obj.enemy.y=Math.max(12,Math.min(H-102,obj.enemy.y+Math.sign(target-obj.enemy.y)*Math.min(Math.abs(target-obj.enemy.y),225*dt)));
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.y-b.r<9||b.y+b.r>H-9){b.vy*=-1;b.y=Math.max(9+b.r,Math.min(H-9-b.r,b.y));playTone(350);}
  if(b.vx<0&&b.x-b.r<=31&&b.x>13&&b.y>=obj.paddle.y-4&&b.y<=obj.paddle.y+obj.paddle.h+4){b.vx=Math.abs(b.vx)*1.035;b.vy+=(b.y-(obj.paddle.y+45))*2;b.x=31+b.r;particle(b.x,b.y,'#7fdcf5');playTone(650);}
  if(b.vx>0&&b.x+b.r>=W-31&&b.x<W-13&&b.y>=obj.enemy.y-4&&b.y<=obj.enemy.y+94){b.vx=-Math.abs(b.vx)*1.035;b.vy+=(b.y-(obj.enemy.y+45))*2;b.x=W-31-b.r;particle(b.x,b.y,'#f4aedc');playTone(610);}
  if(b.x<-20||b.x>W+20){b.x<0?obj.right++:obj.left++;roundPoint();}
 }else{
  obj.paddle.w=94;obj.paddle.h=14;obj.paddle.y=H-37;
  if(obj.controls.mouse&&pointer!==null)obj.paddle.x=pointer-obj.paddle.w/2;
  else if(obj.controls.keyboard)obj.paddle.x+=hmove*560*dt;
  obj.paddle.x=Math.max(12,Math.min(W-obj.paddle.w-12,obj.paddle.x));
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(b.x-b.r<8||b.x+b.r>W-8){b.vx*=-1;b.x=Math.max(8+b.r,Math.min(W-8-b.r,b.x));playTone(350);}
  if(b.y-b.r<9){b.vy=Math.abs(b.vy);playTone(350);}
  if(b.vy>0&&b.y+b.r>=obj.paddle.y&&b.y-b.r<obj.paddle.y+14&&b.x>=obj.paddle.x-b.r&&b.x<=obj.paddle.x+obj.paddle.w+b.r){b.vy=-Math.abs(b.vy);b.vx+=(b.x-obj.paddle.x-obj.paddle.w/2)*3;b.y=obj.paddle.y-b.r;particle(b.x,b.y,'#a1dced');playTone(560);}
  for(const brick of obj.bricks){if(!brick.alive)continue;if(b.x+b.r>brick.x&&b.x-b.r<brick.x+brick.w&&b.y+b.r>brick.y&&b.y-b.r<brick.y+brick.h){brick.alive=false;b.vy*=-1;obj.score+=10;particle(b.x,b.y,['#78b8e8','#9a8bd8','#d77eae','#e3ac75','#75beaa'][brick.r]);playTone(760);break;}}
  if(!obj.bricks.some(x=>x.alive)){obj.playing=false;obj.ended=true;status('Todos os blocos quebrados! 🎉');}
  if(b.y>H+12){obj.lives--;playTone(200,.15);if(obj.lives<=0){obj.playing=false;obj.ended=true;status('Acabaram suas vidas. Tenta outra?');}else{serve();b.vy=-Math.abs(b.vy);}}
 }
 if(!eco){obj.trail.push({x:b.x,y:b.y});if(obj.trail.length>7)obj.trail.shift();obj.effects=obj.effects.filter(p=>(p.x+=p.vx*dt,p.y+=p.vy*dt,p.life-=dt,p.life>0));}
 }
 function render(){ctx.fillStyle='#101923';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(190,219,233,.07)';ctx.lineWidth=1;for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
 if(obj.game==='pong'){
  ctx.setLineDash([8,11]);ctx.strokeStyle='rgba(237,245,255,.3)';ctx.beginPath();ctx.moveTo(W/2,12);ctx.lineTo(W/2,H-12);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#f5f9ff';ctx.font='bold 43px system-ui';ctx.textAlign='center';ctx.fillText(obj.left,W/2-82,66);ctx.fillText(obj.right,W/2+82,66);
  ctx.fillStyle='#81d9ef';ctx.shadowColor='#73d9fa';ctx.shadowBlur=eco?0:15;ctx.fillRect(16,obj.paddle.y,15,obj.paddle.h);ctx.fillStyle='#f1b4d8';ctx.shadowColor='#f1b4d8';ctx.fillRect(W-31,obj.enemy.y,15,90);ctx.shadowBlur=0;
  if(timeEl&&obj.mode==='timed')timeEl.textContent=`${String(Math.ceil(Math.max(0,60-obj.elapsed))/60|0).padStart(2,'0')}:${String(Math.ceil(Math.max(0,60-obj.elapsed))%60).padStart(2,'0')}`;
 }else{
  ctx.fillStyle='#b9e7f2';ctx.font='bold 18px system-ui';ctx.textAlign='left';ctx.fillText(`Pontos: ${obj.score}  ·  Vidas: ${obj.lives}`,20,30);
  const colors=['#78b8e8','#9a8bd8','#d77eae','#e3ac75','#75beaa'];for(const brick of obj.bricks){if(!brick.alive)continue;ctx.fillStyle=colors[brick.r];ctx.beginPath();ctx.roundRect(brick.x,brick.y,brick.w,brick.h,5);ctx.fill();}
  ctx.fillStyle='#a1dced';ctx.beginPath();ctx.roundRect(obj.paddle.x,obj.paddle.y,obj.paddle.w,14,8);ctx.fill();
 }
 if(!eco){for(const [i,t] of obj.trail.entries()){ctx.globalAlpha=.08+.05*i;ctx.fillStyle='#8de5f9';ctx.beginPath();ctx.arc(t.x,t.y,4+i*.55,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;for(const p of obj.effects){ctx.globalAlpha=p.life/.3;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4,4);}ctx.globalAlpha=1;}
 ctx.fillStyle='#fcfeff';ctx.shadowBlur=eco?0:15;ctx.shadowColor='#9eddf0';ctx.beginPath();ctx.arc(obj.ball.x,obj.ball.y,obj.ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 if(!obj.playing){ctx.fillStyle='rgba(9,17,26,.55)';ctx.fillRect(0,H/2-32,W,64);ctx.fillStyle='#edf8ff';ctx.font='600 20px system-ui';ctx.textAlign='center';ctx.fillText(obj.ended?'Partida encerrada':'Pressione começar para jogar',W/2,H/2+7);}
 }
 function frame(t){if(active!==obj)return;const dt=Math.min(.033,last?(t-last)/1000:0);last=t;if(obj.playing)update(dt);render();obj.frame=requestAnimationFrame(frame);}reset();obj.frame=requestAnimationFrame(frame);
}
function bindMines(obj,status,signal){const root=obj.root,grid=root.querySelector('#cxMinesGrid'),flagsNode=root.querySelector('#cxMinesFlags'),timeNode=root.querySelector('#cxMinesTimer');let cells=[],started=false,ended=false,start=0,flags=0,remaining=0,level=0,size=9,count=10;const buttons=[...root.querySelectorAll('[data-mines-difficulty]')];
 const neighbors=i=>{const x=i%size,y=Math.floor(i/size),a=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(dx===0&&dy===0)continue;if(nx>=0&&nx<size&&ny>=0&&ny<size)a.push(ny*size+nx);}return a;};
 const paint=()=>{grid.style.setProperty('--mines-cols',size);grid.innerHTML=cells.map((c,i)=>`<button type="button" class="cx-mine-cell ${c.open?'revealed':''} ${c.flag?'flagged':''} ${c.mine&&ended?'mine':''}" data-mine="${i}" aria-label="Linha ${Math.floor(i/size)+1}, coluna ${i%size+1}${c.flag?', marcada':''}" ${c.open?'disabled':''}>${c.open?(c.mine?'💣':c.num||''):c.flag?'🚩':''}</button>`).join('');flagsNode.textContent=`💣 ${count-flags}`;};
 const reset=()=>{size=diff[level].size;count=diff[level].mines;cells=Array.from({length:size*size},()=>({mine:false,open:false,flag:false,num:0}));started=ended=false;flags=0;remaining=size*size-count;timeNode.textContent='00:00';if(obj.timer){clearInterval(obj.timer);obj.timer=null;}status('Escolha um quadradinho para começar.');paint();};
 const placeMines=first=>{const forbidden=new Set([first,...neighbors(first)]);const positions=[...Array(size*size).keys()].filter(i=>!forbidden.has(i));for(let n=0;n<count;n++){const r=new Uint32Array(1);crypto.getRandomValues(r);const k=r[0]%positions.length,idx=positions.splice(k,1)[0];cells[idx].mine=true;}cells.forEach((c,i)=>c.num=neighbors(i).filter(n=>cells[n].mine).length);};
 const finish=won=>{ended=true;clearInterval(obj.timer);obj.timer=null;status(won?'Campo limpo! Você ganhou! 🎉':'Era uma mina! Tenta outra?');playTone(won?900:200,.16);paint();};
 const uncover=first=>{if(ended||cells[first]?.flag||cells[first]?.open)return;if(!started){started=true;placeMines(first);start=performance.now();obj.timer=setInterval(()=>{if(active===obj&&!ended){const n=Math.floor((performance.now()-start)/1000);timeNode.textContent=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}},300);}
  if(cells[first].mine){cells[first].open=true;finish(false);return;}const queue=[first],visited=new Set();while(queue.length){const i=queue.pop();if(visited.has(i))continue;visited.add(i);const c=cells[i];if(c.open||c.flag||c.mine)continue;c.open=true;remaining--;if(!c.num)for(const n of neighbors(i))if(!visited.has(n))queue.push(n);}
  playTone(420,.05);if(remaining<=0)finish(true);else paint();};
 const toggleFlag=i=>{if(ended||cells[i]?.open)return;cells[i].flag=!cells[i].flag;flags+=cells[i].flag?1:-1;playTone(520);paint();};
 for(const b of buttons)b.addEventListener('click',()=>{level=Number(b.dataset.minesDifficulty);buttons.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));reset();playTone(540);},{signal});
 let hold;grid.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){const b=e.target.closest('[data-mine]');if(b)hold=setTimeout(()=>{hold=null;toggleFlag(Number(b.dataset.mine));b.dataset.longPress='1';},550);}}, {signal});
 grid.addEventListener('pointerup',()=>clearTimeout(hold),{signal});grid.addEventListener('pointercancel',()=>clearTimeout(hold),{signal});grid.addEventListener('contextmenu',e=>{const b=e.target.closest('[data-mine]');if(b){e.preventDefault();toggleFlag(Number(b.dataset.mine));}},{signal});grid.addEventListener('click',e=>{const b=e.target.closest('[data-mine]');if(!b)return;if(b.dataset.longPress==='1'){delete b.dataset.longPress;return;}uncover(Number(b.dataset.mine));},{signal});root.querySelector('[data-arcade-start]').addEventListener('click',reset,{signal});reset();}

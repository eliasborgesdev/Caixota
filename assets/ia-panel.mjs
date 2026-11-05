import {DEFINICOES} from '../ia/tools/index.js';
export const IA_TOOLS=DEFINICOES.map(d=>({id:'ia-'+d.id,ia:d.id,label:d.nome,description:d.descricao,category:'ia',group:'IA online',network:'required',direct:true,keywords:['IA']}));
export const IA_WARNING='As ferramentas de IA são experimentais. Podem falhar ou dar respostas incorretas. Confira as informações em fontes confiáveis antes de usar a resposta.';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function iaMarkup(tool){
 const d=DEFINICOES.find(x=>x.id===tool?.ia);if(!d)return '';
 return `<section class="page-entry"><span class="overline">Online</span> <span class="cx-ia-badge">Experimental</span><h1>${esc(d.nome)}</h1><p>${esc(d.descricao)}</p></section>
 <p class="cx-ia-warning">${IA_WARNING}</p><section class="glass-section cx-ia"><form id="cxIaForm">
 <p>Ao executar, o conteúdo informado é enviado ao serviço de IA. A verificação também pode consultar Wikipédia, Brave Search e a busca do Google, conforme suas configurações. Evite enviar dados sensíveis.</p>
 ${d.id==='imagem'?'<label>Imagem (PNG, JPEG ou WebP, até 4 MiB)<input id="cxIaImage" type="file" accept="image/png,image/jpeg,image/webp" required></label><label>O que você quer saber?<textarea id="cxIaText" maxlength="1500" placeholder="Descreva a imagem e leia o texto visível."></textarea></label>':`<label>Texto (${d.limites.min}–${d.limites.max} caracteres)<textarea id="cxIaText" minlength="${d.limites.min}" maxlength="${d.limites.max}" required></textarea></label>${['dicionario','explicar'].includes(d.id)?'<label>Contexto opcional<textarea id="cxIaContext" maxlength="800"></textarea></label>':''}`}
 <div class="cx-ia-actions"><button class="button-primary" type="submit">Executar</button><button class="button-outline" type="button" id="cxIaConfig">Configurar IA</button></div>
 <p id="cxIaStatus" role="status"></p><pre id="cxIaResult" hidden></pre><button class="button-outline" type="button" id="cxIaCopy" hidden>Copiar resposta</button></form></section>`;
}
let activePort=null;
export function closeIa(){activePort?.disconnect();activePort=null;globalThis.__TT?.fechar();}
export function bindIa(tool,openSettings){
 const form=document.getElementById('cxIaForm');if(!form)return;
 const status=form.querySelector('#cxIaStatus'),out=form.querySelector('#cxIaResult'),copy=form.querySelector('#cxIaCopy');
 form.querySelector('#cxIaConfig').onclick=openSettings;
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(out.textContent);status.textContent='Copiado.';}catch{status.textContent='Não foi possível copiar.';}};
 form.onsubmit=async e=>{
  e.preventDefault();const texto=form.querySelector('#cxIaText').value.trim();
  if(tool.ia!=='imagem'){try{globalThis.__TT.abrirTexto(tool.ia,texto,form.querySelector('#cxIaContext')?.value.trim()||'');status.textContent='';}catch(err){status.textContent=err.message;}return;}
  const file=form.querySelector('#cxIaImage').files[0];
  if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4194304){status.textContent='Escolha um PNG, JPEG ou WebP de até 4 MiB.';return;}
  closeIa();const submit=form.querySelector('[type=submit]');submit.disabled=true;out.hidden=copy.hidden=true;status.textContent='Analisando…';
  try{
   const encoded=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(file);});
   if(!form.isConnected)return;
   const port=activePort=chrome.runtime.connect({name:'tira-teima'});
   const end=()=>{if(activePort===port)activePort=null;port.disconnect();submit.disabled=false;clearTimeout(timer);};
   const timer=setTimeout(()=>{status.textContent='O serviço de IA demorou para responder.';end();},60000);
   port.onDisconnect.addListener(()=>{if(activePort!==port)return;activePort=null;clearTimeout(timer);submit.disabled=false;status.textContent='Conexão interrompida.';});
   port.onMessage.addListener(msg=>{if(activePort!==port||!form.isConnected)return;
    if(msg.type==='resultado'){out.textContent=msg.texto;out.hidden=copy.hidden=false;status.textContent='Confira a resposta da IA antes de usar.';end();}
    else if(msg.type==='erro'){status.textContent=msg.mensagem;end();}
   });
   port.postMessage({type:'executar',ferramenta:'imagem',texto:texto||'Descreva a imagem e leia o texto visível.',imagem:{mimeType:file.type,data:encoded}});
  }catch{status.textContent='Não foi possível enviar a imagem.';submit.disabled=false;}
 };
}

import {DEFINICOES} from '../ia/tools/index.js';
import {getSettings,saveSettings,configFerramenta} from '../ia/settings.js';
import {gerarComFallback} from '../ia/core/llm.js';
export const iaSettingsMarkup=()=>'<div id="cxIaSettings" aria-busy="true">Carregando preferências…</div>';
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
export async function bindIaSettings(){
 const root=document.getElementById('cxIaSettings');if(!root)return;
 try{
 const saved=await getSettings();if(!root.isConnected)return;
 const form=node('form','','cx-ia-settings-grid'),controls=[];
 const section=(title,desc)=>{const b=node('section','','settings-surface cx-ia-settings-card');b.append(node('h2',title));if(desc)b.append(node('p',desc));form.append(b);return b;};
 function field(parent,{chave,tipo,rotulo,opcoes},value,scope=null){
  const label=node('label','','form-field');label.append(node('span',rotulo));const e=node(tipo==='select'?'select':tipo==='textoLongo'?'textarea':'input');
  if(tipo==='select'){for(const [k,v] of opcoes)e.add(new Option(v,k));e.value=value??opcoes[0][0];}
  else if(tipo==='checkbox'){e.type='checkbox';e.setAttribute('role','switch');label.className='cx-ia-setting-switch';e.checked=!!value;}
  else{if(e.tagName==='INPUT')e.type=tipo==='senha'?'password':'text';e.value=value??'';e.maxLength=tipo==='textoLongo'?300:512;e.autocomplete='off';e.spellcheck=false;}
  label.append(e);parent.append(label);controls.push({chave,e,scope});return e;
 }
 const general=section('Conexão e idioma','As ferramentas de IA enviam o conteúdo informado ao provedor quando você executa uma ação. Evite enviar dados sensíveis.');
 field(general,{chave:'geminiKey',tipo:'senha',rotulo:'Chave da API do Google AI Studio'},saved.geminiKey);
 general.classList.add('cx-ia-connection');
 const link=node('a','Criar ou consultar chave ↗','button-outline');link.href='https://aistudio.google.com/apikey';link.target='_blank';link.rel='noopener noreferrer';general.append(link);
 field(general,{chave:'model',tipo:'texto',rotulo:'Modelo (auto para escolher automaticamente)'},saved.model);
 field(general,{chave:'idiomaResposta',tipo:'select',rotulo:'Idioma das respostas',opcoes:[['pt-BR','Português'],['mesmo','Mesmo idioma do texto'],['en','Inglês'],['es','Espanhol']]},saved.idiomaResposta);
 for(const d of DEFINICOES){
  const cfg=configFerramenta(saved,d),card=section(d.nome,d.descricao);
  if(d.id!=='imagem')field(card,{chave:'contextual',tipo:'checkbox',rotulo:'Mostrar no menu de texto selecionado'},cfg.contextual!==false,d.id);
  for(const f of d.campos||[])field(card,f,f.global?saved[f.chave]:cfg[f.chave],f.global?null:d.id);
 }
 const actions=node('div','','cx-ia-actions'),save=node('button','Salvar configurações','button-primary'),test=node('button','Testar conexão','button-outline'),status=node('p');test.type='button';status.setAttribute('role','status');actions.append(save,test,status);form.append(actions);
 function values(){const out={ferramentas:Object.fromEntries(DEFINICOES.map(d=>[d.id,{...saved.ferramentas?.[d.id],ativa:true}]))};for(const {chave,e,scope} of controls)(scope?out.ferramentas[scope]:out)[chave]=e.type==='checkbox'?e.checked:e.value.trim();out.model||='auto';return out;}
 form.onsubmit=async e=>{e.preventDefault();save.disabled=true;try{await saveSettings(values());status.textContent='Configurações salvas.';}catch{status.textContent='Não foi possível salvar.';}finally{save.disabled=false;}};
 test.onclick=async()=>{const settings=values();if(!settings.geminiKey){status.textContent='Informe a chave da API.';return;}test.disabled=true;status.textContent='Testando…';const c=new AbortController(),timer=setTimeout(()=>c.abort(),20000);try{await gerarComFallback({settings,sistema:'Responda OK.',usuario:'Teste de conexão.',signal:c.signal});status.textContent='Conexão funcionando.';}catch(e){status.textContent=e.name==='AbortError'?'Tempo de espera esgotado.':e.message;}finally{clearTimeout(timer);test.disabled=false;}};
 root.replaceChildren(form);root.removeAttribute('aria-busy');
 }catch{root.textContent='Não foi possível carregar as configurações.';root.removeAttribute('aria-busy');}
}

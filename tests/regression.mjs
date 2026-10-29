// Execute: node tests/regression.mjs
// Testes isolados. Não substituem validação da interface instalada no navegador.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {webcrypto} from 'node:crypto';
import {PDFDocument, StandardFonts} from '../vendor/pdf-lib.esm.min.mjs';
import {parsePageSelection} from '../pdf-core.mjs';
import {CATEGORY_CATALOGS, GENERATOR_TOOL_CATALOG, TEXT_TOOL_CATALOG} from '../panel-catalog.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
assert.equal(manifest.version, '0.3.18');
assert.equal(manifest.manifest_version,3);
const seen=new Set();
for(const [category, tools] of Object.entries(CATEGORY_CATALOGS)) {
  for (const tool of tools) {
    const key=`${category}/${tool.id}`;
    assert(!seen.has(key), `Ferramenta repetida: ${key}`);
    assert(tool.label && tool.description && Array.isArray(tool.keywords), `Campos ausentes: ${key}`);
    seen.add(key);
  }
}
assert(!GENERATOR_TOOL_CATALOG.some(t=>t.id==='generator-wheel'),'Roleta deve estar apenas em Utilitários');
for(const id of ['generator-random-number','generator-password','generator-uuid','generator-fake-data']) {
  assert(GENERATOR_TOOL_CATALOG.some(t=>t.id===id),`Gerador não registrado: ${id}`);
}
for (const [category, ids] of Object.entries({
  text: ['text-markdown','text-regex','text-yaml'],
  images: ['image-batch','image-metadata-clean'],
  generators: ['generator-lorem','generator-palette','generator-qr-batch']
})) {
  for (const id of ids) {
    const entry = CATEGORY_CATALOGS[category].find(tool => tool.id === id);
    assert(entry?.direct === true && entry?.network === 'offline', `Nova ferramenta sem abertura direta ou tag offline: ${category}/${id}`);
  }
}
for (const filename of ['productivity-tools.js','productivity-tools.css','regex-worker.js']) assert(fs.existsSync(path.join(root,filename)), `Arquivo de produtividade ausente: ${filename}`);
const prodHtml = fs.readFileSync(path.join(root,'workbench.html'),'utf8');
for (const asset of ['productivity-tools.js','productivity-tools.css','vendor/qrcode-generator.js']) assert(prodHtml.includes(asset),`Asset não carregado: ${asset}`);
for (const cat of ['text','images','video','pdf','generators']) assert(prodHtml.includes(`data-tools-group="${cat}"`), `Grupo original ausente: ${cat}`);
const wheelStyle = fs.readFileSync(path.join(root,'local-tools.css'),'utf8');
assert(wheelStyle.includes('transform: translate(-50%, -50%) !important'), 'Correção do hover da roleta ausente');

assert(!TEXT_TOOL_CATALOG.some(t=>t.id==='password'),'Senha duplicada na categoria Texto');
assert.equal(GENERATOR_TOOL_CATALOG.find(t=>t.id==='generator-password')?.settingId,'passwordEnabled');
for(const [filename, ids] of Object.entries({
  'workbench.html':['generatorToolsContainer','videoToolsContainer','pdfToolsContainer','textDirectToolsContainer'],
})) {
  const html=fs.readFileSync(path.join(root,filename),'utf8');
  for(const id of ids) assert(html.includes(`id="${id}"`),`Elemento ausente ${filename}: ${id}`);
}
const local=fs.readFileSync(path.join(root,'local-tools.js'),'utf8');
const context=vm.createContext({console,crypto:webcrypto,document:{getElementById:()=>null,addEventListener:()=>{}},setTimeout,clearTimeout,TextEncoder,window:{}});
vm.runInContext(local,context,{filename:'local-tools.js'});
const run=source=>vm.runInContext(source,context);
for(const max of [1,2,7,0xffffffff,0x100000000,0x100000001,0x10000000000,Number.MAX_SAFE_INTEGER]){
  const sampled=run(`Array.from({length:100},()=>secureInt(${max}))`);
  assert(sampled.every(n=>Number.isSafeInteger(n)&&n>=0&&n<max),`Falha no intervalo ${max}`);
}
assert.throws(()=>run('secureInt(Number.MAX_SAFE_INTEGER+1)'),/inteiro seguro/);
assert.throws(()=>run('secureInt(0)'),/inteiro seguro/);
for(let n=0;n<100;n++) {
  const sample=run('generateUuidV4()');
  assert.match(sample,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const v7=run('generateUuidV7()');
  assert.match(v7,/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const ts=Number.parseInt(v7.replaceAll('-','').slice(0,12),16);
  assert(Math.abs(ts-Date.now())<10000,'Timestamp UUID v7 divergente');
}
const mock=run('fakeRecord(12)');
assert.match(mock.email,/@example\.com$/);
assert.match(mock.observacao,/SINTÉTICO/);
assert.deepEqual(Array.from(parsePageSelection('1-3,2,5',5)),[0,1,2,4]);
assert.throws(()=>parsePageSelection('6',5),/entre 1 e 5/);
const doc=await PDFDocument.create();
const page=doc.addPage([400,600]);const font=await doc.embedFont(StandardFonts.Helvetica);page.drawText('Teste Caixota PDF',{x:40,y:500,font,size:20});
const bytes=await doc.save({useObjectStreams:false});
const parsed=await PDFDocument.load(bytes,{ignoreEncryption:false});
const compressed=await parsed.save({useObjectStreams:true});
const reopened=await PDFDocument.load(compressed,{ignoreEncryption:false});
assert.equal(reopened.getPageCount(),1);
assert.equal(reopened.getPage(0).getWidth(),400);
// Identificação de contêiner pelo cabeçalho, sem inferir codecs.
const videoSource=fs.readFileSync(path.join(root,'video-tools.js'),'utf8');
const begin=videoSource.indexOf('async function detectVideoContainer(file)');
const end=videoSource.length;
assert(begin>=0 && end>begin);
const videoCtx=vm.createContext({Uint8Array, String});
vm.runInContext(videoSource.slice(begin,end),videoCtx);
const headerFile=(bytes,name)=>({name,slice:()=>({arrayBuffer:async()=>Uint8Array.from(bytes).buffer})});
// Executa função já definida no ambiente de teste.
const detected=await videoCtx.detectVideoContainer(headerFile([0x1a,0x45,0xdf,0xa3],'movie.mkv'));
assert.match(detected,/Matroska/);
const mp4=await videoCtx.detectVideoContainer(headerFile([0,0,0,0,102,116,121,112],'movie.mp4'));
assert.match(mp4,/MP4/);
assert(local.includes('fallback=setTimeout(()=>finish(null)'), 'Roleta sem finalização de segurança');
assert(local.includes('WHEEL_PALETTES') && local.includes('wheelSafePrefs'), 'Paletas ou preferências não configuradas');
assert(local.includes('caixota-wheel-dialog') && local.includes('caixota-wheel-confetti-piece'), 'Popup ou confetes ausentes');
assert(local.includes('soundStart') && local.includes('soundSpin') && local.includes('soundWin'), 'Opções de áudio incompletas');
assert(videoSource.includes('["59.94","59,94 FPS"]') && videoSource.includes('["60","60 FPS"]'), 'FPS 59,94 e 60 ausentes');
assert(videoSource.includes('Math.min(60, Number(options.fps)'), 'Limite interno de 60 FPS modificado');

const safePalette = run('wheelSafePrefs({palette:"custom",duration:99, title:"test",showTitle:true,customColors:["#ff0000","invalid","#00ff00","#0000ff"]})');
assert.equal(safePalette.palette, 'custom');
assert.equal(safePalette.duration, 15);
assert.equal(safePalette.customColors[1], '#d946ef');
assert.equal(safePalette.showTitle,true);
const defaultWheel = run('wheelSafePrefs(null)');
assert.equal(defaultWheel.duration,5);
assert.equal(defaultWheel.soundEnabled,false);
assert.equal(defaultWheel.confetti,true);
assert.equal(run('wheelTextColor("#ffffff")'), '#172333');
assert.equal(run('wheelTextColor("#000000")'), '#ffffff');

const pdfTools=fs.readFileSync(path.join(root,'pdf-tools.js'),'utf8');
assert(pdfTools.includes('ctx.clearRect(0,0,700,180)'), 'Canvas de assinatura não transparente');
for(const f of ['local-tools.css','video-tools.css','pdf-tools.css','panel.css'])assert(fs.existsSync(path.join(root,f)));
console.log('OK: Manifest V3, versão, catálogo, migração de senha, HTML, WebCrypto 32/53 bits, UUID v4/v7, dados fictícios, PDF e regressões visuais estáticas.');
console.log('Ferramentas por categoria:',Object.fromEntries(Object.entries(CATEGORY_CATALOGS).map(([cat,list])=>[cat,list.length])));

// Caixota 0.3.0: functional migration checks.
const newPanel=fs.readFileSync(path.join(root,'panel.html'),'utf8');
const shell=fs.readFileSync(path.join(root,'shell.js'),'utf8');
const manifestText=fs.readFileSync(path.join(root,'manifest.json'),'utf8');
assert(newPanel.includes('shell.js')&&newPanel.includes('themes-v3.css'),'Shell novo ausente');
assert(shell.includes('id=\"v3WorkbenchFrame\"')&&fs.existsSync(path.join(root,'workbench.html')),'Motor legado indisponível');
assert(shell.includes('isDirectTool(t)')&&shell.includes("['video','pdf'].includes(t?.category)"),'Roteamento dos conversores incompleto');
assert(shell.includes('data-v3-theme')&&shell.includes('data-v3-context-id'),'Temas ou ferramentas contextuais ausentes');
assert(manifest.commands._execute_action.suggested_key.default==='Ctrl+Period','Atalho padrão incorreto');
for(const theme of ['glass-light','glass-dark','oled','warm','aero'])assert(fs.readFileSync(path.join(root,'themes-v3.css'),'utf8').includes(`data-preset="${theme}"`),`Tema ausente ${theme}`);
assert(fs.readFileSync(path.join(root,'workbench-bridge.js'),'utf8').includes('caixota:open-direct-tool'),'Integração com processadores originais ausente');
assert(fs.readFileSync(path.join(root,'content-v3.js'),'utf8').includes('caixotaUiV3'),'Popup contextual não segue o novo tema');
assert(fs.readFileSync(path.join(root,'context-demo.js'),'utf8').includes('caixotaUiV3'),'Laboratório não segue o novo tema');
assert(!manifestText.includes('default_popup'),'Clique no ícone deve abrir o painel diretamente');
assert(fs.readFileSync(path.join(root,'shell.js'),'utf8').includes("state.theme==='dark'?'glass-light':'glass-dark'"),'Atalho de tema não alterna apenas claro e escuro');
assert(fs.readFileSync(path.join(root,'shell.js'),'utf8').includes('data-profile-upload'),'Edição de foto do perfil ausente');
assert(fs.readFileSync(path.join(root,'assets/speed-test.mjs'),'utf8').includes('speed.cloudflare.com'),'Ferramenta de medição de velocidade ausente');
assert(manifest.host_permissions.includes('https://speed.cloudflare.com/*'),'Permissão do servidor ausente');
assert(shell.includes('cx-release-carousel')&&shell.includes('utility-speed-test'),'Carrossel ou Utilitários não integrados');
assert(fs.readFileSync(path.join(root,'assets/real-state.mjs'),'utf8').includes('retro-90'),'Tema 90s indisponível');
assert(!fs.readFileSync(path.join(root,'assets/module-ui.mjs'),'utf8').includes('EXPLORE O QUE VEM POR AÍ'),'Seção removida voltou');
console.log('OK v0.3.2: temas e alternância, novo perfil, Utilitários, carrossel e ferramenta de velocidade.');

// 0.3.2 regression and safety checks.
const speed=fs.readFileSync(path.join(root,'assets/speed-test.mjs'),'utf8');
assert(speed.includes('MIN_TEST_MS=15000'),'Velocímetro deve durar quinze segundos');
assert(speed.includes('async function download(deadline)')&&speed.includes('async function upload(deadline)'),'Medição por janela de tempo ausente');
assert(!speed.includes('finishWindow()'),'O modo de espera sem medição deve ser removido');
assert(shell.includes('caixotaNotificationsV3')&&shell.includes('renderNotices'),'Central de notificações ausente');
assert(!shell.includes('<div class="sidebar-note">'),'Cartão promocional não foi removido');
assert(shell.includes('data-profile-upload="banner"'),'Banner editável ausente');
assert(shell.includes('cx-edit-tag-color')&&shell.includes('cx-edit-link-url'),'Tags e links ausentes');
assert(shell.includes('data-donation-copy')&&shell.includes('QR Code Pix para doações'),'Página de doação incompleta');
assert(!fs.readFileSync(path.join(root,'background.js'),'utf8').includes('OPEN_MEDIA_DOWNLOADER'),'Baixador antigo continua ativo');
console.log('OK v0.3.2: editor de perfil, centro de notificações, teste prolongado, doações e desempenho.');

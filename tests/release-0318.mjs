import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DEFAULT_UI,DEFAULT_TOPBAR,normalizeUi,loadSnapshot,updateUi} from '../assets/real-state.mjs';
import {t} from '../assets/shell-locale.mjs';
const read=(name)=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const manifest=JSON.parse(read('manifest.json'));
assert.equal(manifest.version,'0.3.18');
assert.equal(manifest.description,'Já pensou se todas as ferramentas mais úteis da internet se reunissem em um único lugar? Conheça a Caixota! :D');
assert.equal(DEFAULT_UI.theme,'glass-light','Primeira instalação começa no tema claro');
assert.equal(normalizeUi().theme,'glass-light');
for(const file of ['background.js','panel.js','content.js']){
 assert.match(read(file),/const DEFAULT_SETTINGS = \{[\s\S]*?theme: \"light\"/,`Padrão claro no ${file}`);
}
assert.match(read('context-test-page.mjs'),/THEMES.has\(ui.theme\)\?ui.theme:'glass-light'/);
assert.match(read('content-v3.js'),/theme:'glass-light'/);
assert.match(read('workbench.html'),/class=\"cx-workbench\" data-theme=\"light\"/);
assert.equal(normalizeUi({theme:'oled'}).theme,'oled','Não apagar escolhas anteriores');
assert.equal(normalizeUi({theme:'cyberpunk'}).theme,'cyberpunk');
assert.deepEqual(normalizeUi().topbar,DEFAULT_TOPBAR);
for (const key of ['search','performance','language','notifications','sound','theme','profile']) {
 assert.equal(normalizeUi().topbar[key],true);
 assert.equal(normalizeUi({topbar:{[key]:false}}).topbar[key],false,`Ocultar ${key}`);
}
assert.equal(normalizeUi({topbar:{language:false,extraKey:false}}).topbar.language,false);
assert.equal(Object.hasOwn(normalizeUi({topbar:{extraKey:false}}).topbar,'extraKey'),false);
const records={caixotaUiV3:{theme:'oled',topbar:{language:false}},tremSettings:{theme:'oled',customFlag:true}};
globalThis.chrome={storage:{local:{get:async keys=>Object.fromEntries([keys].flat().filter(k=>Object.hasOwn(records,k)).map(k=>[k,records[k]])),set:async vals=>Object.assign(records,vals)}}};
assert.equal((await loadSnapshot()).ui.theme,'oled');
const updated=await updateUi({topbar:{...normalizeUi(records.caixotaUiV3).topbar,search:false}});
assert.equal(updated.theme,'oled');
assert.equal(updated.topbar.language,false);
assert.equal(updated.topbar.search,false);
assert.equal(records.tremSettings.customFlag,true);
assert.equal(records.tremSettings.theme,'oled');
for (const lang of ['en','de','es','fr','it','nl','ru','ko','pl']) {
 assert.notEqual(t('Traduções em fase de testes',lang),'Traduções em fase de testes',`Aviso localizado: ${lang}`);
 assert.notEqual(t('Mostrar todos os botões',lang),'Mostrar todos os botões',`Configuração localizada: ${lang}`);
}
const shell=read('shell.js'),bridge=read('workbench-bridge.js'),skin=read('workbench-skin.css'),theme=read('themes-v3.css');
assert.match(shell,/data-v3-topbar-all/);
assert.match(shell,/data-v3-topbar="\$\{key\}"/);
assert.match(shell,/showTopbar\('search'\)/);
assert.match(shell,/showTopbar\('notifications'\)/);
assert.match(shell,/showTopbar\('theme'\)/);
assert.match(shell,/showTopbar\('profile'\)/);
assert.match(shell,/class="cx-translation-notice" role="note"/);
assert.match(shell,/getComputedStyle\(document\.documentElement\)\.getPropertyValue\('--bg'\)/);
assert.match(shell,/CSS\.supports\('color',background\)/);
assert.match(bridge,/--cx-workbench-canvas/);
assert.match(bridge,/CSS\.supports\('color',e\.data\.background\)/);
assert.match(skin,/body\.cx-workbench\[data-theme-v3\]\{background:var\(--cx-workbench-canvas/);
assert.match(theme,/\.cx-tool-page #v3WorkbenchFrame\{background:var\(--bg\)!important/);
console.log('OK: novo padrão claro, tema salvo, botões independentes, avisos localizados e fundo temático do workbench.');

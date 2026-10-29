import assert from 'node:assert/strict';
import fs from 'node:fs';
import {measureWorkbenchHeight} from '../assets/workbench-size.mjs';
const read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
function mockScreen(top,bottom,scrollHeight=bottom-top,visible=true){
 return {scrollHeight,getClientRects:()=>visible?[{}]:[],getBoundingClientRect:()=>({top,bottom,height:bottom-top})};
}
function mockDocument(screens){
 const active={querySelectorAll:()=>screens};
 const page={querySelector:()=>active};
 return {querySelector:key=>key==='.app-main'?page:null,defaultView:{scrollY:0,getComputedStyle:()=>({display:'block',visibility:'visible',marginBottom:'0px'})}};
}
assert.equal(measureWorkbenchHeight(mockDocument([mockScreen(0,1030)])),1070,
 'A calculadora de 1030px deve ampliar o iframe além da antiga altura fixa de 850px');
assert.equal(measureWorkbenchHeight(mockDocument([mockScreen(0,1030,1650)])),1690,
 'Conteúdo que ultrapassa a caixa da ferramenta deve ser exibido');
assert.equal(measureWorkbenchHeight(mockDocument([mockScreen(0,1030),mockScreen(900,1700)])),1740,
 'A última ferramenta visível define o limite inferior');
assert.equal(measureWorkbenchHeight(mockDocument([mockScreen(0,1030,1030,false),mockScreen(0,500)])),540,
 'Ferramentas ocultas não podem criar espaços vazios');
const shell=read('shell.js'),bridge=read('workbench-bridge.js'),css=read('assets/v038.css'),skin=read('workbench-skin.css');
assert.match(shell,/measureWorkbenchHeight\(doc\)/);
assert.match(shell,/startToolFrameHeightWatch\(\)/);
assert.match(shell,/stopToolFrameHeightWatch\(\)/);
assert.match(bridge,/measureWorkbenchHeight\(document\)/);
assert.match(bridge,/new ResizeObserver\(scheduleResize\)/);
assert.match(css,/\.cx-tool-page \.cx-tool-workspace.*overflow:visible/s);
assert.match(skin,/html:has\(body\.cx-workbench\), body\.cx-workbench\[data-theme-v3\]/);
console.log('OK: layout sem iframe visual, dimensões intrínsecas e backup de redimensionamento.');

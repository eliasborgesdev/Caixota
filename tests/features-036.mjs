import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {parseDice,rollDice} from '../assets/dice-roller.mjs';
import {detectLink} from '../media/core/extractor.js';
import fs from 'node:fs';
globalThis.crypto??=webcrypto;
for(const expression of ['1d6','2d6','1d20 + 2d4','1d12 + 3d6 + 3','2d4-1d6+8']){
 const terms=parseDice(expression);let dice=terms.filter(t=>t.kind==='dice').reduce((a,b)=>a+b.qty,0);assert(dice>0);
 for(let i=0;i<300;i++){const roll=rollDice(terms);assert.equal(roll.total,roll.detail.reduce((sum,t)=>sum+t.subtotal,0));assert(roll.detail.every(t=>t.kind==='flat'||t.values.every(v=>v>=1&&v<=t.sides)));}
}
for(const invalid of ['1d1','1d0','1000d6','2d6*3','abc','2dd6','2d1001','3d6/4'])assert.throws(()=>parseDice(invalid));
assert.equal(detectLink('https://www.pinterest.com/pin/123456789/').provider.id,'pinterest');
assert.equal(detectLink('https://pin.it/AbCd2').provider.id,'pinterest');
assert.equal(detectLink('https://br.pinterest.com/pin/123/').provider.id,'pinterest');
const root=new URL('../',import.meta.url);const read=x=>fs.readFileSync(new URL(x,root),'utf8');
const shell=read('shell.js');assert(shell.includes("category:'utilities'"));assert(shell.includes("case 'dice':return gameScreen(diceMarkup"));assert(shell.includes("category:queuedTool.id==='generator-wheel'?'generators'"));
assert(shell.includes("case 'termo':return gameScreen(termoMarkup"));
assert(shell.includes("FUN_CATEGORIES=['games','sorteio']"));
assert(read('panel-catalog.mjs').includes('id: "pdf-office"'));
assert(read('video-tools.js').includes('video-editor-timeline'));
assert(read('productivity-tools.css').includes('background:var(--swatch-color)!important'));
assert(read('assets/speed-test.mjs').includes('async function download(deadline)'));
console.log('OK: expressões de RPG, distribuição dos dados, Pinterest e integração dos novos recursos.');

import assert from 'node:assert/strict';
import {ticResult,bestTicMove,normalizeLetter} from '../assets/board-games.mjs';
assert.equal(normalizeLetter('AVIÃO'),'AVIAO');
assert.deepEqual(ticResult(['X','X','X','O','','O','','','']),{winner:'X',line:[0,1,2]});
let leaves=0;
function explore(board,turn){const end=ticResult(board);if(end){assert.notEqual(end.winner,'X','A IA perdeu');leaves++;return;}if(turn==='O'){const i=bestTicMove(board,'O');const next=[...board];next[i]='O';explore(next,'X');}else for(let i=0;i<9;i++)if(!board[i]){const next=[...board];next[i]='X';explore(next,'O');}}
explore(Array(9).fill(''),'X');explore(Array(9).fill(''),'O');
console.log('PASS: acentos, vencedor e IA sem derrota em todas as sequências humanas; finais:',leaves);

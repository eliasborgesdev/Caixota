import {imagem} from './imagem.js';
/**
 * tools/index.js — REGISTRO DAS FERRAMENTAS (lado "dados": definições).
 * ---------------------------------------------------------------------------
 * Usado pela página de opções e pelo background.
 * Para ADICIONAR uma ferramenta: importe o definicao.js dela aqui e coloque
 * na lista. (Veja "Como criar uma nova ferramenta" em INTEGRACAO.md.)
 * Para REMOVER: apague a linha (e as equivalentes em handlers.js e no manifest).
 */
import { definicao as verificar } from './verificar/definicao.js';
import { definicao as resumir } from './resumir/definicao.js';
import { definicao as reescrever } from './reescrever/definicao.js';
import { definicao as dicionario } from './dicionario/definicao.js';
import { definicao as explicar } from './explicar/definicao.js';

/** Ordenadas pelo campo `ordem` (é a ordem na página de opções). */
export const DEFINICOES = [verificar, resumir, reescrever, dicionario, explicar, imagem].sort((a, b) => a.ordem - b.ordem);

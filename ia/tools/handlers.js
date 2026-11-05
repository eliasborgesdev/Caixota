import {executar as imagem} from './imagem.js';
/**
 * tools/handlers.js — REGISTRO DAS FERRAMENTAS (lado "execução": service worker).
 * Mapeia id → função executar(). Só o background importa este arquivo.
 * Mantenha em sincronia com tools/index.js.
 */
import { executar as verificar } from './verificar/background.js';
import { executar as resumir } from './resumir/background.js';
import { executar as reescrever } from './reescrever/background.js';
import { executar as dicionario } from './dicionario/background.js';
import { executar as explicar } from './explicar/background.js';

export const HANDLERS = { verificar, resumir, reescrever, dicionario, explicar, imagem };

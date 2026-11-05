/**
 * tools/verificar/background.js — handler da ferramenta "Verificar".
 * O trabalho pesado está em pipeline.js (busca de fontes + resumo pela IA).
 */
import { verificar } from './pipeline.js';

export async function executar({ texto, settings, signal, onProgress }) {
  return verificar({ texto, settings, signal, onProgress });
}

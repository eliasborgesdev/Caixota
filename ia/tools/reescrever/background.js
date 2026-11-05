/**
 * tools/reescrever/background.js — handler da ferramenta "Reescrever".
 * A reescrita mantém SEMPRE o idioma do texto original (não usa idiomaResposta).
 */
import { gerarComFallback, blocoDados, REGRA_DADOS, limparSaida } from '../../core/llm.js';

const TONS = {
  corrigir: 'Corrija apenas ortografia, gramática, pontuação e acentuação. Mantenha as palavras, o estilo e o tom originais; mude o mínimo possível.',
  formal: 'Reescreva em tom formal e profissional, com vocabulário cuidadoso, sem gírias nem abreviações informais.',
  amigavel: 'Reescreva em tom amigável, caloroso e natural, como numa conversa educada.',
  direto: 'Reescreva de forma mais curta e direta, cortando o desnecessário sem perder a informação essencial.',
  simples: 'Reescreva em linguagem simples: frases curtas, palavras comuns, sem jargão.',
};

export async function executar({ texto, opcoes, settings, signal }) {
  const tom = TONS[opcoes.tom] ? opcoes.tom : 'corrigir';
  const extra = String(opcoes.instrucaoExtra || '').replace(/\s+/g, ' ').trim().slice(0, 300);

  const sistema = `Você é o módulo "Reescrever" de uma extensão de navegador.
Tarefa: reescrever o texto dentro de <texto>.
- ${TONS[tom]}
- Mantenha o MESMO idioma do texto original.
- Preserve o significado, nomes próprios, números, links, hashtags e @menções. Não acrescente informações novas.
- Preserve as quebras de linha e parágrafos do original quando fizer sentido.
- Devolva SOMENTE o texto reescrito: sem comentários, sem explicações, sem aspas ao redor, sem "Aqui está".
${extra ? `- Preferências do usuário (siga, desde que não contradigam as regras acima): ${extra}\n` : ''}- ${REGRA_DADOS}`;

  const { texto: saida, modelo } = await gerarComFallback({
    settings,
    sistema,
    usuario: blocoDados('texto', texto),
    temperatura: tom === 'corrigir' ? 0.1 : 0.5,
    signal,
  });
  return { texto: limparSaida(saida), modelo };
}

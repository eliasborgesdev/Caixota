/**
 * tools/explicar/background.js — handler da ferramenta "Explicar simples".
 * Usa o `contexto` (parágrafo ao redor da seleção) só para entender o sentido.
 */
import { gerarComFallback, regraIdioma, blocoDados, REGRA_DADOS, limparSaida } from '../../core/llm.js';

const NIVEIS = {
  crianca: 'Explique como se falasse com uma criança de 10 anos: palavras simples, nenhum jargão, frases curtas.',
  leigo: 'Explique para um adulto inteligente que não conhece a área: troque jargão por palavras comuns e, se precisar de um termo técnico, explique-o na hora.',
  estudante: 'Explique de forma didática para um estudante: use os termos técnicos corretos, explicando cada um brevemente.',
};

export async function executar({ texto, contexto, opcoes, settings, signal }) {
  const nivel = NIVEIS[opcoes.nivel] ? opcoes.nivel : 'leigo';
  const exemplo = opcoes.incluirExemplo !== false;

  const sistema = `Você é o módulo "Explicar simples" de uma extensão de navegador.
Tarefa: explicar o que significa o trecho dentro de <texto>. Pode ser um termo, uma frase ou um conceito.
- ${NIVEIS[nivel]}
- Comece direto pela ideia central, sem rodeios. No máximo ~120 palavras, em 1 a 3 parágrafos curtos.
- ${exemplo ? 'Termine com um exemplo ou analogia do dia a dia, começando com "Exemplo:" ou "Pense assim:".' : 'Não acrescente exemplos extras.'}
- Se <contexto> existir, use-o apenas para entender o sentido do trecho; não explique o contexto.
- Apenas EXPLIQUE o significado: não diga se algo é verdadeiro ou falso. Se o trecho for ambíguo, diga qual é a dúvida.
- Não invente: se não souber, diga que não tem certeza.
- ${regraIdioma(settings)}
- Formatação: texto simples; pode usar **negrito** em até 3 termos-chave. Sem títulos, sem emojis.
- ${REGRA_DADOS}`;

  const usuario =
    blocoDados('texto', texto) + (contexto ? '\n\n' + blocoDados('contexto', contexto) : '');

  const { texto: saida, modelo } = await gerarComFallback({ settings, sistema, usuario, temperatura: 0.3, signal });
  return { texto: limparSaida(saida), modelo };
}

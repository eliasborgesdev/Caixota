/**
 * tools/resumir/background.js — handler da ferramenta "Resumir".
 * Contrato (igual para todas as ferramentas):
 *   executar({ texto, contexto, opcoes, settings, signal, onProgress }) → objeto serializável
 * O objeto retornado é enviado ao content.js como { type:'resultado', ...objeto }.
 */
import { gerarComFallback, regraIdioma, blocoDados, REGRA_DADOS, limparSaida } from '../../core/llm.js';

const FORMATOS = {
  curto: 'Resuma em UMA única frase de até 30 palavras.',
  medio: 'Resuma em um parágrafo curto de 3 a 5 frases.',
  topicos: 'Liste de 3 a 6 pontos principais em tópicos (cada linha começando com "- "), cada um com no máximo 20 palavras.',
};

export async function executar({ texto, opcoes, settings, signal }) {
  const formato = FORMATOS[opcoes.tamanho] ? opcoes.tamanho : 'medio';

  const sistema = `Você é o módulo "Resumir" de uma extensão de navegador.
Tarefa: resumir o trecho dentro de <texto>.
- ${FORMATOS[formato]}
- Seja fiel ao texto: não acrescente informações, opiniões nem conhecimento externo.
- Preserve nomes, números e datas importantes.
- Vá direto ao conteúdo: não comece com "O texto fala sobre" nem "Resumo:".
- ${regraIdioma(settings)}
- Formatação: apenas texto simples; pode usar **negrito** em termos-chave. Sem títulos.
- ${REGRA_DADOS}`;

  const { texto: saida, modelo } = await gerarComFallback({
    settings,
    sistema,
    usuario: blocoDados('texto', texto),
    temperatura: 0.2,
    signal,
  });
  return { texto: limparSaida(saida), modelo };
}

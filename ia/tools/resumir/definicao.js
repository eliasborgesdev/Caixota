/**
 * tools/resumir/definicao.js — DESCRIÇÃO DA FERRAMENTA (dados puros, sem imports).
 * ---------------------------------------------------------------------------
 * Este arquivo é lido pela página de opções (para montar o cartão da ferramenta
 * sozinha) e pelo background (limites e valores padrão).
 *
 * Campos:
 *  id         identificador único (também é o nome da pasta e a chave no storage)
 *  nome       nome exibido nas opções
 *  descricao  uma frase explicando o que faz
 *  ordem      posição na barra (menor = mais à esquerda)
 *  limites    { min, max } de caracteres que o background aceita
 *             (o content.js declara os mesmos limites para decidir quando mostrar o botão)
 *  padroes    valores iniciais das configurações da ferramenta
 *  campos     o que o usuário pode configurar. Cada campo:
 *               chave   nome da configuração (vira opcoes.<chave> no background)
 *               tipo    'select' | 'checkbox' | 'texto' | 'textoLongo' | 'senha'
 *               rotulo, ajuda, placeholder
 *               opcoes  (select) lista de [valor, rótulo]
 *               global  (opcional) true = grava no nível raiz do storage, não dentro da ferramenta
 */
export const definicao = {
  id: 'resumir',
  nome: 'Resumir',
  descricao: 'Resume o trecho selecionado em uma frase, em um parágrafo ou em tópicos.',
  ordem: 20,
  limites: { min: 200, max: 15000 },
  padroes: { ativa: true, tamanho: 'medio' },
  campos: [
    {
      chave: 'tamanho',
      tipo: 'select',
      rotulo: 'Formato padrão do resumo',
      opcoes: [
        ['curto', 'Uma frase'],
        ['medio', 'Parágrafo curto'],
        ['topicos', 'Tópicos'],
      ],
      ajuda: 'Você ainda pode trocar o formato dentro do popup.',
    },
  ],
};

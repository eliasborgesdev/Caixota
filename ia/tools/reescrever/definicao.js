/**
 * tools/reescrever/definicao.js — descrição da ferramenta "Reescrever".
 * (Formato dos campos explicado em tools/resumir/definicao.js)
 */
export const definicao = {
  id: 'reescrever',
  nome: 'Reescrever',
  descricao: 'Corrige ou reescreve o trecho em outro tom. Em campos de texto, substitui o que você selecionou.',
  ordem: 30,
  limites: { min: 4, max: 5000 },
  padroes: { ativa: true, tom: 'corrigir', instrucaoExtra: '' },
  campos: [
    {
      chave: 'tom',
      tipo: 'select',
      rotulo: 'Tom padrão',
      opcoes: [
        ['corrigir', 'Só corrigir (ortografia e gramática)'],
        ['formal', 'Formal'],
        ['amigavel', 'Amigável'],
        ['direto', 'Mais curto e direto'],
        ['simples', 'Linguagem simples'],
      ],
      ajuda: 'Você ainda pode trocar o tom dentro do popup.',
    },
    {
      chave: 'instrucaoExtra',
      tipo: 'textoLongo',
      rotulo: 'Preferências de escrita (opcional)',
      placeholder: 'Ex.: Trate o leitor por "você". Evite gírias. Use frases curtas.',
      ajuda: 'Suas preferências são aplicadas em todas as reescritas.',
    },
  ],
};

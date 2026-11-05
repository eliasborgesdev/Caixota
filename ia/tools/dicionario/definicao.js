/**
 * tools/dicionario/definicao.js — descrição da ferramenta "Dicionário inteligente".
 * (Formato dos campos explicado em tools/resumir/definicao.js)
 */
export const definicao = {
  id: 'dicionario',
  nome: 'Dicionário inteligente',
  descricao: 'Mostra o significado da palavra NO CONTEXTO da frase, além de outros sentidos, sinônimos e exemplos.',
  ordem: 40,
  limites: { min: 2, max: 50 },
  padroes: { ativa: true, mostrarSinonimos: true, mostrarExemplos: true, mostrarOrigem: false },
  campos: [
    { chave: 'mostrarSinonimos', tipo: 'checkbox', rotulo: 'Mostrar sinônimos' },
    { chave: 'mostrarExemplos', tipo: 'checkbox', rotulo: 'Mostrar frases de exemplo' },
    { chave: 'mostrarOrigem', tipo: 'checkbox', rotulo: 'Mostrar origem da palavra (etimologia)' },
  ],
};

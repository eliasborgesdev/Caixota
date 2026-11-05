/**
 * tools/explicar/definicao.js — descrição da ferramenta "Explicar simples".
 * (Formato dos campos explicado em tools/resumir/definicao.js)
 */
export const definicao = {
  id: 'explicar',
  nome: 'Explicar simples',
  descricao: 'Explica o trecho (termo, frase ou conceito) em linguagem fácil, com um exemplo do dia a dia.',
  ordem: 50,
  limites: { min: 3, max: 1500 },
  padroes: { ativa: true, nivel: 'leigo', incluirExemplo: true },
  campos: [
    {
      chave: 'nivel',
      tipo: 'select',
      rotulo: 'Nível padrão da explicação',
      opcoes: [
        ['crianca', 'Como para uma criança de 10 anos'],
        ['leigo', 'Para quem não é da área'],
        ['estudante', 'Didático, com termos técnicos explicados'],
      ],
      ajuda: 'Você ainda pode trocar o nível dentro do popup.',
    },
    {
      chave: 'incluirExemplo',
      tipo: 'checkbox',
      rotulo: 'Terminar com um exemplo ou analogia do dia a dia',
    },
  ],
};

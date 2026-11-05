/**
 * tools/verificar/definicao.js — "Verificar" (o IA da Caixota original).
 * Dados puros (sem imports): lidos pela página de opções e pelo background.
 * Veja tools/resumir/definicao.js para a descrição de cada campo.
 */
export const definicao = {
  id: 'verificar',
  nome: 'Verificar',
  descricao: 'Pesquisa o trecho na web e responde com um veredito e fontes, como o "Modo IA" do Google.',
  ordem: 10,
  limites: { min: 8, max: 1500 },
  padroes: { ativa: true },
  campos: [
    {
      chave: 'useWikipedia',
      global: true,
      tipo: 'checkbox',
      rotulo: 'Usar a Wikipédia como fonte',
      ajuda: 'Grátis e sem chave. É a fonte sempre disponível.',
    },
    {
      chave: 'useGrounding',
      global: true,
      tipo: 'checkbox',
      rotulo: 'Usar a busca do Google',
      ajuda: 'Traz mais fontes da web quando o seu plano gratuito permitir. Se não estiver disponível, é ignorada sozinha.',
    },
    {
      chave: 'braveKey',
      global: true,
      tipo: 'senha',
      rotulo: 'Chave do Brave Search API (opcional)',
      placeholder: 'BSA…',
      ajuda: 'Melhora muito para notícias e assuntos atuais. O Brave oferece US$ 5 de crédito mensal; confira as regras em brave.com/search/api.',
    },
  ],
};

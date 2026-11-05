/**
 * tools/resumir/content.js — interface da ferramenta "Resumir".
 * Usa o atalho TT.criarFerramentaTexto: só declaramos o que é específico.
 */
(() => {
  'use strict';
  const TT = globalThis.__TT;
  if (!TT) return;

  TT.registrar(
    TT.criarFerramentaTexto({
      id: 'resumir',
      nome: 'Resumir',
      subtitulo: 'Resumo do trecho selecionado',
      ordem: 20,
      minChars: 200, //     mesmos limites de definicao.js
      maxChars: 15000,
      icone:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h6"/></svg>',
      padroes: { tamanho: 'medio' }, // = definicao.js
      rotuloCarregando: 'Lendo e resumindo…',
      controles: [
        {
          chave: 'tamanho',
          rotulo: 'Formato',
          opcoes: [
            ['curto', 'Uma frase'],
            ['medio', 'Parágrafo'],
            ['topicos', 'Tópicos'],
          ],
          padrao: 'medio',
        },
      ],
    })
  );
})();

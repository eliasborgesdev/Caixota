/**
 * tools/reescrever/content.js — interface da ferramenta "Reescrever".
 * Extra: quando o texto foi selecionado dentro de um campo editável
 * (textarea, input, contenteditable), aparece o botão "Substituir no campo".
 */
(() => {
  'use strict';
  const TT = globalThis.__TT;
  if (!TT) return;

  TT.registrar(
    TT.criarFerramentaTexto({
      id: 'reescrever',
      nome: 'Reescrever',
      subtitulo: 'Corrige ou muda o tom do texto',
      ordem: 30,
      minChars: 4, //     mesmos limites de definicao.js
      maxChars: 5000,
      icone:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      padroes: { tom: 'corrigir' }, // = definicao.js
      rotuloCarregando: 'Reescrevendo…',
      controles: [
        {
          chave: 'tom',
          rotulo: 'Tom',
          opcoes: [
            ['corrigir', 'Corrigir'],
            ['formal', 'Formal'],
            ['amigavel', 'Amigável'],
            ['direto', 'Mais direto'],
            ['simples', 'Simples'],
          ],
          padrao: 'corrigir',
        },
      ],
      acoes: [
        {
          rotulo: 'Substituir no campo',
          pri: true,
          visivel: (ctx) => ctx.podeSubstituir,
          aoClicar: (ctx, r) => {
            if (ctx.substituir(r.texto)) ctx.fechar();
          },
        },
      ],
    })
  );
})();

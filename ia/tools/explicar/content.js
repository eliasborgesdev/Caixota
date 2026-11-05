/**
 * tools/explicar/content.js — interface da ferramenta "Explicar simples".
 * Envia também o parágrafo ao redor da seleção (usaContexto) para a IA
 * entender o sentido do trecho.
 */
(() => {
  'use strict';
  const TT = globalThis.__TT;
  if (!TT) return;

  TT.registrar(
    TT.criarFerramentaTexto({
      id: 'explicar',
      nome: 'Explicar',
      subtitulo: 'Explicação em linguagem simples',
      ordem: 50,
      minChars: 3, //     mesmos limites de definicao.js
      maxChars: 1500,
      truncar: true,
      usaContexto: true,
      icone:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
      padroes: { nivel: 'leigo' }, // = definicao.js
      rotuloCarregando: 'Pensando em como explicar…',
      controles: [
        {
          chave: 'nivel',
          rotulo: 'Nível',
          opcoes: [
            ['crianca', 'Criança de 10 anos'],
            ['leigo', 'Leigo'],
            ['estudante', 'Estudante'],
          ],
          padrao: 'leigo',
        },
      ],
    })
  );
})();

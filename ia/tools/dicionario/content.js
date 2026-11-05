/**
 * tools/dicionario/content.js — interface da ferramenta "Dicionário inteligente".
 * Recebe do background: { dados: {palavra, classe, significadoContexto, ...} | null, texto }
 * Se `dados` for null (a IA não devolveu um verbete utilizável), mostra o texto cru.
 */
(() => {
  'use strict';
  const TT = globalThis.__TT;
  if (!TT) return;
  const { el } = TT.ui;

  TT.adicionarCSS(`
    .dic-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; margin-bottom: 10px; }
    .dic-word { font-size: 22px; font-weight: 800; letter-spacing: -.2px; }
    .dic-pill { padding: 2px 10px; border-radius: 999px; background: var(--accent-soft); color: var(--accent);
                font-size: 12px; font-weight: 700; }
    .dic-pron { color: var(--fg2); font-size: 13px; }
    .dic-tr { margin: -4px 0 10px; color: var(--fg2); }
    .dic-tr b { color: var(--fg); }
    .dic-ctx { margin: 0 0 12px; padding: 10px 12px; border-radius: 10px; background: var(--accent-soft); }
    .dic-ctx small { display: block; margin-bottom: 2px; font-size: 11px; font-weight: 800; letter-spacing: .6px;
                     text-transform: uppercase; color: var(--accent); }
    .dic-sec { margin: 12px 0 4px; font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: var(--fg2); }
    .dic-box ol, .dic-box ul { margin: 0; padding-left: 20px; }
    .dic-box li { margin: 3px 0; }
    .dic-box .ex { font-style: italic; color: var(--fg2); }
    .syn { display: flex; flex-wrap: wrap; gap: 6px; }
    .syn span { padding: 3px 10px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg); font-size: 13px; }
  `);

  function secao(titulo, conteudo) {
    return [el('div', { class: 'dic-sec', text: titulo }), conteudo];
  }

  function verbete(d) {
    const nos = [];
    nos.push(
      el('div', { class: 'dic-head' }, [
        el('span', { class: 'dic-word', text: d.palavra || '—' }),
        d.classe ? el('span', { class: 'dic-pill', text: d.classe }) : null,
        d.pronuncia ? el('span', { class: 'dic-pron', text: `/${d.pronuncia}/` }) : null,
      ])
    );
    if (d.traducao) nos.push(el('div', { class: 'dic-tr' }, ['Tradução: ', el('b', { text: d.traducao })]));
    if (d.significadoContexto) {
      nos.push(el('div', { class: 'dic-ctx' }, [el('small', { text: 'Neste contexto' }), d.significadoContexto]));
    }
    if (d.definicoes.length) {
      const ol = el('ol');
      d.definicoes.forEach((x) => ol.append(el('li', { text: x })));
      nos.push(...secao('Significados', ol));
    }
    if (d.sinonimos.length) {
      const wrap = el('div', { class: 'syn' });
      d.sinonimos.forEach((x) => wrap.append(el('span', { text: x })));
      nos.push(...secao('Sinônimos', wrap));
    }
    if (d.exemplos.length) {
      const ul = el('ul');
      d.exemplos.forEach((x) => ul.append(el('li', { class: 'ex', text: x })));
      nos.push(...secao('Exemplos', ul));
    }
    if (d.origem) nos.push(...secao('Origem', el('div', { text: d.origem })));
    return el('div', { class: 'dic-box' }, nos);
  }

  TT.registrar(
    TT.criarFerramentaTexto({
      id: 'dicionario',
      nome: 'Dicionário',
      subtitulo: 'Significado no contexto',
      ordem: 40,
      minChars: 2, //     mesmos limites de definicao.js
      maxChars: 50,
      usaContexto: true,
      icone:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
      padroes: {},
      rotuloCarregando: 'Consultando o dicionário…',
      // O verbete inteiro fica dentro da caixa copiável (clique = copiar).
      renderizar: (ctx, r) =>
        ctx.ui.caixaCopiavel([r.dados ? verbete(r.dados) : ctx.ui.renderizarTexto(r.texto)], () => r.texto),
    })
  );
})();

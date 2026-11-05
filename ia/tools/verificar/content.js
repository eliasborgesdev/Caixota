/**
 * tools/verificar/content.js — interface da ferramenta "Verificar".
 * Depende de core/content-core.js (carregado antes no manifest).
 *
 * Mostra: veredito + resposta da IA (clique para copiar) + lista de fontes.
 * Resultado esperado do background (ver tools/verificar/pipeline.js):
 *   { veredito, resposta, fontes:[{titulo,url,dominio,trecho,origem}], aviso, modelo }
 */
(() => {
  'use strict';
  const TT = globalThis.__TT;
  if (!TT) return; // núcleo ausente: nada a fazer
  const { el, urlHttp } = TT.ui;

  const ROTULOS_VEREDITO = {
    apoiado: 'Apoiado pelas fontes',
    contradito: 'Contradito pelas fontes',
    parcial: 'Parcialmente correto',
    inconclusivo: 'Inconclusivo',
    informativo: 'Informativo',
  };
  const ETAPAS = {
    buscando: 'Buscando fontes na web…',
    analisando: 'Lendo as fontes e escrevendo o resumo…',
  };

  TT.adicionarCSS(`
    .verdict { display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px 5px 10px; border-radius: 999px;
               font-weight: 700; font-size: 13px; margin-bottom: 12px; }
    .verdict::before { content: ""; width: 9px; height: 9px; border-radius: 50%; background: currentColor; }
    .v-apoiado { color: var(--ok); background: var(--ok-bg); }
    .v-contradito { color: var(--bad); background: var(--bad-bg); }
    .v-parcial { color: var(--mid); background: var(--mid-bg); }
    .v-inconclusivo { color: var(--neu); background: var(--neu-bg); }
    .v-informativo { color: var(--inf); background: var(--inf-bg); }

    .warn { margin: 12px 0 0; padding: 9px 12px; border-radius: 10px; background: var(--mid-bg); color: var(--mid);
            font-size: 13px; font-weight: 600; }
    .h { margin: 20px 0 10px; font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: var(--fg2); }
    .srcs { display: grid; gap: 8px; padding: 0; margin: 0 0 14px; list-style: none; }
    .src { display: flex; gap: 12px; padding: 11px 13px; border: 1px solid var(--line); border-radius: 12px;
           text-decoration: none; color: inherit; background: var(--bg); }
    .src:hover { border-color: var(--accent); background: var(--bg2); }
    .src:focus-visible { outline: 3px solid var(--accent-soft); }
    .num { width: 24px; height: 24px; border-radius: 8px; background: var(--accent-soft); color: var(--accent);
           font-weight: 800; font-size: 12px; display: grid; place-items: center; flex: none; }
    .num.g { background: var(--bg3); color: var(--fg2); }
    .stx { min-width: 0; }
    .st { font-weight: 600; font-size: 14px; color: var(--fg); overflow-wrap: anywhere; }
    .sd { font-size: 12px; color: var(--accent); margin-top: 1px; overflow-wrap: anywhere; }
    .ss { font-size: 12.5px; color: var(--fg2); margin-top: 4px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `);

  function blocoResultado(ctx, r) {
    const ui = ctx.ui;
    const nos = [];

    if (r.veredito && ROTULOS_VEREDITO[r.veredito]) {
      nos.push(el('div', { class: `verdict v-${r.veredito}`, text: ROTULOS_VEREDITO[r.veredito] }));
    }

    // Texto que vai para a área de transferência: resposta limpa + lista de fontes.
    const textoCopia = () => {
      const limpa = r.resposta.replace(/\*\*([^*]+)\*\*/g, '$1');
      const rotulo = r.veredito ? `${ROTULOS_VEREDITO[r.veredito]}\n\n` : '';
      const fontes = r.fontes.map((f, i) => `[${i + 1}] ${f.titulo || f.dominio} — ${f.url}`).join('\n');
      return `${rotulo}${limpa}\n\nFontes:\n${fontes}`;
    };
    nos.push(ui.caixaCopiavel([ui.renderizarTexto(r.resposta, r.fontes)], textoCopia));

    if (r.aviso) nos.push(el('div', { class: 'warn', text: r.aviso }));

    nos.push(el('div', { class: 'h', text: `Fontes (${r.fontes.length})` }));
    const lista = el('ol', { class: 'srcs' });
    r.fontes.forEach((f, i) => {
      if (!urlHttp(f.url)) return;
      lista.append(
        el('li', {}, [
          el('a', { class: 'src', href: f.url, target: '_blank', rel: 'noopener noreferrer' }, [
            el('div', { class: `num${f.origem === 'google' ? ' g' : ''}`, text: String(i + 1) }),
            el('div', { class: 'stx' }, [
              el('div', { class: 'st', text: f.titulo || f.dominio }),
              f.dominio && f.dominio !== f.titulo ? el('div', { class: 'sd', text: f.dominio }) : null,
              f.trecho ? el('div', { class: 'ss', text: f.trecho }) : null,
            ]),
          ]),
        ])
      );
    });
    nos.push(lista);
    return nos;
  }

  TT.registrar({
    id: 'verificar',
    nome: 'Verificar',
    subtitulo: 'Resposta rápida com fontes',
    ordem: 10,
    minChars: 8, //    mesmos limites de definicao.js
    maxChars: 1500,
    truncar: true,
    icone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/><path d="M8 10.6l1.9 1.9 3.4-3.7"/></svg>',

    abrir(ctx) {
      const ui = ctx.ui;
      const area = el('div');
      ctx.corpo.append(ui.citacao(ctx.texto), area);

      const rodar = async (forcar) => {
        const c = ui.carregando(ETAPAS.buscando);
        area.replaceChildren(c.no);
        try {
          const r = await ctx.executar({}, { forcar, aoProgresso: (e) => c.atualizar(ETAPAS[e] || ETAPAS.analisando) });
          if (!ctx.ativo()) return;
          area.replaceChildren(...blocoResultado(ctx, r));
        } catch (e) {
          if (!ctx.ativo()) return;
          area.replaceChildren(ui.erro(e.codigo, e.mensagem, () => rodar(true)));
        }
      };
      rodar(false);
    },
  });
})();

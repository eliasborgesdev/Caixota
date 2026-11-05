/**
 * core/content-core.js — NÚCLEO DA INTERFACE (roda dentro das páginas)
 * ---------------------------------------------------------------------------
 * Este arquivo NÃO contém nenhuma ferramenta. Ele fornece:
 *   - detecção de seleção de texto e a BARRA flutuante com um botão por ferramenta;
 *   - o POPUP grande (fecha no X, clicando fora ou com Esc) com ABAS para trocar de ferramenta;
 *   - comunicação com o background (porta "tira-teima") e um cache de respostas;
 *   - helpers de interface para as ferramentas (carregando, erro, caixa copiável...).
 *
 * As ferramentas vivem em tools/<id>/content.js e se registram assim:
 *
 *     globalThis.__TT.registrar({ id, nome, subtitulo, icone, ordem, minChars, maxChars, abrir(ctx) })
 *
 * Ordem de carregamento no manifest: ESTE arquivo primeiro, depois os tools/*.
 *
 * Tudo é autocontido: HTML/CSS dentro de um Shadow DOM (o CSS da página não
 * afeta o popup e vice-versa). O texto vindo da IA NUNCA entra via innerHTML.
 *
 * ---------------------------------------------------------------------------
 * API PÚBLICA (globalThis.__TT)
 * ---------------------------------------------------------------------------
 *  registrar(def)             registra uma ferramenta (ver campos abaixo)
 *  criarFerramentaTexto(def)  atalho para ferramentas "texto entra → texto sai"
 *  adicionarCSS(css)          CSS extra da ferramenta (dentro do Shadow DOM)
 *  ui                         helpers: el, svg, citacao, carregando, erro, chips,
 *                             botao, caixaCopiavel, renderizarTexto, copiar, urlHttp
 *
 * Campos de def (registrar):
 *  id          mesmo id do definicao.js
 *  nome        nome curto (botão e aba)
 *  subtitulo   texto pequeno no cabeçalho do popup
 *  icone       string SVG (viewBox 0 0 24 24, stroke="currentColor")
 *  ordem       posição na barra
 *  minChars / maxChars   tamanho da seleção para a ferramenta aparecer (mesmos do definicao.js)
 *  truncar     true = seleção maior que maxChars é cortada em vez de esconder a ferramenta
 *  usaContexto true = envia também o parágrafo ao redor da seleção
 *  padroes     valores padrão de ctx.config (se o usuário ainda não salvou nada)
 *  abrir(ctx)  desenha a ferramenta dentro do popup
 *
 * ctx (recebido por abrir):
 *  texto, contexto      texto selecionado e parágrafo ao redor
 *  corpo                elemento onde a ferramenta desenha
 *  config               configurações salvas desta ferramenta
 *  executar(opcoes, {forcar, aoProgresso}) → Promise<resultado do background>
 *                       (rejeita com {codigo, mensagem}; usa cache, exceto com forcar)
 *  ativo()              false se o popup fechou ou mudou de aba (ignore respostas atrasadas!)
 *  podeSubstituir       true se o texto veio de um campo editável
 *  substituir(novo)     troca o texto selecionado no campo editável
 *  fechar()             fecha o popup
 */
(() => {
  'use strict';

  // Evita rodar duas vezes se o script for injetado mais de uma vez.
  if (globalThis.__TT) return;

  // ===========================================================================
  // CONFIGURAÇÃO — ajuste aqui sem mexer no resto do arquivo
  // ===========================================================================
  const CFG = {
    PORT_NAME: 'tira-teima', //                    = PORT_NAME em settings.js
    MSG_ABRIR_OPCOES: 'tira-teima:abrir-opcoes', // = MSG_ABRIR_OPCOES em settings.js
    STORAGE_KEY: 'tiraTeima', //                   = STORAGE_KEY em settings.js
    HOST_ID: 'tira-teima-host', //                 id do elemento que contém o Shadow DOM
    MAX_LIDO: 15000, //                            maior seleção considerada (em caracteres)
    CONTEXTO_MAX: 600, //                          tamanho do parágrafo de contexto
    TIMEOUT_MS: 60000, //                          tempo máximo esperando a resposta
    CACHE_MAX: 40, //                              respostas guardadas em memória
    NOME: 'IA da Caixota',
  };

  // ===========================================================================
  // ESTILO (dentro do Shadow DOM). Ferramentas podem somar CSS com adicionarCSS().
  // ===========================================================================
  const CSS = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }

    .tt {
      --bg: #ffffff; --bg2: #f4f5fb; --bg3: #eceefa; --fg: #1a1c2e; --fg2: #5a5e78;
      --line: #dfe2f0; --accent: #4f46e5; --accent-fg: #ffffff; --accent-soft: #e9e8ff;
      --ok: #137a43; --ok-bg: #e0f5e9; --bad: #b4232c; --bad-bg: #fde6e7;
      --mid: #8a5a00; --mid-bg: #fdf1d6; --neu: #4a4f66; --neu-bg: #e8eaf2;
      --inf: #1f5fb4; --inf-bg: #e1edfc;
      --shadow: 0 24px 70px rgba(20, 20, 60, .35);
      font: 14px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--fg);
    }
    @media (prefers-color-scheme: dark) {
      .tt {
        --bg: #181a2b; --bg2: #202339; --bg3: #292d49; --fg: #eceefc; --fg2: #a3a8c7;
        --line: #333757; --accent: #8b86ff; --accent-fg: #11122a; --accent-soft: #2c2b5e;
        --ok: #5ddc97; --ok-bg: #153a28; --bad: #ff8d95; --bad-bg: #432024;
        --mid: #f3c66b; --mid-bg: #3d3216; --neu: #b9bed8; --neu-bg: #2b2e45;
        --inf: #8fbcff; --inf-bg: #1c3254;
        --shadow: 0 24px 70px rgba(0, 0, 0, .7);
      }
    }

    .tt.quiet *, .tt.quiet *::before, .tt.quiet *::after {animation:none!important;transition:none!important;}
    .tt button,.tt input,.tt textarea,.tt select{font-family:inherit;}
    /* ---------- barra flutuante ---------- */
    .bar {
      position: fixed; z-index: 2; display: none; align-items: center; gap: 2px; padding: 3px;
      border-radius: 999px; background: var(--accent); user-select: none; animation: pop .14s ease-out;
      box-shadow: 0 6px 20px rgba(79, 70, 229, .45), 0 0 0 1px rgba(255,255,255,.12) inset;
    }
    .bar.on { display: inline-flex; }
    .tb {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 30px; min-width: 32px;
      padding: 0 8px; border: 0; border-radius: 999px; background: transparent; color: var(--accent-fg);
      font: 600 13px/1 inherit; cursor: pointer; white-space: nowrap;
    }
    .tb.lbl { padding: 0 12px 0 9px; }
    .tb:hover { background: color-mix(in srgb, var(--accent-fg) 20%, transparent); }
    .tb:focus-visible { outline: 3px solid var(--accent-soft); outline-offset: 1px; }
    .tb svg { width: 16px; height: 16px; flex: none; }
    /* sem opacity:0 no início: se as animações forem pausadas, a barra continua visível */
    @keyframes pop { from { transform: translateY(4px) scale(.94); } }

    /* ---------- popup ---------- */
    .overlay {
      position: fixed; inset: 0; z-index: 1; display: flex; align-items: center; justify-content: center;
      padding: 20px; background: rgba(12, 12, 32, .55); backdrop-filter: blur(2px); animation: fade .15s ease-out;
    }
    @keyframes fade { from { opacity: 0; } }
    .panel {
      width: min(760px, 100%); max-height: min(86vh, 820px); display: flex; flex-direction: column;
      background: var(--bg); border: 1px solid var(--line); border-radius: 20px; box-shadow: var(--shadow);
      overflow: hidden; animation: rise .2s ease-out;
    }
    @keyframes rise { from { opacity: 0; transform: translateY(14px) scale(.985); } }

    .head { display: flex; align-items: center; gap: 10px; padding: 14px 16px 12px 20px; }
    .logo { width: 28px; height: 28px; border-radius: 9px; background: var(--accent); color: var(--accent-fg);
            display: grid; place-items: center; flex: none; }
    .logo svg { width: 18px; height: 18px; }
    .title { font-weight: 700; font-size: 15px; letter-spacing: .1px; flex: 1; min-width: 0; }
    .title small { display: block; font-weight: 500; font-size: 12px; color: var(--fg2); }
    .x { width: 34px; height: 34px; border: 0; border-radius: 10px; background: transparent; color: var(--fg2);
         cursor: pointer; display: grid; place-items: center; }
    .x:hover { background: var(--bg3); color: var(--fg); }
    .x:focus-visible { outline: 3px solid var(--accent-soft); }
    .x svg { width: 18px; height: 18px; }

    .tabs { flex-shrink:0; overflow-y:hidden; display: flex; gap: 6px; padding: 0 20px 12px; overflow-x: auto; border-bottom: 1px solid var(--line); }
    .tabs.solo { display: none; }
    .head + .tabs.solo + .body { border-top: 1px solid var(--line); }
    .tab { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 999px;
           border: 1px solid var(--line); background: var(--bg); color: var(--fg2); font: 600 13px/1 inherit;
           cursor: pointer; white-space: nowrap; flex: none; }
    .tab:hover { background: var(--bg2); color: var(--fg); }
    .tab[aria-selected="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
    .tab:focus-visible { outline: 3px solid var(--accent-soft); }
    .tab svg { width: 15px; height: 15px; }

    .body { min-height:0; scrollbar-color:var(--line) transparent; padding: 18px 20px 8px; overflow-y: auto; overscroll-behavior: contain; }
    .foot { padding: 10px 20px 14px; font-size: 12px; color: var(--fg2); border-top: 1px solid var(--line); }

    .quote { margin: 0 0 16px; padding: 10px 14px; border-left: 3px solid var(--accent); background: var(--bg2);
             border-radius: 0 10px 10px 0; color: var(--fg2); font-style: italic;
             display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    /* ---------- controles (chips) e ações ---------- */
    .ctl { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 14px; }
    .ctl .lb { font-size: 12px; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; color: var(--fg2); margin-right: 2px; }
    .chip { height: 30px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: var(--bg);
            color: var(--fg); font: 600 13px/1 inherit; cursor: pointer; }
    .chip:hover { background: var(--bg2); }
    .chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
    .chip:focus-visible { outline: 3px solid var(--accent-soft); }
    .acts { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 8px; }

    /* ---------- carregando ---------- */
    .loading { display: flex; flex-direction: column; gap: 14px; padding-bottom: 14px; }
    .step { display: flex; align-items: center; gap: 10px; font-weight: 600; }
    .spin { width: 18px; height: 18px; border-radius: 50%; border: 3px solid var(--accent-soft);
            border-top-color: var(--accent); animation: rot .8s linear infinite; flex: none; }
    @keyframes rot { to { transform: rotate(360deg); } }
    .sk { height: 12px; border-radius: 6px; background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%);
          background-size: 200% 100%; animation: shimmer 1.3s linear infinite; }
    @keyframes shimmer { to { background-position: -200% 0; } }

    /* ---------- erro ---------- */
    .err { padding: 14px 16px; border-radius: 12px; background: var(--bad-bg); color: var(--bad); margin-bottom: 14px; }
    .err p { margin: 0 0 10px; color: var(--fg); }
    .err strong { display: block; margin-bottom: 4px; color: var(--bad); }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .b2 { height: 34px; padding: 0 14px; border-radius: 10px; border: 1px solid var(--line); background: var(--bg);
          color: var(--fg); font: 600 13px/1 inherit; cursor: pointer; }
    .b2:hover { background: var(--bg3); }
    .b2.pri { background: var(--accent); border-color: var(--accent); color: var(--accent-fg); }
    .b2.pri:hover { filter: brightness(1.08); }
    .b2:focus-visible { outline: 3px solid var(--accent-soft); }

    /* ---------- caixa de resposta (clique = copiar) ---------- */
    .answer { position: relative; padding: 16px 18px; border: 1px solid var(--line); border-radius: 14px;
              background: var(--bg2); cursor: copy; transition: border-color .12s, background .12s; }
    .answer:hover { border-color: var(--accent); background: var(--bg3); }
    .answer:focus-visible { outline: 3px solid var(--accent-soft); border-color: var(--accent); }
    .answer p { margin: 0 0 10px; } .answer p:last-of-type { margin-bottom: 0; }
    .answer ul { margin: 0 0 10px; padding-left: 20px; }
    .answer li { margin: 2px 0; }
    .hint { margin-top: 12px; font-size: 12px; color: var(--fg2); display: flex; align-items: center; gap: 6px; }
    .hint svg { width: 14px; height: 14px; }
    .copied { position: absolute; top: 10px; right: 12px; padding: 4px 10px; border-radius: 8px; font-size: 12px;
              font-weight: 700; background: var(--accent); color: var(--accent-fg); opacity: 0; transform: translateY(-4px);
              transition: opacity .15s, transform .15s; pointer-events: none; }
    .copied.show { opacity: 1; transform: none; }

    .cite { display: inline-grid; place-items: center; min-width: 18px; height: 18px; padding: 0 5px; margin: 0 1px;
            border-radius: 9px; background: var(--accent-soft); color: var(--accent); font-size: 11px; font-weight: 700;
            text-decoration: none; vertical-align: 1px; cursor: pointer; }
    .cite:hover { background: var(--accent); color: var(--accent-fg); }

    @media (max-width: 520px) { .overlay { padding: 8px; } .body { min-height:0; scrollbar-color:var(--line) transparent; padding: 14px 14px 6px; } .tabs { padding: 0 14px 12px; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
  `;

  // Ícones SVG estáticos e confiáveis (nunca recebem dados externos).
  const ICONE_APP =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/><path d="M8 10.6l1.9 1.9 3.4-3.7"/></svg>';
  const ICONE_X =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICONE_COPIAR =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';

  // ===========================================================================
  // ESTADO
  // ===========================================================================
  const ferramentas = []; //      ferramentas registradas (ordenadas por `ordem`)
  const folhasExtras = []; //     CSS adicionado pelas ferramentas
  let config = {}; //             objeto salvo em chrome.storage.local["tiraTeima"]
  let host = null; //             <div id="tira-teima-host"> (anexado ao <html>)
  let shadow = null; //           ShadowRoot
  let barra = null; //            barra flutuante
  let overlay = null; //          popup (null quando fechado)
  let estado = null; //           estado do popup aberto (ver abrirPopup)
  let selecaoAtual = null; //     última seleção lida (texto, contexto, edit)
  let porta = null; //            porta com o background
  let timeoutId = null;
  let rafScroll = 0;
  const cache = new Map(); //     respostas já obtidas (poupa a cota gratuita)

  // ===========================================================================
  // UTILITÁRIOS DE DOM
  // ===========================================================================
  /** Atalho para criar elementos: el('div', {class:'x'}, 'texto' | nó | [filhos]) */
  function el(tag, attrs = {}, filhos = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const f of [].concat(filhos)) {
      if (f == null || f === false) continue;
      e.append(f.nodeType ? f : document.createTextNode(String(f)));
    }
    return e;
  }

  /** Cria um nó SVG a partir de uma string ESTÁTICA (nunca passe dados externos). */
  function svg(html) {
    const t = document.createElement('template');
    t.innerHTML = html;
    return t.content.firstElementChild;
  }

  function urlHttp(u) {
    try {
      const x = new URL(u);
      return x.protocol === 'https:' || x.protocol === 'http:';
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // CONFIGURAÇÃO (lida direto do storage; atualiza sozinha quando o usuário salva)
  // ===========================================================================
  function carregarConfig() {
    try {
      chrome.storage.local.get(CFG.STORAGE_KEY).then((r) => {
        config = r[CFG.STORAGE_KEY] || {};
      });
      chrome.storage.onChanged.addListener((mudancas, area) => {
        if (area === 'local' && mudancas[CFG.STORAGE_KEY]) {config = mudancas[CFG.STORAGE_KEY].newValue || {};cache.clear();}
      });
    } catch {
      /* contexto da extensão invalidado: segue com os padrões */
    }
  }

  const estaAtiva = () => true;
  const configDe = (f) => ({ ...(f.padroes || {}), ...(config.ferramentas?.[f.id] || {}) });

  /** Ferramentas que aceitam este texto (ativas + tamanho dentro dos limites). */
  function aceitas(texto) {
    const n = texto.length;
    return ferramentas.filter((f) => estaAtiva(f) && n >= (f.minChars ?? 2) && (n <= (f.maxChars ?? 1500) || f.truncar));
  }

  // ===========================================================================
  // CSS EXTRA / HOST
  // ===========================================================================
  function criarFolha(css) {
    const folha = new CSSStyleSheet();
    folha.replaceSync(css);
    return folha;
  }

  /** Soma CSS de uma ferramenta ao Shadow DOM (pode ser chamado a qualquer momento). */
  function adicionarCSS(css) {
    folhasExtras.push(css);
    if (shadow) {
      try {
        shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, criarFolha(css)];
      } catch {
        shadow.append(el('style', { text: css }));
      }
    }
  }

  function garantirHost() {
    if (host && host.isConnected) return;
    host = el('div', { id: CFG.HOST_ID });
    host.style.cssText = 'all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;';
    shadow = host.attachShadow({ mode: 'open' });
    const raiz = el('div', { class: 'tt' });

    // Constructable stylesheet: não é bloqueada pelo CSP (Content-Security-Policy)
    // de páginas restritas; <style> inline seria. Mantém <style> só como reserva.
    try {
      shadow.adoptedStyleSheets = [CSS, ...folhasExtras].map(criarFolha);
      shadow.append(raiz);
    } catch {
      shadow.append(el('style', { text: [CSS, ...folhasExtras].join('\n') }), raiz);
    }

    barra = el('div', { class: 'bar', role: 'toolbar', 'aria-label': CFG.NOME });
    // mousedown com preventDefault: mantém o texto selecionado ao clicar.
    barra.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    raiz.append(barra);
    (document.documentElement || document.body).append(host);
  }

  const raizTT = () => shadow.querySelector('.tt');

  // ===========================================================================
  // DETECÇÃO DA SELEÇÃO
  // ===========================================================================
  const TIPOS_INPUT_OK = /^(text|search|url|email|tel)?$/i; // nunca lê campos de senha

  /** Parágrafo ao redor da seleção (ajuda ferramentas como o Dicionário). */
  function contextoDe(sel, texto) {
    try {
      const no = sel.getRangeAt(0).startContainer;
      let e = no.nodeType === 1 ? no : no.parentElement;
      while (e && e !== document.body && !/^(P|LI|TD|TH|DD|DT|BLOCKQUOTE|H[1-6]|ARTICLE|SECTION|PRE|DIV)$/.test(e.tagName)) {
        e = e.parentElement;
      }
      return recortar((e?.textContent || '').replace(/\s+/g, ' ').trim(), texto);
    } catch {
      return '';
    }
  }

  function recortar(t, texto) {
    if (t.length <= CFG.CONTEXTO_MAX) return t;
    const i = t.indexOf(texto);
    const ini = Math.max(0, (i < 0 ? 0 : i) - Math.floor((CFG.CONTEXTO_MAX - texto.length) / 2));
    return t.slice(ini, ini + CFG.CONTEXTO_MAX);
  }

  /**
   * Lê a seleção atual. Retorna null se não houver texto.
   * { texto, rect, contexto, edit }  — `edit` guarda como substituir o texto (campos editáveis).
   */
  function lerSelecao() {
    const ativo = document.activeElement;

    // 1) <textarea> e <input> de texto: a seleção fica no próprio elemento.
    if (
      ativo &&
      (ativo.tagName === 'TEXTAREA' || (ativo.tagName === 'INPUT' && TIPOS_INPUT_OK.test(ativo.type || ''))) &&
      typeof ativo.selectionStart === 'number' &&
      ativo.selectionStart !== ativo.selectionEnd
    ) {
      const ini = ativo.selectionStart;
      const fim = ativo.selectionEnd;
      const texto = ativo.value.slice(ini, fim).replace(/\s+/g, ' ').trim();
      if (!texto) return null;
      return {
        texto: texto.slice(0, CFG.MAX_LIDO),
        rect: ativo.getBoundingClientRect(),
        contexto: recortar(ativo.value.replace(/\s+/g, ' ').trim(), texto),
        edit: { tipo: 'campo', el: ativo, ini, fim, original:ativo.value },
      };
    }

    // 2) Seleção normal da página (inclui contenteditable).
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const texto = sel.toString().replace(/\s+/g, ' ').trim();
    if (!texto) return null;

    let rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      if (!ativo || ativo === document.body) return null;
      rect = ativo.getBoundingClientRect();
    }
    const no = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    const editavel = !!(no && no.isContentEditable);
    return {
      texto: texto.slice(0, CFG.MAX_LIDO),
      rect,
      contexto: contextoDe(sel, texto),
      edit: editavel ? { tipo: 'editavel', range: sel.getRangeAt(0).cloneRange(), original:sel.toString() } : null,
    };
  }

  /** Troca o texto selecionado (que veio de um campo editável) pelo texto novo. */
  function substituirNoCampo(edit, novo) {
    if (!edit) return false;
    try {
      if (edit.tipo === 'campo') {
        const campo = edit.el;
        if (!campo.isConnected || campo.value!==edit.original) return false;
        campo.focus();
        campo.setSelectionRange(edit.ini, edit.fim);
        // execCommand mantém o histórico (Ctrl+Z) e dispara os eventos que sites como React esperam.
        if (!document.execCommand('insertText', false, novo)) {
          campo.setRangeText(novo, edit.ini, edit.fim, 'end');
          campo.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
      }
      if(!edit.range.commonAncestorContainer.isConnected||edit.range.toString()!==edit.original)return false;
      const sel = window.getSelection();
      const raiz = edit.range.commonAncestorContainer;
      const dono = raiz.nodeType === 1 ? raiz : raiz.parentElement;
      dono?.closest?.('[contenteditable]')?.focus?.();
      sel.removeAllRanges();
      sel.addRange(edit.range);
      return document.execCommand('insertText', false, novo);
    } catch {
      return false;
    }
  }

  // ===========================================================================
  // COMUNICAÇÃO COM O BACKGROUND
  // ===========================================================================
  function desconectar() {
    clearTimeout(timeoutId);
    if (porta) {
      const p = porta;
      porta = null; // antes de desconectar: ignora eventos desta porta
      try {
        p.disconnect(); // avisa o background para cancelar as requisições
      } catch {
        /* ignorar */
      }
    }
  }

  /**
   * Envia um pedido ao background. Cancela qualquer pedido anterior em andamento.
   * Resolve com o objeto de resultado; rejeita com { codigo, mensagem }.
   */
  function executarNoBackground(f, texto, contexto, opcoes, { forcar = false, aoProgresso } = {}) {
    const chave = `${f.id}|${JSON.stringify(opcoes)}|${texto}|${f.usaContexto ? contexto : ''}`;
    if (!forcar && cache.has(chave)) return Promise.resolve(cache.get(chave));
    desconectar();

    return new Promise((resolver, rejeitar) => {
      let p;
      try {
        p = chrome.runtime.connect({ name: CFG.PORT_NAME });
      } catch {
        // acontece quando a extensão foi recarregada/atualizada com a página aberta
        return rejeitar({ codigo: 'RECARREGAR', mensagem: 'A extensão foi atualizada. Recarregue esta página (F5) e tente de novo.' });
      }
      porta = p;

      p.onMessage.addListener((msg) => {
        if (porta !== p) return;
        if (msg.type === 'progresso') {
          aoProgresso?.(msg.etapa);
        } else if (msg.type === 'resultado') {
          clearTimeout(timeoutId);
          if (cache.size >= CFG.CACHE_MAX) cache.delete(cache.keys().next().value);
          cache.set(chave, msg);
          resolver(msg);
        } else if (msg.type === 'erro') {
          clearTimeout(timeoutId);
          rejeitar({ codigo: msg.codigo, mensagem: msg.mensagem });
        }
      });
      p.onDisconnect.addListener(() => {
        if (porta !== p) return;
        porta = null;
        clearTimeout(timeoutId);
        rejeitar({ codigo: 'RECARREGAR', mensagem: 'A conexão com a extensão foi interrompida. Recarregue a página e tente de novo.' });
      });

      timeoutId = setTimeout(
        () => {rejeitar({ codigo: 'TEMPO', mensagem: 'A resposta demorou demais. Tente novamente.' });desconectar();},
        CFG.TIMEOUT_MS
      );
      p.postMessage({
        type: 'executar',
        ferramenta: f.id,
        texto,
        contexto: f.usaContexto ? contexto || '' : '',
        opcoes,
      });
    });
  }

  // ===========================================================================
  // HELPERS DE INTERFACE PARA AS FERRAMENTAS  (TT.ui)
  // ===========================================================================
  function citacao(texto) {
    return el('blockquote', { class: 'quote', text: `“${texto}”` });
  }

  function linhaEsqueleto(largura) {
    const e = el('div', { class: 'sk' });
    e.style.width = largura; // via CSSOM (atributo style inline poderia ser barrado por CSP)
    return e;
  }

  /** Estado "carregando". Retorna { no, atualizar(texto) }. */
  function carregando(mensagem = 'Pensando…') {
    const txt = el('span', { text: mensagem });
    const no = el('div', { class: 'loading', role: 'status', 'aria-live': 'polite' }, [
      el('div', { class: 'step' }, [el('div', { class: 'spin' }), txt]),
      linhaEsqueleto('96%'),
      linhaEsqueleto('88%'),
      linhaEsqueleto('92%'),
      linhaEsqueleto('54%'),
    ]);
    return { no, atualizar: (t) => (txt.textContent = t) };
  }

  /** Botão simples. opcoes: { pri, aoClicar } */
  function botao(rotulo, { pri = false, aoClicar } = {}) {
    return el('button', { class: `b2${pri ? ' pri' : ''}`, type: 'button', text: rotulo, onclick: aoClicar });
  }

  /** Bloco de erro com botões úteis conforme o código. */
  function erro(codigo, mensagem, tentarDeNovo) {
    const precisaConfig = codigo === 'SEM_CHAVE' || codigo === 'CHAVE_INVALIDA';
    const acoes = el('div', { class: 'actions' });
    if (precisaConfig) {
      acoes.append(
        botao('Abrir configurações', {
          pri: true,
          aoClicar: () => {
            try {
              chrome.runtime.sendMessage({ type: CFG.MSG_ABRIR_OPCOES });
            } catch {
              /* extensão recarregada */
            }
          },
        })
      );
    }
    if (tentarDeNovo && !['SEM_CHAVE', 'RECARREGAR', 'DESATIVADA'].includes(codigo)) {
      acoes.append(botao('Tentar de novo', { aoClicar: tentarDeNovo }));
    }
    return el('div', { class: 'err', role: 'alert' }, [
      el('strong', { text: precisaConfig ? 'Falta configurar' : 'Não foi possível concluir' }),
      el('p', { text: mensagem || 'Algo deu errado.' }),
      acoes,
    ]);
  }

  /** Grupo de chips (escolha única). opcoes: [[valor, rótulo], ...] */
  function chips({ rotulo, opcoes, valor, aoMudar }) {
    const grupo = el('div', { class: 'ctl', role: 'group', 'aria-label': rotulo || 'Opções' }, [
      rotulo ? el('span', { class: 'lb', text: rotulo }) : null,
    ]);
    const botoes = opcoes.map(([v, r]) =>
      el('button', {
        class: 'chip',
        type: 'button',
        'aria-pressed': String(v === valor),
        text: r,
        onclick: () => {
          botoes.forEach((b, i) => b.setAttribute('aria-pressed', String(opcoes[i][0] === v)));
          aoMudar(v);
        },
      })
    );
    grupo.append(...botoes);
    return grupo;
  }

  async function copiar(txt) {
    try {
      await navigator.clipboard.writeText(txt);
      return true;
    } catch {
      // Alternativa para páginas onde a Clipboard API é bloqueada.
      try {
        const ta = el('textarea');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        ta.value = txt;
        document.body.append(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
      } catch {
        return false;
      }
    }
  }

  /**
   * Caixa de resposta: clicar nela copia o texto.
   * @param {Node[]} nos            conteúdo visual da caixa
   * @param {()=>string} getTexto   texto que vai para a área de transferência
   */
  function caixaCopiavel(nos, getTexto) {
    const aviso = el('span', { class: 'copied', role: 'status', text: 'Copiado!' });
    const caixa = el(
      'div',
      { class: 'answer', role: 'button', tabindex: '0', title: 'Clique para copiar', 'aria-label': 'Resposta. Clique para copiar.' },
      [...[].concat(nos), aviso, el('div', { class: 'hint' }, [svg(ICONE_COPIAR), 'Clique na resposta para copiar'])]
    );
    const copiarAgora = async () => {
      const ok = await copiar(getTexto());
      aviso.textContent = ok ? 'Copiado!' : 'Não consegui copiar';
      aviso.classList.add('show');
      setTimeout(() => aviso.classList.remove('show'), 1600);
    };
    caixa.addEventListener('click', (e) => {
      if (e.target.closest && e.target.closest('a')) return; // clique em [1] abre a fonte
      if (String(window.getSelection() || '').length > 0) return; // usuário está selecionando parte do texto
      copiarAgora();
    });
    caixa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        copiarAgora();
      }
    });
    return caixa;
  }

  /**
   * Converte o texto da IA em DOM com segurança.
   * Suporta: parágrafos, listas "- item", **negrito** e citações [1] / [1, 2]
   * (as citações só viram links se `fontes` for informado).
   */
  function renderizarTexto(texto, fontes = []) {
    const frag = document.createDocumentFragment();
    const blocos = String(texto).split(/\n{2,}/);

    const inline = (alvo, linha) => {
      const partes = linha.split(/(\*\*[^*]+\*\*|\[\d+(?:\s*,\s*\d+)*\])/g);
      for (const p of partes) {
        if (!p) continue;
        if (/^\*\*[^*]+\*\*$/.test(p)) {
          alvo.append(el('strong', { text: p.slice(2, -2) }));
        } else if (fontes.length && /^\[\d+(?:\s*,\s*\d+)*\]$/.test(p)) {
          for (const n of p.match(/\d+/g)) {
            const fonte = fontes[Number(n) - 1];
            if (fonte && urlHttp(fonte.url)) {
              alvo.append(
                el('a', {
                  class: 'cite', href: fonte.url, target: '_blank', rel: 'noopener noreferrer',
                  title: fonte.titulo || fonte.dominio, text: n,
                })
              );
            } // citação inexistente: simplesmente omitida
          }
        } else {
          alvo.append(document.createTextNode(p));
        }
      }
    };

    for (const bloco of blocos) {
      const linhas = bloco.split('\n').filter((l) => l.trim());
      if (!linhas.length) continue;
      if (linhas.every((l) => /^\s*[-*•]\s+/.test(l))) {
        const ul = el('ul');
        for (const l of linhas) {
          const li = el('li');
          inline(li, l.replace(/^\s*[-*•]\s+/, ''));
          ul.append(li);
        }
        frag.append(ul);
      } else {
        const p = el('p');
        linhas.forEach((l, i) => {
          if (i) p.append(el('br'));
          inline(p, l.trim());
        });
        frag.append(p);
      }
    }
    return frag;
  }

  // ===========================================================================
  // POPUP
  // ===========================================================================
  function abrirPopup(idInicial,contextual=false) {
    const s = selecaoAtual;
    if (!s) return;
    garantirHost();
    fecharPopup();
    // Limpa a seleção da página: assim "clicar para copiar" na resposta pode
    // distinguir um clique simples de alguém selecionando parte do texto.
    // (Para campos editáveis, a posição foi guardada em s.edit.)
    window.getSelection()?.removeAllRanges();

    const lista = aceitas(s.texto).filter(f=>!contextual||configDe(f).contextual!==false);
    if (!lista.length) return;
    if(location.protocol==='chrome-extension:'){
      const css=getComputedStyle(document.documentElement),root=raizTT();
      for(const [to,from] of Object.entries({bg:'bg',bg2:'surface-solid',bg3:'surface-strong',fg:'text',fg2:'muted',line:'stroke',accent:'primary','accent-soft':'primary-soft','accent-fg':'bg'})){
        const value=css.getPropertyValue('--'+from).trim();if(value)root.style.setProperty('--'+to,value);
      }
    }

    const theme=s.appearance,root=raizTT();
    root.style.fontFamily=theme?.font||getComputedStyle(document.body).fontFamily;
    root.classList.toggle('quiet',!!theme?.quiet||document.documentElement.dataset.quality==='eco'||document.documentElement.dataset.effects==='off');
    if(theme){
      for(const key of ['bg','fg','fg2','line','accent'])if(theme[key])root.style.setProperty('--'+key,theme[key]);
      root.style.setProperty('--bg2','color-mix(in srgb,var(--bg) 94%,var(--fg))');
      root.style.setProperty('--bg3','color-mix(in srgb,var(--bg) 88%,var(--fg))');
      root.style.setProperty('--accent-soft','color-mix(in srgb,var(--bg) 85%,var(--accent))');
      root.style.setProperty('--accent-fg','var(--bg)');
    }
    const subtitulo = el('small', { text: '' });
    const corpo = el('div', { class: 'body' });
    const abas = el('div', { class: `tabs${lista.length < 2 ? ' solo' : ''}`, role: 'tablist' });
    const painel = el('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true', 'aria-label': CFG.NOME, tabindex: '-1' }, [
      el('div', { class: 'head' }, [
        el('div', { class: 'logo' }, [svg(ICONE_APP)]),
        el('div', { class: 'title' }, [CFG.NOME, subtitulo]),
        el('button', { class: 'x', type: 'button', 'aria-label': 'Fechar', title: 'Fechar (Esc)', onclick: fecharPopup }, [svg(ICONE_X)]),
      ]),
      abas,
      corpo,
      el('div', {
        class: 'foot',
        text: 'IA experimental: pode falhar ou dar respostas incorretas. Confira as informações em fontes confiáveis.',
      }),
    ]);

    estado = { texto: s.texto, contexto: s.contexto, edit: s.edit, lista, atualId: null, gen: 0, corpo, abas, subtitulo };

    // Uma aba por ferramenta aplicável a este texto.
    for (const f of lista) {
      abas.append(
        el(
          'button',
          { class: 'tab', type: 'button', role: 'tab', 'data-id': f.id, 'aria-selected': 'false', onclick: () => trocarFerramenta(f.id) },
          [svg(f.icone || ICONE_APP), f.nome]
        )
      );
    }

    overlay = el('div', { class: 'overlay' }, [painel]);
    // Clicar FORA do painel fecha (mousedown no fundo; ignora arrastos que começam dentro).
    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) fecharPopup();
    });
    raizTT().append(overlay);
    document.addEventListener('keydown', aoTeclar, true);
    painel.focus({ preventScroll: true });

    trocarFerramenta(lista.find((f) => f.id === idInicial) ? idInicial : lista[0].id);
  }

  function trocarFerramenta(id) {
    if (!overlay || !estado) return;
    const f = estado.lista.find((x) => x.id === id);
    if (!f) return;

    const gen = ++estado.gen;
    desconectar(); // cancela o que a ferramenta anterior estava esperando
    estado.atualId = id;
    estado.subtitulo.textContent = f.subtitulo || f.nome;
    for (const b of estado.abas.children) b.setAttribute('aria-selected', String(b.dataset.id === id));
    estado.corpo.replaceChildren();
    estado.corpo.scrollTop = 0;

    const texto = f.truncar && f.maxChars ? estado.texto.slice(0, f.maxChars) : estado.texto;
    const { contexto, edit } = estado;
    const ctx = {
      texto,
      contexto,
      corpo: estado.corpo,
      config: configDe(f),
      podeSubstituir: !!edit,
      ui: TT.ui,
      ativo: () => !!overlay && estado?.gen === gen,
      executar: (opcoes = {}, extras = {}) => executarNoBackground(f, texto, contexto, opcoes, extras),
      substituir: (novo) => substituirNoCampo(edit, novo),
      fechar: fecharPopup,
    };
    try {
      f.abrir(ctx);
    } catch (e) {
      console.error('[IA da Caixota]', f.id, e);
      estado.corpo.replaceChildren(erro('GENERICO', 'Esta ferramenta encontrou um erro inesperado.'));
    }
  }

  function fecharPopup() {
    desconectar();
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
    estado = null;
    document.removeEventListener('keydown', aoTeclar, true);
  }

  function aoTeclar(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      fecharPopup();
    }
  }

  // ===========================================================================
  // ATALHO PARA FERRAMENTAS "TEXTO ENTRA → TEXTO SAI"
  // ===========================================================================
  /**
   * Monta sozinha: citação do texto, controles (chips), carregando, resultado
   * numa caixa copiável, botões de ação e "Gerar de novo".
   *
   * def (além dos campos de registrar):
   *  controles   [{ chave, rotulo, opcoes:[[valor,rótulo],...], padrao }]
   *              → viram chips; o valor escolhido vai em `opcoes` para o background
   *  acoes       [{ rotulo, pri, visivel(ctx), aoClicar(ctx, resultado, opcoes) }]
   *  renderizar  (opcional) (ctx, resultado, opcoes) → Node. Padrão: renderizarTexto(resultado.texto)
   *  textoCopia  (opcional) (resultado) → string. Padrão: resultado.texto
   *  rotuloCarregando
   */
  function criarFerramentaTexto(def) {
    const { controles = [], acoes = [], renderizar, textoCopia, rotuloCarregando = 'Pensando…' } = def;
    return {
      ...def,
      abrir(ctx) {
        const ui = TT.ui;
        const opcoes = {};
        for (const c of controles) opcoes[c.chave] = ctx.config[c.chave] ?? c.padrao ?? c.opcoes[0][0];

        const area = el('div');
        ctx.corpo.append(ui.citacao(ctx.texto));
        for (const c of controles) {
          ctx.corpo.append(
            ui.chips({
              rotulo: c.rotulo,
              opcoes: c.opcoes,
              valor: opcoes[c.chave],
              aoMudar: (v) => {
                opcoes[c.chave] = v;
                rodar(false);
              },
            })
          );
        }
        ctx.corpo.append(area);

        function montarResultado(r) {
          const nos = [];
          const copia = () => (textoCopia ? textoCopia(r) : r.texto);
          nos.push(renderizar ? renderizar(ctx, r, opcoes) : ui.caixaCopiavel([ui.renderizarTexto(r.texto)], copia));
          const barraAcoes = el('div', { class: 'acts' });
          for (const a of acoes) {
            if (a.visivel && !a.visivel(ctx)) continue;
            barraAcoes.append(ui.botao(a.rotulo, { pri: a.pri, aoClicar: () => a.aoClicar(ctx, r, opcoes) }));
          }
          barraAcoes.append(ui.botao('Gerar de novo', { aoClicar: () => rodar(true) }));
          nos.push(barraAcoes);
          return nos;
        }

        async function rodar(forcar) {
          const c = ui.carregando(rotuloCarregando);
          area.replaceChildren(c.no);
          try {
            const r = await ctx.executar({ ...opcoes }, { forcar });
            if (!ctx.ativo()) return;
            area.replaceChildren(...montarResultado(r));
          } catch (e) {
            if (!ctx.ativo()) return;
            area.replaceChildren(ui.erro(e.codigo, e.mensagem, () => rodar(true)));
          }
        }
        rodar(false);
      },
    };
  }

  // ===========================================================================
  // API PÚBLICA
  // ===========================================================================
  function registrar(def) {
    if (!def?.id || typeof def.abrir !== 'function') {
      console.warn('[IA da Caixota] ferramenta inválida ignorada:', def);
      return;
    }
    const i = ferramentas.findIndex((f) => f.id === def.id);
    if (i >= 0) ferramentas.splice(i, 1); // re-registro substitui
    ferramentas.push(def);
    ferramentas.sort((a, b) => (a.ordem ?? 100) - (b.ordem ?? 100));
  }

  const TT = {
    versao: '2.0.0',
    registrar,
    capturarSelecao:lerSelecao,
    atalhos(texto){
      return aceitas(texto.replace(/\s+/g,' ').trim()).filter(f=>configDe(f).contextual!==false)
       .map(f=>({id:f.id,label:f.nome,description:f.subtitulo||'Ferramenta de IA'}));
    },
    abrirSelecao(id,texto,captura,appearance){
      if(!TT.atalhos(texto).some(f=>f.id===id))return;
      selecaoAtual=captura?.texto===texto.replace(/\s+/g,' ').trim()?captura:{texto:texto.replace(/\s+/g,' ').trim(),contexto:'',edit:null};
      selecaoAtual={...selecaoAtual,appearance};
      abrirPopup(id,true);
    },
    abrirTexto(id,texto,contexto=''){
      const tool=aceitas(texto).find(f=>f.id===id);
      if(!tool)throw Error('Confira o tamanho do texto e se a ferramenta está ativa nas configurações.');
      selecaoAtual={texto,contexto,edit:null};
      abrirPopup(id);
    },
    fechar:fecharPopup,
    criarFerramentaTexto,
    adicionarCSS,
    ui: { el, svg, citacao, carregando, botao, erro, chips, caixaCopiavel, renderizarTexto, copiar, urlHttp },
  };
  globalThis.__TT = TT;

  carregarConfig();
})();


export function initialize(document, window, bridge){
const NOTES_KEY = "caixotaNotesV1";
const MAX_NOTES = 120;
const MAX_NOTE_CHARS = 250000;

const textCatalogPane = document.getElementById("textCatalogPane");
const textDirectContainer = document.getElementById("textDirectToolsContainer");
const generatorCatalogPane = document.getElementById("generatorCatalogPane");
const generatorContainer = document.getElementById("generatorToolsContainer");

const NAME_POOLS = Object.freeze({
  masculine: [
    "Arthur", "Miguel", "Heitor", "Theo", "Davi", "Gabriel", "Bernardo", "Samuel", "João", "Pedro",
    "Lucas", "Matheus", "Rafael", "Guilherme", "Henrique", "Caio", "Vicente", "Leonardo", "Bruno", "Daniel",
    "Eduardo", "Felipe", "Gustavo", "Hugo", "Ian", "Joaquim", "Levi", "Murilo", "Nicolas", "Otávio",
    "Renato", "Thiago", "Vinícius", "Alexandre", "Antônio", "Benício", "César", "Diego", "Enzo", "Fábio",
    "Lorenzo", "Marcelo", "Noah", "Raul", "Tomás", "Vitor", "Yuri", "André", "Augusto", "Ícaro"
  ],
  feminine: [
    "Helena", "Alice", "Laura", "Maria", "Sophia", "Manuela", "Maitê", "Liz", "Cecília", "Isabella",
    "Luísa", "Valentina", "Heloísa", "Lívia", "Lorena", "Clara", "Aurora", "Marina", "Beatriz", "Júlia",
    "Ana", "Camila", "Carolina", "Eduarda", "Elisa", "Fernanda", "Gabriela", "Isadora", "Larissa", "Letícia",
    "Melissa", "Natália", "Olívia", "Rebeca", "Sofia", "Vitória", "Yasmin", "Bianca", "Débora", "Estela",
    "Flávia", "Giovana", "Ísis", "Luna", "Maya", "Nina", "Rafaela", "Sara", "Teresa", "Zoe"
  ],
  unisex: [
    "Alex", "Ariel", "Charlie", "Dani", "Dominique", "Eli", "Gael", "Jade", "Jordan", "Kai",
    "Luca", "Mika", "Morgan", "Noa", "Noel", "Niki", "Ravi", "Robin", "Sam", "Sasha",
    "Taylor", "Val", "Yuri", "Ari", "Cris", "Duda", "Fran", "Jess", "Kim", "Lee",
    "Lou", "Max", "Nico", "Parker", "Rian", "Sky", "Sol", "Toni", "Vic", "Zion"
  ]
});

document.addEventListener("caixota:open-direct-tool", (event) => {
  const { category, toolId } = event.detail || {};
  if (category === "text" && toolId === "text-notes") openNotesHome();
  if (category === "text" && toolId === "calculate") openVisualCalculator();
  if (category === "generators" && toolId === "generator-name") openNameGenerator();
  if (category === "generators" && toolId === "generator-uuid") openUuidGenerator();
  if (category === "generators" && toolId === "generator-fake-data") openFakeDataGenerator();
  if (category === "generators" && toolId === "generator-random-number") openRandomNumberGenerator();
  if (category === "generators" && toolId === "generator-wheel") openRaffleWheel();
  if (category === "generators" && toolId === "generator-password") openPasswordGenerator();
});

document.addEventListener("caixota:show-direct-catalog", (event) => {
  if (event.detail?.category === "text") showTextCatalog();
  if (event.detail?.category === "generators") showGeneratorCatalog();
});

document.addEventListener("caixota:reset-direct-tools", (event) => {
  if (event.detail?.category === "text" || event.detail?.category === "all") showTextCatalog();
  if (event.detail?.category === "generators" || event.detail?.category === "all") showGeneratorCatalog();
});

function showTextCatalog() {
  if (textCatalogPane) textCatalogPane.hidden = false;
  if (textDirectContainer) {
    textDirectContainer.hidden = true;
    textDirectContainer.replaceChildren();
  }
}

function showGeneratorCatalog() {
  if (generatorCatalogPane) generatorCatalogPane.hidden = false;
  if (generatorContainer) {
    generatorContainer.hidden = true;
    generatorContainer.replaceChildren();
  }
}

function showTextDirect() {
  if (textCatalogPane) textCatalogPane.hidden = true;
  if (textDirectContainer) textDirectContainer.hidden = false;
}

function showGeneratorDirect() {
  if (generatorCatalogPane) generatorCatalogPane.hidden = true;
  if (generatorContainer) generatorContainer.hidden = false;
}

async function openNotesHome() {
  if (!textDirectContainer) return;
  showTextDirect();
  recordUsage("text-notes");
  const notes = await loadNotes();
  renderNotesHome(notes);
}

function renderNotesHome(notes) {
  textDirectContainer.replaceChildren();
  const screen = el("section", "local-tool-screen notes-screen");
  const top = directHeader("← Voltar para Texto", "Bloco de Notas", "Crie notas simples, formate texto e mantenha tudo salvo localmente.", showTextCatalog);
  const privacy = offlineNotice("Notas locais", "As notas ficam neste navegador. Nada é enviado para um servidor.");

  const actions = el("div", "notes-home-actions");
  const create = button("＋ Nova nota", "primary-button");
  const importButton = button("Importar TXT", "ghost-button");
  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".txt,text/plain";
  importInput.multiple = true;
  importInput.hidden = true;
  create.addEventListener("click", async () => {
    const current = await loadNotes();
    if (current.length >= MAX_NOTES) return showInlineToast(screen, `Limite de ${MAX_NOTES} notas atingido.`);
    const note = createNoteModel();
    current.unshift(note);
    await persistNotes(current);
    openNoteEditor(note.id);
  });
  importButton.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", async () => {
    const files = [...importInput.files || []];
    importInput.value = "";
    if (!files.length) return;
    let current = await loadNotes();
    for (const file of files) {
      if (current.length >= MAX_NOTES) break;
      if (file.size > 2 * 1024 * 1024) {
        showInlineToast(screen, `${file.name}: arquivo grande demais para uma nota.`);
        continue;
      }
      const content = (await file.text()).slice(0, MAX_NOTE_CHARS);
      current.unshift(createNoteModel(stripExtension(file.name) || "Nota importada", textToHtml(content)));
    }
    await persistNotes(current);
    renderNotesHome(current);
  });
  actions.append(create, importButton, importInput);

  const heading = el("div", "notes-folder-heading");
  heading.innerHTML = `<div><span class="eyebrow">Sua pasta</span><h3>${notes.length ? `${notes.length} ${notes.length === 1 ? "nota" : "notas"}` : "Nenhuma nota ainda"}</h3></div><span>TXT · OFFLINE</span>`;

  const grid = el("div", "notes-grid");
  if (!notes.length) {
    const empty = el("div", "notes-empty");
    empty.innerHTML = `<span aria-hidden="true">▤</span><strong>Uma pasta vazia, por enquanto</strong><p>Crie uma nota do zero ou importe um arquivo .txt do seu computador.</p>`;
    grid.append(empty);
  } else {
    for (const note of notes.sort((a, b) => b.updatedAt - a.updatedAt)) grid.append(createNoteCard(note));
  }

  screen.append(top, privacy, actions, heading, grid);
  textDirectContainer.append(screen);
  requestAnimationFrame(() => create.focus({ preventScroll: true }));
}

function createNoteCard(note) {
  const wrap = el("article", "note-card-wrap");
  const open = button("", "note-card");
  const preview = plainTextFromHtml(note.html).replace(/\s+/g, " ").trim();
  open.innerHTML = `<span class="note-card-icon" aria-hidden="true">▤</span><span class="note-card-copy"><strong>${escapeHtml(note.title || "Sem título")}</strong><small>${escapeHtml(preview.slice(0, 110) || "Nota vazia")}</small><em>Editada ${formatRelativeDate(note.updatedAt)}</em></span><span class="note-card-arrow" aria-hidden="true">›</span>`;
  open.addEventListener("click", () => openNoteEditor(note.id));
  const menu = el("div", "note-card-actions");
  const download = button("↓", "note-mini-button");
  download.title = "Salvar como TXT no computador";
  download.setAttribute("aria-label", `Salvar ${note.title || "nota"} como TXT`);
  download.addEventListener("click", () => downloadText(`${safeFilename(note.title || "nota")}.txt`, plainTextFromHtml(note.html)));
  const remove = button("×", "note-mini-button is-danger");
  remove.title = "Excluir nota";
  remove.setAttribute("aria-label", `Excluir ${note.title || "nota"}`);
  remove.addEventListener("click", async () => {
    if (!confirm(`Excluir “${note.title || "Sem título"}”?`)) return;
    const notes = (await loadNotes()).filter((item) => item.id !== note.id);
    await persistNotes(notes);
    renderNotesHome(notes);
  });
  menu.append(download, remove);
  wrap.append(open, menu);
  return wrap;
}

async function openNoteEditor(noteId) {
  if (!textDirectContainer) return;
  showTextDirect();
  const notes = await loadNotes();
  const note = notes.find((item) => item.id === noteId);
  if (!note) return renderNotesHome(notes);

  textDirectContainer.replaceChildren();
  const screen = el("section", "local-tool-screen note-editor-screen");
  const top = directHeader("← Voltar às notas", "Editar nota", "Formatação simples, salvamento automático e exportação em TXT.", async () => {
    await saveNow();
    renderNotesHome(await loadNotes());
  });
  const meta = el("div", "note-editor-meta");
  const title = document.createElement("input");
  title.className = "note-title-input";
  title.type = "text";
  title.maxLength = 80;
  title.placeholder = "Título da nota";
  title.value = note.title;
  const status = el("span", "note-save-status");
  status.textContent = "Salvo localmente";
  meta.append(title, status);

  const toolbar = el("div", "note-toolbar");
  const formats = [
    ["B", "bold", "Negrito"], ["I", "italic", "Itálico"], ["U", "underline", "Sublinhado"],
    ["• Lista", "insertUnorderedList", "Lista com marcadores"], ["1. Lista", "insertOrderedList", "Lista numerada"], ["Limpar", "removeFormat", "Limpar formatação"]
  ];
  for (const [label, command, tooltip] of formats) {
    const control = button(label, "note-format-button");
    control.title = tooltip;
    control.addEventListener("mousedown", (event) => event.preventDefault());
    control.addEventListener("click", () => {
      editor.focus();
      document.execCommand(command, false, null);
      scheduleSave();
    });
    toolbar.append(control);
  }
  const blockSelect = document.createElement("select");
  blockSelect.className = "note-format-select";
  blockSelect.setAttribute("aria-label", "Estilo do parágrafo");
  blockSelect.innerHTML = '<option value="p">Texto</option><option value="h2">Título</option><option value="h3">Subtítulo</option><option value="blockquote">Citação</option>';
  blockSelect.addEventListener("change", () => {
    editor.focus();
    document.execCommand("formatBlock", false, blockSelect.value);
    blockSelect.value = "p";
    scheduleSave();
  });
  toolbar.prepend(blockSelect);

  const editor = el("div", "note-editor");
  editor.contentEditable = "true";
  editor.spellcheck = true;
  editor.setAttribute("role", "textbox");
  editor.setAttribute("aria-multiline", "true");
  editor.dataset.placeholder = "Comece a escrever…";
  editor.innerHTML = sanitizeRichHtml(note.html);
  editor.addEventListener("paste", (event) => {
    event.preventDefault();
    const plain = event.clipboardData?.getData("text/plain") || "";
    document.execCommand("insertText", false, plain.slice(0, MAX_NOTE_CHARS));
  });

  const footer = el("div", "note-editor-footer");
  const savePc = button("Salvar .TXT no PC", "ghost-button");
  const deleteButton = button("Excluir nota", "ghost-button note-delete-button");
  savePc.addEventListener("click", async () => {
    await saveNow();
    downloadText(`${safeFilename(title.value || "nota")}.txt`, editor.innerText || "");
  });
  deleteButton.addEventListener("click", async () => {
    if (!confirm(`Excluir “${title.value.trim() || "Sem título"}”?`)) return;
    const next = (await loadNotes()).filter((item) => item.id !== note.id);
    await persistNotes(next);
    renderNotesHome(next);
  });
  footer.append(deleteButton, savePc);

  let saveTimer = 0;
  const scheduleSave = () => {
    status.textContent = "Salvando…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 450);
  };
  async function saveNow() {
    clearTimeout(saveTimer);
    const list = await loadNotes();
    const index = list.findIndex((item) => item.id === note.id);
    if (index < 0) return;
    const html = sanitizeRichHtml(editor.innerHTML).slice(0, MAX_NOTE_CHARS);
    list[index] = { ...list[index], title: (title.value.trim() || "Sem título").slice(0, 80), html, updatedAt: Date.now() };
    await persistNotes(list);
    status.textContent = "Salvo localmente";
  }
  title.addEventListener("input", scheduleSave);
  editor.addEventListener("input", scheduleSave);
  editor.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveNow();
    }
  });

  screen.append(top, meta, toolbar, editor, footer);
  textDirectContainer.append(screen);
  requestAnimationFrame(() => editor.focus({ preventScroll: true }));
}

const NAME_REGIONS = Object.freeze({
  br: { label: "Brasil · Português", masculine: ["João", "Pedro", "Miguel", "Gabriel", "Rafael", "Lucas", "André", "Thiago", "Caio", "Arthur", "Felipe", "Bruno"], feminine: ["Maria", "Ana", "Helena", "Laura", "Beatriz", "Camila", "Sofia", "Luísa", "Clara", "Júlia", "Marina", "Alice"], unisex: ["Alex", "Ariel", "Dani", "Cris", "Sol", "Ravi"], surnames: ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Almeida", "Pereira", "Lima", "Rocha", "Ferreira", "Carvalho", "Ribeiro"] },
  pt: { label: "Portugal · Português", masculine: ["Afonso", "Diogo", "Duarte", "Gonçalo", "João", "Martim", "Miguel", "Tomás"], feminine: ["Beatriz", "Inês", "Leonor", "Mafalda", "Matilde", "Rita", "Sofia", "Teresa"], unisex: ["Alex", "Ariel", "Dani", "Noa"], surnames: ["Costa", "Ferreira", "Pereira", "Sousa", "Rodrigues", "Martins", "Almeida", "Lopes"] },
  en: { label: "Países anglófonos · Inglês", masculine: ["James", "Oliver", "William", "Henry", "Jack", "Liam", "Ethan", "Noah"], feminine: ["Emma", "Olivia", "Charlotte", "Amelia", "Grace", "Emily", "Sophia", "Lily"], unisex: ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Sam"], surnames: ["Smith", "Johnson", "Brown", "Taylor", "Wilson", "Clark", "Walker", "Hall"] },
  es: { label: "Países hispânicos · Espanhol", masculine: ["Mateo", "Santiago", "Diego", "Alejandro", "Pablo", "Carlos", "Javier", "Hugo"], feminine: ["Lucía", "Sofía", "Valeria", "Isabella", "Camila", "Elena", "Clara", "Paula"], unisex: ["Alex", "Ariel", "Cruz", "Dani", "Noa"], surnames: ["García", "Rodríguez", "López", "Martínez", "González", "Pérez", "Sánchez", "Torres"] },
  fr: { label: "França · Francês", masculine: ["Louis", "Gabriel", "Hugo", "Arthur", "Jules", "Lucas", "Raphaël", "Émile"], feminine: ["Emma", "Chloé", "Louise", "Alice", "Camille", "Léa", "Manon", "Inès"], unisex: ["Camille", "Alex", "Sacha", "Charlie", "Lou"], surnames: ["Martin", "Bernard", "Dubois", "Petit", "Laurent", "Moreau", "Lefebvre", "Michel"] },
  de: { label: "Alemanha · Alemão", masculine: ["Lukas", "Felix", "Leon", "Paul", "Maximilian", "Jonas", "Emil", "Finn"], feminine: ["Mia", "Emma", "Hannah", "Lena", "Clara", "Lea", "Sophie", "Marie"], unisex: ["Alex", "Kim", "Robin", "Sascha", "Toni"], surnames: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"] },
  it: { label: "Itália · Italiano", masculine: ["Luca", "Leonardo", "Matteo", "Alessandro", "Marco", "Andrea", "Giovanni", "Lorenzo"], feminine: ["Sofia", "Giulia", "Aurora", "Alice", "Ginevra", "Emma", "Beatrice", "Chiara"], unisex: ["Andrea", "Alex", "Gio", "Sasha"], surnames: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci"] },
  ja: { label: "Japão · Japonês (romanizado)", masculine: ["Haruto", "Yuto", "Ren", "Kaito", "Sota", "Hiroto", "Takumi", "Daiki"], feminine: ["Yui", "Sakura", "Hina", "Aoi", "Rin", "Akari", "Mei", "Yuna"], unisex: ["Akira", "Hikaru", "Kaoru", "Nao", "Sora", "Yuki"], surnames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura"] }
});
function nameChoice(list, previous = []) {
  const available = list.filter(item => !previous.includes(item));
  const pool = available.length ? available : list;
  return pool[secureRandomIndex(pool.length)];
}
function openNameGenerator() {
  if (!generatorContainer) return;
  showGeneratorDirect(); generatorContainer.replaceChildren(); recordUsage("generator-name", "generator");
  const screen = el("section", "local-tool-screen generator-name-screen");
  const top = directHeader("← Voltar para Geradores", "Gerador de Nomes", "Gere nomes simples ou completos, sem internet.", showGeneratorCatalog);
  const privacy = offlineNotice("Gerador offline", "Listas de nomes locais; as origens são referências culturais, não garantias de nacionalidade.");
  const panel = el("div", "name-generator-panel");
  const mode = el("div", "name-type-picker");
  const simple = button("Simples", "name-type-button is-active"), advanced = button("Avançado", "name-type-button");
  mode.append(simple,advanced);
  const form = el("div", "name-generator-fields");
  const field = (label, control) => { const wrap = el("label", "name-generator-field"); const caption = el("span"); caption.textContent=label; wrap.append(caption,control); return wrap; };
  const select = (options) => { const s=document.createElement("select"); for(const [value,label] of options){const o=document.createElement("option");o.value=value;o.textContent=label;s.append(o);}return s; };
  const type = select([["masculine","Masculino"],["feminine","Feminino"],["unisex","Unissex"],["any","Qualquer gênero"]]);
  const region = select(Object.entries(NAME_REGIONS).map(([id,v])=>[id,v.label]));
  const format = select([["first","Apenas nome"],["full","Nome e sobrenome"],["compound","Nome composto"],["both","Nome composto e sobrenome"]]);
  const surnameCount = select([["1","1 sobrenome"],["2","2 sobrenomes"],["3","3 sobrenomes"],["4","4 sobrenomes"]]);
  const firstLetter=document.createElement("input"); firstLetter.maxLength=1;firstLetter.placeholder="Qualquer";
  const min=document.createElement("input"),max=document.createElement("input");
  for(const input of [min,max]){input.type="number";input.min="1";input.max="100";input.placeholder="Sem limite";}
  const quantity=select([["1","1 nome"],["3","3 nomes"],["5","5 nomes"],["10","10 nomes"],["20","20 nomes"]]);
  const unique=document.createElement("input");unique.type="checkbox";unique.checked=true;
  const fields = [field("Tipo de nome",type),field("Origem / idioma",region)];
  const advancedFields=el("div","name-generator-advanced");
  advancedFields.append(field("Estrutura",format),field("Sobrenomes",surnameCount),field("Letra inicial do primeiro nome",firstLetter),field("Mínimo de caracteres (nome completo)",min),field("Máximo de caracteres (nome completo)",max),field("Quantidade",quantity),field("Evitar repetidos no lote",unique));
  advancedFields.hidden=true;
  form.append(...fields,advancedFields);
  let isAdvanced=false;
  const setMode=(value)=>{isAdvanced=value;simple.classList.toggle("is-active",!value);advanced.classList.toggle("is-active",value);simple.setAttribute("aria-pressed",String(!value));advanced.setAttribute("aria-pressed",String(value));advancedFields.hidden=!value;};
  simple.addEventListener("click",()=>setMode(false));advanced.addEventListener("click",()=>setMode(true));setMode(false);
  const result=el("div","name-result-card");const heading=el("span");heading.textContent="Nomes gerados";const output=el("div","name-generated-list");output.textContent="Pronto para gerar";const helper=el("small");helper.textContent="Escolha as opções e clique em gerar.";result.append(heading,output,helper);
  const actions=el("div","name-generator-actions");const generate=button("Gerar nomes","primary-button"),copy=button("Copiar","ghost-button");copy.disabled=true;actions.append(generate,copy);
  let generated=[];
  generate.addEventListener("click",()=>{
    const pool=NAME_REGIONS[region.value];const wanted= isAdvanced?Number(quantity.value):1;
    const initial=isAdvanced?firstLetter.value.trim().toLocaleLowerCase():"";
    const minLength=isAdvanced&&min.value!==""?Number(min.value):0;
    const maxLength=isAdvanced&&max.value!==""?Number(max.value):Infinity;
    if(minLength>maxLength){helper.textContent="O mínimo não pode superar o máximo.";return;}
    const gender=type.value==="any"?nameChoice(["masculine","feminine","unisex"]):type.value;
    const names=[];let tries=0;
    while(names.length<wanted&&tries++<5000){
      const g=type.value==="any"?nameChoice(["masculine","feminine","unisex"]):gender;
      const first=nameChoice(pool[g]);if(initial&&!first.toLocaleLowerCase().startsWith(initial))continue;
      const structure=isAdvanced?format.value:"first";
      const parts=[first];
      if(structure==="compound"||structure==="both")parts.push(nameChoice(pool[g],parts));
      if(structure==="full"||structure==="both"){
        const count=isAdvanced?Number(surnameCount.value):1;
        const family=[];for(let i=0;i<count;i++)family.push(nameChoice(pool.surnames,family));
        if(region.value==="ja")parts.unshift(...family);else parts.push(...family);
      }
      const full=parts.join(" ");const size=Array.from(full).length;
      if(size<minLength||size>maxLength)continue;
      if(unique.checked&&names.includes(full))continue;
      names.push(full);
    }
    generated=names;output.replaceChildren();for(const name of names){const line=el("div","name-generated-item");line.textContent=name;output.append(line);}
    if(!names.length)output.textContent="Nenhum nome encontrado";
    helper.textContent=names.length?`${names.length} resultado(s) · ${pool.label}`:"Experimente ampliar os limites ou mudar a inicial.";copy.disabled=!names.length;
  });
  copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(generated.join("\n"));copy.textContent="Copiado ✓";}catch{copy.textContent="Erro ao copiar";}setTimeout(()=>copy.textContent="Copiar",1300);});
  panel.append(mode,form,result,actions);screen.append(top,privacy,panel);generatorContainer.append(screen);
}

function renderNameHistory(container, names) {
  container.replaceChildren();
  if (!names.length) return;
  const label = el("span", "name-history-label");
  label.textContent = "Últimos nomes";
  const chips = el("div", "name-history-chips");
  for (const name of names) {
    const chip = button(name, "name-history-chip");
    chip.addEventListener("click", () => navigator.clipboard.writeText(name).catch(() => {}));
    chips.append(chip);
  }
  container.append(label, chips);
}

function directHeader(backLabel, title, description, onBack) {
  const top = el("div", "local-direct-top");
  const back = button(backLabel, "ghost-button local-direct-back");
  back.addEventListener("click", onBack);
  const heading = el("div", "local-direct-heading");
  heading.innerHTML = `<span class="eyebrow">Ferramenta local</span><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p>`;
  top.append(back, heading);
  return top;
}

function offlineNotice(title, description) {
  const wrap = el("div", "local-offline-notice");
  const badge = bridge?.createNetworkBadge?.("offline");
  const copy = el("div", "local-offline-copy");
  copy.innerHTML = `<strong>${escapeHtml(title)}</strong><small>${escapeHtml(description)}</small>`;
  if (badge) wrap.append(badge);
  wrap.append(copy);
  return wrap;
}

async function loadNotes() {
  const stored = await chrome.storage.local.get(NOTES_KEY);
  const raw = Array.isArray(stored[NOTES_KEY]) ? stored[NOTES_KEY] : [];
  return raw.map(normalizeNote).filter(Boolean).slice(0, MAX_NOTES);
}

async function persistNotes(notes) {
  const normalized = notes.map(normalizeNote).filter(Boolean).slice(0, MAX_NOTES);
  await chrome.storage.local.set({ [NOTES_KEY]: normalized });
  return normalized;
}

function normalizeNote(value) {
  if (!value || typeof value !== "object") return null;
  const id = String(value.id || "").trim();
  if (!id) return null;
  return {
    id,
    title: String(value.title || "Sem título").trim().slice(0, 80) || "Sem título",
    html: sanitizeRichHtml(String(value.html || "")).slice(0, MAX_NOTE_CHARS),
    createdAt: Math.max(0, Number(value.createdAt) || Date.now()),
    updatedAt: Math.max(0, Number(value.updatedAt) || Number(value.createdAt) || Date.now())
  };
}

function createNoteModel(title = "Nova nota", html = "") {
  const now = Date.now();
  return { id: `note-${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`, title: String(title).slice(0, 80), html: sanitizeRichHtml(html), createdAt: now, updatedAt: now };
}

function sanitizeRichHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");
  const allowed = new Set(["B", "STRONG", "I", "EM", "U", "BR", "DIV", "P", "H2", "H3", "UL", "OL", "LI", "BLOCKQUOTE"]);
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.COMMENT_NODE) child.remove();
      else if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowed.has(child.tagName)) {
          walk(child);
          child.replaceWith(...child.childNodes);
          continue;
        }
        [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
        walk(child);
      }
    }
  };
  walk(template.content);
  return template.innerHTML;
}

function textToHtml(text) {
  return String(text || "").split(/\r?\n/).map((line) => `<div>${escapeHtml(line) || "<br>"}</div>`).join("");
}

function plainTextFromHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = sanitizeRichHtml(html);
  return div.innerText || div.textContent || "";
}

function showInlineToast(screen, message) {
  let toast = screen.querySelector(".local-inline-toast");
  if (!toast) {
    toast = el("div", "local-inline-toast");
    screen.prepend(toast);
  }
  toast.textContent = message;
  clearTimeout(Number(toast.dataset.timer || 0));
  const timer = setTimeout(() => toast.remove(), 2800);
  toast.dataset.timer = String(timer);
}

function downloadText(filename, content) {
  const blob = new Blob([String(content || "")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function recordUsage(toolId, mode = "text") {
  chrome.runtime.sendMessage({ type: "RECORD_TOOL_USAGE", toolId, mode }).catch(() => {});
}

function secureRandomIndex(length) {
  if (!length) return 0;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

function stripExtension(filename) { return String(filename || "").replace(/\.[^.]+$/, "").trim(); }
function safeFilename(value) { return String(value || "nota").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "nota"; }
function escapeHtml(value) { return String(value || "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]); }
function el(tag, className = "") { const node = document.createElement(tag); if (className) node.className = className; return node; }
function button(label, className = "") { const node = document.createElement("button"); node.type = "button"; node.className = className; node.textContent = label; return node; }
function formatRelativeDate(timestamp) {
  const diff = Math.max(0, Date.now() - Number(timestamp || 0));
  if (diff < 60_000) return "agora";
  if (diff < 3_600_000) return `há ${Math.floor(diff / 60_000)} min`;
  if (diff < 86_400_000) return `há ${Math.floor(diff / 3_600_000)} h`;
  if (diff < 604_800_000) return `há ${Math.floor(diff / 86_400_000)} d`;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

// Calculadora visual independente do interruptor da ferramenta contextual.
function openVisualCalculator() {
  if (!textDirectContainer) return;
  showTextDirect(); textDirectContainer.replaceChildren(); recordUsage("calculate");
  const screen=el("section","local-tool-screen visual-calculator-screen");
  const top=directHeader("← Voltar para Texto","Calculadora","Modo simples e científico. A ativação no menu de seleção é independente.",showTextCatalog);
  const panel=el("div","visual-calculator-panel");
  const tabs=el("div","name-type-picker");const basic=button("Simples","name-type-button is-active"),science=button("Científica","name-type-button");tabs.append(basic,science);
  const display=document.createElement("input");display.className="visual-calculator-display";display.type="text";display.setAttribute("aria-label","Expressão matemática");display.placeholder="0";display.autocomplete="off";
  const status=el("div","visual-calculator-status");status.textContent="Use os botões ou digite uma expressão.";
  const keys=el("div","visual-calculator-keys");let scientific=false;let ans=0;
  const run=()=>{try{const value=calculateSafeExpression(display.value,ans);ans=value;display.value=String(Number(value.toPrecision(12)));status.textContent="Resultado calculado localmente.";}catch(error){status.textContent=error.message||"Expressão inválida.";}};
  const render=()=>{
    basic.classList.toggle("is-active",!scientific);science.classList.toggle("is-active",scientific);
    keys.replaceChildren();const labels=scientific?["sin(","cos(","tan(","sqrt(","log(","ln(","π","e","^","!","(",")","7","8","9","÷","4","5","6","×","1","2","3","−","0",".","%","+","C","⌫","Ans","="]:["C","(",")","⌫","7","8","9","÷","4","5","6","×","1","2","3","−","0",".","%","+","Ans","="];
    for(const label of labels){const key=button(label,"visual-calculator-key"+(label==="="?" primary-button":""));if(["÷","×","−","+","%","^","!"].includes(label))key.dataset.operator="true";key.addEventListener("click",()=>{if(label==="=")run();else if(label==="C"){display.value="";status.textContent="Limpo.";}else if(label==="⌫")display.value=display.value.slice(0,-1);else display.value+=({"×":"*","÷":"/","−":"-","π":"pi","Ans":"ans"}[label]||label);display.focus();});keys.append(key);}
  };
  basic.addEventListener("click",()=>{scientific=false;render();});science.addEventListener("click",()=>{scientific=true;render();});
  display.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();run();}});
  render();panel.append(tabs,display,status,keys);screen.append(top,offlineNotice("Cálculo local","Não usa serviços externos."),panel);textDirectContainer.append(screen);
}
function calculateSafeExpression(raw,answer=0) {
  const src=String(raw||"").replace(/,/g,".").replace(/×/g,"*").replace(/÷/g,"/").replace(/−/g,"-").replace(/π/g,"pi").replace(/\s+/g,"");
  if(!src||src.length>250)throw Error("Digite uma expressão de até 250 caracteres.");
  const tokens=src.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[a-z]+|[()+*/%^!,-]/gi)||[];
  if(tokens.join("")!==src)throw Error("Caractere não permitido.");
  let pos=0;const peek=()=>tokens[pos],take=x=>peek()===x?(pos++,true):false;
  const factorial=n=>{if(!Number.isInteger(n)||n<0||n>170)throw Error("Fatorial aceita inteiros entre 0 e 170.");let v=1;for(let i=2;i<=n;i++)v*=i;return v;};
  const primary=()=>{if(take("(")){const v=expr();if(!take(")"))throw Error("Feche os parênteses.");return v;}const token=peek();if(!token)throw Error("Expressão incompleta.");if(/^(?:\d|\.)/.test(token)){pos++;return Number(token);}const key=token.toLowerCase();pos++;if(key==="pi")return Math.PI;if(key==="e")return Math.E;if(key==="ans")return answer;if(["sin","cos","tan","sqrt","log","ln","abs"].includes(key)){if(!take("("))throw Error("Use parênteses após a função.");const x=expr();if(!take(")"))throw Error("Feche a função.");return ({sin:Math.sin,cos:Math.cos,tan:Math.tan,sqrt:Math.sqrt,log:Math.log10,ln:Math.log,abs:Math.abs})[key](x);}throw Error("Função desconhecida: "+token);};
  const postfix=()=>{let v=primary();while(true){if(take("%"))v/=100;else if(take("!"))v=factorial(v);else break;}return v;};
  const power=()=>{const left=postfix();return take("^")?Math.pow(left,unary()):left;};
  const unary=()=>take("+")?unary():take("-")?-unary():power();
  const term=()=>{let v=unary();while(true){if(take("*"))v*=unary();else if(take("/")){const d=unary();if(d===0)throw Error("Divisão por zero.");v/=d;}else break;}return v;};
  const expr=()=>{let v=term();while(true){if(take("+"))v+=term();else if(take("-"))v-=term();else break;}return v;};
  const value=expr();if(pos!==tokens.length)throw Error("Verifique a sintaxe da expressão.");if(!Number.isFinite(value))throw Error("Resultado indefinido ou fora do limite.");return value;
}


// v0.2.10 — Geradores offline integrados ao mesmo fluxo visual do Gerador de Nomes.
function renderGeneratorShell(toolId, title, description) {
  if (!generatorContainer) return null;
  showGeneratorDirect();
  generatorContainer.replaceChildren();
  recordUsage(toolId, "generator");
  const screen = el("section", "local-tool-screen generator-data-screen");
  screen.append(
    directHeader("← Voltar para Geradores", title, description, showGeneratorCatalog),
    offlineNotice("Processamento local", "Nenhum valor gerado é enviado para serviços externos.")
  );
  const panel = el("div", "name-generator-panel");
  screen.append(panel);
  generatorContainer.append(screen);
  return { screen, panel };
}
function addGeneratorField(parent, label, control) {
  const field = el("label", "name-generator-field");
  const title = el("span"); title.textContent = label;
  field.append(title, control); parent.append(field);
  return control;
}
function generatorSelect(entries) {
  const select = document.createElement("select");
  for (const [value, label] of entries) {
    const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option);
  }
  return select;
}
function generatorNumber(value, min, max) {
  const input = document.createElement("input");
  input.type = "number"; input.min = String(min); input.max = String(max); input.step = "1"; input.value = String(value);
  return input;
}
function generatorResult() {
  const pre = el("pre", "generator-code-result"); pre.setAttribute("aria-live", "polite"); pre.textContent = "Clique em Gerar para começar."; return pre;
}
function secureInt(max) {
  if (!Number.isSafeInteger(max) || max <= 0) throw new Error("O intervalo aleatório deve caber em um número inteiro seguro.");
  // Rejeição uniforme: até 32 bits em uma chamada, até 53 bits em duas.
  // Evita o viés de Math.random ou da operação % sem rejeição.
  if (max <= 0x100000000) {
    const limit = 0x100000000 - (0x100000000 % max);
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }
  const universe = 0x20000000000000; // 2^53, exato em Number
  const limit = universe - (universe % max);
  const buf = new Uint32Array(2);
  let candidate;
  do {
    crypto.getRandomValues(buf);
    candidate = (buf[0] & 0x1fffff) * 0x100000000 + buf[1];
  } while (candidate >= limit);
  return candidate % max;
}
function generateUuidV7() {
  // RFC 9562: 48-bit millisecond timestamp, random remaining bits, version 7, variant 10.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let timestamp = BigInt(Date.now());
  for (let i = 5; i >= 0; i--) { bytes[i] = Number(timestamp & 255n); timestamp >>= 8n; }
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
function generateUuidV4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const h = [...bytes].map(b => b.toString(16).padStart(2,"0")).join("");
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
function generatorActions(panel, produce, result) {
  const actions = el("div", "name-generator-actions");
  const generate = button("Gerar", "primary-button");
  const copy = button("Copiar", "ghost-button"); copy.disabled = true;
  generate.addEventListener("click", () => {
    try { result.textContent = produce(); copy.disabled = false; }
    catch (error) { result.textContent = error.message || "Falha na geração."; copy.disabled = true; }
  });
  copy.addEventListener("click", () => navigator.clipboard.writeText(result.textContent).then(() => {
    copy.textContent = "Copiado!"; setTimeout(() => { if (copy.isConnected) copy.textContent = "Copiar"; }, 1500);
  }).catch(() => { copy.textContent = "Não foi possível copiar"; }));
  actions.append(generate, copy); panel.append(actions);
  generate.click();
}
function openUuidGenerator() {
  const shell = renderGeneratorShell("generator-uuid", "Gerador de UUID", "Gere identificadores únicos para testes, APIs e bancos de dados.");
  if (!shell) return;
  const fields = el("div", "name-generator-fields");
  const version = addGeneratorField(fields,"Versão",generatorSelect([["v4","UUID v4 · aleatório"],["v7","UUID v7 · ordenável por tempo"]]));
  const quantity = addGeneratorField(fields,"Quantidade (1 a 100)",generatorNumber(5,1,100));
  shell.panel.append(fields);
  const output = generatorResult(); shell.panel.append(output);
  generatorActions(shell.panel, () => {
    const count = Math.floor(Number(quantity.value));
    if (!Number.isFinite(count) || count < 1 || count > 100) throw new Error("Escolha de 1 a 100 identificadores.");
    return Array.from({length:count}, () => version.value === "v7" ? generateUuidV7() : generateUuidV4()).join("\n");
  }, output);
}
const FAKE_SURNAMES = ["Silva", "Oliveira", "Costa", "Almeida", "Santos", "Pereira", "Ferreira", "Lima", "Barbosa", "Rocha", "Mendes", "Ribeiro"];
function fakeRecord(index) {
  const names = [...NAME_POOLS.masculine, ...NAME_POOLS.feminine, ...NAME_POOLS.unisex];
  const name = `${names[secureInt(names.length)]} ${FAKE_SURNAMES[secureInt(FAKE_SURNAMES.length)]}`;
  const alias = `exemplo-${String(index).padStart(3, "0")}-${secureInt(999999).toString().padStart(6,"0")}`;
  return {
    id: generateUuidV4(),
    nome: name,
    email: `${alias}@example.com`, // domínio reservado para exemplos, nunca entrega e-mail real.
    telefone: "+55 (00) 00000-0000", // claramente inválido / ilustrativo.
    endereco: "Rua Exemplo, 123, Bairro Fictício, Cidade Modelo",
    observacao: "DADO SINTÉTICO · Não representa uma pessoa real"
  };
}
function openFakeDataGenerator() {
  const shell = renderGeneratorShell("generator-fake-data", "Gerador de Dados Fictícios", "Crie registros ilustrativos sem copiar dados de pessoas reais.");
  if (!shell) return;
  const fields = el("div", "name-generator-fields");
  const amount = addGeneratorField(fields, "Registros (1 a 50)", generatorNumber(3,1,50));
  const format = addGeneratorField(fields, "Formato", generatorSelect([["json","JSON"],["csv","CSV"]]));
  shell.panel.append(fields);
  const output = generatorResult(); shell.panel.append(output);
  const notice = el("p", "local-generator-disclaimer");
  notice.textContent = "Os endereços e telefones são exemplos intencionalmente inválidos. Não use como informações reais ou para cadastros de terceiros.";
  shell.panel.append(notice);
  generatorActions(shell.panel, () => {
    const count = Math.floor(Number(amount.value));
    if (!Number.isFinite(count) || count < 1 || count > 50) throw new Error("Escolha de 1 a 50 registros.");
    const records = Array.from({length:count}, (_,index) => fakeRecord(index + 1));
    if (format.value === "json") return JSON.stringify(records,null,2);
    const cols = Object.keys(records[0]);
    const csv = value => `"${String(value).replaceAll('"','""')}"`;
    return [cols.join(","),...records.map(row => cols.map(key => csv(row[key])).join(","))].join("\n");
  }, output);
}

// v0.2.10 revisão — novos geradores. Web Crypto evita sorteios enviesados por Math.random.
function openRandomNumberGenerator() {
  const shell = renderGeneratorShell("generator-random-number", "Gerador de Números Aleatórios", "Configure intervalos, quantidade e repetição. Os sorteios usam Web Crypto e funcionam offline.");
  if (!shell) return;
  const fields = el("div", "name-generator-fields");
  const type = addGeneratorField(fields, "Tipo", generatorSelect([["integer", "Números inteiros"], ["decimal", "Números decimais"]]));
  const min = addGeneratorField(fields, "Mínimo", generatorNumber(1,-1000000000,1000000000));
  const max = addGeneratorField(fields, "Máximo", generatorNumber(100,-1000000000,1000000000));
  const quantity = addGeneratorField(fields, "Quantidade (1 a 500)", generatorNumber(5,1,500));
  const precision = addGeneratorField(fields, "Casas decimais", generatorNumber(2,0,8));
  const order = addGeneratorField(fields, "Organização", generatorSelect([["draw", "Ordem do sorteio"], ["asc", "Crescente"], ["desc", "Decrescente"]]));
  const uniqueRow = el("label", "name-generator-field");
  const unique = document.createElement("input"); unique.type = "checkbox";
  uniqueRow.append(unique, document.createTextNode(" Sem repetição")); fields.append(uniqueRow);
  type.addEventListener("change", () => {
    const integer = type.value === "integer";
    precision.closest("label").hidden = integer;
    min.step = max.step = integer ? "1" : "any";
    if (!integer) unique.checked = false;
    unique.disabled = !integer;
  });
  type.dispatchEvent(new Event("change"));
  shell.panel.append(fields);
  const result = generatorResult(); shell.panel.append(result);
  generatorActions(shell.panel, () => {
    const low = Number(min.value), high = Number(max.value), count = Number(quantity.value);
    if (![low,high,count].every(Number.isFinite) || low > high || low < -1e9 || high > 1e9 || !Number.isInteger(count) || count < 1 || count > 500) throw new Error("Informe intervalo válido (±1 bilhão) e quantidade entre 1 e 500.");
    let output;
    if (type.value === "integer") {
      if (!Number.isInteger(low) || !Number.isInteger(high)) throw new Error("Números inteiros exigem limites inteiros.");
      const span = high - low + 1;
      if (unique.checked && count > span) throw new Error("Não existem números suficientes nesse intervalo para evitar repetição.");
      if (unique.checked) {
        // Fisher-Yates parcial, sem gerar grandes vetores para intervalos extensos.
        const changes = new Map(); output = [];
        for (let i=0; i<count; i++) {
          const pick = i + secureInt(span - i);
          const chosen = changes.has(pick) ? changes.get(pick) : pick;
          changes.set(pick, changes.has(i) ? changes.get(i) : i);
          output.push(low + chosen);
        }
      } else output = Array.from({length:count}, () => low + secureInt(span));
    } else {
      const digits = Number(precision.value);
      if (!Number.isInteger(digits) || digits < 0 || digits > 8) throw new Error("Escolha entre 0 e 8 casas decimais.");
      const factor = 10 ** digits;
      const lo = Math.ceil(low * factor), hi = Math.floor(high * factor);
      if (lo > hi) throw new Error("Não existe valor possível no intervalo com essa precisão.");
      if (!Number.isSafeInteger(lo) || !Number.isSafeInteger(hi) || !Number.isSafeInteger(hi - lo + 1)) {
        throw new Error("Intervalo muito amplo para essa precisão. Reduza os limites ou as casas decimais.");
      }
      output = Array.from({length:count}, () => ((lo + secureInt(hi - lo + 1))/factor).toFixed(digits));
    }
    if (order.value !== "draw") output.sort((a,b)=>order.value === "asc" ? Number(a)-Number(b) : Number(b)-Number(a));
    return output.join("\n");
  }, result);
}

function openPasswordGenerator() {
  const shell = renderGeneratorShell("generator-password", "Gerador de Senhas", "Gere senhas fortes com Web Crypto. A ativação da ferramenta contextual permanece independente desta tela.");
  if (!shell) return;
  const fields = el("div", "name-generator-fields");
  const length = addGeneratorField(fields, "Caracteres (8 a 128)", generatorNumber(20,8,128));
  const quantity = addGeneratorField(fields, "Quantidade (1 a 30)", generatorNumber(5,1,30));
  const opts = [
    ["Letras maiúsculas", "ABCDEFGHIJKLMNOPQRSTUVWXYZ", true],
    ["Letras minúsculas", "abcdefghijklmnopqrstuvwxyz", true],
    ["Números", "0123456789", true],
    ["Símbolos", "!@#$%&*?_+-", true]
  ].map(([label, chars, checked]) => {
    const row=el("label","name-generator-field"); const check=document.createElement("input"); check.type="checkbox"; check.checked=checked;
    row.append(check,document.createTextNode(` ${label}`)); fields.append(row); return {chars,check};
  });
  shell.panel.append(fields);
  const note = el("div", "name-generator-notice"); note.textContent = "Para acessar seu cofre local criptografado, use a ferramenta de seleção de texto. Esta tela não lê nem modifica o cofre."; shell.panel.append(note);
  const result=generatorResult(); shell.panel.append(result);
  generatorActions(shell.panel,()=>{
    const n=Number(length.value), total=Number(quantity.value);
    if(!Number.isInteger(n)||n<8||n>128||!Number.isInteger(total)||total<1||total>30) throw new Error("Escolha entre 8–128 caracteres e 1–30 senhas.");
    const active=opts.filter(o=>o.check.checked);
    if (!active.length) throw new Error("Ative ao menos um conjunto de caracteres.");
    const all=active.map(o=>o.chars).join("");
    return Array.from({length:total},()=>{
      const chars=active.map(o=>o.chars[secureInt(o.chars.length)]);
      while(chars.length<n)chars.push(all[secureInt(all.length)]);
      for(let i=chars.length-1;i>0;i--){const j=secureInt(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}
      return chars.join("");
    }).join("\n");
  }, result);
}

// Configurações da roleta são independentes das configurações de temas e do catálogo.
// Não persistimos entradas nem resultados automaticamente: apenas preferências visuais.
const WHEEL_PREFS_KEY = "caixotaWheelPreferencesV1";
const WHEEL_PALETTES = Object.freeze({
  ocean: ["#1167ab", "#209bc0", "#2b77ae", "#1bb9a6", "#254a89", "#66a5cd"],
  vibrant: ["#ea4c89", "#7855cb", "#f59e36", "#18a88e", "#368ce4", "#e46a42"],
  sunset: ["#f36b43", "#efb04c", "#e24f71", "#8956bc", "#ef8758", "#bf386e"],
  pastel: ["#c56a8a", "#5288b8", "#609783", "#aa74b8", "#bd8251", "#737ec0"],
  forest: ["#21765c", "#679646", "#277f87", "#64733e", "#369b79", "#396d64"],
  monochrome: ["#363b4a", "#71798b", "#4b5265", "#858a99", "#596173", "#9aa1b0"]
});
const WHEEL_DEFAULTS = Object.freeze({
  palette: "ocean", duration: 5, confetti: true,
  showTitle: false, title: "", showDescription: false, description: "",
  soundEnabled: false, soundStart: true, soundSpin: true, soundWin: true,
  customColors: ["#2563eb", "#d946ef", "#059669", "#f59e0b"]
});
function wheelSafePrefs(stored) {
  const value = stored && typeof stored === "object" ? stored : {};
  const hex = /^#[\da-f]{6}$/i;
  return {
    palette: Object.hasOwn(WHEEL_PALETTES, value.palette) || value.palette === "custom" ? value.palette : WHEEL_DEFAULTS.palette,
    duration: Number.isFinite(Number(value.duration)) ? Math.max(2, Math.min(15, Math.round(Number(value.duration) * 2) / 2)) : 5,
    confetti: typeof value.confetti === "boolean" ? value.confetti : true,
    showTitle: value.showTitle === true, title: String(value.title || "").slice(0, 80),
    showDescription: value.showDescription === true, description: String(value.description || "").slice(0, 240),
    soundEnabled: value.soundEnabled === true,
    soundStart: value.soundStart !== false, soundSpin: value.soundSpin !== false, soundWin: value.soundWin !== false,
    customColors: Array.from({length:4}, (_,i) => hex.test(value.customColors?.[i]) ? value.customColors[i] : WHEEL_DEFAULTS.customColors[i])
  };
}
function wheelTextColor(hex) {
  const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16) / 255);
  const values = rgb.map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return values[0]*.2126 + values[1]*.7152 + values[2]*.0722 > .29 ? "#172333" : "#ffffff";
}
function openRaffleWheel() {
  const shell = renderGeneratorShell("generator-wheel", "Roleta de Sorteio", "Adicione opções (pessoas, tarefas, prêmios ou qualquer outra coisa) e faça um sorteio offline.");
  if (!shell) return;
  const panel = shell.panel;
  const form = el("div", "name-generator-fields");
  const input = document.createElement("textarea");
  input.rows = 6; input.value = "Opção A\nOpção B\nOpção C\nOpção D";
  input.placeholder = "Uma opção por linha";
  addGeneratorField(form, "Opções de sorteio (2 a 100)", input);
  const removeRow = el("label", "name-generator-field");
  const remove = document.createElement("input"); remove.type = "checkbox";
  removeRow.append(remove, document.createTextNode(" Remover opção sorteada dos próximos giros"));
  form.append(removeRow);
  panel.append(form);

  const toggleAdvanced = button("⚙ Configurações avançadas", "ghost-button caixota-wheel-advanced-toggle");
  toggleAdvanced.setAttribute("aria-expanded", "false");
  const advancedId = "caixota-wheel-settings";
  toggleAdvanced.setAttribute("aria-controls", advancedId);
  const advanced = el("section", "caixota-wheel-advanced");
  advanced.id = advancedId; advanced.hidden = true;
  const advTitle = el("h3"); advTitle.textContent = "Personalizar roleta"; advanced.append(advTitle);
  const advancedGrid = el("div", "name-generator-fields caixota-wheel-settings-grid");
  const palette = addGeneratorField(advancedGrid, "Paleta de cores", generatorSelect([
    ["ocean", "Azul oceano"], ["vibrant", "Vibrante"], ["sunset", "Pôr do sol"],
    ["pastel", "Pastel"], ["forest", "Floresta"], ["monochrome", "Monocromática"],
    ["custom", "Personalizada"]
  ]));
  const duration = document.createElement("input"); duration.type = "range";
  duration.min = "2"; duration.max = "15"; duration.step = "0.5"; duration.value = "5";
  const durationLabel = el("span", "caixota-wheel-range-label");
  const durationWrap = el("div", "caixota-wheel-range"); durationWrap.append(duration, durationLabel);
  addGeneratorField(advancedGrid, "Duração do giro", durationWrap);
  advanced.append(advancedGrid);

  const colorRow = el("div", "caixota-wheel-custom-colors");
  const customColors = WHEEL_DEFAULTS.customColors.map((color,i) => {
    const field = el("label");
    field.textContent = `Cor ${i+1}`;
    const picker = document.createElement("input"); picker.type = "color"; picker.value = color;
    field.append(picker); colorRow.append(field);
    return picker;
  });
  advanced.append(colorRow);
  const makeOption = (text, checked) => {
    const label = el("label", "caixota-wheel-check");
    const control = document.createElement("input"); control.type = "checkbox"; control.checked = checked;
    label.append(control, document.createTextNode(` ${text}`)); return {label, control};
  };
  const titleToggle = makeOption("Mostrar título", false);
  const titleInput = document.createElement("input"); titleInput.type = "text"; titleInput.maxLength = 80;
  titleInput.placeholder = "Ex.: Sorteio de prêmios"; titleInput.setAttribute("aria-label","Título da roleta");
  const titleGroup = el("div", "caixota-wheel-optional-field"); titleGroup.append(titleToggle.label, titleInput);
  const descriptionToggle = makeOption("Mostrar descrição", false);
  const descriptionInput = document.createElement("textarea"); descriptionInput.rows = 2; descriptionInput.maxLength = 240;
  descriptionInput.placeholder = "Descrição opcional do sorteio"; descriptionInput.setAttribute("aria-label","Descrição da roleta");
  const descGroup = el("div", "caixota-wheel-optional-field"); descGroup.append(descriptionToggle.label, descriptionInput);
  advanced.append(titleGroup, descGroup);

  const effects = el("div", "caixota-wheel-effects");
  const confetti = makeOption("Jogar confetes quando anunciar a opção sorteada", true);
  const sound = makeOption("Reproduzir sons", false);
  const soundOptions = el("div", "caixota-wheel-sound-options");
  const soundStart = makeOption("Ao iniciar", true), soundSpin = makeOption("Durante o giro", true), soundWin = makeOption("Ao anunciar o resultado", true);
  soundOptions.append(soundStart.label, soundSpin.label, soundWin.label);
  effects.append(confetti.label, sound.label, soundOptions); advanced.append(effects);
  const advancedHint = el("p", "name-generator-notice");
  advancedHint.textContent = "Preferências salvas somente neste navegador. Os sons são sintetizados localmente, sem arquivos ou serviços externos.";
  advanced.append(advancedHint);
  panel.append(toggleAdvanced, advanced);

  const headline = el("div", "caixota-wheel-headline");
  const wheelTitle = el("h3"); const wheelDescription = el("p");
  headline.append(wheelTitle, wheelDescription); headline.hidden = true;
  panel.append(headline);
  const stage = el("div", "caixota-wheel-stage");
  const wheel = document.createElement("canvas"); wheel.width = 640; wheel.height = 640;
  wheel.setAttribute("role", "img"); wheel.setAttribute("aria-label", "Roleta com opções de sorteio");
  const pointer = el("span", "caixota-wheel-pointer"); pointer.textContent = "▼"; pointer.setAttribute("aria-hidden", "true");
  const spin = button("GIRAR", "primary-button caixota-wheel-spin");
  spin.setAttribute("aria-label", "Girar a roleta e sortear uma opção");
  stage.append(wheel, pointer, spin); panel.append(stage);
  const result = el("div", "caixota-wheel-winner"); result.setAttribute("role", "status");
  result.textContent = "Configure as opções e gire a roleta."; panel.append(result);
  const actions = el("div", "name-generator-actions");
  const reset = button("Limpar histórico", "ghost-button"); actions.append(reset); panel.append(actions);
  const history = el("div", "caixota-wheel-history"); panel.append(history);

  // Popup acessível, construído sem innerHTML e anexado ao painel da ferramenta.
  const overlay = el("div", "caixota-wheel-overlay"); overlay.hidden = true;
  const confettiLayer = el("div", "caixota-wheel-confetti"); confettiLayer.setAttribute("aria-hidden", "true");
  const dialog = el("div", "caixota-wheel-dialog"); dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true"); dialog.setAttribute("aria-labelledby", "caixota-wheel-dialog-title");
  dialog.setAttribute("aria-describedby", "caixota-wheel-dialog-result");
  const dismiss = button("×", "caixota-wheel-close"); dismiss.setAttribute("aria-label", "Fechar resultado");
  const trophy = el("div", "caixota-wheel-trophy"); trophy.textContent = "🏆";
  const dialogTitle = el("h2"); dialogTitle.id = "caixota-wheel-dialog-title"; dialogTitle.textContent = "Resultado do sorteio!";
  const dialogResult = el("strong"); dialogResult.id = "caixota-wheel-dialog-result";
  const closeResult = button("Fechar", "primary-button");
  dialog.append(dismiss, trophy, dialogTitle, dialogResult, closeResult);
  overlay.append(confettiLayer, dialog); shell.screen.append(overlay);

  let entries = [], rot = 0, busy = false, draws = [], dirty = true;
  let prefsLoaded = false, activeAudio = null, tickTimer = null;
  let wheelVolumePercent = 25;
  try {chrome.storage.local.get('caixotaUiV3').then(data=>{
    const volume=Number(data?.caixotaUiV3?.volume);
    if(Number.isFinite(volume))wheelVolumePercent=Math.max(0,Math.min(100,volume));
  }).catch(()=>{});} catch(_error) {}
  let previousFocus = null;
  const reducedMotion = () => document.body.dataset.quality==='eco'||document.body.dataset.effects==='off'||window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  const livePrefs = () => wheelSafePrefs({
    palette: palette.value, duration: duration.value, confetti: confetti.control.checked,
    showTitle: titleToggle.control.checked, title: titleInput.value,
    showDescription: descriptionToggle.control.checked, description: descriptionInput.value,
    soundEnabled: sound.control.checked, soundStart: soundStart.control.checked,
    soundSpin: soundSpin.control.checked, soundWin: soundWin.control.checked,
    customColors: customColors.map(c => c.value)
  });
  function applyPrefs(p) {
    palette.value = p.palette; duration.value = String(p.duration);
    confetti.control.checked = p.confetti;
    titleToggle.control.checked = p.showTitle; titleInput.value = p.title;
    descriptionToggle.control.checked = p.showDescription; descriptionInput.value = p.description;
    sound.control.checked = p.soundEnabled; soundStart.control.checked = p.soundStart;
    soundSpin.control.checked = p.soundSpin; soundWin.control.checked = p.soundWin;
    customColors.forEach((picker,i) => picker.value = p.customColors[i]);
    refreshSettings();
  }
  function persistPrefs() {
    if (!prefsLoaded) return;
    try { chrome.storage.local.set({[WHEEL_PREFS_KEY]: livePrefs()}).catch(()=>{}); } catch (_error) {}
  }
  function refreshSettings() {
    const custom = palette.value === "custom";
    colorRow.hidden = !custom;
    durationLabel.textContent = `${Number(duration.value).toLocaleString("pt-BR")} segundos`;
    titleInput.disabled = !titleToggle.control.checked;
    descriptionInput.disabled = !descriptionToggle.control.checked;
    soundOptions.hidden = !sound.control.checked;
    soundOptions.querySelectorAll("input").forEach(control => control.disabled = !sound.control.checked);
    wheelTitle.textContent = titleToggle.control.checked ? titleInput.value.trim() : "";
    wheelDescription.textContent = descriptionToggle.control.checked ? descriptionInput.value.trim() : "";
    wheelTitle.hidden = !wheelTitle.textContent;
    wheelDescription.hidden = !wheelDescription.textContent;
    headline.hidden = wheelTitle.hidden && wheelDescription.hidden;
    draw();
  }
  toggleAdvanced.addEventListener("click", () => {
    advanced.hidden = !advanced.hidden;
    toggleAdvanced.setAttribute("aria-expanded", String(!advanced.hidden));
    toggleAdvanced.textContent = advanced.hidden ? "⚙ Configurações avançadas" : "⚙ Ocultar configurações avançadas";
  });
  [palette,duration,titleInput,descriptionInput,...customColors].forEach(control => {
    control.addEventListener("input", () => {refreshSettings();persistPrefs();});
    control.addEventListener("change", () => {refreshSettings();persistPrefs();});
  });
  [titleToggle.control,descriptionToggle.control,confetti.control,sound.control,soundStart.control,soundSpin.control,soundWin.control].forEach(control => {
    control.addEventListener("change", () => {refreshSettings();persistPrefs();});
  });
  try {
    chrome.storage.local.get(WHEEL_PREFS_KEY).then(saved => {
      if (!shell.screen.isConnected) return;
      prefsLoaded = true; applyPrefs(wheelSafePrefs(saved?.[WHEEL_PREFS_KEY]));
    }).catch(() => {prefsLoaded = true;refreshSettings();});
  } catch (_error) {prefsLoaded = true;refreshSettings();}

  function parse() {
    const values = input.value.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    if (values.length < 2 || values.length > 100) throw Error("Use de 2 a 100 opções.");
    if (values.some(v => v.length > 80)) throw Error("Cada opção deve ter até 80 caracteres.");
    return values;
  }
  function draw() {
    const ctx = wheel.getContext("2d"); if (!ctx) return;
    const cx=320, cy=320, r=305, n=entries.length;
    ctx.clearRect(0,0,640,640);
    const colors = palette.value === "custom" ? customColors.map(p => p.value) : (WHEEL_PALETTES[palette.value] || WHEEL_PALETTES.ocean);
    entries.forEach((name,i) => {
      const from=-Math.PI/2+i*2*Math.PI/n, to=-Math.PI/2+(i+1)*2*Math.PI/n;
      const color = colors[i%colors.length];
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,from,to);ctx.closePath();
      ctx.fillStyle=color;ctx.fill();ctx.strokeStyle="rgba(255,255,255,.68)";ctx.lineWidth=2;ctx.stroke();
      if (n<=24) {
        ctx.save();ctx.translate(cx,cy);ctx.rotate((from+to)/2);
        ctx.fillStyle=wheelTextColor(color);ctx.font=`bold ${n<=10?21:n<=18?16:13}px system-ui`;
        ctx.textAlign="right";ctx.fillText(name.slice(0,n>14?13:22),r-15,6,r-50);ctx.restore();
      }
    });
    // O centro da roleta pertence ao botão, sem texto ou marca desenhada no canvas.
    ctx.beginPath();ctx.arc(cx,cy,49,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,.92)";ctx.fill();
  }
  function resetWheel() {
    if (busy) return;
    try {
      entries=parse();rot=0;wheel.style.transition="none";wheel.style.transform="rotate(0deg)";
      draw();dirty=false;spin.disabled=false;result.textContent="Pronto para sortear!";
    } catch (error) {
      result.textContent=error.message;entries=[];spin.disabled=true;
      const ctx=wheel.getContext("2d");ctx?.clearRect(0,0,640,640);
    }
  }
  input.addEventListener("input",()=>{dirty=true;resetWheel();});
  reset.addEventListener("click",()=>{draws=[];history.replaceChildren();result.textContent="Histórico da sessão limpo.";});

  function closePopup() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    confettiLayer.replaceChildren();
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
    else spin.focus({preventScroll:true});
  }
  dismiss.addEventListener("click", closePopup);
  closeResult.addEventListener("click", closePopup);
  overlay.addEventListener("click",event => { if (event.target === overlay) closePopup(); });
  overlay.addEventListener("keydown",event => {
    if (event.key === "Escape") {event.preventDefault();closePopup();}
    if (event.key !== "Tab") return;
    const focusable=[dismiss,closeResult];
    const current=focusable.indexOf(document.activeElement);
    if (event.shiftKey && current===0) {event.preventDefault();closeResult.focus();}
    else if (!event.shiftKey && current===focusable.length-1) {event.preventDefault();dismiss.focus();}
  });
  function addConfetti() {
    confettiLayer.replaceChildren();
    if (reducedMotion()) return;
    const colors = livePrefs().palette === "custom" ? customColors.map(x=>x.value) : (WHEEL_PALETTES[palette.value] || WHEEL_PALETTES.ocean);
    for(let i=0;i<28;i++) {
      const piece=el("span", "caixota-wheel-confetti-piece");
      piece.style.setProperty("--confetti-x", `${secureInt(100)}%`);
      piece.style.setProperty("--confetti-drift", `${secureInt(241)-120}px`);
      piece.style.setProperty("--confetti-delay", `${secureInt(800)}ms`);
      piece.style.setProperty("--confetti-duration", `${1900+secureInt(1400)}ms`);
      piece.style.backgroundColor=colors[i%colors.length];confettiLayer.append(piece);
    }
  }
  function showWinner(winner) {
    previousFocus=document.activeElement;
    dialogResult.textContent=winner;
    overlay.hidden=false;
    if (confetti.control.checked&&!reducedMotion()) addConfetti();
    else confettiLayer.replaceChildren();
    dismiss.focus({preventScroll:true});
  }
  async function audioReady() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx || !sound.control.checked || document.body.dataset.sound==='off') return null;
    try {
      if (!activeAudio || activeAudio.state === "closed") activeAudio = new AudioCtx();
      if (activeAudio.state === "suspended") await activeAudio.resume();
      return activeAudio;
    } catch(_error) {return null;}
  }
  function tone(frequency,durationMs=80,volume=.035,delay=0,type="sine") {
    const ctx=activeAudio; if(!ctx || ctx.state!=="running"||document.body.dataset.sound==='off') return;
    wheelVolumePercent=Number(document.body.dataset.volume)||0;if(!wheelVolumePercent)return;
    try {
      const start=ctx.currentTime+delay, stop=start+durationMs/1000;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.type=type;osc.frequency.setValueAtTime(frequency,start);
      gain.gain.setValueAtTime(.0001,start);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001,Math.min(.14,volume*(wheelVolumePercent/25))),start+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,stop);
      osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(stop+.015);
    }catch(_error){}
  }
  function stopTicking() {if(tickTimer!==null){clearInterval(tickTimer);tickTimer=null;}}
  spin.addEventListener("click", async () => {
    if(busy) return;
    if(dirty) resetWheel();
    if(entries.length<2) {result.textContent="Adicione ao menos duas opções antes de girar.";return;}
    const idx=secureInt(entries.length), winner=entries[idx],slice=360/entries.length;
    // Posição realmente aleatória dentro da fatia sorteada, com margem
    // de segurança para a seta não tocar a borda do setor.
    const margin=Math.min(.15,2.5/slice);
    const within=margin+(secureInt(1000000)/1000000)*(1-2*margin);
    const desired=((-(idx+within)*slice)%360+360)%360;
    const current=((rot%360)+360)%360;
    const offset=((desired-current)%360+360)%360;
    const options=livePrefs(); const ms=options.duration*1000;
    rot+=360*Math.max(4,Math.round(options.duration*1.2))+offset;
    busy=true;spin.disabled=true;input.disabled=true;
    result.textContent="Girando…";
    const audioPromise=audioReady();
    if(options.soundEnabled) {
      audioPromise.then(ctx => {
        if(!ctx || !busy) return;
        if(options.soundStart) {tone(490,110,.055);tone(735,140,.04,.11);}
        if(options.soundSpin) {
          tickTimer=setInterval(()=>{
            if(!busy||!shell.screen.isConnected){stopTicking();return;}
            tone(320+secureInt(170),35,.013,0,"triangle");
          },140);
        }
      });
    }
    const noMotion=reducedMotion();
    wheel.style.transition=noMotion?"none":`transform ${options.duration}s cubic-bezier(.13,.67,.13,1)`;
    void wheel.offsetWidth;
    let completed=false,fallback;
    const finish=event=>{
      if(event&&(event.target!==wheel||event.propertyName!=="transform"))return;
      if(completed)return;
      completed=true;clearTimeout(fallback);wheel.removeEventListener("transitionend",finish);stopTicking();
      busy=false;spin.disabled=false;input.disabled=false;
      if(!shell.screen.isConnected)return;
      draws.unshift(winner);result.textContent=`🎉 Sorteado: ${winner}`;
      history.replaceChildren(el("strong"));history.firstChild.textContent="Histórico desta sessão:";
      const list=el("ol");draws.forEach(name=>{const li=el("li");li.textContent=name;list.append(li);});history.append(list);
      if(remove.checked) {
        const lines=input.value.split(/\r?\n/);const position=lines.findIndex(v=>v.trim()===winner);
        if(position>=0)lines.splice(position,1);
        input.value=lines.join("\n");dirty=true;
        if(lines.filter(v=>v.trim()).length<2)spin.disabled=true;
      }
      if(options.soundEnabled&&options.soundWin) {
        audioPromise.then(ctx => {
          if(!ctx) return;
          [523.25,659.25,783.99,1046.5].forEach((f,i)=>tone(f,220,.045,i*.12));
        });
      }
      showWinner(winner);
    };
    wheel.addEventListener("transitionend",finish);
    fallback=setTimeout(()=>finish(null),noMotion?70:ms+450);
    requestAnimationFrame(()=>{wheel.style.transform=`rotate(${rot}deg)`;});
  });
  resetWheel();
  refreshSettings();
}

}

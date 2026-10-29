import * as pdfjsLib from "./vendor/pdf.min.mjs";
import { PDF_TOOL_CATALOG } from "./panel-catalog.mjs";
import {
  MAX_PDF_FILE_BYTES,
  MAX_PDF_SESSION_BYTES,
  createMixedPdf,
  cropPdfPages,
  extractPdfPages,
  getPdfPageCount,
  imagesToPdf,
  mergePdfFiles,
  numberPdfPages,
  parsePageSelection,
  removePdfPages,
  reorderPdfPages,
  rotatePdfPages,
  splitPdf,
  watermarkPdf
} from "./pdf-core.mjs";
import { PDFDocument } from "./vendor/pdf-lib.esm.min.mjs";
import { convertOfficeToPdf } from "./assets/office-pdf.mjs";

export function initialize(document, window, bridge){

pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("vendor/pdf.worker.min.mjs");

const container = document.getElementById("pdfToolsContainer");
const downloadUrls = new Set();
const activePdfDocuments = new Set();
let activeScreenToken = 0;

const PDF_BUILDERS = {
  "pdf-combine": buildMixedPdfTool,
  "pdf-office": buildOfficePdfTool,
  "pdf-split": buildSplitTool,
  "pdf-organize": buildOrganizeTool,
  "pdf-remove": (screen) => buildPageSelectionTool(screen, "remove"),
  "pdf-extract": (screen) => buildPageSelectionTool(screen, "extract"),
  "pdf-to-image": buildPdfToImageTool,
  "pdf-to-text": buildPdfToTextTool,
  "pdf-rotate": buildRotateTool,
  "pdf-watermark": buildWatermarkTool,
  "pdf-number": buildNumberTool,
  "pdf-crop": buildCropTool,
  "pdf-compress": buildPdfCompress,
  "pdf-sign": buildPdfSign,
  "pdf-unlock": buildPdfUnlock,
  "pdf-repair": buildPdfRepair
};
const PDF_TOOLS = PDF_TOOL_CATALOG.map((tool) => ({ ...tool, title: tool.label, build: PDF_BUILDERS[tool.id] })).filter((tool) => typeof tool.build === "function");

if (container) renderCatalog();
document.addEventListener("caixota:open-direct-tool", (event) => {
  if (event.detail?.category !== "pdf") return;
  const tool = PDF_TOOLS.find((item) => item.id === event.detail.toolId);
  if (tool) openTool(tool);
});
document.addEventListener("caixota:favorites-updated", updatePdfFavoriteButtons);
document.addEventListener("caixota:aliases-updated", renderCatalog);
document.addEventListener("caixota:show-direct-catalog", (event) => {
  if (event.detail?.category === "pdf") renderCatalog();
});
document.addEventListener("caixota:reset-direct-tools", (event) => {
  if (event.detail?.category === "pdf" || event.detail?.category === "all") renderCatalog();
});

function createPdfNetworkBadge(network = "offline") {
  const shared = bridge?.createNetworkBadge?.(network);
  if (shared) return shared;
  const badge = document.createElement("span");
  const normalized = network === "required" ? "required" : (network === "optional" ? "optional" : "offline");
  badge.className = `network-badge ${normalized === "required" ? "needs-internet" : (normalized === "optional" ? "may-use-internet" : "works-offline")}`;
  const label = normalized === "required" ? "Internet" : (normalized === "optional" ? "Internet Opcional" : "Offline");
  badge.innerHTML = normalized === "offline"
    ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.1 7.1a6.9 6.9 0 0 1 9.8 0M5.1 9.1a4.1 4.1 0 0 1 5.8 0M6.8 11.2a1.7 1.7 0 0 1 2.4 0M2.2 2.2l11.6 11.6"/></svg>'
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.7"/><path d="M2.6 8h10.8M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.2 8 13.7M8 2.3C6.5 3.8 5.7 5.7 5.7 8s.8 4.2 2.3 5.7"/></svg>';
  badge.append(document.createTextNode(label));
  return badge;
}

function displayPdfLabel(tool) {
  return bridge?.getToolLabel?.("pdf", tool.id, tool.title) || tool.title;
}

function renderCatalog() {
  activeScreenToken += 1;
  clearDownloadUrls();
  clearPdfDocuments();
  container.innerHTML = "";

  const hero = element("div", "pdf-catalog-hero");
  hero.innerHTML = `<div><span class="eyebrow">Processamento local</span><h2>Ferramentas de PDF</h2><p>Organize, converta e edite documentos sem enviar seus arquivos para servidores.</p></div>`;
  const heroBadge = createPdfNetworkBadge("offline");
  hero.appendChild(heroBadge);
  container.appendChild(hero);

  for (const groupName of ["Organizar", "Converter", "Editar", "Otimizar e recuperar"]) {
    const section = element("section", "pdf-tool-group");
    const heading = element("div", "pdf-group-heading");
    const title = document.createElement("h3");
    title.textContent = groupName;
    const count = document.createElement("span");
    count.textContent = `${PDF_TOOLS.filter((tool) => tool.group === groupName).length} ferramentas`;
    heading.append(title, count);
    const grid = element("div", "pdf-card-grid");
    PDF_TOOLS.filter((tool) => tool.group === groupName).forEach((tool) => grid.appendChild(createToolCard(tool)));
    section.append(heading, grid);
    container.appendChild(section);
  }
}

function createToolCard(tool) {
  const wrapper = element("article", "pdf-tool-card-wrap");
  const card = document.createElement("button");
  card.type = "button";
  card.className = "pdf-tool-card";
  card.dataset.pdfTool = tool.id;
  card.innerHTML = `<span class="pdf-tool-icon" aria-hidden="true">${tool.icon}</span><span class="pdf-tool-copy"><strong>${escapeHtml(displayPdfLabel(tool))}</strong><small>${escapeHtml(tool.description)}</small></span><span class="pdf-tool-arrow" aria-hidden="true">›</span>`;
  const badge = createPdfNetworkBadge(tool.network || "offline");
  card.querySelector(".pdf-tool-copy")?.appendChild(badge);
  card.addEventListener("click", () => openTool(tool));
  const favorite = createPdfFavoriteButton(tool);
  wrapper.append(card, favorite);
  return wrapper;
}

function createPdfFavoriteButton(tool) {
  const button = actionButton("☆", "pdf-favorite-button");
  button.dataset.favoriteTool = tool.id;
  button.dataset.favoriteCategory = "pdf";
  button.addEventListener("click", async () => {
    await bridge?.toggleFavorite?.("pdf", tool.id);
    updatePdfFavoriteButtons();
  });
  updateSinglePdfFavoriteButton(button);
  return button;
}

function updateSinglePdfFavoriteButton(button) {
  const active = Boolean(bridge?.isFavorite?.("pdf", button.dataset.favoriteTool));
  button.textContent = active ? "★" : "☆";
  button.classList.toggle("is-active", active);
  button.setAttribute("aria-pressed", String(active));
  button.setAttribute("aria-label", active ? "Desfavoritar ferramenta" : "Favoritar ferramenta");
  button.title = button.getAttribute("aria-label");
}

function updatePdfFavoriteButtons() {
  container?.querySelectorAll('.pdf-favorite-button[data-favorite-tool]').forEach(updateSinglePdfFavoriteButton);
}

function openTool(tool) {
  activeScreenToken += 1;
  clearDownloadUrls();
  clearPdfDocuments();
  container.innerHTML = "";
  const shell = element("section", "pdf-tool-screen");
  shell.dataset.pdfScreen = tool.id;
  const top = element("div", "pdf-screen-top");
  const back = actionButton("← Voltar para PDF", "ghost-button pdf-back-button");
  back.addEventListener("click", renderCatalog);
  const heading = element("div", "pdf-screen-heading");
  heading.innerHTML = `<span class="eyebrow">${escapeHtml(tool.group)} · PDF</span><h2>${escapeHtml(displayPdfLabel(tool))}</h2><p>${escapeHtml(tool.description)}</p>`;
  top.append(back, heading);
  const privacy = element("div", "pdf-privacy-note");
  privacy.innerHTML = `<span aria-hidden="true">✓</span><div><strong>Processado no seu navegador</strong><small>O arquivo não sai deste dispositivo. Nada é enviado ou salvo pela Caixota.</small></div>`;
  const body = element("div", "pdf-screen-body");
  const status = element("div", "pdf-status");
  status.setAttribute("role", "status");
  const result = element("div", "pdf-result-area");
  shell.append(top, privacy, body, status, result);
  container.appendChild(shell);
  tool.build({ tool, shell, body, status, result, token: activeScreenToken });
  back.focus({ preventScroll: true });
}

function buildOfficePdfTool(screen){
 let selected=[];
 const note=element('div','pdf-privacy-note');note.innerHTML='<span aria-hidden="true">ⓘ</span><div><strong>Conversão de conteúdo, sem internet</strong><small>TXT mantém o texto. Word, Excel e PowerPoint podem perder fontes, gráficos, imagens e o desenho original. Revise o PDF antes de usá-lo.</small></div>';
 const picker=createFileDrop({accept:'.txt,.docx,.xlsx,.pptx',multiple:true,label:'Arraste TXT, Word, Excel ou PowerPoint',hint:'Até 20 MB por arquivo · Conversão local',onFiles(files){
  selected=files.slice(0,12).filter(f=>/\.(txt|docx|xlsx|pptx)$/i.test(f.name));list.replaceChildren();for(const f of selected){const div=element('div','pdf-download-row');div.textContent=`${f.name} · ${formatBytes(f.size)}`;list.append(div);}button.disabled=!selected.length;setStatus(screen.status,`${selected.length} arquivo(s) pronto(s) para converter.`,selected.length?'success':'error');
 }});
 const list=element('div','pdf-file-list');const page=selectField('Tamanho da página',[['A4','A4'],['letter','Carta']],'A4');
 const button=actionButton('Converter para PDF','primary-button');button.disabled=true;
 button.addEventListener('click',()=>runProcess(screen,button,async progress=>{
  const outputs=[];for(let i=0;i<selected.length;i++){
   progress(`Convertendo ${selected[i].name} (${i+1}/${selected.length})…`,Math.round(8+(i/selected.length)*85));
   const result=await convertOfficeToPdf(selected[i],{pageSize:page.input.value});
   outputs.push({name:selected[i].name.replace(/\.[^.]+$/,'')+'.pdf',bytes:result.bytes,type:'application/pdf'});
   await new Promise(r=>setTimeout(r,0));
  }
  renderDownloads(screen.result,outputs);
 }));
 screen.body.append(note,picker.root,list,formGrid(page.field),createActions(button));
}

function buildMixedPdfTool(screen) {
  let pages = [];
  let sources = [];
  const drop = createFileDrop({
    accept: ".pdf,application/pdf,image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif",
    multiple: true,
    label: "Adicione PDFs e imagens",
    hint: "Cada página e imagem poderá ser arrastada para a posição desejada",
    onFiles: addFiles
  });
  const list = element("div", "pdf-page-grid pdf-mixed-page-grid is-organizer");
  const pageSize = selectField("Página das imagens", [["a4", "A4"], ["letter", "Carta"], ["image", "Tamanho da imagem"]], "a4");
  const orientation = selectField("Orientação das imagens", [["auto", "Automática"], ["portrait", "Retrato"], ["landscape", "Paisagem"]], "auto");
  const margin = numberField("Margem das imagens (pt)", 24, 0, 144, 1);
  const options = formGrid(pageSize.field, orientation.field, margin.field);
  const addMore = actionButton("Adicionar mais arquivos", "ghost-button");
  addMore.addEventListener("click", () => drop.input.click());
  const process = actionButton("Juntar arquivos", "primary-button");
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    if (!pages.length) throw new Error("Adicione pelo menos uma página ou imagem.");
    const pdfBytes = new Map();
    const imageInputs = new Map();
    const items = [];
    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      progress(`Preparando item ${index + 1} de ${pages.length}…`, 8 + index / pages.length * 66);
      if (page.kind === "pdf") {
        if (!pdfBytes.has(page.source.id)) pdfBytes.set(page.source.id, await readPdfItem(page.source));
        items.push({ kind: "pdf", sourceId: page.source.id, bytes: pdfBytes.get(page.source.id), pageIndex: page.pageIndex });
      } else {
        if (!imageInputs.has(page.source.id)) imageInputs.set(page.source.id, await imageFileToPdfInput(page.source.file));
        const image = imageInputs.get(page.source.id);
        items.push({ kind: "image", bytes: image.bytes, type: image.type });
      }
      if (index % 4 === 0) await nextFrame();
    }
    progress("Montando o PDF na ordem escolhida…", 82);
    const bytes = await createMixedPdf(items, {
      pageSize: pageSize.input.value,
      orientation: orientation.input.value,
      margin: Number(margin.input.value)
    });
    renderDownloads(screen.result, [{ name: "caixota-arquivos-combinados.pdf", bytes, type: "application/pdf" }]);
  }));
  const actions = createActions(addMore, process);
  list.hidden = true;
  options.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, list, options, actions);

  async function addFiles(files) {
    const selected = [...files].filter(Boolean);
    if (!selected.length) return;
    try {
      const additions = selected.map((file) => {
        const kind = file.type === "application/pdf" || /\.pdf$/i.test(file.name) ? "pdf" : "image";
        const [item] = validateFiles([file], kind);
        return { ...item, kind };
      });
      assertSessionSize([...sources, ...additions]);
      let projectedPages = pages.length;
      for (let index = 0; index < additions.length; index += 1) {
        const source = additions[index];
        setStatus(screen.status, `Preparando ${index + 1} de ${additions.length}: ${source.file.name}`, "progress", 8 + index / additions.length * 76);
        if (source.kind === "pdf") {
          const bytes = await readPdfItem(source);
          const count = await getPdfPageCount(bytes);
          projectedPages += count;
          if (projectedPages > 500) throw new Error("O criador aceita até 500 páginas por vez para manter o navegador estável.");
          const models = await createPageModels(bytes, screen.token, (done, total) => {
            const fileProgress = (index + done / Math.max(1, total)) / additions.length;
            setStatus(screen.status, `Miniaturas de “${source.file.name}”: ${done} de ${total}…`, "progress", 8 + fileProgress * 76);
          });
          models.forEach((model) => pages.push({
            id: `${source.id}-page-${model.index}`,
            kind: "pdf",
            source,
            pageIndex: model.index,
            thumbnail: model.thumbnail
          }));
        } else {
          projectedPages += 1;
          if (projectedPages > 500) throw new Error("O criador aceita até 500 páginas por vez para manter o navegador estável.");
          pages.push({ id: `${source.id}-image`, kind: "image", source, pageIndex: 0, thumbnail: await createImageThumbnail(source.file) });
        }
        sources.push(source);
        await nextFrame();
      }
      render();
      setStatus(screen.status, `${pages.length} ${pages.length === 1 ? "página pronta" : "páginas prontas"}. Arraste para definir a ordem final.`, "success", 100);
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
      render();
    }
  }

  function render() {
    renderSortableItems(list, pages, {
      card: true,
      onChange(next) { pages = next; render(); },
      label: (page, index) => page.kind === "pdf"
        ? `Posição ${index + 1} · ${page.source.file.name} · pág. ${page.pageIndex + 1}`
        : `Posição ${index + 1} · ${page.source.file.name}`,
      meta: (page) => page.kind === "pdf" ? "Página de PDF" : "Imagem como página",
      thumb: (page) => page.thumbnail,
      removable: true
    });
    const visible = pages.length > 0;
    list.hidden = !visible;
    options.hidden = !visible;
    actions.hidden = !visible;
    process.disabled = !visible;
  }

  async function createImageThumbnail(file) {
    let drawable;
    let objectUrl = "";
    try {
      if (typeof createImageBitmap === "function") drawable = await createImageBitmap(file);
    } catch (_error) {}
    if (!drawable) {
      objectUrl = URL.createObjectURL(file);
      drawable = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Não foi possível abrir “${file.name}”.`));
        image.src = objectUrl;
      });
    }
    try {
      const width = drawable.width || drawable.naturalWidth;
      const height = drawable.height || drawable.naturalHeight;
      const scale = Math.min(1, 170 / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext("2d", { alpha: false });
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(drawable, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.76);
    } finally {
      drawable?.close?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }
}

function buildMergeTool(screen) {
  let items = [];
  const drop = createFileDrop({ accept: ".pdf,application/pdf", multiple: true, label: "Arraste dois ou mais PDFs", hint: "ou clique para escolher arquivos", onFiles: addFiles });
  const list = element("div", "pdf-file-list");
  const addMore = actionButton("Adicionar mais PDFs", "ghost-button");
  addMore.addEventListener("click", () => drop.input.click());
  const process = actionButton("Unir PDFs", "primary-button");
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    if (items.length < 2) throw new Error("Adicione pelo menos dois PDFs para unir.");
    progress("Lendo os documentos…", 18);
    const values = await Promise.all(items.map((item) => readPdfItem(item)));
    progress("Copiando as páginas na ordem escolhida…", 58);
    const bytes = await mergePdfFiles(values);
    progress("Preparando o download…", 92);
    renderDownloads(screen.result, [{ name: "caixota-pdfs-unidos.pdf", bytes, type: "application/pdf" }]);
  }));
  const actions = createActions(addMore, process);
  list.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, list, actions);

  async function addFiles(files) {
    try {
      const added = validateFiles(files, "pdf");
      const nextItems = [...items, ...added];
      assertSessionSize(nextItems);
      setStatus(screen.status, "Validando os PDFs e contando páginas…", "progress", 18);
      await Promise.all(added.map(async (item) => { item.pageCount = await getPdfPageCount(await readPdfItem(item)); }));
      items = nextItems;
      render();
      setStatus(screen.status, `${items.length} PDFs prontos para ordenar.`, "success");
    } catch (error) { setStatus(screen.status, error.message, "error"); }
  }

  function render() {
    renderSortableItems(list, items, {
      empty: "Adicione pelo menos dois PDFs.",
      onChange(next) { items = next; render(); },
      meta: (item) => `${item.pageCount} ${item.pageCount === 1 ? "página" : "páginas"} · ${formatBytes(item.file.size)}`
    });
    list.hidden = !items.length;
    actions.hidden = !items.length;
    process.disabled = items.length < 2;
  }
  render();
}

function buildSplitTool(screen) {
  let item = null;
  const drop = createSinglePdfPicker(screen, (next) => {
    item = next;
    process.disabled = false;
    summary.textContent = next.file.name;
    summary.hidden = false;
    form.hidden = false;
    actions.hidden = false;
  });
  const summary = element("div", "pdf-selected-file");
  summary.textContent = "Nenhum PDF selecionado";
  const mode = selectField("Como dividir", [["all", "Uma saída para cada página"], ["ranges", "Usar intervalos"]]);
  const ranges = textField("Intervalos", "1-3,5,8-12");
  ranges.field.hidden = true;
  mode.input.addEventListener("change", () => { ranges.field.hidden = mode.input.value !== "ranges"; });
  const process = actionButton("Dividir PDF", "primary-button");
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    const bytes = await readPdfItem(item);
    progress("Analisando as páginas…", 28);
    const outputs = await splitPdf(bytes, { mode: mode.input.value, ranges: ranges.input.value });
    progress("Gerando os arquivos separados…", 82);
    const base = baseFilename(item.file.name);
    renderDownloads(screen.result, outputs.map((output, index) => ({ name: `${base}-parte-${sanitizeFilename(output.label || index + 1)}.pdf`, bytes: output.bytes, type: "application/pdf" })));
  }));
  const form = formGrid(mode.field, ranges.field);
  const actions = createActions(process);
  summary.hidden = true;
  form.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, summary, form, actions);
}

function buildOrganizeTool(screen) {
  let item = null;
  let pages = [];
  const grid = element("div", "pdf-page-grid is-organizer");
  const drop = createSinglePdfPicker(screen, async (next) => {
    item = next;
    pages = [];
    process.disabled = true;
    grid.innerHTML = "";
    setStatus(screen.status, "Gerando miniaturas localmente…", "progress", 20);
    try {
      pages = await createPageModels(await readPdfItem(item), screen.token, (done, total) => setStatus(screen.status, `Miniaturas ${done} de ${total}…`, "progress", 20 + done / total * 55));
      renderPages();
      grid.hidden = false;
      actions.hidden = false;
      process.disabled = false;
      setStatus(screen.status, `${pages.length} páginas prontas para reorganizar.`, "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  const process = actionButton("Salvar nova ordem", "primary-button");
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    progress("Aplicando a nova ordem…", 48);
    const output = await reorderPdfPages(await readPdfItem(item), pages.map((page) => page.index));
    renderDownloads(screen.result, [{ name: `${baseFilename(item.file.name)}-organizado.pdf`, bytes: output, type: "application/pdf" }]);
  }));
  const actions = createActions(process);
  grid.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, grid, actions);

  function renderPages() {
    renderSortableItems(grid, pages, {
      card: true,
      onChange(next) { pages = next; renderPages(); },
      label: (page, index) => `Página ${page.index + 1} · posição ${index + 1}`,
      thumb: (page) => page.thumbnail,
      removable: false
    });
  }
}

function buildPageSelectionTool(screen, mode) {
  let item = null;
  let pages = [];
  const selected = new Set();
  const grid = element("div", "pdf-page-grid");
  const toolbar = element("div", "pdf-selection-toolbar");
  const all = actionButton("Selecionar todas", "ghost-button");
  const none = actionButton("Limpar seleção", "ghost-button");
  const selectionCount = element("span", "pdf-selection-count");
  all.addEventListener("click", () => { pages.forEach((page) => selected.add(page.index)); renderPages(); });
  none.addEventListener("click", () => { selected.clear(); renderPages(); });
  toolbar.append(all, none, selectionCount);
  const drop = createSinglePdfPicker(screen, async (next) => {
    item = next;
    pages = [];
    selected.clear();
    process.disabled = true;
    setStatus(screen.status, "Gerando miniaturas localmente…", "progress", 18);
    try {
      pages = await createPageModels(await readPdfItem(item), screen.token, (done, total) => setStatus(screen.status, `Miniaturas ${done} de ${total}…`, "progress", 18 + done / total * 58));
      renderPages();
      toolbar.hidden = false;
      grid.hidden = false;
      actions.hidden = false;
      setStatus(screen.status, "Clique nas páginas que deseja selecionar.", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  const process = actionButton(mode === "remove" ? "Remover páginas" : "Extrair páginas", `primary-button ${mode === "remove" ? "pdf-danger-action" : ""}`);
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    if (!selected.size) throw new Error("Selecione pelo menos uma página.");
    if (mode === "remove" && selected.size === pages.length) throw new Error("Não é possível remover todas as páginas do PDF.");
    progress(mode === "remove" ? "Removendo as páginas escolhidas…" : "Extraindo as páginas escolhidas…", 52);
    const input = await readPdfItem(item);
    const output = mode === "remove" ? await removePdfPages(input, [...selected]) : await extractPdfPages(input, [...selected].sort((a, b) => a - b));
    renderDownloads(screen.result, [{ name: `${baseFilename(item.file.name)}-${mode === "remove" ? "sem-paginas" : "paginas-extraidas"}.pdf`, bytes: output, type: "application/pdf" }]);
  }));
  const actions = createActions(process);
  toolbar.hidden = true;
  grid.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, toolbar, grid, actions);

  function renderPages() {
    grid.innerHTML = "";
    pages.forEach((page) => {
      const button = pageThumbnailButton(page, selected.has(page.index));
      button.addEventListener("click", () => {
        if (selected.has(page.index)) selected.delete(page.index); else selected.add(page.index);
        renderPages();
      });
      grid.appendChild(button);
    });
    selectionCount.textContent = `${selected.size} de ${pages.length} selecionadas`;
    process.disabled = !selected.size || (mode === "remove" && selected.size === pages.length);
  }
}

function buildImagesToPdfTool(screen) {
  let items = [];
  const drop = createFileDrop({ accept: "image/*", multiple: true, label: "Arraste uma ou mais imagens", hint: "PNG, JPG, WebP e outros formatos do navegador", onFiles: addFiles });
  const list = element("div", "pdf-file-list image-files");
  const pageSize = selectField("Tamanho da página", [["a4", "A4"], ["letter", "Carta"], ["image", "Tamanho da imagem"]]);
  const orientation = selectField("Orientação", [["auto", "Automática"], ["portrait", "Retrato"], ["landscape", "Paisagem"]]);
  const margin = numberField("Margem (pt)", 24, 0, 144, 4);
  const addMore = actionButton("Adicionar imagens", "ghost-button");
  addMore.addEventListener("click", () => drop.input.click());
  const process = actionButton("Criar PDF", "primary-button");
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    if (!items.length) throw new Error("Adicione pelo menos uma imagem.");
    const images = [];
    for (let index = 0; index < items.length; index += 1) {
      progress(`Preparando imagem ${index + 1} de ${items.length}…`, 12 + index / items.length * 45);
      images.push(await imageFileToPdfInput(items[index].file));
    }
    progress("Montando as páginas do PDF…", 68);
    const output = await imagesToPdf(images, { pageSize: pageSize.input.value, orientation: orientation.input.value, margin: Number(margin.input.value) });
    renderDownloads(screen.result, [{ name: "caixota-imagens.pdf", bytes: output, type: "application/pdf" }]);
  }));
  const form = formGrid(pageSize.field, orientation.field, margin.field);
  const actions = createActions(addMore, process);
  list.hidden = true;
  form.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, list, form, actions);

  function addFiles(files) {
    try {
      const added = validateFiles(files, "image");
      const nextItems = [...items, ...added];
      assertSessionSize(nextItems);
      items = nextItems;
      render();
    } catch (error) { setStatus(screen.status, error.message, "error"); }
  }
  function render() {
    renderSortableItems(list, items, { empty: "Adicione imagens na ordem desejada.", onChange(next) { items = next; render(); }, meta: (item) => `${item.file.type || "Imagem"} · ${formatBytes(item.file.size)}` });
    list.hidden = !items.length;
    form.hidden = !items.length;
    actions.hidden = !items.length;
    process.disabled = !items.length;
  }
  render();
}

function buildPdfToImageTool(screen) {
  let item = null;
  let pdf = null;
  let pageCount = 0;
  let pageModels = [];
  const selectedPages = new Set();
  const fileSummary = element("div", "pdf-selected-file");
  fileSummary.textContent = "Nenhum PDF selecionado";
  const scope = selectField("Páginas", [["all", "Todas"], ["selected", "Selecionadas visualmente"]]);
  const format = selectField("Formato", [["png", "PNG"], ["jpeg", "JPG"]]);
  const quality = rangeField("Qualidade do JPG", 0.9, 0.35, 1, 0.05, (value) => `${Math.round(value * 100)}%`);
  quality.field.hidden = true;
  format.input.addEventListener("change", () => { quality.field.hidden = format.input.value !== "jpeg"; });
  scope.input.addEventListener("change", renderPages);
  const pageGrid = element("div", "pdf-page-grid");
  const process = actionButton("Converter páginas", "primary-button");
  process.disabled = true;
  const drop = createSinglePdfPicker(screen, async (next) => {
    item = next;
    process.disabled = true;
    try {
      const bytes = await readPdfItem(item);
      pdf = await loadPdfJs(bytes);
      pageCount = pdf.numPages;
      fileSummary.textContent = `${item.file.name} · ${pageCount} páginas`;
      selectedPages.clear();
      for (let index = 0; index < pageCount; index += 1) selectedPages.add(index);
      setStatus(screen.status, "Gerando miniaturas localmente…", "progress", 18);
      pageModels = await createPageModels(bytes, screen.token, (done, total) => setStatus(screen.status, `Miniaturas ${done} de ${total}…`, "progress", 18 + done / total * 58));
      renderPages();
      fileSummary.hidden = false;
      form.hidden = false;
      pageGrid.hidden = false;
      actions.hidden = false;
      process.disabled = false;
      setStatus(screen.status, "Escolha as páginas e o formato de saída.", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    const selected = scope.input.value === "all" ? Array.from({ length: pageCount }, (_, index) => index) : [...selectedPages].sort((a, b) => a - b);
    if (!selected.length) throw new Error("Selecione pelo menos uma página.");
    const outputs = [];
    for (let index = 0; index < selected.length; index += 1) {
      const pageNumber = selected[index] + 1;
      progress(`Renderizando página ${index + 1} de ${selected.length}…`, 10 + index / selected.length * 80);
      const blob = await renderPdfPageBlob(pdf, pageNumber, format.input.value, Number(quality.input.value));
      outputs.push({ name: `${baseFilename(item.file.name)}-pagina-${pageNumber}.${format.input.value === "jpeg" ? "jpg" : "png"}`, blob, type: blob.type });
    }
    renderDownloads(screen.result, outputs);
  }));
  const form = formGrid(scope.field, format.field, quality.field);
  const actions = createActions(process);
  fileSummary.hidden = true;
  form.hidden = true;
  pageGrid.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, fileSummary, form, pageGrid, actions);

  function renderPages() {
    pageGrid.innerHTML = "";
    pageModels.forEach((page) => {
      const visuallySelected = scope.input.value === "all" || selectedPages.has(page.index);
      const button = pageThumbnailButton(page, visuallySelected);
      button.disabled = scope.input.value === "all";
      button.addEventListener("click", () => {
        if (selectedPages.has(page.index)) selectedPages.delete(page.index); else selectedPages.add(page.index);
        renderPages();
      });
      pageGrid.appendChild(button);
    });
    process.disabled = !pageModels.length || (scope.input.value === "selected" && !selectedPages.size);
  }
}

function buildPdfToTextTool(screen) {
  let item = null;
  const scopeNote = element("div", "pdf-text-scope-note");
  scopeNote.innerHTML = "<strong>Não é OCR.</strong> Esta ferramenta extrai somente texto selecionável que já exista no PDF.";
  const summary = element("div", "pdf-selected-file");
  summary.hidden = true;
  const process = actionButton("Extrair texto", "primary-button");
  process.disabled = true;
  const actions = createActions(process);
  actions.hidden = true;
  const drop = createSinglePdfPicker(screen, (next) => {
    item = next;
    summary.textContent = `${next.file.name} · ${formatBytes(next.file.size)}`;
    summary.hidden = false;
    actions.hidden = false;
    process.disabled = false;
    setStatus(screen.status, "PDF pronto para extrair a camada de texto.", "success");
  });
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    progress("Abrindo o PDF localmente…", 12);
    const pdf = await loadPdfJs(await readPdfItem(item));
    const pages = [];
    try {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        if (screen.token !== activeScreenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
        progress(`Extraindo texto da página ${pageNumber} de ${pdf.numPages}…`, 15 + pageNumber / pdf.numPages * 72);
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent({ includeMarkedContent: false, disableNormalization: false });
        const pageText = pdfTextItemsToString(textContent.items || []);
        pages.push(pdf.numPages > 1 ? `=== Página ${pageNumber} ===\n${pageText}` : pageText);
        if (pageNumber % 4 === 0) await nextFrame();
      }
    } finally {
      activePdfDocuments.delete(pdf);
      await pdf.destroy?.();
    }
    const text = pages.join("\n\n").trim();
    if (!text.replace(/=== Página \d+ ===/g, "").trim()) {
      throw new Error("Não encontramos texto selecionável neste PDF. OCR para documentos digitalizados será adicionado futuramente.");
    }
    renderPdfTextResult(screen, text, item.file.name, pages.length);
  }));
  screen.body.append(scopeNote, drop.root, summary, actions);
}

function pdfTextItemsToString(items) {
  const lines = [];
  let line = "";
  let previousY = null;
  const flush = () => {
    const normalized = line.replace(/[ \t]+/g, " ").trimEnd();
    if (normalized) lines.push(normalized);
    line = "";
  };
  for (const item of items) {
    const value = typeof item?.str === "string" ? item.str : "";
    const y = Number(item?.transform?.[5]);
    if (line && Number.isFinite(y) && Number.isFinite(previousY) && Math.abs(y - previousY) > 2) flush();
    if (value) {
      if (line && !/\s$/.test(line) && !/^\s/.test(value)) line += " ";
      line += value;
    }
    if (item?.hasEOL) flush();
    if (Number.isFinite(y)) previousY = y;
  }
  flush();
  return lines.join("\n");
}

function renderPdfTextResult(screen, text, filename, pageCount) {
  screen.result.innerHTML = "";
  const card = element("section", "pdf-result-card pdf-text-result-card");
  const heading = document.createElement("div");
  heading.innerHTML = `<strong>Texto extraído</strong><small>${pageCount} ${pageCount === 1 ? "página" : "páginas"} · ${text.length.toLocaleString("pt-BR")} caracteres</small>`;
  const output = document.createElement("textarea");
  output.className = "pdf-text-output";
  output.readOnly = true;
  output.spellcheck = false;
  output.value = text;
  const copy = actionButton("Copiar", "ghost-button");
  copy.addEventListener("click", async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        output.focus();
        output.select();
        if (!document.execCommand?.("copy")) throw new Error("A cópia automática não está disponível.");
      }
      setStatus(screen.status, "Texto copiado ✓", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  const download = actionButton("Baixar TXT", "primary-button");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadUrls.add(url);
  download.addEventListener("click", () => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${baseFilename(filename)}.txt`;
    anchor.click();
  });
  card.append(heading, output, createActions(copy, download));
  screen.result.appendChild(card);
}

function buildRotateTool(screen) {
  let item = null;
  let pages = [];
  const selected = new Set();
  const angle = selectField("Rotação", [["-90", "90° para a esquerda"], ["90", "90° para a direita"], ["180", "180°"]]);
  const scope = selectField("Páginas", [["all", "Todas"], ["selected", "Selecionadas visualmente"]]);
  const form = formGrid(angle.field, scope.field);
  const grid = element("div", "pdf-page-grid");
  const process = actionButton("Girar páginas", "primary-button");
  process.disabled = true;
  scope.input.addEventListener("change", renderPages);
  const drop = createSinglePdfPicker(screen, async (next) => {
    item = next;
    pages = [];
    selected.clear();
    process.disabled = true;
    try {
      setStatus(screen.status, "Gerando miniaturas localmente…", "progress", 18);
      pages = await createPageModels(await readPdfItem(item), screen.token, (done, total) => setStatus(screen.status, `Miniaturas ${done} de ${total}…`, "progress", 18 + done / total * 58));
      pages.forEach((page) => selected.add(page.index));
      renderPages();
      form.hidden = false;
      grid.hidden = false;
      actions.hidden = false;
      process.disabled = false;
      setStatus(screen.status, "Escolha a rotação e as páginas.", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    const chosen = scope.input.value === "all" ? "all" : [...selected].sort((a, b) => a - b);
    if (Array.isArray(chosen) && !chosen.length) throw new Error("Selecione pelo menos uma página.");
    progress("Girando as páginas escolhidas…", 52);
    const output = await rotatePdfPages(await readPdfItem(item), { angle: Number(angle.input.value), pages: chosen });
    renderDownloads(screen.result, [{ name: `${baseFilename(item.file.name)}-girado.pdf`, bytes: output, type: "application/pdf" }]);
  }));
  const actions = createActions(process);
  form.hidden = true;
  grid.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, form, grid, actions);

  function renderPages() {
    grid.innerHTML = "";
    pages.forEach((page) => {
      const visuallySelected = scope.input.value === "all" || selected.has(page.index);
      const button = pageThumbnailButton(page, visuallySelected);
      button.disabled = scope.input.value === "all";
      button.addEventListener("click", () => {
        if (selected.has(page.index)) selected.delete(page.index); else selected.add(page.index);
        renderPages();
      });
      grid.appendChild(button);
    });
    process.disabled = !pages.length || (scope.input.value === "selected" && !selected.size);
  }
}

function buildWatermarkTool(screen) {
  let previewText;
  buildSimplePdfEditTool(screen, {
    actionLabel: "Aplicar marca d’água",
    fields: () => {
      const text = textField("Texto", "CONFIDENCIAL", "CONFIDENCIAL");
      const size = numberField("Tamanho", 42, 8, 180, 1);
      const opacity = rangeField("Opacidade", 0.22, 0.03, 1, 0.01, (value) => `${Math.round(value * 100)}%`);
      const rotation = numberField("Rotação (graus)", -35, -180, 180, 5);
      const position = positionField("Posição", true);
      const scope = pageScopeFields();
      const preview = element("div", "pdf-watermark-preview");
      preview.innerHTML = `<span>Prévia simples</span><strong></strong>`;
      previewText = preview.querySelector("strong");
      const update = () => {
        previewText.textContent = text.input.value || "Marca d’água";
        previewText.style.fontSize = `${Math.max(12, Number(size.input.value) / 2)}px`;
        previewText.style.opacity = String(opacity.input.value);
        previewText.style.transform = `rotate(${Number(rotation.input.value)}deg)`;
        preview.dataset.position = position.input.value;
      };
      [text.input, size.input, opacity.input, rotation.input, position.input].forEach((input) => input.addEventListener("input", update));
      update();
      return { text, size, opacity, rotation, position, scope, preview };
    },
    append(fields, form) { form.appendChild(fields.preview); },
    async process(bytes, fields, pageCount) {
      return watermarkPdf(bytes, { text: fields.text.input.value, size: Number(fields.size.input.value), opacity: Number(fields.opacity.input.value), rotation: Number(fields.rotation.input.value), position: fields.position.input.value, pages: readScope(fields.scope, pageCount) });
    },
    suffix: "marca-dagua"
  });
}

function buildNumberTool(screen) {
  buildSimplePdfEditTool(screen, {
    actionLabel: "Adicionar numeração",
    fields: () => ({
      format: selectField("Formato", [["number", "1"], ["page", "Página 1"], ["fraction", "1 / 20"], ["page-of", "Página 1 de 20"]]),
      position: positionField("Posição", false),
      startPage: numberField("Começar na página", 1, 1, 99999, 1),
      startNumber: numberField("Número inicial", 1, 0, 99999, 1),
      size: numberField("Tamanho", 11, 6, 48, 1)
    }),
    async process(bytes, fields) {
      return numberPdfPages(bytes, { format: fields.format.input.value, position: fields.position.input.value, startPage: Number(fields.startPage.input.value), startNumber: Number(fields.startNumber.input.value), size: Number(fields.size.input.value) });
    },
    suffix: "numerado"
  });
}

function buildCropTool(screen) {
  let item = null;
  let pdf = null;
  let pageCount = 0;
  let currentPage = 1;
  let crop = { x: 0.08, y: 0.08, width: 0.84, height: 0.84 };
  const stage = element("div", "pdf-crop-stage");
  stage.hidden = true;
  const canvas = document.createElement("canvas");
  const box = element("div", "pdf-crop-box");
  const handle = element("span", "pdf-crop-handle");
  handle.setAttribute("aria-hidden", "true");
  box.appendChild(handle);
  stage.append(canvas, box);
  const pageLabel = element("span", "pdf-crop-page-label");
  const previous = actionButton("←", "ghost-button");
  previous.setAttribute("aria-label", "Página anterior");
  const next = actionButton("→", "ghost-button");
  next.setAttribute("aria-label", "Próxima página");
  const reset = actionButton("Redefinir área", "ghost-button");
  const nav = createActions(previous, pageLabel, next, reset);
  const scope = selectField("Aplicar em", [["current", "Página atual"], ["selected", "Páginas selecionadas"], ["all", "Todas as páginas"]]);
  const selected = textField("Seleção", "1-3,5");
  selected.field.hidden = true;
  scope.input.addEventListener("change", () => { selected.field.hidden = scope.input.value !== "selected"; });
  const drop = createSinglePdfPicker(screen, async (nextItem) => {
    item = nextItem;
    process.disabled = true;
    try {
      const bytes = await readPdfItem(item);
      pdf = await loadPdfJs(bytes);
      pageCount = pdf.numPages;
      currentPage = 1;
      selected.input.placeholder = `1-${pageCount}`;
      await renderCurrentPage();
      nav.hidden = false;
      form.hidden = false;
      actions.hidden = false;
      process.disabled = false;
      setStatus(screen.status, "Arraste a área verde; use o canto para redimensionar.", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  previous.addEventListener("click", async () => { if (currentPage > 1) { currentPage -= 1; await renderCurrentPage(); } });
  next.addEventListener("click", async () => { if (currentPage < pageCount) { currentPage += 1; await renderCurrentPage(); } });
  reset.addEventListener("click", () => { crop = { x: 0.08, y: 0.08, width: 0.84, height: 0.84 }; updateCropBox(); });
  installCropInteraction(stage, box, handle, () => crop, (nextCrop) => { crop = nextCrop; updateCropBox(); });
  const process = actionButton("Recortar PDF", "primary-button");
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    const pages = scope.input.value === "current" ? [currentPage - 1] : scope.input.value === "all" ? "all" : parsePageSelection(selected.input.value, pageCount);
    progress("Aplicando o recorte sem alterar o original…", 52);
    const output = await cropPdfPages(await readPdfItem(item), { pages, rect: crop });
    renderDownloads(screen.result, [{ name: `${baseFilename(item.file.name)}-recortado.pdf`, bytes: output, type: "application/pdf" }]);
  }));
  const form = formGrid(scope.field, selected.field);
  const actions = createActions(process);
  nav.hidden = true;
  form.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, nav, stage, form, actions);

  async function renderCurrentPage() {
    const page = await pdf.getPage(currentPage);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1.2, 760 / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport }).promise;
    stage.hidden = false;
    pageLabel.textContent = `Página ${currentPage} de ${pageCount}`;
    previous.disabled = currentPage <= 1;
    next.disabled = currentPage >= pageCount;
    updateCropBox();
  }
  function updateCropBox() {
    box.style.left = `${crop.x * 100}%`;
    box.style.top = `${crop.y * 100}%`;
    box.style.width = `${crop.width * 100}%`;
    box.style.height = `${crop.height * 100}%`;
  }
}

function buildSimplePdfEditTool(screen, config) {
  let item = null;
  let pageCount = 0;
  const drop = createSinglePdfPicker(screen, async (next) => {
    item = next;
    process.disabled = true;
    try {
      pageCount = await getPdfPageCount(await readPdfItem(item));
      summary.textContent = `${item.file.name} · ${pageCount} páginas`;
      if (fields.scope?.selection?.input) fields.scope.selection.input.placeholder = `1-${pageCount}`;
      summary.hidden = false;
      form.hidden = false;
      actions.hidden = false;
      process.disabled = false;
      setStatus(screen.status, "PDF pronto para processar.", "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  });
  const summary = element("div", "pdf-selected-file");
  summary.textContent = "Nenhum PDF selecionado";
  const fields = config.fields();
  const form = formGrid(...Object.values(fields).filter((field) => field?.field).map((field) => field.field));
  config.append?.(fields, form);
  const process = actionButton(config.actionLabel, "primary-button");
  process.disabled = true;
  process.addEventListener("click", () => runProcess(screen, process, async (progress) => {
    progress("Processando o PDF localmente…", 46);
    const output = await config.process(await readPdfItem(item), fields, pageCount);
    renderDownloads(screen.result, [{ name: `${baseFilename(item.file.name)}-${config.suffix}.pdf`, bytes: output, type: "application/pdf" }]);
  }));
  const actions = createActions(process);
  summary.hidden = true;
  form.hidden = true;
  actions.hidden = true;
  screen.body.append(drop.root, summary, form, actions);
}

function pageScopeFields() {
  const mode = selectField("Páginas", [["all", "Todas"], ["selected", "Selecionadas"]]);
  const selection = textField("Seleção", "1-3,5");
  selection.field.hidden = true;
  mode.input.addEventListener("change", () => { selection.field.hidden = mode.input.value !== "selected"; });
  return { field: formGrid(mode.field, selection.field), mode, selection };
}

function readScope(scope, pageCount) {
  return scope.mode.input.value === "all" ? "all" : parsePageSelection(scope.selection.input.value, pageCount);
}

function createSinglePdfPicker(screen, onFile) {
  return createFileDrop({
    accept: ".pdf,application/pdf",
    multiple: false,
    label: "Arraste um PDF aqui",
    hint: `Limite de ${Math.round(MAX_PDF_FILE_BYTES / 1024 / 1024)} MB`,
    async onFiles(files) {
      try {
        const [item] = validateFiles(files, "pdf");
        if (!item) return;
        clearDownloadUrls();
        clearPdfDocuments();
        screen.result.innerHTML = "";
        await onFile(item);
      } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
    }
  });
}

function createFileDrop({ accept, multiple, label, hint, onFiles }) {
  const root = element("div", "pdf-drop-zone");
  root.tabIndex = 0;
  root.setAttribute("role", "button");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = Boolean(multiple);
  input.hidden = true;
  root.innerHTML = `<span class="pdf-drop-icon" aria-hidden="true">□</span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(hint)}</small><span class="cx-drop-click-label" aria-hidden="true">＋ &nbsp; Selecionar ${multiple?'arquivos':'arquivo'}</span>`;
  root.appendChild(input);
  const choose = () => input.click();
  root.addEventListener("click", (event) => { if (event.target !== input) choose(); });
  root.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } });
  input.addEventListener("change", () => { onFiles([...input.files]); input.value = ""; });
  ["dragenter", "dragover"].forEach((type) => root.addEventListener(type, (event) => { event.preventDefault(); root.classList.add("is-dragging"); }));
  ["dragleave", "drop"].forEach((type) => root.addEventListener(type, (event) => { event.preventDefault(); root.classList.remove("is-dragging"); }));
  root.addEventListener("drop", (event) => onFiles([...event.dataTransfer.files]));
  return { root, input };
}

function validateFiles(files, kind) {
  const selected = [...files];
  if (!selected.length) return [];
  return selected.map((file) => {
    if (file.size <= 0) throw new Error(`O arquivo “${file.name}” está vazio.`);
    if (file.size > MAX_PDF_FILE_BYTES) throw new Error(`“${file.name}” ultrapassa o limite de ${Math.round(MAX_PDF_FILE_BYTES / 1024 / 1024)} MB.`);
    if (kind === "pdf" && !(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) throw new Error(`“${file.name}” não é um arquivo PDF.`);
    if (kind === "image" && !(file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(file.name))) throw new Error(`“${file.name}” não é uma imagem compatível.`);
    return { id: uniqueId(), file, bytes: null };
  });
}

function assertSessionSize(items) {
  const total = items.reduce((sum, item) => sum + Number(item.file?.size || 0), 0);
  if (total > MAX_PDF_SESSION_BYTES) throw new Error(`Os arquivos juntos ultrapassam o limite de ${Math.round(MAX_PDF_SESSION_BYTES / 1024 / 1024)} MB.`);
}

async function readPdfItem(item) {
  if (!item?.file) throw new Error("Escolha um arquivo PDF.");
  if (!item.bytes) item.bytes = new Uint8Array(await item.file.arrayBuffer());
  return item.bytes;
}

function renderSortableItems(containerElement, items, options = {}) {
  containerElement.innerHTML = "";
  if (!items.length) {
    const empty = element("div", "pdf-inline-empty");
    empty.textContent = options.empty || "Nenhum item adicionado.";
    containerElement.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const row = element("div", options.card ? "pdf-sortable-page" : "pdf-file-row");
    row.draggable = true;
    row.dataset.sortIndex = String(index);
    if (options.thumb?.(item)) {
      const image = document.createElement("img");
      image.src = options.thumb(item);
      image.alt = "";
      row.appendChild(image);
    } else {
      const grip = element("span", "pdf-drag-grip");
      grip.textContent = "⋮⋮";
      grip.setAttribute("aria-hidden", "true");
      row.appendChild(grip);
    }
    const copy = element("span", "pdf-file-copy");
    const strong = document.createElement("strong");
    strong.textContent = options.label ? options.label(item, index) : item.file.name;
    const small = document.createElement("small");
    small.textContent = options.meta?.(item) || "Arraste para reordenar";
    copy.append(strong, small);
    const controls = element("span", "pdf-row-controls");
    const up = tinyButton("↑", "Mover para cima");
    const down = tinyButton("↓", "Mover para baixo");
    up.disabled = index === 0;
    down.disabled = index === items.length - 1;
    up.addEventListener("click", () => options.onChange(moveItem(items, index, index - 1)));
    down.addEventListener("click", () => options.onChange(moveItem(items, index, index + 1)));
    controls.append(up, down);
    if (options.removable !== false) {
      const remove = tinyButton("×", "Remover");
      remove.classList.add("is-danger");
      remove.addEventListener("click", () => options.onChange(items.filter((_, itemIndex) => itemIndex !== index)));
      controls.appendChild(remove);
    }
    row.append(copy, controls);
    row.addEventListener("dragstart", (event) => { event.dataTransfer.setData("text/plain", String(index)); row.classList.add("is-dragging"); });
    row.addEventListener("dragend", () => row.classList.remove("is-dragging"));
    row.addEventListener("dragover", (event) => event.preventDefault());
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const from = Number(event.dataTransfer.getData("text/plain"));
      if (Number.isInteger(from) && from !== index) options.onChange(moveItem(items, from, index));
    });
    containerElement.appendChild(row);
  });
}

async function createPageModels(bytes, token, onProgress) {
  const pdf = await loadPdfJs(bytes);
  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      if (token !== activeScreenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(0.42, 170 / Math.max(base.width, base.height)) });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      await page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport }).promise;
      pages.push({ id: `page-${pageNumber}`, index: pageNumber - 1, thumbnail: canvas.toDataURL("image/jpeg", 0.72) });
      onProgress?.(pageNumber, pdf.numPages);
      if (pageNumber % 5 === 0) await nextFrame();
    }
  } finally {
    activePdfDocuments.delete(pdf);
    await pdf.destroy?.();
  }
  return pages;
}

function pageThumbnailButton(page, selected) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `pdf-page-choice${selected ? " is-selected" : ""}`;
  button.setAttribute("aria-pressed", String(selected));
  button.innerHTML = `<img src="${page.thumbnail}" alt="Prévia da página ${page.index + 1}"><span><b>Página ${page.index + 1}</b><small>${selected ? "Selecionada" : "Selecionar"}</small></span>`;
  return button;
}

async function loadPdfJs(bytes) {
  try {
    const pdf = await pdfjsLib.getDocument({
      data: bytes.slice(),
      isEvalSupported: false,
      useWasm: false,
      useWorkerFetch: false,
      disableRange: true,
      disableStream: true
    }).promise;
    activePdfDocuments.add(pdf);
    return pdf;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}

async function renderPdfPageBlob(pdf, pageNumber, format, quality) {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const scale = clamp(2200 / Math.max(base.width, base.height), 0.25, 3);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  await page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport }).promise;
  const mime = format === "jpeg" ? "image/jpeg" : "image/png";
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível criar a imagem desta página.")), mime, quality));
}

async function imageFileToPdfInput(file) {
  const directType = /image\/(png|jpeg)/i.test(file.type) ? file.type.toLowerCase() : "";
  if (directType) return { bytes: new Uint8Array(await file.arrayBuffer()), type: directType };
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d", { alpha: true });
  context.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`Não foi possível converter “${file.name}”.`)), "image/png"));
  return { bytes: new Uint8Array(await blob.arrayBuffer()), type: "image/png" };
}

async function runProcess(screen, button, task) {
  if (button.disabled) return;
  const idle = button.textContent;
  clearDownloadUrls();
  screen.result.innerHTML = "";
  button.disabled = true;
  button.textContent = "Processando…";
  setStatus(screen.status, "Preparando os arquivos localmente…", "progress", 8);
  try {
    await task((message, percent) => setStatus(screen.status, message, "progress", percent));
    setStatus(screen.status, "Concluído. O arquivo está pronto para baixar.", "success", 100);
    try { Promise.resolve(chrome.runtime.sendMessage({ type: "RECORD_TOOL_USAGE", mode: "pdf", toolId: screen.tool.id })).catch(() => {}); } catch (_error) {}
  } catch (error) {
    setStatus(screen.status, friendlyError(error), "error");
  } finally {
    button.disabled = false;
    button.textContent = idle;
  }
}

function renderDownloads(target, outputs) {
  target.innerHTML = "";
  const card = element("section", "pdf-result-card");
  const heading = document.createElement("div");
  heading.innerHTML = `<strong>${outputs.length === 1 ? "Arquivo pronto" : `${outputs.length} arquivos prontos`}</strong><small>Os resultados ficam disponíveis somente nesta tela.</small>`;
  const list = element("div", "pdf-download-list");
  outputs.forEach((output) => {
    const blob = output.blob || new Blob([output.bytes], { type: output.type || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    downloadUrls.add(url);
    const row = element("div", "pdf-download-row");
    const info = document.createElement("span");
    info.innerHTML = `<strong>${escapeHtml(output.name)}</strong><small>${formatBytes(blob.size)}</small>`;
    const download = actionButton("Baixar", "primary-button");
    download.addEventListener("click", () => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = output.name;
      anchor.click();
    });
    row.append(info, download);
    list.appendChild(row);
  });
  card.append(heading, list);
  target.appendChild(card);
}

function setStatus(target, message = "", type = "", percent = 0) {
  target.className = `pdf-status${type ? ` is-${type}` : ""}`;
  target.innerHTML = "";
  if (!message) return;
  const line = document.createElement("span");
  line.textContent = message;
  target.appendChild(line);
  if (type === "progress") {
    const track = element("div", "pdf-progress-track");
    const fill = document.createElement("span");
    fill.style.width = `${Math.max(2, Math.min(100, Number(percent) || 0))}%`;
    track.appendChild(fill);
    target.appendChild(track);
  }
}

function installCropInteraction(stage, box, handle, getCrop, setCrop) {
  box.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    const resizing = event.target === handle;
    const start = { x: event.clientX, y: event.clientY, crop: { ...getCrop() } };
    const bounds = stage.getBoundingClientRect();
    const move = (moveEvent) => {
      const dx = (moveEvent.clientX - start.x) / Math.max(1, bounds.width);
      const dy = (moveEvent.clientY - start.y) / Math.max(1, bounds.height);
      if (resizing) {
        setCrop({ ...start.crop, width: clamp(start.crop.width + dx, 0.05, 1 - start.crop.x), height: clamp(start.crop.height + dy, 0.05, 1 - start.crop.y) });
      } else {
        setCrop({ ...start.crop, x: clamp(start.crop.x + dx, 0, 1 - start.crop.width), y: clamp(start.crop.y + dy, 0, 1 - start.crop.height) });
      }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up, { once: true });
  });
}

function positionField(label, includeCenterSides) {
  const values = includeCenterSides
    ? [["top-left", "Superior esquerda"], ["top-center", "Superior centro"], ["top-right", "Superior direita"], ["center-left", "Centro esquerda"], ["center", "Centro"], ["center-right", "Centro direita"], ["bottom-left", "Inferior esquerda"], ["bottom-center", "Inferior centro"], ["bottom-right", "Inferior direita"]]
    : [["top-left", "Superior esquerda"], ["top-center", "Superior centro"], ["top-right", "Superior direita"], ["bottom-left", "Inferior esquerda"], ["bottom-center", "Inferior centro"], ["bottom-right", "Inferior direita"]];
  return selectField(label, values, includeCenterSides ? "center" : "bottom-center");
}

function selectField(label, options, initial) {
  const input = document.createElement("select");
  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    input.appendChild(option);
  });
  if (initial != null) input.value = String(initial);
  return wrapField(label, input);
}

function textField(label, placeholder = "", value = "") {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = placeholder;
  input.value = value;
  return wrapField(label, input);
}

function numberField(label, value, min, max, step) {
  const input = document.createElement("input");
  input.type = "number";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  return wrapField(label, input);
}

function rangeField(label, value, min, max, step, formatter) {
  const input = document.createElement("input");
  input.type = "range";
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  const wrapped = wrapField(label, input);
  const output = document.createElement("output");
  const update = () => { output.value = formatter?.(Number(input.value)) || input.value; };
  input.addEventListener("input", update);
  update();
  wrapped.field.appendChild(output);
  return { ...wrapped, output };
}

function wrapField(label, input) {
  const field = element("label", "pdf-field");
  const span = document.createElement("span");
  span.textContent = label;
  field.append(span, input);
  return { field, input };
}

function formGrid(...children) {
  const grid = element("div", "pdf-form-grid");
  children.filter(Boolean).forEach((child) => grid.appendChild(child));
  return grid;
}

function createActions(...children) {
  const actions = element("div", "pdf-actions");
  children.filter(Boolean).forEach((child) => actions.appendChild(child));
  return actions;
}

function actionButton(label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  return button;
}

function tinyButton(label, title) {
  const button = actionButton(label, "pdf-tiny-button");
  button.title = title;
  button.setAttribute("aria-label", title);
  return button;
}

function element(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function moveItem(items, from, to) {
  const copy = [...items];
  if (from < 0 || from >= copy.length || to < 0 || to >= copy.length) return copy;
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function clearDownloadUrls() {
  downloadUrls.forEach((url) => URL.revokeObjectURL(url));
  downloadUrls.clear();
}

function clearPdfDocuments() {
  activePdfDocuments.forEach((pdf) => { try { pdf.destroy?.(); } catch (_error) {} });
  activePdfDocuments.clear();
}

function friendlyError(error) {
  const message = String(error?.message || error || "Não foi possível concluir esta operação.");
  if (/password|encrypted|encrypt/i.test(message)) return "Este PDF é protegido por senha e não pode ser processado localmente.";
  if (/memory|allocation|too large/i.test(message)) return "O arquivo é grande demais para a memória disponível. Tente um PDF menor ou divida-o primeiro.";
  if (/cancelada ao sair/i.test(message)) return message;
  return message.length > 240 ? "O PDF não pôde ser processado. Ele pode estar corrompido ou usar um recurso incompatível." : message;
}

function formatBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function baseFilename(name) {
  return sanitizeFilename(String(name || "caixota").replace(/\.[^.]+$/, "")) || "caixota";
}

function sanitizeFilename(value) {
  return String(value).replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 96);
}

function uniqueId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}

// Ferramentas adicionais v0.2.10 (revisão): operam exclusivamente no navegador.
// Rasterização é uma reconstrução visual e NÃO preserva texto, formulários, links ou assinaturas digitais.
function pdfExtraNotice(parent, message) {
  const warning=element("p","pdf-extra-warning"); warning.textContent=message; parent.append(warning);return warning;
}
function pdfExtraPicker(screen,onSelected) {
  let file=null;
  const drop=createSinglePdfPicker(screen,async (item)=>{
    file=item;screen.result.replaceChildren();setStatus(screen.status,`Selecionado: ${item.file.name} · ${formatPdfBytes(item.file.size)}`, "success");
    onSelected(item);
  });
  screen.body.append(drop.root);
  return ()=>file;
}
function formatPdfBytes(bytes){return `${(Number(bytes)/1024/1024).toFixed(2)} MB`;}
async function pdfRasterRebuild(source, { password="", quality=.72, scale=1.5, allowSkip=false, onProgress=()=>{} }={}) {
  const input=source instanceof Uint8Array?source:new Uint8Array(source);
  if(input.byteLength>90*1024*1024)throw new Error("A reconstrução visual está limitada a PDFs de até 90 MB para evitar uso excessivo de memória.");
  let pdf;
  try {
    pdf=await pdfjsLib.getDocument({data:input.slice(),password,isEvalSupported:false,useWasm:false,useWorkerFetch:false,disableRange:true,disableStream:true}).promise;
  } catch(e){
    if(e?.name==="PasswordException")throw new Error("Senha incorreta ou PDF protegido. Informe a senha de abertura correta, se tiver autorização.");
    throw new Error(`Não foi possível interpretar o PDF: ${friendlyError(e)}`);
  }
  activePdfDocuments.add(pdf);
  try {
    if(pdf.numPages>80)throw new Error("Esta operação está limitada a 80 páginas por arquivo.");
    const result=await PDFDocument.create();let recovered=0;let skipped=[];
    for(let i=1;i<=pdf.numPages;i++) {
      onProgress(`Renderizando página ${i} de ${pdf.numPages}…`,Math.min(92,10+80*i/pdf.numPages));
      try {
        const page=await pdf.getPage(i), base=page.getViewport({scale:1});
        const renderScale=Math.min(scale,Math.sqrt(4e6/(base.width*base.height)));
        const viewport=page.getViewport({scale:Math.max(.3,renderScale)});
        const canvas=document.createElement("canvas");canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
        if(canvas.width*canvas.height>4.1e6)throw new Error("A página excede o limite de tamanho de imagem.");
        const ctx=canvas.getContext("2d",{alpha:false});ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
        await page.render({canvasContext:ctx,viewport}).promise;
        const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Falha ao codificar JPEG.")),"image/jpeg",quality));
        const img=await result.embedJpg(await blob.arrayBuffer());
        const newPage=result.addPage([base.width,base.height]);newPage.drawImage(img,{x:0,y:0,width:base.width,height:base.height});
        recovered+=1;canvas.width=0;canvas.height=0;page.cleanup?.();
      } catch(e){
        if(!allowSkip)throw new Error(`Erro na página ${i}: ${friendlyError(e)}`);
        skipped.push(i);
      }
      if(i%3===0)await new Promise(resolve=>setTimeout(resolve,0));
    }
    if(!recovered)throw new Error("Nenhuma página pôde ser reconstruída.");
    return {bytes:await result.save({useObjectStreams:true}),recovered,skipped};
  }finally{try{await pdf.destroy();}catch(_e){}activePdfDocuments.delete(pdf);}
}
function buildPdfCompress(screen) {
  let selected=null;
  pdfExtraPicker(screen,item=>{selected=item;process.disabled=false;});
  const mode=selectField("Método",[["optimize","Otimizar estrutura (mantém texto)"],["raster","Recomprimir páginas em JPEG (perde texto selecionável)"]],"optimize");
  const quality=numberField("Qualidade JPEG (%)",70,35,95,5);
  const resolution=selectField("Qualidade visual",[["1","Economia"],["1.5","Equilibrada"],["2","Detalhada"]],"1.5");
  const configure=()=>{quality.field.hidden=resolution.field.hidden=mode.input.value!=="raster";};mode.input.addEventListener("change",configure);configure();
  screen.body.append(formGrid(mode.field,quality.field,resolution.field));
  pdfExtraNotice(screen.body,"A otimização pode não reduzir o tamanho e pode invalidar assinaturas digitais existentes ao regravar o PDF. A recompressão JPEG também pode degradar imagens e elimina texto selecionável, campos e links.");
  const process=actionButton("Comprimir PDF","primary-button");process.disabled=true;
  process.addEventListener("click",()=>runProcess(screen,process,async(progress)=>{
    if(!selected)throw new Error("Escolha um arquivo PDF.");
    const bytes=await readPdfItem(selected);let result;
    if(mode.input.value==="optimize"){
      progress("Otimizando estrutura do PDF…",40);
      const doc=await PDFDocument.load(bytes,{ignoreEncryption:false,updateMetadata:false});
      result=new Uint8Array(await doc.save({useObjectStreams:true,addDefaultPage:false}));
    }else{
      const rebuilt=await pdfRasterRebuild(bytes,{quality:Number(quality.input.value)/100,scale:Number(resolution.input.value),onProgress:progress});
      result=rebuilt.bytes;
    }
    renderDownloads(screen.result,[{name:`${baseFilename(selected.file.name)}-comprimido.pdf`,bytes:result,type:"application/pdf"}]);
    const note=element("p","pdf-extra-warning");
    const saved=100*(1-result.length/bytes.length);
    note.textContent=saved>0?`Tamanho: ${formatPdfBytes(bytes.length)} → ${formatPdfBytes(result.length)} (${saved.toFixed(1)}% menor).`:`Tamanho: ${formatPdfBytes(bytes.length)} → ${formatPdfBytes(result.length)}. O arquivo não ficou menor; tente outro método ou mantenha o original.`;
    screen.result.append(note);
  }));screen.body.append(createActions(process));
}
function buildPdfSign(screen) {
  let selected=null;
  pdfExtraPicker(screen,item=>{selected=item;process.disabled=false;});
  const mode=selectField("Forma da assinatura",[["draw","Desenhar assinatura"],["type","Digitar nome (assinatura visual)"]],"draw");
  const page=numberField("Número da página",1,1,9999,1);
  const place=selectField("Posição",[["bottom-right","Inferior direita"],["bottom-left","Inferior esquerda"],["top-right","Superior direita"],["top-left","Superior esquerda"]],"bottom-right");
  const typed=textField("Nome para exibição","Nome completo");
  const form=formGrid(mode.field,page.field,place.field,typed.field);screen.body.append(form);
  const drawing=document.createElement("canvas");drawing.width=700;drawing.height=180;drawing.className="pdf-signature-canvas";drawing.setAttribute("aria-label","Área para desenhar assinatura");
  const ctx=drawing.getContext("2d");
  function clear(){ctx.clearRect(0,0,700,180);ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#143959";ctx.lineWidth=4;}
  clear();let dragging=false,hasInk=false;
  function pos(e){const b=drawing.getBoundingClientRect();return {x:(e.clientX-b.left)*700/b.width,y:(e.clientY-b.top)*180/b.height};}
  drawing.addEventListener("pointerdown",e=>{drawing.setPointerCapture(e.pointerId);dragging=true;hasInk=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.stroke();});
  drawing.addEventListener("pointermove",e=>{if(!dragging)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();});
  ["pointerup","pointercancel","lostpointercapture"].forEach(n=>drawing.addEventListener(n,()=>dragging=false));
  const clearBtn=actionButton("Limpar desenho","ghost-button");clearBtn.addEventListener("click",()=>{clear();hasInk=false;});
  screen.body.append(drawing,clearBtn);
  mode.input.addEventListener("change",()=>{drawing.hidden=clearBtn.hidden=mode.input.value!=="draw";typed.field.hidden=mode.input.value!=="type";});mode.input.dispatchEvent(new Event("change"));
  pdfExtraNotice(screen.body,"Assinatura visual, NÃO assinatura digital certificada (ICP-Brasil/PAdES). Não verifica identidade nem garante integridade criptográfica do PDF.");
  const process=actionButton("Inserir assinatura visual","primary-button");process.disabled=true;
  process.addEventListener("click",()=>runProcess(screen,process,async(progress)=>{
    if(!selected)throw new Error("Selecione um PDF.");
    const bytes=await readPdfItem(selected);
    const doc=await PDFDocument.load(bytes,{ignoreEncryption:false});
    const index=Number(page.input.value)-1;
    if(!Number.isInteger(index)||index<0||index>=doc.getPageCount())throw new Error(`Escolha página entre 1 e ${doc.getPageCount()}.`);
    const signature=document.createElement("canvas");signature.width=700;signature.height=180;const c=signature.getContext("2d");
    if(mode.input.value==="draw"){
      if(!hasInk)throw new Error("Desenhe a assinatura primeiro.");
      // PNG transparente: aplica apenas os traços e não cobre conteúdo do PDF com um retângulo branco.
      c.drawImage(drawing,0,0);
    }else{
      const name=typed.input.value.trim();if(!name)throw new Error("Digite um nome.");
      c.clearRect(0,0,700,180);c.fillStyle="#143959";c.font="italic 62px cursive";c.fillText(name.slice(0,72),26,105,650);
    }
    progress("Aplicando assinatura visual…",55);
    const png=await new Promise((resolve,reject)=>signature.toBlob(blob=>blob?resolve(blob):reject(new Error("Erro ao preparar assinatura.")),"image/png"));
    const img=await doc.embedPng(await png.arrayBuffer()),target=doc.getPage(index),{width,height}=target.getSize();
    const drawWidth=Math.min(210,width*.42),drawHeight=drawWidth*180/700, margin=24;
    const x=place.input.value.endsWith("right")?width-drawWidth-margin:margin;
    const y=place.input.value.startsWith("top")?height-drawHeight-margin:margin;
    target.drawImage(img,{x,y,width:drawWidth,height:drawHeight});
    const output=new Uint8Array(await doc.save({useObjectStreams:true}));
    renderDownloads(screen.result,[{name:`${baseFilename(selected.file.name)}-assinado-visualmente.pdf`,bytes:output,type:"application/pdf"}]);
  }));screen.body.append(createActions(process));
}
function buildPdfUnlock(screen) {
  let selected=null;
  pdfExtraPicker(screen,item=>{selected=item;process.disabled=false;});
  const field=textField("Senha de abertura (necessária para PDF criptografado)","Senha do arquivo");field.input.type="password";field.input.autocomplete="off";
  screen.body.append(formGrid(field.field));
  pdfExtraNotice(screen.body,"Use apenas documentos próprios ou que você esteja autorizado a modificar. A reconstrução cria um PDF visual sem proteção, mas elimina texto selecionável, formulários, links e assinaturas digitais.");
  const process=actionButton("Reconstruir PDF sem senha","primary-button");process.disabled=true;
  process.addEventListener("click",()=>runProcess(screen,process,async(progress)=>{
    const bytes=await readPdfItem(selected);
    const password=field.input.value;field.input.value="";
    const {bytes:output}=await pdfRasterRebuild(bytes,{password,quality:.90,scale:2,onProgress:progress});
    renderDownloads(screen.result,[{name:`${baseFilename(selected.file.name)}-sem-senha-visual.pdf`,bytes:output,type:"application/pdf"}]);
    field.input.value="";
  }));screen.body.append(createActions(process));
}
function buildPdfRepair(screen) {
  let selected=null;
  pdfExtraPicker(screen,item=>{selected=item;process.disabled=false;});
  pdfExtraNotice(screen.body,"Tentativa de recuperação: cada página legível vira uma imagem num novo PDF. Texto pesquisável, campos, links, anotações e assinaturas não serão preservados. Arquivos gravemente corrompidos podem continuar ilegíveis.");
  const process=actionButton("Tentar recuperar páginas","primary-button");process.disabled=true;
  process.addEventListener("click",()=>runProcess(screen,process,async(progress)=>{
    const {bytes,skipped,recovered}=await pdfRasterRebuild(await readPdfItem(selected),{quality:.90,scale:1.6,allowSkip:true,onProgress:progress});
    renderDownloads(screen.result,[{name:`${baseFilename(selected.file.name)}-recuperado-visual.pdf`,bytes,type:"application/pdf"}]);
    const p=element("p","pdf-extra-warning");p.textContent=`${recovered} página(s) recuperada(s). ${skipped.length ? `Não foi possível renderizar: ${skipped.join(", ")}.` : "Todas as páginas foram renderizadas."}`;screen.result.append(p);
  }));screen.body.append(createActions(process));
}

}

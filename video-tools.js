import { GIFEncoder, quantize, applyPalette } from "./vendor/gifenc.esm.js";
import { VIDEO_TOOL_CATALOG } from "./panel-catalog.mjs";

export function initialize(document, window, bridge){

const container = document.getElementById("videoToolsContainer");
const TOOLS = VIDEO_TOOL_CATALOG;
const resourceUrls = new Set();
let screenToken = 0;
let activeScreen = false;

if (container) renderCatalog();

document.addEventListener("caixota:open-direct-tool", (event) => {
  if (event.detail?.category !== "video") return;
  openVideoTool(event.detail.toolId);
});
document.addEventListener("caixota:favorites-updated", updateFavoriteButtons);
document.addEventListener("caixota:aliases-updated", () => activeScreen ? null : renderCatalog());
document.addEventListener("caixota:show-direct-catalog", (event) => { if (event.detail?.category === "video") renderCatalog(); });
document.addEventListener("caixota:reset-direct-tools", (event) => { if (["video", "all"].includes(event.detail?.category)) renderCatalog(); });


function displayLabel(tool) {
  if (!tool) return "Ferramenta";
  return bridge?.getToolLabel?.("video", tool.id, tool.label) || tool.label;
}

function renderCatalog() {
  if (!container) return;
  screenToken += 1;
  activeScreen = false;
  clearLocalResources();
  container.replaceChildren();

  const hero = el("article", "video-category-hero");
  const copy = el("div", "video-category-hero-copy");
  copy.append(el("span", "eyebrow", "PROCESSAMENTO LOCAL · VÍDEO"), el("h2", "", "Vídeo"), el("p", "", "Converta, comprima, extraia áudio e edite seus vídeos sem sair do navegador."));
  hero.append(copy, el("span", "video-network-seal video-local-seal", "PROCESSAMENTO LOCAL"));
  container.append(hero);

  for (const groupName of [...new Set(TOOLS.map((tool) => tool.group || "Ferramentas"))]) {
    const groupTools = TOOLS.filter((tool) => (tool.group || "Ferramentas") === groupName);
    const section = el("section", "video-tool-group");
    const heading = el("div", "video-group-heading");
    heading.append(el("h3", "", groupName), el("span", "", `${groupTools.length} ${groupTools.length === 1 ? "ferramenta" : "ferramentas"}`));
    const grid = el("div", "video-card-grid");
    groupTools.forEach((tool) => grid.append(createCatalogCard(tool)));
    section.append(heading, grid);
    container.append(section);
  }
}

function createCatalogCard(tool) {
  const wrapper = el("article", "video-tool-card-wrap");
  const open = button("", "video-tool-card");
  open.dataset.videoTool = tool.id;
  const icon = el("span", "video-tool-icon", tool.icon || "▶");
  icon.setAttribute("aria-hidden", "true");
  const copy = el("span", "video-tool-copy");
  const badges = el("span", "video-tool-badges");
  badges.append(createStandardNetworkBadge(tool.network || "offline"));
  const title = el("strong", "", displayLabel(tool));
  if (tool.experimental) title.append(el("span", "video-experimental-inline", " · Experimental"));
  copy.append(title, el("small", "", tool.description), badges);
  const arrow = el("span", "video-tool-arrow", "›");
  arrow.setAttribute("aria-hidden", "true");
  open.append(icon, copy, arrow);
  open.addEventListener("click", () => openVideoTool(tool.id));

  const favorite = button("☆", "video-favorite-button");
  favorite.dataset.favoriteCategory = "video";
  favorite.dataset.favoriteTool = tool.id;
  favorite.addEventListener("click", async () => {
    await bridge?.toggleFavorite?.("video", tool.id);
    updateFavoriteButtons();
  });
  wrapper.append(open, favorite);
  updateSingleFavoriteButton(favorite);
  return wrapper;
}

function createStandardNetworkBadge(network) {
  const normalized = network === "required" ? "required" : (network === "optional" ? "optional" : "offline");
  const label = normalized === "required" ? "Internet" : (normalized === "optional" ? "Internet Opcional" : "Offline");
  const badge = el("span", `network-badge ${normalized === "required" ? "needs-internet" : (normalized === "optional" ? "may-use-internet" : "works-offline")}`);
  badge.title = normalized === "required" ? "Requer conexão para funcionar." : (normalized === "optional" ? "Funciona localmente, mas alguns recursos podem usar internet." : "Funciona sem conexão.");
  badge.setAttribute("aria-label", `${label}. ${badge.title}`);
  badge.innerHTML = normalized === "offline"
    ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.1 7.1a6.9 6.9 0 0 1 9.8 0M5.1 9.1a4.1 4.1 0 0 1 5.8 0M6.8 11.2a1.7 1.7 0 0 1 2.4 0M2.2 2.2l11.6 11.6"/></svg>'
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.7"/><path d="M2.6 8h10.8M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.2 8 13.7M8 2.3C6.5 3.8 5.7 5.7 5.7 8s.8 4.2 2.3 5.7"/></svg>';
  badge.append(document.createTextNode(label));
  return badge;
}

function openVideoTool(toolId) {
  const tool = TOOLS.find((item) => item.id === toolId);
  if (!tool) return;
  openLocalVideoTool(tool);
}

function updateFavoriteButtons() { container?.querySelectorAll(".video-favorite-button").forEach(updateSingleFavoriteButton); }
function updateSingleFavoriteButton(control) {
  const active = Boolean(bridge?.isFavorite?.("video", control.dataset.favoriteTool));
  control.textContent = active ? "★" : "☆";
  control.classList.toggle("is-active", active);
  control.setAttribute("aria-pressed", String(active));
  control.setAttribute("aria-label", active ? "Desfavoritar ferramenta" : "Favoritar ferramenta");
  control.title = control.getAttribute("aria-label");
}

function openLocalVideoTool(tool) {
  const token = ++screenToken;
  activeScreen = true;
  clearLocalResources();
  container.replaceChildren();
  const shell = el("section", "video-tool-screen video-local-screen");
  shell.dataset.videoScreen = tool.id;
  const top = el("div", "video-screen-top");
  const back = button("← Voltar para Vídeo", "ghost-button video-back-button");
  back.addEventListener("click", renderCatalog);
  const topCopy = el("div", "video-screen-heading");
  topCopy.append(el("span", "eyebrow", "PROCESSAMENTO LOCAL · OFFLINE"), el("h2", "", displayLabel(tool)), el("p", "", tool.description));
  top.append(back, topCopy);
  const privacy = el("div", "video-local-note");
  privacy.append(el("span", "video-network-note-icon", "✓"), (() => { const c = el("div"); c.append(el("strong", "", "O arquivo fica neste dispositivo"), el("small", "", "A conversão usa APIs nativas do navegador. Nenhum vídeo é enviado para um servidor.")); return c; })());
  const body = el("div", "video-local-body");
  const status = el("div", "video-status");
  status.setAttribute("role", "status");
  const result = el("div", "video-local-result");
  shell.append(top, privacy, body, status, result);
  container.append(shell);
  const screen = { tool, shell, body, status, result, token };
  if (tool.id === "video-convert") buildVideoConverter(screen);
  else if (tool.id === "video-compress") buildVideoCompressor(screen);
  else if (tool.id === "video-extract-audio") buildAudioExtractor(screen);
  else if (tool.id === "video-quick-editor") buildQuickVideoEditor(screen);
  else if (tool.id === "video-info") buildVideoInfo(screen);
  recordVideoUsage(tool.id);
}

function buildVideoConverter(screen) {
  let file = null;
  let meta = null;
  const drop = createVideoDrop("video/*,.mp4,.webm,.mov,.m4v,.ogv,.mkv", "Arraste um vídeo", "MP4, WebM, MOV/M4V e MKV apenas quando o navegador conseguir decodificar", loadFile);
  const preview = buildVideoFilePreview();
  const formatField = labeledField("Formato de saída", "videoConvertFormat");
  const format = document.createElement("select");
  format.id = "videoConvertFormat";
  getVideoOutputFormats(true).forEach((item) => { const option = document.createElement("option"); option.value = item.value; option.textContent = item.label; option.dataset.mime = item.mime || ""; format.append(option); });
  formatField.body.append(format);
  const widthField = labeledField("Resolução máxima", "videoConvertWidth");
  const width = document.createElement("select"); width.id = "videoConvertWidth";
  [["source","Original"],["1920","Até 1080p"],["1280","Até 720p"],["854","Até 480p"],["640","Até 360p"]].forEach(([v,l]) => { const o=document.createElement("option");o.value=v;o.textContent=l;width.append(o); });
  widthField.body.append(width);
  const fpsField = labeledField("FPS", "videoConvertFps");
  const fps = document.createElement("select"); fps.id = "videoConvertFps";
  [["60","60 FPS"],["59.94","59,94 FPS"],["59.9","59,9 FPS"],["50","50 FPS"],["48","48 FPS"],["30","30 FPS"],["29.97","29,97 FPS"],["25","25 FPS"],["24","24 FPS"],["23.976","23,976 FPS"],["15","15 FPS"],["10","10 FPS"],["8","8 FPS (GIF leve)"],["6","6 FPS (GIF menor)"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;fps.append(o);});
  fps.value = "30";
  fpsField.body.append(fps);
  const qualityField = labeledField("Qualidade / bitrate", "videoConvertBitrate");
  const bitrate = document.createElement("select"); bitrate.id="videoConvertBitrate";
  [["12000000","Muito alta · 12 Mbps"],["7000000","Alta · 7 Mbps"],["4000000","Equilibrada · 4 Mbps"],["2200000","Compacta · 2,2 Mbps"],["1200000","Leve · 1,2 Mbps"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;if(v==="4000000")o.selected=true;bitrate.append(o);});
  qualityField.body.append(bitrate);
  const colorsField = labeledField("Cores do GIF", "videoGifColors");
  const colors = document.createElement("select"); colors.id="videoGifColors";
  [["256","256 cores"],["128","128 cores"],["64","64 cores"],["32","32 cores"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;if(v==="128")o.selected=true;colors.append(o);});
  colorsField.body.append(colors);
  const audio = checkboxField("Manter áudio quando o formato permitir", true);
  const form = el("div", "video-local-grid"); form.append(formatField.root, widthField.root, fpsField.root, qualityField.root, colorsField.root, audio.label);
  const note = el("div", "video-local-hint", "Conversões para vídeo usam MediaRecorder e acontecem em tempo real. Saídas de até 60 FPS (inclusive fracionários) são solicitadas ao navegador, mas os FPS reais dependem da mídia original, do desempenho e do encoder. GIFs são limitados a 15 FPS e não possuem áudio.");
  const convert = button("Converter vídeo", "primary-button video-local-action"); convert.disabled = true;
  const cancel = button("Cancelar", "ghost-button video-cancel-action"); cancel.hidden = true;
  cancel.addEventListener("click", () => { screen.cancelRequested = true; cancel.disabled = true; setStatus(screen.status, "Cancelando processamento…", "progress", 4); });
  const actions = el("div", "video-operation-actions"); actions.append(convert, cancel);
  screen.body.append(drop.root, preview.root, form, note, actions);

  const sync = () => {
    const isGif = format.value === "gif";
    qualityField.root.hidden = isGif;
    colorsField.root.hidden = !isGif;
    audio.label.hidden = isGif;
    [...fps.options].forEach(option => { option.disabled = isGif && Number(option.value) > 15; });
    if (isGif && Number(fps.value) > 15) fps.value = "10";
  };
  format.addEventListener("change", sync); sync();

  async function loadFile(nextFile) {
    if (!nextFile) return;
    file = null; meta = null; convert.disabled = true; screen.result.replaceChildren();
    setStatus(screen.status, "Lendo o vídeo localmente…", "progress");
    try {
      meta = await readLocalVideo(nextFile);
      file = nextFile;
      preview.show(nextFile, meta);
      convert.disabled = false;
      setStatus(screen.status, `Pronto: ${formatBytes(nextFile.size)} · ${meta.width}×${meta.height} · ${formatDuration(meta.duration)}.`, "success");
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  }

  convert.addEventListener("click", async () => {
    if (!file || !meta) return;
    convert.disabled = true; const idle = convert.textContent; convert.textContent = format.value === "gif" ? "Criando GIF…" : "Convertendo…"; cancel.hidden = false; cancel.disabled = false; screen.cancelRequested = false; screen.result.replaceChildren();
    try {
      const maxWidth = width.value === "source" ? meta.width : Math.min(meta.width, Number(width.value));
      let output;
      if (format.value === "gif") {
        output = await videoToGif(file, { maxWidth, fps: Math.min(15, Number(fps.value)), colors: Number(colors.value), screen }, (p,m) => setStatus(screen.status,m,"progress",p));
      } else {
        const selected = [...format.options].find((o) => o.value === format.value);
        output = await transcodeVideo(file, { mimeType: selected?.dataset.mime || "", maxWidth, fps: Number(fps.value), videoBitsPerSecond: Number(bitrate.value), includeAudio: audio.input.checked, screen }, (p,m) => setStatus(screen.status,m,"progress",p));
      }
      renderLocalMediaResult(screen.result, output, file.size);
      setStatus(screen.status, `Conversão concluída. ${formatBytes(file.size)} → ${formatBytes(output.blob.size)}.`, "success", 100);
      await recordVideoUsage(screen.tool.id);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
    finally { convert.disabled = false; convert.textContent = idle; cancel.hidden = true; cancel.disabled = false; screen.cancelRequested = false; }
  });
}

function buildVideoCompressor(screen) {
  let file = null;
  let meta = null;
  const drop = createVideoDrop("video/*,.mp4,.webm,.mov,.m4v,.ogv,.mkv", "Arraste um vídeo para comprimir", "O processamento é local e preserva o arquivo original", loadFile);
  const preview = buildVideoFilePreview();
  const presetField = labeledField("Preset", "videoCompressPreset");
  const preset = document.createElement("select"); preset.id="videoCompressPreset";
  [["balanced","Equilibrado"],["discord","Compartilhar / Discord"],["whatsapp","WhatsApp / celular"],["small","Arquivo pequeno"],["quality","Mais qualidade"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;preset.append(o);}); presetField.body.append(preset);
  const formatField = labeledField("Container", "videoCompressFormat");
  const format = document.createElement("select"); format.id="videoCompressFormat";
  getVideoOutputFormats(false).forEach((item)=>{const o=document.createElement("option");o.value=item.value;o.textContent=item.label;o.dataset.mime=item.mime;format.append(o);}); formatField.body.append(format);
  const audio = checkboxField("Manter áudio", true);
  const form = el("div", "video-local-grid video-local-grid-compact"); form.append(presetField.root, formatField.root, audio.label);
  const estimate = el("div", "video-compress-estimate");
  const compress = button("Comprimir vídeo", "primary-button video-local-action"); compress.disabled = true;
  const cancel = button("Cancelar", "ghost-button video-cancel-action"); cancel.hidden = true;
  cancel.addEventListener("click", () => { screen.cancelRequested = true; cancel.disabled = true; setStatus(screen.status, "Cancelando processamento…", "progress", 4); });
  const actions = el("div", "video-operation-actions"); actions.append(compress, cancel);
  screen.body.append(drop.root, preview.root, form, estimate, actions);

  const presets = {
    quality: { width: 1920, bitrate: 6000000, fps: 30 },
    balanced: { width: 1280, bitrate: 2800000, fps: 30 },
    discord: { width: 1280, bitrate: 1500000, fps: 30 },
    whatsapp: { width: 854, bitrate: 1100000, fps: 24 },
    small: { width: 640, bitrate: 700000, fps: 20 }
  };
  const refreshEstimate = () => {
    if (!meta) { estimate.textContent = ""; return; }
    const p = presets[preset.value];
    const estimated = Math.round((p.bitrate + (audio.input.checked ? 128000 : 0)) * meta.duration / 8);
    estimate.textContent = `Estimativa aproximada: ${formatBytes(estimated)} · até ${p.width}px · ${p.fps} FPS. O tamanho real pode variar conforme o codec.`;
  };
  preset.addEventListener("change", refreshEstimate); audio.input.addEventListener("change", refreshEstimate);

  async function loadFile(nextFile) {
    if (!nextFile) return;
    file = null; meta = null; compress.disabled = true; screen.result.replaceChildren();
    setStatus(screen.status, "Analisando o vídeo…", "progress");
    try { meta = await readLocalVideo(nextFile); file = nextFile; preview.show(nextFile, meta); compress.disabled = false; refreshEstimate(); setStatus(screen.status, `Original: ${formatBytes(nextFile.size)} · ${meta.width}×${meta.height} · ${formatDuration(meta.duration)}.`, "success"); }
    catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  }

  compress.addEventListener("click", async () => {
    if (!file || !meta) return;
    const idle=compress.textContent; compress.disabled=true; compress.textContent="Comprimindo…"; cancel.hidden=false; cancel.disabled=false; screen.cancelRequested=false; screen.result.replaceChildren();
    try {
      const p=presets[preset.value]; const option=[...format.options].find((o)=>o.value===format.value);
      const output=await transcodeVideo(file,{mimeType:option?.dataset.mime||"",maxWidth:Math.min(meta.width,p.width),fps:p.fps,videoBitsPerSecond:p.bitrate,includeAudio:audio.input.checked,screen},(pct,msg)=>setStatus(screen.status,msg,"progress",pct));
      renderLocalMediaResult(screen.result, output, file.size);
      const saving = file.size > 0 ? Math.round((1 - output.blob.size / file.size) * 100) : 0;
      setStatus(screen.status, saving > 0 ? `Compressão concluída: ${saving}% menor.` : "Compressão concluída. O codec escolhido não reduziu o arquivo neste caso.", saving > 0 ? "success" : "warning", 100);
      await recordVideoUsage(screen.tool.id);
    } catch(error) { setStatus(screen.status,friendlyError(error),"error"); }
    finally { compress.disabled=false; compress.textContent=idle; cancel.hidden=true; cancel.disabled=false; screen.cancelRequested=false; }
  });
}

function buildAudioExtractor(screen) {
  let file = null;
  let meta = null;
  const drop = createVideoDrop("video/*,.mp4,.webm,.mov,.m4v,.ogv,.mkv", "Arraste um vídeo para extrair o áudio", "A faixa sonora é processada localmente e o vídeo original não é alterado", loadFile);
  const preview = buildVideoFilePreview();
  const formatField = labeledField("Formato de áudio", "videoAudioFormat");
  const format = document.createElement("select");
  format.id = "videoAudioFormat";
  getAudioOutputFormats().forEach((item) => { const option = document.createElement("option"); option.value = item.value; option.textContent = item.label; option.dataset.mime = item.mime || ""; option.dataset.ext = item.ext || "webm"; format.append(option); });
  formatField.body.append(format);
  const qualityField = labeledField("Qualidade", "videoAudioBitrate");
  const bitrate = document.createElement("select"); bitrate.id = "videoAudioBitrate";
  [["256000","Muito alta · 256 kbps"],["192000","Alta · 192 kbps"],["128000","Equilibrada · 128 kbps"],["96000","Compacta · 96 kbps"],["64000","Leve · 64 kbps"]].forEach(([value,label]) => { const option=document.createElement("option"); option.value=value; option.textContent=label; if(value==="128000") option.selected=true; bitrate.append(option); });
  qualityField.body.append(bitrate);
  const form = el("div", "video-local-grid video-local-grid-compact"); form.append(formatField.root, qualityField.root);
  const note = el("div", "video-local-hint", "Os formatos exibidos dependem do encoder de áudio disponível no seu navegador. A extração ocorre aproximadamente em tempo real.");
  const extract = button("Extrair áudio", "primary-button video-local-action"); extract.disabled = true;
  const cancel = button("Cancelar", "ghost-button video-cancel-action"); cancel.hidden = true;
  cancel.addEventListener("click", () => { screen.cancelRequested = true; cancel.disabled = true; setStatus(screen.status, "Cancelando extração…", "progress", 4); });
  const actions = el("div", "video-operation-actions"); actions.append(extract, cancel);
  screen.body.append(drop.root, preview.root, form, note, actions);

  async function loadFile(nextFile) {
    if (!nextFile) return;
    file = null; meta = null; extract.disabled = true; screen.result.replaceChildren();
    setStatus(screen.status, "Analisando o vídeo…", "progress");
    try { meta = await readLocalVideo(nextFile); file = nextFile; preview.show(nextFile, meta); extract.disabled = !format.options.length; setStatus(screen.status, format.options.length ? `Pronto para extrair ${formatDuration(meta.duration)} de áudio.` : "Este navegador não oferece um encoder de áudio compatível.", format.options.length ? "success" : "error"); }
    catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  }

  extract.addEventListener("click", async () => {
    if (!file || !meta || !format.options.length) return;
    const idle = extract.textContent; extract.disabled = true; extract.textContent = "Extraindo…"; cancel.hidden = false; cancel.disabled = false; screen.cancelRequested = false; screen.result.replaceChildren();
    try {
      const selected = format.selectedOptions[0];
      const output = await extractAudioFromVideo(file, { mimeType: selected?.dataset.mime || "", extension: selected?.dataset.ext || "webm", audioBitsPerSecond: Number(bitrate.value), screen }, (pct,msg) => setStatus(screen.status,msg,"progress",pct));
      renderAudioResult(screen.result, output, file.size);
      setStatus(screen.status, `Áudio extraído: ${formatBytes(output.blob.size)}.`, "success", 100);
      await recordVideoUsage(screen.tool.id);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
    finally { extract.disabled = false; extract.textContent = idle; cancel.hidden = true; cancel.disabled = false; screen.cancelRequested = false; }
  });
}

function buildQuickVideoEditor(screen) {
  let file = null;
  let meta = null;
  const drop = createVideoDrop("video/*,.mp4,.webm,.mov,.m4v,.ogv,.mkv", "Arraste um vídeo para editar", "Corte, recorte, gire, espelhe e ajuste o áudio sem enviar o arquivo", loadFile);
  const preview = buildVideoFilePreview();
  preview.root.classList.add('video-editor-preview');
  const timeline=el('div','video-editor-timeline');timeline.hidden=true;const emptyPreview=el('div','video-editor-empty');emptyPreview.append(el('span','video-editor-empty-icon','▶'),el('strong','','A prévia do seu vídeo aparece aqui'),el('small','','Adicione um arquivo para ver os controles de reprodução e escolher seus cortes.'));
  const timelineTop=el('div','video-editor-timeline-title');timelineTop.append(el('strong','', 'Linha do tempo'),el('span','video-editor-time','00:00 / 00:00'));
  const play=button('▶ Reproduzir','ghost-button video-editor-play');
  const scrub=document.createElement('input');scrub.type='range';scrub.min='0';scrub.max='100';scrub.step='0.05';scrub.value='0';scrub.className='video-editor-scrub';scrub.setAttribute('aria-label','Posição no vídeo');
  const startRange=document.createElement('input');startRange.type='range';startRange.min='0';startRange.max='100';startRange.step='.05';startRange.value='0';startRange.setAttribute('aria-label','Início do corte');
  const endRange=document.createElement('input');endRange.type='range';endRange.min='0';endRange.max='100';endRange.step='.05';endRange.value='100';endRange.setAttribute('aria-label','Fim do corte');
  const trim=el('div','video-editor-trim');const trimLabel=el('div','video-editor-trim-label','Arraste as extremidades para escolher o trecho');
  const ruler=el('div','video-editor-ruler');for(let i=0;i<=10;i++)ruler.append(el('i'));
  const marker=el('div','video-editor-cut-markers');marker.append(startRange,endRange);
  timeline.append(timelineTop,play,scrub,ruler,marker,trimLabel);
  const workspace=el('div','video-editor-workspace');const stage=el('div','video-editor-stage'),inspector=el('div','video-editor-inspector');
  stage.append(emptyPreview,preview.root,timeline);inspector.append(el('h3','','Ajustes do clipe'));workspace.append(stage,inspector);

  const startField = labeledField("Início do trecho (s)", "videoEditStart");
  const start = document.createElement("input"); start.id="videoEditStart"; start.type="number"; start.min="0"; start.step="0.1"; start.value="0"; startField.body.append(start);
  const endField = labeledField("Fim do trecho (s)", "videoEditEnd");
  const end = document.createElement("input"); end.id="videoEditEnd"; end.type="number"; end.min="0"; end.step="0.1"; endField.body.append(end);
  const cropField = labeledField("Recorte / proporção", "videoEditCrop");
  const crop = document.createElement("select"); crop.id="videoEditCrop"; [["source","Original"],["16:9","16:9 · paisagem"],["9:16","9:16 · vertical"],["1:1","1:1 · quadrado"],["4:3","4:3 · clássico"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;crop.append(o);}); cropField.body.append(crop);
  const rotateField = labeledField("Rotação", "videoEditRotate");
  const rotate = document.createElement("select"); rotate.id="videoEditRotate"; [["0","Sem rotação"],["90","90°"],["180","180°"],["270","270°"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;rotate.append(o);}); rotateField.body.append(rotate);
  const widthField = labeledField("Resolução máxima", "videoEditWidth");
  const width = document.createElement("select"); width.id="videoEditWidth"; [["source","Original"],["1920","Até 1080p"],["1280","Até 720p"],["854","Até 480p"],["640","Até 360p"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;width.append(o);}); widthField.body.append(width);
  const formatField = labeledField("Formato de saída", "videoEditFormat");
  const format = document.createElement("select"); format.id="videoEditFormat"; getVideoOutputFormats(false).forEach((item)=>{const o=document.createElement("option");o.value=item.value;o.textContent=item.label;o.dataset.mime=item.mime||"";format.append(o);}); formatField.body.append(format);
  const volumeField = labeledField("Volume", "videoEditVolume");
  const volume = document.createElement("select"); volume.id="videoEditVolume"; [["0","Sem áudio"],["0.5","50%"],["1","100%"],["1.5","150%"],["2","200%"]].forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;if(v==="1")o.selected=true;volume.append(o);}); volumeField.body.append(volume);
  const flip = checkboxField("Espelhar horizontalmente", false);
  const form = el("div", "video-local-grid"); form.append(startField.root,endField.root,cropField.root,rotateField.root,widthField.root,formatField.root,volumeField.root,flip.label);inspector.append(form);
  const note = el("div", "video-local-hint", "Editor para um clipe por vez, com cortes pela linha do tempo. O trecho exportado é recodificado usando os codecs disponíveis no navegador.");
  const exportButton = button("Editar e exportar", "primary-button video-local-action"); exportButton.disabled = true;
  const cancel = button("Cancelar", "ghost-button video-cancel-action"); cancel.hidden = true;
  cancel.addEventListener("click", () => { screen.cancelRequested = true; cancel.disabled = true; setStatus(screen.status, "Cancelando edição…", "progress", 4); });
  const actions = el("div", "video-operation-actions"); actions.append(exportButton,cancel);
  screen.body.append(drop.root,workspace,note,actions);
  const movie=preview.root.querySelector('video');
  const sync=()=>{if(!meta)return;const duration=meta.duration;const startTime=Math.min(duration,Math.max(0,Number(start.value)||0));const endTime=Math.min(duration,Math.max(startTime+.05,Number(end.value)||duration));startRange.value=String(startTime);endRange.value=String(endTime);scrub.max=String(duration);scrub.value=String(Math.max(0,movie.currentTime||0));timeline.style.setProperty('--clip-start',`${startTime/duration*100}%`);timeline.style.setProperty('--clip-end',`${endTime/duration*100}%`);timelineTop.querySelector('span').textContent=`${formatDuration(movie.currentTime||0)} / ${formatDuration(duration)}`;};
  startRange.addEventListener('input',()=>{if(!meta)return;start.value=String(Math.min(Number(startRange.value),Number(end.value)-.05).toFixed(2));movie.currentTime=Math.max(0,Number(start.value));sync();});
  endRange.addEventListener('input',()=>{if(!meta)return;end.value=String(Math.max(Number(endRange.value),Number(start.value)+.05).toFixed(2));movie.currentTime=Math.min(meta.duration,Number(end.value));sync();});
  scrub.addEventListener('input',()=>{if(meta){movie.currentTime=Number(scrub.value);sync();}});
  start.addEventListener('input',sync);end.addEventListener('input',sync);
  movie.addEventListener('timeupdate',()=>{sync();if(meta&&movie.currentTime>=Number(end.value)&&!movie.paused)movie.pause();});
  movie.addEventListener('play',()=>{play.textContent='Ⅱ Pausar';});movie.addEventListener('pause',()=>{play.textContent='▶ Reproduzir';});
  play.addEventListener('click',async()=>{if(!meta)return;if(movie.paused){if(movie.currentTime<Number(start.value)||movie.currentTime>=Number(end.value))movie.currentTime=Number(start.value)||0;try{await movie.play();}catch{}}else movie.pause();});


  async function loadFile(nextFile) {
    if (!nextFile) return;
    file=null; meta=null; exportButton.disabled=true; screen.result.replaceChildren(); setStatus(screen.status,"Lendo o vídeo…","progress");
    try { meta=await readLocalVideo(nextFile); file=nextFile; preview.show(nextFile,meta);emptyPreview.hidden=true; timeline.hidden=false;timeline.classList.add('is-ready');scrub.max=String(meta.duration);startRange.max=String(meta.duration);endRange.max=String(meta.duration);endRange.value=String(meta.duration); start.max=String(Math.max(0,meta.duration-.1)); end.max=String(meta.duration); end.value=String(Math.round(meta.duration*10)/10); sync();exportButton.disabled=!format.options.length; setStatus(screen.status,`Pronto: ${meta.width}×${meta.height} · ${formatDuration(meta.duration)}.`,"success"); }
    catch(error){ setStatus(screen.status,friendlyError(error),"error"); }
  }

  exportButton.addEventListener("click", async () => {
    if(!file||!meta)return;
    const startTime=Math.max(0,Number(start.value)||0); const endTime=Math.min(meta.duration,Number(end.value)||meta.duration);
    if(endTime-startTime<0.15){setStatus(screen.status,"Escolha um trecho com pelo menos 0,15 segundo.","error");return;}
    const idle=exportButton.textContent; exportButton.disabled=true; exportButton.textContent="Editando…"; cancel.hidden=false; cancel.disabled=false; screen.cancelRequested=false; screen.result.replaceChildren();
    try {
      const selected=format.selectedOptions[0]; const maxWidth=width.value==="source"?meta.width:Math.min(meta.width,Number(width.value)); const gain=Number(volume.value);
      const output=await transcodeVideo(file,{mimeType:selected?.dataset.mime||"",maxWidth,fps:30,videoBitsPerSecond:4000000,includeAudio:gain>0,audioGain:gain,startTime,endTime,cropAspect:crop.value,rotation:Number(rotate.value)||0,flipHorizontal:flip.input.checked,screen,filenameSuffix:"editado"},(pct,msg)=>setStatus(screen.status,msg,"progress",pct));
      renderLocalMediaResult(screen.result,output,file.size); setStatus(screen.status,`Edição concluída: ${formatDuration(output.duration)} exportados.`,"success",100); await recordVideoUsage(screen.tool.id);
    } catch(error){setStatus(screen.status,friendlyError(error),"error");}
    finally{exportButton.disabled=false;exportButton.textContent=idle;cancel.hidden=true;cancel.disabled=false;screen.cancelRequested=false;}
  });
}

function createVideoDrop(accept, label, hint, onFile) {
  const root=el("label","video-drop-zone");
  const input=document.createElement("input"); input.type="file"; input.accept=accept;
  const uploadLabel=el("span","cx-drop-click-label","＋  Selecionar arquivo");
  uploadLabel.setAttribute("aria-hidden","true");
  root.append(input, el("span","video-drop-icon","□"), el("strong","",label), el("small","",hint), uploadLabel);
  const choose=(files)=>{const file=files?.[0];if(file)onFile(file);}; input.addEventListener("change",()=>choose(input.files));
  ["dragenter","dragover"].forEach((name)=>root.addEventListener(name,(e)=>{e.preventDefault();root.classList.add("is-dragging");}));
  ["dragleave","drop"].forEach((name)=>root.addEventListener(name,(e)=>{e.preventDefault();root.classList.remove("is-dragging");if(name==="drop")choose(e.dataTransfer?.files);}));
  return {root,input};
}

function buildVideoFilePreview() {
  const root=el("article","video-file-preview"); root.hidden=true;
  const video=document.createElement("video"); video.controls=true; video.muted=true; video.playsInline=true;
  const copy=el("div","video-file-preview-copy"); root.append(video,copy);
  return {root,show(file,meta){const url=keepLocalUrl(URL.createObjectURL(file));video.src=url;copy.replaceChildren(el("strong","",file.name),el("span","",`${formatBytes(file.size)} · ${meta.width}×${meta.height} · ${formatDuration(meta.duration)}`));root.hidden=false;}};
}

function checkboxField(labelText, checked=false) {
  const label=el("label","video-check-field"); const input=document.createElement("input"); input.type="checkbox"; input.checked=checked; label.append(input,el("span","",labelText)); return {label,input};
}

async function readLocalVideo(file) {
  if (!file || !file.size) throw new Error("Selecione um arquivo de vídeo válido.");
  if (file.size > 2 * 1024 * 1024 * 1024) throw new Error("O arquivo ultrapassa o limite de 2 GB desta ferramenta.");
  const url=URL.createObjectURL(file); const video=document.createElement("video"); video.preload="metadata"; video.muted=true; video.playsInline=true; video.src=url;
  try { await once(video,"loadedmetadata",15000); if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) throw new Error("O navegador não conseguiu decodificar o arquivo. MKV só funciona como entrada quando o codec/contêiner é suportado; a conversão para MKV não é oferecida."); return {duration:video.duration,width:video.videoWidth,height:video.videoHeight,type:file.type||"video/*"}; }
  finally { video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url); }
}

function getAudioOutputFormats() {
  if (typeof MediaRecorder === "undefined") return [];
  const candidates = [
    { value: "webm-opus", label: "WebM · Opus", mime: "audio/webm;codecs=opus", ext: "webm" },
    { value: "ogg-opus", label: "OGG · Opus", mime: "audio/ogg;codecs=opus", ext: "ogg" },
    { value: "m4a-aac", label: "M4A · AAC (se suportado)", mime: "audio/mp4;codecs=mp4a.40.2", ext: "m4a" },
    { value: "m4a", label: "M4A / MP4 áudio (se suportado)", mime: "audio/mp4", ext: "m4a" }
  ];
  const formats = candidates.filter((item) => MediaRecorder.isTypeSupported?.(item.mime));
  if (!formats.length) formats.push({ value: "browser", label: "Formato padrão do navegador", mime: "", ext: "webm" });
  return formats;
}

function getVideoOutputFormats(includeGif=false) {
  const formats=[];
  const candidates=[
    {value:"webm-vp9",label:"WebM · VP9/Opus",mime:"video/webm;codecs=vp9,opus"},
    {value:"webm-vp8",label:"WebM · VP8/Opus",mime:"video/webm;codecs=vp8,opus"},
    {value:"webm",label:"WebM",mime:"video/webm"},
    {value:"mp4",label:"MP4 · H.264/AAC (se suportado)",mime:"video/mp4;codecs=avc1.42E01E,mp4a.40.2"},
    {value:"mp4-basic",label:"MP4 (se suportado)",mime:"video/mp4"}
  ];
  const seen=new Set();
  for(const item of candidates){if(typeof MediaRecorder!=="undefined"&&MediaRecorder.isTypeSupported?.(item.mime)){const family=item.value.startsWith("mp4")?"mp4":item.value;if(seen.has(family)&&family==="mp4")continue;seen.add(family);formats.push(item);}}
  if(!formats.length&&typeof MediaRecorder!=="undefined")formats.push({value:"webm",label:"Formato padrão do navegador",mime:""});
  if(includeGif)formats.push({value:"gif",label:"GIF animado · sem áudio",mime:"image/gif"});
  return formats;
}

async function transcodeVideo(file, options, onProgress) {
  if (typeof MediaRecorder === "undefined") throw new Error("Este navegador não oferece MediaRecorder para converter vídeos localmente.");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto"; video.playsInline = true; video.src = url; video.muted = !options.includeAudio; video.volume = 1;
  const cleanup = [];
  let recorder = null;
  let stream = null;
  let sourceStream = null;
  let audioContext = null;
  try {
    await once(video, "loadedmetadata", 15000);
    const startTime = Math.max(0, Math.min(Number(options.startTime) || 0, Math.max(0, video.duration - 0.05)));
    const requestedEnd = Number(options.endTime);
    const endTime = Math.max(startTime + 0.05, Math.min(Number.isFinite(requestedEnd) ? requestedEnd : video.duration, video.duration));
    const plan = buildVideoDrawPlan(video.videoWidth, video.videoHeight, options.maxWidth || video.videoWidth, options.cropAspect || "source", Number(options.rotation) || 0);
    const canvas = document.createElement("canvas"); canvas.width = plan.canvasWidth; canvas.height = plan.canvasHeight;
    const ctx = canvas.getContext("2d", { alpha: false }); if (!ctx) throw new Error("Canvas indisponível.");
    const fps = Math.max(6, Math.min(60, Number(options.fps) || 30));
    stream = canvas.captureStream(fps);

    if (options.includeAudio) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          audioContext = new AudioCtx();
          const source = audioContext.createMediaElementSource(video);
          const gain = audioContext.createGain();
          gain.gain.value = Math.max(0, Math.min(2, Number(options.audioGain ?? 1)));
          const destination = audioContext.createMediaStreamDestination();
          source.connect(gain); gain.connect(destination);
          destination.stream.getAudioTracks().forEach((track) => stream.addTrack(track));
          await audioContext.resume();
          cleanup.push(() => audioContext?.close?.().catch?.(() => {}));
        }
      } catch (_error) {}
      if (!stream.getAudioTracks().length) {
        const capture = video.captureStream || video.mozCaptureStream || video.webkitCaptureStream;
        if (typeof capture === "function") {
          try { sourceStream = capture.call(video); sourceStream.getAudioTracks().forEach((track) => stream.addTrack(track)); } catch (_error) {}
        }
      }
    }

    const recorderOptions = { videoBitsPerSecond: Math.max(250000, Number(options.videoBitsPerSecond) || 3000000) };
    if (options.mimeType) recorderOptions.mimeType = options.mimeType;
    if (options.includeAudio) recorderOptions.audioBitsPerSecond = 128000;
    try { recorder = new MediaRecorder(stream, recorderOptions); }
    catch (error) { throw new Error(`O navegador não conseguiu iniciar este formato. ${friendlyError(error)}`); }

    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const stopped = new Promise((resolve, reject) => { recorder.onstop = resolve; recorder.onerror = () => reject(recorder.error || new Error("Falha no encoder do navegador.")); });
    const draw = () => { if (video.paused || video.ended || screenCancelled(options.screen)) return; drawVideoFrame(ctx, video, plan, options); if (typeof video.requestVideoFrameCallback === "function") video.requestVideoFrameCallback(draw); else requestAnimationFrame(draw); };
    const clipDuration = Math.max(0.05, endTime - startTime);
    const tick = setInterval(() => {
      if (screenCancelled(options.screen)) return;
      const elapsed = Math.max(0, video.currentTime - startTime);
      const pct = Math.min(96, 5 + (elapsed / clipDuration) * 90);
      onProgress?.(pct, `Processando ${formatDuration(elapsed)} de ${formatDuration(clipDuration)}…`);
    }, 250);
    cleanup.push(() => clearInterval(tick));

    if (startTime > 0.001) await seekVideo(video, startTime);
    drawVideoFrame(ctx, video, plan, options);
    recorder.start(1000);
    await video.play();
    if (typeof video.requestVideoFrameCallback === "function") video.requestVideoFrameCallback(draw); else requestAnimationFrame(draw);

    let playbackError = null;
    try { await waitForMediaRange(video, endTime, options.screen, Math.max(30000, clipDuration * 1600 + 15000)); }
    catch (error) { playbackError = error; }
    video.pause();
    if (recorder.state !== "inactive") recorder.stop();
    await stopped.catch((error) => { if (!playbackError) playbackError = error; });
    if (playbackError) throw playbackError;

    const mime = recorder.mimeType || options.mimeType || chunks[0]?.type || "video/webm";
    const blob = new Blob(chunks, { type: mime }); if (!blob.size) throw new Error("O navegador terminou a conversão sem gerar dados.");
    const ext = /mp4/i.test(mime) ? "mp4" : "webm";
    const suffix = options.filenameSuffix || "caixota";
    return { blob, filename: `${baseName(file.name)}-${suffix}.${ext}`, mime, width: canvas.width, height: canvas.height, duration: clipDuration, kind: "video" };
  } finally {
    try { if (recorder && recorder.state !== "inactive") recorder.stop(); } catch (_error) {}
    cleanup.forEach((fn) => fn());
    stream?.getTracks?.().forEach((track) => track.stop());
    sourceStream?.getTracks?.().forEach((track) => track.stop());
    video.pause(); video.removeAttribute("src"); video.load(); URL.revokeObjectURL(url);
  }
}

function buildVideoDrawPlan(width, height, maxWidth, cropAspect = "source", rotation = 0) {
  let sx = 0, sy = 0, sw = width, sh = height;
  const ratios = { "16:9": 16 / 9, "9:16": 9 / 16, "1:1": 1, "4:3": 4 / 3 };
  const targetRatio = ratios[cropAspect];
  if (targetRatio) {
    const sourceRatio = width / height;
    if (sourceRatio > targetRatio) { sw = height * targetRatio; sx = (width - sw) / 2; }
    else if (sourceRatio < targetRatio) { sh = width / targetRatio; sy = (height - sh) / 2; }
  }
  const dims = fitVideoSize(sw, sh, Math.min(Number(maxWidth) || sw, sw));
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const swapped = normalizedRotation === 90 || normalizedRotation === 270;
  return { sx, sy, sw, sh, drawWidth: dims.width, drawHeight: dims.height, rotation: normalizedRotation, canvasWidth: swapped ? dims.height : dims.width, canvasHeight: swapped ? dims.width : dims.height };
}

function drawVideoFrame(ctx, video, plan, options = {}) {
  ctx.save();
  ctx.fillStyle = "#000"; ctx.fillRect(0, 0, plan.canvasWidth, plan.canvasHeight);
  ctx.translate(plan.canvasWidth / 2, plan.canvasHeight / 2);
  ctx.rotate(plan.rotation * Math.PI / 180);
  ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  ctx.drawImage(video, plan.sx, plan.sy, plan.sw, plan.sh, -plan.drawWidth / 2, -plan.drawHeight / 2, plan.drawWidth, plan.drawHeight);
  ctx.restore();
}

function screenCancelled(screen) {
  return Boolean(screen && (screen.token !== screenToken || screen.cancelRequested));
}

function waitForMediaRange(video, endTime, screen, timeout) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (screenCancelled(screen)) { clearInterval(timer); reject(new Error("Operação cancelada.")); return; }
      if (video.ended || video.currentTime >= endTime - 0.025) { clearInterval(timer); resolve(); return; }
      if (Date.now() - started > timeout) { clearInterval(timer); reject(new Error("A operação de mídia demorou mais que o esperado.")); }
    }, 80);
  });
}

async function extractAudioFromVideo(file, options, onProgress) {
  if (typeof MediaRecorder === "undefined") throw new Error("Este navegador não oferece MediaRecorder para extrair áudio localmente.");
  const url = URL.createObjectURL(file);
  const video = document.createElement("video"); video.preload = "auto"; video.playsInline = true; video.muted = false; video.volume = 1; video.src = url;
  let audioContext = null; let sourceStream = null; let stream = null; let recorder = null;
  try {
    await once(video, "loadedmetadata", 15000);
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      try {
        audioContext = new AudioCtx();
        const source = audioContext.createMediaElementSource(video);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination); stream = destination.stream; await audioContext.resume();
      } catch (_error) {}
    }
    if (!stream?.getAudioTracks?.().length) {
      const capture = video.captureStream || video.mozCaptureStream || video.webkitCaptureStream;
      if (typeof capture === "function") { sourceStream = capture.call(video); const audioTracks = sourceStream.getAudioTracks(); if (audioTracks.length) stream = new MediaStream(audioTracks); }
    }
    if (!stream?.getAudioTracks?.().length) throw new Error("Não foi possível acessar a faixa de áudio deste vídeo neste navegador.");
    const recorderOptions = { audioBitsPerSecond: Math.max(32000, Number(options.audioBitsPerSecond) || 128000) }; if (options.mimeType) recorderOptions.mimeType = options.mimeType;
    try { recorder = new MediaRecorder(stream, recorderOptions); } catch (error) { throw new Error(`Não foi possível iniciar o encoder de áudio. ${friendlyError(error)}`); }
    const chunks = []; recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    const stopped = new Promise((resolve,reject) => { recorder.onstop=resolve; recorder.onerror=()=>reject(recorder.error||new Error("Falha ao extrair o áudio.")); });
    const tick=setInterval(()=>{if(!screenCancelled(options.screen)){const pct=video.duration?Math.min(96,5+video.currentTime/video.duration*90):10;onProgress?.(pct,`Extraindo ${formatDuration(video.currentTime)} de ${formatDuration(video.duration)}…`);}},250);
    recorder.start(1000); await video.play(); let playbackError=null; try{await waitForMediaRange(video,video.duration,options.screen,Math.max(30000,video.duration*1600+15000));}catch(error){playbackError=error;} finally{clearInterval(tick);}
    video.pause(); if(recorder.state!=="inactive")recorder.stop(); await stopped.catch((error)=>{if(!playbackError)playbackError=error;}); if(playbackError)throw playbackError;
    const mime=recorder.mimeType||options.mimeType||chunks[0]?.type||"audio/webm"; const blob=new Blob(chunks,{type:mime}); if(!blob.size)throw new Error("Nenhum dado de áudio foi gerado.");
    let ext=options.extension||(/ogg/i.test(mime)?"ogg":/mp4/i.test(mime)?"m4a":"webm");
    return {blob,filename:`${baseName(file.name)}-audio.${ext}`,mime,duration:video.duration,kind:"audio"};
  } finally {
    try{if(recorder&&recorder.state!=="inactive")recorder.stop();}catch(_error){}
    stream?.getTracks?.().forEach((track)=>track.stop()); sourceStream?.getTracks?.().forEach((track)=>track.stop()); await audioContext?.close?.().catch?.(()=>{});
    video.pause();video.removeAttribute("src");video.load();URL.revokeObjectURL(url);
  }
}

function renderAudioResult(target, output, originalSize) {
  const card=el("article","video-local-output"); const audio=document.createElement("audio"); audio.controls=true; audio.src=keepLocalUrl(URL.createObjectURL(output.blob));
  const copy=el("div","video-local-output-copy"); copy.append(el("strong","",output.filename),el("span","",`${formatDuration(output.duration)} · ${formatBytes(output.blob.size)}`),el("small","",`${output.mime||"Áudio"} · vídeo original ${formatBytes(originalSize)}`));
  const download=button("Baixar áudio","primary-button"); download.addEventListener("click",()=>downloadLocalBlob(output.blob,output.filename)); card.append(audio,copy,download); target.replaceChildren(card);
}

async function videoToGif(file, options, onProgress) {
  const url=URL.createObjectURL(file); const video=document.createElement("video"); video.preload="auto"; video.muted=true; video.playsInline=true; video.src=url;
  try {
    await once(video,"loadedmetadata",15000);
    if (video.readyState < 2) await once(video,"loadeddata",15000);
    const fps=Math.max(2,Math.min(15,Number(options.fps)||10)); const duration=Math.min(video.duration,60); const frameCount=Math.min(600,Math.max(1,Math.ceil(duration*fps))); if(video.duration>60)onProgress?.(3,"GIF limitado aos primeiros 60 segundos para proteger a memória do navegador.");
    const dims=fitVideoSize(video.videoWidth,video.videoHeight,Math.min(Number(options.maxWidth)||video.videoWidth,1280)); const canvas=document.createElement("canvas");canvas.width=dims.width;canvas.height=dims.height;const ctx=canvas.getContext("2d",{alpha:false,willReadFrequently:true});if(!ctx)throw new Error("Canvas indisponível.");
    const encoder=GIFEncoder(); const colorCount=Math.max(16,Math.min(256,Number(options.colors)||128)); const delay=Math.max(20,Math.round(1000/fps));
    for(let i=0;i<frameCount;i+=1){if(screenCancelled(options.screen))throw new Error("Operação cancelada.");const time=Math.min(Math.max(0,video.duration-0.02),i/fps);await seekVideo(video,time);ctx.drawImage(video,0,0,canvas.width,canvas.height);const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;const palette=quantize(rgba,colorCount,{format:"rgb444"});const indexed=applyPalette(rgba,palette,"rgb444");encoder.writeFrame(indexed,canvas.width,canvas.height,{palette,delay,repeat:i===0?0:undefined});if(i%2===0)await nextPaint();onProgress?.(5+(i+1)/frameCount*90,`Criando frame ${i+1} de ${frameCount}…`);}
    encoder.finish(); const blob=new Blob([encoder.bytes()],{type:"image/gif"});return {blob,filename:`${baseName(file.name)}-caixota.gif`,mime:"image/gif",width:canvas.width,height:canvas.height,duration,kind:"gif"};
  } finally {video.removeAttribute("src");video.load();URL.revokeObjectURL(url);}
}

function renderLocalMediaResult(target, output, originalSize) {
  clearLocalResultUrls(target); const card=el("article","video-local-output"); const preview=output.kind==="gif"?document.createElement("img"):document.createElement("video"); const url=keepLocalUrl(URL.createObjectURL(output.blob)); preview.src=url; if(preview.tagName==="VIDEO"){preview.controls=true;preview.muted=true;preview.playsInline=true;} preview.alt="Prévia do arquivo processado";
  const copy=el("div","video-local-output-copy"); const title=el("strong","",output.filename); const diff=originalSize?Math.round((1-output.blob.size/originalSize)*100):0; const sizeLine=diff>0?`${formatBytes(output.blob.size)} · ${diff}% menor que o original`:`${formatBytes(output.blob.size)} · original ${formatBytes(originalSize)}`; copy.append(title,el("span","",`${output.width}×${output.height} · ${formatDuration(output.duration)} · ${sizeLine}`),el("small","",output.mime||"Arquivo processado")); const download=button("Baixar arquivo","primary-button"); download.addEventListener("click",()=>downloadLocalBlob(output.blob,output.filename)); card.append(preview,copy,download);target.replaceChildren(card);
}

function fitVideoSize(width,height,maxWidth){const safe=Math.max(2,Math.min(width,Number(maxWidth)||width));const scale=Math.min(1,safe/width);let w=Math.max(2,Math.round(width*scale));let h=Math.max(2,Math.round(height*scale));if(w%2)w-=1;if(h%2)h-=1;return{width:w,height:h};}
function seekVideo(video,time){return new Promise((resolve,reject)=>{
  const target=Math.max(0,Math.min(time,Math.max(0,video.duration-0.01)));
  if(video.readyState>=2&&Math.abs(video.currentTime-target)<0.002){requestAnimationFrame(()=>resolve());return;}
  const done=()=>{cleanup();resolve();};const fail=()=>{cleanup();reject(new Error("Não foi possível ler um quadro do vídeo."));};
  const cleanup=()=>{video.removeEventListener("seeked",done);video.removeEventListener("error",fail);};
  video.addEventListener("seeked",done,{once:true});video.addEventListener("error",fail,{once:true});video.currentTime=target;
});}
function once(target,event,timeout=15000){return new Promise((resolve,reject)=>{let timer;const done=(value)=>{cleanup();resolve(value);};const fail=()=>{cleanup();reject(new Error(`Falha ao carregar mídia (${event}).`));};const cleanup=()=>{clearTimeout(timer);target.removeEventListener(event,done);target.removeEventListener("error",fail);};target.addEventListener(event,done,{once:true});target.addEventListener("error",fail,{once:true});timer=setTimeout(()=>{cleanup();reject(new Error("A operação de mídia demorou mais que o esperado."));},timeout);});}
function keepLocalUrl(url){resourceUrls.add(url);return url;}
function clearLocalResources(){resourceUrls.forEach((url)=>URL.revokeObjectURL(url));resourceUrls.clear();}
function clearLocalResultUrls(_target){/* URLs anteriores são liberadas ao trocar de tela. */}
function downloadLocalBlob(blob,filename){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.style.display="none";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function baseName(name){return String(name||"video").replace(/\.[^.]+$/,"").replace(/[\\/:*?"<>|]+/g,"-").replace(/\s+/g,"-").slice(0,90)||"video";}
function nextPaint(){return new Promise((resolve)=>requestAnimationFrame(resolve));}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (!value) return "Tamanho não informado";
  const units = ["B", "KB", "MB", "GB"];
  let size = value, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size >= 100 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function labeledField(label, id) {
  const root = document.createElement("label"); root.className = "video-field"; root.htmlFor = id;
  const title = el("span", "", label); const body = el("div", "video-field-control"); root.append(title, body); return { root, body };
}
function setStatus(node, message, state = "", percent = 0) {
  node.className = "video-status";
  if (state) node.classList.add(`is-${state}`);
  node.replaceChildren();
  if (message) node.append(el("span", "", message));
  if (state === "progress") {
    const track = el("span", "video-progress-track");
    const fill = el("span");
    fill.style.width = `${Math.max(2, Math.min(100, Number(percent) || 8))}%`;
    track.append(fill);
    node.append(track);
  }
}

async function recordVideoUsage(toolId) { try { await sendRuntimeMessage({ type: "RECORD_TOOL_USAGE", mode: "video", toolId }); } catch (_error) {} }
function sendRuntimeMessage(message) { return new Promise((resolve) => { try { chrome.runtime.sendMessage(message, (response) => { if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message }); else resolve(response || { ok: false, error: "Sem resposta da extensão." }); }); } catch (error) { resolve({ ok: false, error: friendlyError(error) }); } }); }
function friendlyError(error) { return String(error?.message || error || "Ocorreu um erro inesperado.").replace(/^Error:\s*/i, ""); }
function el(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text !== "") node.textContent = text; return node; }
function button(text, className = "") { const control = el("button", className, text); control.type = "button"; return control; }

// A ferramenta de Informações nunca envia arquivos e não depende de seleção contextual.
function buildVideoInfo(screen) {
  const drop = createVideoDrop("video/*,.mp4,.webm,.mkv,.mov,.m4v,.ogv,.avi", "Selecione um arquivo de vídeo", "Formatos aceitos dependem dos codecs que o navegador consegue ler", inspect);
  const summary=el("div","video-local-result");
  screen.body.append(drop.root,summary);
  async function inspect(file) {
    summary.replaceChildren();
    if(!file)return;
    setStatus(screen.status,"Lendo metadados locais…","progress",20);
    try {
      const type = await detectVideoContainer(file);
      let meta=null, mediaError=null;
      try{meta=await readLocalVideo(file);}catch(e){mediaError=friendlyError(e);}
      const card=el("article","video-local-output");
      const fields = [
        ["Arquivo",file.name],
        ["Tamanho",`${formatBytes(file.size)} (${file.size.toLocaleString("pt-BR")} bytes)`],
        ["Formato / contêiner detectado",type],
        ["Tipo MIME informado pelo sistema",file.type||"Não identificado"],
        ["Última modificação",new Date(file.lastModified).toLocaleString("pt-BR")],
        ["Duração",meta?formatDuration(meta.duration):"Não disponível"],
        ["Resolução",meta?`${meta.width} × ${meta.height} px`:"Não disponível"],
        ["Proporção",meta?`${(meta.width/meta.height).toFixed(3)}:1`:"Não disponível"],
        ["Taxa média total estimada",meta && Number.isFinite(meta.duration) && meta.duration > 0 ? `${(file.size*8/meta.duration/1e6).toFixed(2)} Mb/s (arquivo inteiro)` : "Não disponível"]
      ];
      const info=el("dl","video-info-grid");
      fields.forEach(([key,value])=>{info.append(el("dt","",key),el("dd","",value));});
      card.append(info);summary.append(card);
      const caveat=el("p","video-local-hint",meta?"A taxa média considera o arquivo inteiro e não representa o bitrate isolado dos codecs. O navegador não expõe aqui FPS e nomes precisos dos codecs.":`Não foi possível decodificar este vídeo: ${mediaError}. Os metadados básicos do arquivo continuam disponíveis.`);
      summary.append(caveat);
      if(meta){const preview=buildVideoFilePreview();preview.show(file,meta);summary.append(preview.root);}
      setStatus(screen.status,meta?"Metadados consultados localmente.":"Metadados básicos disponíveis; o navegador não decodificou o vídeo.",meta?"success":"error");
    }catch(e){setStatus(screen.status,friendlyError(e),"error");}
  }
}
async function detectVideoContainer(file){
  const data=new Uint8Array(await file.slice(0,32).arrayBuffer());
  if(data.length>=4&&data[0]===0x1a&&data[1]===0x45&&data[2]===0xdf&&data[3]===0xa3)return "Matroska/WebM (EBML)";
  if(data.length>=8&&String.fromCharCode(...data.slice(4,8))==="ftyp")return "MP4/MOV (ISO Base Media)";
  if(data.length>=4&&String.fromCharCode(...data.slice(0,4))==="OggS")return "OGG/OGV";
  if(data.length>=12&&String.fromCharCode(...data.slice(0,4))==="RIFF")return "AVI/RIFF (provável)";
  return file.name.split(".").at(-1)?.toUpperCase() || "Desconhecido";
}

}

import gifuct from "./vendor/gifuct.min.mjs";
import { GIFEncoder, quantize, applyPalette } from "./vendor/gifenc.esm.js";
import { IMAGE_TOOL_CATALOG } from "./panel-catalog.mjs";

export function initialize(document, window, bridge){

const { parseGIF, decompressFrames } = gifuct;
const container = document.getElementById("converterToolsContainer");
const imageCatalogPane = document.getElementById("imageCatalogPane");
const MAX_IMAGE_BYTES = 80 * 1024 * 1024;
const MAX_GIF_BYTES = 40 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 60_000_000;
const MAX_GIF_PIXELS = 120_000_000;
const MAX_GIF_FRAMES = 500;
const MAX_BUILD_GIF_FRAMES = 160;
const resourceUrls = new Set();
let screenToken = 0;

const BUILDERS = {
  "image-convert": buildImageConverter,
  "image-compress": buildImageCompressor,
  "image-gif-compress": buildGifCompressor,
  "image-gif-frames": buildGifFrames,
  "image-frames-gif": buildFramesToGif
};
const TOOLS = IMAGE_TOOL_CATALOG.map((tool) => ({ ...tool, build: BUILDERS[tool.id] })).filter((tool) => typeof tool.build === "function");

if (container) container.hidden = true;
document.addEventListener("caixota:open-direct-tool", (event) => {
  if (event.detail?.category !== "images") return;
  const tool = TOOLS.find((item) => item.id === event.detail.toolId);
  if (tool) openTool(tool);
});
document.addEventListener("caixota:show-direct-catalog", (event) => {
  if (event.detail?.category === "images") closeTool();
});
document.addEventListener("caixota:reset-direct-tools", (event) => {
  if (event.detail?.category === "images" || event.detail?.category === "all") closeTool();
});

function displayLabel(tool) {
  return bridge?.getToolLabel?.("images", tool.id, tool.label) || tool.label;
}

function closeTool() {
  screenToken += 1;
  clearResources();
  if (container) { container.replaceChildren(); container.hidden = true; }
  if (imageCatalogPane) imageCatalogPane.hidden = false;
}

function openTool(tool) {
  screenToken += 1;
  clearResources();
  if (!container) return;
  if (imageCatalogPane) imageCatalogPane.hidden = true;
  container.hidden = false;
  container.replaceChildren();
  const shell = node("section", "converter-tool-screen");
  shell.dataset.converterScreen = tool.id;
  const top = node("div", "converter-screen-top");
  const back = button("← Voltar para Imagens", "ghost-button converter-back-button");
  back.addEventListener("click", closeTool);
  const heading = node("div", "converter-screen-heading");
  const eyebrow = node("span", "eyebrow");
  eyebrow.textContent = `${tool.group} · Imagens`;
  const title = document.createElement("h2");
  title.textContent = displayLabel(tool);
  const description = document.createElement("p");
  description.textContent = tool.description;
  heading.append(eyebrow, title, description);
  top.append(back, heading);
  const privacy = node("div", "converter-privacy-note");
  privacy.innerHTML = '<span aria-hidden="true">✓</span><div><strong>Processado no seu navegador</strong><small>O arquivo não sai deste dispositivo. Nada é enviado ou coletado.</small></div>';
  const body = node("div", "converter-screen-body");
  const status = node("div", "converter-status");
  status.setAttribute("role", "status");
  const result = node("div", "converter-result-area");
  shell.append(top, privacy, body, status, result);
  container.appendChild(shell);
  tool.build({ tool, shell, body, status, result, token: screenToken });
  back.focus({ preventScroll: true });
}

function buildImageConverter(screen) {
  let source = null;
  let sourceFile = null;
  let previewUrl = "";
  const drop = createDrop({ accept: "image/png,image/jpeg,image/webp,image/avif,image/bmp,.png,.jpg,.jpeg,.webp,.avif,.bmp", label: "Arraste uma imagem", hint: "PNG, JPG, WebP, AVIF ou BMP", onFiles: (files) => loadFile(files[0]) });
  const previewCard = node("div", "converter-image-preview");
  previewCard.hidden = true;
  const preview = document.createElement("img");
  preview.alt = "Prévia da imagem selecionada";
  const info = node("div", "converter-file-info");
  previewCard.append(preview, info);
  const format = selectField("Formato de saída", [["png", "PNG"], ["jpeg", "JPG / JPEG"], ["webp", "WebP"], ["avif", "AVIF (se disponível)"], ["bmp", "BMP"]]);
  const quality = rangeField("Qualidade", 0.85, 0.35, 1, 0.01, (value) => `${Math.round(value * 100)}%`);
  const updateQuality = () => { quality.field.hidden = !["jpeg", "webp", "avif"].includes(format.input.value); };
  format.input.addEventListener("change", updateQuality);
  updateQuality();
  const form = node("div", "converter-form-grid");
  form.append(format.field, quality.field);
  form.hidden = true;
  const convert = button("Converter", "primary-button");
  convert.disabled = true;
  const actions = node("div", "converter-actions");
  actions.appendChild(convert);
  actions.hidden = true;
  screen.body.append(drop.root, previewCard, form, actions);

  async function loadFile(file) {
    if (!file) return;
    source = null;
    sourceFile = null;
    convert.disabled = true;
    screen.result.replaceChildren();
    setStatus(screen.status, "Carregando imagem…", "progress", 12);
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new Error("A imagem precisa ter no máximo 80 MB.");
      const detected = await detectImageFormat(file);
      if (detected === "gif") throw new Error("Para animações GIF, use a ferramenta Extrair Frames do GIF.");
      if (!["png", "jpeg", "webp", "avif", "bmp"].includes(detected)) throw new Error("Formato não reconhecido. Use PNG, JPG, WebP, AVIF ou BMP.");
      const canvas = await decodeImageToCanvas(file);
      if (canvas.width * canvas.height > MAX_IMAGE_PIXELS) throw new Error("A imagem ultrapassa o limite seguro de 60 milhões de pixels.");
      source = canvas;
      sourceFile = { file, detected };
      if (previewUrl) releaseUrl(previewUrl);
      previewUrl = keepUrl(URL.createObjectURL(file));
      preview.src = previewUrl;
      info.replaceChildren();
      const name = document.createElement("strong");
      name.textContent = file.name;
      const details = document.createElement("span");
      details.textContent = `${detected.toUpperCase()} · ${canvas.width} × ${canvas.height} · ${formatBytes(file.size)}`;
      info.append(name, details);
      previewCard.hidden = false;
      form.hidden = false;
      actions.hidden = false;
      convert.disabled = false;
      setStatus(screen.status, "Imagem pronta. A conversão acontecerá localmente.", "success");
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
    }
  }

  convert.addEventListener("click", async () => {
    if (!source || !sourceFile || convert.disabled) return;
    const idle = convert.textContent;
    convert.disabled = true;
    convert.textContent = "Convertendo…";
    screen.result.replaceChildren();
    setStatus(screen.status, "Convertendo a imagem localmente…", "progress", 36);
    try {
      await nextFrame();
      const output = await encodeCanvas(source, format.input.value, Number(quality.input.value));
      const extension = format.input.value === "jpeg" ? "jpg" : format.input.value;
      const outputName = `${baseName(sourceFile.file.name)}-convertida.${extension}`;
      renderConvertedImage(screen.result, output, outputName, sourceFile.file.size);
      setStatus(screen.status, "Conversão concluída. O arquivo está pronto para baixar.", "success", 100);
      recordUsage(screen.tool.id);
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
    } finally {
      convert.disabled = false;
      convert.textContent = idle;
    }
  });
}

async function detectImageFormat(file) {
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const ascii = String.fromCharCode(...bytes);
  if (bytes[0] === 0x89 && ascii.slice(1, 4) === "PNG") return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (ascii.slice(0, 4) === "RIFF" && ascii.slice(8, 12) === "WEBP") return "webp";
  if (ascii.slice(0, 2) === "BM") return "bmp";
  if (ascii.slice(0, 6) === "GIF87a" || ascii.slice(0, 6) === "GIF89a") return "gif";
  if (ascii.slice(4, 8) === "ftyp" && /avif|avis/.test(ascii.slice(8, 24))) return "avif";
  const mime = String(file.type || "").toLowerCase();
  if (mime === "image/jpg" || mime === "image/jpeg") return "jpeg";
  return mime.replace(/^image\//, "");
}

async function decodeImageToCanvas(file) {
  let drawable;
  let revoke = "";
  try {
    if (typeof createImageBitmap === "function") drawable = await createImageBitmap(file);
  } catch (_error) {}
  if (!drawable) {
    revoke = URL.createObjectURL(file);
    drawable = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("O navegador não conseguiu decodificar esta imagem."));
      image.src = revoke;
    });
  }
  try {
    const width = drawable.width || drawable.naturalWidth;
    const height = drawable.height || drawable.naturalHeight;
    if (!width || !height) throw new Error("A imagem não possui dimensões válidas.");
    if (width * height > MAX_IMAGE_PIXELS) throw new Error("A imagem ultrapassa o limite seguro de 60 milhões de pixels.");
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Canvas indisponível neste navegador.");
    context.drawImage(drawable, 0, 0);
    return canvas;
  } finally {
    drawable?.close?.();
    if (revoke) URL.revokeObjectURL(revoke);
  }
}

async function encodeCanvas(source, format, quality) {
  if (format === "bmp") return encodeBmp(source);
  const mime = ({ png: "image/png", jpeg: "image/jpeg", webp: "image/webp", avif: "image/avif" })[format];
  if (!mime) throw new Error("Formato de saída inválido.");
  const canvas = format === "jpeg" ? flattenCanvas(source) : source;
  const blob = await canvasToBlob(canvas, mime, quality);
  if (blob.type !== mime) {
    if (format === "avif") throw new Error("Este navegador não oferece codificação AVIF. Escolha PNG, JPG, WebP ou BMP.");
    throw new Error(`O navegador não conseguiu gerar ${format.toUpperCase()}.`);
  }
  return blob;
}

function flattenCanvas(source) {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(source, 0, 0);
  return canvas;
}

function encodeBmp(source) {
  const canvas = flattenCanvas(source);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const rowSize = Math.ceil(canvas.width * 3 / 4) * 4;
  const pixelBytes = rowSize * canvas.height;
  const buffer = new ArrayBuffer(54 + pixelBytes);
  const view = new DataView(buffer);
  view.setUint8(0, 0x42); view.setUint8(1, 0x4d);
  view.setUint32(2, buffer.byteLength, true);
  view.setUint32(10, 54, true);
  view.setUint32(14, 40, true);
  view.setInt32(18, canvas.width, true);
  view.setInt32(22, canvas.height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(34, pixelBytes, true);
  for (let y = 0; y < canvas.height; y += 1) {
    const sourceY = canvas.height - 1 - y;
    for (let x = 0; x < canvas.width; x += 1) {
      const input = (sourceY * canvas.width + x) * 4;
      const output = 54 + y * rowSize + x * 3;
      view.setUint8(output, data[input + 2]);
      view.setUint8(output + 1, data[input + 1]);
      view.setUint8(output + 2, data[input]);
    }
  }
  return new Blob([buffer], { type: "image/bmp" });
}

function renderConvertedImage(target, blob, filename, originalSize) {
  target.replaceChildren();
  const card = node("section", "converter-result-card");
  const image = document.createElement("img");
  image.alt = "Prévia da imagem convertida";
  image.src = keepUrl(URL.createObjectURL(blob));
  const copy = node("div", "converter-result-copy");
  const title = document.createElement("strong");
  title.textContent = filename;
  const details = document.createElement("small");
  const delta = originalSize ? Math.round((blob.size - originalSize) / originalSize * 100) : 0;
  details.textContent = `${formatBytes(blob.size)}${delta ? ` · ${delta > 0 ? "+" : ""}${delta}% em relação ao original` : ""}`;
  copy.append(title, details);
  const download = button("Baixar", "primary-button");
  download.addEventListener("click", () => downloadBlob(blob, filename));
  card.append(image, copy, download);
  target.appendChild(card);
}


function buildImageCompressor(screen) {
  let source = null;
  let sourceFile = null;
  const drop = createDrop({ accept: "image/png,image/jpeg,image/webp,image/avif,image/bmp,.png,.jpg,.jpeg,.webp,.avif,.bmp", label: "Arraste uma imagem para comprimir", hint: "PNG, JPG, WebP, AVIF ou BMP · processamento 100% local", onFiles: (files) => loadFile(files[0]) });
  const previewCard = node("div", "converter-image-preview");
  previewCard.hidden = true;
  const preview = document.createElement("img"); preview.alt = "Prévia da imagem selecionada";
  const info = node("div", "converter-file-info"); previewCard.append(preview, info);
  const format = selectField("Formato de saída", [["webp", "WebP · recomendado"], ["jpeg", "JPG / JPEG"], ["png", "PNG · sem perda"]]);
  const quality = rangeField("Qualidade", 0.78, 0.25, 1, 0.01, (value) => `${Math.round(value * 100)}%`);
  const maxDimension = selectField("Dimensão máxima", [["source", "Original"], ["2560", "Até 2560 px"], ["1920", "Até 1920 px"], ["1280", "Até 1280 px"], ["960", "Até 960 px"], ["720", "Até 720 px"]]);
  const form = node("div", "converter-form-grid"); form.append(format.field, quality.field, maxDimension.field); form.hidden = true;
  const estimate = node("div", "converter-builder-note"); estimate.hidden = true;
  const compress = button("Comprimir imagem", "primary-button"); compress.disabled = true;
  const actions = node("div", "converter-actions"); actions.append(compress); actions.hidden = true;
  screen.body.append(drop.root, previewCard, form, estimate, actions);
  format.input.addEventListener("change", () => { quality.field.hidden = format.input.value === "png"; });

  async function loadFile(file) {
    if (!file) return;
    source = null; sourceFile = null; compress.disabled = true; screen.result.replaceChildren();
    setStatus(screen.status, "Lendo a imagem…", "progress", 10);
    try {
      if (file.size > MAX_IMAGE_BYTES) throw new Error("A imagem precisa ter no máximo 80 MB.");
      const detected = await detectImageFormat(file);
      if (detected === "gif") throw new Error("Para animações, use a ferramenta Comprimir GIF.");
      if (!["png", "jpeg", "webp", "avif", "bmp"].includes(detected)) throw new Error("Formato de imagem não reconhecido.");
      source = await decodeImageToCanvas(file); sourceFile = { file, detected };
      if (preview.src) releaseUrl(preview.src); preview.src = keepUrl(URL.createObjectURL(file));
      const title = document.createElement("strong"); title.textContent = file.name;
      const details = document.createElement("span"); details.textContent = `${source.width} × ${source.height} · ${formatBytes(file.size)} · ${detected.toUpperCase()}`;
      info.replaceChildren(title, details); previewCard.hidden = false; form.hidden = false; estimate.hidden = false; actions.hidden = false; compress.disabled = false;
      estimate.textContent = "Dica: WebP em 70–85% costuma reduzir bastante fotos e screenshots. Reduzir a resolução economiza ainda mais.";
      setStatus(screen.status, "Imagem pronta para compressão.", "success", 100); recordUsage(screen.tool.id);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  }

  compress.addEventListener("click", async () => {
    if (!source || !sourceFile) return;
    const idle = compress.textContent; compress.disabled = true; compress.textContent = "Comprimindo…"; screen.result.replaceChildren();
    try {
      setStatus(screen.status, "Redimensionando e codificando localmente…", "progress", 35);
      const max = maxDimension.input.value === "source" ? Math.max(source.width, source.height) : Number(maxDimension.input.value);
      const scale = Math.min(1, max / Math.max(source.width, source.height));
      const width = Math.max(1, Math.round(source.width * scale)); const height = Math.max(1, Math.round(source.height * scale));
      const work = document.createElement("canvas"); work.width = width; work.height = height;
      const ctx = work.getContext("2d", { alpha: format.input.value !== "jpeg" }); if (!ctx) throw new Error("Canvas indisponível.");
      if (format.input.value === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, width, height); }
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; ctx.drawImage(source, 0, 0, width, height);
      const blob = await encodeCanvas(work, format.input.value, Number(quality.input.value));
      const ext = format.input.value === "jpeg" ? "jpg" : format.input.value;
      const filename = `${baseName(sourceFile.file.name)}-comprimida.${ext}`;
      const card = node("section", "converter-result-card");
      const image = document.createElement("img"); image.alt = "Prévia da imagem comprimida"; image.src = keepUrl(URL.createObjectURL(blob));
      const copy = node("div", "converter-result-copy"); const title = document.createElement("strong"); title.textContent = filename;
      const saving = sourceFile.file.size > 0 ? Math.round((1 - blob.size / sourceFile.file.size) * 100) : 0;
      const details = document.createElement("small"); details.textContent = `${width} × ${height} · ${formatBytes(sourceFile.file.size)} → ${formatBytes(blob.size)}${saving > 0 ? ` · ${saving}% menor` : ""}`;
      copy.append(title, details); const download = button("Baixar imagem", "primary-button"); download.addEventListener("click", () => downloadBlob(blob, filename)); card.append(image, copy, download); screen.result.append(card);
      setStatus(screen.status, saving > 0 ? `Compressão concluída: ${saving}% menor.` : "Compressão concluída, mas este arquivo já estava bem otimizado.", saving > 0 ? "success" : "warning", 100);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
    finally { compress.disabled = false; compress.textContent = idle; }
  });
}

function buildGifCompressor(screen) {
  let file = null;
  let frames = [];
  let width = 0;
  let height = 0;
  const drop = createDrop({ accept: "image/gif,.gif", label: "Arraste um GIF animado", hint: "Reduza resolução, FPS e cores sem enviar o arquivo", onFiles: (files) => loadGif(files[0]) });
  const summary = node("div", "converter-gif-summary"); summary.hidden = true;
  const preview = document.createElement("img"); preview.alt = "Prévia do GIF selecionado";
  const summaryCopy = node("div", "converter-file-info"); summary.append(preview, summaryCopy);
  const scale = selectField("Resolução", [["1", "100% · original"], ["0.8", "80%"], ["0.65", "65%"], ["0.5", "50%"], ["0.35", "35%"]]);
  const frameStep = selectField("Frames", [["1", "Todos os frames"], ["2", "1 a cada 2 · ~50% FPS"], ["3", "1 a cada 3 · ~33% FPS"], ["4", "1 a cada 4 · ~25% FPS"]]);
  const colors = selectField("Cores", [["256", "256 cores"], ["128", "128 cores"], ["64", "64 cores"], ["32", "32 cores"]]); colors.input.value = "128";
  const form = node("div", "converter-form-grid"); form.append(scale.field, frameStep.field, colors.field); form.hidden = true;
  const compress = button("Comprimir GIF", "primary-button"); compress.disabled = true;
  const actions = node("div", "converter-actions"); actions.append(compress); actions.hidden = true;
  screen.body.append(drop.root, summary, form, actions);

  async function loadGif(nextFile) {
    if (!nextFile) return;
    file = null; frames = []; summary.hidden = true; form.hidden = true; actions.hidden = true; screen.result.replaceChildren();
    setStatus(screen.status, "Lendo e compondo os frames do GIF…", "progress", 8);
    try {
      if (nextFile.size > MAX_GIF_BYTES) throw new Error("O GIF precisa ter no máximo 40 MB.");
      if (await detectImageFormat(nextFile) !== "gif") throw new Error("Selecione um GIF válido.");
      const parsed = parseGIF(await nextFile.arrayBuffer()); const decoded = decompressFrames(parsed, true);
      if (!decoded.length || decoded.length > MAX_GIF_FRAMES) throw new Error(`O GIF precisa ter entre 1 e ${MAX_GIF_FRAMES} frames.`);
      width = Number(parsed?.lsd?.width) || Math.max(...decoded.map((f) => f.dims.left + f.dims.width));
      height = Number(parsed?.lsd?.height) || Math.max(...decoded.map((f) => f.dims.top + f.dims.height));
      if (width * height * decoded.length > MAX_GIF_PIXELS) throw new Error("Este GIF é grande demais para ser processado com segurança.");
      frames = await composeGifFrames(decoded, width, height, screen, (done) => setStatus(screen.status, `Preparando frame ${done} de ${decoded.length}…`, "progress", 12 + done / decoded.length * 58));
      file = nextFile; if (preview.src) releaseUrl(preview.src); preview.src = keepUrl(URL.createObjectURL(nextFile));
      const title = document.createElement("strong"); title.textContent = nextFile.name;
      const duration = frames.reduce((sum, frame) => sum + Number(frame.delay || 100), 0) / 1000;
      const details = document.createElement("span"); details.textContent = `${frames.length} frames · ${width} × ${height} · ${duration.toFixed(2)} s · ${formatBytes(nextFile.size)}`;
      summaryCopy.replaceChildren(title, details); summary.hidden = false; form.hidden = false; actions.hidden = false; compress.disabled = false;
      setStatus(screen.status, "GIF pronto para compressão.", "success", 100); recordUsage(screen.tool.id);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
  }

  compress.addEventListener("click", async () => {
    if (!file || !frames.length) return;
    const idle = compress.textContent; compress.disabled = true; compress.textContent = "Comprimindo…"; screen.result.replaceChildren();
    try {
      const factor = Number(scale.input.value) || 1; const step = Math.max(1, Number(frameStep.input.value) || 1); const colorCount = Number(colors.input.value) || 128;
      let outWidth = Math.max(2, Math.round(width * factor)); let outHeight = Math.max(2, Math.round(height * factor));
      const canvas = document.createElement("canvas"); canvas.width = outWidth; canvas.height = outHeight; const ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true }); if (!ctx) throw new Error("Canvas indisponível.");
      const encoder = GIFEncoder(); const indexes = []; for (let i = 0; i < frames.length; i += step) indexes.push(i);
      for (let pos = 0; pos < indexes.length; pos += 1) {
        if (screen.token !== screenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
        const index = indexes[pos]; const end = Math.min(frames.length, index + step); let delay = 0; for (let j = index; j < end; j += 1) delay += Math.max(10, Number(frames[j].delay || 100));
        const bitmap = await createImageBitmap(frames[index].blob); ctx.clearRect(0, 0, outWidth, outHeight); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"; ctx.drawImage(bitmap, 0, 0, outWidth, outHeight); bitmap.close?.();
        const rgba = ctx.getImageData(0, 0, outWidth, outHeight).data; const palette = quantize(rgba, colorCount, { format: "rgb444" }); const indexed = applyPalette(rgba, palette, "rgb444");
        encoder.writeFrame(indexed, outWidth, outHeight, { palette, delay, repeat: pos === 0 ? 0 : undefined });
        setStatus(screen.status, `Codificando frame ${pos + 1} de ${indexes.length}…`, "progress", 8 + (pos + 1) / indexes.length * 86); if (pos % 2 === 0) await nextFrame();
      }
      encoder.finish(); const blob = new Blob([encoder.bytes()], { type: "image/gif" }); const filename = `${baseName(file.name)}-comprimido.gif`;
      const card = node("section", "converter-result-card"); const outPreview = document.createElement("img"); outPreview.alt = "Prévia do GIF comprimido"; outPreview.src = keepUrl(URL.createObjectURL(blob));
      const copy = node("div", "converter-result-copy"); const title = document.createElement("strong"); title.textContent = filename; const saving = Math.round((1 - blob.size / file.size) * 100); const details = document.createElement("small"); details.textContent = `${indexes.length} frames · ${outWidth} × ${outHeight} · ${formatBytes(file.size)} → ${formatBytes(blob.size)}${saving > 0 ? ` · ${saving}% menor` : ""}`; copy.append(title, details);
      const download = button("Baixar GIF", "primary-button"); download.addEventListener("click", () => downloadBlob(blob, filename)); card.append(outPreview, copy, download); screen.result.append(card);
      setStatus(screen.status, saving > 0 ? `GIF comprimido: ${saving}% menor.` : "GIF reprocessado, mas o arquivo original já estava muito otimizado.", saving > 0 ? "success" : "warning", 100);
    } catch (error) { setStatus(screen.status, friendlyError(error), "error"); }
    finally { compress.disabled = false; compress.textContent = idle; }
  });
}

function buildFramesToGif(screen) {
  let frames = [];
  let draggingId = "";
  const drop = createDrop({
    accept: "image/png,image/jpeg,image/webp,image/avif,image/bmp,.png,.jpg,.jpeg,.webp,.avif,.bmp",
    multiple: true,
    label: "Adicione os frames do GIF",
    hint: `PNG, JPG, WebP, AVIF ou BMP · até ${MAX_BUILD_GIF_FRAMES} frames`,
    onFiles: loadFiles
  });
  const list = node("div", "converter-gif-builder-list");
  list.hidden = true;
  const loop = selectField("Repetição", [["0", "Repetir continuamente"], ["-1", "Tocar uma vez"]]);
  const colors = selectField("Cores", [["256", "256 cores"], ["128", "128 cores"], ["64", "64 cores"]]);
  const options = node("div", "converter-form-grid converter-gif-options");
  options.append(loop.field, colors.field);
  options.hidden = true;
  const create = button("Criar GIF", "primary-button");
  create.disabled = true;
  const actions = node("div", "converter-actions");
  actions.appendChild(create);
  actions.hidden = true;
  const note = node("div", "converter-builder-note");
  note.textContent = "Arraste os frames para mudar a ordem. O tamanho do primeiro frame será usado como tela do GIF.";
  note.hidden = true;
  screen.body.append(drop.root, note, list, options, actions);

  async function loadFiles(nextFiles) {
    const files = [...nextFiles].filter(Boolean);
    if (!files.length) return;
    if (frames.length + files.length > MAX_BUILD_GIF_FRAMES) {
      setStatus(screen.status, `O limite seguro é ${MAX_BUILD_GIF_FRAMES} frames por GIF.`, "error");
      return;
    }
    const totalBytes = frames.reduce((sum, frame) => sum + frame.file.size, 0) + files.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_IMAGE_BYTES) {
      setStatus(screen.status, "O conjunto de imagens precisa ter no máximo 80 MB.", "error");
      return;
    }
    const startToken = screen.token;
    setStatus(screen.status, `Carregando ${files.length} ${files.length === 1 ? "imagem" : "imagens"}…`, "progress", 8);
    try {
      for (let index = 0; index < files.length; index += 1) {
        if (startToken !== screenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
        const file = files[index];
        const detected = await detectImageFormat(file);
        if (!["png", "jpeg", "webp", "avif", "bmp"].includes(detected)) throw new Error(`“${file.name}” não é uma imagem compatível.`);
        const canvas = await decodeImageToCanvas(file);
        frames.push({
          id: `frame-${Date.now().toString(36)}-${index}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          canvas,
          duration: 100,
          url: keepUrl(URL.createObjectURL(file))
        });
        setStatus(screen.status, `Carregando frame ${index + 1} de ${files.length}…`, "progress", 8 + (index + 1) / files.length * 72);
        await nextFrame();
      }
      validateGifBuildSize();
      renderBuilder();
      setStatus(screen.status, `${frames.length} ${frames.length === 1 ? "frame pronto" : "frames prontos"}. Ajuste a ordem e o tempo de cada um.`, "success", 100);
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
      renderBuilder();
    }
  }

  function validateGifBuildSize() {
    if (!frames.length) return;
    const width = frames[0].canvas.width;
    const height = frames[0].canvas.height;
    if (width * height * frames.length > MAX_GIF_PIXELS) {
      throw new Error("O GIF ultrapassa o limite seguro de pixels. Use imagens menores ou menos frames.");
    }
  }

  function renderBuilder() {
    list.replaceChildren();
    frames.forEach((frame, index) => {
      const row = node("article", "converter-gif-builder-row");
      row.draggable = true;
      row.dataset.frameId = frame.id;
      const handle = node("span", "converter-drag-handle");
      handle.textContent = "⋮⋮";
      handle.title = "Arraste para reordenar";
      const image = document.createElement("img");
      image.src = frame.url;
      image.alt = `Prévia do frame ${index + 1}`;
      const copy = node("div", "converter-gif-frame-copy");
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${frame.file.name}`;
      const details = document.createElement("small");
      details.textContent = `${frame.canvas.width} × ${frame.canvas.height} · ${formatBytes(frame.file.size)}`;
      copy.append(title, details);
      const durationField = node("label", "converter-duration-field");
      const durationLabel = document.createElement("span");
      durationLabel.textContent = "Tempo (ms)";
      const duration = document.createElement("input");
      duration.type = "number";
      duration.min = "20";
      duration.max = "10000";
      duration.step = "10";
      duration.value = String(frame.duration);
      duration.addEventListener("input", () => {
        if (duration.value !== "") frame.duration = Math.round(Math.max(20, Math.min(10000, Number(duration.value) || 100)));
      });
      duration.addEventListener("change", () => {
        frame.duration = Math.round(Math.max(20, Math.min(10000, Number(duration.value) || 100)));
        duration.value = String(frame.duration);
      });
      durationField.append(durationLabel, duration);
      const rowActions = node("div", "converter-frame-row-actions");
      const up = button("↑", "ghost-button");
      up.title = "Mover para cima";
      up.disabled = index === 0;
      up.addEventListener("click", () => moveFrame(index, index - 1));
      const down = button("↓", "ghost-button");
      down.title = "Mover para baixo";
      down.disabled = index === frames.length - 1;
      down.addEventListener("click", () => moveFrame(index, index + 1));
      const remove = button("Remover", "ghost-button converter-frame-remove");
      remove.addEventListener("click", () => {
        const [removed] = frames.splice(index, 1);
        releaseUrl(removed?.url);
        renderBuilder();
      });
      rowActions.append(up, down, remove);
      row.append(handle, image, copy, durationField, rowActions);
      row.addEventListener("dragstart", (event) => {
        draggingId = frame.id;
        row.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", frame.id);
      });
      row.addEventListener("dragend", () => { draggingId = ""; row.classList.remove("is-dragging"); });
      row.addEventListener("dragover", (event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; });
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        const sourceId = draggingId || event.dataTransfer.getData("text/plain");
        const sourceIndex = frames.findIndex((item) => item.id === sourceId);
        const targetIndex = frames.findIndex((item) => item.id === frame.id);
        moveFrame(sourceIndex, targetIndex);
      });
      list.appendChild(row);
    });
    const visible = frames.length > 0;
    list.hidden = !visible;
    note.hidden = !visible;
    options.hidden = !visible;
    actions.hidden = !visible;
    create.disabled = frames.length < 2;
    if (frames.length === 1) setStatus(screen.status, "Adicione pelo menos dois frames para criar o GIF.", "");
  }

  function moveFrame(from, to) {
    if (from < 0 || to < 0 || from === to || from >= frames.length || to >= frames.length) return;
    const [frame] = frames.splice(from, 1);
    frames.splice(to, 0, frame);
    renderBuilder();
  }

  create.addEventListener("click", async () => {
    if (frames.length < 2 || create.disabled) return;
    const idle = create.textContent;
    create.disabled = true;
    create.textContent = "Criando GIF…";
    screen.result.replaceChildren();
    try {
      validateGifBuildSize();
      const width = frames[0].canvas.width;
      const height = frames[0].canvas.height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!context) throw new Error("Canvas indisponível neste navegador.");
      const encoder = GIFEncoder();
      const colorCount = Number(colors.input.value) || 256;
      for (let index = 0; index < frames.length; index += 1) {
        if (screen.token !== screenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
        const frame = frames[index];
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        const scale = Math.min(width / frame.canvas.width, height / frame.canvas.height);
        const drawWidth = Math.max(1, Math.round(frame.canvas.width * scale));
        const drawHeight = Math.max(1, Math.round(frame.canvas.height * scale));
        context.drawImage(frame.canvas, Math.round((width - drawWidth) / 2), Math.round((height - drawHeight) / 2), drawWidth, drawHeight);
        const rgba = context.getImageData(0, 0, width, height).data;
        const palette = quantize(rgba, colorCount, { format: "rgb444" });
        const indexed = applyPalette(rgba, palette, "rgb444");
        encoder.writeFrame(indexed, width, height, {
          palette,
          delay: frame.duration,
          repeat: index === 0 ? Number(loop.input.value) : undefined
        });
        setStatus(screen.status, `Codificando frame ${index + 1} de ${frames.length}…`, "progress", 5 + (index + 1) / frames.length * 88);
        await nextFrame();
      }
      encoder.finish();
      const blob = new Blob([encoder.bytes()], { type: "image/gif" });
      const filename = `${baseName(frames[0].file.name)}-animado.gif`;
      const card = node("section", "converter-result-card");
      const preview = document.createElement("img");
      preview.alt = "Prévia do GIF criado";
      preview.src = keepUrl(URL.createObjectURL(blob));
      const copy = node("div", "converter-result-copy");
      const title = document.createElement("strong");
      title.textContent = filename;
      const details = document.createElement("small");
      const duration = frames.reduce((sum, frame) => sum + frame.duration, 0) / 1000;
      details.textContent = `${frames.length} frames · ${width} × ${height} · ${duration.toFixed(2)} s · ${formatBytes(blob.size)}`;
      copy.append(title, details);
      const download = button("Baixar GIF", "primary-button");
      download.addEventListener("click", () => downloadBlob(blob, filename));
      card.append(preview, copy, download);
      screen.result.appendChild(card);
      setStatus(screen.status, "GIF criado localmente e pronto para baixar.", "success", 100);
      recordUsage(screen.tool.id);
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
    } finally {
      create.disabled = frames.length < 2;
      create.textContent = idle;
    }
  });
}

function buildGifFrames(screen) {
  let frames = [];
  let file = null;
  const selected = new Set();
  const drop = createDrop({ accept: "image/gif,.gif", label: "Arraste um GIF animado", hint: "A extração acontece inteiramente no navegador", onFiles: (files) => extract(files[0]) });
  const summary = node("div", "converter-gif-summary");
  summary.hidden = true;
  const preview = document.createElement("img");
  preview.alt = "Prévia do GIF selecionado";
  const summaryCopy = node("div", "converter-file-info");
  summary.append(preview, summaryCopy);
  const toolbar = node("div", "converter-frame-toolbar");
  toolbar.hidden = true;
  const toggleAll = button("Desmarcar todos", "ghost-button");
  const selectionCount = document.createElement("span");
  const format = selectField("Formato", [["png", "PNG"], ["jpeg", "JPG"]]);
  const quality = rangeField("Qualidade do JPG", 0.9, 0.5, 1, 0.05, (value) => `${Math.round(value * 100)}%`);
  quality.field.hidden = true;
  format.input.addEventListener("change", () => { quality.field.hidden = format.input.value !== "jpeg"; });
  toolbar.append(toggleAll, selectionCount, format.field, quality.field);
  const grid = node("div", "converter-frame-grid");
  grid.hidden = true;
  const exportButton = button("Exportar selecionados", "primary-button");
  exportButton.disabled = true;
  const actions = node("div", "converter-actions");
  actions.appendChild(exportButton);
  actions.hidden = true;
  screen.body.append(drop.root, summary, toolbar, grid, actions);

  toggleAll.addEventListener("click", () => {
    if (selected.size === frames.length) selected.clear();
    else frames.forEach((_frame, index) => selected.add(index));
    renderFrames();
  });

  async function extract(nextFile) {
    if (!nextFile) return;
    frames = [];
    selected.clear();
    file = null;
    summary.hidden = true;
    toolbar.hidden = true;
    grid.hidden = true;
    actions.hidden = true;
    screen.result.replaceChildren();
    setStatus(screen.status, "Lendo a animação localmente…", "progress", 8);
    try {
      if (nextFile.size > MAX_GIF_BYTES) throw new Error("O GIF precisa ter no máximo 40 MB.");
      if (await detectImageFormat(nextFile) !== "gif") throw new Error("Selecione um arquivo GIF válido.");
      const buffer = await nextFile.arrayBuffer();
      await nextFrame();
      setStatus(screen.status, "Descompactando os frames…", "progress", 20);
      const parsed = parseGIF(buffer);
      const parsedFrameCount = Array.isArray(parsed?.frames) ? parsed.frames.filter((frame) => frame?.image).length : 0;
      const logicalWidth = Number(parsed?.lsd?.width) || 0;
      const logicalHeight = Number(parsed?.lsd?.height) || 0;
      if (parsedFrameCount > MAX_GIF_FRAMES) throw new Error(`Este GIF possui ${parsedFrameCount} frames; o limite seguro é ${MAX_GIF_FRAMES}.`);
      if (parsedFrameCount && logicalWidth && logicalHeight && logicalWidth * logicalHeight * parsedFrameCount > MAX_GIF_PIXELS) {
        throw new Error("A animação é grande demais para extrair com segurança. Reduza as dimensões ou a quantidade de frames.");
      }
      const decoded = decompressFrames(parsed, true);
      if (!decoded.length) throw new Error("Nenhum frame de imagem foi encontrado neste GIF.");
      if (decoded.length > MAX_GIF_FRAMES) throw new Error(`Este GIF possui ${decoded.length} frames; o limite seguro é ${MAX_GIF_FRAMES}.`);
      const width = logicalWidth || Math.max(...decoded.map((frame) => frame.dims.left + frame.dims.width));
      const height = logicalHeight || Math.max(...decoded.map((frame) => frame.dims.top + frame.dims.height));
      if (width * height * decoded.length > MAX_GIF_PIXELS) throw new Error("A animação é grande demais para extrair com segurança. Reduza as dimensões ou a quantidade de frames.");
      frames = await composeGifFrames(decoded, width, height, screen, (done) => setStatus(screen.status, `Extraindo frames ${done} de ${decoded.length}…`, "progress", 25 + done / decoded.length * 65));
      file = nextFile;
      frames.forEach((_frame, index) => selected.add(index));
      const gifUrl = keepUrl(URL.createObjectURL(nextFile));
      preview.src = gifUrl;
      const title = document.createElement("strong");
      title.textContent = nextFile.name;
      const duration = frames.reduce((sum, frame) => sum + Number(frame.delay || 0), 0) / 1000;
      const details = document.createElement("span");
      details.textContent = `${frames.length} frames · ${width} × ${height} · ${duration.toFixed(2)} s · ${formatBytes(nextFile.size)}`;
      summaryCopy.replaceChildren(title, details);
      summary.hidden = false;
      toolbar.hidden = false;
      grid.hidden = false;
      actions.hidden = false;
      renderFrames();
      setStatus(screen.status, `${frames.length} frames extraídos localmente.`, "success", 100);
      recordUsage(screen.tool.id);
    } catch (error) {
      frames = [];
      setStatus(screen.status, friendlyError(error), "error");
    }
  }

  function renderFrames() {
    grid.replaceChildren();
    frames.forEach((frame, index) => {
      const label = node("label", "converter-frame-card");
      label.classList.toggle("is-selected", selected.has(index));
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = selected.has(index);
      input.addEventListener("change", () => {
        if (input.checked) selected.add(index); else selected.delete(index);
        renderFrames();
      });
      const image = document.createElement("img");
      image.src = frame.url;
      image.alt = `Frame ${index + 1}`;
      const meta = document.createElement("span");
      meta.textContent = `Frame ${index + 1} · ${Math.max(10, frame.delay || 100)} ms`;
      label.append(input, image, meta);
      grid.appendChild(label);
    });
    selectionCount.textContent = `${selected.size} de ${frames.length} selecionados`;
    toggleAll.textContent = selected.size === frames.length ? "Desmarcar todos" : "Selecionar todos";
    exportButton.disabled = !selected.size;
  }

  exportButton.addEventListener("click", async () => {
    if (!selected.size || !file) return;
    const idle = exportButton.textContent;
    exportButton.disabled = true;
    exportButton.textContent = "Preparando…";
    try {
      const indexes = [...selected].sort((a, b) => a - b);
      const entries = [];
      for (let position = 0; position < indexes.length; position += 1) {
        const index = indexes[position];
        setStatus(screen.status, `Preparando frame ${position + 1} de ${indexes.length}…`, "progress", 10 + position / indexes.length * 76);
        const blob = format.input.value === "jpeg" ? await pngBlobToJpeg(frames[index].blob, Number(quality.input.value)) : frames[index].blob;
        const extension = format.input.value === "jpeg" ? "jpg" : "png";
        entries.push({ name: `${baseName(file.name)}-frame-${String(index + 1).padStart(4, "0")}.${extension}`, blob });
        if (position % 5 === 0) await nextFrame();
      }
      if (entries.length === 1) downloadBlob(entries[0].blob, entries[0].name);
      else {
        setStatus(screen.status, "Montando o ZIP localmente…", "progress", 92);
        const zip = await createStoreZip(entries);
        downloadBlob(zip, `${baseName(file.name)}-frames.zip`);
      }
      setStatus(screen.status, `${entries.length} ${entries.length === 1 ? "frame exportado" : "frames exportados"}.`, "success", 100);
    } catch (error) {
      setStatus(screen.status, friendlyError(error), "error");
    } finally {
      exportButton.disabled = !selected.size;
      exportButton.textContent = idle;
    }
  });
}

async function composeGifFrames(decoded, width, height, screen, onProgress) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
  const patchCanvas = document.createElement("canvas");
  const patchContext = patchCanvas.getContext("2d", { alpha: true });
  const output = [];
  let previous = null;
  let restoreImage = null;
  for (let index = 0; index < decoded.length; index += 1) {
    if (screen.token !== screenToken) throw new Error("Operação cancelada ao sair da ferramenta.");
    if (previous?.disposalType === 2) context.clearRect(previous.dims.left, previous.dims.top, previous.dims.width, previous.dims.height);
    else if (previous?.disposalType === 3 && restoreImage) context.putImageData(restoreImage, 0, 0);
    const frame = decoded[index];
    restoreImage = frame.disposalType === 3 ? context.getImageData(0, 0, width, height) : null;
    patchCanvas.width = frame.dims.width;
    patchCanvas.height = frame.dims.height;
    const patch = patchContext.createImageData(frame.dims.width, frame.dims.height);
    patch.data.set(frame.patch);
    patchContext.putImageData(patch, 0, 0);
    context.drawImage(patchCanvas, frame.dims.left, frame.dims.top);
    const blob = await canvasToBlob(canvas, "image/png");
    output.push({ blob, url: keepUrl(URL.createObjectURL(blob)), delay: Number(frame.delay || 100) });
    previous = frame;
    onProgress?.(index + 1);
    if (index % 4 === 0) await nextFrame();
  }
  return output;
}

async function pngBlobToJpeg(blob, quality) {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    return await canvasToBlob(canvas, "image/jpeg", quality);
  } finally { bitmap.close?.(); }
}

async function createStoreZip(entries) {
  const encoder = new TextEncoder();
  const records = [];
  let offset = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(8, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    records.push({ name, data, crc, local, offset });
    offset += local.length + data.length;
  }
  const central = records.map((record) => {
    const bytes = new Uint8Array(46 + record.name.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint32(16, record.crc, true);
    view.setUint32(20, record.data.length, true);
    view.setUint32(24, record.data.length, true);
    view.setUint16(28, record.name.length, true);
    view.setUint32(42, record.offset, true);
    bytes.set(record.name, 46);
    return bytes;
  });
  const centralSize = central.reduce((sum, bytes) => sum + bytes.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, records.length, true);
  endView.setUint16(10, records.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);
  return new Blob([...records.flatMap((record) => [record.local, record.data]), ...central, end], { type: "application/zip" });
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function createDrop({ accept, label, hint, onFiles, multiple = false }) {
  const root = node("label", "converter-drop-zone");
  root.tabIndex = 0;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.multiple = multiple;
  input.hidden = true;
  const icon = node("span", "converter-drop-icon");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "□";
  const strong = document.createElement("strong");
  strong.textContent = label;
  const small = document.createElement("small");
  small.textContent = hint;
  const action = node("span", "cx-drop-click-label");
  action.textContent = multiple ? "+  Selecionar arquivos" : "+  Selecionar arquivo";
  action.setAttribute("aria-hidden", "true");
  root.append(input, icon, strong, small, action);
  input.addEventListener("change", () => { onFiles([...input.files]); input.value = ""; });
  root.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); input.click(); } });
  for (const type of ["dragenter", "dragover"]) root.addEventListener(type, (event) => { event.preventDefault(); root.classList.add("is-dragging"); });
  for (const type of ["dragleave", "drop"]) root.addEventListener(type, (event) => { event.preventDefault(); root.classList.remove("is-dragging"); });
  root.addEventListener("drop", (event) => onFiles([...event.dataTransfer.files]));
  return { root, input };
}

function selectField(label, options) {
  const input = document.createElement("select");
  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    input.appendChild(option);
  });
  return wrapField(label, input);
}

function rangeField(label, value, minimum, maximum, step, formatter) {
  const input = document.createElement("input");
  input.type = "range";
  input.value = String(value);
  input.min = String(minimum);
  input.max = String(maximum);
  input.step = String(step);
  const wrapped = wrapField(label, input);
  const output = document.createElement("output");
  const update = () => { output.textContent = formatter(Number(input.value)); };
  input.addEventListener("input", update);
  update();
  wrapped.field.appendChild(output);
  return { ...wrapped, output };
}

function wrapField(labelText, input) {
  const field = node("label", "converter-field");
  const label = document.createElement("span");
  label.textContent = labelText;
  field.append(label, input);
  return { field, input };
}

function setStatus(target, message = "", type = "", percent = 0) {
  target.className = `converter-status${type ? ` is-${type}` : ""}`;
  target.replaceChildren();
  if (!message) return;
  const text = document.createElement("span");
  text.textContent = message;
  target.appendChild(text);
  if (type === "progress") {
    const track = node("div", "converter-progress-track");
    const fill = document.createElement("span");
    fill.style.width = `${Math.max(2, Math.min(100, Number(percent) || 0))}%`;
    track.appendChild(fill);
    target.appendChild(track);
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Não foi possível criar o arquivo convertido.")), type, quality));
}

function downloadBlob(blob, filename) {
  const url = keepUrl(URL.createObjectURL(blob));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => releaseUrl(url), 30_000);
}

function recordUsage(toolId) {
  try { Promise.resolve(chrome.runtime.sendMessage({ type: "RECORD_TOOL_USAGE", mode: "image", toolId })).catch(() => {}); } catch (_error) {}
}

function keepUrl(url) { resourceUrls.add(url); return url; }
function releaseUrl(url) { if (url) URL.revokeObjectURL(url); resourceUrls.delete(url); }
function clearResources() { resourceUrls.forEach((url) => URL.revokeObjectURL(url)); resourceUrls.clear(); }
function node(tag, className) { const element = document.createElement(tag); if (className) element.className = className; return element; }
function button(label, className) { const element = node("button", className); element.type = "button"; element.textContent = label; return element; }
function nextFrame() { return new Promise((resolve) => requestAnimationFrame(resolve)); }
function baseName(name) { return String(name || "caixota").replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 90) || "caixota"; }
function formatBytes(value) { const bytes = Math.max(0, Number(value) || 0); return bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`; }
function friendlyError(error) { const message = String(error?.message || error || "Não foi possível concluir a operação."); return message.length > 260 ? "O arquivo não pôde ser processado localmente." : message; }

}

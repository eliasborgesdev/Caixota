import { PDFDocument, StandardFonts, degrees, rgb } from "./vendor/pdf-lib.esm.min.mjs";

export const PDF_MIME = "application/pdf";
export const MAX_PDF_FILE_BYTES = 150 * 1024 * 1024;
export const MAX_PDF_SESSION_BYTES = 300 * 1024 * 1024;

export function normalizePdfBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  throw new Error("O arquivo não contém dados PDF válidos.");
}

export function assertPdfSignature(value) {
  const bytes = normalizePdfBytes(value);
  const limit = Math.min(bytes.length, 1024);
  let signature = "";
  for (let index = 0; index < limit; index += 1) signature += String.fromCharCode(bytes[index]);
  if (!signature.includes("%PDF-")) throw new Error("Este arquivo não parece ser um PDF válido.");
  return bytes;
}

export async function loadPdf(value) {
  try {
    return await PDFDocument.load(assertPdfSignature(value), { ignoreEncryption: false, updateMetadata: false });
  } catch (error) {
    const message = String(error?.message || "");
    if (/encrypt|password/i.test(message)) throw new Error("Este PDF é protegido por senha e não pode ser processado localmente.");
    if (/invalid|header|catalog|xref|parse|object/i.test(message)) throw new Error("O PDF está corrompido ou usa uma estrutura que não pôde ser lida.");
    throw new Error(message || "Não foi possível abrir este PDF.");
  }
}

export async function getPdfPageCount(value) {
  return (await loadPdf(value)).getPageCount();
}

export function parsePageSelection(input, pageCount, options = {}) {
  const total = positiveInteger(pageCount, "O PDF não possui páginas válidas.");
  const source = String(input ?? "").trim();
  if (!source && options.allowEmpty) return [];
  if (!source) throw new Error("Informe ao menos uma página.");
  if (/^(todas?|all)$/i.test(source)) return Array.from({ length: total }, (_, index) => index);

  const selected = [];
  const seen = new Set();
  for (const rawToken of source.split(",")) {
    const token = rawToken.trim();
    if (!token) throw new Error("Há uma parte vazia na seleção de páginas.");
    const match = token.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error(`O trecho “${token}” não é um intervalo válido.`);
    const start = Number(match[1]);
    const end = Number(match[2] || match[1]);
    if (start < 1 || end < 1 || start > total || end > total) throw new Error(`Use páginas entre 1 e ${total}.`);
    if (start > end) throw new Error(`O intervalo “${token}” está invertido.`);
    for (let page = start; page <= end; page += 1) {
      const index = page - 1;
      if (!seen.has(index)) {
        seen.add(index);
        selected.push(index);
      }
    }
  }
  if (!selected.length && !options.allowEmpty) throw new Error("Informe ao menos uma página.");
  return selected;
}

export function parsePageGroups(input, pageCount) {
  const total = positiveInteger(pageCount, "O PDF não possui páginas válidas.");
  const source = String(input ?? "").trim();
  if (!source) throw new Error("Informe os intervalos, por exemplo: 1-3,5,8-12.");
  return source.split(",").map((rawToken) => {
    const token = rawToken.trim();
    if (!token) throw new Error("Há uma parte vazia nos intervalos.");
    const pages = parsePageSelection(token, total);
    return { label: token.replace(/\s+/g, ""), pages };
  });
}

export async function mergePdfFiles(values) {
  if (!Array.isArray(values) || values.length < 2) throw new Error("Adicione pelo menos dois PDFs para unir.");
  const output = await PDFDocument.create();
  for (const value of values) {
    const source = await loadPdf(value?.bytes ?? value);
    const indices = source.getPageIndices();
    if (!indices.length) throw new Error("Um dos PDFs não possui páginas.");
    const pages = await output.copyPages(source, indices);
    pages.forEach((page) => output.addPage(page));
  }
  return savePdf(output);
}

export async function splitPdf(value, options = {}) {
  const source = await loadPdf(value);
  const total = source.getPageCount();
  const groups = options.mode === "ranges"
    ? parsePageGroups(options.ranges, total)
    : Array.from({ length: total }, (_, index) => ({ label: String(index + 1), pages: [index] }));
  const outputs = [];
  for (const group of groups) {
    outputs.push({ label: group.label, bytes: await copyPagesToNewDocument(source, group.pages) });
  }
  return outputs;
}

export async function reorderPdfPages(value, order) {
  const source = await loadPdf(value);
  const total = source.getPageCount();
  const indices = Array.isArray(order) ? order.map(Number) : [];
  if (indices.length !== total || new Set(indices).size !== total || indices.some((index) => !Number.isInteger(index) || index < 0 || index >= total)) {
    throw new Error("A nova ordem precisa conter cada página exatamente uma vez.");
  }
  return copyPagesToNewDocument(source, indices);
}

export async function removePdfPages(value, pageSelection) {
  const source = await loadPdf(value);
  const total = source.getPageCount();
  const removed = new Set(Array.isArray(pageSelection) ? pageSelection : parsePageSelection(pageSelection, total));
  const kept = source.getPageIndices().filter((index) => !removed.has(index));
  if (!kept.length) throw new Error("Não é possível remover todas as páginas do PDF.");
  return copyPagesToNewDocument(source, kept);
}

export async function extractPdfPages(value, pageSelection) {
  const source = await loadPdf(value);
  const selected = Array.isArray(pageSelection) ? pageSelection : parsePageSelection(pageSelection, source.getPageCount());
  if (!selected.length) throw new Error("Selecione pelo menos uma página para extrair.");
  return copyPagesToNewDocument(source, selected);
}

export async function imagesToPdf(images, options = {}) {
  if (!Array.isArray(images) || !images.length) throw new Error("Adicione pelo menos uma imagem.");
  const output = await PDFDocument.create();
  const margin = clamp(Number(options.margin ?? 24), 0, 144);
  for (const item of images) {
    const bytes = normalizePdfBytes(item.bytes);
    const type = String(item.type || "").toLowerCase();
    let embedded;
    if (type.includes("png")) embedded = await output.embedPng(bytes);
    else if (type.includes("jpeg") || type.includes("jpg")) embedded = await output.embedJpg(bytes);
    else throw new Error("Converta a imagem para PNG ou JPEG antes de gerar o PDF.");

    const original = embedded.scale(1);
    let [pageWidth, pageHeight] = resolvePageSize(options.pageSize || "a4", original.width, original.height, margin);
    if (options.orientation === "landscape" && pageHeight > pageWidth) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    if (options.orientation === "portrait" && pageWidth > pageHeight) [pageWidth, pageHeight] = [pageHeight, pageWidth];
    const availableWidth = Math.max(1, pageWidth - margin * 2);
    const availableHeight = Math.max(1, pageHeight - margin * 2);
    const scale = Math.min(availableWidth / original.width, availableHeight / original.height, options.pageSize === "image" ? 1 : Number.POSITIVE_INFINITY);
    const width = original.width * scale;
    const height = original.height * scale;
    const page = output.addPage([pageWidth, pageHeight]);
    page.drawImage(embedded, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
  }
  return savePdf(output);
}

export async function createMixedPdf(items, options = {}) {
  if (!Array.isArray(items) || !items.length) throw new Error("Adicione ao menos uma página de PDF ou imagem.");
  const output = await PDFDocument.create();
  const sourceCache = new Map();
  const margin = clamp(Number(options.margin ?? 24), 0, 144);
  for (const item of items) {
    if (item?.kind === "pdf") {
      const sourceId = item.sourceId || item.bytes;
      let source = sourceCache.get(sourceId);
      if (!source) {
        source = await loadPdf(item.bytes);
        sourceCache.set(sourceId, source);
      }
      const pageIndex = Number(item.pageIndex);
      if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= source.getPageCount()) throw new Error("Uma das páginas de PDF é inválida.");
      const [page] = await output.copyPages(source, [pageIndex]);
      output.addPage(page);
      continue;
    }
    if (item?.kind === "image") {
      const bytes = normalizePdfBytes(item.bytes);
      const type = String(item.type || "").toLowerCase();
      let embedded;
      if (type.includes("png")) embedded = await output.embedPng(bytes);
      else if (type.includes("jpeg") || type.includes("jpg")) embedded = await output.embedJpg(bytes);
      else throw new Error("Converta a imagem para PNG ou JPEG antes de gerar o PDF.");
      const original = embedded.scale(1);
      let [pageWidth, pageHeight] = resolvePageSize(options.pageSize || "a4", original.width, original.height, margin);
      if (options.orientation === "landscape" && pageHeight > pageWidth) [pageWidth, pageHeight] = [pageHeight, pageWidth];
      if (options.orientation === "portrait" && pageWidth > pageHeight) [pageWidth, pageHeight] = [pageHeight, pageWidth];
      const scale = Math.min((pageWidth - margin * 2) / original.width, (pageHeight - margin * 2) / original.height, options.pageSize === "image" ? 1 : Number.POSITIVE_INFINITY);
      const width = original.width * Math.max(0.001, scale);
      const height = original.height * Math.max(0.001, scale);
      const page = output.addPage([pageWidth, pageHeight]);
      page.drawImage(embedded, { x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height });
      continue;
    }
    throw new Error("Um dos itens do PDF misto é inválido.");
  }
  return savePdf(output);
}

export async function rotatePdfPages(value, options = {}) {
  const pdf = await loadPdf(value);
  const total = pdf.getPageCount();
  const selected = new Set(resolvePageOption(options.pages, total));
  const delta = normalizeRotation(options.angle ?? 90);
  pdf.getPages().forEach((page, index) => {
    if (!selected.has(index)) return;
    page.setRotation(degrees(normalizeRotation((page.getRotation()?.angle || 0) + delta)));
  });
  return savePdf(pdf);
}

export async function watermarkPdf(value, options = {}) {
  const pdf = await loadPdf(value);
  const text = String(options.text || "").trim();
  if (!text) throw new Error("Digite o texto da marca d’água.");
  const total = pdf.getPageCount();
  const selected = new Set(resolvePageOption(options.pages, total));
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const size = clamp(Number(options.size || 42), 8, 180);
  const opacity = clamp(Number(options.opacity ?? 0.22), 0.03, 1);
  const angle = clamp(Number(options.rotation ?? -35), -180, 180);
  const color = hexToRgb(options.color || "#6a6f78");
  pdf.getPages().forEach((page, index) => {
    if (!selected.has(index)) return;
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);
    const point = resolvePosition(options.position || "center", width, height, textWidth, textHeight, 28);
    page.drawText(text, { x: point.x, y: point.y, size, font, color, opacity, rotate: degrees(angle) });
  });
  return savePdf(pdf);
}

export async function numberPdfPages(value, options = {}) {
  const pdf = await loadPdf(value);
  const total = pdf.getPageCount();
  const startPage = clamp(Math.floor(Number(options.startPage || 1)), 1, total);
  const startNumber = Math.max(0, Math.floor(Number(options.startNumber ?? 1)));
  const size = clamp(Number(options.size || 11), 6, 48);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(options.color || "#4b4f57");
  pdf.getPages().forEach((page, index) => {
    if (index + 1 < startPage) return;
    const number = startNumber + (index + 1 - startPage);
    const text = formatPageNumber(options.format || "number", number, total);
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);
    const { width, height } = page.getSize();
    const point = resolvePosition(options.position || "bottom-center", width, height, textWidth, textHeight, 24);
    page.drawText(text, { x: point.x, y: point.y, size, font, color, opacity: 0.95 });
  });
  return savePdf(pdf);
}

export async function cropPdfPages(value, options = {}) {
  const pdf = await loadPdf(value);
  const total = pdf.getPageCount();
  const selected = new Set(resolvePageOption(options.pages, total));
  const rect = normalizeCropRect(options.rect);
  pdf.getPages().forEach((page, index) => {
    if (!selected.has(index)) return;
    const { width, height } = page.getSize();
    const cropWidth = width * rect.width;
    const cropHeight = height * rect.height;
    const x = width * rect.x;
    const y = height * (1 - rect.y - rect.height);
    if (cropWidth < 12 || cropHeight < 12) throw new Error("A área de recorte ficou pequena demais.");
    page.setCropBox(x, y, cropWidth, cropHeight);
  });
  return savePdf(pdf);
}

export function formatPageNumber(format, number, total) {
  if (format === "page") return `Página ${number}`;
  if (format === "fraction") return `${number} / ${total}`;
  if (format === "page-of") return `Página ${number} de ${total}`;
  return String(number);
}

async function copyPagesToNewDocument(source, indices) {
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  pages.forEach((page) => output.addPage(page));
  return savePdf(output);
}

async function savePdf(pdf) {
  if (!pdf.getPageCount()) throw new Error("O resultado não possui páginas.");
  return pdf.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
}

function resolvePageOption(value, total) {
  if (Array.isArray(value)) {
    const indices = [...new Set(value.map(Number))];
    if (!indices.length || indices.some((index) => !Number.isInteger(index) || index < 0 || index >= total)) throw new Error("A seleção de páginas é inválida.");
    return indices;
  }
  if (!value || /^(todas?|all)$/i.test(String(value).trim())) return Array.from({ length: total }, (_, index) => index);
  return parsePageSelection(value, total);
}

function resolvePageSize(name, imageWidth, imageHeight, margin) {
  if (name === "letter") return [612, 792];
  if (name === "image") return [clamp(imageWidth + margin * 2, 72, 14400), clamp(imageHeight + margin * 2, 72, 14400)];
  return [595.28, 841.89];
}

function resolvePosition(position, width, height, contentWidth, contentHeight, margin) {
  const [vertical, horizontal] = String(position).includes("-") ? String(position).split("-") : ["center", "center"];
  const x = horizontal === "left" ? margin : horizontal === "right" ? width - margin - contentWidth : (width - contentWidth) / 2;
  const y = vertical === "top" ? height - margin - contentHeight : vertical === "bottom" ? margin : (height - contentHeight) / 2;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

function normalizeCropRect(rect = {}) {
  const x = clamp(Number(rect.x ?? 0), 0, 0.98);
  const y = clamp(Number(rect.y ?? 0), 0, 0.98);
  const width = clamp(Number(rect.width ?? 1), 0.01, 1 - x);
  const height = clamp(Number(rect.height ?? 1), 0.01, 1 - y);
  return { x, y, width, height };
}

function hexToRgb(value) {
  const match = String(value || "").trim().match(/^#?([0-9a-f]{6})$/i);
  if (!match) return rgb(0.3, 0.32, 0.35);
  const number = Number.parseInt(match[1], 16);
  return rgb(((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255);
}

function normalizeRotation(value) {
  return ((Math.round(Number(value) || 0) % 360) + 360) % 360;
}

function positiveInteger(value, message) {
  const result = Math.floor(Number(value));
  if (!Number.isFinite(result) || result < 1) throw new Error(message);
  return result;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, Number.isFinite(value) ? value : minimum));
}

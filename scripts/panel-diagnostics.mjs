// Diagnósticos ativados sob demanda; jamais acessam conteúdo de notas, cofre ou arquivos.
let snapshot = null;
const id = (selector) => document.getElementById(selector);
function setItems(items) {
  const container = id("diagnosticsResults");
  if (!container) return;
  container.replaceChildren();
  for (const [name, value] of Object.entries(items)) {
    const line = document.createElement("div"); line.className = "diagnostic-line";
    const label = document.createElement("strong"); label.textContent = name;
    const text = document.createElement("span"); text.textContent = String(value);
    line.append(label, text); container.append(line);
  }
}
async function checkLocal() {
  const manifest = chrome.runtime.getManifest();
  let stored = "Disponível";
  try {
    const key = "caixotaDiagnosticsPing";
    await chrome.storage.local.set({[key]:Date.now()});
    const response = await chrome.storage.local.get(key);
    if (typeof response[key] !== "number") stored = "Falha na leitura";
    await chrome.storage.local.remove(key);
  } catch (error) { stored = `Falha: ${error.name || "Erro"}`; }
  let capacity = "Não informado";
  try {
    const stats = await navigator.storage?.estimate?.();
    if (stats?.usage != null) capacity = `${(stats.usage / 1048576).toFixed(1)} MB usados (origem do painel; aproximado)`;
  } catch (_) { /* capacidade pode não estar disponível neste navegador */ }
  snapshot = {
    version: manifest.version,
    browser: navigator.userAgentData?.brands?.map(x => x.brand).join(", ") || "Navegador Chromium compatível",
    platform: navigator.platform || "Não identificado",
    storage: stored,
    storageUsage: capacity,
    crypto: Boolean(crypto?.subtle),
    tts: Boolean("speechSynthesis" in window),
    onlineReported: navigator.onLine,
    extensionContext: Boolean(chrome.runtime?.id),
    inspectedAt: new Date().toISOString()
  };
  setItems({ "Versão": snapshot.version, "Navegador": snapshot.browser, "Plataforma": snapshot.platform, "Armazenamento local": snapshot.storage, "Espaço utilizado": snapshot.storageUsage, "Criptografia Web": snapshot.crypto ? "Disponível" : "Indisponível", "Síntese de voz": snapshot.tts ? "Disponível" : "Indisponível", "Conexão (sinal do navegador)": snapshot.onlineReported ? "Online" : "Offline", "Contexto da extensão": snapshot.extensionContext ? "Ativo" : "Não identificado" });
  id("exportDiagnostics").disabled = false;
}
async function checkServices() {
  const container = id("diagnosticsResults");
  const button = id("testServices"); button.disabled = true;
  try {
    if (!snapshot) await checkLocal();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 7000);
    try {
      // Apenas verificação de status, nenhuma nota, palavra ou preferência enviada.
      const response = await fetch("https://api.frankfurter.dev/v1/latest?base=EUR", {signal:controller.signal,cache:"no-store"});
      snapshot.externalService = response.ok ? "Frankfurter respondeu" : `HTTP ${response.status}`;
    } catch (error) { snapshot.externalService = `Indisponível (${error.name})`; }
    finally { clearTimeout(timer); }
    const item = document.createElement("p");
    item.className = "diagnostic-line";
    item.textContent = `Serviço de câmbio: ${snapshot.externalService}`;
    container.append(item);
  } finally { button.disabled = false; }
}
function exportReport() {
  if (!snapshot) return;
  const report = {product:"Caixota", reportType:"technical-metadata-only",...snapshot};
  const blob = new Blob([JSON.stringify(report,null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = `caixota-diagnostics-${snapshot.version}.json`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
export function setupDiagnostics() {
  id("runDiagnostics")?.addEventListener("click", checkLocal);
  id("testServices")?.addEventListener("click", checkServices);
  id("exportDiagnostics")?.addEventListener("click", exportReport);
}

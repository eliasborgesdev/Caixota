importScripts('caixota-volume-engine.js');
const SETTINGS_KEY = "tremSettings";
const USAGE_KEY = "tremUsage";
const PASSWORD_VAULT_KEY = "tremPasswordVault";
const PASSWORD_VAULT_ITERATIONS = 310000;
const RATES_KEY = "tremDailyExchangeRates";
const RATES_ALARM = "trem-refresh-daily-rates";
const RATES_API = "https://api.frankfurter.dev/v2/rates?base=EUR";
const FETCH_TIMEOUT_MS = 8000;
const MAX_RECENT_TOOLS = 10;
const PANEL_PATH = "panel.html";
const PANEL_TAB_SESSION_KEY = "caixotaPanelTabId";
const CONTENT_TAB_SESSION_KEY = "caixotaLastContentTabId";
const VALID_TOOL_IDS = {
  text: new Set(["currency", "calculate", "encoder", "compare", "counter", "units", "color", "date", "dictionary", "formatter", "reader", "cleaner", "link-checker", "list", "sort", "password", "translate", "qr-generator", "text-notes"]),
  image: new Set(["image-capture", "image-compress", "image-convert", "image-colors", "image-info", "image-pdf", "image-qr", "image-resize", "image-text", "image-rotate", "image-gif-compress", "image-gif-frames", "image-frames-gif"]),
  video: new Set(["video-convert", "video-compress", "video-extract-audio", "video-quick-editor"]),
  pdf: new Set(["pdf-combine", "pdf-merge", "pdf-create", "pdf-split", "pdf-organize", "pdf-remove", "pdf-extract", "pdf-image-to-pdf", "pdf-to-image", "pdf-to-text", "pdf-rotate", "pdf-watermark", "pdf-number", "pdf-crop"]),
  generator: new Set(["generator-name"]),
  converter: new Set(["converter-image", "converter-image-compress", "converter-gif-compress", "converter-gif-frames", "converter-frames-gif"])
};
let usageWriteQueue = Promise.resolve();
let panelTabId = null;
let lastContentTabId = null;

const DEFAULT_SETTINGS = {
  enabled: true,
  theme: "light",
  customThemeBackground: "#1c1f26",
  customThemeSurface: "#252a33",
  customThemeAccent: "#9b5d58",
  customThemeText: "#f7f8fa",
  customThemeMuted: "#a8afb9",
  customThemeAccentText: "#ffffff",
  customThemeTitle: "#f7f8fa",
  customThemeSubtitle: "#a8afb9",
  customThemeRadius: 14,
  customThemeBorderWidth: 1,
  customThemeShadow: "soft",
  customThemeButtonStyle: "solid",
  customThemeFieldStyle: "soft",
  customThemePattern: "none",
  themePresets: [],
  activeThemePresetId: "",
  typographyScale: 1,
  typographyTitleScale: 1,
  typographySubtitleScale: 1,
  typographySmallScale: 1,
  typographyLetterSpacing: 0,
  typographyTitleLetterSpacing: -0.015,
  typographySubtitleLetterSpacing: 0,
  typographySmallLetterSpacing: 0.01,
  typographyLineHeight: 1.5,
  fontSize: 15,
  fontFamily: "default",
  customFontName: "",
  customFontData: "",
  currencyEnabled: true,
  translationEnabled: true,
  calculatorEnabled: false,
  counterEnabled: false,
  converterEnabled: true,
  dictionaryEnabled: true,
  formatterEnabled: false,
  cleanerEnabled: false,
  dateEnabled: false,
  listEnabled: false,
  sorterEnabled: false,
  encoderEnabled: false,
  colorEnabled: false,
  readerEnabled: false,
  passwordEnabled: false,
  linkCheckerEnabled: false,
  comparerEnabled: false,
  qrGeneratorEnabled: false,
  textSelectionButtonEnabled: true,
  recentToolsEnabled: true,
  visualEffectsEnabled: true,
  imageConvertEnabled: true,
  imageCompressEnabled: true,
  imageResizeEnabled: true,
  imageRotateEnabled: true,
  imagePdfEnabled: true,
  imageTextEnabled: true,
  imageInfoEnabled: true,
  imageColorsEnabled: true,
  imageQrEnabled: true,
  imageCaptureEnabled: true,
  ocrApiKey: "helloworld",
  ocrLanguage: "auto",
  foldersEnabled: false,
  favorites: [],
  imageFavorites: [],
  videoFavorites: [],
  pdfFavorites: [],
  generatorFavorites: [],
  converterFavorites: [],
  customFolders: [],
  folderAssignments: {},
  toolAliases: {},

  targetCurrency: "BRL",
  decimalPlaces: 2,
  showOriginal: false,
  showRate: false,
  showRateDate: false,
  dailyRateUpdate: true,
  dollarSymbolCurrency: "USD",

  sourceLanguage: "auto",
  targetLanguage: "pt"
};



const FREE_DICTIONARY_API = "https://freedictionaryapi.com/api/v1/entries";
const DICIONARIO_ABERTO_API = "https://api.dicionario-aberto.net/word";
const DICTIONARY_CACHE_KEY = "caixotaDictionaryCacheV3";
const DICTIONARY_CACHE_MAX_ITEMS = 120;
const DICTIONARY_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const DICTIONARY_MAX_LENGTH = 120;
const DICTIONARY_MAX_WORDS = 8;

const CURATED_DICTIONARY = [
  {
    aliases: ["tamo junto", "tamo junto!", "tmj"],
    term: "tamo junto",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Gíria usada para dizer que alguém pode contar com você, indicando apoio, parceria ou lealdade.",
        "Também pode funcionar como agradecimento ou despedida informal, com sentido próximo de ‘estamos juntos nessa’."
      ]
    }]
  },
  {
    aliases: ["é nóis", "eh nois", "é nois"],
    term: "é nóis",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Expressão informal de união, concordância ou companheirismo, semelhante a ‘estamos juntos’ ou ‘conte comigo’."
      ]
    }]
  },
  {
    aliases: ["de boa", "numa boa"],
    term: "de boa",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Gíria que indica tranquilidade, ausência de problema ou disposição amigável.",
        "Dependendo do contexto, pode significar ‘está tudo bem’, ‘sem preocupação’ ou ‘com calma’."
      ]
    }]
  },
  {
    aliases: ["dar ruim", "deu ruim"],
    term: "dar ruim",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Gíria que significa ocorrer um problema, uma consequência negativa ou algo sair diferente do planejado."
      ]
    }]
  },
  {
    aliases: ["pagar mico"],
    term: "pagar mico",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Expressão informal que significa passar vergonha ou viver uma situação constrangedora diante de outras pessoas."
      ]
    }]
  },
  {
    aliases: ["viajar na maionese"],
    term: "viajar na maionese",
    entries: [{
      languageCode: "pt",
      languageName: "Português",
      definitions: [
        "Expressão informal usada quando alguém está distraído, imaginando coisas improváveis ou falando algo sem muita conexão com a realidade."
      ]
    }]
  },
  {
    aliases: ["no cap"],
    term: "no cap",
    entries: [{
      languageCode: "en",
      languageName: "Inglês",
      definitions: [
        "Gíria inglesa usada para afirmar que algo é verdadeiro ou sincero, com sentido próximo de ‘sem mentira’ ou ‘falando sério’."
      ]
    }]
  },
  {
    aliases: ["spill the tea"],
    term: "spill the tea",
    entries: [{
      languageCode: "en",
      languageName: "Inglês",
      definitions: [
        "Gíria inglesa que significa contar uma fofoca, revelar detalhes interessantes ou compartilhar o que realmente aconteceu."
      ]
    }]
  },
  {
    aliases: ["piece of cake"],
    term: "piece of cake",
    entries: [{
      languageCode: "en",
      languageName: "Inglês",
      definitions: [
        "Expressão inglesa usada para dizer que uma tarefa é muito fácil de realizar."
      ]
    }]
  },
  {
    aliases: ["break a leg"],
    term: "break a leg",
    entries: [{
      languageCode: "en",
      languageName: "Inglês",
      definitions: [
        "Expressão inglesa usada para desejar boa sorte, especialmente antes de uma apresentação ou espetáculo."
      ]
    }]
  },
  {
    aliases: ["my bad"],
    term: "my bad",
    entries: [{
      languageCode: "en",
      languageName: "Inglês",
      definitions: [
        "Gíria inglesa usada para admitir um erro de maneira informal, equivalente a ‘foi mal’ ou ‘culpa minha’."
      ]
    }]
  },
  {
    aliases: ["qué onda", "que onda"],
    term: "qué onda",
    entries: [{
      languageCode: "es",
      languageName: "Espanhol",
      definitions: [
        "Expressão informal do espanhol, comum em alguns países latino-americanos, usada como cumprimento ou para perguntar o que está acontecendo."
      ]
    }]
  }
];

const LANGUAGE_FLAGS = {
  auto: "🌐", pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪",
  it: "🇮🇹", ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", ru: "🇷🇺", ar: "🇸🇦",
  hi: "🇮🇳", nl: "🇳🇱", pl: "🇵🇱", tr: "🇹🇷", sv: "🇸🇪", no: "🇳🇴",
  da: "🇩🇰", fi: "🇫🇮", cs: "🇨🇿", uk: "🇺🇦", el: "🇬🇷", he: "🇮🇱",
  la: "🏛️", und: "🌐"
};

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") await chrome.storage.local.set({caixotaTutorialPending034:true});
  const settings = await getSettings();
  const usage = await getToolUsage();
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings, [USAGE_KEY]: usage });
  await configureRatesAlarm(settings);
  await ensureContextMenus();
  refreshRates({ force: true }).catch(() => {});
});

chrome.runtime.onStartup.addListener(async () => {
  const settings = await getSettings();
  await configureRatesAlarm(settings);
  await ensureContextMenus();
  refreshRates({ force: false }).catch(() => {});
});


// v0.3.14: distinguish the installed panel from trusted, first-frame content
// scripts. Web pages cannot invoke runtime messages directly; these additional
// role checks limit accidents and future privilege-boundary regressions.
const CAIXOTA_EXTENSION_PAGES = new Set(['panel.html', 'workbench.html']);
const CAIXOTA_PANEL_ONLY = new Set([
  'REGISTER_PANEL', 'CONTROL_PAGE_TRANSLATION', 'GET_SETTINGS',
  'GET_TOOL_USAGE', 'CLEAR_TOOL_USAGE', 'REFRESH_RATES', 'GET_RATE_STATUS'
]);
const CAIXOTA_CONTENT_ONLY = new Set([
  'CONVERT_CURRENCY', 'TRANSLATE_TEXT', 'TRANSLATE_PAGE_BATCH',
  'GET_PASSWORD_VAULT_STATUS', 'CREATE_PASSWORD_VAULT',
  'UNLOCK_PASSWORD_VAULT', 'SAVE_PASSWORD_VAULT', 'LOOKUP_DICTIONARY',
  'TRANSLATE_DICTIONARY_DEFINITIONS', 'FETCH_IMAGE_DATA',
  'OCR_IMAGE', 'CAPTURE_VISIBLE_TAB', 'DECODE_QR_IMAGE'
]);
function isCaixotaPanelSender(sender) {
  if (sender?.id !== chrome.runtime.id) return false;
  try {
    const url = new URL(sender.url || '');
    const extensionRoot = new URL(chrome.runtime.getURL('/'));
    return url.protocol === extensionRoot.protocol && url.host === extensionRoot.host && CAIXOTA_EXTENSION_PAGES.has(url.pathname.slice(1));
  } catch (_error) { return false; }
}
function isCaixotaContentSender(sender) {
  if (sender?.id !== chrome.runtime.id || !Number.isSafeInteger(sender.tab?.id) || sender.frameId !== 0) return false;
  try {
    const url = new URL(sender.url || '');
    return ['http:', 'https:', 'file:'].includes(url.protocol);
  } catch (_error) { return false; }
}
function allowCaixotaMessage(type, sender) {
  const fromPanel = isCaixotaPanelSender(sender);
  const fromContent = isCaixotaContentSender(sender);
  if (CAIXOTA_PANEL_ONLY.has(type)) return fromPanel;
  if (CAIXOTA_CONTENT_ONLY.has(type)) return fromContent;
  if (type === 'RECORD_TOOL_USAGE') return fromPanel || fromContent;
  return false;
}

chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
 if(message?.type==='CAIXOTA_OPEN_PANEL_FROM_SITE'){
  if (!isCaixotaContentSender(sender)) { sendResponse({ok:false,error:'Origem não autorizada.'}); return; }
  openOrFocusPanel(sender.tab).then(()=>sendResponse({ok:true})).catch(e=>sendResponse({ok:false,error:String(e)}));
  return true;
 }
});

chrome.action?.onClicked?.addListener((tab) => {
  openOrFocusPanel(tab).catch(() => {});
});

chrome.tabs?.onRemoved?.addListener((tabId) => {
  if (tabId === panelTabId) {
    panelTabId = null;
    writeSessionValue(PANEL_TAB_SESSION_KEY, null).catch(() => {});
  }
  if (tabId === lastContentTabId) {
    lastContentTabId = null;
    writeSessionValue(CONTENT_TAB_SESSION_KEY, null).catch(() => {});
  }
});


async function ensureContextMenus() {
  try {
    await chrome.contextMenus.removeAll();
  } catch (_error) {}

  const settings = await getSettings();
  if (!settings.enabled) return;

  // Um único submenu: as ferramentas contextuais e o modo escuro coexistem.
  chrome.contextMenus.create({id:'caixota-root',title:'Caixota',contexts:['page','selection','image']});
  chrome.contextMenus.create({id:'caixota-open-tools',parentId:'caixota-root',title:'Abrir ferramentas da Caixota',contexts:['page','selection','image']});
  chrome.contextMenus.create({id:'caixota-translate-page',parentId:'caixota-root',title:'Traduzir página inteira',contexts:['page','selection']});
  chrome.contextMenus.create({id:'caixota-open-volume',parentId:'caixota-root',title:'Aumentar volume da aba',contexts:['page','selection','image']});
  chrome.contextMenus.create({id:'caixota-force-dark',parentId:'caixota-root',title:'Forçar página escura',contexts:['page','selection','image']});
  chrome.contextMenus.create({id:'caixota-restore-light',parentId:'caixota-root',title:'Voltar às cores originais',contexts:['page','selection','image']});

}

const CX_DARK_SESSION='cx0310DarkTabs';
async function setDarkPage(tabId,enabled){
  const stored=await chrome.storage.session.get(CX_DARK_SESSION);
  const map=stored[CX_DARK_SESSION]||{};
  if(enabled){const tab=await chrome.tabs.get(tabId);map[String(tabId)]={origin:new URL(tab.url).origin};}else delete map[String(tabId)];
  await chrome.storage.session.set({[CX_DARK_SESSION]:map});
  try{await chrome.tabs.sendMessage(tabId,{type:'CAIXOTA_PAGE_DARK_0310',enabled});}
  catch(error){
    // The tab might not accept content scripts (browser stores / chrome:// etc).
    console.info('Caixota: não foi possível mudar esta página:',error?.message||String(error));
  }
}
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.type!=='CAIXOTA_PAGE_DARK_ACTION')return;
  if (!isCaixotaContentSender(sender)) { respond({ok:false,error:'Origem não autorizada.'}); return; }
  if(!sender?.tab?.id){respond({ok:false,error:'Não foi possível identificar a aba.'});return;}
  setDarkPage(sender.tab.id,message.enabled===true).then(()=>respond({ok:true})).catch(error=>respond({ok:false,error:String(error)}));
  return true;
});
chrome.tabs.onUpdated.addListener((id,change)=>{
  if(change.status!=='complete')return;
  chrome.storage.session.get(CX_DARK_SESSION).then(d=>{
    const saved=d[CX_DARK_SESSION]?.[String(id)];if(!saved)return;
    chrome.tabs.get(id).then(tab=>{
      const sameOrigin=new URL(tab.url).origin===saved.origin;
      if(sameOrigin)return chrome.tabs.sendMessage(id,{type:'CAIXOTA_PAGE_DARK_0310',enabled:true}).catch(()=>{});
      return setDarkPage(id,false);
    }).catch(()=>{});
  }).catch(()=>{});
});
chrome.tabs.onRemoved.addListener(id=>{
  chrome.storage.session.get(CX_DARK_SESSION).then(d=>{
    const m=d[CX_DARK_SESSION]||{};if(!m[String(id)])return;
    delete m[String(id)];return chrome.storage.session.set({[CX_DARK_SESSION]:m});
  }).catch(()=>{});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if(info.menuItemId==='caixota-force-dark'||info.menuItemId==='caixota-restore-light'){
    setDarkPage(tab.id,info.menuItemId==='caixota-force-dark').catch(console.error);
    return;
  }

  if(info.menuItemId==='caixota-open-volume'){chrome.tabs.sendMessage(tab.id,{type:'OPEN_PAGE_MENU',selectedTool:'volume'}).catch(()=>{});return;}
  if (info.menuItemId === 'caixota-open-tools') {
    if(info.mediaType==='image'&&info.srcUrl){chrome.tabs.sendMessage(tab.id,{type:'OPEN_IMAGE_MENU',srcUrl:info.srcUrl}).catch(()=>{});}
    else if(info.selectionText){chrome.tabs.sendMessage(tab.id,{type:'OPEN_TEXT_MENU',selectionText:info.selectionText}).catch(()=>{});}
    else{chrome.tabs.sendMessage(tab.id,{type:'OPEN_PAGE_MENU'}).catch(()=>{});}
    return;
  }
  if(info.menuItemId==='caixota-translate-page'){
    // Usa o popup contextual existente, com a opção de traduzir página inteira.
    chrome.tabs.sendMessage(tab.id,{type:'OPEN_PAGE_MENU'}).catch(()=>{});
  }

});


// Atalhos de sites: o background valida de novo os endereços e abre apenas
// os que o usuário salvou. Mensagens não podem enviar URLs arbitrárias.
const SITE_SHORTCUTS_KEY='caixotaSiteShortcuts0311';
chrome.runtime.onMessage.addListener((message,sender,respond)=>{
 if(message?.type!=='CAIXOTA_OPEN_SHORTCUT_SITES')return;
 if (!isCaixotaContentSender(sender) && !isCaixotaPanelSender(sender)) { respond({ok:false,error:'Origem não autorizada.'}); return; }
 (async()=>{
  if(!sender?.tab?.id)throw Error('Atalho disponível somente numa página do navegador.');
  const chord=String(message.chord||'');if(chord.length>70)return {ok:false};
  const stored=await chrome.storage.local.get(SITE_SHORTCUTS_KEY);
  const rows=Array.isArray(stored[SITE_SHORTCUTS_KEY])?stored[SITE_SHORTCUTS_KEY].slice(0,50):[];
  let opened=0;
  for(const row of rows){
   if(row?.chord!==chord)continue;
   let url;try{url=new URL(String(row.url||''));}catch{continue;}
   if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)continue;
   await chrome.tabs.create({url:url.href,active:false});opened++;
  }
  return {ok:true,opened};
 })().then(respond).catch(e=>respond({ok:false,error:String(e)}));return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RATES_ALARM) refreshRates({ force: true }).catch(() => {});
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[SETTINGS_KEY]) {
    const settings = { ...DEFAULT_SETTINGS, ...(changes[SETTINGS_KEY].newValue || {}) };
    configureRatesAlarm(settings).catch(() => {});
    const previous = { ...DEFAULT_SETTINGS, ...(changes[SETTINGS_KEY].oldValue || {}) };
    if (previous.enabled !== settings.enabled) {
      ensureContextMenus().catch(() => {});
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const type = message?.type;
  if (CAIXOTA_PANEL_ONLY.has(type) || CAIXOTA_CONTENT_ONLY.has(type) || type === 'RECORD_TOOL_USAGE') {
    if (!allowCaixotaMessage(type, sender)) {
      sendResponse({ok:false,error:'Origem não autorizada para esta operação.'});
      return false;
    }
  }
  if (message?.type === "REGISTER_PANEL") {
    registerPanelTab(sender?.tab?.id)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "CONTROL_PAGE_TRANSLATION") {
    controlPageTranslationFromPanel(message)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }




  if (message?.type === "GET_SETTINGS") {
    getSettings()
      .then((settings) => sendResponse({ ok: true, settings }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "GET_TOOL_USAGE") {
    getToolUsage()
      .then((usage) => sendResponse({ ok: true, usage }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "RECORD_TOOL_USAGE") {
    usageWriteQueue = usageWriteQueue
      .catch(() => {})
      .then(() => recordToolUsage(message.toolId, message.mode));
    usageWriteQueue
      .then((usage) => sendResponse({ ok: true, usage }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "CLEAR_TOOL_USAGE") {
    usageWriteQueue = usageWriteQueue
      .catch(() => {})
      .then(clearToolUsage);
    usageWriteQueue
      .then((usage) => sendResponse({ ok: true, usage }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "CONVERT_CURRENCY") {
    convertCurrency(message.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "TRANSLATE_TEXT") {
    translateText(message.text)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "TRANSLATE_PAGE_BATCH") {
    translatePageTexts(message.texts, message.sourceLanguage, message.targetLanguage)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "GET_PASSWORD_VAULT_STATUS") {
    getPasswordVaultStatus()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "CREATE_PASSWORD_VAULT") {
    createPasswordVault(message.masterPassword)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "UNLOCK_PASSWORD_VAULT") {
    unlockPasswordVault(message.masterPassword)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "SAVE_PASSWORD_VAULT") {
    savePasswordVault(message.masterPassword, message.entries)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }



  if (message?.type === "LOOKUP_DICTIONARY") {
    lookupDictionary(message.text, message.preferredLanguage)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "TRANSLATE_DICTIONARY_DEFINITIONS") {
    translateDictionaryDefinitions(message.definitions, message.sourceLanguage)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "REFRESH_RATES") {
    refreshRates({ force: true })
      .then((snapshot) => sendResponse({ ok: true, result: summarizeSnapshot(snapshot) }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "GET_RATE_STATUS") {
    getRateStatus()
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "FETCH_IMAGE_DATA") {
    fetchImageData(message.url)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "OCR_IMAGE") {
    recognizeImageText(message.dataUrl, message.language, message.apiKey)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "CAPTURE_VISIBLE_TAB") {
    captureVisibleTabImage(sender?.tab?.windowId)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "DECODE_QR_IMAGE") {
    decodeQrImageOnline(message.dataUrl)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: safeMessage(error) }));
    return true;
  }

  return false;
});

async function openOrFocusPanel(sourceTab) {
  const knownPanelId = await getPanelTabId();
  if (sourceTab?.id && sourceTab.id !== knownPanelId && !isPanelUrl(sourceTab.url)) {
    await rememberContentTab(sourceTab.id);
  }

  let panelTab = await getExistingPanelTab(knownPanelId);
  if (!panelTab) panelTab = await findPanelTab();
  if (!panelTab) {
    panelTab = await chrome.tabs.create({ url: chrome.runtime.getURL(PANEL_PATH), active: true });
  } else {
    await chrome.tabs.update(panelTab.id, { active: true });
    if (Number.isInteger(panelTab.windowId) && chrome.windows?.update) {
      await chrome.windows.update(panelTab.windowId, { focused: true }).catch(() => {});
    }
  }

  await registerPanelTab(panelTab?.id);
  return panelTab;
}

async function getExistingPanelTab(tabId) {
  if (!Number.isInteger(tabId)) return null;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab && (!tab.url || isPanelUrl(tab.url))) return tab;
  } catch (_error) {}
  return null;
}

async function findPanelTab() {
  try {
    const panelUrl = chrome.runtime.getURL(PANEL_PATH);
    const tabs = await chrome.tabs.query({ url: `${panelUrl}*` });
    return tabs?.find((tab) => Number.isInteger(tab.id)) || null;
  } catch (_error) {
    return null;
  }
}

function isPanelUrl(url) {
  return String(url || "").startsWith(chrome.runtime.getURL(PANEL_PATH));
}

async function registerPanelTab(tabId) {
  if (!Number.isInteger(tabId)) return;
  panelTabId = tabId;
  await writeSessionValue(PANEL_TAB_SESSION_KEY, tabId);
}

async function rememberContentTab(tabId) {
  if (!Number.isInteger(tabId)) return;
  lastContentTabId = tabId;
  await writeSessionValue(CONTENT_TAB_SESSION_KEY, tabId);
}

async function getPanelTabId() {
  if (Number.isInteger(panelTabId)) return panelTabId;
  panelTabId = await readSessionValue(PANEL_TAB_SESSION_KEY);
  return panelTabId;
}

async function getContentTabId() {
  if (Number.isInteger(lastContentTabId)) return lastContentTabId;
  lastContentTabId = await readSessionValue(CONTENT_TAB_SESSION_KEY);
  return lastContentTabId;
}

async function readSessionValue(key) {
  if (!chrome.storage?.session?.get) return null;
  try {
    const stored = await chrome.storage.session.get(key);
    return Number.isInteger(stored?.[key]) ? stored[key] : null;
  } catch (_error) {
    return null;
  }
}

async function writeSessionValue(key, value) {
  if (!chrome.storage?.session?.set) return;
  if (value === null && chrome.storage.session.remove) await chrome.storage.session.remove(key);
  else await chrome.storage.session.set({ [key]: value });
}

async function controlPageTranslationFromPanel(message) {
  const tabId = await getContentTabId();
  if (!Number.isInteger(tabId)) throw new Error("Abra o Painel a partir da página que deseja traduzir e tente novamente.");
  let tab;
  try {
    tab = await chrome.tabs.get(tabId);
  } catch (_error) {
    throw new Error("A página usada anteriormente não está mais aberta. Volte ao site e abra a Caixota novamente.");
  }
  if (!tab || isPanelUrl(tab.url)) throw new Error("Não foi possível identificar uma página comum para traduzir.");

  const payload = message.action === "stop"
    ? { type: "STOP_PAGE_TRANSLATION" }
    : { type: "START_PAGE_TRANSLATION", sourceLanguage: message.sourceLanguage, targetLanguage: message.targetLanguage };
  try {
    const response = await chrome.tabs.sendMessage(tabId, payload);
    if (!response?.ok) throw new Error(response?.error || "A página não respondeu à Caixota.");
    return response.result || {};
  } catch (error) {
    throw new Error(error?.message || "Esta página não permite a tradução. Tente em um site comum.");
  }
}

function createEmptyToolUsage() {
  return {
    recent: { text: [], image: [], video: [], pdf: [], generator: [], converter: [] },
    counts: { text: {}, image: {}, video: {}, pdf: {}, generator: {}, converter: {} },
    timeline: []
  };
}

function normalizeToolUsage(value = {}) {
  const normalized = createEmptyToolUsage();
  for (const mode of ["text", "image", "video", "pdf", "generator", "converter"]) {
    const validIds = VALID_TOOL_IDS[mode];
    const recent = Array.isArray(value?.recent?.[mode]) ? value.recent[mode] : [];
    normalized.recent[mode] = [...new Set(recent.map(String).filter((id) => validIds.has(id)))].slice(0, MAX_RECENT_TOOLS);

    const counts = value?.counts?.[mode] && typeof value.counts[mode] === "object" ? value.counts[mode] : {};
    for (const [id, rawCount] of Object.entries(counts)) {
      const count = Math.floor(Number(rawCount));
      if (validIds.has(id) && Number.isFinite(count) && count > 0) {
        normalized.counts[mode][id] = Math.min(count, Number.MAX_SAFE_INTEGER);
      }
    }
  }
  normalized.timeline = (Array.isArray(value?.timeline) ? value.timeline : []).map((entry) => ({
    mode: String(entry?.mode || ""),
    id: String(entry?.id || ""),
    at: Math.max(0, Math.floor(Number(entry?.at) || 0))
  })).filter((entry) => VALID_TOOL_IDS[entry.mode]?.has(entry.id)).sort((a, b) => b.at - a.at).slice(0, 30);
  return normalized;
}

async function getToolUsage() {
  const stored = await chrome.storage.local.get(USAGE_KEY);
  return normalizeToolUsage(stored[USAGE_KEY]);
}

async function recordToolUsage(rawToolId, rawMode) {
  const mode = ["image", "video", "pdf", "generator", "converter"].includes(rawMode) ? rawMode : "text";
  const toolId = String(rawToolId || "");
  if (!VALID_TOOL_IDS[mode].has(toolId)) throw new Error("Ferramenta inválida para o histórico.");

  const usage = await getToolUsage();
  usage.recent[mode] = [toolId, ...usage.recent[mode].filter((id) => id !== toolId)].slice(0, MAX_RECENT_TOOLS);
  usage.counts[mode][toolId] = Math.min((usage.counts[mode][toolId] || 0) + 1, Number.MAX_SAFE_INTEGER);
  usage.timeline = [{ mode, id: toolId, at: Date.now() }, ...usage.timeline.filter((entry) => !(entry.mode === mode && entry.id === toolId))].slice(0, 30);
  await chrome.storage.local.set({ [USAGE_KEY]: usage });
  return usage;
}

async function clearToolUsage() {
  const usage = createEmptyToolUsage();
  await chrome.storage.local.set({ [USAGE_KEY]: usage });
  return usage;
}

async function captureVisibleTabImage(windowId) {
  const options = { format: "png" };
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, options);
  if (!String(dataUrl || "").startsWith("data:image/")) throw new Error("Não foi possível capturar a aba visível.");
  return { dataUrl, capturedAt: new Date().toISOString() };
}

async function decodeQrImageOnline(dataUrl) {
  const data = String(dataUrl || "");
  if (!data.startsWith("data:image/")) throw new Error("A imagem preparada para leitura do QR Code é inválida.");

  const response = await fetch(data);
  const blob = await response.blob();
  if (blob.size > 1048576) throw new Error("A imagem ficou grande demais para a leitura online do QR Code.");

  const form = new FormData();
  form.append("file", blob, "qrcode.png");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const apiResponse = await fetch("https://api.qrserver.com/v1/read-qr-code/?outputformat=json", {
      method: "POST",
      body: form,
      signal: controller.signal
    });
    if (!apiResponse.ok) throw new Error(`Falha no serviço de leitura de QR Code (${apiResponse.status}).`);
    const payload = await apiResponse.json();
    const symbol = payload?.[0]?.symbol?.[0];
    const content = String(symbol?.data || "").trim();
    if (!content) throw new Error(symbol?.error || "Nenhum QR Code foi reconhecido nesta imagem.");
    return { content, source: "QRServer" };
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("A leitura do QR Code demorou demais para responder.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const source = stored[SETTINGS_KEY] && typeof stored[SETTINGS_KEY] === "object" ? stored[SETTINGS_KEY] : {};
  const settings = { ...DEFAULT_SETTINGS, ...source };
  if (!Object.prototype.hasOwnProperty.call(source, "typographyScale")) {
    settings.typographyScale = Math.min(1.25, Math.max(0.85, (Number(source.fontSize) || 15) / 15));
  }
  if (settings.theme === "liquid-light") settings.theme = "light";
  if (settings.theme === "liquid-dark") settings.theme = "dark";
  settings.theme = ["dark", "light", "midnight", "oled", "nineties", "y2k", "cyber-drifter", "cyber-2000", "custom"].includes(settings.theme) ? settings.theme : "dark";
  settings.typographyScale = clampSettingNumber(settings.typographyScale, 0.85, 1.25, 1);
  settings.typographyTitleScale = clampSettingNumber(settings.typographyTitleScale, 0.8, 1.35, 1);
  settings.typographySubtitleScale = clampSettingNumber(settings.typographySubtitleScale, 0.85, 1.3, 1);
  settings.typographySmallScale = clampSettingNumber(settings.typographySmallScale, 0.85, 1.25, 1);
  settings.typographyLetterSpacing = clampSettingNumber(settings.typographyLetterSpacing, -0.05, 0.15, 0);
  settings.typographyTitleLetterSpacing = clampSettingNumber(settings.typographyTitleLetterSpacing, -0.06, 0.18, -0.015);
  settings.typographySubtitleLetterSpacing = clampSettingNumber(settings.typographySubtitleLetterSpacing, -0.05, 0.15, 0);
  settings.typographySmallLetterSpacing = clampSettingNumber(settings.typographySmallLetterSpacing, -0.04, 0.18, 0.01);
  settings.typographyLineHeight = clampSettingNumber(settings.typographyLineHeight, 1.3, 1.85, 1.5);
  settings.fontSize = Math.round(15 * settings.typographyScale);
  return settings;
}

function clampSettingNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Math.min(maximum, Math.max(minimum, Number.isFinite(number) ? number : fallback));
}

async function recognizeImageText(dataUrl, requestedLanguage, apiKeyOverride) {
  const settings = await getSettings();
  const data = String(dataUrl || "");
  if (!data.startsWith("data:image/")) throw new Error("A imagem preparada para OCR é inválida.");

  const apiKey = String(apiKeyOverride || settings.ocrApiKey || "helloworld").trim() || "helloworld";
  const ocr = mapOcrLanguage(requestedLanguage || settings.ocrLanguage || "auto");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);

  try {
    const form = new FormData();
    form.append("base64Image", data);
    form.append("isOverlayRequired", "false");
    form.append("detectOrientation", "true");
    form.append("scale", "true");
    form.append("OCREngine", String(ocr.engine));
    if (ocr.code) form.append("language", ocr.code);

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: apiKey },
      body: form,
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Falha no serviço de OCR (${response.status}).`);
    const payload = await response.json();
    if (payload?.IsErroredOnProcessing) {
      const details = Array.isArray(payload.ErrorMessage) ? payload.ErrorMessage.join(" ") : payload.ErrorMessage;
      throw new Error(details || "O serviço de OCR não conseguiu processar a imagem.");
    }
    const text = (payload?.ParsedResults || []).map((item) => item?.ParsedText || "").join("\n").trim();
    if (!text) throw new Error("Nenhum texto foi reconhecido nesta imagem.");
    return { text, source: "OCR.Space", engine: ocr.engine };
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("O OCR demorou demais para responder. Tente novamente.");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function mapOcrLanguage(language) {
  const normalized = String(language || "auto").trim().toLowerCase();
  const map = {
    auto: { code: "auto", engine: 2 },
    pt: { code: "por", engine: 2 },
    en: { code: "eng", engine: 2 },
    es: { code: "spa", engine: 2 },
    ja: { code: "jpn", engine: 1 },
    ko: { code: "kor", engine: 1 },
    zh: { code: "chs", engine: 2 },
    "zh-tw": { code: "cht", engine: 1 }
  };
  return map[normalized] || map.auto;
}

const MAX_IMAGE_DOWNLOAD_BYTES = 20 * 1024 * 1024;
async function fetchImageData(url) {
  let requested;
  try { requested = new URL(String(url || '')); }
  catch (_error) { throw new Error('Endereço da imagem inválido.'); }
  const embeddedImage = requested.protocol === 'data:' && /^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(requested.href);
  if (embeddedImage && requested.href.length > MAX_IMAGE_DOWNLOAD_BYTES * 2) {
    throw new Error('A imagem excede o limite de 20 MB.');
  }
  if (!embeddedImage && (!['https:', 'http:'].includes(requested.protocol) || !requested.hostname || requested.username || requested.password)) {
    throw new Error('Apenas endereços HTTP(S) e imagens embutidas são aceitos.');
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(requested.href, { signal: controller.signal, credentials: 'omit', cache: 'force-cache' });
    if (!response.ok) throw new Error(`Falha ao baixar a imagem (${response.status})`);
    if (!embeddedImage && !['https:', 'http:'].includes(new URL(response.url || requested.href).protocol)) {
      throw new Error('Redirecionamento da imagem não permitido.');
    }
    const rawType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (rawType && !rawType.startsWith('image/') && !['application/octet-stream','binary/octet-stream'].includes(rawType)) {
      throw new Error('O endereço não retornou um arquivo de imagem.');
    }
    const declaredSize = Number(response.headers.get('content-length'));
    if (declaredSize > MAX_IMAGE_DOWNLOAD_BYTES) throw new Error('A imagem excede o limite de 20 MB.');
    if (!response.body) throw new Error('Não foi possível ler o fluxo da imagem.');
    const reader = response.body.getReader();
    const chunks = [];
    let size = 0;
    try {
      for (;;) {
        const {value, done} = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_IMAGE_DOWNLOAD_BYTES) throw new Error('A imagem excede o limite de 20 MB.');
        chunks.push(value);
      }
    } catch (error) {
      await reader.cancel().catch(() => {});
      throw error;
    } finally {
      reader.releaseLock();
    }
    if (!size) throw new Error('O arquivo de imagem está vazio.');
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    // The browser may serve image bytes as generic binary content; preserve the
    // previous PNG fallback in this case, while rejecting text/HTML responses.
    const contentType = rawType.startsWith('image/') ? rawType : 'image/png';
    return { dataUrl: `data:${contentType};base64,${uint8ToBase64(bytes)}`, contentType, size };
  } finally {
    clearTimeout(timer);
  }
}

function uint8ToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  }
  return btoa(binary);
}

async function configureRatesAlarm(settings) {
  await chrome.alarms.clear(RATES_ALARM);
  if (settings.dailyRateUpdate) {
    chrome.alarms.create(RATES_ALARM, {
      delayInMinutes: 2,
      periodInMinutes: 24 * 60
    });
  }
}

async function convertCurrency({ amount, from, to } = {}) {
  const settings = await getSettings();
  if (!settings.enabled || !settings.currencyEnabled) {
    throw new Error("O módulo de câmbio está desativado.");
  }

  const numericAmount = Number(amount);
  const source = String(from || "").toUpperCase();
  const target = String(to || settings.targetCurrency || "BRL").toUpperCase();

  if (!Number.isFinite(numericAmount)) throw new Error("O valor monetário é inválido.");
  if (!source || !target) throw new Error("A moeda não foi reconhecida.");

  if (source === target) {
    return {
      amount: numericAmount,
      from: source,
      to: target,
      converted: numericAmount,
      rate: 1,
      date: new Date().toISOString().slice(0, 10),
      cached: true
    };
  }

  let snapshot = await getSavedRates();

  if (snapshot && hasCurrencies(snapshot, source, target)) {
    if (!isUpdatedToday(snapshot)) refreshRates({ force: false }).catch(() => {});
    return calculateCurrency(numericAmount, source, target, snapshot);
  }

  snapshot = await refreshRates({ force: true });
  if (!snapshot || !hasCurrencies(snapshot, source, target)) {
    throw new Error(`A cotação de ${source} para ${target} não está disponível.`);
  }

  return calculateCurrency(numericAmount, source, target, snapshot);
}

function calculateCurrency(amount, from, to, snapshot) {
  const fromPerEur = from === "EUR" ? 1 : Number(snapshot.rates[from]);
  const toPerEur = to === "EUR" ? 1 : Number(snapshot.rates[to]);

  if (!Number.isFinite(fromPerEur) || !Number.isFinite(toPerEur)) {
    throw new Error(`Não foi possível encontrar as moedas ${from} e ${to}.`);
  }

  const rate = toPerEur / fromPerEur;
  return {
    amount,
    from,
    to,
    converted: amount * rate,
    rate,
    date: snapshot.rateDate,
    fetchedAt: snapshot.fetchedAt,
    cached: true
  };
}

async function refreshRates({ force = false } = {}) {
  const saved = await getSavedRates();
  if (!force && saved && isUpdatedToday(saved)) return saved;

  try {
    const response = await fetchWithTimeout(RATES_API, { cache: "no-store" }, FETCH_TIMEOUT_MS);
    if (!response.ok) throw new Error(`Serviço de câmbio indisponível (${response.status}).`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("O serviço de câmbio retornou uma resposta inválida.");
    }

    const rates = { EUR: 1 };
    let rateDate = null;

    for (const entry of data) {
      const quote = String(entry?.quote || "").toUpperCase();
      const rate = Number(entry?.rate);
      if (quote && Number.isFinite(rate)) rates[quote] = rate;
      if (!rateDate && entry?.date) rateDate = entry.date;
    }

    if (!Number.isFinite(rates.BRL) || !Number.isFinite(rates.USD)) {
      throw new Error("A tabela de câmbio recebida está incompleta.");
    }

    const snapshot = {
      base: "EUR",
      rates,
      rateDate: rateDate || new Date().toISOString().slice(0, 10),
      fetchedAt: Date.now(),
      localDay: localDayKey()
    };

    await chrome.storage.local.set({ [RATES_KEY]: snapshot });
    return snapshot;
  } catch (error) {
    if (saved) return saved;
    throw error;
  }
}

async function getSavedRates() {
  const stored = await chrome.storage.local.get(RATES_KEY);
  return stored[RATES_KEY] || null;
}

async function getRateStatus() {
  const snapshot = await getSavedRates();
  return {
    available: Boolean(snapshot),
    rateDate: snapshot?.rateDate || null,
    fetchedAt: snapshot?.fetchedAt || null,
    updatedToday: snapshot ? isUpdatedToday(snapshot) : false,
    currencyCount: snapshot ? Object.keys(snapshot.rates || {}).length : 0
  };
}

function summarizeSnapshot(snapshot) {
  return {
    available: Boolean(snapshot),
    rateDate: snapshot?.rateDate || null,
    fetchedAt: snapshot?.fetchedAt || null,
    currencyCount: snapshot ? Object.keys(snapshot.rates || {}).length : 0
  };
}

function hasCurrencies(snapshot, ...currencies) {
  return currencies.every((currency) =>
    currency === "EUR" || Number.isFinite(Number(snapshot?.rates?.[currency]))
  );
}

function isUpdatedToday(snapshot) {
  return snapshot?.localDay === localDayKey();
}

function localDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

async function translateText(rawText) {
  const settings = await getSettings();
  if (!settings.enabled || !settings.translationEnabled) {
    throw new Error("O módulo de tradução está desativado.");
  }

  const text = String(rawText || "").trim();
  if (!text) throw new Error("Nenhum texto foi selecionado.");
  if (text.length > 5000) throw new Error("Selecione um texto com até 5.000 caracteres.");
  if (!containsTranslatableText(text)) {
    throw new Error("O conteúdo selecionado não parece conter palavras para traduzir.");
  }

  let translated;
  try {
    translated = await translateWithGoogle(text, settings.sourceLanguage, settings.targetLanguage);
  } catch (_primaryError) {
    translated = await translateWithMyMemory(text, settings.sourceLanguage, settings.targetLanguage);
  }

  const detected = normalizeLanguageCode(translated.detectedLanguage || settings.sourceLanguage || "auto");
  const target = normalizeLanguageCode(settings.targetLanguage);

  return {
    translation: translated.translation,
    faithfulTranslation: translated.translation,
    detectedLanguage: detected,
    targetLanguage: target,
    sourceFlag: getFlag(detected),
    targetFlag: getFlag(target)
  };
}

async function translatePageTexts(rawTexts, requestedSource, requestedTarget) {
  const settings = await getSettings();
  if (!settings.enabled || !settings.translationEnabled) throw new Error("O módulo de tradução está desativado.");

  const texts = Array.isArray(rawTexts) ? rawTexts.map((text) => String(text || "")) : [];
  if (!texts.length) return { translations: [], translatedCount: 0 };
  if (texts.length > 40) throw new Error("A página enviou textos demais de uma só vez.");
  if (texts.reduce((total, text) => total + text.length, 0) > 24000) throw new Error("O lote da página ficou grande demais.");

  const source = requestedSource || settings.sourceLanguage || "auto";
  const target = requestedTarget || settings.targetLanguage || "pt";
  const translations = new Array(texts.length);
  let nextIndex = 0;
  let translatedCount = 0;

  const worker = async () => {
    while (nextIndex < texts.length) {
      const index = nextIndex++;
      const text = texts[index];
      if (!text.trim() || !containsTranslatableText(text)) {
        translations[index] = text;
        continue;
      }
      try {
        let result;
        try {
          result = await translateWithGoogle(text, source, target);
        } catch (_primaryError) {
          result = await translateWithMyMemory(text, source, target);
        }
        translations[index] = result.translation || text;
        if (translations[index] !== text) translatedCount += 1;
      } catch (_error) {
        translations[index] = text;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(4, texts.length) }, () => worker()));
  return { translations, translatedCount };
}

function containsTranslatableText(text) {
  return /\p{L}/u.test(text);
}

async function translateWithGoogle(text, sourceLanguage, targetLanguage) {
  const source = sourceLanguage === "auto" ? "auto" : sourceLanguage;
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", source);
  url.searchParams.set("tl", targetLanguage);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const response = await fetchWithTimeout(url.toString(), {}, FETCH_TIMEOUT_MS);
  if (!response.ok) throw new Error(`Serviço principal de tradução indisponível (${response.status}).`);

  const data = await response.json();
  const translation = Array.isArray(data?.[0])
    ? data[0].map((part) => part?.[0] || "").join("").trim()
    : "";

  if (!translation) throw new Error("O serviço não retornou uma tradução.");
  return { translation, detectedLanguage: data?.[2] || sourceLanguage };
}

async function translateWithMyMemory(text, sourceLanguage, targetLanguage) {
  const source = sourceLanguage === "auto" ? detectLikelyLanguage(text) : sourceLanguage;
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${source}|${targetLanguage}`);

  const response = await fetchWithTimeout(url.toString(), {}, FETCH_TIMEOUT_MS);
  if (!response.ok) throw new Error("Os serviços de tradução estão indisponíveis.");

  const data = await response.json();
  const translation = String(data?.responseData?.translatedText || "").trim();
  if (!translation) throw new Error("Não foi possível traduzir esse texto.");

  return { translation, detectedLanguage: source };
}



async function lookupDictionary(rawText, preferredLanguage = "auto") {
  const settings = await getSettings();
  if (!settings.enabled || !settings.dictionaryEnabled) {
    throw new Error("O módulo de dicionário está desativado.");
  }

  const text = sanitizeDictionaryTerm(rawText);
  validateDictionaryTerm(text);

  const curated = findCuratedDictionaryEntry(text);
  if (curated) {
    return {
      kind: "entries",
      title: curated.term,
      preferredLanguage: normalizeLanguageCode(preferredLanguage),
      entries: curated.entries.map((entry) => ({
        ...entry,
        definitions: normalizeDefinitionItems(entry.definitions, "expressão"),
        definitionLanguage: "pt",
        source: "Caixota"
      }))
    };
  }

  const cacheKey = normalizeDictionaryKey(text);
  const cached = await getCachedDictionaryEntry(cacheKey);
  const lookups = [fetchStructuredDictionary(text)];
  if (!text.includes(" ")) lookups.unshift(fetchPortugueseDictionary(text));

  try {
    const settled = await Promise.allSettled(lookups);
    const entries = [];
    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      if (Array.isArray(result.value)) entries.push(...result.value);
      else entries.push(...parseStructuredDictionaryEntries(result.value, text));
    }

    const merged = mergeDictionaryEntries(entries, text);
    if (!merged.length) {
      if (cached?.entries?.length) return cached;
      return { kind: "notFound", title: text, entries: [] };
    }

    const result = {
      kind: "entries",
      title: text,
      preferredLanguage: normalizeLanguageCode(preferredLanguage),
      entries: merged
    };

    await saveCachedDictionaryEntry(cacheKey, result);
    return result;
  } catch (error) {
    if (cached?.entries?.length) return { ...cached, cached: true };
    throw error;
  }
}

async function fetchPortugueseDictionary(term) {
  const variants = dictionaryTermVariants(term);
  for (const variant of variants) {
    const response = await fetchWithTimeout(`${DICIONARIO_ABERTO_API}/${encodeURIComponent(variant)}`, {
      cache: "force-cache",
      headers: { "Accept": "application/json" }
    }, FETCH_TIMEOUT_MS);

    if (response.status === 404) continue;
    if (!response.ok) continue;
    const data = await response.json();
    const definitions = [];

    for (const record of Array.isArray(data) ? data : []) {
      const xml = String(record?.xml || "");
      const senseMatches = [...xml.matchAll(/<sense\b[^>]*>([\s\S]*?)<\/sense>/gi)];
      const blocks = senseMatches.length ? senseMatches.map((match) => match[1]) : [xml];

      for (const block of blocks) {
        const grammar = firstXmlText(block, "gramGrp");
        const partOfSpeech = normalizePartOfSpeech(grammar, "pt");
        const defMatches = [...block.matchAll(/<def\b[^>]*>([\s\S]*?)<\/def>/gi)];
        for (const match of defMatches) {
          const text = cleanPortugueseDictionaryText(match[1]);
          if (text) definitions.push({ text, partOfSpeech, tags: grammar ? [grammar] : [] });
        }
      }
    }

    const cleaned = refineDefinitionItems(definitions, term);
    if (cleaned.length) {
      return [{
        languageCode: "pt",
        languageName: "Português",
        definitions: cleaned,
        definitionLanguage: "pt",
        source: "Dicionário Aberto"
      }];
    }
  }
  return [];
}

async function fetchStructuredDictionary(term) {
  const variants = dictionaryTermVariants(term);
  for (const variant of variants) {
    const url = `${FREE_DICTIONARY_API}/all/${encodeURIComponent(variant)}?translations=false`;
    const response = await fetchWithTimeout(url, {
      cache: "force-cache",
      headers: { "Accept": "application/json" }
    }, FETCH_TIMEOUT_MS);

    if (response.status === 404) continue;
    if (!response.ok) continue;
    const data = await response.json();
    if (Array.isArray(data?.entries) && data.entries.length) return data;
  }
  return { word: term, entries: [] };
}

function dictionaryTermVariants(term) {
  const normalized = String(term || "").normalize("NFC");
  return [...new Set([
    normalized,
    normalized.toLocaleLowerCase("pt-BR"),
    normalized.replace(/^./u, (char) => char.toLocaleLowerCase("pt-BR"))
  ].filter(Boolean))];
}

function parseStructuredDictionaryEntries(data, term = "") {
  const grouped = new Map();
  const sourceUrl = String(data?.source?.url || "");

  for (const rawEntry of Array.isArray(data?.entries) ? data.entries : []) {
    const languageCode = normalizeLanguageCode(rawEntry?.language?.code || "und");
    if (!languageCode || languageCode === "all") continue;

    const definitions = collectSenseDefinitions(rawEntry?.senses, [], rawEntry?.partOfSpeech, languageCode);
    const cleaned = refineDefinitionItems(definitions, term);
    if (!cleaned.length) continue;

    const existing = grouped.get(languageCode) || {
      languageCode,
      languageName: localizeDictionaryLanguageName(languageCode, rawEntry?.language?.name),
      definitions: [],
      definitionLanguage: "en",
      source: "FreeDictionaryAPI · Wiktionary",
      sourceUrl,
      phonetic: extractDictionaryPhonetic(rawEntry),
      example: extractDictionaryExample(rawEntry?.senses)
    };
    existing.definitions.push(...cleaned);
    existing.definitions = refineDefinitionItems(existing.definitions, term);
    grouped.set(languageCode, existing);
  }

  return [...grouped.values()].filter((entry) => entry.definitions.length);
}

// Dados opcionais, sem inventar pronúncias ou frases que não constem na fonte.
function extractDictionaryPhonetic(entry) {
  const candidates = [entry?.pronunciation?.ipa, entry?.pronunciation?.text, entry?.phonetic,
    ...(Array.isArray(entry?.pronunciations) ? entry.pronunciations.flatMap(item => [item?.ipa, item?.text]) : [])];
  return candidates.find(value => typeof value === "string" && value.trim())?.trim().slice(0, 120) || "";
}
function extractDictionaryExample(senses) {
  for (const sense of Array.isArray(senses) ? senses : []) {
    const candidates = [
      ...(Array.isArray(sense?.examples) ? sense.examples : []),
      ...(Array.isArray(sense?.quotations) ? sense.quotations : []),
      sense?.example
    ];
    for (const candidate of candidates) {
      const phrase = typeof candidate === "string" ? candidate : candidate?.text || candidate?.example || "";
      if (typeof phrase === "string" && phrase.trim()) return phrase.trim().replace(/\s+/g, " ").slice(0, 350);
    }
    const nested = extractDictionaryExample(sense?.subsenses);
    if (nested) return nested;
  }
  return "";
}

function collectSenseDefinitions(senses, output = [], partOfSpeech = "", languageCode = "und") {
  for (const sense of Array.isArray(senses) ? senses : []) {
    const definition = cleanStructuredDefinition(sense?.definition);
    if (definition) {
      output.push({
        text: definition,
        partOfSpeech: normalizePartOfSpeech(partOfSpeech, languageCode),
        tags: Array.isArray(sense?.tags) ? sense.tags.map(String) : []
      });
    }
    if (output.length >= 18) return output;
    collectSenseDefinitions(sense?.subsenses, output, partOfSpeech, languageCode);
    if (output.length >= 18) return output;
  }
  return output;
}

function normalizeDefinitionItems(items, fallbackPartOfSpeech = "") {
  return (Array.isArray(items) ? items : []).map((item) => {
    if (typeof item === "string") {
      return { text: cleanStructuredDefinition(item), partOfSpeech: fallbackPartOfSpeech, tags: [] };
    }
    return {
      text: cleanStructuredDefinition(item?.text || item?.definition),
      partOfSpeech: String(item?.partOfSpeech || fallbackPartOfSpeech || "").trim(),
      tags: Array.isArray(item?.tags) ? item.tags.map(String) : []
    };
  }).filter((item) => item.text);
}

function mergeDictionaryEntries(entries, term) {
  const grouped = new Map();
  for (const entry of Array.isArray(entries) ? entries : []) {
    const languageCode = normalizeLanguageCode(entry?.languageCode || "und");
    const existing = grouped.get(languageCode) || {
      languageCode,
      languageName: entry?.languageName || localizeDictionaryLanguageName(languageCode),
      definitions: [],
      definitionLanguage: entry?.definitionLanguage || "en",
      source: entry?.source || "Dicionário",
      sourceUrl: entry?.sourceUrl || "",
      phonetic: entry?.phonetic || "",
      example: entry?.example || ""
    };
    if (!existing.phonetic && entry?.phonetic) existing.phonetic = entry.phonetic;
    if (!existing.example && entry?.example) existing.example = entry.example;
    existing.definitions.push(...normalizeDefinitionItems(entry?.definitions));
    if (entry?.source === "Dicionário Aberto") {
      existing.source = "Dicionário Aberto";
      existing.definitionLanguage = "pt";
    }
    existing.definitions = refineDefinitionItems(existing.definitions, term);
    grouped.set(languageCode, existing);
  }
  return [...grouped.values()].filter((entry) => entry.definitions.length);
}

function refineDefinitionItems(items, term) {
  const normalizedTerm = normalizeDictionaryKey(term);
  const candidates = normalizeDefinitionItems(items)
    .map((item, index) => ({ ...item, _index: index, _score: scoreDefinition(item, normalizedTerm) }))
    .filter((item) => item.text && item._score > -8)
    .sort((a, b) => b._score - a._score || a._index - b._index);

  const result = [];
  for (const candidate of candidates) {
    if (isCircularDefinition(candidate.text, normalizedTerm)) continue;
    if (result.some((existing) => definitionSimilarity(existing.text, candidate.text) >= 0.72)) continue;
    result.push({
      text: sentenceCaseDefinition(candidate.text),
      partOfSpeech: candidate.partOfSpeech || "",
      tags: candidate.tags || []
    });
    if (result.length >= 6) break;
  }

  if (!result.length && candidates.length) {
    const candidate = candidates[0];
    result.push({ text: sentenceCaseDefinition(candidate.text), partOfSpeech: candidate.partOfSpeech || "", tags: candidate.tags || [] });
  }
  return result;
}

function scoreDefinition(item, normalizedTerm) {
  const text = String(item?.text || "");
  const normalized = normalizeDictionaryKey(stripLeadingLabels(text));
  const tags = (item?.tags || []).join(" ").toLowerCase();
  let score = 0;
  if (text.length >= 24) score += 4;
  if (text.length >= 55) score += 2;
  if (/\b(que|ato|ação|pessoa|objeto|instrumento|qualidade|estado|modo|relativo|referente|utilizado|usado|means|a person|an instrument|the act|the state)\b/i.test(text)) score += 3;
  if (/[.;]/.test(text)) score += 1;
  if (/obsolete|archaic|rare|dated|vaguely|regional|antigo|arcaico|raro|pejorative/i.test(tags + " " + text)) score -= 3;
  if (/^(synonym of|alternative form of|alternative spelling of|feminine of|plural of|forma alternativa de|sinônimo de|o mesmo que)\b/i.test(stripLeadingLabels(text))) score -= 5;
  if (normalized === normalizedTerm) score -= 20;
  const words = normalized.split(" ").filter(Boolean);
  if (words[0] === normalizedTerm && words.length <= 4) score -= 12;
  return score;
}

function isCircularDefinition(text, normalizedTerm) {
  const clean = normalizeDictionaryKey(stripLeadingLabels(text));
  if (!clean) return true;
  if (clean === normalizedTerm) return true;
  const words = clean.split(" ");
  if (words[0] === normalizedTerm && words.length <= 4) return true;
  if (new RegExp(`^(?:sinonimo de|forma alternativa de|o mesmo que) ${escapeRegExp(normalizedTerm)}$`, "i").test(clean)) return true;
  return false;
}

function definitionSimilarity(a, b) {
  const tokensA = new Set(normalizeDictionaryKey(a).split(" ").filter((token) => token.length > 2));
  const tokensB = new Set(normalizeDictionaryKey(b).split(" ").filter((token) => token.length > 2));
  if (!tokensA.size || !tokensB.size) return 0;
  let intersection = 0;
  for (const token of tokensA) if (tokensB.has(token)) intersection++;
  return intersection / Math.min(tokensA.size, tokensB.size);
}

function stripLeadingLabels(value) {
  return String(value || "").replace(/^(?:\([^)]{1,90}\)\s*)+/, "").trim();
}

function sentenceCaseDefinition(value) {
  let text = cleanStructuredDefinition(value).replace(/\s*;\s*/g, "; ");
  text = text.replace(/^_+|_+$/g, "").trim();
  if (!text) return "";
  text = text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
  if (!/[.!?…]$/.test(text)) text += ".";
  return text;
}

function cleanStructuredDefinition(value) {
  return decodeXmlEntities(String(value || ""))
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[-–—#*;:\s]+/, "")
    .trim();
}

function cleanPortugueseDictionaryText(value) {
  return cleanStructuredDefinition(value)
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\bCf\.\s.*$/i, "")
    .trim();
}

function firstXmlText(xml, tagName) {
  const match = String(xml || "").match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? cleanStructuredDefinition(match[1]) : "";
}

function decodeXmlEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (full, entity) => {
    const key = entity.toLowerCase();
    if (named[key] !== undefined) return named[key];
    if (key.startsWith("#x")) return String.fromCodePoint(parseInt(key.slice(2), 16));
    if (key.startsWith("#")) return String.fromCodePoint(parseInt(key.slice(1), 10));
    return full;
  });
}

function normalizePartOfSpeech(value, languageCode = "") {
  const raw = String(value || "").trim().toLowerCase();
  const key = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, " ").trim();
  const mappings = [
    [/\b(noun|substantivo|subst|s m|s f|m|f)\b/, "Substantivo"],
    [/\b(adjective|adjetivo|adj)\b/, "Adjetivo"],
    [/\b(adverb|adverbio|adv)\b/, "Advérbio"],
    [/\b(verb|verbo|v tr|v intr|v)\b/, "Verbo"],
    [/\b(pronoun|pronome|pron)\b/, "Pronome"],
    [/\b(preposition|preposicao|prep)\b/, "Preposição"],
    [/\b(conjunction|conjuncao|conj)\b/, "Conjunção"],
    [/\b(interjection|interjeicao|interj)\b/, "Interjeição"],
    [/\b(article|artigo)\b/, "Artigo"],
    [/\b(numeral|number)\b/, "Numeral"],
    [/\b(proper noun|nome proprio)\b/, "Nome próprio"],
    [/\b(phrase|expressao|locucao)\b/, "Expressão"]
  ];
  for (const [pattern, label] of mappings) if (pattern.test(key)) return label;
  if (raw && raw.length <= 28 && languageCode === "pt") return raw.replace(/\.$/, "");
  return "";
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localizeDictionaryLanguageName(code, fallbackName = "") {
  const names = {
    pt: "Português", en: "Inglês", es: "Espanhol", fr: "Francês", de: "Alemão",
    it: "Italiano", ja: "Japonês", ko: "Coreano", zh: "Chinês", ru: "Russo",
    ar: "Árabe", nl: "Holandês", pl: "Polonês", tr: "Turco", sv: "Sueco",
    no: "Norueguês", da: "Dinamarquês", fi: "Finlandês", cs: "Tcheco",
    uk: "Ucraniano", el: "Grego", he: "Hebraico", la: "Latim", hi: "Hindi"
  };
  return names[code] || String(fallbackName || code || "Idioma não identificado");
}

async function getCachedDictionaryEntry(cacheKey) {
  if (!cacheKey) return null;
  const stored = await chrome.storage.local.get(DICTIONARY_CACHE_KEY);
  const cache = stored[DICTIONARY_CACHE_KEY] || {};
  const item = cache[cacheKey];
  if (!item || !item.data) return null;
  if (Date.now() - Number(item.savedAt || 0) > DICTIONARY_CACHE_TTL_MS) return null;
  return item.data;
}

async function saveCachedDictionaryEntry(cacheKey, data) {
  if (!cacheKey || !data?.entries?.length) return;
  const stored = await chrome.storage.local.get(DICTIONARY_CACHE_KEY);
  const cache = stored[DICTIONARY_CACHE_KEY] || {};
  cache[cacheKey] = { savedAt: Date.now(), data };
  const keys = Object.keys(cache).sort((a, b) => Number(cache[b]?.savedAt || 0) - Number(cache[a]?.savedAt || 0));
  for (const oldKey of keys.slice(DICTIONARY_CACHE_MAX_ITEMS)) delete cache[oldKey];
  await chrome.storage.local.set({ [DICTIONARY_CACHE_KEY]: cache });
}

async function translateDictionaryDefinitions(rawDefinitions, sourceLanguage = "auto") {
  const settings = await getSettings();
  if (!settings.enabled || !settings.dictionaryEnabled) throw new Error("O módulo de dicionário está desativado.");
  const definitions = normalizeDefinitionItems(rawDefinitions).slice(0, 8);
  if (!definitions.length) throw new Error("Nenhuma definição válida foi recebida.");

  const targetLanguage = normalizeLanguageCode(settings.targetLanguage || "pt");
  const source = normalizeLanguageCode(sourceLanguage || "auto");
  if (source === targetLanguage) return { definitions, targetLanguage };

  const translatedDefinitions = await Promise.all(definitions.map(async (definition) => {
    let translation;
    try {
      translation = (await translateWithGoogle(definition.text, source, targetLanguage)).translation;
    } catch (_primaryError) {
      translation = (await translateWithMyMemory(definition.text, source, targetLanguage)).translation;
    }
    return { ...definition, text: sentenceCaseDefinition(translation) };
  }));
  return { definitions: translatedDefinitions, targetLanguage };
}

function sanitizeDictionaryTerm(rawText) {
  return String(rawText || "")
    .replace(/\u00a0/g, " ")
    .replace(/^[\s"'“”‘’«».,!?;:()[\]{}]+|[\s"'“”‘’«».,!?;:()[\]{}]+$/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function validateDictionaryTerm(text) {
  if (!text) throw new Error("Selecione uma palavra ou expressão para consultar.");
  if (text.length > DICTIONARY_MAX_LENGTH) throw new Error(`Selecione uma palavra ou expressão com até ${DICTIONARY_MAX_LENGTH} caracteres.`);
  if (!/\p{L}/u.test(text)) throw new Error("O conteúdo selecionado não parece ser uma palavra ou expressão.");
  const words = text.match(/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu) || [];
  if (words.length > DICTIONARY_MAX_WORDS) throw new Error("O dicionário aceita palavras ou expressões curtas com até 8 palavras.");
}

function findCuratedDictionaryEntry(text) {
  const normalized = normalizeDictionaryKey(text);
  return CURATED_DICTIONARY.find((entry) =>
    entry.aliases.some((alias) => normalizeDictionaryKey(alias) === normalized)
  ) || null;
}

function normalizeDictionaryKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”‘’]/g, "'")
    .replace(/[^\p{L}\p{N}'\-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}


async function fetchWithTimeout(url, options = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("O serviço demorou demais para responder.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function detectLikelyLanguage(text) {
  if (/[\u3040-\u30ff]/u.test(text)) return "ja";
  if (/[\uac00-\ud7af]/u.test(text)) return "ko";
  if (/[\u4e00-\u9fff]/u.test(text)) return "zh";
  if (/[\u0400-\u04ff]/u.test(text)) return "ru";
  if (/[\u0600-\u06ff]/u.test(text)) return "ar";
  if (/\b(the|and|you|is|are|to|of|for|with)\b/i.test(text)) return "en";
  if (/\b(el|la|los|las|que|para|con|una|un)\b/i.test(text)) return "es";
  if (/\b(le|la|les|des|une|un|avec|pour)\b/i.test(text)) return "fr";
  if (/\b(o|a|os|as|que|para|com|uma|um|você|eu)\b/i.test(text)) return "pt";
  return "en";
}

function normalizeLanguageCode(code) {
  return String(code || "auto").split("-")[0].toLowerCase();
}

function getFlag(code) {
  return LANGUAGE_FLAGS[normalizeLanguageCode(code)] || "🌐";
}

async function getPasswordVaultStatus() {
  const stored = await chrome.storage.local.get(PASSWORD_VAULT_KEY);
  return { exists: stored[PASSWORD_VAULT_KEY] != null };
}

async function createPasswordVault(masterPassword) {
  const password = validateMasterPassword(masterPassword);
  const stored = await chrome.storage.local.get(PASSWORD_VAULT_KEY);
  if (stored[PASSWORD_VAULT_KEY] != null) throw new Error("Já existe um cofre configurado. Se estiver corrompido, não o substitua sem fazer um backup.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const vault = await encryptPasswordEntries([], password, salt, PASSWORD_VAULT_ITERATIONS);
  await chrome.storage.local.set({ [PASSWORD_VAULT_KEY]: vault });
  return { entries: [] };
}

async function unlockPasswordVault(masterPassword) {
  const password = validateMasterPassword(masterPassword);
  const stored = await chrome.storage.local.get(PASSWORD_VAULT_KEY);
  const vault = stored[PASSWORD_VAULT_KEY];
  if (!isPasswordVaultEnvelope(vault)) throw new Error("Os dados do cofre estão ausentes ou ilegíveis. Faça um backup antes de qualquer alteração.");
  const entries = await decryptPasswordEntries(vault, password);
  return { entries: normalizePasswordEntries(entries) };
}

async function savePasswordVault(masterPassword, entries) {
  const password = validateMasterPassword(masterPassword);
  const stored = await chrome.storage.local.get(PASSWORD_VAULT_KEY);
  const vault = stored[PASSWORD_VAULT_KEY];
  if (!isPasswordVaultEnvelope(vault)) throw new Error("Os dados do cofre estão ausentes ou ilegíveis. Faça um backup antes de qualquer alteração.");
  await decryptPasswordEntries(vault, password);
  const normalized = normalizePasswordEntries(entries);
  const encrypted = await encryptPasswordEntries(normalized, password, base64ToBytes(vault.salt), vault.iterations);
  await chrome.storage.local.set({ [PASSWORD_VAULT_KEY]: encrypted });
  return { entries: normalized };
}

function validateMasterPassword(value) {
  const password = String(value || "");
  if (password.length < 8) throw new Error("A senha-mestra precisa ter pelo menos 8 caracteres.");
  if (password.length > 256) throw new Error("A senha-mestra ficou grande demais.");
  return password;
}

function normalizePasswordEntries(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.map((entry) => {
    const id = String(entry?.id || "").trim();
    const label = String(entry?.label || "").trim().slice(0, 80);
    const password = String(entry?.password || "").slice(0, 512);
    if (!id || !label || !password || seen.has(id)) return null;
    seen.add(id);
    return {
      id,
      label,
      username: String(entry?.username || "").trim().slice(0, 160),
      password,
      notes: String(entry?.notes || "").trim().slice(0, 500),
      createdAt: Number(entry?.createdAt) || Date.now(),
      updatedAt: Number(entry?.updatedAt) || Date.now()
    };
  }).filter(Boolean).slice(0, 150);
}

function isPasswordVaultEnvelope(value) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.iterations)) return false;
  // Keep the existing PBKDF2 + AES-GCM envelope; bound parameters before any
  // expensive key derivation or buffer allocations from potentially corrupt data.
  if (value.iterations < 100000 || value.iterations > 1000000) return false;
  const validBase64 = (input, minimum, maximum) =>
    typeof input === 'string' && input.length >= minimum && input.length <= maximum
      && input.length % 4 === 0 && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input);
  return validBase64(value.salt, 24, 24) && validBase64(value.iv, 16, 16)
    && validBase64(value.ciphertext, 24, 1024 * 1024);
}

async function encryptPasswordEntries(entries, password, salt, iterations) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derivePasswordVaultKey(password, salt, iterations);
  const plaintext = new TextEncoder().encode(JSON.stringify(entries));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  return {
    version: 1,
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext))
  };
}

async function decryptPasswordEntries(vault, password) {
  try {
    const salt = base64ToBytes(vault.salt);
    const iv = base64ToBytes(vault.iv);
    const ciphertext = base64ToBytes(vault.ciphertext);
    const key = await derivePasswordVaultKey(password, salt, Number(vault.iterations));
    const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch (_error) {
    throw new Error("Senha-mestra incorreta. Se ela foi perdida, o cofre não pode ser recuperado.");
  }
}

async function derivePasswordVaultKey(password, salt, iterations) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bytesToBase64(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(String(value || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function safeMessage(error) {
  return error?.message || "Ocorreu um erro inesperado.";
}

// v0.3.2 — only notify for downloads initiated through the Caixota download handler.
// Unrelated downloads from the browser are intentionally ignored.
chrome.downloads.onChanged.addListener(async change=>{
 if(change.state?.current!=='complete' && change.state?.current!=='interrupted')return;
 try{const data=await chrome.storage.local.get(['caixotaPendingDownloads','caixotaNotificationsV3']);const pending=data.caixotaPendingDownloads||{};const entry=pending[change.id];if(!entry)return;delete pending[change.id];const notifications=Array.isArray(data.caixotaNotificationsV3)?data.caixotaNotificationsV3:[];
 if(change.state.current==='complete')notifications.unshift({id:'download-'+change.id+'-'+Date.now(),kind:'download',title:'Arquivo pronto para abrir',message:String(entry.filename||'Download da Caixota').slice(0,160),downloadId:change.id,read:false,at:Date.now()});
 await chrome.storage.local.set({caixotaPendingDownloads:pending,caixotaNotificationsV3:notifications.slice(0,40)});
 }catch(err){console.warn('Falha na notificação de download',err);}
});

// Atalho configurável do navegador: ferramentas contextuais da aba em foco.
chrome.commands.onCommand.addListener(async command=>{
 if(command!=='open-page-popup')return;
 try{
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
  if(tab?.id)await chrome.tabs.sendMessage(tab.id,{type:'OPEN_PAGE_MENU'});
 }catch(error){console.info('Caixota: não é possível abrir o popup nesta página.',error?.message||error);}
});

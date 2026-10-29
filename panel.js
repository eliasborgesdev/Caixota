import {
  TEXT_TOOL_CATALOG as TOOL_CATALOG,
  IMAGE_TOOL_CATALOG,
  VIDEO_TOOL_CATALOG,
  PDF_TOOL_CATALOG,
  GENERATOR_TOOL_CATALOG,
  SETTINGS_SEARCH_CATALOG,
  CATEGORY_CATALOGS,
  CATEGORY_LABELS
} from "./panel-catalog.mjs";
import { translatePanel, resolveInterfaceLanguage } from "./panel-i18n.mjs";
import { setupDiagnostics } from "./panel-diagnostics.mjs";

const SETTINGS_KEY = "tremSettings";
const USAGE_KEY = "tremUsage";
const TOUR_KEY = "tremTutorialCompleted";
const PROFILE_KEY = "caixotaLocalProfile";
const LEGACY_CONVERTER_TO_IMAGE = {
  "converter-image": "image-convert",
  "converter-image-compress": "image-compress",
  "converter-gif-compress": "image-gif-compress",
  "converter-gif-frames": "image-gif-frames",
  "converter-frames-gif": "image-frames-gif"
};
const LEGACY_PDF_TO_COMBINE = new Set(["pdf-merge", "pdf-create", "pdf-image-to-pdf"]);
const MAX_CUSTOM_FONT_BYTES = 3 * 1024 * 1024;
const MAX_PROFILE_IMAGE_BYTES = 4 * 1024 * 1024;
const PIX_KEY = "00020126580014BR.GOV.BCB.PIX0136931340dd-e492-4a34-bffe-02f26acd0fca5204000053039865802BR5925Elias Adelson Borges Mito6009SAO PAULO6214051091EZ1ltBsg63045C98";
const STANDARD_THEMES = [
  { value: "dark", label: "Escuro" },
  { value: "light", label: "Claro" },
  { value: "midnight", label: "Meia-Noite" },
  { value: "oled", label: "OLED" },
  { value: "nineties", label: "Anos 90" },
  { value: "y2k", label: "Anos 2000" },
  { value: "cyber-drifter", label: "Cyberpunk Drifter" },
  { value: "cyber-2000", label: "Cyberpunk 2000" },
];
const STANDARD_THEME_IDS = new Set(STANDARD_THEMES.map((theme) => theme.value));
const TYPOGRAPHY_DEFAULTS = {
  scale: 1,
  titleScale: 1,
  subtitleScale: 1,
  smallScale: 1,
  letterSpacing: 0,
  titleLetterSpacing: -0.015,
  subtitleLetterSpacing: 0,
  smallLetterSpacing: 0.01,
  lineHeight: 1.5
};
const TYPOGRAPHY_CONTROLS = [
  { key: "typographyScale", numberId: "typographyScaleNumber", maxKey: "typographyScaleMax", maxId: "typographyScaleMax", min: 0.85, defaultMax: 1.25, hardMax: 4, fallback: TYPOGRAPHY_DEFAULTS.scale },
  { key: "typographyTitleScale", numberId: "typographyTitleScaleNumber", maxKey: "typographyTitleScaleMax", maxId: "typographyTitleScaleMax", min: 0.8, defaultMax: 1.35, hardMax: 4, fallback: TYPOGRAPHY_DEFAULTS.titleScale },
  { key: "typographySubtitleScale", numberId: "typographySubtitleScaleNumber", maxKey: "typographySubtitleScaleMax", maxId: "typographySubtitleScaleMax", min: 0.85, defaultMax: 1.3, hardMax: 4, fallback: TYPOGRAPHY_DEFAULTS.subtitleScale },
  { key: "typographySmallScale", numberId: "typographySmallScaleNumber", maxKey: "typographySmallScaleMax", maxId: "typographySmallScaleMax", min: 0.85, defaultMax: 1.25, hardMax: 4, fallback: TYPOGRAPHY_DEFAULTS.smallScale },
  { key: "typographyLetterSpacing", numberId: "typographyLetterSpacingNumber", maxKey: "typographyLetterSpacingMax", maxId: "typographyLetterSpacingMax", min: -0.05, defaultMax: 0.15, hardMax: 1, fallback: TYPOGRAPHY_DEFAULTS.letterSpacing },
  { key: "typographyTitleLetterSpacing", numberId: "typographyTitleLetterSpacingNumber", maxKey: "typographyTitleLetterSpacingMax", maxId: "typographyTitleLetterSpacingMax", min: -0.06, defaultMax: 0.18, hardMax: 1, fallback: TYPOGRAPHY_DEFAULTS.titleLetterSpacing },
  { key: "typographySubtitleLetterSpacing", numberId: "typographySubtitleLetterSpacingNumber", maxKey: "typographySubtitleLetterSpacingMax", maxId: "typographySubtitleLetterSpacingMax", min: -0.05, defaultMax: 0.15, hardMax: 1, fallback: TYPOGRAPHY_DEFAULTS.subtitleLetterSpacing },
  { key: "typographySmallLetterSpacing", numberId: "typographySmallLetterSpacingNumber", maxKey: "typographySmallLetterSpacingMax", maxId: "typographySmallLetterSpacingMax", min: -0.04, defaultMax: 0.18, hardMax: 1, fallback: TYPOGRAPHY_DEFAULTS.smallLetterSpacing },
  { key: "typographyLineHeight", numberId: "typographyLineHeightNumber", maxKey: "typographyLineHeightMax", maxId: "typographyLineHeightMax", min: 1.3, defaultMax: 1.85, hardMax: 5, fallback: TYPOGRAPHY_DEFAULTS.lineHeight }
];
const CUSTOM_THEME_INPUT_IDS = new Set([
  "customThemeBackground",
  "customThemeSurface",
  "customThemeAccent",
  "customThemeText",
  "customThemeMuted",
  "customThemeAccentText",
  "customThemeTitle",
  "customThemeSubtitle",
  "customThemeRadius",
  "customThemeBorderWidth",
  "customThemeShadow",
  "customThemeButtonStyle",
  "customThemeFieldStyle",
  "customThemePattern"
]);
const INTERNET_REQUIRED_SETTING_IDS = new Set([
  "currencyEnabled",
  "dictionaryEnabled",
  "translationEnabled"
]);
const INTERNET_OPTIONAL_SETTING_IDS = new Set(["imageTextEnabled", "imageQrEnabled"]);

const TOUR_STEPS = [
  {
    title: "Bem-vindo à Caixota",
    description: "A Caixota reúne ferramentas rápidas para texto, imagens, vídeo, PDF e geradores. Você pode usar o Painel ou chamar ferramentas diretamente enquanto navega.",
    visual: '<div class="tutorial-scene tutorial-welcome-scene"><div class="tutorial-brand-mark"><img src="icons/icon128.png" alt=""></div><span class="tutorial-welcome-pill">Sua caixa de ferramentas no navegador</span></div>'
  },
  {
    title: "Abra a Caixota onde você estiver",
    description: "Selecione um texto ou clique com o botão direito sobre uma imagem ou vídeo. Escolha Caixota para ver ações relacionadas ao que você selecionou.",
    visual: '<div class="tutorial-scene"><div class="tutorial-scene-card tutorial-context-window"><strong>Página atual</strong><span class="tutorial-context-selection"></span><span class="tutorial-context-selection"></span><span class="tutorial-context-selection"></span></div><div class="tutorial-scene-card tutorial-context-menu"><span>Menu de contexto</span><b>Caixota <em>›</em></b><small>Mostra ferramentas compatíveis</small></div></div>'
  },
  {
    title: "Encontre a ferramenta certa",
    description: "No Painel, navegue por Texto, Imagens, Vídeo, PDF e Geradores ou use a busca global. Os cards mostram rapidamente se a ferramenta funciona offline ou precisa de internet.",
    visual: '<div class="tutorial-scene tutorial-category-scene"><div class="tutorial-scene-card tutorial-category-list"><strong>Categorias</strong><i class="is-active">Texto</i><i>Imagens</i><i>Vídeo</i><i>PDF</i><i>Geradores</i></div><div class="tutorial-scene-card tutorial-search-card"><div class="tutorial-search-box">⌕ Buscar ferramenta…</div><div class="tutorial-tool-row"><b>✂</b><span><strong>Editor Rápido</strong><small>Vídeo · Offline</small></span><em>›</em></div><div class="tutorial-tool-row"><b>▧</b><span><strong>Converter Imagem</strong><small>Imagens · Offline</small></span><em>›</em></div></div></div>'
  },
  {
    title: "Processe arquivos no próprio dispositivo",
    description: "Nas ferramentas locais, arraste ou escolha um arquivo, ajuste as opções e exporte o resultado. Quando aparecer Offline, o arquivo não é enviado para um servidor.",
    visual: '<div class="tutorial-scene tutorial-drop-scene"><div class="tutorial-scene-card tutorial-drop-zone"><b>＋</b><strong>Arraste um arquivo</strong><small>ou clique para selecionar</small></div><div class="tutorial-scene-card tutorial-offline-card"><i>Offline</i><strong>Privacidade primeiro</strong><span>Conversões e edições compatíveis acontecem no navegador.</span></div></div>'
  },
  {
    title: "Favorite o que você mais usa",
    description: "Clique na estrela de uma ferramenta para fixá-la. Você também pode manter Recentes ativado para voltar rapidamente às últimas ferramentas utilizadas.",
    visual: '<div class="tutorial-scene tutorial-shortcut-scene"><div class="tutorial-scene-card tutorial-shortcut-card"><span>Favorito</span><div class="tutorial-star">★</div><strong>Um clique para guardar</strong></div><div class="tutorial-scene-card tutorial-shortcut-card"><strong>Recentes</strong><div class="tutorial-recent-list"><i>Converter Vídeo</i><i>Juntar Arquivos em PDF</i><i>Contador de Texto</i></div></div></div>'
  },
  {
    title: "Deixe a Caixota com a sua cara",
    description: "Em Configurações você pode trocar tema, fonte, tamanho dos textos, animações e comportamento. Suas preferências ficam salvas localmente no navegador.",
    visual: '<div class="tutorial-scene tutorial-settings-scene"><div class="tutorial-scene-card tutorial-settings-card"><strong>Personalização</strong><div class="tutorial-setting-row"><span>Tema</span><small>Escuro azul</small></div><div class="tutorial-setting-row"><span>Tipografia</span><small>Tamanho e limites</small></div><div class="tutorial-setting-row"><span>Efeitos visuais</span><i class="tutorial-mini-toggle"></i></div></div><div class="tutorial-scene-card tutorial-privacy-lock"><div><b>⌂</b><strong>Preferências locais</strong><span>Você continua no controle do que usa e ativa.</span></div></div></div>'
  }
];

const PROFILE_DEFAULTS = { name: "", bio: "", instructions: "", avatarData: "" };

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
  typographyScaleMax: 1.25,
  typographyTitleScaleMax: 1.35,
  typographySubtitleScaleMax: 1.3,
  typographySmallScaleMax: 1.25,
  typographyLetterSpacingMax: 0.15,
  typographyTitleLetterSpacingMax: 0.18,
  typographySubtitleLetterSpacingMax: 0.15,
  typographySmallLetterSpacingMax: 0.18,
  typographyLineHeightMax: 1.85,
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
  targetLanguage: "pt",
  interfaceLanguage: "auto"
};

buildToolCards();
decorateStaticIcons();

const simpleInputIds = Object.keys(DEFAULT_SETTINGS).filter((key) => !["favorites", "imageFavorites", "videoFavorites", "pdfFavorites", "generatorFavorites", "converterFavorites", "customFolders", "folderAssignments", "toolAliases", "customFontName", "customFontData", "themePresets", "activeThemePresetId", "fontSize"].includes(key));
const elements = Object.fromEntries(simpleInputIds.map((id) => [id, document.getElementById(id)]));
const saveNotifications = document.getElementById("saveNotifications");
const currencyPreview = document.getElementById("currencyPreview");
const rateStatus = document.getElementById("rateStatus");
const refreshButton = document.getElementById("refreshRates");
const favoritesSummary = document.getElementById("favoritesSummary");
const customFolderList = document.getElementById("customFolderList");
const clearFavoritesButton = document.getElementById("clearFavorites");
const addCustomFolderButton = document.getElementById("addCustomFolder");
const customFolderNameInput = document.getElementById("customFolderName");
const customFolderDescriptionInput = document.getElementById("customFolderDescription");
const folderFormStatus = document.getElementById("folderFormStatus");
const customThemeEditor = document.getElementById("customThemeEditor");
const customThemePreview = document.getElementById("customThemePreview");
const clearHistoryButton = document.getElementById("clearHistory");
const usageSummary = document.getElementById("usageSummary");
const currentShortcut = document.getElementById("currentShortcut");
const configureShortcutButton = document.getElementById("configureShortcut");
const shortcutStatus = document.getElementById("shortcutStatus");
const replayTutorialButton = document.getElementById("replayTutorial");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialStepLabel = document.getElementById("tutorialStepLabel");
const tutorialVisual = document.getElementById("tutorialVisual");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialDescription = document.getElementById("tutorialDescription");
const tutorialDots = document.getElementById("tutorialDots");
const tutorialBackButton = document.getElementById("tutorialBack");
const tutorialNextButton = document.getElementById("tutorialNext");
const tutorialSkipButton = document.getElementById("tutorialSkip");
const customFontControls = document.getElementById("customFontControls");
const customFontFile = document.getElementById("customFontFile");
const customFontName = document.getElementById("customFontName");
const removeCustomFontButton = document.getElementById("removeCustomFont");
const fontStatus = document.getElementById("fontStatus");
const themePresetName = document.getElementById("themePresetName");
const createThemePresetButton = document.getElementById("createThemePreset");
const editThemePresetButton = document.getElementById("editThemePreset");
const deleteSelectedThemeButton = document.getElementById("deleteSelectedTheme");
const saveThemePresetButton = document.getElementById("saveThemePreset");
const cancelThemePresetButton = document.getElementById("cancelThemePreset");
const themeEditorTitle = document.getElementById("themeEditorTitle");
const themePresetStatus = document.getElementById("themePresetStatus");
const profileNameInput = document.getElementById("profileName");
const profileBioInput = document.getElementById("profileBio");
const profileInstructionsInput = document.getElementById("profileInstructions");
const profileAvatarInput = document.getElementById("profileAvatarInput");
const removeProfileAvatarButton = document.getElementById("removeProfileAvatar");
const profilePhotoStatus = document.getElementById("profilePhotoStatus");
const newsTrack = document.getElementById("newsTrack");
const carouselDots = document.getElementById("carouselDots");
const carouselPrevButton = document.getElementById("carouselPrev");
const carouselNextButton = document.getElementById("carouselNext");
const showPixDonationButton = document.getElementById("showPixDonation");
const pixDonationPanel = document.getElementById("pixDonationPanel");
const copyPixKeyButton = document.getElementById("copyPixKey");
const pixCopyStatus = document.getElementById("pixCopyStatus");
const resetTypographyButton = document.getElementById("resetTypography");
const typographyPreview = document.getElementById("typographyPreview");
const toolAliasCategory = document.getElementById("toolAliasCategory");
const toolAliasTool = document.getElementById("toolAliasTool");
const toolAliasInput = document.getElementById("toolAliasInput");
const saveToolAliasButton = document.getElementById("saveToolAlias");
const removeToolAliasButton = document.getElementById("removeToolAlias");
const toolAliasStatus = document.getElementById("toolAliasStatus");
const toolAliasList = document.getElementById("toolAliasList");
const globalSearchTrigger = document.getElementById("globalSearchTrigger");
const globalSearchOverlay = document.getElementById("globalSearchOverlay");
const globalSearchInput = document.getElementById("globalSearchInput");
const globalSearchResults = document.getElementById("globalSearchResults");
const globalSearchClose = document.getElementById("globalSearchClose");

let organizationState = { favorites: [], imageFavorites: [], videoFavorites: [], pdfFavorites: [], generatorFavorites: [], converterFavorites: [], customFolders: [], folderAssignments: {} };
let usageState = createEmptyToolUsage();
let currentSettings = { ...DEFAULT_SETTINGS };
let themePresetState = { items: [], activeId: "" };
let profileState = { ...PROFILE_DEFAULTS };
let profileSaveTimer;
let themeEditorMode = "create";
let tutorialIndex = 0;
let tutorialPreviousFocus = null;
let loadedPopupFontData = "";
let loadedPopupFontFace = null;
let activeCarouselSlide = 0;
let carouselTimer = 0;
let globalSearchItems = [];
let globalSearchMatches = [];
let globalSearchActiveIndex = 0;
let globalSearchPreviousFocus = null;
let typographySaveTimer = 0;

globalThis.CaixotaPanelBridge = Object.freeze({
  createNetworkBadge,
  isFavorite: isToolFavorite,
  toggleFavorite: toggleToolFavorite,
  openTool: openToolTarget,
  getToolLabel: getToolDisplayLabel,
  visualEffectsEnabled: () => currentSettings.visualEffectsEnabled !== false
});

initialize();

async function initialize() {
  const stored = await chrome.storage.local.get([SETTINGS_KEY, USAGE_KEY, TOUR_KEY, PROFILE_KEY]);
  const settings = normalizeSettings(stored[SETTINGS_KEY]);
  usageState = normalizeToolUsage(stored[USAGE_KEY]);
  profileState = normalizeProfile(stored[PROFILE_KEY]);
  currentSettings = { ...settings };
  themePresetState = {
    items: settings.themePresets.map((preset) => ({ ...preset })),
    activeId: settings.activeThemePresetId
  };
  organizationState = {
    favorites: [...settings.favorites],
    imageFavorites: [...settings.imageFavorites],
    videoFavorites: [...settings.videoFavorites],
    pdfFavorites: [...settings.pdfFavorites],
    generatorFavorites: [...settings.generatorFavorites],
    converterFavorites: [],
    customFolders: settings.customFolders.map((folder) => ({ ...folder })),
    folderAssignments: { ...settings.folderAssignments }
  };

  applySettingsToInputs(settings);
  applyProfileToInputs(profileState);
  translatePanel(resolveInterfaceLanguage(settings.interfaceLanguage));

  setupTabs();
  setupGeneralSubtabs();
  setupGlobalSearch();
  setupSettingsCategories();
  setupSettingsEvents();
  setupDiagnostics();
  setupCustomTheme();
  setupThemePresets();
  setupFontSettings();
  setupNetworkIndicators();
  setupOrganizationEvents();
  setupToolAliases();
  refreshToolLabels();
  setupUxEvents();
  setupProfileEvents();
  setupDonation();
  setupCarousel();
  updateCategoryCounts();
  renderOrganization();
  refreshFavoriteButtons();
  renderProfile();
  renderHomeDashboard();
  updateCurrentDate();
  updatePreviews();
  await updateRateStatus();
  await updateShortcutStatus();
  sendPopupMessage({ type: "REGISTER_PANEL" });
  window.__caixotaPanelReady = true;

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes[USAGE_KEY]) {
      usageState = normalizeToolUsage(changes[USAGE_KEY].newValue);
      renderUsageSummary();
      renderHomeDashboard();
    }
    if (area === "local" && changes[SETTINGS_KEY]) {
      const nextSettings = normalizeSettings(changes[SETTINGS_KEY].newValue);
      currentSettings = { ...nextSettings };
      themePresetState = {
        items: nextSettings.themePresets.map((preset) => ({ ...preset })),
        activeId: nextSettings.activeThemePresetId
      };
      organizationState = {
        favorites: [...nextSettings.favorites],
        imageFavorites: [...nextSettings.imageFavorites],
        videoFavorites: [...nextSettings.videoFavorites],
        pdfFavorites: [...nextSettings.pdfFavorites],
        generatorFavorites: [...nextSettings.generatorFavorites],
        converterFavorites: [],
        customFolders: nextSettings.customFolders.map((folder) => ({ ...folder })),
        folderAssignments: { ...nextSettings.folderAssignments }
      };
      applySettingsToInputs(nextSettings);
      renderThemeOptions(nextSettings);
      renderFontOptions(nextSettings.fontFamily);
      applyPopupTheme(nextSettings);
      applyPopupFont(nextSettings);
      renderOrganization();
      renderHomeDashboard();
      refreshToolCardStates();
      refreshToolLabels();
      refreshFavoriteButtons();
      translatePanel(resolveInterfaceLanguage(nextSettings.interfaceLanguage));
      document.dispatchEvent(new CustomEvent("caixota:favorites-updated"));
      document.dispatchEvent(new CustomEvent("caixota:aliases-updated"));
    }
    if (area === "local" && changes[PROFILE_KEY]) {
      profileState = normalizeProfile(changes[PROFILE_KEY].newValue);
      if (![profileNameInput, profileBioInput, profileInstructionsInput].includes(document.activeElement)) applyProfileToInputs(profileState);
      renderProfile();
      renderHomeDashboard();
    }
  });

  await consumePendingMediaContext();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "session" && changes.caixotaMediaContext?.newValue?.openTool) consumePendingMediaContext();
  });

  const requestedView = String(location.hash || "").replace(/^#/, "");
  if (["home", "tools", "settings", "donation", "profile"].includes(requestedView) && !document.body.dataset.mediaContextOpened) navigateToView(requestedView, false);
  if (stored[TOUR_KEY] !== true && !document.body.classList.contains("cx-workbench")) setTimeout(() => showTutorial(0), 100);
}

async function consumePendingMediaContext() {
  if (!chrome.storage?.session?.get) return;
  try {
    const stored = await chrome.storage.session.get("caixotaMediaContext");
    const context = stored?.caixotaMediaContext;
    if (!context?.openTool) return;
    document.body.dataset.mediaContextOpened = "true";
    openToolTarget("video", "video-convert");
    await chrome.storage.session.set({ caixotaMediaContext: { ...context, openTool: false } });
  } catch (_error) {}
}

function applySettingsToInputs(settings) {
  for (const [key, value] of Object.entries(settings)) {
    const element = elements[key];
    if (!element) continue;
    if (element.type === "checkbox") element.checked = Boolean(value);
    else element.value = String(value);
  }
  for (const control of TYPOGRAPHY_CONTROLS) {
    const maxValue = clampNumber(settings[control.maxKey], control.min + 0.001, control.hardMax, control.defaultMax);
    const slider = elements[control.key];
    const number = document.getElementById(control.numberId);
    const maxNumber = elements[control.maxKey];
    if (slider) slider.max = String(maxValue);
    if (number) {
      number.max = String(maxValue);
      number.value = String(clampNumber(settings[control.key], control.min, maxValue, control.fallback));
    }
    if (maxNumber) maxNumber.value = String(maxValue);
  }
}

function normalizeProfile(value = {}) {
  const profile = { ...PROFILE_DEFAULTS, ...(value && typeof value === "object" ? value : {}) };
  return {
    name: String(profile.name || "").trim().slice(0, 40),
    bio: String(profile.bio || "").trim().slice(0, 240),
    instructions: String(profile.instructions || "").slice(0, 1200),
    avatarData: /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(String(profile.avatarData || "")) ? String(profile.avatarData) : ""
  };
}

function applyProfileToInputs(profile) {
  if (profileNameInput) profileNameInput.value = profile.name;
  if (profileBioInput) profileBioInput.value = profile.bio;
  if (profileInstructionsInput) profileInstructionsInput.value = profile.instructions;
}

function normalizeSettings(value = {}) {
  const source = value && typeof value === "object" ? value : {};
  const settings = { ...DEFAULT_SETTINGS, ...source };
  settings.theme = settings.theme === "classic" ? "dark" : settings.theme;
  if (settings.theme === "liquid-light") settings.theme = "light";
  if (settings.theme === "liquid-dark") settings.theme = "dark";
  settings.theme = [...STANDARD_THEME_IDS, "custom"].includes(settings.theme) ? settings.theme : "dark";
  settings.interfaceLanguage = ["auto", "pt", "en", "de", "es", "fr", "it", "nl", "ja", "zh", "ru", "ko", "pl", "esd"].includes(settings.interfaceLanguage) ? settings.interfaceLanguage : "auto";
  settings.foldersEnabled = Boolean(settings.foldersEnabled);
  settings.recentToolsEnabled = settings.recentToolsEnabled !== false;
  settings.visualEffectsEnabled = settings.visualEffectsEnabled !== false;
  const legacyPasswordFavorite = Array.isArray(settings.favorites) && settings.favorites.includes("password");
  settings.favorites = Array.isArray(settings.favorites) ? [...new Set(settings.favorites.filter((id) => TOOL_CATALOG.some((tool) => tool.id === id)))] : [];
  const migratedImageFavorites = [
    ...(Array.isArray(source.imageFavorites) ? source.imageFavorites : []),
    ...(Array.isArray(source.converterFavorites) ? source.converterFavorites.map((id) => LEGACY_CONVERTER_TO_IMAGE[id]).filter(Boolean) : [])
  ];
  settings.imageFavorites = [...new Set(migratedImageFavorites.filter((id) => IMAGE_TOOL_CATALOG.some((tool) => tool.id === id)))];
  settings.videoFavorites = Array.isArray(settings.videoFavorites) ? [...new Set(settings.videoFavorites.filter((id) => VIDEO_TOOL_CATALOG.some((tool) => tool.id === id)))] : [];
  const migratedPdfFavorites = (Array.isArray(source.pdfFavorites) ? source.pdfFavorites : []).map((id) => LEGACY_PDF_TO_COMBINE.has(id) ? "pdf-combine" : id);
  settings.pdfFavorites = [...new Set(migratedPdfFavorites.filter((id) => PDF_TOOL_CATALOG.some((tool) => tool.id === id)))];
  settings.generatorFavorites = [...new Set([...(Array.isArray(settings.generatorFavorites) ? settings.generatorFavorites : []), ...(legacyPasswordFavorite ? ["generator-password"] : [])].filter((id) => GENERATOR_TOOL_CATALOG.some((tool) => tool.id === id)))];
  settings.converterFavorites = [];
  const migratedScale = Object.prototype.hasOwnProperty.call(source, "typographyScale")
    ? source.typographyScale
    : clampNumber(Number(source.fontSize || 15) / 15, 0.9, 1.15, TYPOGRAPHY_DEFAULTS.scale);
  for (const control of TYPOGRAPHY_CONTROLS) {
    const rawMax = Number(settings[control.maxKey]);
    const dynamicMax = clampNumber(rawMax, control.min + 0.001, control.hardMax, control.defaultMax);
    settings[control.maxKey] = dynamicMax;
    const rawValue = control.key === "typographyScale" ? migratedScale : settings[control.key];
    settings[control.key] = clampNumber(rawValue, control.min, dynamicMax, control.fallback);
  }
  // Mantido como espelho de compatibilidade para instalações anteriores à v0.1.7.
  settings.fontSize = Math.round(15 * settings.typographyScale);
  settings.customFolders = Array.isArray(settings.customFolders)
    ? settings.customFolders.map(sanitizeFolder).filter(Boolean).sort(sortFolders)
    : [];
  const validFolderIds = new Set(settings.customFolders.map((folder) => folder.id));
  settings.folderAssignments = Object.fromEntries(Object.entries(settings.folderAssignments && typeof settings.folderAssignments === "object" ? settings.folderAssignments : {})
    .filter(([toolId, folderId]) => TOOL_CATALOG.some((tool) => tool.id === toolId && tool.settingId) && validFolderIds.has(folderId)));
  settings.customThemeBackground = normalizeHex(settings.customThemeBackground, "#1c1f26");
  settings.customThemeSurface = normalizeHex(settings.customThemeSurface, "#252a33");
  settings.customThemeAccent = normalizeHex(settings.customThemeAccent, "#9b5d58");
  settings.customThemeText = normalizeHex(settings.customThemeText, readableTextColor(settings.customThemeBackground));
  settings.customThemeMuted = normalizeHex(settings.customThemeMuted, mixHex(settings.customThemeText, settings.customThemeBackground, 0.62));
  settings.customThemeAccentText = normalizeHex(settings.customThemeAccentText, readableTextColor(settings.customThemeAccent));
  settings.customThemeTitle = normalizeHex(settings.customThemeTitle, settings.customThemeText);
  settings.customThemeSubtitle = normalizeHex(settings.customThemeSubtitle, settings.customThemeMuted);
  settings.customThemeRadius = Math.round(clampNumber(settings.customThemeRadius, 0, 24, 14));
  settings.customThemeBorderWidth = Math.round(clampNumber(settings.customThemeBorderWidth, 1, 3, 1));
  settings.customThemeShadow = ["none", "soft", "strong", "retro"].includes(settings.customThemeShadow) ? settings.customThemeShadow : "soft";
  settings.customThemeButtonStyle = ["solid", "outline", "raised"].includes(settings.customThemeButtonStyle) ? settings.customThemeButtonStyle : "solid";
  settings.customThemeFieldStyle = ["soft", "outline", "inset"].includes(settings.customThemeFieldStyle) ? settings.customThemeFieldStyle : "soft";
  settings.customThemePattern = ["none", "grid", "dots", "scanlines"].includes(settings.customThemePattern) ? settings.customThemePattern : "none";
  settings.fontFamily = ["default", "trebuchet", "arial", "georgia", "courier", "custom"].includes(settings.fontFamily) ? settings.fontFamily : "default";
  settings.customFontName = String(settings.customFontName || "").trim().slice(0, 120);
  settings.customFontData = typeof settings.customFontData === "string" ? settings.customFontData : "";
  if (settings.fontFamily === "custom" && !settings.customFontData) settings.fontFamily = "default";
  settings.themePresets = normalizeThemePresets(settings.themePresets);
  settings.activeThemePresetId = settings.themePresets.some((preset) => preset.id === settings.activeThemePresetId)
    ? String(settings.activeThemePresetId)
    : "";
  if (settings.theme === "custom" && !settings.activeThemePresetId) {
    let migrated = settings.themePresets.find((preset) => preset.id === "theme-migrated");
    if (!migrated) {
      migrated = {
        id: "theme-migrated",
        name: "Meu Tema",
        background: settings.customThemeBackground,
        surface: settings.customThemeSurface,
        accent: settings.customThemeAccent,
        text: settings.customThemeText,
        muted: settings.customThemeMuted,
        accentText: settings.customThemeAccentText,
        title: settings.customThemeTitle,
        subtitle: settings.customThemeSubtitle,
        radius: settings.customThemeRadius,
        borderWidth: settings.customThemeBorderWidth,
        shadow: settings.customThemeShadow,
        buttonStyle: settings.customThemeButtonStyle,
        fieldStyle: settings.customThemeFieldStyle,
        pattern: settings.customThemePattern
      };
      settings.themePresets.push(migrated);
    }
    settings.activeThemePresetId = migrated.id;
  }
  const validAliasKeys = new Set(Object.entries(CATEGORY_CATALOGS).flatMap(([category, catalog]) => catalog.map((tool) => `${category}:${tool.id}`)));
  const migratedAliases = {};
  for (const [rawKey, rawValue] of Object.entries(source.toolAliases && typeof source.toolAliases === "object" ? source.toolAliases : {})) {
    let key = String(rawKey);
    if (key === "text:password") key = "generators:generator-password";
    if (key.startsWith("converter:")) {
      const mapped = LEGACY_CONVERTER_TO_IMAGE[key.slice("converter:".length)];
      if (mapped) key = `images:${mapped}`;
    } else if (key.startsWith("pdf:") && LEGACY_PDF_TO_COMBINE.has(key.slice(4))) {
      key = "pdf:pdf-combine";
    }
    const value = String(rawValue || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (validAliasKeys.has(key) && value && !migratedAliases[key]) migratedAliases[key] = value;
  }
  settings.toolAliases = migratedAliases;
  return settings;
}

function normalizeThemePresets(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.map((preset) => {
    const id = String(preset?.id || "").trim();
    const name = String(preset?.name || "").trim().slice(0, 32);
    if (!id || !name || seen.has(id)) return null;
    seen.add(id);
    return {
      id,
      name,
      background: normalizeHex(preset.background, "#1c1f26"),
      surface: normalizeHex(preset.surface, "#252a33"),
      accent: normalizeHex(preset.accent, "#9b5d58"),
      text: normalizeHex(preset.text, "#f7f8fa"),
      muted: normalizeHex(preset.muted, "#a8afb9"),
      accentText: normalizeHex(preset.accentText, "#ffffff"),
      title: normalizeHex(preset.title, preset.text || "#f7f8fa"),
      subtitle: normalizeHex(preset.subtitle, preset.muted || "#a8afb9"),
      radius: Math.round(clampNumber(preset.radius, 0, 24, 14)),
      borderWidth: Math.round(clampNumber(preset.borderWidth, 1, 3, 1)),
      shadow: ["none", "soft", "strong", "retro"].includes(preset.shadow) ? preset.shadow : "soft",
      buttonStyle: ["solid", "outline", "raised"].includes(preset.buttonStyle) ? preset.buttonStyle : "solid",
      fieldStyle: ["soft", "outline", "inset"].includes(preset.fieldStyle) ? preset.fieldStyle : "soft",
      pattern: ["none", "grid", "dots", "scanlines"].includes(preset.pattern) ? preset.pattern : "none"
    };
  }).filter(Boolean).slice(0, 24);
}

function createEmptyToolUsage() {
  return { recent: { text: [], image: [], video: [], pdf: [], generator: [] }, counts: { text: {}, image: {}, video: {}, pdf: {}, generator: {} }, timeline: [] };
}

function normalizeToolUsage(value = {}) {
  const normalized = createEmptyToolUsage();
  const validIds = {
    text: new Set(TOOL_CATALOG.map((tool) => tool.id)),
    image: new Set([...IMAGE_TOOL_CATALOG.map((tool) => tool.id), "image-pdf"]),
    video: new Set(VIDEO_TOOL_CATALOG.map((tool) => tool.id)),
    pdf: new Set(PDF_TOOL_CATALOG.map((tool) => tool.id)),
    generator: new Set(GENERATOR_TOOL_CATALOG.map((tool) => tool.id))
  };
  const remap = (mode, id) => {
    const raw = String(id || "");
    if (mode === "converter") return { mode: "image", id: LEGACY_CONVERTER_TO_IMAGE[raw] || raw };
    if (mode === "pdf" && LEGACY_PDF_TO_COMBINE.has(raw)) return { mode: "pdf", id: "pdf-combine" };
    return { mode, id: raw };
  };
  for (const sourceMode of ["text", "image", "video", "pdf", "generator", "converter"]) {
    const recent = Array.isArray(value?.recent?.[sourceMode]) ? value.recent[sourceMode] : [];
    for (const rawId of recent) {
      const mapped = remap(sourceMode, rawId);
      if (!validIds[mapped.mode]?.has(mapped.id)) continue;
      normalized.recent[mapped.mode] = [...new Set([...normalized.recent[mapped.mode], mapped.id])].slice(0, 10);
    }
    const counts = value?.counts?.[sourceMode] && typeof value.counts[sourceMode] === "object" ? value.counts[sourceMode] : {};
    for (const [rawId, rawCount] of Object.entries(counts)) {
      const mapped = remap(sourceMode, rawId);
      const count = Math.floor(Number(rawCount));
      if (validIds[mapped.mode]?.has(mapped.id) && Number.isFinite(count) && count > 0) {
        normalized.counts[mapped.mode][mapped.id] = (normalized.counts[mapped.mode][mapped.id] || 0) + count;
      }
    }
  }
  const timeline = Array.isArray(value?.timeline) ? value.timeline : [];
  normalized.timeline = timeline.map((entry) => {
    const mapped = remap(String(entry?.mode || ""), String(entry?.id || ""));
    return { mode: mapped.mode, id: mapped.id, at: Math.max(0, Math.floor(Number(entry?.at) || 0)) };
  }).filter((entry) => validIds[entry.mode]?.has(entry.id))
    .filter((entry, index, array) => array.findIndex((item) => item.mode === entry.mode && item.id === entry.id) === index)
    .sort((a, b) => b.at - a.at).slice(0, 30);
  if (!normalized.timeline.length) {
    normalized.timeline = Object.entries(normalized.recent).flatMap(([mode, ids]) => ids.map((id, index) => ({ mode, id, at: 1_000_000 - index * 10 })));
  }
  return normalized;
}

function clampNumber(value, minimum, maximum, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function sanitizeFolder(folder) {
  if (!folder || typeof folder !== "object") return null;
  const id = String(folder.id || "").trim();
  const name = String(folder.name || "").trim().slice(0, 28);
  if (!id || !name) return null;
  return { id, name, description: String(folder.description || "").trim().slice(0, 72) };
}

function sortFolders(a, b) {
  return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
}

function setupTabs() {
  document.querySelectorAll("[data-nav-view]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      navigateToView(button.dataset.navView);
    });
  });
}

function setupGeneralSubtabs() {
  document.querySelectorAll("[data-tools-view]").forEach((button) => {
    button.addEventListener("click", () => selectToolsCategory(button.dataset.toolsView));
  });
}

function selectToolsCategory(view) {
  const normalized = CATEGORY_CATALOGS[view] ? view : "text";
  const previous = document.querySelector("[data-tools-view].is-active")?.dataset.toolsView || "text";
  if (previous !== normalized && (["text", "images", "video", "pdf", "generators"].includes(previous))) {
    document.dispatchEvent(new CustomEvent("caixota:reset-direct-tools", { detail: { category: previous } }));
  }
  document.querySelectorAll("[data-tools-view]").forEach((item) => {
    const active = item.dataset.toolsView === normalized;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll("[data-tools-group]").forEach((group) => group.classList.toggle("is-active", group.dataset.toolsGroup === normalized));
  if (["text", "images", "video", "pdf", "generators"].includes(normalized)) {
    document.dispatchEvent(new CustomEvent("caixota:show-direct-catalog", { detail: { category: normalized } }));
  }
}

// A Home reutiliza o mesmo roteamento e sistema de categorias da página Ferramentas.
document.querySelectorAll("[data-home-category]").forEach((entry) => {
  entry.addEventListener("click", () => {
    navigateToView("tools");
    selectToolsCategory(entry.dataset.homeCategory);
  });
});
document.getElementById("homeSearchButton")?.addEventListener("click", () => document.getElementById("globalSearchTrigger")?.click());

function updateCategoryCounts() {
  for (const [category, catalog] of Object.entries(CATEGORY_CATALOGS)) {
    document.querySelectorAll(`[data-category-count="${category}"], [data-home-tool-count="${category}"]`).forEach((element) => { element.textContent = String(catalog.length); });
  }
}

function setupSettingsCategories() {
  document.querySelectorAll("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => openSettingsCategory(button.dataset.openSettings));
  });
  document.querySelectorAll("[data-settings-back]").forEach((button) => button.addEventListener("click", showSettingsIndex));
}

function navigateToView(view, updateHash = true) {
  const normalized = ["home", "tools", "settings", "donation", "profile"].includes(view) ? view : "home";
  const previous = document.querySelector(".app-view.is-active")?.dataset.view || "home";
  if (previous === "tools" && normalized !== "tools") {
    document.dispatchEvent(new CustomEvent("caixota:reset-direct-tools", { detail: { category: "all" } }));
  }
  document.querySelectorAll(".app-view").forEach((section) => section.classList.toggle("is-active", section.dataset.view === normalized));
  document.querySelectorAll(".sidebar-button, .profile-nav").forEach((button) => {
    const active = button.dataset.navView === normalized;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (normalized === "settings") showSettingsIndex();
  if (updateHash) history.replaceState(null, "", `#${normalized}`);
  window.scrollTo({ top: 0, behavior: currentSettings.visualEffectsEnabled ? "smooth" : "auto" });
}

function openSettingsCategory(category) {
  document.getElementById("settingsIndex")?.classList.remove("is-active");
  document.querySelectorAll("[data-settings-category]").forEach((section) => section.classList.toggle("is-active", section.dataset.settingsCategory === category));
  window.scrollTo({ top: 0, behavior: currentSettings.visualEffectsEnabled ? "smooth" : "auto" });
}

function showSettingsIndex() {
  document.getElementById("settingsIndex")?.classList.add("is-active");
  document.querySelectorAll("[data-settings-category]").forEach((section) => section.classList.remove("is-active"));
}

function setupCustomTheme() {
  const updatePreview = () => updateCustomThemePreview({ ...currentSettings, ...themeInputSettings() });
  for (const id of CUSTOM_THEME_INPUT_IDS) elements[id]?.addEventListener("input", updatePreview);
  customThemeEditor.hidden = true;
  updatePreview();
  applyPopupTheme(currentSettings);
}

function setupThemePresets() {
  elements.theme?.addEventListener("change", async () => {
    const preset = selectedThemePreset();
    themePresetState.activeId = preset?.id || "";
    if (preset) applyThemePresetToInputs(preset);
    closeThemeEditor();
    updateThemeManagementButtons();
    await saveSettings();
  });

  createThemePresetButton?.addEventListener("click", () => {
    themeEditorMode = "create";
    themePresetName.value = "";
    applyThemePresetToInputs({
      background: "#1c1f26",
      surface: "#252a33",
      accent: "#9b5d58",
      text: "#f7f8fa",
      muted: "#a8afb9",
      accentText: "#ffffff",
      title: "#f7f8fa",
      subtitle: "#a8afb9",
      radius: 14,
      borderWidth: 1,
      shadow: "soft",
      buttonStyle: "solid",
      fieldStyle: "soft",
      pattern: "none"
    });
    themeEditorTitle.textContent = "Criar tema personalizado";
    customThemeEditor.hidden = false;
    setThemePresetStatus("Escolha um nome e ajuste as cores antes de salvar.", false);
    requestAnimationFrame(() => themePresetName.focus());
  });

  editThemePresetButton?.addEventListener("click", () => {
    const preset = selectedThemePreset();
    if (!preset) return;
    themeEditorMode = "edit";
    themePresetState.activeId = preset.id;
    themePresetName.value = preset.name;
    applyThemePresetToInputs(preset);
    themeEditorTitle.textContent = `Editar “${preset.name}”`;
    customThemeEditor.hidden = false;
    setThemePresetStatus("As alterações serão aplicadas ao salvar.", false);
    requestAnimationFrame(() => themePresetName.focus());
  });

  saveThemePresetButton?.addEventListener("click", async () => {
    const name = String(themePresetName.value || "").trim().slice(0, 32);
    if (!name) {
      setThemePresetStatus("Dê um nome ao preset antes de salvar.", true);
      themePresetName.focus();
      return;
    }
    const editingId = themeEditorMode === "edit" ? themePresetState.activeId : "";
    const duplicate = themePresetState.items.find((preset) => preset.id !== editingId && preset.name.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0);
    if (duplicate) {
      setThemePresetStatus("Já existe um preset com esse nome.", true);
      return;
    }

    const colors = collectThemePresetColors();
    const existing = themePresetState.items.find((preset) => preset.id === editingId);
    let savedPreset;
    if (existing) {
      Object.assign(existing, colors, { name });
      savedPreset = existing;
    } else {
      const preset = { id: `theme-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name, ...colors };
      themePresetState.items.push(preset);
      savedPreset = preset;
    }
    themePresetState.items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }));
    themePresetState.activeId = savedPreset.id;
    currentSettings.theme = "custom";
    currentSettings.activeThemePresetId = savedPreset.id;
    applyThemePresetToInputs(savedPreset);
    renderThemeOptions(currentSettings);
    await saveSettings();
    closeThemeEditor();
  });

  deleteSelectedThemeButton?.addEventListener("click", async () => {
    const preset = selectedThemePreset();
    if (!preset || !confirm(`Excluir o tema “${preset.name}”?`)) return;
    themePresetState.items = themePresetState.items.filter((item) => item.id !== preset.id);
    themePresetState.activeId = "";
    currentSettings.theme = "dark";
    currentSettings.activeThemePresetId = "";
    renderThemeOptions(currentSettings);
    closeThemeEditor();
    await saveSettings();
  });

  cancelThemePresetButton?.addEventListener("click", closeThemeEditor);
  renderThemeOptions(currentSettings);
}

function renderThemeOptions(settings = currentSettings) {
  if (!elements.theme) return;
  elements.theme.replaceChildren();
  for (const theme of STANDARD_THEMES) {
    const option = document.createElement("option");
    option.value = theme.value;
    option.textContent = theme.label;
    elements.theme.appendChild(option);
  }
  for (const preset of [...themePresetState.items].sort((a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }))) {
    const option = document.createElement("option");
    option.value = `preset:${preset.id}`;
    option.textContent = preset.name;
    elements.theme.appendChild(option);
  }
  const activePresetExists = themePresetState.items.some((preset) => preset.id === settings.activeThemePresetId);
  elements.theme.value = settings.theme === "custom" && activePresetExists ? `preset:${settings.activeThemePresetId}` : (STANDARD_THEME_IDS.has(settings.theme) ? settings.theme : "dark");
  themePresetState.activeId = selectedThemePreset()?.id || "";
  updateThemeManagementButtons();
}

function selectedThemePreset() {
  const value = String(elements.theme?.value || "");
  if (!value.startsWith("preset:")) return null;
  const id = value.slice("preset:".length);
  return themePresetState.items.find((preset) => preset.id === id) || null;
}

function updateThemeManagementButtons() {
  const customSelected = Boolean(selectedThemePreset());
  if (editThemePresetButton) editThemePresetButton.disabled = !customSelected;
  if (deleteSelectedThemeButton) deleteSelectedThemeButton.disabled = !customSelected;
}

function closeThemeEditor() {
  if (!customThemeEditor) return;
  customThemeEditor.hidden = true;
  themePresetName.value = "";
  setThemePresetStatus("", false);
  const selected = selectedThemePreset();
  if (selected) applyThemePresetToInputs(selected);
  else applyThemePresetToInputs({
    background: currentSettings.customThemeBackground,
    surface: currentSettings.customThemeSurface,
    accent: currentSettings.customThemeAccent,
    text: currentSettings.customThemeText,
    muted: currentSettings.customThemeMuted,
    accentText: currentSettings.customThemeAccentText,
    title: currentSettings.customThemeTitle,
    subtitle: currentSettings.customThemeSubtitle,
    radius: currentSettings.customThemeRadius,
    borderWidth: currentSettings.customThemeBorderWidth,
    shadow: currentSettings.customThemeShadow,
    buttonStyle: currentSettings.customThemeButtonStyle,
    fieldStyle: currentSettings.customThemeFieldStyle,
    pattern: currentSettings.customThemePattern
  });
}

function collectThemePresetColors() {
  return {
    background: normalizeHex(elements.customThemeBackground.value, "#1c1f26"),
    surface: normalizeHex(elements.customThemeSurface.value, "#252a33"),
    accent: normalizeHex(elements.customThemeAccent.value, "#9b5d58"),
    text: normalizeHex(elements.customThemeText.value, "#f7f8fa"),
    muted: normalizeHex(elements.customThemeMuted.value, "#a8afb9"),
    accentText: normalizeHex(elements.customThemeAccentText.value, "#ffffff"),
    title: normalizeHex(elements.customThemeTitle.value, "#f7f8fa"),
    subtitle: normalizeHex(elements.customThemeSubtitle.value, "#a8afb9"),
    radius: Math.round(clampNumber(elements.customThemeRadius.value, 0, 24, 14)),
    borderWidth: Math.round(clampNumber(elements.customThemeBorderWidth.value, 1, 3, 1)),
    shadow: ["none", "soft", "strong", "retro"].includes(elements.customThemeShadow.value) ? elements.customThemeShadow.value : "soft",
    buttonStyle: ["solid", "outline", "raised"].includes(elements.customThemeButtonStyle.value) ? elements.customThemeButtonStyle.value : "solid",
    fieldStyle: ["soft", "outline", "inset"].includes(elements.customThemeFieldStyle.value) ? elements.customThemeFieldStyle.value : "soft",
    pattern: ["none", "grid", "dots", "scanlines"].includes(elements.customThemePattern.value) ? elements.customThemePattern.value : "none"
  };
}

function themeInputSettings() {
  const preset = collectThemePresetColors();
  return {
    customThemeBackground: preset.background,
    customThemeSurface: preset.surface,
    customThemeAccent: preset.accent,
    customThemeText: preset.text,
    customThemeMuted: preset.muted,
    customThemeAccentText: preset.accentText,
    customThemeTitle: preset.title,
    customThemeSubtitle: preset.subtitle,
    customThemeRadius: preset.radius,
    customThemeBorderWidth: preset.borderWidth,
    customThemeShadow: preset.shadow,
    customThemeButtonStyle: preset.buttonStyle,
    customThemeFieldStyle: preset.fieldStyle,
    customThemePattern: preset.pattern
  };
}

function applyThemePresetToInputs(preset) {
  elements.customThemeBackground.value = preset.background;
  elements.customThemeSurface.value = preset.surface;
  elements.customThemeAccent.value = preset.accent;
  elements.customThemeText.value = preset.text;
  elements.customThemeMuted.value = preset.muted;
  elements.customThemeAccentText.value = preset.accentText;
  elements.customThemeTitle.value = preset.title || preset.text;
  elements.customThemeSubtitle.value = preset.subtitle || preset.muted;
  elements.customThemeRadius.value = String(clampNumber(preset.radius, 0, 24, 14));
  elements.customThemeBorderWidth.value = String(Math.round(clampNumber(preset.borderWidth, 1, 3, 1)));
  elements.customThemeShadow.value = preset.shadow || "soft";
  elements.customThemeButtonStyle.value = preset.buttonStyle || "solid";
  elements.customThemeFieldStyle.value = preset.fieldStyle || "soft";
  elements.customThemePattern.value = preset.pattern || "none";
  updateCustomThemePreview({
    customThemeBackground: preset.background,
    customThemeSurface: preset.surface,
    customThemeAccent: preset.accent,
    customThemeText: preset.text,
    customThemeMuted: preset.muted,
    customThemeAccentText: preset.accentText,
    customThemeTitle: preset.title || preset.text,
    customThemeSubtitle: preset.subtitle || preset.muted,
    customThemeRadius: preset.radius,
    customThemeBorderWidth: preset.borderWidth,
    customThemeShadow: preset.shadow,
    customThemeButtonStyle: preset.buttonStyle,
    customThemeFieldStyle: preset.fieldStyle,
    customThemePattern: preset.pattern
  });
}

function setThemePresetStatus(message, isError) {
  if (!themePresetStatus) return;
  themePresetStatus.textContent = message;
  themePresetStatus.classList.toggle("is-error", Boolean(isError));
}

function setupFontSettings() {
  const typographyInputs = TYPOGRAPHY_CONTROLS.flatMap((control) => [elements[control.key], document.getElementById(control.numberId), elements[control.maxKey]]).filter(Boolean);
  const typographyDraft = () => Object.fromEntries(TYPOGRAPHY_CONTROLS.flatMap((control) => {
    const maxValue = clampNumber(elements[control.maxKey]?.value, control.min + 0.001, control.hardMax, control.defaultMax);
    return [[control.maxKey, maxValue], [control.key, clampNumber(elements[control.key]?.value, control.min, maxValue, control.fallback)]];
  }));
  const updateTypography = (save = false) => {
    const draft = {
      ...currentSettings,
      ...typographyDraft()
    };
    applyPopupFont(draft);
    updateTypographyOutputs(draft);
    if (save) {
      clearTimeout(typographySaveTimer);
      typographySaveTimer = setTimeout(() => saveSettings({ notify: false }), 180);
    }
  };
  const updateControls = () => {
    if (!customFontControls) return;
    customFontName.textContent = currentSettings.customFontName || "Nenhuma fonte enviada";
    removeCustomFontButton.disabled = !currentSettings.customFontData;
    applyPopupFont({ ...currentSettings, fontFamily: elements.fontFamily?.value || "default" });
    updateTypographyOutputs({
      ...currentSettings,
      ...typographyDraft()
    });
  };

  for (const control of TYPOGRAPHY_CONTROLS) {
    const slider = elements[control.key];
    const number = document.getElementById(control.numberId);
    const maxNumber = elements[control.maxKey];
    if (!slider || !number || !maxNumber) continue;

    const applyMaximum = (save = true) => {
      const maxValue = clampNumber(maxNumber.value, control.min + 0.001, control.hardMax, control.defaultMax);
      maxNumber.value = String(maxValue);
      slider.max = String(maxValue);
      number.max = String(maxValue);
      const current = clampNumber(slider.value, control.min, maxValue, control.fallback);
      slider.value = String(current);
      number.value = String(current);
      updateTypography(save);
    };

    const synchronize = (source) => {
      if (source === number && number.value === "") return;
      const dynamicMax = clampNumber(maxNumber.value, control.min + 0.001, control.hardMax, control.defaultMax);
      const value = clampNumber(source.value, control.min, dynamicMax, control.fallback);
      slider.max = String(dynamicMax);
      number.max = String(dynamicMax);
      slider.value = String(value);
      number.value = String(value);
      updateTypography(true);
    };

    applyMaximum(false);
    slider.addEventListener("input", () => synchronize(slider));
    number.addEventListener("input", () => {
      if (number.value !== "" && Number.isFinite(Number(number.value))) synchronize(number);
    });
    number.addEventListener("change", () => synchronize(number));
    maxNumber.addEventListener("input", () => {
      if (maxNumber.value !== "" && Number.isFinite(Number(maxNumber.value))) applyMaximum(true);
    });
    maxNumber.addEventListener("change", () => applyMaximum(true));
  }
  resetTypographyButton?.addEventListener("click", async () => {
    for (const control of TYPOGRAPHY_CONTROLS) {
      if (elements[control.key]) elements[control.key].value = String(control.fallback);
      const number = document.getElementById(control.numberId);
      if (number) number.value = String(control.fallback);
      const maxNumber = elements[control.maxKey];
      if (maxNumber) maxNumber.value = String(control.defaultMax);
      if (elements[control.key]) elements[control.key].max = String(control.defaultMax);
      if (number) number.max = String(control.defaultMax);
    }
    updateTypography(false);
    await saveSettings();
    fontStatus.textContent = "Ajustes tipográficos restaurados; a fonte atual foi mantida.";
  });

  elements.fontFamily?.addEventListener("change", () => {
    updateControls();
    fontStatus.textContent = "";
  });

  customFontFile?.addEventListener("change", async () => {
    const file = customFontFile.files?.[0];
    customFontFile.value = "";
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["ttf", "otf", "woff", "woff2"].includes(extension || "")) {
      fontStatus.textContent = "Formato inválido. Use TTF, OTF, WOFF ou WOFF2.";
      return;
    }
    if (file.size > MAX_CUSTOM_FONT_BYTES) {
      fontStatus.textContent = "A fonte precisa ter no máximo 3 MB.";
      return;
    }

    try {
      fontStatus.textContent = "Carregando fonte…";
      const data = arrayBufferToBase64(await file.arrayBuffer());
      await validateCustomFontData(data);
      currentSettings.customFontData = data;
      currentSettings.customFontName = file.name.slice(0, 120);
      renderFontOptions("custom");
      elements.fontFamily.value = "custom";
      const safeTypography = suggestSafeTypography();
      elements.typographyScale.value = String(safeTypography.scale);
      elements.typographyLetterSpacing.value = String(safeTypography.letterSpacing);
      elements.typographyLineHeight.value = String(safeTypography.lineHeight);
      document.getElementById("typographyScaleNumber").value = String(safeTypography.scale);
      document.getElementById("typographyLetterSpacingNumber").value = String(safeTypography.letterSpacing);
      document.getElementById("typographyLineHeightNumber").value = String(safeTypography.lineHeight);
      updateTypography(false);
      await saveSettings();
      updateControls();
      fontStatus.textContent = "Fonte aplicada em toda a Caixota ✓";
    } catch (_error) {
      fontStatus.textContent = "Não foi possível ler essa fonte. Tente outro arquivo.";
    }
  });

  removeCustomFontButton?.addEventListener("click", async () => {
    currentSettings.customFontData = "";
    currentSettings.customFontName = "";
    renderFontOptions("default");
    elements.fontFamily.value = "default";
    await saveSettings();
    updateControls();
    fontStatus.textContent = "Fonte personalizada removida.";
  });

  renderFontOptions(currentSettings.fontFamily);
  for (const control of TYPOGRAPHY_CONTROLS) {
    const maxValue = clampNumber(currentSettings[control.maxKey], control.min + 0.001, control.hardMax, control.defaultMax);
    const value = clampNumber(currentSettings[control.key], control.min, maxValue, control.fallback);
    if (elements[control.key]) {
      elements[control.key].max = String(maxValue);
      elements[control.key].value = String(value);
    }
    const number = document.getElementById(control.numberId);
    if (number) {
      number.max = String(maxValue);
      number.value = String(value);
    }
    if (elements[control.maxKey]) elements[control.maxKey].value = String(maxValue);
  }
  updateControls();
}

function suggestSafeTypography() {
  return { scale: 0.98, letterSpacing: 0.005, lineHeight: 1.52 };
}

function updateTypographyOutputs(settings) {
  const scale = clampNumber(settings.typographyScale, 0.85, 1.25, 1);
  const titleScale = clampNumber(settings.typographyTitleScale, 0.8, 1.35, 1);
  const subtitleScale = clampNumber(settings.typographySubtitleScale, 0.85, 1.3, 1);
  const smallScale = clampNumber(settings.typographySmallScale, 0.85, 1.25, 1);
  const spacing = clampNumber(settings.typographyLetterSpacing, -0.05, 0.15, 0);
  const titleSpacing = clampNumber(settings.typographyTitleLetterSpacing, -0.06, 0.18, -0.015);
  const subtitleSpacing = clampNumber(settings.typographySubtitleLetterSpacing, -0.05, 0.15, 0);
  const smallSpacing = clampNumber(settings.typographySmallLetterSpacing, -0.04, 0.18, 0.01);
  const lineHeight = clampNumber(settings.typographyLineHeight, 1.3, 1.85, 1.5);
  if (typographyPreview) {
    typographyPreview.style.setProperty("--preview-type-scale", String(scale));
    typographyPreview.style.setProperty("--preview-title-scale", String(titleScale));
    typographyPreview.style.setProperty("--preview-subtitle-scale", String(subtitleScale));
    typographyPreview.style.setProperty("--preview-small-scale", String(smallScale));
    typographyPreview.style.setProperty("--preview-letter-spacing", `${spacing}em`);
    typographyPreview.style.setProperty("--preview-title-letter-spacing", `${titleSpacing}em`);
    typographyPreview.style.setProperty("--preview-subtitle-letter-spacing", `${subtitleSpacing}em`);
    typographyPreview.style.setProperty("--preview-small-letter-spacing", `${smallSpacing}em`);
    typographyPreview.style.setProperty("--preview-line-height", String(lineHeight));
  }
}

function renderFontOptions(selectedFamily = currentSettings.fontFamily) {
  if (!elements.fontFamily) return;
  const options = [
    ["default", "Roboto"],
    ["trebuchet", "Trebuchet MS"],
    ["arial", "Arial"],
    ["georgia", "Georgia"],
    ["courier", "Courier New"]
  ];
  if (currentSettings.customFontData && currentSettings.customFontName) {
    options.push(["custom", customFontDisplayName(currentSettings.customFontName)]);
  }
  elements.fontFamily.replaceChildren(...options.map(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
  const valid = options.some(([value]) => value === selectedFamily);
  elements.fontFamily.value = valid ? selectedFamily : "default";
}

function customFontDisplayName(filename) {
  return String(filename || "Minha Fonte").replace(/\.(?:ttf|otf|woff2?)$/i, "").trim() || "Minha Fonte";
}

function setupNetworkIndicators() {
  refreshToolCardStates();
}

function createNetworkIndicator(network, compact = true) {
  const indicator = document.createElement("span");
  indicator.className = `network-indicator ${network === "required" ? "needs-internet" : (network === "optional" ? "may-use-internet" : "works-offline")}${compact ? " is-compact" : ""}`;
  const label = network === "required" ? "Requer conexão para funcionar." : (network === "optional" ? "Funciona localmente, mas alguns recursos podem usar internet." : "Funciona sem conexão.");
  indicator.title = label;
  indicator.setAttribute("aria-label", label);
  indicator.innerHTML = network !== "offline"
    ? `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.7" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M2.6 8h10.8M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.2 8 13.7M8 2.3C6.5 3.8 5.7 5.7 5.7 8s.8 4.2 2.3 5.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.05"/></svg><span>${network === "required" ? "Internet" : "Internet Opcional"}</span>`
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 7.2a6.8 6.8 0 0 1 9.6 0M5.1 9.2a4.1 4.1 0 0 1 5.8 0M6.8 11.1a1.7 1.7 0 0 1 2.4 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.25"/><path d="m2.2 2.2 11.6 11.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.35"/></svg><span>Offline</span>';
  return indicator;
}

function buildToolCards() {
  const textGrid = document.getElementById("textToolsGrid");
  const imageGrid = document.getElementById("imageToolsGrid");
  const generatorGrid = document.getElementById("generatorToolsGrid");
  if (textGrid) renderCatalogSections(textGrid, TOOL_CATALOG, "text");
  if (imageGrid) renderCatalogSections(imageGrid, IMAGE_TOOL_CATALOG, "images");
  if (generatorGrid) renderCatalogSections(generatorGrid, GENERATOR_TOOL_CATALOG, "generators");
}

function renderCatalogSections(container, catalog, category) {
  const groups = [];
  for (const tool of catalog) {
    let group = groups.find((item) => item.label === tool.group);
    if (!group) {
      group = { label: tool.group || "Ferramentas", tools: [] };
      groups.push(group);
    }
    group.tools.push(tool);
  }
  container.replaceChildren(...groups.map((group) => {
    const section = document.createElement("section");
    section.className = "tool-category-section";
    const heading = document.createElement("div");
    heading.className = "tool-section-heading";
    const title = document.createElement("h3");
    title.textContent = group.label;
    const count = document.createElement("span");
    count.textContent = `${group.tools.length} ${group.tools.length === 1 ? "ferramenta" : "ferramentas"}`;
    heading.append(title, count);
    const grid = document.createElement("div");
    grid.className = "tools-grid";
    grid.append(...group.tools.map((tool) => createToolCard(tool, category)));
    section.append(heading, grid);
    return section;
  }));
}

function createToolCard(tool, category) {
  const card = document.createElement("article");
  card.className = "tool-card";
  card.dataset.toolId = tool.id;
  card.dataset.toolCategory = category;
  if (tool.settingId) card.dataset.settingId = tool.settingId;

  const icon = document.createElement("span");
  icon.className = "tool-card-icon";
  icon.innerHTML = iconMarkup(tool.icon);

  const copy = document.createElement("div");
  copy.className = "tool-card-copy";
  const title = document.createElement("h3");
  title.textContent = tool.label;
  const description = document.createElement("p");
  description.textContent = tool.description;
  copy.append(title, description, createNetworkBadge(tool.network || "offline"));

  const actions = document.createElement("div");
  actions.className = "tool-card-actions";
  const imageDirectCard = Boolean(tool.direct);
  actions.append(createFavoriteButton(tool, category));

  if (tool.settingId) {
    const toggle = document.createElement("label");
    toggle.className = "switch";
    toggle.title = `Ativar ou desativar ${tool.label} no menu contextual`;
    const input = document.createElement("input");
    input.id = tool.settingId;
    input.type = "checkbox";
    input.setAttribute("aria-label", `Ativar ${tool.label} no menu contextual`);
    const slider = document.createElement("span");
    toggle.append(input, slider);
    toggle.addEventListener("click", (event) => event.stopPropagation());
    actions.append(toggle);
  }

  if (imageDirectCard) {
    card.classList.add("is-clickable");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Abrir ${tool.label}`);
    const chevron = document.createElement("span");
    chevron.className = "tool-card-chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg>';
    actions.append(chevron);
    const openCard = () => openToolTarget(category, tool.id);
    card.addEventListener("click", (event) => {
      if (event.target.closest("button, label, input, select, textarea, a")) return;
      openCard();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });
  } else if (tool.direct) {
    const open = document.createElement("button");
    open.type = "button";
    open.className = "tool-open-button";
    open.textContent = "Abrir";
    open.setAttribute("aria-label", `Abrir ${tool.label}`);
    open.addEventListener("click", () => openToolTarget(category, tool.id));
    actions.append(open);
  }

  card.append(icon, copy, actions);
  return card;
}

function createFavoriteButton(tool, category) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tool-favorite-button";
  button.dataset.favoriteTool = tool.id;
  button.dataset.favoriteCategory = category;
  button.innerHTML = iconMarkup("star");
  button.setAttribute("aria-label", `Favoritar ${tool.label}`);
  button.title = `Favoritar ${tool.label}`;
  button.addEventListener("click", () => toggleToolFavorite(category, tool.id));
  return button;
}

function toolAliasKey(category, toolId) {
  return `${category}:${toolId}`;
}

function getToolDisplayLabel(category, toolOrId, fallback = "") {
  const toolId = typeof toolOrId === "object" ? toolOrId?.id : toolOrId;
  const catalog = CATEGORY_CATALOGS[category] || [];
  const original = typeof toolOrId === "object" ? toolOrId?.label : catalog.find((tool) => tool.id === toolId)?.label;
  return currentSettings.toolAliases?.[toolAliasKey(category, toolId)] || fallback || original || String(toolId || "Ferramenta");
}

function setupToolAliases() {
  if (!toolAliasCategory || !toolAliasTool || !toolAliasInput) return;
  const fillAliasInput = () => {
    const key = toolAliasKey(toolAliasCategory.value, toolAliasTool.value);
    toolAliasInput.value = currentSettings.toolAliases?.[key] || "";
    if (removeToolAliasButton) removeToolAliasButton.disabled = !currentSettings.toolAliases?.[key];
  };
  const renderTools = () => {
    const category = CATEGORY_CATALOGS[toolAliasCategory.value] ? toolAliasCategory.value : "text";
    const previous = toolAliasTool.value;
    toolAliasTool.replaceChildren(...CATEGORY_CATALOGS[category].map((tool) => {
      const option = document.createElement("option");
      option.value = tool.id;
      option.textContent = getToolDisplayLabel(category, tool);
      return option;
    }));
    if ([...toolAliasTool.options].some((option) => option.value === previous)) toolAliasTool.value = previous;
    fillAliasInput();
  };
  toolAliasCategory.addEventListener("change", renderTools);
  toolAliasTool.addEventListener("change", fillAliasInput);
  saveToolAliasButton?.addEventListener("click", async () => {
    const category = toolAliasCategory.value;
    const toolId = toolAliasTool.value;
    const alias = String(toolAliasInput.value || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (!alias) {
      toolAliasStatus.textContent = "Digite um apelido antes de salvar.";
      toolAliasStatus.classList.add("is-error");
      toolAliasInput.focus();
      return;
    }
    currentSettings.toolAliases = { ...(currentSettings.toolAliases || {}), [toolAliasKey(category, toolId)]: alias };
    toolAliasStatus.textContent = "Apelido salvo. O nome original continua sendo usado nas palavras-chave.";
    toolAliasStatus.classList.remove("is-error");
    await saveSettings({ notify: false });
    refreshToolLabels();
    renderTools();
  });
  removeToolAliasButton?.addEventListener("click", async () => {
    const key = toolAliasKey(toolAliasCategory.value, toolAliasTool.value);
    if (!currentSettings.toolAliases?.[key]) return;
    const aliases = { ...(currentSettings.toolAliases || {}) };
    delete aliases[key];
    currentSettings.toolAliases = aliases;
    toolAliasStatus.textContent = "Apelido removido; o nome original voltou a aparecer.";
    toolAliasStatus.classList.remove("is-error");
    await saveSettings({ notify: false });
    refreshToolLabels();
    renderTools();
  });
  toolAliasInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") saveToolAliasButton?.click();
  });
  renderTools();
  renderToolAliasList();
}

function renderToolAliasList() {
  if (!toolAliasList) return;
  toolAliasList.replaceChildren();
  const entries = Object.entries(currentSettings.toolAliases || {});
  if (!entries.length) {
    const empty = document.createElement("span");
    empty.className = "empty-inline";
    empty.textContent = "Nenhum apelido criado.";
    toolAliasList.appendChild(empty);
    return;
  }
  for (const [key, alias] of entries.sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))) {
    const separator = key.indexOf(":");
    const category = key.slice(0, separator);
    const toolId = key.slice(separator + 1);
    const tool = CATEGORY_CATALOGS[category]?.find((item) => item.id === toolId);
    if (!tool) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-chip alias-chip";
    button.textContent = `${alias} · ${tool.label}`;
    button.title = "Editar este apelido";
    button.addEventListener("click", () => {
      toolAliasCategory.value = category;
      toolAliasCategory.dispatchEvent(new Event("change"));
      toolAliasTool.value = toolId;
      toolAliasTool.dispatchEvent(new Event("change"));
      toolAliasInput.focus();
    });
    toolAliasList.appendChild(button);
  }
}

function refreshToolLabels() {
  document.querySelectorAll(".tool-card[data-tool-category][data-tool-id]").forEach((card) => {
    const category = card.dataset.toolCategory;
    const tool = CATEGORY_CATALOGS[category]?.find((item) => item.id === card.dataset.toolId);
    if (!tool) return;
    const label = getToolDisplayLabel(category, tool);
    const title = card.querySelector(".tool-card-copy h3");
    if (title) title.textContent = label;
    const toggle = card.querySelector(".switch");
    if (toggle) toggle.title = `Ativar ou desativar ${label}`;
    card.querySelector("input[type=checkbox]")?.setAttribute("aria-label", `Ativar ${label}`);
  });
  rebuildGlobalSearchItems();
  renderToolAliasList();
  renderFavoriteSummary();
  renderUsageSummary();
  renderHomeDashboard();
  document.dispatchEvent(new CustomEvent("caixota:aliases-updated"));
}

function favoriteKeyForCategory(category) {
  return ({ text: "favorites", images: "imageFavorites", video: "videoFavorites", pdf: "pdfFavorites", generators: "generatorFavorites" })[category] || "";
}

function isToolFavorite(category, toolId) {
  const key = favoriteKeyForCategory(category);
  return Boolean(key && organizationState[key]?.includes(toolId));
}

async function toggleToolFavorite(category, toolId) {
  const key = favoriteKeyForCategory(category);
  const catalog = CATEGORY_CATALOGS[category] || [];
  if (!key || !catalog.some((tool) => tool.id === toolId)) return false;
  const favorites = new Set(organizationState[key] || []);
  if (favorites.has(toolId)) favorites.delete(toolId);
  else favorites.add(toolId);
  organizationState[key] = [...favorites];
  refreshFavoriteButtons();
  renderOrganization();
  renderHomeDashboard();
  document.dispatchEvent(new CustomEvent("caixota:favorites-updated"));
  await saveSettings({ notify: false });
  return favorites.has(toolId);
}

function refreshFavoriteButtons() {
  document.querySelectorAll("[data-favorite-tool][data-favorite-category]").forEach((button) => {
    const active = isToolFavorite(button.dataset.favoriteCategory, button.dataset.favoriteTool);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    const verb = active ? "Desfavoritar" : "Favoritar";
    button.setAttribute("aria-label", `${verb} ferramenta`);
    button.title = `${verb} ferramenta`;
  });
}

function createNetworkBadge(network) {
  const badge = document.createElement("span");
  const normalized = network === "required" ? "required" : (network === "optional" ? "optional" : "offline");
  badge.className = `network-badge ${normalized === "required" ? "needs-internet" : (normalized === "optional" ? "may-use-internet" : "works-offline")}`;
  const label = normalized === "required" ? "Internet" : (normalized === "optional" ? "Internet Opcional" : "Offline");
  badge.title = normalized === "required" ? "Requer conexão para funcionar." : (normalized === "optional" ? "Funciona localmente, mas alguns recursos podem usar internet." : "Funciona sem conexão.");
  badge.setAttribute("aria-label", `${label}. ${badge.title}`);
  badge.innerHTML = normalized === "offline"
    ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.1 7.1a6.9 6.9 0 0 1 9.8 0M5.1 9.1a4.1 4.1 0 0 1 5.8 0M6.8 11.2a1.7 1.7 0 0 1 2.4 0M2.2 2.2l11.6 11.6"/></svg>'
    : '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.7"/><path d="M2.6 8h10.8M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.2 8 13.7M8 2.3C6.5 3.8 5.7 5.7 5.7 8s.8 4.2 2.3 5.7"/></svg>';
  badge.append(document.createTextNode(label));
  return badge;
}

function refreshToolCardStates() {
  for (const tool of [...TOOL_CATALOG, ...IMAGE_TOOL_CATALOG]) {
    if (!tool.settingId) continue;
    const input = document.getElementById(tool.settingId);
    const card = document.querySelector(`.tool-card[data-tool-id="${tool.id}"]`);
    card?.classList.toggle("is-disabled", !input?.checked);
  }
}

function decorateStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((element) => {
    element.innerHTML = iconMarkup(element.dataset.icon);
  });
}

function iconMarkup(name) {
  const common = 'viewBox="0 0 24 24" aria-hidden="true"';
  const icons = {
    currency: '<rect x="4.5" y="5.2" width="15" height="13.6" rx="3.2"/><path d="M7.5 10h9M7.5 14h9M8.2 7.8l2.1-1.5M15.8 16.2l-2.1 1.5"/>',
    calculate: '<rect x="5" y="3.8" width="14" height="16.4" rx="3.2"/><path d="M7.5 8h9M8.4 12h2M14.6 11v2M13.6 12h2M8.2 16h2.2M13.6 15l2 2M15.6 15l-2 2"/>',
    encode: '<rect x="5.2" y="10" width="13.6" height="8.5" rx="2.4"/><path d="M8.2 10V8.4a3.8 3.8 0 0 1 7.6 0V10M10.2 14.2h3.6"/>',
    compare: '<path d="M7.2 6.5h9.6M7.2 10.3h6.2M7.2 14.1h9.6M7.2 17.9h6.2M4.6 9.3 3 10.9l1.6 1.6M19.4 13.1l1.6 1.6-1.6 1.6"/>',
    counter: '<path d="M8 5 6.8 19M14.6 5 13.4 19M4.8 9.1h12.4M4 14.9h12.4"/>',
    ruler: '<rect x="4.2" y="8" width="15.6" height="7.8" rx="2.4" transform="rotate(-12 12 12)"/><path d="M8.8 9.1v2.5M11.3 8.6v4.2M13.8 8.2v2.5M16.2 7.7v4.2"/>',
    palette: '<path d="M12 4.2c-4.7 0-8.4 3.4-8.4 7.8 0 3.8 3 6.8 6.2 6.8h1c1 0 1.7-.7 1.7-1.6 0-.4-.2-.9-.5-1.2-.2-.2-.3-.4-.3-.7 0-.9.8-1.5 1.8-1.5H14c3.5 0 6.4-2.7 6.4-6.1 0-4.2-3.8-7.5-8.4-7.5Z"/><circle cx="8" cy="10" r=".8"/><circle cx="11.2" cy="8.3" r=".8"/><circle cx="15" cy="10" r=".8"/>',
    calendar: '<rect x="4.3" y="5.3" width="15.4" height="14.2" rx="3"/><path d="M4.8 9.2h14.4M8 4.6v3M16 4.6v3M8.2 12h3.6v3H8.2Z"/>',
    book: '<path d="M6.2 5.5h8.2a3 3 0 0 1 3 3V18a18.6 18.6 0 0 0-8.2-1.7A18.4 18.4 0 0 0 6 18V7.2a1.7 1.7 0 0 1 .2-.8Z"/><path d="M9.2 8.4h5M9.2 11h5M9.2 13.6h3.4"/>',
    notes: '<rect x="5" y="4.5" width="14" height="15" rx="2.6"/><path d="M8.2 8.5h7.6M8.2 11.6h7.6M8.2 14.7h5.1"/>',
    type: '<path d="M5.6 7h12.8M12 7v10.2M8 19h8"/>',
    speaker: '<path d="M5 14.8h3.5l4.4 3.5V5.7L8.5 9.2H5ZM16 9.1a4.4 4.4 0 0 1 0 5.8M17.9 7.3a7 7 0 0 1 0 9.4"/>',
    broom: '<path d="m14.3 5.4 4.2 4.2M6.5 17.6 16.1 8l1.8 1.8-9.6 9.6H6.5ZM5.7 18.4h4.8"/>',
    link: '<path d="M9.2 14.8 7.6 16.4a3.1 3.1 0 0 1-4.4-4.4l2.4-2.4A3.1 3.1 0 0 1 10 9.4M14.8 9.2l1.6-1.6a3.1 3.1 0 1 1 4.4 4.4l-2.4 2.4a3.1 3.1 0 0 1-4.4.2M8.7 15.3l6.6-6.6"/>',
    list: '<rect x="5" y="4.6" width="14" height="15.4" rx="2.8"/><path d="M8.3 9h7.2M8.3 12.4h7.2M8.3 15.8h5.1"/>',
    sort: '<path d="M8 6.3v11.2M8 17.5l-2.2-2.2M8 17.5l2.2-2.2M15.7 17.7V6.5M15.7 6.5l-2.2 2.2M15.7 6.5l2.2 2.2"/>',
    password: '<rect x="4.7" y="7.2" width="14.6" height="11.5" rx="3"/><path d="M8 7.2V6.1a4 4 0 0 1 8 0v1.1M9 13h.01M12 13h.01M15 13h.01"/>',
    translate: '<path d="M6 6.2h6.8M9.4 6.2v1.3A9.1 9.1 0 0 1 6.5 13c1.2.9 2.6 1.6 4.2 2.1M13.7 9.3h4.7M16.1 7v6.8M14.4 13.8h3.4"/>',
    capture: '<rect x="4.4" y="6.2" width="15.2" height="11.8" rx="2.8"/><circle cx="12" cy="12.1" r="3.1"/><path d="M8.2 6.2 9.4 4.7h5.2l1.2 1.5"/>',
    compress: '<rect x="5" y="6" width="14" height="12" rx="2.8"/><path d="M9.5 9.2 7.3 12l2.2 2.8M14.5 9.2l2.2 2.8-2.2 2.8"/>',
    "image-convert": '<rect x="4.6" y="5.4" width="9.2" height="13.2" rx="2.2"/><rect x="10.2" y="7" width="9.2" height="13.2" rx="2.2"/><path d="M9.2 12h5.6"/>',
    "image-info": '<circle cx="12" cy="12" r="8"/><path d="M12 10.2v5.1M12 8h.01"/>',
    "image-pdf": '<path d="M7 4.8h7.2l3 3V19a1.8 1.8 0 0 1-1.8 1.8H7A1.8 1.8 0 0 1 5.2 19V6.6A1.8 1.8 0 0 1 7 4.8ZM14.2 4.9V8h3M7.9 14h8.2M7.9 17h5.1"/>',
    qr: '<path d="M5 5h5v5H5ZM14 5h5v5h-5ZM5 14h5v5H5ZM14 14h2v2h-2M17 14h2v5h-2M14 17h2v2h-2"/>',
    "image-resize": '<path d="M8 8H5.4V5.4M16 8h2.6V5.4M8 16H5.4v2.6M16 16h2.6v2.6"/><rect x="8.3" y="8.3" width="7.4" height="7.4" rx="1.8"/>',
    "image-text": '<rect x="5" y="5" width="14" height="14" rx="2.5"/><path d="M8 9.2h8M10 12h4M8.8 15.1h6.4"/>',
    "image-rotate": '<path d="M7.5 8.2V5.5L4.8 8.2l2.7 2.7V8.2a5 5 0 1 1-1.1 6.6"/>',
    folder: '<path d="M4.2 8.1a2.3 2.3 0 0 1 2.3-2.3h4l1.5 1.8h5.5a2.3 2.3 0 0 1 2.3 2.3v7.5a2.3 2.3 0 0 1-2.3 2.3h-11a2.3 2.3 0 0 1-2.3-2.3Z"/>',
    "folder-plus": '<path d="M4.2 8.1a2.3 2.3 0 0 1 2.3-2.3h4l1.5 1.8h5.5a2.3 2.3 0 0 1 2.3 2.3v7.5a2.3 2.3 0 0 1-2.3 2.3h-11a2.3 2.3 0 0 1-2.3-2.3ZM12 11v5M9.5 13.5h5"/>',
    cursor: '<path d="m6 3.8 11.7 8-5.3 1.2-2.2 5.2Z"/><path d="m12.5 13.1 3.9 4"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.8 9.3a2.4 2.4 0 1 1 3.2 2.3c-.8.3-1 1-1 1.7M12 16.8h.01"/>',
    star: '<path d="m12 4.2 2.3 4.6 5.1.7-3.7 3.6.9 5-4.6-2.4-4.6 2.4.9-5-3.7-3.6 5.1-.7Z"/>',
    history: '<path d="M4.4 8.5V4.8M4.4 8.5h3.7M5.3 7a8 8 0 1 1-1 7.4M12 7.8v4.5l3 1.8"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.8 8.6 8.8 12s1 6.2 3.2 8.5"/>',
    scan: '<path d="M4.5 8V5.5a1 1 0 0 1 1-1H8M16 4.5h2.5a1 1 0 0 1 1 1V8M19.5 16v2.5a1 1 0 0 1-1 1H16M8 19.5H5.5a1 1 0 0 1-1-1V16M7 12h10"/>',
    spark: '<path d="m12 3 1.4 4.4L18 9l-4.6 1.6L12 15l-1.4-4.4L6 9l4.6-1.6ZM18 15l.7 2.2L21 18l-2.3.8L18 21l-.7-2.2L15 18l2.3-.8Z"/>'
  };
  return `<svg ${common}>${icons[name] || '<circle cx="12" cy="12" r="8"/>'}</svg>`;
}

function fontStackFor(settings) {
  if (settings.fontFamily === "trebuchet") return '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
  if (settings.fontFamily === "arial") return 'Arial, Helvetica, sans-serif';
  if (settings.fontFamily === "georgia") return 'Georgia, "Times New Roman", serif';
  if (settings.fontFamily === "courier") return '"Courier New", Courier, monospace';
  if (settings.fontFamily === "custom" && settings.customFontData) return '"Caixota Custom", Roboto, "Segoe UI", Arial, sans-serif';
  return 'Roboto, "Segoe UI", Arial, Helvetica, sans-serif';
}

function applyPopupFont(settings) {
  document.body.style.setProperty("--cx-font-family", fontStackFor(settings));
  const scale = clampNumber(settings.typographyScale, 0.85, clampNumber(settings.typographyScaleMax, 0.851, 4, 1.25), 1);
  const spacing = clampNumber(settings.typographyLetterSpacing, -0.05, clampNumber(settings.typographyLetterSpacingMax, -0.049, 1, 0.15), 0);
  const lineHeight = clampNumber(settings.typographyLineHeight, 1.3, clampNumber(settings.typographyLineHeightMax, 1.301, 5, 1.85), 1.5);
  document.documentElement.style.setProperty("--cx-base-font-size", `${15 * scale}px`);
  document.documentElement.style.fontSize = `${15 * scale}px`;
  document.documentElement.style.setProperty("--cx-type-scale", String(scale));
  document.documentElement.style.setProperty("--cx-letter-spacing", `${spacing}em`);
  document.documentElement.style.setProperty("--cx-line-height", String(lineHeight));
  document.documentElement.style.setProperty("--cx-title-scale", String(clampNumber(settings.typographyTitleScale, 0.8, clampNumber(settings.typographyTitleScaleMax, 0.801, 4, 1.35), 1)));
  document.documentElement.style.setProperty("--cx-subtitle-scale", String(clampNumber(settings.typographySubtitleScale, 0.85, clampNumber(settings.typographySubtitleScaleMax, 0.851, 4, 1.3), 1)));
  document.documentElement.style.setProperty("--cx-small-scale", String(clampNumber(settings.typographySmallScale, 0.85, clampNumber(settings.typographySmallScaleMax, 0.851, 4, 1.25), 1)));
  document.documentElement.style.setProperty("--cx-title-letter-spacing", `${clampNumber(settings.typographyTitleLetterSpacing, -0.06, clampNumber(settings.typographyTitleLetterSpacingMax, -0.059, 1, 0.18), -0.015)}em`);
  document.documentElement.style.setProperty("--cx-subtitle-letter-spacing", `${clampNumber(settings.typographySubtitleLetterSpacing, -0.05, clampNumber(settings.typographySubtitleLetterSpacingMax, -0.049, 1, 0.15), 0)}em`);
  document.documentElement.style.setProperty("--cx-small-letter-spacing", `${clampNumber(settings.typographySmallLetterSpacing, -0.04, clampNumber(settings.typographySmallLetterSpacingMax, -0.039, 1, 0.18), 0.01)}em`);
  if (settings.fontFamily === "custom" && settings.customFontData) {
    loadPopupCustomFont(settings.customFontData).catch(() => {});
  }
}

async function loadPopupCustomFont(data) {
  if (!data || loadedPopupFontData === data) return;
  if (typeof FontFace !== "function" || !document.fonts) return;
  const face = new FontFace("Caixota Custom", base64ToArrayBuffer(data));
  await face.load();
  if (loadedPopupFontFace) document.fonts.delete(loadedPopupFontFace);
  document.fonts.add(face);
  loadedPopupFontFace = face;
  loadedPopupFontData = data;
}

async function validateCustomFontData(data) {
  if (typeof FontFace !== "function") return;
  const face = new FontFace("Caixota Font Test", base64ToArrayBuffer(data));
  await face.load();
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunks = [];
  for (let index = 0; index < bytes.length; index += 0x8000) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + 0x8000)));
  }
  return btoa(chunks.join(""));
}

function updateCustomThemePreview(settings) {
  if (!customThemePreview) return;
  const background = normalizeHex(settings.customThemeBackground, "#1c1f26");
  const surface = normalizeHex(settings.customThemeSurface, "#252a33");
  const accent = normalizeHex(settings.customThemeAccent, "#9b5d58");
  const text = normalizeHex(settings.customThemeText, "#f7f8fa");
  const muted = normalizeHex(settings.customThemeMuted, "#a8afb9");
  const surfaceText = text;
  const surfaceMuted = muted;
  const accentText = normalizeHex(settings.customThemeAccentText, "#ffffff");
  const title = normalizeHex(settings.customThemeTitle, text);
  const subtitle = normalizeHex(settings.customThemeSubtitle, muted);
  customThemePreview.style.setProperty("--preview-background", background);
  customThemePreview.style.setProperty("--preview-surface", surface);
  customThemePreview.style.setProperty("--preview-accent", accent);
  customThemePreview.style.setProperty("--preview-text", text);
  customThemePreview.style.setProperty("--preview-muted", muted);
  customThemePreview.style.setProperty("--preview-surface-text", surfaceText);
  customThemePreview.style.setProperty("--preview-surface-muted", surfaceMuted);
  customThemePreview.style.setProperty("--preview-accent-text", accentText);
  customThemePreview.style.setProperty("--preview-title", title);
  customThemePreview.style.setProperty("--preview-subtitle", subtitle);
  customThemePreview.style.setProperty("--preview-radius", `${clampNumber(settings.customThemeRadius, 0, 24, 14)}px`);
  customThemePreview.style.setProperty("--preview-border-width", `${Math.round(clampNumber(settings.customThemeBorderWidth, 1, 3, 1))}px`);
  customThemePreview.dataset.shadow = settings.customThemeShadow || "soft";
  customThemePreview.dataset.button = settings.customThemeButtonStyle || "solid";
  customThemePreview.dataset.field = settings.customThemeFieldStyle || "soft";
  customThemePreview.dataset.pattern = settings.customThemePattern || "none";
}

function applyPopupTheme(settings) {
  const theme = [...STANDARD_THEME_IDS, "custom"].includes(settings.theme) ? settings.theme : "dark";
  document.body.dataset.theme = theme;
  document.body.classList.toggle("no-visual-effects", settings.visualEffectsEnabled === false);

  if (theme !== "custom") {
    ["--cx-bg", "--cx-bg-text", "--cx-bg-muted", "--cx-surface", "--cx-surface-strong", "--cx-surface-soft", "--cx-border", "--cx-border-strong", "--cx-text", "--cx-muted", "--cx-title", "--cx-subtitle", "--cx-accent", "--cx-accent-strong", "--cx-accent-ink", "--cx-accent-text", "--cx-positive", "--cx-positive-text", "--cx-warning", "--cx-danger", "--cx-brown", "--cx-shadow", "--cx-glow", "--cx-radius", "--cx-border-width", "--cx-pattern-image"].forEach((name) => document.body.style.removeProperty(name));
    delete document.body.dataset.customShadow;
    delete document.body.dataset.customButton;
    delete document.body.dataset.customField;
    delete document.body.dataset.customPattern;
    return;
  }

  const background = normalizeHex(settings.customThemeBackground, "#1c1f26");
  const surface = normalizeHex(settings.customThemeSurface, "#252a33");
  const accent = normalizeHex(settings.customThemeAccent, "#9b5d58");
  const backgroundText = normalizeHex(settings.customThemeText, "#f7f8fa");
  const backgroundMuted = normalizeHex(settings.customThemeMuted, "#a8afb9");
  const text = backgroundText;
  const muted = backgroundMuted;
  const border = mixHex(text, surface, 0.22);
  const accentText = normalizeHex(settings.customThemeAccentText, "#ffffff");

  document.body.style.setProperty("--cx-bg", background);
  document.body.style.setProperty("--cx-surface", surface);
  document.body.style.setProperty("--cx-surface-strong", mixHex(surface, text, 0.06));
  document.body.style.setProperty("--cx-surface-soft", mixHex(surface, background, 0.64));
  document.body.style.setProperty("--cx-border", border);
  document.body.style.setProperty("--cx-border-strong", mixHex(text, surface, 0.3));
  document.body.style.setProperty("--cx-bg-text", backgroundText);
  document.body.style.setProperty("--cx-bg-muted", backgroundMuted);
  document.body.style.setProperty("--cx-text", text);
  document.body.style.setProperty("--cx-muted", muted);
  document.body.style.setProperty("--cx-title", normalizeHex(settings.customThemeTitle, text));
  document.body.style.setProperty("--cx-subtitle", normalizeHex(settings.customThemeSubtitle, muted));
  document.body.style.setProperty("--cx-accent", accent);
  document.body.style.setProperty("--cx-accent-strong", accent);
  document.body.style.setProperty("--cx-accent-ink", ensureReadableColor(accent, surface, 3));
  document.body.style.setProperty("--cx-brown", accent);
  const shadowMap = { none: "none", soft: "0 16px 36px rgba(0,0,0,.18)", strong: "0 24px 58px rgba(0,0,0,.34)", retro: `6px 6px 0 ${mixHex(accent, background, 0.35)}` };
  document.body.style.setProperty("--cx-shadow", shadowMap[settings.customThemeShadow] || shadowMap.soft);
  document.body.style.setProperty("--cx-glow", mixHex(accent, background, 0.55));
  document.body.style.setProperty("--cx-radius", `${clampNumber(settings.customThemeRadius, 0, 24, 14)}px`);
  document.body.style.setProperty("--cx-border-width", `${Math.round(clampNumber(settings.customThemeBorderWidth, 1, 3, 1))}px`);
  document.body.style.setProperty("--cx-accent-text", accentText);
  const positive = ensureReadableColor(mixHex(accent, "#48b979", 0.35), surface, 3);
  document.body.style.setProperty("--cx-positive", positive);
  document.body.style.setProperty("--cx-positive-text", readableTextColor(positive));
  document.body.style.setProperty("--cx-warning", ensureReadableColor(mixHex(accent, "#e2b84d", 0.24), surface, 3));
  document.body.style.setProperty("--cx-danger", ensureReadableColor(mixHex(accent, "#df626b", 0.24), surface, 3));
  document.body.dataset.customShadow = settings.customThemeShadow || "soft";
  document.body.dataset.customButton = settings.customThemeButtonStyle || "solid";
  document.body.dataset.customField = settings.customThemeFieldStyle || "soft";
  document.body.dataset.customPattern = settings.customThemePattern || "none";
}

function mixHex(first, second, amount = 0.5) {
  const a = normalizeHex(first, "#000000").slice(1);
  const b = normalizeHex(second, "#000000").slice(1);
  const ratio = Math.max(0, Math.min(1, Number(amount) || 0));
  const channels = [0, 2, 4].map((index) => {
    const valueA = parseInt(a.slice(index, index + 2), 16);
    const valueB = parseInt(b.slice(index, index + 2), 16);
    return Math.round(valueA * ratio + valueB * (1 - ratio)).toString(16).padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

function normalizeHex(value, fallback) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
}

function readableTextColor(hex) {
  const background = normalizeHex(hex, "#1c1f26");
  return contrastRatio("#000000", background) >= contrastRatio("#ffffff", background) ? "#000000" : "#ffffff";
}

function relativeLuminance(hex) {
  const color = normalizeHex(hex, "#1c1f26").slice(1);
  const values = [0, 2, 4].map((index) => {
    const channel = parseInt(color.slice(index, index + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrastRatio(first, second) {
  const brighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (brighter + 0.05) / (darker + 0.05);
}

function ensureReadableColor(color, background, minimum = 4.5) {
  const normalized = normalizeHex(color, readableTextColor(background));
  return contrastRatio(normalized, background) >= minimum ? normalized : readableTextColor(background);
}

function setupSettingsEvents() {
  for (const element of Object.values(elements)) {
    if (!element) continue;
    if (element.id.startsWith("typography")) continue;
    if (element.id === "theme" || CUSTOM_THEME_INPUT_IDS.has(element.id)) {
      element.addEventListener("input", updatePreviews);
      continue;
    }
    element.addEventListener("change", saveSettings);
    element.addEventListener("change", refreshToolCardStates);
    element.addEventListener("input", updatePreviews);
  }
  refreshButton?.addEventListener("click", refreshRates);
}

function setupOrganizationEvents() {
  clearFavoritesButton?.addEventListener("click", async () => {
    organizationState.favorites = [];
    organizationState.imageFavorites = [];
    organizationState.videoFavorites = [];
    organizationState.pdfFavorites = [];
    organizationState.generatorFavorites = [];
    await saveSettings();
    renderOrganization();
    refreshFavoriteButtons();
    document.dispatchEvent(new CustomEvent("caixota:favorites-updated"));
  });

  addCustomFolderButton?.addEventListener("click", createCustomFolder);
  customFolderNameInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") createCustomFolder();
  });
}

function setupUxEvents() {
  clearHistoryButton?.addEventListener("click", clearToolHistory);
  configureShortcutButton?.addEventListener("click", openShortcutSettings);
  replayTutorialButton?.addEventListener("click", () => showTutorial(0));
  tutorialBackButton?.addEventListener("click", () => {
    if (tutorialIndex > 0) renderTutorialStep(tutorialIndex - 1);
  });
  tutorialNextButton?.addEventListener("click", () => {
    if (tutorialIndex >= TOUR_STEPS.length - 1) closeTutorial();
    else renderTutorialStep(tutorialIndex + 1);
  });
  tutorialSkipButton?.addEventListener("click", closeTutorial);
  tutorialOverlay?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeTutorial();
    if (event.key === "ArrowLeft" && tutorialIndex > 0) renderTutorialStep(tutorialIndex - 1);
    if (event.key === "ArrowRight" && tutorialIndex < TOUR_STEPS.length - 1) renderTutorialStep(tutorialIndex + 1);
  });
}

function setupGlobalSearch() {
  rebuildGlobalSearchItems();
  globalSearchTrigger?.addEventListener("click", openGlobalSearch);
  globalSearchClose?.addEventListener("click", closeGlobalSearch);
  globalSearchOverlay?.addEventListener("mousedown", (event) => {
    if (event.target === globalSearchOverlay) closeGlobalSearch();
  });
  globalSearchInput?.addEventListener("input", renderGlobalSearchResults);
  globalSearchInput?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      globalSearchActiveIndex = Math.max(0, Math.min(globalSearchMatches.length - 1, globalSearchActiveIndex + direction));
      updateGlobalSearchSelection();
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateGlobalSearchItem(globalSearchMatches[globalSearchActiveIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeGlobalSearch();
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openGlobalSearch();
    }
  });
}

function rebuildGlobalSearchItems() {
  globalSearchItems = [
    ...Object.entries(CATEGORY_CATALOGS).flatMap(([category, catalog]) => catalog.map((tool) => ({
      type: "tool",
      category,
      id: tool.id,
      label: getToolDisplayLabel(category, tool),
      originalLabel: tool.label,
      description: tool.description,
      context: CATEGORY_LABELS[category],
      keywords: tool.keywords || []
    }))),
    ...SETTINGS_SEARCH_CATALOG.map((item) => ({ ...item, type: "settings", context: "Configurações" }))
  ];
}

function openGlobalSearch() {
  if (!globalSearchOverlay) return;
  globalSearchPreviousFocus = document.activeElement;
  globalSearchOverlay.hidden = false;
  document.querySelector("main")?.setAttribute("inert", "");
  globalSearchInput.value = "";
  renderGlobalSearchResults();
  requestAnimationFrame(() => globalSearchInput.focus());
}

function closeGlobalSearch() {
  if (!globalSearchOverlay || globalSearchOverlay.hidden) return;
  globalSearchOverlay.hidden = true;
  document.querySelector("main")?.removeAttribute("inert");
  if (globalSearchPreviousFocus?.isConnected) globalSearchPreviousFocus.focus();
}

function normalizeSearchText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function renderGlobalSearchResults() {
  if (!globalSearchResults) return;
  const query = normalizeSearchText(globalSearchInput?.value);
  const terms = query.split(/\s+/).filter(Boolean);
  globalSearchMatches = globalSearchItems.map((item) => {
    const label = normalizeSearchText(item.label);
    const haystack = normalizeSearchText([item.label, item.originalLabel, item.description, item.context, ...(item.keywords || [])].join(" "));
    if (terms.some((term) => !haystack.includes(term))) return null;
    const score = !query ? 0 : (label === query ? 100 : (label.startsWith(query) ? 60 : terms.reduce((total, term) => total + (label.includes(term) ? 10 : 1), 0)));
    return { ...item, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "pt-BR")).slice(0, 12);
  globalSearchActiveIndex = 0;
  globalSearchResults.replaceChildren();
  if (!globalSearchMatches.length) {
    const empty = document.createElement("div");
    empty.className = "global-search-empty";
    empty.textContent = "Nenhuma ferramenta ou configuração encontrada.";
    globalSearchResults.appendChild(empty);
    return;
  }
  globalSearchMatches.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "global-search-result";
    button.dataset.searchIndex = String(index);
    button.setAttribute("role", "option");
    const copy = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = item.label;
    const description = document.createElement("small");
    description.textContent = item.description;
    copy.append(title, description);
    const context = document.createElement("b");
    context.textContent = item.context;
    button.append(copy, context);
    button.addEventListener("mouseenter", () => { globalSearchActiveIndex = index; updateGlobalSearchSelection(); });
    button.addEventListener("click", () => activateGlobalSearchItem(item));
    globalSearchResults.appendChild(button);
  });
  updateGlobalSearchSelection();
}

function updateGlobalSearchSelection() {
  globalSearchResults?.querySelectorAll(".global-search-result").forEach((button, index) => {
    const active = index === globalSearchActiveIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    if (active) button.scrollIntoView({ block: "nearest" });
  });
}

function activateGlobalSearchItem(item) {
  if (!item) return;
  closeGlobalSearch();
  if (item.type === "tool") openToolTarget(item.category, item.id);
  else {
    navigateToView("settings");
    openSettingsCategory(item.category);
    requestAnimationFrame(() => {
      const target = item.targetId ? document.getElementById(item.targetId) : document.querySelector(`[data-settings-category="${item.category}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      target?.classList.add("search-target-highlight");
      setTimeout(() => target?.classList.remove("search-target-highlight"), 1600);
    });
  }
}

function openToolTarget(category, toolId) {
  if (!CATEGORY_CATALOGS[category]?.some((tool) => tool.id === toolId)) return false;
  navigateToView("tools");
  selectToolsCategory(category);
  const tool = CATEGORY_CATALOGS[category]?.find((item) => item.id === toolId);
  if (["video", "pdf"].includes(category) || tool?.direct) {
    requestAnimationFrame(() => document.dispatchEvent(new CustomEvent("caixota:open-direct-tool", { detail: { category, toolId } })));
    return true;
  }
  requestAnimationFrame(() => {
    const card = document.querySelector(`.tool-card[data-tool-category="${category}"][data-tool-id="${toolId}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    card?.classList.add("search-target-highlight");
    card?.setAttribute("tabindex", "-1");
    card?.focus({ preventScroll: true });
    setTimeout(() => card?.classList.remove("search-target-highlight"), 1800);
  });
  return true;
}

function setupProfileEvents() {
  const updateTextProfile = () => {
    profileState = {
      ...profileState,
      name: String(profileNameInput?.value || "").slice(0, 40),
      bio: String(profileBioInput?.value || "").slice(0, 240),
      instructions: String(profileInstructionsInput?.value || "").slice(0, 1200)
    };
    renderProfile();
    renderHomeDashboard();
    scheduleProfileSave();
  };
  [profileNameInput, profileBioInput, profileInstructionsInput].forEach((input) => input?.addEventListener("input", updateTextProfile));

  profileAvatarInput?.addEventListener("change", async () => {
    const file = profileAvatarInput.files?.[0];
    profileAvatarInput.value = "";
    if (!file) return;
    if (!/^image\/(?:png|jpe?g|webp|gif)$/i.test(file.type)) {
      setProfilePhotoStatus("Use uma imagem PNG, JPEG, WebP ou GIF.", true);
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setProfilePhotoStatus("A imagem precisa ter no máximo 4 MB.", true);
      return;
    }
    try {
      setProfilePhotoStatus("Preparando a foto…", false);
      profileState.avatarData = await prepareProfileImage(file);
      await saveProfile();
      renderProfile();
      renderHomeDashboard();
      setProfilePhotoStatus("Foto atualizada ✓", false);
    } catch (_error) {
      setProfilePhotoStatus("Não foi possível usar essa imagem.", true);
    }
  });

  removeProfileAvatarButton?.addEventListener("click", async () => {
    profileState.avatarData = "";
    await saveProfile();
    renderProfile();
    renderHomeDashboard();
    setProfilePhotoStatus("Foto removida.", false);
  });
}

function scheduleProfileSave() {
  clearTimeout(profileSaveTimer);
  profileSaveTimer = setTimeout(() => saveProfile().catch(() => {}), 260);
}

async function saveProfile() {
  profileState = normalizeProfile(profileState);
  await chrome.storage.local.set({ [PROFILE_KEY]: profileState });
  showSaveStatus("Perfil salvo localmente ✓");
}

function prepareProfileImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Imagem inválida."));
      image.onload = () => {
        const maximum = 512;
        const scale = Math.min(1, maximum / Math.max(image.naturalWidth || 1, image.naturalHeight || 1));
        const width = Math.max(1, Math.round((image.naturalWidth || 1) * scale));
        const height = Math.max(1, Math.round((image.naturalHeight || 1) * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Canvas indisponível."));
        context.drawImage(image, 0, 0, width, height);
        const webp = canvas.toDataURL("image/webp", .86);
        resolve(webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/png"));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function setProfilePhotoStatus(message, isError) {
  if (!profilePhotoStatus) return;
  profilePhotoStatus.textContent = message;
  profilePhotoStatus.classList.toggle("is-error", Boolean(isError));
}

function setupDonation() {
  showPixDonationButton?.addEventListener("click", () => {
    const opening = pixDonationPanel.hidden;
    const shouldAnimate = currentSettings.visualEffectsEnabled !== false && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    showPixDonationButton.setAttribute("aria-expanded", String(opening));
    const helper = showPixDonationButton.querySelector("small");
    if (helper) helper.textContent = opening ? "Ocultar QR Code" : "Mostrar QR Code e chave";
    if (opening) {
      pixDonationPanel.hidden = false;
      if (shouldAnimate) requestAnimationFrame(() => pixDonationPanel.classList.add("is-visible"));
      else pixDonationPanel.classList.add("is-visible");
    } else {
      pixDonationPanel.classList.remove("is-visible");
      setTimeout(() => {
        if (!pixDonationPanel.classList.contains("is-visible")) pixDonationPanel.hidden = true;
      }, shouldAnimate ? 220 : 0);
    }
  });

  copyPixKeyButton?.addEventListener("click", async () => {
    try {
      await copyTextToClipboard(PIX_KEY);
      pixCopyStatus.textContent = "Chave Pix copiada ✓";
      pixCopyStatus.classList.remove("is-error");
      copyPixKeyButton.textContent = "Copiado!";
      setTimeout(() => { copyPixKeyButton.textContent = "Copiar Chave"; }, 1400);
    } catch (_error) {
      pixCopyStatus.textContent = "Não foi possível copiar automaticamente. Selecione a chave acima.";
      pixCopyStatus.classList.add("is-error");
    }
  });
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  const copied = document.execCommand?.("copy");
  helper.remove();
  if (!copied) throw new Error("Clipboard indisponível");
}

function renderProfile() {
  const name = profileState.name || "Seu perfil";
  const bio = profileState.bio || "Adicione um nome e conte um pouco sobre você.";
  const previewName = document.getElementById("profilePreviewName");
  const previewBio = document.getElementById("profilePreviewBio");
  if (previewName) previewName.textContent = name;
  if (previewBio) previewBio.textContent = bio;
  updateAvatarPair("profileAvatarImage", "profileAvatarPlaceholder");
  updateAvatarPair("sidebarAvatarImage", "sidebarAvatarPlaceholder");
  if (removeProfileAvatarButton) removeProfileAvatarButton.disabled = !profileState.avatarData;
}

function updateAvatarPair(imageId, placeholderId) {
  const image = document.getElementById(imageId);
  const placeholder = document.getElementById(placeholderId);
  if (!image || !placeholder) return;
  image.hidden = !profileState.avatarData;
  placeholder.hidden = Boolean(profileState.avatarData);
  if (profileState.avatarData) image.src = profileState.avatarData;
  else image.removeAttribute("src");
}

function renderHomeDashboard() {
  const settings = currentSettings || DEFAULT_SETTINGS;
  const trackedTools = getTrackedTools();
  const contextualTools = trackedTools.filter((tool) => (tool.category === "text" || tool.category === "images") && tool.settingId);
  const enabledCount = contextualTools.filter((tool) => settings[tool.settingId] !== false).length;
  const totalTools = contextualTools.length;
  const favoriteCount = ["favorites", "imageFavorites", "videoFavorites", "pdfFavorites", "generatorFavorites"].reduce((total, key) => total + organizationState[key].length, 0);
  const totalUsage = ["text", "image", "video", "pdf", "generator"].reduce((total, mode) => total + Object.values(usageState.counts[mode] || {}).reduce((sum, count) => sum + Number(count || 0), 0), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : (hour < 18 ? "Boa tarde" : "Boa noite");
  const welcomeTitle = document.getElementById("welcomeTitle");
  if (welcomeTitle) welcomeTitle.textContent = profileState.name ? `${greeting}, ${profileState.name}` : "Bem-vindo à Caixota";

  setText("enabledToolCount", `${enabledCount} de ${totalTools}`);
  setText("totalUsageMetric", String(totalUsage));
  setText("favoritesMetric", String(favoriteCount));
  const progress = document.getElementById("enabledToolsProgress");
  if (progress) progress.style.width = `${Math.round(enabledCount / totalTools * 100)}%`;
  const statusBadge = document.getElementById("extensionStatusBadge");
  if (statusBadge) {
    statusBadge.textContent = settings.enabled === false ? "Pausada" : "Ativa";
    statusBadge.classList.toggle("is-off", settings.enabled === false);
  }

  const ranked = trackedTools.map((tool) => {
    return { ...tool, count: Number(usageState.counts[tool.usageMode]?.[tool.id] || 0) };
  }).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
  const mostUsed = ranked[0]?.count > 0 ? ranked[0] : null;
  setText("mostUsedMetric", mostUsed?.label || "—");
  setText("mostUsedMetricDetail", mostUsed ? `${mostUsed.count} ${mostUsed.count === 1 ? "uso" : "usos"} · ${mostUsed.mode}` : "Nenhum uso registrado");
  const toolByUsageKey = new Map(trackedTools.map((tool) => [`${tool.usageMode}:${tool.id}`, tool]));
  const favorites = trackedTools.filter((tool) => isToolFavorite(tool.category, tool.id)).slice(0, 8);
  const recent = usageState.timeline.map((entry) => toolByUsageKey.get(`${entry.mode}:${entry.id}`)).filter(Boolean).filter((tool, index, array) => array.findIndex((item) => item.id === tool.id && item.category === tool.category) === index).slice(0, 8);
  renderHomeToolList("homeFavoriteTools", favorites, "Favorite uma ferramenta pela estrela do card.");
  renderHomeToolList("homeRecentTools", recent, "As ferramentas usadas aparecerão aqui.");
  renderHomeToolList("homeMostUsedTools", ranked.filter((tool) => tool.count > 0).slice(0, 8), "O uso local ainda não possui dados suficientes.", true);
}

function getTrackedTools() {
  return [
    ...TOOL_CATALOG.map((tool) => ({ ...tool, originalLabel: tool.label, label: getToolDisplayLabel("text", tool), mode: "Texto", category: "text", usageMode: "text" })),
    ...IMAGE_TOOL_CATALOG.map((tool) => ({ ...tool, originalLabel: tool.label, label: getToolDisplayLabel("images", tool), mode: "Imagens", category: "images", usageMode: "image" })),
    ...VIDEO_TOOL_CATALOG.map((tool) => ({ ...tool, originalLabel: tool.label, label: getToolDisplayLabel("video", tool), mode: "Vídeo", category: "video", usageMode: "video" })),
    ...PDF_TOOL_CATALOG.map((tool) => ({ ...tool, originalLabel: tool.label, label: getToolDisplayLabel("pdf", tool), mode: "PDF", category: "pdf", usageMode: "pdf" })),
    ...GENERATOR_TOOL_CATALOG.map((tool) => ({ ...tool, originalLabel: tool.label, label: getToolDisplayLabel("generators", tool), mode: "Geradores", category: "generators", usageMode: "generator" }))
  ];
}

function renderHomeToolList(containerId, tools, emptyMessage, showCount = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.replaceChildren();
  if (!tools.length) {
    const empty = document.createElement("span");
    empty.className = "empty-state-inline";
    empty.textContent = emptyMessage;
    container.appendChild(empty);
    return;
  }
  for (const tool of tools) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "recent-tool-chip dashboard-tool-chip";
    const label = document.createElement("span");
    label.textContent = tool.label;
    const mode = document.createElement("small");
    mode.textContent = showCount ? `${tool.count} ${tool.count === 1 ? "uso" : "usos"} · ${tool.mode}` : tool.mode;
    chip.append(label, mode);
    chip.addEventListener("click", () => openToolTarget(tool.category, tool.id));
    container.appendChild(chip);
  }
}

function updateCurrentDate() {
  const element = document.getElementById("currentDate");
  if (!element) return;
  const now = new Date();
  element.dateTime = now.toISOString().slice(0, 10);
  element.textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now);
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function setupCarousel() {
  const slides = newsTrack ? Array.from(newsTrack.children) : [];
  if (!slides.length || !carouselDots) return;
  carouselDots.replaceChildren();
  slides.forEach((_slide, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Mostrar novidade ${index + 1}`);
    dot.addEventListener("click", () => showCarouselSlide(index, true));
    carouselDots.appendChild(dot);
  });
  carouselPrevButton?.addEventListener("click", () => showCarouselSlide(activeCarouselSlide - 1, true));
  carouselNextButton?.addEventListener("click", () => showCarouselSlide(activeCarouselSlide + 1, true));
  document.getElementById("newsCarousel")?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showCarouselSlide(activeCarouselSlide - 1, true);
    if (event.key === "ArrowRight") showCarouselSlide(activeCarouselSlide + 1, true);
  });
  document.querySelector(".news-card")?.addEventListener("mouseenter", stopCarouselTimer);
  document.querySelector(".news-card")?.addEventListener("mouseleave", startCarouselTimer);
  document.addEventListener("visibilitychange", () => document.hidden ? stopCarouselTimer() : startCarouselTimer());
  showCarouselSlide(0, false);
  startCarouselTimer();
}

function showCarouselSlide(index, restartTimer) {
  const total = newsTrack?.children.length || 0;
  if (!total) return;
  activeCarouselSlide = ((Number(index) % total) + total) % total;
  newsTrack.style.transform = `translateX(-${activeCarouselSlide * 100}%)`;
  Array.from(carouselDots?.children || []).forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeCarouselSlide);
    dot.setAttribute("aria-current", dotIndex === activeCarouselSlide ? "true" : "false");
  });
  if (restartTimer) startCarouselTimer();
}

function startCarouselTimer() {
  stopCarouselTimer();
  if (document.hidden || currentSettings.visualEffectsEnabled === false || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  carouselTimer = setInterval(() => showCarouselSlide(activeCarouselSlide + 1, false), 6000);
}

function stopCarouselTimer() {
  clearInterval(carouselTimer);
  carouselTimer = 0;
}

function collectSettings() {
  const selectedPreset = selectedThemePreset();
  const selectedStandardTheme = STANDARD_THEME_IDS.has(elements.theme.value) ? elements.theme.value : "dark";
  const typographyScaleMax = clampNumber(elements.typographyScaleMax?.value, 0.851, 4, 1.25);
  const typographyScale = clampNumber(elements.typographyScale?.value, 0.85, typographyScaleMax, TYPOGRAPHY_DEFAULTS.scale);
  const customTheme = themeInputSettings();
  return {
    enabled: elements.enabled.checked,
    theme: selectedPreset ? "custom" : selectedStandardTheme,
    ...customTheme,
    typographyScale,
    typographyScaleMax,
    typographyTitleScaleMax: clampNumber(elements.typographyTitleScaleMax?.value, 0.801, 4, 1.35),
    typographySubtitleScaleMax: clampNumber(elements.typographySubtitleScaleMax?.value, 0.851, 4, 1.3),
    typographySmallScaleMax: clampNumber(elements.typographySmallScaleMax?.value, 0.851, 4, 1.25),
    typographyLetterSpacingMax: clampNumber(elements.typographyLetterSpacingMax?.value, -0.049, 1, 0.15),
    typographyTitleLetterSpacingMax: clampNumber(elements.typographyTitleLetterSpacingMax?.value, -0.059, 1, 0.18),
    typographySubtitleLetterSpacingMax: clampNumber(elements.typographySubtitleLetterSpacingMax?.value, -0.049, 1, 0.15),
    typographySmallLetterSpacingMax: clampNumber(elements.typographySmallLetterSpacingMax?.value, -0.039, 1, 0.18),
    typographyLineHeightMax: clampNumber(elements.typographyLineHeightMax?.value, 1.301, 5, 1.85),
    typographyTitleScale: clampNumber(elements.typographyTitleScale?.value, 0.8, clampNumber(elements.typographyTitleScaleMax?.value, 0.801, 4, 1.35), TYPOGRAPHY_DEFAULTS.titleScale),
    typographySubtitleScale: clampNumber(elements.typographySubtitleScale?.value, 0.85, clampNumber(elements.typographySubtitleScaleMax?.value, 0.851, 4, 1.3), TYPOGRAPHY_DEFAULTS.subtitleScale),
    typographySmallScale: clampNumber(elements.typographySmallScale?.value, 0.85, clampNumber(elements.typographySmallScaleMax?.value, 0.851, 4, 1.25), TYPOGRAPHY_DEFAULTS.smallScale),
    typographyLetterSpacing: clampNumber(elements.typographyLetterSpacing?.value, -0.05, clampNumber(elements.typographyLetterSpacingMax?.value, -0.049, 1, 0.15), TYPOGRAPHY_DEFAULTS.letterSpacing),
    typographyTitleLetterSpacing: clampNumber(elements.typographyTitleLetterSpacing?.value, -0.06, clampNumber(elements.typographyTitleLetterSpacingMax?.value, -0.059, 1, 0.18), TYPOGRAPHY_DEFAULTS.titleLetterSpacing),
    typographySubtitleLetterSpacing: clampNumber(elements.typographySubtitleLetterSpacing?.value, -0.05, clampNumber(elements.typographySubtitleLetterSpacingMax?.value, -0.049, 1, 0.15), TYPOGRAPHY_DEFAULTS.subtitleLetterSpacing),
    typographySmallLetterSpacing: clampNumber(elements.typographySmallLetterSpacing?.value, -0.04, clampNumber(elements.typographySmallLetterSpacingMax?.value, -0.039, 1, 0.18), TYPOGRAPHY_DEFAULTS.smallLetterSpacing),
    typographyLineHeight: clampNumber(elements.typographyLineHeight?.value, 1.3, clampNumber(elements.typographyLineHeightMax?.value, 1.301, 5, 1.85), TYPOGRAPHY_DEFAULTS.lineHeight),
    fontSize: Math.round(15 * typographyScale),
    fontFamily: elements.fontFamily.value,
    customFontName: currentSettings.customFontName || "",
    customFontData: currentSettings.customFontData || "",
    themePresets: themePresetState.items.map((preset) => ({ ...preset })),
    activeThemePresetId: selectedPreset?.id || "",
    currencyEnabled: elements.currencyEnabled.checked,
    translationEnabled: elements.translationEnabled.checked,
    calculatorEnabled: elements.calculatorEnabled.checked,
    counterEnabled: elements.counterEnabled.checked,
    converterEnabled: elements.converterEnabled.checked,
    dictionaryEnabled: elements.dictionaryEnabled.checked,
    formatterEnabled: elements.formatterEnabled.checked,
    cleanerEnabled: elements.cleanerEnabled.checked,
    dateEnabled: elements.dateEnabled.checked,
    listEnabled: elements.listEnabled.checked,
    sorterEnabled: elements.sorterEnabled.checked,
    encoderEnabled: elements.encoderEnabled.checked,
    colorEnabled: elements.colorEnabled.checked,
    readerEnabled: elements.readerEnabled.checked,
    passwordEnabled: elements.passwordEnabled.checked,
    linkCheckerEnabled: elements.linkCheckerEnabled.checked,
    comparerEnabled: elements.comparerEnabled.checked,
    qrGeneratorEnabled: elements.qrGeneratorEnabled.checked,
    textSelectionButtonEnabled: elements.textSelectionButtonEnabled.checked,
    recentToolsEnabled: elements.recentToolsEnabled.checked,
    visualEffectsEnabled: elements.visualEffectsEnabled.checked,
    imageConvertEnabled: elements.imageConvertEnabled.checked,
    imageCompressEnabled: elements.imageCompressEnabled.checked,
    imageResizeEnabled: elements.imageResizeEnabled.checked,
    imageRotateEnabled: elements.imageRotateEnabled.checked,
    // Chave legada preservada para não apagar preferências ao atualizar da v0.1.5.
    imagePdfEnabled: currentSettings.imagePdfEnabled !== false,
    imageTextEnabled: elements.imageTextEnabled.checked,
    imageInfoEnabled: elements.imageInfoEnabled.checked,
    imageColorsEnabled: elements.imageColorsEnabled.checked,
    imageQrEnabled: elements.imageQrEnabled.checked,
    imageCaptureEnabled: elements.imageCaptureEnabled.checked,
    ocrApiKey: elements.ocrApiKey.value.trim() || "helloworld",
    ocrLanguage: elements.ocrLanguage.value,
    foldersEnabled: elements.foldersEnabled.checked,
    favorites: [...organizationState.favorites],
    imageFavorites: [...organizationState.imageFavorites],
    videoFavorites: [...organizationState.videoFavorites],
    pdfFavorites: [...organizationState.pdfFavorites],
    generatorFavorites: [...organizationState.generatorFavorites],
    converterFavorites: [],
    customFolders: organizationState.customFolders.map((folder) => ({ ...folder })).sort(sortFolders),
    folderAssignments: { ...organizationState.folderAssignments },
    toolAliases: { ...(currentSettings.toolAliases || {}) },
    targetCurrency: elements.targetCurrency.value,
    decimalPlaces: Number(elements.decimalPlaces.value),
    showOriginal: elements.showOriginal.checked,
    showRate: elements.showRate.checked,
    showRateDate: elements.showRateDate.checked,
    dailyRateUpdate: elements.dailyRateUpdate.checked,
    dollarSymbolCurrency: elements.dollarSymbolCurrency.value,
    sourceLanguage: elements.sourceLanguage.value,
    targetLanguage: elements.targetLanguage.value,
    interfaceLanguage: elements.interfaceLanguage.value
  };
}

async function saveSettings(options = {}) {
  const settings = collectSettings();
  currentSettings = { ...settings };
  applyPopupTheme(settings);
  applyPopupFont(settings);
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  translatePanel(resolveInterfaceLanguage(settings.interfaceLanguage));
  updatePreviews();
  refreshToolCardStates();
  renderHomeDashboard();
  if (options.notify !== false) showSaveStatus("As alterações já estão valendo.");
}

function renderOrganization() {
  renderFavoriteSummary();
  renderUsageSummary();
  renderCustomFolders();
}

function renderFavoriteSummary() {
  favoritesSummary.innerHTML = "";
  const groups = [
    { label: "Texto", tools: TOOL_CATALOG.filter((tool) => organizationState.favorites.includes(tool.id)) },
    { label: "Imagens", tools: IMAGE_TOOL_CATALOG.filter((tool) => organizationState.imageFavorites.includes(tool.id)) },
    { label: "Vídeo", tools: VIDEO_TOOL_CATALOG.filter((tool) => organizationState.videoFavorites.includes(tool.id)) },
    { label: "PDF", tools: PDF_TOOL_CATALOG.filter((tool) => organizationState.pdfFavorites.includes(tool.id)) },
    { label: "Geradores", tools: GENERATOR_TOOL_CATALOG.filter((tool) => organizationState.generatorFavorites.includes(tool.id)) }
  ];
  const total = groups.reduce((sum, group) => sum + group.tools.length, 0);
  clearFavoritesButton.disabled = total === 0;

  if (!total) {
    const empty = document.createElement("span");
    empty.className = "empty-inline";
    empty.textContent = "Nenhuma ferramenta favoritada ainda.";
    favoritesSummary.appendChild(empty);
    return;
  }

  for (const group of groups) {
    for (const tool of group.tools) {
      const chip = document.createElement("span");
      chip.className = "favorite-chip";
      const category = ({ Texto: "text", Imagens: "images", Vídeo: "video", PDF: "pdf", Geradores: "generators" })[group.label];
      chip.textContent = `${group.label} · ${getToolDisplayLabel(category, tool)}`;
      favoritesSummary.appendChild(chip);
    }
  }
}

function renderUsageSummary() {
  if (!usageSummary) return;
  usageSummary.replaceChildren();
  const modes = [
    { id: "text", label: "Texto", catalog: TOOL_CATALOG },
    { id: "image", label: "Imagens", catalog: IMAGE_TOOL_CATALOG },
    { id: "video", label: "Vídeo", catalog: VIDEO_TOOL_CATALOG },
    { id: "pdf", label: "PDF", catalog: PDF_TOOL_CATALOG },
    { id: "generator", label: "Geradores", catalog: GENERATOR_TOOL_CATALOG }
  ];
  let totalUsage = 0;

  for (const mode of modes) {
    const counts = usageState.counts[mode.id] || {};
    const uses = Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0);
    totalUsage += uses;
    const top = [...mode.catalog].sort((a, b) => Number(counts[b.id] || 0) - Number(counts[a.id] || 0))[0];
    const category = mode.id === "image" ? "images" : (mode.id === "generator" ? "generators" : mode.id);
    const topLabel = top && Number(counts[top.id] || 0) > 0 ? ` · mais usada: ${getToolDisplayLabel(category, top)}` : "";

    const item = document.createElement("div");
    item.className = "usage-summary-item";
    const title = document.createElement("strong");
    title.textContent = mode.label;
    const details = document.createElement("span");
    details.textContent = `${usageState.recent[mode.id].length} recentes · ${uses} ${uses === 1 ? "uso" : "usos"}${topLabel}`;
    item.append(title, details);
    usageSummary.appendChild(item);
  }

  if (clearHistoryButton) clearHistoryButton.disabled = totalUsage === 0;
}

async function clearToolHistory() {
  if (!clearHistoryButton || clearHistoryButton.disabled) return;
  clearHistoryButton.disabled = true;
  clearHistoryButton.textContent = "Limpando…";
  const response = await sendPopupMessage({ type: "CLEAR_TOOL_USAGE" });
  clearHistoryButton.textContent = "Limpar";
  if (!response?.ok) {
    clearHistoryButton.disabled = false;
    showSaveStatus(response?.error || "Não foi possível limpar o histórico.", { error: true, requestRefresh: false });
    return;
  }
  usageState = normalizeToolUsage(response.usage);
  renderUsageSummary();
  renderHomeDashboard();
  showSaveStatus("Histórico limpo ✓");
}

function showSaveStatus(message = "As alterações já estão valendo.", options = {}) {
  if (!saveNotifications) return;
  const error = options.error === true;
  const requestRefresh = options.requestRefresh !== false && !error;
  while (saveNotifications.children.length >= 3) saveNotifications.firstElementChild?.remove();

  const existing = Array.from(saveNotifications.children);
  const previousPositions = new Map(existing.map((item) => [item, item.getBoundingClientRect().top]));
  const notification = document.createElement("div");
  notification.className = `save-notification${error ? " is-error" : ""}`;
  const icon = document.createElement("span");
  icon.className = "save-notification-icon";
  icon.textContent = error ? "!" : "✓";
  const copy = document.createElement("span");
  copy.className = "save-notification-copy";
  const title = document.createElement("strong");
  title.textContent = error ? "Não foi possível salvar" : "Dados salvos";
  const detail = document.createElement("span");
  detail.textContent = `${String(message || "").replace(/\s*[✓✔]\s*$/, "")}${requestRefresh ? " Atualize as páginas em uso." : ""}`.trim();
  copy.append(title, detail);
  notification.append(icon, copy);
  saveNotifications.appendChild(notification);

  for (const item of existing) {
    const newTop = item.getBoundingClientRect().top;
    const offset = previousPositions.get(item) - newTop;
    if (!offset) continue;
    item.style.transition = "none";
    item.style.transform = `translateY(${offset}px)`;
    requestAnimationFrame(() => {
      item.style.transition = "transform .22s cubic-bezier(.2,.75,.25,1), opacity .18s ease";
      item.style.transform = "translateY(0)";
    });
  }

  requestAnimationFrame(() => notification.classList.add("is-visible"));
  setTimeout(() => dismissSaveNotification(notification), 3000);
}

function dismissSaveNotification(notification) {
  if (!notification?.isConnected) return;
  notification.classList.add("is-leaving");
  setTimeout(() => notification.remove(), 180);
}

function sendPopupMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
      else resolve(response);
    });
  });
}

async function updateShortcutStatus() {
  if (!currentShortcut || !chrome.commands?.getAll) return;
  const commands = await new Promise((resolve) => {
    chrome.commands.getAll((items) => resolve(chrome.runtime.lastError ? [] : (items || [])));
  });
  const actionCommand = commands.find((command) => command.name === "_execute_action");
  currentShortcut.textContent = actionCommand?.shortcut || "Não definido";
  currentShortcut.classList.toggle("is-empty", !actionCommand?.shortcut);
}

function openShortcutSettings() {
  if (!configureShortcutButton) return;
  configureShortcutButton.disabled = true;
  if (shortcutStatus) shortcutStatus.textContent = "Abrindo os atalhos do navegador…";
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" }, () => {
    if (chrome.runtime.lastError) {
      if (shortcutStatus) shortcutStatus.textContent = "Abra chrome://extensions/shortcuts na barra de endereços.";
    }
    setTimeout(() => { configureShortcutButton.disabled = false; }, 500);
  });
}

function showTutorial(step = 0) {
  if (!tutorialOverlay) return;
  tutorialPreviousFocus = document.activeElement;
  document.querySelector("main")?.setAttribute("inert", "");
  tutorialOverlay.hidden = false;
  renderTutorialStep(step);
  requestAnimationFrame(() => tutorialNextButton?.focus());
}

function renderTutorialStep(step) {
  tutorialIndex = Math.max(0, Math.min(TOUR_STEPS.length - 1, Number(step) || 0));
  const current = TOUR_STEPS[tutorialIndex];
  tutorialStepLabel.textContent = `Passo ${tutorialIndex + 1} de ${TOUR_STEPS.length}`;
  tutorialVisual.innerHTML = current.visual;
  tutorialTitle.textContent = current.title;
  tutorialDescription.textContent = current.description;
  tutorialBackButton.disabled = tutorialIndex === 0;
  tutorialNextButton.textContent = tutorialIndex === TOUR_STEPS.length - 1 ? "Começar a usar" : "Continuar";

  const shouldAnimate = currentSettings.visualEffectsEnabled !== false && !matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (shouldAnimate) {
    tutorialVisual.animate([
      { opacity: 0, transform: "translateY(10px) scale(.985)" },
      { opacity: 1, transform: "translateY(0) scale(1)" }
    ], { duration: 260, easing: "cubic-bezier(.2,.8,.25,1)" });
    document.querySelector(".tutorial-copy")?.animate([
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "translateY(0)" }
    ], { duration: 220, easing: "ease-out" });
  }

  tutorialDots.replaceChildren();
  TOUR_STEPS.forEach((_step, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "tutorial-dot";
    dot.classList.toggle("is-active", index === tutorialIndex);
    dot.setAttribute("aria-label", `Ir para o passo ${index + 1}`);
    if (index === tutorialIndex) dot.setAttribute("aria-current", "step");
    dot.addEventListener("click", () => renderTutorialStep(index));
    tutorialDots.appendChild(dot);
  });
}

async function closeTutorial() {
  if (!tutorialOverlay || tutorialOverlay.hidden) return;
  tutorialOverlay.hidden = true;
  document.querySelector("main")?.removeAttribute("inert");
  await chrome.storage.local.set({ [TOUR_KEY]: true });
  if (tutorialPreviousFocus?.isConnected) tutorialPreviousFocus.focus();
}

function renderCustomFolders() {
  customFolderList.innerHTML = "";
  const folders = [...organizationState.customFolders].sort(sortFolders);
  if (!folders.length) {
    const empty = document.createElement("div");
    empty.className = "organization-card empty-folder-card";
    empty.textContent = "Nenhuma pasta personalizada foi criada.";
    customFolderList.appendChild(empty);
    return;
  }

  for (const folder of folders) {
    const card = document.createElement("details");
    card.className = "custom-folder-card";

    const summary = document.createElement("summary");
    const summaryText = document.createElement("span");
    summaryText.className = "custom-folder-summary-text";
    const title = document.createElement("strong");
    title.textContent = folder.name;
    const description = document.createElement("span");
    description.textContent = folder.description || "Pasta personalizada para suas ferramentas.";
    summaryText.append(title, description);

    const assignedCount = Object.values(organizationState.folderAssignments).filter((folderId) => folderId === folder.id).length;
    const count = document.createElement("span");
    count.className = "folder-count";
    count.textContent = String(assignedCount);
    summary.append(summaryText, count);

    const body = document.createElement("div");
    body.className = "custom-folder-body";
    const toolGrid = document.createElement("div");
    toolGrid.className = "folder-tool-grid";

    for (const tool of TOOL_CATALOG.filter((item) => item.settingId)) {
      const label = document.createElement("label");
      label.className = "folder-tool-option";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = organizationState.folderAssignments[tool.id] === folder.id;
      const text = document.createElement("span");
      text.textContent = getToolDisplayLabel("text", tool);
      label.append(checkbox, text);

      checkbox.addEventListener("change", async () => {
        if (checkbox.checked) organizationState.folderAssignments[tool.id] = folder.id;
        else if (organizationState.folderAssignments[tool.id] === folder.id) delete organizationState.folderAssignments[tool.id];
        count.textContent = String(Object.values(organizationState.folderAssignments).filter((folderId) => folderId === folder.id).length);
        await saveSettings();
      });
      toolGrid.appendChild(label);
    }

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-folder-button";
    deleteButton.textContent = "Excluir Pasta";
    deleteButton.addEventListener("click", async () => {
      if (!confirm(`Excluir a pasta “${folder.name}”?`)) return;
      organizationState.customFolders = organizationState.customFolders.filter((item) => item.id !== folder.id);
      for (const [toolId, folderId] of Object.entries(organizationState.folderAssignments)) {
        if (folderId === folder.id) delete organizationState.folderAssignments[toolId];
      }
      await saveSettings();
      renderOrganization();
    });

    body.append(toolGrid, deleteButton);
    card.append(summary, body);
    customFolderList.appendChild(card);
  }
}

async function createCustomFolder() {
  const name = customFolderNameInput.value.trim().slice(0, 28);
  const description = customFolderDescriptionInput.value.trim().slice(0, 72);
  if (!name) {
    setFolderStatus("Digite um nome para a pasta.", true);
    customFolderNameInput.focus();
    return;
  }
  if (organizationState.customFolders.some((folder) => folder.name.localeCompare(name, "pt-BR", { sensitivity: "base" }) === 0)) {
    setFolderStatus("Já existe uma pasta com esse nome.", true);
    return;
  }

  organizationState.customFolders.push({ id: createFolderId(name), name, description });
  customFolderNameInput.value = "";
  customFolderDescriptionInput.value = "";
  setFolderStatus("Pasta criada.", false);
  await saveSettings();
  renderOrganization();
}

function createFolderId(name) {
  const slug = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 20) || "pasta";
  return `custom-${slug}-${Date.now().toString(36).slice(-5)}`;
}

function setFolderStatus(message, isError) {
  folderFormStatus.textContent = message;
  folderFormStatus.classList.toggle("is-error", Boolean(isError));
  setTimeout(() => {
    if (folderFormStatus.textContent === message) folderFormStatus.textContent = "";
  }, 2200);
}

function updatePreviews() {
  const settings = collectSettings();
  updateCustomThemePreview(settings);
  const locale = settings.targetCurrency === "BRL" ? "pt-BR" : undefined;
  const value = new Intl.NumberFormat(locale, { style: "currency", currency: settings.targetCurrency, minimumFractionDigits: settings.decimalPlaces, maximumFractionDigits: settings.decimalPlaces }).format(123.45);
  const parts = [value];
  if (settings.showOriginal) parts.push("$24.90");
  if (settings.showRate) parts.push(`1 USD = 5,00 ${settings.targetCurrency}`);
  if (settings.showRateDate) parts.push(new Intl.DateTimeFormat("pt-BR").format(new Date()));
  currencyPreview.textContent = parts.join(" · ");
}

async function refreshRates() {
  refreshButton.disabled = true;
  refreshButton.textContent = "Atualizando…";
  rateStatus.textContent = "Buscando cotações…";
  chrome.runtime.sendMessage({ type: "REFRESH_RATES" }, async (response) => {
    refreshButton.disabled = false;
    refreshButton.textContent = "Atualizar";
    if (chrome.runtime.lastError || !response?.ok) {
      rateStatus.textContent = response?.error || "Falha ao atualizar";
      return;
    }
    await updateRateStatus();
  });
}

async function updateRateStatus() {
  chrome.runtime.sendMessage({ type: "GET_RATE_STATUS" }, (response) => {
    if (chrome.runtime.lastError || !response?.ok || !response.result.available) {
      rateStatus.textContent = "Ainda não foram baixadas";
      return;
    }
    const date = response.result.rateDate ? formatDate(response.result.rateDate) : "data desconhecida";
    rateStatus.textContent = `${response.result.currencyCount} moedas · ${date}`;
  });
}

function formatDate(isoDate) {
  const [year, month, day] = String(isoDate).split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

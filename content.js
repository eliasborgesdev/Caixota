(() => {
  const ROOT_ID = "trem-selection-root";
  const SETTINGS_KEY = "tremSettings";
  const USAGE_KEY = "tremUsage";
  const SAVED_PALETTES_KEY = "tremSavedPalettes";
  const MAX_RECENT_TOOLS = 10;
  const MAX_SELECTION_LENGTH = 5000;
  const MESSAGE_TIMEOUT_MS = 18000;
  const DICTIONARY_LEARNING_KEY = "caixotaDictionaryLearningV1";

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
    pdfFavorites: [],
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

  const CURRENCY_ALIASES = {
    "US$": "USD", "$": "USD", "USD": "USD",
    "DÓLAR": "USD", "DOLAR": "USD", "DÓLARES": "USD", "DOLARES": "USD",
    "DÓLAR AMERICANO": "USD", "DOLAR AMERICANO": "USD", "DÓLARES AMERICANOS": "USD", "DOLARES AMERICANOS": "USD",
    "DÓLAR DOS EUA": "USD", "DOLAR DOS EUA": "USD", "DÓLARES DOS EUA": "USD", "DOLARES DOS EUA": "USD",
    "DÓLAR ESTADUNIDENSE": "USD", "DOLAR ESTADUNIDENSE": "USD", "DÓLARES ESTADUNIDENSES": "USD", "DOLARES ESTADUNIDENSES": "USD",
    "€": "EUR", "EUR": "EUR", "EURO": "EUR", "EUROS": "EUR",
    "£": "GBP", "GBP": "GBP", "LIBRA": "GBP", "LIBRAS": "GBP", "LIBRA ESTERLINA": "GBP", "LIBRAS ESTERLINAS": "GBP",
    "¥": "JPY", "JPY": "JPY", "IENE": "JPY", "IENES": "JPY", "YEN": "JPY", "YENS": "JPY",
    "CN¥": "CNY", "CNY": "CNY", "RMB": "CNY", "YUAN": "CNY", "YUANS": "CNY", "RENMINBI": "CNY",
    "₩": "KRW", "KRW": "KRW", "WON": "KRW", "WONS": "KRW", "WON SUL-COREANO": "KRW", "WONS SUL-COREANOS": "KRW",
    "CA$": "CAD", "C$": "CAD", "CAD": "CAD", "DÓLAR CANADENSE": "CAD", "DOLAR CANADENSE": "CAD", "DÓLARES CANADENSES": "CAD", "DOLARES CANADENSES": "CAD",
    "A$": "AUD", "AU$": "AUD", "AUD": "AUD", "DÓLAR AUSTRALIANO": "AUD", "DOLAR AUSTRALIANO": "AUD", "DÓLARES AUSTRALIANOS": "AUD", "DOLARES AUSTRALIANOS": "AUD",
    "NZ$": "NZD", "NZD": "NZD", "DÓLAR NEOZELANDÊS": "NZD", "DOLAR NEOZELANDES": "NZD", "DÓLARES NEOZELANDESES": "NZD", "DOLARES NEOZELANDESES": "NZD",
    "CHF": "CHF", "FRANCO SUÍÇO": "CHF", "FRANCO SUICO": "CHF", "FRANCOS SUÍÇOS": "CHF", "FRANCOS SUICOS": "CHF",
    "₹": "INR", "INR": "INR", "RUPIA INDIANA": "INR", "RUPIAS INDIANAS": "INR",
    "₽": "RUB", "RUB": "RUB", "RUBLO": "RUB", "RUBLOS": "RUB",
    "R$": "BRL", "BRL": "BRL", "REAL": "BRL", "REAIS": "BRL",
    "MX$": "MXN", "MXN": "MXN", "PESO MEXICANO": "MXN", "PESOS MEXICANOS": "MXN",
    "SEK": "SEK", "COROA SUECA": "SEK", "COROAS SUECAS": "SEK",
    "NOK": "NOK", "COROA NORUEGUESA": "NOK", "COROAS NORUEGUESAS": "NOK",
    "DKK": "DKK", "COROA DINAMARQUESA": "DKK", "COROAS DINAMARQUESAS": "DKK",
    "PLN": "PLN", "ZLOTY": "PLN", "ZLOTYS": "PLN",
    "CZK": "CZK", "TRY": "TRY", "LIRA TURCA": "TRY", "LIRAS TURCAS": "TRY",
    "HK$": "HKD", "HKD": "HKD", "DÓLAR DE HONG KONG": "HKD", "DOLAR DE HONG KONG": "HKD",
    "SGD": "SGD", "DÓLAR DE SINGAPURA": "SGD", "DOLAR DE SINGAPURA": "SGD",
    "ZAR": "ZAR", "RAND": "ZAR", "RANDS": "ZAR"
  };

  const CURRENCY_ALIAS_LOOKUP = new Map(Object.entries(CURRENCY_ALIASES).map(([alias, code]) => [normalizeCurrencyNameToken(alias), code]));

  const CURRENCY_PATTERN = Object.keys(CURRENCY_ALIASES)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegex)
    .join("|");


  const UNIT_CATEGORIES = [
    {
      id: "length",
      label: "Comprimento",
      units: [
        linearUnit("mm", "Milímetros", "mm", 0.001, ["milímetro", "milímetros", "milimetro", "milimetros", "millimeter", "millimeters", "millimetre", "millimetres"]),
        linearUnit("cm", "Centímetros", "cm", 0.01, ["centímetro", "centímetros", "centimetro", "centimetros", "centimeter", "centimeters", "centimetre", "centimetres"]),
        linearUnit("m", "Metros", "m", 1, ["metro", "metros", "meter", "meters", "metre", "metres"]),
        linearUnit("km", "Quilômetros", "km", 1000, ["quilômetro", "quilômetros", "quilometro", "quilometros", "kilometer", "kilometers", "kilometre", "kilometres"]),
        linearUnit("in", "Polegadas", "in", 0.0254, ["inch", "inches", "polegada", "polegadas", "\""]),
        linearUnit("ft", "Pés", "ft", 0.3048, ["foot", "feet", "pé", "pés", "pe", "pes", "'"]),
        linearUnit("yd", "Jardas", "yd", 0.9144, ["yard", "yards", "jarda", "jardas"]),
        linearUnit("mi", "Milhas", "mi", 1609.344, ["mile", "miles", "milha", "milhas"]),
        linearUnit("nmi", "Milhas náuticas", "nmi", 1852, ["nautical mile", "nautical miles", "milha náutica", "milhas náuticas", "milha nautica", "milhas nauticas"])
      ]
    },
    {
      id: "temperature",
      label: "Temperatura",
      units: [
        customUnit("c", "Celsius", "°C", ["°c", "celsius", "grau celsius", "graus celsius"], (value) => value, (value) => value),
        customUnit("f", "Fahrenheit", "°F", ["°f", "fahrenheit", "grau fahrenheit", "graus fahrenheit"], (value) => (value - 32) * 5 / 9, (value) => value * 9 / 5 + 32),
        customUnit("k", "Kelvin", "K", ["k", "kelvin", "kelvins"], (value) => value - 273.15, (value) => value + 273.15)
      ]
    },
    {
      id: "mass",
      label: "Massa",
      units: [
        linearUnit("mg", "Miligramas", "mg", 0.000001, ["miligrama", "miligramas", "milligram", "milligrams"]),
        linearUnit("g", "Gramas", "g", 0.001, ["grama", "gramas", "gram", "grams"]),
        linearUnit("kg", "Quilogramas", "kg", 1, ["quilograma", "quilogramas", "kilogram", "kilograms", "quilo", "quilos"]),
        linearUnit("t", "Toneladas", "t", 1000, ["tonelada", "toneladas", "tonne", "tonnes", "metric ton", "metric tons"]),
        linearUnit("oz", "Onças", "oz", 0.028349523125, ["ounce", "ounces", "onça", "onças", "onca", "oncas"]),
        linearUnit("lb", "Libras", "lb", 0.45359237, ["lbs", "pound", "pounds", "libra", "libras"])
      ]
    },
    {
      id: "volume",
      label: "Volume",
      units: [
        linearUnit("ml", "Mililitros", "mL", 0.001, ["ml", "mililitro", "mililitros", "milliliter", "milliliters", "millilitre", "millilitres"]),
        linearUnit("l", "Litros", "L", 1, ["l", "litro", "litros", "liter", "liters", "litre", "litres"]),
        linearUnit("m3", "Metros cúbicos", "m³", 1000, ["m3", "m³", "metro cúbico", "metros cúbicos", "metro cubico", "metros cubicos", "cubic meter", "cubic meters", "cubic metre", "cubic metres"]),
        linearUnit("tsp", "Colheres de chá", "tsp", 0.00492892159375, ["teaspoon", "teaspoons", "colher de chá", "colheres de chá", "colher de cha", "colheres de cha"]),
        linearUnit("tbsp", "Colheres de sopa", "tbsp", 0.01478676478125, ["tablespoon", "tablespoons", "colher de sopa", "colheres de sopa"]),
        linearUnit("cup", "Xícaras", "cup", 0.2365882365, ["cups", "xícara", "xícaras", "xicara", "xicaras"]),
        linearUnit("floz", "Onças fluidas", "fl oz", 0.0295735295625, ["fl oz", "fluid ounce", "fluid ounces", "onça fluida", "onças fluidas", "onca fluida", "oncas fluidas"]),
        linearUnit("pt", "Pints", "pt", 0.473176473, ["pint", "pints"]),
        linearUnit("qt", "Quarts", "qt", 0.946352946, ["quart", "quarts"]),
        linearUnit("gal", "Galões americanos", "gal", 3.785411784, ["gallon", "gallons", "us gallon", "us gallons", "galão", "galões", "galao", "galoes"])
      ]
    },
    {
      id: "speed",
      label: "Velocidade",
      units: [
        linearUnit("ms", "Metros por segundo", "m/s", 1, ["m/s", "mps", "metro por segundo", "metros por segundo"]),
        linearUnit("kmh", "Quilômetros por hora", "km/h", 1 / 3.6, ["km/h", "kmh", "kph", "quilômetro por hora", "quilômetros por hora", "quilometro por hora", "quilometros por hora"]),
        linearUnit("mph", "Milhas por hora", "mph", 0.44704, ["mile per hour", "miles per hour", "milha por hora", "milhas por hora"]),
        linearUnit("kn", "Nós", "kn", 0.514444444444, ["knot", "knots", "nó", "nós", "no", "nos"])
      ]
    },
    {
      id: "area",
      label: "Área",
      units: [
        linearUnit("mm2", "Milímetros quadrados", "mm²", 0.000001, ["mm2", "mm²", "milímetro quadrado", "milímetros quadrados", "milimetro quadrado", "milimetros quadrados"]),
        linearUnit("cm2", "Centímetros quadrados", "cm²", 0.0001, ["cm2", "cm²", "centímetro quadrado", "centímetros quadrados", "centimetro quadrado", "centimetros quadrados"]),
        linearUnit("m2", "Metros quadrados", "m²", 1, ["m2", "m²", "metro quadrado", "metros quadrados", "square meter", "square meters", "square metre", "square metres"]),
        linearUnit("km2", "Quilômetros quadrados", "km²", 1000000, ["km2", "km²", "quilômetro quadrado", "quilômetros quadrados", "quilometro quadrado", "quilometros quadrados", "square kilometer", "square kilometers"]),
        linearUnit("ha", "Hectares", "ha", 10000, ["hectare", "hectares"]),
        linearUnit("acre", "Acres", "acre", 4046.8564224, ["acres"]),
        linearUnit("in2", "Polegadas quadradas", "in²", 0.00064516, ["in2", "in²", "square inch", "square inches", "polegada quadrada", "polegadas quadradas"]),
        linearUnit("ft2", "Pés quadrados", "ft²", 0.09290304, ["ft2", "ft²", "square foot", "square feet", "pé quadrado", "pés quadrados", "pe quadrado", "pes quadrados"])
      ]
    },
    {
      id: "time",
      label: "Tempo",
      units: [
        linearUnit("millisecond", "Milissegundos", "ms", 0.001, ["ms", "millisecond", "milliseconds", "milissegundo", "milissegundos"]),
        linearUnit("second", "Segundos", "s", 1, ["s", "sec", "secs", "second", "seconds", "segundo", "segundos"]),
        linearUnit("minute", "Minutos", "min", 60, ["min", "mins", "minute", "minutes", "minuto", "minutos"]),
        linearUnit("hour", "Horas", "h", 3600, ["h", "hr", "hrs", "hour", "hours", "hora", "horas"]),
        linearUnit("day", "Dias", "d", 86400, ["d", "day", "days", "dia", "dias"]),
        linearUnit("week", "Semanas", "sem", 604800, ["wk", "wks", "week", "weeks", "semana", "semanas"])
      ]
    },
    {
      id: "pressure",
      label: "Pressão",
      units: [
        linearUnit("pa", "Pascals", "Pa", 1, ["pa", "pascal", "pascals"]),
        linearUnit("hpa", "Hectopascals", "hPa", 100, ["hpa", "hectopascal", "hectopascals", "hectopascal", "hectopascais"]),
        linearUnit("kpa", "Quilopascals", "kPa", 1000, ["kpa", "kilopascal", "kilopascals", "quilopascal", "quilopascals"]),
        linearUnit("mpa", "Megapascals", "MPa", 1000000, ["mpa", "megapascal", "megapascals"]),
        linearUnit("bar", "Bar", "bar", 100000, ["bars"]),
        linearUnit("atm", "Atmosferas", "atm", 101325, ["atmosphere", "atmospheres", "atmosfera", "atmosferas"]),
        linearUnit("psi", "PSI", "psi", 6894.757293168, ["pound per square inch", "pounds per square inch"]),
        linearUnit("mmhg", "Milímetros de mercúrio", "mmHg", 133.322387415, ["mmhg", "milímetro de mercúrio", "milímetros de mercúrio", "milimetro de mercurio", "milimetros de mercurio"])
      ]
    },
    {
      id: "digitalStorage",
      label: "Armazenamento digital",
      units: [
        linearUnit("byte", "Bytes", "B", 1, ["byte", "bytes"]),
        linearUnit("kb", "Kilobytes", "KB", 1000, ["kilobyte", "kilobytes", "quilobyte", "quilobytes"]),
        linearUnit("mb", "Megabytes", "MB", 1000000, ["megabyte", "megabytes"]),
        linearUnit("gb", "Gigabytes", "GB", 1000000000, ["gigabyte", "gigabytes"]),
        linearUnit("tb", "Terabytes", "TB", 1000000000000, ["terabyte", "terabytes"]),
        linearUnit("pb", "Petabytes", "PB", 1000000000000000, ["petabyte", "petabytes"]),
        linearUnit("kib", "Kibibytes", "KiB", 1024, ["kibibyte", "kibibytes"]),
        linearUnit("mib", "Mebibytes", "MiB", 1048576, ["mebibyte", "mebibytes"]),
        linearUnit("gib", "Gibibytes", "GiB", 1073741824, ["gibibyte", "gibibytes"]),
        linearUnit("tib", "Tebibytes", "TiB", 1099511627776, ["tebibyte", "tebibytes"]),
        linearUnit("pib", "Pebibytes", "PiB", 1125899906842624, ["pebibyte", "pebibytes"])
      ]
    },
    {
      id: "energy",
      label: "Energia",
      units: [
        linearUnit("j", "Joules", "J", 1, ["joule", "joules"]),
        linearUnit("kj", "Quilojoules", "kJ", 1000, ["kilojoule", "kilojoules", "quilojoule", "quilojoules"]),
        linearUnit("mj", "Megajoules", "MJ", 1000000, ["megajoule", "megajoules"]),
        linearUnit("wh", "Watt-hora", "Wh", 3600, ["watt hour", "watt hours", "watt-hora", "watts-hora"]),
        linearUnit("kwh", "Quilowatt-hora", "kWh", 3600000, ["kilowatt hour", "kilowatt hours", "quilowatt-hora", "quilowatts-hora"]),
        linearUnit("cal", "Calorias", "cal", 4.184, ["calorie", "calories", "caloria", "calorias"]),
        linearUnit("kcal", "Quilocalorias", "kcal", 4184, ["kilocalorie", "kilocalories", "quilocaloria", "quilocalorias"]),
        linearUnit("btu", "BTU", "BTU", 1055.05585262, ["british thermal unit", "british thermal units"])
      ]
    },
    {
      id: "frequency",
      label: "Frequência",
      units: [
        linearUnit("hz", "Hertz", "Hz", 1, ["hertz"]),
        linearUnit("khz", "Quilohertz", "kHz", 1000, ["kilohertz", "quilohertz"]),
        linearUnit("mhz", "Megahertz", "MHz", 1000000, ["megahertz"]),
        linearUnit("ghz", "Gigahertz", "GHz", 1000000000, ["gigahertz"]),
        linearUnit("thz", "Terahertz", "THz", 1000000000000, ["terahertz"])
      ]
    },
    {
      id: "voltage",
      label: "Tensão elétrica",
      units: [
        linearUnit("uv", "Microvolts", "µV", 0.000001, ["μv", "uv", "microvolt", "microvolts"]),
        linearUnit("mv", "Milivolts", "mV", 0.001, ["milivolt", "milivolts", "millivolt", "millivolts"]),
        linearUnit("v", "Volts", "V", 1, ["volt", "volts"]),
        linearUnit("kv", "Quilovolts", "kV", 1000, ["kilovolt", "kilovolts", "quilovolt", "quilovolts"])
      ]
    },
    {
      id: "electricCurrent",
      label: "Corrente elétrica",
      units: [
        linearUnit("ua", "Microampères", "µA", 0.000001, ["μa", "ua", "microampere", "microamperes", "microampère", "microampères"]),
        linearUnit("ma", "Miliampères", "mA", 0.001, ["miliampere", "miliamperes", "miliampère", "miliampères", "milliampere", "milliamperes"]),
        linearUnit("a", "Ampères", "A", 1, ["ampere", "amperes", "ampère", "ampères"]),
        linearUnit("ka", "Quiloampères", "kA", 1000, ["kiloampere", "kiloamperes", "quiloampere", "quiloamperes"])
      ]
    }
  ];

  const UNIT_ALIAS_LOOKUP = buildUnitAliasLookup();
  const UNIT_PATTERN = buildUnitPattern();

  let settings = { ...DEFAULT_SETTINGS };
  let selectedText = "";
  let selectionRect = null;
  let operationToken = 0;
  let pointerDownStartedInside = false;
  let toolUsage = createEmptyToolUsage();
  let activeSpeechUtterance = null;
  let speechVoicesListener = null;
  let activeMenuMode = "text";
  let currentImageContext = null;
  let currentVideoContext = null;
  let lastContextImageElement = null;
  let lastContextVideoElement = null;
  let activeToolTooltip = null;
  let toolTooltipTimer = null;
  let resizeFrame = 0;
  let closeTimer = 0;
  let captureSelectionInProgress = false;
  let captureMouseGuardUntil = 0;
  let activeInvokedTool = null;
  let loadedCustomFontData = "";
  let loadedCustomFontFace = null;
  let pageTranslation = createPageTranslationState();
  const imageAssetCache = new Map();

  initialize();

  async function initialize() {
    await Promise.all([loadSettings(), loadToolUsage()]);

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[SETTINGS_KEY]) {
        settings = normalizeLoadedSettings(changes[SETTINGS_KEY].newValue);
        if (!settings.enabled) removePanel();
        else {
          const root = document.getElementById(ROOT_ID);
          if (root) {
            root.dataset.theme = settings.theme;
            root.dataset.effects = settings.visualEffectsEnabled ? "on" : "off";
            root.dataset.customButton = settings.theme === "custom" ? settings.customThemeButtonStyle : "";
            root.dataset.customField = settings.theme === "custom" ? settings.customThemeFieldStyle : "";
            root.dataset.customPattern = settings.theme === "custom" ? settings.customThemePattern : "";
            applyFontSettings(root);
            applyCustomThemeVariables(root);
            requestAnimationFrame(() => positionRoot(root));
          }
        }
      }
      if (area === "local" && changes[USAGE_KEY]) {
        toolUsage = normalizeToolUsage(changes[USAGE_KEY].newValue);
      }
    });

    document.addEventListener("mouseup", onMouseUp, true);
    document.addEventListener("keyup", onKeyboardSelection, true);
    document.addEventListener("mousedown", onDocumentMouseDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("scroll", onDocumentScroll, true);
    document.addEventListener("contextmenu", onMediaContextMenu, true);
    chrome.runtime.onMessage.addListener(onRuntimeMessage);
    window.addEventListener("resize", onViewportResize, true);
    window.visualViewport?.addEventListener("resize", onViewportResize, { passive: true });
    window.visualViewport?.addEventListener("scroll", onViewportResize, { passive: true });
  }

  async function loadSettings() {
    const stored = await chrome.storage.local.get(SETTINGS_KEY);
    settings = normalizeLoadedSettings(stored[SETTINGS_KEY]);
  }

  async function loadToolUsage() {
    const stored = await chrome.storage.local.get(USAGE_KEY);
    toolUsage = normalizeToolUsage(stored[USAGE_KEY]);
  }

  function createEmptyToolUsage() {
    return { recent: { text: [], image: [] }, counts: { text: {}, image: {} } };
  }

  function normalizeToolUsage(value = {}) {
    const normalized = createEmptyToolUsage();
    for (const mode of ["text", "image"]) {
      const recent = Array.isArray(value?.recent?.[mode]) ? value.recent[mode] : [];
      normalized.recent[mode] = [...new Set(recent.map(String).filter(Boolean))].slice(0, MAX_RECENT_TOOLS);
      const counts = value?.counts?.[mode] && typeof value.counts[mode] === "object" ? value.counts[mode] : {};
      for (const [id, rawCount] of Object.entries(counts)) {
        const count = Math.floor(Number(rawCount));
        if (id && Number.isFinite(count) && count > 0) normalized.counts[mode][id] = count;
      }
    }
    return normalized;
  }

  function normalizeLoadedSettings(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const merged = { ...DEFAULT_SETTINGS, ...source };
    merged.theme = merged.theme === "classic" ? "dark" : merged.theme;
    if (merged.theme === "liquid-light") merged.theme = "light";
    if (merged.theme === "liquid-dark") merged.theme = "dark";
    merged.theme = ["dark", "light", "midnight", "oled", "nineties", "y2k", "cyber-drifter", "cyber-2000", "custom"].includes(merged.theme) ? merged.theme : "dark";
    const legacyScale = !Object.prototype.hasOwnProperty.call(source, "typographyScale") ? (Number(source.fontSize) || 15) / 15 : merged.typographyScale;
    const normalizeMax = (value, min, hardMax, fallback) => Math.min(hardMax, Math.max(min + 0.001, Number(value) || fallback));
    merged.typographyScaleMax = normalizeMax(merged.typographyScaleMax, 0.85, 4, 1.25);
    merged.typographyTitleScaleMax = normalizeMax(merged.typographyTitleScaleMax, 0.8, 4, 1.35);
    merged.typographySubtitleScaleMax = normalizeMax(merged.typographySubtitleScaleMax, 0.85, 4, 1.3);
    merged.typographySmallScaleMax = normalizeMax(merged.typographySmallScaleMax, 0.85, 4, 1.25);
    merged.typographyLetterSpacingMax = normalizeMax(merged.typographyLetterSpacingMax, -0.05, 1, 0.15);
    merged.typographyTitleLetterSpacingMax = normalizeMax(merged.typographyTitleLetterSpacingMax, -0.06, 1, 0.18);
    merged.typographySubtitleLetterSpacingMax = normalizeMax(merged.typographySubtitleLetterSpacingMax, -0.05, 1, 0.15);
    merged.typographySmallLetterSpacingMax = normalizeMax(merged.typographySmallLetterSpacingMax, -0.04, 1, 0.18);
    merged.typographyLineHeightMax = normalizeMax(merged.typographyLineHeightMax, 1.3, 5, 1.85);
    merged.typographyScale = Math.min(merged.typographyScaleMax, Math.max(0.85, Number(legacyScale) || 1));
    merged.typographyTitleScale = Math.min(merged.typographyTitleScaleMax, Math.max(0.8, Number(merged.typographyTitleScale) || 1));
    merged.typographySubtitleScale = Math.min(merged.typographySubtitleScaleMax, Math.max(0.85, Number(merged.typographySubtitleScale) || 1));
    merged.typographySmallScale = Math.min(merged.typographySmallScaleMax, Math.max(0.85, Number(merged.typographySmallScale) || 1));
    merged.typographyLetterSpacing = Math.min(merged.typographyLetterSpacingMax, Math.max(-0.05, Number(merged.typographyLetterSpacing) || 0));
    const titleLetterSpacing = Number(merged.typographyTitleLetterSpacing);
    merged.typographyTitleLetterSpacing = Math.min(merged.typographyTitleLetterSpacingMax, Math.max(-0.06, Number.isFinite(titleLetterSpacing) ? titleLetterSpacing : -0.015));
    merged.typographySubtitleLetterSpacing = Math.min(merged.typographySubtitleLetterSpacingMax, Math.max(-0.05, Number(merged.typographySubtitleLetterSpacing) || 0));
    const smallLetterSpacing = Number(merged.typographySmallLetterSpacing);
    merged.typographySmallLetterSpacing = Math.min(merged.typographySmallLetterSpacingMax, Math.max(-0.04, Number.isFinite(smallLetterSpacing) ? smallLetterSpacing : 0.01));
    merged.typographyLineHeight = Math.min(merged.typographyLineHeightMax, Math.max(1.3, Number(merged.typographyLineHeight) || 1.5));
    merged.fontSize = Math.round(15 * merged.typographyScale);
    merged.customThemeBackground = normalizeHexColor(merged.customThemeBackground, "#1c1f26");
    merged.customThemeSurface = normalizeHexColor(merged.customThemeSurface, "#252a33");
    merged.customThemeAccent = normalizeHexColor(merged.customThemeAccent, "#9b5d58");
    merged.customThemeText = normalizeHexColor(merged.customThemeText, readableColorFor(merged.customThemeBackground));
    merged.customThemeMuted = normalizeHexColor(merged.customThemeMuted, mixHex(merged.customThemeBackground, merged.customThemeText, 0.62));
    merged.customThemeAccentText = normalizeHexColor(merged.customThemeAccentText, readableColorFor(merged.customThemeAccent));
    merged.customThemeTitle = normalizeHexColor(merged.customThemeTitle, merged.customThemeText);
    merged.customThemeSubtitle = normalizeHexColor(merged.customThemeSubtitle, merged.customThemeMuted);
    merged.customThemeRadius = Math.round(Math.min(24, Math.max(0, Number(merged.customThemeRadius) || 14)));
    merged.customThemeBorderWidth = Math.round(Math.min(3, Math.max(1, Number(merged.customThemeBorderWidth) || 1)));
    merged.customThemeShadow = ["none", "soft", "strong", "retro"].includes(merged.customThemeShadow) ? merged.customThemeShadow : "soft";
    merged.customThemeButtonStyle = ["solid", "outline", "raised"].includes(merged.customThemeButtonStyle) ? merged.customThemeButtonStyle : "solid";
    merged.customThemeFieldStyle = ["soft", "outline", "inset"].includes(merged.customThemeFieldStyle) ? merged.customThemeFieldStyle : "soft";
    merged.customThemePattern = ["none", "grid", "dots", "scanlines"].includes(merged.customThemePattern) ? merged.customThemePattern : "none";
    merged.fontFamily = ["default", "trebuchet", "arial", "georgia", "courier", "custom"].includes(merged.fontFamily) ? merged.fontFamily : "default";
    merged.customFontName = String(merged.customFontName || "").trim().slice(0, 120);
    merged.customFontData = typeof merged.customFontData === "string" ? merged.customFontData : "";
    merged.foldersEnabled = Boolean(merged.foldersEnabled);
    merged.recentToolsEnabled = merged.recentToolsEnabled !== false;
    merged.visualEffectsEnabled = merged.visualEffectsEnabled !== false;
    merged.favorites = Array.isArray(merged.favorites) ? [...new Set(merged.favorites.map(String))] : [];
    merged.imageFavorites = Array.isArray(merged.imageFavorites) ? [...new Set(merged.imageFavorites.map(String))] : [];
    merged.customFolders = Array.isArray(merged.customFolders)
      ? merged.customFolders.map((folder) => ({
          id: String(folder?.id || "").trim(),
          name: String(folder?.name || "").trim().slice(0, 28),
          description: String(folder?.description || "").trim().slice(0, 72)
        })).filter((folder) => folder.id && folder.name)
      : [];
    const folderIds = new Set(merged.customFolders.map((folder) => folder.id));
    merged.folderAssignments = Object.fromEntries(Object.entries(merged.folderAssignments && typeof merged.folderAssignments === "object" ? merged.folderAssignments : {})
      .filter(([, folderId]) => folderIds.has(folderId)));
    merged.toolAliases = Object.fromEntries(Object.entries(merged.toolAliases && typeof merged.toolAliases === "object" ? merged.toolAliases : {})
      .map(([key, alias]) => [String(key), String(alias || "").trim().replace(/\s+/g, " ").slice(0, 40)])
      .filter(([, alias]) => alias));
    return merged;
  }

  async function onMouseUp(event) {
    if (event.button !== 0) return;
    if (captureSelectionInProgress || performance.now() < captureMouseGuardUntil) return;

    const root = document.getElementById(ROOT_ID);
    const interactionBelongsToPanel = pointerDownStartedInside || root?.contains?.(event.target) || event.target?.closest?.(`#${ROOT_ID}`);
    pointerDownStartedInside = false;
    if (interactionBelongsToPanel) return;

    await delay(10);
    updateTextSelectionAffordance();
  }

  async function onKeyboardSelection(event) {
    const keys = ["Shift", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    await delay(10);
    updateTextSelectionAffordance();
  }

  function onKeyDown(event) {
    if (captureSelectionInProgress) return;
    if (event.key === "Escape") closePanelWithMotion();
  }

  function onViewportResize() {
    const root = document.getElementById(ROOT_ID);
    if (!root || captureSelectionInProgress) return;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (!root.isConnected || captureSelectionInProgress) return;
      if (root.dataset.mode === "text-quick") {
        const capture = getCurrentTextSelection();
        if (!capture) return;
        selectionRect = capture.rect;
      } else {
        selectionRect = centeredReferenceRect();
      }
      positionRoot(root);
    });
  }

  function getCurrentTextSelection() {
    const selection = window.getSelection();
    const text = selection?.toString()?.trim();
    if (!selection || selection.rangeCount === 0 || !text || text.length > MAX_SELECTION_LENGTH) return null;
    const rect = getUsefulRect(selection.getRangeAt(0));
    if (!rect || (!rect.width && !rect.height)) return null;
    return { text, rect };
  }

  function updateTextSelectionAffordance() {
    if (!settings.enabled) {
      removePanel();
      return;
    }

    const capture = getCurrentTextSelection();
    if (!capture) {
      removePanel();
      return;
    }

    selectedText = capture.text;
    selectionRect = capture.rect;
    currentImageContext = null;

    if (settings.textSelectionButtonEnabled) {
      activeMenuMode = "text-quick";
      renderTextQuickButton();
    } else {
      removePanel();
      selectedText = capture.text;
      selectionRect = capture.rect;
    }
  }

  function renderTextQuickButton() {
    const root = createRoot();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-selection-launcher";
    button.setAttribute("aria-label", "Abrir a Caixota para o texto selecionado");
    const mark = createIconElement("caixota", "trem-selection-launcher-mark");
    const label = document.createElement("span");
    label.textContent = "Caixota";
    const arrow = createIconElement("chevron-right", "trem-selection-launcher-arrow");
    button.append(mark, label, arrow);
    button.addEventListener("click", (event) => {
      stopEvent(event);
      openTextMenu(selectedText);
    });
    root.appendChild(button);
    positionRoot(root);
  }

  function openTextMenu(textOverride = "") {
    if (!settings.enabled) return;
    const capture = getCurrentTextSelection();
    const text = String(textOverride || capture?.text || "").trim();
    if (!text || text.length > MAX_SELECTION_LENGTH) {
      removePanel();
      return;
    }
    selectedText = text;
    selectionRect = capture?.rect || selectionRect || centeredReferenceRect();
    activeMenuMode = "text";
    currentImageContext = null;
    currentVideoContext = null;
    operationToken += 1;
    renderActionMenu();
  }

  function openPageMenu() {
    if (!settings.enabled) return;
    activeMenuMode = "page";
    currentImageContext = null;
    currentVideoContext = null;
    selectedText = "";
    selectionRect = centeredReferenceRect();
    operationToken += 1;
    renderPageActionMenu();
  }

  function renderPageActionMenu() {
    activeMenuMode = "page";
    activeInvokedTool = null;
    const root = createRoot();
    const translating = pageTranslation.active;
    const { menu, list, status } = createContextMenuShell({
      context: "page",
      title: translating ? "Página traduzida" : "Página atual",
      detail: pageContextDetail(),
      searchLabel: ""
    });
    list.classList.add("trem-page-tool-list");

    const capture = createMenuButton({
      id: "page-capture",
      icon: "capture",
      label: "Capturar Tela",
      meta: settings.imageCaptureEnabled ? "Aba visível ou uma área escolhida" : "Desativada nas configurações",
      network: "offline"
    });
    capture.disabled = !settings.imageCaptureEnabled;
    capture.classList.add("trem-page-action");
    capture.addEventListener("click", (event) => {
      stopEvent(event);
      if (!settings.imageCaptureEnabled) return;
      recordToolUsage("image-capture", "image");
      openImageCaptureTool(event, renderPageActionMenu);
    });

    const translate = createMenuButton({
      id: translating ? "page-restore" : "page-translate",
      icon: translating ? "restore" : "translate",
      label: translating ? "Restaurar Original" : "Traduzir Página Inteira",
      meta: translating ? "Desfaz a tradução desta página" : (settings.translationEnabled ? "Acompanha conteúdo carregado depois" : "Desativada nas configurações"),
      network: translating ? "offline" : "required"
    });
    translate.disabled = !translating && !settings.translationEnabled;
    translate.classList.add("trem-page-action");
    translate.addEventListener("click", async (event) => {
      stopEvent(event);
      if (translate.disabled) return;
      const actionToken = operationToken;
      let failureMessage = "";
      translate.disabled = true;
      translate.setAttribute("aria-busy", "true");
      try {
        if (pageTranslation.active) {
          await stopPageTranslation();
        } else {
          recordToolUsage("translate", "text");
          await startPageTranslation(settings.sourceLanguage, settings.targetLanguage);
        }
      } catch (error) {
        failureMessage = safeMessage(error);
      } finally {
        if (actionToken === operationToken && activeMenuMode === "page" && document.getElementById(ROOT_ID)) {
          renderPageActionMenu();
          if (failureMessage) showTransientMessage(failureMessage);
        }
      }
    });

    // O modo escuro agora também vive no próprio popup de ferramentas.
    const darkActive=document.documentElement.dataset.cx0310Dark==='on';
    const darkAction=createMenuButton({
      id:darkActive?'page-light':'page-dark',
      icon:darkActive?'restore':'caixota',
      label:darkActive?'Voltar às cores originais':'Forçar página escura',
      meta:darkActive?'Desfaz o modo escuro neste site':'Escurece a página atual, sem mudar seu tema da Caixota',
      network:'offline'
    });
    darkAction.classList.add('trem-page-action');
    darkAction.addEventListener('click',async event=>{
      stopEvent(event);
      darkAction.disabled=true;
      try{
        const answer=await chrome.runtime.sendMessage({type:'CAIXOTA_PAGE_DARK_ACTION',enabled:!darkActive});
        if(!answer?.ok)throw Error(answer?.error||'Não foi possível mudar a página.');
        renderPageActionMenu();
      }catch(error){darkAction.disabled=false;showTransientMessage(safeMessage(error));}
    });
    // O controle de volume abre dentro do popup da página, nunca num painel separado.
    const volumeAction = createMenuButton({
      id:'page-volume',icon:'speaker',label:'Aumentar Volume',
      meta:'Reforce o som desta aba de 0% a 200%',network:'offline'
    });
    volumeAction.classList.add('trem-page-action');
    volumeAction.addEventListener('click',event=>{
      stopEvent(event);
      renderPageVolumeMenu();
    });
    const pageActions = [capture, translate, darkAction, volumeAction];
    list.append(...pageActions.map(wrapMenuAction));
    const availableCount = pageActions.filter((button) => !button.disabled).length;
    setMenuStatus(status, `${availableCount} de ${pageActions.length} ${availableCount === 1 ? "ação disponível" : "ações disponíveis"}`);
    bindMenuKeyboardNavigation(menu, list);
    root.appendChild(menu);
    positionRoot(root);
    requestAnimationFrame(() => list.querySelector(".trem-action:not(:disabled)")?.focus({ preventScroll: true }));
  }

  // Caixa de som integrada ao popup contextual, com estado por aba.
  // Executa somente quando o usuário aciona a ferramenta na própria página.
  function renderPageVolumeMenu() {
    activeMenuMode='page';
    const root=createRoot();
    const {menu,list,status}=createContextMenuShell({context:'page',title:'Aumentar Volume',detail:pageContextDetail()});
    menu.classList.add('trem-volume-panel');
    const layout=document.createElement('section');
    layout.className='trem-volume-settings';
    const top=document.createElement('div');top.className='trem-volume-header';
    const value=document.createElement('output');value.className='trem-volume-value';value.textContent='0%';
    const multiplier=document.createElement('span');multiplier.className='trem-volume-multiplier';multiplier.textContent='1,0×';
    top.append(value,multiplier);
    const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='200';slider.step='5';slider.value='0';
    slider.className='trem-volume-range';slider.setAttribute('aria-label','Reforço de volume da aba: 0 a 200%');
    const marks=document.createElement('div');marks.className='trem-volume-marks';
    for(const label of ['0% · original','100% · 2×','200% · 3×']){const span=document.createElement('span');span.textContent=label;marks.append(span);}
    const description=document.createElement('p');description.className='trem-volume-help';
    description.textContent='Somente esta aba. O volume do vídeo e do sistema continuam independentes. Não gravamos áudio.';
    const actions=document.createElement('div');actions.className='trem-volume-actions';
    const start=document.createElement('button');start.type='button';start.className='trem-volume-start';start.textContent='▶ Ativar reforço';
    const stop=document.createElement('button');stop.type='button';stop.className='trem-volume-stop';stop.textContent='Desligar';
    const back=document.createElement('button');back.type='button';back.className='trem-volume-back';back.textContent='← Ferramentas da página';
    actions.append(start,stop);
    const message=document.createElement('p');message.className='trem-volume-message';message.setAttribute('role','status');message.textContent='Carregando estado desta aba…';
    const warning=document.createElement('small');warning.className='trem-volume-warning';warning.textContent='⚠️ Reforços altos podem distorcer o áudio. Aumente devagar, principalmente usando fones.';
    layout.append(top,slider,marks,description,actions,message,warning,back);
    list.append(layout);menu.append();root.append(menu);positionRoot(root);
    let enabled=false,busy=false;
    const call=(type,boost)=>chrome.runtime.sendMessage({channel:'cx-volume-v2',type,boost});
    const updatePercent=()=>{const n=Number(slider.value);value.textContent=n+'%';multiplier.textContent=(1+n/100).toFixed(1).replace('.',',')+'×';slider.style.setProperty('--trem-volume-progress',(n/2)+'%');};
    const showResult=result=>{
      if(!result?.ok)throw Error(result?.error||'Não foi possível alterar o volume.');
      enabled=!!result.enabled;
      if(Number.isFinite(Number(result.boost)))slider.value=String(result.boost);
      updatePercent();start.textContent=enabled?'✓ Amplificação ativa':'▶ Ativar reforço';
      stop.disabled=!enabled;
      message.textContent=enabled?'O áudio desta aba está sendo amplificado.':'Áudio original, sem amplificação.';
    };
    const reportError=error=>{
      message.textContent='Não foi possível capturar o áudio. Abra Caixota pelo botão direito nesta aba e tente novamente. '+String(error?.message||error);
      message.classList.add('error');
    };
    const perform=async type=>{
      if(busy)return;
      busy=true;start.disabled=true;stop.disabled=true;
      message.classList.remove('error');message.textContent='Aplicando…';
      try{showResult(await call(type,Number(slider.value)));}catch(error){reportError(error);}
      finally{busy=false;start.disabled=false;stop.disabled=!enabled;}
    };
    slider.addEventListener('input',()=>{updatePercent();});
    slider.addEventListener('change',()=>{perform(enabled?'adjust':'start');});
    start.addEventListener('click',()=>perform(enabled?'adjust':'start'));
    stop.addEventListener('click',()=>perform('stop'));
    back.addEventListener('click',event=>{stopEvent(event);renderPageActionMenu();});
    updatePercent();
    call('status').then(showResult).catch(reportError);
    setMenuStatus(status,'Amplificação local · por aba');
  }

  function createContextMenuShell({ context, title, detail = "", searchLabel = "", searchPlaceholder = "Buscar ferramenta" }) {
    const menu = document.createElement("section");
    menu.className = `trem-menu trem-context-menu trem-${context}-menu`;
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "false");
    menu.setAttribute("aria-labelledby", "trem-context-title");

    const header = document.createElement("header");
    header.className = "trem-context-header";
    const mark = createIconElement("caixota", "trem-context-mark");
    const copy = document.createElement("div");
    copy.className = "trem-context-copy";
    const brand = document.createElement("span");
    brand.className = "trem-context-brand";
    brand.textContent = "CAIXOTA";
    const heading = document.createElement("strong");
    heading.id = "trem-context-title";
    heading.className = "trem-context-title";
    heading.textContent = title;
    copy.append(brand, heading);
    if (detail) {
      const contextDetail = document.createElement("span");
      contextDetail.className = "trem-context-detail";
      contextDetail.textContent = detail;
      contextDetail.title = detail;
      copy.appendChild(contextDetail);
    }

    const close = document.createElement("button");
    close.type = "button";
    close.className = "trem-context-close";
    close.title = "Fechar a Caixota";
    close.setAttribute("aria-label", close.title);
    close.appendChild(createIconElement("close"));
    close.addEventListener("click", (event) => {
      stopEvent(event);
      closePanelWithMotion();
    });
    header.append(mark, copy, close);

    let searchWrap = null;
    let searchInput = null;
    if (searchLabel) {
      searchWrap = document.createElement("label");
      searchWrap.className = "trem-tool-search-wrap";
      const searchIcon = createIconElement("search", "trem-tool-search-icon");
      searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.className = "trem-tool-search";
      searchInput.placeholder = searchPlaceholder;
      searchInput.autocomplete = "off";
      searchInput.spellcheck = false;
      searchInput.maxLength = 60;
      searchInput.setAttribute("aria-label", searchLabel);
      searchInput.setAttribute("aria-controls", "trem-context-tool-list");
      searchWrap.append(searchIcon, searchInput);
    }

    const list = document.createElement("div");
    list.id = "trem-context-tool-list";
    list.className = "trem-tool-list";
    list.setAttribute("role", "list");

    const footer = document.createElement("footer");
    footer.className = "trem-menu-footer";
    const status = document.createElement("span");
    status.className = "trem-menu-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const shortcut = document.createElement("span");
    shortcut.className = "trem-menu-shortcut";
    shortcut.innerHTML = '<kbd>↑↓</kbd><span>navega</span><kbd>Esc</kbd><span>fecha</span>';
    footer.append(status, shortcut);

    menu.append(header);
    if (searchWrap) menu.appendChild(searchWrap);
    menu.append(list, footer);
    return { menu, list, status, searchInput };
  }

  function pageContextDetail() {
    try {
      return location.hostname || document.title || "Página aberta";
    } catch (_error) {
      return "Página aberta";
    }
  }

  function selectedTextContextDetail(text) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return "Trecho selecionado na página";
    const characters = Array.from(normalized);
    const preview = characters.length > 58 ? `${characters.slice(0, 57).join("").trimEnd()}…` : normalized;
    return `“${preview}”`;
  }

  function imageContextDetail() {
    return currentImageContext?.filename || currentImageContext?.alt || "Imagem da página";
  }

  function wrapMenuAction(button) {
    const row = document.createElement("div");
    row.className = "trem-action-row";
    row.setAttribute("role", "listitem");
    row.appendChild(button);
    return row;
  }

  function setMenuStatus(status, message) {
    if (status) status.textContent = message;
  }

  function bindMenuKeyboardNavigation(menu, list, searchInput = null, onSearchChange = null) {
    menu.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && searchInput?.value) {
        event.preventDefault();
        event.stopPropagation();
        searchInput.value = "";
        onSearchChange?.();
        return;
      }

      const actions = [...list.querySelectorAll(".trem-action:not(:disabled), .trem-folder-back:not(:disabled)")];
      if (!actions.length) return;

      if (event.key === "Enter" && event.target === searchInput) {
        event.preventDefault();
        actions[0].click();
        return;
      }

      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      if ((event.key === "Home" || event.key === "End") && event.target === searchInput) return;
      event.preventDefault();
      const currentIndex = actions.indexOf(document.activeElement);
      let nextIndex = 0;
      if (event.key === "End") nextIndex = actions.length - 1;
      else if (event.key === "ArrowUp") nextIndex = currentIndex <= 0 ? actions.length - 1 : currentIndex - 1;
      else if (event.key === "ArrowDown") nextIndex = currentIndex < 0 || currentIndex === actions.length - 1 ? 0 : currentIndex + 1;
      actions[nextIndex].focus({ preventScroll: true });
      actions[nextIndex].scrollIntoView({ block: "nearest" });
    });
  }

  function centeredReferenceRect() {
    const width = 280;
    const height = 40;
    const left = Math.max(12, window.innerWidth / 2 - width / 2);
    const top = Math.max(12, window.innerHeight / 2 - height / 2);
    return { left, top, width, height, right: left + width, bottom: top + height };
  }



function onMediaContextMenu(event) {
  lastContextImageElement = event.target?.closest?.("img") || null;
  lastContextVideoElement = event.target?.closest?.("video") || null;
}

function onRuntimeMessage(message, _sender, sendResponse) {
  if (message?.type === "START_PAGE_TRANSLATION") {
    startPageTranslation(message.sourceLanguage, message.targetLanguage)
      .then((result) => sendResponse?.({ ok: true, result }))
      .catch((error) => sendResponse?.({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "STOP_PAGE_TRANSLATION") {
    stopPageTranslation()
      .then((result) => sendResponse?.({ ok: true, result }))
      .catch((error) => sendResponse?.({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "OPEN_IMAGE_MENU") {
    openImageMenuFromContext(message.srcUrl)
      .then(() => sendResponse?.({ ok: true }))
      .catch((error) => sendResponse?.({ ok: false, error: safeMessage(error) }));
    return true;
  }

  if (message?.type === "PRIME_MEDIA_CONTEXT") {
    primeMediaDetection(message.pageUrl || location.href, Boolean(message.exact))
      .then((context) => sendResponse?.({ ok: true, mismatch: false, candidates: context.candidates, context }))
      .catch((error) => sendResponse?.({ ok: false, error: safeMessage(error), candidates: [] }));
    return true;
  }

  if (message?.type === "DETECT_MEDIA_CONTEXT") {
    const requestedUrl = message.pageUrl || location.href;
    if (message.exact && !sameMediaPageClient(requestedUrl, location.href)) {
      sendResponse?.({
        ok: true, mismatch: true, candidates: [],
        context: { pageUrl: location.href, directUrl: "", candidates: [], platform: detectMediaPlatform(location.href), title: document.title || "", poster: "", source: "page-mismatch" }
      });
      return false;
    }
    const context = collectMediaContext(null, location.href);
    sendResponse?.({ ok: true, mismatch: false, candidates: context.candidates, context });
    return false;
  }

  if (message?.type === "OPEN_TEXT_MENU") {
    openTextMenu(message.selectionText);
    sendResponse?.({ ok: true });
    return false;
  }

  if (message?.type === "OPEN_PAGE_MENU") {
    openPageMenu();
    if(message.selectedTool==='volume')renderPageVolumeMenu();
    sendResponse?.({ ok: true });
    return false;
  }

  if (message?.type === "OPEN_SCREEN_CAPTURE") {
    if (!settings.enabled || !settings.imageCaptureEnabled) {
      sendResponse?.({ ok: false, error: "A captura de tela está desativada nas configurações." });
      return false;
    }
    activeMenuMode = "image";
    currentImageContext = null;
    selectedText = "";
    selectionRect = centeredReferenceRect();
    recordToolUsage("image-capture", "image");
    openImageCaptureTool();
    sendResponse?.({ ok: true });
    return false;
  }

  return false;
}

function createPageTranslationState() {
  return {
    active: false,
    sourceLanguage: "auto",
    targetLanguage: "pt",
    observer: null,
    records: new Map(),
    cache: new Map(),
    queuedNodes: new Set(),
    queueTimer: 0,
    generation: 0,
    processingQueue: false
  };
}

async function startPageTranslation(sourceLanguage = "auto", targetLanguage = "pt") {
  if (!settings.enabled || !settings.translationEnabled) throw new Error("Ative a ferramenta Traduzir nas configurações.");
  await stopPageTranslation();
  pageTranslation.active = true;
  pageTranslation.sourceLanguage = String(sourceLanguage || "auto");
  pageTranslation.targetLanguage = String(targetLanguage || "pt");
  pageTranslation.generation += 1;
  const generation = pageTranslation.generation;

  const root = document.body || document.documentElement;
  const nodes = collectPageTextNodes(root);
  const translatedCount = await translatePageNodes(nodes.slice(0, 180), generation);
  if (!pageTranslation.active || generation !== pageTranslation.generation) return { translatedCount: 0 };

  pageTranslation.observer = new MutationObserver((mutations) => {
    if (!pageTranslation.active) return;
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        const node = mutation.target;
        const record = pageTranslation.records.get(node);
        if (record && node.data === record.translated) continue;
        if (record) pageTranslation.records.delete(node);
        queuePageTextNode(node);
        continue;
      }
      for (const added of mutation.addedNodes) {
        for (const node of collectPageTextNodes(added)) queuePageTextNode(node);
      }
    }
  });
  pageTranslation.observer.observe(document.documentElement, { childList: true, characterData: true, subtree: true });
  nodes.slice(180).forEach(queuePageTextNode);
  document.documentElement.dataset.caixotaPageTranslation = pageTranslation.targetLanguage;
  return { translatedCount };
}

async function stopPageTranslation() {
  const previous = pageTranslation;
  previous.active = false;
  previous.generation += 1;
  previous.observer?.disconnect();
  clearTimeout(previous.queueTimer);
  let restoredCount = 0;
  for (const [node, record] of previous.records) {
    if (node.isConnected && node.data === record.translated) {
      node.data = record.original;
      restoredCount += 1;
    }
  }
  document.documentElement.removeAttribute("data-caixota-page-translation");
  pageTranslation = createPageTranslationState();
  return { restoredCount };
}

function collectPageTextNodes(root) {
  if (!root) return [];
  if (root.nodeType === Node.TEXT_NODE) return isPageTextNodeEligible(root) ? [root] : [];
  if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return [];
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isPageTextNodeEligible(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function isPageTextNodeEligible(node) {
  const parent = node?.parentElement;
  const text = String(node?.data || "");
  if (!parent || !text.trim() || text.trim().length < 2 || text.length > 1800 || !/\p{L}/u.test(text)) return false;
  if (parent.closest(`#${ROOT_ID}, script, style, noscript, template, code, pre, kbd, samp, textarea, input, select, option, svg, math, [contenteditable=""], [contenteditable="true"], [translate="no"]`)) return false;
  return true;
}

function queuePageTextNode(node) {
  if (!pageTranslation.active || !isPageTextNodeEligible(node)) return;
  pageTranslation.queuedNodes.add(node);
  clearTimeout(pageTranslation.queueTimer);
  pageTranslation.queueTimer = setTimeout(processPageTranslationQueue, 140);
}

async function processPageTranslationQueue() {
  if (!pageTranslation.active || pageTranslation.processingQueue) return;
  const state = pageTranslation;
  state.processingQueue = true;
  const generation = state.generation;
  try {
    while (pageTranslation.active && pageTranslation.queuedNodes.size) {
      const nodes = Array.from(pageTranslation.queuedNodes).slice(0, 40);
      nodes.forEach((node) => pageTranslation.queuedNodes.delete(node));
      await translatePageNodes(nodes, generation);
    }
  } finally {
    if (pageTranslation === state) state.processingQueue = false;
  }
}

async function translatePageNodes(nodes, generation) {
  const eligible = nodes.filter((node) => node.isConnected && isPageTextNodeEligible(node));
  let translatedCount = 0;
  for (let offset = 0; offset < eligible.length; offset += 12) {
    if (!pageTranslation.active || generation !== pageTranslation.generation) break;
    const batch = eligible.slice(offset, offset + 12);
    const pending = [];
    const keys = [];
    for (const node of batch) {
      const original = node.data;
      const trimmed = original.trim();
      const cached = pageTranslation.cache.get(trimmed);
      if (cached) {
        applyPageTranslation(node, original, cached);
        translatedCount += cached !== trimmed ? 1 : 0;
      } else {
        pending.push(node);
        keys.push(trimmed);
      }
    }
    if (!pending.length) continue;
    const response = await sendRuntimeMessage({
      type: "TRANSLATE_PAGE_BATCH",
      texts: keys,
      sourceLanguage: pageTranslation.sourceLanguage,
      targetLanguage: pageTranslation.targetLanguage
    });
    if (!response?.ok) throw new Error(response?.error || "Não foi possível traduzir os textos da página.");
    const translations = Array.isArray(response.result?.translations) ? response.result.translations : [];
    pending.forEach((node, index) => {
      if (!pageTranslation.active || generation !== pageTranslation.generation || !node.isConnected) return;
      const source = keys[index];
      if (node.data.trim() !== source) return;
      const original = node.data;
      const translated = String(translations[index] || source);
      pageTranslation.cache.set(source, translated);
      applyPageTranslation(node, original, translated);
      if (translated !== source) translatedCount += 1;
    });
  }
  return translatedCount;
}

function applyPageTranslation(node, original, translatedCore) {
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  const translated = `${leading}${translatedCore}${trailing}`;
  pageTranslation.records.set(node, { original, translated });
  node.data = translated;
}

async function openImageMenuFromContext(srcUrl) {
  if (!settings.enabled || !srcUrl) return;
  const matchedElement = lastContextImageElement && (lastContextImageElement.currentSrc === srcUrl || lastContextImageElement.src === srcUrl)
    ? lastContextImageElement
    : findImageElementByUrl(srcUrl);

  currentImageContext = {
    srcUrl,
    element: matchedElement,
    alt: matchedElement?.alt || "",
    title: matchedElement?.title || "",
    filename: guessFilenameFromUrl(srcUrl)
  };

  const rect = matchedElement?.getBoundingClientRect?.();
  selectionRect = rect && (rect.width || rect.height) ? rect : centeredReferenceRect();
  activeMenuMode = "image";
  selectedText = "";
  operationToken += 1;
  renderImageActionMenu();
}

function findImageElementByUrl(url) {
  if (!url) return null;
  return Array.from(document.images || []).find((image) => image.currentSrc === url || image.src === url) || null;
}

async function openVideoMenuFromContext(srcUrl = "", pageUrl = "") {
  if (!settings.enabled) return;
  const matchedElement = lastContextVideoElement || findVideoElementByUrl(srcUrl);
  currentVideoContext = collectMediaContext(matchedElement, pageUrl || location.href, srcUrl);
  currentImageContext = null;
  selectedText = "";
  const rect = matchedElement?.getBoundingClientRect?.();
  selectionRect = rect && (rect.width || rect.height) ? rect : centeredReferenceRect();
  activeMenuMode = "video";
  operationToken += 1;
  removePanel(); // O menu de baixar mídia foi descontinuado.
}

function collectMediaContext(videoElement = null, pageUrl = location.href, explicitSrc = "") {
  const candidates = [];
  const push = (url, type = "video", label = "Mídia detectada", source = "page", extra = {}) => {
    const safe = normalizeDetectedMediaUrl(url);
    if (!safe || candidates.some((item) => item.url === safe)) return;
    candidates.push({
      url: safe,
      type,
      label,
      source,
      quality: extra.quality || mediaQualityFromUrl(safe),
      size: Math.max(0, Number(extra.size) || 0),
      width: Math.max(0, Number(extra.width) || 0),
      height: Math.max(0, Number(extra.height) || 0),
      duration: Math.max(0, Number(extra.duration) || 0),
      bitrate: Math.max(0, Number(extra.bitrate) || 0),
      poster: normalizeDetectedMediaUrl(extra.poster || ""),
      hasAudio: typeof extra.hasAudio === "boolean" ? extra.hasAudio : undefined,
      confidence: Math.max(0, Math.min(100, Number(extra.confidence) || mediaCandidateConfidence(source, type)))
    });
  };

  const videos = videoElement ? [videoElement] : findRelevantVideoElements(pageUrl || location.href);
  const pagePoster = normalizeDetectedMediaUrl(
    document.querySelector('meta[property="og:image"]')?.content
    || document.querySelector('meta[name="twitter:image"]')?.content
    || ""
  );

  push(explicitSrc, "video", "Vídeo clicado", "context", { confidence: 100,
    poster: videoElement?.poster || pagePoster,
    width: videoElement?.videoWidth,
    height: videoElement?.videoHeight,
    duration: videoElement?.duration,
    hasAudio: videoElement ? guessVideoElementHasAudio(videoElement) : undefined
  });

  videos.slice(0, 12).forEach((video, index) => {
    const meta = {
      poster: video.poster || pagePoster,
      width: video.videoWidth,
      height: video.videoHeight,
      duration: Number.isFinite(video.duration) ? video.duration : 0,
      hasAudio: guessVideoElementHasAudio(video)
    };
    push(video.currentSrc, "video", videos.length > 1 ? `Vídeo ${index + 1}` : "Vídeo atual", "element", { ...meta, confidence: 98 });
    push(video.src, "video", videos.length > 1 ? `Vídeo ${index + 1}` : "Vídeo atual", "element", { ...meta, confidence: 96 });
    video.querySelectorAll?.("source[src]").forEach((source) => {
      const sourceType = source.type?.startsWith("audio/") ? "audio" : "video";
      push(source.src, sourceType, sourceType === "audio" ? "Áudio do vídeo" : "Fonte do vídeo", "element", { ...meta, confidence: 96 });
    });
  });

  document.querySelectorAll('meta[property="og:video"],meta[property="og:video:url"],meta[property="og:video:secure_url"],meta[name="twitter:player:stream"]').forEach((meta) => {
    push(meta.content, "video", "Vídeo da página", "meta", { poster: pagePoster, confidence: 88 });
  });
  document.querySelectorAll('meta[property="og:audio"],meta[property="og:audio:url"],meta[property="og:audio:secure_url"]').forEach((meta) => {
    push(meta.content, "audio", "Áudio da página", "meta", { poster: pagePoster, hasAudio: true });
  });

  try {
    const resources = performance.getEntriesByType("resource");
    for (const entry of resources.slice(-900)) {
      const url = String(entry.name || "");
      if (!url) continue;
      const resourceSize = Number(entry.encodedBodySize || entry.transferSize || 0);
      if (/video\.twimg\.com/i.test(url) && /\.(?:mp4|m3u8)(?:[?#]|$)/i.test(url)) {
        const dimensions = dimensionsFromMediaUrl(url);
        push(url, /m3u8/i.test(url) ? "playlist" : "video", "Stream do X/Twitter", "resource", { ...dimensions, size: resourceSize, poster: pagePoster, hasAudio: !/m3u8/i.test(url), confidence: 94 });
      } else if (/googlevideo\.com\/videoplayback/i.test(url)) {
        let type = "video";
        let hasAudio;
        try {
          const parsed = new URL(url);
          const mime = decodeURIComponent(parsed.searchParams.get("mime") || "");
          if (mime.startsWith("audio/")) { type = "audio"; hasAudio = true; }
          else if (mime.startsWith("video/")) hasAudio = ["18", "22", "17", "36"].includes(parsed.searchParams.get("itag"));
        } catch (_error) {}
        push(url, type, type === "audio" ? "Áudio do YouTube" : "Stream do YouTube", "resource", { size: resourceSize, poster: pagePoster, hasAudio, confidence: 94 });
      } else if (/(?:cdninstagram|fbcdn|scontent)[^/]*\./i.test(url) && /(?:video|\.mp4)/i.test(url)) {
        push(url, "video", "Vídeo do Instagram", "resource", { size: resourceSize, poster: pagePoster, hasAudio: true, confidence: 94 });
      }
    }
  } catch (_error) {}

  const primaryVideo = videos[0] || null;
  return {
    pageUrl: String(pageUrl || location.href),
    directUrl: candidates.find((item) => item.type === "video")?.url || "",
    candidates: candidates.slice(0, 40),
    platform: detectMediaPlatform(pageUrl || location.href),
    title: document.querySelector('meta[property="og:title"]')?.content || document.title || "",
    poster: primaryVideo?.poster || pagePoster || "",
    source: videoElement ? "video-context" : "page-context"
  };
}

function mediaCandidateConfidence(source, type) {
  if (type === "image") return 0;
  if (source === "context") return 100;
  if (source === "element") return 96;
  if (source === "resource") return 94;
  if (source === "meta") return 88;
  return 70;
}

function findRelevantVideoElements(pageUrl = location.href) {
  const all = [...document.querySelectorAll("video")];
  if (!all.length) return [];
  try {
    const url = new URL(pageUrl, location.href);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
      const id = /\/[^/]+\/status\/(\d+)/.exec(url.pathname)?.[1];
      if (id) {
        const anchors = [...document.querySelectorAll(`a[href*="/status/${CSS.escape(id)}"]`)];
        for (const anchor of anchors) {
          const article = anchor.closest("article");
          const videos = article ? [...article.querySelectorAll("video")] : [];
          if (videos.length) return videos;
        }
      }
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const main = document.querySelector("video.html5-main-video, #movie_player video");
      if (main) return [main];
    }
    if (host === "instagram.com" || host.endsWith(".instagram.com")) {
      const main = document.querySelector("main video, article video");
      if (main) return [main];
    }
  } catch (_error) {}
  return all.slice(0, 6);
}

async function primeMediaDetection(requestedUrl = location.href, exact = false) {
  if (exact && !sameMediaPageClient(requestedUrl, location.href)) {
    return { pageUrl: location.href, directUrl: "", candidates: [], platform: detectMediaPlatform(location.href), title: document.title || "", poster: "", source: "page-mismatch" };
  }
  const videos = findRelevantVideoElements(requestedUrl);
  const states = videos.map((video) => ({ video, paused: video.paused, muted: video.muted, volume: video.volume }));
  for (const { video } of states) {
    try {
      video.muted = true;
      video.preload = "auto";
      video.scrollIntoView?.({ block: "center", inline: "nearest" });
      await Promise.resolve(video.play?.()).catch(() => {});
    } catch (_error) {}
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const context = collectMediaContext(videos[0] || null, location.href);
  for (const state of states) {
    try {
      if (state.paused) state.video.pause?.();
      state.video.muted = state.muted;
      state.video.volume = state.volume;
    } catch (_error) {}
  }
  return context;
}

function guessVideoElementHasAudio(video) {
  try {
    if (typeof video.mozHasAudio === "boolean") return video.mozHasAudio;
    if (Number(video.webkitAudioDecodedByteCount) > 0) return true;
    if (video.audioTracks && typeof video.audioTracks.length === "number") return video.audioTracks.length > 0;
  } catch (_error) {}
  return undefined;
}

function dimensionsFromMediaUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    const path = /\/(\d{2,5})x(\d{2,5})\//.exec(parsed.pathname);
    return path ? { width: Number(path[1]), height: Number(path[2]), quality: `${path[2]}p` } : {};
  } catch (_error) { return {}; }
}

function sameMediaPageClient(a, b) {
  const left = canonicalMediaPageClient(a);
  const right = canonicalMediaPageClient(b);
  return Boolean(left && right && left === right);
}

function canonicalMediaPageClient(raw) {
  try {
    const url = new URL(String(raw || ""), location.href);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return `youtube:${url.pathname.split("/").filter(Boolean)[0] || ""}`;
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const id = url.searchParams.get("v") || (/\/shorts\/([^/?#]+)/.exec(url.pathname)?.[1]) || (/\/embed\/([^/?#]+)/.exec(url.pathname)?.[1]);
      if (id) return `youtube:${id}`;
    }
    if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) {
      const match = /\/[^/]+\/status\/(\d+)/.exec(url.pathname);
      return match ? `x:${match[1]}` : `${host}${url.pathname.replace(/\/+$/, "")}`;
    }
    if (host === "instagram.com" || host.endsWith(".instagram.com")) {
      const match = /\/(?:reel|reels|p)\/([^/?#]+)/.exec(url.pathname);
      return match ? `instagram:${match[1]}` : `${host}${url.pathname.replace(/\/+$/, "")}`;
    }
    return `${host}${url.pathname.replace(/\/+$/, "")}`;
  } catch (_error) { return ""; }
}

function findVideoElementByUrl(url) {
  if (!url) return document.querySelector("video");
  return [...document.querySelectorAll("video")].find((video) => video.currentSrc === url || video.src === url || [...video.querySelectorAll("source")].some((source) => source.src === url)) || document.querySelector("video");
}

function normalizeDetectedMediaUrl(raw) {
  try {
    const url = new URL(String(raw || ""), location.href);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (url.hostname.includes("googlevideo.com")) ["range", "rn", "rbuf"].forEach((key) => url.searchParams.delete(key));
    return url.href;
  } catch (_error) { return ""; }
}

function mediaQualityFromUrl(url) {
  try {
    const parsed = new URL(url);
    const itag = parsed.searchParams.get("itag");
    const quality = parsed.searchParams.get("quality_label") || parsed.searchParams.get("quality");
    return quality || (itag ? `itag ${itag}` : "");
  } catch (_error) { return ""; }
}

function detectMediaPlatform(url) {
  try {
    const host = new URL(String(url || location.href)).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com")) return "X/Twitter";
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "YouTube";
  } catch (_error) {}
  return "Web";
}

function isSupportedMediaPage(url) { return detectMediaPlatform(url) !== "Web"; }

const IMAGE_FOLDER_DETAILS = {
  "Conversão": { id: "image-conversion", icon: "folder-conversion", description: "Converter, comprimir, girar e exportar" },
  "Informações": { id: "image-info", icon: "folder-utilities", description: "Paleta, metadados e detalhes da imagem" },
  "Texto": { id: "image-text", icon: "folder-text", description: "Extrair texto e trabalhar com conteúdo visual" }
};


function getImageToolDefinitions() {
  return applyToolAliases("images", [
    { id: "image-capture", label: "Capturar", icon: "capture", folder: "Conversão", enabled: settings.imageCaptureEnabled, description: "Capture a aba visível ou uma área para usar nas ferramentas.", keywords: ["captura", "screenshot", "tela", "área", "aba"], handler: openImageCaptureTool },
    { id: "image-compress", label: "Comprimir", icon: "compress", folder: "Conversão", enabled: settings.imageCompressEnabled, description: "Reduza o arquivo ajustando formato e qualidade.", keywords: ["compress", "otimizar", "qualidade", "reduzir tamanho", "imagem"], handler: openImageCompressTool },
    { id: "image-convert", label: "Converter", icon: "image-convert", folder: "Conversão", enabled: settings.imageConvertEnabled, description: "Transforme a imagem em PNG, JPEG ou WebP.", keywords: ["converter", "png", "jpeg", "jpg", "webp", "formato"], handler: openImageConvertTool },
    { id: "image-colors", label: "Cores", icon: "palette", folder: "Informações", enabled: settings.imageColorsEnabled, description: "Encontre cores dominantes e use o conta-gotas.", keywords: ["paleta", "cores", "hex", "rgb", "color", "dominante", "conta gotas"], handler: openImagePaletteTool },
    { id: "image-info", label: "Informações", icon: "image-info", folder: "Informações", enabled: settings.imageInfoEnabled, description: "Veja formato, dimensões, proporção e tamanho do arquivo.", keywords: ["info", "tamanho", "dimensões", "formato", "detalhes"], handler: openImageInfoTool },
    { id: "image-qr", label: "QR Code", icon: "qr", folder: "Texto", enabled: settings.imageQrEnabled, network: "optional", description: "Leia o conteúdo de um QR Code presente na imagem.", keywords: ["qr", "qrcode", "código", "url", "texto", "ler"], handler: openImageQrTool },
    { id: "image-resize", label: "Redimensionar", icon: "image-resize", folder: "Conversão", enabled: settings.imageResizeEnabled, description: "Ajuste largura e altura mantendo a proporção, se quiser.", keywords: ["resize", "redimensionar", "largura", "altura", "dimensão"], handler: openImageResizeTool },
    { id: "image-text", label: "Extrair Texto", icon: "image-text", folder: "Texto", enabled: settings.imageTextEnabled, network: "optional", description: "Reconheça e copie palavras presentes na imagem.", keywords: ["ocr", "texto", "extrair", "scan", "imagem"], handler: openImageTextTool },
    { id: "image-rotate", label: "Girar", icon: "image-rotate", folder: "Conversão", enabled: settings.imageRotateEnabled, description: "Gire ou espelhe a imagem horizontalmente.", keywords: ["girar", "rotacionar", "espelhar", "rotate", "flip"], handler: openImageRotateTool }
  ]).filter((tool) => tool.enabled).sort(sortToolsAlphabetically);
}

function getImageToolFolders(tools = getImageToolDefinitions()) {
  const folders = new Map();
  for (const tool of tools) {
    const details = IMAGE_FOLDER_DETAILS[tool.folder] || { id: normalizeToolSearch(tool.folder).replace(/\s+/g, "-"), icon: "folder-generic", description: "Ferramentas de imagem" };
    if (!folders.has(details.id)) folders.set(details.id, { id: details.id, label: tool.folder, icon: details.icon, description: details.description, tools: [] });
    folders.get(details.id).tools.push(tool);
  }
  return [...folders.values()].map((folder) => ({ ...folder, tools: [...folder.tools].sort(sortToolsAlphabetically) }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));
}

function renderImageActionMenu(activeFolderId = null) {
  activeMenuMode = "image";
  activeInvokedTool = null;
  const root = createRoot();
  const { menu, searchInput, list, status } = createContextMenuShell({
    context: "image",
    title: "Imagem detectada",
    detail: imageContextDetail(),
    searchLabel: "Pesquisar ferramenta de imagem",
    searchPlaceholder: "Buscar nas ferramentas de imagem"
  });

  const tools = getImageToolDefinitions();
  const state = { activeFolderId };

  const appendSection = (fragment, label, count = 0) => {
    fragment.appendChild(createMenuSectionLabel(label, count));
  };

  const appendToolRows = (fragment, toolList, _showFolderMeta = false, searchQuery = "") => {
    for (const tool of toolList) {
      fragment.appendChild(createActionButton(tool, searchInput, tool.description, updateList, "imageFavorites", searchQuery));
    }
  };

  const renderRootMenu = (fragment) => {
    const favorites = tools.filter((tool) => isFavoriteTool(tool, "imageFavorites")).sort(sortToolsAlphabetically);
    if (favorites.length) {
      appendSection(fragment, "Favoritos", favorites.length);
      appendToolRows(fragment, favorites);
    }
    const favoriteIds = new Set(favorites.map((tool) => tool.id));
    const recent = settings.recentToolsEnabled
      ? getRecentTools(tools, "image").filter((tool) => !favoriteIds.has(tool.id))
      : [];
    if (recent.length) {
      appendSection(fragment, "Recentes", recent.length);
      appendToolRows(fragment, recent);
    }
    if (settings.foldersEnabled) {
      const folders = getImageToolFolders(tools);
      appendSection(fragment, "Pastas", folders.length);
      for (const folder of folders) fragment.appendChild(createFolderButton(folder, () => { state.activeFolderId = folder.id; updateList(); }));
    } else {
      const recentIds = new Set(recent.map((tool) => tool.id));
      const remaining = tools.filter((tool) => !favoriteIds.has(tool.id) && !recentIds.has(tool.id)).sort(sortToolsAlphabetically);
      if (remaining.length) {
        appendSection(fragment, favorites.length || recent.length ? "Outras ferramentas" : "Todas as ferramentas", remaining.length);
        appendToolRows(fragment, remaining);
      }
    }
  };

  const updateList = () => {
    const query = normalizeToolSearch(searchInput.value);
    const fragment = document.createDocumentFragment();
    let statusMessage = `${tools.length} ${tools.length === 1 ? "ferramenta disponível" : "ferramentas disponíveis"}`;
    if (!tools.length) {
      fragment.appendChild(createEmptyMenuMessage("Nenhuma ferramenta ativa", "Ative ferramentas de imagem nas configurações da Caixota."));
      statusMessage = "Sem ferramentas ativas";
    } else if (query) {
      const matches = tools.filter((tool) => toolMatchesSearch(tool, query));
      if (!matches.length) {
        fragment.appendChild(createEmptyMenuMessage("Nada encontrado", "Tente buscar por outro nome ou função."));
        statusMessage = `Nenhum resultado para “${searchInput.value.trim()}”`;
      } else {
        const favoriteMatches = matches.filter((tool) => isFavoriteTool(tool, "imageFavorites")).sort(sortToolsAlphabetically);
        const otherMatches = matches.filter((tool) => !isFavoriteTool(tool, "imageFavorites")).sort(sortToolsAlphabetically);
        if (favoriteMatches.length) { appendSection(fragment, "Favoritos", favoriteMatches.length); appendToolRows(fragment, favoriteMatches, true, query); }
        if (otherMatches.length) { appendSection(fragment, favoriteMatches.length ? "Resultados" : "Ferramentas", otherMatches.length); appendToolRows(fragment, otherMatches, true, query); }
        statusMessage = `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"}`;
      }
    } else if (state.activeFolderId && settings.foldersEnabled) {
      const folder = getImageToolFolders(tools).find((item) => item.id === state.activeFolderId);
      if (!folder) {
        state.activeFolderId = null;
        renderRootMenu(fragment);
      } else {
        fragment.appendChild(createFolderHeader(folder, () => { state.activeFolderId = null; updateList(); }));
        appendToolRows(fragment, folder.tools.sort(sortToolsAlphabetically));
        if (!folder.tools.length) fragment.appendChild(createEmptyMenuMessage("Pasta vazia", "Nenhuma ferramenta está atribuída a esta pasta."));
        statusMessage = `${folder.tools.length} ${folder.tools.length === 1 ? "ferramenta" : "ferramentas"} em ${folder.label}`;
      }
    } else {
      renderRootMenu(fragment);
    }
    list.dataset.view = query ? "search" : (state.activeFolderId ? "folder" : "root");
    list.replaceChildren(fragment);
    list.scrollTop = 0;
    setMenuStatus(status, statusMessage);
    if (root.isConnected) positionRoot(root);
  };

  searchInput.addEventListener("input", () => { hideToolTooltip(); updateList(); });
  bindMenuKeyboardNavigation(menu, list, searchInput, updateList);
  setupToolMenuScrolling(list);
  root.appendChild(menu);
  updateList();
  positionRoot(root);
  requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
}

  
  const DEFAULT_FOLDER_DETAILS = {
    "Conversão": { id: "conversion", icon: "folder-conversion", description: "Moedas, unidades, códigos e cores" },
    "Segurança": { id: "security", icon: "folder-security", description: "Senhas e análise local de endereços" },
    "Texto": { id: "text", icon: "folder-text", description: "Leitura, escrita e organização textual" },
    "Utilidades": { id: "utilities", icon: "folder-utilities", description: "Cálculos, datas, voz e produtividade" }
  };


  function getToolDefinitions() {
    return applyToolAliases("text", [
      { id: "currency", label: "Conversor de Moedas", icon: "currency", folder: "Conversão", enabled: settings.currencyEnabled, network: "required", description: "Converta valores por símbolo, código ou nome da moeda com a cotação mais recente.", keywords: ["câmbio", "cambio", "moeda", "dinheiro", "dólar", "dolar", "dólares", "dólar australiano", "iene", "ienes", "reais", "euro", "currency", "converter"], handler: convertSelectedCurrency },
      { id: "calculate", label: "Calculadora", icon: "calculate", folder: "Utilidades", enabled: settings.calculatorEnabled, description: "Resolva contas com parênteses e porcentagens.", keywords: ["calcular", "cálculo", "calculo", "conta", "matemática", "matematica", "math", "somar"], handler: calculateSelection },
      { id: "encoder", label: "Codificar Texto", icon: "encode", folder: "Conversão", enabled: settings.encoderEnabled, description: "Codifique ou restaure Base64, URL, HTML, Unicode, Morse e binário.", keywords: ["codificar", "base64", "encode", "decode", "url", "html", "unicode", "decodificar"], handler: encodeSelection },
      { id: "compare", label: "Comparar Textos", icon: "compare", folder: "Texto", enabled: settings.comparerEnabled, description: "Compare duas versões e veja o que foi adicionado ou removido.", keywords: ["comparar", "diferença", "diff", "alterações", "texto", "versões"], handler: compareSelection },
      { id: "counter", label: "Contador de Texto", icon: "counter", folder: "Texto", enabled: settings.counterEnabled, description: "Conte palavras, caracteres, frases, linhas e tempo de leitura.", keywords: ["contador", "palavras", "caracteres", "frases", "linhas", "leitura", "contar", "count", "estatística", "estatistica"], handler: countSelection },
      { id: "units", label: "Conversor de Unidades", icon: "ruler", folder: "Conversão", enabled: settings.converterEnabled, description: "Converta medidas como distância, massa e temperatura.", keywords: ["conversor", "unidade", "medida", "distância", "distancia", "temperatura", "measurement", "converter"], handler: openUnitConverter },
      { id: "color", label: "Converter Código de Cor", icon: "palette", folder: "Conversão", enabled: settings.colorEnabled, description: "Converta cores entre HEX, RGB e HSL.", keywords: ["cor", "color", "hex", "rgb", "rgba", "hsl", "hsla", "paleta"], handler: inspectColorSelection },
      { id: "date", label: "Data", icon: "calendar", folder: "Utilidades", enabled: settings.dateEnabled, description: "Veja dia da semana, formato ISO e distância até hoje.", keywords: ["calendário", "calendario", "date", "dia", "prazo", "tempo", "data"], handler: inspectDateSelection },
      { id: "dictionary", label: "Dicionário", icon: "book", folder: "Texto", enabled: settings.dictionaryEnabled, network: "required", description: "Consulte significados e classes gramaticais.", keywords: ["significado", "definição", "definicao", "palavra", "dictionary", "verbete", "sinônimo", "sinonimo"], handler: lookupDictionarySelection },
      { id: "formatter", label: "Formatar Textos", icon: "type", folder: "Texto", enabled: settings.formatterEnabled, description: "Ajuste caixa, títulos e capitalização.", keywords: ["formatar", "maiúscula", "maiuscula", "minúscula", "minuscula", "título", "titulo", "capitalizar", "case", "caixa", "texto"], handler: formatSelection },
      { id: "reader", label: "TTS", icon: "speaker", folder: "Utilidades", enabled: settings.readerEnabled, description: "Ouça a seleção com as vozes disponíveis no navegador.", keywords: ["ler", "voz", "ouvir", "narrar", "audio", "áudio", "speech", "falar"], handler: readSelection },
      { id: "cleaner", label: "Limpar Texto", icon: "broom", folder: "Texto", enabled: settings.cleanerEnabled, description: "Remova espaços duplicados, quebras extras e caracteres invisíveis.", keywords: ["limpar", "espaços", "espacos", "quebras", "invisível", "invisivel", "formatação", "formatacao", "remover", "clean", "higienizar"], handler: cleanSelection },
      { id: "link-checker", label: "Verificador de Link", icon: "link", folder: "Segurança", enabled: settings.linkCheckerEnabled, description: "Analise o endereço localmente e remova rastreadores comuns.", keywords: ["link", "url", "site", "endereço", "verificar", "rastreador", "https"], handler: inspectSelectedLink },
      { id: "list", label: "Transformar em Lista", icon: "list", folder: "Texto", enabled: settings.listEnabled, description: "Organize itens em marcadores, números ou checklist.", keywords: ["lista", "itens", "checklist", "tópicos", "topicos", "markdown", "bullets"], handler: listSelection },
      { id: "sort", label: "Ordenar", icon: "sort", folder: "Utilidades", enabled: settings.sorterEnabled, description: "Ordene linhas ou remova itens duplicados.", keywords: ["ordenar", "classificar", "sort", "alfabética", "alfabetica", "duplicados", "linhas"], handler: sortSelection },
      { id: "password", label: "Gerador de Senhas", icon: "password", folder: "Segurança", enabled: settings.passwordEnabled, description: "Gere senhas fortes localmente, sem enviar dados.", keywords: ["senha", "password", "gerar", "segura", "aleatória", "random"], handler: openPasswordGenerator },
      { id: "translate", label: "Tradutor", icon: "translate", folder: "Texto", enabled: settings.translationEnabled, network: "required", description: "Traduza para o idioma definido nas configurações.", keywords: ["traduzir", "tradução", "traducao", "translate", "idioma", "language", "tradutor"], handler: translateSelection },
      { id: "qr-generator", label: "Gerar QR Code", icon: "qr", folder: "Conversão", enabled: settings.qrGeneratorEnabled, description: "Crie localmente um QR Code para texto ou URL.", keywords: ["qr", "qrcode", "código", "url", "png", "copiar imagem"], handler: openQrGenerator }
    ]).filter((tool) => tool.enabled).sort(sortToolsAlphabetically);
  }

  function applyToolAliases(category, tools) {
    return tools.map((tool) => ({
      ...tool,
      originalLabel: tool.label,
      label: settings.toolAliases?.[`${category}:${tool.id}`] || tool.label
    }));
  }

  function displayToolLabel(category, toolId, fallback) {
    return settings.toolAliases?.[`${category}:${toolId}`] || fallback;
  }

  function activeToolLabel(category, fallback) {
    return activeInvokedTool?.category === category ? activeInvokedTool.label : fallback;
  }

  function sortToolsAlphabetically(a, b) {
    return a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" });
  }

  function isFavoriteTool(tool, favoriteKey = "favorites") {
    const key = typeof favoriteKey === "string" ? favoriteKey : "favorites";
    return Array.isArray(settings[key]) && settings[key].includes(tool.id);
  }

  function getToolFolders(tools = getToolDefinitions()) {
    const folders = new Map();
    const customFolders = new Map((settings.customFolders || []).map((folder) => [folder.id, folder]));

    for (const folder of settings.customFolders || []) {
      folders.set(folder.id, { id: folder.id, label: folder.name, icon: "folder-custom", description: folder.description || "Pasta personalizada para suas ferramentas", custom: true, tools: [] });
    }

    for (const tool of tools) {
      const customFolderId = settings.folderAssignments?.[tool.id];
      const customFolder = customFolders.get(customFolderId);
      if (customFolder) {
        folders.get(customFolder.id)?.tools.push(tool);
        continue;
      }

      const details = DEFAULT_FOLDER_DETAILS[tool.folder] || { id: normalizeToolSearch(tool.folder).replace(/\s+/g, "-"), icon: "folder-generic", description: "Ferramentas organizadas" };
      if (!folders.has(details.id)) folders.set(details.id, { id: details.id, label: tool.folder, icon: details.icon, description: details.description, custom: false, tools: [] });
      folders.get(details.id).tools.push(tool);
    }

    return [...folders.values()]
      .map((folder) => ({ ...folder, tools: [...folder.tools].sort(sortToolsAlphabetically) }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }));
  }

  function renderActionMenu(activeFolderId = null) {
    activeMenuMode = "text";
    activeInvokedTool = null;
    const root = createRoot();
    const { menu, searchInput, list, status } = createContextMenuShell({
      context: "text",
      title: "Texto selecionado",
      detail: selectedTextContextDetail(selectedText),
      searchLabel: "Pesquisar ferramenta de texto",
      searchPlaceholder: "Buscar nas ferramentas de texto"
    });

    const tools = getToolDefinitions();
    const state = { activeFolderId };

    const appendSection = (fragment, label, count = 0) => {
      fragment.appendChild(createMenuSectionLabel(label, count));
    };

    const appendToolRows = (fragment, toolList, _showFolderMeta = false, searchQuery = "") => {
      for (const tool of toolList) {
        fragment.appendChild(createActionButton(tool, searchInput, tool.description, updateList, "favorites", searchQuery));
      }
    };

    const updateList = () => {
      const query = normalizeToolSearch(searchInput.value);
      const fragment = document.createDocumentFragment();
      let statusMessage = `${tools.length} ${tools.length === 1 ? "ferramenta disponível" : "ferramentas disponíveis"}`;

      if (!tools.length) {
        fragment.appendChild(createEmptyMenuMessage("Nenhuma ferramenta ativa", "Ative ferramentas de texto nas configurações da Caixota."));
        statusMessage = "Sem ferramentas ativas";
      } else if (query) {
        const matches = tools.filter((tool) => toolMatchesSearch(tool, query));
        if (!matches.length) {
          fragment.appendChild(createEmptyMenuMessage("Nada encontrado", "Tente buscar por outro nome ou função."));
          statusMessage = `Nenhum resultado para “${searchInput.value.trim()}”`;
        } else {
          const favoriteMatches = matches.filter(isFavoriteTool).sort(sortToolsAlphabetically);
          const otherMatches = matches.filter((tool) => !isFavoriteTool(tool)).sort(sortToolsAlphabetically);
          if (favoriteMatches.length) { appendSection(fragment, "Favoritos", favoriteMatches.length); appendToolRows(fragment, favoriteMatches, true, query); }
          if (otherMatches.length) { appendSection(fragment, favoriteMatches.length ? "Resultados" : "Ferramentas", otherMatches.length); appendToolRows(fragment, otherMatches, true, query); }
          statusMessage = `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"}`;
        }
      } else if (state.activeFolderId && settings.foldersEnabled) {
        const folder = getToolFolders(tools).find((item) => item.id === state.activeFolderId);
        if (!folder) {
          state.activeFolderId = null;
          renderRootMenu(fragment);
        } else {
          fragment.appendChild(createFolderHeader(folder, () => { state.activeFolderId = null; updateList(); }));
          appendToolRows(fragment, folder.tools.sort(sortToolsAlphabetically));
          if (!folder.tools.length) fragment.appendChild(createEmptyMenuMessage("Pasta vazia", "Nenhuma ferramenta está atribuída a esta pasta."));
          statusMessage = `${folder.tools.length} ${folder.tools.length === 1 ? "ferramenta" : "ferramentas"} em ${folder.label}`;
        }
      } else {
        renderRootMenu(fragment);
      }

      list.dataset.view = query ? "search" : (state.activeFolderId ? "folder" : "root");
      list.replaceChildren(fragment);
      list.scrollTop = 0;
      setMenuStatus(status, statusMessage);
      if (root.isConnected) positionRoot(root);
    };

    const renderRootMenu = (fragment) => {
      const favorites = tools.filter(isFavoriteTool).sort(sortToolsAlphabetically);
      if (favorites.length) {
        appendSection(fragment, "Favoritos", favorites.length);
        appendToolRows(fragment, favorites);
      }

      const favoriteIds = new Set(favorites.map((tool) => tool.id));
      const recent = settings.recentToolsEnabled
        ? getRecentTools(tools, "text").filter((tool) => !favoriteIds.has(tool.id))
        : [];
      if (recent.length) {
        appendSection(fragment, "Recentes", recent.length);
        appendToolRows(fragment, recent);
      }

      if (settings.foldersEnabled) {
        const folders = getToolFolders(tools);
        appendSection(fragment, "Pastas", folders.length);
        for (const folder of folders) fragment.appendChild(createFolderButton(folder, () => { state.activeFolderId = folder.id; updateList(); }));
      } else {
        const recentIds = new Set(recent.map((tool) => tool.id));
        const remaining = tools.filter((tool) => !favoriteIds.has(tool.id) && !recentIds.has(tool.id)).sort(sortToolsAlphabetically);
        if (remaining.length) {
          appendSection(fragment, favorites.length || recent.length ? "Outras ferramentas" : "Todas as ferramentas", remaining.length);
          appendToolRows(fragment, remaining);
        }
      }
    };

    searchInput.addEventListener("input", () => { hideToolTooltip(); updateList(); });
    bindMenuKeyboardNavigation(menu, list, searchInput, updateList);
    setupToolMenuScrolling(list);
    root.appendChild(menu);
    updateList();
    positionRoot(root);
    requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
  }

  function getEffectiveFolderLabel(tool) {
    const customId = settings.folderAssignments?.[tool.id];
    const custom = (settings.customFolders || []).find((folder) => folder.id === customId);
    return custom?.name || tool.folder || "";
  }

  function createMenuSectionLabel(label, count = 0) {
    const section = document.createElement("div");
    section.className = "trem-menu-section-label";
    const text = document.createElement("span");
    text.textContent = label;
    section.appendChild(text);
    if (count > 0) {
      const amount = document.createElement("span");
      amount.className = "trem-menu-section-count";
      amount.textContent = String(count);
      section.appendChild(amount);
    }
    return section;
  }

  function createEmptyMenuMessage(message, detail = "") {
    const empty = document.createElement("div");
    empty.className = "trem-tool-empty";
    const icon = createIconElement("search", "trem-tool-empty-icon");
    const title = document.createElement("strong");
    title.textContent = message;
    empty.append(icon, title);
    if (detail) {
      const description = document.createElement("span");
      description.textContent = detail;
      empty.appendChild(description);
    }
    return empty;
  }

  function createFolderButton(folder, openHandler) {
    const row = document.createElement("div");
    row.className = "trem-action-row trem-folder-row";
    row.setAttribute("role", "listitem");
    const button = createMenuButton({ id: `folder-${folder.id}`, icon: folder.icon, label: folder.label, meta: folder.description, badge: String(folder.tools.length) });
    button.classList.add("trem-folder-action");
    button.addEventListener("click", (event) => { stopEvent(event); openHandler(); });
    row.appendChild(button);
    return row;
  }

  function createFolderHeader(folder, backHandler) {
    const header = document.createElement("div");
    header.className = "trem-folder-header";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "trem-folder-back";
    back.title = "Voltar para as pastas";
    back.setAttribute("aria-label", back.title);
    back.appendChild(createIconElement("back"));
    back.addEventListener("click", (event) => { stopEvent(event); backHandler(); });
    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.append(createIconElement(folder.icon, "trem-inline-icon"), document.createTextNode(folder.label));
    const description = document.createElement("span");
    description.textContent = folder.description;
    text.append(title, description);
    header.append(back, text);
    return header;
  }

  function createActionButton(tool, searchInput, meta = "", rerender, favoriteKey = "favorites", searchQuery = "") {
    const row = document.createElement("div");
    row.className = "trem-action-row";
    row.setAttribute("role", "listitem");
    row.classList.toggle("is-search-result", Boolean(searchQuery));
    const button = createMenuButton({ id: tool.id, icon: tool.icon || "caixota", label: tool.label, meta, network: tool.network || "offline", highlightQuery: searchQuery });
    button.classList.add("trem-action-main");
    bindToolTooltip(button, tool.description || "");
    button.addEventListener("click", (event) => {
      stopEvent(event);
      hideToolTooltip();
      if (searchInput) searchInput.value = "";
      row.classList.add("is-opening");
      button.setAttribute("aria-busy", "true");
      recordToolUsage(tool.id, favoriteKey === "imageFavorites" ? "image" : "text");
      activeInvokedTool = { id: tool.id, label: tool.label, category: favoriteKey === "imageFavorites" ? "images" : "text" };
      tool.handler(event);
    });

    const favorite = document.createElement("button");
    favorite.type = "button";
    favorite.className = "trem-favorite-button";
    const initiallyFavorite = isFavoriteTool(tool, favoriteKey);
    favorite.classList.toggle("is-favorite", initiallyFavorite);
    favorite.appendChild(createFavoriteStar(initiallyFavorite));
    favorite.title = initiallyFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
    favorite.setAttribute("aria-label", favorite.title);
    favorite.setAttribute("aria-pressed", String(initiallyFavorite));
    favorite.addEventListener("click", async (event) => {
      stopEvent(event);
      const favorites = new Set(settings[favoriteKey] || []);
      const willFavorite = !favorites.has(tool.id);
      if (willFavorite) favorites.add(tool.id); else favorites.delete(tool.id);
      settings[favoriteKey] = [...favorites];
      favorite.classList.toggle("is-favorite", willFavorite);
      favorite.classList.add("is-changing");
      favorite.replaceChildren(createFavoriteStar(willFavorite));
      favorite.title = willFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos";
      favorite.setAttribute("aria-label", favorite.title);
      favorite.setAttribute("aria-pressed", String(willFavorite));
      try {
        await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
        const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
        if (settings.visualEffectsEnabled && !reduceMotion) {
          window.setTimeout(() => rerender?.(), 170);
        } else {
          rerender?.();
        }
      } catch (error) {
        if (willFavorite) favorites.delete(tool.id); else favorites.add(tool.id);
        settings[favoriteKey] = [...favorites];
        favorite.classList.toggle("is-favorite", !willFavorite);
        favorite.classList.remove("is-changing");
        favorite.replaceChildren(createFavoriteStar(!willFavorite));
        showTransientMessage("Não foi possível atualizar os favoritos.");
      }
    });

    row.append(button, favorite);
    return row;
  }

  function bindToolTooltip(button, description) {
    const text = String(description || "").trim();
    if (!text) return;

    const schedule = () => {
      clearTimeout(toolTooltipTimer);
      toolTooltipTimer = setTimeout(() => showToolTooltip(button, text), 320);
    };

    const cancel = () => {
      clearTimeout(toolTooltipTimer);
      toolTooltipTimer = null;
      hideToolTooltip();
    };

    button.addEventListener("mouseenter", schedule);
    button.addEventListener("mouseleave", cancel);
  }

  function showToolTooltip(button, description) {
    const root = document.getElementById(ROOT_ID);
    if (!root || !button?.isConnected) return;
    hideToolTooltip();

    const tooltip = document.createElement("div");
    tooltip.className = "trem-tool-tooltip";
    tooltip.textContent = description;
    root.appendChild(tooltip);
    activeToolTooltip = tooltip;

    const buttonRect = button.getBoundingClientRect();
    const rootRect = root.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = window.visualViewport;
    const viewportLeft = Number(viewport?.offsetLeft || 0);
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportRight = viewportLeft + Number(viewport?.width || window.innerWidth);
    const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
    const margin = 10;
    const gap = 9;
    const spaceRight = viewportRight - buttonRect.right;
    let left = spaceRight >= tooltipRect.width + gap + margin
      ? buttonRect.right - rootRect.left + gap
      : buttonRect.left - rootRect.left - tooltipRect.width - gap;
    let top = buttonRect.top - rootRect.top + (buttonRect.height - tooltipRect.height) / 2;
    left = Math.max(viewportLeft + margin - rootRect.left, Math.min(left, viewportRight - rootRect.left - tooltipRect.width - margin));
    top = Math.max(viewportTop + margin - rootRect.top, Math.min(top, viewportBottom - rootRect.top - tooltipRect.height - margin));
    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  function hideToolTooltip() {
    clearTimeout(toolTooltipTimer);
    toolTooltipTimer = null;
    activeToolTooltip?.remove();
    activeToolTooltip = null;
  }

  function createMenuButton({ id = "", icon = "caixota", label = "", meta = "", badge = "", network = "", highlightQuery = "" }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-action";
    if (id) button.dataset.toolId = id;
    const iconElement = createIconElement(icon, "trem-action-icon");
    const textWrap = document.createElement("span");
    textWrap.className = "trem-action-text";
    const labelElement = document.createElement("span");
    labelElement.className = "trem-action-label";
    appendHighlightedText(labelElement, label, highlightQuery);
    textWrap.appendChild(labelElement);
    if (meta) {
      const metaElement = document.createElement("span");
      metaElement.className = "trem-action-meta";
      appendHighlightedText(metaElement, meta, highlightQuery);
      textWrap.appendChild(metaElement);
    }
    button.append(iconElement, textWrap);
    if (network) button.appendChild(createMenuNetworkIndicator(network));
    if (badge) {
      const badgeElement = document.createElement("span");
      badgeElement.className = "trem-action-badge";
      badgeElement.textContent = badge;
      button.appendChild(badgeElement);
    }
    return button;
  }

  function createMenuNetworkIndicator(network) {
    const indicator = document.createElement("span");
    const label = network === "required" ? "Requer conexão para funcionar." : (network === "optional" ? "Funciona localmente, mas alguns recursos podem usar internet." : "Funciona sem conexão.");
    const visibleLabel = network === "required" ? "Internet" : (network === "optional" ? "Internet Opcional" : "Offline");
    indicator.className = `trem-network-indicator ${network === "required" ? "needs-internet" : (network === "optional" ? "may-use-internet" : "works-offline")}`;
    indicator.title = label;
    indicator.setAttribute("aria-label", label);
    indicator.innerHTML = (network !== "offline"
      ? '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.7" fill="none" stroke="currentColor" stroke-width="1.25"/><path d="M2.6 8h10.8M8 2.3c1.5 1.5 2.3 3.4 2.3 5.7S9.5 12.2 8 13.7M8 2.3C6.5 3.8 5.7 5.7 5.7 8s.8 4.2 2.3 5.7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.05"/></svg>'
      : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 7.2a6.8 6.8 0 0 1 9.6 0M5.1 9.2a4.1 4.1 0 0 1 5.8 0M6.8 11.1a1.7 1.7 0 0 1 2.4 0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.25"/><path d="m2.2 2.2 11.6 11.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.35"/></svg>') + `<span>${visibleLabel}</span>`;
    return indicator;
  }


function createIconElement(name, className = "") {
  const wrapper = document.createElement("span");
  wrapper.className = ["trem-icon", className].filter(Boolean).join(" ");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML = getIconMarkup(name);
  return wrapper;
}

function createFavoriteStar(active) {
  const wrapper = document.createElement("span");
  wrapper.className = "trem-favorite-star";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.innerHTML = getIconMarkup(active ? "star-filled" : "star");
  return wrapper;
}

function getIconMarkup(name) {
  const common = 'viewBox="0 0 24 24" class="trem-icon-svg" xmlns="http://www.w3.org/2000/svg"';
  switch (name) {
    case "caixota": return `<svg ${common}><path d="M5 9.2h14v9.2c0 1-.8 1.8-1.8 1.8H6.8c-1 0-1.8-.8-1.8-1.8Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.5"/><path d="M4.2 8.9 6 5.4h12l1.8 3.5M9 5.4V4.2c0-.7.6-1.2 1.2-1.2h3.6c.7 0 1.2.6 1.2 1.2v1.2M5.3 12h13.4M9.2 10.5v3M14.8 10.5v3" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/><path d="M7.4 16.6h9.2" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.7"/></svg>`;
    case "close": return `<svg ${common}><path d="m7.2 7.2 9.6 9.6M16.8 7.2l-9.6 9.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "chevron-right": return `<svg ${common}><path d="m9.2 6.4 5.8 5.6-5.8 5.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`;
    case "search": return `<svg ${common}><circle cx="10.5" cy="10.5" r="5.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-width="1.8"/><path d="M15.2 15.2 19 19" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "back": return `<svg ${common}><path d="M14.8 6.4 9 12l5.8 5.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`;
    case "star": return `<svg ${common}><path d="m12 4.2 2.3 4.6 5.1.7-3.7 3.6.9 5-4.6-2.4-4.6 2.4.9-5-3.7-3.6 5.1-.7Z" fill="none" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.6"/></svg>`;
    case "star-filled": return `<svg ${common}><path d="m12 4.2 2.3 4.6 5.1.7-3.7 3.6.9 5-4.6-2.4-4.6 2.4.9-5-3.7-3.6 5.1-.7Z" fill="var(--trem-icon-accent)" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.4"/></svg>`;
    case "folder-conversion": return folderIcon('↔');
    case "folder-text": return folderIcon('T');
    case "folder-utilities": return folderIcon('•');
    case "folder-security": return folderIcon('✓');
    case "folder-custom": return folderIcon('+');
    case "folder-generic": return folderIcon('•');
    case "currency": return `<svg ${common}><rect x="4.5" y="5.2" width="15" height="13.6" rx="3.2" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M7.5 10h9M7.5 14h9" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.4"/><path d="m8.2 7.8 2.1-1.5M15.8 16.2l-2.1 1.5" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.6"/></svg>`;
    case "calculate": return `<svg ${common}><rect x="5" y="3.8" width="14" height="16.4" rx="3.2" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><rect x="7.5" y="6.2" width="9" height="3" rx="1.2" fill="var(--trem-icon-accent-soft)" stroke="var(--trem-icon-stroke)" stroke-width="1.1"/><path d="M8.5 12.3h1.4M13.8 11.6v1.4M13.1 12.3h1.4M8.3 16.3h1.8M13.2 15.4l1.4 1.8M14.6 15.4l-1.4 1.8" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.4"/></svg>`;
    case "encode": return `<svg ${common}><rect x="5.2" y="10" width="13.6" height="8.5" rx="2.4" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8.2 10V8.4a3.8 3.8 0 0 1 7.6 0V10" fill="none" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M10.2 14.2h3.6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "compare": return `<svg ${common}><path d="M7.2 6.5h9.6M7.2 10.3h6.2M7.2 14.1h9.6M7.2 17.9h6.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.6"/><path d="M4.6 9.3 3 10.9l1.6 1.6M19.4 13.1l1.6 1.6-1.6 1.6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg>`;
    case "counter": return `<svg ${common}><path d="M8 5 6.8 19M14.6 5 13.4 19M4.8 9.1h12.4M4 14.9h12.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "ruler": return `<svg ${common}><rect x="4.2" y="8" width="15.6" height="7.8" rx="2.4" transform="rotate(-12 12 12)" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8.8 9.1v2.5M11.3 8.6v4.2M13.8 8.2v2.5M16.2 7.7v4.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.2"/></svg>`;
    case "palette": return `<svg ${common}><path d="M12 4.2c-4.7 0-8.4 3.4-8.4 7.8 0 3.8 3 6.8 6.2 6.8h1c1 0 1.7-.7 1.7-1.6 0-.4-.2-.9-.5-1.2-.2-.2-.3-.4-.3-.7 0-.9.8-1.5 1.8-1.5H14c3.5 0 6.4-2.7 6.4-6.1 0-4.2-3.8-7.5-8.4-7.5Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><circle cx="8" cy="10" r="1" fill="var(--trem-icon-accent)"/><circle cx="11.1" cy="8.3" r="1" fill="var(--trem-icon-accent-soft)"/><circle cx="14.1" cy="8.8" r="1" fill="var(--trem-icon-accent)"/><circle cx="15.8" cy="11.7" r="1" fill="var(--trem-icon-accent-soft)"/></svg>`;
    case "calendar": return `<svg ${common}><rect x="4.3" y="5.3" width="15.4" height="14.2" rx="3" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M4.8 9.2h14.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8 4.6v3M16 4.6v3" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.6"/><rect x="8.2" y="11.5" width="3.6" height="3" rx="1" fill="var(--trem-icon-accent)"/></svg>`;
    case "book": return `<svg ${common}><path d="M6.2 5.5h8.2a3 3 0 0 1 3 3V18a18.6 18.6 0 0 0-8.2-1.7A18.4 18.4 0 0 0 6 18V7.2a1.7 1.7 0 0 1 .2-.8Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M9.2 8.4h5M9.2 11h5M9.2 13.6h3.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.3"/></svg>`;
    case "type": return `<svg ${common}><path d="M5.6 7h12.8M12 7v10.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="2"/><path d="M8 19h8" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "speaker": return `<svg ${common}><path d="M5 14.8h3.5l4.4 3.5V5.7L8.5 9.2H5Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.5"/><path d="M16 9.1a4.4 4.4 0 0 1 0 5.8M17.9 7.3a7 7 0 0 1 0 9.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.5"/></svg>`;
    case "broom": return `<svg ${common}><path d="m14.3 5.4 4.2 4.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.8"/><path d="M6.5 17.6 16.1 8l1.8 1.8-9.6 9.6H6.5Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.5"/><path d="M5.7 18.4h4.8" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.6"/></svg>`;
    case "link": return `<svg ${common}><path d="M9.2 14.8 7.6 16.4a3.1 3.1 0 0 1-4.4-4.4l2.4-2.4A3.1 3.1 0 0 1 10 9.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.7"/><path d="m14.8 9.2 1.6-1.6a3.1 3.1 0 1 1 4.4 4.4l-2.4 2.4a3.1 3.1 0 0 1-4.4.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.7"/><path d="m8.7 15.3 6.6-6.6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "password": return `<svg ${common}><rect x="4.7" y="7.2" width="14.6" height="11.5" rx="3" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8 7.2V6.1a4 4 0 0 1 8 0v1.1" fill="none" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><circle cx="9" cy="13" r="1" fill="var(--trem-icon-accent)"/><circle cx="12" cy="13" r="1" fill="var(--trem-icon-accent)"/><circle cx="15" cy="13" r="1" fill="var(--trem-icon-accent)"/></svg>`;
    case "list": return `<svg ${common}><rect x="5" y="4.6" width="14" height="15.4" rx="2.8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8.3 9h7.2M8.3 12.4h7.2M8.3 15.8h5.1" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.4"/><circle cx="7" cy="9" r=".7" fill="var(--trem-icon-accent)"/><circle cx="7" cy="12.4" r=".7" fill="var(--trem-icon-accent)"/><circle cx="7" cy="15.8" r=".7" fill="var(--trem-icon-accent)"/></svg>`;
    case "sort": return `<svg ${common}><path d="M8 6.3v11.2M8 17.5l-2.2-2.2M8 17.5l2.2-2.2M15.7 17.7V6.5M15.7 6.5l-2.2 2.2M15.7 6.5l2.2 2.2" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg>`;
    case "translate": return `<svg ${common}><path d="M6 6.2h6.8M9.4 6.2v1.3A9.1 9.1 0 0 1 6.5 13c1.2.9 2.6 1.6 4.2 2.1M13.7 9.3h4.7M16.1 7v6.8M14.4 13.8h3.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.55"/></svg>`;
    case "capture": return `<svg ${common}><rect x="4.4" y="6.2" width="15.2" height="11.8" rx="2.8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><circle cx="12" cy="12.1" r="3.1" fill="var(--trem-icon-accent-soft)" stroke="var(--trem-icon-stroke)" stroke-width="1.3"/><path d="M8.2 6.2 9.4 4.7h5.2l1.2 1.5" fill="none" stroke="var(--trem-icon-stroke)" stroke-linejoin="round" stroke-width="1.4"/></svg>`;
    case "qr": return `<svg ${common}><path d="M5 5h5v5H5ZM14 5h5v5h-5ZM5 14h5v5H5Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.4"/><path d="M14 14h2v2h-2ZM17 14h2v5h-2ZM14 17h2v2h-2" fill="var(--trem-icon-accent)" stroke="var(--trem-icon-stroke)" stroke-width="1"/></svg>`;
    case "compress": return `<svg ${common}><rect x="5" y="6" width="14" height="12" rx="2.8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M9.5 9.2 7.3 12l2.2 2.8M14.5 9.2l2.2 2.8-2.2 2.8" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7"/></svg>`;
    case "image-convert": return `<svg ${common}><rect x="4.6" y="5.4" width="9.2" height="13.2" rx="2.2" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.4"/><rect x="10.2" y="7" width="9.2" height="13.2" rx="2.2" fill="var(--trem-icon-accent-soft)" stroke="var(--trem-icon-stroke)" stroke-width="1.4"/><path d="M9.2 12h5.6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    case "image-info": return `<svg ${common}><circle cx="12" cy="12" r="8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M12 10.2v5.1M12 8h.01" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.9"/></svg>`;
    case "restore": return `<svg ${common}><path d="M7.1 8.4V5.5L4.2 8.4l2.9 2.9V8.4a6.2 6.2 0 1 1-.7 7.9" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/><path d="M9 12h6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.6"/></svg>`;
    case "image-resize": return `<svg ${common}><path d="M8 8H5.4V5.4M16 8h2.6V5.4M8 16H5.4v2.6M16 16h2.6v2.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/><rect x="8.3" y="8.3" width="7.4" height="7.4" rx="1.8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.3"/></svg>`;
    case "image-text": return `<svg ${common}><rect x="5" y="5" width="14" height="14" rx="2.5" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M8 9.2h8M10 12h4M8.8 15.1h6.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-width="1.5"/></svg>`;
    case "image-rotate": return `<svg ${common}><path d="M7.5 8.2V5.5L4.8 8.2l2.7 2.7V8.2a5 5 0 1 1-1.1 6.6" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>`;
    case "download": return `<svg ${common}><path d="M12 4.5v10.2M8.3 11.4 12 15.1l3.7-3.7" fill="none" stroke="var(--trem-icon-stroke)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/><path d="M5.2 18.5h13.6" fill="none" stroke="var(--trem-icon-accent)" stroke-linecap="round" stroke-width="1.8"/></svg>`;
    default: return `<svg ${common}><circle cx="12" cy="12" r="8" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.6"/></svg>`;
  }
}

function folderIcon(letter) {
  return `<svg viewBox="0 0 24 24" class="trem-icon-svg" xmlns="http://www.w3.org/2000/svg"><path d="M4.4 8.2a2.6 2.6 0 0 1 2.6-2.6h3.6l1.2 1.5h5.2a2.7 2.7 0 0 1 2.7 2.7v6.5a2.7 2.7 0 0 1-2.7 2.7H7a2.6 2.6 0 0 1-2.6-2.6Z" fill="var(--trem-icon-fill)" stroke="var(--trem-icon-stroke)" stroke-width="1.5"/><path d="M4.6 9.2H19.4" fill="none" stroke="var(--trem-icon-stroke)" stroke-width="1.2"/><text x="12" y="16" text-anchor="middle" font-family="Roboto,Segoe UI,Arial,sans-serif" font-size="6.8" font-weight="800" fill="var(--trem-icon-accent)">${letter}</text></svg>`;
}

  function normalizeToolSearch(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function toolMatchesSearch(tool, query) {
    if (!query) return true;
    const haystack = normalizeToolSearch([tool.label, tool.originalLabel, tool.description, getEffectiveFolderLabel(tool), ...(tool.keywords || [])].join(" "));
    return query.split(" ").every((part) => haystack.includes(part));
  }

  function getRecentTools(tools, mode) {
    const byId = new Map(tools.map((tool) => [tool.id, tool]));
    return (toolUsage.recent?.[mode] || []).map((id) => byId.get(id)).filter(Boolean).slice(0, MAX_RECENT_TOOLS);
  }

  function getMostUsedTools(tools, mode, limit = 5) {
    const counts = toolUsage.counts?.[mode] || {};
    return tools.filter((tool) => Number(counts[tool.id]) > 0)
      .sort((a, b) => Number(counts[b.id]) - Number(counts[a.id]) || sortToolsAlphabetically(a, b))
      .slice(0, limit);
  }

  function formatUsageCount(count) {
    const total = Math.max(1, Math.floor(Number(count) || 1));
    return `${total} ${total === 1 ? "uso" : "usos"}`;
  }

  function recordToolUsage(toolId, mode) {
    const normalizedMode = mode === "image" ? "image" : "text";
    toolUsage.recent[normalizedMode] = [toolId, ...toolUsage.recent[normalizedMode].filter((id) => id !== toolId)].slice(0, MAX_RECENT_TOOLS);
    toolUsage.counts[normalizedMode][toolId] = (toolUsage.counts[normalizedMode][toolId] || 0) + 1;
    sendRuntimeMessage({ type: "RECORD_TOOL_USAGE", toolId, mode: normalizedMode }).catch(() => {});
  }

  function appendHighlightedText(element, value, query) {
    const text = String(value || "");
    const terms = normalizeToolSearch(query).split(" ").filter(Boolean);
    if (!terms.length || !text) {
      element.textContent = text;
      return;
    }

    const normalized = [];
    const indexMap = [];
    for (let index = 0; index < text.length; index += 1) {
      const chunk = text[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      for (const character of chunk) {
        const simplified = /[a-z0-9]/.test(character) ? character : " ";
        if (simplified === " " && (!normalized.length || normalized[normalized.length - 1] === " ")) continue;
        normalized.push(simplified);
        indexMap.push(index);
      }
    }

    const normalizedText = normalized.join("");
    const ranges = [];
    for (const term of terms) {
      let offset = 0;
      while (offset < normalizedText.length) {
        const found = normalizedText.indexOf(term, offset);
        if (found < 0) break;
        ranges.push([indexMap[found], indexMap[found + term.length - 1] + 1]);
        offset = found + Math.max(1, term.length);
      }
    }

    if (!ranges.length) {
      element.textContent = text;
      return;
    }

    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const merged = [];
    for (const range of ranges) {
      const previous = merged[merged.length - 1];
      if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1]);
      else merged.push([...range]);
    }

    let cursor = 0;
    for (const [start, end] of merged) {
      if (start > cursor) element.appendChild(document.createTextNode(text.slice(cursor, start)));
      const mark = document.createElement("mark");
      mark.className = "trem-search-match";
      mark.textContent = text.slice(start, end);
      element.appendChild(mark);
      cursor = end;
    }
    if (cursor < text.length) element.appendChild(document.createTextNode(text.slice(cursor)));
  }

  function countSelection(event) {

    stopEvent(event);
    const text = String(selectedText || "");
    if (!text.trim()) {
      renderError("Não há texto suficiente para contar.", renderActionMenu);
      return;
    }

    renderCounterResult(analyzeSelectedText(text));
  }

  function analyzeSelectedText(text) {
    const normalized = String(text || "").replace(/\r\n?/g, "\n");
    const words = normalized.match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu) || [];
    const nonEmptyLines = normalized.split("\n").filter((line) => line.trim()).length;
    const paragraphs = normalized.trim().split(/\n\s*\n+/).filter((part) => part.trim()).length;
    const sentenceMatches = normalized
      .replace(/\s+/g, " ")
      .trim()
      .match(/[^.!?…]+(?:[.!?…]+|$)/g) || [];
    const sentences = sentenceMatches.filter((part) => /[\p{L}\p{N}]/u.test(part)).length;
    const codePoints = Array.from(normalized);
    const characters = codePoints.length;
    const charactersNoSpaces = Array.from(normalized.replace(/\s/gu, "")).length;
    const readingSeconds = words.length ? Math.max(1, Math.round(words.length / 200 * 60)) : 0;
    const readingLabel = readingSeconds < 60
      ? `${readingSeconds} s`
      : `${Math.ceil(readingSeconds / 60)} min`;

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      lines: nonEmptyLines,
      paragraphs,
      readingSeconds,
      readingLabel
    };
  }

  function renderCounterResult(stats) {
    activateTextResultMode();
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-counter-card";

    const title = document.createElement("div");
    title.className = "trem-local-tool-title";
    title.textContent = displayToolLabel("text", "counter", "Contador de Texto");

    const grid = document.createElement("div");
    grid.className = "trem-counter-grid";

    const metrics = [
      ["Palavras", stats.words, String(stats.words)],
      ["Caracteres", stats.characters, String(stats.characters)],
      ["Sem espaços", stats.charactersNoSpaces, String(stats.charactersNoSpaces)],
      ["Frases", stats.sentences, String(stats.sentences)],
      ["Linhas", stats.lines, String(stats.lines)],
      ["Parágrafos", stats.paragraphs, String(stats.paragraphs)],
      ["Leitura", stats.readingLabel, stats.readingLabel]
    ];

    for (const [label, visibleValue, copyValue] of metrics) {
      const metric = document.createElement("button");
      metric.type = "button";
      metric.className = "trem-counter-metric";
      metric.title = `Copiar ${label.toLowerCase()}`;

      const metricLabel = document.createElement("span");
      metricLabel.textContent = label;
      const metricValue = document.createElement("strong");
      metricValue.textContent = typeof visibleValue === "number" ? new Intl.NumberFormat("pt-BR").format(visibleValue) : String(visibleValue);
      metric.append(metricLabel, metricValue);

      metric.addEventListener("click", async (clickEvent) => {
        stopEvent(clickEvent);
        const copied = await copyText(copyValue);
        metric.classList.toggle("trem-copy-success", copied);
        metric.dataset.copyStatus = copied ? "✓" : "!";
        setTimeout(() => {
          if (!metric.isConnected) return;
          metric.classList.remove("trem-copy-success");
          delete metric.dataset.copyStatus;
        }, 900);
      });
      grid.appendChild(metric);
    }

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "Clique em um valor para copiá-lo.";

    const actions = createLocalToolActions(() => renderActionMenu());
    card.append(title, grid, hint, actions);
    root.appendChild(card);
    positionRoot(root);
  }

  function formatSelection(event) {
    stopEvent(event);
    if (!String(selectedText || "").trim()) {
      renderError("Selecione um texto para formatar.", renderActionMenu);
      return;
    }

    renderTextTransformer({
      title: "Formatar",
      options: [
        ["upper", "MAIÚSCULAS"],
        ["lower", "minúsculas"],
        ["sentence", "Frase"],
        ["title", "Título"],
        ["capitalized", "Todas As Palavras"],
        ["inverse", "Inverter Caixa"]
      ],
      transform: (mode) => formatSelectedText(selectedText, mode)
    });
  }

  function cleanSelection(event) {
    stopEvent(event);
    if (!String(selectedText || "").trim()) {
      renderError("Selecione um texto para limpar.", renderActionMenu);
      return;
    }

    renderTextTransformer({
      title: "Limpar",
      options: [
        ["basic", "Limpeza básica"],
        ["lines", "Reduzir quebras"],
        ["paragraph", "Parágrafo único"]
      ],
      transform: (mode) => cleanSelectedText(selectedText, mode)
    });
  }


function encodeSelection(event) {
  stopEvent(event);
  if (!String(selectedText || "").trim()) {
    renderError("Selecione um texto para codificar ou decodificar.", renderActionMenu);
    return;
  }

  const suggestedMode = suggestEncodingMode(selectedText);
  renderTextTransformer({
    title: "Codificar",
    options: [
      ["base64-encode", "Base64 · Codificar"],
      ["base64-decode", "Base64 · Decodificar"],
      ["url-encode", "URL · Codificar"],
      ["url-decode", "URL · Decodificar"],
      ["html-encode", "HTML · Codificar"],
      ["html-decode", "HTML · Decodificar"],
      ["unicode-escape", "Unicode · Escapar"],
      ["unicode-unescape", "Unicode · Restaurar"],
      ["morse-encode", "Morse · Codificar"],
      ["morse-decode", "Morse · Decodificar"],
      ["binary-encode", "Binário · Codificar"],
      ["binary-decode", "Binário · Decodificar"]
    ],
    initialValue: suggestedMode,
    transform: (mode) => transformEncodedText(selectedText, mode)
  });
}

function inspectColorSelection(event) {
  stopEvent(event);
  const color = parseSelectedColor(selectedText);
  if (!color) {
    renderError("Não foi possível reconhecer uma cor válida. Selecione algo como #6C63FF, rgb(108, 99, 255) ou hsl(244, 100%, 69%).", renderActionMenu);
    return;
  }

  renderColorResult(color);
}

function readSelection(event) {
  stopEvent(event);
  const text = String(selectedText || "").trim();
  if (!text) {
    renderError("Selecione um texto para ler em voz alta.", renderActionMenu);
    return;
  }

  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    renderError("Este navegador não oferece suporte à leitura em voz alta nesta página.", renderActionMenu);
    return;
  }

  renderReaderTool(text);
}


function listSelection(event) {
  stopEvent(event);
  if (!String(selectedText || "").trim()) {
    renderError("Selecione um texto para transformar em lista.", renderActionMenu);
    return;
  }

  renderTextTransformer({
    title: "Lista",
    options: [["bullets", "Marcadores"], ["numbered", "Numerada"], ["checklist", "Checklist"], ["markdown", "Markdown"]],
    transform: (mode) => buildListFromText(selectedText, mode)
  });
}

function sortSelection(event) {
  stopEvent(event);
  if (!String(selectedText || "").trim()) {
    renderError("Selecione linhas ou itens para ordenar.", renderActionMenu);
    return;
  }

  renderTextTransformer({
    title: "Ordenar",
    options: [["az", "A → Z"], ["za", "Z → A"], ["num-asc", "Menor → Maior"], ["num-desc", "Maior → Menor"], ["unique", "Remover Duplicados"], ["shuffle", "Embaralhar"]],
    transform: (mode) => sortSelectedItems(selectedText, mode)
  });
}

function inspectDateSelection(event) {
  stopEvent(event);
  const parsed = parseSelectedDate(selectedText);
  if (!parsed) {
    renderError("Não foi possível reconhecer uma data válida. Tente algo como 25/12/2026, 2026-12-25 ou 25 de dezembro de 2026.", renderActionMenu);
    return;
  }

  renderDateResult(parsed);
}


  function compareSelection(event) {
    stopEvent(event);
    const firstText = String(selectedText || "");
    if (!firstText.trim()) {
      renderError("Selecione o primeiro texto que deseja comparar.", renderActionMenu);
      return;
    }
    renderCompareTool(firstText);
  }

  function renderCompareTool(firstText, secondText = "") {
    activeMenuMode = "text";
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-compare-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = displayToolLabel("text", "compare", "Comparar Textos");

    const intro = document.createElement("div");
    intro.className = "trem-local-tool-hint trem-tool-intro";
    intro.textContent = "Edite o primeiro texto ou cole uma segunda versão para visualizar as diferenças.";

    const first = document.createElement("textarea");
    first.className = "trem-tool-textarea";
    first.value = firstText;
    first.placeholder = "Texto A";
    first.maxLength = 12000;

    const second = document.createElement("textarea");
    second.className = "trem-tool-textarea";
    second.value = secondText;
    second.placeholder = "Texto B";
    second.maxLength = 12000;

    const fields = document.createElement("div");
    fields.className = "trem-compare-fields";
    fields.append(createLabeledControl("Texto A", first), createLabeledControl("Texto B", second));

    const compare = document.createElement("button");
    compare.type = "button";
    compare.className = "trem-mini-button trem-mini-primary";
    compare.textContent = "Comparar";
    compare.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      const a = first.value;
      const b = second.value;
      if (!a.trim() || !b.trim()) {
        showInlineToolMessage(card, "Preencha os dois textos para comparar.");
        return;
      }
      renderComparisonResult(a, b);
    });

    const actions = createLocalToolActions(() => renderActionMenu());
    actions.prepend(compare);
    card.append(heading, intro, fields, actions);
    root.appendChild(card);
    positionRoot(root);
    second.focus();
  }

  function renderComparisonResult(firstText, secondText) {
    activateTextResultMode();
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-comparison-result-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = "Comparação";

    const result = compareTextValues(firstText, secondText);
    const summary = document.createElement("div");
    summary.className = "trem-diff-summary";
    summary.append(
      createSummaryBadge(`${result.added} adicionado${result.added === 1 ? "" : "s"}`, "added"),
      createSummaryBadge(`${result.removed} removido${result.removed === 1 ? "" : "s"}`, "removed"),
      createSummaryBadge(`${result.similarity}% semelhante`, "neutral")
    );

    const diff = document.createElement("div");
    diff.className = "trem-diff-output";
    diff.setAttribute("aria-label", "Diferenças entre os textos");
    for (const part of result.parts) {
      const span = document.createElement("span");
      span.className = `trem-diff-${part.type}`;
      span.textContent = part.value;
      diff.appendChild(span);
    }

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "Verde foi adicionado. Vermelho foi removido.";

    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions trem-wrap-actions";

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "trem-mini-button trem-mini-primary";
    copy.textContent = "Copiar Texto B";
    copy.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(secondText);
      showCopyFeedback(copy, copied, "Copiar Texto B");
    });

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "trem-mini-button";
    edit.textContent = "Editar";
    edit.addEventListener("click", (event) => {
      stopEvent(event);
      renderCompareTool(firstText, secondText);
    });

    const menu = document.createElement("button");
    menu.type = "button";
    menu.className = "trem-mini-button";
    menu.textContent = "Ferramentas";
    menu.addEventListener("click", (event) => {
      stopEvent(event);
      renderActionMenu();
    });

    actions.append(copy, edit, menu);
    card.append(heading, summary, diff, hint, actions);
    root.appendChild(card);
    positionRoot(root);
  }

  function createSummaryBadge(text, type) {
    const badge = document.createElement("span");
    badge.className = `trem-diff-badge trem-diff-badge-${type}`;
    badge.textContent = text;
    return badge;
  }

  function compareTextValues(firstText, secondText) {
    let left = tokenizeForDiff(firstText);
    let right = tokenizeForDiff(secondText);
    if (left.length > 650 || right.length > 650) {
      left = tokenizeLinesForDiff(firstText);
      right = tokenizeLinesForDiff(secondText);
    }

    const rows = left.length + 1;
    const cols = right.length + 1;
    const table = Array.from({ length: rows }, () => new Uint16Array(cols));
    for (let i = left.length - 1; i >= 0; i -= 1) {
      for (let j = right.length - 1; j >= 0; j -= 1) {
        table[i][j] = left[i] === right[j]
          ? table[i + 1][j + 1] + 1
          : Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }

    const parts = [];
    let i = 0;
    let j = 0;
    let added = 0;
    let removed = 0;
    let equal = 0;
    const append = (type, value) => {
      const last = parts.at(-1);
      if (last?.type === type) last.value += value;
      else parts.push({ type, value });
      if (/\S/u.test(value)) {
        if (type === "added") added += 1;
        else if (type === "removed") removed += 1;
        else equal += 1;
      }
    };

    while (i < left.length && j < right.length) {
      if (left[i] === right[j]) {
        append("equal", left[i]);
        i += 1;
        j += 1;
      } else if (table[i + 1][j] >= table[i][j + 1]) {
        append("removed", left[i]);
        i += 1;
      } else {
        append("added", right[j]);
        j += 1;
      }
    }
    while (i < left.length) append("removed", left[i++]);
    while (j < right.length) append("added", right[j++]);

    const denominator = Math.max(1, equal + added + removed);
    return { parts, added, removed, similarity: Math.round((equal / denominator) * 100) };
  }

  function tokenizeForDiff(text) {
    return String(text || "").match(/\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu) || [];
  }

  function tokenizeLinesForDiff(text) {
    const lines = String(text || "").split(/(?<=\n)/);
    return lines.length ? lines : [String(text || "")];
  }

  function openPasswordGenerator(event) {
    stopEvent(event);
    activeMenuMode = "text";
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-password-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = displayToolLabel("text", "password", "Gerador de Senhas");

    const length = document.createElement("input");
    length.type = "number";
    length.className = "trem-local-tool-select trem-tool-number-input";
    length.min = "8";
    length.max = "64";
    length.value = "16";

    const lower = createToolCheckbox("Minúsculas", true);
    const upper = createToolCheckbox("Maiúsculas", true);
    const numbers = createToolCheckbox("Números", true);
    const symbols = createToolCheckbox("Símbolos", true);

    const options = document.createElement("div");
    options.className = "trem-password-options";
    options.append(lower.label, upper.label, numbers.label, symbols.label);

    const output = document.createElement("button");
    output.type = "button";
    output.className = "trem-password-output";
    output.title = "Clique para copiar a senha";

    const generate = () => {
      try {
        output.textContent = generateSecurePassword({
          length: Number(length.value),
          lower: lower.input.checked,
          upper: upper.input.checked,
          numbers: numbers.input.checked,
          symbols: symbols.input.checked
        });
      } catch (error) {
        showInlineToolMessage(card, error.message || "Não foi possível gerar a senha.");
      }
      positionRoot(root);
    };

    output.addEventListener("click", async (clickEvent) => {
      stopEvent(clickEvent);
      const copied = await copyText(output.textContent || "");
      output.dataset.copyStatus = copied ? "✓ Copiado" : "Falha ao copiar";
      setTimeout(() => delete output.dataset.copyStatus, 1100);
    });

    const generateButton = document.createElement("button");
    generateButton.type = "button";
    generateButton.className = "trem-mini-button trem-mini-primary";
    generateButton.textContent = "Gerar Outra";
    generateButton.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      generate();
    });

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.className = "trem-mini-button";
    saveButton.textContent = "Salvar no Cofre";
    saveButton.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      openPasswordVault(output.textContent || "");
    });

    const managerButton = document.createElement("button");
    managerButton.type = "button";
    managerButton.className = "trem-mini-button";
    managerButton.textContent = "Ver Senhas";
    managerButton.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      openPasswordVault();
    });

    const actions = createLocalToolActions(() => renderActionMenu());
    actions.prepend(generateButton, saveButton, managerButton);
    card.append(heading, createLabeledControl("Tamanho", length), options, output, actions);
    root.appendChild(card);
    generate();
    positionRoot(root);
  }

  function openQrGenerator(event) {
    stopEvent(event);
    activeMenuMode = "text";
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-qr-generator-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = displayToolLabel("text", "qr-generator", "Gerar QR Code");
    const offline = document.createElement("span");
    offline.className = "trem-tool-connectivity trem-tool-connectivity-offline";
    offline.title = "Funciona sem conexão.";
    offline.textContent = "Offline";

    const content = document.createElement("textarea");
    content.className = "trem-qr-generator-input";
    content.rows = 4;
    content.maxLength = 2000;
    content.placeholder = "Digite um texto ou URL";
    content.value = String(selectedText || "").slice(0, 2000);

    const size = document.createElement("input");
    size.type = "range";
    size.min = "160";
    size.max = "640";
    size.step = "16";
    size.value = "320";
    const sizeValue = document.createElement("output");
    sizeValue.textContent = "320 px";

    const margin = document.createElement("input");
    margin.type = "range";
    margin.min = "0";
    margin.max = "8";
    margin.step = "1";
    margin.value = "4";
    const marginValue = document.createElement("output");
    marginValue.textContent = "4 módulos";

    const controls = document.createElement("div");
    controls.className = "trem-qr-generator-controls";
    controls.append(createQrRangeControl("Tamanho", size, sizeValue), createQrRangeControl("Margem", margin, marginValue));

    const preview = document.createElement("div");
    preview.className = "trem-qr-generator-preview";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Prévia do QR Code");
    preview.appendChild(canvas);
    const status = document.createElement("div");
    status.className = "trem-image-ocr-status";
    status.setAttribute("role", "status");

    const download = document.createElement("button");
    download.type = "button";
    download.className = "trem-mini-button trem-mini-primary";
    download.textContent = "Baixar PNG";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "trem-mini-button";
    copy.textContent = "Copiar imagem";

    let validPreview = false;
    const render = () => {
      sizeValue.textContent = `${size.value} px`;
      marginValue.textContent = `${margin.value} ${margin.value === "1" ? "módulo" : "módulos"}`;
      try {
        const text = content.value.trim();
        if (!text) throw new Error("Digite um texto ou URL para gerar o QR Code.");
        if (typeof globalThis.qrcode !== "function") throw new Error("O gerador local de QR Code não foi carregado.");
        if (globalThis.qrcode.stringToBytesFuncs?.["UTF-8"]) globalThis.qrcode.stringToBytes = globalThis.qrcode.stringToBytesFuncs["UTF-8"];
        const code = globalThis.qrcode(0, "M");
        code.addData(text, "Byte");
        code.make();
        drawQrToCanvas(code, canvas, Number(size.value), Number(margin.value));
        validPreview = true;
        status.textContent = "Gerado localmente. Nenhum conteúdo foi enviado.";
        status.classList.remove("is-error");
      } catch (error) {
        validPreview = false;
        const context = canvas.getContext("2d");
        context?.clearRect(0, 0, canvas.width, canvas.height);
        status.textContent = safeMessage(error);
        status.classList.add("is-error");
      }
      download.disabled = !validPreview;
      copy.disabled = !validPreview;
      positionRoot(root);
    };

    let timer = 0;
    const scheduleRender = () => {
      clearTimeout(timer);
      timer = setTimeout(render, 100);
    };
    content.addEventListener("input", scheduleRender);
    size.addEventListener("input", render);
    margin.addEventListener("input", render);
    download.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      if (!validPreview) return;
      canvas.toBlob((blob) => blob && downloadBlob(blob, "caixota-qrcode.png"), "image/png");
    });
    copy.addEventListener("click", async (clickEvent) => {
      stopEvent(clickEvent);
      if (!validPreview) return;
      try {
        const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Falha ao preparar a imagem.")), "image/png"));
        if (!navigator.clipboard?.write || typeof ClipboardItem !== "function") throw new Error("Seu navegador não permite copiar imagens aqui.");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        status.textContent = "Imagem copiada ✓";
        status.classList.remove("is-error");
      } catch (error) {
        status.textContent = safeMessage(error);
        status.classList.add("is-error");
      }
    });

    const actions = createLocalToolActions(() => renderActionMenu());
    actions.prepend(download, copy);
    const titleRow = document.createElement("div");
    titleRow.className = "trem-qr-generator-title";
    titleRow.append(heading, offline);
    card.append(titleRow, content, controls, preview, status, actions);
    root.appendChild(card);
    render();
    positionRoot(root);
  }

  function createQrRangeControl(labelText, input, output) {
    const label = document.createElement("label");
    label.className = "trem-qr-range-control";
    const heading = document.createElement("span");
    const title = document.createElement("b");
    title.textContent = labelText;
    heading.append(title, output);
    label.append(heading, input);
    return label;
  }

  function drawQrToCanvas(code, canvas, requestedSize, marginModules) {
    const moduleCount = code.getModuleCount();
    const margin = Math.max(0, Math.min(8, Math.round(Number(marginModules) || 0)));
    const logicalSize = Math.max(160, Math.min(640, Math.round(Number(requestedSize) || 320)));
    const ratio = Math.max(1, Math.min(2, Number(globalThis.devicePixelRatio) || 1));
    canvas.width = Math.round(logicalSize * ratio);
    canvas.height = Math.round(logicalSize * ratio);
    canvas.style.width = `${logicalSize}px`;
    canvas.style.height = `${logicalSize}px`;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";
    const totalModules = moduleCount + margin * 2;
    for (let row = 0; row < moduleCount; row += 1) {
      for (let column = 0; column < moduleCount; column += 1) {
        if (!code.isDark(row, column)) continue;
        const left = Math.round((column + margin) * canvas.width / totalModules);
        const top = Math.round((row + margin) * canvas.height / totalModules);
        const right = Math.round((column + margin + 1) * canvas.width / totalModules);
        const bottom = Math.round((row + margin + 1) * canvas.height / totalModules);
        context.fillRect(left, top, right - left, bottom - top);
      }
    }
  }

  function createToolCheckbox(text, checked) {
    const label = document.createElement("label");
    label.className = "trem-tool-checkbox";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    const span = document.createElement("span");
    span.textContent = text;
    label.append(input, span);
    return { label, input };
  }

  function generateSecurePassword(options) {
    const length = Math.max(8, Math.min(64, Math.round(Number(options.length) || 16)));
    const groups = [];
    if (options.lower) groups.push("abcdefghijkmnopqrstuvwxyz");
    if (options.upper) groups.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
    if (options.numbers) groups.push("23456789");
    if (options.symbols) groups.push("!@#$%&*+-_=?.");
    if (!groups.length) throw new Error("Ative pelo menos um grupo de caracteres.");
    if (length < groups.length) throw new Error("O tamanho precisa comportar todos os grupos escolhidos.");

    const result = groups.map((group) => group[secureRandomIndex(group.length)]);
    const pool = groups.join("");
    while (result.length < length) result.push(pool[secureRandomIndex(pool.length)]);
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = secureRandomIndex(index + 1);
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result.join("");
  }

  function secureRandomIndex(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);
    do crypto.getRandomValues(value); while (value[0] >= limit);
    return value[0] % max;
  }

  async function openPasswordVault(pendingPassword = "") {
    activeMenuMode = "text";
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-password-card trem-vault-card";
    card.innerHTML = '<div class="trem-local-tool-title">Cofre de Senhas</div><div class="trem-image-ocr-status">Verificando o cofre…</div>';
    root.appendChild(card);
    positionRoot(root);

    try {
      const response = await sendRuntimeMessage({ type: "GET_PASSWORD_VAULT_STATUS" });
      if (!response?.ok) throw new Error(response?.error || "Não foi possível abrir o cofre.");
      if (response.result?.exists) renderPasswordVaultUnlock(card, pendingPassword);
      else renderPasswordVaultSetup(card, pendingPassword);
    } catch (error) {
      card.replaceChildren(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderActionMenu()));
    }
    positionRoot(root);
  }

  function renderPasswordVaultSetup(card, pendingPassword) {
    card.replaceChildren();
    const title = createVaultTitle("Criar Cofre", "Novo");
    const warning = document.createElement("div");
    warning.className = "trem-vault-warning";
    warning.innerHTML = "<strong>Não existe recuperação.</strong><span>Se você perder a senha-mestra, as senhas salvas não poderão ser acessadas novamente.</span>";
    const master = createVaultInput("password", "Crie uma senha-mestra");
    master.autocomplete = "new-password";
    const confirmMaster = createVaultInput("password", "Repita a senha-mestra");
    confirmMaster.autocomplete = "new-password";
    const fields = document.createElement("div");
    fields.className = "trem-vault-form";
    fields.append(createLabeledControl("Senha-mestra · mínimo 8 caracteres", master), createLabeledControl("Confirmar senha", confirmMaster));
    const status = createVaultStatus();
    const create = document.createElement("button");
    create.type = "button";
    create.className = "trem-mini-button trem-mini-primary";
    create.textContent = "Criar Cofre Criptografado";
    create.addEventListener("click", async (event) => {
      stopEvent(event);
      if (master.value.length < 8) return setVaultStatus(status, "Use pelo menos 8 caracteres.", true);
      if (master.value !== confirmMaster.value) return setVaultStatus(status, "As duas senhas não são iguais.", true);
      create.disabled = true;
      setVaultStatus(status, "Criando o cofre…", false);
      try {
        const response = await sendRuntimeMessage({ type: "CREATE_PASSWORD_VAULT", masterPassword: master.value });
        if (!response?.ok) throw new Error(response?.error || "Não foi possível criar o cofre.");
        renderPasswordVaultManager(card, master.value, [], pendingPassword ? { password: pendingPassword } : null);
      } catch (error) {
        setVaultStatus(status, safeMessage(error), true);
        create.disabled = false;
      }
    });
    const actions = createLocalToolActions(() => renderActionMenu());
    actions.prepend(create);
    card.append(title, warning, fields, status, actions);
    master.focus();
    positionRoot(ensureRoot());
  }

  function renderPasswordVaultUnlock(card, pendingPassword) {
    card.replaceChildren();
    const title = createVaultTitle("Desbloquear Cofre", "Protegido");
    const master = createVaultInput("password", "Digite a senha-mestra");
    master.autocomplete = "current-password";
    const status = createVaultStatus();
    const unlock = document.createElement("button");
    unlock.type = "button";
    unlock.className = "trem-mini-button trem-mini-primary";
    unlock.textContent = "Desbloquear";
    const submit = async () => {
      if (!master.value) return setVaultStatus(status, "Digite a senha-mestra.", true);
      unlock.disabled = true;
      setVaultStatus(status, "Descriptografando…", false);
      try {
        const response = await sendRuntimeMessage({ type: "UNLOCK_PASSWORD_VAULT", masterPassword: master.value });
        if (!response?.ok) throw new Error(response?.error || "Não foi possível desbloquear o cofre.");
        renderPasswordVaultManager(card, master.value, response.result?.entries || [], pendingPassword ? { password: pendingPassword } : null);
      } catch (error) {
        setVaultStatus(status, safeMessage(error), true);
        unlock.disabled = false;
        master.select();
      }
    };
    unlock.addEventListener("click", (event) => { stopEvent(event); submit(); });
    master.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { stopEvent(event); submit(); }
    });
    const actions = createLocalToolActions(() => renderActionMenu());
    actions.prepend(unlock);
    card.append(title, createLabeledControl("Senha-mestra", master), status, actions);
    master.focus();
    positionRoot(ensureRoot());
  }

  function renderPasswordVaultManager(card, masterPassword, rawEntries, editingEntry = null) {
    const entries = Array.isArray(rawEntries) ? rawEntries.map((entry) => ({ ...entry })) : [];
    card.replaceChildren();
    const title = createVaultTitle("Gerenciador de Senhas", `${entries.length} ${entries.length === 1 ? "item" : "itens"}`);
    const toolbar = document.createElement("div");
    toolbar.className = "trem-vault-toolbar";
    const add = document.createElement("button");
    add.type = "button";
    add.className = "trem-mini-button trem-mini-primary";
    add.textContent = "Nova Senha";
    add.addEventListener("click", (event) => {
      stopEvent(event);
      renderPasswordVaultManager(card, masterPassword, entries, { password: "" });
    });
    const lock = document.createElement("button");
    lock.type = "button";
    lock.className = "trem-mini-button";
    lock.textContent = "Bloquear";
    lock.addEventListener("click", (event) => { stopEvent(event); renderPasswordVaultUnlock(card, ""); });
    toolbar.append(add, lock);

    const status = createVaultStatus();
    const list = document.createElement("div");
    list.className = "trem-vault-list";
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "trem-vault-empty";
      empty.textContent = "Nenhuma senha salva ainda.";
      list.appendChild(empty);
    }

    for (const entry of entries.sort((a, b) => a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }))) {
      list.appendChild(createPasswordVaultEntry(entry, {
        onEdit: () => renderPasswordVaultManager(card, masterPassword, entries, entry),
        onDelete: async () => {
          if (!confirm(`Excluir “${entry.label}” do cofre?`)) return;
          const nextEntries = entries.filter((item) => item.id !== entry.id);
          try {
            setVaultStatus(status, "Salvando alteração…", false);
            const response = await sendRuntimeMessage({ type: "SAVE_PASSWORD_VAULT", masterPassword, entries: nextEntries });
            if (!response?.ok) throw new Error(response?.error || "Não foi possível salvar o cofre.");
            renderPasswordVaultManager(card, masterPassword, response.result?.entries || nextEntries);
          } catch (error) {
            setVaultStatus(status, safeMessage(error), true);
          }
        }
      }));
    }

    card.append(title, toolbar);
    if (editingEntry) card.appendChild(createPasswordVaultEditor(editingEntry, entries, masterPassword, card, status));
    card.append(list, status, createLocalToolActions(() => renderActionMenu()));
    positionRoot(ensureRoot());
  }

  function createPasswordVaultEntry(entry, callbacks) {
    const row = document.createElement("article");
    row.className = "trem-vault-entry";
    const meta = document.createElement("div");
    meta.className = "trem-vault-entry-meta";
    const label = document.createElement("strong");
    label.textContent = entry.label;
    const username = document.createElement("span");
    username.textContent = entry.username || "Sem usuário informado";
    const secret = document.createElement("code");
    secret.textContent = "••••••••••••";
    meta.append(label, username, secret);

    const actions = document.createElement("div");
    actions.className = "trem-vault-entry-actions";
    const reveal = createVaultActionButton("Mostrar", () => {
      const hidden = secret.dataset.revealed !== "true";
      secret.dataset.revealed = String(hidden);
      secret.textContent = hidden ? entry.password : "••••••••••••";
      reveal.textContent = hidden ? "Ocultar" : "Mostrar";
    });
    const copy = createVaultActionButton("Copiar", async () => {
      const ok = await copyText(entry.password);
      showCopyFeedback(copy, ok, "Copiar");
    });
    const edit = createVaultActionButton("Editar", callbacks.onEdit);
    const remove = createVaultActionButton("Excluir", callbacks.onDelete);
    remove.classList.add("trem-vault-delete");
    actions.append(reveal, copy, edit, remove);
    row.append(meta, actions);
    return row;
  }

  function createPasswordVaultEditor(initial, entries, masterPassword, card, sharedStatus) {
    const editor = document.createElement("section");
    editor.className = "trem-vault-editor";
    const title = document.createElement("strong");
    title.textContent = initial.id ? "Editar senha" : "Salvar nova senha";
    const label = createVaultInput("text", "Nome do site ou serviço", initial.label || "");
    label.maxLength = 80;
    const username = createVaultInput("text", "Usuário ou e-mail (opcional)", initial.username || "");
    username.maxLength = 160;
    const password = createVaultInput("password", "Senha", initial.password || "");
    password.maxLength = 512;
    const notes = document.createElement("textarea");
    notes.className = "trem-local-tool-select trem-vault-notes";
    notes.placeholder = "Observação opcional";
    notes.maxLength = 500;
    notes.value = initial.notes || "";
    const fields = document.createElement("div");
    fields.className = "trem-vault-form";
    fields.append(
      createLabeledControl("Nome", label),
      createLabeledControl("Usuário", username),
      createLabeledControl("Senha", password),
      createLabeledControl("Observação", notes)
    );
    const actions = document.createElement("div");
    actions.className = "trem-vault-editor-actions";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "trem-mini-button trem-mini-primary";
    save.textContent = "Salvar";
    save.addEventListener("click", async (event) => {
      stopEvent(event);
      const cleanLabel = label.value.trim();
      if (!cleanLabel || !password.value) return setVaultStatus(sharedStatus, "Informe o nome e a senha.", true);
      const now = Date.now();
      const entry = {
        id: initial.id || (crypto.randomUUID?.() || `password-${now}-${Math.random().toString(36).slice(2, 7)}`),
        label: cleanLabel,
        username: username.value.trim(),
        password: password.value,
        notes: notes.value.trim(),
        createdAt: initial.createdAt || now,
        updatedAt: now
      };
      const nextEntries = initial.id ? entries.map((item) => item.id === initial.id ? entry : item) : [...entries, entry];
      save.disabled = true;
      setVaultStatus(sharedStatus, "Criptografando e salvando…", false);
      try {
        const response = await sendRuntimeMessage({ type: "SAVE_PASSWORD_VAULT", masterPassword, entries: nextEntries });
        if (!response?.ok) throw new Error(response?.error || "Não foi possível salvar a senha.");
        renderPasswordVaultManager(card, masterPassword, response.result?.entries || nextEntries);
      } catch (error) {
        save.disabled = false;
        setVaultStatus(sharedStatus, safeMessage(error), true);
      }
    });
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "trem-mini-button";
    cancel.textContent = "Cancelar";
    cancel.addEventListener("click", (event) => { stopEvent(event); renderPasswordVaultManager(card, masterPassword, entries); });
    const reveal = document.createElement("button");
    reveal.type = "button";
    reveal.className = "trem-mini-button";
    reveal.textContent = "Mostrar Senha";
    reveal.addEventListener("click", (event) => {
      stopEvent(event);
      password.type = password.type === "password" ? "text" : "password";
      reveal.textContent = password.type === "password" ? "Mostrar Senha" : "Ocultar Senha";
    });
    actions.append(save, reveal, cancel);
    editor.append(title, fields, actions);
    setTimeout(() => label.focus(), 0);
    return editor;
  }

  function createVaultTitle(text, badgeText) {
    const heading = document.createElement("div");
    heading.className = "trem-vault-title";
    const title = document.createElement("div");
    title.className = "trem-local-tool-title";
    title.textContent = text;
    const badge = document.createElement("span");
    badge.textContent = badgeText;
    heading.append(title, badge);
    return heading;
  }

  function createVaultInput(type, placeholder, value = "") {
    const input = document.createElement("input");
    input.type = type;
    input.className = "trem-local-tool-select trem-vault-input";
    input.placeholder = placeholder;
    input.value = value;
    return input;
  }

  function createVaultActionButton(text, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-vault-action";
    button.textContent = text;
    button.addEventListener("click", (event) => { stopEvent(event); handler(event); });
    return button;
  }

  function createVaultStatus() {
    const status = document.createElement("div");
    status.className = "trem-vault-status";
    status.setAttribute("role", "status");
    return status;
  }

  function setVaultStatus(status, message, isError) {
    status.textContent = message;
    status.classList.toggle("is-error", Boolean(isError));
    positionRoot(ensureRoot());
  }

  const TRUSTED_SITE_PROFILES = [
    { name: "Google", domains: ["google.com", "google.com.br"], tokens: ["google"] },
    { name: "YouTube", domains: ["youtube.com", "youtu.be"], tokens: ["youtube"] },
    { name: "Microsoft", domains: ["microsoft.com", "live.com", "office.com", "outlook.com"], tokens: ["microsoft", "outlook"] },
    { name: "Apple", domains: ["apple.com", "icloud.com"], tokens: ["apple", "icloud"] },
    { name: "Amazon", domains: ["amazon.com", "amazon.com.br"], tokens: ["amazon"] },
    { name: "Mercado Livre", domains: ["mercadolivre.com.br", "mercadopago.com.br"], tokens: ["mercadolivre", "mercadopago"] },
    { name: "Shopee", domains: ["shopee.com.br", "shopee.com"], tokens: ["shopee"] },
    { name: "Facebook", domains: ["facebook.com", "fb.com"], tokens: ["facebook"] },
    { name: "Instagram", domains: ["instagram.com"], tokens: ["instagram"] },
    { name: "WhatsApp", domains: ["whatsapp.com", "wa.me"], tokens: ["whatsapp"] },
    { name: "TikTok", domains: ["tiktok.com"], tokens: ["tiktok"] },
    { name: "GitHub", domains: ["github.com"], tokens: ["github"] },
    { name: "Netflix", domains: ["netflix.com"], tokens: ["netflix"] },
    { name: "PayPal", domains: ["paypal.com"], tokens: ["paypal"] },
    { name: "Nubank", domains: ["nubank.com.br"], tokens: ["nubank"] },
    { name: "Itaú", domains: ["itau.com.br"], tokens: ["itau"] },
    { name: "Bradesco", domains: ["bradesco.com.br"], tokens: ["bradesco"] },
    { name: "Santander", domains: ["santander.com.br"], tokens: ["santander"] },
    { name: "Correios", domains: ["correios.com.br"], tokens: ["correios"] },
    { name: "iFood", domains: ["ifood.com.br"], tokens: ["ifood"] }
  ];
  const URL_SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "rebrand.ly", "shorturl.at"]);

  function hostMatchesDomain(host, domain) {
    return host === domain || host.endsWith(`.${domain}`);
  }

  function normalizeLookalikeText(value) {
    return String(value || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/0/g, "o").replace(/[1|]/g, "l").replace(/3/g, "e").replace(/5/g, "s").replace(/7/g, "t").replace(/9/g, "g")
      .replace(/[^a-z]/g, "");
  }

  function editDistance(first, second) {
    const a = String(first || "");
    const b = String(second || "");
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const current = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = current;
      }
    }
    return row[b.length];
  }

  function inspectKnownSiteHost(hostname) {
    const host = String(hostname || "").toLowerCase().replace(/\.$/u, "");
    for (const profile of TRUSTED_SITE_PROFILES) {
      const official = profile.domains.find((domain) => hostMatchesDomain(host, domain));
      if (official) return { official: true, profile, domain: official };
    }

    const labels = host.replace(/^www\./u, "").split(".").filter(Boolean);
    for (const profile of TRUSTED_SITE_PROFILES) {
      for (const token of profile.tokens) {
        const normalizedToken = normalizeLookalikeText(token);
        const suspicious = labels.some((label) => {
          const normalizedLabel = normalizeLookalikeText(label);
          if (!normalizedLabel) return false;
          if (normalizedLabel.includes(normalizedToken)) return true;
          const maximumDistance = normalizedToken.length >= 8 ? 2 : 1;
          return Math.abs(normalizedLabel.length - normalizedToken.length) <= maximumDistance
            && editDistance(normalizedLabel, normalizedToken) <= maximumDistance;
        });
        if (suspicious) return { official: false, profile, domain: profile.domains[0] };
      }
    }
    return null;
  }

  function inspectSelectedLink(event) {
    stopEvent(event);
    const analysis = analyzeSelectedLink(selectedText);
    if (!analysis) {
      renderError("Não foi possível reconhecer um endereço válido. Selecione algo como exemplo.com ou https://exemplo.com.", renderActionMenu);
      return;
    }
    renderLinkAnalysis(analysis);
  }

  function analyzeSelectedLink(text) {
    const raw = String(text || "").trim();
    const match = raw.match(/(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9](?:[a-z0-9-]{0,62})\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/iu);
    if (!match) return null;
    let candidate = match[0].replace(/[),.;!?\]]+$/g, "");
    if (!/^https?:\/\//iu.test(candidate)) candidate = `https://${candidate}`;

    let url;
    try {
      url = new URL(candidate);
    } catch (_error) {
      return null;
    }
    if (!/^https?:$/iu.test(url.protocol)) return null;

    const trackingNames = new Set(["fbclid", "gclid", "dclid", "msclkid", "mc_cid", "mc_eid", "igshid", "ref_src"]);
    const removed = [];
    const clean = new URL(url.href);
    for (const name of [...clean.searchParams.keys()]) {
      if (/^utm_/iu.test(name) || trackingNames.has(name.toLowerCase())) {
        removed.push(name);
        clean.searchParams.delete(name);
      }
    }

    const notes = [];
    let warningScore = 0;
    const addNote = (type, text, weight = 0) => {
      notes.push({ type, text });
      warningScore += weight;
    };
    const knownSite = inspectKnownSiteHost(url.hostname);
    const normalizedHost = url.hostname.toLowerCase();
    const hostLabels = normalizedHost.split(".").filter(Boolean);
    const hyphenCount = (normalizedHost.match(/-/g) || []).length;

    if (url.protocol === "https:") addNote("good", "Usa conexão HTTPS. Isso protege a conexão, mas não prova que o site é legítimo.");
    else addNote("warning", "Não usa HTTPS; os dados podem viajar sem criptografia.", 1);
    if (url.username || url.password) addNote("warning", "O endereço contém usuário ou senha antes do domínio, uma técnica que pode esconder o destino real.", 2);
    if (/^xn--/iu.test(url.hostname) || hostLabels.some((part) => /^xn--/iu.test(part))) addNote("warning", "O domínio usa Punycode e pode representar letras visualmente parecidas. Confira o nome com atenção.", 2);
    if (/^(?:\d{1,3}\.){3}\d{1,3}$/u.test(url.hostname)) addNote("warning", "O destino usa um endereço IP em vez de um domínio reconhecível.", 1);
    if (URL_SHORTENERS.has(normalizedHost.replace(/^www\./u, ""))) addNote("warning", "É um link encurtado: o destino final fica escondido até o redirecionamento.", 1);
    if (knownSite?.official) {
      addNote("good", `O domínio corresponde a um endereço oficial conhecido de ${knownSite.profile.name}.`);
    } else if (knownSite) {
      addNote("warning", `O endereço parece mencionar ${knownSite.profile.name}, mas não usa o domínio oficial ${knownSite.domain}. Pode ser uma imitação.`, 3);
    }
    if (!knownSite?.official && hostLabels.length >= 5) addNote("warning", "O endereço possui muitos níveis de subdomínio; confirme qual é o domínio real no fim do nome.", 1);
    if (!knownSite?.official && hyphenCount >= 3) addNote("warning", "O domínio usa vários hífens, um padrão comum em endereços que tentam imitar páginas conhecidas.", 1);
    if (!knownSite?.official && /(?:^|[.-])(login|conta|account|secure|seguro|verify|verificar|update|atualizar|premio|pr[eê]mio|bonus|b[oô]nus)(?:[.-]|$)/iu.test(normalizedHost)) {
      addNote("warning", "O domínio usa palavras de urgência, conta ou verificação. Confirme o endereço oficial antes de informar dados.", 1);
    }
    if (url.port && !["80", "443"].includes(url.port)) addNote("neutral", `Usa a porta não padrão ${url.port}.`);
    if (removed.length) addNote("neutral", `${removed.length} parâmetro${removed.length === 1 ? "" : "s"} de rastreamento removido${removed.length === 1 ? "" : "s"}.`);
    if (!notes.some((note) => note.type === "warning")) addNote("neutral", "Nenhum sinal estrutural óbvio foi encontrado, mas reputação e conteúdo não foram consultados.");

    return {
      raw: match[0],
      url,
      cleanUrl: clean.href,
      domain: url.hostname,
      protocol: url.protocol.replace(":", "").toUpperCase(),
      path: `${url.pathname}${url.search}${url.hash}`,
      removed,
      notes,
      knownSite,
      riskLevel: warningScore >= 3 ? "high" : (warningScore > 0 ? "attention" : "low")
    };
  }

  function renderLinkAnalysis(analysis) {
    activateTextResultMode();
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-link-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = displayToolLabel("text", "link-checker", "Verificador de Link");

    const verdictDetails = {
      low: ["Poucos sinais estruturais", "A análise local não encontrou alertas óbvios."],
      attention: ["Verifique antes de abrir", "O endereço possui um ou mais pontos que merecem confirmação."],
      high: ["Sinais fortes de atenção", "O endereço pode estar imitando um serviço conhecido ou escondendo o destino real."]
    };
    const [verdictTitle, verdictText] = verdictDetails[analysis.riskLevel] || verdictDetails.attention;
    const verdict = document.createElement("div");
    verdict.className = `trem-link-verdict trem-link-verdict-${analysis.riskLevel}`;
    const verdictIcon = createIconElement("link", "trem-link-verdict-icon");
    const verdictCopy = document.createElement("span");
    const verdictStrong = document.createElement("strong");
    verdictStrong.textContent = verdictTitle;
    const verdictSmall = document.createElement("small");
    verdictSmall.textContent = verdictText;
    verdictCopy.append(verdictStrong, verdictSmall);
    verdict.append(verdictIcon, verdictCopy);

    const domain = document.createElement("div");
    domain.className = "trem-link-domain";
    domain.append(createIconElement("link", "trem-inline-icon"), document.createTextNode(analysis.domain));

    const address = document.createElement("div");
    address.className = "trem-link-address";
    address.textContent = analysis.cleanUrl;

    const meta = document.createElement("div");
    meta.className = "trem-link-meta";
    meta.append(createSummaryBadge(analysis.protocol, analysis.url.protocol === "https:" ? "added" : "removed"));
    if (analysis.removed.length) meta.append(createSummaryBadge(`${analysis.removed.length} rastreador${analysis.removed.length === 1 ? "" : "es"} removido${analysis.removed.length === 1 ? "" : "s"}`, "neutral"));
    if (analysis.knownSite && !analysis.knownSite.official) meta.append(createSummaryBadge("Possível imitação", "removed"));

    const list = document.createElement("div");
    list.className = "trem-link-notes";
    for (const note of analysis.notes) {
      const item = document.createElement("div");
      item.className = `trem-link-note trem-link-note-${note.type}`;
      item.textContent = note.text;
      list.appendChild(item);
    }

    const disclaimer = document.createElement("div");
    disclaimer.className = "trem-local-tool-hint";
    disclaimer.textContent = "Esta é uma análise local da estrutura do endereço. HTTPS e a ausência de alertas não garantem que um site seja seguro.";

    const externalCheck = document.createElement("div");
    externalCheck.className = "trem-link-external-check";
    const externalCopy = document.createElement("div");
    const externalTitle = document.createElement("strong");
    externalTitle.textContent = "Ainda está com dúvida?";
    const externalDescription = document.createElement("span");
    externalDescription.textContent = "O melhor é fazer uma segunda verificação em um serviço de reputação. A Caixota copiará o link e abrirá o VirusTotal para você colar.";
    externalCopy.append(externalTitle, externalDescription);
    const verifyExternal = document.createElement("button");
    verifyExternal.type = "button";
    verifyExternal.className = "trem-mini-button trem-mini-primary";
    verifyExternal.textContent = "Verificar no VirusTotal";
    verifyExternal.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(analysis.url.href);
      verifyExternal.textContent = copied ? "Link copiado · abrindo…" : "Abrindo VirusTotal…";
      window.open("https://www.virustotal.com/gui/home/url", "_blank", "noopener,noreferrer");
      setTimeout(() => {
        if (verifyExternal.isConnected) verifyExternal.textContent = "Verificar no VirusTotal";
      }, 1600);
    });
    externalCheck.append(externalCopy, verifyExternal);

    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions trem-wrap-actions";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "trem-mini-button trem-mini-primary";
    copy.textContent = "Copiar Link Limpo";
    copy.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(analysis.cleanUrl);
      showCopyFeedback(copy, copied, "Copiar Link Limpo");
    });
    const open = document.createElement("button");
    open.type = "button";
    open.className = "trem-mini-button";
    open.textContent = analysis.riskLevel === "low" ? "Abrir" : "Abrir Mesmo Assim";
    open.addEventListener("click", (event) => {
      stopEvent(event);
      window.open(analysis.cleanUrl, "_blank", "noopener,noreferrer");
    });
    const back = document.createElement("button");
    back.type = "button";
    back.className = "trem-mini-button";
    back.textContent = "Ferramentas";
    back.addEventListener("click", (event) => {
      stopEvent(event);
      renderActionMenu();
    });
    actions.append(copy, open, back);
    card.append(heading, verdict, domain, address, meta, list, disclaimer, externalCheck, actions);
    root.appendChild(card);
    positionRoot(root);
  }

  function createLabeledControl(labelText, control) {
    const label = document.createElement("label");
    label.className = "trem-tool-field";
    const span = document.createElement("span");
    span.textContent = labelText;
    label.append(span, control);
    return label;
  }

  function showInlineToolMessage(card, message) {
    card.querySelector(".trem-inline-tool-message")?.remove();
    const note = document.createElement("div");
    note.className = "trem-inline-tool-message";
    note.textContent = message;
    card.appendChild(note);
    setTimeout(() => note.remove(), 2600);
  }

  function renderTextTransformer({ title, options, transform, initialValue = "" }) {
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = activeToolLabel("text", title);

    const select = document.createElement("select");
    select.className = "trem-local-tool-select";
    select.setAttribute("aria-label", `${title}: escolher formato`);
    for (const [value, label] of options) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      if (initialValue && value === initialValue) option.selected = true;
      select.appendChild(option);
    }

    const output = document.createElement("button");
    output.type = "button";
    output.className = "trem-text-tool-output";
    output.title = "Clique para copiar";

    const updateOutput = () => {
      output.textContent = transform(select.value);
      positionRoot(root);
    };

    output.addEventListener("click", async (clickEvent) => {
      stopEvent(clickEvent);
      const value = output.textContent || "";
      const copied = await copyText(value);
      output.classList.toggle("trem-copy-success", copied);
      output.dataset.copyStatus = copied ? "✓ Copiado" : "Falha ao copiar";
      setTimeout(() => {
        if (!output.isConnected) return;
        output.classList.remove("trem-copy-success");
        delete output.dataset.copyStatus;
      }, 1000);
    });

    select.addEventListener("change", updateOutput);

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "Clique no resultado para copiar.";

    const actions = createLocalToolActions(() => renderActionMenu());
    card.append(heading, select, output, hint, actions);
    root.appendChild(card);
    updateOutput();
    positionRoot(root);
  }

  function createLocalToolActions(backHandler) {
    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "trem-mini-button trem-tool-back";
    back.append(createIconElement("back"), document.createTextNode("Ferramentas"));
    back.addEventListener("click", (event) => {
      stopEvent(event);
      backHandler();
    });
    const close = document.createElement("button");
    close.type = "button";
    close.className = "trem-mini-button trem-tool-close";
    close.title = "Fechar a Caixota";
    close.setAttribute("aria-label", close.title);
    close.appendChild(createIconElement("close"));
    close.addEventListener("click", (event) => {
      stopEvent(event);
      closePanelWithMotion();
    });
    actions.append(back, close);
    return actions;
  }

  function formatSelectedText(text, mode) {
    const source = String(text || "");
    const locale = "pt-BR";

    if (mode === "upper") return source.toLocaleUpperCase(locale);
    if (mode === "lower") return source.toLocaleLowerCase(locale);
    if (mode === "inverse") {
      return Array.from(source).map((char) => {
        const upper = char.toLocaleUpperCase(locale);
        const lower = char.toLocaleLowerCase(locale);
        if (upper === lower) return char;
        return char === upper ? lower : upper;
      }).join("");
    }

    if (mode === "capitalized") {
      return source.toLocaleLowerCase(locale).replace(/(^|[^\p{L}\p{N}])([\p{L}])/gu, (_match, prefix, letter) => {
        return prefix + letter.toLocaleUpperCase(locale);
      });
    }

    if (mode === "title") {
      const smallWords = new Set(["a", "as", "o", "os", "e", "de", "da", "das", "do", "dos", "em", "na", "nas", "no", "nos", "por", "para", "com", "sem"]);
      let index = 0;
      return source.toLocaleLowerCase(locale).replace(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu, (word) => {
        const current = index++;
        if (current > 0 && smallWords.has(word)) return word;
        return capitalizeFirst(word);
      });
    }

    const lower = source.toLocaleLowerCase(locale);
    let capitalizeNext = true;
    return Array.from(lower).map((char) => {
      if (capitalizeNext && /\p{L}/u.test(char)) {
        capitalizeNext = false;
        return char.toLocaleUpperCase(locale);
      }
      if (/[.!?…]/.test(char)) capitalizeNext = true;
      return char;
    }).join("");
  }

  function cleanSelectedText(text, mode) {
    let value = String(text || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      .trim();

    if (mode === "paragraph") {
      value = value.replace(/\s*\n+\s*/g, " ").replace(/ {2,}/g, " ");
    } else if (mode === "lines") {
      value = value.replace(/\n{3,}/g, "\n\n");
    }

    return value;
  }

  async function convertSelectedCurrency(event) {
    stopEvent(event);
    const parsed = parseMoney(selectedText, settings.dollarSymbolCurrency);

    if (!parsed) {
      renderError("Não foi possível reconhecer a moeda. Tente algo como $19.99, 20 EUR, 300 dólares australianos ou 150000 ienes.", renderActionMenu);
      return;
    }

    const currentToken = ++operationToken;
    renderLoading("Convertendo…");

    try {
      const response = await sendMessageWithTimeout({
        type: "CONVERT_CURRENCY",
        payload: {
          amount: parsed.amount,
          from: parsed.currency,
          to: settings.targetCurrency
        }
      });

      if (currentToken !== operationToken) return;
      if (!response?.ok) throw new Error(response?.error || "Não foi possível converter o valor.");

      const display = formatCurrencyResult(response.result, parsed);
      renderCopyableResult(display, display);
    } catch (error) {
      if (currentToken !== operationToken) return;
      renderError(error.message || "Não foi possível converter o valor.", convertSelectedCurrency);
    }
  }

  async function translateSelection(event) {
    stopEvent(event);

    if (!containsTranslatableText(selectedText)) {
      renderError("Não é possível traduzir o conteúdo selecionado. Tente selecionar uma palavra ou frase.", renderActionMenu);
      return;
    }

    const currentToken = ++operationToken;
    renderLoading("Traduzindo…");

    try {
      const response = await sendMessageWithTimeout({
        type: "TRANSLATE_TEXT",
        text: selectedText
      });

      if (currentToken !== operationToken) return;
      if (!response?.ok) throw new Error(response?.error || "Não foi possível traduzir.");

      const result = response.result;
      renderTranslationResult(result);
    } catch (error) {
      if (currentToken !== operationToken) return;
      renderError(error.message || "Não foi possível traduzir.", translateSelection);
    }
  }



  async function lookupDictionarySelection(event) {
    stopEvent(event);
    const term = sanitizeSelectedDictionaryTerm(selectedText);

    if (!term || !/\p{L}/u.test(term)) {
      renderError("Não foi possível identificar uma palavra ou expressão. Selecione apenas o termo que deseja consultar.", renderActionMenu);
      return;
    }

    const words = term.match(/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu) || [];
    if (term.length > 120 || words.length > 8) {
      renderError("O Dicionário aceita uma palavra ou expressão curta com até 8 palavras.", renderActionMenu);
      return;
    }

    const currentToken = ++operationToken;
    renderLoading("Consultando…");

    try {
      const response = await sendMessageWithTimeout({
        type: "LOOKUP_DICTIONARY",
        text: term,
        preferredLanguage: getPreferredDictionaryLanguage(term)
      });

      if (currentToken !== operationToken) return;
      if (!response?.ok) {
        throw new Error(response?.error || "Não foi possível consultar o dicionário.");
      }

      const model = buildDictionaryModel(response.result, term);
      if (!model.entries.length) {
        const isExpression = words.length > 1;
        throw new Error(isExpression
          ? "A expressão selecionada não foi encontrada como locução ou gíria. Tente selecionar outra expressão."
          : "A palavra selecionada não foi encontrada no dicionário. Verifique a escrita e tente novamente.");
      }

      model.entries = prioritizeDictionaryEntries(model.entries, term);
      recordDictionaryRecent(term).catch(() => {});
      await prepareDictionaryEntry(model.entries[0]);
      if (currentToken !== operationToken) return;
      renderDictionaryResult(model, 0);
    } catch (error) {
      if (currentToken !== operationToken) return;
      renderError(error.message || "Não foi possível consultar o dicionário.", lookupDictionarySelection);
    }
  }

  function buildDictionaryModel(result, fallbackTerm) {
    if (!result || result.kind !== "entries") {
      return { term: result?.title || fallbackTerm, entries: [] };
    }

    return {
      term: result.title || fallbackTerm,
      entries: deduplicateDictionaryEntries((result.entries || []).map((entry) => ({
        languageCode: normalizeDictionaryLanguageCode(entry.languageCode || "und"),
        languageName: dictionaryLanguageName(entry.languageCode, entry.languageName),
        definitions: normalizeDictionaryDefinitionItems(entry.definitions),
        definitionLanguage: normalizeDictionaryLanguageCode(entry.definitionLanguage || "en"),
        source: entry.source || "FreeDictionaryAPI · Wiktionary",
        sourceUrl: entry.sourceUrl || "",
        phonetic: entry.phonetic || "", example: entry.example || ""
      })))
    };
  }

  function getPreferredDictionaryLanguage(term) {
    return getDictionaryLanguagePreferences(term)[0] || "pt";
  }

  function prioritizeDictionaryEntries(entries, term) {
    const preferences = getDictionaryLanguagePreferences(term);
    const rank = new Map(preferences.map((code, index) => [code, index]));

    return [...entries].sort((a, b) => {
      const rankA = rank.has(a.languageCode) ? rank.get(a.languageCode) : 999;
      const rankB = rank.has(b.languageCode) ? rank.get(b.languageCode) : 999;
      if (rankA !== rankB) return rankA - rankB;
      return String(a.languageName || "").localeCompare(String(b.languageName || ""), "pt-BR");
    });
  }

  function getDictionaryLanguagePreferences(term) {
    const values = [];
    const add = (value) => {
      const code = normalizeDictionaryLanguageCode(value);
      if (code && code !== "auto" && code !== "und" && !values.includes(code)) values.push(code);
    };

    if (settings.sourceLanguage && settings.sourceLanguage !== "auto") add(settings.sourceLanguage);
    add(document.documentElement?.lang);
    add(navigator.language);
    add(settings.targetLanguage);
    add(detectLikelyDictionaryLanguage(term));
    add("pt");
    add("en");
    add("es");
    return values;
  }

  function detectLikelyDictionaryLanguage(value) {
    const text = String(value || "");
    if (/[\u3040-\u30ff]/u.test(text)) return "ja";
    if (/[\uac00-\ud7af]/u.test(text)) return "ko";
    if (/[\u4e00-\u9fff]/u.test(text)) return "zh";
    if (/[\u0400-\u04ff]/u.test(text)) return "ru";
    if (/[\u0600-\u06ff]/u.test(text)) return "ar";
    if (/[ãõçáéíóúâêôà]/iu.test(text)) return "pt";
    if (/[ñ¿¡]/u.test(text)) return "es";
    return "und";
  }

  function normalizeDictionaryLanguageCode(value) {
    return String(value || "und").split("-")[0].toLowerCase();
  }

  function dictionaryLanguageName(code, fallback = "") {
    const names = {
      pt: "Português", en: "Inglês", es: "Espanhol", fr: "Francês", de: "Alemão",
      it: "Italiano", ja: "Japonês", ko: "Coreano", zh: "Chinês", ru: "Russo",
      ar: "Árabe", nl: "Holandês", pl: "Polonês", tr: "Turco", sv: "Sueco",
      no: "Norueguês", da: "Dinamarquês", fi: "Finlandês", cs: "Tcheco",
      uk: "Ucraniano", el: "Grego", he: "Hebraico", la: "Latim", hi: "Hindi"
    };
    const normalized = normalizeDictionaryLanguageCode(code);
    return names[normalized] || fallback || "Idioma não identificado";
  }

  function parseWiktionaryEntries(html, edition = "pt", sourceName = "Wikcionário") {
    const documentResult = new DOMParser().parseFromString(String(html || ""), "text/html");
    const output = documentResult.querySelector(".mw-parser-output") || documentResult.body;
    if (!output) return [];

    output.querySelectorAll("script, style, table, figure, .thumb, .mw-editsection, sup.reference, .reference, .catlinks, .NavFrame, .metadata").forEach((node) => node.remove());

    const headings = Array.from(output.querySelectorAll("h2"));
    const entries = [];

    for (const heading of headings) {
      const languageName = cleanDictionaryHeading(heading.textContent);
      if (!languageName || isIgnoredDictionaryHeading(languageName)) continue;

      const headingBlock = heading.closest(".mw-heading2") || heading;
      const sectionNodes = [];
      let sibling = headingBlock.nextElementSibling;

      while (sibling && !isDictionaryLevelTwoHeading(sibling)) {
        sectionNodes.push(sibling);
        sibling = sibling.nextElementSibling;
      }

      const definitions = extractDefinitionsFromNodes(sectionNodes);
      if (!definitions.length) continue;

      const language = identifyDictionaryLanguage(languageName);
      entries.push({
        languageCode: language.code,
        languageName: language.name,
        definitions,
        definitionLanguage: edition,
        source: sourceName || (edition === "pt" ? "Wikcionário" : "Wiktionary")
      });
    }

    if (!entries.length) {
      const definitions = extractDefinitionsFromNodes([output]);
      if (definitions.length) {
        entries.push({
          languageCode: "und",
          languageName: "Idioma não identificado",
          definitions,
          definitionLanguage: edition,
          source: sourceName || (edition === "pt" ? "Wikcionário" : "Wiktionary")
        });
      }
    }

    return deduplicateDictionaryEntries(entries).slice(0, 10);
  }

  function extractDefinitionsFromNodes(nodes) {
    const definitions = [];
    const seen = new Set();

    for (const node of nodes) {
      const items = Array.from(node.querySelectorAll?.("ol > li") || []);
      for (const item of items) {
        const clone = item.cloneNode(true);
        clone.querySelectorAll("ol, ul, dl, table, figure, sup, .reference, .mw-editsection, .citation, .example, .quotation").forEach((child) => child.remove());

        const text = cleanDictionaryDefinition(clone.textContent);
        const key = normalizeDictionaryComparison(text);
        if (!text || text.length < 2 || text.length > 600 || seen.has(key)) continue;

        seen.add(key);
        definitions.push(text);
        if (definitions.length >= 6) return definitions;
      }
    }

    return definitions;
  }

  async function loadDictionaryLearning() {
    const stored = await chrome.storage.local.get(DICTIONARY_LEARNING_KEY);
    const raw = stored[DICTIONARY_LEARNING_KEY] || {};
    return {
      recent: (Array.isArray(raw.recent) ? raw.recent : []).filter(x => typeof x === "string" && x.length <= 120).slice(0, 25),
      favorites: (Array.isArray(raw.favorites) ? raw.favorites : []).filter(x => typeof x === "string" && x.length <= 120).slice(0, 100)
    };
  }
  async function recordDictionaryRecent(term) {
    const state = await loadDictionaryLearning();
    state.recent = [term,...state.recent.filter(x => x.toLocaleLowerCase() !== term.toLocaleLowerCase())].slice(0,25);
    await chrome.storage.local.set({[DICTIONARY_LEARNING_KEY]:state});
  }
  async function toggleDictionaryFavorite(term) {
    const state = await loadDictionaryLearning();
    const exists = state.favorites.some(x => x.toLocaleLowerCase() === term.toLocaleLowerCase());
    state.favorites = exists
      ? state.favorites.filter(x => x.toLocaleLowerCase() !== term.toLocaleLowerCase())
      : [term,...state.favorites].slice(0,100);
    await chrome.storage.local.set({[DICTIONARY_LEARNING_KEY]:state});
    return !exists;
  }
  function dictionarySpeak(term, languageCode) {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return false;
    const utterance = new SpeechSynthesisUtterance(term);
    if (languageCode && languageCode !== "und") utterance.lang = languageCode;
    utterance.rate = 0.92;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return true;
  }
  function renderDictionaryResult(model, activeIndex = 0) {
    activateTextResultMode();
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-dictionary-card";

    const header = document.createElement("div");
    header.className = "trem-dictionary-header";

    const term = document.createElement("div");
    term.className = "trem-dictionary-term";
    term.textContent = model.term;
    header.appendChild(term);

    let languageControl;
    if (model.entries.length > 1) {
      languageControl = document.createElement("select");
      languageControl.className = "trem-dictionary-language-select";
      languageControl.setAttribute("aria-label", "Idioma da palavra");
      model.entries.forEach((entry, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = dictionaryEntryHeader(entry);
        option.selected = index === activeIndex;
        languageControl.appendChild(option);
      });
    } else {
      languageControl = document.createElement("div");
      languageControl.className = "trem-dictionary-language-static";
      languageControl.textContent = dictionaryEntryHeader(model.entries[0]);
    }
    header.appendChild(languageControl);

    const toolbar = document.createElement("div");
    toolbar.className = "trem-dictionary-toolbar";
    const speakButton = document.createElement("button");
    speakButton.type = "button";
    speakButton.textContent = "🔊 Ouvir";
    speakButton.title = "Ouvir pronúncia usando a voz do navegador";
    speakButton.disabled = !("speechSynthesis" in window);
    speakButton.addEventListener("click", event => {
      stopEvent(event);
      const entry = model.entries[Number(languageControl.value || 0)] || model.entries[0];
      dictionarySpeak(model.term, entry?.languageCode);
    });
    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.textContent = "☆ Favoritar";
    favoriteButton.setAttribute("aria-pressed","false");
    const syncFavorite = () => loadDictionaryLearning().then(state => {
      if (!favoriteButton.isConnected) return;
      const isFavorite = state.favorites.some(x => x.toLocaleLowerCase() === model.term.toLocaleLowerCase());
      favoriteButton.textContent = isFavorite ? "★ Favoritado" : "☆ Favoritar";
      favoriteButton.setAttribute("aria-pressed", String(isFavorite));
    }).catch(() => {});
    favoriteButton.addEventListener("click", async event => {
      stopEvent(event);
      try { await toggleDictionaryFavorite(model.term); syncFavorite(); }
      catch (_error) { favoriteButton.textContent = "Não foi possível salvar"; }
    });
    toolbar.append(speakButton, favoriteButton);
    header.append(toolbar);
    syncFavorite();

    const divider = document.createElement("div");
    divider.className = "trem-dictionary-divider";
    const body = document.createElement("div");
    body.className = "trem-dictionary-body";
    const source = document.createElement("div");
    source.className = "trem-dictionary-source";
    card.append(header, divider, body, source);
    root.appendChild(card);

    const learning = document.createElement("details");
    learning.className = "trem-dictionary-learning";
    const summary = document.createElement("summary");
    summary.textContent = "Palavras recentes e favoritas (salvas somente neste navegador)";
    const entriesWrap = document.createElement("div");
    entriesWrap.className = "trem-dictionary-learning-list";
    const refreshLearning = async () => {
      const state = await loadDictionaryLearning();
      if (!learning.isConnected) return;
      entriesWrap.replaceChildren();
      const entries = [...new Set([...state.favorites,...state.recent])].slice(0,20);
      for (const word of entries) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.textContent = `${state.favorites.includes(word) ? "★ " : ""}${word}`;
        chip.addEventListener("click", event => { stopEvent(event); selectedText = word; lookupDictionarySelection(); });
        entriesWrap.append(chip);
      }
      if (!entries.length) entriesWrap.textContent = "Nenhuma palavra salva ainda.";
      const clear = document.createElement("button");
      clear.type = "button";
      clear.textContent = "Limpar recentes";
      clear.title = "Preserva as palavras favoritas";
      clear.addEventListener("click", async event => {
        stopEvent(event);
        state.recent = [];
        await chrome.storage.local.set({[DICTIONARY_LEARNING_KEY]:state});
        refreshLearning();
      });
      entriesWrap.append(clear);
    };
    learning.addEventListener("toggle", () => { if (learning.open) refreshLearning().catch(() => {}); });
    learning.append(summary, entriesWrap);
    card.append(learning);

    const renderEntry = async (index) => {
      const entry = model.entries[index];
      if (!entry) return;
      body.innerHTML = "";
      const loading = document.createElement("div");
      loading.className = "trem-dictionary-loading";
      loading.textContent = "Organizando significados…";
      body.appendChild(loading);
      source.textContent = entry.source ? `Fonte: ${entry.source}` : "";
      positionRoot(root);

      try {
        const definitions = await prepareDictionaryEntry(entry);
        if (!card.isConnected) return;
        body.innerHTML = "";
        const extras = document.createElement("div");
        extras.className = "trem-dictionary-extras";
        if (entry.phonetic) { const phonetic=document.createElement("div");phonetic.textContent=`Transcrição fonética: ${entry.phonetic}`;extras.append(phonetic); }
        if (entry.example) { const example=document.createElement("div");example.textContent=`Exemplo: ${entry.example}`;extras.append(example); }
        const nativeLanguage = String(settings.targetLanguage || "pt").split("-")[0];
        if (entry.languageCode !== nativeLanguage) {
          const translated=document.createElement("div");translated.textContent="Tradução da palavra: consultando…";extras.append(translated);
          sendMessageWithTimeout({type:"TRANSLATE_DICTIONARY_DEFINITIONS",definitions:[{text:model.term,partOfSpeech:"",tags:[]}],sourceLanguage:entry.languageCode})
            .then(response=>{if(!translated.isConnected)return;const word=response?.result?.definitions?.[0]?.text;translated.textContent=word?`Tradução (${nativeLanguage}): ${word}`:"Tradução da palavra indisponível.";positionRoot(root);})
            .catch(()=>{if(translated.isConnected)translated.textContent="Tradução da palavra indisponível.";});
        }
        if(extras.childNodes.length)body.append(extras);

        definitions.forEach((definition, definitionIndex) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "trem-dictionary-definition";
          button.title = "Clique para copiar este significado";

          const number = document.createElement("span");
          number.className = "trem-dictionary-number";
          number.textContent = `${definitionIndex + 1}.`;

          const content = document.createElement("span");
          content.className = "trem-dictionary-definition-content";
          if (definition.partOfSpeech) {
            const grammar = document.createElement("strong");
            grammar.className = "trem-dictionary-grammar";
            grammar.textContent = `${definition.partOfSpeech}:`;
            content.appendChild(grammar);
          }
          const text = document.createElement("span");
          text.className = "trem-dictionary-definition-text";
          text.textContent = definition.text;
          content.appendChild(text);

          button.append(number, content);
          button.addEventListener("click", async (event) => {
            stopEvent(event);
            const copyValue = definition.partOfSpeech ? `${definition.partOfSpeech}: ${definition.text}` : definition.text;
            const copied = await copyText(copyValue);
            button.classList.toggle("trem-copy-success", copied);
            button.classList.toggle("trem-copy-failed", !copied);
            setTimeout(() => {
              if (!button.isConnected) return;
              button.classList.remove("trem-copy-success", "trem-copy-failed");
            }, 1000);
          });
          body.appendChild(button);
        });
        positionRoot(root);
      } catch (error) {
        body.innerHTML = "";
        const message = document.createElement("div");
        message.className = "trem-dictionary-error";
        message.textContent = error.message || "Não foi possível carregar esse significado.";
        body.appendChild(message);
        positionRoot(root);
      }
    };

    if (languageControl.tagName === "SELECT") {
      languageControl.addEventListener("change", (event) => {
        stopEvent(event);
        renderEntry(Number(languageControl.value));
      });
    }

    renderEntry(activeIndex);
    positionRoot(root);
  }

  function dictionaryEntryHeader(entry) {
    if (!entry) return "Idioma não identificado";
    const parts = [...new Set((entry.definitions || []).map((item) => item.partOfSpeech).filter(Boolean))].slice(0, 2);
    const grammar = parts.length ? ` • ${parts.join(", ")}` : "";
    return `${dictionaryLanguageFlag(entry.languageCode)} ${entry.languageName}${grammar}`;
  }

  async function prepareDictionaryEntry(entry) {
    const originalDefinitions = normalizeDictionaryDefinitionItems(entry.definitions);
    if (!originalDefinitions.length) throw new Error("Nenhum significado foi encontrado para este idioma.");

    const targetLanguage = String(settings.targetLanguage || "pt").split("-")[0].toLowerCase();
    const definitionLanguage = String(entry.definitionLanguage || "pt").split("-")[0].toLowerCase();
    if (definitionLanguage === targetLanguage) return originalDefinitions;

    entry.translations ||= {};
    if (entry.translations[targetLanguage]) return normalizeDictionaryDefinitionItems(entry.translations[targetLanguage]);

    const response = await sendMessageWithTimeout({
      type: "TRANSLATE_DICTIONARY_DEFINITIONS",
      definitions: originalDefinitions,
      sourceLanguage: definitionLanguage
    });

    if (!response?.ok) throw new Error(response?.error || "Não foi possível traduzir os significados.");
    entry.translations[targetLanguage] = normalizeDictionaryDefinitionItems(response.result.definitions);
    return entry.translations[targetLanguage];
  }

  function normalizeDictionaryDefinitionItems(items) {
    const result = [];
    const seen = new Set();
    for (const item of Array.isArray(items) ? items : []) {
      const definition = typeof item === "string"
        ? { text: item, partOfSpeech: "", tags: [] }
        : { text: item?.text || item?.definition || "", partOfSpeech: item?.partOfSpeech || "", tags: item?.tags || [] };
      definition.text = cleanDictionaryDefinition(definition.text);
      if (!definition.text) continue;
      const key = `${normalizeDictionaryComparison(definition.partOfSpeech)}|${normalizeDictionaryComparison(definition.text)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(definition);
    }
    return result.slice(0, 6);
  }

  function deduplicateDictionaryEntries(entries) {
    const result = [];
    const seen = new Set();
    for (const entry of entries) {
      const definitions = normalizeDictionaryDefinitionItems(entry.definitions);
      if (!definitions.length) continue;
      const signature = `${entry.languageCode}|${definitions.map((item) => normalizeDictionaryComparison(item.text)).join("|")}`;
      if (seen.has(signature)) continue;
      seen.add(signature);
      result.push({ ...entry, definitions });
    }
    return result;
  }

  function cleanDictionaryHeading(value) {
    return String(value || "")
      .replace(/\[?editar\]?/gi, "")
      .replace(/\[?edit\]?/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanDictionaryDefinition(value) {
    return String(value || "")
      .replace(/\[[0-9]+\]/g, "")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\s+/g, " ")
      .replace(/^[#*;:\-–—\s]+/, "")
      .trim();
  }

  function normalizeDictionaryComparison(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function sanitizeSelectedDictionaryTerm(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/^[\s"'“”‘’«».,!?;:()[\]{}]+|[\s"'“”‘’«».,!?;:()[\]{}]+$/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isDictionaryLevelTwoHeading(node) {
    return node.matches?.("h2, .mw-heading2") || Boolean(node.querySelector?.(":scope > h2"));
  }

  function isIgnoredDictionaryHeading(name) {
    const normalized = normalizeDictionaryComparison(name);
    return [
      "ver tambem", "ligacoes externas", "referencias", "bibliografia", "anagramas",
      "notas", "fontes", "leitura adicional", "see also", "references", "external links",
      "further reading", "notes", "statistics"
    ].includes(normalized);
  }

  function identifyDictionaryLanguage(rawName) {
    const normalized = normalizeDictionaryComparison(rawName);
    const aliases = [
      ["pt", "Português", ["portugues", "portuguese"]],
      ["en", "Inglês", ["ingles", "english"]],
      ["es", "Espanhol", ["espanhol", "espanol", "spanish"]],
      ["fr", "Francês", ["frances", "french", "francais"]],
      ["de", "Alemão", ["alemao", "german", "deutsch"]],
      ["it", "Italiano", ["italiano", "italian"]],
      ["ja", "Japonês", ["japones", "japanese", "日本語"]],
      ["ko", "Coreano", ["coreano", "korean", "한국어"]],
      ["zh", "Chinês", ["chines", "chinese", "中文", "mandarin"]],
      ["ru", "Russo", ["russo", "russian", "русскии", "русский"]],
      ["ar", "Árabe", ["arabe", "arabic", "العربية"]],
      ["nl", "Holandês", ["holandes", "dutch", "nederlands"]],
      ["la", "Latim", ["latim", "latin", "latina"]],
      ["pl", "Polonês", ["polones", "polish", "polski"]],
      ["tr", "Turco", ["turco", "turkish", "turkce"]],
      ["sv", "Sueco", ["sueco", "swedish", "svenska"]],
      ["no", "Norueguês", ["noruegues", "norwegian", "norsk"]],
      ["da", "Dinamarquês", ["dinamarques", "danish", "dansk"]],
      ["fi", "Finlandês", ["finlandes", "finnish", "suomi"]],
      ["el", "Grego", ["grego", "greek", "ελληνικα"]],
      ["he", "Hebraico", ["hebraico", "hebrew", "עברית"]]
    ];

    for (const [code, name, names] of aliases) {
      if (names.includes(normalized)) return { code, name };
    }

    return { code: "und", name: rawName || "Idioma não identificado" };
  }

  function dictionaryLanguageFlag(code) {
    const flags = {
      pt: "🇧🇷", en: "🇺🇸", es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", it: "🇮🇹",
      ja: "🇯🇵", ko: "🇰🇷", zh: "🇨🇳", ru: "🇷🇺", ar: "🇸🇦", nl: "🇳🇱",
      pl: "🇵🇱", tr: "🇹🇷", sv: "🇸🇪", no: "🇳🇴", da: "🇩🇰", fi: "🇫🇮",
      el: "🇬🇷", he: "🇮🇱", la: "🏛️", und: "🌐"
    };
    return flags[code] || "🌐";
  }


  function calculateSelection(event) {
    stopEvent(event);

    try {
      const result = evaluateBasicExpression(selectedText);
      const display = formatCalculationResult(result);
      renderCopyableResult(display, display);
    } catch (error) {
      renderError(
        error.message || "Não é possível calcular o conteúdo selecionado. Tente selecionar uma operação como 25 + 17.",
        renderActionMenu
      );
    }
  }



  function openUnitConverter(event) {
    stopEvent(event);
    const parsed = parseUnitMeasurement(selectedText);

    if (!parsed) {
      renderError(
        "Não foi possível detectar uma unidade de medida. Selecione algo como 10 mi, 32 °F, 5 kg, 4 TB ou 220 V.",
        renderActionMenu
      );
      return;
    }

    renderUnitConverter(parsed);
  }

  function renderUnitConverter(parsed) {
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-converter-card";

    const detected = document.createElement("div");
    detected.className = "trem-converter-detected";
    detected.textContent = `${parsed.category.label} detectado: ${parsed.unit.label} (${parsed.unit.symbol})`;

    const row = document.createElement("div");
    row.className = "trem-converter-row";

    const source = document.createElement("div");
    source.className = "trem-converter-source";
    source.textContent = `${formatUnitNumber(parsed.value)} ${parsed.unit.symbol}`;
    source.title = parsed.unit.label;

    const arrow = document.createElement("span");
    arrow.className = "trem-converter-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");

    const target = document.createElement("select");
    target.className = "trem-converter-select";
    target.setAttribute("aria-label", "Converter para");

    const suggestedTarget = chooseDefaultTarget(parsed.category.id, parsed.unit.id);
    for (const unit of parsed.category.units) {
      if (unit.id === parsed.unit.id) continue;
      const option = document.createElement("option");
      option.value = unit.id;
      option.textContent = `${unit.label} (${unit.symbol})`;
      option.selected = unit.id === suggestedTarget;
      target.appendChild(option);
    }

    row.append(source, arrow, target);

    const actions = document.createElement("div");
    actions.className = "trem-converter-actions";

    const back = document.createElement("button");
    back.type = "button";
    back.className = "trem-mini-button";
    back.textContent = "Voltar";
    back.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      renderActionMenu();
    });

    const convert = document.createElement("button");
    convert.type = "button";
    convert.className = "trem-mini-button trem-mini-primary";
    convert.textContent = "Converter";
    convert.addEventListener("click", (clickEvent) => {
      stopEvent(clickEvent);
      const targetUnit = parsed.category.units.find((unit) => unit.id === target.value);
      if (!targetUnit) {
        renderError("Escolha uma unidade de destino válida.", () => renderUnitConverter(parsed));
        return;
      }

      const baseValue = parsed.unit.toBase(parsed.value);
      const result = targetUnit.fromBase(baseValue);
      if (!Number.isFinite(result)) {
        renderError("Não foi possível concluir essa conversão.", () => renderUnitConverter(parsed));
        return;
      }

      const display = `${formatUnitNumber(result)} ${targetUnit.symbol}`;
      renderCopyableResult(display, display);
    });

    actions.append(back, convert);
    card.append(detected, row, actions);
    root.appendChild(card);
    positionRoot(root);
  }

  function parseUnitMeasurement(rawText) {
    const text = String(rawText || "").replace(/\u00a0/g, " ").trim();
    if (!text) return null;

    const matcher = new RegExp(`^\\s*([+-]?(?:\\d[\\d\\s.,]*|[.,]\\d+))\\s*(${UNIT_PATTERN})\\s*$`, "iu");
    const match = text.match(matcher);
    if (!match) return null;

    const value = parseMeasurementNumber(match[1]);
    const alias = normalizeUnitAlias(match[2]);
    const reference = UNIT_ALIAS_LOOKUP.get(alias);
    if (!Number.isFinite(value) || !reference) return null;

    const category = UNIT_CATEGORIES.find((item) => item.id === reference.categoryId);
    const unit = category?.units.find((item) => item.id === reference.unitId);
    if (!category || !unit) return null;

    return { value, category, unit, raw: text };
  }

  function parseMeasurementNumber(rawValue) {
    let value = String(rawValue || "").replace(/\s/g, "").trim();
    if (!value) return Number.NaN;

    const sign = value.startsWith("-") ? -1 : 1;
    value = value.replace(/^[+-]/, "");
    if (!/^\d[\d.,]*$|^[.,]\d+$/.test(value)) return Number.NaN;

    const commaCount = (value.match(/,/g) || []).length;
    const dotCount = (value.match(/\./g) || []).length;

    if (commaCount && dotCount) {
      const decimalSeparator = value.lastIndexOf(",") > value.lastIndexOf(".") ? "," : ".";
      const groupingSeparator = decimalSeparator === "," ? "." : ",";
      value = value.split(groupingSeparator).join("");
      const decimalIndex = value.lastIndexOf(decimalSeparator);
      value = value.slice(0, decimalIndex).replace(/[.,]/g, "")
        + "."
        + value.slice(decimalIndex + 1).replace(/[.,]/g, "");
    } else if (commaCount || dotCount) {
      const separator = commaCount ? "," : ".";
      const pieces = value.split(separator);
      const looksGrouped = pieces.length > 2 && pieces.slice(1).every((part) => part.length === 3);
      const singleThousandsGroup = pieces.length === 2
        && pieces[0].length >= 1
        && pieces[0].length <= 3
        && pieces[1].length === 3
        && pieces[0] !== "0";

      if (looksGrouped || singleThousandsGroup) {
        value = pieces.join("");
      } else {
        const decimal = pieces.pop();
        value = pieces.join("") + "." + decimal;
      }
    }

    return sign * Number(value);
  }

  function chooseDefaultTarget(categoryId, sourceId) {
    const preferences = {
      length: { mm: "cm", cm: "m", m: "km", km: "m", in: "cm", ft: "m", yd: "m", mi: "km", nmi: "km" },
      temperature: { c: "f", f: "c", k: "c" },
      mass: { mg: "g", g: "kg", kg: "g", t: "kg", oz: "g", lb: "kg" },
      volume: { ml: "l", l: "ml", m3: "l", tsp: "ml", tbsp: "ml", cup: "ml", floz: "ml", pt: "l", qt: "l", gal: "l" },
      speed: { ms: "kmh", kmh: "ms", mph: "kmh", kn: "kmh" },
      area: { mm2: "cm2", cm2: "m2", m2: "ha", km2: "ha", ha: "m2", acre: "ha", in2: "cm2", ft2: "m2" },
      time: { millisecond: "second", second: "minute", minute: "hour", hour: "minute", day: "hour", week: "day" },
      pressure: { pa: "hpa", hpa: "kpa", kpa: "bar", mpa: "bar", bar: "kpa", atm: "bar", psi: "kpa", mmhg: "kpa" },
      digitalStorage: { byte: "kb", kb: "mb", mb: "gb", gb: "tb", tb: "gb", pb: "tb", kib: "mib", mib: "gib", gib: "tib", tib: "gib", pib: "tib" },
      energy: { j: "kj", kj: "j", mj: "kj", wh: "kwh", kwh: "wh", cal: "j", kcal: "kj", btu: "kj" },
      frequency: { hz: "khz", khz: "hz", mhz: "khz", ghz: "mhz", thz: "ghz" },
      voltage: { uv: "mv", mv: "v", v: "kv", kv: "v" },
      electricCurrent: { ua: "ma", ma: "a", a: "ma", ka: "a" }
    };

    return preferences[categoryId]?.[sourceId] || null;
  }

  function formatUnitNumber(value) {
    const normalized = Math.abs(value) < 1e-15 ? 0 : Number(value.toPrecision(12));
    const absolute = Math.abs(normalized);

    if (absolute !== 0 && (absolute < 1e-9 || absolute >= 1e15)) {
      return new Intl.NumberFormat("pt-BR", {
        notation: "scientific",
        maximumFractionDigits: 6
      }).format(normalized);
    }

    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 10,
      useGrouping: true
    }).format(normalized);
  }

  function linearUnit(id, label, symbol, factor, aliases = []) {
    return customUnit(id, label, symbol, aliases, (value) => value * factor, (value) => value / factor);
  }

  function customUnit(id, label, symbol, aliases, toBase, fromBase) {
    return { id, label, symbol, aliases: [symbol, ...aliases], toBase, fromBase };
  }

  function buildUnitAliasLookup() {
    const lookup = new Map();
    for (const category of UNIT_CATEGORIES) {
      for (const unit of category.units) {
        for (const alias of unit.aliases) {
          const normalized = normalizeUnitAlias(alias);
          if (!normalized || lookup.has(normalized)) continue;
          lookup.set(normalized, { categoryId: category.id, unitId: unit.id });
        }
      }
    }
    return lookup;
  }

  function buildUnitPattern() {
    const aliases = new Set();
    for (const category of UNIT_CATEGORIES) {
      for (const unit of category.units) {
        for (const alias of unit.aliases) aliases.add(String(alias).trim());
      }
    }

    return Array.from(aliases)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)
      .map(escapeRegex)
      .join("|");
  }

  function normalizeUnitAlias(alias) {
    return String(alias || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/²/g, "2")
      .replace(/³/g, "3")
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function setupToolMenuScrolling(menu) {
    menu?.addEventListener("scroll", hideToolTooltip, { passive: true });
  }

  function onDocumentScroll(event) {
    const root = document.getElementById(ROOT_ID);
    const target = event.target;
    if (!root) return;
    if (target instanceof Node && (target === root || root.contains(target))) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.toString().trim()) return;
    const rect = getUsefulRect(selection.getRangeAt(0));
    if (!rect || (!rect.width && !rect.height)) return;
    selectionRect = rect;
    positionRoot(root);
  }


  function evaluateBasicExpression(rawExpression) {
    let expression = String(rawExpression || "")
      .trim()
      .replace(/[−–—]/g, "-")
      .replace(/÷/g, "/")
      .replace(/×/g, "*")
      .replace(/(\d|\))\s*[xX]\s*(?=\d|\()/g, "$1*")
      .replace(/\s+/g, "")
      .replace(/=+$/, "")
      .replace(/,/g, ".");

    if (!expression || expression.length > 200) {
      throw new Error("Não é possível calcular o conteúdo selecionado. Tente selecionar uma operação como 25 + 17.");
    }

    if (!/[+\-*/%]/.test(expression) || !/^[0-9.+\-*/()%]+$/.test(expression)) {
      throw new Error("Não é possível calcular o conteúdo selecionado. Tente selecionar uma operação como 25 + 17.");
    }

    let index = 0;

    function peek() {
      return expression[index];
    }

    function consume(expected) {
      if (expression[index] !== expected) return false;
      index += 1;
      return true;
    }

    function parseExpression() {
      let value = parseTerm();
      while (true) {
        if (consume("+")) value += parseTerm();
        else if (consume("-")) value -= parseTerm();
        else break;
      }
      return value;
    }

    function parseTerm() {
      let value = parseUnary();
      while (true) {
        if (consume("*")) {
          value *= parseUnary();
        } else if (consume("/")) {
          const divisor = parseUnary();
          if (divisor === 0) throw new Error("Não é possível dividir por zero.");
          value /= divisor;
        } else {
          break;
        }
      }
      return value;
    }

    function parseUnary() {
      if (consume("+")) return parseUnary();
      if (consume("-")) return -parseUnary();
      return parsePostfix();
    }

    function parsePostfix() {
      let value = parsePrimary();
      while (consume("%")) value /= 100;
      return value;
    }

    function parsePrimary() {
      if (consume("(")) {
        const value = parseExpression();
        if (!consume(")")) throw new Error("Os parênteses da operação estão incompletos.");
        return value;
      }

      const start = index;
      let dots = 0;
      while (index < expression.length && /[0-9.]/.test(peek())) {
        if (peek() === ".") dots += 1;
        index += 1;
      }

      const token = expression.slice(start, index);
      if (!token || token === "." || dots > 1) {
        throw new Error("A operação selecionada não está em um formato válido.");
      }

      const value = Number(token);
      if (!Number.isFinite(value)) throw new Error("A operação selecionada contém um número inválido.");
      return value;
    }

    const result = parseExpression();
    if (index !== expression.length) throw new Error("A operação selecionada não está em um formato válido.");
    if (!Number.isFinite(result)) throw new Error("O resultado da operação não é um número válido.");

    return Math.abs(result) < 1e-12 ? 0 : Number(result.toPrecision(12));
  }

  function formatCalculationResult(value) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 10,
      useGrouping: true
    }).format(value);
  }

  function renderLoading(label) {
    const root = ensureRoot();
    root.innerHTML = "";

    const loading = document.createElement("div");
    loading.className = "trem-message trem-loading";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    loading.setAttribute("aria-busy", "true");

    const spinner = document.createElement("span");
    spinner.className = "trem-spinner";

    const text = document.createElement("span");
    text.textContent = label;

    loading.append(spinner, text);
    root.appendChild(loading);
    positionRoot(root);
  }

  function renderTranslationResult(result) {
    activateTextResultMode();
    const root = ensureRoot();
    root.innerHTML = "";

    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-compact-result-card";
    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = activeToolLabel("text", "Tradutor");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-translation-result";
    button.title = "Clique para copiar a tradução";

    const flags = document.createElement("div");
    flags.className = "trem-translation-flags";
    flags.textContent = `${result.sourceFlag}  →  ${result.targetFlag}`;

    const divider = document.createElement("div");
    divider.className = "trem-translation-divider";
    divider.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    text.className = "trem-translation-text";
    text.textContent = result.translation;

    button.append(flags, divider, text);
    button.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(result.translation);
      button.classList.toggle("trem-copy-success", copied);
      button.classList.toggle("trem-copy-failed", !copied);
      button.dataset.copyStatus = copied ? "✓ Copiado" : "Falha ao copiar";

      setTimeout(() => {
        if (!button.isConnected) return;
        button.classList.remove("trem-copy-success", "trem-copy-failed");
        delete button.dataset.copyStatus;
      }, 1100);
    });

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "Clique no resultado para copiar.";
    card.append(heading, button, hint, createLocalToolActions(() => renderActionMenu()));
    root.appendChild(card);
    positionRoot(root);
  }

  function renderCopyableResult(visibleText, copyValue) {
    activateTextResultMode();
    const root = ensureRoot();
    root.innerHTML = "";

    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-compact-result-card";
    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = activeInvokedTool?.label || "Resultado";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-result";
    button.textContent = visibleText;
    button.title = "Clique para copiar";

    button.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(copyValue);
      showCopyFeedback(button, copied, visibleText);
    });

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "Clique no resultado para copiar.";
    card.append(heading, button, hint, createLocalToolActions(() => renderActionMenu()));
    root.appendChild(card);
    positionRoot(root);
  }


function suggestEncodingMode(text) {
  const value = String(text || "").trim();
  if (/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value) && value.length >= 8 && value.length % 4 === 0) {
    return "base64-decode";
  }
  if (/%[0-9A-Fa-f]{2}/.test(value)) return "url-decode";
  if (/&(lt|gt|amp|quot|#39|nbsp);/i.test(value)) return "html-decode";
  if (/\u\{[0-9A-Fa-f]+\}|\u[0-9A-Fa-f]{4}/.test(value)) return "unicode-unescape";
  if (/^(?:[01]{8})(?:\s+[01]{8})+$/.test(value) || /^[01]{8}$/.test(value)) return "binary-decode";
  if (/^[.\-/\s]+$/.test(value) && /[.-]/.test(value)) return "morse-decode";
  return "base64-encode";
}

function transformEncodedText(text, mode) {
  const value = String(text || "");
  try {
    switch (mode) {
      case "base64-encode":
        return utf8ToBase64(value);
      case "base64-decode":
        return base64ToUtf8(value);
      case "url-encode":
        return encodeURIComponent(value);
      case "url-decode":
        return decodeURIComponent(value);
      case "html-encode":
        return encodeHtml(value);
      case "html-decode":
        return decodeHtml(value);
      case "unicode-escape":
        return escapeUnicode(value);
      case "unicode-unescape":
        return unescapeUnicode(value);
      case "morse-encode":
        return encodeMorse(value);
      case "morse-decode":
        return decodeMorse(value);
      case "binary-encode":
        return encodeBinary(value);
      case "binary-decode":
        return decodeBinary(value);
      default:
        return value;
    }
  } catch (_error) {
    return "Não foi possível aplicar esta operação ao texto selecionado.";
  }
}

function utf8ToBase64(text) {
  const bytes = new TextEncoder().encode(String(text || ""));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToUtf8(text) {
  const cleaned = String(text || "").replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function decodeHtml(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(text || "");
  return textarea.value;
}

function escapeUnicode(text) {
  return Array.from(String(text || "")).map((char) => {
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0xFFFF) return `\\u${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
    return `\\u{${codePoint.toString(16).toUpperCase()}}`;
  }).join("");
}

function unescapeUnicode(text) {
  return String(text || "")
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
}


const MORSE_TABLE = Object.freeze({
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ':': '---...', ';': '-.-.-.', '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.', '@': '.--.-.'
});
const MORSE_REVERSE_TABLE = Object.freeze(Object.fromEntries(Object.entries(MORSE_TABLE).map(([key, value]) => [value, key])));

function encodeBinary(text) {
  const bytes = new TextEncoder().encode(String(text || ''));
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, '0')).join(' ');
}

function decodeBinary(text) {
  const parts = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length || parts.some((part) => !/^[01]{8}$/.test(part))) throw new Error('invalid binary');
  const bytes = Uint8Array.from(parts.map((part) => parseInt(part, 2)));
  return new TextDecoder().decode(bytes);
}

function encodeMorse(text) {
  return String(text || '').toUpperCase().split(/\s+/).map((word) => {
    return Array.from(word).map((char) => MORSE_TABLE[char] || '?').join(' ');
  }).join(' / ');
}

function decodeMorse(text) {
  return String(text || '').trim().split(/\s*\/\s*/).map((word) => {
    return word.split(/\s+/).filter(Boolean).map((chunk) => MORSE_REVERSE_TABLE[chunk] || '�').join('');
  }).join(' ');
}

function parseSelectedColor(value) {
  const source = String(value || "").trim();
  if (!source || source.length > 80) return null;

  const tester = document.createElement("span");
  tester.style.color = "";
  tester.style.color = source;
  if (!tester.style.color) return null;

  tester.style.position = "fixed";
  tester.style.left = "-9999px";
  tester.style.top = "-9999px";
  document.documentElement.appendChild(tester);
  const computed = getComputedStyle(tester).color;
  tester.remove();

  const match = computed.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => part.trim());
  const r = clampColorChannel(Number(parts[0]));
  const g = clampColorChannel(Number(parts[1]));
  const b = clampColorChannel(Number(parts[2]));
  const a = parts[3] == null ? 1 : clampAlpha(Number(parts[3]));
  if (![r, g, b, a].every(Number.isFinite)) return null;

  const hsl = rgbToHsl(r, g, b);
  const hex = rgbToHex(r, g, b);
  const hexa = rgbaToHex(r, g, b, a);
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const rgba = `rgba(${r}, ${g}, ${b}, ${trimTrailingZeros(a)})`;
  const hslText = `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)`;
  const hslaText = `hsla(${hsl.h}°, ${hsl.s}%, ${hsl.l}%, ${trimTrailingZeros(a)})`;

  return {
    input: source,
    preview: rgba,
    alpha: a,
    formats: [
      { label: "HEX", value: hex },
      ...(a < 1 ? [{ label: "HEXA", value: hexa }] : []),
      { label: "RGB", value: rgb },
      ...(a < 1 ? [{ label: "RGBA", value: rgba }] : []),
      { label: "HSL", value: hslText },
      ...(a < 1 ? [{ label: "HSLA", value: hslaText }] : [])
    ]
  };
}

function clampColorChannel(value) {
  return Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
}

function clampAlpha(value) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

function trimTrailingZeros(value) {
  return String(Number(value.toFixed(3)));
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join("")}`;
}

function rgbaToHex(r, g, b, a) {
  const alpha = Math.round(clampAlpha(a) * 255);
  return `#${[r, g, b, alpha].map((value) => value.toString(16).toUpperCase().padStart(2, "0")).join("")}`;
}

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;

  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn: h = 60 * (((gn - bn) / d) % 6); break;
      case gn: h = 60 * (((bn - rn) / d) + 2); break;
      case bn: h = 60 * (((rn - gn) / d) + 4); break;
    }
  }

  if (h < 0) h += 360;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function renderColorResult(color) {
    activateTextResultMode();
  const root = createRoot();
  const card = document.createElement("div");
  card.className = "trem-color-card";

  const title = document.createElement("div");
  title.className = "trem-local-tool-title";
  title.textContent = displayToolLabel("text", "color", "Converter Código de Cor");

  const previewRow = document.createElement("div");
  previewRow.className = "trem-color-preview-row";

  const swatch = document.createElement("div");
  swatch.className = "trem-color-swatch";
  swatch.style.background = color.preview;

  const meta = document.createElement("div");
  meta.className = "trem-color-meta";
  const previewLabel = document.createElement("strong");
  previewLabel.textContent = color.formats[0]?.value || color.input;
  const previewInput = document.createElement("span");
  previewInput.textContent = color.input;
  meta.append(previewLabel, previewInput);
  previewRow.append(swatch, meta);

  const grid = document.createElement("div");
  grid.className = "trem-counter-grid";
  color.formats.forEach((item) => {
    const metric = document.createElement("button");
    metric.type = "button";
    metric.className = "trem-counter-metric";
    metric.title = `Copiar ${item.label}`;
    const label = document.createElement("span");
    label.textContent = item.label;
    const value = document.createElement("strong");
    value.textContent = item.value;
    metric.append(label, value);
    metric.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(item.value);
      metric.classList.toggle("trem-copy-success", copied);
      metric.dataset.copyStatus = copied ? "✓" : "!";
      setTimeout(() => {
        if (!metric.isConnected) return;
        metric.classList.remove("trem-copy-success");
        delete metric.dataset.copyStatus;
      }, 900);
    });
    grid.appendChild(metric);
  });

  const hint = document.createElement("div");
  hint.className = "trem-local-tool-hint";
  hint.textContent = "Clique em um formato para copiá-lo.";

  const actions = createLocalToolActions(() => renderActionMenu());
  card.append(title, previewRow, grid, hint, actions);
  root.appendChild(card);
  positionRoot(root);
}

function renderReaderTool(text) {
  stopSpeechPlayback();
  const root = createRoot();
  const card = document.createElement("div");
  card.className = "trem-reader-card";

  const title = document.createElement("div");
  title.className = "trem-local-tool-title";
  title.textContent = displayToolLabel("text", "reader", "TTS");

  const preview = document.createElement("div");
  preview.className = "trem-reader-preview";
  preview.textContent = text;

  const controls = document.createElement("div");
  controls.className = "trem-reader-controls";

  const voiceSelect = document.createElement("select");
  voiceSelect.className = "trem-local-tool-select";
  voiceSelect.setAttribute("aria-label", "Escolher voz");

  const rateSelect = document.createElement("select");
  rateSelect.className = "trem-local-tool-select";
  rateSelect.setAttribute("aria-label", "Velocidade da leitura");
  [
    ["0.8", "Velocidade 0,8x"],
    ["1", "Velocidade 1x"],
    ["1.2", "Velocidade 1,2x"],
    ["1.5", "Velocidade 1,5x"]
  ].forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    if (value === "1") option.selected = true;
    rateSelect.appendChild(option);
  });

  controls.append(voiceSelect, rateSelect);

  const status = document.createElement("div");
  status.className = "trem-local-tool-hint";
  status.textContent = "Pronto para ler o texto selecionado.";

  const actionRow = document.createElement("div");
  actionRow.className = "trem-reader-action-row";

  const playButton = document.createElement("button");
  playButton.type = "button";
  playButton.className = "trem-mini-button trem-mini-primary";
  playButton.textContent = "Reproduzir";

  const pauseButton = document.createElement("button");
  pauseButton.type = "button";
  pauseButton.className = "trem-mini-button";
  pauseButton.textContent = "Pausar";

  const stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.className = "trem-mini-button";
  stopButton.textContent = "Parar";

  const footerActions = createLocalToolActions(() => renderActionMenu());
  actionRow.append(playButton, pauseButton, stopButton);

  const updateVoices = () => {
    const voices = getSpeechVoices();
    const preferredLang = detectLikelySpeechLanguage(text);
    const currentValue = voiceSelect.value;
    voiceSelect.innerHTML = "";

    const auto = document.createElement("option");
    auto.value = "auto";
    auto.textContent = `Automática (${preferredLang.toUpperCase()})`;
    voiceSelect.appendChild(auto);

    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${voice.name} · ${voice.lang}`;
      if (currentValue && currentValue === option.value) option.selected = true;
      voiceSelect.appendChild(option);
    });
  };

  updateVoices();
  if (speechVoicesListener) window.speechSynthesis.removeEventListener?.("voiceschanged", speechVoicesListener);
  speechVoicesListener = updateVoices;
  window.speechSynthesis.addEventListener?.("voiceschanged", speechVoicesListener);

  playButton.addEventListener("click", (event) => {
    stopEvent(event);
    const synth = window.speechSynthesis;
    if (synth.paused && synth.speaking) {
      synth.resume();
      status.textContent = "Leitura retomada.";
      return;
    }

    stopSpeechPlayback();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectLikelySpeechLanguage(text);
    utterance.rate = Number(rateSelect.value) || 1;
    const voices = getSpeechVoices();
    if (voiceSelect.value !== "auto") utterance.voice = voices[Number(voiceSelect.value)] || null;
    activeSpeechUtterance = utterance;
    utterance.onstart = () => { status.textContent = "Lendo o texto…"; };
    utterance.onpause = () => { status.textContent = "Leitura pausada."; };
    utterance.onresume = () => { status.textContent = "Leitura retomada."; };
    utterance.onend = () => { activeSpeechUtterance = null; status.textContent = "Leitura concluída."; };
    utterance.onerror = () => { activeSpeechUtterance = null; status.textContent = "Não foi possível concluir a leitura."; };
    synth.speak(utterance);
  });

  pauseButton.addEventListener("click", (event) => {
    stopEvent(event);
    const synth = window.speechSynthesis;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      status.textContent = "Leitura pausada.";
    }
  });

  stopButton.addEventListener("click", (event) => {
    stopEvent(event);
    stopSpeechPlayback();
    status.textContent = "Leitura interrompida.";
  });

  card.append(title, preview, controls, actionRow, status, footerActions);
  root.appendChild(card);
  positionRoot(root);
}

function getSpeechVoices() {
  return [...window.speechSynthesis.getVoices()].sort((a, b) => String(a.lang || "").localeCompare(String(b.lang || ""), "pt-BR") || String(a.name || "").localeCompare(String(b.name || ""), "pt-BR"));
}

function detectLikelySpeechLanguage(text) {
  const fromSettings = String(settings.sourceLanguage || "auto").split("-")[0].toLowerCase();
  if (fromSettings && fromSettings !== "auto") return fromSettings;
  const docLang = String(document.documentElement?.lang || "").split("-")[0].toLowerCase();
  const guessed = detectLikelyDictionaryLanguage(text);
  return guessed !== "und" ? guessed : (docLang || "pt");
}

function stopSpeechPlayback() {
  if (!("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch (_error) {
    // ignore
  }
  activeSpeechUtterance = null;
}



function splitSelectedItems(text) {
  const normalized = String(text || "").replace(/\r\n?/g, "\n");
  let items = normalized.split(/\n+/).map((item) => item.trim()).filter(Boolean);
  if (items.length <= 1) items = normalized.split(/[;,|]+/).map((item) => item.trim()).filter(Boolean);
  if (items.length <= 1) items = normalized.split(/\s*•\s*/).map((item) => item.trim()).filter(Boolean);
  return items.filter(Boolean);
}

function buildListFromText(text, mode) {
  const items = splitSelectedItems(text);
  if (!items.length) return String(text || "").trim();
  if (mode === "numbered") return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  if (mode === "checklist") return items.map((item) => `☐ ${item}`).join("\n");
  if (mode === "markdown") return items.map((item) => `- ${item}`).join("\n");
  return items.map((item) => `• ${item}`).join("\n");
}

function sortSelectedItems(text, mode) {
  const items = splitSelectedItems(text);
  if (!items.length) return String(text || "").trim();
  const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
  let result = [...items];
  if (mode === "az") result.sort((a, b) => collator.compare(a, b));
  else if (mode === "za") result.sort((a, b) => collator.compare(b, a));
  else if (mode === "unique") result = [...new Set(result.map((item) => item.trim()))].sort((a, b) => collator.compare(a, b));
  else if (mode === "shuffle") {
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
  } else if (mode === "num-asc" || mode === "num-desc") {
    result.sort((a, b) => {
      const valueA = parseLocalizedNumber(a);
      const valueB = parseLocalizedNumber(b);
      if (Number.isFinite(valueA) && Number.isFinite(valueB)) return mode === "num-asc" ? valueA - valueB : valueB - valueA;
      return mode === "num-asc" ? collator.compare(a, b) : collator.compare(b, a);
    });
  }
  return result.join("\n");
}

function parseSelectedDate(value) {
  const raw = String(value || "").trim().replace(/\u00A0/g, " ");
  if (!raw || raw.length > 100) return null;
  const currentYear = new Date().getFullYear();
  const normalized = raw.toLowerCase();
  const months = { janeiro:1, jan:1, january:1, fevereiro:2, fev:2, february:2, feb:2, março:3, marco:3, mar:3, march:3, abril:4, abr:4, april:4, apr:4, maio:5, mai:5, may:5, junho:6, jun:6, june:6, julho:7, jul:7, july:7, agosto:8, ago:8, august:8, aug:8, setembro:9, set:9, september:9, sep:9, outubro:10, out:10, october:10, oct:10, novembro:11, nov:11, november:11, dezembro:12, dez:12, december:12, dec:12 };
  let year, month, day;
  let match = normalized.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (match) { year = Number(match[1]); month = Number(match[2]); day = Number(match[3]); }
  if (!match) {
    match = normalized.match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/);
    if (match) { day = Number(match[1]); month = Number(match[2]); year = match[3] ? Number(match[3]) : currentYear; if (year < 100) year += 2000; }
  }
  if (!match) {
    match = normalized.match(/^(\d{1,2})\s+de\s+([a-zçãéíóúâêô]+)(?:\s+de\s+(\d{4}))?$/i);
    if (match) { day = Number(match[1]); month = months[match[2]]; year = match[3] ? Number(match[3]) : currentYear; }
  }
  if (!match) {
    match = normalized.match(/^([a-zçãéíóúâêô]+)\s+(\d{1,2}),?\s*(\d{4})?$/i);
    if (match) { month = months[match[1]]; day = Number(match[2]); year = match[3] ? Number(match[3]) : currentYear; }
  }
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  const iso = `${year.toString().padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const full = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full" }).format(date);
  const short = new Intl.DateTimeFormat("pt-BR").format(date);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
  const diffDays = differenceInCalendarDays(date, new Date());
  const relative = formatRelativeDayDistance(diffDays);
  return { raw, date, iso, short, full, weekday, diffDays, relative };
}

function differenceInCalendarDays(dateA, dateB) {
  const startA = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate()).getTime();
  const startB = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate()).getTime();
  return Math.round((startA - startB) / 86400000);
}

function formatRelativeDayDistance(diffDays) {
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Amanhã";
  if (diffDays === -1) return "Ontem";
  if (diffDays > 1) return `Daqui a ${diffDays} dias`;
  return `Há ${Math.abs(diffDays)} dias`;
}

function renderDateResult(parsed) {
    activateTextResultMode();
  const root = createRoot();
  const card = document.createElement("div");
  card.className = "trem-counter-card";
  const title = document.createElement("div");
  title.className = "trem-local-tool-title";
  title.textContent = displayToolLabel("text", "date", "Data");
  const grid = document.createElement("div");
  grid.className = "trem-counter-grid";
  const metrics = [["Data", parsed.short, parsed.short], ["Semana", capitalizeFirst(parsed.weekday), capitalizeFirst(parsed.weekday)], ["ISO", parsed.iso, parsed.iso], ["Distância", parsed.relative, parsed.relative]];
  for (const [label, visibleValue, copyValue] of metrics) {
    const metric = document.createElement("button");
    metric.type = "button";
    metric.className = "trem-counter-metric";
    metric.title = `Copiar ${label.toLowerCase()}`;
    const metricLabel = document.createElement("span");
    metricLabel.textContent = label;
    const metricValue = document.createElement("strong");
    metricValue.textContent = visibleValue;
    metric.append(metricLabel, metricValue);
    metric.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(copyValue);
      metric.classList.toggle("trem-copy-success", copied);
      metric.dataset.copyStatus = copied ? "✓" : "!";
      setTimeout(() => { if (!metric.isConnected) return; metric.classList.remove("trem-copy-success"); delete metric.dataset.copyStatus; }, 900);
    });
    grid.appendChild(metric);
  }
  const summary = document.createElement("button");
  summary.type = "button";
  summary.className = "trem-text-tool-output";
  summary.title = "Clique para copiar";
  summary.textContent = parsed.full;
  summary.addEventListener("click", async (event) => {
    stopEvent(event);
    const copied = await copyText(parsed.full);
    summary.classList.toggle("trem-copy-success", copied);
    summary.dataset.copyStatus = copied ? "✓ Copiado" : "Falha ao copiar";
    setTimeout(() => { if (!summary.isConnected) return; summary.classList.remove("trem-copy-success"); delete summary.dataset.copyStatus; }, 1000);
  });
  const hint = document.createElement("div");
  hint.className = "trem-local-tool-hint";
  hint.textContent = "Clique em um valor para copiá-lo.";
  const actions = createLocalToolActions(() => renderActionMenu());
  card.append(title, grid, summary, hint, actions);
  root.appendChild(card);
  positionRoot(root);
}

function renderError(message, retryHandler) {

    const root = ensureRoot();
    root.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "trem-error-card trem-text-tool-card";

    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = activeInvokedTool?.label || "Caixota";

    const text = document.createElement("div");
    text.className = "trem-error-text";
    text.textContent = message;

    const actions = createLocalToolActions(() => renderActionMenu());

    if (retryHandler && retryHandler !== renderActionMenu) {
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "trem-mini-button trem-mini-primary";
      retry.textContent = "Tentar novamente";
      retry.addEventListener("click", retryHandler);
      actions.prepend(retry);
    }

    wrapper.append(heading, text, actions);
    root.appendChild(wrapper);
    positionRoot(root);
  }



  function openImageCaptureTool(event, backHandler = null) {
    if (event) stopEvent(event);
    activeMenuMode = "image";
    selectionRect = centeredReferenceRect();
    const { card } = openImageToolShell("Capturar");

    const intro = document.createElement("div");
    intro.className = "trem-local-tool-hint trem-tool-intro";
    intro.textContent = "Capture a parte visível da aba ou desenhe uma área. Depois, use a imagem nas outras ferramentas da Caixota.";

    const modes = document.createElement("div");
    modes.className = "trem-capture-modes";

    const visible = createCaptureModeButton("capture", "Aba Visível", "Captura tudo que está aparecendo na tela neste momento.");
    visible.addEventListener("click", async (clickEvent) => {
      stopEvent(clickEvent);
      await runCaptureAction(visible, async () => {
        const dataUrl = await captureVisiblePageImage();
        openCapturedImageHub(dataUrl, createScreenshotFilename("aba"));
      });
    });

    const area = createCaptureModeButton("image-resize", "Selecionar Área", "Arraste sobre a página para escolher somente uma região.");
    area.addEventListener("click", async (clickEvent) => {
      stopEvent(clickEvent);
      await runCaptureAction(area, async () => {
        const dataUrl = await captureVisiblePageImage();
        const cropped = await selectAndCropScreenshot(dataUrl);
        openCapturedImageHub(cropped, createScreenshotFilename("area"));
      });
    });

    modes.append(visible, area);
    card.append(intro, modes, createLocalToolActions(() => backHandler ? backHandler() : (currentImageContext ? renderImageActionMenu() : removePanel())));
    positionRoot(ensureRoot());
  }

  function createCaptureModeButton(icon, title, description) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-capture-mode";
    const iconElement = createIconElement(icon, "trem-capture-mode-icon");
    const text = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = title;
    const small = document.createElement("small");
    small.textContent = description;
    text.append(strong, small);
    button.append(iconElement, text);
    return button;
  }

  async function runCaptureAction(button, task) {
    const original = button.disabled;
    button.disabled = true;
    button.classList.add("is-loading");
    try {
      await task();
    } catch (error) {
      if (safeMessage(error) !== "Captura cancelada.") showTransientMessage(safeMessage(error));
    } finally {
      button.disabled = original;
      button.classList.remove("is-loading");
    }
  }

  async function captureVisiblePageImage() {
    const root = document.getElementById(ROOT_ID);
    const previousVisibility = root?.style.visibility || "";
    if (root) root.style.visibility = "hidden";
    await waitForFrames(2);
    try {
      const response = await sendRuntimeMessage({ type: "CAPTURE_VISIBLE_TAB" });
      const dataUrl = response?.result?.dataUrl;
      if (!String(dataUrl || "").startsWith("data:image/")) throw new Error("A captura da aba não retornou uma imagem válida.");
      return dataUrl;
    } finally {
      if (root?.isConnected) root.style.visibility = previousVisibility || "visible";
    }
  }

  function waitForFrames(count = 1) {
    return new Promise((resolve) => {
      const next = () => count-- <= 0 ? resolve() : requestAnimationFrame(next);
      next();
    });
  }

  function createScreenshotFilename(kind) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `caixota-${kind}-${stamp}.png`;
  }

  async function selectAndCropScreenshot(dataUrl) {
    const root = document.getElementById(ROOT_ID);
    if (root) root.style.display = "none";
    captureSelectionInProgress = true;

    return new Promise((resolve, reject) => {
      const overlay = document.createElement("div");
      overlay.className = "trem-capture-overlay";
      const label = document.createElement("div");
      label.className = "trem-capture-overlay-label";
      label.textContent = "Arraste para selecionar uma área · Esc para cancelar";
      const selection = document.createElement("div");
      selection.className = "trem-capture-selection";
      overlay.append(label, selection);
      document.documentElement.appendChild(overlay);

      let startX = 0;
      let startY = 0;
      let dragging = false;

      const cleanup = () => {
        overlay.remove();
        document.removeEventListener("keydown", onKeyDownCapture, true);
        if (root?.isConnected) root.style.display = "";
        captureSelectionInProgress = false;
        captureMouseGuardUntil = performance.now() + 500;
      };

      const onKeyDownCapture = (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        cleanup();
        reject(new Error("Captura cancelada."));
      };

      overlay.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        event.preventDefault();
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        selection.style.display = "block";
        selection.style.left = `${startX}px`;
        selection.style.top = `${startY}px`;
        selection.style.width = "0px";
        selection.style.height = "0px";
        overlay.setPointerCapture?.(event.pointerId);
      });

      overlay.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const left = Math.min(startX, event.clientX);
        const top = Math.min(startY, event.clientY);
        const width = Math.abs(event.clientX - startX);
        const height = Math.abs(event.clientY - startY);
        selection.style.left = `${left}px`;
        selection.style.top = `${top}px`;
        selection.style.width = `${width}px`;
        selection.style.height = `${height}px`;
      });

      overlay.addEventListener("pointerup", async (event) => {
        if (!dragging) return;
        event.preventDefault();
        dragging = false;
        const rect = {
          left: Math.min(startX, event.clientX),
          top: Math.min(startY, event.clientY),
          width: Math.abs(event.clientX - startX),
          height: Math.abs(event.clientY - startY)
        };
        if (rect.width < 8 || rect.height < 8) {
          cleanup();
          reject(new Error("A área selecionada ficou pequena demais."));
          return;
        }
        try {
          const cropped = await cropScreenshotDataUrl(dataUrl, rect);
          cleanup();
          resolve(cropped);
        } catch (error) {
          cleanup();
          reject(error);
        }
      });

      document.addEventListener("keydown", onKeyDownCapture, true);
    });
  }

  async function cropScreenshotDataUrl(dataUrl, rect) {
    const image = await loadHtmlImage(dataUrl);
    const scaleX = image.naturalWidth / window.innerWidth;
    const scaleY = image.naturalHeight / window.innerHeight;
    const sourceX = Math.max(0, Math.round(rect.left * scaleX));
    const sourceY = Math.max(0, Math.round(rect.top * scaleY));
    const sourceWidth = Math.min(image.naturalWidth - sourceX, Math.max(1, Math.round(rect.width * scaleX)));
    const sourceHeight = Math.min(image.naturalHeight - sourceY, Math.max(1, Math.round(rect.height * scaleY)));
    const canvas = document.createElement("canvas");
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    canvas.getContext("2d").drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
    return canvas.toDataURL("image/png");
  }

  function openCapturedImageHub(dataUrl, filename) {
    imageAssetCache.delete(currentImageContext?.srcUrl);
    currentImageContext = {
      srcUrl: dataUrl,
      filename,
      alt: "Captura de tela feita pela Caixota",
      title: "Captura de tela",
      contentType: "image/png",
      byteSize: estimateDataUrlSize(dataUrl),
      element: null
    };
    activeMenuMode = "image";
    selectionRect = centeredReferenceRect();

    const { card } = openImageToolShell("Captura Pronta");
    const preview = document.createElement("img");
    preview.className = "trem-image-preview trem-capture-preview";
    preview.src = dataUrl;
    preview.alt = "Prévia da captura";

    const hint = document.createElement("div");
    hint.className = "trem-local-tool-hint";
    hint.textContent = "A captura agora pode ser convertida, comprimida, redimensionada ou analisada nas ferramentas de imagem.";

    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions trem-wrap-actions";

    const tools = document.createElement("button");
    tools.type = "button";
    tools.className = "trem-mini-button trem-mini-primary";
    tools.textContent = "Usar nas Ferramentas";
    tools.addEventListener("click", (event) => {
      stopEvent(event);
      renderImageActionMenu();
    });

    const download = document.createElement("button");
    download.type = "button";
    download.className = "trem-mini-button";
    download.textContent = "Baixar PNG";
    download.addEventListener("click", async (event) => {
      stopEvent(event);
      const blob = await (await fetch(dataUrl)).blob();
      downloadBlob(blob, filename);
    });

    const captureAgain = document.createElement("button");
    captureAgain.type = "button";
    captureAgain.className = "trem-mini-button";
    captureAgain.textContent = "Capturar Outra";
    captureAgain.addEventListener("click", (event) => {
      stopEvent(event);
      openImageCaptureTool();
    });

    actions.append(tools, download, captureAgain);
    card.append(preview, hint, actions);
    positionRoot(ensureRoot());
  }

  function openImageQrTool(event) {
    if (event) stopEvent(event);
    const { card } = openImageToolShell("QR Code");
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const hint = document.createElement("div");
      hint.className = "trem-local-tool-hint";
      hint.textContent = "A Caixota tenta ler o código no navegador e usa uma leitura online somente se necessário.";

      const result = document.createElement("div");
      result.className = "trem-image-result trem-qr-result";
      result.innerHTML = '<span class="trem-local-tool-hint">Clique em “Ler QR Code” para começar.</span>';

      const read = createPrimaryButton("Ler QR Code", async (button) => {
        await renderProcessing(button, async () => {
          const decoded = await decodeQrFromAsset(asset);
          renderQrResult(result, decoded);
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(read);
      card.append(hint, result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  async function decodeQrFromAsset(asset) {
    const local = await decodeQrLocally(asset.canvas);
    if (local) return { content: local, source: "Navegador" };

    const dataUrl = await prepareQrUploadDataUrl(asset.canvas);
    const response = await sendRuntimeMessage({ type: "DECODE_QR_IMAGE", dataUrl });
    const content = String(response?.result?.content || "").trim();
    if (!content) throw new Error("Nenhum QR Code foi reconhecido nesta imagem.");
    return { content, source: response?.result?.source || "Leitura online" };
  }

  async function decodeQrLocally(canvas) {
    if (typeof window.BarcodeDetector !== "function") return "";
    try {
      const formats = typeof window.BarcodeDetector.getSupportedFormats === "function"
        ? await window.BarcodeDetector.getSupportedFormats()
        : ["qr_code"];
      if (!formats.includes("qr_code")) return "";
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      for (const candidate of createQrCandidateCanvases(canvas)) {
        const results = await detector.detect(candidate);
        const value = String(results?.[0]?.rawValue || "").trim();
        if (value) return value;
      }
    } catch (_error) {
      return "";
    }
    return "";
  }

  function createQrCandidateCanvases(source) {
    const candidates = [source];
    const fit = fitWithin(source.width, source.height, 1600, 1600);
    if (fit.width !== source.width || fit.height !== source.height || Math.min(source.width, source.height) < 500) {
      const scale = Math.min(3, Math.max(1, 700 / Math.max(1, Math.min(source.width, source.height))));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(source.width * scale));
      canvas.height = Math.max(1, Math.round(source.height * scale));
      canvas.getContext("2d", { willReadFrequently: true }).drawImage(source, 0, 0, canvas.width, canvas.height);
      candidates.push(canvas);
    }

    const contrast = document.createElement("canvas");
    const size = fitWithin(source.width, source.height, 1200, 1200);
    contrast.width = size.width;
    contrast.height = size.height;
    const context = contrast.getContext("2d", { willReadFrequently: true });
    context.drawImage(source, 0, 0, contrast.width, contrast.height);
    const imageData = context.getImageData(0, 0, contrast.width, contrast.height);
    for (let index = 0; index < imageData.data.length; index += 4) {
      const luminance = imageData.data[index] * 0.2126 + imageData.data[index + 1] * 0.7152 + imageData.data[index + 2] * 0.0722;
      const value = luminance > 145 ? 255 : 0;
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
    }
    context.putImageData(imageData, 0, 0);
    candidates.push(contrast);
    return candidates;
  }

  async function prepareQrUploadDataUrl(source) {
    let size = fitWithin(source.width, source.height, 1200, 1200);
    let quality = 0.9;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (estimateDataUrlSize(dataUrl) < 980000) return dataUrl;
      size = { width: Math.max(240, Math.round(size.width * 0.78)), height: Math.max(240, Math.round(size.height * 0.78)) };
      quality = Math.max(0.62, quality - 0.08);
    }
    throw new Error("Não foi possível preparar a imagem para a leitura do QR Code.");
  }

  function renderQrResult(container, decoded) {
    container.innerHTML = "";
    const content = String(decoded.content || "").trim();
    const url = parseHttpUrl(content);

    const type = document.createElement("div");
    type.className = "trem-qr-type";
    type.textContent = url ? "Endereço encontrado" : "Texto encontrado";

    const output = document.createElement("button");
    output.type = "button";
    output.className = "trem-text-tool-output trem-qr-output";
    output.textContent = content;
    output.title = "Clique para copiar";
    output.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(content);
      output.dataset.copyStatus = copied ? "✓ Copiado" : "Falha ao copiar";
      setTimeout(() => delete output.dataset.copyStatus, 1100);
    });

    const source = document.createElement("div");
    source.className = "trem-local-tool-hint";
    source.textContent = `Leitura: ${decoded.source}`;

    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions trem-wrap-actions";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "trem-mini-button trem-mini-primary";
    copy.textContent = "Copiar";
    copy.addEventListener("click", async (event) => {
      stopEvent(event);
      const copied = await copyText(content);
      showCopyFeedback(copy, copied, "Copiar");
    });
    actions.appendChild(copy);
    if (url) {
      const open = document.createElement("button");
      open.type = "button";
      open.className = "trem-mini-button";
      open.textContent = "Abrir";
      open.addEventListener("click", (event) => {
        stopEvent(event);
        window.open(url.href, "_blank", "noopener,noreferrer");
      });
      actions.appendChild(open);
    }
    container.append(type, output, source, actions);
    positionRoot(ensureRoot());
  }

  function parseHttpUrl(value) {
    try {
      const url = new URL(String(value || "").trim());
      return /^https?:$/iu.test(url.protocol) ? url : null;
    } catch (_error) {
      return null;
    }
  }

  async function getCurrentImageAsset() {
    if (!currentImageContext?.srcUrl) throw new Error("Nenhuma imagem foi selecionada.");
    if (imageAssetCache.has(currentImageContext.srcUrl)) return imageAssetCache.get(currentImageContext.srcUrl);

    let payload = null;
    try {
      const response = await sendRuntimeMessage({ type: "FETCH_IMAGE_DATA", url: currentImageContext.srcUrl });
      payload = response?.result || response;
    } catch (_error) {
      payload = null;
    }

    let imageSource = payload?.dataUrl || currentImageContext.srcUrl;
    const image = await loadHtmlImage(imageSource);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);

    const asset = {
      srcUrl: currentImageContext.srcUrl,
      dataUrl: imageSource,
      image,
      canvas,
      width: canvas.width,
      height: canvas.height,
      contentType: currentImageContext.contentType || payload?.contentType || guessMimeFromUrl(currentImageContext.srcUrl),
      byteSize: currentImageContext.byteSize || payload?.size || estimateDataUrlSize(imageSource),
      filename: currentImageContext.filename || guessFilenameFromUrl(currentImageContext.srcUrl),
      alt: currentImageContext.alt || "",
      title: currentImageContext.title || ""
    };
    imageAssetCache.set(currentImageContext.srcUrl, asset);
    return asset;
  }

  function loadHtmlImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Não foi possível carregar essa imagem."));
      image.src = src;
    });
  }

  function guessFilenameFromUrl(url) {
    try {
      const parsed = new URL(url, location.href);
      const last = parsed.pathname.split("/").filter(Boolean).pop() || "imagem";
      const sanitized = decodeURIComponent(last).replace(/[#?].*$/, "").replace(/[^\w\-.]+/g, "-");
      return sanitized || "imagem";
    } catch (_error) {
      return "imagem";
    }
  }

  function guessMimeFromUrl(url) {
    const lower = String(url || "").toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".gif")) return "image/gif";
    if (lower.endsWith(".bmp")) return "image/bmp";
    return "image/jpeg";
  }

  function estimateDataUrlSize(dataUrl) {
    const base64 = String(dataUrl || "").split(",")[1] || "";
    return Math.max(0, Math.floor(base64.length * 3 / 4));
  }

  function createErrorCard(message) {
    const wrapper = document.createElement('div');
    wrapper.className = 'trem-error-card';
    const text = document.createElement('div');
    text.className = 'trem-error-text';
    text.textContent = message;
    wrapper.appendChild(text);
    return wrapper;
  }

  function openImageToolShell(title) {
    const root = createRoot();
    const card = document.createElement("div");
    card.className = "trem-text-tool-card trem-image-card";
    const heading = document.createElement("div");
    heading.className = "trem-local-tool-title";
    heading.textContent = activeToolLabel("images", title);
    card.appendChild(heading);
    root.appendChild(card);
    positionRoot(root);
    return { root, card };
  }

  function appendImageInfoSummary(card, asset) {
    const summary = document.createElement("div");
    summary.className = "trem-image-summary";
    const thumb = document.createElement("img");
    thumb.className = "trem-image-thumb";
    thumb.src = asset.dataUrl;
    thumb.alt = asset.alt || asset.filename;
    const meta = document.createElement("div");
    meta.className = "trem-image-summary-meta";
    meta.innerHTML = `<strong>${escapeHtml(asset.filename)}</strong><span>${asset.width} × ${asset.height} px</span>`;
    summary.append(thumb, meta);
    card.appendChild(summary);
  }

  function createInputField(labelText, input) {
    const wrapper = document.createElement("label");
    wrapper.className = "trem-image-field";
    const label = document.createElement("span");
    label.textContent = labelText;
    wrapper.append(label, input);
    return wrapper;
  }

  function createNumberInput(value, min = 1, step = 1) {
    const input = document.createElement("input");
    input.type = "number";
    input.className = "trem-local-tool-select trem-image-input";
    input.min = String(min);
    input.step = String(step);
    input.value = String(value);
    return input;
  }

  function createSelect(options, value) {
    const select = document.createElement("select");
    select.className = "trem-local-tool-select";
    for (const [optionValue, label] of options) {
      const option = document.createElement("option");
      option.value = optionValue;
      option.textContent = label;
      if (optionValue === value) option.selected = true;
      select.appendChild(option);
    }
    return select;
  }

  function createPrimaryButton(label, handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trem-mini-button trem-image-primary";
    button.textContent = label;
    button.addEventListener("click", (event) => { stopEvent(event); handler(button); });
    return button;
  }

  function createCheckbox(labelText, checked = false) {
    const label = document.createElement("label");
    label.className = "trem-image-check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;
    const text = document.createElement("span");
    text.textContent = labelText;
    label.append(input, text);
    return { label, input };
  }

  function createImageResultBox() {
    const result = document.createElement("div");
    result.className = "trem-image-result";
    result.innerHTML = '<span class="trem-local-tool-hint">Configure a ferramenta e clique no botão principal.</span>';
    return result;
  }

  function renderGeneratedImageResult(container, generated, downloadLabel = "Baixar") {
    container.innerHTML = "";
    const preview = document.createElement("img");
    preview.className = "trem-image-preview";
    preview.src = generated.url;
    preview.alt = generated.filename;
    const info = document.createElement("div");
    info.className = "trem-image-result-meta";
    info.innerHTML = `<strong>${escapeHtml(generated.filename)}</strong><span>${generated.width} × ${generated.height} px · ${formatBytes(generated.size)}</span>`;
    const actions = document.createElement("div");
    actions.className = "trem-local-tool-actions";
    const download = document.createElement("button");
    download.type = "button";
    download.className = "trem-mini-button";
    download.textContent = downloadLabel;
    download.addEventListener("click", async (event) => {
      stopEvent(event);
      downloadBlob(generated.blob, generated.filename);
    });
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "trem-mini-button";
    copy.textContent = "Copiar Link";
    copy.addEventListener("click", async (event) => {
      stopEvent(event);
      const success = await copyText(generated.url);
      showCopyFeedback(copy, success, "Copiar Link");
    });
    actions.append(download, copy);
    container.append(preview, info, actions);
  }

  async function renderProcessing(button, task) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Processando…";
    try {
      await task();
    } catch (error) {
      showTransientMessage(safeMessage(error));
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  function showTransientMessage(message) {
    const root = ensureRoot();
    const existing = root.querySelector('.trem-inline-notice');
    existing?.remove();
    const note = document.createElement('div');
    note.className = 'trem-inline-notice';
    note.textContent = message;
    root.appendChild(note);
    setTimeout(() => note.remove(), 2800);
  }

  function ensureExtension(filename, ext) {
    const base = filename.replace(/\.[a-z0-9]+$/i, '');
    return `${base}.${ext}`;
  }

  async function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Não foi possível exportar essa imagem.')), type, quality);
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function formatBytes(bytes) {
    const value = Number(bytes || 0);
    if (!Number.isFinite(value) || value <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = value;
    let index = 0;
    while (size >= 1024 && index < units.length - 1) { size /= 1024; index += 1; }
    return `${size.toFixed(size >= 100 || index === 0 ? 0 : 1)} ${units[index]}`;
  }

  function fitWithin(width, height, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
    return { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) };
  }

  async function generateTransformedImage(asset, options = {}) {
    const format = options.format || 'image/png';
    const quality = options.quality;
    const rotate = Number(options.rotate || 0);
    const flipX = Boolean(options.flipX);
    const flipY = Boolean(options.flipY);
    const targetWidth = Math.max(1, Math.round(options.width || asset.width));
    const targetHeight = Math.max(1, Math.round(options.height || asset.height));

    const canvas = document.createElement('canvas');
    const swap = Math.abs(rotate) % 180 === 90;
    canvas.width = swap ? targetHeight : targetWidth;
    canvas.height = swap ? targetWidth : targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotate * Math.PI / 180);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.drawImage(asset.canvas, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();

    const blob = await canvasToBlob(canvas, format, quality);
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
    const filename = ensureExtension(asset.filename, ext);
    return { blob, url: URL.createObjectURL(blob), filename, width: canvas.width, height: canvas.height, size: blob.size };
  }

  function openImageConvertTool() {
    const { card } = openImageToolShell('Converter');
    const result = createImageResultBox();
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const select = createSelect([['image/png','PNG'],['image/jpeg','JPEG'],['image/webp','WebP']], asset.contentType === 'image/png' ? 'image/jpeg' : 'image/png');
      const quality = createNumberInput(92, 10, 1);
      quality.max = '100';
      const qualityWrap = createInputField('Qualidade (JPEG/WebP)', quality);
      const controls = document.createElement('div');
      controls.className = 'trem-image-grid';
      controls.append(createInputField('Formato de saída', select), qualityWrap);
      card.appendChild(controls);
      const button = createPrimaryButton('Converter', async (btn) => {
        await renderProcessing(btn, async () => {
          const format = select.value;
          const generated = await generateTransformedImage(asset, { format, quality: Number(quality.value || 92) / 100 });
          renderGeneratedImageResult(result, generated);
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button);
      card.append(result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  function openImageCompressTool() {
    const { card } = openImageToolShell('Comprimir');
    const result = createImageResultBox();
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const format = createSelect([['image/jpeg','JPEG'],['image/webp','WebP']], asset.contentType === 'image/webp' ? 'image/webp' : 'image/jpeg');
      const quality = createNumberInput(78, 10, 1);
      quality.max = '100';
      const controls = document.createElement('div');
      controls.className = 'trem-image-grid';
      controls.append(createInputField('Formato', format), createInputField('Qualidade', quality));
      const hint = document.createElement('div');
      hint.className = 'trem-local-tool-hint';
      hint.textContent = `Tamanho original: ${formatBytes(asset.byteSize)}`;
      card.append(controls, hint);
      const button = createPrimaryButton('Comprimir', async (btn) => {
        await renderProcessing(btn, async () => {
          const generated = await generateTransformedImage(asset, { format: format.value, quality: Number(quality.value || 78) / 100 });
          renderGeneratedImageResult(result, generated, 'Baixar Arquivo');
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button);
      card.append(result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  function openImageResizeTool() {
    const { card } = openImageToolShell('Redimensionar');
    const result = createImageResultBox();
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const width = createNumberInput(asset.width, 1, 1);
      const height = createNumberInput(asset.height, 1, 1);
      const keepRatio = createCheckbox('Manter proporção', true);
      let changing = false;
      const syncFromWidth = () => {
        if (!keepRatio.input.checked || changing) return;
        changing = true;
        height.value = String(Math.max(1, Math.round((Number(width.value || 1) / asset.width) * asset.height)));
        changing = false;
      };
      const syncFromHeight = () => {
        if (!keepRatio.input.checked || changing) return;
        changing = true;
        width.value = String(Math.max(1, Math.round((Number(height.value || 1) / asset.height) * asset.width)));
        changing = false;
      };
      width.addEventListener('input', syncFromWidth);
      height.addEventListener('input', syncFromHeight);
      const controls = document.createElement('div');
      controls.className = 'trem-image-grid';
      controls.append(createInputField('Largura (px)', width), createInputField('Altura (px)', height));
      card.append(controls, keepRatio.label);
      const button = createPrimaryButton('Redimensionar', async (btn) => {
        await renderProcessing(btn, async () => {
          const generated = await generateTransformedImage(asset, { width: Number(width.value || asset.width), height: Number(height.value || asset.height), format: asset.contentType === 'image/png' ? 'image/png' : 'image/jpeg', quality: 0.92 });
          renderGeneratedImageResult(result, generated);
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button);
      card.append(result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  function openImageRotateTool() {
    const { card } = openImageToolShell('Girar');
    const result = createImageResultBox();
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const rotate = createSelect([['90','90°'],['180','180°'],['270','270°']], '90');
      const flipX = createCheckbox('Espelhar horizontalmente', false);
      const controls = document.createElement('div');
      controls.className = 'trem-image-grid';
      controls.append(createInputField('Rotação', rotate));
      card.append(controls, flipX.label);
      const button = createPrimaryButton('Aplicar', async (btn) => {
        await renderProcessing(btn, async () => {
          const generated = await generateTransformedImage(asset, { rotate: Number(rotate.value || 90), flipX: flipX.input.checked, format: asset.contentType === 'image/png' ? 'image/png' : 'image/jpeg', quality: 0.92 });
          renderGeneratedImageResult(result, generated);
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button);
      card.append(result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  function openImagePdfTool() {
    const { card } = openImageToolShell('PDF');
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const hint = document.createElement('div');
      hint.className = 'trem-local-tool-hint';
      hint.textContent = 'A imagem será ajustada automaticamente em uma página A4.';
      card.appendChild(hint);
      const result = createImageResultBox();
      const button = createPrimaryButton('Gerar PDF', async (btn) => {
        await renderProcessing(btn, async () => {
          const pdfBlob = await createPdfFromImageAsset(asset);
          const generated = { blob: pdfBlob, url: URL.createObjectURL(pdfBlob), filename: ensureExtension(asset.filename, 'pdf'), width: asset.width, height: asset.height, size: pdfBlob.size };
          result.innerHTML = '';
          const info = document.createElement('div');
          info.className = 'trem-image-result-meta';
          info.innerHTML = `<strong>${escapeHtml(generated.filename)}</strong><span>${formatBytes(generated.size)}</span>`;
          const actions = document.createElement('div');
          actions.className = 'trem-local-tool-actions';
          const download = document.createElement('button');
          download.type = 'button';
          download.className = 'trem-mini-button';
          download.textContent = 'Baixar PDF';
          download.addEventListener('click', (event) => { stopEvent(event); downloadBlob(generated.blob, generated.filename); });
          actions.append(download);
          result.append(info, actions);
        });
      });
      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button);
      card.append(result, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  async function createPdfFromImageAsset(asset) {
    const fit = fitWithin(asset.width, asset.height, 1600, 1600);
    const jpeg = await generateTransformedImage(asset, { width: fit.width, height: fit.height, format: 'image/jpeg', quality: 0.92 });
    const arrayBuffer = await jpeg.blob.arrayBuffer();
    return createSimplePdfBlob(new Uint8Array(arrayBuffer), fit.width, fit.height);
  }

  function createSimplePdfBlob(jpegBytes, imageWidth, imageHeight) {
    const portrait = { width: 595.28, height: 841.89 };
    const landscape = { width: 841.89, height: 595.28 };
    const page = imageWidth > imageHeight ? landscape : portrait;
    const margin = 24;
    const fit = fitWithin(imageWidth, imageHeight, page.width - margin * 2, page.height - margin * 2);
    const drawX = ((page.width - fit.width) / 2).toFixed(2);
    const drawY = ((page.height - fit.height) / 2).toFixed(2);
    const stream = `q
${fit.width.toFixed(2)} 0 0 ${fit.height.toFixed(2)} ${drawX} ${drawY} cm
/Im0 Do
Q`;
    const enc = new TextEncoder();
    const objects = [];
    objects.push(enc.encode(`1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
`));
    objects.push(enc.encode(`2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
`));
    objects.push(enc.encode(`3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.width.toFixed(2)} ${page.height.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>
endobj
`));
    const imageHeader = enc.encode(`4 0 obj
<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>
stream
`);
    const imageFooter = enc.encode(`
endstream
endobj
`);
    objects.push({ header: imageHeader, bytes: jpegBytes, footer: imageFooter });
    const streamBytes = enc.encode(stream);
    objects.push(enc.encode(`5 0 obj
<< /Length ${streamBytes.length} >>
stream
${stream}
endstream
endobj
`));

    const chunks = [enc.encode(`%PDF-1.4
`)];
    const offsets = [0];
    let position = chunks[0].length;
    for (const object of objects) {
      offsets.push(position);
      if (object instanceof Uint8Array) {
        chunks.push(object);
        position += object.length;
      } else {
        chunks.push(object.header, object.bytes, object.footer);
        position += object.header.length + object.bytes.length + object.footer.length;
      }
    }
    const xrefOffset = position;
    let xref = `xref
0 ${objects.length + 1}
0000000000 65535 f 
`;
    for (let index = 1; index < offsets.length; index += 1) xref += `${String(offsets[index]).padStart(10, '0')} 00000 n 
`;
    xref += `trailer
<< /Size ${objects.length + 1} /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF`;
    chunks.push(enc.encode(xref));
    return new Blob(chunks, { type: 'application/pdf' });
  }

  function openImageInfoTool() {
    const { card } = openImageToolShell('Informações');
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const grid = document.createElement('div');
      grid.className = 'trem-counter-grid';
      const ratio = simplifyRatio(asset.width, asset.height);
      const items = [
        ['Formato', mimeLabel(asset.contentType)],
        ['Dimensões', `${asset.width} × ${asset.height}`],
        ['Proporção', ratio],
        ['Tamanho', formatBytes(asset.byteSize)],
        ['Arquivo', asset.filename],
        ['Texto alternativo', asset.alt || 'Sem alt']
      ];
      for (const [label, value] of items) {
        const metric = document.createElement('button');
        metric.type = 'button';
        metric.className = 'trem-counter-metric';
        metric.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
        metric.addEventListener('click', async (event) => { stopEvent(event); const ok = await copyText(String(value)); if (ok) { metric.dataset.copyStatus = 'Copiado'; setTimeout(() => delete metric.dataset.copyStatus, 1200); } });
        grid.appendChild(metric);
      }
      card.append(grid, createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  function mimeLabel(type) {
    if (type === 'image/png') return 'PNG';
    if (type === 'image/webp') return 'WebP';
    if (type === 'image/gif') return 'GIF';
    if (type === 'image/bmp') return 'BMP';
    return 'JPEG';
  }

  function simplifyRatio(width, height) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const div = gcd(width, height) || 1;
    return `${Math.round(width / div)}:${Math.round(height / div)}`;
  }


function openImagePaletteTool() {
  const { card } = openImageToolShell('Cores');
  getCurrentImageAsset().then((asset) => {
    appendImageInfoSummary(card, asset);

    const hint = document.createElement('div');
    hint.className = 'trem-local-tool-hint';
    hint.textContent = 'A paleta usa cores reais dos pixels e agrupa somente tons visualmente muito próximos.';

    const palette = extractPalette(asset.canvas, 6);
    const wrap = document.createElement('div');
    wrap.className = 'trem-palette-grid';
    for (const swatch of palette) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trem-color-swatch';
      button.style.setProperty('--swatch', swatch.hex);
      button.innerHTML = `<span class="trem-swatch-color" aria-hidden="true"></span><span class="trem-swatch-info"><strong>${swatch.hex}</strong><small>${swatch.rgb}</small><em>${swatch.percentage}% da amostra</em></span>`;
      button.addEventListener('click', async (event) => {
        stopEvent(event);
        const ok = await copyText(swatch.hex);
        button.dataset.copyStatus = ok ? 'Copiado' : 'Falha';
        button.classList.toggle('trem-copy-success', ok);
        setTimeout(() => {
          if (!button.isConnected) return;
          delete button.dataset.copyStatus;
          button.classList.remove('trem-copy-success');
        }, 1100);
      });
      wrap.appendChild(button);
    }

    const eyedropper = createImageEyedropper(asset);
    const savedPalettes = createSavedPaletteSection(palette, asset.filename);
    card.append(hint, wrap, savedPalettes, eyedropper, createLocalToolActions(() => renderImageActionMenu()));
    positionRoot(ensureRoot());
  }).catch((error) => {
    card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
    positionRoot(ensureRoot());
  });
}

function createImageEyedropper(asset) {
  const section = document.createElement('section');
  section.className = 'trem-eyedropper';

  const header = document.createElement('div');
  header.className = 'trem-eyedropper-heading';
  const title = document.createElement('div');
  title.innerHTML = '<strong><span class="trem-eyedropper-title-icon" aria-hidden="true">⌖</span> Conta-Gotas</strong><span>Clique em um ponto da imagem para capturar a cor exata.</span>';
  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'trem-eyedropper-expand';
  expand.setAttribute('aria-expanded', 'false');
  expand.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6.2 2.5H2.5v3.7M9.8 2.5h3.7v3.7M13.5 9.8v3.7H9.8M6.2 13.5H2.5V9.8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.35"/></svg><span>Expandir</span>';
  header.append(title, expand);

  const preview = document.createElement('canvas');
  preview.className = 'trem-eyedropper-canvas';
  preview.setAttribute('aria-label', 'Imagem para selecionar uma cor com o conta-gotas');

  const result = document.createElement('button');
  result.type = 'button';
  result.className = 'trem-eyedropper-result';
  result.innerHTML = '<span class="trem-eyedropper-color"></span><span><strong>Selecione uma cor</strong><small>HEX e RGB aparecerão aqui</small></span>';

  let selectedHex = '';
  let selectedPoint = null;
  let expanded = false;
  const drawPreview = () => {
    const fit = fitWithin(asset.width, asset.height, expanded ? 780 : 360, expanded ? 500 : 210);
    preview.width = fit.width;
    preview.height = fit.height;
    const context = preview.getContext('2d');
    context.drawImage(asset.canvas, 0, 0, preview.width, preview.height);
    if (!selectedPoint) return;
    const markerX = (selectedPoint.x / asset.width) * preview.width;
    const markerY = (selectedPoint.y / asset.height) * preview.height;
    context.beginPath();
    context.arc(markerX, markerY, expanded ? 8 : 6, 0, Math.PI * 2);
    context.lineWidth = expanded ? 3 : 2;
    context.strokeStyle = '#ffffff';
    context.stroke();
    context.beginPath();
    context.arc(markerX, markerY, expanded ? 11 : 9, 0, Math.PI * 2);
    context.lineWidth = 1.5;
    context.strokeStyle = '#111111';
    context.stroke();
  };
  drawPreview();

  expand.addEventListener('click', (event) => {
    stopEvent(event);
    expanded = !expanded;
    section.classList.toggle('is-expanded', expanded);
    const root = section.closest(`#${ROOT_ID}`);
    root?.classList.toggle('trem-eyedropper-expanded', expanded);
    expand.setAttribute('aria-expanded', String(expanded));
    expand.querySelector('span').textContent = expanded ? 'Reduzir' : 'Expandir';
    drawPreview();
    positionRoot(root);
  });

  preview.addEventListener('click', (event) => {
    stopEvent(event);
    const rect = preview.getBoundingClientRect();
    const x = Math.max(0, Math.min(asset.width - 1, Math.floor(((event.clientX - rect.left) / rect.width) * asset.width)));
    const y = Math.max(0, Math.min(asset.height - 1, Math.floor(((event.clientY - rect.top) / rect.height) * asset.height)));
    const pixel = asset.canvas.getContext('2d', { willReadFrequently: true }).getImageData(x, y, 1, 1).data;
    const [r, g, b] = pixel;
    selectedPoint = { x, y };
    selectedHex = rgbToHex(r, g, b);
    drawPreview();
    result.style.setProperty('--picked-color', selectedHex);
    result.innerHTML = `<span class="trem-eyedropper-color"></span><span><strong>${selectedHex}</strong><small>rgb(${r}, ${g}, ${b}) · posição ${x}, ${y}</small></span>`;
  });

  result.addEventListener('click', async (event) => {
    stopEvent(event);
    if (!selectedHex) return;
    const ok = await copyText(selectedHex);
    result.dataset.copyStatus = ok ? 'Copiado' : 'Falha';
    setTimeout(() => delete result.dataset.copyStatus, 1000);
  });

  section.append(header, preview, result);
  return section;
}

function createSavedPaletteSection(currentPalette, filename) {
  const section = document.createElement('section');
  section.className = 'trem-saved-palettes';
  const heading = document.createElement('div');
  heading.className = 'trem-saved-palettes-heading';
  heading.innerHTML = '<div><strong>Paletas Salvas</strong><span>Guarde esta combinação para consultar depois.</span></div>';
  const form = document.createElement('div');
  form.className = 'trem-palette-save-form';
  const name = document.createElement('input');
  name.type = 'text';
  name.className = 'trem-local-tool-select';
  name.maxLength = 40;
  name.placeholder = 'Nome da paleta';
  name.value = paletteNameFromFilename(filename);
  const save = document.createElement('button');
  save.type = 'button';
  save.className = 'trem-mini-button trem-mini-primary';
  save.textContent = 'Salvar Paleta';
  form.append(name, save);
  const status = document.createElement('div');
  status.className = 'trem-palette-save-status';
  status.setAttribute('role', 'status');
  const list = document.createElement('div');
  list.className = 'trem-saved-palette-list';
  section.append(heading, form, status, list);

  let palettes = [];
  const render = () => {
    list.replaceChildren();
    if (!palettes.length) {
      const empty = document.createElement('span');
      empty.className = 'trem-saved-palette-empty';
      empty.textContent = 'Nenhuma paleta salva.';
      list.appendChild(empty);
      positionRoot(ensureRoot());
      return;
    }
    for (const palette of palettes) {
      const row = document.createElement('article');
      row.className = 'trem-saved-palette-item';
      const meta = document.createElement('div');
      meta.className = 'trem-saved-palette-meta';
      const label = document.createElement('strong');
      label.textContent = palette.name;
      const colors = document.createElement('div');
      colors.className = 'trem-saved-palette-colors';
      for (const hex of palette.colors) {
        const chip = document.createElement('span');
        chip.style.setProperty('--palette-chip', hex);
        chip.title = hex;
        colors.appendChild(chip);
      }
      meta.append(label, colors);
      const actions = document.createElement('div');
      actions.className = 'trem-saved-palette-actions';
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'trem-vault-action';
      copy.textContent = 'Copiar';
      copy.addEventListener('click', async (event) => {
        stopEvent(event);
        const ok = await copyText(palette.colors.join(', '));
        showCopyFeedback(copy, ok, 'Copiar');
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'trem-vault-action trem-vault-delete';
      remove.textContent = 'Excluir';
      remove.addEventListener('click', async (event) => {
        stopEvent(event);
        if (!confirm(`Excluir a paleta “${palette.name}”?`)) return;
        palettes = palettes.filter((item) => item.id !== palette.id);
        await chrome.storage.local.set({ [SAVED_PALETTES_KEY]: palettes });
        status.textContent = 'Paleta excluída.';
        render();
      });
      actions.append(copy, remove);
      row.append(meta, actions);
      list.appendChild(row);
    }
    positionRoot(ensureRoot());
  };

  chrome.storage.local.get(SAVED_PALETTES_KEY).then((stored) => {
    palettes = normalizeSavedPalettes(stored[SAVED_PALETTES_KEY]);
    render();
  }).catch(() => {
    status.textContent = 'Não foi possível carregar as paletas salvas.';
    status.classList.add('is-error');
  });

  save.addEventListener('click', async (event) => {
    stopEvent(event);
    const cleanName = name.value.trim().slice(0, 40);
    if (!cleanName) {
      status.textContent = 'Dê um nome à paleta.';
      status.classList.add('is-error');
      name.focus();
      return;
    }
    if (palettes.length >= 30) {
      status.textContent = 'O limite é de 30 paletas salvas.';
      status.classList.add('is-error');
      return;
    }
    const now = Date.now();
    palettes.unshift({
      id: crypto.randomUUID?.() || `palette-${now}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      colors: currentPalette.map((swatch) => swatch.hex).slice(0, 8),
      createdAt: now
    });
    await chrome.storage.local.set({ [SAVED_PALETTES_KEY]: palettes });
    status.textContent = `Paleta “${cleanName}” salva.`;
    status.classList.remove('is-error');
    render();
  });

  return section;
}

function normalizeSavedPalettes(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.map((palette) => {
    const id = String(palette?.id || '').trim();
    const name = String(palette?.name || '').trim().slice(0, 40);
    const colors = Array.isArray(palette?.colors)
      ? palette.colors.map((color) => normalizeHexColor(color, '')).filter(Boolean).slice(0, 8)
      : [];
    if (!id || !name || !colors.length || seen.has(id)) return null;
    seen.add(id);
    return { id, name, colors, createdAt: Number(palette.createdAt) || Date.now() };
  }).filter(Boolean).slice(0, 30);
}

function paletteNameFromFilename(filename) {
  const base = String(filename || 'Imagem').replace(/\.[a-z0-9]{2,5}$/i, '').trim().slice(0, 28);
  return `Paleta · ${base || 'Imagem'}`;
}

function extractPalette(canvas, limit = 6) {
  const sample = document.createElement('canvas');
  const fit = fitWithin(canvas.width, canvas.height, 160, 160);
  sample.width = fit.width;
  sample.height = fit.height;
  const context = sample.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = false;
  context.drawImage(canvas, 0, 0, fit.width, fit.height);

  const pixels = context.getImageData(0, 0, fit.width, fit.height).data;
  const histogram = new Map();
  let total = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 180) continue;
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const key = `${r},${g},${b}`;
    histogram.set(key, (histogram.get(key) || 0) + 1);
    total += 1;
  }

  const exactColors = [...histogram.entries()]
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { r, g, b, count };
    })
    .sort((a, b) => b.count - a.count);

  const clusters = [];
  for (const color of exactColors) {
    let nearest = null;
    let nearestDistance = Infinity;
    for (const cluster of clusters) {
      const distance = colorDistance(color, cluster.representative);
      if (distance < nearestDistance) {
        nearest = cluster;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance <= 28) {
      nearest.total += color.count;
      if (color.count > nearest.representative.count) nearest.representative = color;
    } else {
      clusters.push({ representative: color, total: color.count });
    }
  }

  const minimumShare = total ? Math.max(2, Math.round(total * 0.0015)) : 1;
  const selected = [];
  for (const cluster of clusters.sort((a, b) => b.total - a.total)) {
    if (cluster.total < minimumShare && selected.length >= 3) continue;
    if (selected.some((item) => colorDistance(item.representative, cluster.representative) < 42)) continue;
    selected.push(cluster);
    if (selected.length >= limit) break;
  }

  if (!selected.length && exactColors.length) selected.push({ representative: exactColors[0], total: exactColors[0].count });

  return selected.map((cluster) => {
    const { r, g, b } = cluster.representative;
    return {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      percentage: total ? Math.max(0.1, (cluster.total / total) * 100).toFixed(1).replace('.0', '') : '0'
    };
  });
}

function colorDistance(first, second) {
  const redMean = (first.r + second.r) / 2;
  const red = first.r - second.r;
  const green = first.g - second.g;
  const blue = first.b - second.b;
  return Math.sqrt((2 + redMean / 256) * red * red + 4 * green * green + (2 + (255 - redMean) / 256) * blue * blue);
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

  function openImageTextTool() {
    const { card } = openImageToolShell('Texto');
    getCurrentImageAsset().then((asset) => {
      appendImageInfoSummary(card, asset);
      const hint = document.createElement('div');
      hint.className = 'trem-local-tool-hint';
      hint.textContent = 'A Caixota tenta o OCR nativo e, se ele não existir, usa o serviço OCR.Space.';

      const privacy = document.createElement('div');
      privacy.className = 'trem-image-privacy-note';
      privacy.textContent = 'No modo online, uma cópia reduzida da imagem é enviada ao serviço de OCR para reconhecimento.';

      const status = document.createElement('div');
      status.className = 'trem-image-ocr-status';
      status.textContent = 'Pronto para analisar.';

      const output = document.createElement('button');
      output.type = 'button';
      output.className = 'trem-text-tool-output';
      output.textContent = 'Clique em “Extrair” para reconhecer o texto da imagem.';
      output.addEventListener('click', async (event) => {
        stopEvent(event);
        if (!output.dataset.value) return;
        const ok = await copyText(output.dataset.value);
        const original = output.textContent;
        showCopyFeedback(output, ok, original);
      });

      let originalText = '';
      let translatedText = '';
      let showingTranslation = false;

      const button = createPrimaryButton('Extrair', async (btn) => {
        await renderProcessing(btn, async () => {
          status.textContent = 'Preparando a imagem…';
          let recognizedText = '';
          let source = '';

          if (typeof window.TextDetector === 'function') {
            try {
              status.textContent = 'Tentando OCR nativo…';
              const detector = new window.TextDetector();
              const blocks = await detector.detect(asset.canvas);
              recognizedText = blocks.map((block) => block.rawValue || block.text || '').filter(Boolean).join('\n').trim();
              if (recognizedText) source = 'OCR nativo';
            } catch (_error) {
              recognizedText = '';
            }
          }

          if (!recognizedText) {
            status.textContent = 'Analisando online…';
            const prepared = await prepareOcrImage(asset.canvas);
            const response = await sendRuntimeMessage({
              type: 'OCR_IMAGE',
              dataUrl: prepared.dataUrl,
              language: settings.ocrLanguage || 'auto',
              apiKey: settings.ocrApiKey || 'helloworld'
            });
            recognizedText = String(response?.result?.text || '').trim();
            source = response?.result?.source || 'OCR online';
          }

          if (!recognizedText) throw new Error('Nenhum texto foi reconhecido nesta imagem.');
          originalText = recognizedText;
          translatedText = '';
          showingTranslation = false;
          output.textContent = recognizedText;
          output.dataset.value = recognizedText;
          translateButton.disabled = false;
          translateButton.textContent = 'Traduzir Texto';
          status.textContent = `Concluído com ${source}. Clique no texto para copiar.`;
        });
      });

      const translateButton = createPrimaryButton('Traduzir Texto', async (btn) => {
        if (!originalText) return;
        if (translatedText) {
          showingTranslation = !showingTranslation;
          output.textContent = showingTranslation ? translatedText : originalText;
          output.dataset.value = output.textContent;
          btn.textContent = showingTranslation ? 'Ver Original' : 'Ver Tradução';
          status.textContent = showingTranslation ? 'Exibindo a tradução.' : 'Exibindo o texto extraído original.';
          positionRoot(ensureRoot());
          return;
        }
        if (originalText.length > 5000) {
          showTransientMessage('O texto extraído precisa ter até 5.000 caracteres para traduzir.');
          return;
        }
        await renderProcessing(btn, async () => {
          status.textContent = 'Traduzindo o texto extraído…';
          const response = await sendRuntimeMessage({ type: 'TRANSLATE_TEXT', text: originalText });
          if (!response?.ok) throw new Error(response?.error || 'Não foi possível traduzir o texto da imagem.');
          translatedText = String(response.result?.translation || '').trim();
          if (!translatedText) throw new Error('A tradução não retornou texto.');
          showingTranslation = true;
          output.textContent = translatedText;
          output.dataset.value = translatedText;
          status.textContent = 'Texto traduzido. Clique no resultado para copiar.';
        });
        btn.textContent = 'Ver Original';
      });
      translateButton.disabled = true;

      const actions = createLocalToolActions(() => renderImageActionMenu());
      actions.prepend(button, translateButton);
      card.append(hint, privacy, status, output, actions);
      positionRoot(ensureRoot());
    }).catch((error) => {
      card.append(createErrorCard(safeMessage(error)), createLocalToolActions(() => renderImageActionMenu()));
      positionRoot(ensureRoot());
    });
  }

  async function prepareOcrImage(canvas) {
    const maximum = fitWithin(canvas.width, canvas.height, 1700, 1700);
    let width = maximum.width;
    let height = maximum.height;
    let quality = 0.86;
    let dataUrl = '';

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const output = document.createElement('canvas');
      output.width = width;
      output.height = height;
      const context = output.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(canvas, 0, 0, width, height);
      dataUrl = output.toDataURL('image/jpeg', quality);
      if (estimateDataUrlSize(dataUrl) < 900000) break;
      quality = Math.max(0.55, quality - 0.08);
      width = Math.max(1, Math.round(width * 0.84));
      height = Math.max(1, Math.round(height * 0.84));
    }

    if (!dataUrl) throw new Error('Não foi possível preparar a imagem para OCR.');
    return { dataUrl, width, height };
  }

  function normalizeHexColor(value, fallback) {
    const text = String(value || '').trim();
    return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
  }

  function hexToRgb(hex) {
    const normalized = normalizeHexColor(hex, '#000000').slice(1);
    return { r: parseInt(normalized.slice(0, 2), 16), g: parseInt(normalized.slice(2, 4), 16), b: parseInt(normalized.slice(4, 6), 16) };
  }

  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const values = [r, g, b].map((value) => {
      const channel = value / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
  }

  function contrastRatio(first, second) {
    const brighter = Math.max(relativeLuminance(first), relativeLuminance(second));
    const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
    return (brighter + 0.05) / (darker + 0.05);
  }

  function readableColorFor(background) {
    return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background) ? '#000000' : '#ffffff';
  }

  function ensureReadableColor(color, background, minimum = 4.5) {
    const normalized = normalizeHexColor(color, readableColorFor(background));
    return contrastRatio(normalized, background) >= minimum ? normalized : readableColorFor(background);
  }

  function mixHex(first, second, ratio) {
    const a = hexToRgb(first);
    const b = hexToRgb(second);
    const mix = (x, y) => Math.round(x + (y - x) * ratio).toString(16).padStart(2, '0');
    return `#${mix(a.r,b.r)}${mix(a.g,b.g)}${mix(a.b,b.b)}`;
  }

  function fontStackForCurrentSettings() {
    if (settings.fontFamily === "trebuchet") return '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
    if (settings.fontFamily === "arial") return 'Arial, Helvetica, sans-serif';
    if (settings.fontFamily === "georgia") return 'Georgia, "Times New Roman", serif';
    if (settings.fontFamily === "courier") return '"Courier New", Courier, monospace';
    if (settings.fontFamily === "custom" && settings.customFontData) return '"Caixota Custom", Roboto, "Segoe UI", Arial, sans-serif';
    return 'Roboto, "Segoe UI", Arial, Helvetica, sans-serif';
  }

  function applyFontSettings(root) {
    if (!root) return;
    root.style.setProperty("--trem-font-family", fontStackForCurrentSettings());
    root.style.setProperty("--trem-font-size", `${15 * settings.typographyScale}px`);
    root.style.setProperty("--trem-letter-spacing", `${settings.typographyLetterSpacing}em`);
    root.style.setProperty("--trem-line-height", String(settings.typographyLineHeight));
    root.style.setProperty("--trem-title-scale", String(settings.typographyTitleScale));
    root.style.setProperty("--trem-subtitle-scale", String(settings.typographySubtitleScale));
    root.style.setProperty("--trem-small-scale", String(settings.typographySmallScale));
    root.style.setProperty("--trem-title-letter-spacing", `${settings.typographyTitleLetterSpacing}em`);
    root.style.setProperty("--trem-subtitle-letter-spacing", `${settings.typographySubtitleLetterSpacing}em`);
    root.style.setProperty("--trem-small-letter-spacing", `${settings.typographySmallLetterSpacing}em`);
    if (settings.fontFamily === "custom" && settings.customFontData) {
      loadCustomFont(settings.customFontData)
        .then(() => {
          if (root.isConnected) positionRoot(root);
        })
        .catch(() => {});
    }
  }

  async function loadCustomFont(data) {
    if (!data || loadedCustomFontData === data) return;
    if (typeof FontFace !== "function" || !document.fonts) return;
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const face = new FontFace("Caixota Custom", bytes.buffer);
    await face.load();
    if (loadedCustomFontFace && typeof document.fonts.delete === "function") document.fonts.delete(loadedCustomFontFace);
    document.fonts.add(face);
    loadedCustomFontFace = face;
    loadedCustomFontData = data;
  }

  function applyCustomThemeVariables(root) {
    if (!root || settings.theme !== 'custom') return;
    const background = normalizeHexColor(settings.customThemeBackground, '#1c1f26');
    const surface = normalizeHexColor(settings.customThemeSurface, '#252a33');
    const accent = normalizeHexColor(settings.customThemeAccent, '#9b5d58');
    const text = normalizeHexColor(settings.customThemeText, '#f7f8fa');
    const surfaceText = text;
    const muted = normalizeHexColor(settings.customThemeMuted, '#a8afb9');
    const surfaceMuted = muted;
    const lightSurface = relativeLuminance(surface) > 0.42;
    const border = lightSurface ? mixHex(surface, '#000000', 0.22) : mixHex(surface, '#ffffff', 0.2);
    const hover = lightSurface ? mixHex(surface, '#000000', 0.08) : mixHex(surface, '#ffffff', 0.1);
    const accentText = normalizeHexColor(settings.customThemeAccentText, '#ffffff');
    const title = normalizeHexColor(settings.customThemeTitle, text);
    const subtitle = normalizeHexColor(settings.customThemeSubtitle, muted);
    root.style.setProperty('--trem-custom-background', background);
    root.style.setProperty('--trem-custom-surface', surface);
    root.style.setProperty('--trem-custom-accent', accent);
    root.style.setProperty('--trem-custom-text', text);
    root.style.setProperty('--trem-custom-muted', muted);
    root.style.setProperty('--trem-custom-surface-text', surfaceText);
    root.style.setProperty('--trem-custom-surface-muted', surfaceMuted);
    root.style.setProperty('--trem-custom-border', border);
    root.style.setProperty('--trem-custom-hover', hover);
    root.style.setProperty('--trem-custom-accent-text', accentText);
    root.style.setProperty('--trem-custom-title', title);
    root.style.setProperty('--trem-custom-subtitle', subtitle);
    root.style.setProperty('--trem-custom-radius', `${settings.customThemeRadius}px`);
    root.style.setProperty('--trem-custom-border-width', `${settings.customThemeBorderWidth}px`);
    const shadows = {
      none: 'none',
      soft: '0 18px 48px rgba(0,0,0,.24)',
      strong: '0 26px 68px rgba(0,0,0,.42)',
      retro: `6px 6px 0 ${mixHex(accent, background, .38)}`
    };
    root.style.setProperty('--trem-custom-shadow', shadows[settings.customThemeShadow] || shadows.soft);
  }

  function activateTextResultMode() {
    if (activeMenuMode === "text" || activeMenuMode === "text-result") {
      activeMenuMode = "text-result";
      const root = document.getElementById(ROOT_ID);
      if (root) root.dataset.mode = "text-result";
    }
  }

  function createRoot() {
    removeRootElement();

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.dataset.theme = settings.theme;
    root.dataset.mode = activeMenuMode;
    root.dataset.context = activeMenuMode.startsWith("image") ? "image" : (activeMenuMode === "video" ? "video" : (activeMenuMode === "page" ? "page" : "text"));
    root.dataset.effects = settings.visualEffectsEnabled ? "on" : "off";
    if (activeInvokedTool?.id) root.dataset.activeTool = activeInvokedTool.id;
    if (settings.theme === "custom") {
      root.dataset.customButton = settings.customThemeButtonStyle;
      root.dataset.customField = settings.customThemeFieldStyle;
      root.dataset.customPattern = settings.customThemePattern;
    }
    applyFontSettings(root);
    applyCustomThemeVariables(root);
    root.addEventListener("mousedown", (event) => event.stopPropagation());
    document.documentElement.appendChild(root);
    return root;
  }

  function ensureRoot() {
    return document.getElementById(ROOT_ID) || createRoot();
  }

  function positionRoot(root) {
    if (!root || !selectionRect) return;

    const isFirstPosition = root.dataset.positioned !== "true";
    if (isFirstPosition) {
      root.style.visibility = "hidden";
      root.style.left = "0px";
      root.style.top = "0px";
    }

    requestAnimationFrame(() => {
      if (!root.isConnected || !selectionRect) return;

      const bounds = root.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportLeft = Number(viewport?.offsetLeft || 0);
      const viewportTop = Number(viewport?.offsetTop || 0);
      const viewportWidth = Number(viewport?.width || window.innerWidth);
      const viewportHeight = Number(viewport?.height || window.innerHeight);
      const viewportRight = viewportLeft + viewportWidth;
      const viewportBottom = viewportTop + viewportHeight;
      const margin = 10;
      const gap = 9;

      let left;
      let top;

      if (["image", "video", "page", "text", "text-result"].includes(root.dataset.mode)) {
        // As janelas completas de texto e imagem abrem no centro da tela.
        // O botão rápido de seleção continua preso ao trecho selecionado.
        left = Math.max(viewportLeft + margin, viewportLeft + (viewportWidth - bounds.width) / 2);
        top = Math.max(viewportTop + margin, viewportTop + (viewportHeight - bounds.height) / 2);
        left = Math.min(left, Math.max(viewportLeft + margin, viewportRight - bounds.width - margin));
        top = Math.min(top, Math.max(viewportTop + margin, viewportBottom - bounds.height - margin));
      } else {
        left = selectionRect.left + selectionRect.width / 2 - bounds.width / 2;
        left = Math.max(viewportLeft + margin, Math.min(left, viewportRight - bounds.width - margin));

        top = selectionRect.top - bounds.height - gap;
        if (top < viewportTop + margin) top = selectionRect.bottom + gap;
        top = Math.max(viewportTop + margin, Math.min(top, viewportBottom - bounds.height - margin));
      }

      root.style.left = `${Math.round(left)}px`;
      root.style.top = `${Math.round(top)}px`;
      root.style.visibility = "visible";
      root.dataset.positioned = "true";
    });
  }

  function onDocumentMouseDown(event) {
    const root = document.getElementById(ROOT_ID);
    pointerDownStartedInside = Boolean(root && root.contains(event.target));
  }

  function removePanel() {
    clearTimeout(closeTimer);
    closeTimer = 0;
    operationToken += 1;
    pointerDownStartedInside = false;
    currentImageContext = null;
    currentVideoContext = null;
    activeMenuMode = "text";
    hideToolTooltip();
    stopSpeechPlayback();
    removeRootElement();
  }

  function removeRootElement() {
    clearTimeout(closeTimer);
    closeTimer = 0;
    document.getElementById(ROOT_ID)?.remove();
  }

  function closePanelWithMotion() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (root.dataset.effects !== "on" || reduceMotion) {
      removePanel();
      return;
    }

    operationToken += 1;
    hideToolTooltip();
    stopSpeechPlayback();
    root.classList.add("is-closing");
    root.style.pointerEvents = "none";
    const closingRoot = root;
    clearTimeout(closeTimer);
    closeTimer = window.setTimeout(() => {
      if (document.getElementById(ROOT_ID) === closingRoot) removePanel();
    }, 130);
  }

  function getUsefulRect(range) {
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width || rect.height);
    return rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
  }

  function parseMoney(raw, dollarSymbolCurrency = "USD") {
    const text = String(raw || "").replace(/\u00a0/g, " ").trim();
    const prefix = new RegExp(`^\\s*(${CURRENCY_PATTERN})\\s*([+-]?[0-9][0-9\\s.,']*)\\s*$`, "i");
    const suffix = new RegExp(`^\\s*([+-]?[0-9][0-9\\s.,']*)\\s*(${CURRENCY_PATTERN})\\s*$`, "i");

    let match = text.match(prefix);
    let token;
    let numeric;

    if (match) {
      token = match[1];
      numeric = match[2];
    } else {
      match = text.match(suffix);
      if (!match) return null;
      numeric = match[1];
      token = match[2];
    }

    const rawToken = String(token || "").trim();
    const normalizedToken = normalizeCurrencyToken(rawToken);
    const currency = rawToken === "$"
      ? dollarSymbolCurrency
      : (/^[A-Z]{3}$/.test(normalizedToken) ? normalizedToken : CURRENCY_ALIAS_LOOKUP.get(normalizedToken));
    const amount = parseLocalizedNumber(numeric);

    if (!currency || !Number.isFinite(amount)) return null;
    return { currency, amount, raw: text };
  }

  function normalizeCurrencyNameToken(token) {
    return String(token || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[‐‑‒–—]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  function normalizeCurrencyToken(token) {
    const normalized = normalizeCurrencyNameToken(token);
    return CURRENCY_ALIAS_LOOKUP.get(normalized) || normalized;
  }

  function parseLocalizedNumber(value) {
    let text = String(value || "").replace(/[\s']/g, "");
    const sign = text.startsWith("-") ? -1 : 1;
    text = text.replace(/^[+-]/, "");

    if (!/^\d[\d.,]*$/.test(text)) return Number.NaN;

    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");
    let decimalSeparator = null;

    if (lastComma !== -1 && lastDot !== -1) {
      decimalSeparator = lastComma > lastDot ? "," : ".";
    } else if (lastComma !== -1 || lastDot !== -1) {
      const separator = lastComma !== -1 ? "," : ".";
      const parts = text.split(separator);
      const finalDigits = parts.at(-1).length;

      if (finalDigits > 0 && finalDigits <= 2) decimalSeparator = separator;
    }

    if (decimalSeparator) {
      const otherSeparator = decimalSeparator === "," ? "." : ",";
      text = text.split(otherSeparator).join("");
      const decimalIndex = text.lastIndexOf(decimalSeparator);
      text = text.slice(0, decimalIndex).replace(/[.,]/g, "")
        + "."
        + text.slice(decimalIndex + 1).replace(/[.,]/g, "");
    } else {
      text = text.replace(/[.,]/g, "");
    }

    return sign * Number(text);
  }

  function formatCurrencyResult(result, original) {
    const locale = result.to === "BRL" ? "pt-BR" : undefined;
    const converted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: result.to,
      minimumFractionDigits: settings.decimalPlaces,
      maximumFractionDigits: settings.decimalPlaces
    }).format(result.converted);

    const parts = [converted];
    if (settings.showOriginal) parts.push(original.raw);

    if (settings.showRate) {
      const rate = new Intl.NumberFormat(locale, { maximumFractionDigits: 6 }).format(result.rate);
      parts.push(`1 ${result.from} = ${rate} ${result.to}`);
    }

    if (settings.showRateDate && result.date) parts.push(formatDate(result.date));
    return parts.join(" · ");
  }

  function formatDate(isoDate) {
    const [year, month, day] = String(isoDate).split("-").map(Number);
    if (!year || !month || !day) return isoDate;
    return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
  }

  function containsTranslatableText(text) {
    return /\p{L}/u.test(text);
  }

  function sendMessageWithTimeout(message) {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("A operação demorou demais. Verifique sua conexão e tente novamente."));
      }, MESSAGE_TIMEOUT_MS);

      chrome.runtime.sendMessage(message, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        if (chrome.runtime.lastError) {
          reject(new Error("A extensão perdeu contato com o serviço interno. Recarregue a página."));
          return;
        }

        resolve(response);
      });
    });
  }

  function sendRuntimeMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
        if (!response?.ok) { reject(new Error(response?.error || "Falha ao comunicar com a extensão.")); return; }
        resolve(response);
      });
    });
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand("copy");
      textarea.remove();
      return success;
    }
  }

  function showCopyFeedback(button, success, originalText) {
    button.classList.toggle("trem-copy-success", success);
    button.classList.toggle("trem-copy-failed", !success);
    button.textContent = success ? "✓ Copiado" : "Não foi possível copiar";

    setTimeout(() => {
      if (!button.isConnected) return;
      button.textContent = originalText;
      button.classList.remove("trem-copy-success", "trem-copy-failed");
    }, 1100);
  }

  function safeMessage(error) {
    if (!error) return 'Ocorreu um erro inesperado.';
    return String(error.message || error).trim() || 'Ocorreu um erro inesperado.';
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function capitalizeFirst(value) {
    const text = String(value || "");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function lowercaseFirst(value) {
    const text = String(value || "");
    return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
  }

  function stopEvent(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
  }

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();

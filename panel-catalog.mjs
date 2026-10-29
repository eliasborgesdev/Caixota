export const TEXT_TOOL_CATALOG = [
  { id: "calculate", settingId: "calculatorEnabled", direct: true, label: "Calculadora", icon: "calculate", group: "Utilidades", description: "Resolve contas simples com números, parênteses e porcentagens.", keywords: ["cálculo", "matemática", "conta"] },
  { id: "counter", settingId: "counterEnabled", label: "Contador de Texto", icon: "counter", group: "Utilidades", description: "Conta palavras, caracteres, frases, linhas e tempo de leitura.", keywords: ["contador", "palavras", "caracteres", "estatísticas"] },
  { id: "date", settingId: "dateEnabled", label: "Data", icon: "calendar", group: "Utilidades", description: "Interpreta datas e mostra dia da semana, ISO e distância até hoje.", keywords: ["calendário", "prazo", "dia"] },
  { id: "reader", settingId: "readerEnabled", label: "TTS", icon: "speaker", group: "Utilidades", description: "Lê o texto em voz alta usando as vozes instaladas no navegador.", keywords: ["ler", "voz", "ouvir", "fala", "text to speech"] },
  { id: "sort", settingId: "sorterEnabled", label: "Ordenar", icon: "sort", group: "Utilidades", description: "Ordena linhas alfabeticamente, numericamente ou remove duplicatas.", keywords: ["classificar", "duplicados", "linhas"] },
  { id: "text-markdown", direct: true, network: "offline", label: "Editor Markdown", icon: "notes", group: "Utilidades", description: "Escreva Markdown com prévia segura, importação e salvamento local.", keywords: ["markdown", "md", "editor", "prévia", "anotações"] },
  { id: "text-regex", direct: true, network: "offline", label: "Laboratório Regex", icon: "encode", group: "Conversão e códigos", description: "Teste expressões regulares com destaque, modelos e execução isolada.", keywords: ["regex", "expressão regular", "validação", "programação", "padrões"] },
  { id: "text-yaml", direct: true, network: "offline", label: "JSON ↔ YAML", icon: "encode", group: "Conversão e códigos", description: "Converta JSON e um subconjunto seguro de YAML localmente.", keywords: ["json", "yaml", "yml", "código", "converter"] },
  { id: "text-notes", direct: true, label: "Bloco de Notas", icon: "notes", group: "Utilidades", network: "offline", description: "Crie, edite, importe e exporte notas salvas localmente no navegador.", keywords: ["nota", "notas", "bloco de notas", "txt", "anotações", "editor de texto", "rascunho"] },

  { id: "compare", settingId: "comparerEnabled", label: "Comparar Textos", icon: "compare", group: "Escrita e organização", description: "Compara textos e destaca o que foi adicionado ou removido.", keywords: ["comparar", "diferença", "diff", "versões"] },
  { id: "formatter", settingId: "formatterEnabled", label: "Formatar Textos", icon: "type", group: "Escrita e organização", description: "Muda maiúsculas, minúsculas, títulos e capitalização do texto.", keywords: ["formatar", "maiúsculas", "minúsculas", "capitalizar"] },
  { id: "cleaner", settingId: "cleanerEnabled", label: "Limpar Texto", icon: "broom", group: "Escrita e organização", description: "Remove espaços duplicados, quebras excessivas e caracteres invisíveis.", keywords: ["limpar", "higienizar", "espaços", "quebras"] },
  { id: "list", settingId: "listEnabled", label: "Transformar em Lista", icon: "list", group: "Escrita e organização", description: "Transforma itens soltos em lista marcada, numerada ou checklist.", keywords: ["lista", "checklist", "tópicos", "itens"] },

  { id: "currency", settingId: "currencyEnabled", label: "Conversor de Moedas", icon: "currency", group: "Conversão e códigos", network: "required", description: "Converte valores por símbolo, código ou nome da moeda usando a cotação mais recente.", keywords: ["câmbio", "moeda", "dinheiro", "dólar", "dólares", "dólar australiano", "iene", "ienes", "real", "reais", "euro"] },
  { id: "encoder", settingId: "encoderEnabled", label: "Codificar Texto", icon: "encode", group: "Conversão e códigos", description: "Codifica ou restaura Base64, URL, HTML, Unicode, Morse e Binário.", keywords: ["codificar", "base64", "decode", "unicode", "binário"] },
  { id: "units", settingId: "converterEnabled", label: "Conversor de Unidades", icon: "ruler", group: "Conversão e códigos", description: "Converte medidas compatíveis, como distância, massa e temperatura.", keywords: ["medida", "temperatura", "distância", "massa"] },
  { id: "color", settingId: "colorEnabled", label: "Converter Código de Cor", icon: "palette", group: "Conversão e códigos", description: "Converte uma cor selecionada entre HEX, RGB e HSL.", keywords: ["cor", "hex", "rgb", "hsl", "paleta"] },
  { id: "qr-generator", settingId: "qrGeneratorEnabled", label: "Gerar QR Code", icon: "qr", group: "Conversão e códigos", description: "Cria um QR Code de texto ou URL localmente e permite baixar o PNG.", keywords: ["qrcode", "código", "url", "png", "copiar imagem"] },

  { id: "dictionary", settingId: "dictionaryEnabled", label: "Dicionário", icon: "book", group: "Idiomas", network: "required", description: "Consulta significados, idiomas e classes gramaticais.", keywords: ["significado", "definição", "verbete"] },
  { id: "translate", settingId: "translationEnabled", label: "Tradutor", icon: "translate", group: "Idiomas", network: "required", description: "Traduz palavras e frases para o idioma escolhido nas configurações.", keywords: ["traduzir", "tradução", "idioma", "language"] },

  { id: "link-checker", settingId: "linkCheckerEnabled", label: "Verificador de Link", icon: "link", group: "Segurança", description: "Analisa um endereço localmente, remove rastreadores e mostra alertas.", keywords: ["verificar link", "url", "site", "seguro", "suspeito"] },
];

export const IMAGE_TOOL_CATALOG = [
  { id: "image-convert", settingId: "imageConvertEnabled", direct: true, label: "Converter Imagem", icon: "image-convert", group: "Editar e converter", description: "Converta imagens entre PNG, JPEG, WebP, AVIF e BMP, inclusive por arquivo local.", keywords: ["formato", "png para jpg", "jpg para png", "png para webp", "webp para jpg", "jpeg", "avif", "bmp", "converter imagem"] },
  { id: "image-resize", settingId: "imageResizeEnabled", label: "Redimensionar", icon: "image-resize", group: "Editar e converter", description: "Altera largura e altura, com opção de manter a proporção.", keywords: ["largura", "altura", "tamanho"] },
  { id: "image-rotate", settingId: "imageRotateEnabled", label: "Girar e Espelhar", icon: "image-rotate", group: "Editar e converter", description: "Gira a imagem ou a espelha horizontalmente.", keywords: ["rotacionar", "espelhar", "flip"] },
  { id: "image-compress", settingId: "imageCompressEnabled", direct: true, label: "Comprimir Imagem", icon: "compress", group: "Editar e converter", description: "Reduza o arquivo ajustando formato, qualidade e resolução, sem enviar a imagem.", keywords: ["otimizar", "qualidade", "reduzir", "comprimir jpg", "comprimir png", "comprimir webp"] },

  { id: "image-gif-compress", direct: true, label: "Comprimir GIF", icon: "compress", group: "GIF e animação", description: "Reduza GIFs animados ajustando resolução, FPS e quantidade de cores.", keywords: ["comprimir gif", "otimizar gif", "reduzir gif", "fps", "cores", "animação"] },
  { id: "image-gif-frames", direct: true, label: "Extrair Frames do GIF", icon: "capture", group: "GIF e animação", description: "Extraia os quadros de uma animação GIF e exporte a seleção.", keywords: ["gif para frames", "gif", "frames", "quadros", "png", "jpg", "extrair frames"] },
  { id: "image-frames-gif", direct: true, label: "Criar GIF com Imagens", icon: "image-convert", group: "GIF e animação", description: "Monte um GIF com imagens, reordene os frames e defina o tempo de cada um.", keywords: ["frames para gif", "criar gif", "imagens para gif", "animação", "quadros", "duração"] },

  { id: "image-colors", settingId: "imageColorsEnabled", label: "Cores", icon: "palette", group: "Analisar e extrair", description: "Encontra cores dominantes, conta-gotas e paletas salvas.", keywords: ["paleta", "hex", "conta-gotas"] },
  { id: "image-info", settingId: "imageInfoEnabled", label: "Informações", icon: "image-info", group: "Analisar e extrair", description: "Mostra formato, dimensões, proporção, tamanho e nome do arquivo.", keywords: ["metadados", "dimensões", "formato"] },
  { id: "image-qr", settingId: "imageQrEnabled", label: "Ler QR Code", icon: "qr", group: "Analisar e extrair", network: "optional", description: "Lê QR Code localmente ou usa uma alternativa online quando necessário.", keywords: ["qrcode", "url", "código"] },
  { id: "image-text", settingId: "imageTextEnabled", label: "Extrair Texto", icon: "image-text", group: "Analisar e extrair", network: "optional", description: "Extrai e traduz texto da imagem, com alternativa de OCR online.", keywords: ["ocr", "texto", "scan"] },

  { id: "image-batch", direct: true, network: "offline", icon: "image-convert", group: "Editar e converter", label: "Imagens em Lote", description: "Redimensione e converta várias imagens para PNG, JPEG ou WebP em uma única etapa.", keywords: ["lote", "batch", "converter imagens", "webp", "redimensionar"] },
  { id: "image-metadata-clean", direct: true, network: "offline", icon: "image-info", group: "Analisar e extrair", label: "Remover Metadados", description: "Reexporta PNG, JPEG ou WebP sem os metadados originais, quando o navegador consegue decodificar.", keywords: ["exif", "metadata", "metadados", "privacidade", "imagem"] },
  { id: "image-capture", settingId: "imageCaptureEnabled", label: "Capturar Tela", icon: "capture", group: "Capturar", description: "Captura a aba visível ou uma área e envia a imagem para outras ferramentas.", keywords: ["screenshot", "tela", "área", "aba"] }
];

export const VIDEO_TOOL_CATALOG = [
  { id: "video-convert", group: "Editar e converter", icon: "⇄", label: "Converter Vídeo", description: "Converta vídeos localmente para GIF, WebM ou MP4 quando o navegador oferecer suporte.", keywords: ["vídeo para gif", "video para gif", "mp4 para webm", "webm", "mp4", "converter vídeo", "transcodificar"] },
  { id: "video-compress", group: "Editar e converter", icon: "↘", label: "Comprimir Vídeo", description: "Reduza resolução e bitrate de vídeos diretamente no navegador, sem enviar o arquivo.", keywords: ["comprimir vídeo", "reduzir vídeo", "diminuir mp4", "bitrate", "resolução", "tamanho", "discord", "whatsapp"] },
  { id: "video-extract-audio", group: "Editar e converter", icon: "♫", label: "Extrair Áudio", description: "Extraia a faixa de áudio do vídeo em um formato compatível com o navegador, sem upload.", keywords: ["extrair áudio", "video para audio", "vídeo para áudio", "opus", "m4a", "ogg", "somente áudio"] },
  { id: "video-quick-editor", group: "Editar e converter", icon: "✂", label: "Editor Rápido", description: "Corte um trecho, ajuste áudio, recorte, gire, espelhe e exporte um vídeo localmente.", keywords: ["editar vídeo", "cortar vídeo", "trim", "crop", "girar", "espelhar", "volume", "editor"] },
  { id: "video-info", group: "Analisar", icon: "ⓘ", label: "Informações", description: "Consulte formato, resolução, duração, tamanho e taxas estimadas do vídeo.", keywords: ["informações vídeo", "metadados", "duração", "tamanho", "resolução", "mkv", "codec"] },

];

export const PDF_TOOL_CATALOG = [
  { id: "pdf-combine", network: "offline", group: "Organizar", icon: "⧉", label: "Juntar Arquivos em PDF", description: "Combine PDFs e imagens, reorganize tudo visualmente e gere um único documento.", keywords: ["juntar pdf", "unir pdf", "mesclar pdf", "criar pdf", "imagem para pdf", "jpg para pdf", "png para pdf", "combinar arquivos", "intercalar pdf"] },
  { id: "pdf-split", network: "offline", group: "Organizar", icon: "✂", label: "Dividir PDF", description: "Separe todas as páginas ou use intervalos como 1-3,5,8-12.", keywords: ["separar", "intervalos"] },
  { id: "pdf-organize", network: "offline", group: "Organizar", icon: "↕", label: "Organizar Páginas", description: "Reordene páginas arrastando miniaturas.", keywords: ["reordenar", "ordem"] },
  { id: "pdf-remove", network: "offline", group: "Organizar", icon: "−", label: "Remover Páginas", description: "Exclua páginas selecionadas sem alterar o arquivo original.", keywords: ["excluir", "apagar"] },
  { id: "pdf-extract", network: "offline", group: "Organizar", icon: "⇥", label: "Extrair Páginas", description: "Crie um novo PDF somente com as páginas escolhidas.", keywords: ["seleção", "separar"] },
  { id: "pdf-to-image", network: "offline", group: "Converter", icon: "▤", label: "PDF para Imagem", description: "Exporte páginas em PNG ou JPG, todas ou selecionadas.", keywords: ["png", "jpg", "foto"] },
  { id: "pdf-office", network: "offline", group: "Converter", icon: "▤", label: "Office e TXT para PDF", description: "Converta textos e conteúdo de DOCX, XLSX e PPTX em PDF offline. Formatação complexa pode mudar.", keywords: ["word","docx","excel","xlsx","powerpoint","pptx","txt","office","converter pdf"] },
  { id: "pdf-to-text", network: "offline", group: "Converter", icon: "T", label: "PDF para Texto", description: "Extraia a camada de texto de um PDF e baixe o resultado em TXT.", keywords: ["pdf para texto", "txt", "copiar", "extrair texto"] },
  { id: "pdf-rotate", network: "offline", group: "Editar", icon: "↻", label: "Girar Páginas", description: "Gire páginas selecionadas ou o documento inteiro.", keywords: ["rotação", "virar"] },
  { id: "pdf-watermark", network: "offline", group: "Editar", icon: "T", label: "Marca d’Água", description: "Aplique texto com tamanho, opacidade, rotação e posição.", keywords: ["marca", "texto"] },
  { id: "pdf-number", network: "offline", group: "Editar", icon: "№", label: "Numerar Páginas", description: "Escolha formato, posição e numeração inicial.", keywords: ["número", "rodapé"] },
  { id: "pdf-compress", network: "offline", group: "Otimizar e recuperar", icon: "↘", label: "Comprimir PDF", description: "Tente reduzir o tamanho com otimização ou recompressão em JPEG. A recompressão perde texto selecionável.", keywords: ["comprimir pdf", "reduzir pdf", "otimizar"] },
  { id: "pdf-sign", network: "offline", group: "Editar", icon: "✍", label: "Assinar PDF", description: "Adicione assinatura visual manuscrita ou digitada. Não é assinatura digital certificada.", keywords: ["assinar pdf", "assinatura visual", "rubrica"] },
  { id: "pdf-unlock", network: "offline", group: "Otimizar e recuperar", icon: "🔓", label: "Desbloquear PDF", description: "Com a senha autorizada, reconstrua páginas sem senha. Remove a camada textual e formulários.", keywords: ["desbloquear pdf", "senha", "abrir pdf protegido"] },
  { id: "pdf-repair", network: "offline", group: "Otimizar e recuperar", icon: "✚", label: "Reparar PDF", description: "Tente recuperar páginas renderizáveis de documentos problemáticos, com perdas possíveis.", keywords: ["reparar pdf", "corrigir pdf", "recuperação"] },
  { id: "pdf-crop", network: "offline", group: "Editar", icon: "⌗", label: "Recortar Páginas", description: "Selecione visualmente a área que deve permanecer.", keywords: ["cortar", "área"] }
];

export const GENERATOR_TOOL_CATALOG = [
  { id: "generator-random-number", direct: true, network: "offline", group: "Números", icon: "spark", label: "Gerador de Números", description: "Números inteiros ou decimais, intervalos, lotes e valores sem repetição.", keywords: ["números aleatórios", "sorteio número", "random", "inteiros", "decimais"] },
  { id: "generator-password", settingId: "passwordEnabled", direct: true, network: "offline", group: "Segurança", icon: "password", label: "Gerador de Senhas", description: "Gere senhas seguras e controle a ferramenta contextual. O cofre permanece acessível pelo menu de seleção.", keywords: ["senha", "password", "cofre", "segurança", "gerar senha"] },
  { id: "generator-lorem", direct: true, network: "offline", group: "Nomes e ideias", icon: "spark", label: "Gerador de Lorem Ipsum", description: "Gere parágrafos, frases ou palavras fictícias para protótipos.", keywords: ["lorem", "ipsum", "placeholder", "texto", "fictício"] },
  { id: "generator-palette", direct: true, network: "offline", group: "Nomes e ideias", icon: "palette", label: "Gerador de Paletas", description: "Crie paletas harmônicas e copie cores ou variáveis CSS.", keywords: ["paleta", "cores", "hex", "design", "harmonia", "css"] },
  { id: "generator-qr-batch", direct: true, network: "offline", group: "Dados para testes", icon: "qr", label: "QR Codes em Lote", description: "Gere múltiplos QR Codes como imagens PNG sem internet.", keywords: ["qrcode", "qr em lote", "png", "gerar", "url"] },
  { id: "generator-name", direct: true, network: "offline", group: "Nomes e ideias", icon: "spark", label: "Gerador de Nomes", description: "Gere nomes simples ou completos com filtros de origem, tamanho, iniciais e sobrenomes.", keywords: ["gerar nome", "nome aleatório", "nome masculino", "nome feminino", "nome unissex", "nomes", "random name"] },
  { id: "generator-uuid", direct: true, network: "offline", group: "Dados para testes", icon: "spark", label: "Gerador de UUID", description: "Gere identificadores UUID v4 ou v7 localmente, individualmente ou em lote.", keywords: ["uuid", "identificador", "v4", "v7", "developer", "aleatório"] },
  { id: "generator-fake-data", direct: true, network: "offline", group: "Dados para testes", icon: "spark", label: "Gerador de Dados Fictícios", description: "Crie dados totalmente ilustrativos e seguros para protótipos e testes.", keywords: ["fake", "mock", "dados", "nome", "email", "teste", "endereço"] }
];

export const CONVERTER_TOOL_CATALOG = []; // legado: ferramentas consolidadas em Imagens na v0.2.5

export const SETTINGS_SEARCH_CATALOG = [
  { id: "settings-organization", label: "Organização", category: "organization", description: "Pastas, favoritas, recentes, apelidos e histórico de uso.", keywords: ["favoritos", "pastas", "recentes", "histórico", "apelidos"] },
  { id: "settings-behavior", label: "Comportamento da Caixota", category: "behavior", description: "Ativação, efeitos e botão ao selecionar texto.", keywords: ["habilitar", "seleção", "clique direito", "animação", "efeitos visuais"] },
  { id: "settings-appearance", label: "Aparência", category: "appearance", description: "Temas e personalização visual.", keywords: ["tema", "cores", "oled", "anos 90", "anos 2000"] },
  { id: "settings-typography", label: "Tipografia", category: "appearance", targetId: "typographySettingsCard", description: "Fonte, escala, espaçamento entre letras e altura da linha.", keywords: ["fonte", "tamanho", "texto", "letter spacing", "line height"] },
  { id: "settings-translation", label: "Tradução", category: "translation", description: "Idiomas usados pelas ferramentas de tradução.", keywords: ["idioma", "traduzir", "página"] },
  { id: "settings-currency", label: "Câmbio", category: "currency", description: "Moeda de destino, exibição e cotações.", keywords: ["moeda", "dólar", "cotação"] },
  { id: "settings-help", label: "Atalho e Ajuda", category: "help", description: "Atalho do navegador e tutorial da Caixota.", keywords: ["atalho", "tutorial", "ajuda"] }
];

export const CATEGORY_CATALOGS = {
  text: TEXT_TOOL_CATALOG,
  images: IMAGE_TOOL_CATALOG,
  video: VIDEO_TOOL_CATALOG,
  pdf: PDF_TOOL_CATALOG,
  generators: GENERATOR_TOOL_CATALOG
};

export const CATEGORY_LABELS = {
  text: "Texto",
  images: "Imagens",
  video: "Vídeo",
  pdf: "PDF",
  generators: "Geradores"
};

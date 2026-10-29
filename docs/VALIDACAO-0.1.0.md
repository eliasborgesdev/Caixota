# Validação da versão 0.1.0
Validação original: 23/10/2026. Testes de regressão e revisão de publicação: 28/10/2026.

## Verificado
- Leitura de ZIP com deflate e CRC; manifesto e seis tipos de conteúdo; dependência de categoria; seleção vazia; IDs duplicados; compatibilidade; arquivos truncados, corrompidos e caminhos inseguros.
- Persistência do pacote, seleção parcial, ativação, desativação, substituição, rejeição de substituição inválida sem perda da versão anterior e remoção em IndexedDB.
- Fluxo da interface no Chromium: importação seletiva, instalação, tema, fonte, desativação/reativação, persistência após recarga, pesquisa na Ajuda e remoção.
- Uso funcional do contador e do jogo do módulo de testes; som de clique e opção de silenciar.
- Runtime do módulo sem acesso ao documento pai ou chrome.storage; tentativa de fetch bloqueada pela política de conteúdo.
- Abertura de 41 ferramentas internas, sem iframe; cartão comum arredondado e largura sem transbordamento na janela de teste. Isso não equivale a validar todas as conversões e resultados dessas ferramentas.
- Componente interno sem fundo próprio nos dez temas internos e no tema Aurora do módulo. Inspeção visual de calculadora, Markdown, conversor de imagens e ferramentas de PDF; apresentação do módulo em tela estreita.

- Cálculo de 2*(3+4)=14; Markdown com prévia, preservação do texto ao trocar tema e scripts escapados; conversão de imagem PNG.
- FAQ com 13 perguntas; espaço entre seções; alternância português/inglês/espanhol e aviso experimental no seletor.
- Layout de módulos restaurado, com ilustração e cartões da 0.3.18 conectados aos pacotes reais.

## Limites desta validação
A interface foi executada em Chromium com arquivos reais e uma simulação das APIs chrome.*. O armazenamento IndexedDB e a política de conteúdo do runtime foram executados pelo navegador. O ambiente de execução não permitiu carregar a extensão completa com as APIs reais.

Antes da publicação, carregue a pasta em chrome://extensions e confira: ausência de erros no manifesto e no service worker; importação do módulo; atualização sobre sua instalação anterior; persistência após fechar/reabrir o navegador; operações que dependem de abas, downloads, atalhos, permissões e serviços externos. Teste também arquivos representativos nas ferramentas que pretende anunciar como suportadas.

Não houve publicação no GitHub ou na Chrome Web Store. A validação de pacote e o sandbox reduzem exposição, mas não certificam a segurança de código de terceiros nem impedem travamentos causados por módulos maliciosos.

## Revisão definitiva: PSX, jogos e música
- FAQ com 13 perguntas, incluindo gratuidade permanente e doações voluntárias; três perguntas sobre módulos ao final. Espaçamento de resumo/parágrafo inspecionado e guia ordenado alfabeticamente em português e inglês.
- Tema PSX e fonte VHS: seleção persistida, família de fonte carregada, efeitos CRT presentes no modo completo e removidos no econômico. Fonte acessível também no seletor geral.
- Carrossel de módulos, Ajuda e jogos: avanço observado após cinco segundos, com controles manuais.
- Jogo da Velha: vitória em modo local, nova rodada, resposta do adversário automático e análise exaustiva de 642 finais possíveis contra a IA ótima, sem derrota da IA. Teste reproduzível: node tests/board-games-040.mjs.
- Forca: palavra personalizada, acentos, tentativas erradas e vitória; teclado não destaca letras certas antes de serem usadas.
- Player: importação e decodificação reais de dois WAVs de teste, avanço de tempo de reprodução, playlists, favoritas, controles de aleatório/repetição/posição/volume, persistência após nova página e reprodução ao navegar no painel.
- Janela independente: biblioteca compartilhada, transferência de faixa e posição, pausa da reprodução anterior e continuidade do áudio após fechar o painel principal. A janela foi testada como uma segunda página Chromium em 520 × 780; a chamada real chrome.windows.create depende da extensão instalada e continua pendente de validação nesse ambiente.
- Layout móvel do player em 390 px sem transbordamento horizontal; inspeção visual do tema PSX, dos dois jogos, do player padrão e do miniplayer.
- Licença autoral e inventário de terceiros incluídos. Os termos registram a intenção de licenciamento do autor; não certificam aplicabilidade universal de cláusulas.

Os testes não equivalem a certificar todos os codecs, todas as conversões ou a disponibilidade futura de serviços externos. A restrição anterior de carregamento da extensão completa neste ambiente permanece.

## Correções antes da publicação no GitHub
- Picture-in-Picture: `leavepictureinpicture` pausa a origem e impede a reabertura automática até recarregar a página. Testes: `node tests/pip-dismissal-040.mjs` e `node tests/pip-capture-040.mjs` (Chromium).
- Barra do Instagram: um diálogo de mídia em primeiro plano que cobre o vídeo oculta a barra; fechar o diálogo a restaura. Teste de navegador: `node tests/instagram-dialog-040.mjs` (requer Playwright e Chromium).
- Revisão estática do manifesto, CSP, limites do ZIP de módulos, avisos de terceiros e busca de padrões comuns de credenciais. Teste: `node tests/security-review-040.mjs`.
- Permissões amplas e limites restantes estão documentados em `REVISAO-SEGURANCA-0.1.0.md`; isto não é uma auditoria independente.

# Módulos da Caixota 0.1.0

Um ZIP contém caixota-module.json na raiz (ou todos os arquivos numa única pasta).
A versão 0.1.0 substitui o protótipo de metadados 0.3.x. Manifestos antigos precisam ser adaptados.
Não há catálogo remoto, assinatura verificada, atualização automática ou compilador Python nesta versão.

## Manifesto de exemplo

    {
      "schemaVersion": 2,
      "id": "meu-pacote",
      "name": "Meu pacote",
      "version": "1.0.0",
      "minCoreVersion": "0.1.0",
      "author": "Nome do autor",
      "description": "O que o pacote oferece.",
      "contents": [
        {"id":"texto-extra","type":"tool","name":"Meu contador",
         "category":"text","file":"contador.html","description":"Conta caracteres."}
      ]
    }

maxCoreVersion é opcional, inclusiva. Versões têm três números.
IDs: 2 a 48 caracteres, primeira letra minúscula, final alfanumérico, letras/números/hífens, sem dois hífens consecutivos. IDs de conteúdos são únicos dentro do pacote. IDs internos recebem namespace do módulo.
Uma atualização usa o mesmo ID: substitui pacote e seleção numa transação. Não há mesclagem automática nem migração de estado de ferramentas.

## Tipos de conteúdo
- category: adiciona categoria à área Ferramentas; id, name, description.
- tool: entrada HTML e categoria existente ou ID de categoria declarada no pacote.
- game: entrada HTML; categoria padrão games, podendo usar categoria própria.
- theme: base light/dark; colors com valores #RRGGBB.
- font: arquivo TTF, OTF, WOFF ou WOFF2 local; inclua licença de redistribuição.
- sound: WAV, MP3 ou OGG; aparece no seletor de som de clique da Aparência. O clique é limitado a um segundo. Não substitui automaticamente sons dos jogos originais.

Categorias existentes: text, images, video, pdf, generators, utilities, games, sorteio.
Se uma ferramenta depender de categoria própria, o instalador exige selecionar ambas.
Temas obrigatoriamente informam bg, surface, title, text, muted, primary e stroke.
Tokens opcionais: surface-solid, surface-strong, surface-faint, subtle, primary-dark, primary-soft, line.
CSS arbitrário de temas não é executado no núcleo. Fontes e som selecionados respeitam as preferências globais.
Escolha cores com contraste legível; não há certificação automática de acessibilidade.

## Ferramentas e jogos
O HTML deve conter CSS e JavaScript clássico inline. Bibliotecas podem ser incorporadas no HTML, respeitando suas licenças. Não use script src, ES modules/import, links CSS externos, iframe ou recursos remotos. Não há acesso a chrome.*, DOM do núcleo, cookies ou armazenamento do perfil da extensão.
Imagens/fontes/áudio locais podem ser referidos por caminho de pacote nos atributos src ou por Caixota.asset("assets/imagem.png").
Extensões de mídia aceitas: PNG/JPEG/WebP, WOFF/WOFF2/TTF/OTF, WAV/MP3/OGG.
Módulos não recebem automaticamente arquivos, notas, perfil ou configurações confidenciais do núcleo.
O host envia apenas cores, fonte e preferências de apresentação. Não existe API persistente para dados de módulos na 0.1.0: reabrir a ferramenta reinicia seu estado. Dados digitados podem ser perdidos ao sair.

    <h2>Olá!</h2>
    <button id="agir" class="primary">Executar</button>
    <p id="resultado" aria-live="polite"></p>
    <script>
    document.getElementById('agir').onclick = () => {
      document.getElementById('resultado').textContent = 'Funcionou!';
    };
    window.addEventListener('caixota:preferences', event => {
      // Desligue loops e timers desnecessários em eco.
    });
    </script>

SDK:
- Caixota.preferences: cópia das preferências atuais.
- Caixota.asset(caminho): data URL de recurso local suportado; vazio quando ausente.
- Caixota.sound(): solicita clique ao host, respeitando silêncio, volume e limite de repetição.
- Evento caixota:preferences ao alterar aparência/desempenho.
Botões já recebem som de clique; não chame sound() novamente no mesmo clique.
Use classes card, primary, rótulos de formulário e aria-live para resultados.
Variáveis CSS: --bg, --surface, --surface-strong, --title, --text, --muted, --primary, --stroke, --font.
O ambiente suprime animações e transições CSS em eco ou efeitos desligados; autores devem adaptar processamento JavaScript e sons produzidos por código próprio.
Nenhum código importado é executado no shell, background ou workbench original.

## Limites e segurança
20 MB compactados; 40 MB descompactados; 8 MB por arquivo; 500 entradas; 64 KB por manifesto; 100 conteúdos; 24 módulos/80 MB descompactados no total.
ZIP armazenado ou deflate, sem senha ou ZIP64. Caminhos absolutos, traversal, entradas duplicadas e CRC incorreto são rejeitados.
IndexedDB armazena o pacote completo e a seleção, de forma atômica. Conteúdos não escolhidos não são registrados no catálogo. Desativação preserva pacote; desinstalação remove.
O runtime usa página sandbox declarada no Manifest V3 e origem isolada. CSP bloqueia conexões fetch, recursos remotos, formulários e subframes; não são concedidos popups, top navigation, downloads ou origem compartilhada.
Isso não é uma auditoria completa nem garantia contra falhas do navegador, abuso de recursos ou engenharia social.
O leitor valida integridade e estrutura, não autenticidade. O campo author não comprova autoria.
Projetos com compiladores, workers, WebAssembly ou acesso à rede exigirão evolução explícita do contrato; não estão implementados aqui.

## Teste
Importe caixota-testes-1.0.0.zip. Escolha todos; confira Laboratório → Contador de Teste e Jogos → Acerte o Número.
Em Aparência selecione Aurora, Mono Teste e Clique Cristal. Desligue sons, reduza volume e ative modo econômico.
Desative o módulo: conteúdos deixam o catálogo e estilos voltam ao padrão. Reative, reimporte com seleção parcial e desinstale.

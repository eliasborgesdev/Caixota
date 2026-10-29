# Privacidade e processamento de dados

Este texto descreve o funcionamento observado na Caixota 0.1.0. É uma descrição técnica do projeto, não uma promessa de segurança absoluta nem uma política dos serviços externos.

## O que fica no navegador

Preferências, favoritos, histórico recente, perfil, configurações, dados de jogos, módulos instalados e dados do Player de Música são guardados no armazenamento local da extensão, em `chrome.storage.local` ou IndexedDB. A extensão também guarda o cofre de senhas criptografado localmente. Esses dados não são enviados a um servidor da Caixota por uma função de sincronização: a versão 0.1.0 não possui conta ou backup em nuvem.

No Player de Música, os arquivos importados, nomes, playlists e favoritas ficam no IndexedDB local da extensão. O recurso não oferece streaming nem envia as músicas a um catálogo. A palavra personalizada da Forca é usada na sessão. Conteúdos de módulos permanecem no armazenamento local e são executados em sandbox; a Caixota não comprova a autoria dos módulos.

## Recursos que podem usar a internet

O processamento local é o padrão para muitas ferramentas, mas algumas ações fazem requisições externas. O conteúdo enviado depende do recurso acionado:

| Recurso | Dados que podem sair do navegador | Serviço citado no código |
|---|---|---|
| Tradução de texto | Texto enviado para tradução | MyMemory ou Google Translate |
| Dicionário | Termo consultado | Free Dictionary API ou Dicionário Aberto |
| Câmbio | Moeda/base consultada | Frankfurter |
| OCR online | Imagem selecionada para OCR | OCR.space |
| Leitura de QR online | Imagem selecionada | QRServer |
| Teste de velocidade | Solicitações de medição para os pontos de teste | Cloudflare |
| Downloads de mídia | Link fornecido e requisições necessárias para localizar mídia | Instagram, Pinterest, X e serviços intermediários definidos no código |

Antes de usar essas opções, evite inserir dados pessoais, documentos ou conteúdo confidencial. Os terceiros podem receber endereço IP, metadados de conexão e os dados descritos acima conforme suas próprias políticas. A Caixota não controla disponibilidade, retenção ou tratamento desses serviços.

Traduções de interface baseadas nos arquivos locais de idioma não são a mesma coisa que a ferramenta de tradução de texto: elas não precisam consultar esses provedores.

## Acesso a páginas e permissões

A versão 0.1.0 declara `<all_urls>` no manifesto e carrega scripts de conteúdo em páginas comuns. Isso permite recursos contextuais e funções de navegação em diferentes sites, mas também significa que a extensão tem uma superfície de acesso ampla. O Picture-in-Picture vem desligado por padrão; a barra do Instagram também depende de ativação nas configurações. Desligar uma função impede seu comportamento específico, mas não remove a declaração de host do manifesto.

Outras permissões declaradas incluem armazenamento, menu de contexto, leitura/escrita da área de transferência, downloads, captura de áudio da aba ativa e documento offscreen usado pelo recurso de áudio. A lista completa está em `manifest.json`; o navegador mostra as permissões ao instalar.

## Arquivos e módulos

As ferramentas locais processam arquivos dentro do navegador. Alguns arquivos escolhidos podem ser mantidos no IndexedDB — por exemplo, faixas importadas no Player de Música — até que os dados da extensão sejam apagados. As ferramentas online descritas acima podem enviar o conteúdo selecionado ao provedor correspondente.

Um módulo instalado pode conter código de terceiros. O sandbox e a política de conteúdo restringem o acesso direto ao núcleo e a conexões remotas, mas não certificam que o módulo é confiável nem impedem travamentos ou enganos dentro da própria ferramenta. Leia [docs/MODULOS.md](docs/MODULOS.md) e a licença do módulo antes de instalar.

## Remoção e cópias de segurança

Limpar os dados do navegador, remover a extensão ou instalar uma cópia com outro ID pode tornar indisponíveis ou apagar dados locais. Mantenha os arquivos originais e faça cópias próprias dos dados que sejam importantes. A Caixota 0.1.0 não sincroniza esses dados com a nuvem.

Consulte também [SECURITY.md](SECURITY.md), [LICENSE.md](LICENSE.md) e [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

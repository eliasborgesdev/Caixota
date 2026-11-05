# 🧰 Caixota

**Um monte de ferramentas. Uma aba só.**

Sabe quando você abre um site só pra contar palavras, outro pra mexer num PDF e um terceiro pra redimensionar uma imagem? A Caixota nasceu pra juntar essas coisas num lugar só. E, já que sobrou espaço na caixa, coloquei uns jogos também.

A Caixota é uma extensão gratuita para Chrome, Brave e outros navegadores baseados em Chromium. Muita coisa roda no próprio navegador, inclusive sem internet.

**[⬇️ Baixar Caixota](https://github.com/eliasborgesdev/Caixota/releases/latest)** · **[Como instalar](INSTALL.md)** · **[Como criar um módulo](docs/MODULOS.md)**

## 📦 O que tem dentro?

- **Pra resolver coisa rápido:** ferramentas de texto, arquivos, imagens, PDFs e produtividade.
- **Pra deixar com a sua cara:** temas, fontes, sons, idiomas e um modo de desempenho. Tem até tema com visual de PSX/VHS.
- **Pra dar uma pausa:** Jogo da Velha, Forca e um player pros seus arquivos de música. O player não tem streaming; se quiser fechar o painel e continuar ouvindo, deixe o miniplayer aberto.
- **Pra ver vídeos do seu jeito:** Picture-in-Picture e barra de progresso em vídeos compatíveis do Instagram.
- **Pra tirar dúvidas:** uma página de Ajuda com FAQ e um guia das ferramentas em ordem alfabética.

### ✨ Novidade na 0.1.1: ferramentas de IA

São seis: **Verificar, Resumir, Reescrever, Dicionário inteligente, Explicar simples e Analisar imagem**. Elas são experimentais, precisam de internet e podem errar. Vale conferir as informações importantes antes de confiar na resposta.

## 🧩 Quer colocar mais coisa na caixa?

Módulos são pacotes opcionais que podem adicionar ferramentas, jogos, temas, fontes e sons. Abra **Módulos → Importar módulo**, selecione o ZIP **sem extrair** e escolha o que quer instalar. Dá pra desativar ou remover o módulo depois.

O **Caixota Code** é um módulo separado para quem programa. Quer montar o seu? Comece pelo [guia de módulos](docs/MODULOS.md).

Instale módulos só de fontes em que você confia. Alguns incluem código, então vale conferir de onde veio o ZIP antes de confirmar.

## 🚀 Como instalar

1. Baixe o ZIP da extensão em [Releases](https://github.com/eliasborgesdev/Caixota/releases/latest) e extraia.
2. Abra `chrome://extensions` no Chrome ou `brave://extensions` no Brave.
3. Ative o **Modo do desenvolvedor** e clique em **Carregar sem compactação**.
4. Selecione a pasta extraída que contém o `manifest.json`.

Na primeira instalação, a Caixota abre o painel em uma nova aba. Se você já tem uma versão instalada, veja o [guia de atualização](INSTALL.md).

## 🔒 E os meus dados?

Preferências e parte dos conteúdos ficam no armazenamento local do navegador. Quando você usa uma ferramenta online, ela pode enviar ao serviço externo os dados necessários para aquela ação. A extensão também solicita acesso a páginas para oferecer recursos como o menu de ferramentas ao selecionar texto.

Veja o que fica no navegador e o que pode sair dele em [Privacidade](PRIVACY.md). Para relatar uma vulnerabilidade, consulte [Segurança](SECURITY.md).

## 🛠️ Quer olhar por baixo da tampa?

Os scripts principais ficam em `scripts/`. Para testar uma cópia de desenvolvimento, carregue a pasta do projeto como extensão sem compactação. Não tem etapa de compilação.

- [Formato dos módulos](docs/MODULOS.md)
- [Componentes e licenças de terceiros](THIRD-PARTY-NOTICES.md)
- [Revisão de segurança da versão 0.1.0](docs/REVISAO-SEGURANCA-0.1.0.md)
- [Guia de publicação no GitHub](docs/PUBLICAR-NO-GITHUB.md)

## 💛 Créditos, licença e aquele café

A Caixota foi criada por **Elias Adelson Borges Mitouso**. É grátis usar. Se ela te poupou umas abas e você quiser apoiar o projeto, o Pix e o QR Code estão na página de doações da extensão. Doar é voluntário e não desbloqueia recursos.

Pode usar, modificar e redistribuir a Caixota **para fins não comerciais**, seguindo a [licença](LICENSE.md): mantenha os créditos e a página de doações com o Pix e o QR Code originais. Se distribuir uma versão modificada, inclua o link da Caixota original dentro da extensão e no local de divulgação, antes do download ou da instalação.

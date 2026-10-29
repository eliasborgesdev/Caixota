# Caixota

**Uma caixa de ferramentas para o navegador, com foco em utilitários locais e acesso simples.**

Caixota 0.1.0 é uma extensão para navegadores baseados em Chromium. Reúne ferramentas de texto, arquivos, imagens, PDF, produtividade, jogos e navegação em um painel personalizável. Muitos recursos funcionam localmente; outros dependem de serviços externos, descritos em [Privacidade](PRIVACY.md).

> **Licença:** o código pode ser consultado publicamente, mas a licença autoral da Caixota restringe redistribuição e versões modificadas. Ela não é uma licença open source aprovada pela OSI. Leia [LICENSE.md](LICENSE.md) e [a nota sobre repositórios públicos no GitHub](docs/PUBLICAR-NO-GITHUB.md) antes de copiar ou redistribuir arquivos.

## O que vem nesta versão

- **81 ferramentas principais**, organizadas em oito categorias.
- **Módulos em ZIP**, com prévia de conteúdo, seleção individual e opções para ativar, desativar e remover. Código de módulo roda em sandbox.
- **Personalização:** temas, fontes, sons, idioma e modo de desempenho.
- **PSX/VHS**, Jogo da Velha, Forca e Player de Música com arquivos selecionados pelo usuário.
- **Picture-in-Picture** e barra de progresso para vídeos compatíveis do Instagram.
- Página de Ajuda com FAQ, guia alfabético das ferramentas, privacidade e avisos de terceiros.

O Player de Música usa arquivos locais e não oferece streaming nem catálogo online. Para continuar ouvindo depois de fechar o painel, mantenha aberta a janela do miniplayer.

## Instalar no Chrome, Brave ou outro Chromium

1. Baixe `caixota-v0.1.0.zip` na seção **Releases** e extraia a pasta.
2. Abra `chrome://extensions` ou `brave://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Escolha **Carregar sem compactação** e selecione a pasta que contém `manifest.json`.
5. Abra a Caixota pelo ícone de extensões.

O módulo de testes é um ZIP separado, `caixota-testes-1.0.0.zip`. Importe-o pela página **Módulos**. Consulte [Guia de instalação e atualização](INSTALL.md) para instruções completas.

## Dados e permissões

Preferências e parte dos conteúdos ficam no armazenamento local do navegador. Recursos online podem enviar a um provedor o conteúdo necessário para executar a ação escolhida. O manifesto da 0.1.0 também declara acesso amplo a páginas visitadas para recursos contextuais. Veja [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md) e [a revisão de segurança da publicação](docs/REVISAO-SEGURANCA-0.1.0.md).

## Desenvolvimento e validação

Não há etapa de compilação. Para carregar uma cópia de desenvolvimento, use os mesmos passos de instalação e selecione a pasta do projeto. Os principais testes locais são:

```sh
node tests/release-040.mjs
node tests/board-games-040.mjs
node tests/pip-dismissal-040.mjs
node tests/security-review-040.mjs
```

Os testes de regressão no Chromium requerem Playwright e Chromium:

```sh
node tests/pip-capture-040.mjs
node tests/instagram-dialog-040.mjs
```

Os resultados e limites da verificação estão em [docs/VALIDACAO-0.1.0.md](docs/VALIDACAO-0.1.0.md). Eles não são uma certificação de segurança nem substituem o teste da extensão instalada no navegador de destino.

## Documentação

- [Instalação e atualização](INSTALL.md)
- [Privacidade e processamento de dados](PRIVACY.md)
- [Segurança e relato de vulnerabilidades](SECURITY.md)
- [Licença autoral](LICENSE.md)
- [Componentes de terceiros](THIRD-PARTY-NOTICES.md)
- [Formato dos módulos](docs/MODULOS.md)
- [Revisão de segurança 0.1.0](docs/REVISAO-SEGURANCA-0.1.0.md)
- [Como publicar este projeto no GitHub](docs/PUBLICAR-NO-GITHUB.md)

## Créditos e doações

Caixota é criada por **Elias Adelson Borges Mitouso**. O uso da extensão é gratuito; doações são voluntárias e não liberam recursos adicionais. A licença exige preservar os créditos e a área de doações.

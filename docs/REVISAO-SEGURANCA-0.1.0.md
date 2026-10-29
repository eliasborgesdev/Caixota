# Revisão de segurança para publicação — Caixota 0.1.0

**Revisão local: 28 de outubro de 2026.** Esta revisão cobre o pacote preparado para o GitHub e os dois ajustes de regressão. Não equivale a auditoria independente ou certificação.

## Checagens executadas

- JSON do manifesto, política de conteúdo e lista de arquivos da extensão.
- Testes do contrato de módulos: estrutura do ZIP, caminhos, CRC, limites, sandbox e conteúdo selecionado.
- Testes de fechamento do Picture-in-Picture: listener de captura do evento de saída não-borbulhante no Chromium, pausa da fonte, bloqueio de reabertura automática e reinicialização após recarregar a página.
- Teste de navegador do Instagram: a barra some quando um diálogo de mídia cobre o vídeo e volta quando o diálogo fecha.
- Testes da release 0.1.0, IA dos jogos e sintaxe dos arquivos JavaScript alterados.
- Busca estática por formatos comuns de chaves privadas e tokens. Nenhuma credencial de produção foi identificada pelo padrão pesquisado. O código contém a chave `helloworld` de demonstração do serviço OCR.Space; ela não foi tratada como credencial privada.
- Conferência de avisos de licenças vendorizadas e de menções aos serviços externos.

## Resultado: preparado com ressalvas explícitas

O código passou nos testes listados, mas há uma decisão de permissão que o mantenedor precisa considerar antes de anunciar a extensão para uso geral:

1. **Acesso amplo a sites:** `manifest.json` declara `<all_urls>` em permissões de host e injeta scripts de conteúdo em todas as páginas comuns. Isso dá à extensão uma superfície de acesso ampla, mesmo com recursos contextuais desligados. O escopo foi preservado nesta correção para não remover funcionalidades de navegação existentes. Antes de lançar, o mantenedor deve decidir se aceita esse escopo e explicar seus motivos na página do projeto. Reduzi-lo exigiria uma mudança funcional e testes próprios.
2. **Compatibilidade entre licença e GitHub público:** a licença autoral proíbe redistribuição e versões modificadas, mas os termos do GitHub dão aos usuários o direito de visualizar e bifurcar (fork) repositórios públicos na plataforma. A licença não é OSI open source. A página de publicação precisa explicar esse limite sem prometer que o botão de fork possa ser removido.
3. **Validação no navegador do mantenedor:** este ambiente não conseguiu carregar a extensão completa com uma instalação real de Chromium. Faça a validação final local descrita em `docs/PUBLICAR-NO-GITHUB.md`, incluindo permissões exibidas, atualização sobre uma instalação anterior e funcionalidades que interagem com páginas.
4. **Dependências:** não há `package.json` nem lockfile para executar `npm audit`. Bibliotecas vendorizadas estão listadas em `THIRD-PARTY-NOTICES.md`; esta revisão não analisou todas as versões upstream nem executou um scanner especializado de dependências.

## Modelo de proteção observado

- A CSP das páginas privilegiadas permite apenas scripts da própria extensão; a página sandbox de módulos possui política separada, sem `connect-src`, subframes ou `allow-same-origin`.
- O código de módulo não recebe diretamente `chrome.*` nem o DOM da página hospedeira. Ele comunica preferências e pedidos limitados ao núcleo por mensagens.
- O leitor de módulos valida caminhos, CRC, duplicidade e limites de arquivo/pacote.
- Dados do Player de Música, módulos e preferências ficam no armazenamento local da extensão; a ferramenta não oferece backup em nuvem.
- O manifesto também declara `clipboardRead`, `clipboardWrite`, `downloads`, `tabCapture` e `offscreen`. Veja `manifest.json` e a explicação em `PRIVACY.md`.

## Não verificado nesta revisão

- Auditoria manual linha por linha ou avaliação por profissional independente.
- Política, retenção e segurança dos serviços externos.
- Todas as combinações de sites, codecs, navegadores Chromium, codecs e políticas corporativas.
- Autenticidade de módulos de terceiros ou proteção contra engenharia social e abuso de recursos.
- Envio do pacote ao Chrome Web Store ou validação das regras dessa loja.

# Guia de instalação

Caixota 0.1.0 é distribuída para instalação manual em navegadores baseados em Chromium. Não é necessário instalar Node.js, executar um instalador ou compilar o projeto.

## Instalar a partir do ZIP

1. Na página **Releases** do GitHub, baixe `caixota-v0.1.0.zip`.
2. Extraia o arquivo numa pasta permanente. Não carregue o ZIP diretamente.
3. Abra a página de extensões do navegador:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Outros Chromium: use a página de extensões equivalente.
4. Ligue **Modo do desenvolvedor**.
5. Clique em **Carregar sem compactação**.
6. Selecione a pasta extraída que contém `manifest.json`.
7. Fixe a Caixota no menu de extensões se quiser acesso mais rápido.

O navegador mostrará as permissões solicitadas pela extensão. Leia a tela de permissões antes de confirmar. A versão 0.1.0 inclui acesso amplo a páginas para recursos que funcionam dentro dos sites; os motivos e limites estão em [PRIVACY.md](PRIVACY.md).

## Instalar o módulo de testes

1. Baixe `caixota-testes-1.0.0.zip` na mesma release.
2. Abra a Caixota e entre em **Módulos**.
3. Arraste o ZIP para a área indicada ou selecione o arquivo.
4. Confira o conteúdo detectado e escolha o que instalar.
5. Confirme a instalação.

O módulo de testes serve para experimentar o sistema de módulos. A Caixota não verifica a autoria de um ZIP nem certifica código de terceiros. Instale apenas módulos de origem confiável.

## Atualizar uma instalação existente

1. Guarde uma cópia da pasta atual e exporte os dados que não queira perder.
2. Extraia a nova versão em uma pasta de trabalho.
3. Em `chrome://extensions`, use **Carregar sem compactação** para a nova pasta, ou copie os arquivos para a pasta da instalação já carregada.
4. Clique em **Recarregar** na página de extensões.
5. Confira suas configurações, módulos e dados locais.

Se a pasta mudar para uma instalação com outro ID, o armazenamento da extensão pode ficar separado. Não remova a instalação anterior até confirmar que os dados necessários estão disponíveis.

## Desinstalar

Na página de extensões do navegador, escolha **Remover**. A remoção pode apagar preferências, módulos, playlists, arquivos importados e outros dados locais guardados pela extensão. Faça cópias dos arquivos originais e dos dados importantes antes de remover.

# Caixota 0.1.0
Distribuição para carregamento manual em navegadores Chromium, baseada na 0.3.18.

1. Extraia o ZIP numa pasta permanente.
2. Abra chrome://extensions (ou a página de extensões do seu navegador).
3. Ative o modo de desenvolvedor e clique em Carregar sem compactação.
4. Selecione a pasta que contém manifest.json.
5. Clique na Caixota; importe caixota-testes-1.0.0.zip pela página Módulos.

Para o passo a passo completo, permissões e atualização, consulte INSTALL.md.

Ao atualizar uma instalação existente, mantenha cópia da pasta e dados importantes. Recarregue a extensão com a pasta atualizada. Remover a extensão e criar outra instalação pode mudar seu ID e perder acesso aos dados antigos.
Não é necessário instalar Node ou compilar.

## Incluído
Instalação seletiva de módulos ZIP, ativação/desativação, substituição e desinstalação; temas por tokens de cor; fontes locais; som de clique selecionável; categorias; ferramentas e jogos HTML/JS em sandbox; Ajuda e FAQ; ferramentas internas sem iframe, com componentes e cores integrados ao painel.

Não inclui Caixota Code, compilador Python ou publicação automática no GitHub/Chrome Web Store.
Os processadores internos agora são inicializados no painel, dentro de um componente com estilos próprios. O sandbox fica reservado ao código dos módulos importados.

Veja docs/MODULOS.md para contrato e limitações. A Ajuda no painel descreve privacidade e serviços externos.
Consulte LICENSE.md para o código autoral e THIRD-PARTY-NOTICES.md para componentes de terceiros. A consulta ao código não autoriza redistribuir a Caixota.

A versão final inclui PSX/VHS, Jogo da Velha, Forca e Player de Música. O miniplayer mantém áudio com o painel principal fechado enquanto a janela própria continuar aberta.

Correções para publicação: fechar a janela PiP pausa o vídeo e bloqueia nova abertura até recarregar a página. A barra do Instagram se oculta quando um diálogo de mídia cobre o vídeo. Consulte RELEASE-NOTES-0.1.0.md e docs/REVISAO-SEGURANCA-0.1.0.md.

# Publicar Caixota no GitHub

Este roteiro prepara o repositório e uma release manual. O pacote não foi enviado à sua conta. Antes de criar um repositório público, leia o aviso de licença abaixo.

## Primeiro: entenda o limite da licença

A licença da Caixota permite baixar e usar a versão oficial, mas restringe redistribuição e publicação de versões modificadas. Ela é uma licença própria de código consultável, **não** uma licença open source aprovada pela OSI.

O GitHub informa que, quando você publica código em um repositório público, outros usuários podem visualizá-lo e bifurcá-lo (fork) conforme os Termos de Serviço. Por isso, o botão de fork e as cópias criadas dentro da plataforma não podem ser impedidos só escrevendo uma restrição no `LICENSE.md`. Veja a documentação oficial: [Licenciamento de um repositório](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository) e [Como criar um fork](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo).

Publique como **código consultável com licença restritiva**, sem chamar de “open source” ou prometer que ninguém poderá fazer fork. Se essa limitação não serve ao objetivo do projeto, mantenha o repositório privado ou decida outra licença antes de torná-lo público. Este texto não substitui orientação jurídica.

## 1. Prepare a pasta do repositório

1. Baixe o arquivo `caixota-v0.1.0.zip` entregue com este roteiro.
2. Extraia-o numa pasta de trabalho, por exemplo `Caixota`.
3. Confira que `README.md`, `LICENSE.md`, `PRIVACY.md`, `SECURITY.md`, `THIRD-PARTY-NOTICES.md` e `manifest.json` estão na raiz.
4. Revise [docs/REVISAO-SEGURANCA-0.1.0.md](REVISAO-SEGURANCA-0.1.0.md), principalmente o acesso amplo a páginas.
5. Faça uma inspeção final da pasta e não adicione credenciais, arquivos pessoais, dados de navegador ou testes com dados reais.

## 2. Crie o repositório

No GitHub:

1. Clique em **New repository**.
2. Nome sugerido: `Caixota`.
3. Descrição: `Extensão para navegadores Chromium que reúne ferramentas locais, utilitários e módulos instaláveis.`
4. Escolha **Public** somente se aceitar o aviso sobre visualização e forks acima.
5. Não selecione a criação automática de README, licença ou `.gitignore`; esses arquivos já estão na pasta.
6. Crie o repositório.

Sugestões de tópicos: `browser-extension`, `chromium`, `productivity-tools`, `offline-first`, `javascript`.

## 3. Envie o código

Instale Git no computador, abra Git Bash ou um terminal na pasta extraída e execute:

```sh
git init -b main
git status --short
git add -A
git diff --cached --stat
git commit -m "Caixota 0.1.0"
git remote add origin https://github.com/SEU-USUARIO/Caixota.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu nome de usuário do GitHub. Antes do `git add -A`, verifique que não há arquivos pessoais ou credenciais. O `.gitignore` já exclui arquivos comuns de chave, ambientes locais, arquivos ZIP e dependências, mas não substitui a revisão visual.

Depois do envio, abra a página do repositório. O GitHub exibirá o `README.md` como página inicial. Confira os links da documentação, a licença, a descrição e os tópicos.

## 4. Crie a release 0.1.0

1. Abra **Releases → Draft a new release**.
2. Crie a tag `v0.1.0`, apontando para `main`.
3. Título sugerido: **Caixota 0.1.0 — módulos, PSX/VHS, jogos e Player de Música**.
4. Cole o texto de `RELEASE-NOTES-0.1.0.md` na descrição.
5. Anexe `caixota-v0.1.0.zip`, `caixota-testes-1.0.0.zip` e `SHA256SUMS.txt` como arquivos da release. O GitHub permite anexar arquivos a uma release; consulte [About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).
6. Deixe **pre-release** desmarcado se esta for a versão estável que você quer anunciar.
7. Confira os nomes dos dois arquivos e publique.

## 5. Ajustes recomendados na página

- Em **Settings → Code security and analysis**, habilite **Private vulnerability reporting** antes de divulgar `SECURITY.md` como canal de relato.
- Ative proteção contra exclusão/force push da branch principal se estiver disponível no plano da conta.
- Mantenha `LICENSE.md`, avisos de terceiros e a explicação de permissões visíveis na raiz.
- Não ative “Open source” em descrições ou badges enquanto a licença continuar proibindo redistribuição e versões modificadas.

## 6. Checagem após publicar

Abra a release numa janela privada e teste o download dos dois ZIPs. Extraia o principal, carregue a pasta no navegador, confira a tela de permissões, teste o Picture-in-Picture e a barra do Instagram, importe o módulo de testes e verifique se os links do README abrem corretamente.

Confira também a soma SHA-256 local antes do upload com `SHA256SUMS.txt`; depois de baixar a release, gere a soma novamente e compare. A soma verifica integridade do arquivo, mas não autentica o autor do upload.

# Segurança

Esta página descreve como relatar problemas de segurança na Caixota. A revisão da versão 0.1.0 está em [docs/REVISAO-SEGURANCA-0.1.0.md](docs/REVISAO-SEGURANCA-0.1.0.md). Ela não é uma auditoria independente nem certificação.

## Relatar uma vulnerabilidade

Depois de criar o repositório, ative **Private vulnerability reporting** em **Settings → Code security and analysis**. Use o canal privado do GitHub para enviar detalhes reproduzíveis. Não publique credenciais, dados pessoais, arquivos de usuários ou instruções exploráveis em issues públicas.

Se o relato privado ainda não estiver habilitado, não publique detalhes exploráveis em uma issue pública. Peça ao responsável pelo projeto um canal privado antes de compartilhar uma prova de conceito.

## Limites conhecidos

- A versão 0.1.0 declara acesso a `<all_urls>` e injeta scripts de conteúdo em páginas comuns. Veja o manifesto e [PRIVACY.md](PRIVACY.md).
- Módulos de terceiros são isolados por sandbox, mas não autenticados ou certificados. Um módulo ainda pode consumir recursos, apresentar conteúdo enganoso ou causar travamentos.
- Ferramentas que chamam provedores externos transmitem os dados necessários à ação selecionada. A lista está em [PRIVACY.md](PRIVACY.md).
- O cofre local não substitui um gerenciador de senhas auditado. Mantenha uma cópia segura dos dados importantes.
- A Caixota não promete segurança absoluta, disponibilidade permanente nem ausência de erros.

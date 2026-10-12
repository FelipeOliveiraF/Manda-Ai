# Marca e consentimento Google — Mostra aí

Este documento registra a configuração profissional planejada para o login do Mostra aí. A alteração final é feita no Google Cloud Console do projeto que possui o OAuth Client usado pelo site.

## Identidade do aplicativo

- Nome do app: `Mostra aí`
- E-mail de suporte: `felu.leo2016@gmail.com`
- Página inicial atual: `https://grupo-dos-amigos-tela.flof0.chatgpt.site/`
- Política de privacidade: `https://grupo-dos-amigos-tela.flof0.chatgpt.site/privacy`
- Termos de uso: `https://grupo-dos-amigos-tela.flof0.chatgpt.site/terms`
- Público: externo
- Escopos solicitados: somente identidade básica (`openid`, `email` e `profile`)

## Configuração no Google Cloud

1. Em Google Auth Platform, preencher Branding com o nome, o e-mail de suporte e os links acima.
2. Em Audience, manter o app como externo e publicar quando os testes estiverem concluídos.
3. Em Clients, abrir o cliente Web do Mostra aí e manter a origem JavaScript atual autorizada.
4. Quando existir um domínio próprio, adicionar a nova origem HTTPS ao cliente, trocar os links públicos e cadastrar o domínio em Branding.
5. Se o Google solicitar, comprovar a propriedade do domínio no Search Console e enviar a marca para verificação.

## Critério de conclusão

A etapa termina quando a tela de escolha de conta mostra “Prosseguir para Mostra aí” — ou o domínio verificado do produto — em vez do endereço técnico do Supabase. Isso não pode ser garantido apenas por uma alteração no código do site.

# Migração React — etapa 1.5

## Objetivo

Criar uma base moderna e escalável sem interromper as funcionalidades já validadas do Mostra aí.

## Entregue nesta etapa

- React, TypeScript, Vite e Tailwind configurados.
- Aplicação atual renderizada dentro da raiz React.
- Supabase e PeerJS instalados como dependências versionadas, sem CDNs de execução.
- Worker de produção adaptado para servir os novos bundles.
- Componentes-base: botão, campo, avatar, badge, modal e tooltip.
- Contrato de compatibilidade que preserva IDs, seletores, Supabase, WebRTC e todos os eventos atuais.
- Build, verificação de tipos, testes de regressão e preview local automatizados.

## Etapa 2 concluída

- `AppShell`, `Sidebar`, `RoomHeader`, `Stage`, `MediaControls` e `ChatPanel` agora são componentes React nativos.
- A navegação lateral, o cabeçalho, o estado vazio e o painel de conversa receberam uma camada visual comercial responsiva.
- Login e modais permanecem isolados em superfícies temporárias de compatibilidade.
- Um teste compara os IDs do produto original com os IDs renderizados pela nova arquitetura.

## Próximas etapas

## Etapa 3 concluída

- A pré-entrada agora é um componente React nativo, com prévia de câmera, nome por sala, seletores de microfone e câmera e controles mais claros.
- O palco de chamada ganhou indicador ao vivo, tiles refinados, destaque visual de quem está falando e uma barra flutuante de controles.
- Qualquer vídeo pode ser colocado em foco ou em tela cheia, mantendo a identidade visual do Mostra aí.
- Reações e gestos foram integrados ao novo acabamento visual.
- A negociação WebRTC e as regras de mídia existentes foram preservadas.

## Próximas etapas

## Etapa 4 concluída

- Login, criação e personalização de salas agora são superfícies React nativas.
- Perfil, foto do usuário e configuração de áudio e vídeo foram migrados para componentes próprios.
- Gestão de membros, convites gerenciáveis e aceite de convite agora usam componentes React.
- As rotas legais continuam renderizadas diretamente pelo servidor para carregamento independente e receberam integração visual com o produto.
- A camada `LegacySurface` deixou de participar da interface em execução.

## Próximas etapas

### 5. Remoção da compatibilidade

Converter o runtime atual em hooks e serviços TypeScript, adicionar testes de integração e remover `LegacySurface` quando não houver mais dependências dela.

## Regra de segurança da migração

Cada etapa deve manter o comportamento funcional anterior, os controles de acesso no Supabase e a negociação WebRTC. A substituição será feita por área, com teste antes de publicar.

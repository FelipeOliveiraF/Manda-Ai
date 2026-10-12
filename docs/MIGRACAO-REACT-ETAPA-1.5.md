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

## Etapa 5 concluída

- O aplicativo não carrega mais `/legacy-app.js`; o runtime agora é um módulo do bundle React.
- A inicialização passou para o hook `useApplicationRuntime`, protegido contra execução duplicada no modo estrito do React.
- Supabase, Google Identity, PeerJS e dispositivos de mídia foram isolados em serviços TypeScript.
- O runtime pesado e suas dependências são carregados sob demanda em chunks separados, reduzindo o bundle inicial de aproximadamente 530 kB para 268 kB.
- Um teste de integração confirma injeção dos serviços, divisão de código e ausência da antiga rota de compatibilidade.
- O empacotador e o teste do artefato verificam e servem todos os chunks gerados.

## Próximos investimentos técnicos

- Migrar gradualmente os estados internos de sala e chamada para stores e hooks menores.
- Adicionar testes de navegador com duas sessões reais para WebRTC, moderação e convites.
- Monitorar erros de mídia e conexão em produção.

## Regra de segurança da migração

Cada etapa deve manter o comportamento funcional anterior, os controles de acesso no Supabase e a negociação WebRTC. A substituição será feita por área, com teste antes de publicar.

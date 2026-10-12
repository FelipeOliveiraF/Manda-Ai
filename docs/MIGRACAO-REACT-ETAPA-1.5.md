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

## Próximas etapas

### 2. Shell nativo em React

Migrar a navegação lateral, cabeçalho, lista de salas, estados vazios e estrutura responsiva para componentes React.

### 3. Experiência de chamada

Migrar pré-entrada, grade de participantes, destaque de compartilhamento, controles de áudio/vídeo e modos de tela.

### 4. Telas complementares

Migrar membros, convites, perfil, dispositivos, login, páginas de convite e telas legais.

### 5. Remoção da compatibilidade

Converter o runtime atual em hooks e serviços TypeScript, adicionar testes de integração e remover `LegacySurface` quando não houver mais dependências dela.

## Regra de segurança da migração

Cada etapa deve manter o comportamento funcional anterior, os controles de acesso no Supabase e a negociação WebRTC. A substituição será feita por área, com teste antes de publicar.

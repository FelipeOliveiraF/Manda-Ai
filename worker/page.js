export const page = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#17181d">
  <meta name="description" content="Mostra aí: salas privadas com tela, câmera, áudio e chat.">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/app.css">
  <title>Mostra aí</title>
</head>
<body>
  <section class="auth-screen" id="authScreen">
    <div class="auth-brand"><span class="brand-mark">↗</span><span>Mostra aí</span></div>
    <div class="auth-card">
      <div class="auth-kicker">SEU LUGAR, SUA GALERA</div>
      <h1>Entra aí.<br><span>Tem coisa pra mostrar.</span></h1>
      <p>Salas privadas para compartilhar tela, ligar câmera, conversar e mandar mensagem — sem montar reunião.</p>
      <div class="invite-preview hidden" id="loginInvitePreview">
        <span class="invite-icon">#</span>
        <div><small>Você foi convidado para</small><strong id="loginInviteName">uma sala</strong></div>
      </div>
      <div class="google-slot" id="googleButton"></div>
      <p class="auth-status" id="authStatus">Entre com o Google para continuar.</p>
      <p class="auth-legal">Ao entrar, você concorda com os <a href="/terms">Termos</a> e a <a href="/privacy">Privacidade</a>.</p>
    </div>
    <div class="auth-orb orb-one"></div><div class="auth-orb orb-two"></div>
  </section>

  <div class="app hidden" id="app">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-head">
        <a class="wordmark" href="/" aria-label="Mostra aí"><span class="brand-mark">↗</span><span>Mostra aí</span></a>
        <button class="square-button" id="closeSidebar" title="Fechar menu">×</button>
      </div>
      <div class="rooms-heading"><span>SUAS SALAS</span><button id="newRoom" title="Criar sala">＋</button></div>
      <div class="rooms-list" id="roomsList"></div>
      <button class="new-room-button" id="newRoomWide"><span>＋</span> Criar nova sala</button>
      <div class="account-card">
        <span class="account-avatar" id="accountAvatar">A</span>
        <div class="account-copy"><strong id="accountName">Amigo</strong><small>Disponível</small></div>
        <button id="logoutButton" title="Sair da conta">↪</button>
      </div>
    </aside>

    <main class="workspace">
      <header class="room-header">
        <div class="room-header-left">
          <button class="mobile-menu" id="openSidebar">☰</button>
          <span class="hash">#</span>
          <div><strong id="roomTitle">Escolha uma sala</strong><small id="roomSubtitle">Suas salas ficam salvas aqui</small></div>
        </div>
        <div class="room-actions">
          <span class="participant-count" id="participantCount">0 online</span>
          <button class="header-button" id="inviteButton" disabled>Convidar</button>
          <button class="square-button" id="toggleChat" title="Abrir ou fechar chat">☷</button>
        </div>
      </header>

      <div class="room-layout">
        <section class="stage-panel">
          <div class="empty-stage" id="emptyStage">
            <div class="empty-icon">↗</div>
            <h2>Escolha uma sala</h2>
            <p>Entre em uma sala da lateral ou crie uma nova para começar.</p>
            <button class="primary-button" id="emptyCreate">Criar uma sala</button>
          </div>
          <div class="media-stage hidden" id="mediaStage">
            <div class="connection-note" id="connectionNote"><i></i><span>Conectando à sala…</span></div>
            <div class="media-grid" id="mediaGrid"></div>
          </div>
          <div class="media-controls hidden" id="mediaControls">
            <button class="control-button" id="micButton"><span>◉</span><small>Microfone</small></button>
            <button class="control-button" id="cameraButton"><span>▣</span><small>Câmera</small></button>
            <button class="control-button share" id="screenButton"><span>↗</span><small>Compartilhar tela</small></button>
            <button class="control-button danger" id="leaveButton"><span>×</span><small>Sair</small></button>
          </div>
        </section>

        <aside class="chat-panel" id="chatPanel">
          <div class="chat-head"><div><strong>Conversa</strong><small id="chatRoomName">Selecione uma sala</small></div><button id="closeChat">×</button></div>
          <div class="messages" id="messages"><div class="chat-empty"><span>✦</span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div></div>
          <form class="message-form" id="messageForm">
            <input id="messageInput" maxlength="2000" autocomplete="off" placeholder="Escolha uma sala para conversar" disabled>
            <button type="submit" disabled id="sendMessage">↑</button>
          </form>
        </aside>
      </div>
    </main>
  </div>

  <div class="modal-backdrop hidden" id="createModal">
    <form class="modal" id="createForm">
      <button class="modal-close" type="button" data-close="createModal">×</button>
      <div class="modal-icon">#</div><h2>Criar uma sala</h2>
      <p>Ela ficará salva na sua conta e poderá ser reaberta quando quiser.</p>
      <label for="roomNameInput">Nome da sala</label>
      <input id="roomNameInput" maxlength="60" placeholder="Ex.: Sala de estudos" required>
      <button class="primary-button full" type="submit">Criar sala</button>
      <p class="form-error" id="createError"></p>
    </form>
  </div>

  <div class="modal-backdrop hidden" id="inviteModal">
    <div class="modal">
      <button class="modal-close" type="button" data-close="inviteModal">×</button>
      <div class="modal-icon">↗</div><h2>Convide a galera</h2>
      <p>Quem receber o link entra com o Google e confirma a entrada. Não precisa de senha.</p>
      <label for="inviteLink">Link de convite</label>
      <div class="copy-field"><input id="inviteLink" readonly><button id="copyInvite" type="button">Copiar</button></div>
      <p class="form-help">O link dá acesso à sala. Compartilhe apenas com quem você conhece.</p>
    </div>
  </div>

  <div class="modal-backdrop hidden" id="acceptInviteModal">
    <div class="modal invite-accept">
      <div class="modal-icon">#</div><span class="modal-kicker">CONVITE PARA UMA SALA</span>
      <h2 id="acceptInviteName">Sala</h2>
      <p><span id="acceptInviter">Um amigo</span> convidou você para entrar. A sala ficará salva na sua lateral.</p>
      <button class="primary-button full" id="acceptInvite" type="button">Aceitar convite</button>
      <button class="text-button" id="declineInvite" type="button">Agora não</button>
      <p class="form-error" id="inviteError"></p>
    </div>
  </div>

  <div class="toast" id="toast"></div>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;

const APP_VERSION = '1.14';

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
    <div class="auth-brand"><span class="brand-mark">M</span><span>Mostra aí</span></div>
    <div class="auth-card">
      <div class="auth-emblem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0118 0v3"/><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="17" y="12" width="4" height="9" rx="2"/></svg></div>
      <h1>Bom te ver por aqui.</h1>
      <p>Sua galera, suas salas. Entre para conversar e compartilhar o que está rolando.</p>
      <div class="invite-preview hidden" id="loginInvitePreview">
        <span class="invite-icon">#</span>
        <div><small>Você foi convidado para</small><strong id="loginInviteName">uma sala</strong></div>
      </div>
      <div class="google-slot" id="googleButton"></div>
      <p class="auth-status" id="authStatus">Entre com o Google para continuar.</p>
      <p class="auth-legal">Ao entrar, você concorda com os <a href="/terms">Termos</a> e a <a href="/privacy">Privacidade</a>.</p>
      <span class="version-badge">Versão ${APP_VERSION}</span>
    </div>
  </section>

  <div class="app hidden" id="app">
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-head">
        <a class="wordmark" href="/" aria-label="Mostra aí"><span class="brand-mark">M</span><span>Mostra aí</span></a>
        <button class="square-button" id="closeSidebar" title="Fechar menu">×</button>
      </div>
      <div class="sidebar-intro"><h2>Seu espaço</h2><p>Encontre sua galera por aqui.</p></div><label class="room-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="roomSearch" placeholder="Buscar sala" aria-label="Buscar sala"></label><div class="rooms-heading"><span>SUAS SALAS</span><button id="newRoom" title="Criar sala" aria-label="Criar sala"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>
      <div class="rooms-list" id="roomsList"></div>
      <button class="new-room-button" id="newRoomWide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg> Criar nova sala</button><button class="device-sidebar" id="sidebarDevices"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0118 0v3"/><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="17" y="12" width="4" height="9" rx="2"/></svg> Áudio e vídeo</button>
      <div class="sidebar-version"><span class="version-dot" aria-hidden="true"></span>Versão ${APP_VERSION}</div>
      <div class="account-card">
        <button class="account-avatar" id="accountAvatar" title="Editar perfil" aria-label="Editar perfil">A</button>
        <div class="account-copy"><strong id="accountName">Amigo</strong><small>Disponível</small></div>
        <button id="profileButton" title="Editar perfil" aria-label="Editar perfil"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/></svg></button><button id="logoutButton" title="Sair da conta" aria-label="Sair da conta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3H4v18h5m6-14 5 5-5 5m-6-5h11"/></svg></button>
      </div>
    </aside>

    <main class="workspace">
      <header class="room-header">
        <div class="room-header-left">
          <button class="mobile-menu" id="openSidebar" aria-label="Abrir salas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
          <span class="header-room-avatar" id="headerRoomAvatar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0118 0v3"/><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="17" y="12" width="4" height="9" rx="2"/></svg></span>
          <div><strong id="roomTitle">Escolha uma sala</strong><small id="roomSubtitle">Suas salas ficam salvas aqui</small></div>
        </div>
        <div class="room-actions">
          <span class="participant-count" id="participantCount">0 online</span>
          <button class="identity-button hidden" id="roomIdentityButton" title="Alterar seu nome nesta sala"><span class="account-avatar" id="roomIdentityAvatar">A</span><span class="identity-copy"><strong id="roomIdentityName">Amigo</strong><small id="roomIdentityRole">membro</small></span></button>
          <button class="square-button hidden" id="manageRoomButton" title="Ver membros da sala" aria-label="Ver membros da sala"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0112 0v3M17 9a3 3 0 010 6m2 1a5 5 0 012 4v1"/></svg></button>
          <button class="square-button hidden" id="roomSettingsButton" title="Personalizar sala" aria-label="Personalizar sala"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 3-1 3-3 1 1 3-2 2 2 2-1 3 3 1 1 3h6l1-3 3-1-1-3 2-2-2-2 1-3-3-1-1-3z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="header-button" id="inviteButton" aria-label="Convidar pessoas" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0112 0v3M16 5a3 3 0 010 6m2 3a5 5 0 013 5v2"/></svg><span>Convidar</span></button>
          <button class="square-button" id="toggleChat" title="Abrir ou fechar chat" aria-label="Abrir ou fechar chat" aria-pressed="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11a9 9 0 01-9 9H4l-2 2V11a9 9 0 0118-4"/><path d="M7 9h10M7 13h7"/></svg></button>
        </div>
      </header>

      <div class="room-layout">
        <section class="stage-panel">
          <div class="empty-stage" id="emptyStage">
            <div class="empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0118 0v3"/><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="17" y="12" width="4" height="9" rx="2"/></svg></div>
            <h2>Onde vamos nos encontrar?</h2>
            <p>Abra uma sala da sua lista ou crie um lugar só de vocês.</p>
            <button class="primary-button" id="emptyCreate">Criar uma sala</button>
          </div>
          <div class="media-stage hidden" id="mediaStage">
            <div class="connection-note" id="connectionNote"><i></i><span>Conectando à sala…</span></div>
            <div class="media-grid" id="mediaGrid"></div>
          </div>
          <div class="media-controls hidden" id="mediaControls">
            <div class="control-group"><button class="control-button" id="micButton" aria-label="Ligar microfone" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0014 0v-2M12 19v3m-4 0h8"/></svg><small>Ligar microfone</small></button><button class="device-arrow" id="micDevices" title="Escolher microfone" aria-label="Escolher microfone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button></div>
            <div class="control-group"><button class="control-button" id="cameraButton" aria-label="Ligar câmera" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 10 6-4v12l-6-4"/></svg><small>Ligar câmera</small></button><button class="device-arrow" id="cameraDevices" title="Escolher câmera" aria-label="Escolher câmera"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 6-6 6 6"/></svg></button></div>
            <button class="control-button share" id="screenButton" aria-label="Compartilhar tela" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="3"/><path d="M8 21h8m-4-4v4m-4-11 4-4 4 4m-4-4v8"/></svg><small>Compartilhar tela</small></button>
            <span class="control-divider"></span>
            <button class="control-button danger" id="leaveButton" title="Sair da chamada" aria-label="Sair da chamada"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16v-4c4-5 14-5 18 0v4l-5-1v-3a12 12 0 00-8 0v3z"/></svg><small>Sair</small></button>
          </div>
        </section>

        <aside class="chat-panel" id="chatPanel">
          <div class="chat-head"><div><strong id="activeChannelName">Conversa</strong><small id="chatRoomName">Selecione uma sala</small></div><div class="chat-head-actions"><button class="hidden" id="clearChannel" title="Limpar este chat" aria-label="Limpar este chat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6"/></svg></button><button id="closeChat" aria-label="Fechar conversa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></div></div>
          <div class="channel-tabs" id="channelTabs"></div>
          <div class="messages" id="messages"><div class="chat-empty"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2V11.5a8.5 8.5 0 0 1 18 0Z"/><path d="M7 9h10M7 13h6"/></svg></span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div></div>
          <form class="message-form" id="messageForm">
            <input aria-label="Mensagem" id="messageInput" maxlength="2000" autocomplete="off" placeholder="Escolha uma sala para conversar" disabled>
            <button type="submit" disabled id="sendMessage" aria-label="Enviar mensagem"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 19 9-19 9 4-9-4-9zm4 9h15"/></svg></button>
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
      <div class="modal-icon">＋</div><h2>Convidar pessoas</h2>
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

  
  <div class="modal-backdrop hidden" id="profileModal">
    <form class="modal settings-modal" id="profileForm">
      <button class="modal-close" type="button" data-close="profileModal" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
      <h2>Seu perfil</h2><p>Como você aparece para sua galera.</p>
      <div class="photo-editor"><span class="photo-preview" id="profilePhotoPreview">M</span><div><label class="upload-button" for="profilePhoto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg> Alterar foto</label><input class="file-input" type="file" id="profilePhoto" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG ou WebP • até 5 MB</small><button class="text-button" id="removeProfilePhoto" type="button">Remover foto</button></div></div>
      <label for="profileNameInput">Nome de exibição</label><input id="profileNameInput" maxlength="60" required autocomplete="nickname">
      <p class="form-error" id="profileError" role="alert"></p><button class="primary-button full" type="submit">Salvar alterações</button>
    </form>
  </div>
  <div class="modal-backdrop hidden" id="roomSettingsModal">
    <form class="modal settings-modal" id="roomSettingsForm">
      <button class="modal-close" type="button" data-close="roomSettingsModal" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
      <h2>Personalizar sala</h2><p>Um nome e uma foto para chamar de sua.</p>
      <div class="photo-editor"><span class="photo-preview room-photo" id="roomPhotoPreview">#</span><div><label class="upload-button" for="roomPhoto"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1"/><path d="m3 17 6-6 4 4 3-3 5 5"/></svg> Alterar foto</label><input class="file-input" type="file" id="roomPhoto" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG ou WebP • até 5 MB</small><button class="text-button" id="removeRoomPhoto" type="button">Remover foto</button></div></div>
      <label for="editRoomName">Nome da sala</label><input id="editRoomName" maxlength="60" required>
      <p class="form-error" id="roomSettingsError" role="alert"></p><button class="primary-button full" type="submit">Salvar alterações</button>
    </form>
  </div>
  <div class="modal-backdrop hidden" id="roomIdentityModal">
    <form class="modal" id="roomIdentityForm">
      <button class="modal-close" type="button" data-close="roomIdentityModal">×</button>
      <div class="modal-icon">@</div><h2>Seu nome nesta sala</h2>
      <p>Este nome vale apenas aqui. Em outras salas, você pode usar outro.</p>
      <label for="roomNicknameInput">Nome na sala</label>
      <input id="roomNicknameInput" maxlength="60" required autocomplete="nickname">
      <p class="form-error" id="roomIdentityError" role="alert"></p>
      <button class="primary-button full" type="submit">Salvar nome</button>
    </form>
  </div>
  <div class="modal-backdrop hidden" id="channelModal">
    <form class="modal" id="channelForm">
      <button class="modal-close" type="button" data-close="channelModal">×</button>
      <div class="modal-icon">#</div><h2>Novo chat de texto</h2>
      <p>Crie outro assunto dentro desta mesma sala.</p>
      <label for="channelNameInput">Nome do chat</label>
      <input id="channelNameInput" maxlength="40" placeholder="Ex.: jogos, estudos, avisos" required>
      <p class="form-error" id="channelError" role="alert"></p>
      <button class="primary-button full" type="submit">Criar chat</button>
    </form>
  </div>
  <div class="modal-backdrop hidden" id="manageRoomModal">
    <div class="modal manage-modal">
      <button class="modal-close" type="button" data-close="manageRoomModal">×</button>
      <div class="settings-heading"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0112 0v3M17 9a3 3 0 010 6m2 1a5 5 0 012 4v1"/></svg><div><h2>Membros da sala</h2><p id="memberSummary">Todas as pessoas que têm acesso aparecem aqui.</p></div></div>
      <div class="member-list" id="memberList"></div>
      <p class="form-error" id="manageRoomError" role="alert"></p>
    </div>
  </div>
  <div class="modal-backdrop hidden" id="devicesModal">
    <div class="modal devices-modal">
      <button class="modal-close" type="button" data-close="devicesModal" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
      <div class="settings-heading"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 14v-3a9 9 0 0118 0v3"/><rect x="3" y="12" width="4" height="9" rx="2"/><rect x="17" y="12" width="4" height="9" rx="2"/></svg><div><h2>Áudio e vídeo</h2><p>Deixe tudo pronto para a conversa.</p></div></div>
      <div class="device-sections">
        <section><label for="microphoneSelect">Microfone</label><select id="microphoneSelect"><option value="">Padrão do sistema</option></select><div class="device-test"><button class="secondary-button" id="testMic" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0014 0v-2M12 19v3m-4 0h8"/></svg> Testar microfone</button><meter id="micLevel" min="0" max="100" value="0" aria-label="Nível do microfone"></meter></div><p class="device-help">Fale algo e veja se o nível de áudio se move.</p></section>
        <section><label for="cameraSelect">Câmera</label><select id="cameraSelect"><option value="">Padrão do sistema</option></select><div class="camera-preview"><video id="cameraPreview" autoplay muted playsinline></video><span id="cameraPreviewHint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 10 6-4v12l-6-4"/></svg>Sua prévia aparece aqui</span></div><button class="secondary-button" id="testCamera" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="12" height="14" rx="3"/><path d="m15 10 6-4v12l-6-4"/></svg> Testar câmera</button></section>
      </div>
      <p class="device-help" id="deviceHint" role="status">Ao testar, o navegador pede acesso ao dispositivo. A prévia fica só com você.</p>
      <button class="primary-button full" type="button" data-close="devicesModal">Pronto</button>
    </div>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;

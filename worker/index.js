const page = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b0d12">
    <meta name="description" content="Compartilhamento de tela rápido e privado para o Grupo dos Amigos.">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <title>Grupo dos Amigos — Tela</title>
    <style>
      :root { color-scheme: dark; --bg:#08090c; --panel:rgba(22,24,31,.82); --line:rgba(255,255,255,.10); --text:#f7f8fb; --muted:#9ea3af; --lime:#c9ff4a; --danger:#ff6477; --shadow:0 28px 80px rgba(0,0,0,.45); }
      * { box-sizing:border-box; }
      html { min-height:100%; background:var(--bg); }
      body { min-height:100vh; margin:0; color:var(--text); background:radial-gradient(900px 500px at 12% -10%,rgba(201,255,74,.11),transparent 60%),radial-gradient(700px 500px at 95% 110%,rgba(114,79,255,.12),transparent 65%),var(--bg); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; -webkit-font-smoothing:antialiased; }
      button,input { font:inherit; } button { border:0; }
      .noise { position:fixed; inset:0; pointer-events:none; opacity:.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E"); }
      .shell { width:min(1180px,calc(100% - 32px)); margin:0 auto; }
      header { height:78px; display:flex; align-items:center; justify-content:space-between; }
      .brand { display:flex; align-items:center; gap:11px; font-weight:760; letter-spacing:-.02em; }
      .mark { width:31px; height:31px; display:grid; place-items:center; border-radius:9px; color:#0b0d0a; background:var(--lime); box-shadow:0 0 32px rgba(201,255,74,.25); }
      .brand small { margin-left:4px; color:var(--muted); font-weight:500; }
      .secure { display:flex; gap:8px; align-items:center; color:var(--muted); font-size:13px; }
      .secure i { width:7px; height:7px; background:var(--lime); border-radius:50%; box-shadow:0 0 12px var(--lime); }
      main { min-height:calc(100vh - 78px); display:grid; place-items:center; padding:30px 0 68px; }
      .lobby { width:100%; display:grid; grid-template-columns:1.08fr .92fr; align-items:center; gap:clamp(44px,8vw,116px); }
      .eyebrow { color:var(--lime); font-weight:760; font-size:12px; letter-spacing:.14em; text-transform:uppercase; }
      h1 { margin:14px 0 20px; font-size:clamp(48px,7vw,84px); line-height:.96; letter-spacing:-.065em; max-width:760px; }
      h1 span { color:var(--muted); }
      .lead { margin:0; color:#b9bdc6; font-size:clamp(17px,2vw,20px); line-height:1.55; max-width:610px; }
      .steps { display:flex; gap:22px; margin-top:36px; color:var(--muted); font-size:13px; }
      .steps span { display:flex; gap:8px; align-items:center; }
      .steps b { width:23px; height:23px; display:grid; place-items:center; border:1px solid var(--line); border-radius:50%; color:var(--text); font-size:11px; }
      .card { position:relative; padding:28px; border-radius:26px; background:linear-gradient(145deg,rgba(29,31,40,.95),rgba(15,17,22,.92)); border:1px solid var(--line); box-shadow:var(--shadow); overflow:hidden; }
      .card:before { content:""; position:absolute; inset:0 auto auto 0; width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(201,255,74,.7),transparent); }
      .roomline { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:26px; }
      .roomline p { margin:0 0 5px; color:var(--muted); font-size:12px; }
      .roomline h2 { margin:0; font-size:21px; letter-spacing:-.025em; }
      .pill { padding:7px 10px; border-radius:99px; background:rgba(201,255,74,.08); color:var(--lime); font-size:11px; font-weight:700; white-space:nowrap; }
      .mode-tabs { display:grid; grid-template-columns:1fr 1fr; gap:5px; padding:5px; margin-bottom:22px; border:1px solid var(--line); border-radius:14px; background:rgba(5,6,9,.45); }
      .tabbtn { min-height:40px; border-radius:10px; color:var(--muted); background:transparent; font-size:13px; font-weight:750; cursor:pointer; }
      .tabbtn.active { color:#0b0d0a; background:var(--lime); box-shadow:0 5px 18px rgba(201,255,74,.12); }
      .fieldhint { margin:7px 2px 0; color:#747985; font-size:11px; line-height:1.4; }
      .hidden { display:none !important; }
      label { display:block; margin:16px 0 8px; color:#d8dae0; font-size:13px; font-weight:650; }
      .inputwrap { position:relative; }
      input { width:100%; height:50px; padding:0 45px 0 15px; border:1px solid var(--line); border-radius:13px; outline:none; color:var(--text); background:rgba(5,6,9,.55); transition:.2s; }
      input:focus { border-color:rgba(201,255,74,.55); box-shadow:0 0 0 4px rgba(201,255,74,.07); }
      input::placeholder { color:#676c76; }
      .reveal { position:absolute; right:8px; top:7px; width:36px; height:36px; border-radius:9px; color:var(--muted); background:transparent; cursor:pointer; }
      .actions { display:grid; grid-template-columns:1fr; gap:10px; margin-top:22px; }
      .btn { min-height:50px; padding:0 16px; border-radius:13px; font-weight:760; cursor:pointer; transition:transform .16s,background .16s,opacity .16s; }
      .btn:hover { transform:translateY(-1px); } .btn:active { transform:translateY(1px); }
      .primary { color:#0b0d0a; background:var(--lime); } .primary:hover { background:#d4ff6e; }
      .secondary { color:var(--text); background:#272a33; border:1px solid var(--line); }
      .fine { margin:16px 2px 0; color:#747985; font-size:11px; line-height:1.45; text-align:center; }
      .error { display:none; margin-top:14px; padding:10px 12px; border-radius:10px; color:#ffc6cc; background:rgba(255,100,119,.10); border:1px solid rgba(255,100,119,.2); font-size:12px; }
      .stage { display:none; width:100%; align-self:stretch; }
      .stagebar { height:62px; display:flex; align-items:center; justify-content:space-between; gap:14px; }
      .stageleft,.stageright { display:flex; align-items:center; gap:11px; }
      .live { display:flex; align-items:center; gap:7px; padding:7px 10px; color:#ffd7dc; background:rgba(255,100,119,.1); border-radius:99px; font-size:11px; font-weight:800; letter-spacing:.08em; }
      .live i { width:7px; height:7px; background:var(--danger); border-radius:50%; animation:pulse 1.4s infinite; }
      .roomtitle { font-weight:750; letter-spacing:-.02em; } .roomtitle small { color:var(--muted); font-weight:500; }
      .iconbtn { width:39px; height:39px; display:grid; place-items:center; border-radius:11px; color:var(--text); background:#1b1e25; border:1px solid var(--line); cursor:pointer; }
      .stopbtn { width:auto; padding:0 14px; color:#ffc8ce; background:rgba(255,100,119,.10); border-color:rgba(255,100,119,.22); font-size:12px; font-weight:750; }
      .screen { position:relative; width:100%; height:calc(100vh - 170px); min-height:430px; display:grid; place-items:center; overflow:hidden; background:#020304; border:1px solid var(--line); border-radius:20px; box-shadow:var(--shadow); }
      video { width:100%; height:100%; object-fit:contain; background:#020304; }
      .waiting { position:absolute; inset:0; display:grid; place-items:center; padding:24px; text-align:center; background:radial-gradient(circle at center,#171a22,#07080b 68%); }
      .waitingbox { max-width:430px; } .orb { width:58px; height:58px; margin:0 auto 19px; display:grid; place-items:center; border-radius:18px; color:var(--lime); background:rgba(201,255,74,.08); border:1px solid rgba(201,255,74,.16); animation:breathe 2s infinite; }
      .waiting h3 { margin:0 0 8px; font-size:23px; letter-spacing:-.03em; } .waiting p { margin:0; color:var(--muted); line-height:1.5; }
      .viewerbadge { position:absolute; left:14px; bottom:14px; padding:8px 11px; border-radius:10px; color:#e7e8ec; background:rgba(5,6,8,.78); backdrop-filter:blur(10px); font-size:12px; border:1px solid rgba(255,255,255,.08); }
      .people { position:absolute; right:14px; top:14px; width:min(250px,calc(100% - 28px)); padding:12px; border-radius:14px; background:rgba(5,6,8,.80); border:1px solid rgba(255,255,255,.09); backdrop-filter:blur(14px); }
      .peoplehead { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:9px; color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
      .roomcode { color:var(--lime); font-weight:850; letter-spacing:.12em; }
      .peoplelist { display:flex; flex-wrap:wrap; gap:6px; }
      .person { max-width:100%; padding:6px 8px; border-radius:8px; background:rgba(255,255,255,.07); color:#e8e9ed; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .person.host:before { content:'●'; margin-right:5px; color:var(--lime); }
      @keyframes pulse { 50% { opacity:.35; box-shadow:0 0 0 6px rgba(255,100,119,.08); } }
      @keyframes breathe { 50% { transform:scale(1.04); box-shadow:0 0 40px rgba(201,255,74,.08); } }
      @media (max-width:820px) { .shell{width:min(100% - 22px,620px)} header{height:64px}.brand small,.secure span{display:none} main{min-height:calc(100vh - 64px);padding-top:16px}.lobby{grid-template-columns:1fr;gap:34px}h1{font-size:clamp(44px,14vw,68px)}.hero{text-align:center}.lead{margin-inline:auto}.steps{justify-content:center;flex-wrap:wrap}.card{padding:22px;border-radius:22px}.actions{grid-template-columns:1fr}.stagebar{height:56px}.roomtitle small{display:none}.screen{height:calc(100vh - 135px);min-height:350px;border-radius:15px} }
    </style>
  </head>
  <body>
    <div class="noise"></div>
    <div class="shell">
      <header><div class="brand"><span class="mark">↗</span> Amigos<span><small>/ tela</small></span></div><div class="secure"><i></i><span>Conexão direta entre amigos</span></div></header>
      <main>
        <section class="lobby" id="lobby">
          <div class="hero"><div class="eyebrow">Um clique. Sem reunião.</div><h1>Mostra aí.<br><span>A gente assiste.</span></h1><p class="lead">Uma sala simples para compartilhar sua tela enquanto todo mundo continua conversando no Discord.</p><div class="steps"><span><b>1</b> Entre na sala</span><span><b>2</b> Compartilhe ou assista</span><span><b>3</b> Pronto</span></div></div>
          <div class="card">
            <div class="roomline"><div><p id="cardEyebrow">Sua transmissão</p><h2 id="cardTitle">Criar uma sala</h2></div><span class="pill">● disponível</span></div>
            <div class="mode-tabs"><button class="tabbtn active" id="createTab" type="button">Criar sala</button><button class="tabbtn" id="joinTab" type="button">Entrar com ID</button></div>
            <label for="nickname">Seu apelido</label><div class="inputwrap"><input id="nickname" maxlength="24" autocomplete="nickname" placeholder="Como vão te ver"></div>
            <div id="createFields"><label for="roomName">Nome da sala</label><div class="inputwrap"><input id="roomName" maxlength="40" value="Grupo dos Amigos" placeholder="Ex.: Grupo dos Amigos"></div><p class="fieldhint">Um ID exclusivo será criado automaticamente.</p></div>
            <div id="joinFields" class="hidden"><label for="roomCodeInput">ID da sala</label><div class="inputwrap"><input id="roomCodeInput" maxlength="12" autocapitalize="characters" placeholder="Ex.: 7KQ2MX"></div><p class="fieldhint">O ID aparece no link enviado por quem criou.</p></div>
            <label for="password">Senha da sala</label><div class="inputwrap"><input id="password" type="password" autocomplete="current-password" placeholder="A senha combinada"><button class="reveal" id="reveal" type="button" aria-label="Mostrar senha">◉</button></div>
            <div class="actions"><button class="btn primary" id="mainAction" type="button">Criar sala e compartilhar</button></div>
            <div class="error" id="error" role="alert"></div><p class="fine">A senha não é enviada nem salva. A sala existe enquanto quem criou estiver compartilhando.</p>
          </div>
        </section>
        <section class="stage" id="stage">
          <div class="stagebar"><div class="stageleft"><span class="live"><i></i> AO VIVO</span><span class="roomtitle"><span id="stageRoomName">Sala</span> <small id="status">· conectando…</small></span></div><div class="stageright"><button class="iconbtn" id="copy" title="Copiar convite">↗</button><button class="iconbtn" id="fullscreen" title="Tela cheia">⛶</button><button class="iconbtn stopbtn" id="leave">Sair</button></div></div>
          <div class="screen" id="screen"><video id="video" autoplay playsinline></video><div class="waiting" id="waiting"><div class="waitingbox"><div class="orb">⌁</div><h3 id="waitingTitle">Procurando a transmissão…</h3><p id="waitingText">Assim que alguém compartilhar a tela, ela aparece aqui automaticamente.</p></div></div><div class="people"><div class="peoplehead"><span>Na sala</span><span class="roomcode" id="stageRoomCode">—</span></div><div class="peoplelist" id="peopleList"></div></div><div class="viewerbadge" id="viewerBadge">Você está na sala</div></div>
        </section>
      </main>
    </div>
    <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
    <script>
      const $ = (selector) => document.querySelector(selector);
      const lobby = $('#lobby'), stage = $('#stage'), video = $('#video'), waiting = $('#waiting'), errorBox = $('#error'), statusText = $('#status'), nickInput = $('#nickname'), passwordInput = $('#password'), roomNameInput = $('#roomName'), roomCodeInput = $('#roomCodeInput');
      let peer = null, localStream = null, mode = null, lobbyMode = 'create', viewerCount = 0, currentRoomCode = '', currentRoomName = '', hostName = '', viewerConnection = null;
      const connections = new Set(), participants = new Map();
      nickInput.value = localStorage.getItem('amigos-nickname') || '';
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

      function setLobbyMode(next) {
        lobbyMode = next;
        const creating = next === 'create';
        $('#createTab').classList.toggle('active', creating);
        $('#joinTab').classList.toggle('active', !creating);
        $('#createFields').classList.toggle('hidden', !creating);
        $('#joinFields').classList.toggle('hidden', creating);
        $('#cardEyebrow').textContent = creating ? 'Sua transmissão' : 'Sala de outra pessoa';
        $('#cardTitle').textContent = creating ? 'Criar uma sala' : 'Entrar em uma sala';
        $('#mainAction').textContent = creating ? 'Criar sala e compartilhar' : 'Entrar para assistir';
        errorBox.style.display = 'none';
      }

      function normalizeRoomCode(value) { return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12); }
      function generateRoomCode() { const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const bytes = crypto.getRandomValues(new Uint8Array(6)); return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join(''); }
      async function roomPeerId(code, password) { const bytes = new TextEncoder().encode('amigos-tela:' + code + ':' + password); const digest = await crypto.subtle.digest('SHA-256', bytes); return 'gda-' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32); }

      function validate() {
        const nickname = nickInput.value.trim(), password = passwordInput.value;
        const roomName = roomNameInput.value.trim();
        const roomCode = normalizeRoomCode(roomCodeInput.value);
        if (!nickname) return showError('Escolha um apelido para entrar.');
        if (lobbyMode === 'create' && !roomName) return showError('Dê um nome para a sala.');
        if (lobbyMode === 'join' && roomCode.length < 4) return showError('Digite um ID de sala válido.');
        if (password.length < 4) return showError('A senha precisa ter pelo menos 4 caracteres.');
        localStorage.setItem('amigos-nickname', nickname);
        errorBox.style.display = 'none';
        return { nickname, password, roomName, roomCode };
      }

      function showError(message) { errorBox.textContent = message; errorBox.style.display = 'block'; return null; }
      function makePeer(id) { return id ? new Peer(id, { debug:1 }) : new Peer({ debug:1 }); }
      function inviteUrl() { return location.origin + location.pathname + '?room=' + encodeURIComponent(currentRoomCode); }

      function enterStage(kind, info) {
        mode = kind;
        lobby.style.display = 'none';
        stage.style.display = 'block';
        $('#stageRoomName').textContent = currentRoomName || ('Sala ' + currentRoomCode);
        $('#stageRoomCode').textContent = currentRoomCode;
        $('#viewerBadge').textContent = kind === 'host' ? 'Você está compartilhando' : info.nickname + ' · assistindo';
        if (kind === 'host') { waiting.style.display = 'none'; video.muted = true; }
      }

      function renderParticipants(names) {
        const list = $('#peopleList');
        list.textContent = '';
        names.forEach((name, index) => { const item = document.createElement('span'); item.className = 'person' + (index === 0 ? ' host' : ''); item.textContent = name; list.appendChild(item); });
      }

      function participantNames() { return [hostName].concat(Array.from(participants.values())); }
      function updateHostStatus() { viewerCount = participants.size; statusText.textContent = viewerCount ? '· ' + viewerCount + (viewerCount === 1 ? ' pessoa assistindo' : ' pessoas assistindo') : '· sala aberta'; }
      function broadcastParticipants() { const message = { type:'participants', names:participantNames(), roomName:currentRoomName }; renderParticipants(message.names); connections.forEach((conn) => { if (conn.open) conn.send(message); }); updateHostStatus(); }

      async function createRoom(info) {
        try {
          localStream = await navigator.mediaDevices.getDisplayMedia({ video:{ frameRate:{ ideal:30,max:60 } }, audio:true });
          currentRoomCode = generateRoomCode();
          currentRoomName = info.roomName;
          hostName = info.nickname;
          history.replaceState(null, '', location.pathname + '?room=' + encodeURIComponent(currentRoomCode));
          const id = await roomPeerId(currentRoomCode, info.password);
          enterStage('host', info);
          renderParticipants([hostName]);
          video.srcObject = localStream;
          statusText.textContent = '· iniciando sala…';
          localStream.getVideoTracks()[0].addEventListener('ended', leaveRoom);
          peer = makePeer(id);
          peer.on('open', () => { statusText.textContent = '· sala aberta'; });
          peer.on('connection', (conn) => {
            connections.add(conn);
            conn.on('open', () => {
              participants.set(conn.peer, conn.metadata?.nickname || 'Amigo');
              broadcastParticipants();
              peer.call(conn.peer, localStream, { metadata:{ host:hostName,roomName:currentRoomName } });
            });
            conn.on('data', (data) => { if (data?.nickname) { participants.set(conn.peer, String(data.nickname).slice(0,24)); broadcastParticipants(); } });
            conn.on('close', () => { connections.delete(conn); participants.delete(conn.peer); broadcastParticipants(); });
          });
          peer.on('error', (err) => { if (err.type === 'unavailable-id') failStage('Esse ID já está em uso. Saia e crie outra sala.'); else failStage('Não consegui abrir a sala agora. Tente novamente em alguns segundos.'); });
        } catch (err) { if (!localStream) showError('O compartilhamento foi cancelado ou o navegador não deu permissão.'); }
      }

      async function joinRoom(info) {
        currentRoomCode = info.roomCode;
        currentRoomName = 'Sala ' + currentRoomCode;
        roomCodeInput.value = currentRoomCode;
        history.replaceState(null, '', location.pathname + '?room=' + encodeURIComponent(currentRoomCode));
        const id = await roomPeerId(currentRoomCode, info.password);
        enterStage('viewer', info);
        renderParticipants([info.nickname]);
        peer = makePeer();
        statusText.textContent = '· procurando transmissão…';
        peer.on('open', () => {
          const conn = peer.connect(id, { reliable:true, metadata:{ nickname:info.nickname } });
          viewerConnection = conn;
          const timeout = setTimeout(() => failStage('Sala não encontrada — confira o ID e a senha.'), 9000);
          conn.on('open', () => { clearTimeout(timeout); statusText.textContent = '· conectado'; conn.send({ type:'watch',nickname:info.nickname }); });
          conn.on('data', (data) => { if (data?.type === 'participants') { currentRoomName = data.roomName || currentRoomName; $('#stageRoomName').textContent = currentRoomName; renderParticipants(Array.isArray(data.names) ? data.names : []); } });
          conn.on('error', () => { clearTimeout(timeout); failStage('Não foi possível entrar na transmissão.'); });
          conn.on('close', () => { if (mode === 'viewer') failStage('A transmissão terminou.'); });
        });
        peer.on('call', (call) => {
          if (call.metadata?.roomName) { currentRoomName = call.metadata.roomName; $('#stageRoomName').textContent = currentRoomName; }
          call.answer();
          call.on('stream', (stream) => {
            video.srcObject = stream;
            waiting.style.display = 'none';
            statusText.textContent = '· ao vivo';
            video.play().catch(() => { waiting.style.display = 'grid'; $('#waitingTitle').textContent = 'Toque para começar'; $('#waitingText').textContent = 'O navegador bloqueou o início automático do vídeo.'; waiting.onclick = () => video.play().then(() => waiting.style.display = 'none'); });
            stream.getVideoTracks()[0]?.addEventListener('ended', () => failStage('A transmissão terminou.'));
          });
        });
        peer.on('error', (err) => { if (err.type === 'peer-unavailable') failStage('Sala não encontrada — confira o ID e a senha.'); else failStage('A conexão falhou. Confira sua internet e tente de novo.'); });
      }

      $('#createTab').addEventListener('click', () => setLobbyMode('create'));
      $('#joinTab').addEventListener('click', () => setLobbyMode('join'));
      $('#reveal').addEventListener('click', () => { passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password'; });
      roomCodeInput.addEventListener('input', () => { roomCodeInput.value = normalizeRoomCode(roomCodeInput.value); });
      $('#mainAction').addEventListener('click', async () => { const info = validate(); if (!info) return; if (lobbyMode === 'create') await createRoom(info); else await joinRoom(info); });

      function failStage(message) { waiting.style.display = 'grid'; $('#waitingTitle').textContent = message; $('#waitingText').textContent = 'Clique em Sair para tentar novamente.'; statusText.textContent = '· desconectado'; }
      function leaveRoom() { mode = null; connections.forEach((conn) => conn.close()); connections.clear(); participants.clear(); if (viewerConnection) viewerConnection.close(); if (localStream) localStream.getTracks().forEach((track) => track.stop()); if (peer) peer.destroy(); localStream = null; peer = null; viewerConnection = null; viewerCount = 0; video.srcObject = null; video.muted = false; waiting.style.display = 'grid'; waiting.onclick = null; $('#waitingTitle').textContent = 'Procurando a transmissão…'; $('#waitingText').textContent = 'Assim que alguém compartilhar a tela, ela aparece aqui automaticamente.'; stage.style.display = 'none'; lobby.style.display = 'grid'; if (currentRoomCode) { roomCodeInput.value = currentRoomCode; setLobbyMode('join'); } }
      $('#leave').addEventListener('click', leaveRoom);
      $('#copy').addEventListener('click', async () => { await navigator.clipboard.writeText(inviteUrl()); const button = $('#copy'), old = button.textContent; button.textContent = '✓'; setTimeout(() => button.textContent = old,1200); });
      $('#fullscreen').addEventListener('click', () => { if (!document.fullscreenElement) $('#screen').requestFullscreen().catch(() => {}); else document.exitFullscreen(); });
      window.addEventListener('beforeunload', () => { if (localStream) localStream.getTracks().forEach((track) => track.stop()); if (peer) peer.destroy(); });

      const linkedRoom = normalizeRoomCode(new URLSearchParams(location.search).get('room') || '');
      if (linkedRoom) { roomCodeInput.value = linkedRoom; setLobbyMode('join'); }
    </script>
  </body>
</html>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="#c9ff4a"/><path d="M35 87 91 31M50 31h41v41" fill="none" stroke="#0b0d12" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const manifest = JSON.stringify({ name:"Amigos Tela — Salas", short_name:"Amigos Tela", description:"Crie salas com ID para compartilhar sua tela entre amigos.", start_url:"/", display:"standalone", background_color:"#08090c", theme_color:"#0b0d12", icons:[{ src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any maskable" }] });
const serviceWorker = `const CACHE='amigos-tela-v2';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/icon.svg','/manifest.webmanifest'])))});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))})`;

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    let body, contentType;
    if (pathname === "/" || pathname === "/index.html") { body = page; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/icon.svg") { body = icon; contentType = "image/svg+xml"; }
    else if (pathname === "/manifest.webmanifest") { body = manifest; contentType = "application/manifest+json"; }
    else if (pathname === "/sw.js") { body = serviceWorker; contentType = "text/javascript; charset=utf-8"; }
    else return new Response("Not found", { status:404 });
    return new Response(body, { headers:{ "content-type":contentType, "cache-control":pathname === "/" ? "no-cache" : "public, max-age=3600", "referrer-policy":"no-referrer", "x-content-type-options":"nosniff", "permissions-policy":"camera=(), microphone=(), display-capture=(self)" } });
  }
};

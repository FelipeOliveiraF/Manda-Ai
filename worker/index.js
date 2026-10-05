const page = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0b0d12">
    <meta name="description" content="Mostra aí: salas rápidas com tela, câmera e áudio para compartilhar com amigos.">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <title>Mostra aí — Compartilhe com amigos</title>
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
      .header-actions { display:flex; align-items:center; gap:10px; }
      .authbtn { min-height:38px; padding:0 13px; border-radius:11px; color:var(--text); background:#1b1e25; border:1px solid var(--line); cursor:pointer; font-size:12px; font-weight:750; }
      .userchip { display:none; align-items:center; gap:9px; padding:4px 10px 4px 4px; border-radius:99px; color:var(--text); background:#1b1e25; border:1px solid var(--line); cursor:pointer; }
      .userchip img,.useravatar { width:29px; height:29px; display:grid; place-items:center; border-radius:50%; object-fit:cover; color:#0b0d0a; background:var(--lime); font-size:11px; font-weight:850; }
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
      .mode-tabs.account { grid-template-columns:1fr 1fr 1fr; }
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
      .save-option { display:none; align-items:flex-start; gap:9px; margin-top:15px; padding:11px 12px; border-radius:11px; color:#c7cad2; background:rgba(201,255,74,.055); border:1px solid rgba(201,255,74,.12); font-size:12px; line-height:1.35; cursor:pointer; }
      .save-option input { width:16px; height:16px; margin:1px 0 0; padding:0; accent-color:var(--lime); }
      .rooms-list { display:grid; gap:9px; max-height:330px; overflow:auto; }
      .saved-room { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:13px; border-radius:13px; background:rgba(5,6,9,.46); border:1px solid var(--line); }
      .saved-room strong { display:block; margin-bottom:3px; font-size:13px; }
      .saved-room small { color:var(--muted); letter-spacing:.08em; }
      .roomopen { min-height:34px; padding:0 11px; border-radius:9px; color:#0b0d0a; background:var(--lime); cursor:pointer; font-size:11px; font-weight:800; }
      .emptyrooms { padding:28px 16px; color:var(--muted); text-align:center; border:1px dashed var(--line); border-radius:13px; font-size:13px; line-height:1.5; }
      .error { display:none; margin-top:14px; padding:10px 12px; border-radius:10px; color:#ffc6cc; background:rgba(255,100,119,.10); border:1px solid rgba(255,100,119,.2); font-size:12px; }
      .modalbackdrop { display:none; position:fixed; inset:0; z-index:30; place-items:center; padding:20px; background:rgba(2,3,5,.76); backdrop-filter:blur(12px); }
      .modal { width:min(430px,100%); padding:28px; border-radius:24px; background:#15171e; border:1px solid var(--line); box-shadow:var(--shadow); }
      .modalhead { display:flex; justify-content:space-between; gap:18px; align-items:flex-start; }
      .modal h2 { margin:0 0 7px; font-size:25px; letter-spacing:-.035em; }
      .modal p { margin:0; color:var(--muted); font-size:13px; line-height:1.5; }
      .modalclose { width:34px; height:34px; border-radius:10px; color:var(--muted); background:#23262f; cursor:pointer; }
      .googlebtn { width:100%; min-height:50px; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:24px; border-radius:13px; color:#191b20; background:#fff; cursor:pointer; font-weight:780; }
      .googlemark { width:20px; height:20px; display:grid; place-items:center; border-radius:50%; color:#4285f4; font-weight:900; }
      .authnote { margin-top:14px !important; font-size:11px !important; text-align:center; }
      .stage { display:none; width:100%; align-self:stretch; }
      .stagebar { height:62px; display:flex; align-items:center; justify-content:space-between; gap:14px; }
      .stageleft,.stageright { display:flex; align-items:center; gap:11px; }
      .live { display:flex; align-items:center; gap:7px; padding:7px 10px; color:#ffd7dc; background:rgba(255,100,119,.1); border-radius:99px; font-size:11px; font-weight:800; letter-spacing:.08em; }
      .live i { width:7px; height:7px; background:var(--danger); border-radius:50%; animation:pulse 1.4s infinite; }
      .roomtitle { font-weight:750; letter-spacing:-.02em; } .roomtitle small { color:var(--muted); font-weight:500; }
      .iconbtn { width:39px; height:39px; display:grid; place-items:center; border-radius:11px; color:var(--text); background:#1b1e25; border:1px solid var(--line); cursor:pointer; }
      .stopbtn { width:auto; padding:0 14px; color:#ffc8ce; background:rgba(255,100,119,.10); border-color:rgba(255,100,119,.22); font-size:12px; font-weight:750; }
      .screen { position:relative; width:100%; height:calc(100vh - 235px); min-height:430px; overflow:hidden; background:#020304; border:1px solid var(--line); border-radius:20px; box-shadow:var(--shadow); }
      .gallery { width:100%; height:100%; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr)); grid-auto-rows:minmax(220px,1fr); gap:10px; padding:10px; overflow:auto; }
      .media-tile { position:relative; min-height:220px; overflow:hidden; border-radius:15px; background:radial-gradient(circle at 50% 36%,#242832,#0b0d11 70%); border:1px solid rgba(255,255,255,.08); }
      .media-tile video { width:100%; height:100%; object-fit:cover; background:#050608; }
      .media-tile.screen-share video { object-fit:contain; }
      .media-tile .avatar { position:absolute; inset:0; display:grid; place-items:center; color:#0b0d0a; font-size:clamp(28px,5vw,52px); font-weight:850; }
      .avatar span { width:clamp(64px,10vw,96px); aspect-ratio:1; display:grid; place-items:center; border-radius:32%; background:var(--lime); box-shadow:0 0 55px rgba(201,255,74,.13); }
      .tilemeta { position:absolute; left:10px; bottom:10px; display:flex; align-items:center; gap:7px; max-width:calc(100% - 20px); padding:7px 9px; border-radius:9px; background:rgba(5,6,8,.78); backdrop-filter:blur(10px); font-size:11px; }
      .tilemeta .kind { color:var(--lime); }
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
      .controlbar { display:flex; justify-content:center; align-items:center; gap:9px; padding-top:14px; }
      .mediabtn { min-height:46px; display:flex; align-items:center; gap:8px; padding:0 15px; border-radius:13px; color:#dfe1e7; background:#1b1e25; border:1px solid var(--line); cursor:pointer; font-size:12px; font-weight:750; }
      .mediabtn:hover { background:#232730; }
      .mediabtn.active { color:#0b0d0a; background:var(--lime); border-color:var(--lime); }
      .mediabtn.busy { opacity:.55; pointer-events:none; }
      @keyframes pulse { 50% { opacity:.35; box-shadow:0 0 0 6px rgba(255,100,119,.08); } }
      @keyframes breathe { 50% { transform:scale(1.04); box-shadow:0 0 40px rgba(201,255,74,.08); } }
      @media (max-width:820px) { .shell{width:min(100% - 22px,620px)} header{height:64px}.brand small,.secure{display:none}.userchip span{display:none}.userchip{padding-right:4px} main{min-height:calc(100vh - 64px);padding-top:16px}.lobby{grid-template-columns:1fr;gap:34px}h1{font-size:clamp(44px,14vw,68px)}.hero{text-align:center}.lead{margin-inline:auto}.steps{justify-content:center;flex-wrap:wrap}.card{padding:22px;border-radius:22px}.actions{grid-template-columns:1fr}.stagebar{height:56px}.roomtitle small{display:none}.screen{height:calc(100vh - 205px);min-height:350px;border-radius:15px}.gallery{grid-template-columns:1fr;grid-auto-rows:minmax(240px,1fr)}.people{width:auto;max-width:calc(100% - 28px)}.mediabtn{padding:0 12px}.mediabtn span{display:none} }
    </style>
  </head>
  <body>
    <div class="noise"></div>
    <div class="shell">
      <header><div class="brand"><span class="mark">↗</span> Mostra aí<span><small>/ juntos</small></span></div><div class="header-actions"><div class="secure"><i></i><span>Conexão direta entre amigos</span></div><button class="authbtn" id="loginButton" type="button">Entrar</button><button class="userchip" id="userChip" type="button"><span class="useravatar" id="userAvatar">A</span><span id="userName">Amigo</span></button></div></header>
      <main>
        <section class="lobby" id="lobby">
          <div class="hero"><div class="eyebrow">Um clique. Sem reunião.</div><h1>Mostra aí.<br><span>A gente assiste.</span></h1><p class="lead">Uma sala simples para compartilhar sua tela enquanto todo mundo continua conversando no Discord.</p><div class="steps"><span><b>1</b> Entre na sala</span><span><b>2</b> Compartilhe ou assista</span><span><b>3</b> Pronto</span></div></div>
          <div class="card">
            <div class="roomline"><div><p id="cardEyebrow">Sua transmissão</p><h2 id="cardTitle">Criar uma sala</h2></div><span class="pill">● disponível</span></div>
            <div class="mode-tabs" id="modeTabs"><button class="tabbtn active" id="createTab" type="button">Criar sala</button><button class="tabbtn" id="joinTab" type="button">Entrar com ID</button><button class="tabbtn hidden" id="roomsTab" type="button">Minhas salas</button></div>
            <div id="roomForm">
            <label for="nickname">Seu apelido</label><div class="inputwrap"><input id="nickname" maxlength="24" autocomplete="nickname" placeholder="Como vão te ver"></div>
            <div id="createFields"><label for="roomName">Nome da sala</label><div class="inputwrap"><input id="roomName" maxlength="40" value="Grupo dos Amigos" placeholder="Ex.: Grupo dos Amigos"></div><p class="fieldhint">Um ID exclusivo será criado automaticamente.</p></div>
            <div id="joinFields" class="hidden"><label for="roomCodeInput">ID da sala</label><div class="inputwrap"><input id="roomCodeInput" maxlength="12" autocapitalize="characters" placeholder="Ex.: 7KQ2MX"></div><p class="fieldhint">O ID aparece no link enviado por quem criou.</p></div>
            <label for="password">Senha da sala</label><div class="inputwrap"><input id="password" type="password" autocomplete="current-password" placeholder="A senha combinada"><button class="reveal" id="reveal" type="button" aria-label="Mostrar senha">◉</button></div>
            <label class="save-option" id="saveOption"><input id="saveRoom" type="checkbox" checked><span id="saveOptionText">Salvar esta sala na minha conta e lembrar a senha neste navegador</span></label>
            <div class="actions"><button class="btn primary" id="mainAction" type="button">Criar sala</button></div>
            </div>
            <div id="savedRooms" class="hidden"><div class="rooms-list" id="roomsList"></div></div>
            <div class="error" id="error" role="alert"></div><p class="fine" id="fineText">Entre primeiro. Depois, cada pessoa escolhe se quer usar tela, câmera ou microfone.</p><p class="fine"><a href="/privacy">Privacidade</a> · <a href="/terms">Termos</a></p>
          </div>
        </section>
        <section class="stage" id="stage">
          <div class="stagebar"><div class="stageleft"><span class="live"><i></i> SALA ATIVA</span><span class="roomtitle"><span id="stageRoomName">Sala</span> <small id="status">· conectando…</small></span></div><div class="stageright"><button class="iconbtn" id="copy" title="Copiar convite">↗</button><button class="iconbtn" id="fullscreen" title="Tela cheia">⛶</button><button class="iconbtn stopbtn" id="leave">Sair</button></div></div>
          <div class="screen" id="screen"><div class="gallery" id="gallery"></div><div class="waiting" id="waiting"><div class="waitingbox"><div class="orb">⌁</div><h3 id="waitingTitle">A sala está pronta</h3><p id="waitingText">Ative sua tela, câmera ou microfone — ou apenas espere alguém começar.</p></div></div><div class="people"><div class="peoplehead"><span>Na sala</span><span class="roomcode" id="stageRoomCode">—</span></div><div class="peoplelist" id="peopleList"></div></div></div>
          <div class="controlbar"><button class="mediabtn" id="screenButton" type="button">▣ <span>Compartilhar tela</span></button><button class="mediabtn" id="cameraButton" type="button">◉ <span>Ligar câmera</span></button><button class="mediabtn" id="micButton" type="button">◌ <span>Ligar microfone</span></button></div>
        </section>
      </main>
    </div>
    <div class="modalbackdrop" id="authModal"><div class="modal"><div class="modalhead"><div><h2>Entre no Mostra aí</h2><p>Use sua conta Google para criar salas permanentes e encontrá-las em qualquer dispositivo.</p></div><button class="modalclose" id="closeAuth" type="button" aria-label="Fechar">×</button></div><button class="googlebtn" id="googleLogin" type="button"><span class="googlemark">G</span> Continuar com Google</button><p class="authnote" id="authNote">O modo convidado continua disponível sem cadastro.</p></div></div>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://unpkg.com/peerjs@1.5.5/dist/peerjs.min.js"></script>
    <script>
      const $ = (selector) => document.querySelector(selector);
      const lobby = $('#lobby'), stage = $('#stage'), gallery = $('#gallery'), waiting = $('#waiting'), errorBox = $('#error'), statusText = $('#status'), nickInput = $('#nickname'), passwordInput = $('#password'), roomNameInput = $('#roomName'), roomCodeInput = $('#roomCodeInput');
      const SUPABASE_URL = 'https://ahygayqpwhkphjdyrktw.supabase.co';
      const SUPABASE_KEY = 'sb_publishable_v1XL67mYUlHwkjDva7OsTw_zljnYttq';
      const supabaseClient = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      let peer = null, mode = null, lobbyMode = 'create', currentRoomCode = '', currentRoomName = '', selfName = '', coordinatorId = '', coordinatorConnection = null, roomConnected = false, leaving = false;
      let currentUser = null, savedRooms = [];
      let cameraTrack = null, microphoneTrack = null, screenTrack = null, screenAudioTracks = [];
      const dataConnections = new Map(), roster = new Map(), outgoingCalls = new Map(), incomingCalls = new Map(), remoteStreams = new Map(), remoteKinds = new Map();
      nickInput.value = localStorage.getItem('amigos-nickname') || '';
      if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});

      function setLobbyMode(next) {
        lobbyMode = next;
        const creating = next === 'create';
        $('#createTab').classList.toggle('active', creating);
        $('#joinTab').classList.toggle('active', next === 'join');
        $('#roomsTab').classList.toggle('active', next === 'rooms');
        $('#roomForm').classList.toggle('hidden', next === 'rooms');
        $('#savedRooms').classList.toggle('hidden', next !== 'rooms');
        $('#createFields').classList.toggle('hidden', !creating);
        $('#joinFields').classList.toggle('hidden', next !== 'join');
        $('#cardEyebrow').textContent = creating ? 'Sua sala' : next === 'rooms' ? 'Sua conta' : 'Sala de outra pessoa';
        $('#cardTitle').textContent = creating ? 'Criar uma sala' : next === 'rooms' ? 'Minhas salas' : 'Entrar em uma sala';
        $('#mainAction').textContent = creating ? 'Criar sala' : 'Entrar na sala';
        $('#saveOptionText').textContent = creating ? 'Criar uma sala permanente e lembrar a senha neste navegador' : 'Salvar esta sala na minha conta e lembrar a senha neste navegador';
        $('#fineText').textContent = next === 'rooms' ? 'As salas ficam na sua conta. A senha fica somente neste navegador.' : 'Entre primeiro. Depois, cada pessoa escolhe se quer usar tela, câmera ou microfone.';
        errorBox.style.display = 'none';
        if (next === 'rooms') loadSavedRooms();
      }

      function normalizeRoomCode(value) { return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0,12); }
      function generateRoomCode() { const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const bytes = crypto.getRandomValues(new Uint8Array(6)); return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join(''); }
      async function roomPeerId(code, password) { const bytes = new TextEncoder().encode('amigos-tela:' + code + ':' + password); const digest = await crypto.subtle.digest('SHA-256', bytes); return 'gda-' + Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2,'0')).join('').slice(0,32); }
      function makePeer(id) { return id ? new Peer(id,{debug:1}) : new Peer({debug:1}); }
      function inviteUrl() { return location.origin + location.pathname + '?room=' + encodeURIComponent(currentRoomCode); }
      function showError(message) { errorBox.textContent = message; errorBox.style.display = 'block'; return null; }

      function userDisplayName(user) { return String(user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Amigo').slice(0,60); }
      function renderAuth() {
        const signedIn = Boolean(currentUser);
        $('#loginButton').style.display = signedIn ? 'none' : 'block';
        $('#userChip').style.display = signedIn ? 'flex' : 'none';
        $('#roomsTab').classList.toggle('hidden',!signedIn);
        $('#modeTabs').classList.toggle('account',signedIn);
        $('#saveOption').style.display = signedIn ? 'flex' : 'none';
        if (signedIn) {
          const name = userDisplayName(currentUser);
          $('#userName').textContent = name;
          $('#userAvatar').textContent = initials(name);
          const avatarUrl = currentUser.user_metadata?.avatar_url;
          if (avatarUrl) { $('#userAvatar').style.backgroundImage = 'url(' + encodeURI(String(avatarUrl)) + ')'; $('#userAvatar').style.backgroundSize = 'cover'; $('#userAvatar').textContent = ''; }
          if (!nickInput.value) nickInput.value = name.slice(0,24);
        } else if (lobbyMode === 'rooms') setLobbyMode('create');
      }

      function openAuth() { $('#authModal').style.display = 'grid'; }
      function closeAuth() { $('#authModal').style.display = 'none'; $('#authNote').textContent = 'O modo convidado continua disponível sem cadastro.'; }

      async function signInWithGoogle() {
        $('#authNote').textContent = 'Abrindo o Google…';
        const result = await supabaseClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin + location.pathname}});
        if (result.error) $('#authNote').textContent = 'Não foi possível abrir o login: ' + result.error.message;
      }

      async function signOut() {
        await supabaseClient.auth.signOut();
        currentUser = null; savedRooms = []; renderAuth(); setLobbyMode('create');
      }

      async function loadSavedRooms() {
        if (!currentUser) return;
        const result = await supabaseClient.from('rooms').select('id,code,name,owner_id,created_at').order('created_at',{ascending:false});
        if (result.error) { showError('Não consegui carregar suas salas agora.'); return; }
        savedRooms = result.data || [];
        const list = $('#roomsList'); list.textContent = '';
        if (!savedRooms.length) { const empty = document.createElement('div'); empty.className = 'emptyrooms'; empty.textContent = 'Você ainda não salvou nenhuma sala. Crie uma ou entre usando um ID.'; list.appendChild(empty); return; }
        savedRooms.forEach((room) => {
          const item = document.createElement('div'); item.className = 'saved-room';
          const info = document.createElement('div'); const title = document.createElement('strong'); const code = document.createElement('small');
          title.textContent = room.name; code.textContent = room.code; info.append(title,code);
          const button = document.createElement('button'); button.className = 'roomopen'; button.type = 'button'; button.textContent = 'Entrar'; button.addEventListener('click',() => openSavedRoom(room));
          item.append(info,button); list.appendChild(item);
        });
      }

      function openSavedRoom(room) {
        setLobbyMode('join'); roomCodeInput.value = room.code; currentRoomName = room.name;
        passwordInput.value = localStorage.getItem('amigos-room-secret:' + room.code) || '';
        if (!passwordInput.value) { passwordInput.focus(); showError('Digite a senha desta sala neste dispositivo.'); }
        else $('#mainAction').focus();
      }

      async function persistRoom(info) {
        if (!currentUser || !$('#saveRoom').checked) return info;
        if (lobbyMode === 'create') {
          const result = await supabaseClient.rpc('create_room',{room_name:info.roomName});
          if (result.error) throw new Error('Não foi possível criar a sala permanente.');
          const room = Array.isArray(result.data) ? result.data[0] : result.data;
          info.roomCode = room.code; info.roomName = room.name;
        } else {
          const result = await supabaseClient.rpc('save_room_by_code',{room_code:info.roomCode});
          if (result.error) throw new Error('Este ID não pertence a uma sala permanente. Desmarque “Salvar” para entrar como convidado.');
          const room = Array.isArray(result.data) ? result.data[0] : result.data;
          info.roomName = room.name;
        }
        info.persistent = true;
        localStorage.setItem('amigos-room-secret:' + info.roomCode,info.password);
        return info;
      }

      function validate() {
        const nickname = nickInput.value.trim(), password = passwordInput.value, roomName = roomNameInput.value.trim(), roomCode = normalizeRoomCode(roomCodeInput.value);
        if (!nickname) return showError('Escolha um apelido para entrar.');
        if (lobbyMode === 'create' && !roomName) return showError('Dê um nome para a sala.');
        if (lobbyMode === 'join' && roomCode.length < 4) return showError('Digite um ID de sala válido.');
        if (password.length < 4) return showError('A senha precisa ter pelo menos 4 caracteres.');
        localStorage.setItem('amigos-nickname',nickname);
        errorBox.style.display = 'none';
        return {nickname,password,roomName,roomCode};
      }

      function enterStage(kind) {
        mode = kind;
        lobby.style.display = 'none';
        stage.style.display = 'block';
        $('#stageRoomName').textContent = currentRoomName || ('Sala ' + currentRoomCode);
        $('#stageRoomCode').textContent = currentRoomCode;
        $('#waitingTitle').textContent = 'A sala está pronta';
        $('#waitingText').textContent = 'Ative sua tela, câmera ou microfone — ou apenas espere alguém começar.';
        waiting.style.display = 'grid';
      }

      function initials(name) { return name.trim().split(/\s+/).slice(0,2).map((part) => part[0] || '').join('').toUpperCase() || '?'; }
      function findTile(peerId) { return Array.from(gallery.children).find((tile) => tile.dataset.peerId === peerId); }
      function ensureTile(peerId,name,stream,kind,isLocal) {
        let tile = findTile(peerId);
        if (!tile) {
          tile = document.createElement('article');
          tile.className = 'media-tile';
          tile.dataset.peerId = peerId;
          const avatar = document.createElement('div'); avatar.className = 'avatar'; avatar.appendChild(document.createElement('span'));
          const video = document.createElement('video'); video.autoplay = true; video.playsInline = true;
          const meta = document.createElement('div'); meta.className = 'tilemeta';
          const label = document.createElement('span'); label.className = 'tile-name';
          const type = document.createElement('span'); type.className = 'kind';
          meta.append(label,type); tile.append(avatar,video,meta); gallery.appendChild(tile);
        }
        tile.querySelector('.avatar span').textContent = initials(name);
        tile.querySelector('.tile-name').textContent = name + (isLocal ? ' (você)' : '');
        tile.querySelector('.kind').textContent = kind && kind !== 'none' ? '· ' + (kind === 'screen' ? 'tela' : kind === 'camera' ? 'câmera' : 'áudio') : '';
        tile.classList.toggle('screen-share',kind === 'screen');
        const video = tile.querySelector('video'), avatar = tile.querySelector('.avatar');
        const hasVideo = Boolean(stream && stream.getVideoTracks().some((track) => track.readyState === 'live'));
        if (stream && stream.getTracks().length) {
          if (video.srcObject !== stream) video.srcObject = stream;
          video.muted = isLocal;
          video.style.display = hasVideo ? 'block' : 'none';
          avatar.style.display = hasVideo ? 'none' : 'grid';
          video.play().catch(() => {});
        } else {
          video.srcObject = null; video.style.display = 'none'; avatar.style.display = 'grid';
        }
        return tile;
      }

      function localKind() { return screenTrack && screenTrack.readyState === 'live' ? 'screen' : cameraTrack && cameraTrack.readyState === 'live' ? 'camera' : microphoneTrack && microphoneTrack.readyState === 'live' ? 'audio' : 'none'; }
      function outgoingStream() {
        const tracks = [];
        if (screenTrack && screenTrack.readyState === 'live') tracks.push(screenTrack); else if (cameraTrack && cameraTrack.readyState === 'live') tracks.push(cameraTrack);
        if (microphoneTrack && microphoneTrack.readyState === 'live') tracks.push(microphoneTrack);
        screenAudioTracks.filter((track) => track.readyState === 'live').forEach((track) => tracks.push(track));
        return new MediaStream(tracks);
      }

      function updateButtons() {
        const screenOn = Boolean(screenTrack && screenTrack.readyState === 'live'), cameraOn = Boolean(cameraTrack && cameraTrack.readyState === 'live'), micOn = Boolean(microphoneTrack && microphoneTrack.readyState === 'live');
        $('#screenButton').classList.toggle('active',screenOn); $('#cameraButton').classList.toggle('active',cameraOn); $('#micButton').classList.toggle('active',micOn);
        $('#screenButton span').textContent = screenOn ? 'Parar tela' : 'Compartilhar tela';
        $('#cameraButton span').textContent = cameraOn ? 'Desligar câmera' : 'Ligar câmera';
        $('#micButton span').textContent = micOn ? 'Desligar microfone' : 'Ligar microfone';
      }

      function renderRoom() {
        const list = $('#peopleList'); list.textContent = '';
        roster.forEach((name,id) => { const item = document.createElement('span'); item.className = 'person' + (id === coordinatorId ? ' host' : ''); item.textContent = name; list.appendChild(item); const stream = id === peer?.id ? outgoingStream() : remoteStreams.get(id); const kind = id === peer?.id ? localKind() : (remoteKinds.get(id) || (stream?.getVideoTracks().length ? 'camera' : stream?.getAudioTracks().length ? 'audio' : 'none')); ensureTile(id,name,stream,kind,id === peer?.id); });
        Array.from(gallery.children).forEach((tile) => { if (!roster.has(tile.dataset.peerId)) tile.remove(); });
        waiting.style.display = roster.size ? 'none' : 'grid';
        statusText.textContent = '· ' + roster.size + (roster.size === 1 ? ' pessoa' : ' pessoas');
      }

      function callPeer(peerId) {
        const stream = outgoingStream();
        if (!peer || peerId === peer.id || !stream.getTracks().length || outgoingCalls.has(peerId)) return;
        const call = peer.call(peerId,stream,{metadata:{name:selfName,kind:localKind()}});
        if (!call) return;
        outgoingCalls.set(peerId,call);
        call.on('close',() => { if (outgoingCalls.get(peerId) === call) outgoingCalls.delete(peerId); });
        call.on('error',() => { if (outgoingCalls.get(peerId) === call) outgoingCalls.delete(peerId); });
      }

      function refreshPublishing() {
        outgoingCalls.forEach((call) => call.close()); outgoingCalls.clear();
        updateButtons(); renderRoom();
        if (outgoingStream().getTracks().length) roster.forEach((_,id) => callPeer(id));
      }

      function applyRoster(items,roomName) {
        const nextIds = new Set(items.map((item) => item.id));
        roster.forEach((_,id) => { if (!nextIds.has(id)) { outgoingCalls.get(id)?.close(); incomingCalls.get(id)?.close(); outgoingCalls.delete(id); incomingCalls.delete(id); remoteStreams.delete(id); remoteKinds.delete(id); findTile(id)?.remove(); } });
        roster.clear(); items.forEach((item) => roster.set(item.id,String(item.name || 'Amigo').slice(0,24)));
        if (roomName) { currentRoomName = roomName; $('#stageRoomName').textContent = roomName; }
        renderRoom();
        if (outgoingStream().getTracks().length) roster.forEach((_,id) => callPeer(id));
      }

      function broadcastRoster() {
        const message = {type:'roster',roomName:currentRoomName,items:Array.from(roster,(entry) => ({id:entry[0],name:entry[1]}))};
        dataConnections.forEach((conn) => { if (conn.open) conn.send(message); });
        applyRoster(message.items,currentRoomName);
      }

      function handleIncomingCall(call) {
        const old = incomingCalls.get(call.peer); if (old) old.close();
        incomingCalls.set(call.peer,call); call.answer();
        call.on('stream',(stream) => { remoteStreams.set(call.peer,stream); const name = roster.get(call.peer) || call.metadata?.name || 'Amigo'; const kind = call.metadata?.kind || (stream.getVideoTracks().length ? 'camera' : 'audio'); remoteKinds.set(call.peer,kind); ensureTile(call.peer,name,stream,kind,false); waiting.style.display = 'none'; });
        call.on('close',() => { if (incomingCalls.get(call.peer) === call) { incomingCalls.delete(call.peer); remoteStreams.delete(call.peer); remoteKinds.delete(call.peer); if (roster.has(call.peer)) ensureTile(call.peer,roster.get(call.peer),null,'none',false); } });
      }

      function attachCommonPeerHandlers() {
        peer.on('call',handleIncomingCall);
        peer.on('disconnected',() => { if (!leaving) statusText.textContent = '· reconectando…'; });
      }

      async function createRoom(info) {
        currentRoomCode = info.roomCode || generateRoomCode(); currentRoomName = info.roomName; selfName = info.nickname;
        history.replaceState(null,'',location.pathname + '?room=' + encodeURIComponent(currentRoomCode));
        coordinatorId = await roomPeerId(currentRoomCode,info.password);
        enterStage('host'); peer = makePeer(coordinatorId); attachCommonPeerHandlers();
        peer.on('open',() => { roomConnected = true; roster.set(peer.id,selfName); broadcastRoster(); });
        peer.on('connection',(conn) => {
          dataConnections.set(conn.peer,conn);
          conn.on('open',() => { roster.set(conn.peer,String(conn.metadata?.nickname || 'Amigo').slice(0,24)); broadcastRoster(); });
          conn.on('data',(data) => { if (data?.type === 'intro' && data.nickname) { roster.set(conn.peer,String(data.nickname).slice(0,24)); broadcastRoster(); } });
          conn.on('close',() => { dataConnections.delete(conn.peer); roster.delete(conn.peer); remoteStreams.delete(conn.peer); remoteKinds.delete(conn.peer); broadcastRoster(); });
        });
        peer.on('error',(err) => { if (err.type === 'unavailable-id') failStage('Esse ID já está em uso. Saia e crie outra sala.'); else if (!roomConnected) failStage('Não consegui abrir a sala agora.'); });
      }

      async function joinRoom(info) {
        currentRoomCode = info.roomCode; currentRoomName = info.roomName || currentRoomName || ('Sala ' + currentRoomCode); selfName = info.nickname; roomCodeInput.value = currentRoomCode;
        history.replaceState(null,'',location.pathname + '?room=' + encodeURIComponent(currentRoomCode));
        coordinatorId = await roomPeerId(currentRoomCode,info.password);
        let joinTimeout = null, fallbackAttempted = false;
        enterStage('member'); peer = makePeer(); attachCommonPeerHandlers();
        peer.on('open',() => {
          const conn = peer.connect(coordinatorId,{reliable:true,metadata:{nickname:selfName}}); coordinatorConnection = conn;
          joinTimeout = setTimeout(() => { if (!roomConnected) failStage('Sala não encontrada — confira o ID e a senha.'); },9000);
          conn.on('open',() => { clearTimeout(joinTimeout); roomConnected = true; conn.send({type:'intro',nickname:selfName}); });
          conn.on('data',(data) => { if (data?.type === 'roster' && Array.isArray(data.items)) applyRoster(data.items,data.roomName); });
          conn.on('close',() => { if (!leaving && !fallbackAttempted) failStage('A sala foi encerrada. Entre novamente para reabri-la.'); });
        });
        peer.on('error',async (err) => {
          if (!roomConnected && err.type === 'peer-unavailable' && info.persistent && !fallbackAttempted) {
            fallbackAttempted = true; clearTimeout(joinTimeout); peer.destroy(); peer = null; coordinatorConnection = null;
            await createRoom(info); mediaNotice('sala permanente reaberta');
          } else if (!roomConnected && err.type === 'peer-unavailable') failStage('Sala não encontrada — confira o ID e a senha.');
          else if (!roomConnected) failStage('Não foi possível entrar na sala.');
        });
      }

      function mediaNotice(message) { const before = statusText.textContent; statusText.textContent = '· ' + message; setTimeout(() => { if (statusText.textContent === '· ' + message) statusText.textContent = before; },2800); }
      async function toggleCamera() {
        const button = $('#cameraButton'); button.classList.add('busy');
        try { if (cameraTrack) { const track = cameraTrack; cameraTrack = null; track.stop(); } else { const stream = await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720}},audio:false}); cameraTrack = stream.getVideoTracks()[0]; cameraTrack.addEventListener('ended',() => { cameraTrack = null; if (!leaving) refreshPublishing(); }); } refreshPublishing(); } catch { mediaNotice('câmera não autorizada'); } finally { button.classList.remove('busy'); }
      }
      async function toggleMicrophone() {
        const button = $('#micButton'); button.classList.add('busy');
        try { if (microphoneTrack) { const track = microphoneTrack; microphoneTrack = null; track.stop(); } else { const stream = await navigator.mediaDevices.getUserMedia({video:false,audio:{echoCancellation:true,noiseSuppression:true}}); microphoneTrack = stream.getAudioTracks()[0]; microphoneTrack.addEventListener('ended',() => { microphoneTrack = null; if (!leaving) refreshPublishing(); }); } refreshPublishing(); } catch { mediaNotice('microfone não autorizado'); } finally { button.classList.remove('busy'); }
      }
      async function toggleScreen() {
        const button = $('#screenButton'); button.classList.add('busy');
        try { if (screenTrack) { const video = screenTrack; const audio = screenAudioTracks.slice(); screenTrack = null; screenAudioTracks = []; video.stop(); audio.forEach((track) => track.stop()); } else { const stream = await navigator.mediaDevices.getDisplayMedia({video:{frameRate:{ideal:30,max:60}},audio:true}); screenTrack = stream.getVideoTracks()[0]; screenAudioTracks = stream.getAudioTracks(); screenTrack.addEventListener('ended',() => { screenTrack = null; screenAudioTracks.forEach((track) => track.stop()); screenAudioTracks = []; if (!leaving) refreshPublishing(); }); } refreshPublishing(); } catch { mediaNotice('compartilhamento cancelado'); } finally { button.classList.remove('busy'); }
      }

      $('#createTab').addEventListener('click',() => setLobbyMode('create'));
      $('#joinTab').addEventListener('click',() => setLobbyMode('join'));
      $('#roomsTab').addEventListener('click',() => setLobbyMode('rooms'));
      $('#loginButton').addEventListener('click',openAuth);
      $('#closeAuth').addEventListener('click',closeAuth);
      $('#authModal').addEventListener('click',(event) => { if (event.target === $('#authModal')) closeAuth(); });
      $('#googleLogin').addEventListener('click',signInWithGoogle);
      $('#userChip').addEventListener('click',async () => { if (confirm('Sair da sua conta?')) await signOut(); });
      $('#reveal').addEventListener('click',() => { passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password'; });
      roomCodeInput.addEventListener('input',() => { roomCodeInput.value = normalizeRoomCode(roomCodeInput.value); });
      $('#mainAction').addEventListener('click',async () => {
        let info = validate(); if (!info) return;
        const button = $('#mainAction'); button.disabled = true; button.textContent = 'Preparando…';
        try { info = await persistRoom(info); if (lobbyMode === 'create') await createRoom(info); else await joinRoom(info); }
        catch (error) { showError(error.message || 'Não foi possível preparar a sala.'); }
        finally { button.disabled = false; button.textContent = lobbyMode === 'create' ? 'Criar sala' : 'Entrar na sala'; }
      });
      $('#screenButton').addEventListener('click',toggleScreen); $('#cameraButton').addEventListener('click',toggleCamera); $('#micButton').addEventListener('click',toggleMicrophone);

      function failStage(message) { waiting.style.display = 'grid'; $('#waitingTitle').textContent = message; $('#waitingText').textContent = 'Clique em Sair para tentar novamente.'; statusText.textContent = '· desconectado'; }
      function stopMedia() { [cameraTrack,microphoneTrack,screenTrack].filter(Boolean).forEach((track) => track.stop()); screenAudioTracks.forEach((track) => track.stop()); cameraTrack = null; microphoneTrack = null; screenTrack = null; screenAudioTracks = []; }
      function leaveRoom() { leaving = true; stopMedia(); outgoingCalls.forEach((call) => call.close()); incomingCalls.forEach((call) => call.close()); dataConnections.forEach((conn) => conn.close()); coordinatorConnection?.close(); peer?.destroy(); peer = null; coordinatorConnection = null; roomConnected = false; roster.clear(); remoteStreams.clear(); remoteKinds.clear(); outgoingCalls.clear(); incomingCalls.clear(); dataConnections.clear(); gallery.textContent = ''; updateButtons(); stage.style.display = 'none'; lobby.style.display = 'grid'; leaving = false; if (currentRoomCode) { roomCodeInput.value = currentRoomCode; setLobbyMode('join'); } }
      $('#leave').addEventListener('click',leaveRoom);
      $('#copy').addEventListener('click',async () => { await navigator.clipboard.writeText(inviteUrl()); const button = $('#copy'), old = button.textContent; button.textContent = '✓'; setTimeout(() => button.textContent = old,1200); });
      $('#fullscreen').addEventListener('click',() => { if (!document.fullscreenElement) $('#screen').requestFullscreen().catch(() => {}); else document.exitFullscreen(); });
      window.addEventListener('beforeunload',() => { leaving = true; stopMedia(); peer?.destroy(); });

      const linkedRoom = normalizeRoomCode(new URLSearchParams(location.search).get('room') || '');
      if (linkedRoom) { roomCodeInput.value = linkedRoom; setLobbyMode('join'); }
      supabaseClient.auth.getSession().then(({data}) => { currentUser = data.session?.user || null; renderAuth(); });
      supabaseClient.auth.onAuthStateChange((_event,session) => { currentUser = session?.user || null; renderAuth(); if (currentUser) closeAuth(); });
    </script>
  </body>
</html>`;

function legalPage(title, body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b0d12"><title>${title} — Mostra aí</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#08090c;color:#f7f8fb;font:16px/1.65 Inter,system-ui,sans-serif}main{width:min(760px,calc(100% - 36px));margin:0 auto;padding:64px 0 90px}a{color:#c9ff4a}nav{margin-bottom:48px}h1{font-size:clamp(38px,7vw,62px);line-height:1;letter-spacing:-.05em;margin:0 0 16px}h2{margin-top:38px;font-size:21px}p,li{color:#b9bdc6}small{color:#747985}.box{padding:22px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#111319}</style></head><body><main><nav><a href="/">← Voltar ao Mostra aí</a></nav>${body}<p><small>Última atualização: 4 de outubro de 2026.</small></p></main></body></html>`;
}

const privacyPage = legalPage("Privacidade", `<h1>Política de Privacidade</h1><p>O Mostra aí foi feito para compartilhar tela, câmera e áudio em salas entre amigos, com ou sem conta.</p><h2>Dados da conta</h2><p>Ao entrar com o Google, recebemos seu nome, endereço de e-mail, foto de perfil e identificador da conta. Usamos esses dados somente para identificar seu perfil e salvar as salas das quais você participa.</p><h2>Salas e mídia</h2><p>Guardamos o nome, o ID e a lista de membros das salas permanentes. A senha da sala fica somente no navegador em que foi informada. O áudio, o vídeo e a tela são transmitidos em tempo real entre os participantes por WebRTC e não são gravados pelo Mostra aí.</p><h2>Serviços utilizados</h2><p>Usamos Google para autenticação, Supabase para contas e dados das salas e PeerJS/WebRTC para conexão em tempo real. Esses serviços podem processar dados técnicos necessários ao funcionamento.</p><h2>Seus controles</h2><p>Você escolhe quando liberar tela, câmera e microfone. Pode sair da conta a qualquer momento e solicitar a exclusão do perfil e das salas pelo e-mail <a href="mailto:felu.leo2016@gmail.com">felu.leo2016@gmail.com</a>.</p><h2>Segurança</h2><p>O acesso aos dados é protegido por regras por usuário no banco. Nunca coloque informações sensíveis no nome de uma sala ou compartilhe uma senha com pessoas que não devam entrar.</p>`);

const termsPage = legalPage("Termos", `<h1>Termos de Uso</h1><div class="box"><p>Ao usar o Mostra aí, você concorda em utilizar o serviço de forma legal, respeitosa e somente com pessoas autorizadas.</p></div><h2>Uso permitido</h2><p>Você é responsável pelo conteúdo que compartilha e deve ter autorização para transmitir telas, áudio, vídeo e outros materiais. Não use o serviço para assédio, fraude, invasão de privacidade ou distribuição de conteúdo ilegal.</p><h2>Contas e salas</h2><p>O modo convidado não exige cadastro. Contas Google permitem criar e salvar salas permanentes. Mantenha as senhas das salas em segurança e encerre o acesso quando necessário.</p><h2>Disponibilidade</h2><p>O serviço é fornecido no estado em que se encontra e pode mudar, ficar temporariamente indisponível ou depender de serviços externos e da conexão dos participantes.</p><h2>Privacidade</h2><p>O tratamento de dados está descrito na <a href="/privacy">Política de Privacidade</a>.</p><h2>Contato</h2><p>Dúvidas ou solicitações podem ser enviadas para <a href="mailto:felu.leo2016@gmail.com">felu.leo2016@gmail.com</a>.</p>`);

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="30" fill="#c9ff4a"/><path d="M35 87 91 31M50 31h41v41" fill="none" stroke="#0b0d12" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const manifest = JSON.stringify({ name:"Mostra aí — Salas entre amigos", short_name:"Mostra aí", description:"Salas com tela, webcam e áudio para conversar entre amigos.", start_url:"/", display:"standalone", background_color:"#08090c", theme_color:"#0b0d12", icons:[{ src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any maskable" }] });
const serviceWorker = `const CACHE='mostra-ai-v4';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/icon.svg','/manifest.webmanifest'])))});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method==='GET'&&new URL(e.request.url).origin===location.origin)e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))})`;

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    let body, contentType;
    if (pathname === "/" || pathname === "/index.html") { body = page; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/privacy") { body = privacyPage; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/terms") { body = termsPage; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/icon.svg") { body = icon; contentType = "image/svg+xml"; }
    else if (pathname === "/manifest.webmanifest") { body = manifest; contentType = "application/manifest+json"; }
    else if (pathname === "/sw.js") { body = serviceWorker; contentType = "text/javascript; charset=utf-8"; }
    else return new Response("Not found", { status:404 });
    return new Response(body, { headers:{ "content-type":contentType, "cache-control":pathname === "/" ? "no-cache" : "public, max-age=3600", "referrer-policy":"no-referrer", "x-content-type-options":"nosniff", "permissions-policy":"camera=(self), microphone=(self), display-capture=(self)" } });
  }
};

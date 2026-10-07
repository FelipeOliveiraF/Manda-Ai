export const appScript = String.raw`
(function () {
  'use strict';
  const SUPABASE_URL = 'https://ahygayqpwhkphjdyrktw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_v1XL67mYUlHwkjDva7OsTw_zljnYttq';
  const GOOGLE_CLIENT_ID = '745889112770-idm2cc38g6fkjhcoqvv8emhk9j0kn99u.apps.googleusercontent.com';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = function (selector) { return document.querySelector(selector); };

  let currentUser = null;
  let rooms = [];
  let activeRoom = null;
  let pendingInvite = new URLSearchParams(location.search).get('invite') || '';
  let chatChannel = null;
  let googleInitialized = false;
  let sessionIdentity = undefined;
  let peer = null;
  let coordinatorId = '';
  let coordinatorConnection = null;
  let isCoordinator = false;
  let leaving = false;
  let screenTrack = null;
  let cameraTrack = null;
  let microphoneTrack = null;
  let screenAudioTracks = [];
  const dataConnections = new Map();
  const roster = new Map();
  const outgoingCalls = new Map();
  const incomingCalls = new Map();
  const remoteStreams = new Map();
  const remoteKinds = new Map();

  function initials(name) {
    return String(name || 'Amigo').trim().split(/\s+/).slice(0, 2).map(function (part) { return part[0] || ''; }).join('').toUpperCase() || '?';
  }
  function userName() {
    const meta = currentUser && currentUser.user_metadata || {};
    return String(meta.full_name || meta.name || (currentUser && currentUser.email || '').split('@')[0] || 'Amigo').slice(0, 60);
  }
  function avatarUrl() {
    return String(currentUser && currentUser.user_metadata && currentUser.user_metadata.avatar_url || '');
  }
  function escapeText(value) { return String(value == null ? '' : value); }
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function openModal(id) { $('#' + id).classList.remove('hidden'); }
  function closeModal(id) { $('#' + id).classList.add('hidden'); }
  function setAvatar(element, name, url) {
    element.textContent = initials(name);
    element.style.backgroundImage = url ? 'url("' + encodeURI(url) + '")' : '';
  }
  function setConnection(message, healthy) {
    $('#connectionNote span').textContent = message;
    $('#connectionNote i').style.background = healthy ? 'var(--lime)' : '#edb85b';
  }

  async function randomNonce() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    return Array.from(bytes).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  async function sha256(value) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  async function initGoogleButton() {
    if (googleInitialized) return;
    let tries = 0;
    while (!(window.google && google.accounts && google.accounts.id) && tries < 80) {
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
      tries += 1;
    }
    if (!(window.google && google.accounts && google.accounts.id)) {
      $('#authStatus').textContent = 'O login do Google não carregou. Atualize a página.';
      return;
    }
    const nonce = await randomNonce();
    const hashedNonce = await sha256(nonce);
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      nonce: hashedNonce,
      callback: async function (response) {
        $('#authStatus').textContent = 'Entrando no Mostra aí…';
        const result = await db.auth.signInWithIdToken({ provider: 'google', token: response.credential, nonce: nonce });
        if (result.error) $('#authStatus').textContent = 'Não foi possível entrar: ' + result.error.message;
      }
    });
    googleInitialized = true;
    const slot = $('#googleButton');
    slot.textContent = '';
    google.accounts.id.renderButton(slot, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'continue_with', width: Math.min(400, slot.clientWidth || 400), locale: 'pt-BR' });
  }

  async function loadInvitePreview() {
    if (!pendingInvite) return;
    const result = await db.rpc('get_room_invite_preview', { p_token: pendingInvite });
    const preview = Array.isArray(result.data) ? result.data[0] : result.data;
    if (result.error || !preview) {
      $('#authStatus').textContent = 'Este convite não existe mais ou foi revogado.';
      pendingInvite = '';
      history.replaceState(null, '', location.pathname);
      return;
    }
    $('#loginInviteName').textContent = preview.room_name;
    $('#loginInvitePreview').classList.remove('hidden');
    $('#acceptInviteName').textContent = preview.room_name;
    $('#acceptInviter').textContent = preview.inviter_name;
    if (currentUser) openModal('acceptInviteModal');
  }

  function renderAccount() {
    const name = userName();
    $('#accountName').textContent = name;
    setAvatar($('#accountAvatar'), name, avatarUrl());
  }
  function renderRooms() {
    const list = $('#roomsList');
    list.textContent = '';
    if (!rooms.length) {
      const empty = document.createElement('div');
      empty.className = 'rooms-empty';
      empty.textContent = 'Nenhuma sala ainda. Crie a primeira e convide seus amigos.';
      list.appendChild(empty);
      return;
    }
    rooms.forEach(function (room) {
      const button = document.createElement('button');
      button.className = 'room-item' + (activeRoom && activeRoom.id === room.id ? ' active' : '');
      button.type = 'button';
      const hash = document.createElement('span');
      hash.className = 'room-hash'; hash.textContent = '#';
      const copy = document.createElement('span'); copy.className = 'room-item-copy';
      const title = document.createElement('strong'); title.textContent = room.name;
      const code = document.createElement('small'); code.textContent = room.code;
      copy.append(title, code); button.append(hash, copy);
      button.addEventListener('click', function () { openRoom(room); });
      list.appendChild(button);
    });
  }
  async function loadRooms(preferredId) {
    const result = await db.from('rooms').select('id,code,name,owner_id,media_key,created_at').order('created_at', { ascending: false });
    if (result.error) { showToast('Não consegui carregar suas salas.'); return; }
    rooms = result.data || [];
    renderRooms();
    if (preferredId) {
      const preferred = rooms.find(function (room) { return room.id === preferredId; });
      if (preferred) await openRoom(preferred);
    }
  }

  async function createRoom(event) {
    event.preventDefault();
    const input = $('#roomNameInput');
    const name = input.value.trim();
    if (!name) return;
    const button = $('#createForm button[type="submit"]');
    button.disabled = true; button.textContent = 'Criando…'; $('#createError').textContent = '';
    const result = await db.rpc('create_room', { room_name: name });
    button.disabled = false; button.textContent = 'Criar sala';
    if (result.error) { $('#createError').textContent = 'Não foi possível criar a sala agora.'; return; }
    const room = Array.isArray(result.data) ? result.data[0] : result.data;
    input.value = ''; closeModal('createModal');
    await loadRooms(room && room.id);
  }

  async function createInvite() {
    if (!activeRoom) return;
    const button = $('#inviteButton');
    button.disabled = true; button.textContent = 'Gerando…';
    const result = await db.rpc('create_room_invite', { p_room_id: activeRoom.id });
    button.disabled = false; button.textContent = 'Convidar';
    if (result.error || !result.data || !result.data.length) { showToast('Não consegui criar o convite.'); return; }
    const link = location.origin + location.pathname + '?invite=' + encodeURIComponent(result.data[0].token);
    $('#inviteLink').value = link;
    openModal('inviteModal');
  }
  async function acceptInvite() {
    const button = $('#acceptInvite');
    button.disabled = true; button.textContent = 'Entrando…'; $('#inviteError').textContent = '';
    const result = await db.rpc('accept_room_invite', { p_token: pendingInvite });
    button.disabled = false; button.textContent = 'Aceitar convite';
    const accepted = Array.isArray(result.data) ? result.data[0] : result.data;
    if (result.error || !accepted) { $('#inviteError').textContent = 'Este convite não está mais disponível.'; return; }
    pendingInvite = ''; history.replaceState(null, '', location.pathname); closeModal('acceptInviteModal');
    await loadRooms(accepted.room_id);
    showToast('Sala adicionada à sua conta.');
  }

  function resetChat() {
    if (chatChannel) db.removeChannel(chatChannel);
    chatChannel = null;
    $('#messages').innerHTML = '<div class="chat-empty"><span>✦</span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div>';
  }
  async function loadMessages() {
    if (!activeRoom) return;
    const roomId = activeRoom.id;
    const result = await db.from('room_messages').select('id,body,created_at,user_id,profiles(display_name,avatar_url)').eq('room_id', roomId).order('created_at', { ascending: true }).limit(200);
    if (result.error || !activeRoom || activeRoom.id !== roomId) return;
    renderMessages(result.data || []);
  }
  function renderMessages(items) {
    const list = $('#messages'); list.textContent = '';
    if (!items.length) {
      list.innerHTML = '<div class="chat-empty"><span>✦</span><strong>O chat começa aqui</strong><small>Mande a primeira mensagem para a sala.</small></div>';
      return;
    }
    items.forEach(function (item) {
      const profile = item.profiles || {};
      const name = profile.display_name || (item.user_id === currentUser.id ? userName() : 'Amigo');
      const row = document.createElement('article'); row.className = 'message';
      const avatar = document.createElement('span'); avatar.className = 'message-avatar'; setAvatar(avatar, name, profile.avatar_url || '');
      const content = document.createElement('div');
      const meta = document.createElement('div'); meta.className = 'message-meta';
      const author = document.createElement('strong'); author.textContent = name;
      const time = document.createElement('time'); time.textContent = new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const body = document.createElement('p'); body.textContent = escapeText(item.body);
      meta.append(author, time); content.append(meta, body); row.append(avatar, content); list.appendChild(row);
    });
    list.scrollTop = list.scrollHeight;
  }
  function subscribeChat() {
    resetChat();
    if (!activeRoom) return;
    const roomId = activeRoom.id;
    chatChannel = db.channel('room-chat-' + roomId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: 'room_id=eq.' + roomId }, function () { loadMessages(); }).subscribe();
    loadMessages();
  }
  async function sendMessage(event) {
    event.preventDefault();
    const input = $('#messageInput');
    const body = input.value.trim();
    if (!activeRoom || !body) return;
    input.value = '';
    const result = await db.from('room_messages').insert({ room_id: activeRoom.id, user_id: currentUser.id, body: body });
    if (result.error) { input.value = body; showToast('Não consegui enviar a mensagem.'); }
  }

  async function roomPeerId(room) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('mostra-ai:' + room.id + ':' + room.media_key));
    return 'mostra-' + Array.from(new Uint8Array(digest)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('').slice(0, 32);
  }
  function outgoingStream() {
    const tracks = [];
    if (screenTrack && screenTrack.readyState === 'live') tracks.push(screenTrack);
    else if (cameraTrack && cameraTrack.readyState === 'live') tracks.push(cameraTrack);
    if (microphoneTrack && microphoneTrack.readyState === 'live') tracks.push(microphoneTrack);
    screenAudioTracks.filter(function (track) { return track.readyState === 'live'; }).forEach(function (track) { tracks.push(track); });
    return new MediaStream(tracks);
  }
  function localKind() {
    if (screenTrack && screenTrack.readyState === 'live') return 'screen';
    if (cameraTrack && cameraTrack.readyState === 'live') return 'camera';
    if (microphoneTrack && microphoneTrack.readyState === 'live') return 'audio';
    return 'none';
  }
  function findTile(peerId) { return Array.from($('#mediaGrid').children).find(function (tile) { return tile.dataset.peerId === peerId; }); }
  function ensureTile(peerId, name, stream, kind, local) {
    let tile = findTile(peerId);
    if (!tile) {
      tile = document.createElement('article'); tile.className = 'media-tile'; tile.dataset.peerId = peerId;
      const avatar = document.createElement('div'); avatar.className = 'tile-avatar'; avatar.appendChild(document.createElement('span'));
      const video = document.createElement('video'); video.autoplay = true; video.playsInline = true;
      const meta = document.createElement('div'); meta.className = 'tile-meta';
      const label = document.createElement('span'); label.className = 'tile-name';
      const type = document.createElement('span'); type.className = 'tile-kind'; meta.append(label, type); tile.append(avatar, video, meta); $('#mediaGrid').appendChild(tile);
    }
    tile.querySelector('.tile-avatar span').textContent = initials(name);
    tile.querySelector('.tile-name').textContent = name + (local ? ' (você)' : '');
    tile.querySelector('.tile-kind').textContent = kind === 'screen' ? '· tela' : kind === 'camera' ? '· câmera' : kind === 'audio' ? '· áudio' : '';
    tile.classList.toggle('screen-share', kind === 'screen');
    const video = tile.querySelector('video'); const avatar = tile.querySelector('.tile-avatar');
    const hasVideo = Boolean(stream && stream.getVideoTracks().some(function (track) { return track.readyState === 'live'; }));
    if (stream && stream.getTracks().length) {
      if (video.srcObject !== stream) video.srcObject = stream;
      video.muted = local; video.style.display = hasVideo ? 'block' : 'none'; avatar.style.display = hasVideo ? 'none' : 'grid'; video.play().catch(function () {});
    } else { video.srcObject = null; video.style.display = 'none'; avatar.style.display = 'grid'; }
  }
  function renderRoster() {
    roster.forEach(function (name, id) {
      const stream = peer && id === peer.id ? outgoingStream() : remoteStreams.get(id);
      const kind = peer && id === peer.id ? localKind() : remoteKinds.get(id) || 'none';
      ensureTile(id, name, stream, kind, Boolean(peer && id === peer.id));
    });
    Array.from($('#mediaGrid').children).forEach(function (tile) { if (!roster.has(tile.dataset.peerId)) tile.remove(); });
    $('#participantCount').textContent = roster.size + (roster.size === 1 ? ' online' : ' online');
  }
  function applyRoster(items) {
    const activeIds = new Set(items.map(function (item) { return item.id; }));
    roster.forEach(function (_, id) {
      if (!activeIds.has(id)) { remoteStreams.delete(id); remoteKinds.delete(id); findTile(id)?.remove(); }
    });
    roster.clear(); items.forEach(function (item) { roster.set(item.id, String(item.name || 'Amigo').slice(0, 60)); }); renderRoster();
    if (outgoingStream().getTracks().length) roster.forEach(function (_, id) { callPeer(id); });
  }
  function broadcastRoster() {
    const payload = { type: 'roster', items: Array.from(roster, function (entry) { return { id: entry[0], name: entry[1] }; }) };
    dataConnections.forEach(function (connection) { if (connection.open) connection.send(payload); });
    applyRoster(payload.items);
  }
  function callPeer(peerId) {
    const stream = outgoingStream();
    if (!peer || peerId === peer.id || !stream.getTracks().length || outgoingCalls.has(peerId)) return;
    const call = peer.call(peerId, stream, { metadata: { name: userName(), kind: localKind() } });
    if (!call) return;
    outgoingCalls.set(peerId, call);
    call.on('close', function () { if (outgoingCalls.get(peerId) === call) outgoingCalls.delete(peerId); });
    call.on('error', function () { if (outgoingCalls.get(peerId) === call) outgoingCalls.delete(peerId); });
  }
  function refreshPublishing() {
    outgoingCalls.forEach(function (call) { call.close(); }); outgoingCalls.clear(); updateMediaButtons(); renderRoster();
    if (outgoingStream().getTracks().length) roster.forEach(function (_, id) { callPeer(id); });
  }
  function handleIncomingCall(call) {
    const old = incomingCalls.get(call.peer); if (old) old.close();
    incomingCalls.set(call.peer, call); call.answer();
    call.on('stream', function (stream) {
      remoteStreams.set(call.peer, stream); remoteKinds.set(call.peer, call.metadata && call.metadata.kind || (stream.getVideoTracks().length ? 'camera' : 'audio'));
      ensureTile(call.peer, roster.get(call.peer) || call.metadata && call.metadata.name || 'Amigo', stream, remoteKinds.get(call.peer), false);
    });
    call.on('close', function () { if (incomingCalls.get(call.peer) === call) { incomingCalls.delete(call.peer); remoteStreams.delete(call.peer); remoteKinds.delete(call.peer); renderRoster(); } });
  }
  function attachPeerHandlers(targetPeer) {
    targetPeer.on('call', handleIncomingCall);
    targetPeer.on('disconnected', function () { if (!leaving) setConnection('Reconectando…', false); });
  }
  function becomeCoordinator(targetPeer) {
    isCoordinator = true; peer = targetPeer; roster.set(peer.id, userName()); setConnection('Sala conectada', true); broadcastRoster();
    peer.on('connection', function (connection) {
      dataConnections.set(connection.peer, connection);
      connection.on('open', function () { roster.set(connection.peer, String(connection.metadata && connection.metadata.nickname || 'Amigo').slice(0, 60)); broadcastRoster(); });
      connection.on('data', function (data) { if (data && data.type === 'intro') { roster.set(connection.peer, String(data.nickname || 'Amigo').slice(0, 60)); broadcastRoster(); } });
      connection.on('close', function () { dataConnections.delete(connection.peer); roster.delete(connection.peer); remoteStreams.delete(connection.peer); remoteKinds.delete(connection.peer); broadcastRoster(); });
    });
  }
  function joinCoordinator() {
    if (leaving || !activeRoom) return;
    const memberPeer = new Peer({ debug: 1 }); peer = memberPeer; isCoordinator = false; attachPeerHandlers(memberPeer);
    memberPeer.on('open', function () {
      const connection = memberPeer.connect(coordinatorId, { reliable: true, metadata: { nickname: userName() } }); coordinatorConnection = connection;
      const timeout = setTimeout(function () { if (!connection.open) setConnection('Não consegui encontrar a sala', false); }, 9000);
      connection.on('open', function () { clearTimeout(timeout); setConnection('Sala conectada', true); connection.send({ type: 'intro', nickname: userName() }); });
      connection.on('data', function (data) { if (data && data.type === 'roster' && Array.isArray(data.items)) applyRoster(data.items); });
      connection.on('close', function () { if (!leaving) setConnection('A conexão da sala caiu. Entre novamente.', false); });
    });
    memberPeer.on('error', function (error) { if (!leaving && error.type === 'peer-unavailable') setConnection('A sala ainda está abrindo. Tente sair e entrar novamente.', false); });
  }
  async function startPeerRoom(room) {
    coordinatorId = await roomPeerId(room);
    const hostPeer = new Peer(coordinatorId, { debug: 1 }); peer = hostPeer; attachPeerHandlers(hostPeer);
    hostPeer.on('open', function () { becomeCoordinator(hostPeer); });
    hostPeer.on('error', function (error) {
      if (leaving) return;
      if (error.type === 'unavailable-id') { hostPeer.destroy(); setTimeout(joinCoordinator, 120); }
      else setConnection('Não consegui conectar a mídia', false);
    });
  }
  function stopMedia() {
    [screenTrack, cameraTrack, microphoneTrack].filter(Boolean).forEach(function (track) { track.stop(); });
    screenAudioTracks.forEach(function (track) { track.stop(); });
    screenTrack = null; cameraTrack = null; microphoneTrack = null; screenAudioTracks = [];
  }
  function cleanupPeer() {
    leaving = true; stopMedia();
    outgoingCalls.forEach(function (call) { call.close(); }); incomingCalls.forEach(function (call) { call.close(); }); dataConnections.forEach(function (connection) { connection.close(); });
    coordinatorConnection?.close(); peer?.destroy(); peer = null; coordinatorConnection = null; isCoordinator = false;
    roster.clear(); dataConnections.clear(); outgoingCalls.clear(); incomingCalls.clear(); remoteStreams.clear(); remoteKinds.clear(); $('#mediaGrid').textContent = ''; leaving = false;
  }
  function updateMediaButtons() {
    $('#screenButton').classList.toggle('active', Boolean(screenTrack && screenTrack.readyState === 'live'));
    $('#cameraButton').classList.toggle('active', Boolean(cameraTrack && cameraTrack.readyState === 'live'));
    $('#micButton').classList.toggle('active', Boolean(microphoneTrack && microphoneTrack.readyState === 'live'));
  }
  async function toggleMicrophone() {
    try {
      if (microphoneTrack) { const old = microphoneTrack; microphoneTrack = null; old.stop(); }
      else { const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false }); microphoneTrack = stream.getAudioTracks()[0]; microphoneTrack.addEventListener('ended', function () { microphoneTrack = null; if (!leaving) refreshPublishing(); }); }
      refreshPublishing();
    } catch (_) { showToast('O microfone não foi autorizado.'); }
  }
  async function toggleCamera() {
    try {
      if (cameraTrack) { const old = cameraTrack; cameraTrack = null; old.stop(); }
      else { const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); cameraTrack = stream.getVideoTracks()[0]; cameraTrack.addEventListener('ended', function () { cameraTrack = null; if (!leaving) refreshPublishing(); }); }
      refreshPublishing();
    } catch (_) { showToast('A câmera não foi autorizada.'); }
  }
  async function toggleScreen() {
    try {
      if (screenTrack) { const oldVideo = screenTrack; const oldAudio = screenAudioTracks.slice(); screenTrack = null; screenAudioTracks = []; oldVideo.stop(); oldAudio.forEach(function (track) { track.stop(); }); }
      else { const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30, max: 60 } }, audio: true }); screenTrack = stream.getVideoTracks()[0]; screenAudioTracks = stream.getAudioTracks(); screenTrack.addEventListener('ended', function () { screenTrack = null; screenAudioTracks.forEach(function (track) { track.stop(); }); screenAudioTracks = []; if (!leaving) refreshPublishing(); }); }
      refreshPublishing();
    } catch (_) { showToast('O compartilhamento foi cancelado.'); }
  }

  async function openRoom(room) {
    if (activeRoom && activeRoom.id === room.id) { $('#sidebar').classList.remove('open'); return; }
    cleanupPeer(); activeRoom = room; renderRooms();
    $('#emptyStage').classList.add('hidden'); $('#mediaStage').classList.remove('hidden'); $('#mediaControls').classList.remove('hidden');
    $('#roomTitle').textContent = room.name; $('#roomSubtitle').textContent = 'Sala ' + room.code; $('#chatRoomName').textContent = '#' + room.name;
    $('#inviteButton').disabled = false; $('#messageInput').disabled = false; $('#sendMessage').disabled = false; $('#messageInput').placeholder = 'Mensagem em #' + room.name;
    $('#sidebar').classList.remove('open'); setConnection('Conectando à sala…', false); subscribeChat(); await startPeerRoom(room);
  }
  function leaveActiveRoom() {
    cleanupPeer(); activeRoom = null; renderRooms(); resetChat();
    $('#emptyStage').classList.remove('hidden'); $('#mediaStage').classList.add('hidden'); $('#mediaControls').classList.add('hidden');
    $('#roomTitle').textContent = 'Escolha uma sala'; $('#roomSubtitle').textContent = 'Suas salas ficam salvas aqui'; $('#chatRoomName').textContent = 'Selecione uma sala'; $('#participantCount').textContent = '0 online';
    $('#inviteButton').disabled = true; $('#messageInput').disabled = true; $('#sendMessage').disabled = true; $('#messageInput').placeholder = 'Escolha uma sala para conversar';
  }

  async function bootSignedIn(user) {
    currentUser = user; $('#authScreen').classList.add('hidden'); $('#app').classList.remove('hidden'); renderAccount(); await loadRooms();
    if (pendingInvite) await loadInvitePreview();
  }
  async function bootSignedOut() {
    currentUser = null; cleanupPeer(); activeRoom = null; $('#app').classList.add('hidden'); $('#authScreen').classList.remove('hidden'); await loadInvitePreview(); await initGoogleButton();
  }
  function handleSession(session) {
    const user = session && session.user;
    const nextIdentity = user ? user.id : null;
    if (sessionIdentity === nextIdentity) return;
    sessionIdentity = nextIdentity;
    if (user) bootSignedIn(user); else bootSignedOut();
  }

  $('#createForm').addEventListener('submit', createRoom);
  $('#messageForm').addEventListener('submit', sendMessage);
  ['newRoom', 'newRoomWide', 'emptyCreate'].forEach(function (id) { $('#' + id).addEventListener('click', function () { openModal('createModal'); setTimeout(function () { $('#roomNameInput').focus(); }, 50); }); });
  document.querySelectorAll('[data-close]').forEach(function (button) { button.addEventListener('click', function () { closeModal(button.dataset.close); }); });
  document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) { backdrop.addEventListener('click', function (event) { if (event.target === backdrop && backdrop.id !== 'acceptInviteModal') closeModal(backdrop.id); }); });
  $('#inviteButton').addEventListener('click', createInvite);
  $('#copyInvite').addEventListener('click', async function () { await navigator.clipboard.writeText($('#inviteLink').value); $('#copyInvite').textContent = 'Copiado'; setTimeout(function () { $('#copyInvite').textContent = 'Copiar'; }, 1400); });
  $('#acceptInvite').addEventListener('click', acceptInvite);
  $('#declineInvite').addEventListener('click', function () { pendingInvite = ''; history.replaceState(null, '', location.pathname); closeModal('acceptInviteModal'); });
  $('#logoutButton').addEventListener('click', async function () { await db.auth.signOut(); });
  $('#openSidebar').addEventListener('click', function () { $('#sidebar').classList.add('open'); }); $('#closeSidebar').addEventListener('click', function () { $('#sidebar').classList.remove('open'); });
  $('#toggleChat').addEventListener('click', function () { $('#chatPanel').classList.toggle('open'); }); $('#closeChat').addEventListener('click', function () { $('#chatPanel').classList.remove('open'); });
  $('#micButton').addEventListener('click', toggleMicrophone); $('#cameraButton').addEventListener('click', toggleCamera); $('#screenButton').addEventListener('click', toggleScreen); $('#leaveButton').addEventListener('click', leaveActiveRoom);
  window.addEventListener('beforeunload', function () { leaving = true; stopMedia(); peer?.destroy(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});

  db.auth.onAuthStateChange(function (_event, session) {
    setTimeout(function () { handleSession(session); }, 0);
  });
  db.auth.getSession().then(function (result) {
    handleSession(result.data && result.data.session);
  });
})();
`;

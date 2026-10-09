export const appScript = String.raw`
(function () {
  'use strict';
  const SUPABASE_URL = 'https://ahygayqpwhkphjdyrktw.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_v1XL67mYUlHwkjDva7OsTw_zljnYttq';
  const GOOGLE_CLIENT_ID = '745889112770-idm2cc38g6fkjhcoqvv8emhk9j0kn99u.apps.googleusercontent.com';
  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const $ = function (selector) { return document.querySelector(selector); };

  let currentUser = null;
  let ownProfile = null;
  const photoCache = new Map();
  const peerUserIds = new Map();
  const memberProfiles = new Map();
  let micDevice = localStorage.getItem('mostra-microphone') || '';
  let cameraDevice = localStorage.getItem('mostra-camera') || '';
  let previewCamera = null, previewMic = null, meterContext = null, meterFrame = null;
  let previewGeneration = 0;
  let profileDraftPhoto, roomDraftPhoto;
  let modalReturnFocus = null;
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
    return String(ownProfile?.display_name || meta.full_name || meta.name || (currentUser && currentUser.email || '').split('@')[0] || 'Amigo').slice(0, 60);
  }
  function avatarUrl() {
    return String(ownProfile ? ownProfile.avatar_url || '' : currentUser?.user_metadata?.avatar_url || '');
  }
  function escapeText(value) { return String(value == null ? '' : value); }
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function openModal(id) {
    modalReturnFocus = document.activeElement;
    const modal = $('#' + id); modal.classList.remove('hidden');
    const box = modal.querySelector('.modal'); box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
    box.setAttribute('aria-label', box.querySelector('h2')?.textContent || 'Configurações');
    (box.querySelector('input:not([type=file]),select,button') || box).focus();
  }
  function closeModal(id) {
    $('#' + id).classList.add('hidden');
    if (id === 'devicesModal') stopPreviews();
    modalReturnFocus?.focus();
  }
  function setAvatar(element, name, url) {
    element.textContent = initials(name);
    element.style.backgroundImage = '';
    element.dataset.photo = url || '';
    if (!url) return;
    resolvePhoto(url).then(function (resolved) {
      if (element.dataset.photo !== url || !resolved) return;
      element.style.backgroundImage = 'url(' + JSON.stringify(resolved) + ')';
      element.textContent = '';
    }).catch(function () {});
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
    rooms.filter(function(room) { return room.name.toLocaleLowerCase('pt-BR').includes($('#roomSearch').value.trim().toLocaleLowerCase('pt-BR')); }).forEach(function (room) {
      const button = document.createElement('button');
      button.className = 'room-item' + (activeRoom && activeRoom.id === room.id ? ' active' : '');
      button.type = 'button';
      const hash = document.createElement('span');
      hash.className = 'room-hash'; setAvatar(hash, room.name, room.avatar_url);
      const copy = document.createElement('span'); copy.className = 'room-item-copy';
      const title = document.createElement('strong'); title.textContent = room.name;
      const code = document.createElement('small'); code.textContent = activeRoom?.id === room.id ? 'Na chamada' : 'Sala de conversa';
      copy.append(title, code); button.append(hash, copy);
      button.addEventListener('click', function () { openRoom(room); });
      list.appendChild(button);
    });
  }
  async function loadRooms(preferredId) {
    const result = await db.from('rooms').select('id,code,name,owner_id,media_key,avatar_url,created_at').order('created_at', { ascending: false });
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
    const original = button.innerHTML;
    button.disabled = true; button.textContent = 'Gerando…';
    const result = await db.rpc('create_room_invite', { p_room_id: activeRoom.id });
    button.disabled = false; button.innerHTML = original;
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
    if (result.error || !accepted) {
      const unavailable = !result.error || result.error.code === 'P0001' ||
        /not found|expired/i.test(result.error.message || '');
      $('#inviteError').textContent = unavailable
        ? 'Este convite não está mais disponível.'
        : 'Não consegui aceitar o convite agora. Tente novamente.';
      return;
    }
    pendingInvite = ''; history.replaceState(null, '', location.pathname); closeModal('acceptInviteModal');
    await loadRooms(accepted.room_id);
    showToast('Sala adicionada à sua conta.');
  }

  function resetChat() {
    if (chatChannel) db.removeChannel(chatChannel);
    chatChannel = null;
    $('#messages').innerHTML = '<div class="chat-empty"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2V11.5a8.5 8.5 0 0 1 18 0Z"/><path d="M7 9h10M7 13h6"/></svg></span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div>';
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
      list.innerHTML = '<div class="chat-empty"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2V11.5a8.5 8.5 0 0 1 18 0Z"/><path d="M7 9h10M7 13h6"/></svg></span><strong>O chat começa aqui</strong><small>Mande a primeira mensagem para a sala.</small></div>';
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
      const type = document.createElement('span'); type.className = 'tile-kind'; meta.append(label, type);
      const volume = document.createElement('div'); volume.className = 'tile-volume hidden';
      const mute = document.createElement('button'); mute.type = 'button'; mute.className = 'tile-mute';
      mute.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="volume-waves" d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
      const slider = document.createElement('input'); slider.type = 'range'; slider.className = 'tile-volume-range'; slider.min = '0'; slider.max = '1'; slider.step = '0.05'; slider.value = '1';
      const amount = document.createElement('span'); amount.className = 'tile-volume-value'; amount.textContent = '100%';
      slider.addEventListener('input', function () {
        video.volume = Number(slider.value); video.muted = false; tile.dataset.audioMuted = 'false';
        if (video.volume > 0) tile.dataset.lastVolume = slider.value;
        amount.textContent = Math.round(video.volume * 100) + '%';
        mute.classList.toggle('muted', video.volume === 0);
        mute.setAttribute('aria-label', video.volume === 0 ? 'Reativar áudio' : 'Silenciar áudio');
        video.play().catch(function () {});
      });
      mute.addEventListener('click', function () {
        const willMute = !video.muted && Number(slider.value) > 0;
        if (willMute) {
          tile.dataset.lastVolume = slider.value; video.muted = true; tile.dataset.audioMuted = 'true';
          amount.textContent = 'Mudo';
        } else {
          if (Number(slider.value) === 0) slider.value = tile.dataset.lastVolume || '0.75';
          video.volume = Number(slider.value); video.muted = false; tile.dataset.audioMuted = 'false';
          amount.textContent = Math.round(video.volume * 100) + '%';
        }
        mute.classList.toggle('muted', video.muted);
        mute.setAttribute('aria-label', video.muted ? 'Reativar áudio' : 'Silenciar áudio');
        video.play().catch(function () {});
      });
      volume.append(mute, slider, amount); tile.append(avatar, video, meta, volume); $('#mediaGrid').appendChild(tile);
    }
    setAvatar(tile.querySelector('.tile-avatar span'), name, local ? avatarUrl() : memberProfiles.get(peerUserIds.get(peerId))?.avatar_url || '');
    tile.querySelector('.tile-name').textContent = name + (local ? ' (você)' : '');
    tile.querySelector('.tile-kind').textContent = kind === 'screen' ? '· tela' : kind === 'camera' ? '· câmera' : kind === 'audio' ? '· áudio' : '';
    tile.classList.toggle('screen-share', kind === 'screen');
    const video = tile.querySelector('video'); const avatar = tile.querySelector('.tile-avatar');
    const volume = tile.querySelector('.tile-volume'); const slider = tile.querySelector('.tile-volume-range'); const mute = tile.querySelector('.tile-mute');
    const hasVideo = Boolean(stream && stream.getVideoTracks().some(function (track) { return track.readyState === 'live'; }));
    const hasAudio = Boolean(stream && stream.getAudioTracks().some(function (track) { return track.readyState === 'live'; }));
    volume.classList.toggle('hidden', local || !hasAudio);
    slider.setAttribute('aria-label', 'Volume do áudio de ' + name);
    if (stream && stream.getTracks().length) {
      if (video.srcObject !== stream) video.srcObject = stream;
      video.volume = Number(slider.value); video.muted = local || tile.dataset.audioMuted === 'true';
      video.style.display = hasVideo ? 'block' : 'none'; avatar.style.display = hasVideo ? 'none' : 'grid'; video.play().catch(function () {});
    } else { video.srcObject = null; video.style.display = 'none'; avatar.style.display = 'grid'; }
    mute.setAttribute('aria-label', video.muted ? 'Reativar áudio de ' + name : 'Silenciar áudio de ' + name);
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
    memberProfiles.clear();
    const activeIds = new Set(items.map(function (item) { return item.id; }));
    roster.forEach(function (_, id) {
      if (!activeIds.has(id)) { remoteStreams.delete(id); remoteKinds.delete(id); findTile(id)?.remove(); }
    });
    roster.clear(); items.forEach(function (item) { roster.set(item.id, String(item.name || 'Amigo').slice(0, 60)); if (item.userId) peerUserIds.set(item.id,item.userId); }); renderRoster();
    loadMemberProfiles();
    if (outgoingStream().getTracks().length) roster.forEach(function (_, id) { callPeer(id); });
  }
  function broadcastRoster() {
    const payload = { type: 'roster', items: Array.from(roster, function (entry) { return { id: entry[0], name: entry[1], userId: peerUserIds.get(entry[0]) }; }) };
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
    isCoordinator = true; peer = targetPeer; roster.set(peer.id, userName()); peerUserIds.set(peer.id,currentUser.id); setConnection('Sala conectada', true); broadcastRoster();
    peer.on('connection', function (connection) {
      dataConnections.set(connection.peer, connection); if(connection.metadata?.userId) peerUserIds.set(connection.peer,connection.metadata.userId);
      connection.on('open', function () { roster.set(connection.peer, String(connection.metadata && connection.metadata.nickname || 'Amigo').slice(0, 60)); broadcastRoster(); });
      connection.on('data', function (data) { if (data && data.type === 'intro') { roster.set(connection.peer, String(data.nickname || 'Amigo').slice(0, 60)); broadcastRoster(); } });
      connection.on('close', function () { dataConnections.delete(connection.peer); roster.delete(connection.peer); remoteStreams.delete(connection.peer); remoteKinds.delete(connection.peer); broadcastRoster(); });
    });
  }
  function joinCoordinator() {
    if (leaving || !activeRoom) return;
    const memberPeer = new Peer({ debug: 1 }); peer = memberPeer; isCoordinator = false; attachPeerHandlers(memberPeer);
    memberPeer.on('open', function () {
      const connection = memberPeer.connect(coordinatorId, { reliable: true, metadata: { nickname: userName(), userId: currentUser.id } }); coordinatorConnection = connection;
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
    roster.clear(); peerUserIds.clear(); memberProfiles.clear(); dataConnections.clear(); outgoingCalls.clear(); incomingCalls.clear(); remoteStreams.clear(); remoteKinds.clear(); $('#mediaGrid').textContent = ''; leaving = false; updateMediaButtons();
  }
  function updateMediaButtons() {
    [['screenButton',screenTrack,'Parar tela','Compartilhar tela'],['cameraButton',cameraTrack,'Desligar câmera','Ligar câmera'],['micButton',microphoneTrack,'Silenciar','Ligar microfone']].forEach(function(item){
      const on = Boolean(item[1] && item[1].readyState === 'live');
      const button = $('#' + item[0]); button.classList.toggle('active',on); button.setAttribute('aria-pressed',String(on)); button.setAttribute('aria-label',on ? item[2] : item[3]); button.title = on ? item[2] : item[3]; button.querySelector('small').textContent = on ? item[2] : item[3];
    });
  }
  function microphoneConstraints() { return Object.assign({echoCancellation:true,noiseSuppression:true}, micDevice ? {deviceId:{exact:micDevice}} : {}); }
  function cameraConstraints() { return Object.assign({width:{ideal:1280},height:{ideal:720}}, cameraDevice ? {deviceId:{exact:cameraDevice}} : {}); }
  function mediaError(error) {
    if(error.name === 'NotAllowedError') return 'Acesso bloqueado. Permita câmera ou microfone nas configurações deste site no navegador.';
    if(error.name === 'NotFoundError') return 'Nenhum dispositivo encontrado. Confira se está conectado.';
    if(error.name === 'OverconstrainedError') return 'O dispositivo salvo não está disponível. Escolha outro em Áudio e vídeo.';
    if(error.name === 'NotReadableError') return 'O dispositivo está ocupado ou não pode ser acessado. Feche outros aplicativos e tente novamente.';
    return 'Não foi possível acessar o dispositivo. Tente novamente.';
  }
  async function replaceMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({audio:microphoneConstraints(),video:false});
    if (!activeRoom) { stream.getTracks().forEach(t=>t.stop()); return; }
    const previous = microphoneTrack; microphoneTrack = stream.getAudioTracks()[0]; previous?.stop();
    const current = microphoneTrack; current.addEventListener('ended',function(){if(microphoneTrack===current){microphoneTrack=null;refreshPublishing();}});
    refreshPublishing();
  }
  async function replaceCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({video:cameraConstraints(),audio:false});
    if (!activeRoom) { stream.getTracks().forEach(t=>t.stop()); return; }
    const previous = cameraTrack; cameraTrack = stream.getVideoTracks()[0]; previous?.stop();
    const current = cameraTrack; current.addEventListener('ended',function(){if(cameraTrack===current){cameraTrack=null;refreshPublishing();}});
    refreshPublishing();
  }
  async function toggleMicrophone() {
    if (!activeRoom) return;
    $('#micButton').disabled=true;
    try { if (microphoneTrack) { microphoneTrack.stop(); microphoneTrack=null; refreshPublishing(); } else await replaceMicrophone(); }
    catch(error){showToast(mediaError(error));} finally{$('#micButton').disabled=false;}
  }
  async function toggleCamera() {
    if (!activeRoom) return;
    $('#cameraButton').disabled=true;
    try { if(cameraTrack){cameraTrack.stop();cameraTrack=null;refreshPublishing();}else await replaceCamera(); }
    catch(error){showToast(mediaError(error));}finally{$('#cameraButton').disabled=false;}
  }
  async function toggleScreen() {
    try {
      if (screenTrack) { const oldVideo = screenTrack; const oldAudio = screenAudioTracks.slice(); screenTrack = null; screenAudioTracks = []; oldVideo.stop(); oldAudio.forEach(function (track) { track.stop(); }); }
      else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 30, max: 60 } }, audio: true });
        screenTrack = stream.getVideoTracks()[0]; screenAudioTracks = stream.getAudioTracks();
        if (!screenAudioTracks.length) showToast('Para transmitir o som, marque “Compartilhar áudio” na janela do navegador.');
        screenTrack.addEventListener('ended', function () { screenTrack = null; screenAudioTracks.forEach(function (track) { track.stop(); }); screenAudioTracks = []; if (!leaving) refreshPublishing(); });
      }
      refreshPublishing();
    } catch (_) { showToast('O compartilhamento foi cancelado.'); }
  }

  async function openRoom(room) {
    if (activeRoom && activeRoom.id === room.id) { $('#sidebar').classList.remove('open'); return; }
    cleanupPeer(); activeRoom = room; renderRooms(); updateRoomHeading();
    $('#emptyStage').classList.add('hidden'); $('#mediaStage').classList.remove('hidden'); $('#mediaControls').classList.remove('hidden');
    $('#roomTitle').textContent = room.name; $('#roomSubtitle').textContent = 'Sala ' + room.code; $('#chatRoomName').textContent = '#' + room.name;
    $('#inviteButton').disabled = false; $('#messageInput').disabled = false; $('#sendMessage').disabled = false; $('#messageInput').placeholder = 'Mensagem em #' + room.name;
    $('#sidebar').classList.remove('open'); setConnection('Conectando à sala…', false); subscribeChat(); await startPeerRoom(room);
  }
  function leaveActiveRoom() {
    cleanupPeer(); activeRoom = null; renderRooms(); resetChat(); $('#roomSettingsButton').classList.add('hidden'); $('#headerRoomAvatar').style.backgroundImage=''; $('#headerRoomAvatar').textContent='#';
    $('#emptyStage').classList.remove('hidden'); $('#mediaStage').classList.add('hidden'); $('#mediaControls').classList.add('hidden');
    $('#roomTitle').textContent = 'Escolha uma sala'; $('#roomSubtitle').textContent = 'Suas salas ficam salvas aqui'; $('#chatRoomName').textContent = 'Selecione uma sala'; $('#participantCount').textContent = '0 online';
    $('#inviteButton').disabled = true; $('#messageInput').disabled = true; $('#sendMessage').disabled = true; $('#messageInput').placeholder = 'Escolha uma sala para conversar';
  }

  async function bootSignedIn(user) {
    currentUser = user;
    const profileResult = await db.from('profiles').select('display_name,avatar_url').eq('id',user.id).single();
    ownProfile = profileResult.data || null;
    $('#authScreen').classList.add('hidden'); $('#app').classList.remove('hidden'); renderAccount(); await loadRooms();
    if (pendingInvite) await loadInvitePreview();
  }
  async function bootSignedOut() {
    currentUser = null; ownProfile=null; stopPreviews(); resetChat(); document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.add('hidden')); cleanupPeer(); activeRoom = null; $('#app').classList.add('hidden'); $('#authScreen').classList.remove('hidden'); await loadInvitePreview(); await initGoogleButton();
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
  function toggleChat(force) {
    if (window.matchMedia('(max-width:980px)').matches) {
      const open = typeof force==='boolean' ? force : !$('#chatPanel').classList.contains('open');
      $('.room-layout').classList.remove('chat-hidden'); $('#chatPanel').classList.toggle('open',open); $('#toggleChat').setAttribute('aria-pressed',String(open));
    } else {
      const open = typeof force==='boolean' ? force : $('.room-layout').classList.contains('chat-hidden');
      $('.room-layout').classList.toggle('chat-hidden',!open); $('#toggleChat').setAttribute('aria-pressed',String(open));
    }
  }
  $('#toggleChat').addEventListener('click', function () { toggleChat(); }); $('#closeChat').addEventListener('click', function () { toggleChat(false); });
  $('#micButton').addEventListener('click', toggleMicrophone); $('#cameraButton').addEventListener('click', toggleCamera); $('#screenButton').addEventListener('click', toggleScreen); $('#leaveButton').addEventListener('click', leaveActiveRoom);
  window.addEventListener('beforeunload', function () { stopPreviews(); leaving = true; stopMedia(); peer?.destroy(); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});


  async function resolvePhoto(value) {
    if (!value) return '';
    if (!value.startsWith('media:')) { try { const url=new URL(value);return ['https:','blob:'].includes(url.protocol)?value:''; } catch{return '';} }
    const path=value.slice(6), cached=photoCache.get(path);
    if(cached && cached.until>Date.now()) return cached.url;
    const result=await db.storage.from('mostra-photos').createSignedUrl(path,3600);
    if(result.error) return '';
    photoCache.set(path,{url:result.data.signedUrl,until:Date.now()+3300000});return result.data.signedUrl;
  }
  let loadingMembers=false;
  async function loadMemberProfiles() {
    if(loadingMembers||!activeRoom)return;
    const ids=Array.from(new Set(peerUserIds.values())).filter(id=>!memberProfiles.has(id));
    if(!ids.length)return;
    loadingMembers=true;
    try{
      const result=await db.from('profiles').select('id,display_name,avatar_url').in('id',ids);
      for(const profile of result.data||[]) memberProfiles.set(profile.id,profile);
      renderRoster();
    }finally{loadingMembers=false;}
  }
  function updateRoomHeading() {
    if(!activeRoom)return;
    setAvatar($('#headerRoomAvatar'),activeRoom.name,activeRoom.avatar_url);
    $('#roomSettingsButton').classList.toggle('hidden',activeRoom.owner_id!==currentUser.id);
    $('#roomTitle').textContent=activeRoom.name;$('#chatRoomName').textContent=activeRoom.name;
  }
  function resetDraft(kind) {
    const draft=kind==='profile'?profileDraftPhoto:roomDraftPhoto;
    if(draft?.url)URL.revokeObjectURL(draft.url);
    if(kind==='profile')profileDraftPhoto=undefined;else roomDraftPhoto=undefined;
  }
  async function preparePhoto(file) {
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Escolha uma foto JPG, PNG ou WebP.');
    if(file.size>5*1024*1024)throw new Error('A foto deve ter até 5 MB.');
    const bitmap=await createImageBitmap(file);
    try {
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
      const ctx=canvas.getContext('2d'),size=Math.min(bitmap.width,bitmap.height);
      ctx.fillStyle='#30243f';ctx.fillRect(0,0,512,512);
      ctx.drawImage(bitmap,(bitmap.width-size)/2,(bitmap.height-size)/2,size,size,0,0,512,512);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.86));
      if(!blob)throw new Error('Não consegui abrir esta imagem.');
      return {blob,url:URL.createObjectURL(blob)};
    }finally{bitmap.close();}
  }
  async function choosePhoto(kind,input) {
    const file=input.files[0];if(!file)return;
    const error=$('#'+(kind==='profile'?'profileError':'roomSettingsError'));error.textContent='';
    try {
      const prepared=await preparePhoto(file);resetDraft(kind);
      if(kind==='profile')profileDraftPhoto=prepared;else roomDraftPhoto=prepared;
      setAvatar($('#'+(kind==='profile'?'profilePhotoPreview':'roomPhotoPreview')),'',prepared.url);
    }catch(err){error.textContent=err.message;}finally{input.value='';}
  }
  async function uploadPhoto(kind,id,draft) {
    const path=kind+'/'+id+'/'+crypto.randomUUID()+'.jpg';
    const result=await db.storage.from('mostra-photos').upload(path,draft.blob,{contentType:'image/jpeg',cacheControl:'3600',upsert:false});
    if(result.error)throw new Error('Não consegui enviar a foto. Tente novamente.');
    return 'media:'+path;
  }
  async function removeOldPhoto(value) {if(value?.startsWith('media:'))await db.storage.from('mostra-photos').remove([value.slice(6)]);}
  function editProfile() {
    resetDraft('profile');$('#profileNameInput').value=userName();$('#profileError').textContent='';
    setAvatar($('#profilePhotoPreview'),userName(),avatarUrl());openModal('profileModal');
  }
  function editRoom() {
    if(!activeRoom||activeRoom.owner_id!==currentUser.id)return;
    resetDraft('room');$('#editRoomName').value=activeRoom.name;$('#roomSettingsError').textContent='';
    setAvatar($('#roomPhotoPreview'),activeRoom.name,activeRoom.avatar_url);openModal('roomSettingsModal');
  }
  async function savePersonalization(event,kind) {
    event.preventDefault();const isProfile=kind==='profile';
    const form=event.currentTarget,button=form.querySelector('button[type=submit]'),error=$('#'+(isProfile?'profileError':'roomSettingsError'));
    const name=$('#'+(isProfile?'profileNameInput':'editRoomName')).value.trim();
    if(!name){error.textContent='Digite um nome.';return;}
    const id=isProfile?currentUser.id:activeRoom?.id;if(!id)return;
    const oldPhoto=isProfile?avatarUrl():activeRoom.avatar_url;
    const draft=isProfile?profileDraftPhoto:roomDraftPhoto;
    let newPhoto=oldPhoto;
    button.disabled=true;button.textContent='Salvando…';error.textContent='';
    try {
      if(draft)newPhoto=await uploadPhoto(isProfile?'profiles':'rooms',id,draft);
      else if(draft===null)newPhoto=null;
      const values=isProfile?{display_name:name,avatar_url:newPhoto}:{name:name,avatar_url:newPhoto};
      const result=await db.from(isProfile?'profiles':'rooms').update(values).eq('id',id).select('id').single();
      if(result.error)throw new Error('Não consegui salvar. Confira sua conexão e tente novamente.');
      if(isProfile){
        ownProfile=values;renderAccount();
        if(peer){roster.set(peer.id,name);if(isCoordinator)broadcastRoster();else coordinatorConnection?.send({type:'intro',nickname:name});renderRoster();}
      }else{
        rooms=rooms.map(room=>room.id===id?Object.assign({},room,values):room);
        if(activeRoom?.id===id){activeRoom=Object.assign({},activeRoom,values);updateRoomHeading();}
        renderRooms();
      }
      closeModal(isProfile?'profileModal':'roomSettingsModal');showToast('Alterações salvas.');
      if(newPhoto!==oldPhoto)removeOldPhoto(oldPhoto).catch(()=>{});
      resetDraft(kind);
    }catch(err){error.textContent=err.message;if(newPhoto!==oldPhoto&&newPhoto)await removeOldPhoto(newPhoto);}
    finally{button.disabled=false;button.textContent='Salvar alterações';}
  }
  async function enumerateDevices() {
    if(!navigator.mediaDevices?.enumerateDevices){$('#deviceHint').textContent='Seu navegador não oferece seleção de dispositivos.';return;}
    try{
      const devices=await navigator.mediaDevices.enumerateDevices();
      [['microphoneSelect','audioinput',micDevice,'Microfone'],['cameraSelect','videoinput',cameraDevice,'Câmera']].forEach(([id,kind,selected,label])=>{
        const select=$('#'+id);select.textContent='';select.add(new Option('Padrão do sistema',''));
        devices.filter(d=>d.kind===kind&&d.deviceId&&d.deviceId!=='default').forEach((d,i)=>select.add(new Option(d.label||label+' '+(i+1),d.deviceId)));
        if(selected&&!Array.from(select.options).some(o=>o.value===selected))select.add(new Option('Dispositivo salvo (indisponível)',selected));
        select.value=selected;
      });
    }catch(err){$('#deviceHint').textContent=mediaError(err);}
  }
  function stopMicPreview() {
    previewMic?.getTracks().forEach(t=>t.stop());previewMic=null;
    if(meterFrame)cancelAnimationFrame(meterFrame);meterFrame=null;
    meterContext?.close().catch(()=>{});meterContext=null;$('#micLevel').value=0;$('#testMic').textContent='Testar microfone';
  }
  function stopCameraPreview() {
    previewCamera?.getTracks().forEach(t=>t.stop());previewCamera=null;
    $('#cameraPreview').srcObject=null;$('#cameraPreviewHint').classList.remove('hidden');$('#testCamera').textContent='Testar câmera';
  }
  function stopPreviews(){previewGeneration++;stopMicPreview();stopCameraPreview();}
  async function testMicrophone() {
    if(previewMic){stopMicPreview();return;}
    const generation=previewGeneration;$('#testMic').disabled=true;
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:microphoneConstraints(),video:false});
      if(generation!==previewGeneration){stream.getTracks().forEach(t=>t.stop());return;}
      previewMic=stream;$('#testMic').textContent='Parar teste';await enumerateDevices();
      if(generation!==previewGeneration)return;
      const AudioCtx=window.AudioContext||window.webkitAudioContext;meterContext=new AudioCtx();await meterContext.resume();
      if(generation!==previewGeneration)return;
      const source=meterContext.createMediaStreamSource(stream),analyser=meterContext.createAnalyser();analyser.fftSize=256;source.connect(analyser);
      const data=new Uint8Array(analyser.fftSize);
      function measure(){if(!previewMic)return;analyser.getByteTimeDomainData(data);let sum=0;for(const v of data)sum+=Math.pow((v-128)/128,2);$('#micLevel').value=Math.min(100,Math.sqrt(sum/data.length)*350);meterFrame=requestAnimationFrame(measure);}
      measure();$('#deviceHint').textContent='Teste local: seu microfone não está sendo transmitido por este teste.';
    }catch(err){stopMicPreview();$('#deviceHint').textContent=mediaError(err);}finally{$('#testMic').disabled=false;}
  }
  async function testCamera() {
    if(previewCamera){stopCameraPreview();return;}
    const generation=previewGeneration;$('#testCamera').disabled=true;
    try {
      const stream=await navigator.mediaDevices.getUserMedia({video:cameraConstraints(),audio:false});
      if(generation!==previewGeneration){stream.getTracks().forEach(t=>t.stop());return;}
      previewCamera=stream;$('#cameraPreview').srcObject=stream;$('#cameraPreviewHint').classList.add('hidden');$('#testCamera').textContent='Parar prévia';
      await enumerateDevices();$('#deviceHint').textContent='Esta prévia fica só com você. Fechar esta janela encerra o teste.';
    }catch(err){$('#deviceHint').textContent=mediaError(err);}finally{$('#testCamera').disabled=false;}
  }
  async function changeDevice(kind) {
    const isMic=kind==='mic',select=$('#'+(isMic?'microphoneSelect':'cameraSelect')),old=isMic?micDevice:cameraDevice;
    if(isMic)micDevice=select.value;else cameraDevice=select.value;
    select.disabled=true;
    try{
      if(isMic&&microphoneTrack)await replaceMicrophone();else if(!isMic&&cameraTrack)await replaceCamera();
      if(isMic&&previewMic){stopMicPreview();await testMicrophone();}else if(!isMic&&previewCamera){stopCameraPreview();await testCamera();}
      localStorage.setItem(isMic?'mostra-microphone':'mostra-camera',select.value);
      $('#deviceHint').textContent='Dispositivo escolhido. A preferência fica salva neste navegador.';
    }catch(err){if(isMic)micDevice=old;else cameraDevice=old;select.value=old;$('#deviceHint').textContent=mediaError(err);}finally{select.disabled=false;}
  }
  function openDevices(focus) {openModal('devicesModal');enumerateDevices();if(focus)$('#'+focus).focus();}
  $('#profileButton').addEventListener('click',editProfile);$('#accountAvatar').addEventListener('click',editProfile);
  $('#roomSettingsButton').addEventListener('click',editRoom);
  $('#profilePhoto').addEventListener('change',e=>choosePhoto('profile',e.target));$('#roomPhoto').addEventListener('change',e=>choosePhoto('room',e.target));
  $('#removeProfilePhoto').addEventListener('click',()=>{resetDraft('profile');profileDraftPhoto=null;setAvatar($('#profilePhotoPreview'),userName(),'');});
  $('#removeRoomPhoto').addEventListener('click',()=>{resetDraft('room');roomDraftPhoto=null;setAvatar($('#roomPhotoPreview'),activeRoom.name,'');});
  $('#profileForm').addEventListener('submit',e=>savePersonalization(e,'profile'));$('#roomSettingsForm').addEventListener('submit',e=>savePersonalization(e,'room'));
  $('#roomSearch').addEventListener('input',renderRooms);
  $('#sidebarDevices').addEventListener('click',()=>openDevices());$('#micDevices').addEventListener('click',()=>openDevices('microphoneSelect'));$('#cameraDevices').addEventListener('click',()=>openDevices('cameraSelect'));
  $('#testMic').addEventListener('click',testMicrophone);$('#testCamera').addEventListener('click',testCamera);
  $('#microphoneSelect').addEventListener('change',()=>changeDevice('mic'));$('#cameraSelect').addEventListener('change',()=>changeDevice('camera'));
  navigator.mediaDevices?.addEventListener('devicechange',()=>{if(!$('#devicesModal').classList.contains('hidden'))enumerateDevices();});
  document.addEventListener('keydown',event=>{
    const modal=Array.from(document.querySelectorAll('.modal-backdrop')).find(m=>!m.classList.contains('hidden'));if(!modal)return;
    if(event.key==='Escape'&&modal.id!=='acceptInviteModal'){closeModal(modal.id);return;}
    if(event.key==='Tab'){
      const nodes=Array.from(modal.querySelectorAll('button:not(:disabled),input:not(:disabled):not([type=file]),select:not(:disabled),a[href]')).filter(n=>n.getClientRects().length);
      if(!nodes.length)return;
      if(event.shiftKey&&document.activeElement===nodes[0]){event.preventDefault();nodes[nodes.length-1].focus();}
      else if(!event.shiftKey&&document.activeElement===nodes[nodes.length-1]){event.preventDefault();nodes[0].focus();}
    }
  });

  db.auth.onAuthStateChange(function (_event, session) {
    setTimeout(function () { handleSession(session); }, 0);
  });
  db.auth.getSession().then(function (result) {
    handleSession(result.data && result.data.session);
  });
})();
`;

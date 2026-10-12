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
  let activeMembership = null;
  const roomMembers = new Map();
  let roomChannels = [];
  let activeChannel = null;
  let currentMessages = [];
  let replyingTo = null;
  let pendingJoinRoom = null;
  let pendingJoinMembership = null;
  let prejoinStream = null;
  let pendingInvite = new URLSearchParams(location.search).get('invite') || '';
  let chatChannel = null;
  let roomControlChannel = null;
  let roomControlTimer = null;
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
  const speakingMonitors = new Map();
  let speakingContext = null;
  let rosterReady = false;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let coordinatorRecoveryTimer = null;
  let coordinatorRecovering = false;

  function playCallSound(event) { services.sounds.play(event); }

  function initials(name) {
    return String(name || 'Amigo').trim().split(/\s+/).slice(0, 2).map(function (part) { return part[0] || ''; }).join('').toUpperCase() || '?';
  }
  function avatarTone(name) {
    return Array.from(String(name || 'Amigo')).reduce(function (total, character) { return ((total * 31) + character.codePointAt(0)) >>> 0; }, 7) % 6;
  }
  function userName() {
    const meta = currentUser && currentUser.user_metadata || {};
    return String(ownProfile?.display_name || meta.full_name || meta.name || (currentUser && currentUser.email || '').split('@')[0] || 'Amigo').slice(0, 60);
  }
  function roomUserName() { return String(activeMembership?.display_name || userName()).slice(0, 60); }
  function isRoomAdmin() { return Boolean(activeMembership && ['owner', 'admin'].includes(activeMembership.role)); }
  function roleLabel(role) { return role === 'owner' ? 'dono' : role === 'admin' ? 'administrador' : 'membro'; }
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
    if (id === 'prejoinModal') stopPrejoin();
    modalReturnFocus?.focus();
  }
  function setAvatar(element, name, url) {
    element.textContent = initials(name);
    element.style.backgroundImage = '';
    element.dataset.avatarTone = String(avatarTone(name));
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
    $('#connectionNote i').style.background = healthy ? 'var(--color-speaking)' : 'var(--color-warning)';
    $('#connectionNote').dataset.state = healthy ? 'healthy' : navigator.onLine ? 'recovering' : 'offline';
    const network = navigator.connection;
    const unstable = !navigator.onLine || network && (['slow-2g','2g'].includes(network.effectiveType) || network.rtt > 550 || network.downlink < 1);
    $('#connectionQuality').textContent = !navigator.onLine ? 'Offline' : unstable ? 'Instável' : healthy ? 'Boa' : 'Reconectando';
    $('#networkStatus').textContent = !navigator.onLine ? 'Offline' : unstable ? 'Instável' : 'Online';
    $('#connectionStatusSummary').textContent = message;
  }
  function clearReconnect() { clearTimeout(reconnectTimer); reconnectTimer = null; reconnectAttempts = 0; }
  function clearCoordinatorRecovery() {
    clearTimeout(coordinatorRecoveryTimer); coordinatorRecoveryTimer = null; coordinatorRecovering = false; services.coordinatorRecovery.reset();
  }
  function scheduleReconnect(targetPeer) {
    if (leaving || !activeRoom || reconnectTimer) return;
    reconnectAttempts += 1; const delay = Math.min(10000, 800 * Math.pow(1.8, reconnectAttempts - 1));
    setConnection(navigator.onLine ? 'Reconectando… tentativa ' + reconnectAttempts : 'Sem internet. Aguardando conexão…', false);
    reconnectTimer = setTimeout(function () {
      reconnectTimer = null; if (leaving || !activeRoom) return;
      try { if (navigator.onLine && targetPeer && targetPeer.disconnected && !targetPeer.destroyed) targetPeer.reconnect(); } catch (_) {}
      if (targetPeer?.disconnected) scheduleReconnect(targetPeer);
    }, navigator.onLine ? delay : 1800);
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
    googleInitialized = true;
    let tries = 0;
    while (!(window.google && google.accounts && google.accounts.id) && tries < 80) {
      await new Promise(function (resolve) { setTimeout(resolve, 100); });
      tries += 1;
    }
    if (!(window.google && google.accounts && google.accounts.id)) {
      googleInitialized = false;
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

  async function openInviteManager() {
    if (!activeRoom) return;
    $('#inviteLinkResult').classList.add('hidden'); $('#inviteLink').value = ''; $('#inviteManageError').textContent = '';
    $('#inviteHistory').classList.toggle('hidden', !isRoomAdmin());
    openModal('inviteModal');
    if (isRoomAdmin()) await loadInvites();
  }
  async function createInvite() {
    if (!activeRoom) return;
    const button = $('#generateInvite'), expiryValue = $('#inviteExpiry').value;
    button.disabled = true; button.textContent = 'Gerando…'; $('#inviteManageError').textContent = '';
    const result = await db.rpc('create_room_invite_with_expiry', { p_room_id: activeRoom.id, p_expires_in_hours: expiryValue ? Number(expiryValue) : null });
    button.disabled = false; button.textContent = 'Gerar convite';
    const invite = Array.isArray(result.data) ? result.data[0] : result.data;
    if (result.error || !invite?.token) { $('#inviteManageError').textContent = 'Não consegui criar o convite.'; return; }
    $('#inviteLink').value = location.origin + location.pathname + '?invite=' + encodeURIComponent(invite.token);
    $('#inviteLinkResult').classList.remove('hidden');
    if (isRoomAdmin()) await loadInvites();
  }
  async function loadInvites() {
    if (!activeRoom || !isRoomAdmin()) return;
    const roomId = activeRoom.id, list = $('#inviteList'); list.innerHTML = '<p class="form-help">Carregando convites…</p>';
    const result = await db.rpc('list_room_invites', { p_room_id: roomId });
    if (result.error || activeRoom?.id !== roomId) { list.innerHTML = '<p class="form-error">Não consegui carregar os convites.</p>'; return; }
    list.textContent = '';
    (result.data || []).forEach(function (invite) {
      const row = document.createElement('article'); row.className = 'invite-row';
      const copy = document.createElement('div');
      const title = document.createElement('strong');
      const expired = invite.expires_at && new Date(invite.expires_at) <= new Date(), revoked = Boolean(invite.revoked_at);
      title.textContent = revoked ? 'Revogado' : expired ? 'Expirado' : 'Ativo'; title.className = revoked || expired ? 'inactive' : 'active';
      const detail = document.createElement('small'); detail.textContent = 'Criado por ' + (invite.creator_name || 'Amigo') + ' · ' + invite.use_count + (invite.use_count === 1 ? ' uso' : ' usos') + (invite.expires_at ? ' · vence ' + new Date(invite.expires_at).toLocaleDateString('pt-BR') : ' · sem expiração');
      copy.append(title, detail); row.append(copy);
      if (!revoked && !expired) { const revoke = document.createElement('button'); revoke.type = 'button'; revoke.className = 'secondary-button danger-outline'; revoke.textContent = 'Revogar'; revoke.addEventListener('click', function () { revokeInvite(invite.id); }); row.append(revoke); }
      list.appendChild(row);
    });
    if (!result.data?.length) list.innerHTML = '<p class="form-help">Nenhum convite criado ainda.</p>';
  }
  async function revokeInvite(inviteId) {
    if (!confirm('Revogar este convite? Quem ainda não entrou perderá o acesso pelo link.')) return;
    const result = await db.rpc('revoke_room_invite', { p_invite_id: inviteId });
    if (result.error) { showToast('Não consegui revogar o convite.'); return; }
    await loadInvites(); showToast('Convite revogado.');
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
    currentMessages = []; clearReply(); $('#pinnedPanel').classList.add('hidden'); $('#pinnedMessages').textContent = '';
    $('#messages').innerHTML = '<div class="chat-empty"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2V11.5a8.5 8.5 0 0 1 18 0Z"/><path d="M7 9h10M7 13h6"/></svg></span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div>';
  }
  async function loadMessages() {
    if (!activeRoom || !activeChannel) return;
    const roomId = activeRoom.id, channelId = activeChannel.id;
    const result = await db.from('room_messages').select('id,body,created_at,user_id,channel_id,reply_to_id,pinned_at,pinned_by,profiles(display_name,avatar_url)').eq('channel_id', channelId).order('created_at', { ascending: true }).limit(200);
    if (result.error || !activeRoom || activeRoom.id !== roomId || !activeChannel || activeChannel.id !== channelId) return;
    const ids = (result.data || []).map(function (item) { return item.id; });
    const reactions = ids.length ? await db.from('room_message_reactions').select('id,message_id,user_id,emoji').eq('channel_id', channelId).in('message_id', ids) : { data: [] };
    if (!activeRoom || activeRoom.id !== roomId || !activeChannel || activeChannel.id !== channelId) return;
    renderMessages(result.data || [], reactions.data || []);
  }
  function messageAuthor(item) {
    const profile = item.profiles || {}, membership = roomMembers.get(item.user_id);
    return membership?.display_name || profile.display_name || (item.user_id === currentUser.id ? roomUserName() : 'Amigo');
  }
  function renderPinnedMessages(items) {
    const pinned = items.filter(function (item) { return item.pinned_at; }), panel = $('#pinnedPanel'), list = $('#pinnedMessages'); list.textContent = '';
    panel.classList.toggle('hidden', !pinned.length);
    pinned.forEach(function (item) { const button = document.createElement('button'); button.type = 'button'; button.textContent = messageAuthor(item) + ': ' + item.body.slice(0, 90); button.addEventListener('click', function () { document.querySelector('[data-message-id="' + item.id + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); list.appendChild(button); });
  }
  function renderMessages(items, reactions) {
    currentMessages = items; renderPinnedMessages(items);
    const list = $('#messages'); list.textContent = '';
    if (!items.length) {
      list.innerHTML = '<div class="chat-empty"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2V11.5a8.5 8.5 0 0 1 18 0Z"/><path d="M7 9h10M7 13h6"/></svg></span><strong>O chat começa aqui</strong><small>Mande a primeira mensagem para a sala.</small></div>';
      return;
    }
    const byId = new Map(items.map(function (item) { return [item.id, item]; }));
    const reactionsByMessage = new Map();
    reactions.forEach(function (reaction) { const group = reactionsByMessage.get(reaction.message_id) || []; group.push(reaction); reactionsByMessage.set(reaction.message_id, group); });
    items.forEach(function (item) {
      const profile = item.profiles || {};
      const name = messageAuthor(item);
      const row = document.createElement('article'); row.className = 'message' + (item.pinned_at ? ' pinned' : ''); row.dataset.messageId = item.id;
      const avatar = document.createElement('span'); avatar.className = 'message-avatar'; setAvatar(avatar, name, profile.avatar_url || '');
      const content = document.createElement('div');
      const meta = document.createElement('div'); meta.className = 'message-meta';
      const author = document.createElement('strong'); author.textContent = name;
      const time = document.createElement('time'); time.textContent = new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const body = document.createElement('p'); body.textContent = escapeText(item.body);
      meta.append(author, time);
      if (item.pinned_at) { const pinMark = document.createElement('span'); pinMark.className = 'pin-mark'; pinMark.textContent = '📌 fixada'; meta.append(pinMark); }
      const actions = document.createElement('div'); actions.className = 'message-actions';
      const reply = document.createElement('button'); reply.type = 'button'; reply.title = 'Responder'; reply.textContent = '↩'; reply.addEventListener('click', function () { setReply(item); }); actions.append(reply);
      const react = document.createElement('button'); react.type = 'button'; react.title = 'Reagir'; react.textContent = '☺'; react.addEventListener('click', function () { const emoji = prompt('Digite um emoji para reagir:', '👍'); if (emoji) toggleReaction(item, emoji.trim().slice(0, 16)); }); actions.append(react);
      if (isRoomAdmin()) {
        const pin = document.createElement('button'); pin.type = 'button'; pin.title = item.pinned_at ? 'Desafixar mensagem' : 'Fixar mensagem'; pin.textContent = '📌'; pin.addEventListener('click', function () { setMessagePinned(item, !item.pinned_at); }); actions.append(pin);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'message-delete'; remove.title = 'Apagar mensagem'; remove.setAttribute('aria-label', 'Apagar mensagem de ' + name);
        remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 14h8l1-14M10 11v6m4-6v6"/></svg>';
        remove.addEventListener('click', function () { deleteMessage(item); });
        actions.append(remove);
      }
      meta.append(actions);
      content.className = 'message-content'; content.append(meta);
      const parent = byId.get(item.reply_to_id);
      if (parent) { const quote = document.createElement('button'); quote.type = 'button'; quote.className = 'reply-quote'; quote.textContent = '↩ ' + messageAuthor(parent) + ': ' + parent.body.slice(0, 100); quote.addEventListener('click', function () { document.querySelector('[data-message-id="' + parent.id + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }); content.append(quote); }
      content.append(body);
      const reactionBar = document.createElement('div'); reactionBar.className = 'reaction-bar';
      const grouped = new Map(); (reactionsByMessage.get(item.id) || []).forEach(function (reaction) { const group = grouped.get(reaction.emoji) || []; group.push(reaction); grouped.set(reaction.emoji, group); });
      grouped.forEach(function (group, emoji) { const button = document.createElement('button'); button.type = 'button'; button.className = 'reaction-chip' + (group.some(function (reaction) { return reaction.user_id === currentUser.id; }) ? ' mine' : ''); button.textContent = emoji + ' ' + group.length; button.addEventListener('click', function () { toggleReaction(item, emoji); }); reactionBar.appendChild(button); });
      if (grouped.size) content.append(reactionBar);
      row.append(avatar, content); list.appendChild(row);
    });
    list.scrollTop = list.scrollHeight;
  }
  function setReply(item) { replyingTo = item; $('#replyName').textContent = messageAuthor(item); $('#replyText').textContent = item.body.slice(0, 120); $('#replyPreview').classList.remove('hidden'); $('#messageInput').focus(); }
  function clearReply() { replyingTo = null; $('#replyPreview').classList.add('hidden'); $('#replyName').textContent = 'alguém'; $('#replyText').textContent = ''; }
  async function toggleReaction(item, emoji) {
    if (!emoji || !activeRoom || !activeChannel) return;
    const existing = await db.from('room_message_reactions').select('id').eq('message_id', item.id).eq('user_id', currentUser.id).eq('emoji', emoji).maybeSingle();
    const result = existing.data ? await db.from('room_message_reactions').delete().eq('id', existing.data.id) : await db.from('room_message_reactions').insert({ room_id: activeRoom.id, channel_id: activeChannel.id, message_id: item.id, user_id: currentUser.id, emoji: emoji });
    if (result.error) showToast('Não consegui salvar sua reação.'); else await loadMessages();
  }
  async function setMessagePinned(item, pinned) {
    const result = await db.rpc('set_message_pinned', { p_message_id: item.id, p_pinned: pinned });
    if (result.error) { showToast('Não consegui alterar a mensagem fixada.'); return; }
    await loadMessages(); showToast(pinned ? 'Mensagem fixada.' : 'Mensagem desafixada.');
  }
  async function deleteMessage(item) {
    if (!activeRoom || !activeChannel || !isRoomAdmin()) return;
    if (!confirm('Apagar esta mensagem? Esta ação não pode ser desfeita.')) return;
    const roomId = activeRoom.id, channelId = activeChannel.id;
    const result = await db.from('room_messages').delete().eq('id', item.id).eq('room_id', roomId).eq('channel_id', channelId);
    if (result.error) { showToast('Não consegui apagar esta mensagem.'); return; }
    if (activeRoom?.id === roomId && activeChannel?.id === channelId) await loadMessages();
    showToast('Mensagem apagada.');
  }
  function subscribeChat() {
    resetChat();
    if (!activeRoom || !activeChannel) return;
    const channelId = activeChannel.id;
    chatChannel = db.channel('room-chat-' + channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_messages', filter: 'channel_id=eq.' + channelId }, function () { loadMessages(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_message_reactions', filter: 'channel_id=eq.' + channelId }, function () { loadMessages(); })
      .subscribe();
    loadMessages();
  }
  function renderChannels() {
    const tabs = $('#channelTabs'); tabs.textContent = '';
    roomChannels.forEach(function (channel) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'channel-tab' + (activeChannel?.id === channel.id ? ' active' : '');
      button.textContent = '# ' + channel.name; button.title = 'Abrir #' + channel.name;
      button.addEventListener('click', function () { selectChannel(channel); });
      tabs.appendChild(button);
    });
    if (activeMembership) {
      const members = document.createElement('button'); members.type = 'button'; members.className = 'channel-tab members-tab';
      members.textContent = 'Membros (' + roomMembers.size + ')'; members.title = 'Ver todas as pessoas com acesso';
      members.addEventListener('click', function () { renderMemberManagement(); $('#manageRoomError').textContent = ''; openModal('manageRoomModal'); });
      tabs.appendChild(members);
    }
    if (isRoomAdmin()) {
      const add = document.createElement('button'); add.type = 'button'; add.className = 'channel-add'; add.textContent = '+'; add.title = 'Criar chat de texto'; add.setAttribute('aria-label', 'Criar chat de texto');
      add.addEventListener('click', function () { $('#channelNameInput').value = ''; $('#channelError').textContent = ''; openModal('channelModal'); });
      tabs.appendChild(add);
    }
  }
  function selectChannel(channel) {
    activeChannel = channel;
    clearReply();
    $('#activeChannelName').textContent = '# ' + channel.name;
    $('#messageInput').placeholder = 'Mensagem em #' + channel.name;
    renderChannels(); subscribeChat();
  }
  async function loadChannels(preferredId) {
    if (!activeRoom) return;
    const roomId = activeRoom.id;
    const result = await db.from('room_channels').select('id,room_id,name,position,created_by,created_at').eq('room_id', roomId).order('position').order('id');
    if (result.error || !activeRoom || activeRoom.id !== roomId) { showToast('Não consegui carregar os chats desta sala.'); return; }
    roomChannels = result.data || [];
    const next = roomChannels.find(function (channel) { return channel.id === preferredId; }) || roomChannels.find(function (channel) { return channel.id === activeChannel?.id; }) || roomChannels[0] || null;
    if (next) selectChannel(next); else { activeChannel = null; resetChat(); renderChannels(); }
  }
  async function createChannel(event) {
    event.preventDefault();
    const name = $('#channelNameInput').value.trim(), button = event.currentTarget.querySelector('button[type=submit]');
    if (!activeRoom || !name) return;
    button.disabled = true; button.textContent = 'Criando…'; $('#channelError').textContent = '';
    const result = await db.rpc('create_room_channel', { p_room_id: activeRoom.id, p_name: name });
    button.disabled = false; button.textContent = 'Criar chat';
    if (result.error) { $('#channelError').textContent = /already exists/i.test(result.error.message || '') ? 'Já existe um chat com esse nome.' : 'Não consegui criar este chat.'; return; }
    const created = Array.isArray(result.data) ? result.data[0] : result.data;
    closeModal('channelModal'); await loadChannels(created?.id); showToast('Chat criado.');
  }
  async function clearActiveChannel() {
    if (!activeChannel || !isRoomAdmin()) return;
    if (!confirm('Limpar todas as mensagens de #' + activeChannel.name + '? Esta ação não pode ser desfeita.')) return;
    const result = await db.rpc('clear_room_channel', { p_channel_id: activeChannel.id });
    if (result.error) { showToast('Não consegui limpar este chat.'); return; }
    await loadMessages(); showToast('Chat limpo.');
  }
  async function sendMessage(event) {
    event.preventDefault();
    const input = $('#messageInput');
    const body = input.value.trim();
    if (!activeRoom || !activeChannel || !body) return;
    input.value = '';
    const replyId = replyingTo?.id || null;
    const result = await db.from('room_messages').insert({ room_id: activeRoom.id, channel_id: activeChannel.id, user_id: currentUser.id, body: body, reply_to_id: replyId });
    if (result.error) { input.value = body; showToast('Não consegui enviar a mensagem.'); } else clearReply();
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
  function stopSpeakingMonitor(peerId) {
    const monitor = speakingMonitors.get(peerId); if (!monitor) return;
    cancelAnimationFrame(monitor.frame); try { monitor.source.disconnect(); monitor.analyser.disconnect(); } catch (_) {}
    speakingMonitors.delete(peerId); findTile(peerId)?.classList.remove('speaking');
  }
  function watchSpeaking(peerId, stream) {
    const track = stream?.getAudioTracks().find(function (item) { return item.readyState === 'live'; });
    if (!track) { stopSpeakingMonitor(peerId); return; }
    if (speakingMonitors.get(peerId)?.track === track) return;
    stopSpeakingMonitor(peerId);
    const AudioCtx = window.AudioContext || window.webkitAudioContext; if (!AudioCtx) return;
    speakingContext = speakingContext || new AudioCtx(); speakingContext.resume().catch(function () {});
    const source = speakingContext.createMediaStreamSource(new MediaStream([track])), analyser = speakingContext.createAnalyser(); analyser.fftSize = 256; source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize), monitor = { track: track, source: source, analyser: analyser, frame: 0, loud: 0 }; speakingMonitors.set(peerId, monitor);
    function measure() {
      if (speakingMonitors.get(peerId) !== monitor || track.readyState !== 'live') { stopSpeakingMonitor(peerId); return; }
      analyser.getByteTimeDomainData(data); let sum = 0; for (const value of data) sum += Math.pow((value - 128) / 128, 2);
      const active = Math.sqrt(sum / data.length) > 0.035; monitor.loud = active ? Math.min(4, monitor.loud + 1) : Math.max(0, monitor.loud - 1);
      findTile(peerId)?.classList.toggle('speaking', monitor.loud >= 2); monitor.frame = requestAnimationFrame(measure);
    }
    measure();
  }
  function fullscreenElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function toggleTileFocus(tile) {
    const grid = $('#mediaGrid'), active = tile.classList.contains('focused');
    Array.from(grid.children).forEach(function (item) { item.classList.remove('focused'); });
    grid.classList.toggle('focus-mode', !active);
    tile.classList.toggle('focused', !active);
    const button = tile.querySelector('.tile-focus');
    if (button) { button.classList.toggle('active', !active); button.title = active ? 'Destacar transmissão' : 'Voltar para a grade'; }
  }
  async function toggleTileFullscreen(tile) {
    try {
      if (fullscreenElement() === tile) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        return;
      }
      if (fullscreenElement()) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
      if (tile.requestFullscreen) await tile.requestFullscreen();
      else if (tile.webkitRequestFullscreen) tile.webkitRequestFullscreen();
      else {
        const video = tile.querySelector('video');
        if (video && video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        else showToast('Seu navegador não oferece tela cheia para este vídeo.');
      }
    } catch (_) { showToast('Não consegui abrir a transmissão em tela cheia.'); }
  }
  function updateFullscreenButtons() {
    Array.from(document.querySelectorAll('.tile-fullscreen')).forEach(function (button) {
      const tile = button.closest('.media-tile');
      const active = fullscreenElement() === tile;
      const name = tile.querySelector('.tile-name')?.textContent?.replace(' (você)', '') || 'transmissão';
      button.classList.toggle('active', active);
      button.setAttribute('aria-label', (active ? 'Sair da tela cheia de ' : 'Colocar em tela cheia a transmissão de ') + name);
      button.title = active ? 'Sair da tela cheia' : 'Tela cheia';
    });
  }
  document.addEventListener('fullscreenchange', updateFullscreenButtons);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);
  function ensureTile(peerId, name, stream, kind, local) {
    let tile = findTile(peerId);
    if (!tile) {
      tile = document.createElement('article'); tile.className = 'media-tile'; tile.dataset.peerId = peerId;
      const avatar = document.createElement('div'); avatar.className = 'tile-avatar'; avatar.appendChild(document.createElement('span'));
      const video = document.createElement('video'); video.autoplay = true; video.playsInline = true;
      video.addEventListener('dblclick', function () { toggleTileFullscreen(tile); });
      const meta = document.createElement('div'); meta.className = 'tile-meta';
      const label = document.createElement('span'); label.className = 'tile-name';
      const type = document.createElement('span'); type.className = 'tile-kind'; meta.append(label, type);
      const volume = document.createElement('div'); volume.className = 'tile-volume hidden';
      const mute = document.createElement('button'); mute.type = 'button'; mute.className = 'tile-mute';
      mute.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path class="volume-waves" d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12"/></svg>';
      const slider = document.createElement('input'); slider.type = 'range'; slider.className = 'tile-volume-range'; slider.min = '0'; slider.max = '1'; slider.step = '0.05'; slider.value = '1';
      const amount = document.createElement('span'); amount.className = 'tile-volume-value'; amount.textContent = '100%';
      const brand = document.createElement('div'); brand.className = 'tile-fullscreen-brand'; brand.innerHTML = '<span class="brand-mark">M</span><strong>Mostra aí</strong><small>Você está vendo uma transmissão</small>';
      const focus = document.createElement('button'); focus.type = 'button'; focus.className = 'tile-focus hidden'; focus.title = 'Destacar transmissão'; focus.setAttribute('aria-label', 'Destacar transmissão dentro do Mostra aí');
      focus.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/><path d="M9 9h6v6H9z"/></svg>';
      focus.addEventListener('click', function (event) { event.stopPropagation(); toggleTileFocus(tile); });
      const fullscreen = document.createElement('button'); fullscreen.type = 'button'; fullscreen.className = 'tile-fullscreen hidden';
      fullscreen.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>';
      fullscreen.addEventListener('click', function (event) { event.stopPropagation(); toggleTileFullscreen(tile); });
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
      volume.append(mute, slider, amount); tile.append(avatar, video, meta, volume, brand, focus, fullscreen); $('#mediaGrid').appendChild(tile);
    }
    setAvatar(tile.querySelector('.tile-avatar span'), name, local ? avatarUrl() : memberProfiles.get(peerUserIds.get(peerId))?.avatar_url || '');
    tile.querySelector('.tile-name').textContent = name + (local ? ' (você)' : '');
    tile.querySelector('.tile-kind').textContent = kind === 'screen' ? '· tela' : kind === 'camera' ? '· câmera' : kind === 'audio' ? '· áudio' : '';
    tile.classList.toggle('screen-share', kind === 'screen');
    const video = tile.querySelector('video'); const avatar = tile.querySelector('.tile-avatar');
    const volume = tile.querySelector('.tile-volume'); const slider = tile.querySelector('.tile-volume-range'); const mute = tile.querySelector('.tile-mute');
    const fullscreen = tile.querySelector('.tile-fullscreen'); const focus = tile.querySelector('.tile-focus');
    const hasVideo = Boolean(stream && stream.getVideoTracks().some(function (track) { return track.readyState === 'live'; }));
    const hasAudio = Boolean(stream && stream.getAudioTracks().some(function (track) { return track.readyState === 'live'; }));
    volume.classList.toggle('hidden', local || !hasAudio);
    fullscreen.classList.toggle('hidden', !hasVideo);
    focus.classList.toggle('hidden', !hasVideo);
    if (!hasVideo && tile.classList.contains('focused')) toggleTileFocus(tile);
    slider.setAttribute('aria-label', 'Volume do áudio de ' + name);
    if (stream && stream.getTracks().length) {
      if (video.srcObject !== stream) video.srcObject = stream;
      video.volume = Number(slider.value); video.muted = local || tile.dataset.audioMuted === 'true';
      video.style.display = hasVideo ? 'block' : 'none'; avatar.style.display = hasVideo ? 'none' : 'grid'; video.play().catch(function () {});
    } else { video.srcObject = null; video.style.display = 'none'; avatar.style.display = 'grid'; }
    watchSpeaking(peerId, local && microphoneTrack ? new MediaStream([microphoneTrack]) : stream);
    mute.setAttribute('aria-label', video.muted ? 'Reativar áudio de ' + name : 'Silenciar áudio de ' + name);
    updateFullscreenButtons();
  }
  function renderRoster() {
    roster.forEach(function (name, id) {
      const stream = peer && id === peer.id ? outgoingStream() : remoteStreams.get(id);
      const kind = peer && id === peer.id ? localKind() : remoteKinds.get(id) || 'none';
      ensureTile(id, name, stream, kind, Boolean(peer && id === peer.id));
    });
    Array.from($('#mediaGrid').children).forEach(function (tile) { if (!roster.has(tile.dataset.peerId)) { stopSpeakingMonitor(tile.dataset.peerId); tile.remove(); } });
    $('#participantCount').textContent = roster.size + (roster.size === 1 ? ' online' : ' online');
  }
  function applyRoster(items) {
    const previousIds = new Set(roster.keys());
    if (rosterReady) {
      if (items.some(function (item) { return item.id !== peer?.id && !previousIds.has(item.id); })) playCallSound('participantJoin');
      if (Array.from(previousIds).some(function (id) { return id !== peer?.id && !items.some(function (item) { return item.id === id; }); })) playCallSound('participantLeave');
    }
    memberProfiles.clear();
    const activeIds = new Set(items.map(function (item) { return item.id; }));
    roster.forEach(function (_, id) {
      if (!activeIds.has(id)) { remoteStreams.delete(id); remoteKinds.delete(id); stopSpeakingMonitor(id); findTile(id)?.remove(); }
    });
    roster.clear(); items.forEach(function (item) { roster.set(item.id, String(item.name || 'Amigo').slice(0, 60)); if (item.userId) peerUserIds.set(item.id,item.userId); }); renderRoster();
    rosterReady = true;
    loadMemberProfiles();
    if (outgoingStream().getTracks().length) roster.forEach(function (_, id) { callPeer(id); });
  }
  function broadcastRoster() {
    const payload = { type: 'roster', items: Array.from(roster, function (entry) { return { id: entry[0], name: entry[1], userId: peerUserIds.get(entry[0]) }; }) };
    dataConnections.forEach(function (connection) { if (connection.open) connection.send(payload); });
    applyRoster(payload.items);
  }
  function showRoomGesture(payload) {
    if (!payload?.emoji) return;
    const bubble = document.createElement('div'); bubble.className = 'gesture-bubble';
    const emoji = document.createElement('span'); emoji.textContent = String(payload.emoji).slice(0, 16);
    const name = document.createElement('small'); name.textContent = String(payload.name || 'Amigo').slice(0, 60);
    bubble.append(emoji, name); $('#gestureLayer').appendChild(bubble);
    setTimeout(function () { bubble.classList.add('leaving'); }, 3200); setTimeout(function () { bubble.remove(); }, 3900);
  }
  function relayGesture(payload) {
    const safe = { type: 'gesture', emoji: String(payload.emoji || '').slice(0, 16), name: String(payload.name || 'Amigo').slice(0, 60) };
    if (!safe.emoji) return; showRoomGesture(safe); dataConnections.forEach(function (connection) { if (connection.open) connection.send(safe); });
  }
  function sendGesture(emoji) {
    const payload = { type: 'gesture', emoji: String(emoji || '').trim().slice(0, 16), name: roomUserName() }; if (!payload.emoji || !activeRoom) return;
    $('#gestureMenu').classList.add('hidden'); $('#gestureButton').setAttribute('aria-expanded', 'false');
    if (isCoordinator) relayGesture(payload); else if (coordinatorConnection?.open) coordinatorConnection.send(payload); else showToast('Entre completamente na sala para reagir.');
  }
  function callPeer(peerId) {
    const stream = outgoingStream();
    if (!peer || peerId === peer.id || !stream.getTracks().length || outgoingCalls.has(peerId)) return;
    const call = peer.call(peerId, stream, { metadata: { name: roomUserName(), kind: localKind() } });
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
      const previousKind = remoteKinds.get(call.peer); const nextKind = call.metadata && call.metadata.kind || (stream.getVideoTracks().length ? 'camera' : 'audio');
      remoteStreams.set(call.peer, stream); remoteKinds.set(call.peer, nextKind); if (nextKind === 'screen' && previousKind !== 'screen') playCallSound('shareStart');
      ensureTile(call.peer, roster.get(call.peer) || call.metadata && call.metadata.name || 'Amigo', stream, remoteKinds.get(call.peer), false);
    });
    call.on('close', function () { if (incomingCalls.get(call.peer) === call) { if (remoteKinds.get(call.peer) === 'screen' && !leaving) playCallSound('shareStop'); incomingCalls.delete(call.peer); remoteStreams.delete(call.peer); remoteKinds.delete(call.peer); renderRoster(); } });
  }
  function attachPeerHandlers(targetPeer) {
    targetPeer.on('call', handleIncomingCall);
    targetPeer.on('open', function () { clearReconnect(); });
    targetPeer.on('disconnected', function () { if (!leaving && !coordinatorRecovering) scheduleReconnect(targetPeer); });
    targetPeer.on('error', function () { if (!leaving && !coordinatorRecovering && activeRoom) scheduleReconnect(targetPeer); });
  }
  function becomeCoordinator(targetPeer) {
    clearCoordinatorRecovery(); isCoordinator = true; peer = targetPeer; roster.set(peer.id, roomUserName()); peerUserIds.set(peer.id,currentUser.id); setConnection('Sala conectada', true); broadcastRoster();
    peer.on('connection', function (connection) {
      dataConnections.set(connection.peer, connection); if(connection.metadata?.userId) peerUserIds.set(connection.peer,connection.metadata.userId);
      connection.on('open', function () { roster.set(connection.peer, String(connection.metadata && connection.metadata.nickname || 'Amigo').slice(0, 60)); playCallSound('participantJoin'); broadcastRoster(); });
      connection.on('data', function (data) {
        if (data && data.type === 'intro') { roster.set(connection.peer, String(data.nickname || 'Amigo').slice(0, 60)); broadcastRoster(); }
        else if (data && data.type === 'gesture') relayGesture({ emoji: data.emoji, name: roster.get(connection.peer) || 'Amigo' });
      });
      connection.on('close', function () { dataConnections.delete(connection.peer); roster.delete(connection.peer); remoteStreams.delete(connection.peer); remoteKinds.delete(connection.peer); if (!leaving) playCallSound('participantLeave'); broadcastRoster(); });
    });
  }
  function resetPeerTransport() {
    outgoingCalls.forEach(function (call) { call.close(); }); incomingCalls.forEach(function (call) { call.close(); }); dataConnections.forEach(function (connection) { connection.close(); });
    coordinatorConnection?.close(); peer?.destroy(); peer = null; coordinatorConnection = null; isCoordinator = false;
    roster.clear(); rosterReady = false; peerUserIds.clear(); memberProfiles.clear(); dataConnections.clear(); outgoingCalls.clear(); incomingCalls.clear(); remoteStreams.clear(); remoteKinds.clear(); $('#mediaGrid').textContent = ''; updateMediaButtons();
  }
  function scheduleCoordinatorRecovery(reason) {
    if (leaving || !activeRoom || isCoordinator || coordinatorRecoveryTimer) return;
    services.diagnostics.record('call', reason || 'coordinator-disconnected');
    const delay = services.coordinatorRecovery.nextDelay();
    setConnection('O coordenador saiu. Recuperando a chamada…', false);
    coordinatorRecoveryTimer = setTimeout(beginCoordinatorElection, delay);
  }
  function beginCoordinatorElection() {
    coordinatorRecoveryTimer = null;
    if (leaving || !activeRoom) return;
    coordinatorRecovering = true; resetPeerTransport();
    const candidate = new Peer(coordinatorId, { debug: 1 }); peer = candidate; attachPeerHandlers(candidate);
    candidate.on('open', function () {
      coordinatorRecovering = false; services.diagnostics.record('call', 'coordinator-recovered'); becomeCoordinator(candidate); refreshPublishing(); showToast('Chamada recuperada automaticamente.');
    });
    candidate.on('error', function (error) {
      if (leaving || peer !== candidate) return;
      candidate.destroy(); peer = null; coordinatorRecovering = false;
      if (error.type === 'unavailable-id') setTimeout(joinCoordinator, 180 + Math.floor(Math.random() * 420));
      else scheduleCoordinatorRecovery('coordinator-election-' + String(error.type || 'error'));
    });
  }
  function joinCoordinator() {
    if (leaving || !activeRoom) return;
    const memberPeer = new Peer({ debug: 1 }); peer = memberPeer; isCoordinator = false; attachPeerHandlers(memberPeer);
    memberPeer.on('open', function () {
      const connection = memberPeer.connect(coordinatorId, { reliable: true, metadata: { nickname: roomUserName(), userId: currentUser.id } }); coordinatorConnection = connection;
      const timeout = setTimeout(function () { if (!connection.open) setConnection('Não consegui encontrar a sala', false); }, 9000);
      connection.on('open', function () { clearTimeout(timeout); clearCoordinatorRecovery(); setConnection('Sala conectada', true); connection.send({ type: 'intro', nickname: roomUserName() }); });
      connection.on('data', function (data) { if (data && data.type === 'roster' && Array.isArray(data.items)) applyRoster(data.items); else if (data && data.type === 'gesture') showRoomGesture(data); });
      connection.on('close', function () { if (!leaving && !coordinatorRecovering) scheduleCoordinatorRecovery('coordinator-connection-closed'); });
      connection.on('error', function () { if (!leaving && !coordinatorRecovering) scheduleCoordinatorRecovery('coordinator-connection-error'); });
    });
    memberPeer.on('error', function (error) { if (!leaving && error.type === 'peer-unavailable') scheduleCoordinatorRecovery('coordinator-unavailable'); });
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
    leaving = true; clearReconnect(); clearCoordinatorRecovery(); stopMedia();
    Array.from(speakingMonitors.keys()).forEach(stopSpeakingMonitor); if (speakingContext) speakingContext.close().catch(function () {}); speakingContext = null;
    outgoingCalls.forEach(function (call) { call.close(); }); incomingCalls.forEach(function (call) { call.close(); }); dataConnections.forEach(function (connection) { connection.close(); });
    coordinatorConnection?.close(); peer?.destroy(); peer = null; coordinatorConnection = null; isCoordinator = false;
    roster.clear(); rosterReady = false; peerUserIds.clear(); memberProfiles.clear(); dataConnections.clear(); outgoingCalls.clear(); incomingCalls.clear(); remoteStreams.clear(); remoteKinds.clear(); $('#mediaGrid').textContent = ''; leaving = false; updateMediaButtons();
  }
  function updateMediaButtons() {
    [['screenButton',screenTrack,'Parar tela','Compartilhar tela'],['cameraButton',cameraTrack,'Desligar câmera','Ligar câmera'],['micButton',microphoneTrack,'Silenciar','Ligar microfone']].forEach(function(item){
      const on = Boolean(item[1] && item[1].readyState === 'live');
      const button = $('#' + item[0]); button.classList.toggle('active',on); button.setAttribute('aria-pressed',String(on)); button.setAttribute('aria-label',on ? item[2] : item[3]); button.title = on ? item[2] : item[3]; button.querySelector('small').textContent = on ? item[2] : item[3];
    });
    if (activeMembership) applyMembershipControls();
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
    if (activeMembership?.is_muted) throw new Error('moderated');
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
    if (activeMembership?.is_muted) { showToast('Seu microfone está bloqueado pela administração.'); return; }
    $('#micButton').disabled=true;
    try { if (microphoneTrack) { microphoneTrack.stop(); microphoneTrack=null; refreshPublishing(); playCallSound('mediaOff'); } else { await replaceMicrophone(); playCallSound('mediaOn'); } }
    catch(error){showToast(error.message === 'moderated' ? 'Seu microfone está bloqueado pela administração.' : mediaError(error));} finally{$('#micButton').disabled=false;applyMembershipControls();}
  }
  async function toggleCamera() {
    if (!activeRoom) return;
    $('#cameraButton').disabled=true;
    try { if(cameraTrack){cameraTrack.stop();cameraTrack=null;refreshPublishing();playCallSound('mediaOff');}else{await replaceCamera();playCallSound('mediaOn');} }
    catch(error){showToast(mediaError(error));}finally{$('#cameraButton').disabled=false;}
  }
  function screenShareError(error) {
    if (error?.name === 'NotAllowedError') return 'O seletor foi fechado ou o navegador bloqueou o compartilhamento. Tente novamente e escolha uma aba, janela ou tela.';
    if (error?.name === 'NotReadableError') return 'O navegador não conseguiu capturar essa tela. Feche outro compartilhamento ativo e tente novamente.';
    if (error?.name === 'InvalidStateError') return 'Abra o Mostra aí na janela ativa e tente compartilhar novamente.';
    if (error?.name === 'TypeError' || error?.name === 'OverconstrainedError') return 'Este navegador não aceitou as opções de captura. Atualize o navegador ou tente compartilhar sem áudio.';
    return 'Não foi possível iniciar o compartilhamento de tela. Tente novamente.';
  }
  async function requestDisplayMedia() {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30, max: 60 }, displaySurface: 'browser' },
        audio: { suppressLocalAudioPlayback: false },
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        systemAudio: 'exclude'
      });
    } catch (error) {
      if (error?.name !== 'TypeError' && error?.name !== 'OverconstrainedError') throw error;
      return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    }
  }
  async function toggleScreen() {
    if (!activeRoom) return;
    if (activeMembership && !activeMembership.can_share_screen) { showToast('O compartilhamento de tela está bloqueado pela administração.'); return; }
    $('#screenButton').disabled = true;
    try {
      if (screenTrack) { const oldVideo = screenTrack; const oldAudio = screenAudioTracks.slice(); screenTrack = null; screenAudioTracks = []; oldVideo.stop(); oldAudio.forEach(function (track) { track.stop(); }); playCallSound('shareStop'); }
      else {
        const stream = await requestDisplayMedia();
        screenTrack = stream.getVideoTracks()[0];
        playCallSound('shareStart');
        const displaySurface = screenTrack?.getSettings?.().displaySurface;
        const capturedAudio = stream.getAudioTracks();
        if (displaySurface === 'browser') {
          screenAudioTracks = capturedAudio;
          showToast(screenAudioTracks.length ? 'Compartilhando somente o áudio desta aba.' : 'Ative “Compartilhar áudio da guia” para transmitir o som da aba.');
        } else {
          capturedAudio.forEach(function (track) { track.stop(); stream.removeTrack(track); });
          screenAudioTracks = [];
          showToast('Tela compartilhada sem áudio do computador. Para enviar som, escolha uma aba do navegador.');
        }
        screenTrack.addEventListener('ended', function () { screenTrack = null; screenAudioTracks.forEach(function (track) { track.stop(); }); screenAudioTracks = []; if (!leaving) { playCallSound('shareStop'); refreshPublishing(); } });
      }
      refreshPublishing();
    } catch (error) {
      console.warn('Falha ao iniciar compartilhamento de tela:', error?.name || error);
      showToast(screenShareError(error));
    } finally {
      $('#screenButton').disabled = false;
      if (activeMembership) applyMembershipControls();
    }
  }

  function updatePrejoinPreview() {
    const video = $('#prejoinVideo'), avatar = $('#prejoinAvatar'), camera = prejoinStream?.getVideoTracks().find(function (track) { return track.readyState === 'live'; }), mic = prejoinStream?.getAudioTracks().find(function (track) { return track.readyState === 'live'; });
    video.srcObject = camera ? new MediaStream([camera]) : null; video.classList.toggle('hidden', !camera); avatar.classList.toggle('hidden', Boolean(camera));
    $('#prejoinStatus').textContent = camera ? (mic ? 'Câmera e microfone ligados' : 'Câmera ligada · microfone desligado') : (mic ? 'Microfone ligado · câmera desligada' : 'Câmera e microfone desligados');
    $('#prejoinMic').textContent = mic ? '🎙️ Microfone ligado' : '🎙️ Microfone desligado'; $('#prejoinMic').setAttribute('aria-pressed', String(Boolean(mic))); $('#prejoinMic').classList.toggle('active', Boolean(mic));
    $('#prejoinCamera').textContent = camera ? '📷 Câmera ligada' : '📷 Câmera desligada'; $('#prejoinCamera').setAttribute('aria-pressed', String(Boolean(camera))); $('#prejoinCamera').classList.toggle('active', Boolean(camera));
  }
  function stopPrejoin() { if (prejoinStream) prejoinStream.getTracks().forEach(function (track) { track.stop(); }); prejoinStream = null; pendingJoinRoom = null; pendingJoinMembership = null; $('#prejoinVideo').srcObject = null; updatePrejoinPreview(); }
  async function populatePrejoinDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const fill = function (select, kind, saved, fallback) { select.innerHTML = '<option value="">' + fallback + '</option>'; devices.filter(function (item) { return item.kind === kind; }).forEach(function (item, index) { const option = document.createElement('option'); option.value = item.deviceId; option.textContent = item.label || fallback + ' ' + (index + 1); select.appendChild(option); }); select.value = Array.from(select.options).some(function (option) { return option.value === saved; }) ? saved : ''; };
      fill($('#prejoinMicSelect'), 'audioinput', micDevice, 'Microfone padrão'); fill($('#prejoinCameraSelect'), 'videoinput', cameraDevice, 'Câmera padrão');
    } catch (_) {}
  }
  async function togglePrejoinMedia(kind) {
    if (!pendingJoinRoom) return; $('#prejoinError').textContent = '';
    const isMic = kind === 'mic', existing = isMic ? prejoinStream?.getAudioTracks()[0] : prejoinStream?.getVideoTracks()[0];
    if (existing) { existing.stop(); prejoinStream.removeTrack(existing); updatePrejoinPreview(); return; }
    if (isMic && pendingJoinMembership?.is_muted) { $('#prejoinError').textContent = 'Seu microfone está bloqueado pela administração desta sala.'; return; }
    try {
      const device = isMic ? $('#prejoinMicSelect').value : $('#prejoinCameraSelect').value;
      const constraints = isMic ? { audio: Object.assign({ echoCancellation: true, noiseSuppression: true }, device ? { deviceId: { exact: device } } : {}), video: false } : { audio: false, video: Object.assign({ width: { ideal: 1280 }, height: { ideal: 720 } }, device ? { deviceId: { exact: device } } : {}) };
      const acquired = await navigator.mediaDevices.getUserMedia(constraints); if (!pendingJoinRoom) { acquired.getTracks().forEach(function (track) { track.stop(); }); return; }
      prejoinStream = prejoinStream || new MediaStream(); acquired.getTracks().forEach(function (track) { prejoinStream.addTrack(track); });
      if (isMic) { micDevice = device; localStorage.setItem('mostra-microphone', device); } else { cameraDevice = device; localStorage.setItem('mostra-camera', device); }
      await populatePrejoinDevices(); updatePrejoinPreview();
    } catch (error) { $('#prejoinError').textContent = mediaError(error); }
  }
  async function openRoom(room) {
    if (activeRoom && activeRoom.id === room.id) { $('#sidebar').classList.remove('open'); return; }
    stopPrejoin(); pendingJoinRoom = room; $('#prejoinRoomName').textContent = room.name; $('#prejoinError').textContent = ''; $('#prejoinName').value = userName(); setAvatar($('#prejoinAvatar'), userName(), avatarUrl());
    const membership = await db.from('room_members').select('room_id,user_id,role,display_name,is_muted,can_share_screen').eq('room_id', room.id).eq('user_id', currentUser.id).maybeSingle();
    if (pendingJoinRoom?.id !== room.id) return;
    if (membership.error || !membership.data) { pendingJoinRoom = null; showToast('Você não tem mais acesso a esta sala.'); await loadRooms(); return; }
    pendingJoinMembership = membership.data; $('#prejoinName').value = membership.data.display_name || userName(); setAvatar($('#prejoinAvatar'), $('#prejoinName').value, avatarUrl()); $('#prejoinMic').disabled = Boolean(membership.data.is_muted);
    const memberCount = await db.from('room_members').select('user_id', { count: 'exact', head: true }).eq('room_id', room.id); $('#prejoinOnline').textContent = (memberCount.count || 1) + ((memberCount.count || 1) === 1 ? ' pessoa tem acesso a esta sala.' : ' pessoas têm acesso a esta sala.');
    await populatePrejoinDevices(); updatePrejoinPreview(); openModal('prejoinModal'); $('#sidebar').classList.remove('open');
  }
  async function confirmPrejoin() {
    const room = pendingJoinRoom, name = $('#prejoinName').value.trim(); if (!room || !name) { $('#prejoinError').textContent = 'Escolha o nome que você vai usar nesta sala.'; return; }
    const button = $('#confirmPrejoin'); button.disabled = true; button.textContent = 'Entrando…';
    if (name !== pendingJoinMembership?.display_name) { const saved = await db.rpc('update_room_nickname', { p_room_id: room.id, p_display_name: name }); if (saved.error) { $('#prejoinError').textContent = 'Não consegui salvar seu nome nesta sala.'; button.disabled = false; button.textContent = 'Entrar na sala'; return; } }
    const joinStream = prejoinStream; prejoinStream = null; pendingJoinRoom = null; pendingJoinMembership = null; $('#prejoinModal').classList.add('hidden'); $('#prejoinVideo').srcObject = null;
    button.disabled = false; button.textContent = 'Entrar na sala'; playCallSound('join'); await enterRoom(room, joinStream);
  }
  async function enterRoom(room, joinStream) {
    cleanupPeer();
    stopRoomControls();
    activeRoom = room; activeMembership = null; roomMembers.clear(); roomChannels = []; activeChannel = null; resetChat(); renderRooms(); updateRoomHeading();
    if (joinStream) {
      microphoneTrack = joinStream.getAudioTracks()[0] || null; cameraTrack = joinStream.getVideoTracks()[0] || null;
      const joinedMic = microphoneTrack, joinedCamera = cameraTrack;
      joinedMic?.addEventListener('ended', function () { if (microphoneTrack === joinedMic) { microphoneTrack = null; refreshPublishing(); } });
      joinedCamera?.addEventListener('ended', function () { if (cameraTrack === joinedCamera) { cameraTrack = null; refreshPublishing(); } });
      updateMediaButtons();
    }
    $('#emptyStage').classList.add('hidden'); $('#mediaStage').classList.remove('hidden'); $('#mediaControls').classList.remove('hidden');
    $('#roomTitle').textContent = room.name; $('#roomSubtitle').textContent = 'Sala ' + room.code; $('#chatRoomName').textContent = room.name;
    $('#inviteButton').disabled = false; $('#messageInput').disabled = true; $('#sendMessage').disabled = true; $('#messageInput').placeholder = 'Carregando chats…';
    $('#sidebar').classList.remove('open'); setConnection('Conectando à sala…', false);
    if (!await loadRoomMembers()) return;
    await loadChannels();
    $('#messageInput').disabled = !activeChannel; $('#sendMessage').disabled = !activeChannel;
    subscribeRoomControls(); await startPeerRoom(room);
  }
  function leaveActiveRoom() {
    playCallSound('leave');
    cleanupPeer(); stopRoomControls();
    activeRoom = null; activeMembership = null; roomMembers.clear(); roomChannels = []; activeChannel = null; renderRooms(); resetChat(); renderChannels();
    $('#roomSettingsButton').classList.add('hidden'); $('#manageRoomButton').classList.add('hidden'); $('#roomIdentityButton').classList.add('hidden'); $('#clearChannel').classList.add('hidden'); $('#headerRoomAvatar').style.backgroundImage=''; $('#headerRoomAvatar').textContent='#';
    $('#emptyStage').classList.remove('hidden'); $('#mediaStage').classList.add('hidden'); $('#mediaControls').classList.add('hidden');
    $('#roomTitle').textContent = 'Escolha uma sala'; $('#roomSubtitle').textContent = 'Suas salas ficam salvas aqui'; $('#chatRoomName').textContent = 'Selecione uma sala'; $('#activeChannelName').textContent = 'Conversa'; $('#participantCount').textContent = '0 online';
    $('#inviteButton').disabled = true; $('#messageInput').disabled = true; $('#sendMessage').disabled = true; $('#messageInput').placeholder = 'Escolha uma sala para conversar';
  }

  function syncPreferences() {
    $('#soundEnabled').checked = services.sounds.isEnabled;
    $('#soundVolume').value = String(Math.round(services.sounds.level * 100));
    $('#soundVolume').disabled = !services.sounds.isEnabled;
    $('#diagnosticsConsent').checked = services.diagnostics.consentEnabled;
    const installed = services.pwa.installed, available = services.pwa.canInstall;
    $('#installAppButton').disabled = installed || !available;
    $('#installAppStatus').textContent = installed ? 'Já instalado neste dispositivo' : available ? 'Usar como aplicativo no computador' : 'Disponível pelo menu do navegador';
    $('#landingInstallButton').classList.toggle('hidden', !available || installed);
    setConnection(activeRoom ? $('#connectionNote span').textContent : 'Pronta para conversar', Boolean(activeRoom && $('#connectionNote').dataset.state === 'healthy'));
  }
  async function installApplication() {
    const result = await services.pwa.install();
    if (result === 'accepted') showToast('Mostra aí instalado com sucesso.');
    else if (result === 'dismissed') showToast('Instalação cancelada. Você pode tentar novamente depois.');
    else showToast('Use a opção “Instalar aplicativo” no menu do navegador.');
    syncPreferences();
  }

  async function bootSignedIn(user) {
    currentUser = user;
    const profileResult = await db.from('profiles').select('display_name,avatar_url').eq('id',user.id).single();
    ownProfile = profileResult.data || null;
    $('#authScreen').classList.add('hidden'); $('#app').classList.remove('hidden'); renderAccount(); await loadRooms();
    if (pendingInvite) await loadInvitePreview();
  }
  async function bootSignedOut() {
    currentUser = null; ownProfile=null; stopPreviews(); stopPrejoin(); stopRoomControls(); resetChat(); document.querySelectorAll('.modal-backdrop').forEach(m=>m.classList.add('hidden')); cleanupPeer(); activeRoom = null; $('#app').classList.add('hidden'); $('#authScreen').classList.remove('hidden'); await loadInvitePreview(); await initGoogleButton();
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
  $('#channelForm').addEventListener('submit', createChannel);
  $('#roomIdentityForm').addEventListener('submit', saveRoomNickname);
  ['newRoom', 'newRoomWide', 'emptyCreate'].forEach(function (id) { $('#' + id).addEventListener('click', function () { openModal('createModal'); setTimeout(function () { $('#roomNameInput').focus(); }, 50); }); });
  document.querySelectorAll('[data-close]').forEach(function (button) { button.addEventListener('click', function () { closeModal(button.dataset.close); }); });
  document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) { backdrop.addEventListener('click', function (event) { if (event.target === backdrop && backdrop.id !== 'acceptInviteModal') closeModal(backdrop.id); }); });
  $('#inviteButton').addEventListener('click', openInviteManager);
  $('#generateInvite').addEventListener('click', createInvite);
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
  $('#clearChannel').addEventListener('click', clearActiveChannel);
  $('#cancelReply').addEventListener('click', clearReply); $('#closePinned').addEventListener('click', function () { $('#pinnedPanel').classList.add('hidden'); });
  $('#gestureButton').addEventListener('click', function () { const open = $('#gestureMenu').classList.contains('hidden'); $('#gestureMenu').classList.toggle('hidden', !open); $('#gestureButton').setAttribute('aria-expanded', String(open)); });
  document.querySelectorAll('[data-gesture]').forEach(function (button) { button.addEventListener('click', function () { sendGesture(button.dataset.gesture); }); });
  $('#customGesture').addEventListener('click', function () { const emoji = prompt('Digite o emoji que você quer mandar:', '✨'); if (emoji) sendGesture(emoji); });
  $('#micButton').addEventListener('click', toggleMicrophone); $('#cameraButton').addEventListener('click', toggleCamera); $('#screenButton').addEventListener('click', toggleScreen); $('#leaveButton').addEventListener('click', leaveActiveRoom);
  $('#cancelPrejoin').addEventListener('click', function () { closeModal('prejoinModal'); }); $('#confirmPrejoin').addEventListener('click', confirmPrejoin);
  $('#prejoinMic').addEventListener('click', function () { togglePrejoinMedia('mic'); }); $('#prejoinCamera').addEventListener('click', function () { togglePrejoinMedia('camera'); });
  $('#prejoinName').addEventListener('input', function () { setAvatar($('#prejoinAvatar'), $('#prejoinName').value || userName(), avatarUrl()); });
  $('#prejoinMicSelect').addEventListener('change', async function () { if (prejoinStream?.getAudioTracks().length) { await togglePrejoinMedia('mic'); await togglePrejoinMedia('mic'); } });
  $('#prejoinCameraSelect').addEventListener('change', async function () { if (prejoinStream?.getVideoTracks().length) { await togglePrejoinMedia('camera'); await togglePrejoinMedia('camera'); } });
  window.addEventListener('beforeunload', function () { stopPreviews(); stopPrejoin(); leaving = true; stopMedia(); peer?.destroy(); });
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
  async function loadRoomMembers() {
    if (!activeRoom) return false;
    const roomId = activeRoom.id;
    const result = await db.from('room_members').select('room_id,user_id,role,display_name,is_muted,can_share_screen,created_at,last_joined_at').eq('room_id', roomId);
    if (result.error || !activeRoom || activeRoom.id !== roomId) { showToast('Não consegui carregar os membros da sala.'); return false; }
    roomMembers.clear();
    (result.data || []).forEach(function (member) { roomMembers.set(member.user_id, member); });
    activeMembership = roomMembers.get(currentUser.id) || null;
    if (!activeMembership) {
      leaveActiveRoom();
      showToast('Você foi removido desta sala.');
      return false;
    }
    const ids = Array.from(roomMembers.keys());
    if (ids.length) {
      const profiles = await db.from('profiles').select('id,display_name,avatar_url').in('id', ids);
      (profiles.data || []).forEach(function (profile) { memberProfiles.set(profile.id, profile); });
    }
    applyMembershipControls(); updateRoomHeading(); renderMemberManagement(); renderChannels(); renderRoster();
    return true;
  }
  function applyMembershipControls() {
    if (!activeMembership) return;
    if (activeMembership.is_muted && microphoneTrack) { microphoneTrack.stop(); microphoneTrack = null; refreshPublishing(); showToast('Seu microfone foi silenciado pela administração.'); }
    if (!activeMembership.can_share_screen && screenTrack) {
      const oldVideo = screenTrack, oldAudio = screenAudioTracks.slice(); screenTrack = null; screenAudioTracks = []; oldVideo.stop(); oldAudio.forEach(function (track) { track.stop(); }); refreshPublishing();
      showToast('Seu compartilhamento de tela foi interrompido pela administração.');
    }
    $('#micButton').disabled = Boolean(activeMembership.is_muted);
    $('#micButton').title = activeMembership.is_muted ? 'Microfone bloqueado pela administração' : ($('#micButton').getAttribute('aria-pressed') === 'true' ? 'Silenciar' : 'Ligar microfone');
    $('#screenButton').disabled = !activeMembership.can_share_screen;
    $('#screenButton').title = activeMembership.can_share_screen ? ($('#screenButton').getAttribute('aria-pressed') === 'true' ? 'Parar tela' : 'Compartilhar tela') : 'Compartilhamento bloqueado pela administração';
  }
  function stopRoomControls() {
    if (roomControlChannel) db.removeChannel(roomControlChannel);
    roomControlChannel = null;
    if (roomControlTimer) clearInterval(roomControlTimer);
    roomControlTimer = null;
  }
  function subscribeRoomControls() {
    stopRoomControls();
    if (!activeRoom) return;
    const roomId = activeRoom.id;
    roomControlChannel = db.channel('room-controls-' + roomId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members', filter: 'room_id=eq.' + roomId }, function () { loadRoomMembers(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_channels', filter: 'room_id=eq.' + roomId }, function () { loadChannels(activeChannel?.id); })
      .subscribe();
    roomControlTimer = setInterval(function () {
      if (activeRoom?.id === roomId) loadRoomMembers();
    }, 15000);
  }
  function renderMemberManagement() {
    const list = $('#memberList'); if (!list) return; list.textContent = '';
    const members = Array.from(roomMembers.values()).sort(function (a, b) {
      const weight = { owner: 0, admin: 1, member: 2 };
      return (weight[a.role] - weight[b.role]) || a.display_name.localeCompare(b.display_name, 'pt-BR');
    });
    const onlineIds = new Set(peerUserIds.values()); if (currentUser?.id) onlineIds.add(currentUser.id);
    $('#memberSummary').textContent = members.length + (members.length === 1 ? ' pessoa tem acesso a esta sala.' : ' pessoas têm acesso a esta sala.') + (isRoomAdmin() ? ' Você pode gerenciar as permissões abaixo.' : '');
    members.forEach(function (member) {
      const row = document.createElement('article'); row.className = 'member-row';
      const profile = memberProfiles.get(member.user_id) || {};
      const person = document.createElement('div'); person.className = 'member-person';
      const avatar = document.createElement('span'); avatar.className = 'account-avatar'; setAvatar(avatar, member.display_name, profile.avatar_url || '');
      const copy = document.createElement('div'); copy.className = 'member-person-copy';
      const name = document.createElement('strong'); name.textContent = member.display_name + (member.user_id === currentUser.id ? ' (você)' : '');
      const badge = document.createElement('small'); badge.className = 'role-badge ' + member.role;
      const joined = member.last_joined_at ? new Date(member.last_joined_at).toLocaleDateString('pt-BR') : '';
      const online = onlineIds.has(member.user_id); badge.classList.toggle('online', online);
      badge.textContent = roleLabel(member.role) + (online ? ' · online' : joined ? ' · último acesso em ' + joined : '');
      copy.append(name, badge); person.append(avatar, copy); row.append(person);

      const actions = document.createElement('div'); actions.className = 'member-actions';
      const callerCanModerate = isRoomAdmin() && member.role !== 'owner' && (activeMembership.role === 'owner' || member.role === 'member');
      if (activeMembership?.role === 'owner' && member.role !== 'owner') {
        const role = document.createElement('button'); role.type = 'button'; role.className = 'member-action';
        role.textContent = member.role === 'admin' ? 'Remover admin' : 'Tornar admin';
        role.addEventListener('click', function () { setMemberRole(member, member.role === 'admin' ? 'member' : 'admin'); });
        actions.append(role);
      }
      if (callerCanModerate) {
        const mute = document.createElement('button'); mute.type = 'button'; mute.className = 'member-action' + (member.is_muted ? ' active' : '');
        mute.textContent = member.is_muted ? 'Liberar microfone' : 'Silenciar';
        mute.addEventListener('click', function () { setMemberControls(member, !member.is_muted, member.can_share_screen); });
        const screen = document.createElement('button'); screen.type = 'button'; screen.className = 'member-action' + (!member.can_share_screen ? ' active' : '');
        screen.textContent = member.can_share_screen ? 'Bloquear tela' : 'Liberar tela';
        screen.addEventListener('click', function () { setMemberControls(member, member.is_muted, !member.can_share_screen); });
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'member-action danger'; remove.textContent = 'Remover';
        remove.addEventListener('click', function () { removeMember(member); });
        actions.append(mute, screen, remove);
      }
      row.append(actions); list.appendChild(row);
    });
  }
  async function saveRoomNickname(event) {
    event.preventDefault();
    if (!activeRoom) return;
    const name = $('#roomNicknameInput').value.trim(), button = event.currentTarget.querySelector('button[type=submit]');
    if (!name) return;
    button.disabled = true; button.textContent = 'Salvando…'; $('#roomIdentityError').textContent = '';
    const result = await db.rpc('update_room_nickname', { p_room_id: activeRoom.id, p_display_name: name });
    button.disabled = false; button.textContent = 'Salvar nome';
    if (result.error) { $('#roomIdentityError').textContent = 'Não consegui salvar seu nome nesta sala.'; return; }
    await loadRoomMembers();
    if (peer) { roster.set(peer.id, roomUserName()); if (isCoordinator) broadcastRoster(); else coordinatorConnection?.send({ type: 'intro', nickname: roomUserName() }); renderRoster(); }
    closeModal('roomIdentityModal'); showToast('Seu nome nesta sala foi atualizado.');
  }
  async function setMemberRole(member, role) {
    const result = await db.rpc('set_room_member_role', { p_room_id: activeRoom.id, p_user_id: member.user_id, p_role: role });
    if (result.error) { showToast('Não consegui alterar este cargo.'); return; }
    await loadRoomMembers(); showToast(role === 'admin' ? 'Administrador adicionado.' : 'Cargo de administrador removido.');
  }
  async function setMemberControls(member, isMuted, canShareScreen) {
    const result = await db.rpc('set_room_member_controls', { p_room_id: activeRoom.id, p_user_id: member.user_id, p_is_muted: isMuted, p_can_share_screen: canShareScreen });
    if (result.error) { showToast('Não consegui aplicar esta ação.'); return; }
    await loadRoomMembers(); showToast('Permissões atualizadas.');
  }
  async function removeMember(member) {
    if (!confirm('Remover ' + member.display_name + ' desta sala?')) return;
    const result = await db.rpc('remove_room_member', { p_room_id: activeRoom.id, p_user_id: member.user_id });
    if (result.error) { showToast('Não consegui remover esta pessoa.'); return; }
    await loadRoomMembers(); showToast('Pessoa removida da sala.');
  }
  function updateRoomHeading() {
    if(!activeRoom)return;
    setAvatar($('#headerRoomAvatar'),activeRoom.name,activeRoom.avatar_url);
    $('#roomSettingsButton').classList.toggle('hidden',activeRoom.owner_id!==currentUser.id);
    $('#manageRoomButton').classList.toggle('hidden',!activeMembership);
    $('#roomIdentityButton').classList.toggle('hidden',!activeMembership);
    $('#roomIdentityName').textContent=roomUserName();$('#roomIdentityRole').textContent=roleLabel(activeMembership?.role);setAvatar($('#roomIdentityAvatar'),roomUserName(),ownProfile?.avatar_url||'');
    $('#clearChannel').classList.toggle('hidden',!isRoomAdmin());
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
        ownProfile=values;memberProfiles.set(currentUser.id,{id:currentUser.id,display_name:name,avatar_url:newPhoto});renderAccount();
        if(peer){const liveName=roomUserName();roster.set(peer.id,liveName);if(isCoordinator)broadcastRoster();else coordinatorConnection?.send({type:'intro',nickname:liveName});renderRoster();}
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
  $('#profileButton').addEventListener('click',function(){syncPreferences();openModal('preferencesModal');});$('#accountAvatar').addEventListener('click',editProfile);
  $('#editProfileFromSettings').addEventListener('click',function(){closeModal('preferencesModal');editProfile();});
  $('#openDevicesFromSettings').addEventListener('click',function(){closeModal('preferencesModal');openDevices();});
  $('#soundEnabled').addEventListener('change',function(){services.sounds.setEnabled($('#soundEnabled').checked);syncPreferences();if($('#soundEnabled').checked)playCallSound('mediaOn');});
  $('#soundVolume').addEventListener('input',function(){services.sounds.setVolume(Number($('#soundVolume').value)/100);});
  $('#diagnosticsConsent').addEventListener('change',function(){services.diagnostics.setConsent($('#diagnosticsConsent').checked);showToast($('#diagnosticsConsent').checked?'Diagnósticos técnicos ativados.':'Diagnósticos técnicos desativados.');syncPreferences();});
  $('#installAppButton').addEventListener('click',installApplication);$('#landingInstallButton').addEventListener('click',installApplication);
  services.pwa.subscribe(syncPreferences);
  $('#roomSettingsButton').addEventListener('click',editRoom);
  $('#roomIdentityButton').addEventListener('click',()=>{if(!activeMembership)return;$('#roomNicknameInput').value=roomUserName();$('#roomIdentityError').textContent='';openModal('roomIdentityModal');});
  $('#manageRoomButton').addEventListener('click',()=>{renderMemberManagement();$('#manageRoomError').textContent='';openModal('manageRoomModal');});
  $('#profilePhoto').addEventListener('change',e=>choosePhoto('profile',e.target));$('#roomPhoto').addEventListener('change',e=>choosePhoto('room',e.target));
  $('#removeProfilePhoto').addEventListener('click',()=>{resetDraft('profile');profileDraftPhoto=null;setAvatar($('#profilePhotoPreview'),userName(),'');});
  $('#removeRoomPhoto').addEventListener('click',()=>{resetDraft('room');roomDraftPhoto=null;setAvatar($('#roomPhotoPreview'),activeRoom.name,'');});
  $('#profileForm').addEventListener('submit',e=>savePersonalization(e,'profile'));$('#roomSettingsForm').addEventListener('submit',e=>savePersonalization(e,'room'));
  $('#roomSearch').addEventListener('input',renderRooms);
  $('#sidebarDevices').addEventListener('click',()=>openDevices());$('#micDevices').addEventListener('click',()=>openDevices('microphoneSelect'));$('#cameraDevices').addEventListener('click',()=>openDevices('cameraSelect'));
  $('#testMic').addEventListener('click',testMicrophone);$('#testCamera').addEventListener('click',testCamera);
  $('#microphoneSelect').addEventListener('change',()=>changeDevice('mic'));$('#cameraSelect').addEventListener('change',()=>changeDevice('camera'));
  navigator.mediaDevices?.addEventListener('devicechange',()=>{if(!$('#devicesModal').classList.contains('hidden'))enumerateDevices();});
  window.addEventListener('offline',function(){if(activeRoom)setConnection('Sem internet. A chamada será retomada automaticamente.',false);else syncPreferences();});
  window.addEventListener('online',function(){if(activeRoom){setConnection('Internet voltou. Reconectando…',false);scheduleReconnect(peer);}else syncPreferences();});
  navigator.connection?.addEventListener?.('change',function(){if(activeRoom)setConnection($('#connectionNote span').textContent,$('#connectionNote').dataset.state==='healthy');else syncPreferences();});
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

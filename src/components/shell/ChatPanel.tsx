import { Send, Trash2, X } from "lucide-react";
import { MostraAiChatIcon } from "../brand/BrandIcons";

export function ChatPanel() {
  return (
    <aside className="chat-panel" id="chatPanel" data-component="chat-panel">
      <div className="chat-head">
        <div><strong id="activeChannelName">Conversa</strong><small id="chatRoomName">Selecione uma sala</small></div>
        <div className="chat-head-actions">
          <button className="hidden" id="clearChannel" title="Limpar este chat" aria-label="Limpar este chat"><Trash2 /></button>
          <button id="closeChat" aria-label="Fechar conversa"><X /></button>
        </div>
      </div>
      <div className="channel-tabs" id="channelTabs" />
      <div className="pinned-panel hidden" id="pinnedPanel">
        <div><strong>📌 Fixadas</strong><button type="button" id="closePinned" aria-label="Ocultar mensagens fixadas">×</button></div>
        <div id="pinnedMessages" />
      </div>
      <div className="messages" id="messages">
        <div className="chat-empty"><span><MostraAiChatIcon /></span><strong>O chat começa aqui</strong><small>As mensagens desta sala aparecem para todos os membros.</small></div>
      </div>
      <div className="reply-preview hidden" id="replyPreview">
        <div><small>Respondendo a <strong id="replyName">alguém</strong></small><span id="replyText" /></div>
        <button type="button" id="cancelReply" aria-label="Cancelar resposta">×</button>
      </div>
      <form className="message-form" id="messageForm">
        <input aria-label="Mensagem" id="messageInput" maxLength={2000} autoComplete="off" placeholder="Escolha uma sala para conversar" disabled />
        <button type="submit" disabled id="sendMessage" aria-label="Enviar mensagem"><Send /></button>
      </form>
    </aside>
  );
}

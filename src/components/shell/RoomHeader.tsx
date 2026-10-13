import { House, Menu, Settings, UserRoundPlus, Users } from "lucide-react";
import { MostraAiChatIcon } from "../brand/BrandIcons";

export function RoomHeader() {
  return (
    <header className="room-header" data-component="room-header">
      <div className="room-header-left">
        <button className="mobile-menu" id="openSidebar" aria-label="Abrir salas"><Menu /></button>
        <span className="header-room-avatar" id="headerRoomAvatar"><House /></span>
        <div><strong id="roomTitle">Início</strong><small id="roomSubtitle">Salas, convites e atalhos</small></div>
      </div>
      <div className="room-actions">
        <span className="participant-count hidden" id="participantCount">0 online</span>
        <button className="identity-button hidden" id="roomIdentityButton" title="Alterar seu nome nesta sala">
          <span className="account-avatar" id="roomIdentityAvatar">A</span>
          <span className="identity-copy"><strong id="roomIdentityName">Amigo</strong><small id="roomIdentityRole">membro</small></span>
        </button>
        <button className="square-button hidden" id="manageRoomButton" title="Ver membros da sala" aria-label="Ver membros da sala"><Users /></button>
        <button className="square-button hidden" id="roomSettingsButton" title="Personalizar sala" aria-label="Personalizar sala"><Settings /></button>
        <button className="header-button hidden" id="inviteButton" aria-label="Convidar pessoas" disabled><UserRoundPlus /><span>Convidar</span></button>
        <button className="square-button hidden" id="toggleChat" title="Abrir ou fechar chat" aria-label="Abrir ou fechar chat" aria-pressed="true"><MostraAiChatIcon /></button>
      </div>
    </header>
  );
}

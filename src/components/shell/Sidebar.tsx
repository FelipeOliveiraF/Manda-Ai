import { Headphones, LogOut, Plus, Search, Settings, X } from "lucide-react";
import { Brand } from "./Brand";

export function Sidebar() {
  return (
    <aside className="sidebar" id="sidebar" data-component="sidebar">
      <div className="sidebar-head">
        <Brand />
        <button className="square-button" id="closeSidebar" title="Fechar menu" aria-label="Fechar menu"><X /></button>
      </div>
      <div className="sidebar-intro">
        <h2>Seu espaço</h2>
        <p>Encontre sua galera por aqui.</p>
      </div>
      <label className="room-search">
        <Search aria-hidden="true" />
        <input id="roomSearch" placeholder="Buscar sala" aria-label="Buscar sala" />
      </label>
      <div className="rooms-heading">
        <span>SUAS SALAS</span>
        <button id="newRoom" title="Criar sala" aria-label="Criar sala"><Plus /></button>
      </div>
      <div className="rooms-list" id="roomsList" />
      <button className="new-room-button" id="newRoomWide"><Plus /> Criar nova sala</button>
      <button className="device-sidebar" id="sidebarDevices"><Headphones /> Áudio e vídeo</button>
      <div className="sidebar-version"><span className="version-dot" aria-hidden="true" />Versão 1.15</div>
      <div className="account-card">
        <button className="account-avatar" id="accountAvatar" title="Editar perfil" aria-label="Editar perfil">A</button>
        <div className="account-copy"><strong id="accountName">Amigo</strong><small>Disponível</small></div>
        <button id="profileButton" title="Editar perfil" aria-label="Editar perfil"><Settings /></button>
        <button id="logoutButton" title="Sair da conta" aria-label="Sair da conta"><LogOut /></button>
      </div>
    </aside>
  );
}

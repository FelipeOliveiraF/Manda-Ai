import { Sidebar } from "./Sidebar";
import { RoomHeader } from "./RoomHeader";
import { Stage } from "./Stage";
import { ChatPanel } from "./ChatPanel";

export function AppShell() {
  return (
    <div className="app hidden" id="app" data-component="app-shell">
      <Sidebar />
      <button className="mobile-scrim" id="mobileScrim" type="button" aria-label="Fechar menu de salas" aria-hidden="true" tabIndex={-1} />
      <main className="workspace">
        <RoomHeader />
        <div className="room-layout home-mode">
          <Stage />
          <ChatPanel />
        </div>
      </main>
    </div>
  );
}

import { Sidebar } from "./Sidebar";
import { RoomHeader } from "./RoomHeader";
import { Stage } from "./Stage";
import { ChatPanel } from "./ChatPanel";

export function AppShell() {
  return (
    <div className="app hidden" id="app" data-component="app-shell">
      <Sidebar />
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

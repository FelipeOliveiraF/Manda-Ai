import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { startDiagnostics } from "./services/diagnostics";
import { initializeTheme } from "./services/theme";
import "./styles/app.css";

window.__MOSTRA_AI_REACT__ = true;
initializeTheme();
startDiagnostics();

async function start() {
  const root = document.getElementById("root");
  if (!root) throw new Error("Raiz do aplicativo não encontrada.");

  flushSync(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });

  const previewParams = new URLSearchParams(location.search);
  const previewModal = previewParams.get("ui-preview");
  const isLocalPreview = ["127.0.0.1", "localhost"].includes(location.hostname)
    && (previewParams.has("shell-preview") || previewParams.has("prejoin-preview") || previewParams.has("auth-preview") || previewModal);
  if (isLocalPreview) {
    if (previewParams.has("auth-preview")) return;
    document.getElementById("authScreen")?.classList.add("hidden");
    document.getElementById("app")?.classList.remove("hidden");
    if (previewParams.has("prejoin-preview")) {
      document.getElementById("prejoinModal")?.classList.remove("hidden");
      const roomName = document.getElementById("prejoinRoomName");
      const online = document.getElementById("prejoinOnline");
      const name = document.getElementById("prejoinName") as HTMLInputElement | null;
      if (roomName) roomName.textContent = "Sala de estudos";
      if (online) online.textContent = "4 pessoas têm acesso a esta sala.";
      if (name) name.value = "Felipe";
    }
    if (previewModal) document.getElementById(previewModal)?.classList.remove("hidden");
    if (previewModal === "chessModal" && previewParams.has("chess-game-preview")) {
      document.getElementById("chessLobby")?.classList.add("hidden");
      document.getElementById("chessGameView")?.classList.remove("hidden");
      const white = document.getElementById("chessWhiteName");
      const black = document.getElementById("chessBlackName");
      const status = document.getElementById("chessGameStatus");
      if (white) white.textContent = "Felipe";
      if (black) black.textContent = "Amigo";
      if (status) status.textContent = "Sua vez";
    }
    return;
  }
}

void start();

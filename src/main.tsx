import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import { Peer } from "peerjs";
import { App } from "./App";
import "./styles/app.css";

window.supabase = { createClient: createClient as typeof window.supabase.createClient };
window.Peer = Peer;
window.__MOSTRA_AI_REACT__ = true;

function loadGoogleIdentity(): Promise<void> {
  if (window.google) return Promise.resolve();
  return new Promise((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = finish;
    document.head.appendChild(script);
    window.setTimeout(finish, 3000);
  });
}

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
  const isLocalPreview = ["127.0.0.1", "localhost"].includes(location.hostname)
    && (previewParams.has("shell-preview") || previewParams.has("prejoin-preview"));
  if (isLocalPreview) {
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
    return;
  }

  await loadGoogleIdentity();
  const legacyRuntime = document.createElement("script");
  legacyRuntime.src = "/legacy-app.js";
  legacyRuntime.dataset.runtime = "compat-v1.5";
  document.body.appendChild(legacyRuntime);
}

void start();

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

  await loadGoogleIdentity();
  const legacyRuntime = document.createElement("script");
  legacyRuntime.src = "/legacy-app.js";
  legacyRuntime.dataset.runtime = "compat-v1.5";
  document.body.appendChild(legacyRuntime);
}

void start();

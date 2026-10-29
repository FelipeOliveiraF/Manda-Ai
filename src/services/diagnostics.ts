import type { SupabaseClient } from "@supabase/supabase-js";

type Diagnostic = { at: string; type: string; message: string };
const KEY = "mostra-diagnostics";
const CONSENT_KEY = "mostra-diagnostics-consent";
const APP_VERSION = "1.20";

function sanitize(value: unknown) {
  return (value instanceof Error ? value.message : String(value || "Erro desconhecido"))
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[email]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[id]")
    .slice(0, 500);
}

class DiagnosticsService {
  private client?: SupabaseClient;
  private started = false;
  private sentThisSession = 0;

  configure(client: SupabaseClient) { this.client = client; }
  get consentEnabled() { return localStorage.getItem(CONSENT_KEY) === "true"; }
  setConsent(enabled: boolean) { localStorage.setItem(CONSENT_KEY, String(enabled)); }

  start() {
    if (this.started) return;
    this.started = true;
    window.addEventListener("error", (event) => this.record("error", event.error || event.message));
    window.addEventListener("unhandledrejection", (event) => this.record("promise", event.reason));
    window.addEventListener("offline", () => this.record("network", "offline"));
  }

  record(type: "error" | "promise" | "network" | "call", value: unknown) {
    const message = sanitize(value);
    try {
      const previous = JSON.parse(sessionStorage.getItem(KEY) || "[]") as Diagnostic[];
      sessionStorage.setItem(KEY, JSON.stringify([...previous.slice(-19), { at: new Date().toISOString(), type, message }]));
    } catch { /* diagnóstico nunca deve afetar a chamada */ }

    if (!this.consentEnabled || !this.client || this.sentThisSession >= 10) return;
    this.sentThisSession += 1;
    void this.client.from("client_diagnostics").insert({
      app_version: APP_VERSION,
      event_type: type,
      message,
      path: location.pathname.slice(0, 120),
    }).then(({ error }) => {
      if (error) this.sentThisSession = Math.max(0, this.sentThisSession - 1);
    });
  }
}

export const diagnostics = new DiagnosticsService();
export function startDiagnostics() { diagnostics.start(); }

type Diagnostic = { at: string; type: string; message: string };
const KEY = "mostra-diagnostics";

function record(type: string, value: unknown) {
  try {
    const previous = JSON.parse(sessionStorage.getItem(KEY) || "[]") as Diagnostic[];
    const message = value instanceof Error ? value.message : String(value || "Erro desconhecido");
    sessionStorage.setItem(KEY, JSON.stringify([...previous.slice(-19), { at: new Date().toISOString(), type, message: message.slice(0, 500) }]));
  } catch { /* diagnóstico nunca deve afetar a chamada */ }
}

export function startDiagnostics() {
  window.addEventListener("error", (event) => record("error", event.error || event.message));
  window.addEventListener("unhandledrejection", (event) => record("promise", event.reason));
  window.addEventListener("offline", () => record("network", "offline"));
}

import { useEffect } from "react";
import { loadGoogleIdentity } from "../services/googleIdentity";

let startup: Promise<void> | undefined;

function startupErrorMessage(error: unknown) {
  if (!navigator.onLine) return "Você está sem internet. Reconecte-se e tente novamente.";
  if (error instanceof TypeError && /fetch|module|network/i.test(error.message)) {
    return "Não conseguimos baixar uma parte do aplicativo. Confira sua conexão e tente novamente.";
  }
  if (error instanceof Error && /dispositivos de mídia/i.test(error.message)) {
    return "Este navegador não oferece os recursos de áudio e vídeo necessários. Tente a versão mais recente do Chrome ou Edge.";
  }
  return "Não foi possível iniciar o aplicativo. Tente novamente em alguns instantes.";
}

function isDesignPreview() {
  if (!["127.0.0.1", "localhost"].includes(location.hostname)) return false;
  const params = new URLSearchParams(location.search);
  return params.has("shell-preview") || params.has("prejoin-preview") || params.has("auth-preview") || params.has("ui-preview");
}

export function useApplicationRuntime() {
  useEffect(() => {
    if (isDesignPreview()) return;
    startup ??= (async () => {
      await loadGoogleIdentity();
      const [{ startApplicationRuntime }, { createApplicationServices }] = await Promise.all([
        import("../generated/application-runtime"),
        import("../services/application"),
      ]);
      startApplicationRuntime(createApplicationServices());
    })();
    startup.catch((error) => {
      console.error("Não foi possível iniciar o Mostra aí.", error);
      const message = document.getElementById("authStatusMessage");
      const retry = document.getElementById("retryStartup");
      if (message) message.textContent = startupErrorMessage(error);
      retry?.classList.remove("hidden");
    });
  }, []);
}

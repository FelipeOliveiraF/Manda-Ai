import { useEffect } from "react";
import { loadGoogleIdentity } from "../services/googleIdentity";

let startup: Promise<void> | undefined;

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
      const status = document.getElementById("authStatus");
      if (status) status.textContent = "Não foi possível carregar o aplicativo. Atualize a página para tentar novamente.";
    });
  }, []);
}

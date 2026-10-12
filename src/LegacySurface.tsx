import { authMarkup, overlayMarkup } from "./generated/legacy-fragments";

/**
 * Ponte temporária da etapa 1.5.
 * Mantém todos os IDs e seletores do produto enquanto cada área é migrada
 * para componentes React nas próximas etapas.
 */
export function AuthSurface() {
  return (
    <div
      data-compat-surface="auth"
      dangerouslySetInnerHTML={{ __html: authMarkup }}
    />
  );
}

export function LegacyOverlays() {
  return (
    <div
      data-compat-surface="overlays"
      dangerouslySetInnerHTML={{ __html: overlayMarkup }}
    />
  );
}

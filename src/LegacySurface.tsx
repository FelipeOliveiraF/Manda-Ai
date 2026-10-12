import { legacyMarkup } from "./generated/legacy-markup";

/**
 * Ponte temporária da etapa 1.5.
 * Mantém todos os IDs e seletores do produto enquanto cada área é migrada
 * para componentes React nas próximas etapas.
 */
export function LegacySurface() {
  return (
    <div
      data-react-surface="mostra-ai"
      dangerouslySetInnerHTML={{ __html: legacyMarkup }}
    />
  );
}

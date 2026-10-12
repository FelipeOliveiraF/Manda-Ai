import { AuthSurface, LegacyOverlays } from "./LegacySurface";
import { AppShell } from "./components/shell/AppShell";

export function App() {
  return (
    <div data-react-surface="mostra-ai">
      <AuthSurface />
      <AppShell />
      <LegacyOverlays />
    </div>
  );
}

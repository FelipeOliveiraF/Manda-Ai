import { AuthSurface, LegacyOverlays } from "./LegacySurface";
import { AppShell } from "./components/shell/AppShell";
import { PrejoinDialog } from "./components/call/PrejoinDialog";

export function App() {
  return (
    <div data-react-surface="mostra-ai">
      <AuthSurface />
      <AppShell />
      <PrejoinDialog />
      <LegacyOverlays />
    </div>
  );
}

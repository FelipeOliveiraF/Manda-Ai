import { AppShell } from "./components/shell/AppShell";
import { PrejoinDialog } from "./components/call/PrejoinDialog";
import { AuthScreen } from "./components/complementary/AuthScreen";
import { ComplementarySurfaces } from "./components/complementary/ComplementarySurfaces";
import { useApplicationRuntime } from "./hooks/useApplicationRuntime";

export function App() {
  useApplicationRuntime();
  return (
    <div data-react-surface="mostra-ai">
      <AuthScreen />
      <AppShell />
      <PrejoinDialog />
      <ComplementarySurfaces />
    </div>
  );
}

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [auth, preferences, stage, runtime, sounds, pwa, diagnostics, packager] = await Promise.all([
  readFile(resolve(root, "src/components/complementary/AuthScreen.tsx"), "utf8"),
  readFile(resolve(root, "src/components/complementary/PreferencesDialog.tsx"), "utf8"),
  readFile(resolve(root, "src/components/shell/Stage.tsx"), "utf8"),
  readFile(resolve(root, "src/generated/application-runtime.ts"), "utf8"),
  readFile(resolve(root, "src/services/callSounds.ts"), "utf8"),
  readFile(resolve(root, "src/services/pwa.ts"), "utf8"),
  readFile(resolve(root, "src/services/diagnostics.ts"), "utf8"),
  readFile(resolve(root, "scripts/package-react-worker.mjs"), "utf8"),
]);

for (const marker of ["landing-copy", "landing-features", "landingInstallButton"]) assert.match(auth, new RegExp(marker));
for (const id of ["soundEnabled", "soundVolume", "installAppButton", "networkStatus"]) assert.match(preferences, new RegExp(`id=["']${id}["']`));
assert.match(stage, /id=["']connectionQuality["']/);
for (const marker of ["scheduleReconnect", "window.addEventListener('offline'", "window.addEventListener('online'", "navigator.connection"]) assert.match(runtime, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(sounds, /setEnabled/); assert.match(sounds, /setVolume/);
assert.match(pwa, /beforeinstallprompt/); assert.match(pwa, /appinstalled/);
assert.match(diagnostics, /unhandledrejection/); assert.match(diagnostics, /sessionStorage/);
assert.match(packager, /caches\.open/); assert.match(packager, /shellAssets/);

console.log("PASS: commercial landing, preferences, PWA and call resilience are wired");

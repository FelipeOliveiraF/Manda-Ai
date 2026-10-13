import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [auth, preferences, stage, runtime, runtimeHook, sounds, pwa, diagnostics, packager, brandIcons, brandAsset, theme] = await Promise.all([
  readFile(resolve(root, "src/components/complementary/AuthScreen.tsx"), "utf8"),
  readFile(resolve(root, "src/components/complementary/PreferencesDialog.tsx"), "utf8"),
  readFile(resolve(root, "src/components/shell/Stage.tsx"), "utf8"),
  readFile(resolve(root, "src/generated/application-runtime.ts"), "utf8"),
  readFile(resolve(root, "src/hooks/useApplicationRuntime.ts"), "utf8"),
  readFile(resolve(root, "src/services/callSounds.ts"), "utf8"),
  readFile(resolve(root, "src/services/pwa.ts"), "utf8"),
  readFile(resolve(root, "src/services/diagnostics.ts"), "utf8"),
  readFile(resolve(root, "scripts/package-react-worker.mjs"), "utf8"),
  readFile(resolve(root, "src/components/brand/BrandIcons.tsx"), "utf8"),
  readFile(resolve(root, "brand/mostra-ai-mark.svg"), "utf8"),
  readFile(resolve(root, "src/services/theme.ts"), "utf8"),
]);

for (const marker of ["landing-copy", "landing-features", "landingInstallButton"]) assert.match(auth, new RegExp(marker));
for (const marker of ["authStatusMessage", "retryStartup", "aria-live=\"polite\""]) assert.match(auth, new RegExp(marker));
for (const id of ["soundEnabled", "soundVolume", "installAppButton", "networkStatus", "diagnosticsConsent"]) assert.match(preferences, new RegExp(`id=["']${id}["']`));
for (const themeId of ["purple", "dark", "light"]) assert.match(preferences, new RegExp(`data-theme-choice=["']${themeId}["']`));
assert.match(stage, /id=["']connectionQuality["']/);
for (const marker of ["scheduleReconnect", "window.addEventListener('offline'", "window.addEventListener('online'", "navigator.connection"]) assert.match(runtime, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
for (const marker of ["requestDisplayMedia", "screenShareError", "selfBrowserSurface: 'exclude'", "getDisplayMedia({ video: true, audio: true })"]) assert.match(runtime, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
for (const marker of ["NotAllowedError", "NotFoundError", "NotReadableError", "OverconstrainedError", "AbortError", "SecurityError", "Você ficou sem internet", "Compartilhamento cancelado ou bloqueado"]) assert.match(runtime, new RegExp(marker));
for (const marker of ["startupErrorMessage", "Não conseguimos baixar uma parte", "retryStartup"]) assert.match(runtimeHook, new RegExp(marker));
assert.doesNotMatch(runtime, /preferCurrentTab\s*:\s*true/);
assert.match(sounds, /setEnabled/); assert.match(sounds, /setVolume/);
assert.match(pwa, /beforeinstallprompt/); assert.match(pwa, /appinstalled/);
assert.match(diagnostics, /unhandledrejection/); assert.match(diagnostics, /sessionStorage/); assert.match(diagnostics, /client_diagnostics/); assert.match(diagnostics, /sentThisSession >= 10/);
for (const marker of ["MostraAiMark", "MostraAiChatIcon", "MostraAiRoomIcon"]) assert.match(brandIcons, new RegExp(marker));
assert.match(brandAsset, /aria-label="Mostra aí"/); assert.match(brandAsset, /mostra-ai-gradient/);
for (const marker of ["mostra-theme", "purple", "dark", "light", "colorScheme"]) assert.match(theme, new RegExp(marker));
for (const marker of ["saveThemePreference", "mostra:theme-change"]) assert.match(theme, new RegExp(marker));
for (const marker of ["THEME_IDS", "data-theme-choice", "setTheme", "currentTheme"]) assert.match(runtime, new RegExp(marker));
for (const marker of ["user_preferences", "mostra:theme-change", "preferenceResult.data?.theme"]) assert.match(runtime, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(packager, /brand\/mostra-ai-mark\.svg/); assert.match(packager, /caches\.open/); assert.match(packager, /shellAssets/); assert.match(packager, /mostra-ai-react-v6/); assert.match(packager, /strict-transport-security/);

console.log("PASS: commercial landing, preferences, PWA and call resilience are wired");

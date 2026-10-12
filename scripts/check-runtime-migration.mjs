import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [main, hook, runtime, packager] = await Promise.all([
  readFile(resolve(root, "src/main.tsx"), "utf8"),
  readFile(resolve(root, "src/hooks/useApplicationRuntime.ts"), "utf8"),
  readFile(resolve(root, "src/generated/application-runtime.ts"), "utf8"),
  readFile(resolve(root, "scripts/package-react-worker.mjs"), "utf8"),
]);

assert.doesNotMatch(main, /legacy-app|createElement\(["']script["']\)/, "main must not inject the legacy runtime");
assert.match(hook, /import\(["']\.\.\/generated\/application-runtime["']\)/, "runtime must be code-split by the React hook");
assert.match(hook, /import\(["']\.\.\/services\/application["']\)/, "heavy services must be code-split with the runtime");
assert.match(runtime, /export function startApplicationRuntime/, "generated runtime must expose a module entrypoint");
assert.match(runtime, /services\.supabase/, "runtime must receive Supabase as a service");
assert.match(runtime, /services\.mediaDevices/, "runtime must receive media devices as a service");
assert.match(runtime, /services\.Peer/, "runtime must receive PeerJS as a service");
assert.match(runtime, /services\.sounds\.play/, "runtime must receive call sounds as a service");
for (const event of ["join", "leave", "participantJoin", "participantLeave", "shareStart", "shareStop", "mediaOn", "mediaOff"]) {
  assert.match(runtime, new RegExp(`playCallSound\\(['\"]${event}['\"]\\)`), `missing call sound: ${event}`);
}
assert.match(runtime, /if \(googleInitialized\) return;\s*googleInitialized = true;/, "Google initialization must be race-safe");
assert.doesNotMatch(packager, /["']\/legacy-app\.js["']/, "deployment must not expose the legacy route");

console.log("PASS: runtime uses hooks/services, code splitting and no legacy script route");

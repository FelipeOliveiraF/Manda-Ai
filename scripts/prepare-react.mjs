import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { styles } from "../worker/styles.js";
import { appScript } from "../worker/app.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generated = resolve(root, "src/generated");
await mkdir(generated, { recursive: true });

const browserStyles = styles.replace(/^\s*@import url\([^\n]+\);\s*/i, "");
const runtimeBody = appScript.trim()
  .replace(/^\(function \(\) \{\s*'use strict';\s*/i, "")
  .replace(/\s*\}\)\(\);\s*$/i, "")
  .replace(/^\s*const SUPABASE_URL[^\n]+\n/m, "")
  .replace(/^\s*const SUPABASE_KEY[^\n]+\n/m, "")
  .replace(/^\s*const GOOGLE_CLIENT_ID[^\n]+\n/m, "")
  .replace(/^\s*const db = window\.supabase\.createClient\([^\n]+\n/m, "")
  .replaceAll("navigator.mediaDevices", "services.mediaDevices");
const runtimeModule = `// Gerado a partir do runtime validado. A etapa 5 o incorpora ao bundle TypeScript.\n// @ts-nocheck\nimport type { ApplicationServices } from "../services/application";\n\nexport function startApplicationRuntime(services: ApplicationServices) {\n  const db = services.supabase;\n  const Peer = services.Peer;\n  const GOOGLE_CLIENT_ID = services.googleClientId;\n${runtimeBody}\n}\n`;
await Promise.all([
  writeFile(resolve(generated, "legacy.css"), `/* Gerado por scripts/prepare-react.mjs. Não edite manualmente. */\n${browserStyles}\n`),
  writeFile(resolve(generated, "application-runtime.ts"), runtimeModule),
]);

console.log("Estilos e runtime v1.19 preparados para a interface React.");

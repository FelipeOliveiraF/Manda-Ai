import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { page } from "../worker/page.js";
import { styles } from "../worker/styles.js";
import { appScript } from "../worker/app.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generated = resolve(root, "src/generated");
await mkdir(generated, { recursive: true });

const bodyMatch = page.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (!bodyMatch) throw new Error("Não foi possível extrair o conteúdo de <body>.");

const markup = bodyMatch[1].replace(/\s*<script[^>]*>[\s\S]*?<\/script>/gi, "").trim();
const authMatch = markup.match(/<section class="auth-screen"[\s\S]*?<\/section>/i);
const overlayStart = markup.indexOf('<div class="modal-backdrop hidden" id="createModal">');
if (!authMatch || overlayStart < 0) throw new Error("Não foi possível separar as superfícies legadas.");
const authMarkup = authMatch[0];
const overlayMarkup = markup.slice(overlayStart);
const browserStyles = styles.replace(/^\s*@import url\([^\n]+\);\s*/i, "");
const fragmentsModule = `// Gerado por scripts/prepare-react.mjs. Não edite manualmente.\nexport const authMarkup = ${JSON.stringify(authMarkup)};\nexport const overlayMarkup = ${JSON.stringify(overlayMarkup)};\n`;
await Promise.all([
  writeFile(resolve(generated, "legacy-fragments.ts"), fragmentsModule),
  writeFile(resolve(generated, "legacy-fragments.mjs"), fragmentsModule),
  writeFile(resolve(generated, "legacy.css"), `/* Gerado por scripts/prepare-react.mjs. Não edite manualmente. */\n${browserStyles}\n`),
  writeFile(resolve(generated, "legacy-app.js"), appScript),
]);

console.log("Compatibilidade React gerada a partir da interface v1.15.");

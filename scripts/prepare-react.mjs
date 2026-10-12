import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { styles } from "../worker/styles.js";
import { appScript } from "../worker/app.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generated = resolve(root, "src/generated");
await mkdir(generated, { recursive: true });

const browserStyles = styles.replace(/^\s*@import url\([^\n]+\);\s*/i, "");
await Promise.all([
  writeFile(resolve(generated, "legacy.css"), `/* Gerado por scripts/prepare-react.mjs. Não edite manualmente. */\n${browserStyles}\n`),
  writeFile(resolve(generated, "legacy-app.js"), appScript),
]);

console.log("Estilos e runtime v1.15 preparados para a interface React.");

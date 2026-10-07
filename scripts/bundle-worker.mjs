import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worker = path.join(root, "worker");
const output = path.join(root, "dist", "server", "index.js");

const modules = await Promise.all([
  readFile(path.join(worker, "page.js"), "utf8"),
  readFile(path.join(worker, "styles.js"), "utf8"),
  readFile(path.join(worker, "app.js"), "utf8"),
  readFile(path.join(worker, "index.js"), "utf8"),
]);

const bundled = modules
  .map((source, index) => index < 3
    ? source.replace(/^export const /m, "const ")
    : source.replace(/^import .*?;\r?\n/gm, ""))
  .join("\n\n");

await writeFile(output, bundled);

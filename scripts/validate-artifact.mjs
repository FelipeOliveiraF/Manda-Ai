import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");

const [source, manifest] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
JSON.parse(manifest);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

const fetchAsset = async (pathname) => workerModule.default.fetch(new Request(`https://local.invalid${pathname}`));
const home = await (await fetchAsset("/")).text();
assert.match(home, /src="\/app\.js"/);
assert.match(home, /href="\/app\.css"/);
assert.doesNotMatch(home, /\/assets\/app\.(?:js|css)/);
for (const pathname of ["/app.js", "/app.css", "/privacy", "/terms"]) {
  const response = await fetchAsset(pathname);
  assert.equal(response.status, 200, `${pathname} should be served`);
  assert.ok((await response.text()).length > 20, `${pathname} should not be empty`);
}
assert.equal((await fetchAsset("/legacy-app.js")).status, 404, "legacy-app.js must be removed");
const appSource = await (await fetchAsset("/app.js")).text();
const runtimePath = appSource.match(/["'](\/assets\/application-runtime(?:-[^"']+)?\.js)["']/)?.[1];
assert.ok(runtimePath, "React entrypoint should lazy-load the application runtime");
assert.equal((await fetchAsset(runtimePath)).status, 200, "runtime chunk should be served");
const mascotPath = appSource.match(/["'](\/assets\/mostra-ai-mascot-pixel(?:-[^"']+)?\.png)["']/)?.[1];
assert.ok(mascotPath, "React entrypoint should reference the pixel-art mascot");
const mascotResponse = await fetchAsset(mascotPath);
assert.equal(mascotResponse.status, 200, "mascot image should be served");
assert.equal(mascotResponse.headers.get("content-type"), "image/png", "mascot should use the PNG content type");
const mascotBytes = new Uint8Array(await mascotResponse.arrayBuffer());
assert.deepEqual(Array.from(mascotBytes.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10], "mascot should retain its PNG signature");

// Follow the complete JavaScript module graph. This catches broken nested
// imports such as a chunk resolving ./app.js to the nonexistent /assets/app.js.
const pendingModules = ["/app.js"];
const checkedModules = new Set();
while (pendingModules.length) {
  const pathname = pendingModules.shift();
  if (checkedModules.has(pathname)) continue;
  checkedModules.add(pathname);
  const response = await fetchAsset(pathname);
  assert.equal(response.status, 200, `${pathname} referenced by the module graph should be served`);
  const sourceText = await response.text();
  const imports = sourceText.matchAll(/(?:from\s*|import\s*\(\s*)["']([^"']+\.js)["']/g);
  for (const match of imports) {
    const dependency = new URL(match[1], `https://local.invalid${pathname}`).pathname;
    if (!checkedModules.has(dependency)) pendingModules.push(dependency);
  }
}

console.log("Artifact is valid ESM, code-split and free of the legacy runtime route");

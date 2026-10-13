import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { styles } from "../worker/styles.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const viteRoot = resolve(root, ".vite-dist");
const distRoot = resolve(root, "dist");
const serverRoot = resolve(distRoot, "server");

const [viteHtml, viteAppJs, appCss, hosting, viteAssetNames, icon] = await Promise.all([
  readFile(resolve(viteRoot, "index.html"), "utf8"),
  readFile(resolve(viteRoot, "assets/app.js"), "utf8"),
  readFile(resolve(viteRoot, "assets/app.css"), "utf8"),
  readFile(resolve(root, ".openai/hosting.json"), "utf8"),
  readdir(resolve(viteRoot, "assets")),
  readFile(resolve(root, "brand/mostra-ai-mark.svg"), "utf8"),
]);
const appJs = viteAppJs.replace(/import\(["']\.\/([^"']+\.js)["']\)/g, 'import("/assets/$1")');
const rewriteChunkImports = (source) => source
  // O entrypoint é publicado em /app.js, fora da pasta dos chunks. O Rollup
  // gera imports relativos para ele dentro dos chunks compartilhados; sem
  // esta correção o navegador tenta abrir /assets/app.js e aborta o runtime.
  .replace(/from\s*(["'])\.\/app\.js\1/g, 'from "/app.js"')
  .replace(/import\s*(["'])\.\/app\.js\1/g, 'import "/app.js"')
  .replace(/import\(\s*(["'])\.\/app\.js\1\s*\)/g, 'import("/app.js")');
const html = viteHtml
  .replaceAll("/assets/app.js", "/app.js")
  .replaceAll("/assets/app.css", "/app.css");

function legalPage(title, body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17181d"><meta name="robots" content="index,follow"><title>${title} — Mostra aí</title><style>${styles}</style></head><body class="legal"><main><nav><a href="/">← Voltar ao Mostra aí</a></nav>${body}<p class="legal-date">Última atualização: 12 de outubro de 2026.</p></main></body></html>`;
}

const privacy = legalPage("Privacidade", `<h1>Política de Privacidade</h1><p>O Mostra aí permite criar salas privadas para conversar por texto e compartilhar tela, câmera e áudio.</p><h2>Dados da conta</h2><p>Ao entrar com o Google, recebemos nome, e-mail, foto de perfil e o identificador da conta. Usamos esses dados para identificar você e manter suas salas. Você também pode enviar uma foto de perfil e, nas salas que criou, uma foto para a sala.</p><h2>Salas, convites e mensagens</h2><p>Guardamos os dados necessários para manter suas salas, membros, convites e mensagens de texto disponíveis.</p><h2>Áudio, vídeo e tela</h2><p>A mídia é transmitida em tempo real entre os participantes por WebRTC e não é gravada pelo Mostra aí.</p><h2>Diagnósticos opcionais</h2><p>Se você ativar “Ajude a melhorar” nas configurações, podemos receber até dez eventos técnicos por sessão vinculados ao identificador da sua conta, como tipo de erro, versão do aplicativo e caminho da página. Removemos endereços de e-mail, links e outros identificadores do texto do erro antes do envio. Nunca incluímos áudio, vídeo, compartilhamento de tela ou mensagens.</p><h2>Serviços utilizados</h2><p>Usamos Google para autenticação, Supabase para contas e dados das salas e PeerJS/WebRTC para conexão de mídia.</p><h2>Seus controles</h2><p>Você pode desativar os diagnósticos ou sair da conta a qualquer momento e solicitar a exclusão pelo e-mail <a href="mailto:felu.leo2016@gmail.com">felu.leo2016@gmail.com</a>.</p>`);
const terms = legalPage("Termos", `<h1>Termos de Uso</h1><div class="legal-box"><p>Ao usar o Mostra aí, você concorda em utilizar o serviço de forma legal, respeitosa e somente com pessoas autorizadas.</p></div><h2>Uso permitido</h2><p>Você é responsável pelo conteúdo que compartilha e deve ter autorização para transmitir telas, áudio, vídeo e mensagens.</p><h2>Disponibilidade</h2><p>O serviço pode mudar, ficar temporariamente indisponível ou depender de serviços externos e da conexão dos participantes.</p><h2>Privacidade</h2><p>O tratamento de dados está descrito na <a href="/privacy">Política de Privacidade</a>.</p>`);
const manifest = JSON.stringify({ id: "/", name: "Mostra aí — chamadas e compartilhamento", short_name: "Mostra aí", description: "Salas privadas com tela, câmera, áudio e chat.", lang: "pt-BR", dir: "ltr", start_url: "/", scope: "/", display: "standalone", display_override: ["window-controls-overlay", "standalone", "browser"], background_color: "#17181d", theme_color: "#17181d", categories: ["social", "productivity", "utilities"], prefer_related_applications: false, icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }], shortcuts: [{ name: "Abrir minhas salas", short_name: "Minhas salas", url: "/" }] });
const shellAssets = ["/", "/app.js", "/app.css", "/icon.svg", "/manifest.webmanifest", ...viteAssetNames.filter((name) => !["app.js", "app.css"].includes(name)).map((name) => `/assets/${name}`)];
const serviceWorker = `const CACHE='mostra-ai-react-v5';const SHELL=${JSON.stringify(shellAssets)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))))});`;

const assets = { "/": [html, "text/html; charset=utf-8"], "/index.html": [html, "text/html; charset=utf-8"], "/app.js": [appJs, "text/javascript; charset=utf-8"], "/app.css": [appCss, "text/css; charset=utf-8"], "/privacy": [privacy, "text/html; charset=utf-8"], "/terms": [terms, "text/html; charset=utf-8"], "/icon.svg": [icon, "image/svg+xml"], "/manifest.webmanifest": [manifest, "application/manifest+json"], "/sw.js": [serviceWorker, "text/javascript; charset=utf-8"] };
for (const name of viteAssetNames) {
  if (["app.js", "app.css"].includes(name)) continue;
  const rawContent = await readFile(resolve(viteRoot, "assets", name), "utf8");
  const content = name.endsWith(".js") ? rewriteChunkImports(rawContent) : rawContent;
  assets[`/assets/${name}`] = [content, name.endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8"];
}
const worker = `const assets = ${JSON.stringify(assets)};\nexport default { async fetch(request) { const pathname = new URL(request.url).pathname; const asset = assets[pathname]; if (!asset) return new Response("Not found", { status: 404 }); return new Response(asset[0], { headers: { "content-type": asset[1], "cache-control": pathname === "/" || pathname === "/index.html" || pathname.endsWith(".js") || pathname.endsWith(".css") ? "no-cache" : "public, max-age=3600", "referrer-policy": "strict-origin-when-cross-origin", "x-content-type-options": "nosniff", "permissions-policy": "camera=(self), microphone=(self), display-capture=(self)", "strict-transport-security": "max-age=31536000; includeSubDomains", "x-frame-options": "SAMEORIGIN" } }); } };\n`;

await rm(distRoot, { recursive: true, force: true });
await mkdir(serverRoot, { recursive: true });
await mkdir(resolve(distRoot, ".openai"), { recursive: true });
await Promise.all([
  writeFile(resolve(serverRoot, "index.js"), worker),
  writeFile(resolve(distRoot, ".openai/hosting.json"), hosting),
]);
console.log("Worker React empacotado em dist/.");

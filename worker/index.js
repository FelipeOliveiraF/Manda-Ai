import { page } from "./page.js";
import { styles } from "./styles.js";
import { appScript } from "./app.js";

function legalPage(title, body) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#17181d"><title>${title} — Mostra aí</title><style>${styles}</style></head><body class="legal"><main><nav><a href="/">← Voltar ao Mostra aí</a></nav>${body}<p class="legal-date">Última atualização: 7 de outubro de 2026.</p></main></body></html>`;
}

const privacyPage = legalPage("Privacidade", `<h1>Política de Privacidade</h1><p>O Mostra aí permite criar salas privadas para conversar por texto e compartilhar tela, câmera e áudio.</p><h2>Dados da conta</h2><p>Ao entrar com o Google, recebemos nome, e-mail, foto de perfil e o identificador da conta. Usamos esses dados para identificar você e manter suas salas. Você também pode enviar uma foto de perfil e, nas salas que criou, uma foto para a sala. Essas imagens ficam armazenadas no Supabase e são exibidas a quem tem acesso à sua conta ou compartilha a sala.</p><h2>Salas, convites e mensagens</h2><p>Guardamos nomes e identificadores das salas, membros, convites e mensagens de texto. Links de convite devem ser tratados como privados: qualquer pessoa com um convite válido pode solicitar entrada após fazer login.</p><h2>Áudio, vídeo e tela</h2><p>A mídia é transmitida em tempo real entre os participantes por WebRTC e não é gravada pelo Mostra aí. Você escolhe quando liberar tela, câmera e microfone.</p><h2>Serviços utilizados</h2><p>Usamos Google para autenticação, Supabase para contas e dados das salas e PeerJS/WebRTC para conexão de mídia.</p><h2>Seus controles</h2><p>Você pode sair da conta a qualquer momento e solicitar a exclusão do perfil e das salas pelo e-mail <a href="mailto:felu.leo2016@gmail.com">felu.leo2016@gmail.com</a>.</p>`);

const termsPage = legalPage("Termos", `<h1>Termos de Uso</h1><div class="legal-box"><p>Ao usar o Mostra aí, você concorda em utilizar o serviço de forma legal, respeitosa e somente com pessoas autorizadas.</p></div><h2>Uso permitido</h2><p>Você é responsável pelo conteúdo que compartilha e deve ter autorização para transmitir telas, áudio, vídeo e mensagens. Não use o serviço para assédio, fraude, invasão de privacidade ou distribuição de conteúdo ilegal.</p><h2>Contas, salas e convites</h2><p>Uma conta Google é necessária para criar, salvar e entrar em salas. Não publique links de convite e revogue o acesso quando necessário.</p><h2>Disponibilidade</h2><p>O serviço é fornecido no estado em que se encontra e pode mudar, ficar temporariamente indisponível ou depender de serviços externos e da conexão dos participantes.</p><h2>Privacidade</h2><p>O tratamento de dados está descrito na <a href="/privacy">Política de Privacidade</a>.</p>`);

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="20" y1="12" x2="108" y2="116" gradientUnits="userSpaceOnUse"><stop stop-color="#B59AFF"/><stop offset=".48" stop-color="#8B5CF6"/><stop offset="1" stop-color="#5B21B6"/></linearGradient></defs><rect width="128" height="128" rx="32" fill="url(#g)"/><path d="M27 25h74a14 14 0 0 1 14 14v39a14 14 0 0 1-14 14H68l-25 18V92H27a14 14 0 0 1-14-14V39a14 14 0 0 1 14-14Z" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"/><path d="M38 71V45l26 21 26-21v26" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="105" cy="23" r="8" fill="#F0E9FF" stroke="#7C3AED" stroke-width="4"/></svg>`;
const manifest = JSON.stringify({ name:"Mostra aí", short_name:"Mostra aí", description:"Salas privadas com tela, câmera, áudio e chat.", start_url:"/", display:"standalone", background_color:"#17181d", theme_color:"#17181d", icons:[{ src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any maskable" }] });
const serviceWorker = `const CACHE='mostra-ai-v6';self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));`;

export default {
  async fetch(request) {
    const pathname = new URL(request.url).pathname;
    let body;
    let contentType;
    if (pathname === "/" || pathname === "/index.html") { body = page; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/app.css") { body = styles; contentType = "text/css; charset=utf-8"; }
    else if (pathname === "/app.js") { body = appScript; contentType = "text/javascript; charset=utf-8"; }
    else if (pathname === "/privacy") { body = privacyPage; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/terms") { body = termsPage; contentType = "text/html; charset=utf-8"; }
    else if (pathname === "/icon.svg") { body = icon; contentType = "image/svg+xml"; }
    else if (pathname === "/manifest.webmanifest") { body = manifest; contentType = "application/manifest+json"; }
    else if (pathname === "/sw.js") { body = serviceWorker; contentType = "text/javascript; charset=utf-8"; }
    else return new Response("Not found", { status:404 });
    return new Response(body, { headers:{
      "content-type":contentType,
      "cache-control":pathname === "/" || pathname === "/app.js" || pathname === "/app.css" ? "no-cache" : "public, max-age=3600",
      "referrer-policy":"strict-origin-when-cross-origin",
      "x-content-type-options":"nosniff",
      "permissions-policy":"camera=(self), microphone=(self), display-capture=(self)"
    }});
  }
};

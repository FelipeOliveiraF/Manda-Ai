import { Download, MonitorUp, ShieldCheck, Sparkles } from "lucide-react";
import { MostraAiChatIcon, MostraAiMark } from "../brand/BrandIcons";
import { Brand } from "../shell/Brand";

export function AuthScreen() {
  return (
    <section className="auth-screen" id="authScreen" data-component="auth-screen">
      <div className="auth-brand"><Brand /></div>
      <div className="auth-layout">
        <div className="landing-copy">
          <span className="landing-kicker"><Sparkles /> CONVERSA SEM COMPLICAÇÃO</span>
          <h1>Mostra aí.<br /><span>O espaço é de vocês.</span></h1>
          <p>Compartilhe tela, câmera e áudio. Converse por texto e mantenha suas salas sempre por perto.</p>
          <div className="landing-features">
            <span><MonitorUp /> Tela com áudio</span><span><MostraAiChatIcon /> Chats por sala</span><span><ShieldCheck /> Controle de membros</span>
          </div>
          <button className="secondary-button landing-install hidden" id="landingInstallButton" type="button"><Download /> Instalar aplicativo</button>
          <small className="landing-trust">Privacidade por padrão • mídia não gravada • direto no navegador</small>
        </div>
        <div className="auth-card">
          <div className="auth-emblem"><MostraAiMark /></div>
          <span className="auth-eyebrow">ENTRE NO SEU ESPAÇO</span>
          <h2>Bom te ver por aqui.</h2>
          <p>Use sua conta Google para acessar suas salas.</p>
          <div className="invite-preview hidden" id="loginInvitePreview">
            <span className="invite-icon">#</span>
            <div><small>Você foi convidado para</small><strong id="loginInviteName">uma sala</strong></div>
          </div>
          <div className="google-slot" id="googleButton" />
          <div className="auth-status hidden" id="authStatus" role="status" aria-live="polite">
            <span id="authStatusMessage" />
            <button className="text-button hidden" id="retryStartup" type="button" onClick={() => location.reload()}>Tentar novamente</button>
          </div>
          <p className="auth-legal">Ao entrar, você concorda com os <a href="/terms">Termos</a> e a <a href="/privacy">Privacidade</a>.</p>
          <span className="version-badge">Versão 1.19</span>
        </div>
      </div>
    </section>
  );
}

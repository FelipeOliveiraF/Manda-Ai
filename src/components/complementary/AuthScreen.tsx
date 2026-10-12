import { Headphones } from "lucide-react";
import { Brand } from "../shell/Brand";

export function AuthScreen() {
  return (
    <section className="auth-screen" id="authScreen" data-component="auth-screen">
      <div className="auth-brand"><Brand /></div>
      <div className="auth-card">
        <div className="auth-emblem"><Headphones aria-hidden="true" /></div>
        <span className="auth-eyebrow">SEU ESPAÇO DE CONVERSA</span>
        <h1>Bom te ver por aqui.</h1>
        <p>Sua galera, suas salas. Entre para conversar e compartilhar o que está rolando.</p>
        <div className="invite-preview hidden" id="loginInvitePreview">
          <span className="invite-icon">#</span>
          <div><small>Você foi convidado para</small><strong id="loginInviteName">uma sala</strong></div>
        </div>
        <div className="google-slot" id="googleButton" />
        <p className="auth-status" id="authStatus">Entre com o Google para continuar.</p>
        <p className="auth-legal">Ao entrar, você concorda com os <a href="/terms">Termos</a> e a <a href="/privacy">Privacidade</a>.</p>
        <span className="version-badge">Versão 1.15</span>
      </div>
    </section>
  );
}

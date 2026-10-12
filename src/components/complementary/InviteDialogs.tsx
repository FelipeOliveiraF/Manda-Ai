import { Copy, Link2, LogIn, Plus, TicketCheck } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function InviteDialogs() {
  return <>
    <div className="modal-backdrop hidden" id="inviteModal" data-component="invite-dialogs">
      <div className="modal invite-manager-modal complementary-modal">
        <CloseButton modal="inviteModal" />
        <SettingsHeading icon={<Link2 />} title="Convites da sala" description="Crie e gerencie acessos sem precisar compartilhar senha." />
        <div className="invite-create-row">
          <label htmlFor="inviteExpiry">Validade do link</label>
          <select id="inviteExpiry" defaultValue="168"><option value="24">24 horas</option><option value="168">7 dias</option><option value="720">30 dias</option><option value="">Sem expiração</option></select>
          <button className="primary-button" id="generateInvite" type="button"><Plus /> Gerar convite</button>
        </div>
        <div className="invite-link-result hidden" id="inviteLinkResult">
          <label htmlFor="inviteLink">Novo link</label>
          <div className="copy-field"><input id="inviteLink" readOnly /><button id="copyInvite" type="button"><Copy /> Copiar</button></div>
          <p className="form-help">O link completo só aparece agora. Guarde ou envie antes de fechar.</p>
        </div>
        <section className="invite-history hidden" id="inviteHistory"><div className="section-title"><strong>Links criados</strong><small>Administradores podem revogar qualquer convite.</small></div><div id="inviteList" /></section>
        <p className="form-error" id="inviteManageError" role="alert" />
      </div>
    </div>

    <div className="modal-backdrop hidden" id="acceptInviteModal">
      <div className="modal invite-accept complementary-modal">
        <div className="modal-icon"><TicketCheck /></div><span className="modal-kicker">CONVITE PARA UMA SALA</span>
        <h2 id="acceptInviteName">Sala</h2>
        <p><span id="acceptInviter">Um amigo</span> convidou você para entrar. A sala ficará salva na sua lateral.</p>
        <button className="primary-button full" id="acceptInvite" type="button"><LogIn /> Aceitar convite</button>
        <button className="text-button" id="declineInvite" type="button">Agora não</button>
        <p className="form-error" id="inviteError" />
      </div>
    </div>
  </>;
}

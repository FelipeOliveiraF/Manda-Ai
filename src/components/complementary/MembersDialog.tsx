import { ShieldCheck, UsersRound } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function MembersDialog() {
  return <div className="modal-backdrop hidden" id="manageRoomModal" data-component="members-dialog">
    <div className="modal manage-modal complementary-modal">
      <CloseButton modal="manageRoomModal" />
      <SettingsHeading icon={<UsersRound />} title="Membros da sala" description={<span id="memberSummary">Todas as pessoas que têm acesso aparecem aqui.</span>} />
      <div className="member-context"><ShieldCheck /><span>Administradores podem gerenciar cargos e permissões.</span></div>
      <div className="member-list" id="memberList" />
      <section className="moderation-section hidden" id="bannedMembersSection"><div className="section-title"><strong>Acessos bloqueados</strong><small>Bloqueios temporários expiram automaticamente.</small></div><div className="member-list compact" id="bannedMemberList" /></section>
      <section className="moderation-section hidden" id="moderationLogSection"><div className="section-title"><strong>Atividade administrativa</strong><small>Últimas ações realizadas nesta sala.</small></div><div className="moderation-log" id="moderationLog" /></section>
      <p className="form-error" id="manageRoomError" role="alert" />
    </div>
  </div>;
}

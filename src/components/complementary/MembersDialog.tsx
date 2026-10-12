import { ShieldCheck, UsersRound } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function MembersDialog() {
  return <div className="modal-backdrop hidden" id="manageRoomModal" data-component="members-dialog">
    <div className="modal manage-modal complementary-modal">
      <CloseButton modal="manageRoomModal" />
      <SettingsHeading icon={<UsersRound />} title="Membros da sala" description={<span id="memberSummary">Todas as pessoas que têm acesso aparecem aqui.</span>} />
      <div className="member-context"><ShieldCheck /><span>Administradores podem gerenciar cargos e permissões.</span></div>
      <div className="member-list" id="memberList" />
      <p className="form-error" id="manageRoomError" role="alert" />
    </div>
  </div>;
}

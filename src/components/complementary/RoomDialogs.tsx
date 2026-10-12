import { AtSign, Hash, ImagePlus, Palette, Plus } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function RoomDialogs() {
  return <>
    <div className="modal-backdrop hidden" id="createModal" data-component="room-dialogs">
      <form className="modal complementary-modal" id="createForm">
        <CloseButton modal="createModal" />
        <div className="modal-icon"><Plus /></div><h2>Criar uma sala</h2>
        <p>Ela ficará salva na sua conta e poderá ser reaberta quando quiser.</p>
        <label htmlFor="roomNameInput">Nome da sala</label><input id="roomNameInput" maxLength={60} placeholder="Ex.: Sala de estudos" required />
        <button className="primary-button full" type="submit"><Plus /> Criar sala</button><p className="form-error" id="createError" />
      </form>
    </div>

    <div className="modal-backdrop hidden" id="roomSettingsModal">
      <form className="modal settings-modal complementary-modal" id="roomSettingsForm">
        <CloseButton modal="roomSettingsModal" />
        <SettingsHeading icon={<Palette />} title="Personalizar sala" description="Um nome e uma foto para chamar de sua." />
        <div className="photo-editor"><span className="photo-preview room-photo" id="roomPhotoPreview">#</span><div><label className="upload-button" htmlFor="roomPhoto"><ImagePlus /> Alterar foto</label><input className="file-input" type="file" id="roomPhoto" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG ou WebP • até 5 MB</small><button className="text-button" id="removeRoomPhoto" type="button">Remover foto</button></div></div>
        <label htmlFor="editRoomName">Nome da sala</label><input id="editRoomName" maxLength={60} required />
        <p className="form-error" id="roomSettingsError" role="alert" /><button className="primary-button full" type="submit">Salvar alterações</button>
      </form>
    </div>

    <div className="modal-backdrop hidden" id="roomIdentityModal">
      <form className="modal complementary-modal" id="roomIdentityForm">
        <CloseButton modal="roomIdentityModal" />
        <div className="modal-icon"><AtSign /></div><h2>Seu nome nesta sala</h2><p>Este nome vale apenas aqui. Em outras salas, você pode usar outro.</p>
        <label htmlFor="roomNicknameInput">Nome na sala</label><input id="roomNicknameInput" maxLength={60} required autoComplete="nickname" />
        <p className="form-error" id="roomIdentityError" role="alert" /><button className="primary-button full" type="submit">Salvar nome</button>
      </form>
    </div>

    <div className="modal-backdrop hidden" id="channelModal">
      <form className="modal complementary-modal" id="channelForm">
        <CloseButton modal="channelModal" />
        <div className="modal-icon"><Hash /></div><h2>Novo chat de texto</h2><p>Crie outro assunto dentro desta mesma sala.</p>
        <label htmlFor="channelNameInput">Nome do chat</label><input id="channelNameInput" maxLength={40} placeholder="Ex.: jogos, estudos, avisos" required />
        <p className="form-error" id="channelError" role="alert" /><button className="primary-button full" type="submit">Criar chat</button>
      </form>
    </div>
  </>;
}

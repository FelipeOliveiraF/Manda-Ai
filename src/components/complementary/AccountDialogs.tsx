import { Camera, Headphones, ImagePlus, Mic, Save, UserRound } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function AccountDialogs() {
  return <>
    <div className="modal-backdrop hidden" id="profileModal" data-component="account-dialogs">
      <form className="modal settings-modal complementary-modal" id="profileForm">
        <CloseButton modal="profileModal" />
        <SettingsHeading icon={<UserRound />} title="Seu perfil" description="Como você aparece para sua galera." />
        <div className="photo-editor"><span className="photo-preview" id="profilePhotoPreview">M</span><div><label className="upload-button" htmlFor="profilePhoto"><ImagePlus /> Alterar foto</label><input className="file-input" type="file" id="profilePhoto" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG ou WebP • até 5 MB</small><button className="text-button" id="removeProfilePhoto" type="button">Remover foto</button></div></div>
        <label htmlFor="profileNameInput">Nome de exibição</label><input id="profileNameInput" maxLength={60} required autoComplete="nickname" />
        <p className="form-error" id="profileError" role="alert" /><button className="primary-button full" type="submit"><Save /> Salvar alterações</button>
      </form>
    </div>

    <div className="modal-backdrop hidden" id="devicesModal">
      <div className="modal devices-modal complementary-modal">
        <CloseButton modal="devicesModal" />
        <SettingsHeading icon={<Headphones />} title="Áudio e vídeo" description="Deixe tudo pronto para a conversa." />
        <div className="device-sections">
          <section className="device-card"><span className="device-card-icon"><Mic /></span><label htmlFor="microphoneSelect">Microfone</label><select id="microphoneSelect"><option value="">Padrão do sistema</option></select><div className="device-test"><button className="secondary-button" id="testMic" type="button"><Mic /> Testar microfone</button><meter id="micLevel" min="0" max="100" value="0" aria-label="Nível do microfone" /></div><p className="device-help">Fale algo e veja se o nível de áudio se move.</p></section>
          <section className="device-card"><span className="device-card-icon"><Camera /></span><label htmlFor="cameraSelect">Câmera</label><select id="cameraSelect"><option value="">Padrão do sistema</option></select><div className="camera-preview"><video id="cameraPreview" autoPlay muted playsInline /><span id="cameraPreviewHint"><Camera />Sua prévia aparece aqui</span></div><button className="secondary-button" id="testCamera" type="button"><Camera /> Testar câmera</button></section>
        </div>
        <p className="device-help device-privacy" id="deviceHint" role="status">Ao testar, o navegador pede acesso ao dispositivo. A prévia fica só com você.</p>
        <button className="primary-button full" type="button" data-close="devicesModal">Pronto</button>
      </div>
    </div>
  </>;
}

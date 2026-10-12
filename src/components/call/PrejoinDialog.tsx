import { Camera, DoorOpen, Mic, X } from "lucide-react";

export function PrejoinDialog() {
  return (
    <div className="modal-backdrop hidden" id="prejoinModal" data-component="prejoin-dialog">
      <div className="modal prejoin-modal">
        <button className="modal-close" type="button" id="cancelPrejoin" aria-label="Cancelar entrada"><X /></button>
        <header className="prejoin-heading">
          <span className="modal-kicker">ANTES DE ENTRAR</span>
          <h2 id="prejoinRoomName">Sala</h2>
          <p id="prejoinOnline">Veja como você vai aparecer para a galera.</p>
        </header>
        <div className="prejoin-grid">
          <div className="prejoin-preview">
            <video className="hidden" id="prejoinVideo" autoPlay muted playsInline />
            <span className="prejoin-avatar" id="prejoinAvatar">A</span>
            <span className="prejoin-status" id="prejoinStatus">Câmera e microfone desligados</span>
            <span className="prejoin-preview-label">Prévia da câmera</span>
          </div>
          <div className="prejoin-setup">
            <label htmlFor="prejoinName">Seu nome nesta sala</label>
            <input id="prejoinName" maxLength={60} autoComplete="nickname" required />
            <div className="prejoin-toggles">
              <button className="secondary-button" id="prejoinMic" type="button" aria-pressed="false"><Mic /> Microfone desligado</button>
              <button className="secondary-button" id="prejoinCamera" type="button" aria-pressed="false"><Camera /> Câmera desligada</button>
            </div>
            <div className="prejoin-devices">
              <label><span>Microfone</span><select id="prejoinMicSelect" aria-label="Escolher microfone"><option value="">Microfone padrão</option></select></label>
              <label><span>Câmera</span><select id="prejoinCameraSelect" aria-label="Escolher câmera"><option value="">Câmera padrão</option></select></label>
            </div>
            <p className="form-error" id="prejoinError" role="alert" />
            <button className="primary-button full prejoin-enter" id="confirmPrejoin" type="button"><DoorOpen /> Entrar na sala</button>
          </div>
        </div>
      </div>
    </div>
  );
}

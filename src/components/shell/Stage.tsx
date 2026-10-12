import { Camera, ChevronUp, Headphones, Mic, PhoneOff, Radio, ScreenShare } from "lucide-react";

function MediaControls() {
  return (
    <div className="media-controls hidden" id="mediaControls" data-component="media-controls">
      <div className="control-group">
        <button className="control-button" id="micButton" aria-label="Ligar microfone" aria-pressed="false"><Mic /><small>Ligar microfone</small></button>
        <button className="device-arrow" id="micDevices" title="Escolher microfone" aria-label="Escolher microfone"><ChevronUp /></button>
      </div>
      <div className="control-group">
        <button className="control-button" id="cameraButton" aria-label="Ligar câmera" aria-pressed="false"><Camera /><small>Ligar câmera</small></button>
        <button className="device-arrow" id="cameraDevices" title="Escolher câmera" aria-label="Escolher câmera"><ChevronUp /></button>
      </div>
      <button className="control-button share" id="screenButton" aria-label="Compartilhar tela" aria-pressed="false"><ScreenShare /><small>Compartilhar tela</small></button>
      <div className="gesture-control">
        <button className="control-button" id="gestureButton" aria-label="Enviar reação" aria-expanded="false"><span className="gesture-icon">🙋</span><small>Reagir</small></button>
        <div className="gesture-menu hidden" id="gestureMenu">
          <button type="button" data-gesture="🙋" title="Levantar a mão">🙋</button><button type="button" data-gesture="👏" title="Aplaudir">👏</button><button type="button" data-gesture="😂" title="Rir">😂</button><button type="button" data-gesture="❤️" title="Coração">❤️</button><button type="button" data-gesture="🎉" title="Comemorar">🎉</button><button type="button" id="customGesture" title="Outro emoji">＋</button>
        </div>
      </div>
      <span className="control-divider" />
      <button className="control-button danger" id="leaveButton" title="Sair da chamada" aria-label="Sair da chamada"><PhoneOff /><small>Sair</small></button>
    </div>
  );
}

export function Stage() {
  return (
    <section className="stage-panel" data-component="stage">
      <div className="empty-stage" id="emptyStage">
        <div className="empty-icon"><Headphones aria-hidden="true" /></div>
        <h2>Onde vamos nos encontrar?</h2>
        <p>Abra uma sala da sua lista ou crie um lugar só de vocês.</p>
        <button className="primary-button" id="emptyCreate">Criar uma sala</button>
      </div>
      <div className="media-stage hidden" id="mediaStage">
        <div className="connection-note" id="connectionNote"><i /><span>Conectando à sala…</span></div>
        <div className="call-stage-status" aria-hidden="true"><Radio /><span>AO VIVO</span></div>
        <div className="media-grid" id="mediaGrid" />
        <div className="gesture-layer" id="gestureLayer" aria-live="polite" />
      </div>
      <MediaControls />
    </section>
  );
}

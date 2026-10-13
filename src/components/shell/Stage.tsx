import { ArrowRight, Camera, ChevronUp, Clock3, Link2, Mic, PhoneOff, Radio, ScreenShare } from "lucide-react";
import mostraAiMascot from "../../assets/mostra-ai-mascot-pixel.png";

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
      <div className="home-dashboard" id="emptyStage">
        <section className="home-welcome">
          <div>
            <span className="home-eyebrow">SEU ESPAÇO</span>
            <h2 id="homeGreeting">Que bom te ver por aqui.</h2>
            <p id="homeRoomSummary">Suas salas e convites ficam reunidos em um só lugar.</p>
          </div>
          <figure className="home-mascot" aria-label="Mascote pixel art do Mostra aí">
            <img src={mostraAiMascot} alt="" draggable="false" />
          </figure>
        </section>

        <div className="home-grid">
          <section className="home-card home-recents">
            <header>
              <span className="home-card-icon"><Clock3 /></span>
              <div><h3>Salas recentes</h3><p>Continue de onde você parou.</p></div>
            </header>
            <div className="recent-room-grid" id="homeRecentRooms" />
            <button className="secondary-button home-empty-create hidden" id="emptyCreate" type="button">Criar primeira sala</button>
          </section>

          <section className="home-card home-join-card">
            <header>
              <span className="home-card-icon"><Link2 /></span>
              <div><h3>Entrar em uma sala</h3><p>Cole um convite ou abra uma sala salva.</p></div>
            </header>
            <form className="home-join-form" id="homeJoinForm">
              <label htmlFor="homeJoinInput">Link de convite, código ou ID</label>
              <div>
                <input id="homeJoinInput" autoComplete="off" placeholder="Cole aqui para entrar" />
                <button className="primary-button" id="homeJoinButton" type="submit" aria-label="Buscar sala"><ArrowRight /></button>
              </div>
              <p className="home-join-status" id="homeJoinStatus" role="status" />
            </form>
            <div className="home-tip"><strong>Dica</strong><span>Convites abrem uma confirmação antes de adicionar a sala à sua conta.</span></div>
          </section>
        </div>
      </div>
      <div className="media-stage hidden" id="mediaStage">
        <div className="connection-note" id="connectionNote"><i /><span>Conectando à sala…</span><strong id="connectionQuality">Verificando</strong></div>
        <div className="call-stage-status" aria-hidden="true"><Radio /><span>AO VIVO</span></div>
        <div className="media-grid" id="mediaGrid" />
        <div className="gesture-layer" id="gestureLayer" aria-live="polite" />
      </div>
      <MediaControls />
    </section>
  );
}

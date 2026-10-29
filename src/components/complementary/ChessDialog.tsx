import { ArrowLeft, Crown, Flag, Swords } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

const previewPieces: Record<string, string> = {
  a8: "♜", b8: "♞", c8: "♝", d8: "♛", e8: "♚", f8: "♝", g8: "♞", h8: "♜",
  a7: "♟", b7: "♟", c7: "♟", d7: "♟", e7: "♟", f7: "♟", g7: "♟", h7: "♟",
  a2: "♟", b2: "♟", c2: "♟", d2: "♟", e2: "♟", f2: "♟", g2: "♟", h2: "♟",
  a1: "♜", b1: "♞", c1: "♝", d1: "♛", e1: "♚", f1: "♝", g1: "♞", h1: "♜",
};

function PreviewBoard() {
  return <>{Array.from({ length: 64 }, (_, index) => {
    const file = String.fromCharCode(97 + (index % 8));
    const rank = 8 - Math.floor(index / 8);
    const square = `${file}${rank}`;
    const piece = previewPieces[square];
    return <button type="button" className={`chess-square ${(index + Math.floor(index / 8)) % 2 ? "light" : "dark"}`} key={square} tabIndex={-1} aria-hidden="true">
      {piece && <span className={`chess-piece ${rank > 4 ? "black" : "white"}`}>{piece}</span>}
    </button>;
  })}</>;
}

export function ChessDialog() {
  return <div className="modal-backdrop hidden" id="chessModal" data-component="chess-dialog">
    <div className="modal chess-modal complementary-modal">
      <CloseButton modal="chessModal" />
      <SettingsHeading icon={<Crown />} title="Xadrez da sala" description="Desafie alguém da chamada ou acompanhe uma partida ao vivo." />

      <section className="chess-lobby" id="chessLobby">
        <div className="chess-challenge-card">
          <span className="chess-knight" aria-hidden="true">♞</span>
          <div><strong>Nova disputa</strong><small>Você começa com as peças brancas. O convite dura 10 minutos.</small></div>
          <div className="chess-challenge-controls">
            <label htmlFor="chessOpponentSelect">Desafiar</label>
            <select id="chessOpponentSelect"><option value="">Escolha alguém online</option></select>
            <button className="primary-button" id="chessChallengeButton" type="button"><Swords /> Enviar desafio</button>
          </div>
        </div>
        <p className="form-help chess-lobby-status" id="chessLobbyStatus" role="status" />
        <div className="section-title chess-section-title"><strong>Partidas da sala</strong><small>Partidas em andamento podem ser assistidas por todos.</small></div>
        <div className="chess-game-list" id="chessGameList" />
      </section>

      <section className="chess-game-view hidden" id="chessGameView">
        <button className="chess-back" id="chessBackToLobby" type="button"><ArrowLeft /> Partidas da sala</button>
        <div className="chess-player chess-player-black" id="chessBlackPlayer"><span className="chess-player-piece">♚</span><div className="chess-player-copy"><span className="chess-player-color">Pretas</span><strong id="chessBlackName">Pretas</strong><small id="chessBlackStatus">Aguardando</small></div><span className="chess-turn-light" aria-hidden="true" /></div>
        <div className="chess-board-wrap"><div className="chess-board" id="chessBoard" role="grid" aria-label="Tabuleiro de xadrez"><PreviewBoard /></div></div>
        <div className="chess-player chess-player-white" id="chessWhitePlayer"><span className="chess-player-piece">♚</span><div className="chess-player-copy"><span className="chess-player-color">Brancas</span><strong id="chessWhiteName">Brancas</strong><small id="chessWhiteStatus">Aguardando</small></div><span className="chess-turn-light" aria-hidden="true" /></div>
        <div className="chess-game-footer">
          <div className="chess-live-label"><span /> PARTIDA DA SALA</div>
          <div className="chess-status-card"><small>Estado da partida</small><p id="chessGameStatus" role="status">Carregando partida…</p></div>
          <p className="chess-move-hint">Selecione uma peça e depois a casa de destino.</p>
          <label htmlFor="chessPromotionSelect"><span>Promover peão para</span><select id="chessPromotionSelect" defaultValue="q"><option value="q">Dama</option><option value="r">Torre</option><option value="b">Bispo</option><option value="n">Cavalo</option></select></label>
          <button className="secondary-button chess-resign" id="chessResignButton" type="button"><Flag /> Desistir</button>
        </div>
      </section>
    </div>
  </div>;
}

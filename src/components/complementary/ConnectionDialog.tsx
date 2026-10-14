import { Gauge, RefreshCw, ScreenShare, Wifi } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function ConnectionDialog() {
  return <div className="modal-backdrop hidden" id="connectionDetailsModal" data-component="connection-dialog">
    <div className="modal connection-modal complementary-modal">
      <CloseButton modal="connectionDetailsModal" />
      <SettingsHeading icon={<Gauge />} title="Qualidade da chamada" description="Diagnóstico em tempo real desta conexão." />
      <div className="quality-overview" data-quality="checking" id="qualityOverview">
        <span className="quality-orb"><Wifi /></span>
        <div><strong id="qualityTitle">Verificando conexão</strong><small id="qualityDescription">Os dados aparecem quando a mídia começa a circular.</small></div>
      </div>
      <div className="quality-metrics">
        <article><span>Latência</span><strong id="qualityRtt">—</strong></article>
        <article><span>Perda</span><strong id="qualityLoss">—</strong></article>
        <article><span>Variação</span><strong id="qualityJitter">—</strong></article>
        <article><span>Recebimento</span><strong id="qualityBitrate">—</strong></article>
      </div>
      <label className="quality-select" htmlFor="screenQualitySelect"><span><ScreenShare /><b>Qualidade do compartilhamento</b></span>
        <select id="screenQualitySelect" defaultValue="auto"><option value="auto">Automática</option><option value="720">720p · economiza internet</option><option value="1080">1080p · mais definição</option></select>
      </label>
      <p className="device-help" id="connectionTransport">A conexão será analisada durante a chamada.</p>
      <button className="secondary-button full-width" id="retryConnection" type="button"><RefreshCw /> Reconectar agora</button>
    </div>
  </div>;
}

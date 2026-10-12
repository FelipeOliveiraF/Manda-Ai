import { BellRing, Download, Gauge, Headphones, Settings, UserRound } from "lucide-react";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function PreferencesDialog() {
  return <div className="modal-backdrop hidden" id="preferencesModal" data-component="preferences-dialog">
    <div className="modal preferences-modal complementary-modal">
      <CloseButton modal="preferencesModal" />
      <SettingsHeading icon={<Settings />} title="Configurações" description="Deixe o Mostra aí com a sua cara." />
      <div className="preferences-grid">
        <section className="preference-card">
          <span className="preference-icon"><BellRing /></span><div><strong>Sons da chamada</strong><small>Entradas, saídas e compartilhamentos.</small></div>
          <label className="switch"><input id="soundEnabled" type="checkbox" /><span /></label>
          <label className="volume-setting" htmlFor="soundVolume"><span>Volume</span><input id="soundVolume" type="range" min="0" max="100" defaultValue="70" /></label>
        </section>
        <section className="preference-card connection-card">
          <span className="preference-icon"><Gauge /></span><div><strong>Conexão</strong><small id="connectionStatusSummary">Pronta para conversar</small></div><span className="status-pill" id="networkStatus">Online</span>
        </section>
        <button className="preference-action" id="editProfileFromSettings" type="button"><UserRound /><span><strong>Perfil</strong><small>Nome e foto</small></span></button>
        <button className="preference-action" id="openDevicesFromSettings" type="button"><Headphones /><span><strong>Áudio e vídeo</strong><small>Câmera e microfone</small></span></button>
        <button className="preference-action install-action" id="installAppButton" type="button"><Download /><span><strong>Instalar aplicativo</strong><small id="installAppStatus">Verificando disponibilidade…</small></span></button>
      </div>
    </div>
  </div>;
}

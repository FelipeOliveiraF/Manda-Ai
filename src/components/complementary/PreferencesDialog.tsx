import { BellRing, Download, Gauge, Headphones, HeartPulse, Settings, UserRound } from "lucide-react";
import { useState } from "react";
import { applyTheme, getSavedTheme, saveThemePreference, type ThemeId } from "../../services/theme";
import { CloseButton, SettingsHeading } from "./DialogParts";

export function PreferencesDialog() {
  const [theme, setTheme] = useState<ThemeId>(getSavedTheme);
  const chooseTheme = (nextTheme: ThemeId) => {
    applyTheme(nextTheme);
    setTheme(nextTheme);
    saveThemePreference(nextTheme);
  };

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
        <section className="preference-card diagnostics-card">
          <span className="preference-icon"><HeartPulse /></span><div><strong>Ajude a melhorar</strong><small>Enviar diagnósticos técnicos mínimos. Nunca inclui áudio, vídeo ou mensagens.</small></div>
          <label className="switch"><input id="diagnosticsConsent" type="checkbox" aria-label="Compartilhar diagnósticos técnicos" /><span /></label>
        </section>
        <button className="preference-action" id="editProfileFromSettings" type="button"><UserRound /><span><strong>Perfil</strong><small>Nome e foto</small></span></button>
        <button className="preference-action" id="openDevicesFromSettings" type="button"><Headphones /><span><strong>Áudio e vídeo</strong><small>Câmera e microfone</small></span></button>
        <button className="preference-action install-action" id="installAppButton" type="button"><Download /><span><strong>Instalar aplicativo</strong><small id="installAppStatus">Verificando disponibilidade…</small></span></button>
      </div>
      <div className="settings-version"><span className="version-dot" aria-hidden="true" />Mostra aí · Versão 1.17</div>
      <fieldset className="theme-settings" aria-labelledby="themeSettingsTitle">
        <legend id="themeSettingsTitle">Aparência</legend>
        <p>Escolha como o Mostra aí aparece neste dispositivo.</p>
        <div className="theme-options">
          <button type="button" className={`theme-option ${theme === "purple" ? "active" : ""}`} data-theme-choice="purple" aria-pressed={theme === "purple"} onClick={() => chooseTheme("purple")}>
            <span className="theme-preview theme-preview-purple"><i /><i /><i /></span>
            <span><strong>Roxo</strong><small>Vivo e original</small></span><b className="theme-check" aria-hidden="true">✓</b>
          </button>
          <button type="button" className={`theme-option ${theme === "dark" ? "active" : ""}`} data-theme-choice="dark" aria-pressed={theme === "dark"} onClick={() => chooseTheme("dark")}>
            <span className="theme-preview theme-preview-dark"><i /><i /><i /></span>
            <span><strong>Escuro</strong><small>Grafite e branco</small></span><b className="theme-check" aria-hidden="true">✓</b>
          </button>
          <button type="button" className={`theme-option ${theme === "light" ? "active" : ""}`} data-theme-choice="light" aria-pressed={theme === "light"} onClick={() => chooseTheme("light")}>
            <span className="theme-preview theme-preview-light"><i /><i /><i /></span>
            <span><strong>Claro</strong><small>Limpo e leve</small></span><b className="theme-check" aria-hidden="true">✓</b>
          </button>
        </div>
      </fieldset>
    </div>
  </div>;
}

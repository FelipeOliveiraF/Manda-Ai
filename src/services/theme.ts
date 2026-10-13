export type ThemeId = "purple" | "dark" | "light";

const THEME_KEY = "mostra-theme";
const THEMES = new Set<ThemeId>(["purple", "dark", "light"]);

export function getSavedTheme(): ThemeId {
  const saved = localStorage.getItem(THEME_KEY) as ThemeId | null;
  return saved && THEMES.has(saved) ? saved : "purple";
}

export function applyTheme(theme: ThemeId) {
  const selected = THEMES.has(theme) ? theme : "purple";
  document.documentElement.dataset.theme = selected;
  document.documentElement.style.colorScheme = selected === "light" ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", selected === "light" ? "#f6f7fb" : selected === "dark" ? "#090a0c" : "#0b0a12");
  localStorage.setItem(THEME_KEY, selected);
}

export function initializeTheme() {
  applyTheme(getSavedTheme());
}

export function saveThemePreference(theme: ThemeId) {
  window.dispatchEvent(new CustomEvent("mostra:theme-change", { detail: { theme } }));
}

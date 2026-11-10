// Apparence : automatique (selon le téléphone), claire ou sombre. Préférence propre à l’appareil.
export type Theme = "auto" | "light" | "dark";
export const THEME_KEY = "rizq-theme";

export function getTheme(): Theme {
  try { const t = localStorage.getItem(THEME_KEY); return t === "light" || t === "dark" ? t : "auto"; } catch { return "auto"; }
}
export function setTheme(t: Theme) {
  try { if (t === "auto") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, t); } catch { /* indisponible */ }
  applyTheme(t);
}
export function applyTheme(t: Theme) {
  const el = document.documentElement;
  if (t === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", t);
  const dark = t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", dark ? "#150C12" : "#F6F2F4"));
}
/** Script exécuté avant l’affichage, pour éviter un flash de la mauvaise couleur. */
export const THEME_BOOT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

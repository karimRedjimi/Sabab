// Le journal du soir : al-hamdulillâh, un pas vers son besoin, une intention pour demain.
// Rien de tout cela ne compte dans le pourcentage de la journée (choix du porteur du projet).
import { addDays, fromKey, keyOf } from "./dates";
import type { State } from "./state";

export const gratitudeDe = (S: State, dk: string) => (S.gratitude?.[dk] || "").trim();
export const journeeClose = (S: State, dk: string) => !!S.days[dk]?.clos;

/** Toutes les étoiles du ciel : un al-hamdulillâh noté = une étoile, de la plus ancienne à la plus récente. */
export function etoiles(S: State): { dk: string; text: string }[] {
  return Object.entries(S.gratitude || {})
    .filter(([, t]) => t.trim())
    .map(([dk, t]) => ({ dk, text: t.trim() }))
    .sort((a, b) => a.dk.localeCompare(b.dk));
}

/** La place d’une étoile dans le ciel (360 × 220) : une grille qui s’adapte au nombre d’étoiles, légèrement désordonnée. */
export function placeEtoile(i: number, dk: string, n = 40): { x: number; y: number; r: number } {
  const tot = Math.max(1, Math.min(n, 40));
  const cols = Math.min(8, Math.max(1, Math.ceil(Math.sqrt(tot * 1.8)))), rows = Math.max(1, Math.ceil(tot / cols));
  const k = i % 40, col = k % cols, row = Math.floor(k / cols);
  let h = 0;
  for (const c of dk) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const cw = 300 / cols, rh = 170 / rows;
  const jx = ((h % 1000) / 1000 - 0.5) * cw * 0.5, jy = (((h >> 10) % 1000) / 1000 - 0.5) * rh * 0.45;
  // Les rangées impaires vont de droite à gauche : le fil des jours serpente.
  const c2 = row % 2 ? cols - 1 - col : col;
  return { x: 30 + cw * (c2 + 0.5) + jx, y: 25 + rh * (row + 0.5) + jy, r: 7 + (h % 5) };
}

/** L’intention notée la veille, à rappeler aujourd’hui. */
export function intentionDHier(S: State, d: Date): string {
  return (S.days[keyOf(addDays(d, -1))]?.demain || "").trim();
}

/** Un souvenir, une fois par semaine : un al-hamdulillâh d’il y a environ un mois. */
export function souvenir(S: State, d: Date): { dk: string; text: string; jours: number } | null {
  const tk = keyOf(d);
  if (S.souvenirVu && (d.getTime() - fromKey(S.souvenirVu).getTime()) / 86400000 < 7) return null;
  let best: { dk: string; text: string; jours: number } | null = null;
  for (const e of etoiles(S)) {
    if (e.dk >= tk) continue;
    const jours = Math.round((d.getTime() - fromKey(e.dk).getTime()) / 86400000);
    if (jours < 21 || jours > 90) continue;
    if (!best || Math.abs(jours - 30) < Math.abs(best.jours - 30)) best = { ...e, jours };
  }
  return best;
}

/** Les derniers bienfaits notés, pour la page « Patience » et les bilans. */
export const derniersBienfaits = (S: State, n = 3, avant?: string) => etoiles(S).filter((e) => !avant || e.dk <= avant).slice(-n).reverse();

export const GRATITUDE_IDEES = ["La santé", "Ma famille", "Une prière à l’heure", "Un bon repas", "Un sourire reçu", "Un problème réglé"];
export const DEMAIN_IDEES = ["Prier le Fajr à l’heure", "Mes invocations du matin", "Lire le Coran", "Appeler mes parents", "Avancer sur mon besoin"];

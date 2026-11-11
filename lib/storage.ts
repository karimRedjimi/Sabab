// Enregistrement sur l’appareil. Aucune donnée n’est envoyée ailleurs.
import type { State } from "./state";
import { keyOf, today } from "./dates";

export const LS_KEY = "rizq-tracker-v1";

export function loadLocal(): unknown {
  try { const r = localStorage.getItem(LS_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export function saveLocal(S: State) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch { /* stockage indisponible */ }
}
export function clearLocal() {
  try { localStorage.removeItem(LS_KEY); } catch { /* stockage indisponible */ }
}

/** Fichier d’export des données personnelles (format lisible, réimportable). */
export function exportPayload(S: State) {
  return { application: "Sabab", format: 1, exporte_le: new Date().toISOString(), donnees: S };
}
export const exportFileName = () => `sabab-${keyOf(today())}.json`;

/** Lit un fichier d’export (ou un état brut) et renvoie l’état qu’il contient. */
export function parseImport(text: string): unknown {
  const x = JSON.parse(text);
  if (x && typeof x === "object" && "donnees" in x) return (x as { donnees: unknown }).donnees;
  if (x && typeof x === "object" && "days" in x) return x;
  throw new Error("format");
}

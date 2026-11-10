// Apprendre par cœur : révision espacée avec masquage progressif.
import { ITEMS } from "@/content/programme";
import { INTERVALS, MASTER } from "@/content/reglages";
import { keyOf, today, addDays } from "./dates";
import type { State } from "./state";

export const DUA_IDS = Object.keys(ITEMS).filter((id) => ITEMS[id].kind === "dua");
export function dueIds(S: State) { const tk = keyOf(today()); return Object.keys(S.learn).filter((id) => ITEMS[id] && S.learn[id].next <= tk); }

export type MaskPart = { word: string } | { mask: number };
/** Découpe un texte en mots, en masquant une part croissante selon le niveau. */
export function maskText(text: string, lvl: number, isAr: boolean): MaskPart[] {
  const words = text.split(" ");
  return words.map((w, i) => {
    const hide = lvl === 0 ? false : lvl >= 3 ? true : lvl === 2 ? i % 3 !== 0 : i % 3 === 1;
    if (!hide) return { word: w };
    const len = Math.max(2, w.replace(/[ً-ْ،,.;:!?’]/g, "").length);
    return { mask: +(len * (isAr ? 0.42 : 0.5)).toFixed(1) };
  });
}
/** Applique une réponse : retourne true si l’invocation vient d’être sue par cœur. */
export function grade(S: State, id: string, ok: boolean) {
  const L = S.learn[id] || (S.learn[id] = { lvl: 0, next: keyOf(today()) });
  if (ok) {
    L.lvl = Math.min(L.lvl + 1, INTERVALS.length - 1);
    L.next = keyOf(addDays(today(), INTERVALS[L.lvl]));
    if (L.lvl === MASTER) { if (!L.mastered) L.mastered = keyOf(today()); return true; }
  } else { L.lvl = Math.max(L.lvl - 1, 1); L.next = keyOf(addDays(today(), 1)); }
  return false;
}

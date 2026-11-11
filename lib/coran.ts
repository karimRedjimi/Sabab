// Les rappels du Coran : quelques versets par jour, choisis autant que possible selon la situation.
import { EXTRAITS, type Extrait } from "@/content/coran-extraits";
import { VERSETS_GENERAL, VERSETS_THEME } from "@/content/versets";
import { addDays, keyOf } from "./dates";
import { objectiveTag } from "./objective";
import type { State } from "./state";

export type CoranLevel = 1 | 5 | 10;
export const CORAN_LEVELS: { n: CoranLevel; l: string; d: string }[] = [
  { n: 1, l: "Un verset par jour", d: "Un rappel court, pour commencer" },
  { n: 5, l: "Environ 5 versets", d: "Quelques minutes de lecture" },
  { n: 10, l: "Environ 10 versets", d: "Pour ceux qui lisent déjà régulièrement" },
];
export const coranLevel = (S: State): CoranLevel => (S.coranLevel === 5 || S.coranLevel === 10 ? S.coranLevel : 1);

export interface Rappel extends Extrait { ref: string; themed: boolean; tag: string }

const size = (ref: string) => EXTRAITS[ref].verses.length;
const dayNumber = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);

/**
 * Les passages du jour. Le choix est fixe pour une date donnée (on retrouve les mêmes en rouvrant l’application).
 * Trois passages sur quatre viennent du thème de l’objectif quand il en a un ; le reste sont des rappels pour tous.
 */
export function rappelsDuJour(S: State, d: Date): Rappel[] {
  const level = coranLevel(S), cat = S.objective?.cat || "";
  const fit = (l: string[]) => (level === 1 ? l.filter((r) => size(r) === 1) : l);
  const theme = fit(VERSETS_THEME[cat] || []), general = fit(VERSETS_GENERAL).filter((r) => !theme.includes(r));
  const tag = objectiveTag(S), n = dayNumber(d);
  const out: Rappel[] = [], seen = new Set<string>();
  let verses = 0;
  for (let j = 0; verses < level && j < 60; j++) {
    const g = n * level + j, themed = theme.length > 0 && g % 4 !== 3;
    const pool = themed ? theme : general, ref = pool[g % pool.length];
    if (seen.has(ref) || (out.length > 0 && verses + size(ref) > level + 2)) continue;
    seen.add(ref); verses += size(ref);
    out.push({ ...EXTRAITS[ref], ref, themed, tag: themed ? tag : "Rappel" });
  }
  return out;
}

export const versesIn = (l: { verses: unknown[] }[]) => l.reduce((n, r) => n + r.verses.length, 0);

/** « Al-Baqarah, verset 152 » ou « Al-Baqarah, versets 155 à 157 ». */
export const refLabel = (r: Extrait) => `Sourate ${r.name} (${r.s}), ${r.from === r.to ? `verset ${r.from}` : `versets ${r.from} à ${r.to}`}`;

export const coranDone = (S: State, dk: string) => !!S.coran?.[dk];

/** Jours lus et versets lus sur les `days` derniers jours (aujourd’hui compris). */
export function coranStats(S: State, t: Date, days = 7) {
  let read = 0, verses = 0, seconds = 0;
  for (let i = 0; i < days; i++) {
    const r = S.coran?.[keyOf(addDays(t, -i))];
    if (r) { read++; verses += r.n; seconds += r.t || 0; }
  }
  return { read, verses, seconds, days };
}

/** Après une semaine sans manquer, on peut proposer le palier suivant. */
export function suggestNextLevel(S: State, t: Date): CoranLevel | null {
  const level = coranLevel(S);
  if (level === 10 || coranStats(S, t, 7).read < 7) return null;
  return level === 1 ? 5 : 10;
}

// « Un jour, un verset » : le même verset pour toute la communauté, chaque jour.
import { EXTRAITS, type Extrait } from "@/content/coran-extraits";
import { AUDIO_RECITATEUR } from "@/content/versets-audio";
import { dayNumber } from "./coran";

/** Les versets seuls et assez courts pour être récités d’un souffle, dans l’ordre du Coran. */
const MAX_LETTRES = 180;
const SEULS = Object.keys(EXTRAITS).filter((r) => EXTRAITS[r].verses.length === 1 && EXTRAITS[r].verses[0].ar.length <= MAX_LETTRES)
  .sort((a, b) => EXTRAITS[a].s - EXTRAITS[b].s || EXTRAITS[a].from - EXTRAITS[b].from);

export interface VersetDuJour extends Extrait { ref: string; audio: string | null }

/** Le verset du jour : il ne dépend que de la date, pas de la personne. Un pas de 7 évite deux versets voisins de suite. */
export function versetDuJour(d: Date): VersetDuJour {
  const ref = SEULS[(dayNumber(d) * 7) % SEULS.length];
  return { ...EXTRAITS[ref], ref, audio: AUDIO_RECITATEUR.fichiers[ref] || null };
}
export const VERSETS_SEULS = SEULS;

/** Combien de du’â pour les autres on propose chaque jour. */
export const DUA_GOAL = 5;
/** Nombre de du’â faites pour les autres un jour donné. */
export const duasOn = (prayed: Record<string, string> | undefined, dk: string) => Object.values(prayed || {}).filter((v) => v === dk).length;

export const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

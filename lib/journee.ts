// « La journée du Prophète ﷺ » : ce que chaque niveau ajoute à la journée, sans ajouter d’écran.
import { APRES_PRIERE, MATIN_NIVEAU, NIVEAUX, NUIT_NIVEAU, PRIERES, RAWATIB, type NiveauId } from "@/content/journee";
import { addDays, diffDays, fromKey, keyOf } from "./dates";
import { CORAN_AM, CORAN_PM, plan, streaks, type Entry, type Plan } from "./program";
import type { State } from "./state";

export type SalatK = (typeof PRIERES)[number];
export const NIVEAU_MAX: NiveauId = 5;
export const JOURS_POUR_MONTER = 14;

export const niveau = (S: State): NiveauId => (S.prophete?.lvl && S.prophete.lvl >= 1 && S.prophete.lvl <= 5 ? S.prophete.lvl : 1);
export const niveauTitre = (n: NiveauId) => NIVEAUX[n].titre;

const entry = (id: string, m: Entry["m"], sl = 0, opt = false): Entry => ({ id, origin: "socle", m, sl: [sl], opt });

/**
 * Le plan du jour avec ce qu’ajoutent le rappel du Coran et le niveau :
 * le matin et le soir gagnent le rappel du Coran ; le matin et la nuit gagnent les sunna du niveau.
 * (Les jours de minimum, rien n’est ajouté.)
 */
export function planDuJour(S: State, d: Date): Plan {
  const P = plan(S, d);
  if (P.s.light) return P;
  const n = niveau(S), sec = { ...P.sections };
  const matin = MATIN_NIVEAU.filter(([, from]) => n >= from).map(([id]) => entry(id, "matin"));
  sec.matin = [...sec.matin, entry(CORAN_AM, "matin"), ...matin];
  sec.soir = [...sec.soir, entry(CORAN_PM, "soir")];
  sec.nuit = NUIT_NIVEAU.filter(([, from, to]) => n >= from && (!to || n <= to)).map(([id]) => entry(id, "nuit"));
  return { ...P, sections: sec };
}

/** Les invocations après une prière, à lire en lecture guidée (la case de la prière choisie). */
export function apresPriere(S: State, k: SalatK): Entry[] {
  const i = PRIERES.indexOf(k);
  return APRES_PRIERE[niveau(S) >= 2 ? "complet" : "court"].map((id) => entry(id, "jour", i));
}

/** Les unités surérogatoires proposées pour une prière, selon le niveau. */
export function rawatib(S: State, k: SalatK) {
  const n = niveau(S), r = RAWATIB[k] || {};
  const pick = (x?: [string, number, NiveauId]) => (x && n >= x[2] ? { id: x[0], sl: x[1], key: `${x[0]}:${x[1]}` } : null);
  return { avant: pick(r.avant), apres: pick(r.apres) };
}

/** Proposer le niveau suivant : 14 jours tenus d’affilée depuis le début du niveau, et pas mis de côté. */
export function niveauSuivant(S: State, t: Date): NiveauId | null {
  const n = niveau(S);
  if (n >= NIVEAU_MAX) return null;
  const since = S.prophete?.since ? fromKey(S.prophete.since) : S.start ? fromKey(S.start) : t;
  if (diffDays(t, since) < JOURS_POUR_MONTER) return null;
  if (S.prophete?.snooze && S.prophete.snooze > keyOf(t)) return null;
  if (streaks(S).cur < JOURS_POUR_MONTER) return null;
  return (n + 1) as NiveauId;
}

/** Choisir un niveau (et repartir de zéro pour la proposition du suivant). */
export function choisirNiveau(S: State, lvl: NiveauId, t: Date) {
  S.prophete = { lvl, since: keyOf(t) };
}
export function plusTard(S: State, t: Date) {
  S.prophete = { lvl: niveau(S), since: S.prophete?.since || keyOf(t), snooze: keyOf(addDays(t, 7)) };
}

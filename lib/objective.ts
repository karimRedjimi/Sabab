// Le lien entre l’objectif choisi et le programme : discret, mais présent.
import { OBJ_CATS, PARCOURS } from "@/content/programme";
import { diffDays } from "./dates";
import { parcoursDay } from "./program";
import type { State } from "./state";

/** « Pour ton mariage », « Pour tes études »… */
const FOR: Record<string, string> = {
  emploi: "Pour ton emploi", activite: "Pour ton activité", dette: "Pour ta dette", mariage: "Pour ton mariage",
  etudes: "Pour tes études", epreuve: "Pour traverser l’épreuve", autre: "Pour ton objectif",
};
export const objectiveTag = (S: State) => (S.objective && FOR[S.objective.cat]) || "Pour ton objectif";

/** Le parcours qui accompagne l’objectif choisi. */
export const objectiveParcoursId = (S: State) => (S.objective && OBJ_CATS[S.objective.cat]?.p) || null;

/** Le parcours en cours est-il celui de l’objectif ? */
export const parcoursServesObjective = (S: State) => !!S.parcours && S.parcours.id === objectiveParcoursId(S);

/** Affichage du lien avec l’objectif sur la page Jour (réglage, activé par défaut). */
export const showObjective = (S: State) => S.showObjective !== false;

/** Une idée d’action concrète, tirée du parcours de l’objectif (sans répéter le geste du jour). */
export function objectiveIdea(S: State, d: Date): string | null {
  const pid = objectiveParcoursId(S);
  if (!pid || !PARCOURS[pid]) return null;
  const acts = PARCOURS[pid].actions;
  const pday = S.parcours?.id === pid ? parcoursDay(S, d) : 0;
  const n = pday ? pday : diffDays(d, new Date(d.getFullYear(), 0, 1)) + 1;
  return acts[(pday ? n : n - 1) % acts.length];
}

/** Exemple d’action, adapté au domaine de l’objectif. */
const EXAMPLE: Record<string, string> = {
  emploi: "envoyer deux candidatures", activite: "contacter un client potentiel", dette: "rembourser une petite somme",
  mariage: "parler de mon projet à un proche", etudes: "réviser un chapitre sans téléphone", epreuve: "sortir marcher vingt minutes",
  autre: "faire une petite étape concrète",
};
export const actionExample = (S: State) => `Par exemple : ${(S.objective && EXAMPLE[S.objective.cat]) || EXAMPLE.autre}`;

/** Exemple de formulation de l’objectif, selon le domaine. */
const TITLE_EXAMPLE: Record<string, string> = {
  emploi: "trouver un CDI avant l’été", activite: "lancer mon activité cette année", dette: "rembourser mon crédit d’ici un an",
  mariage: "me marier cette année", etudes: "réussir mon examen de juin", epreuve: "retrouver la sérénité", autre: "ce que je demande à Allah",
};
export const titleExample = (cat: string | null) => `Par exemple : ${TITLE_EXAMPLE[cat || "autre"] || TITLE_EXAMPLE.autre}`;

/** Où en est la personne : ajuste le rythme de départ. */
export type Stage = "start" | "lead" | "heavy";
export const STAGES: Record<Stage, { l: string; d: string; ramp: boolean }> = {
  start: { l: "Je commence tout juste", d: "Poser les bases, avec régularité", ramp: true },
  lead: { l: "J’avance déjà", d: "Continuer avec sérénité et discernement", ramp: false },
  heavy: { l: "Ça me pèse beaucoup", d: "On commence en douceur, sans pression", ramp: true },
};

/** Le nom court de l’objectif, dans les mots de la personne. */
export const objectiveName = (S: State) => S.objective?.title || (S.objective && OBJ_CATS[S.objective.cat]?.l) || "";

/** Le parcours de l’objectif est-il arrivé au bout des 40 jours ? */
export function parcoursFinished(S: State, d: Date) {
  if (!parcoursServesObjective(S) || !S.parcours) return false;
  const [y, m, j] = S.parcours.start.split("-").map(Number);
  return diffDays(d, new Date(y, m - 1, j)) >= 40;
}

/** Afficher un mot de patience : objectif ancien, aucune avancée récente, pas vu depuis une semaine. */
export function needsPatience(S: State, d: Date) {
  if (!S.objective) return false;
  const k = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  const since = S.objective.since, dk = k(d);
  const [y, m, j] = since.split("-").map(Number);
  if (diffDays(d, new Date(y, m - 1, j)) < 21) return false;
  const limit = k(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 21));
  if ((S.steps || []).some((s) => s.date >= limit)) return false;
  if (S.carnet.some((c) => c.obj && c.status === "ok")) return false;
  if (S.patienceSeen) { const [a, b, c] = S.patienceSeen.split("-").map(Number); if (diffDays(d, new Date(a, b - 1, c)) < 7) return false; }
  return dk >= since;
}

/**
 * Le geste du parcours et l’action de l’objectif ne font qu’un : « Agir ».
 * Renvoie le geste proposé ce jour-là, ou null si les deux ne sont pas réunis.
 */
export function mergedGesture(S: State, d: Date): string | null {
  if (!S.objective || !parcoursServesObjective(S) || !S.parcours) return null;
  const n = parcoursDay(S, d);
  if (!n) return null;
  const acts = PARCOURS[S.parcours.id].actions;
  return acts[(n - 1) % acts.length];
}

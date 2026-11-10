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

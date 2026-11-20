// Les chiffres du Suivi : une période (7 ou 30 derniers jours) comparée à la précédente.
// Tout est calculé sur l’appareil, rien n’est envoyé.
import { HELD } from "@/content/reglages";
import { coranDone } from "./coran";
import { addDays, diffDays, fromKey, keyOf, today } from "./dates";
import { JOURS_POUR_MONTER, NIVEAU_MAX, niveau, planDuJour } from "./journee";
import { dayPct, entryPct, parcoursDay, streaks, val, type Entry } from "./program";
import { SALAT, SALAT_LABEL, type SalatKey } from "./salat";
import { cycle } from "./cycle";
import type { State } from "./state";

export type Periode = "semaine" | "mois";
export const longueur = (p: Periode) => (p === "semaine" ? 7 : 30);
export const MOMENTS = ["matin", "jour", "soir", "nuit"] as const;
export type MomentK = (typeof MOMENTS)[number];
export const MOMENT_NOM: Record<MomentK, string> = { matin: "Matin", jour: "Journée", soir: "Soir", nuit: "Nuit" };

/** Les jours de la période qui comptent : depuis le début de l’utilisation, jusqu’à aujourd’hui. */
export function joursDe(S: State, fin: Date, n: number): Date[] {
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) { const d = addDays(fin, -i); if (S.start && keyOf(d) >= S.start) out.push(d); }
  return out;
}

export interface PrierePer { k: SalatKey; nom: string; possible: number; heure: number; mosquee: number; qada: number }
/** Chaque prière : combien de fois possible, priée à l’heure, à la mosquée, rattrapée. */
export function parPriere(S: State, a: Date, b: Date, now = new Date()): PrierePer[] {
  return SALAT.map((k) => {
    const st = { k, nom: SALAT_LABEL[k], possible: 0, heure: 0, mosquee: 0, qada: 0 };
    for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
      const dk = keyOf(d), r = S.salat?.[dk]?.[k];
      if (dk > keyOf(now)) break;
      if (r?.s === "ex") continue;
      if (!r && dk === keyOf(now)) continue; // aujourd’hui, une prière non notée n’est pas encore manquée
      st.possible++;
      if (!r) continue;
      if (r.s === "qada") st.qada++; else if (r.m) st.mosquee++; else st.heure++;
    }
    return st;
  });
}
export const faites = (p: PrierePer) => p.heure + p.mosquee + p.qada;

export interface Resume { prieres: number | null; invocations: number | null; coran: { lus: number; jours: number } }
/** Les trois anneaux : prières priées, invocations faites, jours de Coran. */
export function resume(S: State, fin: Date, n: number, now = new Date()): Resume {
  const jours = joursDe(S, fin, n);
  if (!jours.length) return { prieres: null, invocations: null, coran: { lus: 0, jours: 0 } };
  const pp = parPriere(S, jours[0], fin, now), possible = pp.reduce((s, p) => s + p.possible, 0);
  const inv = jours.reduce((s, d) => s + dayPct(S, d), 0) / jours.length;
  return {
    prieres: S.prayer && possible ? pp.reduce((s, p) => s + faites(p), 0) / possible : null,
    invocations: inv,
    coran: { lus: jours.filter((d) => coranDone(S, keyOf(d))).length, jours: jours.length },
  };
}

/** Les moments jour par jour : complet, commencé, rien (ou à venir). */
export type Case = "ok" | "half" | "" | "fut" | "none";
export function grilleMoments(S: State, fin: Date, now = new Date()) {
  const jours = Array.from({ length: 7 }, (_, i) => addDays(fin, i - 6));
  const lignes = MOMENTS.map((m) => {
    let ok = 0, n = 0;
    const cases: Case[] = jours.map((d) => {
      const dk = keyOf(d);
      if (!S.start || dk < S.start) return "none";
      const l: Entry[] = planDuJour(S, d).sections[m].filter((e) => !e.opt);
      if (!l.length) return "none";
      const done = l.filter((e) => entryPct(S, dk, e) >= 1).length, any = l.some((e) => entryPct(S, dk, e) > 0);
      if (done === l.length) { ok++; n++; return "ok"; }
      // Aujourd’hui, un moment pas encore fait n’est pas compté comme manqué.
      if (dk === keyOf(now)) return any ? "half" : "fut";
      n++;
      return any ? "half" : "";
    });
    return { m, cases, ok, n };
  });
  return { jours, lignes: lignes.filter((x) => x.cases.some((c) => c !== "none")) };
}

/** Les 30 derniers jours : niveau de chaque jour, jours tenus, série, record. */
export function regularite(S: State, t = today()) {
  const jours = Array.from({ length: 30 }, (_, i) => addDays(t, i - 29)).map((d) => {
    const dk = keyOf(d), avant = !S.start || dk < S.start;
    return { d, p: avant ? null : dayPct(S, d) };
  });
  const { cur, best } = streaks(S);
  return { jours, tenus: jours.filter((x) => x.p != null && x.p >= HELD).length, comptes: jours.filter((x) => x.p != null).length, serie: cur, record: best };
}

/** Le Coran jour par jour sur 7 jours : versets lus. */
export const coranSemaine = (S: State, fin: Date) => Array.from({ length: 7 }, (_, i) => { const d = addDays(fin, i - 6); return { d, n: S.coran?.[keyOf(d)]?.n || 0 }; });

/** Le parcours de ton besoin : jour, gestes faits, jours où l’invocation du besoin a été faite. */
export function besoin(S: State, t = today()) {
  if (!S.objective || !S.parcours) return null;
  const c = cycle(S, t);
  const jour = parcoursDay(S, t) ? c.jour : 0;
  let gestes = 0, faitsInv = 0, joursInv = 0;
  for (let d = fromKey(S.parcours.start); d <= t; d = addDays(d, 1)) {
    const dk = keyOf(d);
    if (val(S, dk, "pact:0") >= 1) gestes++;
    const l = MOMENTS.flatMap((m) => planDuJour(S, d).sections[m]).filter((e) => e.origin === "parc" && e.id !== "pact" && !e.opt);
    if (!l.length) continue;
    if (dk === keyOf(t) && !l.every((e) => entryPct(S, dk, e) >= 1)) continue;
    joursInv++;
    if (l.every((e) => entryPct(S, dk, e) >= 1)) faitsInv++;
  }
  return { jour, longueur: c.longueur, mois: c.mois, num: c.num, gestes, faitsInv, joursInv };
}

/** Le niveau de la journée du Prophète ﷺ, et les jours tenus vers le suivant. */
export function progresNiveau(S: State, t = today()) {
  const n = niveau(S);
  const since = S.prophete?.since ? fromKey(S.prophete.since) : S.start ? fromKey(S.start) : t;
  const tenus = Math.min(streaks(S).cur, diffDays(t, since) + 1, JOURS_POUR_MONTER);
  return { n, max: NIVEAU_MAX, tenus: Math.max(0, tenus), but: JOURS_POUR_MONTER };
}

/** Une phrase utile sur la période, et éventuellement une action. */
export interface Constat { titre: string; detail?: string; action?: { label: string; href: string } }
export function constat(S: State, fin: Date, n: number, now = new Date()): Constat | null {
  const jours = joursDe(S, fin, n);
  if (jours.length < 3) return null;
  const a = jours[0], pa = addDays(a, -n), pb = addDays(a, -1);
  const pp = S.prayer ? parPriere(S, a, fin, now) : [], prev = S.prayer && S.start && keyOf(pa) >= S.start ? parPriere(S, pa, pb, now) : null;
  const taux = (p: PrierePer) => (p.possible ? faites(p) / p.possible : 1);
  const fragile = [...pp].filter((p) => p.possible >= 2).sort((x, y) => taux(x) - taux(y))[0];
  const rappelOff = fragile && S.notifs?.on && S.notifs.prieres?.[fragile.k] === false;
  const conseil = fragile && taux(fragile) < 0.7
    ? { detail: `Ta prière la plus fragile reste le ${fragile.nom}.${!S.notifs?.on || rappelOff ? ` Active son rappel ?` : ""}`, action: !S.notifs?.on || rappelOff ? { label: "Rappels", href: "/notifications" } : undefined }
    : {};
  // 1. Une prière qui progresse
  // On ne compare qu’à une période où des prières étaient déjà notées.
  if (prev && prev.reduce((x, p) => x + faites(p), 0) >= 5) {
    const mieux = pp.map((p, i) => ({ p, gain: faites(p) - faites(prev[i]) })).filter((x) => x.gain >= 2).sort((x, y) => y.gain - x.gain)[0];
    if (mieux) return { titre: `Ton ${mieux.p.nom} progresse : ${faites(mieux.p)} sur ${mieux.p.possible}, ${mieux.gain} de plus que ${n === 7 ? "la semaine" : "le mois"} d’avant.`, ...(fragile && fragile.k !== mieux.p.k ? conseil : {}) };
  }
  // 2. Une prière fragile
  if (fragile && taux(fragile) < 0.6) return { titre: `Le ${fragile.nom} est ta prière la plus fragile : ${faites(fragile)} sur ${fragile.possible}.`, detail: conseil.detail ? "Un petit pas suffit : vise une fois de plus que la période d’avant." : undefined, action: conseil.action };
  // 3. Le moment qui coince
  const g = grilleMoments(S, fin, now).lignes.filter((l) => l.n >= 3).sort((x, y) => x.ok / x.n - y.ok / y.n)[0];
  if (g && g.ok / g.n < 0.5) return { titre: `${MOMENT_NOM[g.m]} : ${g.ok} sur ${g.n} ces 7 derniers jours.`, detail: g.m === "nuit" ? "Commence par une seule chose la nuit, même courte." : `C’est ton moment le plus fragile. Un rappel peut t’aider.`, action: { label: "Rappels", href: "/notifications" } };
  // 4. Une belle période
  const tenus = jours.filter((d) => dayPct(S, d) >= HELD).length;
  if (tenus >= Math.ceil(jours.length * 0.6)) return { titre: `Belle régularité : ${tenus} jours tenus sur ${jours.length}, mâ shâ’ Allâh.`, detail: "Qu’Allah t’accorde la constance." };
  return null;
}

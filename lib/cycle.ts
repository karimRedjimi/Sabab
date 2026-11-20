// Les cycles : un cycle = un mois lunaire (calendrier Umm al-Qura, celui qu’affiche déjà l’application).
// Chaque cycle se termine par un bilan et une seule décision de niveau ; avant Ramadan, un récapitulatif de l’année.
import { HELD } from "@/content/reglages";
import { addDays, fromKey, keyOf } from "./dates";
import { NIVEAU_MAX, niveau } from "./journee";
import { dayPct, val } from "./program";
import type { State } from "./state";

const FMT_NUM = (() => { try { return new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }); } catch { return null; } })();
const FMT_MOIS = (() => { try { return new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", { month: "long" }); } catch { return null; } })();

export interface Hijri { j: number; m: number; a: number }
/** La date hégirienne d’un jour (jour, mois 1 à 12, année). */
export function hijri(d: Date): Hijri {
  if (!FMT_NUM) return { j: d.getDate(), m: d.getMonth() + 1, a: d.getFullYear() };
  const p = FMT_NUM.formatToParts(d), v = (t: string) => Number(p.find((x) => x.type === t)?.value || 0);
  return { j: v("day"), m: v("month"), a: v("year") };
}
const NOMS = ["Mouharram", "Safar", "Rabi‘ al-awwal", "Rabi‘ ath-thani", "Joumada al-oula", "Joumada ath-thania", "Rajab", "Cha‘ban", "Ramadan", "Chawwal", "Dhou al-Qi‘da", "Dhou al-Hijja"];
/** Le nom du mois lunaire, en français. */
export const nomMois = (m: number) => NOMS[(m - 1 + 12) % 12];
export const RAMADAN = 9, CHABAN = 8;

const midi = (d: Date) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
/** Le premier jour du mois lunaire qui contient ce jour. */
export function debutMois(d: Date): Date { return addDays(midi(d), 1 - hijri(midi(d)).j); }
/** Le nombre de jours du mois lunaire (29 ou 30). */
export function longueurMois(d: Date): number { const a = debutMois(d); return hijri(addDays(a, 29)).j === 1 ? 29 : 30; }
export const cleMois = (d: Date) => { const h = hijri(midi(d)); return `${h.a}-${String(h.m).padStart(2, "0")}`; };

export interface Cycle { cle: string; num: number; mois: string; m: number; annee: number; jour: number; longueur: number; debut: Date; fin: Date }
/** Le cycle en cours : le mois lunaire, son numéro depuis le début de l’utilisation, le jour du cycle. */
export function cycle(S: State, d: Date): Cycle {
  const h = hijri(midi(d)), debut = debutMois(d), longueur = longueurMois(d);
  let num = 1;
  if (S.start) {
    const s = hijri(midi(fromKey(S.start)));
    num = Math.max(1, (h.a - s.a) * 12 + (h.m - s.m) + 1);
  }
  return { cle: cleMois(d), num, mois: nomMois(h.m), m: h.m, annee: h.a, jour: h.j, longueur, debut, fin: addDays(debut, longueur - 1) };
}
/** Le cycle précédent (celui du mois lunaire d’avant). */
export const cyclePrecedent = (S: State, d: Date) => cycle(S, addDays(debutMois(d), -1));

export interface BilanCycle { jours: number; tenus: number; fajr: number; gestes: number; bienfaits: number; versets: number; sues: number }
/** Le bilan d’un cycle, de son premier jour à `jusqua` (inclus). */
export function bilanCycle(S: State, c: Cycle, jusqua: Date = c.fin): BilanCycle {
  const b: BilanCycle = { jours: 0, tenus: 0, fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 };
  const a = keyOf(c.debut), z = keyOf(jusqua < c.fin ? jusqua : c.fin);
  for (let d = new Date(c.debut); keyOf(d) <= z; d = addDays(d, 1)) {
    const dk = keyOf(d);
    if (S.start && dk < S.start) continue;
    b.jours++;
    if (dayPct(S, d) >= HELD) b.tenus++;
    if (S.salat?.[dk]?.fajr?.s === "on") b.fajr++;
    if (val(S, dk, "pact:0") >= 1) b.gestes++;
    if ((S.gratitude?.[dk] || "").trim()) b.bienfaits++;
    b.versets += S.coran?.[dk]?.n || 0;
  }
  b.sues = Object.values(S.learn || {}).filter((l) => l.mastered && l.mastered >= a && l.mastered <= z).length;
  return b;
}

/** Une seule décision de niveau par cycle : monter (20 jours tenus ou plus), alléger (moins de 10), sinon rester. */
export const SEUIL_MONTER = 20, SEUIL_ALLEGER = 10;
export function decisionNiveau(S: State, b: BilanCycle): "monter" | "alleger" | null {
  const n = niveau(S);
  if (b.tenus >= SEUIL_MONTER && n < NIVEAU_MAX) return "monter";
  // On ne propose d’alléger qu’à quelqu’un qui a vraiment utilisé l’application ce mois-là.
  if (b.jours >= 20 && b.tenus < SEUIL_ALLEGER && n > 1) return "alleger";
  return null;
}

/** Le bilan du cycle précédent est à montrer : un nouveau mois lunaire a commencé, et il n’a pas encore été vu. */
export function bilanAMontrer(S: State, d: Date): Cycle | null {
  if (!S.start) return null;
  const p = cyclePrecedent(S, d);
  if (keyOf(p.fin) < S.start) return null;
  if (S.cycles?.[p.cle]?.vu) return null;
  // Seulement pendant les 10 premiers jours du nouveau mois.
  if (hijri(midi(d)).j > 10) return null;
  return p;
}

/** Le récap de l’année : les 10 derniers jours de Cha‘ban, une fois par année hégirienne. */
export function recapAMontrer(S: State, d: Date): number | null {
  if (!S.start) return null;
  const h = hijri(midi(d));
  if (h.m !== CHABAN || h.j < 20) return null;
  if (S.recaps?.[h.a]) return null;
  return h.a;
}

export interface RecapAnnee { prieres: number; fajrDebut: number; fajrFin: number; niveau: number; versets: number; sues: number; exauces: number; bienfaits: number; mois: { cle: string; nom: string; etoiles: string[] }[] }
/** L’année hégirienne jusqu’à aujourd’hui (de Mouharram à Cha‘ban) : chiffres privés et constellations des mois. */
export function recapAnnee(S: State, annee: number, d: Date): RecapAnnee {
  const r: RecapAnnee = { prieres: 0, fajrDebut: 0, fajrFin: 0, niveau: niveau(S), versets: 0, sues: 0, exauces: 0, bienfaits: 0, mois: [] };
  const mois: Record<string, { cle: string; nom: string; etoiles: string[] }> = {};
  for (let m = 1; m <= CHABAN; m++) { const cle = `${annee}-${String(m).padStart(2, "0")}`; mois[cle] = { cle, nom: nomMois(m), etoiles: [] }; }
  const fajrParMois: Record<string, { on: number; n: number }> = {};
  let debutAnnee: string | null = null;
  for (let x = new Date(midi(d)), i = 0; i < 400; i++, x = addDays(x, -1)) {
    const h = hijri(x);
    if (h.a < annee) break;
    const dk = keyOf(x), cle = cleMois(x);
    if (S.start && dk < S.start) break;
    debutAnnee = dk;
    const s = S.salat?.[dk] || {};
    for (const k of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const) if (s[k] && s[k]!.s !== "ex") r.prieres++;
    const fm = (fajrParMois[cle] ||= { on: 0, n: 0 }); fm.n++; if (s.fajr?.s === "on") fm.on++;
    r.versets += S.coran?.[dk]?.n || 0;
    if ((S.gratitude?.[dk] || "").trim()) { r.bienfaits++; mois[cle]?.etoiles.unshift(dk); }
  }
  // Le Fajr : le premier mois comparé au mois en cours, sur 30 jours.
  const cles = Object.keys(fajrParMois).sort();
  if (cles.length) { const a = fajrParMois[cles[0]], b = fajrParMois[cles[cles.length - 1]]; r.fajrDebut = Math.round((a.on / a.n) * 30); r.fajrFin = Math.round((b.on / b.n) * 30); }
  if (debutAnnee) {
    r.sues = Object.values(S.learn || {}).filter((l) => l.mastered && l.mastered >= debutAnnee!).length;
    r.exauces = S.carnet.filter((c) => c.status === "ok" && c.answered && c.answered >= debutAnnee!).length;
  }
  r.mois = Object.values(mois);
  return r;
}

// Les cycles : 30 jours, comptés depuis le début d’utilisation, qui s’enchaînent sans fin.
// Seule exception : Ramadan. Quand il commence, le cycle en cours se clôt, et Ramadan devient un cycle à part entière ;
// après l’Aïd, les cycles de 30 jours repartent. Chaque cycle se termine par un bilan et une seule décision de niveau.
import { HELD } from "@/content/reglages";
import { addDays, diffDays, fromKey, keyOf } from "./dates";
import { NIVEAU_MAX, niveau } from "./journee";
import { dayPct, val } from "./program";
import type { State } from "./state";

export const LONGUEUR_CYCLE = 30;

// ---------- Le calendrier hégirien (Umm al-Qura, celui qu’affiche déjà l’application) ----------
const FMT_NUM = (() => { try { return new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", { day: "numeric", month: "numeric", year: "numeric" }); } catch { return null; } })();
export interface Hijri { j: number; m: number; a: number }
const memo = new Map<string, Hijri>();
/** La date hégirienne d’un jour (jour, mois 1 à 12, année). */
export function hijri(d: Date): Hijri {
  const k = keyOf(d), m = memo.get(k);
  if (m) return m;
  let h: Hijri = { j: d.getDate(), m: d.getMonth() + 1, a: d.getFullYear() };
  if (FMT_NUM) { const p = FMT_NUM.formatToParts(midi(d)), v = (t: string) => Number(p.find((x) => x.type === t)?.value || 0); h = { j: v("day"), m: v("month"), a: v("year") }; }
  memo.set(k, h);
  return h;
}
const NOMS = ["Mouharram", "Safar", "Rabi‘ al-awwal", "Rabi‘ ath-thani", "Joumada al-oula", "Joumada ath-thania", "Rajab", "Cha‘ban", "Ramadan", "Chawwal", "Dhou al-Qi‘da", "Dhou al-Hijja"];
export const nomMois = (m: number) => NOMS[(m - 1 + 12) % 12];
export const RAMADAN = 9, CHABAN = 8;
const midi = (d: Date) => { const x = new Date(d); x.setHours(12, 0, 0, 0); return x; };
const estRamadan = (d: Date) => hijri(d).m === RAMADAN;
/** Le dernier jour du Ramadan qui contient ce jour. */
function finRamadan(d: Date) { let x = midi(d); while (estRamadan(addDays(x, 1))) x = addDays(x, 1); return x; }

// ---------- Les cycles ----------
export interface Cycle { cle: string; num: number; nom: string; ramadan: boolean; jour: number; longueur: number; debut: Date; fin: Date; periode: string }
const court = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

/** Tous les cycles depuis le début d’utilisation, jusqu’à celui qui contient `jusqua`. */
export function cycles(S: State, jusqua: Date): Cycle[] {
  const out: Cycle[] = [];
  let cur = midi(S.start ? fromKey(S.start) : jusqua), num = 1, nr = 0;
  const z = midi(jusqua);
  while (cur <= z && out.length < 600) {
    let fin: Date, ramadan = false;
    if (estRamadan(cur)) { fin = finRamadan(cur); ramadan = true; }
    else {
      fin = addDays(cur, LONGUEUR_CYCLE - 1);
      // Ramadan coupe le cycle en cours : il se clôt la veille.
      for (let x = addDays(cur, 1); x <= fin; x = addDays(x, 1)) if (estRamadan(x)) { fin = addDays(x, -1); break; }
    }
    const longueur = diffDays(fin, cur) + 1;
    const nom = ramadan ? `Ramadan ${hijri(cur).a}` : `Cycle ${num - nr}`;
    if (ramadan) nr++;
    out.push({ cle: keyOf(cur), num, nom, ramadan, jour: 0, longueur, debut: cur, fin, periode: `du ${court(cur)} au ${court(fin)}` });
    cur = addDays(fin, 1); num++;
  }
  return out;
}
/** Le cycle qui contient ce jour (avec le jour du cycle). */
export function cycle(S: State, d: Date): Cycle {
  const l = cycles(S, d), c = l[l.length - 1] || { cle: keyOf(d), num: 1, nom: "Cycle 1", ramadan: false, jour: 1, longueur: LONGUEUR_CYCLE, debut: midi(d), fin: addDays(midi(d), LONGUEUR_CYCLE - 1), periode: "" };
  return { ...c, jour: diffDays(midi(d), c.debut) + 1 };
}
/** Le cycle précédent. */
export function cyclePrecedent(S: State, d: Date): Cycle | null {
  const c = cycle(S, d);
  if (S.start && keyOf(c.debut) <= S.start) return null;
  return cycle(S, addDays(c.debut, -1));
}
/** La clé du cycle qui contient un jour donné (pour ranger les étoiles). */
export function cleCycle(S: State, dk: string): string { return cycle(S, fromKey(dk)).cle; }

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

/**
 * Une seule décision de niveau par cycle, en proportion de sa durée :
 * monter à partir de deux tiers des jours tenus (20 sur 30), alléger sous un tiers (10 sur 30), sinon rester.
 * Jamais de décision sur un cycle de moins de 15 jours (un cycle coupé par Ramadan, par exemple).
 */
export const MIN_JOURS_DECISION = 15;
export function decisionNiveau(S: State, b: BilanCycle): "monter" | "alleger" | null {
  const n = niveau(S);
  if (b.jours < MIN_JOURS_DECISION) return null;
  if (b.tenus >= Math.ceil((b.jours * 2) / 3) && n < NIVEAU_MAX) return "monter";
  if (b.tenus < Math.floor(b.jours / 3) && n > 1) return "alleger";
  return null;
}

/** Le bilan du cycle précédent est à montrer : pendant les 10 premiers jours du cycle suivant, une seule fois. */
export function bilanAMontrer(S: State, d: Date): Cycle | null {
  if (!S.start) return null;
  const c = cycle(S, d);
  if (c.jour > 10) return null;
  const p = cyclePrecedent(S, d);
  if (!p || S.cycles?.[p.cle]?.vu) return null;
  return p;
}

/** Le récap de l’année : les 10 derniers jours de Cha‘ban, une fois par année hégirienne. */
export function recapAMontrer(S: State, d: Date): number | null {
  if (!S.start) return null;
  const h = hijri(d);
  if (h.m !== CHABAN || h.j < 20) return null;
  if (S.recaps?.[h.a]) return null;
  return h.a;
}

export interface RecapAnnee { prieres: number; fajrDebut: number; fajrFin: number; niveau: number; versets: number; sues: number; exauces: number; bienfaits: number; cycles: Cycle[] }
/** L’année hégirienne jusqu’à aujourd’hui (de Mouharram à Cha‘ban) : chiffres privés et les cycles de l’année. */
export function recapAnnee(S: State, annee: number, d: Date): RecapAnnee {
  const r: RecapAnnee = { prieres: 0, fajrDebut: 0, fajrFin: 0, niveau: niveau(S), versets: 0, sues: 0, exauces: 0, bienfaits: 0, cycles: [] };
  let debutAnnee: string | null = null;
  for (let x = midi(d), i = 0; i < 400; i++, x = addDays(x, -1)) {
    if (hijri(x).a < annee) break;
    const dk = keyOf(x);
    if (S.start && dk < S.start) break;
    debutAnnee = dk;
    const s = S.salat?.[dk] || {};
    for (const k of ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const) if (s[k] && s[k]!.s !== "ex") r.prieres++;
    r.versets += S.coran?.[dk]?.n || 0;
    if ((S.gratitude?.[dk] || "").trim()) r.bienfaits++;
  }
  if (debutAnnee) {
    r.cycles = cycles(S, d).filter((c) => keyOf(c.fin) >= debutAnnee!);
    // Le Fajr : le premier cycle de l’année comparé au cycle en cours, ramené sur 30 jours.
    const parCycle = (c: Cycle) => { const b = bilanCycle(S, c, d); return b.jours ? Math.round((b.fajr / b.jours) * 30) : 0; };
    if (r.cycles.length) { r.fajrDebut = parCycle(r.cycles[0]); r.fajrFin = parCycle(r.cycles[r.cycles.length - 1]); }
    r.sues = Object.values(S.learn || {}).filter((l) => l.mastered && l.mastered >= debutAnnee!).length;
    r.exauces = S.carnet.filter((c) => c.status === "ok" && c.answered && c.answered >= debutAnnee!).length;
  }
  return r;
}

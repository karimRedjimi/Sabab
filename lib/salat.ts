// Suivi des cinq prières : quand, où, et la progression dans le temps.
import { addDays, keyOf } from "./dates";
import { prayerTimes } from "./prayer";
import type { State } from "./state";

export const SALAT = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type SalatKey = (typeof SALAT)[number];
export const SALAT_LABEL: Record<SalatKey, string> = { fajr: "Fajr", dhuhr: "Dhuhr", asr: "ʿAsr", maghrib: "Maghreb", isha: "ʿIchâ" };

/** « on » : priée dans son temps · « qada » : rattrapée · « ex » : non concerné(e) ce jour-là. */
export interface SalatRec { s: "on" | "qada" | "ex"; t?: number; m?: boolean }

export const salatOf = (S: State, dk: string, k: SalatKey): SalatRec | undefined => S.salat?.[dk]?.[k];
export const dayExempt = (S: State, dk: string) => SALAT.every((k) => S.salat?.[dk]?.[k]?.s === "ex");

/** Minutes depuis minuit de l’appel à la prière, selon la ville choisie. */
export function adhanMinutes(S: State, d: Date, k: SalatKey): number | null {
  const pt = prayerTimes(d, S.prayer);
  if (!pt) return null;
  return Math.round(pt[k] * 60);
}

/** Fin du temps d’une prière, en minutes depuis minuit (le Fajr finit au lever du soleil). */
export function windowEnd(S: State, d: Date, k: SalatKey): number | null {
  const pt = prayerTimes(d, S.prayer);
  if (!pt) return null;
  const end = { fajr: pt.sunrise, dhuhr: pt.asr, asr: pt.maghrib, maghrib: pt.isha, isha: 24 }[k];
  return Math.round(end * 60);
}

/** Délai entre l’appel et la prière notée, en minutes (null si inconnu). */
export function delayOf(S: State, d: Date, k: SalatKey, rec?: SalatRec): number | null {
  if (!rec || rec.s !== "on" || rec.t == null) return null;
  const a = adhanMinutes(S, d, k);
  if (a == null) return null;
  let dl = rec.t - a;
  if (dl < -720) dl += 1440; // ʿIchâ priée après minuit
  return Math.max(0, dl);
}

export function fmtDelay(min: number) {
  if (min < 1) return "à l’appel";
  if (min < 60) return `${min} min après l’appel`;
  const h = Math.floor(min / 60), m = min % 60;
  return `${h} h${m ? ` ${String(m).padStart(2, "0")}` : ""} après l’appel`;
}
export const fmtMinutes = (t: number) => `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;

export interface SalatStats { possible: number; noted: number; onTime: number; qada: number; mosque: number; avgDelay: number | null; days: number }

/** Statistiques sur une période (bornes incluses), jusqu’à aujourd’hui. */
export function salatStats(S: State, a: Date, b: Date, now = new Date()): SalatStats {
  const st: SalatStats = { possible: 0, noted: 0, onTime: 0, qada: 0, mosque: 0, avgDelay: null, days: 0 };
  let sum = 0, n = 0;
  const nowMin = now.getHours() * 60 + now.getMinutes(), tk = keyOf(now);
  for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
    const dk = keyOf(d);
    if (dk > tk) break;
    st.days++;
    for (const k of SALAT) {
      const r = salatOf(S, dk, k);
      if (r?.s === "ex") continue;
      // Aujourd’hui, seules les prières dont l’heure est passée comptent.
      if (dk === tk && !r) { const am = adhanMinutes(S, d, k); if (am == null || am > nowMin) continue; }
      st.possible++;
      if (!r) continue;
      st.noted++;
      if (r.s === "on") st.onTime++; else st.qada++;
      if (r.m) st.mosque++;
      const dl = delayOf(S, d, k, r);
      if (dl != null) { sum += dl; n++; }
    }
  }
  st.avgDelay = n ? Math.round(sum / n) : null;
  return st;
}

/** Le Fajr est-il passé sans être noté ce matin ? (rappel doux, jusqu’au Dhuhr) */
export function fajrForgotten(S: State, now = new Date()): boolean {
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const dk = keyOf(d), pt = prayerTimes(d, S.prayer);
  if (!pt || salatOf(S, dk, "fajr") || dayExempt(S, dk)) return false;
  const h = now.getHours() + now.getMinutes() / 60;
  return h > pt.sunrise && h < pt.dhuhr;
}

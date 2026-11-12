// Modèle d’une journée : ce que contient le programme d’un jour et comment on le compte.
import { ITEMS, SOCLE, MINIMUM, RAMP1, MOMENT_OF, DAYS, PARCOURS, PARCOURS_DAYS } from "@/content/programme";
import { JOURNEE_ITEMS } from "@/content/journee";
import { HELD } from "@/content/reglages";
import type { Item, Slot } from "@/content/types";
import { keyOf, fromKey, addDays, today, diffDays, sameDay } from "./dates";
import { prayerTimes, hm } from "./prayer";
import type { State } from "./state";

/** Le rappel du Coran, lu le matin et le soir : suivi à part, hors pourcentage des invocations. */
export const CORAN_AM = "coranM", CORAN_PM = "coranS";
export type Moment = "matin" | "jour" | "soir" | "nuit" | "actions";
export const MOMENT_LABEL: Record<Moment, string> = { matin: "Le matin", jour: "Dans la journée", soir: "Le soir", nuit: "La nuit", actions: "Mes actions" };

export interface Structure { socle: string[]; theme: string[]; parc: string[]; obj: boolean; pday: number; light: boolean; ramp: number }
export type ViewItem = Item | { kind: "objective"; title: string; task?: boolean; moment?: string; desc?: string; optional?: boolean; grade?: undefined; when?: undefined; ar?: undefined; ph?: undefined; fr?: undefined; src?: undefined; note?: undefined; verif?: undefined };

export function parcoursDay(S: State, d: Date) {
  if (!S.parcours || !PARCOURS[S.parcours.id]) return 0;
  const n = diffDays(d, fromKey(S.parcours.start)) + 1;
  return n >= 1 && n <= PARCOURS_DAYS ? n : 0;
}
export const hasObjective = (S: State, d: Date) => !!(S.objective && keyOf(d) >= S.objective.since);
export function rampWeek(S: State, d: Date) {
  if (!S.rampStart) return 0;
  const k = keyOf(d);
  if (k < S.rampStart || (S.rampDone && k >= S.rampDone)) return 0;
  const n = diffDays(d, fromKey(S.rampStart));
  return n < 7 ? 1 : n < 14 ? 2 : 0;
}
export const isLight = (S: State, d: Date) => !!S.days[keyOf(d)]?.light;

export function structure(S: State, d: Date): Structure {
  const n = parcoursDay(S, d);
  if (isLight(S, d)) return { socle: MINIMUM.slice(), theme: [], parc: [], obj: false, pday: n, light: true, ramp: 0 };
  const ramp = rampWeek(S, d);
  const socle = ramp === 1 ? RAMP1.slice() : SOCLE.slice();
  const theme = ramp ? [] : DAYS[d.getDay()].items.slice();
  const seen = new Set([...socle, ...theme]);
  const parc: string[] = [];
  if (n && S.parcours) {
    const du = PARCOURS[S.parcours.id].duas;
    for (let i = 0; i < du.length; i++) { const id = du[(n - 1 + i) % du.length]; if (!seen.has(id)) { parc.push(id); break; } }
    parc.push("pact");
  }
  return { socle, theme, parc, obj: hasObjective(S, d), pday: n, light: false, ramp };
}
export function isOptional(id: string, s: Structure) {
  const it = ITEMS[id];
  return !!(it && (it.optional || (it.task && s.parc.includes("pact"))));
}
export function countable(S: State, d: Date) {
  const s = structure(S, d);
  const ids = [...s.socle, ...s.theme, ...s.parc].filter((id) => !isOptional(id, s));
  // L’action du jour ne compte plus dans le pourcentage : elle se note dans « Mon chemin » (choix du porteur du projet).
  return ids;
}
export function getItem(S: State, id: string, d: Date | null): ViewItem {
  if (id === "obj") return { kind: "objective", title: "Mon objectif" };
  if (id === CORAN_AM || id === CORAN_PM) return { kind: "objective", title: "Rappel du Coran" };
  if (id === "pact" && S.parcours) {
    const p = PARCOURS[S.parcours.id], n = (d && parcoursDay(S, d)) || 1;
    return { kind: "action", task: true, title: "Le geste du parcours", moment: `${p.title}, jour ${n} sur ${PARCOURS_DAYS}`, desc: p.actions[(n - 1) % p.actions.length] };
  }
  return ITEMS[id] || JOURNEE_ITEMS[id];
}
export const slotsOf = (id: string): Slot[] => ITEMS[id]?.slots || JOURNEE_ITEMS[id]?.slots || [{ l: "Fait", t: 1 }];
export const val = (S: State, dk: string, k: string) => S.days[dk]?.c?.[k] || 0;
export function itemPct(S: State, dk: string, id: string) {
  const sl = slotsOf(id);
  return sl.reduce((a, s, i) => a + Math.min(val(S, dk, `${id}:${i}`) / s.t, 1), 0) / sl.length;
}
export function dayPct(S: State, d: Date) {
  const dk = keyOf(d);
  if (!S.days[dk]) return 0;
  const ids = countable(S, d);
  return ids.reduce((a, id) => a + itemPct(S, dk, id), 0) / ids.length;
}
export function streaks(S: State) {
  const t = today();
  let cur = 0, d = new Date(t);
  if (dayPct(S, d) < HELD) d = addDays(d, -1);
  while (dayPct(S, d) >= HELD) { cur++; d = addDays(d, -1); }
  let best = 0, run = 0;
  if (S.start) for (let x = fromKey(S.start); x <= t; x = addDays(x, 1)) { if (dayPct(S, x) >= HELD) { run++; best = Math.max(best, run); } else run = 0; }
  return { cur, best: Math.max(best, cur) };
}

/* ---------- La journée par moments ---------- */
export type Origin = "socle" | "theme" | "parc" | "obj";
export interface Entry { id: string; origin: Origin; m: Moment; sl: number[]; opt: boolean }
export interface Plan { s: Structure; sections: Record<"matin" | "jour" | "soir" | "nuit", Entry[]>; actions: Entry[] }

export function plan(S: State, d: Date): Plan {
  const s = structure(S, d), out: Plan = { s, sections: { matin: [], jour: [], soir: [], nuit: [] }, actions: [] };
  const origin: Record<string, Origin> = {};
  s.socle.forEach((i) => (origin[i] = "socle")); s.theme.forEach((i) => (origin[i] = "theme")); s.parc.forEach((i) => (origin[i] = "parc"));
  if (s.obj) out.actions.push({ id: "obj", origin: "obj", m: "actions", sl: [0], opt: false });
  const tasks: Entry[] = [];
  for (const id of [...s.socle, ...s.theme, ...s.parc]) {
    const it = getItem(S, id, d), opt = isOptional(id, s);
    if (it.task) { tasks.push({ id, origin: origin[id], m: "actions", sl: [0], opt }); continue; }
    const sl = slotsOf(id);
    if (sl.length === 2 && sl[0].l === "Matin" && sl[1].l === "Soir") {
      out.sections.matin.push({ id, origin: origin[id], m: "matin", sl: [0], opt });
      out.sections.soir.push({ id, origin: origin[id], m: "soir", sl: [1], opt });
    } else {
      const m = MOMENT_OF[id] || "jour";
      out.sections[m].push({ id, origin: origin[id], m, sl: sl.map((_, i) => i), opt });
    }
  }
  tasks.sort((a, b) => (a.id === "pact" ? -1 : 0) - (b.id === "pact" ? -1 : 0));
  out.actions.push(...tasks);
  return out;
}
export function entryPct(S: State, dk: string, e: Entry) {
  const sl = slotsOf(e.id);
  return e.sl.reduce((a, i) => a + Math.min(val(S, dk, `${e.id}:${i}`) / sl[i].t, 1), 0) / e.sl.length;
}
export function secCount(S: State, list: Entry[], dk: string) {
  const req = list.filter((e) => !e.opt);
  return { done: req.filter((e) => entryPct(S, dk, e) >= 1).length, total: req.length };
}
export function currentMoment(S: State, d: Date, now = new Date()): Moment | null {
  if (!sameDay(d, today())) return null;
  const h = now.getHours() + now.getMinutes() / 60, pt = prayerTimes(d, S.prayer);
  if (pt) return h < pt.dhuhr ? "matin" : h >= pt.asr ? "soir" : "jour";
  return h < 12 ? "matin" : h < 16 ? "jour" : "soir";
}
export function momentSub(S: State, m: Moment, d: Date) {
  const pt = prayerTimes(d, S.prayer);
  if (m === "matin") return pt ? `Après le Fajr, ${hm(pt.fajr)}` : "Après la prière du Fajr";
  if (m === "soir") return pt ? `De ${hm(pt.asr)} au Maghreb, ${hm(pt.maghrib)}` : "Après le ʿAsr";
  if (m === "nuit") return pt ? `Après le ʿIchâ, ${hm(pt.isha)}` : "Après le ʿIchâ";
  if (m === "actions") return "L’effort qui accompagne l’invocation";
  return "Quand tu veux, au fil de la journée";
}
export function momentOf(S: State, it: ViewItem, d: Date | null) {
  let m = it.moment || "";
  const pt = d ? prayerTimes(d, S.prayer) : null;
  if (pt && it.when === "fajr") m += ` (${hm(pt.fajr)})`;
  if (pt && it.when === "lastHour") m = `De ${hm(pt.maghrib - 1)} à ${hm(pt.maghrib)}`;
  return m;
}
/** La ligne « prochaine étape » : ce qui reste et par où continuer. */
export function nextStep(S: State, d: Date, P: Plan, now = new Date()) {
  const dk = keyOf(d), cur = currentMoment(S, d, now) || "matin";
  const order: Moment[] = [cur, ...(["matin", "jour", "soir", "actions"] as Moment[]).filter((m) => m !== cur)];
  const all: Record<Moment, Entry[]> = { ...P.sections, actions: P.actions };
  let remaining = 0, next: Entry | null = null;
  for (const m of order) for (const e of all[m]) { if (e.opt) continue; if (entryPct(S, dk, e) < 1) { remaining++; if (!next) next = e; } }
  if (!next) return { remaining: 0 as const, next: null };
  const it = getItem(S, next.id, d), pt = prayerTimes(d, S.prayer), h = now.getHours() + now.getMinutes() / 60;
  let hint = MOMENT_LABEL[next.m].toLowerCase();
  if (next.m === "soir" && pt && h < pt.asr) hint = `le soir, à partir de ${hm(pt.asr)}`;
  const title = next.id === "obj" ? "l’action de ton objectif" : it.title;
  return { remaining, next, title, hint };
}
export const cardId = (e: { id: string; m: string }) => (e.id === "obj" ? "card-obj" : `card-${e.id}-${e.m}`);

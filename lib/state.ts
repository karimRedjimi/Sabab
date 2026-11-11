import { SOCLE } from "@/content/programme";
import { keyOf, today } from "./dates";

export interface Prayer { city: string; lat: number; lng: number; method: string }
export interface DayRec { c: Record<string, number>; note: string; objAct?: string; light?: boolean }
export interface Objective { title: string; cat: string; why: string; since: string; stage?: "start" | "lead" | "heavy" }
export interface CarnetEntry { id: string; text: string; date: string; status: "wait" | "ok"; answered?: string; how?: string; shared?: boolean; obj?: boolean }
export interface LearnRec { lvl: number; next: string; mastered?: string }
export type Show = { ar: boolean; ph: boolean; fr: boolean };

export interface State {
  v: number;
  updated: number;
  start: string | null;
  show: Show;
  days: Record<string, DayRec>;
  objective: Objective | null;
  parcours: { id: string; start: string } | null;
  carnet: CarnetEntry[];
  learn: Record<string, LearnRec>;
  prayer: Prayer | null;
  onboarded: boolean;
  level: string | null;
  rampStart: string | null;
  rampDone: string | null;
  /** Afficher le lien avec l’objectif sur la page Jour. */
  showObjective?: boolean;
  /** Jour où le moment d’intention a été montré. */
  lastIntention?: string;
  /** Avancées notées pour l’objectif (Mon chemin). */
  steps?: { id: string; date: string; text: string }[];
  /** Al-hamdulillâh du jour : une chose pour laquelle on remercie Allah. */
  gratitude?: Record<string, string>;
  /** Suivi des cinq prières, par jour. */
  salat?: Record<string, Partial<Record<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha", { s: "on" | "qada" | "ex"; t?: number; m?: boolean }>>>;
  /** Dernier jour où le message de patience a été vu. */
  patienceSeen?: string;
  // Phase 2 (communauté, binôme) : conservés pour compatibilité avec le prototype.
  binome: unknown;
  anonId: string | null;
  pseudo: string;
  myReq: string[];
  myTest: string[];
  prayed: Record<string, string>;
  hamd: Record<string, string>;
}

export const defaultState = (): State => ({
  v: 2, updated: 0, start: null, show: { ar: true, ph: true, fr: true }, days: {}, objective: null, parcours: null,
  carnet: [], learn: {}, prayer: null, binome: null, anonId: null, pseudo: "", myReq: [], myTest: [], prayed: {}, hamd: {},
  onboarded: false, level: null, rampStart: null, rampDone: null,
});

/** Fusionne des données enregistrées (même partielles ou anciennes) avec l’état par défaut. */
export function merge(x: unknown): State {
  const S = defaultState();
  if (!x || typeof x !== "object") { SOCLE.forEach((id) => (S.learn[id] = { lvl: 0, next: keyOf(today()) })); return S; }
  const o = x as Partial<State>;
  Object.assign(S, o);
  S.show = { ar: true, ph: true, fr: true, ...(o.show || {}) };
  S.days = o.days || {};
  S.carnet = Array.isArray(o.carnet) ? o.carnet : [];
  S.learn = o.learn || {};
  if (!o.learn) SOCLE.forEach((id) => (S.learn[id] = { lvl: 0, next: keyOf(today()) }));
  S.myReq = Array.isArray(o.myReq) ? o.myReq : [];
  S.myTest = Array.isArray(o.myTest) ? o.myTest : [];
  S.prayed = o.prayed || {};
  S.hamd = o.hamd || {};
  S.v = 2;
  return S;
}

export const needsOnboarding = (S: State) => !S.onboarded && !S.start;

export function ensureDay(S: State, dk: string): DayRec {
  if (!S.days[dk]) S.days[dk] = { c: {}, note: "" };
  if (!S.start || dk < S.start) S.start = dk;
  return S.days[dk];
}

export const uid8 = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/**
 * Fusionne les données d’un appareil avec celles du compte, à la première connexion de l’appareil :
 * rien n’est perdu, ni d’un côté ni de l’autre. Le compte l’emporte en cas de doublon.
 */
export function combine(remoteRaw: unknown, localRaw: unknown): State {
  const R = merge(remoteRaw), L = merge(localRaw);
  const out = structuredClone(R);
  for (const [k, d] of Object.entries(L.days)) if (!out.days[k]) out.days[k] = d;
  const ids = new Set(out.carnet.map((c) => c.id));
  for (const c of L.carnet) if (!ids.has(c.id) && !(c.obj && out.carnet.some((x) => x.obj))) out.carnet.push(c);
  for (const [id, l] of Object.entries(L.learn)) if (!out.learn[id] || l.lvl > out.learn[id].lvl) out.learn[id] = l;
  const sid = new Set((out.steps || []).map((s) => s.id));
  out.steps = [...(out.steps || []), ...(L.steps || []).filter((s) => !sid.has(s.id))];
  out.gratitude = { ...(L.gratitude || {}), ...(out.gratitude || {}) };
  out.salat = { ...(L.salat || {}) };
  for (const [k, v] of Object.entries(R.salat || {})) out.salat[k] = { ...(L.salat?.[k] || {}), ...v };
  if (!out.objective && L.objective) out.objective = L.objective;
  if (!out.parcours && L.parcours) out.parcours = L.parcours;
  if (!out.prayer && L.prayer) out.prayer = L.prayer;
  if (L.start && (!out.start || L.start < out.start)) out.start = L.start;
  out.onboarded = R.onboarded || L.onboarded;
  out.updated = Date.now();
  return out;
}

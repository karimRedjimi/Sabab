import { SOCLE } from "@/content/programme";
import { keyOf, today } from "./dates";

export interface Prayer { city: string; lat: number; lng: number; method: string }
export interface DayRec { c: Record<string, number>; note: string; objAct?: string; light?: boolean }
export interface Objective { title: string; cat: string; why: string; since: string }
export interface CarnetEntry { id: string; text: string; date: string; status: "wait" | "ok"; answered?: string; how?: string; shared?: boolean }
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

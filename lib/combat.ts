// « Mon combat » : délaisser une habitude, un jour après l’autre.
// Ces données restent sur l’appareil : jamais synchronisées, jamais exportées sans demande.
import { addDays, diffDays, fromKey, keyOf, today } from "./dates";

export const COMBAT_KEY = "sabab-combat";
export const GOAL_DAYS = 40;

/** Les signes proposés : on ne nomme jamais le combat. */
export const SIGNS = ["circle", "triangle", "square", "diamond", "star", "moon", "wave", "drop", "hexagon", "ring"] as const;
export type Sign = (typeof SIGNS)[number];

export interface Combat {
  id: string;
  sign: Sign;
  start: string;
  /** Jours où la personne a répondu : « ok » tenu, « fall » retombé. */
  log: Record<string, "ok" | "fall">;
  victory?: string;
}
export interface CombatData { v: 1; combats: Combat[] }

export const emptyCombat = (): CombatData => ({ v: 1, combats: [] });

export function parseCombat(raw: unknown): CombatData {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as CombatData).combats)) return emptyCombat();
  const combats = (raw as CombatData).combats.filter((c) => c && typeof c.id === "string" && SIGNS.includes(c.sign) && typeof c.start === "string")
    .map((c) => ({ ...c, log: c.log && typeof c.log === "object" ? c.log : {} }));
  return { v: 1, combats };
}

export function loadCombat(): CombatData {
  try { const r = localStorage.getItem(COMBAT_KEY); return r ? parseCombat(JSON.parse(r)) : emptyCombat(); } catch { return emptyCombat(); }
}
export function saveCombat(d: CombatData) {
  try { localStorage.setItem(COMBAT_KEY, JSON.stringify(d)); } catch { /* stockage indisponible */ }
}
export function clearCombat() {
  try { localStorage.removeItem(COMBAT_KEY); } catch { /* stockage indisponible */ }
}

const falls = (c: Combat) => Object.keys(c.log).filter((k) => c.log[k] === "fall").sort();

/**
 * Jours tenus d’affilée : depuis le début ou la dernière chute, sans exiger de réponse chaque jour.
 * Le jour d’une chute ne compte pas.
 */
export function streak(c: Combat, d = today()): number {
  const f = falls(c).filter((k) => k <= keyOf(d));
  const from = f.length ? addDays(fromKey(f[f.length - 1]), 1) : fromKey(c.start);
  return Math.max(0, diffDays(d, from) + 1);
}

/** La plus longue série depuis le début. */
export function bestStreak(c: Combat, d = today()): number {
  const f = falls(c).filter((k) => k <= keyOf(d));
  let best = 0, from = fromKey(c.start);
  for (const k of f) { best = Math.max(best, diffDays(fromKey(k), from)); from = addDays(fromKey(k), 1); }
  return Math.max(best, diffDays(d, from) + 1);
}

/** Chutes par semaine, sur les n dernières semaines (la dernière est la semaine en cours). */
export function fallsPerWeek(c: Combat, n = 6, d = today()): number[] {
  const mon = addDays(d, -((d.getDay() + 6) % 7));
  return Array.from({ length: n }, (_, i) => {
    const a = keyOf(addDays(mon, -7 * (n - 1 - i))), b = keyOf(addDays(mon, -7 * (n - 1 - i) + 6));
    return falls(c).filter((k) => k >= a && k <= b).length;
  });
}

/** Changer la réponse d’un jour : rien → tenu → retombé → rien. */
export function cycleDay(c: Combat, dk: string): Combat {
  const cur = c.log[dk], log = { ...c.log };
  if (!cur) log[dk] = "ok"; else if (cur === "ok") log[dk] = "fall"; else delete log[dk];
  return { ...c, log };
}

export const reachedGoal = (c: Combat, d = today()) => !c.victory && streak(c, d) >= GOAL_DAYS;

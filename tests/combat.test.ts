import { describe, it, expect } from "vitest";
import { bestStreak, cycleDay, fallsPerWeek, parseCombat, reachedGoal, streak, type Combat } from "@/lib/combat";

const c0: Combat = { id: "a", sign: "circle", start: "2026-11-01", log: {} };
const d = new Date(2026, 10, 11);

describe("Mon combat", () => {
  it("compte les jours tenus sans exiger de réponse chaque jour", () => {
    expect(streak(c0, d)).toBe(11);
  });
  it("une chute remet la série à zéro, la meilleure série reste", () => {
    const c = { ...c0, log: { "2026-11-08": "fall" as const } };
    expect(streak(c, d)).toBe(3);
    expect(bestStreak(c, d)).toBe(7);
    const c2 = { ...c0, log: { "2026-11-11": "fall" as const } };
    expect(streak(c2, d)).toBe(0);
  });
  it("chutes par semaine", () => {
    const c = { ...c0, log: { "2026-11-02": "fall" as const, "2026-11-04": "fall" as const, "2026-11-10": "fall" as const } };
    expect(fallsPerWeek(c, 2, d)).toEqual([2, 1]);
  });
  it("corriger un jour : rien, tenu, retombé, rien", () => {
    let c = cycleDay(c0, "2026-11-05"); expect(c.log["2026-11-05"]).toBe("ok");
    c = cycleDay(c, "2026-11-05"); expect(c.log["2026-11-05"]).toBe("fall");
    c = cycleDay(c, "2026-11-05"); expect(c.log["2026-11-05"]).toBeUndefined();
  });
  it("40 jours tenus : la victoire est proposée", () => {
    expect(reachedGoal({ ...c0, start: "2026-10-01" }, d)).toBe(true);
    expect(reachedGoal(c0, d)).toBe(false);
  });
  it("ignore des données abîmées", () => {
    expect(parseCombat({ combats: [{ id: 1 }, { id: "x", sign: "nope", start: "2026" }] }).combats).toEqual([]);
    expect(parseCombat(null).combats).toEqual([]);
  });
});

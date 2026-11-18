import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { constat, faites, grilleMoments, parPriere, progresNiveau, regularite, resume } from "@/lib/suivi";
import { merge, type State } from "@/lib/state";

const paris = { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" };
const now = new Date(2026, 10, 18, 20, 30);
const k = (d: number) => `2026-11-${String(d).padStart(2, "0")}`;

describe("suivi", () => {
  beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(now); });
  afterAll(() => vi.useRealTimers());
  const salat: State["salat"] = {};
  for (let d = 12; d <= 17; d++) salat[k(d)] = { fajr: d >= 15 ? { s: "on" } : undefined, dhuhr: { s: "on", m: true }, asr: { s: "qada" }, maghrib: { s: "on" }, isha: { s: "ex" } };
  const S = merge({ onboarded: true, start: "2026-10-01", rampDone: "2026-10-02", prayer: paris, salat });

  it("chaque prière : à l’heure, mosquée, rattrapée ; « non concerné » ne compte pas ; aujourd’hui non noté n’est pas manqué", () => {
    const pp = parPriere(S, new Date(2026, 10, 12), new Date(2026, 10, 18), now);
    const f = pp.find((p) => p.k === "fajr")!, dh = pp.find((p) => p.k === "dhuhr")!, as = pp.find((p) => p.k === "asr")!, is = pp.find((p) => p.k === "isha")!;
    expect([f.possible, faites(f)]).toEqual([6, 3]);
    expect(dh.mosquee).toBe(6);
    expect(as.qada).toBe(6);
    expect(is.possible).toBe(0);
  });
  it("les anneaux : prières faites sur possibles", () => {
    const r = resume(S, new Date(2026, 10, 18), 7, now);
    expect(r.prieres).toBeCloseTo(21 / 24);
  });
  it("une phrase utile : la prière la plus fragile", () => {
    const c = constat(S, new Date(2026, 10, 18), 7, now);
    expect(c?.titre).toMatch(/Fajr/);
  });
  it("les moments sur 7 jours, la régularité sur 30, le niveau", () => {
    const g = grilleMoments(S, new Date(2026, 10, 18), now);
    expect(g.jours).toHaveLength(7);
    expect(g.lignes.every((l) => l.cases.length === 7)).toBe(true);
    const r = regularite(S, new Date(2026, 10, 18));
    expect(r.jours).toHaveLength(30);
    const n = progresNiveau(S, new Date(2026, 10, 18));
    expect(n.tenus).toBeGreaterThanOrEqual(0); expect(n.tenus).toBeLessThanOrEqual(14);
  });
});

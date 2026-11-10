import { describe, it, expect } from "vitest";
// @ts-expect-error module JS sans types
import { loadPrototypeLogic } from "../scripts/prototype.mjs";
import { prayerTimes } from "@/lib/prayer";
import { structure, countable, dayPct, streaks, rampWeek, parcoursDay } from "@/lib/program";
import { merge, type State } from "@/lib/state";
import { keyOf, addDays, today } from "@/lib/dates";
import { CITIES, METHODS } from "@/content/reglages";
import { ITEMS, PARCOURS } from "@/content/programme";
import { grade } from "@/lib/learn";

const P = loadPrototypeLogic();
const plain = (x: unknown) => JSON.parse(JSON.stringify(x));

// Générateur pseudo-aléatoire reproductible
function rng(seed: number) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); }

function randomState(r: () => number): State {
  const S = merge({ onboarded: true });
  const t = today();
  const start = addDays(t, -60);
  S.start = keyOf(start);
  if (r() < 0.6) S.objective = { title: "x", cat: "emploi", why: "", since: keyOf(addDays(t, -Math.floor(r() * 50))) };
  if (r() < 0.6) { const ids = Object.keys(PARCOURS); S.parcours = { id: ids[Math.floor(r() * ids.length)], start: keyOf(addDays(t, -Math.floor(r() * 45))) }; }
  if (r() < 0.5) { S.rampStart = keyOf(addDays(t, -Math.floor(r() * 20))); if (r() < 0.3) S.rampDone = keyOf(addDays(t, -Math.floor(r() * 5))); }
  const keys = [...Object.keys(ITEMS), "obj", "pact"];
  for (let i = 0; i <= 60; i++) {
    if (r() < 0.2) continue;
    const dk = keyOf(addDays(start, i));
    const c: Record<string, number> = {};
    for (const id of keys) {
      const sl = ITEMS[id]?.slots || [{ t: 1 }];
      sl.forEach((s, j) => { if (r() < 0.7) c[`${id}:${j}`] = Math.ceil(r() * s.t * 1.1); });
    }
    S.days[dk] = { c, note: "", ...(r() < 0.1 ? { light: true } : {}) };
  }
  return S;
}

describe("horaires de prière identiques au prototype", () => {
  for (const [city, lat, lng] of CITIES) for (const method of Object.keys(METHODS)) {
    it(`${city}, ${method}`, () => {
      const prayer = { city, lat, lng, method };
      P.setS({ prayer });
      for (let i = 0; i < 365; i += 17) {
        const d = addDays(new Date(2026, 0, 1), i);
        expect(prayerTimes(d, prayer)).toEqual(P.prayerTimes(d));
      }
    });
  }
  it("latitude élevée (Oslo, été)", () => {
    const prayer = { city: "Ma position", lat: 59.91, lng: 10.75, method: "mwl" };
    P.setS({ prayer });
    const d = new Date(2026, 5, 21);
    expect(prayerTimes(d, prayer)).toEqual(P.prayerTimes(d));
  });
});

describe("modèle d’une journée identique au prototype", () => {
  for (let seed = 1; seed <= 25; seed++) {
    it(`état aléatoire n° ${seed}`, () => {
      const S = randomState(rng(seed));
      P.setS(plain(S));
      for (let i = -62; i <= 0; i++) {
        const d = addDays(today(), i);
        expect(plain(structure(S, d))).toEqual(plain(P.structure(d)));
        expect(countable(S, d)).toEqual(plain(P.countable(d)));
        expect(dayPct(S, d)).toBeCloseTo(P.dayPct(d), 12);
        expect(rampWeek(S, d)).toBe(P.rampWeek(d));
        expect(parcoursDay(S, d)).toBe(P.parcoursDay(d));
      }
      expect(streaks(S)).toEqual(plain(P.streaks()));
    });
  }
});

describe("révision espacée", () => {
  it("monte d’un niveau et planifie selon les intervalles", () => {
    const S = merge(null);
    grade(S, "fajr", true);
    expect(S.learn.fajr.lvl).toBe(1);
    expect(S.learn.fajr.next).toBe(keyOf(addDays(today(), 1)));
    for (let i = 0; i < 4; i++) grade(S, "fajr", true);
    expect(S.learn.fajr.lvl).toBe(5);
    expect(S.learn.fajr.mastered).toBe(keyOf(today()));
    grade(S, "fajr", false);
    expect(S.learn.fajr.lvl).toBe(4);
    expect(S.learn.fajr.next).toBe(keyOf(addDays(today(), 1)));
  });
});

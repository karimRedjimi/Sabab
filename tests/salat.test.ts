import { describe, it, expect } from "vitest";
import { merge, combine } from "@/lib/state";
import { adhanMinutes, delayOf, fajrForgotten, fmtDelay, salatStats } from "@/lib/salat";
import { keyOf } from "@/lib/dates";

const base = () => { const S = merge({ onboarded: true }); S.prayer = { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" }; return S; };
const d = new Date(2026, 10, 11), dk = keyOf(d);

describe("suivi de la prière", () => {
  it("calcule le délai après l’appel", () => {
    const S = base(), a = adhanMinutes(S, d, "dhuhr")!;
    expect(delayOf(S, d, "dhuhr", { s: "on", t: a + 14 })).toBe(14);
    expect(fmtDelay(14)).toBe("14 min après l’appel");
    expect(fmtDelay(75)).toBe("1 h 15 après l’appel");
    const ai = adhanMinutes(S, d, "isha")!;
    expect(delayOf(S, d, "isha", { s: "on", t: (ai + 200) % 1440 })).toBe(200); // après minuit
    expect(delayOf(S, d, "dhuhr", { s: "qada", t: a + 400 })).toBeNull();
  });
  it("compte les prières, la mosquée et le délai moyen, sans compter les jours non concernés", () => {
    const S = base(), a = (k: "fajr" | "dhuhr") => adhanMinutes(S, d, k)!;
    S.salat = {
      [dk]: { fajr: { s: "on", t: a("fajr") + 10 }, dhuhr: { s: "on", t: a("dhuhr") + 20, m: true }, asr: { s: "qada" } },
      [keyOf(new Date(2026, 10, 10))]: { fajr: { s: "ex" }, dhuhr: { s: "ex" }, asr: { s: "ex" }, maghrib: { s: "ex" }, isha: { s: "ex" } },
    };
    const st = salatStats(S, new Date(2026, 10, 10), d, new Date(2026, 10, 11, 23, 59));
    expect(st.possible).toBe(5);
    expect(st.noted).toBe(3);
    expect(st.mosque).toBe(1);
    expect(st.qada).toBe(1);
    expect(st.avgDelay).toBe(15);
  });
  it("aujourd’hui, une prière dont l’heure n’est pas venue ne compte pas encore", () => {
    const S = base();
    const st = salatStats(S, d, d, new Date(2026, 10, 11, 13, 0));
    expect(st.possible).toBe(2); // Fajr et Dhuhr
  });
  it("rappel doux du Fajr seulement entre le lever du soleil et le Dhuhr", () => {
    const S = base();
    expect(fajrForgotten(S, new Date(2026, 10, 11, 10, 0))).toBe(true);
    expect(fajrForgotten(S, new Date(2026, 10, 11, 6, 0))).toBe(false);
    expect(fajrForgotten(S, new Date(2026, 10, 11, 15, 0))).toBe(false);
    S.salat = { [dk]: { fajr: { s: "on", t: 400 } } };
    expect(fajrForgotten(S, new Date(2026, 10, 11, 10, 0))).toBe(false);
  });
  it("la fusion entre appareils garde les prières des deux côtés", () => {
    const out = combine({ salat: { [dk]: { fajr: { s: "on", t: 400 } } } }, { salat: { [dk]: { dhuhr: { s: "on", t: 760 } }, "2026-11-01": { asr: { s: "qada" } } } });
    expect(Object.keys(out.salat![dk]!).sort()).toEqual(["dhuhr", "fajr"]);
    expect(out.salat!["2026-11-01"]).toBeTruthy();
  });
});

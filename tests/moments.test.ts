import { describe, it, expect } from "vitest";
import { merge } from "@/lib/state";
import { favorableMoments } from "@/lib/moments";
import { needsPatience } from "@/lib/objective";
import { prayerTimes, hm } from "@/lib/prayer";
import { addDays, keyOf } from "@/lib/dates";

const S = merge({ onboarded: true });
S.prayer = { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" };

describe("moments favorables", () => {
  it("le dernier tiers de la nuit commence aux deux tiers entre Maghreb et Fajr", () => {
    const now = new Date(2026, 10, 10, 15, 0);
    const d = new Date(2026, 10, 10), pt = prayerTimes(d, S.prayer)!, tom = prayerTimes(addDays(d, 1), S.prayer)!;
    const expected = hm(pt.maghrib + (2 * (tom.fajr + 24 - pt.maghrib)) / 3);
    const nuit = favorableMoments(S, now).find((m) => m.key === "nuit")!;
    expect(nuit.when).toContain(expected);
    expect(nuit.now).toBe(false);
  });
  it("signale la nuit en cours avant le Fajr", () => {
    const nuit = favorableMoments(S, new Date(2026, 10, 11, 4, 30)).find((m) => m.key === "nuit")!;
    expect(nuit.now).toBe(true);
  });
  it("donne le prochain appel à la prière", () => {
    const appel = favorableMoments(S, new Date(2026, 10, 10, 13, 0)).find((m) => m.key === "appel")!;
    expect(appel.when).toContain("ʿAsr");
  });
  it("ajoute la dernière heure du vendredi", () => {
    expect(favorableMoments(S, new Date(2026, 10, 13, 10, 0)).some((m) => m.key === "vendredi")).toBe(true);
    expect(favorableMoments(S, new Date(2026, 10, 12, 10, 0)).some((m) => m.key === "vendredi")).toBe(false);
  });
});

describe("mot de patience", () => {
  it("apparaît après 21 jours sans avancée, puis pas avant une semaine", () => {
    const T = merge({ onboarded: true });
    const d = new Date(2026, 10, 10);
    T.objective = { title: "x", cat: "mariage", why: "", since: keyOf(addDays(d, -10)) };
    expect(needsPatience(T, d)).toBe(false);
    T.objective.since = keyOf(addDays(d, -30));
    expect(needsPatience(T, d)).toBe(true);
    T.patienceSeen = keyOf(addDays(d, -3));
    expect(needsPatience(T, d)).toBe(false);
    T.patienceSeen = undefined;
    T.steps = [{ id: "a", date: keyOf(addDays(d, -5)), text: "une avancée" }];
    expect(needsPatience(T, d)).toBe(false);
  });
});

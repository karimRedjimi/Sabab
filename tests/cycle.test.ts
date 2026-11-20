import { describe, expect, it } from "vitest";
import { bilanAMontrer, cycle, cycles, decisionNiveau, hijri, recapAMontrer } from "@/lib/cycle";
import { addDays, keyOf } from "@/lib/dates";
import { parcoursDay } from "@/lib/program";
import { merge } from "@/lib/state";

const b0 = { fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 };
const premierRamadan = (depuis: Date) => { let x = new Date(depuis); while (hijri(x).m !== 9) x = addDays(x, 1); return x; };

describe("cycles de 30 jours", () => {
  const S = merge({ start: "2026-11-01" });
  it("le cycle 1 commence le jour du début d’utilisation, jour 1 sur 30", () => {
    const c = cycle(S, new Date(2026, 10, 1));
    expect([c.nom, c.jour, c.longueur]).toEqual(["Cycle 1", 1, 30]);
  });
  it("les cycles s’enchaînent tous les 30 jours", () => {
    const c = cycle(S, new Date(2026, 11, 5)); // 35e jour
    expect([c.nom, c.jour]).toEqual(["Cycle 2", 5]);
    expect(keyOf(c.debut)).toBe("2026-12-01");
  });
  it("Ramadan coupe le cycle en cours et devient un cycle à part, puis les cycles de 30 jours repartent", () => {
    const r = premierRamadan(new Date(2026, 10, 1));
    const l = cycles(S, addDays(r, 40));
    const iR = l.findIndex((c) => c.ramadan);
    expect(iR).toBeGreaterThan(0);
    expect(keyOf(l[iR - 1].fin)).toBe(keyOf(addDays(r, -1)));
    expect(keyOf(l[iR].debut)).toBe(keyOf(r));
    expect([29, 30]).toContain(l[iR].longueur);
    expect(l[iR].nom).toMatch(/^Ramadan \d{4}$/);
    expect(l[iR + 1].nom).toBe(`Cycle ${iR + 1}`);
    expect(hijri(l[iR + 1].debut).m).toBe(10);
    expect(l[iR + 1].longueur).toBe(30);
  });
  it("le parcours ne s’arrête plus au jour 40", () => {
    expect(parcoursDay(merge({ parcours: { id: "dettes", start: "2026-09-01" } }), new Date(2026, 10, 20))).toBeGreaterThan(40);
  });
  it("une seule décision, en proportion : monter aux deux tiers, alléger sous un tiers, rien sous 15 jours", () => {
    const N = merge({ prophete: { lvl: 2, since: "2026-10-01" } });
    expect(decisionNiveau(N, { jours: 30, tenus: 20, ...b0 })).toBe("monter");
    expect(decisionNiveau(N, { jours: 30, tenus: 15, ...b0 })).toBeNull();
    expect(decisionNiveau(N, { jours: 30, tenus: 8, ...b0 })).toBe("alleger");
    expect(decisionNiveau(N, { jours: 18, tenus: 12, ...b0 })).toBe("monter");
    expect(decisionNiveau(N, { jours: 10, tenus: 10, ...b0 })).toBeNull();
    expect(decisionNiveau(merge({}), { jours: 30, tenus: 2, ...b0 })).toBeNull();
  });
  it("le bilan du cycle précédent : les 10 premiers jours du cycle suivant, une seule fois", () => {
    const d = new Date(2026, 11, 3); // cycle 2, jour 3
    const p = bilanAMontrer(S, d);
    expect(p?.nom).toBe("Cycle 1");
    expect(bilanAMontrer({ ...S, cycles: { [p!.cle]: { vu: "2026-12-03" } } }, d)).toBeNull();
    expect(bilanAMontrer(S, new Date(2026, 11, 15))).toBeNull();
    expect(bilanAMontrer(S, new Date(2026, 10, 5))).toBeNull();
  });
  it("le récap de l’année : les 10 derniers jours de Cha‘ban", () => {
    expect(recapAMontrer(S, new Date(2026, 10, 20))).toBeNull();
    let x = new Date(2026, 10, 20); while (!(hijri(x).m === 8 && hijri(x).j === 25)) x = addDays(x, 1);
    expect(recapAMontrer(S, x)).toBe(hijri(x).a);
  });
});

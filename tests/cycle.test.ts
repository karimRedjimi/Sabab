import { describe, expect, it } from "vitest";
import { bilanAMontrer, cycle, decisionNiveau, debutMois, hijri, longueurMois, nomMois, recapAMontrer } from "@/lib/cycle";
import { keyOf } from "@/lib/dates";
import { parcoursDay } from "@/lib/program";
import { merge } from "@/lib/state";

describe("cycles lunaires", () => {
  const d = new Date(2026, 10, 20, 12); // 10 Joumada ath-thania 1448
  it("la date hégirienne et le mois", () => {
    expect(hijri(d)).toEqual({ j: 10, m: 6, a: 1448 });
    expect(nomMois(6)).toBe("Joumada ath-thania");
    expect(hijri(debutMois(d)).j).toBe(1);
    expect([29, 30]).toContain(longueurMois(d));
  });
  it("le numéro du cycle compte les mois lunaires depuis le début", () => {
    const S = merge({ start: keyOf(new Date(2026, 9, 1)) }); // un jour de Rabi‘ ath-thani
    const c = cycle(S, d);
    expect(c.num).toBe(3);
    expect(c.jour).toBe(10);
    expect(c.mois).toBe("Joumada ath-thania");
  });
  it("le parcours ne s’arrête plus au jour 40", () => {
    const S = merge({ parcours: { id: "dettes", start: "2026-09-01" } });
    expect(parcoursDay(S, d)).toBeGreaterThan(40);
  });
  it("une seule décision : monter à 20 jours tenus, alléger sous 10, sinon rester", () => {
    const S = merge({ prophete: { lvl: 2, since: "2026-10-01" } });
    expect(decisionNiveau(S, { jours: 30, tenus: 22, fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 })).toBe("monter");
    expect(decisionNiveau(S, { jours: 30, tenus: 15, fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 })).toBeNull();
    expect(decisionNiveau(S, { jours: 29, tenus: 5, fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 })).toBe("alleger");
    expect(decisionNiveau(merge({}), { jours: 29, tenus: 5, fajr: 0, gestes: 0, bienfaits: 0, versets: 0, sues: 0 })).toBeNull();
  });
  it("le bilan du mois précédent : les 10 premiers jours du nouveau mois, une seule fois", () => {
    const S = merge({ start: "2026-10-01" });
    const p = bilanAMontrer(S, d);
    expect(p?.mois).toBe("Joumada al-oula");
    expect(bilanAMontrer({ ...S, cycles: { [p!.cle]: { vu: "2026-11-12" } } }, d)).toBeNull();
    expect(bilanAMontrer(S, new Date(2026, 10, 25, 12))).toBeNull();
  });
  it("le récap de l’année : les 10 derniers jours de Cha‘ban", () => {
    const S = merge({ start: "2026-10-01" });
    expect(recapAMontrer(S, d)).toBeNull();
    let x = new Date(d); while (!(hijri(x).m === 8 && hijri(x).j === 25)) x = new Date(x.getTime() + 86400000);
    expect(recapAMontrer(S, x)).toBe(1448);
  });
});

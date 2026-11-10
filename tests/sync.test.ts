import { describe, it, expect } from "vitest";
import { combine } from "@/lib/state";

describe("fusion à la première connexion d’un appareil", () => {
  it("ne perd rien du compte ni de l’appareil", () => {
    const remote = { onboarded: true, start: "2026-10-01", updated: 100, objective: { title: "Me marier", cat: "mariage", why: "", since: "2026-10-01" },
      days: { "2026-10-01": { c: { "fajr:0": 1 }, note: "compte" } }, carnet: [{ id: "a", text: "Me marier", date: "2026-10-01", status: "wait", obj: true }],
      learn: { fajr: { lvl: 3, next: "2026-11-20" } }, steps: [{ id: "s1", date: "2026-10-05", text: "avancée" }] };
    const local = { onboarded: true, start: "2026-11-10", updated: 999, objective: { title: "Autre", cat: "emploi", why: "", since: "2026-11-10" },
      days: { "2026-10-01": { c: {}, note: "appareil" }, "2026-11-10": { c: { "sayyid:0": 1 }, note: "" } },
      carnet: [{ id: "b", text: "Une demande locale", date: "2026-11-10", status: "wait" }, { id: "c", text: "Autre", date: "2026-11-10", status: "wait", obj: true }],
      learn: { fajr: { lvl: 1, next: "2026-11-11" }, hayy: { lvl: 2, next: "2026-11-12" } } };
    const out = combine(remote, local);
    expect(out.objective?.title).toBe("Me marier");
    expect(out.days["2026-10-01"].note).toBe("compte");
    expect(out.days["2026-11-10"]).toBeTruthy();
    expect(out.carnet.map((c) => c.id).sort()).toEqual(["a", "b"]);
    expect(out.learn.fajr.lvl).toBe(3);
    expect(out.learn.hayy.lvl).toBe(2);
    expect(out.steps?.length).toBe(1);
    expect(out.start).toBe("2026-10-01");
    expect(out.updated).toBeGreaterThan(999);
  });
});

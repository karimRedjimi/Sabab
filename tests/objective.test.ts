import { describe, it, expect } from "vitest";
import { PARCOURS } from "@/content/programme";
import { keyOf, today, addDays } from "@/lib/dates";
import { merge } from "@/lib/state";
import { objectiveIdea, objectiveTag, parcoursServesObjective, showObjective } from "@/lib/objective";
import { periodStats } from "@/lib/bilan";
import { structure } from "@/lib/program";

const base = () => {
  const S = merge({ onboarded: true });
  S.start = keyOf(addDays(today(), -3));
  S.objective = { title: "Me marier cette année", cat: "mariage", why: "", since: S.start };
  return S;
};

describe("lien avec l’objectif", () => {
  it("nomme l’objectif et reconnaît son parcours", () => {
    const S = base();
    expect(objectiveTag(S)).toBe("Pour ton mariage");
    expect(parcoursServesObjective(S)).toBe(false);
    S.parcours = { id: "mariage", start: S.start! };
    expect(parcoursServesObjective(S)).toBe(true);
    S.parcours = { id: "rizq", start: S.start! };
    expect(parcoursServesObjective(S)).toBe(false);
  });
  it("propose une idée tirée du parcours, différente du geste du jour", () => {
    const S = base();
    S.parcours = { id: "mariage", start: keyOf(today()) };
    const idea = objectiveIdea(S, today());
    expect(PARCOURS.mariage.actions).toContain(idea);
    expect(idea).not.toBe(PARCOURS.mariage.actions[0]); // le geste du jour 1
  });
  it("le réglage de discrétion est activé par défaut", () => {
    const S = base();
    expect(showObjective(S)).toBe(true);
    S.showObjective = false;
    expect(showObjective(S)).toBe(false);
  });
  it("le bilan compte les invocations et gestes du parcours", () => {
    const S = base();
    S.parcours = { id: "mariage", start: S.start! };
    const d = today(), dk = keyOf(d);
    const parc = structure(S, d).parc;
    S.days[dk] = { c: Object.fromEntries(parc.map((id) => [`${id}:0`, 1])), note: "" };
    const st = periodStats(S, d, d);
    expect(st.pact).toBe(1);
    expect(st.parc).toBe(parc.length - 1);
  });
});

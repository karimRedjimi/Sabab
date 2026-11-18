import { describe, expect, it } from "vitest";
import { CHAPITRES, THEMES, TOTAL_BIBLIO, chercher, invocation } from "@/lib/bibliotheque";
import { dueIds } from "@/lib/learn";
import { merge } from "@/lib/state";
import { keyOf, today } from "@/lib/dates";

describe("bibliothèque (La Citadelle du musulman)", () => {
  it("133 chapitres, 283 invocations, chacune avec l’arabe, la traduction et une source", () => {
    expect(CHAPITRES.length).toBe(133);
    expect(TOTAL_BIBLIO).toBe(283);
    for (const c of CHAPITRES) for (const d of c.duas) {
      expect(d.ar.trim()).not.toBe("");
      expect(d.fr.trim()).not.toBe("");
      expect((d.src || d.srcAr || "").trim()).not.toBe("");
    }
  });
  it("chaque chapitre a un thème connu, et des identifiants uniques", () => {
    const t = new Set(THEMES.map((x) => x.id));
    for (const c of CHAPITRES) expect(t.has(c.theme)).toBe(true);
    const ids = CHAPITRES.flatMap((c) => c.duas.map((d) => d.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("aucun titre de chapitre ne contient le mot « péché »", () => {
    for (const c of CHAPITRES) expect(c.title.toLowerCase()).not.toContain("péché");
  });
  it("la recherche ignore les accents", () => {
    expect(chercher("colere").length).toBeGreaterThan(0);
    expect(chercher("voyage").some((r) => r.c.theme === "voyage")).toBe(true);
  });
  it("une invocation de la bibliothèque s’apprend comme les autres", () => {
    expect(invocation("hm-1")?.ar).toBeTruthy();
    const S = merge({ learn: { "hm-97": { lvl: 1, next: keyOf(today()) }, inconnu: { lvl: 1, next: keyOf(today()) } } });
    expect(dueIds(S)).toEqual(["hm-97"]);
  });
});

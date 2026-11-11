import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { EXTRAITS } from "@/content/coran-extraits";
import { VERSETS_GENERAL, VERSETS_THEME } from "@/content/versets";
import { OBJ_CATS } from "@/content/programme";
import { coranStats, noteLecture, rappelsDuJour, rappelsDuMoment, refLabel, suggestNextLevel, versesIn } from "@/lib/coran";
import { addDays, keyOf } from "@/lib/dates";
import { merge } from "@/lib/state";

const require = createRequire(import.meta.url);
const quran = JSON.parse(readFileSync(require.resolve("quran-json/dist/quran_fr.json"), "utf8"));
const refs = [...new Set([...Object.values(VERSETS_THEME).flat(), ...VERSETS_GENERAL])];

describe("fidélité des versets", () => {
  it("chaque référence a son extrait, et rien d’autre", () => {
    expect(Object.keys(EXTRAITS).sort()).toEqual([...refs].sort());
  });
  it("le texte arabe et la traduction sont identiques à la source", () => {
    for (const [ref, e] of Object.entries(EXTRAITS)) {
      const ch = quran[e.s - 1];
      expect(e.name).toBe(ch.transliteration);
      expect(ref).toBe(e.from === e.to ? `${e.s}:${e.from}` : `${e.s}:${e.from}-${e.to}`);
      expect(e.verses.map((v) => v.n)).toEqual(Array.from({ length: e.to - e.from + 1 }, (_, i) => e.from + i));
      for (const v of e.verses) {
        const src = ch.verses.find((x: { id: number }) => x.id === v.n);
        expect(v.ar).toBe(src.text);
        expect(v.fr).toBe(src.translation);
      }
    }
  });
  it("les thèmes correspondent aux domaines d’objectif", () => {
    for (const k of Object.keys(VERSETS_THEME)) expect(OBJ_CATS[k]).toBeTruthy();
  });
});

describe("rappels du jour", () => {
  const S = (cat: string, level?: 1 | 5 | 10) => merge({ objective: { title: "", cat, why: "", since: "2026-01-01" }, coranLevel: level });
  const d0 = new Date(2026, 10, 11);
  it("un seul verset au premier palier, le même toute la journée", () => {
    for (let i = 0; i < 60; i++) {
      const d = addDays(d0, i), r = rappelsDuJour(S("mariage"), d);
      expect(r).toHaveLength(1); expect(r[0].verses).toHaveLength(1);
      expect(rappelsDuJour(S("mariage"), d)[0].ref).toBe(r[0].ref);
    }
  });
  it("la plupart des jours, le verset est lié à la situation", () => {
    let themed = 0;
    for (let i = 0; i < 40; i++) { const r = rappelsDuJour(S("dette"), addDays(d0, i))[0]; if (r.themed) { themed++; expect(VERSETS_THEME.dette).toContain(r.ref); expect(r.tag).toBe("Pour ta dette"); } else expect(r.tag).toBe("Rappel"); }
    expect(themed).toBe(30);
  });
  it("sans thème, des rappels pour tous", () => {
    for (let i = 0; i < 10; i++) for (const r of rappelsDuJour(S("autre", 5), addDays(d0, i))) { expect(r.themed).toBe(false); expect(VERSETS_GENERAL).toContain(r.ref); }
    expect(rappelsDuJour(merge(null), d0)).toHaveLength(1);
  });
  it("les paliers 5 et 10 donnent à peu près le bon nombre de versets, sans doublon", () => {
    for (const cat of Object.keys(OBJ_CATS)) for (const level of [5, 10] as const) for (let i = 0; i < 40; i++) {
      const r = rappelsDuJour(S(cat, level), addDays(d0, i)), n = versesIn(r);
      expect(n).toBeGreaterThanOrEqual(level); expect(n).toBeLessThanOrEqual(level + 2);
      expect(new Set(r.map((x) => x.ref)).size).toBe(r.length);
    }
  });
  it("deux jours de suite ne proposent pas le même verset", () => {
    for (let i = 0; i < 40; i++) expect(rappelsDuJour(S("emploi"), addDays(d0, i))[0].ref).not.toBe(rappelsDuJour(S("emploi"), addDays(d0, i + 1))[0].ref);
  });
  it("libellé de référence", () => {
    expect(refLabel(EXTRAITS["2:152"])).toBe("Sourate Al-Baqarah (2), verset 152");
    expect(refLabel(EXTRAITS["2:155-157"])).toBe("Sourate Al-Baqarah (2), versets 155 à 157");
  });
  it("suivi et palier suivant", () => {
    const s = S("mariage");
    s.coran = {};
    for (let i = 0; i < 6; i++) s.coran[keyOf(addDays(d0, -i))] = { n: 1, t: 30 };
    expect(coranStats(s, d0)).toMatchObject({ read: 6, verses: 6, seconds: 180 });
    expect(suggestNextLevel(s, d0)).toBeNull();
    s.coran[keyOf(addDays(d0, -6))] = { n: 1 };
    expect(suggestNextLevel(s, d0)).toBe(5);
    s.coranLevel = 10;
    expect(suggestNextLevel(s, d0)).toBeNull();
  });
  it("matin et soir se partagent les passages ; avec un seul verset, on le relit le soir", () => {
    const one = S("mariage");
    expect(rappelsDuMoment(one, d0, "soir")[0].ref).toBe(rappelsDuMoment(one, d0, "matin")[0].ref);
    for (const level of [5, 10] as const) for (let i = 0; i < 30; i++) {
      const s = S("etudes", level), d = addDays(d0, i);
      const am = rappelsDuMoment(s, d, "matin"), pm = rappelsDuMoment(s, d, "soir");
      const all = rappelsDuJour(s, d).map((r) => r.ref);
      expect(all.length === 1 ? am.map((r) => r.ref) : [...am, ...pm].map((r) => r.ref)).toEqual(all);
      expect(am.length).toBeGreaterThan(0); expect(pm.length).toBeGreaterThan(0);
    }
  });
  it("le compte des versets lus suit ce qu’on coche et décoche", () => {
    const s = S("mariage");
    noteLecture(s, "2026-11-11", 3, 40); noteLecture(s, "2026-11-11", 2, 20);
    expect(s.coran!["2026-11-11"]).toEqual({ n: 5, t: 60 });
    noteLecture(s, "2026-11-11", 2, 0, false);
    expect(s.coran!["2026-11-11"].n).toBe(3);
    noteLecture(s, "2026-11-11", 3, 0, false);
    expect(s.coran!["2026-11-11"]).toBeUndefined();
  });
});

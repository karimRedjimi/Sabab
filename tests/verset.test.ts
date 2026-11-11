import { describe, expect, it } from "vitest";
import { EXTRAITS } from "@/content/coran-extraits";
import { AUDIO_RECITATEUR } from "@/content/versets-audio";
import { addDays } from "@/lib/dates";
import { DUA_GOAL, VERSETS_SEULS, duasOn, mmss, versetDuJour } from "@/lib/verset";

describe("un jour, un verset", () => {
  const d0 = new Date(2026, 10, 11);
  it("le même verset pour tout le monde un jour donné, un seul verset", () => {
    for (let i = 0; i < 90; i++) {
      const v = versetDuJour(addDays(d0, i));
      expect(v.verses).toHaveLength(1);
      expect(v).toMatchObject(EXTRAITS[v.ref]);
      expect(versetDuJour(addDays(d0, i)).ref).toBe(v.ref);
    }
  });
  it("change chaque jour et parcourt toute la liste", () => {
    const seen = new Set<string>();
    for (let i = 0; i < VERSETS_SEULS.length; i++) {
      const r = versetDuJour(addDays(d0, i)).ref;
      expect(r).not.toBe(versetDuJour(addDays(d0, i + 1)).ref);
      seen.add(r);
    }
    expect(seen.size).toBe(VERSETS_SEULS.length);
  });
  it("l’audio n’est proposé que pour un fichier hébergé avec l’application", () => {
    for (const [ref, f] of Object.entries(AUDIO_RECITATEUR.fichiers)) { expect(EXTRAITS[ref]).toBeTruthy(); expect(f.startsWith("/audio/")).toBe(true); }
    expect(versetDuJour(d0).audio === null || versetDuJour(d0).audio!.startsWith("/audio/")).toBe(true);
  });
});

describe("une minute pour les autres", () => {
  it("compte les du’â du jour", () => {
    expect(DUA_GOAL).toBe(5);
    expect(duasOn({ a: "2026-11-11", b: "2026-11-11", c: "2026-11-10" }, "2026-11-11")).toBe(2);
    expect(duasOn(undefined, "2026-11-11")).toBe(0);
  });
  it("durée lisible", () => { expect(mmss(7)).toBe("0:07"); expect(mmss(60)).toBe("1:00"); });
});

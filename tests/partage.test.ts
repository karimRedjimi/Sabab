import { describe, expect, it } from "vitest";
import { wrapWords } from "@/lib/imageVerset";

describe("image du verset", () => {
  const m = (s: string) => s.length * 10;
  it("coupe en lignes qui tiennent dans la largeur, sans perdre de mot", () => {
    const t = "Louange à Celui qui a créé tous les couples de ce que la terre fait pousser";
    const lines = wrapWords(t, 200, m);
    expect(lines.every((l) => m(l) <= 200 || !l.includes(" "))).toBe(true);
    expect(lines.join(" ")).toBe(t);
  });
  it("un mot trop long reste seul sur sa ligne", () => {
    expect(wrapWords("a bbbbbbbbbbbbbbbbbbbbbbbbb c", 100, m)).toEqual(["a", "bbbbbbbbbbbbbbbbbbbbbbbbb", "c"]);
  });
});

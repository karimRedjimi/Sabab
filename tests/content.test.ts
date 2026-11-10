import { describe, it, expect } from "vitest";
// @ts-expect-error module JS sans types
import { loadPrototypeContent } from "../scripts/prototype.mjs";
import * as programme from "../content/programme";
import * as reglages from "../content/reglages";
import * as textes from "../content/textes";

const { content: proto, html } = loadPrototypeContent();
const plain = (x: unknown) => JSON.parse(JSON.stringify(x));

describe("le contenu religieux est identique au prototype", () => {
  const all: Record<string, unknown> = { ...programme, ...reglages };
  for (const name of Object.keys(proto)) {
    it(name, () => expect(plain(all[name])).toEqual(plain(proto[name])));
  }
  it("chaque invocation est sourcée", () => {
    for (const [id, it] of Object.entries(programme.ITEMS)) {
      if (it.kind === "dua") expect(it.src, id).toBeTruthy();
    }
  });
});

describe("les textes des pages figurent mot pour mot dans le prototype", () => {
  const strings: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") strings.push(v);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(textes);
  for (const s of strings) it(s.slice(0, 50), () => expect(html.includes(s)).toBe(true));
});

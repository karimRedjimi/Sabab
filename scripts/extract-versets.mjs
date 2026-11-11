// Extrait de la source (paquet quran-json) le texte exact des versets référencés dans content/versets.ts.
// Aucun texte n’est saisi à la main : arabe (quranenc.com) et traduction (M. Hamidullah) sont copiés tels quels.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const quran = JSON.parse(readFileSync(require.resolve("quran-json/dist/quran_fr.json"), "utf8"));
const src = readFileSync(new URL("../content/versets.ts", import.meta.url), "utf8");
const refs = [...new Set([...src.matchAll(/"(\d+:\d+(?:-\d+)?)"/g)].map((m) => m[1]))];

export function extrait(ref) {
  const [s, a] = ref.split(":");
  const [from, to] = a.includes("-") ? a.split("-").map(Number) : [Number(a), Number(a)];
  const ch = quran[Number(s) - 1];
  if (!ch) throw new Error(`Sourate inconnue : ${ref}`);
  const verses = ch.verses.filter((v) => v.id >= from && v.id <= to).map((v) => ({ n: v.id, ar: v.text, fr: v.translation }));
  if (verses.length !== to - from + 1) throw new Error(`Verset introuvable : ${ref}`);
  return { s: Number(s), name: ch.transliteration, from, to, verses };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = Object.fromEntries(refs.sort((x, y) => { const [a, b] = x.split(":"), [c, d] = y.split(":"); return a - c || parseInt(b) - parseInt(d); }).map((r) => [r, extrait(r)]));
  const head = `/*\n * Extraits du Coran affichés dans les rappels.\n * FICHIER GÉNÉRÉ par scripts/extract-versets.mjs : ne pas modifier à la main.\n * Texte arabe : Encyclopédie du Noble Coran (quranenc.com). Traduction : Muhammad Hamidullah.\n * tests/versets.test.ts vérifie que chaque texte est identique à la source.\n */\nexport interface Extrait { s: number; name: string; from: number; to: number; verses: { n: number; ar: string; fr: string }[] }\n\nexport const EXTRAITS: Record<string, Extrait> = `;
  writeFileSync(new URL("../content/coran-extraits.ts", import.meta.url), head + JSON.stringify(out, null, 2) + ";\n");
  console.log(`${refs.length} passages, ${Object.values(out).reduce((n, e) => n + e.verses.length, 0)} versets.`);
}

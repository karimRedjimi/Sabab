// La bibliothèque d’invocations : « La Citadelle du musulman » (Hisn al-Muslim), classée par thème.
// Les textes viennent tels quels de content/citadelle.json (voir scripts/extract-citadelle.py).
import data from "@/content/citadelle.json";
import { ITEMS } from "@/content/programme";

export interface DuaLib { id: string; ar: string; ph: string; fr: string; src: string; srcAr?: string }
export interface Chapitre { n: number; title: string; theme: string; duas: DuaLib[] }
export const SOURCE_BIBLIO: string = data.source;
export const THEMES: { id: string; label: string }[] = data.themes;
export const CHAPITRES: Chapitre[] = data.chapters;

const PAR_ID = new Map<string, { d: DuaLib; c: Chapitre; rang: number }>();
for (const c of CHAPITRES) c.duas.forEach((d, i) => PAR_ID.set(d.id, { d, c, rang: i }));

/** Une invocation, qu’elle vienne du programme ou de la bibliothèque, sous une même forme. */
export function invocation(id: string): { title: string; ar?: string; ph?: string; fr?: string; src?: string } | null {
  const it = ITEMS[id];
  if (it) return { title: it.title, ar: it.ar, ph: it.ph, fr: it.fr, src: it.src };
  const x = PAR_ID.get(id);
  if (!x) return null;
  return { title: x.c.duas.length > 1 ? `${x.c.title} (${x.rang + 1})` : x.c.title, ar: x.d.ar, ph: x.d.ph, fr: x.d.fr, src: x.d.src || x.d.srcAr };
}
export const chapitreDe = (id: string) => PAR_ID.get(id)?.c || null;
export const nbParTheme = (t: string) => CHAPITRES.filter((c) => c.theme === t).reduce((n, c) => n + c.duas.length, 0);
export const TOTAL_BIBLIO = CHAPITRES.reduce((n, c) => n + c.duas.length, 0);

/** Recherche sans accents ni majuscules, dans les titres, la traduction et la phonétique. */
const plat = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'ʿʾ‘-]/g, " ").toLowerCase();
export function chercher(q: string): { c: Chapitre; d: DuaLib }[] {
  const mots = plat(q).split(/\s+/).filter((m) => m.length > 1);
  if (!mots.length) return [];
  const out: { c: Chapitre; d: DuaLib; score: number }[] = [];
  for (const c of CHAPITRES) {
    const t = plat(c.title);
    for (const d of c.duas) {
      const txt = t + " " + plat(d.fr) + " " + plat(d.ph);
      if (mots.every((m) => txt.includes(m))) out.push({ c, d, score: mots.filter((m) => t.includes(m)).length });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 40);
}

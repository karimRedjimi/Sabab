// Génère content/programme.ts et content/reglages.ts à partir du prototype.
// À n’exécuter qu’une fois, ou sur demande explicite du porteur du projet.
import { writeFileSync } from "node:fs";
import { loadPrototypeContent } from "./prototype.mjs";

const { content: C } = loadPrototypeContent();
const ident = /^[A-Za-z_$][\w$]*$/;
function ser(v, ind = "") {
  const n = ind + "  ";
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x !== "object")) return `[${v.map((x) => ser(x)).join(", ")}]`;
    return `[\n${v.map((x) => n + ser(x, n)).join(",\n")}\n${ind}]`;
  }
  if (v && typeof v === "object") {
    const e = Object.entries(v);
    const flat = e.every(([, x]) => typeof x !== "object" || x === null) && e.length <= 3 && JSON.stringify(v).length < 90;
    const kv = ([k, x]) => `${ident.test(k) ? k : JSON.stringify(k)}: ${ser(x, n)}`;
    if (flat) return `{ ${e.map(kv).join(", ")} }`;
    return `{\n${e.map((p) => n + kv(p)).join(",\n")}\n${ind}}`;
  }
  return JSON.stringify(v);
}
const HEAD = (what) => `/*\n * ${what}\n *\n * Copié à l’identique du prototype de référence (reference/rizq.html).\n * RÈGLE : ne jamais modifier un texte arabe, une phonétique, une traduction ou une source\n * sans demande explicite. Le test tests/content.test.ts vérifie l’identité avec le prototype.\n */\n`;
const decl = (name, type) => `export const ${name}${type ? `: ${type}` : ""} = ${ser(C[name])};\n`;

writeFileSync(new URL("../content/programme.ts", import.meta.url),
  HEAD("Contenu religieux du programme : invocations, sources, thèmes du jour, parcours.") +
  `import type { Grade, Item, Day, Parcours, ObjCat } from "./types";\n\n` +
  decl("GRADES", "Record<string, Grade>") + "\n" +
  decl("ITEMS", "Record<string, Item>") + "\n" +
  `/** Le socle quotidien. */\n` + decl("SOCLE", "string[]") +
  `/** Le minimum du jour. */\n` + decl("MINIMUM", "string[]") +
  `/** Semaine 1 du démarrage en douceur. */\n` + decl("RAMP1", "string[]") +
  decl("MOMENT_OF", "Record<string, \"matin\" | \"soir\">") + "\n" +
  `/** Indexé par Date.getDay() : 0 = dimanche. */\n` + decl("DAYS", "Day[]") + "\n" +
  decl("PARCOURS", "Record<string, Parcours>") + "\n" +
  decl("PARCOURS_DAYS") +
  decl("OBJ_CATS", "Record<string, ObjCat>"));

writeFileSync(new URL("../content/reglages.ts", import.meta.url),
  HEAD("Réglages et libellés de l’interface : villes, méthodes de calcul, niveaux d’arabe, seuils.") +
  `import type { City, Method, Level } from "./types";\n\n` +
  `/** [nom, latitude, longitude] */\n` + decl("CITIES", "City[]") + "\n" +
  decl("METHODS", "Record<string, Method>") + "\n" +
  decl("LEVELS", "Record<string, Level>") + "\n" +
  decl("MONTHS", "string[]") +
  `/** Seuil à partir duquel une journée est « tenue ». */\n` + decl("HELD") +
  `/** Intervalles de révision, en jours, par niveau. */\n` + decl("INTERVALS", "number[]") +
  `/** Niveau à partir duquel une invocation est « sue par cœur ». */\n` + decl("MASTER") + "\n" +
  `// Phase 2 : communauté\n` + decl("ENCOURAGEMENTS", "string[]") + decl("REQ_CATS", "Record<string, string>") +
  decl("KINDS", "Record<string, string>") + decl("DELAYS", "Record<string, string>") +
  decl("GROUP_NAMES", "Record<string, string>") + decl("MILESTONES", "number[]"));
console.log("Contenu généré.");

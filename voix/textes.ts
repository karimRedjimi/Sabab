// Copie À L’IDENTIQUE, par programme, les textes religieux depuis le dépôt de l’appli (jamais retapés).
//   cd <appli> && npx -y tsx <pubs>/voix/textes.ts <sortie.json> <clé>=<réf> ...
//   réf : programme:<id> | journee:<id> | citadelle:<hm-n> | parcours:<id>.actions.<n> | textes:<CHEMIN.vers.champ>
//   ex. : ar=programme:fajr  hadith=textes:MOMENTS_FAVORABLES.appel
import * as fs from "fs";
import { ITEMS, PARCOURS } from "@/content/programme";
import { JOURNEE_ITEMS } from "@/content/journee";
import * as TEXTES from "@/content/textes";
const CIT = JSON.parse(fs.readFileSync("content/citadelle.json", "utf8"));
const [out, ...specs] = process.argv.slice(2);
const res: Record<string, unknown> = {};
for (const s of specs) {
  const [cle, ref] = s.split("=");
  const [src, chemin] = ref.split(":");
  let v: any;
  if (src === "programme") v = (ITEMS as any)[chemin];
  else if (src === "journee") v = (JOURNEE_ITEMS as any)[chemin];
  else if (src === "citadelle") { for (const ch of CIT.chapters) for (const d of ch.duas) if (d.id === chemin) v = { ...d, chapitre: ch.title }; }
  else if (src === "parcours") v = chemin.split(".").reduce((o: any, k) => o?.[k], PARCOURS);
  else if (src === "textes") v = chemin.split(".").reduce((o: any, k) => o?.[k], TEXTES);
  if (v === undefined) throw new Error("introuvable : " + ref);
  res[cle] = { ref, ...(typeof v === "string" ? { texte: v } : v) };
}
fs.writeFileSync(out, JSON.stringify(res, null, 1));
console.log("textes copiés :", Object.keys(res).join(", "));

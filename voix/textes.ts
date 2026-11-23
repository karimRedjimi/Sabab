// Copie à l’identique, par programme, les textes religieux du dépôt de l’appli vers un JSON du studio.
//   npx -y tsx voix/textes.ts <appli> <sortie.json> <clé>=<fichier>:<chemin> ...
//   ex. dua=programme:ITEMS.fajr   dormir=citadelle:hm-115   appel=textes:MOMENTS_FAVORABLES.appel
// Rien n’est retapé : chaque valeur est lue dans content/ et écrite telle quelle (champ "_origine" pour la relecture).
import fs from "fs";
import path from "path";
(async () => {
  const [app, sortie, ...specs] = process.argv.slice(2);
  const res: Record<string, unknown> = {};
  for (const s of specs) {
    const [cle, ref] = s.split("="), [fichier, chemin] = ref.split(":");
    let v: any;
    if (fichier === "citadelle") {
      const d = JSON.parse(fs.readFileSync(path.join(app, "content/citadelle.json"), "utf8"));
      for (const c of d.chapters) for (const x of c.duas) if (x.id === chemin) v = { ...x, chapitre: c.title };
    } else {
      const m = await import(path.resolve(app, "content", fichier + ".ts"));
      v = chemin.split(".").reduce((o: any, k) => (o == null ? o : o[k]), m);
    }
    if (v == null) throw new Error(`introuvable : ${s}`);
    res[cle] = typeof v === "object" ? { ...v, _origine: `content/${fichier}${fichier === "citadelle" ? ".json" : ".ts"} · ${chemin}` } : v;
  }
  fs.writeFileSync(sortie, JSON.stringify(res, null, 1));
  console.log("écrit", sortie, Object.keys(res).join(", "));
})();

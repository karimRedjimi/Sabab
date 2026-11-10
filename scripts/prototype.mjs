// Lit les constantes de contenu du prototype de référence (reference/rizq.html)
// en exécutant uniquement les blocs de données, dans un bac à sable sans accès au reste.
import { readFileSync } from "node:fs";
import vm from "node:vm";

export function loadPrototypeContent(path = new URL("../reference/rizq.html", import.meta.url)) {
  const html = readFileSync(path, "utf8");
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const lines = script.split("\n");
  const from = (re) => lines.findIndex((l) => re.test(l));
  // Bloc 1 : de GRADES jusqu’à l’en-tête « ÉTAT ET SAUVEGARDE »
  const a = from(/^const GRADES/), b = from(/ÉTAT ET SAUVEGARDE/) - 1;
  const block1 = lines.slice(a, b).join("\n");
  const pick = (re) => { const i = from(re); let j = i; let depth = 0;
    do { for (const ch of lines[j]) { if (ch === "{" || ch === "[") depth++; if (ch === "}" || ch === "]") depth--; } j++; } while (depth > 0);
    return lines.slice(i, j).join("\n"); };
  const extra = [/^const MINIMUM/, /^const RAMP1/, /^const LEVELS/, /^const REQ_CATS/, /^const KINDS/, /^const DELAYS/, /^const GROUP_NAMES/, /^const MILESTONES/].map(pick).join("\n");
  const names = ["GRADES","ITEMS","SOCLE","MOMENT_OF","DAYS","PARCOURS","PARCOURS_DAYS","OBJ_CATS","CITIES","METHODS","ENCOURAGEMENTS","MONTHS","HELD","INTERVALS","MASTER","MINIMUM","RAMP1","LEVELS","REQ_CATS","KINDS","DELAYS","GROUP_NAMES","MILESTONES"];
  const code = `${block1}\n${extra}\n;({${names.join(",")}})`;
  return { content: vm.runInNewContext(code, Object.create(null), { timeout: 1000 }), html };
}

// Charge la logique pure du prototype (dates, horaires, modèle d’une journée) dans un bac à sable,
// avec un état S fourni, pour comparer son comportement à celui de lib/.
export function loadPrototypeLogic() {
  const { html } = loadPrototypeContent();
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  const lines = script.split("\n");
  const from = (re) => lines.findIndex((l) => re.test(l));
  const content = lines.slice(from(/^const GRADES/), from(/ÉTAT ET SAUVEGARDE/) - 1).join("\n");
  const logic = lines.slice(from(/^function pad/), from(/ÉLÉMENTS VISUELS/) - 1).join("\n");
  const learn = lines.slice(from(/^function maskText/), from(/^function renderApprendre/)).join("\n");
  const code = `${content}\nlet S = null;\n${logic}\n${learn}\n;({setS:x=>{S=x;for(const k in ptCache) delete ptCache[k];}, prayerTimes, structure, countable, dayPct, streaks, itemPct, rampWeek, parcoursDay})`;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  return vm.runInNewContext(code, { Date, Math, Object, Array, Set, String, Number, isNaN, esc }, { timeout: 2000 });
}

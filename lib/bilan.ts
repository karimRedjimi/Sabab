// Bilan de la semaine et du mois.
import { ITEMS } from "@/content/programme";
import { HELD } from "@/content/reglages";
import { keyOf, addDays, today } from "./dates";
import { dayPct, val, hasObjective, isLight, countable, itemPct, structure } from "./program";
import type { State, CarnetEntry } from "./state";

export type Kind = "semaine" | "mois";
export function periodRange(kind: Kind, ref: Date): [Date, Date] {
  if (kind === "semaine") return [ref, addDays(ref, 6)];
  return [ref, new Date(ref.getFullYear(), ref.getMonth() + 1, 0)];
}
export interface PeriodStats {
  n: number; held: number; sum: number; avg: number; ist: number; sal: number; obj: number; objN: number; light: number;
  objActs: { d: Date; text: string }[]; notes: { d: Date; text: string }[]; days: { d: Date; p: number | null }[];
  items: Record<string, { s: number; n: number }>; parc: number; pact: number; answered: CarnetEntry[]; added: number; mastered: string[];
}
export function periodStats(S: State, a: Date, b: Date): PeriodStats {
  const t = today();
  const st: PeriodStats = { n: 0, held: 0, sum: 0, avg: 0, ist: 0, sal: 0, obj: 0, objN: 0, objActs: [], light: 0, items: {}, parc: 0, pact: 0, notes: [], days: [], answered: [], added: 0, mastered: [] };
  for (let d = new Date(a); d <= b; d = addDays(d, 1)) {
    const k = keyOf(d);
    if (d > t || !S.start || k < S.start) { st.days.push({ d, p: null }); continue; }
    const p = dayPct(S, d); st.days.push({ d, p });
    st.n++; st.sum += p; if (p >= HELD) st.held++;
    st.ist += val(S, k, "istighfar:0"); st.sal += val(S, k, "salawat:0");
    const r = S.days[k];
    if (r && r.light) st.light++;
    if (hasObjective(S, d) && !isLight(S, d)) { st.objN++; if (val(S, k, "obj:0") >= 1) { st.obj++; if (r && r.objAct) st.objActs.push({ d, text: r.objAct }); } }
    for (const id of structure(S, d).parc) if (itemPct(S, k, id) >= 1) { if (id === "pact") st.pact++; else st.parc++; }
    if (r && r.note && r.note.trim()) st.notes.push({ d, text: r.note.trim() });
    for (const id of countable(S, d)) { if (id === "obj") continue; st.items[id] = st.items[id] || { s: 0, n: 0 }; st.items[id].s += itemPct(S, k, id); st.items[id].n++; }
  }
  st.avg = st.n ? st.sum / st.n : 0;
  const ak = keyOf(a), bk = keyOf(b);
  st.answered = S.carnet.filter((x) => x.status === "ok" && x.answered && x.answered >= ak && x.answered <= bk);
  st.added = S.carnet.filter((x) => x.date >= ak && x.date <= bk).length;
  st.mastered = Object.keys(S.learn).filter((id) => { const m = S.learn[id].mastered; return ITEMS[id] && m && m >= ak && m <= bk; });
  return st;
}
export const itemTitle = (id: string) => (id === "pact" ? "Le geste du parcours" : ITEMS[id] ? ITEMS[id].title : id);

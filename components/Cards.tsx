"use client";
import { GRADES, DAYS, ITEMS } from "@/content/programme";
import { HELD } from "@/content/reglages";
import { keyOf } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { dayPct, entryPct, getItem, itemPct, momentOf, slotsOf, val, type Entry, type ViewItem } from "@/lib/program";
import { IconCheck } from "./Icons";
import { buzz, useStore } from "./Store";

/** Textes arabe, phonétique et français, selon les préférences d’affichage. */
export function Texts({ it, withDesc = true }: { it: ViewItem; withDesc?: boolean }) {
  const { S } = useStore();
  return (
    <>
      {it.ar && S.show.ar && <p className="ar" lang="ar" dir="rtl">{it.ar}</p>}
      {it.ph && S.show.ph && <p className="ph">{it.ph}</p>}
      {it.fr && S.show.fr && <p className="fr">{it.fr}</p>}
      {withDesc && it.desc && <p className="desc">{it.desc}</p>}
    </>
  );
}

export function Badge({ it }: { it: ViewItem }) {
  if (it.optional) return <span className="badge g-opt">Facultatif</span>;
  if (!it.grade) return null;
  const g = GRADES[it.grade];
  return <span className={`badge ${g.cls}`}>{g.label}</span>;
}

/** « Pourquoi cette invocation » : ouvert ou fermé, mémorisé pendant la session. */
export function Why({ id, it }: { id: string; it: ViewItem }) {
  const { ui, setUi } = useStore();
  if (!it.note) return null;
  return (
    <details open={!!ui.openSet[id]} onToggle={(e) => { const open = (e.currentTarget as HTMLDetailsElement).open; if (open !== !!ui.openSet[id]) setUi((u) => ({ openSet: { ...u.openSet, [id]: open } })); }}>
      <summary>{it.kind === "action" ? "Pourquoi ce geste" : "Pourquoi cette invocation"}</summary>
      <p>{it.note}</p>
    </details>
  );
}

export function Source({ it }: { it: ViewItem }) {
  return it.src ? <p className="src"><b>Source :</b> {it.src}</p> : null;
}

type Act = "toggle" | "inc" | "dec" | "reset" | "set";
/** Cocher et compter, avec les messages du prototype. */
export function useCount() {
  const { S, update, ui, toast } = useStore();
  return (act: Act, k: string) => {
    const [id, si] = k.split(":");
    const slot = slotsOf(id)[+si];
    const dk = keyOf(ui.sel);
    const v = val(S, dk, k);
    if (act === "reset" && v === 0) return;
    const before = dayPct(S, ui.sel);
    let next = v;
    if (act === "toggle") { next = v >= 1 ? 0 : 1; buzz(12); }
    else if (act === "inc") { next = v + 1; buzz(8); }
    else if (act === "dec") next = Math.max(0, v - 1);
    else if (act === "set") { next = Math.max(v, slot.t); buzz(12); }
    else next = 0;
    let after = before;
    update((s) => {
      const r = ensureDay(s, dk); r.c = r.c || {};
      if (next) r.c[k] = next; else delete r.c[k];
      after = dayPct(s, ui.sel);
    });
    if (act === "inc" && next === slot.t) { buzz([20, 40, 20]); toast(`${slot.l} : ${slot.t} atteint`); }
    if (act === "reset") toast("Compteur remis à zéro", { label: "Annuler", run: () => update((x) => { ensureDay(x, dk).c[k] = v; }) });
    if (after >= 1 && before < 1) { toast("Journée complète, qu’Allah l’accepte"); buzz([30, 60, 30, 60, 30]); }
    else if (after >= HELD && before < HELD) toast("Journée tenue");
  };
}

/** Carte complète en lecture seule (page « Le programme »). */
export function ReadonlyCard({ id, theme }: { id: string; theme?: boolean }) {
  const it = ITEMS[id];
  return (
    <article className={`item${theme ? " theme-item" : ""}`} id={`card-${id}`}>
      <div className="itemhead"><div><h3>{it.title}</h3>{it.moment ? <p className="moment">{it.moment}</p> : null}</div><Badge it={it} /></div>
      <Texts it={it} />
      <Source it={it} />
      <Why id={id} it={it} />
    </article>
  );
}

export function DisplayChips() {
  const { S, update, toast } = useStore();
  const chip = (f: "ar" | "ph" | "fr", label: string) => (
    <button className="chip" aria-pressed={S.show[f]} onClick={() => {
      const others = (Object.keys(S.show) as ("ar" | "ph" | "fr")[]).filter((k) => k !== f && S.show[k]);
      if (S.show[f] && !others.length) { toast("Garde au moins un texte affiché"); return; }
      update((s) => { s.show[f] = !s.show[f]; });
    }}>{label}</button>
  );
  return (
    <div className="showbar" role="group" aria-label="Textes affichés">Afficher
      {chip("ar", "Arabe")}{chip("ph", "Phonétique")}{chip("fr", "Français")}
    </div>
  );
}

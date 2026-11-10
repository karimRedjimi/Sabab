"use client";
import { GRADES, DAYS, ITEMS } from "@/content/programme";
import { OBJ_CATS } from "@/content/programme";
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

type Act = "toggle" | "inc" | "dec" | "reset";
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
    else next = 0;
    let after = before;
    update((s) => {
      const r = ensureDay(s, dk); r.c = r.c || {};
      if (next) r.c[k] = next; else delete r.c[k];
      after = dayPct(s, ui.sel);
    });
    if (act === "inc" && next === slot.t) { buzz([20, 40, 20]); toast(`${slot.l} : ${slot.t} atteint`); }
    if (act === "reset") toast("Compteur remis à zéro");
    if (after >= 1 && before < 1) { toast("Journée complète, qu’Allah l’accepte"); buzz([30, 60, 30, 60, 30]); }
    else if (after >= HELD && before < HELD) toast("Journée tenue");
  };
}

export function Slots({ id, only }: { id: string; only?: number[] }) {
  const { S, ui } = useStore();
  const count = useCount();
  const dk = keyOf(ui.sel);
  return (
    <div className="slots">
      {slotsOf(id).map((s, i) => {
        if (only && !only.includes(i)) return null;
        const k = `${id}:${i}`, v = val(S, dk, k);
        if (s.t === 1)
          return (
            <button key={k} className="tog" aria-pressed={v >= 1} onClick={() => count("toggle", k)} data-k={k}>
              <span className="box"><IconCheck /></span>{s.l}
            </button>
          );
        const full = v >= s.t, w = Math.min(v / s.t, 1) * 100;
        return (
          <div className="counter" key={k}>
            <button className={`tap ${full ? "full" : ""}`} onClick={() => count("inc", k)} aria-label={`${s.l} : ${v} sur ${s.t}. Toucher pour compter`} data-k={k}>
              <span className="num">{v} <small>/ {s.t}</small></span>
              <span className="lbl">{s.l}{full ? " atteint" : ""}</span>
              <span className="bar"><i style={{ width: `${w}%` }} /></span>
            </button>
            <button className="mini" onClick={() => count("dec", k)} aria-label="Retirer un">−1</button>
            <button className="mini" onClick={() => count("reset", k)} aria-label={`Remettre ${s.l} à zéro`}>0</button>
          </div>
        );
      })}
    </div>
  );
}

export function ObjectiveCard() {
  const { S, ui, update } = useStore();
  const dk = keyOf(ui.sel), o = S.objective;
  const count = useCount();
  if (!o) return null;
  const done = itemPct(S, dk, "obj") >= 1;
  return (
    <article className={`item objective ${done ? "done" : ""}`} id="card-obj">
      <div className="itemhead"><div><h3>{o.title}</h3><p className="moment">{OBJ_CATS[o.cat]?.l || "Mon objectif"}</p></div></div>
      <label className="field" style={{ margin: "12px 0 0" }}>
        <span>Mon action concrète pour aujourd’hui</span>
        <input className="input" id="objact" maxLength={160} placeholder="Par exemple : envoyer deux candidatures"
          value={S.days[dk]?.objAct || ""} onChange={(e) => { const v = e.target.value; update((s) => { ensureDay(s, dk).objAct = v; }); }} />
      </label>
      <div className="slots">
        <button className="tog" data-k="obj:0" aria-pressed={val(S, dk, "obj:0") >= 1} onClick={() => count("toggle", "obj:0")}>
          <span className="box"><IconCheck /></span>Action faite
        </button>
      </div>
    </article>
  );
}

/** Carte compacte de la page Jour. */
export function EntryCard({ e }: { e: Entry }) {
  const { S, ui, setUi } = useStore();
  if (e.id === "obj") return <ObjectiveCard />;
  const d = ui.sel, dk = keyOf(d), it = getItem(S, e.id, d);
  const done = entryPct(S, dk, e) >= 1;
  const hasText = !!(it.ar || it.ph || it.fr || it.note || it.src);
  const defaultOpen = it.kind === "dua" && (S.learn[e.id]?.lvl || 0) < 3;
  const open = hasText && (e.id in ui.textState ? ui.textState[e.id] : defaultOpen);
  const cls = ["item", "compact"];
  if (e.origin === "theme" || e.origin === "parc") cls.push("theme-item");
  if (done) cls.push("done");
  const sub = e.id === "pact" ? it.moment : e.m === "jour" || e.m === "actions" || e.id === "fajr" ? momentOf(S, it, d) : "";
  return (
    <article className={cls.join(" ")} id={`card-${e.id}-${e.m}`}>
      <div className="itemhead">
        <div>
          <h3>{it.title}</h3>
          {sub ? <p className="moment">{sub}</p> : null}
          {(e.origin === "theme" || e.origin === "parc" || e.opt) && (
            <div>
              {e.origin === "theme" && <span className="tag t-theme">Thème du {DAYS[d.getDay()].name.toLowerCase()}</span>}
              {e.origin === "parc" && <span className="tag t-parc">Parcours</span>}
              {e.opt && <span className="tag">Facultatif aujourd’hui</span>}
            </div>
          )}
        </div>
        <Badge it={it} />
      </div>
      {it.desc && <p className="desc">{it.desc}</p>}
      {open && (<><Texts it={it} withDesc={false} /><Source it={it} /><Why id={e.id} it={it} /></>)}
      {hasText && (
        <button className="txtbtn" aria-expanded={open} onClick={() => setUi((u) => ({ textState: { ...u.textState, [e.id]: !open } }))}>
          {open ? "Masquer le texte" : it.kind === "dua" ? "Lire l’invocation" : "Voir la source"}
        </button>
      )}
      <Slots id={e.id} only={e.sl} />
    </article>
  );
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
    <div className="display" role="group" aria-label="Textes affichés">Afficher
      {chip("ar", "Arabe")}{chip("ph", "Phonétique")}{chip("fr", "Français")}
    </div>
  );
}

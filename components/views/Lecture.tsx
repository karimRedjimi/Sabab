"use client";
// Lecture guidée : une étape à la fois, en plein écran.
import { useEffect, useState } from "react";
import { GRADES } from "@/content/programme";
import { keyOf } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { dayPct, entryPct, getItem, momentOf, slotsOf, val, MOMENT_LABEL, type Entry } from "@/lib/program";
import { useCount } from "../Cards";
import { Star } from "../Star";
import { actionExample, objectiveIdea, objectiveTag, parcoursServesObjective, showObjective } from "@/lib/objective";
import { useStore } from "../Store";

function ShowChips() {
  const { S, update, toast } = useStore();
  const chip = (f: "ar" | "ph" | "fr", label: string) => (
    <button className="chip" aria-pressed={S.show[f]} onClick={() => {
      const others = (Object.keys(S.show) as ("ar" | "ph" | "fr")[]).filter((k) => k !== f && S.show[k]);
      if (S.show[f] && !others.length) { toast("Garde au moins un texte affiché"); return; }
      update((s) => { s.show[f] = !s.show[f]; });
    }}>{label}</button>
  );
  return <div className="show" role="group" aria-label="Textes affichés">{chip("ar", "Arabe")}{chip("ph", "Phonétique")}{chip("fr", "Français")}</div>;
}

function Step({ e, onNext, kicker }: { e: Entry; onNext: () => void; kicker: string | null }) {
  const { S, ui, update } = useStore();
  const count = useCount();
  const [why, setWhy] = useState(false);
  useEffect(() => setWhy(false), [e.id, e.m]);
  const d = ui.sel, dk = keyOf(d);
  const it = getItem(S, e.id, d);
  const si = e.sl[0], slot = slotsOf(e.id)[si], k = `${e.id}:${si}`, v = val(S, dk, k);
  const done = entryPct(S, dk, e) >= 1;
  const isObj = e.id === "obj";
  const hasText = !!(it.ar || it.ph || it.fr);
  const g = it.grade ? GRADES[it.grade] : null;
  const sub = isObj ? null : momentOf(S, it, d);
  const idea = isObj ? objectiveIdea(S, d) : null;

  return (
    <>
      <p className="eyebrow">{kicker || (isObj ? "Mon objectif" : MOMENT_LABEL[e.m])}</p>
      <h2>{isObj ? S.objective?.title : it.title}</h2>
      {!isObj && (e.id === "pact" ? it.moment : sub) && <p className="lsub">{e.id === "pact" ? it.moment : sub}</p>}
      {e.origin === "parc" && S.objective && parcoursServesObjective(S) && showObjective(S) && <p className="lfor">{objectiveTag(S)} : {S.objective.title}</p>}
      {(g || it.optional || e.opt) && (
        <div>
          {g ? <span className={`pill ${it.grade === "hasan" ? "hasan" : ""}`}>{g.label} {it.src && <span>{it.src}</span>}</span>
            : <span className="pill opt">Facultatif</span>}
        </div>
      )}
      <div className="ltxt">
        {isObj ? (
          <label className="field" style={{ margin: 0 }}>
            <span>Mon action concrète pour aujourd’hui</span>
            <input className="input" maxLength={160} placeholder={actionExample(S)} value={S.days[dk]?.objAct || ""}
              onChange={(ev) => { const t = ev.target.value; update((s) => { ensureDay(s, dk).objAct = t; }); }} />
            {idea && !S.days[dk]?.objAct?.trim() && (
              <button className="idea" onClick={() => update((s) => { ensureDay(s, dk).objAct = idea; })}><span>Une idée</span>{idea}</button>
            )}
          </label>
        ) : (
          <>
            {it.ar && S.show.ar && <p className="ar" lang="ar" dir="rtl">{it.ar}</p>}
            {it.ph && S.show.ph && <p className="ph">{it.ph}</p>}
            {it.fr && S.show.fr && <p className="fr">{it.fr}</p>}
            {it.desc && <p className="desc">{it.desc}</p>}
            {!g && it.src && <p className="src"><b>Source :</b> {it.src}</p>}
            {it.note && <button className="why" aria-expanded={why} onClick={() => setWhy(!why)}>{it.kind === "action" ? "Pourquoi ce geste ?" : "Pourquoi cette invocation ?"}</button>}
            {it.note && why && <p className="whytext">{it.note}</p>}
          </>
        )}
      </div>
      <div className="lact">
        {hasText && <ShowChips />}
        {slot.t > 1 ? (
          <>
            <button className={`tapper ${v >= slot.t ? "full" : ""}`} onClick={() => count("inc", k)} aria-label={`${slot.l} : ${v} sur ${slot.t}. Toucher pour compter`}>
              <b><span className="bump" key={v}>{v}</span> <small>/ {slot.t}</small></b>
              <span>{v >= slot.t ? "Objectif atteint" : "Touche pour compter"}</span>
              <span className="bar"><i style={{ width: `${Math.min(v / slot.t, 1) * 100}%` }} /></span>
            </button>
            <div className="tapsub">
              <button onClick={() => count("dec", k)} aria-label="Retirer un">−1</button>
              <button onClick={() => count("reset", k)}>Remettre à zéro</button>
            </div>
            <button className={`bigbtn ${v >= slot.t ? "" : "sec2"}`} style={{ marginTop: 10 }} onClick={onNext}>{v >= slot.t ? "Continuer" : "Continuer plus tard"}</button>
          </>
        ) : done ? (
          <>
            <button className="bigbtn" onClick={onNext}>Continuer</button>
            <button className="later" onClick={() => count("toggle", k)}>Marquer comme non fait</button>
          </>
        ) : (
          <>
            <button className="bigbtn" onClick={() => { count("set", k); onNext(); }}>{isObj ? "Action faite" : "C’est fait"}</button>
            <button className="later" onClick={onNext}>Plus tard</button>
          </>
        )}
      </div>
    </>
  );
}

export function Lecture() {
  const { S, ui, setUi } = useStore();
  const L = ui.lecture!;
  const close = () => { setUi(() => ({ lecture: null })); window.scrollTo(0, 0); };
  const next = () => { setUi((u) => (u.lecture ? { lecture: { ...u.lecture, i: u.lecture.i + 1 } } : {})); window.scrollTo(0, 0); };
  const finished = L.i >= L.queue.length;
  const dk = keyOf(ui.sel);
  const allDone = L.queue.every((e) => entryPct(S, dk, e) >= 1);
  const dayDone = dayPct(S, ui.sel) >= 1;
  return (
    <div className="lec">
      <div className="lbar">
        <button className="iconbtn" onClick={close} aria-label="Fermer la lecture">✕</button>
        {L.queue.length > 1 && <div className="steps" role="img" aria-label={`Étape ${Math.min(L.i + 1, L.queue.length)} sur ${L.queue.length}`}>{L.queue.map((_, i) => <i key={i} className={i <= L.i ? "on" : ""} />)}</div>}
      </div>
      {finished ? (
        <div className="fin lstep">
          <div className="star"><Star pct={allDone ? 1 : 0.5} /></div>
          <h2 className="display" style={{ fontSize: "1.8rem" }}>{dayDone ? "Journée complète" : allDone ? `${L.label} : c’est fait` : "Tu y reviendras"}</h2>
          <p className="lead" style={{ margin: 0 }}>{allDone ? "Qu’Allah l’accepte." : "Ce qui reste t’attend dans ta journée."}</p>
          <button className="bigbtn" style={{ marginTop: 18 }} onClick={close}>Revenir à ma journée</button>
        </div>
      ) : (
        <>
          <div className="lstep" key={L.i}><Step e={L.queue[L.i]} onNext={L.queue.length > 1 ? next : close} kicker={L.queue.length > 1 ? `${L.label} · ${L.i + 1} sur ${L.queue.length}` : null} /></div>
        </>
      )}
    </div>
  );
}

"use client";
// Lecture guidée : une étape à la fois, en plein écran.
import { useCallback, useEffect, useRef, useState } from "react";
import { IconLeft } from "../Icons";
import { GRADES } from "@/content/programme";
import { keyOf } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { dayPct, entryPct, getItem, momentOf, slotsOf, val, CORAN_AM, CORAN_PM, MOMENT_LABEL, type Entry } from "@/lib/program";
import { rappelsDuMoment, refLabel } from "@/lib/coran";
import { VERSETS_SOURCE } from "@/content/versets";
import { useCoranMark, useCount } from "../Cards";
import { Star } from "../Star";
import { Gratitude } from "../Moments";
import { actionExample, mergedGesture, objectiveIdea, objectiveTag, parcoursServesObjective, showObjective } from "@/lib/objective";
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

/** Le rappel du Coran dans la lecture guidée : les versets du moment, puis « J’ai lu ». */
function CoranStep({ e, onNext, kicker }: { e: Entry; onNext: () => void; kicker: string | null }) {
  const { S, ui } = useStore();
  const mark = useCoranMark();
  const began = useRef(0);
  useEffect(() => { began.current = Date.now(); }, [e.id]);
  const d = ui.sel, dk = keyOf(d), m = e.m === "soir" ? "soir" : "matin";
  const list = rappelsDuMoment(S, d, m), done = entryPct(S, dk, e) >= 1;
  const again = m === "soir" && rappelsDuMoment(S, d, "matin")[0]?.ref === list[0]?.ref;
  const showAr = S.show.ar, showFr = S.show.fr;
  return (
    <>
      <p className="eyebrow">{kicker || MOMENT_LABEL[e.m]}</p>
      <h2>Rappel du Coran</h2>
      {again && <p className="lsub">Le verset de ce matin, à relire ce soir</p>}
      <div className="ltxt qlist">
        {list.map((r) => (
          <article className="qpass" key={r.ref}>
            <span className={`qtag ${r.themed ? "th" : ""}`}>{r.tag}</span>
            {r.verses.map((v) => (
              <div className="qv" key={v.n}>
                {showAr && <p className="ar qar" lang="ar" dir="rtl">{v.ar}</p>}
                {S.show.ph && <p className="ph">{v.ph}</p>}
                {showFr && <p className="qfr">{r.verses.length > 1 && <sup>{v.n}</sup>}{v.fr}</p>}
              </div>
            ))}
            <p className="qref">{refLabel(r)}</p>
          </article>
        ))}
        <p className="qsrc">{VERSETS_SOURCE.traduction}. {VERSETS_SOURCE.arabe}.{S.show.ph ? ` ${VERSETS_SOURCE.phonetique}.` : ""}</p>
      </div>
      <div className="lact">
        <ShowChips />
        {done ? (
          <>
            <button className="bigbtn" onClick={onNext}>Continuer</button>
            <button className="later" onClick={() => mark(e, false)}>Marquer comme non lu</button>
          </>
        ) : (
          <>
            <button className="bigbtn" onClick={() => { mark(e, true, Math.min(1800, Math.max(1, Math.round((Date.now() - began.current) / 1000)))); onNext(); }}>J’ai lu</button>
            <button className="later" onClick={onNext}>Plus tard</button>
          </>
        )}
      </div>
    </>
  );
}

function Step(props: { e: Entry; onNext: () => void; kicker: string | null }) {
  return props.e.id === CORAN_AM || props.e.id === CORAN_PM ? <CoranStep {...props} /> : <ItemStep {...props} />;
}

function ItemStep({ e, onNext, kicker }: { e: Entry; onNext: () => void; kicker: string | null }) {
  const { S, ui, update } = useStore();
  const count = useCount();
  const [why, setWhy] = useState(false);
  const [editing, setEditing] = useState(false);
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
  const gesture = isObj ? mergedGesture(S, d) : null;
  const own = !!S.days[dk]?.objAct?.trim();

  return (
    <>
      <p className="eyebrow">{kicker || (isObj ? "Mon objectif" : MOMENT_LABEL[e.m])}</p>
      <h2>{isObj ? (gesture ? "Agir" : S.objective?.title) : e.id === "pact" ? "Ton geste du jour" : it.title}</h2>
      {!isObj && (e.id === "pact" ? it.moment : sub) && <p className="lsub">{e.id === "pact" ? it.moment : sub}</p>}
      {e.origin === "parc" && S.objective && parcoursServesObjective(S) && showObjective(S) && <p className="lfor">{objectiveTag(S)} : {S.objective.title}</p>}
      {(g || it.optional || e.opt) && (
        <div>
          {g ? <span className={`pill ${it.grade === "hasan" ? "hasan" : ""}`}>{g.label} {it.src && <span>{it.src}</span>}</span>
            : <span className="pill opt">Facultatif</span>}
        </div>
      )}
      <div className="ltxt">
        {isObj && gesture ? (
          <>
            {!own && <p className="desc lmain">{gesture}</p>}
            {!own && <p className="lsub" style={{ margin: 0 }}><b style={{ color: "var(--accent)" }}>Proposé par ton parcours.</b> Tu peux le remplacer par ta propre action.</p>}
            {own || editing ? (
              <label className="field" style={{ margin: 0 }}>
                <span>Ton action pour aujourd’hui</span>
                <input className="input" maxLength={160} autoFocus={editing && !own} enterKeyHint="done" onKeyDown={(ev) => { if (ev.key === "Enter") ev.currentTarget.blur(); }}
                  placeholder={actionExample(S)} value={S.days[dk]?.objAct || ""}
                  onChange={(ev) => { const t = ev.target.value; update((s) => { ensureDay(s, dk).objAct = t; }); }} />
                {own && <button className="link" onClick={() => { update((s) => { ensureDay(s, dk).objAct = ""; }); setEditing(false); }}>Revenir au geste proposé</button>}
              </label>
            ) : <button className="link" style={{ alignSelf: "flex-start" }} onClick={() => setEditing(true)}>Écrire ma propre action</button>}
          </>
        ) : isObj ? (
          <label className="field" style={{ margin: 0 }}>
            <span>Mon action concrète pour aujourd’hui</span>
            <input className="input" maxLength={160} enterKeyHint="done" onKeyDown={(ev) => { if (ev.key === "Enter") ev.currentTarget.blur(); }} placeholder={actionExample(S)} value={S.days[dk]?.objAct || ""}
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
            {it.desc && <p className={hasText ? "desc" : "desc lmain"}>{it.desc}</p>}
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
              <button onClick={() => count("reset", k)} disabled={v === 0}>Remettre à zéro</button>
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

/** Le moment d’intention : quelques secondes avant d’invoquer pour son objectif. */
function Intention({ onDone }: { onDone: () => void }) {
  const { S } = useStore();
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <button className="intent" onClick={onDone} aria-label="Continuer vers les invocations">
      <span className="istar"><Star pct={1} /></span>
      <span className="eyebrow">Avant d’invoquer</span>
      <span className="ih">Tu demandes à Allah :<br /><em>{S.objective?.title}</em></span>
      {S.objective?.why && <span className="iq">« {S.objective.why} »</span>}
      <span className="ihint">Prends une respiration…</span>
      <span className="ibar"><i /></span>
    </button>
  );
}

export function Lecture() {
  const { S, ui, setUi, update } = useStore();
  const L = ui.lecture!;
  const today0 = keyOf(new Date());
  const endIntention = useCallback(() => update((s) => { s.lastIntention = today0; }), [update, today0]);
  // Le remerciement de fin reste affiché pendant qu’on l’écrit.
  const [askGratitude] = useState(() => !S.gratitude?.[today0]?.trim());
  const head = useRef<HTMLDivElement>(null);
  useEffect(() => { window.scrollTo(0, 0); head.current?.focus({ preventScroll: true }); }, [L.i]);
  if (L.intention && S.objective && S.lastIntention !== today0 && L.i === 0) return <Intention onDone={endIntention} />;
  const close = () => setUi(() => ({ lecture: null }));
  const go = (n: number) => setUi((u) => (u.lecture ? { lecture: { ...u.lecture, i: Math.max(0, u.lecture.i + n) } } : {}));
  const finished = L.i >= L.queue.length;
  const dk = keyOf(ui.sel);
  const allDone = L.queue.every((e) => entryPct(S, dk, e) >= 1);
  const dayDone = dayPct(S, ui.sel) >= 1;
  const many = L.queue.length > 1;
  return (
    <div className="lec">
      <div className="lbar">
        {many && <button className="iconbtn" onClick={() => go(-1)} disabled={L.i === 0} aria-label="Étape précédente"><IconLeft /></button>}
        {many ? <div className="steps" role="img" aria-label={`Étape ${Math.min(L.i + 1, L.queue.length)} sur ${L.queue.length}`}>{L.queue.map((_, i) => <i key={i} className={i <= L.i ? "on" : ""} />)}</div> : <span style={{ flex: 1 }} />}
        <button className="iconbtn" onClick={close} aria-label="Fermer la lecture">✕</button>
      </div>
      <div ref={head} tabIndex={-1} className="lfocus" aria-label={finished ? "Lecture terminée" : `Étape ${L.i + 1} sur ${L.queue.length}`} />
      {finished ? (
        <div className="fin lstep">
          <div className="star"><Star pct={allDone ? 1 : 0.5} /></div>
          <h2 className="display" style={{ fontSize: "1.8rem" }}>{dayDone ? "Journée complète" : allDone ? `${L.label} : c’est fait` : "Tu y reviendras"}</h2>
          <p className="lead" style={{ margin: 0 }}>{allDone ? "Qu’Allah l’accepte." : "Ce qui reste t’attend dans ta journée."}</p>
          {allDone && askGratitude && <div style={{ width: "100%", marginTop: 14 }}><Gratitude compact /></div>}
          <button className="bigbtn" style={{ marginTop: 18 }} onClick={close}>Revenir à ma journée</button>
        </div>
      ) : (
        <div className="lstep" key={L.i}><Step e={L.queue[L.i]} onNext={many ? () => go(1) : close} kicker={many ? `${L.label} · ${L.i + 1} sur ${L.queue.length}` : null} /></div>
      )}
    </div>
  );
}

"use client";
// Le journal du soir : « Clôturer ta journée » en trois questions, et « Ton ciel » des bienfaits.
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { EXTRAITS } from "@/content/coran-extraits";
import { keyOf, sameDay, today } from "@/lib/dates";
import { DEMAIN_IDEES, GRATITUDE_IDEES, etoiles, gratitudeDe, intentionDHier, journeeClose, placeEtoile, souvenir } from "@/lib/journal";
import { mergedGesture } from "@/lib/objective";
import { val } from "@/lib/program";
import { ensureDay } from "@/lib/state";
import { starPoints } from "./Star";
import { buzz, useStore } from "./Store";

const V147 = EXTRAITS["14:7"];
const fmtJour = (dk: string) => { const [y, m, d] = dk.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); };

/** La dernière étape du fil de la journée. */
export function ClotureRow({ onOpen }: { onOpen: () => void }) {
  const { S, ui } = useStore();
  const dk = keyOf(ui.sel), g = gratitudeDe(S, dk), clos = journeeClose(S, dk), n = etoiles(S).length;
  const sub = clos ? `${n} étoile${n > 1 ? "s" : ""} dans ton ciel` : g ? "Al-hamdulillâh noté · à terminer" : "3 questions · 30 secondes";
  return (
    <button className={`rowi sum clot ${clos ? "done" : ""}`} onClick={onOpen} aria-label={`Clôturer ta journée : ${sub}`}>
      <span className="gtile t-clot" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" /><polygon points={starPoints(17.5, 6.5, 2.6)} /></svg></span>
      <span className="rbody"><span className="rt"><b>{clos ? "Ta journée est close" : "Clôturer ta journée"}</b><small>{sub}</small></span></span>
      <span className="expand go" aria-hidden="true"><span className="chev" /></span>
    </button>
  );
}

/** Ce que la personne a écrit, une fois la journée close : une carte scellée. */
export function ClotureResume({ onEdit }: { onEdit: () => void }) {
  const { S, ui } = useStore();
  const dk = keyOf(ui.sel), r = S.days[dk], g = gratitudeDe(S, dk);
  if (!journeeClose(S, dk) || (!g && !r?.note?.trim() && !r?.demain?.trim())) return null;
  return (
    <div className="jseal">
      {g && <p><span className="jl">Al-hamdulillâh</span>{g}</p>}
      {r?.note?.trim() && <p><span className="jl">Aujourd’hui</span>{r.note.trim()}</p>}
      {r?.demain?.trim() && <p><span className="jl">Pour demain</span>{r.demain.trim()}</p>}
      <button className="link" onClick={onEdit}>Modifier</button>
    </div>
  );
}

/** L’intention notée hier soir, rappelée ce matin. */
export function IntentionDuJour() {
  const { S, ui } = useStore();
  if (!sameDay(ui.sel, today())) return null;
  const t = intentionDHier(S, ui.sel);
  if (!t) return null;
  return <p className="jhier"><span aria-hidden="true">✦</span> Ton intention d’hier soir : <b>{t}</b></p>;
}

/** Une fois par semaine : « Il y a 30 jours, tu remerciais Allah pour… » */
export function Souvenir() {
  const { S, update } = useStore();
  const s = souvenir(S, today());
  if (!s) return null;
  const vu = () => update((x) => { x.souvenirVu = keyOf(today()); });
  return (
    <div className="banner soft souv">
      <svg className="souvst" viewBox="0 0 100 100" aria-hidden="true"><polygon points={starPoints(50, 50, 46)} /></svg>
      <div><b>Il y a {s.jours} jours, tu remerciais Allah pour :</b><span>« {s.text} »</span>
        <div className="row" style={{ marginTop: 8, gap: 16 }}>
          <Link className="act" href="/suivi#ciel" onClick={vu}>Voir ton ciel</Link>
          <button className="act" style={{ color: "var(--muted)" }} onClick={vu}>Al-hamdulillâh</button>
        </div>
      </div>
    </div>
  );
}

/** Le ciel des bienfaits : une étoile par al-hamdulillâh, reliées dans l’ordre des jours. */
export function Ciel({ max = 40, nouvelle, onPick, sel }: { max?: number; nouvelle?: string; onPick?: (dk: string) => void; sel?: string | null }) {
  const { S } = useStore();
  const all = etoiles(S), l = all.slice(-max);
  const pts = l.map((e, i) => ({ ...e, ...placeEtoile(i, e.dk, l.length) }));
  return (
    <svg className="ciel" viewBox="0 0 360 220" role="img" aria-label={`${all.length} bienfait${all.length > 1 ? "s" : ""} dans ton ciel`}>
      <polyline className="cfil" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} />
      {pts.map((p, i) => (
        <g key={p.dk} className={`cst ${p.dk === nouvelle ? "new" : ""} ${p.dk === sel ? "sel" : ""}`} style={{ "--i": i } as CSSProperties}
          onClick={onPick ? () => onPick(p.dk) : undefined} role={onPick ? "button" : undefined} tabIndex={onPick ? 0 : undefined}
          aria-label={onPick ? `${fmtJour(p.dk)} : ${p.text}` : undefined} onKeyDown={onPick ? (e) => { if (e.key === "Enter") onPick(p.dk); } : undefined}>
          <circle cx={p.x} cy={p.y} r={p.r + 9} className="chalo" />
          <polygon points={starPoints(p.x, p.y, p.r)} />
        </g>
      ))}
    </svg>
  );
}

/** « Ton ciel » dans le Suivi. */
export function CielSection() {
  const { S } = useStore();
  const all = etoiles(S);
  const [sel, setSel] = useState<string | null>(null);
  const cur = all.find((e) => e.dk === sel) || all[all.length - 1];
  return (
    <section className="sec" id="ciel">
      <div className="sechead"><h2>Ton ciel</h2><span className="count">{all.length} bienfait{all.length > 1 ? "s" : ""}</span></div>
      <div className="cielbox">
        <Ciel onPick={setSel} sel={cur?.dk} />
        {cur ? <p className="cielsel"><small>{fmtJour(cur.dk)}</small>« {cur.text} »</p>
          : <p className="cielsel"><small>Ton ciel est encore vide</small>Chaque soir, un al-hamdulillâh devient une étoile.</p>}
      </div>
    </section>
  );
}

/** Le rituel du soir, plein écran : trois questions, puis l’étoile qui rejoint le ciel. */
export function Rituel({ onClose }: { onClose: () => void }) {
  const { S, ui, update } = useStore();
  const dk = keyOf(ui.sel);
  const geste = mergedGesture(S, ui.sel);
  const [step, setStep] = useState(0);
  const [g, setG] = useState(S.gratitude?.[dk] || "");
  const [note, setNote] = useState(S.days[dk]?.note || "");
  const [demain, setDemain] = useState(S.days[dk]?.demain || "");
  const fait = val(S, dk, "pact:0") >= 1;
  useEffect(() => {
    document.documentElement.classList.add("immersive");
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => { document.documentElement.classList.remove("immersive"); window.removeEventListener("keydown", k); };
  }, [onClose]);

  const suivant = () => { buzz(8); setStep((s) => s + 1); };
  const valider = () => {
    if (step === 0) update((s) => { s.gratitude = { ...(s.gratitude || {}), [dk]: g.trim() }; });
    if (step === 1) update((s) => { ensureDay(s, dk).note = note.trim(); });
    if (step === 2) update((s) => { const r = ensureDay(s, dk); r.demain = demain.trim(); r.clos = true; });
    suivant();
  };
  const cocher = () => update((s) => { const r = ensureDay(s, dk); r.c["pact:0"] = fait ? 0 : 1; });
  const n = etoiles(S).length;

  const Q = [
    { eye: "1 sur 3 · Al-hamdulillâh", h: "Pour quoi remercies-tu Allah aujourd’hui ?", ok: g.trim().length > 0 },
    { eye: "2 sur 3 · Ta journée", h: geste ? "Un pas vers ton besoin, aujourd’hui ?" : "Qu’est-ce qui a avancé, ou bloqué ?", ok: note.trim().length > 0 || fait },
    { eye: "3 sur 3 · Pour demain", h: "Ton intention pour demain ?", ok: demain.trim().length > 0 },
  ];
  return (
    <div className="rit" role="dialog" aria-modal="true" aria-label="Clôturer ta journée">
      <div className={`ritsky s${Math.min(step, 3)}`} aria-hidden="true"><i className="ritmoon" /></div>
      <div className="rittop">
        <span className="ritdots" aria-hidden="true">{[0, 1, 2].map((i) => <i key={i} className={i < step ? "ok" : i === step ? "on" : ""} />)}</span>
        <button className="ritx" onClick={onClose} aria-label="Fermer">×</button>
      </div>
      {step < 3 ? (
        <div className="ritstep" key={step}>
          <p className="riteye">{Q[step].eye}</p>
          <h1>{Q[step].h}</h1>
          {step === 0 && <>
            <textarea className="ritin" rows={2} maxLength={140} autoFocus value={g} placeholder="Par exemple : la santé de mes parents" enterKeyHint="done"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (g.trim()) valider(); } }} onChange={(e) => setG(e.target.value)} />
            <div className="ritchips">{GRATITUDE_IDEES.map((t) => <button key={t} className={g === t ? "on" : ""} onClick={() => setG(t)}>{t}</button>)}</div>
          </>}
          {step === 1 && <>
            {geste && (
              <button className={`ritgeste ${fait ? "on" : ""}`} onClick={cocher} aria-pressed={fait}>
                <span className="ritck" aria-hidden="true">{fait && <svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}</span>
                <span><small>Le geste du jour</small>{geste}</span>
              </button>
            )}
            <textarea className="ritin" rows={3} maxLength={400} value={note} placeholder={geste ? "Ou ce que tu as fait d’autre, ce qui a bloqué…" : "Ton intention, ce qui a bloqué ou avancé…"} onChange={(e) => setNote(e.target.value)} />
          </>}
          {step === 2 && <>
            <textarea className="ritin" rows={2} maxLength={140} value={demain} placeholder="Par exemple : prier le Fajr à l’heure" enterKeyHint="done"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); valider(); } }} onChange={(e) => setDemain(e.target.value)} />
            <div className="ritchips">{DEMAIN_IDEES.map((t) => <button key={t} className={demain === t ? "on" : ""} onClick={() => setDemain(t)}>{t}</button>)}</div>
            <p className="ritnote">Demain matin, l’appli te la rappellera.</p>
          </>}
          <div className="ritcta">
            <button className="bigbtn" disabled={!Q[step].ok} onClick={valider}>{step === 2 ? "Clôturer ma journée" : "Valider"}</button>
            <button className="ritskip" onClick={step === 2 ? () => { update((s) => { ensureDay(s, dk).clos = true; }); suivant(); } : suivant}>Passer</button>
          </div>
        </div>
      ) : (
        <div className="ritstep ritfin">
          <div className="ritciel"><Ciel nouvelle={gratitudeDe(S, dk) ? dk : undefined} /></div>
          <p className="riteye">{gratitudeDe(S, dk) ? `Une étoile de plus · ${n} dans ton ciel` : "Journée close"}</p>
          <h1>Journée close,<br />qu’Allah l’accepte.</h1>
          {V147 && (
            <figure className="ritv">
              <p className="ar" lang="ar" dir="rtl">{V147.verses[0].ar}</p>
              <blockquote>{V147.verses[0].fr}</blockquote>
              <figcaption>Coran, sourate {V147.name} ({V147.s}), verset {V147.from}</figcaption>
            </figure>
          )}
          <div className="ritcta">
            <Link className="bigbtn" href="/suivi#ciel" onClick={onClose}>Voir ton ciel</Link>
            <button className="ritskip" onClick={onClose}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Le bloc « Clôturer ta journée » complet : la ligne, le résumé scellé, et le rituel. */
export function useRituel() {
  const [open, setOpen] = useState(false);
  // Ouverte depuis la notification du soir : on lance le rituel directement.
  useEffect(() => {
    const u = new URL(window.location.href);
    if (u.searchParams.get("journal") !== "1") return;
    setOpen(true);
    u.searchParams.delete("journal");
    window.history.replaceState(window.history.state, "", u.pathname + u.search);
  }, []);
  return { open, setOpen };
}

/** Al-hamdulillâh compact (fin de lecture) : avec un vrai bouton « Enregistrer » et une carte scellée. */
export function GratitudeRapide() {
  const { S, update } = useStore();
  const dk = keyOf(today()), saved = gratitudeDe(S, dk);
  const [v, setV] = useState(saved);
  const [edit, setEdit] = useState(!saved);
  const save = () => { if (!v.trim()) return; buzz(10); update((s) => { s.gratitude = { ...(s.gratitude || {}), [dk]: v.trim() }; }); setEdit(false); };
  if (!edit && saved) return (
    <div className="gsealed"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points={starPoints(50, 50, 46)} /></svg>
      <span><small>Al-hamdulillâh · enregistré</small>{saved}</span><button className="link" onClick={() => setEdit(true)}>Modifier</button></div>
  );
  return (
    <section className="grat compact">
      <label htmlFor="grat-c"><b>Al-hamdulillâh</b><span>Une chose pour laquelle tu remercies Allah aujourd’hui</span></label>
      <div className="gform">
        <input id="grat-c" className="input" maxLength={140} enterKeyHint="done" value={v} placeholder="Par exemple : la santé de mes parents"
          onKeyDown={(e) => { if (e.key === "Enter") save(); }} onChange={(e) => setV(e.target.value)} />
        <button className="gsave" disabled={!v.trim()} onClick={save}>Enregistrer</button>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import { ITEMS, SOCLE } from "@/content/programme";
import { MASTER } from "@/content/reglages";
import { fmtShort, fromKey, keyOf, today } from "@/lib/dates";
import { DUA_IDS, dueIds, grade, maskText } from "@/lib/learn";
import { useStore } from "../Store";
import { PARCOURS } from "@/content/programme";
import { objectiveTag, parcoursServesObjective, showObjective } from "@/lib/objective";

function Masked({ text, lvl, isAr }: { text: string; lvl: number; isAr: boolean }) {
  const parts = maskText(text, lvl, isAr);
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 ? " " : ""}
          {"word" in p ? p.word : <span className="mask" style={{ width: `${p.mask}em` }} role="img" aria-label="mot masqué" />}
        </span>
      ))}
    </>
  );
}

interface Study { queue: string[]; i: number; revealed: boolean }

function StudyCard({ study, setStudy }: { study: Study; setStudy: (s: Study | null) => void }) {
  const { S, update, toast } = useStore();
  const id = study.queue[study.i], it = ITEMS[id], L = S.learn[id] || { lvl: 0 };
  const lvl = study.revealed ? 0 : Math.min(L.lvl, 3);
  const first = L.lvl === 0;
  const instr = first ? "Découverte : lis-la trois fois à voix haute en suivant le texte."
    : L.lvl >= 3 ? "Récite-la de mémoire, puis révèle le texte pour vérifier." : "Récite-la en complétant les mots masqués, puis vérifie.";
  const answer = (ok: boolean) => {
    let mastered = false;
    update((s) => { mastered = grade(s, id, ok); });
    if (mastered) toast(`${it.title} : sue par cœur, mâ shâ’ Allâh`);
    const i = study.i + 1;
    if (i >= study.queue.length) { setStudy(null); toast("Révision terminée"); }
    else setStudy({ ...study, i, revealed: false });
    window.scrollTo(0, 0);
  };
  return (
    <div className="study">
      <p className="step">{study.i + 1} sur {study.queue.length}</p>
      <h2>{it.title}</h2>
      <p className="secintro" style={{ margin: "2px 0 0" }}>{instr}</p>
      <div className="cue">{it.fr}</div>
      {it.ar && <p className="ar" lang="ar" dir="rtl"><Masked text={it.ar} lvl={lvl} isAr /></p>}
      {it.ph && <p className="ph"><Masked text={it.ph} lvl={lvl} isAr={false} /></p>}
      <div className="studyactions">
        {first ? <button className="ok" onClick={() => answer(true)}>C’est lu, je continue</button>
          : study.revealed ? (<><button onClick={() => answer(false)}>À revoir</button><button className="ok" onClick={() => answer(true)}>Je l’ai sue</button></>)
          : <button className="ok" onClick={() => setStudy({ ...study, revealed: true })}>Révéler le texte</button>}
      </div>
      <p style={{ margin: "16px 0 0" }}><button className="link" onClick={() => setStudy(null)}>Arrêter la révision</button></p>
    </div>
  );
}

export function Apprendre() {
  const { S, update, toast } = useStore();
  const [study, setStudy] = useState<Study | null>(null);
  if (study) return <StudyCard study={study} setStudy={setStudy} />;
  const due = dueIds(S), tk = keyOf(today());
  const socleMastered = SOCLE.filter((id) => (S.learn[id]?.lvl || 0) >= MASTER).length;
  const totalMastered = Object.keys(S.learn).filter((id) => S.learn[id].lvl >= MASTER).length;
  return (
    <>
      <div className="page">
        <h1>Apprendre par cœur</h1>
        <p className="lead">Chaque invocation revient au bon moment, un peu plus masquée à chaque révision. Objectif : le socle en 30 jours.</p>
      </div>
      <div className="stats">
        <div className="stat"><b>{socleMastered} / {SOCLE.length}</b><span>du socle sues par cœur</span><div className="learnbar"><i style={{ width: `${(socleMastered / SOCLE.length) * 100}%` }} /></div></div>
        <div className="stat"><b>{totalMastered}</b><span>invocations sues au total</span></div>
      </div>
      {(() => {
        if (!S.parcours || !parcoursServesObjective(S) || !showObjective(S)) return null;
        const id = PARCOURS[S.parcours.id].duas.find((x) => (S.learn[x]?.lvl || 0) < MASTER);
        if (!id) return null;
        const inLearn = !!S.learn[id];
        return (
          <div className="banner warm">
            <div><b>{objectiveTag(S)}</b><span>Apprends par cœur « {ITEMS[id].title} »</span></div>
            {inLearn ? <span className="act" style={{ color: "var(--muted)" }}>En révision</span>
              : <button className="act" onClick={() => { update((s) => { s.learn[id] = { lvl: 0, next: keyOf(today()) }; }); toast("Ajoutée à tes révisions"); }}>Ajouter</button>}
          </div>
        );
      })()}
      {due.length ? (
        <button className="navbtn primary" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: "1.05rem", marginBottom: 26 }}
          onClick={() => { setStudy({ queue: due, i: 0, revealed: false }); window.scrollTo(0, 0); }}>
          Réviser {due.length} invocation{due.length > 1 ? "s" : ""} maintenant
        </button>
      ) : <p className="empty" style={{ margin: "0 0 26px" }}>Rien à réviser aujourd’hui. Reviens demain, ou ajoute une invocation ci-dessous.</p>}
      <section className="sec">
        <div className="sechead"><h2>Toutes les invocations</h2><span className="count">{Object.keys(S.learn).length} en révision</span></div>
        <div className="list">{DUA_IDS.map((id) => {
          const it = ITEMS[id], L = S.learn[id], lvl = L ? L.lvl : -1;
          const status = !L ? "Pas encore dans tes révisions" : lvl >= MASTER ? "Sue par cœur" : L.next <= tk ? "À réviser aujourd’hui" : `Prochaine révision le ${fmtShort(fromKey(L.next))}`;
          return (
            <div className="lrow" key={id}>
              <div>
                <div className="lt">{it.title}</div>
                <div className="ls">{status}</div>
                {L && <div className="lv" role="img" aria-label={`Niveau ${Math.min(lvl, MASTER)} sur ${MASTER}`}>{Array.from({ length: MASTER }, (_, i) => <i key={i} className={i < lvl ? "on" : ""} />)}</div>}
              </div>
              {L ? <button className="link danger" onClick={() => update((s) => { delete s.learn[id]; })}>Retirer</button>
                : <button className="navbtn" onClick={() => { update((s) => { s.learn[id] = { lvl: 0, next: keyOf(today()) }; }); toast("Ajoutée à tes révisions"); }}>Ajouter</button>}
            </div>
          );
        })}</div>
      </section>
    </>
  );
}

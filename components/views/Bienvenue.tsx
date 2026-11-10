"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OBJ_CATS, PARCOURS, PARCOURS_DAYS } from "@/content/programme";
import { LEVELS } from "@/content/reglages";
import { keyOf, today } from "@/lib/dates";
import { prayerTimes, hm } from "@/lib/prayer";
import { rampWeek } from "@/lib/program";
import { ensureDay } from "@/lib/state";
import { CityPicker } from "../Prayer";
import { Star } from "../Star";
import { useStore } from "../Store";

export function Bienvenue() {
  const { S, update, setUi, toast } = useStore();
  const router = useRouter();
  // Refaire l’accueil : on repart des choix déjà faits.
  const [OB, setOB] = useState(() => S.onboarded
    ? { step: 0, cat: S.objective?.cat || null, title: S.objective?.title || "", level: S.level, ramp: !!rampWeek(S, today()), parc: true }
    : { step: 0, cat: null as string | null, title: "", level: null as string | null, ramp: true, parc: true });
  const set = (p: Partial<typeof OB>) => setOB((o) => ({ ...o, ...p }));
  const next = () => { set({ step: OB.step + 1 }); window.scrollTo(0, 0); };
  const back = () => set({ step: Math.max(0, OB.step - 1) });
  const st = OB.step;
  const P = S.prayer;

  const finish = () => {
    const tk = keyOf(today());
    update((s) => {
      s.onboarded = true;
      if (OB.cat) s.objective = { title: OB.title || OBJ_CATS[OB.cat].l, cat: OB.cat, why: "", since: s.objective?.since || tk };
      if (OB.level) { s.level = OB.level; s.show = { ...LEVELS[OB.level].show }; }
      const pid = OB.cat ? OBJ_CATS[OB.cat].p : null;
      if (OB.parc && pid && PARCOURS[pid] && s.parcours?.id !== pid) s.parcours = { id: pid, start: tk };
      if (OB.ramp) { s.rampStart = tk; s.rampDone = null; } else if (rampWeek(s, today())) s.rampDone = tk;
      ensureDay(s, tk);
    });
    setUi(() => ({ forceOb: false, sel: today() }));
    router.replace("/");
    toast("Bismillâh, ton programme commence");
  };

  const stepper = st > 0 && st < 4 && (
    <div className="stepper" role="img" aria-label={`Question ${st} sur 3`}>{[1, 2, 3].map((i) => <i key={i} className={i <= st ? "on" : ""} />)}</div>
  );

  let h;
  if (st === 0) {
    h = (
      <>
        <div className="star"><Star pct={0} /></div>
        <h1>Ton programme d’invocations, au quotidien</h1>
        <p className="lead">Des invocations authentiques et sourcées, reliées à un objectif concret. Trois questions, et c’est parti.</p>
        <div className="obnav"><button className="navbtn primary" onClick={next}>Commencer</button></div>
      </>
    );
  } else if (st === 1) {
    const pt = prayerTimes(today(), P);
    h = (
      <>
        {stepper}
        <h1>Où vis-tu ?</h1>
        <p className="lead">Pour caler ton programme sur tes horaires de prière.</p>
        <CityPicker id="obcity" />
        {pt && <p className="secintro" style={{ margin: "0 0 14px" }}>Fajr aujourd’hui à {hm(pt.fajr)}.</p>}
        <div className="obnav"><button className="navbtn primary" onClick={next}>{P ? "Continuer" : "Passer cette étape"}</button></div>
      </>
    );
  } else if (st === 2) {
    h = (
      <>
        {stepper}
        <h1>Qu’est-ce que tu cherches à atteindre ?</h1>
        <p className="lead">Chaque jour, une action concrète pour l’atteindre, à côté de tes invocations.</p>
        <div className="choices">
          {Object.entries(OBJ_CATS).map(([k, v]) => (
            <button key={k} className="choice" aria-pressed={OB.cat === k} onClick={() => set({ cat: OB.cat === k ? null : k })}>{v.l}</button>
          ))}
        </div>
        {OB.cat && (
          <label className="field"><span>En une phrase (facultatif)</span>
            <input className="input" id="obtitle" maxLength={100} value={OB.title} placeholder="Par exemple : trouver un CDI avant l’été" onChange={(e) => set({ title: e.target.value })} /></label>
        )}
        <div className="obnav">
          <button className="navbtn primary" onClick={() => { set({ title: OB.title.trim() }); next(); }}>{OB.cat ? "Continuer" : "Je verrai plus tard"}</button>
          <button className="link" onClick={back}>Retour</button>
        </div>
      </>
    );
  } else if (st === 3) {
    h = (
      <>
        {stepper}
        <h1>Ton rapport à l’arabe</h1>
        <p className="lead">Pour afficher les textes de la façon qui t’aide le plus.</p>
        <div className="choices">
          {Object.entries(LEVELS).map(([k, v]) => (
            <button key={k} className="choice" aria-pressed={OB.level === k} onClick={() => set({ level: k })}>{v.l}<small>{v.d}</small></button>
          ))}
        </div>
        <div className="obnav">
          <button className="navbtn primary" disabled={!OB.level} onClick={next}>Continuer</button>
          <button className="link" onClick={back}>Retour</button>
        </div>
      </>
    );
  } else {
    const cat = OB.cat ? OBJ_CATS[OB.cat] : null;
    h = (
      <>
        <h1>Ton programme est prêt</h1>
        <div className="recap">
          <p><b>Objectif :</b> {cat ? OB.title || cat.l : "à fixer plus tard"}</p>
          <p><b>Horaires :</b> {P ? P.city : "à choisir plus tard"}</p>
          <p><b>Textes :</b> {LEVELS[OB.level || "none"].l.toLowerCase()}</p>
        </div>
        {cat && PARCOURS[cat.p] && (
          <>
            <div className="sechead"><h2>Pour ton objectif</h2></div>
            <div className="choices">
              <button className="choice parc" aria-pressed={OB.parc} onClick={() => set({ parc: !OB.parc })}>
                {OB.parc ? "✓ " : ""}Parcours « {PARCOURS[cat.p].title} », {PARCOURS_DAYS} jours
                <small>Chaque jour, une invocation ciblée et un geste concret pour avancer. Tu peux l’arrêter à tout moment.</small>
              </button>
            </div>
          </>
        )}
        <div className="sechead"><h2>Ton rythme</h2></div>
        <div className="choices">
          <button className="choice" aria-pressed={OB.ramp} onClick={() => set({ ramp: true })}>Démarrage en douceur (recommandé)<small>Semaine 1 : trois invocations. Semaine 2 : le socle complet. Ensuite : le programme entier avec le thème du jour.</small></button>
          <button className="choice" aria-pressed={!OB.ramp} onClick={() => set({ ramp: false })}>Programme complet dès aujourd’hui<small>Le socle de cinq invocations et le thème du jour.</small></button>
        </div>
        <p className="secintro">Les jours chargés, le « minimum du jour » te permet de tenir avec trois invocations courtes.</p>
        <p className="secintro">Tes réponses et ta progression restent sur cet appareil : rien n’est envoyé ailleurs.</p>
        <div className="obnav">
          <button className="navbtn primary" onClick={finish}>Commencer mon programme</button>
          <button className="link" onClick={back}>Retour</button>
        </div>
      </>
    );
  }
  return <div className="ob">{h}</div>;
}

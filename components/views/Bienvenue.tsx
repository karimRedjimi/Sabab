"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GRADES, ITEMS, OBJ_CATS, PARCOURS, PARCOURS_DAYS } from "@/content/programme";
import { LEVELS } from "@/content/reglages";
import { keyOf, today } from "@/lib/dates";
import { prayerTimes, hm } from "@/lib/prayer";
import { rampWeek } from "@/lib/program";
import { ensureDay, uid8 } from "@/lib/state";
import { STAGES, titleExample, type Stage } from "@/lib/objective";
import { CityPicker } from "../Prayer";
import { Star } from "../Star";
import { useStore } from "../Store";

type Step = "welcome" | "ville" | "objectif" | "ecoute" | "arabe" | "fin";

export function Bienvenue() {
  const { S, update, setUi, toast } = useStore();
  const router = useRouter();
  // Refaire l’accueil : on repart des choix déjà faits.
  const [OB, setOB] = useState(() => ({
    i: 0,
    cat: (S.onboarded && S.objective?.cat) || (null as string | null),
    title: (S.onboarded && S.objective?.title) || "",
    why: (S.onboarded && S.objective?.why) || "",
    stage: (S.onboarded && S.objective?.stage) || (null as Stage | null),
    level: (S.onboarded && S.level) || (null as string | null),
    ramp: S.onboarded ? !!rampWeek(S, today()) : true,
  }));
  const set = (p: Partial<typeof OB>) => setOB((o) => ({ ...o, ...p }));
  const steps: Step[] = ["welcome", "ville", "objectif", ...(OB.cat ? (["ecoute"] as Step[]) : []), "arabe", "fin"];
  const st = steps[Math.min(OB.i, steps.length - 1)];
  const questions: Step[] = steps.filter((x) => x !== "welcome" && x !== "fin");
  const qi = questions.indexOf(st) + 1;
  const next = () => { set({ i: OB.i + 1 }); window.scrollTo(0, 0); };
  const back = () => set({ i: Math.max(0, OB.i - 1) });
  const P = S.prayer;
  const pid = OB.cat ? OBJ_CATS[OB.cat].p : null;
  const parc = pid ? PARCOURS[pid] : null;

  const finish = (withParcours: boolean) => {
    const tk = keyOf(today());
    update((s) => {
      s.onboarded = true;
      if (OB.cat) {
        const title = OB.title.trim() || OBJ_CATS[OB.cat].l;
        s.objective = { title, cat: OB.cat, why: OB.why.trim(), since: s.objective?.since || tk, ...(OB.stage ? { stage: OB.stage } : {}) };
        // L’objectif devient la première demande du carnet.
        if (!s.carnet.some((c) => c.obj)) s.carnet.push({ id: uid8(), text: title, date: tk, status: "wait", obj: true });
        else s.carnet = s.carnet.map((c) => (c.obj && c.status !== "ok" ? { ...c, text: title } : c));
        if (withParcours && pid && PARCOURS[pid] && s.parcours?.id !== pid) s.parcours = { id: pid, start: tk };
      }
      if (OB.level) { s.level = OB.level; s.show = { ...LEVELS[OB.level].show }; }
      if (OB.ramp) { s.rampStart = tk; s.rampDone = null; } else if (rampWeek(s, today())) s.rampDone = tk;
      ensureDay(s, tk);
    });
    setUi(() => ({ forceOb: false, sel: today() }));
    router.replace("/");
    toast("Bismillâh, ton programme commence");
  };

  const stepper = qi > 0 && (
    <div className="stepper" role="img" aria-label={`Question ${qi} sur ${questions.length}`}>{questions.map((_, i) => <i key={i} className={i < qi ? "on" : ""} />)}</div>
  );
  const nav = (label: string, disabled = false, onNext = next) => (
    <div className="obnav">
      <button className="navbtn primary" disabled={disabled} onClick={onNext}>{label}</button>
      {OB.i > 1 && <button className="link" onClick={back}>Retour</button>}
    </div>
  );

  let h;
  if (st === "welcome") {
    h = (
      <>
        <div className="star"><Star pct={0} /></div>
        <h1>Ton programme d’invocations, au quotidien</h1>
        <p className="lead">Des invocations authentiques et sourcées, reliées à ce que tu demandes à Allah. Quelques questions, et c’est parti.</p>
        <div className="obnav"><button className="navbtn primary" onClick={next}>Commencer</button></div>
      </>
    );
  } else if (st === "ville") {
    const pt = prayerTimes(today(), P);
    h = (
      <>
        {stepper}
        <h1>Où vis-tu ?</h1>
        <p className="lead">Pour caler ton programme sur tes horaires de prière.</p>
        <CityPicker id="obcity" />
        {pt && <p className="secintro" style={{ margin: "0 0 14px" }}>Fajr aujourd’hui à {hm(pt.fajr)}.</p>}
        {nav(P ? "Continuer" : "Passer cette étape")}
      </>
    );
  } else if (st === "objectif") {
    h = (
      <>
        {stepper}
        <h1>Qu’est-ce que tu demandes à Allah ?</h1>
        <p className="lead">Ton programme sera construit autour de ce besoin.</p>
        <div className="choices">
          {Object.entries(OBJ_CATS).map(([k, v]) => (
            <button key={k} className="choice" aria-pressed={OB.cat === k} onClick={() => set({ cat: OB.cat === k ? null : k })}>{v.l}</button>
          ))}
        </div>
        {OB.cat && (
          <label className="field"><span>En une phrase, dans tes mots (facultatif)</span>
            <input className="input" id="obtitle" maxLength={100} value={OB.title} placeholder={titleExample(OB.cat)} onChange={(e) => set({ title: e.target.value })} /></label>
        )}
        {nav(OB.cat ? "Continuer" : "Je verrai plus tard")}
      </>
    );
  } else if (st === "ecoute") {
    h = (
      <>
        {stepper}
        <p className="eyebrow">Ton objectif · {(OB.title.trim() || OBJ_CATS[OB.cat!].l).toLowerCase()}</p>
        <h1 style={{ marginTop: 6 }}>Où en es-tu ?</h1>
        <p className="lead">Pour adapter le rythme à ce que tu vis.</p>
        <div className="choices">
          {(Object.entries(STAGES) as [Stage, (typeof STAGES)[Stage]][]).map(([k, v]) => (
            <button key={k} className="choice" aria-pressed={OB.stage === k} onClick={() => set({ stage: k, ramp: v.ramp })}>{v.l}<small>{v.d}</small></button>
          ))}
        </div>
        <label className="field"><span>Pourquoi c’est important pour toi ? (facultatif)</span>
          <textarea className="area" id="obwhy" maxLength={300} style={{ minHeight: 80 }} value={OB.why} placeholder="Ce que ça changerait pour toi et pour les tiens" onChange={(e) => set({ why: e.target.value })} /></label>
        {nav("Continuer", !OB.stage)}
      </>
    );
  } else if (st === "arabe") {
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
        {nav("Continuer", !OB.level)}
      </>
    );
  } else if (OB.cat && parc) {
    // Révélation : le programme sur mesure.
    const name = OB.title.trim() || OBJ_CATS[OB.cat].l;
    return (
      <div className="reveal">
        <div className="revhead">
          <p className="eyebrow">Ton programme sur mesure</p>
          <h1>{name}</h1>
          <p>Chaque jour, une invocation ciblée, un geste concret et ton socle quotidien. Pendant {PARCOURS_DAYS} jours.</p>
        </div>
        <section className="sec">
          <div className="sechead"><h2>Tes invocations</h2></div>
          {parc.duas.map((id) => {
            const it = ITEMS[id], g = it.grade ? GRADES[it.grade] : null;
            return (
              <div className="card revcard" key={id}>
                <p className="revsrc">{g && <span className={`badge ${g.cls}`}>{g.label}</span>}{it.src}</p>
                <h3>{it.title}</h3>
                {it.ar && <p className="ar" lang="ar" dir="rtl">{it.ar}</p>}
                {it.note && <p>{it.note}</p>}
              </div>
            );
          })}
        </section>
        <section className="sec">
          <div className="sechead"><h2>Ton chemin</h2></div>
          <div className="card revpath">
            <div className="star"><Star pct={0.03} /></div>
            <div><h3>{PARCOURS_DAYS} jours, un geste par jour</h3><p>Jour 1 : {parc.actions[0].charAt(0).toLowerCase() + parc.actions[0].slice(1)}</p></div>
          </div>
          <button className="choice" aria-pressed={OB.ramp} onClick={() => set({ ramp: !OB.ramp })} style={{ marginTop: 8 }}>
            {OB.ramp ? "✓ " : ""}Démarrage en douceur
            <small>{OB.ramp ? "Deux semaines pour installer l’habitude, puis le programme complet." : "Le programme complet dès aujourd’hui."}</small>
          </button>
        </section>
        <p className="secintro">Tes réponses et ta progression restent sur cet appareil : rien n’est envoyé ailleurs.</p>
        <button className="bigbtn" onClick={() => finish(true)}>Commencer, bismillâh</button>
        <button className="later" onClick={() => finish(false)}>Juste le programme quotidien, sans parcours</button>
        <button className="later" onClick={back}>Retour</button>
      </div>
    );
  } else {
    h = (
      <>
        <h1>Ton programme est prêt</h1>
        <div className="recap">
          <p><b>Objectif :</b> à fixer plus tard</p>
          <p><b>Horaires :</b> {P ? P.city : "à choisir plus tard"}</p>
          <p><b>Textes :</b> {LEVELS[OB.level || "none"].l.toLowerCase()}</p>
        </div>
        <div className="sechead"><h2>Ton rythme</h2></div>
        <div className="choices">
          <button className="choice" aria-pressed={OB.ramp} onClick={() => set({ ramp: true })}>Démarrage en douceur (recommandé)<small>Semaine 1 : trois invocations. Semaine 2 : le socle complet. Ensuite : le programme entier avec le thème du jour.</small></button>
          <button className="choice" aria-pressed={!OB.ramp} onClick={() => set({ ramp: false })}>Programme complet dès aujourd’hui<small>Le socle de cinq invocations et le thème du jour.</small></button>
        </div>
        <p className="secintro">Tes réponses et ta progression restent sur cet appareil : rien n’est envoyé ailleurs.</p>
        {nav("Commencer mon programme", false, () => finish(false))}
      </>
    );
  }
  return <div className="ob">{h}</div>;
}

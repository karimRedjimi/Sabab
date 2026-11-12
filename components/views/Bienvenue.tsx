"use client";
// Accueil : quelques questions pour construire le programme, une à la fois, avec un peu de vie.
import { useRouter } from "next/navigation";
import { useAccount } from "../Account";
import { DEBUT_KEY } from "@/lib/supabase";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { GRADES, ITEMS, OBJ_CATS, PARCOURS, PARCOURS_DAYS } from "@/content/programme";
import { CITIES, LEVELS } from "@/content/reglages";
import { keyOf, today } from "@/lib/dates";
import { prayerTimes, hm } from "@/lib/prayer";
import { rampWeek } from "@/lib/program";
import { NIVEAUX, type NiveauId } from "@/content/journee";
import { choisirNiveau, niveau } from "@/lib/journee";
import { ensureDay, uid8 } from "@/lib/state";
import { STAGES, titleExample, type Stage } from "@/lib/objective";
import { SALAT, SALAT_LABEL } from "@/lib/salat";
import { Glyph } from "../Glyphs";
import { Star, starPoints } from "../Star";
import { buzz, useStore } from "../Store";

type Step = "welcome" | "ville" | "objectif" | "ecoute" | "arabe" | "niveau" | "fin";

const CAT_ICON: Record<string, string> = { emploi: "briefcase", activite: "store", dette: "coins", mariage: "rings", etudes: "cap", epreuve: "leaf", autre: "sparkle" };
const STAGE_ICON: Record<Stage, string> = { start: "seed", lead: "climb", heavy: "feather" };
const LEVEL_SAMPLE: Record<string, ReactNode> = {
  none: <span className="lvs"><i>Aa</i></span>,
  read: <span className="lvs" lang="ar" dir="rtl">اللَّهُمَّ</span>,
  fluent: <span className="lvs" lang="ar" dir="rtl">ع</span>,
};

/** Un élément qui apparaît en léger décalé après les précédents. */
const stg = (i: number) => ({ "data-stg": "", style: { "--i": i } as CSSProperties });

export function Bienvenue() {
  const { S, update, setUi, toast } = useStore();
  const router = useRouter();
  const acc = useAccount();
  // Refaire l’accueil : on repart des choix déjà faits.
  const [OB, setOB] = useState(() => ({
    i: 0,
    cat: (S.onboarded && S.objective?.cat) || (null as string | null),
    title: (S.onboarded && S.objective?.title) || "",
    why: (S.onboarded && S.objective?.why) || "",
    stage: (S.onboarded && S.objective?.stage) || (null as Stage | null),
    level: (S.onboarded && S.level) || (null as string | null),
    ramp: S.onboarded ? !!rampWeek(S, today()) : true,
    niveau: niveau(S) as NiveauId,
  }));
  const dir = useRef<"fwd" | "back">("fwd");
  // Changer d’étape : l’étape s’efface (220 ms), puis la suivante entre. Un double appui ne saute rien.
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);
  const move = (fn: () => void) => {
    if (busy.current) return;
    busy.current = true; setLeaving(true);
    setTimeout(() => { fn(); setLeaving(false); busy.current = false; window.scrollTo(0, 0); }, 220);
  };
  const set = (p: Partial<typeof OB>) => setOB((o) => ({ ...o, ...p }));
  const steps: Step[] = ["welcome", "ville", "objectif", ...(OB.cat ? (["ecoute"] as Step[]) : []), "arabe", "niveau", "fin"];
  const st = steps[Math.min(OB.i, steps.length - 1)];
  // Avancer depuis une étape précise : un double appui ne saute jamais une question.
  const go = (from: number) => { dir.current = "fwd"; move(() => setOB((o) => (o.i === from ? { ...o, i: o.i + 1 } : o))); };
  const next = () => go(OB.i);
  const back = () => { dir.current = "back"; move(() => setOB((o) => ({ ...o, i: Math.max(0, o.i - 1) }))); };
  const P = S.prayer;
  const pid = OB.cat ? OBJ_CATS[OB.cat].p : null;
  const parc = pid ? PARCOURS[pid] : null;
  const progress = OB.i / (steps.length - 1);

  // Choix qui fait avancer tout seul, après un court instant pour voir la sélection.
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const pickAndGo = (p: Partial<typeof OB>) => {
    set(p); buzz(10);
    const from = OB.i;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => go(from), 420);
  };

  const finish = (withParcours: boolean) => {
    const tk = keyOf(today());
    update((s) => {
      if (!s.onboarded) s.guide = "start";
      s.onboarded = true;
      if (OB.cat) {
        const title = OB.title.trim() || OBJ_CATS[OB.cat].l;
        s.objective = { title, cat: OB.cat, why: OB.why.trim(), since: s.objective?.since || tk, ...(OB.stage ? { stage: OB.stage } : {}) };
        // L’objectif devient la première demande du carnet.
        if (!s.carnet.some((c) => c.obj)) s.carnet.push({ id: uid8(), text: title, date: tk, status: "wait", obj: true });
        else s.carnet = s.carnet.map((c) => (c.obj && c.status !== "ok" ? { ...c, text: title } : c));
        if (withParcours && pid && PARCOURS[pid] && s.parcours?.id !== pid) s.parcours = { id: pid, start: tk };
      }
      if (!s.prophete || s.prophete.lvl !== OB.niveau) choisirNiveau(s, OB.niveau, today());
      if (OB.level) { s.level = OB.level; s.show = { ...LEVELS[OB.level].show }; }
      if (OB.ramp) { s.rampStart = tk; s.rampDone = null; } else if (rampWeek(s, today())) s.rampDone = tk;
      ensureDay(s, tk);
    });
    buzz([20, 40, 20]);
    setUi(() => ({ forceOb: false, sel: today() }));
    // Dernière étape de la configuration : proposer de créer son compte (on peut passer).
    if (acc.status === "out") { try { sessionStorage.setItem(DEBUT_KEY, "1"); } catch { /* */ } router.replace("/compte"); }
    else router.replace("/");
    toast("Bismillâh, ton programme commence");
  };

  const geoloc = () => {
    if (!navigator.geolocation) { toast("Position indisponible : choisis ta ville dans la liste"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { buzz(10); update((s) => { s.prayer = { city: "Ma position", lat: +pos.coords.latitude.toFixed(4), lng: +pos.coords.longitude.toFixed(4), method: s.prayer?.method || "uoif" }; }); },
      () => toast("Position refusée : choisis ta ville dans la liste"),
      { timeout: 10000 },
    );
  };

  let body: ReactNode, cta: ReactNode = null;

  if (st === "welcome") {
    body = (
      <div className="obhero">
        <WelcomeStar />
        <h1 className="obtitle">{"Bienvenue dans Sabab".split(" ").map((w, i) => <span key={i}>{i > 0 && " "}<span style={{ "--w": i } as CSSProperties}>{w}</span></span>)}</h1>
        <p className="obtag" {...stg(5)}>Prends les moyens, confie-t’en à Allah.</p>
        <ul className="obfeat">
          {[["sun", "La journée du Prophète ﷺ, pas à pas"], ["target", "Reliée à ce que tu demandes à Allah"], ["clock", "Calée sur tes horaires de prière"]].map(([ic, t], i) => (
            <li key={ic} {...stg(7 + i)}><span className="obi"><Glyph name={ic} /></span>{t}</li>
          ))}
        </ul>
      </div>
    );
    cta = <button className="bigbtn obgo" onClick={next}>Commencer</button>;
  } else if (st === "ville") {
    const custom = P && !CITIES.some((c) => c[0] === P.city);
    const pt = P ? prayerTimes(today(), P) : null;
    body = (
      <>
        <span className="obicon" {...stg(0)}><Glyph name="pin" /></span>
        <h1 {...stg(1)}>Où vis-tu ?</h1>
        <p className="lead" {...stg(2)}>Pour caler ton programme sur tes horaires de prière.</p>
        <div {...stg(3)}>
          <label className="field"><span className="sr-only">Ville</span>
            <select className="select big" id="obcity" value={P?.city || ""} onChange={(e) => {
              const c = CITIES.find((x) => x[0] === e.target.value);
              if (c) { buzz(10); update((s) => { s.prayer = { city: c[0], lat: c[1], lng: c[2], method: s.prayer?.method || "uoif" }; }); }
            }}>
              <option value="">Choisir ma ville…</option>
              {CITIES.map((c) => <option key={c[0]} value={c[0]}>{c[0]}</option>)}
              {custom && <option value={P.city}>{P.city}</option>}
            </select>
          </label>
          <button className="oblocate" onClick={geoloc}><Glyph name="locate" />Utiliser ma position</button>
        </div>
        <SunArc pt={pt} place={P ? (P.city === "Ma position" ? "là où tu es" : `à ${P.city}`) : null} key={P?.city || "vide"} />
      </>
    );
    cta = <button className={`bigbtn ${P ? "" : "sec2"}`} onClick={next}>{P ? "Continuer" : "Passer cette étape"}</button>;
  } else if (st === "objectif") {
    body = (
      <>
        <span className="obicon" {...stg(0)}><Glyph name="target" /></span>
        <h1 {...stg(1)}>Qu’est-ce que tu demandes à Allah ?</h1>
        <p className="lead" {...stg(2)}>Ton programme sera construit autour de ce besoin.</p>
        <div className="obgrid">
          {Object.entries(OBJ_CATS).map(([k, v], i) => (
            <button key={k} className="obcard" aria-pressed={OB.cat === k} {...stg(3 + i)}
              onClick={() => { buzz(10); set({ cat: OB.cat === k ? null : k }); }}>
              <span className="obi"><Glyph name={CAT_ICON[k] || "sparkle"} /></span>
              <span className="obl">{v.l}</span>
              <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
            </button>
          ))}
        </div>
        {OB.cat && (
          <label className="field obreveal">
            <span>En une phrase, dans tes mots (facultatif)</span>
            <input className="input" id="obtitle" maxLength={100} enterKeyHint="next" onKeyDown={(e) => { if (e.key === "Enter") next(); }}
              value={OB.title} placeholder={titleExample(OB.cat)} onChange={(e) => set({ title: e.target.value })} />
          </label>
        )}
      </>
    );
    cta = <button className={`bigbtn ${OB.cat ? "" : "sec2"}`} onClick={next}>{OB.cat ? "Continuer" : "Je verrai plus tard"}</button>;
  } else if (st === "ecoute") {
    body = (
      <>
        <p className="eyebrow" {...stg(0)}>Ton objectif · {(OB.title.trim() || OBJ_CATS[OB.cat!].l).toLowerCase()}</p>
        <h1 {...stg(1)}>Où en es-tu ?</h1>
        <p className="lead" {...stg(2)}>Pour adapter le rythme à ce que tu vis.</p>
        <div className="oblist">
          {(Object.entries(STAGES) as [Stage, (typeof STAGES)[Stage]][]).map(([k, v], i) => (
            <button key={k} className="obrow" aria-pressed={OB.stage === k} {...stg(3 + i)} onClick={() => { buzz(10); set({ stage: k, ramp: v.ramp }); }}>
              <span className="obi"><Glyph name={STAGE_ICON[k]} /></span>
              <span className="obl">{v.l}<small>{v.d}</small></span>
              <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
            </button>
          ))}
        </div>
        {OB.stage && (
          <label className="field obreveal">
            <span>Pourquoi c’est important pour toi ? (facultatif)</span>
            <textarea className="area" id="obwhy" maxLength={300} style={{ minHeight: 84 }} value={OB.why} placeholder="Ce que ça changerait pour toi et pour les tiens" onChange={(e) => set({ why: e.target.value })} />
          </label>
        )}
      </>
    );
    cta = <button className="bigbtn" disabled={!OB.stage} onClick={next}>Continuer</button>;
  } else if (st === "arabe") {
    body = (
      <>
        <span className="obicon" {...stg(0)}><Glyph name="book" /></span>
        <h1 {...stg(1)}>Ton rapport à l’arabe</h1>
        <p className="lead" {...stg(2)}>Pour afficher les textes de la façon qui t’aide le plus.</p>
        <div className="oblist">
          {Object.entries(LEVELS).map(([k, v], i) => (
            <button key={k} className="obrow" aria-pressed={OB.level === k} {...stg(3 + i)} onClick={() => pickAndGo({ level: k })}>
              <span className="obi lv">{LEVEL_SAMPLE[k]}</span>
              <span className="obl">{v.l}<small>{v.d}</small></span>
              <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
            </button>
          ))}
        </div>
      </>
    );
    cta = OB.level ? <button className="bigbtn" onClick={next}>Continuer</button> : null;
  } else if (st === "niveau") {
    const n = OB.niveau;
    body = (
      <>
        <p className="eyebrow" {...stg(0)}>La journée du Prophète ﷺ</p>
        <h1 {...stg(1)}>Par où veux-tu commencer ?</h1>
        <p className="lead" {...stg(2)}>Prier, invoquer, se lever la nuit : t’en approcher marche après marche.</p>
        <div className="stairs" role="radiogroup" aria-label="Niveau" {...stg(3)}>
          {([1, 2, 3, 4, 5] as NiveauId[]).map((k) => (
            <button key={k} role="radio" aria-checked={n === k} aria-label={`Niveau ${k} : ${NIVEAUX[k].titre}`}
              className={`stair ${k <= n ? "lit" : ""} ${k === n ? "on" : ""}`} style={{ "--h": k } as CSSProperties}
              onClick={() => { buzz(10); set({ niveau: k }); }}>
              {k === n && <span className="stairstar" aria-hidden="true"><Star pct={1} /></span>}
              <i /><span className="sn">{k}</span>
            </button>
          ))}
        </div>
        <div className="stairinfo" key={n} aria-live="polite">
          <p className="k">Niveau {n}{n === 1 && <em className="obreco">Pour commencer</em>}</p>
          <b>{NIVEAUX[n].titre}</b>
          <p>{NIVEAUX[n].ajoute}</p>
        </div>
        <p className="secintro" {...stg(5)}>Le niveau suivant te sera proposé quand tu seras prêt. Tu peux en changer à tout moment.</p>
      </>
    );
    cta = <button className="bigbtn" onClick={next}>Continuer</button>;
  } else if (OB.cat && parc) {
    // Révélation : le programme sur mesure.
    const name = OB.title.trim() || OBJ_CATS[OB.cat].l;
    body = (
      <div className="reveal">
        <div className="revhead">
          <Burst />
          <p className="eyebrow" {...stg(0)}>Ton programme sur mesure</p>
          <h1 {...stg(1)}>{name}</h1>
          <p {...stg(2)}>Chaque jour, une invocation ciblée, un geste concret et ton socle quotidien. Pendant {PARCOURS_DAYS} jours.</p>
        </div>
        <section className="sec">
          <div className="sechead" {...stg(3)}><h2>Tes invocations</h2></div>
          {parc.duas.map((id, i) => {
            const it = ITEMS[id], g = it.grade ? GRADES[it.grade] : null;
            return (
              <div className="card revcard stg" style={{ "--i": 4 + i } as CSSProperties} key={id}>
                <p className="revsrc">{g && <span className={`badge ${g.cls}`}>{g.label}</span>}{it.src}</p>
                <h3>{it.title}</h3>
                {it.ar && <p className="ar" lang="ar" dir="rtl">{it.ar}</p>}
                {it.note && <p>{it.note}</p>}
              </div>
            );
          })}
        </section>
        <section className="sec">
          <div className="sechead" {...stg(5 + parc.duas.length)}><h2>Ton chemin</h2></div>
          <div className="card revpath stg" style={{ "--i": 6 + parc.duas.length } as CSSProperties}>
            <div className="star"><Star pct={0.03} /></div>
            <div><h3>{PARCOURS_DAYS} jours, un geste par jour</h3><p>Jour 1 : {parc.actions[0].charAt(0).toLowerCase() + parc.actions[0].slice(1)}</p></div>
          </div>
          <button className="obrow small stg" style={{ "--i": 7 + parc.duas.length } as CSSProperties} aria-pressed={OB.ramp} onClick={() => { buzz(10); set({ ramp: !OB.ramp }); }}>
            <span className="obi"><Glyph name="seed" /></span>
            <span className="obl">Démarrage en douceur<small>{OB.ramp ? "Deux semaines pour installer l’habitude, puis le programme complet." : "Le programme complet dès aujourd’hui."}</small></span>
            <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
          </button>
        </section>
        <p className="secintro">Tes réponses et ta progression restent sur cet appareil : rien n’est envoyé ailleurs.</p>
      </div>
    );
    cta = (
      <>
        <button className="bigbtn" onClick={() => finish(true)}>Commencer, bismillâh</button>
        <button className="later" onClick={() => finish(false)}>Juste le programme quotidien, sans parcours</button>
      </>
    );
  } else {
    body = (
      <>
        <span className="obicon burstwrap" {...stg(0)}><Burst /><Glyph name="sparkle" /></span>
        <h1 {...stg(1)}>Ton programme est prêt</h1>
        <div className="recap" {...stg(2)}>
          <p><b>Objectif :</b> à fixer plus tard</p>
          <p><b>Horaires :</b> {P ? P.city : "à choisir plus tard"}</p>
          <p><b>Textes :</b> {LEVELS[OB.level || "none"].l.toLowerCase()}</p>
        </div>
        <div className="oblist">
          <button className="obrow" aria-pressed={OB.ramp} {...stg(3)} onClick={() => { buzz(10); set({ ramp: true }); }}>
            <span className="obi"><Glyph name="seed" /></span>
            <span className="obl">Démarrage en douceur (recommandé)<small>Semaine 1 : trois invocations. Semaine 2 : le socle complet. Ensuite : le programme entier avec le thème du jour.</small></span>
            <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
          </button>
          <button className="obrow" aria-pressed={!OB.ramp} {...stg(4)} onClick={() => { buzz(10); set({ ramp: false }); }}>
            <span className="obi"><Glyph name="climb" /></span>
            <span className="obl">Programme complet dès aujourd’hui<small>Le socle de cinq invocations et le thème du jour.</small></span>
            <span className="obck" aria-hidden="true"><Glyph name="check" /></span>
          </button>
        </div>
        <p className="secintro">Tes réponses et ta progression restent sur cet appareil : rien n’est envoyé ailleurs.</p>
      </>
    );
    cta = <button className="bigbtn" onClick={() => finish(false)}>Commencer mon programme</button>;
  }

  return (
    <div className={`ob2 imm ${st === "welcome" ? "welcome" : ""} ${leaving ? `leaving ${dir.current}` : ""}`}>
      <WelcomeSky step={OB.i} />
      {st !== "welcome" && (
        <header className="obtop">
          <button className="obback" onClick={back} aria-label="Question précédente"><Glyph name="arrowleft" /></button>
          <Chemin i={OB.i} n={steps.length} progress={progress} />
        </header>
      )}
      <div className={`obstep ${dir.current}`} key={st}>{body}</div>
      <footer className="obcta" key={`cta-${st}`}>{cta}</footer>
    </div>
  );
}

/** L’étoile qui se remplit en arrivant. */
function WelcomeStar() {
  const [p, setP] = useState(0);
  useEffect(() => { const t = setTimeout(() => setP(1), 250); return () => clearTimeout(t); }, []);
  return <div className="obstar"><Star pct={p} /></div>;
}

/** Le ciel de l’accueil : un dégradé profond, une lueur qui respire et des étoiles à huit branches qui tournent lentement. */
export function WelcomeSky({ step = 0 }: { step?: number }) {
  const stars: [number, number, number, number][] = [[12, 14, 46, 0], [86, 9, 30, 1], [78, 46, 70, 2], [8, 62, 34, 3], [52, 88, 90, 4], [92, 82, 26, 5], [30, 36, 18, 6]];
  return (
    <div className="obsky" aria-hidden="true" style={{ "--step": step } as CSSProperties}>
      <i className="obglow" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {stars.map(([x, y, r, k]) => (
          <polygon key={k} className="obsk" points={starPoints(x, y, r / 4)} style={{ "--k": k, transformOrigin: `${x}px ${y}px` } as CSSProperties} />
        ))}
      </svg>
    </div>
  );
}

/** Une petite gerbe d’étoiles, pour fêter la fin de l’accueil. */
function Burst() {
  return (
    <span className="burst" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--a": `${i * 22.5}deg`, "--d": `${(i % 4) * 70}ms`, "--r": `${70 + (i % 3) * 26}px` } as CSSProperties} />)}
    </span>
  );
}

/** Le chemin parcouru : une étoile par étape, reliées par un fil qui se dessine. */
function Chemin({ i, n, progress }: { i: number; n: number; progress: number }) {
  const W = 100, pts = Array.from({ length: n }, (_, k) => [4 + (k * (W - 8)) / (n - 1), k % 2 ? 6 : 10] as const);
  const d = pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)} ${y}`).join(" ");
  return (
    <div className="chemin" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} aria-label={`Étape ${i} sur ${n - 1}`}>
      <svg viewBox="0 0 100 16" preserveAspectRatio="none" aria-hidden="true"><path className="cfil" d={d} /><path className="cfil on" d={d} pathLength={1} style={{ strokeDashoffset: 1 - progress } as CSSProperties} /></svg>
      {pts.map(([x, y], k) => <i key={k} className={k < i ? "past" : k === i ? "now" : ""} style={{ left: `${x}%`, top: `${(y / 16) * 100}%` }} />)}
    </div>
  );
}

/** La course du soleil : les cinq prières du jour posées sur l’arc, et le soleil à l’heure qu’il est. */
function SunArc({ pt, place }: { pt: Record<"fajr" | "dhuhr" | "asr" | "maghrib" | "isha", number> | null; place: string | null }) {
  const cx = 170, cy = 150, R = 120;
  const a0 = pt ? pt.fajr - 1 : 5, a1 = pt ? pt.isha + 1 : 21;
  const pos = (h: number, r = R) => { const f = Math.min(1, Math.max(0, (h - a0) / (a1 - a0))), a = Math.PI * (1 - f); return [cx + r * Math.cos(a), cy - r * Math.sin(a), f] as const; };
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60;
  const [, , fNow] = pos(h);
  return (
    <div className={`sunarc ${pt ? "" : "empty"}`}>
      <svg viewBox="0 0 340 178" aria-hidden={!pt}>
        <defs><linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stopColor="#7C8CF0" /><stop offset=".5" stopColor="#E9C46A" /><stop offset="1" stopColor="#D9622E" /></linearGradient></defs>
        <line x1="20" x2="320" y1={cy} y2={cy} className="horizon" />
        <path className="arc" d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} pathLength={1} />
        {pt && (
          <>
            <g className="sun" style={{ "--rot": `${fNow * 180}deg`, transformOrigin: `${cx}px ${cy}px` } as CSSProperties}><circle cx={cx - R} cy={cy} r="9" /><circle cx={cx - R} cy={cy} r="16" className="halo" /></g>
            {SALAT.map((k, i) => {
              const [x, y, f] = pos(pt[k]), [lx, ly] = pos(pt[k], R + 24);
              return (
                <g key={k} className="pp" style={{ "--i": i } as CSSProperties}>
                  <circle cx={x} cy={y} r="5" />
                  <text x={lx} y={ly - 4} textAnchor={f < 0.2 ? "end" : f > 0.8 ? "start" : "middle"}><tspan className="t">{hm(pt[k])}</tspan><tspan x={lx} dy="14" className="n">{SALAT_LABEL[k]}</tspan></text>
                </g>
              );
            })}
          </>
        )}
      </svg>
      <p className="obpt">{place ? `Ta journée aujourd’hui, ${place}` : "Choisis ta ville pour voir ta journée"}</p>
    </div>
  );
}

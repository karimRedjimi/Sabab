"use client";
// « Mon combat » : entre soi et Allah. Rien n’est nommé, rien ne quitte le téléphone.
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { addDays, fmtDate, fmtShort, fromKey, keyOf, monday, sameDay, today } from "@/lib/dates";
import {
  GOAL_DAYS, SIGNS, bestStreak, clearCombat, cycleDay, emptyCombat, fallsPerWeek, loadCombat, reachedGoal, saveCombat, streak,
  type Combat as CombatT, type CombatData, type Sign,
} from "@/lib/combat";
import { uid8 } from "@/lib/state";
import { buzz, useStore } from "../Store";

const SIGN_TONE: Record<Sign, string> = {
  circle: "#6E2A55", triangle: "#9A5F2B", square: "#4A5BD4", diamond: "#2E8B7A", star: "#C99206",
  moon: "#2D3F8F", wave: "#D9622E", drop: "#3C8FC0", hexagon: "#7A5BA8", ring: "#6F808D",
};

/** Le signe qui désigne un combat. */
export function SignGlyph({ sign, size = 44 }: { sign: Sign; size?: number }) {
  const c = SIGN_TONE[sign];
  const shape = {
    circle: <circle cx="12" cy="12" r="6.5" fill={c} />,
    triangle: <path d="M12 5.5 19 18H5z" fill={c} />,
    square: <rect x="6" y="6" width="12" height="12" rx="2.5" fill={c} />,
    diamond: <path d="M12 4.5 19.5 12 12 19.5 4.5 12z" fill={c} />,
    star: <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill={c} />,
    moon: <path d="M14.5 5a7 7 0 1 0 4.5 11.5A5.8 5.8 0 0 1 14.5 5z" fill={c} />,
    wave: <path d="M4 13c2.7-4 5.3-4 8 0s5.3 4 8 0" stroke={c} strokeWidth="2.6" strokeLinecap="round" fill="none" />,
    drop: <path d="M12 4.5s5.5 6.2 5.5 9.7a5.5 5.5 0 0 1-11 0C6.5 10.7 12 4.5 12 4.5z" fill={c} />,
    hexagon: <path d="M12 4.5 18.5 8.2v7.6L12 19.5l-6.5-3.7V8.2z" fill={c} />,
    ring: <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="2.6" fill="none" />,
  }[sign];
  return (
    <span className="csign" style={{ width: size, height: size, background: `color-mix(in srgb, ${c} 14%, var(--surface))` }}>
      <svg viewBox="0 0 24 24" aria-hidden="true">{shape}</svg>
    </span>
  );
}

const plural = (n: number, s: string, p: string) => (n > 1 ? p : s);

function CombatCard({ c, onChange, onRemove }: { c: CombatT; onChange: (c: CombatT) => void; onRemove: () => void }) {
  const { setUi } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const t = today(), tk = keyOf(t), now = streak(c, t), best = bestStreak(c, t), state = c.log[tk];
  const goal = reachedGoal(c, t);
  const weeks = fallsPerWeek(c, 6, t), maxW = Math.max(1, ...weeks);
  const set = (v: "ok" | "fall" | null) => {
    const log = { ...c.log };
    if (v) log[tk] = v; else delete log[tk];
    onChange({ ...c, log });
    buzz(v === "fall" ? 8 : 14);
  };
  const istighfar = () => {
    setUi(() => ({ lecture: { queue: [{ id: "istighfar", origin: "socle", m: "jour", sl: [0], opt: false }], i: 0, label: "Istighfâr" } }));
    router.push("/");
  };
  const start = addDays(monday(t), -28);
  return (
    <article className="ccard">
      <div className="chead">
        <SignGlyph sign={c.sign} />
        <div className="cnum">
          <b>{now} <small>{plural(now, "jour", "jours")}</small></b>
          <span>{best > now ? `Meilleure série : ${best} jours` : now ? "Ta meilleure série" : "Un nouveau départ"}</span>
        </div>
      </div>
      <div className="cprog" aria-label={`${Math.min(now, GOAL_DAYS)} sur ${GOAL_DAYS} jours vers la victoire`}>
        <span className="pbar"><i style={{ width: `${Math.min(1, now / GOAL_DAYS) * 100}%` }} /></span>
        <small>{Math.min(now, GOAL_DAYS)} / {GOAL_DAYS}</small>
      </div>

      {goal ? (
        <div className="cwin">
          <p><b>{GOAL_DAYS} jours tenus, al-hamdulillâh.</b> Tu peux le déclarer comme une victoire.</p>
          <div className="row">
            <button className="navbtn primary" onClick={() => { onChange({ ...c, victory: tk }); buzz([20, 40, 20]); }}>Déclarer la victoire</button>
          </div>
        </div>
      ) : state === "fall" ? (
        <div className="cfall">
          <p>Une chute n’efface pas le chemin parcouru. Reviens vers Allah, et reprends.</p>
          <div className="row">
            <button className="navbtn strong" onClick={istighfar}>Faire l’istighfâr</button>
            <button className="link danger" onClick={() => set(null)}>Annuler</button>
          </div>
        </div>
      ) : (
        <div className="ctoday" role="group" aria-label="Aujourd’hui">
          <button className={`cbtn ${state === "ok" ? "on" : ""}`} aria-pressed={state === "ok"} onClick={() => set(state === "ok" ? null : "ok")}>
            {state === "ok" ? "✓ Tenu aujourd’hui" : "Tenu aujourd’hui"}
          </button>
          <button className="cbtn soft" onClick={() => set("fall")}>Je suis retombé</button>
        </div>
      )}

      <button className="cmore" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "Masquer le suivi" : "Voir le suivi"}<span className="chev" aria-hidden="true" /></button>
      {open && (
        <div className="cdetail">
          <p className="cdl">Les 5 dernières semaines · touche un jour pour le corriger</p>
          <div className="ccal">
            {["L", "M", "M", "J", "V", "S", "D"].map((h, i) => <span key={"h" + i} className="hd">{h}</span>)}
            {Array.from({ length: 35 }, (_, i) => {
              const d = addDays(start, i), dk = keyOf(d), v = c.log[dk], out = d > t || dk < c.start;
              return (
                <button key={dk} className={`cday ${v || ""} ${out ? "out" : ""} ${sameDay(d, t) ? "now" : ""}`} disabled={out}
                  aria-label={`${fmtShort(d)} : ${v === "ok" ? "tenu" : v === "fall" ? "retombé" : "sans réponse"}`}
                  onClick={() => onChange(cycleDay(c, dk))}>{d.getDate()}</button>
              );
            })}
          </div>
          <p className="cdl">Chutes par semaine</p>
          <div className="cweeks">
            {weeks.map((n, i) => (
              <div key={i} className={`cw ${i === weeks.length - 1 ? "cur" : ""}`}>
                <i><em style={{ height: `${(n / maxW) * 100}%` }} /></i>
                <small>{n}</small>
              </div>
            ))}
          </div>
          <p className="cdl">Depuis le {fmtDate(fromKey(c.start))}</p>
          <button className="link danger" onClick={onRemove}>Arrêter ce combat</button>
        </div>
      )}
    </article>
  );
}

export function Combat() {
  const { toast } = useStore();
  const [data, setData] = useState<CombatData>(emptyCombat);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [picking, setPicking] = useState(false);
  useEffect(() => { setData(loadCombat()); setReady(true); }, []);
  // Quitter l’application refloute l’écran.
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "hidden") setShown(false); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  const commit = useCallback((next: CombatData) => { setData(next); saveCombat(next); }, []);
  const active = data.combats.filter((c) => !c.victory), wins = data.combats.filter((c) => c.victory);
  const used = new Set(active.map((c) => c.sign));
  const update = (c: CombatT) => commit({ ...data, combats: data.combats.map((x) => (x.id === c.id ? c : x)) });
  const add = (sign: Sign) => {
    commit({ ...data, combats: [...data.combats, { id: uid8(), sign, start: keyOf(today()), log: {} }] });
    setPicking(false); buzz(12); toast("Bismillâh, un combat commence");
  };
  const remove = (c: CombatT) => {
    const prev = data;
    commit({ ...data, combats: data.combats.filter((x) => x.id !== c.id) });
    toast("Combat arrêté", { label: "Annuler", run: () => commit(prev) });
  };
  const wipe = () => {
    const prev = data;
    commit(emptyCombat()); clearCombat();
    toast("Tout est effacé", { label: "Annuler", run: () => commit(prev) });
  };

  return (
    <>
      <div className="page"><h1>Mon combat</h1>
        <p className="lead">Entre toi et Allah. Rien n’est nommé, rien ne quitte ton téléphone.</p></div>
      <div className={`cveil ${shown ? "" : "hid"}`}>
        {!shown && <button className="cshow" onClick={() => setShown(true)}>Toucher pour afficher</button>}
        <div className="cbody" aria-hidden={!shown}>
          {ready && !active.length && !picking && (
            <div className="cempty">
              <p>Délaisser une habitude qui t’éloigne de ton objectif, un jour après l’autre. Choisis un signe pour la désigner : toi seul sais ce qu’il représente.</p>
            </div>
          )}
          {active.map((c) => <CombatCard key={c.id} c={c} onChange={update} onRemove={() => remove(c)} />)}
          {picking ? (
            <section className="cpick">
              <p className="cdl">Choisis un signe. Toi seul sais ce qu’il représente.</p>
              <div className="csigns">
                {SIGNS.filter((s) => !used.has(s)).map((s, i) => (
                  <button key={s} className="cpk" style={{ "--i": i } as CSSProperties} aria-label="Choisir ce signe" onClick={() => add(s)}><SignGlyph sign={s} size={52} /></button>
                ))}
              </div>
              <button className="link" onClick={() => setPicking(false)}>Annuler</button>
            </section>
          ) : used.size < SIGNS.length && (
            <button className="cadd" onClick={() => setPicking(true)}>+ {active.length ? "Ajouter un combat" : "Commencer un combat"}</button>
          )}
          {wins.length > 0 && (
            <section className="sec" style={{ marginTop: 24 }}>
              <div className="sechead"><h2>Victoires</h2><span className="count">{wins.length}</span></div>
              <ul className="cwins">
                {wins.map((c) => (
                  <li key={c.id}><SignGlyph sign={c.sign} size={36} /><span><b>Victoire, al-hamdulillâh</b><small>Le {fmtDate(fromKey(c.victory!))}</small></span></li>
                ))}
              </ul>
            </section>
          )}
          {data.combats.length > 0 && (
            <p className="cfoot">Rien n’est envoyé, même avec un compte. <button className="link danger" onClick={wipe}>Tout effacer</button></p>
          )}
        </div>
      </div>
    </>
  );
}

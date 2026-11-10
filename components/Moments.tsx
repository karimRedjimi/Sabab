"use client";
import { useState } from "react";
import { keyOf, today } from "@/lib/dates";
import { favorableMoments, sujud } from "@/lib/moments";
import { needsPatience, objectiveTag } from "@/lib/objective";
import type { Entry } from "@/lib/program";
import { FORMES_DE_REPONSE } from "@/content/textes";
import { useStore } from "./Store";

/** Les prochains moments où l’invocation est exaucée, à l’heure de la personne. */
export function FavorableMoments() {
  const { S, now } = useStore();
  const [why, setWhy] = useState(false);
  const list = favorableMoments(S, now).slice(0, 2);
  if (!list.length) return null;
  const sj = sujud();
  return (
    <section className="sec fav">
      <div className="sechead"><h2>Moments favorables</h2>{S.objective && <span className="count">{objectiveTag(S)}</span>}</div>
      <div className="list">
        {list.map((m) => (
          <div className={`favrow ${m.now ? "now" : ""}`} key={m.key}>
            <span className="favdot" aria-hidden="true" />
            <span className="rt"><b>{m.label}</b><small>{m.when}</small></span>
            {m.now && <span className="favnow">maintenant</span>}
          </div>
        ))}
        <div className="favrow">
          <span className="favdot" aria-hidden="true" />
          <span className="rt"><b>{sj.label}</b><small>À chaque prière</small></span>
        </div>
      </div>
      <button className="why" style={{ margin: "8px 4px 0" }} aria-expanded={why} onClick={() => setWhy(!why)}>
        {why ? "Masquer les sources" : S.objective ? "Garde ton invocation pour ces moments" : "Pourquoi ces moments ?"}
      </button>
      {why && <p className="whytext" style={{ marginTop: 8 }}>
        {[...list.map((m) => `${m.label} : ${m.source}`), `${sj.label} : ${sj.source}`].join(" · ")}
      </p>}
    </section>
  );
}

/** Al-hamdulillâh du jour : une chose pour laquelle on remercie Allah. */
export function Gratitude({ compact = false }: { compact?: boolean }) {
  const { S, ui, update } = useStore();
  const dk = keyOf(compact ? today() : ui.sel), v = S.gratitude?.[dk] || "";
  return (
    <section className={`grat ${compact ? "compact" : ""}`}>
      <label htmlFor={`grat-${compact ? "c" : "j"}`}><b>Al-hamdulillâh</b><span>Une chose pour laquelle tu remercies Allah aujourd’hui</span></label>
      <input id={`grat-${compact ? "c" : "j"}`} className="input" maxLength={140} value={v} placeholder="Par exemple : la santé de mes parents"
        onChange={(e) => { const t = e.target.value; update((s) => { s.gratitude = { ...(s.gratitude || {}), [dk]: t }; }); }} />
    </section>
  );
}

/** Quand la réponse tarde : un mot doux, la patience, et les formes que prend la réponse. */
export function Patience({ onPatience }: { onPatience: (e: Entry) => void }) {
  const { S, update } = useStore();
  if (!needsPatience(S, today())) return null;
  const close = () => update((s) => { s.patienceSeen = keyOf(today()); });
  return (
    <div className="banner warm pat">
      <div>
        <b>La réponse prend parfois un autre chemin</b>
        <span>{FORMES_DE_REPONSE}</span>
        <div className="row" style={{ marginTop: 8, gap: 16 }}>
          <button className="act" onClick={() => { close(); onPatience({ id: "sabr", origin: "socle", m: "jour", sl: [0], opt: false }); }}>Invoquer la patience</button>
          <button className="act" style={{ color: "var(--muted)" }} onClick={close}>Merci</button>
        </div>
      </div>
    </div>
  );
}

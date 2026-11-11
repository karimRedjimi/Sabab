"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, REQ_CAT_OF, type RequestView } from "@/lib/supabase";
import { useAccount } from "./Account";
import { keyOf, today } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { favorableMoments, sujud } from "@/lib/moments";
import { needsPatience, objectiveTag } from "@/lib/objective";
import type { Entry } from "@/lib/program";
import { FORMES_DE_REPONSE } from "@/content/textes";
import { useStore } from "./Store";

/** Les prochains moments où l’invocation est exaucée : une ligne, qui se déplie. */
export function FavorableMoments() {
  const { S, now } = useStore();
  const [open, setOpen] = useState(false);
  const list = favorableMoments(S, now).slice(0, 2);
  if (!list.length) return null;
  const sj = sujud(), first = list[0];
  return (
    <div className={`fav ${open ? "open" : ""}`}>
      <button className="favsum" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className={`favdot ${first.now ? "now" : ""}`} aria-hidden="true" />
        <span className="rt"><b>{first.now ? "Moment favorable, maintenant" : "Prochain moment favorable"}</b><small>{first.label} · {first.when.charAt(0).toLowerCase() + first.when.slice(1)}</small></span>
        <span className="chev" aria-hidden="true" />
      </button>
      {open && (
        <div className="favmore">
          {list.slice(1).map((m) => (
            <div className="favrow" key={m.key}><span className={`favdot ${m.now ? "now" : ""}`} aria-hidden="true" /><span className="rt"><b>{m.label}</b><small>{m.when}</small></span></div>
          ))}
          <div className="favrow"><span className="favdot" aria-hidden="true" /><span className="rt"><b>{sj.label}</b><small>À chaque prière</small></span></div>
          <p className="favsrc">{S.objective ? `${objectiveTag(S)} : garde ton invocation pour ces moments. ` : ""}Sources : {[...list.map((m) => m.source), sj.source].join(" ; ")}</p>
        </div>
      )}
    </div>
  );
}

/** Le journal du jour : remerciement et note, repliés tant qu’ils sont vides. */
export function Journal() {
  const { S, ui, update } = useStore();
  const dk = keyOf(ui.sel);
  const g = S.gratitude?.[dk] || "", note = S.days[dk]?.note || "";
  const [openG, setOpenG] = useState(false), [openN, setOpenN] = useState(false);
  return (
    <section className="sec journal">
      <div className="sechead"><h2>Ton journal</h2></div>
      <div className="list">
        {openG || g ? (
          <div className="jrow open">
            <label htmlFor="grat-j"><b>Al-hamdulillâh</b><small>Une chose pour laquelle tu remercies Allah aujourd’hui</small></label>
            <input id="grat-j" className="input" maxLength={140} autoFocus={openG && !g} enterKeyHint="done" value={g} placeholder="Par exemple : la santé de mes parents"
              onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
              onChange={(e) => { const t = e.target.value; update((s) => { s.gratitude = { ...(s.gratitude || {}), [dk]: t }; }); }} />
          </div>
        ) : (
          <button className="jrow" onClick={() => setOpenG(true)}><span className="rt"><b>Al-hamdulillâh du jour</b><small>Une chose pour laquelle tu remercies Allah</small></span><span className="jplus" aria-hidden="true">+</span></button>
        )}
        {openN || note ? (
          <div className="jrow open">
            <label htmlFor="note"><b>Note du jour</b><small>Ton intention, ce qui a bloqué ou avancé</small></label>
            <textarea id="note" className="area" autoFocus={openN && !note} placeholder="Écris ici…" value={note}
              onChange={(e) => { const v = e.target.value; update((x) => { ensureDay(x, dk).note = v; }); }} />
          </div>
        ) : (
          <button className="jrow" onClick={() => setOpenN(true)}><span className="rt"><b>Note du jour</b><small>Ton intention, ce qui a bloqué ou avancé</small></span><span className="jplus" aria-hidden="true">+</span></button>
        )}
      </div>
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
      <input id={`grat-${compact ? "c" : "j"}`} className="input" maxLength={140} enterKeyHint="done" onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} value={v} placeholder="Par exemple : la santé de mes parents"
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

/** « 4 personnes demandent aussi pour leur mariage » : un pont vers la communauté. */
export function SameNeed() {
  const { S } = useStore();
  const acc = useAccount();
  const [n, setN] = useState<number | null>(null);
  const cat = S.objective ? REQ_CAT_OF[S.objective.cat] : null;
  useEffect(() => {
    if (!supabase || acc.status !== "in" || !cat) return;
    supabase.rpc("feed_requests", { p_cat: cat, p_limit: 50 }).then(({ data }) => setN(data ? (data as RequestView[]).filter((r) => !r.prayed).length : null));
  }, [acc.status, cat]);
  if (!n) return null;
  return (
    <Link className="banner soft" href="/communaute">
      <div><b>{n} personne{n > 1 ? "s demandent" : " demande"} la même chose que toi</b><span>Invoque pour {n > 1 ? "elles" : "elle"}, en {n > 1 ? "leur" : "son"} absence.</span></div>
      <span className="act">Invoquer</span>
    </Link>
  );
}

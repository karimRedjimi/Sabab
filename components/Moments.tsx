"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, REQ_CAT_OF, type RequestView } from "@/lib/supabase";
import { useAccount } from "./Account";
import { keyOf, today } from "@/lib/dates";
import { favorableMoments, sujud } from "@/lib/moments";
import { needsPatience, objectiveTag } from "@/lib/objective";
import type { Entry } from "@/lib/program";
import { FORMES_DE_REPONSE } from "@/content/textes";
import { useStore } from "./Store";
import { derniersBienfaits } from "@/lib/journal";

/** Les prochains moments où l’invocation est exaucée : une ligne, qui se déplie. */
export function FavorableMoments() {
  const { S, now } = useStore();
  const [open, setOpen] = useState(false);
  const list = favorableMoments(S, now).slice(0, 2);
  if (!list.length) return null;
  const sj = sujud(), first = list[0];
  return (
    <div className={`fav inl ${open ? "open" : ""}`}>
      <button className="favsum" aria-expanded={open} onClick={() => setOpen(!open)} aria-label={`${first.now ? "Moment favorable maintenant" : "Prochain moment favorable"} : ${first.label}, ${first.short}. ${open ? "Replier" : "Voir les moments favorables"}`}>
        <span className={`favdot ${first.now ? "now" : ""}`} aria-hidden="true" />
        <span className="favline"><b>{first.now ? "Moment favorable maintenant" : "Moment favorable"}</b> · {first.short}</span>
        <span className="chev" aria-hidden="true" />
      </button>
      {open && (
        <div className="favmore">
          {list.map((m) => (
            <div className="favrow" key={m.key}><span className={`favdot ${m.now ? "now" : ""}`} aria-hidden="true" /><span className="rt"><b>{m.label.charAt(0).toUpperCase() + m.label.slice(1)}</b><small>{m.when}</small></span></div>
          ))}
          <div className="favrow"><span className="favdot" aria-hidden="true" /><span className="rt"><b>{sj.label}</b><small>À chaque prière</small></span></div>
          <p className="favsrc">{S.objective ? `${objectiveTag(S)} : garde ton invocation pour ces moments. ` : ""}Sources : {[...list.map((m) => m.source), sj.source].join(" ; ")}</p>
        </div>
      )}
    </div>
  );
}

/** Quand la réponse tarde : un mot doux, la patience, et les formes que prend la réponse. */
export function Patience({ onPatience }: { onPatience: (e: Entry) => void }) {
  const { S, update } = useStore();
  if (!needsPatience(S, today())) return null;
  const bienfaits = derniersBienfaits(S, 3);
  const close = () => update((s) => { s.patienceSeen = keyOf(today()); });
  return (
    <div className="banner warm pat">
      <div>
        <b>La réponse prend parfois un autre chemin</b>
        <span>{FORMES_DE_REPONSE}</span>
        {bienfaits.length > 0 && (
          <div className="patb"><small>Ce qu’Allah t’a déjà donné, d’après ton journal :</small>
            <ul>{bienfaits.map((b) => <li key={b.dk}>{b.text}</li>)}</ul></div>
        )}
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

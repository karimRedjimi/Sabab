"use client";
// La récitation du Coran : un bouton « Écouter » qui enchaîne les versets d’un passage.
import { useEffect, useRef, useState } from "react";
import { fichierVerset } from "@/content/versets-audio";

/** Un lecteur pour toute la page : il enchaîne les versets d’un passage, un seul son à la fois. */
export function useLecteur() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [cur, setCur] = useState<string | null>(null);
  const [joue, setJoue] = useState<string | null>(null);
  useEffect(() => () => { el.current?.pause(); }, []);
  const stop = () => { el.current?.pause(); setCur(null); setJoue(null); };
  const lire = (id: string, s: number, versets: number[]) => {
    if (joue === id) { stop(); return; }
    el.current?.pause();
    const files = versets.map((n) => ({ n, f: fichierVerset(s, n) })).filter((x): x is { n: number; f: string } => !!x.f);
    if (!files.length) return;
    let i = 0;
    const a = el.current || (el.current = new Audio());
    const next = () => {
      if (i >= files.length) { setCur(null); setJoue(null); return; }
      setCur(`${id}:${files[i].n}`); a.src = files[i].f; i++;
      a.play().catch(() => { setCur(null); setJoue(null); });
    };
    a.onended = next; setJoue(id); next();
  };
  return { cur, joue, lire };
}
type Lecteur = ReturnType<typeof useLecteur>;
export function Ecouter({ s, versets, id, lecteur }: { s: number; versets: number[]; id: string; lecteur: Lecteur }) {
  if (!versets.some((n) => fichierVerset(s, n))) return null;
  const on = lecteur.joue === id;
  return (
    <button className={`qplay ${on ? "on" : ""}`} onClick={() => lecteur.lire(id, s, versets)} aria-label={on ? "Arrêter la récitation" : "Écouter la récitation"}>
      <span aria-hidden="true">{on ? <svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg> : <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>}</span>
      {on ? <i className="qwave" aria-hidden="true"><b /><b /><b /><b /></i> : "Écouter"}
    </button>
  );
}


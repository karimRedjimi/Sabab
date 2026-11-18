"use client";
// Plus › Notifications : choisir ses rappels, simplement.
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { prefs, planifier, IGNORES_AVANT_ESPACER, type NotifKind, type NotifPrefs } from "@/lib/notifs";
import { abonnement, demander, essai, iphoneHorsAccueil, permission, pushPossible, VAPID } from "@/lib/push";
import { SALAT, SALAT_LABEL } from "@/lib/salat";
import { supabase } from "@/lib/supabase";
import { useAccount } from "../Account";
import { remettreRappel, suiviRappels } from "../Rappels";
import { buzz, useStore } from "../Store";

const TYPES: [Exclude<NotifKind, "priere">, string, string][] = [
  ["matin", "Invocations du matin", "1 h après le Fajr, si elles ne sont pas faites. Avec tes révisions du jour."],
  ["soir", "Invocations du soir", "30 min après le ʿAsr, si elles ne sont pas faites."],
  ["relance", "Relance douce", "Une seule, le soir, si ta journée n’est pas tenue."],
  ["journal", "Ton journal du soir", "Vers 21 h 30, seulement s’il n’est pas rempli. Il prend la place de la relance quand ta journée est tenue."],
  ["vendredi", "Dernière heure du vendredi", "Une fois par semaine, avant le Maghreb."],
  ["verset", "Verset du jour", "En milieu de journée, pour le réciter."],
  ["nuit", "Prière de nuit", "Au début du dernier tiers de la nuit."],
];
const LABEL: Record<NotifKind, string> = { priere: "Prière", matin: "Matin", soir: "Soir", relance: "Relance", vendredi: "Vendredi", verset: "Verset", nuit: "Nuit", journal: "Journal" };

function Interrupteur({ on, titre, sous, onClick, disabled }: { on: boolean; titre: string; sous?: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button className="sopt nopt" role="switch" aria-checked={on} disabled={disabled} onClick={onClick}>
      <span className="t"><b>{titre}</b>{sous && <small>{sous}</small>}</span>
      <span className={`sw ${on ? "" : "off"}`} aria-hidden="true" />
    </button>
  );
}

export function Notifications() {
  const { S, update, toast } = useStore();
  const acc = useAccount();
  const p = prefs(S);
  const [perm, setPerm] = useState<string>("default");
  const [hors, setHors] = useState(false);
  const [possible, setPossible] = useState(true);
  const [espaces, setEspaces] = useState<string[]>([]);
  useEffect(() => {
    setPerm(permission()); setHors(iphoneHorsAccueil()); setPossible(pushPossible());
    const s = suiviRappels(); setEspaces(Object.keys(s.ignores).filter((k) => (s.ignores[k as NotifKind] || 0) >= IGNORES_AVANT_ESPACER));
  }, []);
  const set = (fn: (n: NotifPrefs) => void) => update((s) => { const n = prefs(s); fn(n); s.notifs = n; });
  const prochains = useMemo(() => planifier({ ...S, notifs: { ...p, on: true } }, new Date()).slice(0, 4), [S, p]);

  const activer = async () => {
    const r = await demander(); setPerm(r);
    if (r === "granted") { set((n) => { n.on = true; }); await abonnement(true); buzz(12); toast("Rappels activés"); }
    else if (r === "denied") toast("Les notifications sont bloquées dans les réglages du téléphone");
  };
  const couper = async () => {
    set((n) => { n.on = false; });
    toast("Rappels désactivés");
    const sub = await abonnement(false);
    if (sub && supabase) await supabase.rpc("push_schedule", { p_endpoint: sub.endpoint, p_items: [] });
  };
  const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" });

  const bloque = hors ? "iphone" : !possible ? "navigateur" : acc.status === "off" ? "off" : acc.status !== "in" ? "compte" : perm === "denied" ? "refus" : null;
  return (
    <>
      <div className="page"><h1>Notifications</h1>
        <p className="lead">Des rappels utiles, jamais pour ce qui est déjà fait, et pas plus de trois par jour en plus des prières.</p></div>

      {bloque === "iphone" && (
        <div className="ncard">
          <b>Sur iPhone, depuis l’écran d’accueil</b>
          <p>Les rappels ne marchent que si tu ouvres Sabab depuis son icône. Dans Safari, touche Partager, puis « Sur l’écran d’accueil », et ouvre Sabab depuis l’icône.</p>
        </div>
      )}
      {bloque === "navigateur" && <div className="ncard"><b>Ce navigateur ne permet pas les rappels</b><p>Essaie avec Safari (depuis l’écran d’accueil sur iPhone) ou Chrome.</p></div>}
      {bloque === "compte" && <div className="ncard"><b>Les rappels ont besoin d’un compte</b><p>Ils partent d’un serveur. <Link href="/compte">Crée ton compte ou connecte-toi</Link>.</p></div>}
      {bloque === "off" && <div className="ncard"><b>Bientôt</b><p>Les rappels ouvriront avec les comptes.</p></div>}
      {bloque === "refus" && <div className="ncard"><b>Les notifications sont bloquées</b><p>Autorise-les dans les réglages du téléphone (Réglages › Notifications › Sabab), puis reviens ici.</p></div>}

      <section className="sec">
        <Interrupteur on={p.on && perm === "granted"} titre="Recevoir les rappels" sous={p.on && perm === "granted" ? "Activés sur cet appareil" : "Désactivés"} disabled={!!bloque && !(p.on && perm === "granted")}
          onClick={() => (p.on && perm === "granted" ? couper() : activer())} />
        {!VAPID && p.on && <p className="fine">Les rappels seront envoyés dès que le serveur sera configuré.</p>}
      </section>

      <div className={p.on ? "" : "ndim"}>
        <section className="sec">
          <div className="sechead"><h2>Avant la prière</h2></div>
          <div className="pchips" role="group" aria-label="Prières">
            {SALAT.map((k) => (
              <button key={k} aria-pressed={p.prieres[k]} onClick={() => set((n) => { n.prieres[k] = !n.prieres[k]; })}>{SALAT_LABEL[k]}</button>
            ))}
          </div>
          <nav className="seg" aria-label="Combien de minutes avant ?" style={{ marginTop: 12 }}>
            {([5, 10, 15, 30] as const).map((m) => (
              <a key={m} href="#" aria-current={p.avant === m ? "page" : undefined} onClick={(e) => { e.preventDefault(); set((n) => { n.avant = m; }); }}>{m} min avant</a>
            ))}
          </nav>
        </section>

        <section className="sec">
          <div className="sechead"><h2>Les rappels</h2></div>
          {TYPES.map(([k, t, d]) => (
            <Interrupteur key={k} on={p[k]} titre={t} sous={espaces.includes(k) ? `${d} · Un jour sur deux : tu l’as souvent laissé passer` : d} onClick={() => set((n) => { n[k] = !n[k]; })} />
          ))}
          {espaces.length > 0 && <p className="fine">Un rappel souvent laissé passer s’espace tout seul. <button className="link" onClick={() => { espaces.forEach(remettreRappel); setEspaces([]); toast("Rappels remis chaque jour"); }}>Les remettre chaque jour</button></p>}
        </section>

        <section className="sec">
          <div className="sechead"><h2>Discrétion</h2></div>
          <Interrupteur on={p.discret} titre="Mode discret" sous="Sur l’écran verrouillé : « Sabab · un moment t’attend », sans rien d’autre." onClick={() => set((n) => { n.discret = !n.discret; })} />
        </section>

        {prochains.length > 0 && (
          <section className="sec">
            <div className="sechead"><h2>Tes prochains rappels</h2></div>
            <ul className="nnext">{prochains.map((r) => <li key={r.id}><span>{fmt(r.at)}</span><b>{r.title}</b><em>{LABEL[r.kind]}</em></li>)}</ul>
          </section>
        )}
        {perm === "granted" && (
          <button className="navbtn strong" onClick={() => essai(p.discret ? "Sabab" : "ʿAsr dans 10 min", p.discret ? "Un moment t’attend." : "Prépare-toi pour la prière du ʿAsr.").then(() => toast("Rappel d’essai envoyé")).catch(() => toast("Impossible d’afficher le rappel"))}>Recevoir un rappel d’essai</button>
        )}
      </div>
    </>
  );
}

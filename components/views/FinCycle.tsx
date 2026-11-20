"use client";
// La fin d’un cycle (un mois lunaire) et le récapitulatif de l’année, avant Ramadan.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { NIVEAUX } from "@/content/journee";
import { REGULARITE } from "@/content/textes";
import { bilanAMontrer, bilanCycle, cycle, cyclePrecedent, decisionNiveau, nomMois, recapAMontrer, recapAnnee, type Cycle } from "@/lib/cycle";
import { keyOf, today } from "@/lib/dates";
import { choisirNiveau, niveau } from "@/lib/journee";
import { objectiveName } from "@/lib/objective";
import { Ciel, Galaxie } from "../Journal";
import { buzz, useStore } from "../Store";

function useImmersif() {
  useEffect(() => { document.documentElement.classList.add("immersive"); return () => document.documentElement.classList.remove("immersive"); }, []);
}

/** La bannière de l’accueil : le bilan du cycle qui vient de se terminer. */
export function CycleBanner() {
  const { S } = useStore();
  const p = bilanAMontrer(S, today());
  if (!p) return null;
  return (
    <Link className="banner cyb" href="/cycle">
      <div><b>Ton cycle de {p.mois} est terminé</b><span>Ton bilan, et ce que tu choisis pour {cycle(S, today()).mois}.</span></div>
      <span className="act">Voir</span>
    </Link>
  );
}
/** La bannière du récapitulatif de l’année, les 10 derniers jours de Cha‘ban. */
export function RecapBanner() {
  const { S } = useStore();
  const a = recapAMontrer(S, today());
  if (!a) return null;
  return (
    <Link className="banner cyb" href="/annee">
      <div><b>Ton année {a}, avant Ramadan</b><span>Ce que tu as construit, et l’élan pour le mois béni.</span></div>
      <span className="act">Voir</span>
    </Link>
  );
}

export function FinCycle() {
  useImmersif();
  const { S, update, toast } = useStore();
  const router = useRouter();
  const t = today();
  // Le cycle à montrer : celui qui vient de se terminer, sinon le cycle en cours (consultation).
  const [c] = useState<Cycle>(() => bilanAMontrer(S, t) || cyclePrecedent(S, t));
  const suivant = cycle(S, t);
  const b = bilanCycle(S, c);
  const dec = decisionNiveau(S, b), n = niveau(S);
  const [choix, setChoix] = useState<"monter" | "alleger" | "rester" | null>(S.cycles?.[c.cle]?.decision || null);
  const terminer = (besoin: "continuer" | "changer" | "exauce") => {
    buzz(14);
    update((s) => {
      s.cycles = { ...(s.cycles || {}), [c.cle]: { vu: keyOf(t), ...(choix ? { decision: choix } : {}) } };
      if (choix === "monter" && n < 5) choisirNiveau(s, (n + 1) as 1 | 2 | 3 | 4 | 5, t);
      if (choix === "alleger" && n > 1) choisirNiveau(s, (n - 1) as 1 | 2 | 3 | 4 | 5, t);
    });
    if (choix === "monter") toast(`Niveau ${n + 1} pour ${suivant.mois}, bismillâh`);
    if (choix === "alleger") toast(`Niveau ${n - 1} pour ${suivant.mois} : un pas sûr vaut mieux`);
    router.push(besoin === "changer" ? "/objectif" : besoin === "exauce" ? "/carnet" : "/");
  };
  return (
    <div className="fincy">
      <p className="fk">Fin du cycle {c.num}</p>
      <h1>{c.mois} s’achève.<br />Qu’Allah l’accepte.</h1>
      <div className="fciel"><Ciel mois={c.cle} /></div>
      <div className="fst">
        <div><b>{b.tenus}<small> / {b.jours}</small></b><span>jours tenus</span></div>
        <div><b>{b.fajr}</b><span>Fajr à l’heure</span></div>
        <div><b>{b.gestes}</b><span>gestes pour ton besoin</span></div>
        <div><b>{b.bienfaits}</b><span>bienfait{b.bienfaits > 1 ? "s" : ""}, autant d’étoiles</span></div>
        {b.versets > 0 && <div><b>{b.versets}</b><span>versets lus</span></div>}
        {b.sues > 0 && <div><b>{b.sues}</b><span>invocation{b.sues > 1 ? "s" : ""} sue{b.sues > 1 ? "s" : ""} par cœur</span></div>}
      </div>
      {dec && (
        <div className="flv">
          {dec === "monter"
            ? <><b>{b.tenus} jours tenus ce mois-ci</b><p>Passer au niveau {n + 1} de la journée du Prophète ﷺ pour {suivant.mois} : « {NIVEAUX[(n + 1) as 1 | 2 | 3 | 4 | 5].titre} » ?</p></>
            : <><b>Un mois plus difficile, et c’est humain</b><p>Revenir au niveau {n - 1} pour {suivant.mois}, et tenir avec régularité ? « {REGULARITE.texte} » <small>{REGULARITE.source}</small></p></>}
          <div className="fbtns">
            <button className={choix === dec ? "on" : ""} onClick={() => setChoix(dec)}>{dec === "monter" ? "Monter" : "Alléger"}</button>
            <button className={choix === "rester" ? "on" : ""} onClick={() => setChoix("rester")}>Rester au niveau {n}</button>
          </div>
        </div>
      )}
      {S.objective && (
        <div className="fch">
          <p>Pour {suivant.mois}, ton besoin :</p>
          <button className="on" onClick={() => terminer("continuer")}><span>Continuer : {objectiveName(S)}</span><span aria-hidden="true">✓</span></button>
          <button onClick={() => terminer("changer")}><span>Changer de besoin</span><span aria-hidden="true">›</span></button>
          <button onClick={() => terminer("exauce")}><span>Exaucé, al-hamdulillâh</span><span aria-hidden="true">›</span></button>
        </div>
      )}
      {!S.objective && <button className="bigbtn fgo" onClick={() => terminer("continuer")}>Bismillâh, commencer {suivant.mois}</button>}
    </div>
  );
}

export function Annee() {
  useImmersif();
  const { S, update } = useStore();
  const router = useRouter();
  const t = today();
  const a = recapAMontrer(S, t) || cycle(S, t).annee;
  const r = recapAnnee(S, a, t);
  const fajr = r.fajrDebut && r.fajrFin > r.fajrDebut ? `×${(r.fajrFin / r.fajrDebut).toFixed(1).replace(".0", "").replace(".", ",")}` : `${r.fajrFin}/30`;
  const vu = () => update((s) => { s.recaps = { ...(s.recaps || {}), [a]: keyOf(t) }; });
  return (
    <div className="fincy">
      <p className="fk">Avant Ramadan</p>
      <h1>Ton année {a},<br />avant d’accueillir Ramadan</h1>
      <div className="fgal"><Galaxie annee={a} jusqua={8} /></div>
      <div className="fst f3">
        <div><b>{r.prieres.toLocaleString("fr-FR")}</b><span>prières notées</span></div>
        <div><b>{fajr}</b><span>Fajr à l’heure{r.fajrDebut && r.fajrFin > r.fajrDebut ? ` depuis ${nomMois(1)}` : " ce mois-ci"}</span></div>
        <div><b>{r.niveau}</b><span>niveau atteint</span></div>
        <div><b>{r.versets.toLocaleString("fr-FR")}</b><span>versets lus</span></div>
        <div><b>{r.sues}</b><span>invocations sues</span></div>
        <div><b>{r.exauces}</b><span>du’â exaucée{r.exauces > 1 ? "s" : ""}</span></div>
      </div>
      <div className="flv">
        <b>Prépare ton Ramadan</b><p>Choisis ton niveau et ton intention pour le mois béni.</p>
        <div className="fbtns"><button className="on" onClick={() => { vu(); router.push("/rythme"); }}>Commencer</button><button onClick={() => { vu(); router.push("/"); }}>Plus tard</button></div>
      </div>
      <p className="fprive">Rien que pour toi : ces chiffres ne sont ni publiés ni comparés.</p>
    </div>
  );
}

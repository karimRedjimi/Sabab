"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { DAYS, ITEMS, OBJ_CATS, PARCOURS, PARCOURS_DAYS, SOCLE } from "@/content/programme";
import { LEVELS, METHODS } from "@/content/reglages";
import { FORCE_DU_PROGRAMME, LIRE_LES_SOURCES, PRECISION_WAQIA, PROGRAMME_INTRO } from "@/content/textes";
import { diffDays, fromKey, keyOf, today } from "@/lib/dates";
import { parcoursDay, rampWeek } from "@/lib/program";
import { prayerTimes } from "@/lib/prayer";
import { DisplayChips, ReadonlyCard } from "../Cards";
import { CityPicker, PrayerStrip } from "../Prayer";
import { useStore } from "../Store";

export function Plus() {
  const { S } = useStore();
  const p = S.parcours && PARCOURS[S.parcours.id];
  const pd = parcoursDay(S, today()), rw = rampWeek(S, today());
  const rows: [string, string, string][] = [
    ["/objectif", "Mon objectif", S.objective ? S.objective.title : "Pas encore fixé"],
    ["/parcours", "Parcours de 40 jours", p && pd ? `${p.title}, jour ${pd}` : "Aucun en cours"],
    ["/communaute", "Communauté", "Bientôt"],
    ["/binome", "Mon binôme", "Bientôt"],
    ["/bilan", "Mon bilan", "Semaine et mois"],
    ["/rythme", "Mon rythme", rw ? `Démarrage, semaine ${rw}` : "Programme complet"],
    ["/priere", "Horaires de prière", S.prayer ? S.prayer.city : "Ville à choisir"],
    ["/programme", "Le programme complet", "Textes et sources"],
    ["/donnees", "Mes données", "Exporter, importer, effacer"],
    ["/confidentialite", "Confidentialité", "Ce que l’application garde"],
  ];
  return (
    <>
      <div className="page"><h1>Plus</h1></div>
      <Apparence />
      <ul className="menu">{rows.map(([href, l, sub]) => <li key={href}><Link href={href}>{l} <span>{sub}</span></Link></li>)}</ul>
    </>
  );
}

function Apparence() {
  const [t, setT] = useState<Theme>("auto");
  useEffect(() => setT(getTheme()), []);
  const opts: [Theme, string][] = [["auto", "Automatique"], ["light", "Jour"], ["dark", "Nuit"]];
  return (
    <section className="sec">
      <div className="sechead"><h2>Apparence</h2></div>
      <div className="seg" role="radiogroup" aria-label="Apparence">
        {opts.map(([k, l]) => (
          <a key={k} href="#" role="radio" aria-checked={t === k} aria-current={t === k ? "page" : undefined}
            onClick={(e) => { e.preventDefault(); setTheme(k); setT(k); }}>{l}</a>
        ))}
      </div>
      {t === "auto" && <p className="secintro" style={{ margin: "-8px 4px 0" }}>Suit le réglage de ton téléphone.</p>}
    </section>
  );
}

export function Objectif() {
  const { S, update, toast } = useStore();
  const o = S.objective;
  const [title, setTitle] = useState(o?.title || "");
  const [cat, setCat] = useState(o?.cat || Object.keys(OBJ_CATS)[0]);
  const [why, setWhy] = useState(o?.why || "");
  const sug = o && OBJ_CATS[o.cat] ? PARCOURS[OBJ_CATS[o.cat].p] : null;
  const save = () => {
    const t = title.trim();
    if (!t) { toast("Écris ton objectif en une phrase"); return; }
    update((s) => { s.objective = { title: t, cat, why: why.trim(), since: s.objective?.since || keyOf(today()) }; });
    toast("Objectif enregistré");
  };
  return (
    <>
      <div className="page"><h1>Mon objectif</h1>
        <p className="lead">L’invocation et l’effort vont ensemble : chaque jour, une action concrète pour ton objectif.</p></div>
      <section className="sec">
        <label className="field"><span>Ce que je veux atteindre</span>
          <input className="input" id="otitle" maxLength={100} placeholder="Par exemple : signer trois nouveaux clients" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Domaine</span>
          <select className="select" id="ocat" value={cat} onChange={(e) => setCat(e.target.value)}>
            {Object.entries(OBJ_CATS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
          </select></label>
        <label className="field"><span>Pourquoi c’est important pour moi</span>
          <textarea className="area" id="owhy" maxLength={400} placeholder="Ton intention, pour Allah et pour les tiens" value={why} onChange={(e) => setWhy(e.target.value)} /></label>
        <div className="row">
          <button className="navbtn primary" onClick={save}>{o ? "Mettre à jour" : "Fixer mon objectif"}</button>
          {o && <button className="link danger" onClick={() => { update((s) => { s.objective = null; }); setTitle(""); setWhy(""); }}>Retirer l’objectif</button>}
        </div>
      </section>
      {o && sug && (!S.parcours || S.parcours.id !== OBJ_CATS[o.cat].p) && (
        <div className="setup"><p>Le parcours « {sug.title} » accompagne bien cet objectif.</p><Link className="navbtn strong" href="/parcours">Voir le parcours</Link></div>
      )}
    </>
  );
}

export function Parcours() {
  const { S, update, toast } = useStore();
  const router = useRouter();
  const cur = S.parcours, pd = parcoursDay(S, today());
  return (
    <>
      <div className="page"><h1>Parcours de 40 jours</h1>
        <p className="lead">Des invocations ciblées et un geste concret chaque jour, pendant 40 jours. Un parcours à la fois.</p></div>
      {Object.entries(PARCOURS).map(([id, p]) => {
        const active = cur && cur.id === id && pd;
        const finished = cur && cur.id === id && !pd && diffDays(today(), fromKey(cur.start)) >= PARCOURS_DAYS;
        return (
          <div key={id} className={`card ${active ? "active" : ""}`}>
            <h3>{p.title}</h3><p>{p.intro}</p>
            <p style={{ fontSize: ".9rem" }}>{p.duas.map((d) => ITEMS[d].title).join(" · ")}</p>
            {active ? (
              <>
                <div className="learnbar"><i style={{ width: `${(pd / PARCOURS_DAYS) * 100}%` }} /></div>
                <p style={{ fontSize: ".9rem", margin: "4px 0 10px" }}>Jour {pd} sur {PARCOURS_DAYS}</p>
                <button className="link danger" onClick={() => update((s) => { s.parcours = null; })}>Arrêter ce parcours</button>
              </>
            ) : (
              <>
                {finished && <p style={{ fontSize: ".9rem", color: "var(--accent)" }}>Parcours terminé, qu’Allah l’accepte.</p>}
                <button className="navbtn strong" onClick={() => {
                  update((s) => { s.parcours = { id, start: keyOf(today()) }; });
                  toast(`Parcours commencé : jour 1 sur ${PARCOURS_DAYS}`); router.push("/");
                }}>{cur && pd ? "Remplacer par ce parcours" : "Commencer aujourd’hui"}</button>
              </>
            )}
          </div>
        );
      })}
    </>
  );
}

export function Priere() {
  const { S, update } = useStore();
  const P = S.prayer, pt = P ? prayerTimes(today(), P) : null;
  return (
    <>
      <div className="page"><h1>Horaires de prière</h1>
        <p className="lead">Calculés sur ton appareil pour caler ton programme. Vérifie-les avec ta mosquée et ajuste la méthode si besoin.</p></div>
      <section className="sec">
        <CityPicker id="pcity" />
        <label className="field"><span>Méthode de calcul</span>
          <select className="select" id="pmethod" value={P?.method || "uoif"} onChange={(e) => { const v = e.target.value; if (P) update((s) => { if (s.prayer) s.prayer.method = v; }); }}>
            {Object.entries(METHODS).map(([k, m]) => <option key={k} value={k}>{m.l}</option>)}
          </select></label>
      </section>
      {pt && P && <section className="sec"><div className="sechead"><h2>Aujourd’hui à {P.city}</h2></div><PrayerStrip d={today()} /></section>}
    </>
  );
}

export function Programme() {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <>
      <div className="page"><h1>Le programme</h1><p className="lead">{PROGRAMME_INTRO}</p></div>
      <DisplayChips />
      <section className="sec"><div className="sechead"><h2>Comment lire les sources</h2></div>
        <p>{LIRE_LES_SOURCES.map((x, i) => <span key={x.terme}>{i ? " " : ""}<b>{x.terme}</b> : {x.def}</span>)}</p></section>
      <section className="sec"><div className="sechead"><h2>Chaque jour</h2></div>{SOCLE.map((id) => <ReadonlyCard key={id} id={id} />)}</section>
      {order.map((i) => (
        <section className="sec" key={i}>
          <div className="sechead"><h2>{DAYS[i].name}</h2><span className="count">{DAYS[i].theme}</span></div>
          {DAYS[i].items.map((id) => <ReadonlyCard key={id} id={id} theme />)}
        </section>
      ))}
      <section className="sec"><div className="sechead"><h2>Ce qui donne sa force au programme</h2></div>
        {FORCE_DU_PROGRAMME.map((x) => (
          <div className="acc" key={x.titre}><h3>{x.titre}</h3><p>{x.texte}</p><p className="src"><b>{x.label} :</b> {x.source}</p></div>
        ))}
      </section>
      <section className="sec"><div className="sechead"><h2>Une précision</h2></div><p>{PRECISION_WAQIA}</p></section>
    </>
  );
}

export function Confidentialite() {
  return (
    <>
      <div className="page"><h1>Confidentialité</h1>
        <p className="lead">Aucune publicité. Aucune donnée revendue. Ce que tu écris ici t’appartient.</p></div>
      <section className="sec">
        <p>Pour l’instant, ta progression, tes notes, ton objectif et ton carnet d’invocations sont enregistrés uniquement sur cet appareil : rien n’est envoyé ailleurs. Quand les comptes arriveront, ils seront enregistrés dans un espace privé lié à ton compte, auquel personne d’autre n’aura accès, et seulement avec ton accord explicite.</p>
        <p>Si tu rejoins un cercle, ses membres voient seulement deux choses : ton nom et les jours où tu as tenu ta journée, sur les 30 derniers jours. Jamais le détail de ce que tu as fait.</p>
        <p>Dans la communauté, tu apparais sous un identifiant anonyme qui n’est pas relié à ton nom. Les autres voient seulement des chiffres collectifs : combien de membres ont tenu leur journée, combien dans chaque cercle. Tes demandes de du’â et tes témoignages sont publiés sans ton nom, avec le prénom ou le pseudonyme que tu choisis, ou « Un membre ».</p>
        <p>Les horaires de prière sont calculés sur ton appareil à partir de ta ville. Ta position, si tu l’utilises, ne sert qu’à ce calcul et n’est pas envoyée.</p>
        <p>Tu peux à tout moment <Link href="/donnees">exporter ou effacer tes données</Link>.</p>
      </section>
    </>
  );
}

export function Rythme() {
  const { S, update, toast, setUi } = useStore();
  const router = useRouter();
  const ramp = rampWeek(S, today());
  return (
    <>
      <div className="page"><h1>Mon rythme</h1><p className="lead">Adapte le programme à ton niveau.</p></div>
      <section className="sec"><div className="sechead"><h2>Démarrage</h2></div>
        <p className="secintro">{ramp ? `Démarrage en douceur, semaine ${ramp} sur 2.` : "Tu suis le programme complet."}</p>
        <div className="row">
          {ramp
            ? <button className="navbtn strong" onClick={() => { update((s) => { s.rampDone = keyOf(today()); }); toast("Programme complet activé"); }}>Passer au programme complet</button>
            : <button className="navbtn" onClick={() => { update((s) => { s.rampStart = keyOf(today()); s.rampDone = null; }); toast("Démarrage en douceur relancé"); }}>Recommencer en douceur</button>}
        </div></section>
      <section className="sec"><div className="sechead"><h2>Mon rapport à l’arabe</h2></div>
        <div className="choices">
          {Object.entries(LEVELS).map(([k, v]) => (
            <button key={k} className="choice" aria-pressed={S.level === k} onClick={() => update((s) => { s.level = k; s.show = { ...v.show }; })}>{v.l}<small>{v.d}</small></button>
          ))}
        </div></section>
      <section className="sec"><div className="sechead"><h2>Minimum du jour</h2></div>
        <p className="secintro">Les jours chargés, active-le depuis la page Jour : trois invocations courtes suffisent pour tenir ta journée.</p></section>
      <p><button className="link" onClick={() => { setUi(() => ({ forceOb: true })); router.push("/bienvenue"); }}>Refaire l’accueil</button></p>
    </>
  );
}

export function Communaute() {
  return (
    <>
      <div className="page"><h1>Communauté</h1>
        <p className="lead">Avancer ensemble, sans se montrer. Ici, personne n’a de nom ni de classement : seulement des chiffres collectifs, des demandes de du’â et des témoignages anonymes.</p></div>
      <p className="empty">La communauté ouvrira avec les comptes : elle a besoin que tu sois connecté.</p>
    </>
  );
}

export function Binome() {
  return (
    <>
      <div className="page"><h1>Mon binôme</h1>
        <p className="lead">Avancer à deux aide à tenir. Dans ton cercle, chacun voit uniquement si les autres ont tenu leur journée : jamais leurs invocations, leurs notes, leur objectif ni leur carnet. Pas de classement, pas de score public, pour préserver la sincérité de l’intention.</p></div>
      <p className="empty">Le binôme a besoin que tu sois connecté à ton compte. Ta progression reste enregistrée sur cet appareil en attendant.</p>
    </>
  );
}

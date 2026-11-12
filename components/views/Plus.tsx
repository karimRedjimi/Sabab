"use client";
import { NIVEAUX } from "@/content/journee";
import { choisirNiveau, niveau } from "@/lib/journee";
import { CORAN_LEVELS, coranLevel } from "@/lib/coran";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getTheme, setTheme, type Theme } from "@/lib/theme";
import { useAccount } from "../Account";
import { Glyph, PageBand } from "../Glyphs";
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
  const acc = useAccount();
  const p = S.parcours && PARCOURS[S.parcours.id];
  const pd = parcoursDay(S, today()), rw = rampWeek(S, today());
  // [lien, icône, titre, valeur à droite, valeur mise en avant]
  type Row = [string, string, string, string, string?];
  const groups: [string, Row[]][] = [
    ["Mon programme", [
      ["/objectif", "target", "Mon objectif", S.objective ? "" : "À fixer", S.objective?.title],
      ...(S.objective ? [["/chemin", "path", "Mon chemin", pd ? `Jour ${pd}` : ""] as Row] : []),
      ["/parcours", "cal", "Parcours de 40 jours", p && pd ? p.title : "Aucun"],
      ["/bilan", "chart", "Mon bilan", "Semaine, mois"],
      ["/rythme", "rhythm", "Mon rythme", rw ? `Semaine ${rw}` : "Complet"],
      ["/programme", "book", "Le programme complet", ""],
      ["/carnet", "heart", "Carnet des du’â exaucées", ""],
      ["/combat", "leaf", "Mon combat", ""],
    ]],
    ["Ensemble", [
      ["/compte", "user", "Mon compte", acc.status === "in" ? "Connecté" : acc.status === "off" ? "Bientôt" : "Se connecter", acc.status === "in" ? acc.email || undefined : undefined],
      ["/binome", "pair", "Mon binôme", "Bientôt"],
    ]],
    ["Réglages", [
      ["/priere", "clock", "Horaires de prière", S.prayer ? S.prayer.city : "À choisir"],
      ["/donnees", "download", "Mes données", ""],
      ["/confidentialite", "shield", "Confidentialité", ""],
    ]],
  ];
  return (
    <>
      <PageBand title="Plus">
        <div className="bchips">
          {S.objective && <Link href="/objectif" className="bchip"><Glyph name="target" />{S.objective.title}</Link>}
          <Link href="/rythme" className="bchip"><Glyph name="sun" />Niveau {niveau(S)} · {NIVEAUX[niveau(S)].titre}</Link>
          {S.prayer && <Link href="/priere" className="bchip"><Glyph name="pin" />{S.prayer.city}</Link>}
        </div>
      </PageBand>
      {groups.map(([title, rows]) => (
        <section className="sec" key={title}>
          <div className="sechead"><h2>{title}</h2></div>
          <ul className="menu">{rows.map(([href, ic, l, v, em]) => (
            <li key={href}><Link href={href}>
              <Glyph name={ic} className="mi" />
              <span className="mt"><b>{l}</b>{em && <em>{em}</em>}</span>
              {v && <span className="mv">{v}</span>}
              <i className="chev" aria-hidden="true" />
            </Link></li>
          ))}</ul>
        </section>
      ))}
      <Apparence />
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
          <input className="input" id="otitle" maxLength={100} enterKeyHint="done" onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} placeholder="Par exemple : signer trois nouveaux clients" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="field"><span>Domaine</span>
          <select className="select" id="ocat" value={cat} onChange={(e) => setCat(e.target.value)}>
            {Object.entries(OBJ_CATS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
          </select></label>
        <label className="field"><span>Pourquoi c’est important pour moi</span>
          <textarea className="area" id="owhy" maxLength={400} placeholder="Ton intention, pour Allah et pour les tiens" value={why} onChange={(e) => setWhy(e.target.value)} /></label>
        <div className="row">
          <button className="navbtn primary" onClick={save}>{o ? "Mettre à jour" : "Fixer mon objectif"}</button>
          {o && <button className="link danger" onClick={() => {
            const prev = o;
            update((s) => { s.objective = null; }); setTitle(""); setWhy("");
            toast("Objectif retiré", { label: "Annuler", run: () => { update((s) => { s.objective = prev; }); setTitle(prev.title); setWhy(prev.why); } });
          }}>Retirer l’objectif</button>}
        </div>
      </section>
      {o && (
        <section className="sec">
          <div className="sechead"><h2>Discrétion</h2></div>
          <button className="choice" aria-pressed={S.showObjective !== false} onClick={() => update((s) => { s.showObjective = s.showObjective === false; })}>
            Afficher mon objectif sur la page Jour
            <small>{S.showObjective !== false ? "Une ligne sous le titre du jour et les invocations du parcours marquées pour ton objectif." : "Ton objectif n’apparaît plus sur la page Jour, seulement ici et dans « Mes actions »."}</small>
          </button>
        </section>
      )}
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
      {Object.entries(PARCOURS).sort(([x], [y]) => (cur?.id === y ? 1 : 0) - (cur?.id === x ? 1 : 0)).map(([id, p]) => {
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
                <button className="link danger" onClick={() => { const prev = cur; update((s) => { s.parcours = null; }); toast("Parcours arrêté", { label: "Annuler", run: () => update((s) => { s.parcours = prev; }) }); }}>Arrêter ce parcours</button>
              </>
            ) : (
              <>
                {finished && <p style={{ fontSize: ".9rem", color: "var(--accent)" }}>Parcours terminé, qu’Allah l’accepte.</p>}
                <button className="navbtn strong" onClick={() => {
                  const prev = cur;
                  update((s) => { s.parcours = { id, start: keyOf(today()) }; });
                  toast(`Parcours commencé : jour 1 sur ${PARCOURS_DAYS}`, prev && pd ? { label: "Annuler", run: () => update((s) => { s.parcours = prev; }) } : undefined); router.push("/");
                }}>{cur && pd ? "Choisir ce parcours" : "Commencer aujourd’hui"}</button>
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
        <p>Sans compte, ta progression, tes notes, ton objectif et ton carnet sont enregistrés uniquement sur cet appareil. Avec un compte, et seulement avec ton accord explicite, ils sont enregistrés dans un espace privé lié à ton compte, hébergé en Europe, auquel aucun autre membre n’a accès. Tu peux supprimer ton compte et toutes ses données à tout moment.</p>
        <p>Si tu rejoins un cercle, ses membres voient seulement deux choses : ton nom et les jours où tu as tenu ta journée, sur les 30 derniers jours. Jamais le détail de ce que tu as fait.</p>
        <p>Dans la communauté, tu apparais sous un identifiant anonyme qui n’est pas relié à ton nom. Les autres voient seulement des chiffres collectifs : combien de membres ont tenu leur journée, combien dans chaque cercle. Tes demandes de du’â et tes témoignages sont publiés sans ton nom, avec le prénom ou le pseudonyme que tu choisis, ou « Un membre ».</p>
        <p>Pour te connecter, tu peux utiliser un code reçu par e-mail, un mot de passe, ou ton compte Google. Si tu choisis Google, Google sait que tu t’es connecté à Sabab et nous transmet seulement ton nom et ton adresse e-mail ; il ne voit jamais ce que tu fais dans l’application. Les e-mails de connexion sont envoyés par Brevo, un prestataire européen.</p>
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
      <section className="sec"><div className="sechead"><h2>La journée du Prophète ﷺ</h2><span className="count">niveau {niveau(S)}</span></div>
        <p className="secintro">Chaque niveau ajoute un peu au précédent. Le suivant t’est proposé après quatorze jours tenus ; tu peux revenir en arrière à tout moment.</p>
        <div className="choices">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button key={n} className="choice" aria-pressed={niveau(S) === n} onClick={() => { update((s) => choisirNiveau(s, n, today())); toast(`Niveau ${n} : ${NIVEAUX[n].titre.toLowerCase()}`); }}>
              <b style={{ fontWeight: 600 }}>Niveau {n} · {NIVEAUX[n].titre}</b><small>{NIVEAUX[n].ajoute}</small>
            </button>
          ))}
        </div></section>
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
      <section className="sec"><div className="sechead"><h2>Rappel du Coran</h2></div>
        <p className="secintro">Quelques versets à lire le matin et le soir, choisis le plus souvent selon ton objectif.</p>
        <div className="choices">
          {CORAN_LEVELS.map((l) => (
            <button key={l.n} className="choice" aria-pressed={coranLevel(S) === l.n} onClick={() => update((s) => { s.coranLevel = l.n; })}>{l.l}<small>{l.d}</small></button>
          ))}
        </div></section>
      <section className="sec"><div className="sechead"><h2>Minimum du jour</h2></div>
        <p className="secintro">Les jours chargés, active-le depuis la page Jour : trois invocations courtes suffisent pour tenir ta journée.</p></section>
      <p><button className="link" onClick={() => { setUi(() => ({ forceOb: true })); router.push("/bienvenue"); }}>Refaire l’accueil</button></p>
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

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DAYS, ITEMS } from "@/content/programme";
import { MONTHS } from "@/content/reglages";
import { REGULARITE } from "@/content/textes";
import { addDays, fmtShort, fromKey, keyOf, monday, nf, today } from "@/lib/dates";
import { itemTitle, periodRange, periodStats, type Kind } from "@/lib/bilan";
import { IconLeft, IconRight } from "../Icons";
import { Star } from "../Star";
import { useStore } from "../Store";
import { heatLevel } from "./Suivi";

const s = (n: number, sing: string, plur: string) => (n > 1 ? plur : sing);

export function Bilan() {
  const { S, ui, setUi } = useStore();
  const router = useRouter();
  const { kind, ref } = ui.bilan;
  const [a, b] = periodRange(kind, ref), t = today();
  const isWeek = kind === "semaine";
  const st = periodStats(S, a, b);
  const prevRef = isWeek ? addDays(ref, -7) : new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
  const [pa, pb] = periodRange(kind, prevRef), prev = periodStats(S, pa, pb);
  const isCurrent = a <= t && t <= b;
  const month = MONTHS[a.getMonth()];
  const title = isWeek ? (isCurrent ? "Cette semaine" : `Semaine du ${fmtShort(a)}`) : `${month[0].toUpperCase() + month.slice(1)} ${a.getFullYear()}`;
  const setKind = (k: Kind) => setUi(() => ({ bilan: { kind: k, ref: k === "semaine" ? monday(today()) : new Date(t.getFullYear(), t.getMonth(), 1) } }));
  const move = (dir: 1 | -1) => setUi((u) => ({ bilan: { kind, ref: isWeek ? addDays(u.bilan.ref, 7 * dir) : new Date(u.bilan.ref.getFullYear(), u.bilan.ref.getMonth() + dir, 1) } }));
  const goto = (d: Date) => { setUi(() => ({ sel: d })); router.push("/"); };

  const head = (
    <>
      <div className="page"><h1>Mon bilan</h1></div>
      <nav className="seg" aria-label="Période">
        <a href="#" onClick={(e) => { e.preventDefault(); setKind("semaine"); }} aria-current={isWeek ? "page" : undefined}>Semaine</a>
        <a href="#" onClick={(e) => { e.preventDefault(); setKind("mois"); }} aria-current={!isWeek ? "page" : undefined}>Mois</a>
      </nav>
      <div className="bnav">
        <button className="iconbtn" aria-label="Période précédente" onClick={() => move(-1)}><IconLeft /></button>
        <div><h3>{title}</h3><p className="secintro" style={{ margin: 0, textAlign: "center" }}>Du {fmtShort(a)} au {fmtShort(b)}</p></div>
        <button className="iconbtn" aria-label="Période suivante" disabled={isCurrent || b > t} onClick={() => move(1)}><IconRight /></button>
      </div>
    </>
  );
  if (!st.n) return <>{head}<p className="empty">Aucune journée enregistrée sur cette période.</p></>;

  let delta = "";
  if (prev.n) {
    const dp = Math.round((st.avg - prev.avg) * 100);
    const what = `${isWeek ? "la semaine" : "le mois"} précédent${isWeek ? "e" : ""}`;
    delta = dp > 0 ? `${dp} points de plus que ${what}.` : dp < 0 ? `${-dp} points de moins que ${what}. Ce n’est pas grave : l’important est de continuer.` : `Aussi régulier que ${what}.`;
  }
  const items = Object.entries(st.items).filter(([, v]) => v.n >= 2).map(([id, v]) => ({ id, p: v.s / v.n, n: v.n }));
  const best = items.filter((x) => x.p >= 0.8).sort((x, y) => y.p - x.p).slice(0, 3);
  const weak = items.filter((x) => x.p < 0.6).sort((x, y) => x.p - y.p).slice(0, 3);
  const lead = (a.getDay() + 6) % 7;

  return (
    <>
      {head}
      <div className="pulse">
        <b>{st.held} / {st.n}</b>
        <p>{s(st.held, "jour", "jours")} {s(st.held, "tenu", "tenus")}{isCurrent ? " jusqu’ici" : ""}, avec une moyenne de {Math.round(st.avg * 100)} %.</p>
        {delta && <p className="delta">{delta}</p>}
      </div>
      {isWeek ? (
        <div className="wkstars">
          {st.days.map((x, i) => <div key={i}><Star pct={x.p || 0} /><span>{DAYS[x.d.getDay()].name.slice(0, 3)}</span></div>)}
        </div>
      ) : (
        <div className="heat" style={{ marginBottom: 18 }}>
          {["L", "M", "M", "J", "V", "S", "D"].map((x, i) => <span key={"h" + i} className="hd">{x}</span>)}
          {Array.from({ length: lead }, (_, i) => <span key={"l" + i} />)}
          {st.days.map((x, i) => x.p == null
            ? <span key={i} className="cell out" aria-hidden="true">{x.d.getDate()}</span>
            : <button key={i} className={`cell l${heatLevel(x.p)}`} onClick={() => goto(x.d)} aria-label={`${fmtShort(x.d)} : ${Math.round(x.p * 100)} %`}>{x.d.getDate()}</button>)}
        </div>
      )}
      <div className="stats">
        <div className="stat"><b>{nf(st.ist)}</b><span>istighfâr</span></div>
        {st.sal ? <div className="stat"><b>{nf(st.sal)}</b><span>salawat</span></div> : null}
      </div>
      {best.length > 0 && (
        <section className="sec"><div className="sechead"><h2>Ce qui a bien marché</h2></div>
          <ul className="blist">{best.map((x) => <li key={x.id}>{itemTitle(x.id)}<small>{Math.round(x.p * 100)} % des jours</small></li>)}</ul></section>
      )}
      {weak.length > 0 && (
        <section className="sec"><div className="sechead"><h2>À renforcer</h2></div>
          <ul className="blist">{weak.map((x) => <li key={x.id}>{itemTitle(x.id)}<small>{Math.round(x.p * 100)} % des jours</small></li>)}</ul>
          <p className="secintro" style={{ marginTop: 10 }}>
            {st.light ? `Tu as utilisé le minimum du jour ${st.light} fois : c’est fait pour ça. ` : ""}Si une invocation te pèse, commence par l’apprendre dans l’onglet Apprendre : on fait plus facilement ce qu’on connaît par cœur.
          </p></section>
      )}
      {S.objective && (st.objN > 0 || st.parc > 0 || st.pact > 0) && (
        <section className="sec"><div className="sechead"><h2>Pour ton objectif</h2><span className="count">{S.objective.title}</span></div>
          <div className="stats">
            {st.objN > 0 && <div className="stat"><b>{st.obj} / {st.objN}</b><span>{s(st.obj, "action faite", "actions faites")}</span></div>}
            {st.parc > 0 && <div className="stat"><b>{st.parc}</b><span>{s(st.parc, "invocation du parcours", "invocations du parcours")}</span></div>}
            {st.pact > 0 && <div className="stat"><b>{st.pact}</b><span>{s(st.pact, "geste concret", "gestes concrets")}</span></div>}
          </div>
          {st.objActs.length > 0 && <ul className="blist">{st.objActs.slice(-10).reverse().map((x) => <li key={keyOf(x.d)}>{x.text}<small>{DAYS[x.d.getDay()].name} {fmtShort(x.d)}</small></li>)}</ul>}
          <p className="secintro" style={{ marginTop: 10 }}>Une avancée, une porte qui s’ouvre ? <Link href="/chemin">Note-la dans ton chemin.</Link></p>
        </section>
      )}
      {(st.answered.length > 0 || st.added > 0) && (
        <section className="sec"><div className="sechead"><h2>Mon carnet</h2></div>
          {st.answered.length > 0 && <ul className="blist">{st.answered.map((x) => <li key={x.id}>{x.text}<small>Exaucée le {fmtShort(fromKey(x.answered!))}</small></li>)}</ul>}
          {st.added > 0 && <p className="secintro" style={{ marginTop: 10 }}>{st.added} {s(st.added, "nouvelle", "nouvelles")} {s(st.added, "invocation", "invocations")} {s(st.added, "notée", "notées")} dans ton carnet.</p>}
        </section>
      )}
      {st.mastered.length > 0 && (
        <section className="sec"><div className="sechead"><h2>Appris par cœur</h2></div>
          <ul className="blist">{st.mastered.map((id) => <li key={id}>{ITEMS[id].title}</li>)}</ul></section>
      )}
      {st.notes.length > 0 && (
        <section className="sec"><div className="sechead"><h2>Mes notes</h2></div>
          <ul className="blist">{st.notes.slice(-10).reverse().map((x) => <li key={keyOf(x.d)}>{x.text.length > 220 ? x.text.slice(0, 220) + "…" : x.text}<small>{DAYS[x.d.getDay()].name} {fmtShort(x.d)}</small></li>)}</ul></section>
      )}
      <div className="acc"><p>« {REGULARITE.texte} »</p><p className="src"><b>Source :</b> {REGULARITE.source}</p></div>
    </>
  );
}

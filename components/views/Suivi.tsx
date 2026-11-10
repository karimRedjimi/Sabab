"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DAYS, ITEMS } from "@/content/programme";
import { HELD, MONTHS } from "@/content/reglages";
import { addDays, fmtShort, keyOf, monday, sameDay, today } from "@/lib/dates";
import { countable, dayPct, itemPct, streaks } from "@/lib/program";
import { IconLeft, IconRight } from "../Icons";
import { Star } from "../Star";
import { useStore } from "../Store";

export const heatLevel = (p: number) => (p >= 1 ? 4 : p >= 0.8 ? 3 : p >= 0.5 ? 2 : p > 0 ? 1 : 0);

export function Suivi() {
  const { S, ui, setUi } = useStore();
  const router = useRouter();
  const t = today(), { cur, best } = streaks(S);
  // Comme le prototype : en arrivant sur le suivi, on affiche la semaine du jour sélectionné.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setUi((u) => ({ weekRef: monday(u.sel) })); }, []);
  const goto = (d: Date) => { setUi(() => ({ sel: d })); router.push("/"); };
  const m0 = new Date(t.getFullYear(), t.getMonth(), 1);
  let heldMonth = 0;
  for (let x = new Date(m0); x <= t; x = addDays(x, 1)) if (dayPct(S, x) >= HELD) heldMonth++;
  const start = ui.weekRef, end = addDays(start, 6), isCurrent = sameDay(start, monday(t));

  const startHeat = addDays(monday(t), -28);
  const cells = Array.from({ length: 35 }, (_, i) => {
    const d = addDays(startHeat, i), dk = keyOf(d);
    if (d > t || !S.start || dk < S.start) return <span key={i} className="cell out" aria-hidden="true" />;
    const p = dayPct(S, d);
    return (
      <button key={i} className={`cell l${heatLevel(p)} ${sameDay(d, t) ? "now" : ""}`} onClick={() => goto(d)}
        aria-label={`${DAYS[d.getDay()].name} ${fmtShort(d)} : ${Math.round(p * 100)} %`}>{d.getDate()}</button>
    );
  });

  const acc: Record<string, { s: number; n: number }> = {};
  if (S.start) for (let i = 0; i < 14; i++) {
    const d = addDays(t, -i), dk = keyOf(d);
    if (dk < S.start) break;
    if (i === 0 && dayPct(S, d) < 1) continue;
    for (const id of countable(S, d)) { acc[id] = acc[id] || { s: 0, n: 0 }; acc[id].s += itemPct(S, dk, id); acc[id].n++; }
  }
  const title = (id: string) => (id === "obj" ? "Action de mon objectif" : id === "pact" ? "Geste du parcours" : ITEMS[id].title);
  const neg = Object.entries(acc).map(([id, a]) => ({ id, p: a.s / a.n, n: a.n })).sort((a, b) => a.p - b.p).slice(0, 5);
  const answered = S.carnet.filter((x) => x.status === "ok").length;
  const openBilan = (kind: "semaine" | "mois") => {
    setUi(() => ({ bilan: { kind, ref: kind === "semaine" ? monday(today()) : new Date(t.getFullYear(), t.getMonth(), 1) } }));
    router.push("/bilan");
  };

  return (
    <>
      <div className="page"><h1>Ton suivi</h1></div>
      <div className="stats">
        <div className="stat"><b>{cur}</b><span>jour{cur > 1 ? "s" : ""} tenu{cur > 1 ? "s" : ""} d’affilée</span></div>
        <div className="stat"><b>{best}</b><span>meilleure série</span></div>
        <div className="stat"><b>{heldMonth}</b><span>jours tenus en {MONTHS[t.getMonth()]}</span></div>
      </div>
      <div className="row" style={{ margin: "0 0 18px" }}>
        <button className="navbtn primary" onClick={() => openBilan("semaine")}>Bilan de la semaine</button>
        <button className="navbtn strong" onClick={() => openBilan("mois")}>Bilan du mois</button>
      </div>
      <p className="secintro" style={{ margin: "0 0 22px" }}>
        Un jour est « tenu » quand tu atteins 80 % de son programme. Les jeûnes facultatifs ne comptent pas.{" "}
        {answered ? `Ton carnet compte ${answered} invocation${answered > 1 ? "s" : ""} exaucée${answered > 1 ? "s" : ""}.` : ""}
      </p>
      <section className="sec">
        <div className="sechead"><h2>Mon binôme</h2></div>
        <p className="empty">Le binôme est disponible quand tu es connecté à ton compte.</p>
      </section>
      <section className="sec">
        <div className="weeknav">
          <button className="iconbtn" aria-label="Semaine précédente" onClick={() => setUi((u) => ({ weekRef: addDays(u.weekRef, -7) }))}><IconLeft /></button>
          <div style={{ textAlign: "center" }}>
            <h3>{isCurrent ? "Cette semaine" : "Semaine du " + fmtShort(start)}</h3>
            <p>Du {fmtShort(start)} au {fmtShort(end)}</p>
          </div>
          <button className="iconbtn" aria-label="Semaine suivante" disabled={isCurrent} onClick={() => setUi((u) => ({ weekRef: addDays(u.weekRef, 7) }))}><IconRight /></button>
        </div>
        {Array.from({ length: 7 }, (_, i) => {
          const d = addDays(start, i), future = d > t, p = future ? 0 : dayPct(S, d), day = DAYS[d.getDay()];
          return (
            <button key={i} className={`dayrow ${sameDay(d, t) ? "is-today" : ""}`} disabled={future} onClick={() => goto(d)}>
              <Star pct={p} />
              <span><span className="dn">{day.name} {d.getDate()}</span><br /><span className="dt">{day.theme}</span></span>
              <span className="dp">{future ? "" : Math.round(p * 100) + " %"}</span>
            </button>
          );
        })}
      </section>
      <section className="sec">
        <div className="sechead"><h2>Les cinq dernières semaines</h2></div>
        <div className="heat">{["L", "M", "M", "J", "V", "S", "D"].map((h, i) => <span key={"h" + i} className="hd">{h}</span>)}{cells}</div>
        <div className="legend">Moins <span className="cell l0" /><span className="cell l1" /><span className="cell l2" /><span className="cell l3" /><span className="cell l4" /> Plus</div>
      </section>
      <section className="sec">
        <div className="sechead"><h2>À renforcer</h2><span className="count">14 derniers jours</span></div>
        <p className="secintro">Ce que tu fais le moins souvent, du plus négligé au moins négligé.</p>
        {neg.length ? (
          <ul className="neg">
            {neg.map((x) => (
              <li key={x.id}><span>{title(x.id)}</span><span className="np">{Math.round(x.p * 100)} % sur {x.n} jour{x.n > 1 ? "s" : ""}</span><span className="nb"><i style={{ width: `${Math.max(x.p * 100, 2)}%` }} /></span></li>
            ))}
          </ul>
        ) : <p className="empty">Les données apparaîtront dès que tu auras terminé une première journée.</p>}
      </section>
    </>
  );
}

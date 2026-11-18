"use client";
// Le Suivi : la période en un coup d’œil, puis prières, moments, régularité, Coran, besoin, niveau, ciel, à renforcer.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { ITEMS } from "@/content/programme";
import { coranStats, suggestNextLevel } from "@/lib/coran";
import { addDays, fmtShort, keyOf, monday, today } from "@/lib/dates";
import { niveauTitre, planDuJour } from "@/lib/journee";
import { countable, itemPct, momentOuvert, type Entry } from "@/lib/program";
import { besoin, constat, coranSemaine, faites, grilleMoments, longueur, MOMENT_NOM, parPriere, progresNiveau, regularite, resume, type Periode } from "@/lib/suivi";
import { objectiveName } from "@/lib/objective";
import { salatStats } from "@/lib/salat";
import { CielSection } from "../Journal";
import { PageBand, Glyph } from "../Glyphs";
import { SalatSuivi } from "../Salat";
import { useStore } from "../Store";

export const heatLevel = (p: number) => (p >= 1 ? 4 : p >= 0.8 ? 3 : p >= 0.5 ? 2 : p > 0 ? 1 : 0);
const JL = ["D", "L", "M", "M", "J", "V", "S"];
const pct = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)} %`);

/** Les trois anneaux qui se remplissent. */
function Anneaux({ v }: { v: (number | null)[] }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 80); return () => clearTimeout(t); }, []);
  const R = [58, 44, 30], C = ["#E9C46A", "#F3A9CF", "#9FD3F2"];
  return (
    <svg className="srings" viewBox="0 0 132 132" aria-hidden="true">
      <g transform="rotate(-90 66 66)" fill="none" strokeLinecap="round" strokeWidth={11}>
        {R.map((r, i) => {
          const L = 2 * Math.PI * r, p = Math.max(0, Math.min(1, v[i] ?? 0));
          return <g key={r}><circle cx={66} cy={66} r={r} stroke="rgba(255,255,255,.12)" />
            <circle cx={66} cy={66} r={r} stroke={C[i]} strokeDasharray={L} strokeDashoffset={on ? L * (1 - p) : L} style={{ transition: `stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1) ${i * 120}ms` }} opacity={v[i] == null ? 0 : 1} /></g>;
        })}
      </g>
    </svg>
  );
}
const Tendance = ({ d, unite = "" }: { d: number | null; unite?: string }) =>
  d == null || d === 0 ? null : <em className={d > 0 ? "up" : "dn"}>{d > 0 ? "▲" : "▼"} {Math.abs(d)}{unite}</em>;

export function Suivi() {
  const { S, setUi, update, toast } = useStore();
  const router = useRouter();
  const [per, setPer] = useState<Periode>("semaine");
  const [detail, setDetail] = useState(false);
  const [now] = useState(() => new Date());
  useEffect(() => { setUi((u) => ({ weekRef: monday(u.sel) })); }, [setUi]);
  useEffect(() => { if (window.location.hash === "#ciel") setTimeout(() => document.getElementById("ciel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120); }, []);
  const t = today(), n = longueur(per), a = addDays(t, -(n - 1));
  if (!S.start) return <><PageBand title="Ton suivi" /><p className="empty">Tes chiffres apparaîtront dès ta première journée.</p></>;

  const R = resume(S, t, n, now), P = resume(S, addDays(t, -n), n, now);
  const diff = (x: number | null, y: number | null) => (x == null || y == null ? null : Math.round((x - y) * 100));
  const cst = constat(S, t, n, now);
  const pp = S.prayer ? parPriere(S, a, t, now) : [];
  const ppPrev = S.prayer ? parPriere(S, addDays(a, -n), addDays(a, -1), now) : [];
  const tot = pp.reduce((s, p) => s + p.possible, 0), fait = pp.reduce((s, p) => s + faites(p), 0);
  const heure = pp.reduce((s, p) => s + p.heure, 0), mosq = pp.reduce((s, p) => s + p.mosquee, 0), qada = pp.reduce((s, p) => s + p.qada, 0);
  const mosqPrev = ppPrev.reduce((s, p) => s + p.mosquee, 0);
  const delai = S.prayer ? salatStats(S, a, t, now).avgDelay : null, delaiPrev = S.prayer ? salatStats(S, addDays(a, -n), addDays(a, -1), now).avgDelay : null;
  const taux = (p: (typeof pp)[number]) => (p.possible ? faites(p) / p.possible : 1);
  const fragile = pp.filter((p) => p.possible >= 2).sort((x, y) => taux(x) - taux(y))[0];
  const reg = [...pp].filter((p) => p.possible >= 2).sort((x, y) => taux(y) - taux(x))[0];
  const G = grilleMoments(S, t, now), REG = regularite(S, t), CS = coranSemaine(S, t), maxC = Math.max(1, ...CS.map((c) => c.n));
  const coran30 = coranStats(S, t, 30), nextLevel = suggestNextLevel(S, t);
  const B = besoin(S, t), N = progresNiveau(S, t);
  const versets7 = CS.reduce((s, c) => s + c.n, 0);

  // À renforcer : ce qui est le moins fait sur 14 jours, avec une action.
  const acc: Record<string, { s: number; n: number }> = {};
  for (let i = 0; i < 14; i++) {
    const d = addDays(t, -i), dk = keyOf(d);
    if (dk < S.start) break;
    if (i === 0) continue;
    for (const id of countable(S, d)) { if (id === "obj" || id === "pact") continue; acc[id] = acc[id] || { s: 0, n: 0 }; acc[id].s += itemPct(S, dk, id); acc[id].n++; }
  }
  const neg = Object.entries(acc).filter(([id]) => ITEMS[id]).map(([id, x]) => ({ id, p: x.s / x.n, n: x.n })).filter((x) => x.p < 0.8 && x.n >= 5).sort((x, y) => x.p - y.p).slice(0, 4);
  const today0 = planDuJour(S, t), entree = (id: string): Entry | undefined => (["matin", "jour", "soir", "nuit"] as const).flatMap((m) => today0.sections[m]).find((e) => e.id === id);
  const action = (id: string) => {
    const e = entree(id), it = ITEMS[id];
    if (e?.m === "nuit") return { label: "Rappel", run: () => router.push("/notifications") };
    if (it.kind === "dua" && !S.learn[id]) return { label: "Apprendre", run: () => { update((s) => { s.learn[id] = { lvl: 0, next: keyOf(t) }; }); toast("Ajoutée à tes révisions"); } };
    if (e && momentOuvert(S, t, e.m)) return { label: "Lire", run: () => { setUi(() => ({ sel: t, lecture: { queue: [e], i: 0, label: it.title } })); router.push("/"); } };
    return null;
  };
  const openBilan = (kind: "semaine" | "mois") => {
    setUi(() => ({ bilan: { kind, ref: kind === "semaine" ? monday(t) : new Date(t.getFullYear(), t.getMonth(), 1) } }));
    router.push("/bilan");
  };
  const answered = S.carnet.filter((x) => x.status === "ok").length;
  const goto = (d: Date) => { setUi(() => ({ sel: d })); router.push("/"); };

  return (
    <div className="suivi2">
      <PageBand title="Ton suivi">
        <div className="seg sper" role="tablist" aria-label="Période">
          {(["semaine", "mois"] as const).map((p) => <button key={p} role="tab" aria-selected={per === p} onClick={() => setPer(p)}>{p === "semaine" ? "7 jours" : "30 jours"}</button>)}
        </div>
        <div className="srow3" key={per}>
          <Anneaux v={[R.prieres, R.invocations, R.coran.jours ? R.coran.lus / R.coran.jours : 0]} />
          <div className="srl">
            <div><i style={{ background: "#E9C46A" }} />Prières<b>{pct(R.prieres)}</b><Tendance d={diff(R.prieres, P.prieres)} /></div>
            <div><i style={{ background: "#F3A9CF" }} />Invocations<b>{pct(R.invocations)}</b><Tendance d={diff(R.invocations, P.invocations)} /></div>
            <div><i style={{ background: "#9FD3F2" }} />Coran<b>{R.coran.lus}<small>/{R.coran.jours}</small></b><Tendance d={P.coran.jours ? R.coran.lus - P.coran.lus : null} /></div>
          </div>
        </div>
      </PageBand>

      {cst && (
        <div className="sins" key={per + "i"}>
          <span className="sic" aria-hidden="true">✦</span>
          <p><b>{cst.titre}</b>{cst.detail && <small>{cst.detail}</small>}</p>
          {cst.action && <Link className="sact" href={cst.action.href}>{cst.action.label}</Link>}
        </div>
      )}

      {S.prayer ? (
        <section className="sec">
          <div className="sechead"><h2>Tes prières</h2><span className="count">{fait} sur {tot}</span></div>
          <div className="card spr">
            {pp.map((p, i) => (
              <div key={p.k} className={`sprl ${fragile && p.k === fragile.k && taux(p) < 0.85 ? "weak" : ""}`}>
                <span className="n">{p.nom}</span>
                <span className="bar" role="img" aria-label={`${p.nom} : ${faites(p)} sur ${p.possible}, dont ${p.mosquee} à la mosquée et ${p.qada} rattrapée${p.qada > 1 ? "s" : ""}`}>
                  {p.possible > 0 && <>
                    <i className="a" style={{ width: `${(p.heure / p.possible) * 100}%`, animationDelay: `${i * 70}ms` }} />
                    <i className="m" style={{ width: `${(p.mosquee / p.possible) * 100}%`, animationDelay: `${i * 70}ms` }} />
                    <i className="q" style={{ width: `${(p.qada / p.possible) * 100}%`, animationDelay: `${i * 70}ms` }} />
                  </>}
                </span>
                <span className="v">{faites(p)}<small>/{p.possible}</small></span>
              </div>
            ))}
            <div className="schips"><span><i className="a" />À l’heure {heure}</span><span><i className="m" />Mosquée {mosq}</span><span><i className="q" />Rattrapées {qada}</span></div>
            <button className="link sdet" aria-expanded={detail} onClick={() => setDetail(!detail)}>{detail ? "Masquer le détail" : "Voir chaque jour, et le délai après l’appel"}</button>
          </div>
          {detail && <div className="sdetail"><SalatSuivi only="body" /></div>}
          <div className="skpi">
            <div><b>{delai != null ? `${delai} min` : "—"}</b><small>après l’appel en moyenne</small>
              {delai != null && delaiPrev != null && delai !== delaiPrev && <em className={delai < delaiPrev ? "up" : "dn"}>{Math.abs(delai - delaiPrev)} min plus {delai < delaiPrev ? "tôt" : "tard"}</em>}</div>
            <div><b>{mosq}</b><small>à la mosquée</small><Tendance d={ppPrev.length ? mosq - mosqPrev : null} /></div>
            <div><b>{reg ? reg.nom : "—"}</b><small>ta prière la plus régulière</small></div>
          </div>
        </section>
      ) : <Link className="banner" href="/priere"><div><b>Suis tes prières</b><span>Choisis ta ville pour suivre tes cinq prières.</span></div><span className="act">Choisir</span></Link>}

      <section className="sec">
        <div className="sechead"><h2>Tes invocations</h2><span className="count">7 derniers jours</span></div>
        <div className="card smx">
          <div className="mxg" style={{ "--c": G.jours.length } as CSSProperties}>
            <span />
            {G.jours.map((d) => <span key={keyOf(d)} className={`h ${keyOf(d) === keyOf(t) ? "now" : ""}`}>{JL[d.getDay()]}</span>)}
            <span />
            {G.lignes.map((l, li) => [
              <span key={l.m} className="l">{MOMENT_NOM[l.m]}</span>,
              ...l.cases.map((c, i) => <button key={l.m + i} className={`d ${c}`} style={{ animationDelay: `${(li * 7 + i) * 18}ms` }} disabled={c === "none"} onClick={() => goto(G.jours[i])}
                aria-label={`${MOMENT_NOM[l.m]}, ${fmtShort(G.jours[i])} : ${c === "ok" ? "complet" : c === "half" ? "commencé" : c === "fut" ? "à venir" : "rien"}`} />),
              <span key={l.m + "c"} className="c">{l.ok}<small>/{l.n}</small></span>,
            ])}
          </div>
          <div className="schips"><span><i className="a" />Complet</span><span><i className="h2" />Commencé</span><span><i className="z" />Rien</span></div>
        </div>
      </section>

      <section className="sec">
        <div className="sechead"><h2>Ta régularité</h2><span className="count">30 derniers jours</span></div>
        <div className="card">
          <div className="scal">
            {REG.jours.map((x, i) => x.p == null ? <span key={i} className="out" aria-hidden="true" /> : (
              <button key={i} className={`l${heatLevel(x.p)} ${keyOf(x.d) === keyOf(t) ? "now" : ""}`} style={{ animationDelay: `${i * 14}ms` }} onClick={() => goto(x.d)}
                aria-label={`${fmtShort(x.d)} : ${Math.round(x.p * 100)} %`}>{x.d.getDate()}</button>
            ))}
          </div>
          <div className="sstk">
            <div><b>{REG.tenus}<small> / {REG.comptes}</small></b><small>jours tenus</small></div>
            <div><b>{REG.serie}</b><small>jour{REG.serie > 1 ? "s" : ""} d’affilée</small></div>
            <div><b>{REG.record}</b><small>ton record</small></div>
          </div>
          <p className="snote">Un jour est « tenu » à partir de 80 % de son programme.</p>
        </div>
      </section>

      <section className="sec">
        <div className="sechead"><h2>Coran</h2><span className="count">versets lus</span></div>
        <div className="card">
          <div className="sduo"><div><span className="big">{versets7}</span><small>verset{versets7 > 1 ? "s" : ""} en 7 jours</small></div><div className="r"><span className="big">{Math.round(coran30.seconds / 60)}<small> min</small></span><small>de lecture en 30 jours</small></div></div>
          <div className="scb">{CS.map((c, i) => <div key={i}><i className={c.n ? "" : "z"} style={{ height: c.n ? `${Math.max(10, (c.n / maxC) * 100)}%` : undefined, animationDelay: `${i * 60}ms` }} /><span>{JL[c.d.getDay()]}</span></div>)}</div>
          {nextLevel && (
            <div className="banner" style={{ marginTop: 12 }}>
              <div><b>Sept jours de suite</b><span>Passer à environ {nextLevel} versets par jour ?</span></div>
              <button className="act" onClick={() => update((x) => { x.coranLevel = nextLevel; })}>Augmenter</button>
            </div>
          )}
        </div>
      </section>

      {B && (
        <section className="sec">
          <div className="sechead"><h2>Ton besoin</h2><span className="count">{objectiveName(S)}</span></div>
          <Link className="card sbes" href="/chemin">
            <div className="sduo"><div><span className="big">{B.jour}<small>/40</small></span><small>jours de parcours</small></div><div className="r"><span className="big">{B.gestes}</span><small>geste{B.gestes > 1 ? "s" : ""} fait{B.gestes > 1 ? "s" : ""}</small></div></div>
            <div className="spath" aria-hidden="true">{Array.from({ length: 40 }, (_, i) => <i key={i} className={i + 1 < B.jour ? "on" : i + 1 === B.jour ? "cur" : ""} style={{ animationDelay: `${i * 15}ms` }} />)}</div>
            {B.joursInv > 0 && <small>L’invocation de ton besoin : faite {B.faitsInv} jour{B.faitsInv > 1 ? "s" : ""} sur {B.joursInv}</small>}
          </Link>
        </section>
      )}

      <section className="sec">
        <div className="sechead"><h2>Journée du Prophète ﷺ</h2><span className="count">niveau {N.n} sur {N.max}</span></div>
        <Link className="card snv" href="/rythme">
          <div className="lvls" aria-hidden="true">{Array.from({ length: N.max }, (_, i) => <i key={i} className={i < N.n ? "on" : ""} />)}</div>
          <b>{niveauTitre(N.n)}</b>
          {N.n < N.max ? <><small>{N.tenus} jour{N.tenus > 1 ? "s" : ""} tenu{N.tenus > 1 ? "s" : ""} d’affilée sur {N.but}, avant de te proposer le niveau {N.n + 1}</small>
            <div className="pbar"><i style={{ width: `${(N.tenus / N.but) * 100}%` }} /></div></> : <small>Le plus haut niveau, qu’Allah te l’accorde avec constance.</small>}
        </Link>
      </section>

      <CielSection />

      {neg.length > 0 && (
        <section className="sec">
          <div className="sechead"><h2>À renforcer</h2><span className="count">14 derniers jours</span></div>
          <div className="card sren">
            {neg.map((x) => {
              const act = action(x.id), jours = Math.round(x.p * x.n);
              return (
                <div key={x.id} className="srr">
                  <span className="rt"><b>{ITEMS[x.id].title}</b><small>{jours} jour{jours > 1 ? "s" : ""} sur {x.n}</small></span>
                  <span className="mini"><i style={{ width: `${Math.max(4, x.p * 100)}%` }} /></span>
                  {act && <button onClick={act.run}>{act.label}</button>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="sec">
        <div className="sechead"><h2>Bilans</h2></div>
        <ul className="menu">
          <li><button className="menubtn" onClick={() => openBilan("semaine")}><Glyph name="chart" className="mi" /><span className="mt"><b>Bilan de la semaine</b></span><i className="chev" aria-hidden="true" /></button></li>
          <li><button className="menubtn" onClick={() => openBilan("mois")}><Glyph name="cal" className="mi" /><span className="mt"><b>Bilan du mois</b></span><i className="chev" aria-hidden="true" /></button></li>
          {answered > 0 && <li><Link href="/carnet"><Glyph name="heart" className="mi" /><span className="mt"><b>Carnet</b></span><span className="mv">{answered} exaucée{answered > 1 ? "s" : ""}</span><i className="chev" aria-hidden="true" /></Link></li>}
        </ul>
      </section>
    </div>
  );
}

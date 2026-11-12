"use client";
// Suivi de la prière : la feuille pour noter une prière, et les vues du suivi.
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apresPriere, niveau, rawatib } from "@/lib/journee";
import { entryPct, slotsOf } from "@/lib/program";
import { ensureDay } from "@/lib/state";
import { addDays, keyOf, monday, sameDay, today, fmtShort } from "@/lib/dates";
import { prayerTimes, hm } from "@/lib/prayer";
import {
  windowEnd, SALAT, SALAT_LABEL, adhanMinutes, dayExempt, delayOf, fmtDelay, fmtMinutes, salatOf, salatStats,
  type SalatKey, type SalatRec,
} from "@/lib/salat";
import { Tile } from "./Glyphs";
import { IconLeft, IconRight } from "./Icons";
import { buzz, useStore } from "./Store";

/** Feuille qui monte du bas : priée (à quelle heure), à la mosquée, rattrapée, ou non concerné(e). */
export function SalatSheet({ d, k, onClose }: { d: Date; k: SalatKey; onClose: () => void }) {
  const { S, update, toast, setUi } = useStore();
  const router = useRouter(), path = usePathname();
  const dk = keyOf(d), rec = salatOf(S, dk, k), adhan = adhanMinutes(S, d, k) ?? 0;
  const nowMin = (() => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); })();
  const isToday = sameDay(d, today());
  const exempt = dayExempt(S, dk);
  const [s, setS] = useState<SalatRec["s"]>(exempt ? "ex" : rec?.s || "on");
  // Heure proposée : maintenant si on est encore dans le temps de la prière ; sinon, à préciser.
  const end = windowEnd(S, d, k) ?? 1440;
  const [t, setT] = useState<number | undefined>(rec?.t ?? (isToday && nowMin >= adhan && nowMin < end ? nowMin : undefined));
  const [m, setM] = useState<boolean>(!!rec?.m);
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, []);
  // Autour de la prière, selon le niveau de la journée du Prophète ﷺ.
  const [more, setMore] = useState(!!rec && rec.s !== "on" || exempt);
  const rw = rawatib(S, k), adhkar = apresPriere(S, k);
  const adhDone = adhkar.every((e) => entryPct(S, dk, e) >= 1);
  const val = (key: string) => !!S.days[dk]?.c?.[key];
  const toggle = (key: string) => { buzz(10); update((x) => { const r = ensureDay(x, dk); r.c = r.c || {}; if (r.c[key]) delete r.c[key]; else r.c[key] = 1; }); };
  const delay = s === "on" && t != null ? delayOf(S, d, k, { s: "on", t }) : null;

  const save = () => {
    update((x) => {
      x.salat = { ...(x.salat || {}) };
      const day = { ...(x.salat[dk] || {}) };
      if (s === "ex") for (const kk of SALAT) day[kk] = { s: "ex" };
      else {
        // Quitter « non concerné(e) » libère les autres prières de la journée.
        if (exempt) for (const kk of SALAT) delete day[kk];
        day[k] = { s, ...(s === "on" && t != null ? { t } : {}), ...(m ? { m: true } : {}) };
      }
      x.salat[dk] = day;
    });
    buzz(12);
    toast(s === "ex" ? "Journée notée comme non concernée" : `${SALAT_LABEL[k]} notée${m ? ", à la mosquée" : ""}`);
    onClose();
  };
  const clear = () => {
    const prev = S.salat?.[dk];
    update((x) => {
      x.salat = { ...(x.salat || {}) };
      const day = { ...(x.salat[dk] || {}) };
      if (exempt) for (const kk of SALAT) delete day[kk]; else delete day[k];
      x.salat[dk] = day;
    });
    toast(exempt ? "Journée remise à zéro" : `${SALAT_LABEL[k]} effacée`, { label: "Annuler", run: () => update((x) => { x.salat = { ...(x.salat || {}), [dk]: prev || {} }; }) });
    onClose();
  };

  const lire = () => {
    save();
    setUi(() => ({ sel: d, lecture: { queue: adhkar, i: 0, label: `Après le ${SALAT_LABEL[k]}` } }));
    if (path !== "/") router.push("/");
  };
  const unit = (x: { id: string; sl: number; key: string } | null) => x && (
    <button className={`sopt mini ${val(x.key) ? "on" : ""}`} role="checkbox" aria-checked={val(x.key)} onClick={() => toggle(x.key)}>
      <span className="t"><b>{slotsOf(x.id)[x.sl].l}</b><small>Sunna de la prière</small></span>
      <span className="ck" aria-pressed={val(x.key)} />
    </button>
  );
  const opt = (v: SalatRec["s"], title: string, sub: React.ReactNode) => (
    <button className={`sopt ${s === v ? "on" : ""}`} role="radio" aria-checked={s === v} onClick={() => setS(v)}>
      <span className="t"><b>{title}</b><small>{sub}</small></span>
      <span className="ck" aria-pressed={s === v} />
    </button>
  );

  return (
    <div className="sheetwrap" role="presentation">
      <button className="sheetbg" aria-label="Fermer" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Noter ${SALAT_LABEL[k]}`} tabIndex={-1} ref={box}>
        <div className="grab" aria-hidden="true" />
        <div className="shead">
          <Tile k={k} size={48} />
          <div><b>{SALAT_LABEL[k]}</b><small>Appel à {fmtMinutes(adhan)}{!isToday ? ` · ${fmtShort(d)}` : ""}</small></div>
        </div>
        <div role="radiogroup" aria-label="Comment l’as-tu priée ?">
          {opt("on", "Priée", (
            <>À <input className="stime" type="time" aria-label="Heure de la prière" value={t != null ? fmtMinutes(t) : ""} onClick={(e) => { e.stopPropagation(); setS("on"); }}
              onChange={(e) => { const [h, mi] = e.target.value.split(":").map(Number); setT(isNaN(h) ? undefined : h * 60 + (mi || 0)); }} />
              {delay != null ? <> · {fmtDelay(delay)}</> : t == null ? <> · heure facultative</> : null}</>
          ))}
        </div>
        {s !== "ex" && (
          <button className="sopt" role="switch" aria-checked={m} onClick={() => setM(!m)}>
            <span className="t"><b>À la mosquée</b><small>En groupe</small></span>
            <span className={`sw ${m ? "" : "off"}`} aria-hidden="true" />
          </button>
        )}
        {s !== "ex" && (
          <div role="group" aria-label="Autour de la prière">
            <p className="sgroup">Autour de la prière</p>
            {unit(rw.avant)}
            <button className={`sopt mini ${adhDone ? "on" : ""}`} onClick={lire}>
              <span className="t"><b>{niveau(S) >= 2 ? "Invocations après la prière" : "Ayat al-Kursî"}</b><small>{niveau(S) >= 2 ? "Avec Ayat al-Kursî · 2 minutes" : "Après chaque prière · 1 minute"}</small></span>
              <span className="go2">{adhDone ? "Relire" : "Lire"}</span>
            </button>
            {unit(rw.apres)}
          </div>
        )}
        {more ? (
          <div role="radiogroup" aria-label="Autres cas">
            {opt("qada", "Rattrapée plus tard", "Après la fin de son temps")}
            {opt("ex", "Non concerné(e) aujourd’hui", "Toute la journée · ne compte pas dans le suivi")}
          </div>
        ) : <button className="others" onClick={() => setMore(true)}>Rattrapée plus tard, non concerné(e)…</button>}
        <button className="bigbtn" onClick={save}>Enregistrer</button>
        {(rec || exempt) && <button className="later" onClick={clear}>{exempt ? "Ce n’est plus le cas" : "Effacer"}</button>}
      </div>
    </div>
  );
}

/** Pastille d’une prière dans la grille de la semaine. */
function dotClass(r?: SalatRec) {
  if (!r) return "";
  if (r.s === "ex") return "ex";
  if (r.s === "qada") return "q";
  return r.m ? "m" : "a";
}

/** Vue « Prières » du Suivi : chiffres, grille de la semaine, délai sur 4 semaines. */
export function SalatSuivi({ only }: { only?: "stats" | "body" } = {}) {
  const { S, ui, setUi } = useStore();
  const [sheet, setSheet] = useState<{ d: Date; k: SalatKey } | null>(null);
  const t = today(), start = ui.weekRef, end = addDays(start, 6), isCurrent = sameDay(start, monday(t));
  if (!S.prayer) return only === "stats" ? null : <p className="empty">Choisis ta ville dans Plus › Horaires de prière pour suivre tes prières.</p>;
  const st = salatStats(S, start, end), prev = salatStats(S, addDays(start, -7), addDays(start, -1));
  const rate = st.possible ? st.noted / st.possible : 0, prevRate = prev.possible ? prev.noted / prev.possible : 0;
  const diff = Math.round((rate - prevRate) * 100);
  const weeks = [3, 2, 1, 0].map((i) => { const a = addDays(monday(t), -7 * i); return { a, st: salatStats(S, a, addDays(a, 6)) }; });
  const delays = weeks.map((w) => w.st.avgDelay);
  const known = delays.filter((x): x is number => x != null), max = Math.max(30, ...known);
  const stats = (
    <div className="stats">
      <div className="stat"><b>{st.noted}<small>/{st.possible}</small></b><span>prières notées</span></div>
      <div className="stat"><b>{st.mosque}</b><span>à la mosquée</span></div>
      <div className="stat"><b>{st.avgDelay != null ? `${st.avgDelay} min` : "—"}</b><span>après l’appel en moyenne</span></div>
    </div>
  );
  if (only === "stats") return stats;
  return (
    <>
      {only !== "body" && stats}
      <section className="sec">
        <div className="weeknav">
          <button className="iconbtn" aria-label="Semaine précédente" onClick={() => setUi((u) => ({ weekRef: addDays(u.weekRef, -7) }))}><IconLeft /></button>
          <div style={{ textAlign: "center" }}>
            <h3>{isCurrent ? "Cette semaine" : "Semaine du " + fmtShort(start)}</h3>
            <p>{prev.noted && st.possible ? (diff > 0 ? <span className="up">▲ {Math.round(rate * 100)} % notées, {diff} points de mieux</span> : diff < 0 ? `${Math.round(rate * 100)} % notées, ${-diff} points de moins` : `${Math.round(rate * 100)} % notées, comme la précédente`) : `Du ${fmtShort(start)} au ${fmtShort(end)}`}</p>
          </div>
          <button className="iconbtn" aria-label="Semaine suivante" disabled={isCurrent} onClick={() => setUi((u) => ({ weekRef: addDays(u.weekRef, 7) }))}><IconRight /></button>
        </div>
        <div className="sgrid" role="table" aria-label="Prières de la semaine">
          <span role="columnheader" />
          {Array.from({ length: 7 }, (_, i) => { const d = addDays(start, i); return <span role="columnheader" key={i} className={`h ${sameDay(d, t) ? "now" : ""}`}>{["L", "M", "M", "J", "V", "S", "D"][i]}</span>; })}
          {SALAT.map((k) => (
            <div className="srow" role="row" key={k}>
              <span role="rowheader" className="p">{SALAT_LABEL[k]}</span>
              {Array.from({ length: 7 }, (_, i) => {
                const d = addDays(start, i), dk = keyOf(d), r = salatOf(S, dk, k), future = d > t;
                const am = adhanMinutes(S, d, k), notYet = sameDay(d, t) && am != null && am > new Date().getHours() * 60 + new Date().getMinutes();
                return (
                  <button key={i} role="cell" className={`sdot ${dotClass(r)} ${future || notYet ? "fut" : ""}`} disabled={future || notYet}
                    aria-label={`${SALAT_LABEL[k]}, ${fmtShort(d)} : ${!r ? "non notée" : r.s === "ex" ? "non concerné(e)" : r.s === "qada" ? "rattrapée" : r.m ? "à la mosquée" : "priée"}`}
                    onClick={() => setSheet({ d, k })} />
                );
              })}
            </div>
          ))}
        </div>
        <div className="sleg"><span><i className="a" />Priée</span><span><i className="m" />À la mosquée</span><span><i className="q" />Rattrapée</span><span><i />Non notée</span></div>
      </section>
      <section className="sec">
        <div className="sechead"><h2>Délai après l’appel · 4 semaines</h2></div>
        {known.length ? (
          <div className="card delaycard">
            <div className="dbars">
              {weeks.map((w, i) => (
                <div key={i} className={`dbar ${i === 3 ? "cur" : ""}`}>
                  <small>{delays[i] != null ? `${delays[i]} min` : "—"}</small>
                  <i><em style={{ height: delays[i] != null ? `${Math.max(6, (delays[i]! / max) * 100)}%` : "0%" }} /></i>
                  <span>{i === 3 ? "Cette sem." : `Sem. ${fmtShort(w.a).split(" ")[0]}/${w.a.getMonth() + 1}`}</span>
                </div>
              ))}
            </div>
            <p className="secintro" style={{ margin: "8px 2px 0" }}>Plus la barre est basse, plus tu pries tôt après l’appel.</p>
          </div>
        ) : <p className="empty">Note tes prières avec leur heure : l’évolution apparaîtra ici.</p>}
      </section>
      {sheet && <SalatSheet d={sheet.d} k={sheet.k} onClose={() => setSheet(null)} />}
    </>
  );
}

/** Section « Prières » du bilan de la semaine ou du mois. */
export function SalatBilan({ a, b, prevA, prevB }: { a: Date; b: Date; prevA: Date; prevB: Date }) {
  const { S } = useStore();
  if (!S.prayer) return null;
  const st = salatStats(S, a, b), prev = salatStats(S, prevA, prevB);
  if (!st.noted) return null;
  const pct = st.possible ? Math.round((st.noted / st.possible) * 100) : 0;
  const dd = st.avgDelay != null && prev.avgDelay != null ? prev.avgDelay - st.avgDelay : null;
  return (
    <section className="sec">
      <div className="sechead"><h2>Prières</h2></div>
      <div className="stats">
        <div className="stat"><b>{st.noted}<small>/{st.possible}</small></b><span>notées ({pct} %)</span></div>
        <div className="stat"><b>{st.mosque}</b><span>à la mosquée</span></div>
        <div className="stat"><b>{st.avgDelay != null ? `${st.avgDelay} min` : "—"}</b><span>après l’appel</span></div>
      </div>
      {dd != null && dd !== 0 && <p className="secintro" style={{ margin: "-6px 6px 0" }}>{dd > 0 ? `${dd} min plus tôt après l’appel que la période précédente.` : `${-dd} min plus tard après l’appel que la période précédente.`}</p>}
    </section>
  );
}

/** Pour l’accueil : la prière à noter d’un geste. */
export function usePrayerSheet() {
  const [sheet, setSheet] = useState<{ d: Date; k: SalatKey } | null>(null);
  const node = sheet ? <SalatSheet d={sheet.d} k={sheet.k} onClose={() => setSheet(null)} /> : null;
  return { open: (d: Date, k: SalatKey) => setSheet({ d, k }), node };
}

export { hm, prayerTimes };

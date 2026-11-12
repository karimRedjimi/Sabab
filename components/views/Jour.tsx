"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DAYS, PARCOURS_DAYS } from "@/content/programme";
import { HELD, MONTHS } from "@/content/reglages";
import { REGULARITE } from "@/content/textes";
import { addDays, fmtShort, keyOf, monday, sameDay, today } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { prayerTimes, hm } from "@/lib/prayer";
import {
  countable, currentMoment, parcoursDay, dayPct, entryPct, getItem, itemPct, momentOf, nextStep, plan, secCount, slotsOf, val,
  MOMENT_LABEL, type Entry, type Moment, type Plan, type Structure, CORAN_AM, CORAN_PM, momentOuvert, momentPasEncore, momentStart } from "@/lib/program";
import { useCount, useCoranMark } from "../Cards";
import { IconLeft, IconRight } from "../Icons";
import { useStore } from "../Store";
import { Lecture } from "./Lecture";
import { rappelsDuMoment, versesIn } from "@/lib/coran";
import { choisirNiveau, niveau, niveauSuivant, niveauTitre, planDuJour, plusTard } from "@/lib/journee";
import { FavorableMoments, Journal, Patience, SameNeed } from "../Moments";
import { usePrayerSheet } from "../Salat";
import { SALAT, dayExempt, fajrForgotten, salatOf, type SalatKey } from "@/lib/salat";
import { Star, starPoints } from "../Star";
import { Brand, Glyph, Tile } from "../Glyphs";
import { mergedGesture, needsPatience, objectiveName, objectiveTag, parcoursFinished, parcoursServesObjective, showObjective } from "@/lib/objective";
import { fromKey } from "@/lib/dates";


function Ring({ done, total }: { done: number; total: number }) {
  const p = total ? done / total : 0;
  return (
    <div className="ring" role="img" aria-label={`${done} sur ${total} faits aujourd’hui`}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--soft)" strokeWidth="3.2" />
        {p > 0 && <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent)" strokeWidth="3.2" strokeLinecap="round" strokeDasharray={`${(p * 97.4).toFixed(1)} 97.4`} />}
      </svg>
      <b>{done}<small>sur {total}</small></b>
    </div>
  );
}

/** Barre compacte qui apparaît en haut quand le titre sort de l’écran : progression et suite en un geste. */
function MiniBar({ watch, title, done, total, onGo }: { watch: React.RefObject<HTMLDivElement | null>; title: string; done: number; total: number; onGo?: (() => void) | null }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = watch.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { rootMargin: "-10px 0px 0px 0px" });
    io.observe(el); return () => io.disconnect();
  }, [watch]);
  return (
    <div className={`minibar ${show ? "on" : ""}`} aria-hidden={!show}>
      <div>
        <span className="mt"><b>{title}</b><span>{done} sur {total}</span></span>
        {onGo && <button tabIndex={show ? 0 : -1} onClick={onGo}>Continuer <IconRight /></button>}
      </div>
      <i style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  );
}

/** Changer de jour en glissant le doigt, sans gêner le défilement vertical. */
function useDaySwipe() {
  const { ui, setUi } = useStore();
  const t0 = useRef<{ x: number; y: number; t: number } | null>(null);
  const move = (n: 1 | -1) => {
    if (n === 1 && sameDay(ui.sel, today())) return;
    setUi((u) => ({ sel: addDays(u.sel, n), dir: n }));
  };
  return {
    move,
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        const el = e.target as HTMLElement, p = e.touches[0];
        if (el.closest("input,textarea,select") || p.clientX < 28 || p.clientX > window.innerWidth - 28) { t0.current = null; return; }
        t0.current = { x: p.clientX, y: p.clientY, t: Date.now() };
      },
      onTouchEnd: (e: React.TouchEvent) => {
        const s0 = t0.current; t0.current = null; if (!s0) return;
        const p = e.changedTouches[0], dx = p.clientX - s0.x, dy = p.clientY - s0.y;
        if (Math.abs(dx) > 72 && Math.abs(dx) > 2.2 * Math.abs(dy) && Date.now() - s0.t < 600) move(dx < 0 ? 1 : -1);
      },
    },
  };
}

function hijri(d: Date) {
  try { return new Intl.DateTimeFormat("fr-FR-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d).replace(/\s*AH$/, ""); }
  catch { return ""; }
}

function DateBar({ refEl }: { refEl?: React.RefObject<HTMLDivElement | null> }) {
  const { ui } = useStore();
  const { move } = useDaySwipe();
  const d = ui.sel, isToday = sameDay(d, today()), day = DAYS[d.getDay()], h = hijri(d);
  return (
    <div ref={refEl}>
      <Brand right={
        <span className="datenav2">
          <button aria-label="Jour précédent" onClick={() => move(-1)}><IconLeft /></button>
          <span>{isToday ? "Aujourd’hui" : `${day.name.slice(0, 3)}. ${fmtShort(d)}`}</span>
          <button aria-label="Jour suivant" disabled={isToday} onClick={() => move(1)}><IconRight /></button>
        </span>
      } />
      <p className="dateline"><b>{day.name} {fmtShort(d)}</b>{h && <> · {h}</>}</p>
    </div>
  );
}

/** Le bandeau du haut : le ciel de l’accueil, immobile, avec la date et les prières du jour. */
const SKY: [number, number, number][] = [[30, 30, 40], [330, 20, 26], [300, 150, 52], [60, 180, 22]];
function Bandeau({ refEl, d }: { refEl?: React.RefObject<HTMLDivElement | null>; d: Date }) {
  return (
    <header className="hero2">
      <svg className="hsky" viewBox="0 0 360 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {SKY.map(([x, y, r], i) => <polygon key={i} points={starPoints(x, y, r)} />)}
      </svg>
      <div className="hb"><DateBar refEl={refEl} /><Prayers d={d} /></div>
    </header>
  );
}

/** La course du soleil : les prières sur l’arc, en or une fois notées, et le soleil à l’heure qu’il est. */
function PrayerArc({ pt, states, sunAt }: { pt: Record<SalatKey, number>; states: Record<SalatKey, "done" | "next" | "">; sunAt: number | null }) {
  const cx = 170, cy = 118, R = 104, k = 0.78;
  const a0 = pt.fajr - 1, a1 = pt.isha + 1;
  const pos = (h: number) => { const f = Math.min(1, Math.max(0, (h - a0) / (a1 - a0))), a = Math.PI * (1 - f); return [cx + R * Math.cos(a), cy - R * Math.sin(a) * k, f] as const; };
  const path = `M${cx - R} ${cy} A${R} ${R * k} 0 0 1 ${cx + R} ${cy}`;
  const sun = sunAt == null ? null : pos(sunAt);
  return (
    <svg className="harc" viewBox="0 0 340 128" aria-hidden="true">
      <defs><linearGradient id="hg" x1="0" x2="1"><stop offset="0" stopColor="#9AA6F5" /><stop offset=".5" stopColor="#E9C46A" /><stop offset="1" stopColor="#E07A45" /></linearGradient></defs>
      <line x1="24" x2="316" y1={cy} y2={cy} className="hz" />
      <path d={path} className="ar0" />
      <path d={path} className="ar1" pathLength={1} style={{ strokeDashoffset: sun ? 1 - sun[2] : 0 }} />
      {sun && <><circle cx={sun[0]} cy={sun[1]} r="15" className="halo" /><circle cx={sun[0]} cy={sun[1]} r="8" className="sun" /></>}
      {SALAT.map((key) => {
        const [x, y] = pos(pt[key]), st = states[key];
        return (
          <g key={key} className={`ap ${st}`}>
            <circle cx={x} cy={y} r={st ? 7 : 5} />
            {st === "done" && <path d={`M${x - 3} ${y}l2 2 4-4`} className="tick" />}
          </g>
        );
      })}
    </svg>
  );
}

/** Une ligne fine sous le titre : l’objectif et l’avancée du parcours. */
function ObjectiveLine() {
  const { S, ui } = useStore();
  if (!S.objective || !showObjective(S)) return null;
  const pd = parcoursServesObjective(S) ? parcoursDay(S, ui.sel) : 0;
  return (
    <Link className="objline" href="/objectif">
      <span>{objectiveTag(S)}</span>{pd ? <> · jour {pd} sur {PARCOURS_DAYS}</> : null}
    </Link>
  );
}

function useStartLecture() {
  const { S, ui, setUi, toast } = useStore();
  return (queue: Entry[], label: string, intention = false) => {
    if (!queue.length) return;
    // Le soir et la nuit ne s’ouvrent qu’à leur heure.
    const m = queue[0].m;
    if (!momentOuvert(S, ui.sel, m)) { toast(momentPasEncore(S, ui.sel, m)); return; }
    setUi(() => ({ lecture: { queue, i: 0, label, intention, scrollY: window.scrollY } }));
  };
}

/** Le rappel de l’objectif : court, avec un seul bouton pour avancer dans la journée. */
function NeedCard({ onGo, goLabel, wait, started, allDone }: { onGo: (() => void) | null; goLabel?: string; wait?: { label: string; at: string } | null; started: boolean; allDone: boolean }) {
  const { S, ui, update, toast } = useStore();
  const d = ui.sel, isToday = sameDay(d, today());
  const serves = parcoursServesObjective(S), pd = serves ? parcoursDay(S, d) : 0, finished = parcoursFinished(S, d);
  const pct = finished ? 1 : pd / PARCOURS_DAYS;
  return (
    <div className="need slim obj2">
      <Link className="needhead" href="/chemin" aria-label="Voir mon chemin">
        <span className="ostar" role="img" aria-label={finished ? `${PARCOURS_DAYS} jours accomplis` : pd ? `Jour ${pd} sur ${PARCOURS_DAYS}` : "Parcours non commencé"}>
          <Star pct={Math.max(pct, 0.02)} />{pd > 0 && !finished && <b>{pd}</b>}
        </span>
        <span className="nh">
          <span className="k">Ton objectif</span>
          <span className="nt">{objectiveName(S)}</span>
          {(pd > 0 || finished) && <span className="ns">{finished ? `${PARCOURS_DAYS} jours accomplis` : `Jour ${pd} sur ${PARCOURS_DAYS}`}</span>}
        </span>
        <span className="chev" aria-hidden="true" />
      </Link>
      {finished && (
        <div className="needfin">
          <p>Tes {PARCOURS_DAYS} jours sont accomplis, qu’Allah les accepte.</p>
          <div className="row">
            <button className="go" onClick={() => { update((s) => { if (s.parcours) s.parcours = { ...s.parcours, start: keyOf(today()) }; }); toast("Nouveau parcours de 40 jours, bismillâh"); }}>Recommencer 40 jours</button>
            <Link className="needlink" href="/chemin">Voir mon chemin</Link>
          </div>
        </div>
      )}
      {!serves && !finished && <Link className="needlink" href="/parcours">Commencer le parcours de {PARCOURS_DAYS} jours</Link>}
      {isToday && (onGo
        ? <button className="go" onClick={onGo}>{started ? `Continuer${goLabel ? ` · ${goLabel}` : ""}` : "Commencer ma journée"}</button>
        : wait ? <button className="go wait" disabled>La suite : {wait.label.toLowerCase()}, dès {wait.at}</button>
        : allDone ? <p className="needdone">Journée accomplie, qu’Allah l’accepte.</p> : null)}
    </div>
  );
}

function SocleRow({ m, list, cur }: { m: Moment; list: Entry[]; cur: Moment | null }) {
  const { S, ui, setUi, now } = useStore();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d), c = secCount(S, list, dk);
  const k = dk + "sum" + m, open = !!ui.momentOpen[k];
  const allDone = c.total > 0 && c.done === c.total;
  const todo = list.filter((e) => !e.opt && entryPct(S, dk, e) < 1);
  const pt = prayerTimes(d, S.prayer), h = now.getHours() + now.getMinutes() / 60;
  const kinds = new Set(list.map((e) => getItem(S, e.id, d).kind));
  const noun = (n: number) => kinds.has("action") && !kinds.has("dua") ? (n > 1 ? "gestes" : "geste") : n > 1 ? "invocations" : "invocation";
  const order: Moment[] = ["matin", "jour", "soir", "nuit", "actions"];
  let sub = `${c.total} ${noun(c.total)}`;
  if (!c.total) sub = `${list.length} ${noun(list.length)} facultatif${list.length > 1 ? "s" : ""}`;
  else if (allDone) sub += " · fait";
  else if (cur === m) {
    const first = todo[0], it = first && getItem(S, first.id, d), slot = first && slotsOf(first.id)[first.sl[0]];
    sub = first && slot && slot.t > 1 ? `${it!.title} ${val(S, dk, `${first.id}:${first.sl[0]}`)}/${slot.t} · maintenant` : `${c.done} sur ${c.total} · maintenant`;
  } else if (m === "soir" && pt && sameDay(d, today()) && h < pt.asr) sub += ` · dès ${hm(pt.asr)}`;
  else if (m === "nuit" && pt && sameDay(d, today()) && h < pt.isha) sub += ` · après le ʿIchâ, ${hm(pt.isha)}`;
  else if (cur && m !== "actions" && order.indexOf(m) < order.indexOf(cur)) sub = `${c.done ? `${c.done} sur ${c.total}` : sub} · à rattraper`;
  else if (c.done) sub = `${c.done} sur ${c.total}`;
  const label = m === "actions" ? "Autres gestes" : MOMENT_LABEL[m];
  return (
    <>
      <div className={`rowi sum ${allDone ? "done" : ""}`}>
        <Tile k={m} />
        <button className="rbody" onClick={() => start(todo.length ? todo : list.filter((e) => !e.opt), label)} aria-label={`${label} : ${sub}. Ouvrir la lecture guidée`}>
          <span className="rt"><b>{label}{cur === m && !allDone && <span className="nowdot" aria-hidden="true" />}</b><small>{sub}</small></span>
          {allDone && <span className="okdot" aria-label="fait" />}
        </button>
        <button className={`expand ${open ? "on" : ""}`} aria-expanded={open} aria-label={open ? `Replier ${label}` : `Voir le détail de ${label}`}
          onClick={() => setUi((u) => ({ momentOpen: { ...u.momentOpen, [k]: !open } }))}><span className="chev" /></button>
      </div>
      {open && <div className="subl">{list.map((e) => <Row key={`${e.id}-${e.m}`} e={e} />)}</div>}
    </>
  );
}

/** Un nœud du fil de la journée : une étoile dorée quand c’est fait. */
function TlNode({ done, now }: { done: boolean; now?: boolean }) {
  return <span className={`nd ${done ? "done" : now ? "now" : ""}`} aria-hidden="true">{done && <Star pct={1} />}</span>;
}

/** Le niveau de la journée du Prophète ﷺ, en une ligne discrète. */
function NiveauLigne() {
  const { S } = useStore();
  const n = niveau(S);
  return (
    <Link className="lvline" href="/rythme" aria-label={`Journée du Prophète ﷺ, niveau ${n} sur 5 : ${niveauTitre(n)}. Changer de niveau`}>
      <span className="lvst" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? "on" : ""} />)}</span>
      <span><b>Journée du Prophète ﷺ</b> · niveau {n}</span>
      <span className="chev" aria-hidden="true" />
    </Link>
  );
}

/** Après quatorze jours tenus, proposer le niveau suivant (une seule proposition à la fois). */
function NiveauSuivant() {
  const { S, update, toast } = useStore();
  const t = today(), next = niveauSuivant(S, t);
  if (!next) return null;
  return (
    <div className="banner">
      <div><b>Quatorze jours tenus</b><span>Passer au niveau {next} : {niveauTitre(next).toLowerCase()} ?</span>
        <div className="row" style={{ marginTop: 8, gap: 16 }}>
          <button className="act" onClick={() => { update((x) => choisirNiveau(x, next, t)); toast(`Niveau ${next}, bismillâh`); }}>Passer au niveau {next}</button>
          <button className="act" style={{ color: "var(--muted)" }} onClick={() => update((x) => plusTard(x, t))}>Plus tard</button>
        </div>
      </div>
    </div>
  );
}

/**
 * La file de « Continuer » : on reprend la journée dans l’ordre, là où elle s’est arrêtée.
 * Un moment pas encore ouvert (le soir avant le ʿAsr, la nuit avant le ʿIchâ) bloque la suite : on indique son heure.
 */
function dayQueue(S: Parameters<typeof plan>[0], d: Date, P: Plan, now: Date) {
  const dk = keyOf(d);
  for (const m of ["matin", "jour", "soir", "nuit"] as const) {
    const todo = P.sections[m].filter((e) => !e.opt && e.id !== "obj" && e.id !== "pact" && entryPct(S, dk, e) < 1);
    if (!todo.length) continue;
    if (!momentOuvert(S, d, m, now)) return { wait: { label: MOMENT_LABEL[m], at: hm(momentStart(S, d, m)!) } };
    return { todo, label: MOMENT_LABEL[m], intention: todo[0].origin === "parc" };
  }
  return null;
}

/** La grande carte qui guide : ce qu’il reste à faire maintenant. */
function Hero({ P }: { P: Plan }) {
  const { S, ui, now } = useStore();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d);
  const ns = nextStep(S, d, P, now);
  if (!ns.next) return <div className="hero done"><div className="star"><Star pct={1} /></div><div><h2>Journée complète</h2><p>Qu’Allah l’accepte.</p></div></div>;
  const m = ns.next.m;
  const all: Record<Moment, Entry[]> = { ...P.sections, actions: P.actions };
  const list = all[m].filter((e) => !e.opt);
  const todo = list.filter((e) => entryPct(S, dk, e) < 1);
  const started = todo.length < list.length;
  const kinds = new Set(todo.map((e) => (e.id === "obj" ? "action" : getItem(S, e.id, d).kind)));
  const n = todo.length;
  const noun = kinds.size > 1 ? (n > 1 ? "étapes" : "étape") : kinds.has("action") ? (n > 1 ? "actions" : "action") : n > 1 ? "invocations" : "invocation";
  const cur = currentMoment(S, d, now), pt = prayerTimes(d, S.prayer), h = now.getHours() + now.getMinutes() / 60;
  const label = MOMENT_LABEL[m];
  const order: Moment[] = ["matin", "jour", "soir", "actions"];
  const kicker = m === cur ? `Maintenant · ${label.toLowerCase()}`
    : m === "soir" && pt && h < pt.asr ? `À partir de ${hm(pt.asr)} · le soir`
    : cur && m !== "actions" && order.indexOf(m) < order.indexOf(cur) ? `À rattraper · ${label.toLowerCase()}` : label;
  const names = todo.map((e) => (e.id === "obj" ? "ton action" : getItem(S, e.id, d).title));
  return (
    <div className="hero">
      <div className="k">{kicker}</div>
      <h2>{started ? "Encore " : ""}{n} {noun}</h2>
      <p>{names.slice(0, 3).join(", ")}{names.length > 3 ? "…" : ""}</p>
      <button className="go" onClick={() => start(todo, label)}>
        {started ? "Continuer" : "Commencer"} <IconRight />
      </button>
    </div>
  );
}

function Prayers({ d }: { d: Date }) {
  const { S, now } = useStore();
  const sheet = usePrayerSheet();
  const pt = prayerTimes(d, S.prayer);
  if (!pt || !S.prayer)
    return (
      <Link className="banner" href="/priere">
        <div><b>Tes horaires de prière</b><span>Choisis ta ville pour caler ton programme dessus.</span></div>
        <span className="act">Choisir</span>
      </Link>
    );
  const isToday = sameDay(d, today()), h = now.getHours() + now.getMinutes() / 60, dk = keyOf(d);
  const exempt = dayExempt(S, dk);
  const due = isToday ? SALAT.filter((k) => pt[k] <= h).length : 5;
  const noted = SALAT.filter((k) => { const r = salatOf(S, dk, k); return r && r.s !== "ex"; }).length;
  const list: [string, string, number][] = [["fajr", "Fajr", pt.fajr], ["dhuhr", "Dhuhr", pt.dhuhr], ["asr", "ʿAsr", pt.asr], ["maghrib", "Maghreb", pt.maghrib], ["isha", "ʿIchâ", pt.isha]];
  const nextIdx = isToday ? list.findIndex(([, , t]) => t > h) : -1;
  const lastHour = isToday && d.getDay() === 5 && h >= pt.maghrib - 1 && h < pt.maghrib;
  let head = <b>Horaires à {S.prayer.city}</b>, wait = "";
  if (isToday) {
    const nx = nextIdx >= 0 ? list[nextIdx] : null;
    const tom = prayerTimes(addDays(d, 1), S.prayer);
    const name = nx ? nx[1] : "Fajr", at = nx ? nx[2] : (tom ? tom.fajr + 24 : 0);
    const mins = Math.max(0, Math.round((at - h) * 60));
    head = <b>Prochaine prière : {name}</b>;
    wait = mins < 60 ? `dans ${mins} min` : `dans ${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, "0")}`;
  }
  return (
    <div className="pblock" aria-label={`Horaires de prière, ${S.prayer.city}`}>
      <div className="pnext">{head}{wait && <span>{wait}</span>}</div>
      <PrayerArc pt={pt} sunAt={isToday ? h : null} states={Object.fromEntries(list.map(([k], i) => {
        const r = salatOf(S, dk, k as SalatKey);
        return [k, r && r.s !== "ex" ? "done" : i === nextIdx ? "next" : ""];
      })) as Record<SalatKey, "done" | "next" | "">} />
      <div className="prow5">
        {list.map(([k, n, t], i) => {
          const r = salatOf(S, dk, k as SalatKey), notYet = isToday && t > h;
          const state = !r ? "" : r.s === "ex" ? "non concerné(e)" : r.s === "qada" ? "rattrapée" : r.m ? "priée à la mosquée" : "priée";
          return (
            <button key={k} className={`${i === nextIdx ? "now" : ""} ${notYet ? "fut" : ""} ${r && r.s !== "ex" ? "noted" : ""} ${r?.m ? "mq" : ""}`} disabled={notYet}
              aria-label={`${n} à ${hm(t)}${state ? `, ${state}` : notYet ? "" : ", à noter"}`} onClick={() => sheet.open(d, k as SalatKey)}>
              <b>{hm(t)}</b><span>{n}</span>
            </button>
          );
        })}
      </div>
      {d.getDay() === 5 && <p className="prnote">{lastHour ? "Maintenant : " : ""}Dernière heure du vendredi, de {hm(pt.maghrib - 1)} à {hm(pt.maghrib)}</p>}
      {isToday && fajrForgotten(S, now) ? (
        <button className="phint ask" onClick={() => sheet.open(d, "fajr")}>Tu as prié le Fajr ? <b>Le noter</b></button>
      ) : exempt ? (
        <p className="phint">Journée non concernée · <button className="link" onClick={() => sheet.open(d, "fajr")}>modifier</button></p>
      ) : noted && isToday ? null : (
        <p className="phint">{noted ? `${noted} sur ${due} notée${noted > 1 ? "s" : ""} ${isToday ? "aujourd’hui" : "ce jour-là"}` : "Touche une prière pour la noter"}</p>
      )}
      {isToday && <FavorableMoments />}
      {sheet.node}
    </div>
  );
}

function Row({ e, intention = false, tile }: { e: Entry; intention?: boolean; tile?: string }) {
  const { S, ui } = useStore();
  const count = useCount();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d), it = getItem(S, e.id, d);
  const si = e.sl[0], slot = slotsOf(e.id)[si], k = `${e.id}:${si}`, v = val(S, dk, k);
  const done = entryPct(S, dk, e) >= 1;
  const isCoran = e.id === CORAN_AM || e.id === CORAN_PM;
  const markCoran = useCoranMark();
  const isObj = e.id === "obj";
  const gesture = isObj ? mergedGesture(S, d) : null, own = S.days[dk]?.objAct?.trim() || "";
  const title = isObj ? (intention ? own || gesture || "Ton action du jour" : S.objective?.title || "Mon objectif") : e.id === "pact" ? it.desc || it.title : it.title;
  let sub: string;
  if (isCoran) { const n = versesIn(rappelsDuMoment(S, d, e.m === "soir" ? "soir" : "matin")); sub = `${n} verset${n > 1 ? "s" : ""}`; }
  else if (isObj) sub = intention ? (own ? "Ton action du jour" : gesture ? "Proposé par ton parcours · tu peux le remplacer" : "À choisir, une idée t’attend") : own || "Ton action concrète du jour";
  else if (e.id === "pact") sub = `Geste du jour · ${parcoursDay(S, d)} sur ${PARCOURS_DAYS}`;
  else if (slot.t > 1) sub = slot.l === "Matin" || slot.l === "Soir" ? `${slot.t} fois` : slot.l;
  else if (e.id === "fajr" || e.m === "jour" || e.m === "actions" || it.verif !== undefined) sub = momentOf(S, it, d) || (it.kind === "action" ? "Le geste du jour" : "Une fois");
  else sub = "Une fois";
  const forObj = e.origin === "parc" && parcoursServesObjective(S) && showObjective(S);
  const tag = e.origin === "theme" ? <span className="tag">Thème du jour</span> : e.origin === "parc" ? <span className="tag t-parc">{forObj ? objectiveTag(S) : "Parcours"}</span> : null;
  const ck = slot.t === 1 ? <button className="ck" aria-pressed={done} aria-label={`${title} : ${done ? "fait" : "à faire"}`} onClick={() => (isCoran ? markCoran(e, !done) : count("toggle", k))} data-k={k} /> : null;
  return (
    <div className={`rowi ${tile ? "sum tiled" : ""} ${done ? "done" : ""}`} id={`card-${e.id}-${e.m}`}>
      {tile ? <Tile k={tile} /> : ck}
      <button className="rbody" onClick={() => start([e], intention ? "Ton objectif" : MOMENT_LABEL[e.m], intention && e.origin === "parc")} aria-label={`Ouvrir ${title}`}>
        {tile ? (
          <span className="rt">
            <b>{e.origin === "parc" && e.id !== "pact" ? (parcoursServesObjective(S) ? objectiveTag(S) : "Ton parcours") : "Ton geste du jour"}</b>
            <small>{isObj && !own && !gesture ? "À choisir, une idée t’attend" : title}</small>
          </span>
        ) : (
          <span className="rt">
            <b>{title}</b>
            <small>{tag}{e.opt && <span className="tag t-opt">Facultatif</span>}{sub}</small>
          </span>
        )}
        {slot.t > 1 && <span className="cnt"><span className="bar"><i style={{ width: `${Math.min(v / slot.t, 1) * 100}%` }} /></span><b><span className="bump" key={v}>{v}</span>/{slot.t}</b></span>}
        {slot.t === 1 && !tile && <span className="chev" aria-hidden="true" />}
      </button>
      {tile && ck}
      {slot.t > 1 && (
        <button className={`plus ${v >= slot.t ? "full" : ""}`} onClick={() => count("inc", k)} aria-label={`${title} : ${v} sur ${slot.t}. Ajouter un`} data-k={k}>
          {v >= slot.t ? "✓" : "+"}
        </button>
      )}
    </div>
  );
}

function Section({ m, list, cur }: { m: Moment; list: Entry[]; cur: Moment | null }) {
  const { S, ui, setUi } = useStore();
  const d = ui.sel, dk = keyOf(d), c = secCount(S, list, dk);
  const k = dk + m;
  const open = k in ui.momentOpen ? ui.momentOpen[k] : m === "actions" ? true : cur ? m === cur : true;
  const toggle = () => setUi((u) => ({ momentOpen: { ...u.momentOpen, [k]: !open } }));
  const allDone = c.total > 0 && c.done === c.total;
  return (
    <section className={`msec ${open ? "" : "closed"} ${allDone ? "alldone" : ""}`} id={`sec-${m}`}>
      <button className="mhead" aria-expanded={open} onClick={toggle}>
        <h2>{MOMENT_LABEL[m]}{cur === m && <span className="nowtag">maintenant</span>}</h2>
        <span className="count">{allDone ? "fait" : `${c.done} sur ${c.total}`}<span className="chev" aria-hidden="true" /></span>
      </button>
      {open ? (
        <div className="list">{list.map((e) => <Row key={`${e.id}-${e.m}`} e={e} />)}</div>
      ) : (
        <button className="summary" onClick={toggle}>{list.map((e) => (e.id === "obj" ? "Mon objectif" : getItem(S, e.id, d).title)).join(", ")}</button>
      )}
    </section>
  );
}

function Coach({ s, only }: { s: Structure; only: "light" | "missed" | "ramp" }) {
  const { S, ui, update, toast } = useStore();
  const d = ui.sel, t = today(), isToday = sameDay(d, t), y = addDays(t, -1);
  const light = (on: boolean) => {
    update((x) => { const r = ensureDay(x, keyOf(d)); if (on) r.light = true; else delete r.light; });
    toast(on ? "Minimum du jour activé" : "Programme complet rétabli");
  };
  if (only === "light") return !s.light ? null : (
      <div className="banner soft">
        <div><b>Minimum du jour</b><span>Trois invocations courtes suffisent aujourd’hui.</span></div>
        <button className="act" onClick={() => light(false)}>Programme complet</button>
      </div>
    );
  if (s.light) return null;
  if (only === "missed") return !(isToday && S.start && S.start <= keyOf(y) && dayPct(S, y) < HELD && dayPct(S, d) < HELD) ? null : (
      <Missed onLight={() => light(true)} />
    );
  if (only === "ramp" && s.ramp)
    return (
      <div className="rampline">
        <span className="rl"><b>Démarrage en douceur</b> · semaine {s.ramp} sur 2</span>
        <button onClick={() => { update((x) => { x.rampDone = keyOf(today()); }); toast("Programme complet activé"); }}>Tout le programme</button>
      </div>
    );
  return null;
}

function Missed({ onLight }: { onLight: () => void }) {
  const [why, setWhy] = useState(false);
  return (
    <div className="banner warm slim">
      <div>
        <b>Hier n’a pas été tenu.</b> <span className="inl">Ce n’est pas grave, l’important est de reprendre.</span>
        {why && <span className="q">« {REGULARITE.texte} » {REGULARITE.source}</span>}
        <div className="row" style={{ gap: 18 }}>
          <button className="act" onClick={onLight}>Reprendre en douceur</button>
          <button className="act" style={{ color: "var(--muted)" }} onClick={() => setWhy(!why)}>{why ? "Masquer" : "Pourquoi ?"}</button>
        </div>
      </div>
    </div>
  );
}

function BilanBanner() {
  const { S, setUi } = useStore();
  const router = useRouter();
  const t = today();
  if (!S.start || S.start >= keyOf(t)) return null;
  const month = t.getDate() === 1, week = t.getDay() === 1;
  if (!month && !week) return null;
  const open = () => {
    setUi(() => ({ bilan: month ? { kind: "mois", ref: new Date(t.getFullYear(), t.getMonth() - 1, 1) } : { kind: "semaine", ref: addDays(monday(today()), -7) } }));
    router.push("/bilan");
  };
  return (
    <button className="banner" onClick={open}>
      <div><b>{month ? `Ton bilan de ${MONTHS[addDays(t, -1).getMonth()]} est prêt` : "Ton bilan de la semaine est prêt"}</b><span>Une minute pour regarder {month ? "ton mois" : "ta semaine"}.</span></div>
      <span className="act">Voir</span>
    </button>
  );
}

/** Ce qu’il reste à faire en premier : la file de la prochaine lecture guidée. */
function nextQueue(S: Parameters<typeof plan>[0], d: Date, P: Plan, now: Date, skip?: (e: Entry) => boolean) {
  const dk = keyOf(d), ns = nextStep(S, d, P, now);
  if (!ns.next) return null;
  const all: Record<Moment, Entry[]> = { ...P.sections, actions: P.actions };
  const order: Moment[] = [ns.next.m, ...(["matin", "jour", "soir", "actions"] as Moment[]).filter((m) => m !== ns.next!.m)];
  for (const m of order) {
    if (!momentOuvert(S, d, m, now)) continue;
    const todo = all[m].filter((e) => !e.opt && !(skip && skip(e)) && entryPct(S, dk, e) < 1);
    if (todo.length) return { todo, label: MOMENT_LABEL[m] };
  }
  return null;
}

function PastBanner() {
  const { setUi } = useStore();
  return (
    <button className="banner soft" onClick={() => setUi(() => ({ sel: today(), dir: 1 }))}>
      <div><b>Tu consultes une journée passée</b><span>Tu peux encore cocher ce que tu avais fait.</span></div>
      <span className="act">Aujourd’hui</span>
    </button>
  );
}

function Foot({ s }: { s: Structure }) {
  const { ui, update, toast } = useStore();
  const dk = keyOf(ui.sel), day = DAYS[ui.sel.getDay()];
  const theme = day.theme.charAt(0).toLowerCase() + day.theme.slice(1);
  if (s.light) return null;
  return (
    <div className="foot">
      <span>Thème du {day.name.toLowerCase()} : {theme}</span>
      {!s.ramp && <button onClick={() => {
        update((x) => { ensureDay(x, dk).light = true; });
        toast("Minimum du jour activé", { label: "Annuler", run: () => update((x) => { delete ensureDay(x, dk).light; }) });
      }}>Journée chargée ?</button>}
    </div>
  );
}

export function Jour() {
  const { S, ui, now } = useStore();
  const topRef = useRef<HTMLDivElement>(null);
  const start = useStartLecture();
  const swipe = useDaySwipe();
  if (ui.lecture) return <Lecture />;
  const d = ui.sel, dk = keyOf(d), isToday = sameDay(d, today());
  const day = DAYS[d.getDay()];
  const P = planDuJour(S, d), s = P.s, cur = currentMoment(S, d, now);
  // « Agir » réunit le geste et l’action : on ne le compte qu’une fois à l’affichage.
  const ids = countable(S, d).filter((id) => !(id === "pact" && mergedGesture(S, d)));
  const doneCount = ids.filter((id) => itemPct(S, dk, id) >= 1).length;
  const needMode = !!S.objective && showObjective(S) && !s.light;
  const anim = ui.dir > 0 ? "day-next" : ui.dir < 0 ? "day-prev" : "";
  if (needMode) return <div className={`day ${anim}`} key={dk} {...swipe.handlers}><JourBesoin P={P} cur={cur} topRef={topRef} /></div>;
  const title = s.light ? "Minimum du jour" : s.ramp ? "Démarrage en douceur" : day.theme;
  const q = isToday ? nextQueue(S, d, P, now) : null;
  return (
    <div className={`day ${anim}`} key={dk} {...swipe.handlers}>
      <MiniBar watch={topRef} title={title} done={doneCount} total={ids.length} onGo={q ? () => start(q.todo, q.label) : null} />
      <Bandeau d={d} />
      <div className="top" ref={topRef}>
        <div>
          <h1 className="display">{title}</h1>
          <ObjectiveLine />
        </div>
        <Ring done={doneCount} total={ids.length} />
      </div>
      {isToday ? <Hero P={P} /> : <PastBanner />}
      <Coach s={s} only="light" />
      {isToday && (
        <div className="notices">
          <Coach s={s} only="missed" />
          <BilanBanner />
          <Coach s={s} only="ramp" />
          {!s.obj && !s.light && (
            <Link className="banner" href="/objectif">
              <div><b>Fixe un objectif concret</b><span>Chaque jour, une action pour l’atteindre.</span></div>
              <span className="act">Fixer</span>
            </Link>
          )}
        </div>
      )}
      {(["matin", "jour", "soir", "nuit"] as const).map((m) => P.sections[m].length ? <Section key={m} m={m} list={P.sections[m]} cur={cur} /> : null)}
      {P.actions.length > 0 && <Section m="actions" list={P.actions} cur={cur} />}
      <Foot s={s} />
      <Journal />
    </div>
  );
}

/** La page Jour organisée autour du besoin de la personne. */
function JourBesoin({ P, cur, topRef }: { P: Plan; cur: Moment | null; topRef: React.RefObject<HTMLDivElement | null> }) {
  const { S, ui, now } = useStore();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d), isToday = sameDay(d, today()), s = P.s;
  // L’invocation de l’objectif est mise en avant en première ligne ; le reste suit par moment.
  const isNeed = (e: Entry) => e.origin === "parc" && e.id !== "pact";
  const order = ["matin", "jour", "soir", "nuit"] as const;
  const invoke = order.flatMap((m) => P.sections[m].filter(isNeed));
  // Le fil de la journée suit l’ordre du jour : matin, journée, soir, nuit.
  const socle = order.map((m) => [m, P.sections[m].filter((e) => !isNeed(e) && e.id !== "obj" && e.id !== "pact")] as const).filter(([, l]) => l.length);
  const sc = secCount(S, [...invoke, ...socle.flatMap(([, l]) => l)], dk);
  const q = isToday ? dayQueue(S, d, P, now) : null;
  const go = q && "todo" in q ? () => start(q.todo!, q.label!, q.intention) : null;
  const wait = q && "wait" in q ? q.wait : null;
  return (
    <>
      <MiniBar watch={topRef} title={objectiveName(S)} done={sc.done} total={sc.total} onGo={go} />
      <Bandeau refEl={topRef} d={d} />
      {!isToday && <PastBanner />}
      <NeedCard onGo={go} goLabel={q && "todo" in q ? q.label : undefined} wait={wait} started={sc.done > 0} allDone={sc.total > 0 && sc.done === sc.total} />
      <Coach s={s} only="light" />
      {isToday && (
        <div className="notices">
          <Patience onPatience={(e) => start([e], "Patience")} />
          <Coach s={s} only="missed" />
          <BilanBanner />
          <SameNeed />
          <NiveauSuivant />
        </div>
      )}
      <section className="sec">
        <div className="sechead"><h2>Ta journée</h2><span className="count">{sc.done === sc.total && sc.total ? "fait" : `${sc.done} sur ${sc.total}`}</span></div>
        {!s.light && <NiveauLigne />}
        <Coach s={s} only="ramp" />
        <div className="tl">
          {invoke.map((e) => (
            <div key={`${e.id}-${e.m}`} className={`tr ${entryPct(S, dk, e) >= 1 ? "done" : ""}`}><TlNode done={entryPct(S, dk, e) >= 1} /><Row e={e} intention tile="objectif" /></div>
          ))}
          {socle.map(([m, l]) => {
            const c = secCount(S, [...l], dk), done = c.total > 0 && c.done === c.total;
            const st = done ? "done" : !momentOuvert(S, d, m, now) ? "lock" : m === cur ? "now" : "";
            return <div key={m} className={`tr ${st}`}><TlNode done={done} now={st === "now"} /><SocleRow m={m} list={[...l]} cur={cur} /></div>;
          })}
        </div>
      </section>
      <Foot s={s} />
      <Journal />
    </>
  );
}

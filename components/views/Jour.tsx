"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DAYS, PARCOURS_DAYS } from "@/content/programme";
import { HELD, MONTHS } from "@/content/reglages";
import { REGULARITE } from "@/content/textes";
import { addDays, fmtShort, keyOf, monday, sameDay, today } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { prayerTimes, hm } from "@/lib/prayer";
import {
  countable, currentMoment, parcoursDay, dayPct, entryPct, getItem, itemPct, momentOf, nextStep, plan, secCount, slotsOf, val,
  MOMENT_LABEL, type Entry, type Moment, type Plan, type Structure,
} from "@/lib/program";
import { useCount } from "../Cards";
import { IconLeft, IconRight } from "../Icons";
import { useStore } from "../Store";
import { Lecture } from "./Lecture";


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

function useStartLecture() {
  const { setUi } = useStore();
  return (queue: Entry[], label: string) => { setUi(() => ({ lecture: { queue, i: 0, label } })); window.scrollTo(0, 0); };
}

/** La grande carte qui guide : ce qu’il reste à faire maintenant. */
function Hero({ P }: { P: Plan }) {
  const { S, ui, now } = useStore();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d);
  const ns = nextStep(S, d, P, now);
  if (!ns.next) return <div className="hero done"><h2>Journée complète, qu’Allah l’accepte.</h2></div>;
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
  const pt = prayerTimes(d, S.prayer);
  if (!pt || !S.prayer)
    return (
      <Link className="banner" href="/priere">
        <span style={{ color: "var(--ink)", fontSize: ".9rem" }}>Choisis ta ville pour caler le programme sur tes horaires de prière.</span>
        <span className="act">Choisir</span>
      </Link>
    );
  const isToday = sameDay(d, today()), h = now.getHours() + now.getMinutes() / 60;
  const list: [string, number][] = [["Fajr", pt.fajr], ["Dhuhr", pt.dhuhr], ["ʿAsr", pt.asr], ["Maghreb", pt.maghrib], ["ʿIchâ", pt.isha]];
  const nextIdx = isToday ? list.findIndex(([, t]) => t > h) : -1;
  const lastHour = isToday && d.getDay() === 5 && h >= pt.maghrib - 1 && h < pt.maghrib;
  return (
    <>
      <div className="pr" aria-label={`Horaires de prière, ${S.prayer.city}`}>
        {list.map(([n, t], i) => <div key={n} className={i === nextIdx ? "n" : ""}><b>{hm(t)}</b><span>{n}</span></div>)}
      </div>
      {d.getDay() === 5 && <p className="prnote">{lastHour ? "Maintenant : " : ""}Dernière heure du vendredi, de {hm(pt.maghrib - 1)} à {hm(pt.maghrib)}</p>}
      <div className="prgap" />
    </>
  );
}

function Row({ e }: { e: Entry }) {
  const { S, ui } = useStore();
  const count = useCount();
  const start = useStartLecture();
  const d = ui.sel, dk = keyOf(d), it = getItem(S, e.id, d);
  const si = e.sl[0], slot = slotsOf(e.id)[si], k = `${e.id}:${si}`, v = val(S, dk, k);
  const done = entryPct(S, dk, e) >= 1;
  const isObj = e.id === "obj";
  const title = isObj ? S.objective?.title || "Mon objectif" : it.title;
  let sub: string;
  if (isObj) sub = S.days[dk]?.objAct?.trim() || "Ton action concrète du jour";
  else if (e.id === "pact") sub = `Jour ${parcoursDay(S, d)} sur ${PARCOURS_DAYS}`;
  else if (slot.t > 1) sub = slot.l === "Matin" || slot.l === "Soir" ? `${slot.t} fois` : slot.l;
  else if (e.id === "fajr" || e.m === "jour" || e.m === "actions") sub = momentOf(S, it, d) || (it.kind === "action" ? "Le geste du jour" : "Une fois");
  else sub = "Une fois";
  const tag = e.origin === "theme" ? <span className="tag">Thème du jour</span> : e.origin === "parc" ? <span className="tag t-parc">Parcours</span> : null;
  return (
    <div className={`rowi ${done ? "done" : ""}`} id={`card-${e.id}-${e.m}`}>
      {slot.t === 1 && <button className="ck" aria-pressed={done} aria-label={`${title} : ${done ? "fait" : "à faire"}`} onClick={() => count("toggle", k)} data-k={k} />}
      <button className="rbody" onClick={() => start([e], MOMENT_LABEL[e.m])} aria-label={`Ouvrir ${title}`}>
        <span className="rt">
          <b>{title}{tag}{e.opt && <span className="tag t-opt">Facultatif</span>}</b>
          <small>{sub}</small>
        </span>
        {slot.t > 1 && <span className="cnt"><span className="bar"><i style={{ width: `${Math.min(v / slot.t, 1) * 100}%` }} /></span><b>{v}/{slot.t}</b></span>}
        {slot.t === 1 && <span className="chev" aria-hidden="true" />}
      </button>
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

function Coach({ s }: { s: Structure }) {
  const { S, ui, update, toast } = useStore();
  const d = ui.sel, t = today(), isToday = sameDay(d, t), y = addDays(t, -1);
  const light = (on: boolean) => {
    update((x) => { const r = ensureDay(x, keyOf(d)); if (on) r.light = true; else delete r.light; });
    toast(on ? "Minimum du jour activé" : "Programme complet rétabli");
  };
  if (s.light)
    return (
      <div className="banner soft">
        <div><b>Minimum du jour</b><span>Trois invocations courtes suffisent aujourd’hui.</span></div>
        <button className="act" onClick={() => light(false)}>Programme complet</button>
      </div>
    );
  if (isToday && S.start && S.start <= keyOf(y) && dayPct(S, y) < HELD && dayPct(S, d) < HELD)
    return (
      <div className="banner warm">
        <div>
          <b>Hier n’a pas été tenu, ce n’est pas grave.</b>
          <span>Ce qui compte, c’est de reprendre.</span>
          <span className="q">« {REGULARITE.texte} » {REGULARITE.source}</span>
        </div>
        <button className="act" onClick={() => light(true)}>Reprendre en douceur</button>
      </div>
    );
  if (s.ramp)
    return (
      <div className="banner soft">
        <div><b>Démarrage en douceur · semaine {s.ramp} sur 2</b><span>{s.ramp === 1 ? "Trois invocations pour installer l’habitude." : "Le socle complet, sans le thème du jour."}</span></div>
        <button className="act" onClick={() => { update((x) => { x.rampDone = keyOf(today()); }); toast("Programme complet activé"); }}>Tout le programme</button>
      </div>
    );
  return null;
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

function Note() {
  const { S, ui, update } = useStore();
  const dk = keyOf(ui.sel), note = S.days[dk]?.note || "";
  const [open, setOpen] = useState(false);
  if (!open && !note) return <div className="notebox"><button className="notebtn" onClick={() => setOpen(true)}>+ Ajouter une note du jour</button></div>;
  return (
    <section className="notebox">
      <div className="sechead"><h2><label htmlFor="note">Note du jour</label></h2></div>
      <textarea id="note" className="area" autoFocus={open && !note} placeholder="Ton intention, une du’â personnelle, ce qui a bloqué ou avancé…" value={note}
        onChange={(e) => { const v = e.target.value; update((x) => { ensureDay(x, dk).note = v; }); }} />
      <p className="status">Enregistrée sur cet appareil.</p>
    </section>
  );
}

export function Jour() {
  const { S, ui, setUi, update, toast, now } = useStore();
  if (ui.lecture) return <Lecture />;
  const d = ui.sel, dk = keyOf(d), isToday = sameDay(d, today());
  const day = DAYS[d.getDay()];
  const P = plan(S, d), s = P.s, cur = currentMoment(S, d, now);
  const ids = countable(S, d);
  const doneCount = ids.filter((id) => itemPct(S, dk, id) >= 1).length;
  const title = s.light ? "Minimum du jour" : s.ramp ? "Démarrage en douceur" : day.theme;
  return (
    <>
      <div className="top">
        <div>
          <div className="datebar">
            <button aria-label="Jour précédent" onClick={() => setUi((u) => ({ sel: addDays(u.sel, -1) }))}><IconLeft /></button>
            <p className="eyebrow">{day.name} {fmtShort(d)}</p>
            <button aria-label="Jour suivant" disabled={isToday} onClick={() => setUi((u) => ({ sel: addDays(u.sel, 1) }))}><IconRight /></button>
          </div>
          <h1 className="display">{title}</h1>
        </div>
        <Ring done={doneCount} total={ids.length} />
      </div>
      {isToday ? <Hero P={P} /> : (
        <button className="banner soft" onClick={() => setUi(() => ({ sel: today() }))}>
          <div><b>Tu consultes une journée passée</b><span>Tu peux encore cocher ce que tu avais fait.</span></div>
          <span className="act">Aujourd’hui</span>
        </button>
      )}
      <Prayers d={d} />
      {isToday && <BilanBanner />}
      <Coach s={s} />
      {!s.obj && isToday && !s.light && (
        <Link className="banner" href="/objectif">
          <div><b>Fixe un objectif concret</b><span>Chaque jour, une action pour l’atteindre.</span></div>
          <span className="act">Fixer</span>
        </Link>
      )}
      {(["matin", "jour", "soir"] as const).map((m) => P.sections[m].length ? <Section key={m} m={m} list={P.sections[m]} cur={cur} /> : null)}
      {P.actions.length > 0 && <Section m="actions" list={P.actions} cur={cur} />}
      {!s.light && !s.ramp && (
        <div className="foot"><span>Journée chargée ?</span>
          <button onClick={() => { update((x) => { ensureDay(x, dk).light = true; }); toast("Minimum du jour activé"); }}>Passer au minimum</button>
        </div>
      )}
      <Note />
    </>
  );
}

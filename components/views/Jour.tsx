"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DAYS } from "@/content/programme";
import { HELD, MONTHS } from "@/content/reglages";
import { REGULARITE } from "@/content/textes";
import { addDays, fmtDate, keyOf, monday, sameDay, today } from "@/lib/dates";
import { ensureDay } from "@/lib/state";
import { cardId, currentMoment, dayPct, momentSub, MOMENT_LABEL, nextStep, plan, secCount, type Entry, type Moment, type Plan, type Structure } from "@/lib/program";
import { DisplayChips, EntryCard } from "../Cards";
import { IconLeft, IconRight } from "../Icons";
import { PrayerStrip } from "../Prayer";
import { Star } from "../Star";
import { useStore } from "../Store";

function NextStep({ P }: { P: Plan }) {
  const { S, ui, setUi, now } = useStore();
  const d = ui.sel;
  if (!sameDay(d, today())) return null;
  const ns = nextStep(S, d, P, now);
  if (!ns.next) return <div className="nextstep done"><p>Journée complète, qu’Allah l’accepte.</p></div>;
  const go = () => {
    const target = ns.next, m = target.m;
    setUi((u) => ({ momentOpen: { ...u.momentOpen, [keyOf(d) + m]: true } }));
    requestAnimationFrame(() => {
      const card = document.getElementById(cardId(target));
      if (!card) return;
      card.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      const f = card.querySelector<HTMLElement>("[data-k]");
      if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
    });
  };
  return (
    <div className="nextstep">
      <p>Il te reste {ns.remaining} chose{ns.remaining > 1 ? "s" : ""} à faire.<span>Prochaine : {ns.title}, {ns.hint}</span></p>
      <button onClick={go}>Y aller</button>
    </div>
  );
}

function MomentSection({ m, list, cur }: { m: Moment; list: Entry[]; cur: Moment | null }) {
  const { S, ui, setUi } = useStore();
  const d = ui.sel, dk = keyOf(d), c = secCount(S, list, dk);
  const k = dk + m;
  const open = k in ui.momentOpen ? ui.momentOpen[k] : m === "actions" ? true : cur ? m === cur : true;
  const cls = ["msec"];
  if (!open) cls.push("closed");
  if (cur === m) cls.push("now");
  if (c.total && c.done === c.total) cls.push("alldone");
  return (
    <section className={cls.join(" ")} id={`sec-${m}`}>
      <button className="mhead" aria-expanded={open} onClick={() => setUi((u) => ({ momentOpen: { ...u.momentOpen, [k]: !open } }))}>
        <h2>{MOMENT_LABEL[m]}{cur === m && <span className="nowtag">Maintenant</span>}<small>{momentSub(S, m, d)}</small></h2>
        <span className="count">{c.done} sur {c.total}</span>
        <span className="chev" aria-hidden="true" />
      </button>
      <div className="mbody">{list.map((e) => <EntryCard key={`${e.id}-${e.m}`} e={e} />)}</div>
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
  const regular = <p className="src"><b>Source :</b> {REGULARITE.source}</p>;
  if (s.light)
    return (
      <div className="coach light">
        <p><b>Minimum du jour activé.</b> Trois invocations courtes suffisent aujourd’hui pour tenir ta journée. {REGULARITE.texte}</p>
        {regular}
        <div className="row"><button className="navbtn" onClick={() => light(false)}>Revenir au programme complet</button></div>
      </div>
    );
  if (isToday && S.start && S.start <= keyOf(y) && dayPct(S, y) < HELD && dayPct(S, d) < HELD)
    return (
      <div className="coach warm">
        <p><b>Hier n’a pas été tenu, et ce n’est pas grave.</b> Personne ne tient tous les jours. Ce qui compte, c’est de reprendre : {REGULARITE.texte.charAt(0).toLowerCase() + REGULARITE.texte.slice(1)}</p>
        {regular}
        <div className="row"><button className="navbtn strong" onClick={() => light(true)}>Reprendre avec le minimum du jour</button></div>
      </div>
    );
  if (s.ramp) {
    const left = s.ramp === 1 ? "La semaine prochaine, tu passeras au socle complet de cinq invocations." : "La semaine prochaine, le thème du jour s’ajoutera à ton programme.";
    return (
      <div className="coach">
        <p><b>Démarrage en douceur, semaine {s.ramp} sur 2.</b> {s.ramp === 1 ? "Trois invocations pour installer l’habitude." : "Le socle complet, sans le thème du jour."} {left}</p>
        <div className="row"><button className="link" onClick={() => { update((x) => { x.rampDone = keyOf(today()); }); toast("Programme complet activé"); }}>Passer dès maintenant au programme complet</button></div>
      </div>
    );
  }
  return (
    <div className="quiet"><span>Journée chargée ?</span><button className="navbtn" onClick={() => light(true)}>Minimum du jour</button></div>
  );
}

export function BilanBanner() {
  const { S, setUi } = useStore();
  const router = useRouter();
  const t = today();
  if (!S.start || S.start >= keyOf(t)) return null;
  const open = (p: "lastweek" | "lastmonth") => {
    setUi(() => ({ bilan: p === "lastweek" ? { kind: "semaine", ref: addDays(monday(today()), -7) } : { kind: "mois", ref: new Date(t.getFullYear(), t.getMonth() - 1, 1) } }));
    router.push("/bilan");
  };
  if (t.getDate() === 1)
    return <button className="banner" style={{ width: "100%", textAlign: "left" }} onClick={() => open("lastmonth")}><b>Ton bilan de {MONTHS[addDays(t, -1).getMonth()]} est prêt.</b><span>Prends une minute pour regarder ton mois.</span></button>;
  if (t.getDay() === 1)
    return <button className="banner" style={{ width: "100%", textAlign: "left" }} onClick={() => open("lastweek")}><b>Ton bilan de la semaine est prêt.</b><span>Prends une minute pour regarder ta semaine.</span></button>;
  return null;
}

export function Jour() {
  const { S, ui, setUi, update, now } = useStore();
  const d = ui.sel, dk = keyOf(d), isToday = sameDay(d, today());
  const pct = dayPct(S, d), day = DAYS[d.getDay()];
  const P = plan(S, d), s = P.s, cur = currentMoment(S, d, now);
  const p100 = Math.round(pct * 100);
  return (
    <>
      <header className="dayhead">
        <div>
          <h1>{day.name}</h1>
          <p className="date">{isToday ? "Aujourd’hui, " : ""}{fmtDate(d)}</p>
          <p className="theme">{s.light ? "Minimum du jour" : s.ramp ? `Démarrage en douceur, semaine ${s.ramp}` : day.theme}</p>
        </div>
        <div className="bigstar" role="img" aria-label={`Progression du jour : ${p100} %`}>
          <Star pct={pct} /><span className={`pct ${pct >= 0.55 ? "on" : ""}`}>{p100} %</span>
        </div>
        <div className="datenav">
          <button className="navbtn" onClick={() => setUi((u) => ({ sel: addDays(u.sel, -1) }))}><IconLeft />Veille</button>
          <button className="navbtn" disabled={isToday} onClick={() => setUi((u) => ({ sel: addDays(u.sel, 1) }))}>Lendemain<IconRight /></button>
          {!isToday && <button className="navbtn strong today" onClick={() => setUi(() => ({ sel: today() }))}>Revenir à aujourd’hui</button>}
        </div>
      </header>
      <NextStep P={P} />
      <PrayerStrip d={d} />
      {isToday && <BilanBanner />}
      <Coach s={s} />
      {!s.obj && isToday && !s.light && (
        <div className="setup">
          <p>Fixe un objectif concret : l’application relie chaque jour tes invocations à une action.</p>
          <Link className="navbtn strong" href="/objectif">Fixer mon objectif</Link>
        </div>
      )}
      <DisplayChips />
      {(["matin", "jour", "soir"] as const).map((m) => P.sections[m].length ? <MomentSection key={m} m={m} list={P.sections[m]} cur={cur} /> : null)}
      {P.actions.length > 0 && <MomentSection m="actions" list={P.actions} cur={cur} />}
      <section className="sec" style={{ marginTop: 22 }}>
        <div className="sechead"><h2>Note du jour</h2></div>
        <label className="secintro" htmlFor="note" style={{ display: "block" }}>Ton intention, une du’â personnelle, ce qui a bloqué ou avancé.</label>
        <textarea id="note" className="area" placeholder="Écris ici…" value={S.days[dk]?.note || ""}
          onChange={(e) => { const v = e.target.value; update((x) => { ensureDay(x, dk).note = v; }); }} />
        <p className="status">Ta progression est enregistrée sur cet appareil.</p>
      </section>
    </>
  );
}

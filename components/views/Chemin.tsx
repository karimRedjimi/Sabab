"use client";
// Mon chemin : la frise de ce qui a été fait pour l’objectif, du premier jour à aujourd’hui.
import Link from "next/link";
import { useState } from "react";
import { PARCOURS, PARCOURS_DAYS } from "@/content/programme";
import { HELD } from "@/content/reglages";
import { REGULARITE } from "@/content/textes";
import { addDays, fmtDate, fmtShort, fromKey, keyOf, today } from "@/lib/dates";
import { dayPct, parcoursDay, val } from "@/lib/program";
import { ensureDay, uid8 } from "@/lib/state";
import { objectiveName, parcoursFinished, parcoursServesObjective } from "@/lib/objective";
import { useStore } from "../Store";
import { useRouter } from "next/navigation";
import { Patience } from "../Moments";

interface Ev { key: string; date: Date; label: string; title: string; text?: string; quote?: string; kind?: "big" | "now" }

export function Chemin() {
  const { S, update, toast, setUi } = useStore();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  if (!S.objective) {
    return (
      <>
        <div className="page"><h1>Mon chemin</h1><p className="lead">Fixe un objectif pour suivre ton chemin, jour après jour.</p></div>
        <Link className="navbtn primary" href="/objectif">Fixer mon objectif</Link>
      </>
    );
  }
  const t = today(), tk = keyOf(t);
  const serves = parcoursServesObjective(S) && S.parcours;
  const startKey = serves ? S.parcours!.start : S.objective.since;
  const start = fromKey(startKey);
  const pid = serves ? S.parcours!.id : null, acts = pid ? PARCOURS[pid].actions : [];
  const pdToday = serves ? parcoursDay(S, t) : 0;
  const evs: Ev[] = [];
  let held = 0, gestures = 0;
  for (let d = new Date(start); d <= t; d = addDays(d, 1)) {
    const k = keyOf(d), n = Math.round((d.getTime() - start.getTime()) / 86400000) + 1;
    if (dayPct(S, d) >= HELD) held++;
    const r = S.days[k];
    const pactDone = serves && n <= PARCOURS_DAYS && val(S, k, "pact:0") >= 1;
    const objDone = val(S, k, "obj:0") >= 1;
    const act = objDone ? r?.objAct?.trim() || "" : "";
    if (pactDone) gestures++;
    if (objDone) gestures++;
    if (pactDone) evs.push({ key: k + "p", date: d, label: `Jour ${n}`, title: acts[(n - 1) % acts.length], text: objDone ? (act ? `Ton action : ${act}` : "Et ton action du jour") : undefined });
    else if (objDone) evs.push({ key: k + "o", date: d, label: serves && n <= PARCOURS_DAYS ? `Jour ${n}` : fmtShort(d), title: act || "Action faite pour ton objectif", text: act ? "Ton action du jour" : undefined });
    if (serves && (n === 7 || n === 21 || n === PARCOURS_DAYS))
      evs.push({ key: k + "m", date: d, label: `Jour ${n}`, kind: "big",
        title: n === 7 ? "Une semaine de constance" : n === 21 ? "Trois semaines sur ton chemin" : "Ton parcours est accompli",
        quote: n === 7 ? `« ${REGULARITE.texte} » ${REGULARITE.source}` : undefined });
  }
  for (const [k, g] of Object.entries(S.gratitude || {})) if (g.trim() && k >= startKey) evs.push({ key: "g" + k, date: fromKey(k), label: "Al-hamdulillâh", title: g.trim() });
  for (const st of S.steps || []) if (st.date >= startKey) evs.push({ key: st.id, date: fromKey(st.date), label: "Avancée", title: st.text, kind: "big" });
  for (const c of S.carnet) if (c.obj && c.status === "ok" && c.answered) evs.push({ key: c.id + "a", date: fromKey(c.answered), label: "Exaucée, al-hamdu lillâh", title: c.text, text: c.how, kind: "big" });
  evs.sort((a, b) => b.date.getTime() - a.date.getTime() || (b.kind === "big" ? 1 : 0) - (a.kind === "big" ? 1 : 0));
  if (pdToday && val(S, tk, "pact:0") < 1) evs.unshift({ key: "now", date: t, label: "Aujourd’hui", title: acts[(pdToday - 1) % acts.length], text: "Ton geste du jour", kind: "now" });
  evs.push({ key: "start", date: start, label: `Le début · ${fmtShort(start)}`, title: objectiveName(S), quote: S.objective.why ? `« ${S.objective.why} »` : undefined });
  const steps = (S.steps || []).filter((x) => x.date >= startKey).length;

  const save = () => {
    const txt = draft.trim();
    if (!txt) { toast("Écris d’abord ton avancée"); return; }
    update((s) => { s.steps = [...(s.steps || []), { id: uid8(), date: tk, text: txt.slice(0, 300) }]; });
    setDraft(""); setAdding(false); toast("Avancée notée, al-hamdu lillâh");
  };

  return (
    <>
      <div className="page">
        <p className="eyebrow">Mon chemin</p>
        <h1>{objectiveName(S)}</h1>
        <p className="lead">Depuis le {fmtDate(start)}{pdToday ? ` · jour ${pdToday} sur ${PARCOURS_DAYS}` : parcoursFinished(S, t) ? ` · ${PARCOURS_DAYS} jours accomplis` : ""}</p>
      </div>
      <div className="stats">
        <div className="stat"><b>{held}</b><span>jour{held > 1 ? "s" : ""} tenu{held > 1 ? "s" : ""}</span></div>
        <div className="stat"><b>{gestures}</b><span>geste{gestures > 1 ? "s" : ""} fait{gestures > 1 ? "s" : ""}</span></div>
        <div className="stat"><b>{steps}</b><span>avancée{steps > 1 ? "s" : ""} notée{steps > 1 ? "s" : ""}</span></div>
      </div>
      <Patience onPatience={(e) => { setUi(() => ({ lecture: { queue: [e], i: 0, label: "Patience" } })); router.push("/"); }} />
      {adding ? (
        <section className="sec">
          <label className="field"><span>Une porte qui s’ouvre, un signe, un pas en avant</span>
            <textarea className="area" autoFocus maxLength={300} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Par exemple : une proche m’a présenté quelqu’un de sérieux" /></label>
          <div className="row"><button className="navbtn primary" onClick={save}>Enregistrer</button><button className="link" onClick={() => setAdding(false)}>Annuler</button></div>
        </section>
      ) : <button className="navbtn strong" style={{ marginBottom: 22 }} onClick={() => setAdding(true)}>+ Noter une avancée</button>}
      <ol className="tl">
        {evs.map((e) => (
          <li key={e.key} className={`ev ${e.kind || ""}`}>
            <small>{e.label}</small>
            <b>{e.title}</b>
            {e.text && <p>{e.text}</p>}
            {e.quote && <div className="ms">{e.quote}</div>}
            {e.kind === "now" && <button className="navbtn strong" style={{ marginTop: 10 }} onClick={() => { update((x) => { const r = ensureDay(x, tk); r.c = r.c || {}; r.c["pact:0"] = 1; r.c["obj:0"] = 1; }); toast("Geste fait, qu’Allah l’accepte"); }}>C’est fait</button>}
          </li>
        ))}
      </ol>
      <p className="secintro" style={{ marginTop: 18 }}>Ce chemin reste sur ton appareil. <Link href="/objectif">Modifier mon objectif</Link></p>
    </>
  );
}

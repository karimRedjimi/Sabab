"use client";
import { useState } from "react";
import { CARNET_RAPPEL } from "@/content/textes";
import { diffDays, fmtDate, fromKey, keyOf, today } from "@/lib/dates";
import { uid8, type CarnetEntry } from "@/lib/state";
import { buzz, useStore } from "../Store";

export function Carnet() {
  const { S, update, toast } = useStore();
  const [draft, setDraft] = useState("");
  const [edit, setEdit] = useState<string | null>(null);
  const [how, setHow] = useState("");
  const [del, setDel] = useState<string | null>(null);
  const pend = S.carnet.filter((x) => x.status !== "ok").sort((a, b) => b.date.localeCompare(a.date));
  const done = S.carnet.filter((x) => x.status === "ok").sort((a, b) => (b.answered || "").localeCompare(a.answered || ""));

  const add = () => {
    const txt = draft.trim();
    if (!txt) { toast("Écris d’abord ton invocation"); document.getElementById("newdua")?.focus(); return; }
    update((s) => { s.carnet.push({ id: uid8(), text: txt, date: keyOf(today()), status: "wait" }); });
    setDraft(""); toast("Ajoutée au carnet");
  };
  const change = (id: string, fn: (x: CarnetEntry) => void) => update((s) => { const x = s.carnet.find((c) => c.id === id); if (x) fn(x); });

  const item = (x: CarnetEntry) => (
    <div className={`dua ${x.status === "ok" ? "answered" : ""}`} key={x.id}>
      <p>{x.text}</p>
      <p className="dt">
        Demandée le {fmtDate(fromKey(x.date))}
        {x.status === "ok" && x.answered ? `, exaucée le ${fmtDate(fromKey(x.answered))} (${Math.max(0, diffDays(fromKey(x.answered), fromKey(x.date)))} jours plus tard)` : ""}
      </p>
      {x.how && <p className="how">{x.how}</p>}
      {edit === x.id ? (
        <>
          <label className="field" style={{ margin: "10px 0 0" }}><span>Comment Allah te l’a-t-Il accordée ?</span>
            <textarea className="area" id={`how-${x.id}`} style={{ minHeight: 70 }} value={how} onChange={(e) => setHow(e.target.value)} autoFocus />
          </label>
          <div className="acts">
            <button className="navbtn primary" onClick={() => {
              change(x.id, (c) => { c.status = "ok"; c.answered = keyOf(today()); c.how = how.trim(); });
              setEdit(null); toast("Al-hamdu lillâh"); buzz([30, 60, 30]);
            }}>Enregistrer</button>
            <button className="link" onClick={() => setEdit(null)}>Annuler</button>
          </div>
        </>
      ) : (
        <div className="acts">
          {x.status !== "ok"
            ? <button className="navbtn strong" onClick={() => { setEdit(x.id); setHow(""); setDel(null); }}>Elle a été exaucée</button>
            : (<>
              {x.shared && <span className="dt" style={{ margin: 0 }}>Partagée sur le mur</span>}
              <button className="link" onClick={() => change(x.id, (c) => { c.status = "wait"; delete c.answered; })}>Remettre en attente</button>
            </>)}
          {del === x.id
            ? <button className="link" onClick={() => { update((s) => { s.carnet = s.carnet.filter((c) => c.id !== x.id); }); setDel(null); toast("Supprimée du carnet"); }}>Confirmer la suppression</button>
            : <button className="link danger" onClick={() => setDel(x.id)}>Supprimer</button>}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="page">
        <h1>Carnet des invocations</h1>
        <p className="lead">Note ce que tu demandes à Allah. Le jour où c’est exaucé, raconte comment.</p>
      </div>
      <div className="stats">
        <div className="stat"><b>{done.length}</b><span>invocation{done.length > 1 ? "s" : ""} exaucée{done.length > 1 ? "s" : ""}</span></div>
        <div className="stat"><b>{pend.length}</b><span>en attente</span></div>
      </div>
      <section className="sec">
        <label className="field"><span>Nouvelle invocation</span>
          <textarea className="area" id="newdua" maxLength={600} placeholder="Ô Allah, accorde-moi…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <button className="navbtn primary" onClick={add}>Ajouter au carnet</button>
      </section>
      <section className="sec">
        <div className="sechead"><h2>En attente</h2><span className="count">{pend.length}</span></div>
        {pend.length ? pend.map(item) : <p className="empty">Aucune invocation en attente.</p>}
      </section>
      <section className="sec">
        <div className="sechead"><h2>Exaucées</h2><span className="count">{done.length}</span></div>
        {done.length ? done.map(item) : <p className="empty">Quand une invocation sera exaucée, elle apparaîtra ici avec son histoire.</p>}
      </section>
      <p className="secintro">{CARNET_RAPPEL}</p>
    </>
  );
}

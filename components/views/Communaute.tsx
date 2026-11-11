"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { REQ_CATS } from "@/content/reglages";
import { POUR_SON_FRERE } from "@/content/textes";
import { supabase, errMsg, REQ_CAT_OF, type RequestView } from "@/lib/supabase";
import { objectiveTag } from "@/lib/objective";
import { useAccount } from "../Account";
import { buzz, useStore } from "../Store";
import { Brand } from "../Glyphs";

function ago(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m <= 1 ? "à l’instant" : `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24); return d === 1 ? "hier" : `il y a ${d} jours`;
}

function Post({ r, onChange }: { r: RequestView; onChange: () => void }) {
  const { toast } = useStore();
  const [prayed, setPrayed] = useState(r.prayed);
  const [n, setN] = useState(r.prayers);
  const [confirm, setConfirm] = useState<"del" | "report" | null>(null);
  const call = async (fn: string, args: Record<string, unknown>) => { const { data, error } = await supabase!.rpc(fn, args); if (error) { toast(errMsg(error)); throw error; } return data; };
  return (
    <div className={`post ${r.mine ? "mine" : ""}`}>
      <div className="meta"><span className="cat">{REQ_CATS[r.cat] || "Autre"}</span><span>{r.pseudo || "Un membre"}, {ago(r.created_at)}</span></div>
      <p>{r.text}</p>
      <div className="acts">
        {r.mine ? (
          <>
            {r.status === "pending" && <span className="kind wait">En relecture</span>}
            {r.status === "rejected" && <span className="kind wait">Non publiée</span>}
            {r.status === "approved" && <span className="cnt2"><b>{n}</b> du’â pour toi</span>}
            {r.answered ? <span className="kind">Exaucée, al-hamdulillâh</span>
              : r.status === "approved" && <button className="link" onClick={async () => { await call("mark_answered", { p_id: r.id }); toast("Al-hamdu lillâh"); onChange(); }}>Elle a été exaucée</button>}
            {confirm === "del"
              ? <button className="link" onClick={async () => { await call("delete_request", { p_id: r.id }); toast("Demande supprimée"); onChange(); }}>Confirmer</button>
              : <button className="link danger" onClick={() => setConfirm("del")}>Supprimer</button>}
          </>
        ) : (
          <>
            <button className="pray" aria-pressed={prayed} disabled={prayed} onClick={async () => {
              setPrayed(true); buzz(15);
              try { const c = await call("pray_for", { p_id: r.id }); setN(c as number); toast("Qu’Allah l’exauce, et pour toi de même"); } catch { setPrayed(false); }
            }}>{prayed ? "Tu as invoqué pour cette personne" : "J’ai fait une du’â"}</button>
            <span className="cnt2">{n} du’â</span>
            {confirm === "report"
              ? <button className="link" onClick={async () => { await call("report_request", { p_id: r.id, p_reason: "" }); toast("Merci, la demande sera relue"); onChange(); }}>Confirmer le signalement</button>
              : <button className="link danger" onClick={() => setConfirm("report")}>Signaler</button>}
          </>
        )}
      </div>
    </div>
  );
}

function NewRequest({ onDone }: { onDone: () => void }) {
  const { S, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState((S.objective && REQ_CAT_OF[S.objective.cat]) || "autre");
  const [text, setText] = useState("");
  const [pseudo, setPseudo] = useState(S.pseudo || "");
  const [busy, setBusy] = useState(false);
  if (!open) return <button className="navbtn primary" style={{ marginBottom: 22 }} onClick={() => setOpen(true)}>+ Demander des du’â</button>;
  return (
    <section className="sec">
      <div className="sechead"><h2>Demander des du’â</h2></div>
      <p className="warn">Ta demande est publiée sans ton nom. N’y mets ni nom de famille, ni ville, ni détail qui permettrait de te reconnaître.</p>
      <label className="field"><span>Domaine</span>
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>{Object.entries(REQ_CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="field"><span>Ton besoin</span>
        <textarea className="area" maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder="Par exemple : je cherche un emploi depuis huit mois, faites une du’â pour moi" /></label>
      <label className="field"><span>Prénom ou pseudonyme (facultatif)</span>
        <input className="input" maxLength={30} value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Un membre" /></label>
      <div className="row">
        <button className="navbtn primary" disabled={busy} onClick={async () => {
          if (text.trim().length < 10) { toast("Décris ton besoin en une ou deux phrases"); return; }
          setBusy(true);
          const { error } = await supabase!.rpc("post_request", { p_cat: cat, p_text: text.trim(), p_pseudo: pseudo.trim() });
          setBusy(false);
          if (error) { toast(errMsg(error)); return; }
          setText(""); setOpen(false); toast("Merci, ta demande sera publiée après relecture"); onDone();
        }}>Envoyer ma demande</button>
        <button className="link" onClick={() => setOpen(false)}>Annuler</button>
      </div>
      <p className="secintro" style={{ marginTop: 10 }}>Chaque demande est relue avant d’être publiée.</p>
    </section>
  );
}

export function Communaute() {
  const acc = useAccount();
  const { S } = useStore();
  const [same, setSame] = useState<RequestView[] | null>(null);
  const [all, setAll] = useState<RequestView[] | null>(null);
  const [mine, setMine] = useState<RequestView[]>([]);
  const [err, setErr] = useState(false);
  const cat = S.objective ? REQ_CAT_OF[S.objective.cat] : null;
  const load = useCallback(async () => {
    if (!supabase) return;
    setErr(false);
    const [a, b, c] = await Promise.all([
      cat ? supabase.rpc("feed_requests", { p_cat: cat, p_limit: 20 }) : Promise.resolve({ data: [], error: null }),
      supabase.rpc("feed_requests", { p_cat: null, p_limit: 40 }),
      supabase.rpc("my_requests"),
    ]);
    if (a.error || b.error || c.error) { setErr(true); return; }
    const sameIds = new Set((a.data as RequestView[]).map((r) => r.id));
    setSame(a.data as RequestView[]); setAll((b.data as RequestView[]).filter((r) => !sameIds.has(r.id))); setMine(c.data as RequestView[]);
  }, [cat]);
  useEffect(() => { if (acc.status === "in") load(); }, [acc.status, load]);

  const head = (
    <>
      <Brand />
      <div className="page"><h1>Communauté</h1>
        <p className="lead">Invoquer les uns pour les autres, sans se montrer. Personne n’a de nom ni de classement.</p></div>
      <div className="acc" style={{ marginBottom: 18 }}><p>{POUR_SON_FRERE.texte}</p><p className="src"><b>Source :</b> {POUR_SON_FRERE.source}</p></div>
    </>
  );
  if (acc.status === "off") return <>{head}<p className="empty">La communauté ouvrira avec les comptes.</p></>;
  if (acc.status !== "in") return <>{head}<p className="empty" style={{ marginBottom: 14 }}>La communauté a besoin que tu sois connecté à ton compte.</p><Link className="navbtn primary" href="/compte">Me connecter</Link></>;
  return (
    <>
      {head}
      {err && <p className="empty">Impossible de charger la communauté pour le moment. <button className="link" onClick={load}>Réessayer</button></p>}
      <NewRequest onDone={load} />
      {mine.length > 0 && <section className="sec"><div className="sechead"><h2>Mes demandes</h2></div>{mine.map((r) => <Post key={r.id} r={r} onChange={load} />)}</section>}
      {cat && (
        <section className="sec"><div className="sechead"><h2>Ils demandent la même chose que toi</h2><span className="count">{objectiveTag(S)}</span></div>
          {same === null ? <p className="empty">Chargement…</p> : same.length ? same.map((r) => <Post key={r.id} r={r} onChange={load} />) : <p className="empty">Personne pour le moment. Ta demande sera peut-être la première.</p>}
        </section>
      )}
      <section className="sec"><div className="sechead"><h2>{cat ? "Ils ont aussi besoin de tes du’â" : "Ils ont besoin de tes du’â"}</h2><span className="count">{all?.length ?? ""}</span></div>
        {all === null ? <p className="empty">Chargement…</p> : all.length ? all.map((r) => <Post key={r.id} r={r} onChange={load} />) : <p className="empty">Aucune demande pour le moment.</p>}
      </section>
    </>
  );
}

export function Moderation() {
  const acc = useAccount();
  const { toast } = useStore();
  const [list, setList] = useState<RequestView[] | null>(null);
  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.rpc("moderation_queue");
    if (error) { toast(errMsg(error)); setList([]); return; }
    setList(data as RequestView[]);
  }, [toast]);
  useEffect(() => { if (acc.moderator) load(); }, [acc.moderator, load]);
  if (!acc.moderator) return <><div className="page"><h1>Modération</h1></div><p className="empty">Réservé à l’équipe de modération.</p></>;
  const act = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase!.rpc("moderate", { p_id: id, p_status: status });
    if (error) { toast(errMsg(error)); return; }
    toast(status === "approved" ? "Publiée" : "Refusée"); load();
  };
  return (
    <>
      <div className="page"><h1>Modération</h1><p className="lead">Les demandes à relire avant publication, et celles qui ont été signalées.</p></div>
      {list === null ? <p className="empty">Chargement…</p> : !list.length ? <p className="empty">Rien à relire, al-hamdulillâh.</p> : list.map((r) => (
        <div className="post" key={r.id}>
          <div className="meta"><span className="cat">{REQ_CATS[r.cat] || "Autre"}</span><span>{r.pseudo || "Un membre"}, {ago(r.created_at)}{r.prayers ? ` · ${r.prayers} signalement${r.prayers > 1 ? "s" : ""}` : ""}</span></div>
          <p>{r.text}</p>
          <div className="acts">
            <button className="navbtn primary" onClick={() => act(r.id, "approved")}>Publier</button>
            <button className="navbtn" onClick={() => act(r.id, "rejected")}>Refuser</button>
          </div>
        </div>
      ))}
    </>
  );
}

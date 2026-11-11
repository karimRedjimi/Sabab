"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { refLabel } from "@/lib/coran";
import { fmtDate, keyOf, today } from "@/lib/dates";
import { uid8 } from "@/lib/state";
import { DUA_GOAL, duasOn, mmss, versetDuJour } from "@/lib/verset";
import { MAX_SECONDS, useRecorder } from "../Recorder";
import { REQ_CATS } from "@/content/reglages";
import { POUR_SON_FRERE } from "@/content/textes";
import { supabase, errMsg, REQ_CAT_OF, type RecitationView, type RequestView } from "@/lib/supabase";
import { useAccount } from "../Account";
import { buzz, useStore } from "../Store";
import { DisplayChips } from "../Cards";
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
            {r.status === "pending" && <span className="kind wait">Masquée après des signalements</span>}
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
  const [busy, setBusy] = useState(false);
  if (!open) return <button className="navbtn strong" onClick={() => setOpen(true)}>+ Déposer un souhait</button>;
  return (
    <div className="wform">
      <label className="field"><span>Ton souhait, sans ton nom</span>
        <textarea className="area" autoFocus maxLength={300} value={text} onChange={(e) => setText(e.target.value)} placeholder="Par exemple : je cherche un emploi depuis huit mois, invoquez pour moi" /></label>
      <label className="field"><span>Domaine</span>
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>{Object.entries(REQ_CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <div className="row">
        <button className="navbtn primary" disabled={busy} onClick={async () => {
          if (text.trim().length < 10) { toast("Décris ton besoin en une ou deux phrases"); return; }
          setBusy(true);
          const { error } = await supabase!.rpc("post_request", { p_cat: cat, p_text: text.trim(), p_pseudo: "" });
          setBusy(false);
          if (error) { toast(errMsg(error)); return; }
          setText(""); setOpen(false); toast("Ton souhait est publié"); onDone();
        }}>Publier</button>
        <button className="link" onClick={() => setOpen(false)}>Annuler</button>
      </div>
      <p className="fine">Ni nom, ni ville, ni contact. Les messages vulgaires sont refusés automatiquement.</p>
    </div>
  );
}

const todayKey = () => keyOf(today());

/** « Une minute pour les autres » : invoquer pour cinq personnes, une à la fois. */
function Ritual({ cat, onChange }: { cat: string | null; onChange: () => void }) {
  const { S, update, toast } = useStore();
  const done = duasOn(S.prayed, todayKey());
  const [queue, setQueue] = useState<RequestView[] | null>(null);
  const [i, setI] = useState(0);
  const [busy, setBusy] = useState(false);
  const [round, setRound] = useState(0); // du’â faites dans cette série
  const [report, setReport] = useState(false);
  const open = async () => {
    setBusy(true);
    const { data, error } = await supabase!.rpc("dua_queue", { p_cat: cat, p_limit: DUA_GOAL });
    setBusy(false);
    if (error) { toast(errMsg(error)); return; }
    setQueue(data as RequestView[]); setI(0); setRound(0);
  };
  const r = queue && queue[i];
  const next = () => { setReport(false); setI((n) => n + 1); };
  const amin = async () => {
    if (!r) return;
    setBusy(true);
    const { error } = await supabase!.rpc("pray_for", { p_id: r.id });
    setBusy(false);
    if (error) { toast(errMsg(error)); return; }
    buzz(15);
    update((s) => { s.prayed = { ...(s.prayed || {}), [r.id]: todayKey() }; });
    setRound((n) => n + 1); next();
  };

  // En cours : une demande à la fois.
  if (queue && r) {
    return (
      <section className="ritual run" aria-live="polite">
        <div className="rdots" role="img" aria-label={`Du’â ${Math.min(i + 1, queue.length)} sur ${queue.length}`}>{queue.map((q, k) => <i key={q.id} className={k < i ? "past" : k === i ? "on" : ""} />)}</div>
        <article className="wish" key={r.id}>
          <div className="wmeta"><span className="qtag th">{REQ_CATS[r.cat] || "Autre"}</span><span>{r.pseudo || "Un membre"} · {ago(r.created_at)}</span></div>
          <p className="wtext">{r.text}</p>
          {cat && r.cat === cat && <p className="wsame">Cette personne demande la même chose que toi.</p>}
        </article>
        <p className="rhint">Lis sa demande, puis invoque pour cette personne, à voix basse ou dans ton cœur.</p>
        <button className="bigbtn" disabled={busy} onClick={amin}>Âmîn, j’ai invoqué pour elle</button>
        <div className="rlinks">
          <button className="link" onClick={next}>Passer</button>
          {report
            ? <button className="link" onClick={async () => { await supabase!.rpc("report_request", { p_id: r.id, p_reason: "" }); toast("Merci, la demande sera relue"); next(); }}>Confirmer le signalement</button>
            : <button className="link danger" onClick={() => setReport(true)}>Signaler</button>}
          <button className="link" onClick={() => { setQueue(null); onChange(); }}>Arrêter</button>
        </div>
      </section>
    );
  }
  // Fin d’une série.
  if (queue) {
    return (
      <section className="ritual end">
        <span className="qok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <h2>{round ? "Qu’Allah les exauce" : queue.length ? "Tu y reviendras" : "Tu as invoqué pour tout le monde"}</h2>
        <p className="lead">{round ? `Tu as invoqué pour ${round} personne${round > 1 ? "s" : ""}. Et pour toi de même.` : queue.length ? "Les demandes t’attendent." : "Il n’y a pas d’autre demande pour le moment. Qu’Allah te récompense."}</p>
        <p className="rsrc">{POUR_SON_FRERE.texte} <span>{POUR_SON_FRERE.source}</span></p>
        <div className="row" style={{ justifyContent: "center" }}>
          {queue.length >= DUA_GOAL && round > 0 && <button className="navbtn strong" disabled={busy} onClick={open}>Encore {DUA_GOAL}</button>}
          <button className="navbtn primary" onClick={() => { setQueue(null); onChange(); }}>Terminer</button>
        </div>
      </section>
    );
  }
  const full = done >= DUA_GOAL;
  return (
    <section className="ritual">
      <p className="k">Une minute pour les autres</p>
      <h2>{full ? "Tes du’â du jour sont faites" : `Invoque pour ${DUA_GOAL} personnes`}</h2>
      <div className="rdots big" role="img" aria-label={`${Math.min(done, DUA_GOAL)} du’â sur ${DUA_GOAL} aujourd’hui`}>{Array.from({ length: DUA_GOAL }, (_, k) => <i key={k} className={k < done ? "past" : ""} />)}</div>
      <button className="bigbtn" disabled={busy} onClick={open}>{full ? "Invoquer pour d’autres" : done ? "Continuer" : "Commencer"}</button>
      <p className="rsrc end">{POUR_SON_FRERE.texte} <span>{POUR_SON_FRERE.source}</span></p>
    </section>
  );
}

function DuaTab() {
  const acc = useAccount();
  const { S } = useStore();
  const [mine, setMine] = useState<RequestView[]>([]);
  const [all, setAll] = useState<RequestView[] | null>(null);
  const [showAll, setShowAll] = useState(false);
  const cat = S.objective ? REQ_CAT_OF[S.objective.cat] : null;
  const load = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.rpc("my_requests");
    if (data) setMine(data as RequestView[]);
  }, []);
  const loadAll = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.rpc("feed_requests", { p_cat: null, p_limit: 40 });
    setAll((data as RequestView[]) || []);
  }, []);
  useEffect(() => { if (acc.status === "in") load(); }, [acc.status, load]);

  if (acc.status !== "in") {
    return (
      <>
        <section className="ritual">
          <p className="k">Une minute pour les autres</p>
          <h2>Invoque pour {DUA_GOAL} personnes</h2>
          <div className="rdots big" aria-hidden="true">{Array.from({ length: DUA_GOAL }, (_, k) => <i key={k} />)}</div>
          {acc.status === "off"
            ? <p className="rnote">La communauté ouvre bientôt.</p>
            : <Link className="bigbtn" href="/compte">Me connecter pour commencer</Link>}
          <p className="rsrc end">{POUR_SON_FRERE.texte} <span>{POUR_SON_FRERE.source}</span></p>
        </section>
        <ul className="how">
          <li><b>Tu déposes ton souhait</b><span>Sans ton nom.</span></li>
          <li><b>Tu invoques pour {DUA_GOAL} personnes</b><span>Une demande à la fois, une minute en tout.</span></li>
          <li><b>D’autres invoquent pour toi</b><span>Tu vois combien, jamais qui.</span></li>
        </ul>
      </>
    );
  }
  const live = mine.filter((r) => !r.answered);
  const received = live.filter((r) => r.status === "approved").reduce((n, r) => n + r.prayers, 0);
  return (
    <>
      <Ritual cat={cat} onChange={load} />
      <section className="sec">
        <div className="sechead"><h2>Ton souhait</h2>{received > 0 && <span className="count">{received} du’â pour toi</span>}</div>
        {mine.map((r) => <Post key={r.id} r={r} onChange={load} />)}
        <NewRequest onDone={load} />
      </section>
      <section className="sec">
        {showAll
          ? <><div className="sechead"><h2>Toutes les demandes</h2><span className="count">{all?.length ?? ""}</span></div>
            {all === null ? <p className="empty">Chargement…</p> : all.length ? all.map((r) => <Post key={r.id} r={r} onChange={loadAll} />) : <p className="empty">Aucune demande pour le moment.</p>}</>
          : <button className="link" onClick={() => { setShowAll(true); loadAll(); }}>Voir toutes les demandes</button>}
      </section>
    </>
  );
}

const VOICE_KEY = "sabab-voice-consent";
const EXT: Record<string, string> = { "audio/mp4": "m4a", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/aac": "aac" };

/** Un seul son à la fois dans l’écran. */
function usePlayer() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const stop = useCallback(() => { el.current?.pause(); setPlaying(null); }, []);
  const play = useCallback(async (id: string, src: string | (() => Promise<string | null>)) => {
    if (el.current) el.current.pause();
    if (playing === id) { setPlaying(null); return; }
    const url = typeof src === "string" ? src : await src();
    if (!url) return;
    const a = new Audio(url); el.current = a;
    a.onended = () => setPlaying((p) => (p === id ? null : p));
    a.onerror = () => setPlaying((p) => (p === id ? null : p));
    setPlaying(id);
    a.play().catch(() => setPlaying(null));
  }, [playing]);
  useEffect(() => () => { el.current?.pause(); }, []);
  return { playing, play, stop };
}

const PlayIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">{on ? <><rect x="7" y="6" width="3.6" height="12" rx="1.2" /><rect x="13.4" y="6" width="3.6" height="12" rx="1.2" /></> : <path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l10-6.2a.8.8 0 0 0 0-1.4l-10-6.2a.8.8 0 0 0-1.2.7z" />}</svg>
);

function VersetTab() {
  const acc = useAccount();
  const { S, toast } = useStore();
  const d = today(), dk = keyOf(d), v = versetDuJour(d);
  const rec = useRecorder();
  const player = usePlayer();
  const [list, setList] = useState<RecitationView[] | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentNow, setConsentNow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  useEffect(() => { try { setConsent(localStorage.getItem(VOICE_KEY) === "1"); } catch { /* */ } }, []);
  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.rpc("feed_recitations", { p_day: dk });
    setList(error ? [] : (data as RecitationView[]));
  }, [dk]);
  useEffect(() => { if (acc.status === "in") load(); }, [acc.status, load]);
  const mine = list?.find((r) => r.mine) || null, others = (list || []).filter((r) => !r.mine);
  const signed = (path: string) => async () => {
    const { data, error } = await supabase!.storage.from("recitations").createSignedUrl(path, 600);
    if (error || !data) { toast("Impossible d’écouter pour le moment"); return null; }
    return data.signedUrl;
  };
  const share = async () => {
    if (!rec.take || !supabase) return;
    setBusy(true);
    try {
      const { data: folder, error: e1 } = await supabase.rpc("recitation_folder");
      if (e1 || !folder) throw e1 || new Error("dossier");
      const path = `${folder}/${dk}-${uid8()}.${EXT[rec.take.mime] || "m4a"}`;
      const up = await supabase.storage.from("recitations").upload(path, rec.take.blob, { contentType: rec.take.mime, upsert: false });
      if (up.error) throw up.error;
      const { error: e2 } = await supabase.rpc("post_recitation", { p_day: dk, p_ref: v.ref, p_path: path, p_seconds: rec.take.seconds, p_voice_consent: true });
      if (e2) { await supabase.storage.from("recitations").remove([path]); throw e2; }
      try { localStorage.setItem(VOICE_KEY, "1"); } catch { /* */ }
      setConsent(true); player.stop(); rec.reset(); toast("Ta récitation est publiée"); load();
    } catch (e) { toast(errMsg(e)); }
    setBusy(false);
  };
  const remove = async (r: RecitationView) => {
    const { data, error } = await supabase!.rpc("delete_recitation", { p_id: r.id });
    if (error) { toast(errMsg(error)); return; }
    if (data) await supabase!.storage.from("recitations").remove([data as string]);
    setConfirm(null); toast("Récitation supprimée"); load();
  };
  const canShare = acc.status === "in" && !mine;
  const one = v.verses[0];
  const card = useRef<HTMLElement>(null);

  return (
    <>
      <article className="vday" ref={card}>
        <div className="vhead"><p className="k">Un jour, un verset</p><span>{fmtDate(d)}</span></div>
        {/* La barre du micro est au-dessus du verset : on le lit en dessous pendant qu’on récite. */}
        <div className={`recbar ${rec.state === "recording" ? "live" : ""}`}>
          {mine ? (
            <>
              <button className="pbtn" aria-label={player.playing === mine.id ? "Pause" : "Écouter ma récitation"} onClick={() => player.play(mine.id, signed(mine.path))}><PlayIcon on={player.playing === mine.id} /></button>
              <span className="rt"><b>Ta récitation</b><small>{mmss(mine.seconds)} · {mine.status !== "approved" ? "masquée" : mine.cheers ? `${mine.cheers} encouragement${mine.cheers > 1 ? "s" : ""}` : "publiée"}</small></span>
              {confirm === mine.id
                ? <button className="link danger" onClick={() => remove(mine)}>Confirmer</button>
                : <button className="link" onClick={() => setConfirm(mine.id)}>Supprimer</button>}
            </>
          ) : rec.state === "recording" ? (
            <>
              <button className="mic live" onClick={rec.stop} aria-label="Arrêter l’enregistrement"><span className="sq" /></button>
              <span className="rt"><b className="rectime">{mmss(rec.seconds)}</b><small>Touche pour arrêter · {mmss(MAX_SECONDS)} au plus</small></span>
            </>
          ) : rec.state === "done" && rec.take ? (
            <>
              <button className="pbtn" aria-label={player.playing === "take" ? "Pause" : "Écouter mon enregistrement"} onClick={() => player.play("take", rec.take!.url)}><PlayIcon on={player.playing === "take"} /></button>
              <span className="rt"><b>Ton enregistrement</b><small>{mmss(rec.take.seconds)} · sur ton téléphone</small></span>
              <button className="link" onClick={() => { player.stop(); rec.reset(); }}>Refaire</button>
            </>
          ) : (
            <>
              <button className="mic" onClick={() => { card.current?.scrollIntoView({ block: "start", behavior: "smooth" }); rec.start(); }} disabled={rec.state === "asking"} aria-label="Enregistrer ma récitation">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" /></svg>
              </button>
              <span className="rt"><b>À ton tour</b><small>Récite le verset, puis écoute-toi</small></span>
              {v.audio && <button className="pbtn ghost" aria-label={player.playing === "ref" ? "Pause" : "Écouter le récitateur"} onClick={() => player.play("ref", v.audio!)}><PlayIcon on={player.playing === "ref"} /></button>}
            </>
          )}
        </div>
        {S.show.ar && <p className="ar qar" lang="ar" dir="rtl">{one.ar}</p>}
        {S.show.ph && <p className="ph">{one.ph}</p>}
        {S.show.fr && <p className="qfr">{one.fr}</p>}
        <p className="qref">{refLabel(v)}</p>
        <DisplayChips />

        {rec.error === "denied" && <p className="warn" style={{ marginTop: 10 }}>Le micro n’est pas autorisé. Autorise-le dans les réglages de ton navigateur, puis réessaie.</p>}
        {rec.error === "unsupported" && <p className="warn" style={{ marginTop: 10 }}>Ce navigateur ne permet pas d’enregistrer. Essaie avec Safari ou Chrome à jour.</p>}
        {rec.state === "done" && rec.take && !mine && (canShare ? (
          <div className="sharebox">
            {!consent && (
              <label className="consent">
                <input type="checkbox" checked={consentNow} onChange={(e) => setConsentNow(e.target.checked)} />
                <span>J’accepte que ma voix soit entendue par les membres, sans mon nom. Des personnes qui me connaissent pourraient la reconnaître.</span>
              </label>
            )}
            <button className="bigbtn" disabled={!(consent || consentNow) || busy} onClick={share}>{busy ? "Envoi…" : "Partager avec la communauté"}</button>
          </div>
        ) : acc.status === "out" ? <p className="fine">Pour la partager, <Link href="/compte">connecte-toi</Link>.</p>
          : acc.status === "off" ? <p className="fine">Le partage ouvrira avec la communauté.</p> : null)}
      </article>

      <section className="sec">
        <div className="sechead"><h2>La communauté récite</h2>{others.length > 0 && <span className="count">{others.length}</span>}</div>
        {acc.status === "off" ? <p className="empty">Bientôt, les récitations des membres, sans leur nom.</p>
          : acc.status !== "in" ? <p className="empty">Connecte-toi pour écouter les membres.</p>
          : list === null ? <p className="empty">Chargement…</p>
          : !others.length ? <p className="empty">Personne n’a encore récité aujourd’hui. Sois le premier.</p>
          : (
            <ul className="reclist">
              {others.map((r, k) => (
                <li key={r.id}>
                  <button className="pbtn" aria-label={player.playing === r.id ? "Pause" : `Écouter la récitation ${k + 1}`} onClick={() => player.play(r.id, signed(r.path))}><PlayIcon on={player.playing === r.id} /></button>
                  <span className="rt"><b>Un membre</b><small>{mmss(r.seconds)} · {ago(r.created_at)} · {confirm === r.id
                    ? <button className="inl" onClick={async () => { await supabase!.rpc("report_recitation", { p_id: r.id }); setConfirm(null); toast("Merci pour le signalement"); load(); }}>confirmer le signalement</button>
                    : <button className="inl" onClick={() => setConfirm(r.id)}>signaler</button>}</small></span>
                  <button className="pray" aria-pressed={r.cheered} disabled={r.cheered} onClick={async () => {
                    const { error } = await supabase!.rpc("cheer_recitation", { p_id: r.id });
                    if (error) { toast(errMsg(error)); return; }
                    buzz(12); setList((l) => l && l.map((x) => (x.id === r.id ? { ...x, cheered: true } : x)));
                  }}>{r.cheered ? "Mâ shâ Allâh ✓" : "Mâ shâ Allâh"}</button>
                </li>
              ))}
            </ul>
          )}
      </section>
    </>
  );
}

export function Communaute() {
  const [tab, setTab] = useState<"dua" | "verset">("dua");
  useEffect(() => { try { if (sessionStorage.getItem("sabab-com-tab") === "verset") setTab("verset"); } catch { /* */ } }, []);
  const pick = (t: "dua" | "verset") => (e: React.MouseEvent) => { e.preventDefault(); setTab(t); try { sessionStorage.setItem("sabab-com-tab", t); } catch { /* */ } };
  return (
    <>
      <Brand />
      <h1 className="sr-only">Communauté</h1>
      <nav className="seg" aria-label="Communauté">
        <a href="#" aria-current={tab === "dua" ? "page" : undefined} onClick={pick("dua")}>Du’â</a>
        <a href="#" aria-current={tab === "verset" ? "page" : undefined} onClick={pick("verset")}>Un jour, un verset</a>
      </nav>
      {tab === "dua" ? <DuaTab /> : <VersetTab />}
    </>
  );
}

function RecitationQueue() {
  const { toast } = useStore();
  const player = usePlayer();
  const [list, setList] = useState<RecitationView[] | null>(null);
  const load = useCallback(async () => {
    const { data, error } = await supabase!.rpc("recitation_queue");
    setList(error ? [] : (data as RecitationView[]));
  }, []);
  useEffect(() => { load(); }, [load]);
  const act = async (r: RecitationView, ok: boolean) => {
    if (ok) { const { error } = await supabase!.rpc("moderate_recitation", { p_id: r.id, p_status: "approved" }); if (error) { toast(errMsg(error)); return; } }
    else { const { data, error } = await supabase!.rpc("delete_recitation", { p_id: r.id }); if (error) { toast(errMsg(error)); return; } if (data) await supabase!.storage.from("recitations").remove([data as string]); }
    toast(ok ? "Publiée" : "Refusée et effacée"); load();
  };
  return (
    <section className="sec">
      <div className="sechead"><h2>Récitations masquées</h2><span className="count">{list?.length ?? ""}</span></div>
      {list === null ? <p className="empty">Chargement…</p> : !list.length ? <p className="empty">Rien à écouter.</p> : (
        <ul className="reclist">
          {list.map((r) => (
            <li key={r.id}>
              <button className="pbtn" aria-label="Écouter" onClick={() => player.play(r.id, async () => { const { data } = await supabase!.storage.from("recitations").createSignedUrl(r.path, 600); return data?.signedUrl || null; })}><PlayIcon on={player.playing === r.id} /></button>
              <span className="rt"><b>Verset {r.ref}</b><small>{mmss(r.seconds)} · {ago(r.created_at)}{r.cheers ? ` · ${r.cheers} signalement${r.cheers > 1 ? "s" : ""}` : ""}</small></span>
              <button className="navbtn primary" onClick={() => act(r, true)}>Publier</button>
              <button className="navbtn" onClick={() => act(r, false)}>Refuser</button>
            </li>
          ))}
        </ul>
      )}
    </section>
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
      <div className="page"><h1>Modération</h1><p className="lead">La publication est automatique. Ici n’apparaît que ce que les signalements des membres ont masqué : tu peux le republier ou le refuser.</p></div>
      <RecitationQueue />
      <div className="sechead"><h2>Souhaits masqués</h2></div>
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

"use client";
// Le rappel du Coran du jour : quelques versets, un passage à la fois.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { VERSETS_SOURCE } from "@/content/versets";
import { CORAN_LEVELS, coranLevel, rappelsDuJour, refLabel, suggestNextLevel, versesIn } from "@/lib/coran";
import { fmtShort, keyOf, sameDay, today } from "@/lib/dates";
import { buzz, useStore } from "../Store";

const minutes = (s: number) => (s < 60 ? "moins d’une minute" : `${Math.round(s / 60)} min`);

export function Coran() {
  const { S, ui, update, toast } = useStore();
  const router = useRouter();
  const t = today(), d = ui.sel > t ? t : ui.sel, dk = keyOf(d), isToday = sameDay(d, t);
  const list = useMemo(() => rappelsDuJour(S, d), [S, d]);
  const [i, setI] = useState(0);
  const [ended, setEnded] = useState(false);
  const began = useRef(0);
  useEffect(() => { began.current = Date.now(); }, []);
  const already = !!S.coran?.[dk];
  const r = list[Math.min(i, list.length - 1)], last = i >= list.length - 1, total = versesIn(list);
  const showAr = S.show.ar, showFr = S.show.fr || !S.show.ar;
  const next = suggestNextLevel(S, t);

  const finish = () => {
    if (!already) {
      const secs = Math.min(1800, Math.max(1, Math.round((Date.now() - began.current) / 1000)));
      update((s) => { s.coran = { ...(s.coran || {}), [dk]: { n: total, t: secs } }; });
      buzz([16, 40, 16]);
    }
    setEnded(true); window.scrollTo({ top: 0 });
  };
  const step = (n: number) => { setI(n); window.scrollTo({ top: 0 }); buzz(6); };

  if (ended) {
    const rec = S.coran?.[dk];
    return (
      <div className="qr qend">
        <span className="qok" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
        <h1>Al-hamdulillâh</h1>
        <p className="lead">{total} verset{total > 1 ? "s" : ""} lu{total > 1 ? "s" : ""}{rec?.t ? ` · ${minutes(rec.t)}` : ""}. Garde ce rappel avec toi aujourd’hui.</p>
        {next && isToday && (
          <div className="qup">
            <p><b>Sept jours de suite.</b> Tu peux passer à {next === 5 ? "environ 5 versets" : "environ 10 versets"} par jour, si tu le souhaites.</p>
            <div className="row">
              <button className="navbtn strong" onClick={() => { update((s) => { s.coranLevel = next; }); toast("C’est noté, dès demain"); router.push("/"); }}>Oui, augmenter</button>
              <button className="link" onClick={() => router.push("/")}>Rester ainsi</button>
            </div>
          </div>
        )}
        <button className="navbtn primary qgo" onClick={() => router.push("/")}>Revenir à ma journée</button>
      </div>
    );
  }

  return (
    <div className="qr">
      <div className="qtop">
        <h1>Rappel du Coran</h1>
        <span className="qcount">{isToday ? "" : `${fmtShort(d)} · `}{list.length > 1 ? `${i + 1} sur ${list.length}` : already ? "lu" : ""}</span>
      </div>
      {list.length > 1 && <div className="qdots" aria-hidden="true">{list.map((x, k) => <i key={x.ref} className={k < i ? "past" : k === i ? "on" : ""} />)}</div>}
      <article className="qcard" key={r.ref}>
        <span className={`qtag ${r.themed ? "th" : ""}`}>{r.tag}</span>
        {r.verses.map((v) => (
          <div className="qv" key={v.n}>
            {showAr && <p className="ar qar" lang="ar" dir="rtl">{v.ar}</p>}
            {showFr && <p className="qfr">{r.verses.length > 1 && <sup>{v.n}</sup>}{v.fr}</p>}
          </div>
        ))}
        <p className="qref">{refLabel(r)}</p>
      </article>
      <div className="qnav">
        {i > 0 && <button className="navbtn" onClick={() => step(i - 1)}>Précédent</button>}
        {last
          ? <button className="navbtn primary" onClick={finish}>{already ? "Terminer" : "J’ai lu"}</button>
          : <button className="navbtn primary" onClick={() => step(i + 1)}>Suivant</button>}
      </div>
      <p className="qsrc">{VERSETS_SOURCE.traduction}. {VERSETS_SOURCE.arabe}. {CORAN_LEVELS.find((l) => l.n === coranLevel(S))!.l} : <Link href="/rythme">changer</Link>.</p>
    </div>
  );
}

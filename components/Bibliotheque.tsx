"use client";
// La bibliothèque d’invocations : par thème, par chapitre, ou par recherche.
import { useMemo, useState } from "react";
import { ITEMS } from "@/content/programme";
import { MASTER } from "@/content/reglages";
import { keyOf, today } from "@/lib/dates";
import { CHAPITRES, SOURCE_BIBLIO, THEMES, TOTAL_BIBLIO, chercher, nbParTheme, type Chapitre } from "@/lib/bibliotheque";
import { DUA_IDS } from "@/lib/learn";
import { Glyph } from "./Glyphs";
import { ShowToggles } from "./ShowToggles";
import { buzz, useStore } from "./Store";

const ICONES: Record<string, string> = {
  programme: "book", "matin-soir": "dawn", sommeil: "moon", priere: "hand", quotidien: "feather", soucis: "heart", protection: "shield",
  pardon: "sparkle", malade: "leaf", nature: "cloud", "jeune-hajj": "path", voyage: "locate", relations: "people", louange: "sun",
};
type Fiche = { id: string; title?: string; ar?: string; ph?: string; fr?: string; src?: string; srcAr?: string };

/** Une invocation : l’arabe, la phonétique, la traduction, la source, et « Apprendre ». */
function Carte({ f, chap, open, onToggle, seule }: { f: Fiche; chap?: string; open: boolean; onToggle: () => void; seule?: boolean }) {
  const { S, update, toast } = useStore();
  const L = S.learn[f.id];
  const ajouter = () => { buzz(10); update((s) => { s.learn[f.id] = { lvl: 0, next: keyOf(today()) }; }); toast("Ajoutée à tes révisions"); };
  const resume = (f.fr || "").replace(/\s+/g, " ");
  return (
    <div className={`bcard ${open ? "open" : ""}`}>
      {!seule && <button className="bhead" aria-expanded={open} onClick={onToggle}>
        <span className="rt">{f.title && <b>{f.title}</b>}{chap && <small className="bchap">{chap}</small>}{!open && <small>{resume.length > 110 ? resume.slice(0, 110) + "…" : resume}</small>}</span>
        {L && <span className={`bstate ${L.lvl >= MASTER ? "ok" : ""}`}>{L.lvl >= MASTER ? "Sue" : "En révision"}</span>}
        <span className="chev" aria-hidden="true" />
      </button>}
      {(open || seule) && (
        <div className="bbody">
          {f.ar && S.show.ar !== false && <p className="ar" lang="ar" dir="rtl">{f.ar}</p>}
          {f.ph && S.show.ph !== false && <p className="ph">{f.ph}</p>}
          {f.fr && S.show.fr !== false && <p className="fr">{f.fr}</p>}
          <p className="bsrc">{f.src ? <>Source : {f.src}</> : f.srcAr ? <>Source (note du livre arabe) :<bdi className="bsrcar" lang="ar" dir="rtl">{f.srcAr}</bdi></> : null}</p>
          {L ? <p className="bin">Dans tes révisions{L.lvl >= MASTER ? " · sue par cœur" : ""}</p>
            : <button className="navbtn strong bapp" onClick={ajouter}>Apprendre par cœur</button>}
        </div>
      )}
    </div>
  );
}

function ChapitreBloc({ c, ouvert, setOuvert }: { c: Chapitre; ouvert: string | null; setOuvert: (id: string | null) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`bchapb ${open ? "open" : ""}`}>
      <button className="bchaph" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{c.title}</span><small>{c.duas.length}</small><span className="chev" aria-hidden="true" />
      </button>
      {open && <div className="bchapl">{c.duas.map((d, i) => (
        <Carte key={d.id} f={{ ...d, title: c.duas.length > 1 ? `Invocation ${i + 1}` : undefined }} open={ouvert === d.id} seule={c.duas.length === 1} onToggle={() => setOuvert(ouvert === d.id ? null : d.id)} />
      ))}</div>}
    </div>
  );
}

export function Bibliotheque() {
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const [ouvert, setOuvert] = useState<string | null>(null);
  const res = useMemo(() => (q.trim().length > 1 ? chercher(q) : null), [q]);
  const programme = DUA_IDS.map((id) => ({ id, ...ITEMS[id] }));
  const label = theme === "programme" ? "Du programme" : THEMES.find((t) => t.id === theme)?.label;
  return (
    <section className="sec biblio" id="bibliotheque">
      <div className="sechead"><h2>Bibliothèque</h2><span className="count">{TOTAL_BIBLIO + programme.length} invocations</span></div>
      <label className="bsearch">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher : voyage, colère, pluie…" aria-label="Chercher une invocation" enterKeyHint="search" />
      </label>
      <ShowToggles />
      {res ? (
        <div className="blist2">
          <p className="bcount">{res.length ? `${res.length}${res.length === 40 ? "+" : ""} résultat${res.length > 1 ? "s" : ""}` : "Aucun résultat. Essaie un autre mot."}</p>
          {res.map(({ c, d }) => <Carte key={d.id} f={{ ...d, title: c.title }} open={ouvert === d.id} onToggle={() => setOuvert(ouvert === d.id ? null : d.id)} />)}
        </div>
      ) : theme ? (
        <div className="btheme" key={theme}>
          <button className="bback" onClick={() => { setTheme(null); setOuvert(null); }}><span className="chev" aria-hidden="true" />Tous les thèmes</button>
          <h3 className="bth"><span className="btile"><Glyph name={ICONES[theme] || "book"} /></span>{label}</h3>
          {theme === "programme"
            ? programme.map((f) => <Carte key={f.id} f={f} open={ouvert === f.id} onToggle={() => setOuvert(ouvert === f.id ? null : f.id)} />)
            : CHAPITRES.filter((c) => c.theme === theme).map((c) => <ChapitreBloc key={c.n} c={c} ouvert={ouvert} setOuvert={setOuvert} />)}
        </div>
      ) : (
        <div className="bgrid">
          {[{ id: "programme", label: "Du programme", n: programme.length }, ...THEMES.map((t) => ({ ...t, n: nbParTheme(t.id) }))].map((t, i) => (
            <button key={t.id} className="bt" style={{ animationDelay: `${i * 30}ms` }} onClick={() => { setTheme(t.id); window.scrollTo({ top: (document.getElementById("bibliotheque")?.offsetTop || 0) - 70, behavior: "smooth" }); }}>
              <span className="btile"><Glyph name={ICONES[t.id] || "book"} /></span>
              <b>{t.label}</b><small>{t.n} invocation{t.n > 1 ? "s" : ""}</small>
            </button>
          ))}
        </div>
      )}
      <p className="bnote">Source : {SOURCE_BIBLIO}, avec la référence de chaque invocation. Traduction française de l’édition AR-FR libre de diffusion. Livre distribué gratuitement par son auteur.</p>
    </section>
  );
}

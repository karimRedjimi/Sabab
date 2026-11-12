"use client";
// La visite du premier jour : un projecteur passe d’un repère à l’autre de l’accueil, une phrase à chaque fois.
// On avance en touchant l’écran ; « Passer » arrête la visite.
import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import { buzz, useStore } from "./Store";

interface Etape { sel?: string; titre: string; texte: string; pad?: number; radius?: number }
const ETAPES: Etape[] = [
  { titre: "Bienvenue dans ta journée", texte: "Quelques repères, en trente secondes. Touche l’écran pour avancer." },
  { sel: ".hero2 .prow5", titre: "Tes prières", texte: "Touche une heure pour noter ta prière. Elle passe en or.", pad: 6, radius: 16 },
  { sel: ".need.obj2 .needhead", titre: "Ton objectif", texte: "Son étoile se remplit au fil des 40 jours.", pad: 8, radius: 18 },
  { sel: ".need.obj2 .go", titre: "Un seul bouton pour avancer", texte: "« Continuer » reprend ta journée là où tu t’es arrêté.", pad: 6, radius: 18 },
  { sel: ".tl", titre: "Ta journée", texte: "Du matin à la nuit. Une étoile s’allume à chaque moment accompli.", pad: 8, radius: 20 },
  { sel: '.tabs a[href="/communaute"]', titre: "Ensemble", texte: "Invoque pour les autres et récite le verset du jour.", pad: 4, radius: 20 },
  { titre: "C’est parti, bismillâh", texte: "Commence par « Continuer » : ta journée t’attend." },
];

export function Visite() {
  const { update } = useStore();
  const [steps, setSteps] = useState<Etape[]>([]);
  const [i, setI] = useState(0);
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // On ne garde que les repères présents sur cette page.
  useEffect(() => { setSteps(ETAPES.filter((e) => !e.sel || document.querySelector(e.sel))); }, []);
  const step = steps[i];

  const measure = useCallback(() => {
    if (!step?.sel) { setBox(null); return; }
    const el = document.querySelector(step.sel) as HTMLElement | null;
    if (!el) { setBox(null); return; }
    const r = el.getBoundingClientRect(), p = step.pad ?? 6;
    // Un repère très haut est coupé, pour laisser la place à la bulle en dessous.
    const h = Math.min(r.height + 2 * p, window.innerHeight - 330);
    setBox({ x: r.left - p, y: r.top - p, w: r.width + 2 * p, h });
  }, [step]);

  // Amener le repère à l’écran, puis poser le projecteur dessus.
  useLayoutEffect(() => {
    if (!step) return;
    const el = step.sel ? (document.querySelector(step.sel) as HTMLElement | null) : null;
    if (el && !el.closest(".tabs")) {
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      if (r.top < 70 || r.bottom > vh - 260) window.scrollTo({ top: Math.max(0, window.scrollY + r.top - Math.min(140, vh * 0.2)), behavior: "smooth" });
    }
    const t1 = setTimeout(measure, 40), t2 = setTimeout(measure, 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, measure]);
  useEffect(() => {
    window.addEventListener("resize", measure); window.addEventListener("scroll", measure, { passive: true });
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure); };
  }, [measure]);
  // Pendant la visite, la page ne défile pas sous le doigt.
  useEffect(() => { document.documentElement.classList.add("visiting"); return () => document.documentElement.classList.remove("visiting"); }, []);

  const end = () => { update((x) => { x.guide = "done"; }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const next = () => { buzz(8); if (i >= steps.length - 1) end(); else setI(i + 1); };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") end(); if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") { e.preventDefault(); next(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  if (!step) return null;

  // La bulle se place sous le repère s’il y a la place, sinon au-dessus ; au centre s’il n’y a pas de repère.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const below = box ? box.y + box.h + 16 : 0, above = box ? vh - box.y + 16 : 0;
  const place: CSSProperties = !box ? { top: "50%", transform: "translateY(-50%)" }
    : box.y + box.h < vh - 230 ? { top: below } : box.y > 230 ? { bottom: above } : { bottom: 104 };
  const last = i === steps.length - 1;

  return (
    <div className={`visite ${box ? "" : "free"}`} role="dialog" aria-modal="true" aria-label="Découvrir l’accueil" onClick={next}>
      <div className="vspot" style={box ? { left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: step.radius ?? 16 } : { left: "50%", top: "45%", width: 0, height: 0, borderRadius: 999 }} aria-hidden="true" />
      <div className="vbub" style={place} key={i} aria-live="polite">
        <div className="vdots" aria-hidden="true">{steps.map((_, k) => <i key={k} className={k < i ? "past" : k === i ? "on" : ""} />)}</div>
        <b>{step.titre}</b>
        <p>{step.texte}</p>
        <div className="vfoot2">
          <span className="vnext">{last ? "Toucher pour commencer" : "Toucher pour continuer"}</span>
          {!last && <button className="vskip" onClick={(e) => { e.stopPropagation(); end(); }}>Passer</button>}
        </div>
      </div>
    </div>
  );
}

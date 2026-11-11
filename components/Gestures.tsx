"use client";
// Transitions entre écrans (fondu) et retour en glissant depuis le bord gauche.
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

type VTDoc = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };
const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fondu enchaîné entre deux écrans : l’ancien s’efface pendant que le nouveau apparaît.
 * Utilise les transitions de vue du navigateur (Safari 18, Chrome) ; sinon, simple fondu d’arrivée.
 */
export function useViewTransitions(path: string) {
  const router = useRouter();
  const pending = useRef<(() => void) | null>(null);
  useEffect(() => { pending.current?.(); pending.current = null; }, [path]);

  const navigate = useCallback((go: () => void) => {
    const doc = document as VTDoc;
    if (!doc.startViewTransition || reduced()) { go(); return; }
    doc.documentElement.classList.add("vt");
    const t = doc.startViewTransition(() => new Promise<void>((res) => {
      pending.current = res;
      go();
      setTimeout(() => { if (pending.current === res) { pending.current = null; res(); } }, 500);
    }));
    t.finished.finally(() => doc.documentElement.classList.remove("vt"));
  }, []);

  // Tous les liens internes passent par le fondu.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      navigate(() => router.push(url.pathname + url.search));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate, router]);

  return navigate;
}

/** L’application est-elle ouverte depuis l’écran d’accueil (sans barre de navigateur) ? */
function standalone() {
  return matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Retour en glissant depuis le bord gauche de l’écran, comme sur iPhone.
 * Dans Safari, le navigateur le fait déjà : on ne l’active que pour l’application installée.
 */
export function useEdgeSwipeBack(target: React.RefObject<HTMLElement | null>, canBack: () => boolean, onBack: () => void) {
  const st = useRef<{ x: number; y: number; t: number; drag: boolean } | null>(null);
  const shade = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!standalone() && !new URLSearchParams(location.search).has("swipe")) return;
    const el = () => target.current;
    const setX = (x: number, w: number) => {
      const m = el(); if (!m) return;
      m.style.transform = x ? `translate3d(${x}px,0,0)` : "";
      if (shade.current) shade.current.style.opacity = String(Math.max(0, 0.08 * (1 - x / w)));
    };
    const start = (e: TouchEvent) => {
      const p = e.touches[0];
      if (e.touches.length !== 1 || p.clientX > 24 || !canBack()) { st.current = null; return; }
      st.current = { x: p.clientX, y: p.clientY, t: Date.now(), drag: false };
    };
    const move = (e: TouchEvent) => {
      const s = st.current; if (!s) return;
      const p = e.touches[0], dx = p.clientX - s.x, dy = p.clientY - s.y;
      if (!s.drag) {
        if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { st.current = null; return; }
        if (dx < 8) return;
        s.drag = true;
        el()?.classList.add("dragging");
        if (!shade.current) { shade.current = document.createElement("div"); shade.current.className = "edgeshade"; document.body.appendChild(shade.current); }
      }
      e.preventDefault();
      setX(Math.max(0, dx), window.innerWidth);
    };
    const end = (e: TouchEvent) => {
      const s = st.current; st.current = null; if (!s || !s.drag) return;
      const m = el(); if (!m) return;
      const w = window.innerWidth, dx = Math.max(0, e.changedTouches[0].clientX - s.x), v = dx / Math.max(1, Date.now() - s.t);
      m.classList.remove("dragging"); m.classList.add("settle");
      const done = () => { m.classList.remove("settle"); m.style.transform = ""; m.style.opacity = ""; shade.current?.remove(); shade.current = null; };
      if (dx > w * 0.33 || v > 0.6) {
        setX(w, w); m.style.opacity = "0.4";
        setTimeout(() => { onBack(); requestAnimationFrame(() => requestAnimationFrame(done)); }, 230);
      } else {
        setX(0, w);
        setTimeout(done, 260);
      }
    };
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end, { passive: true });
    window.addEventListener("touchcancel", end, { passive: true });
    return () => {
      window.removeEventListener("touchstart", start); window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end); window.removeEventListener("touchcancel", end);
    };
  }, [target, canBack, onBack]);
}

"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useStore } from "./Store";
import { needsOnboarding } from "@/lib/state";
import { supabase } from "@/lib/supabase";
import { today } from "@/lib/dates";
import { useEdgeSwipeBack, useViewTransitions } from "./Gestures";

const TAB_OF: Record<string, string> = {
  "/chemin": "/",
  "/combat": "/plus",
  "/bilan": "/suivi", "/rythme": "/plus", "/binome": "/plus", "/objectif": "/plus", "/parcours": "/plus",
  "/priere": "/plus", "/programme": "/plus", "/confidentialite": "/plus", "/donnees": "/plus", "/compte": "/plus", "/moderation": "/plus", ...(supabase ? {} : { "/communaute": "/plus" }),
};

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Jour", icon: <><rect x="5.6" y="5.6" width="12.8" height="12.8" /><rect x="5.6" y="5.6" width="12.8" height="12.8" transform="rotate(45 12 12)" /></> },
  { href: "/apprendre", label: "Apprendre", icon: <><path d="M4 5.5c2.8-1 5.5-1 8 .8 2.5-1.8 5.2-1.8 8-.8V19c-2.8-1-5.5-1-8 .8-2.5-1.8-5.2-1.8-8-.8z" /><path d="M12 6.3v13.5" /></> },
  ...(supabase ? [{ href: "/communaute", label: "Communauté", icon: <><circle cx="8" cy="9" r="3" /><circle cx="16.5" cy="9.5" r="2.5" /><path d="M2.8 19c.6-3 2.7-4.6 5.2-4.6s4.6 1.6 5.2 4.6M13.8 15.2c.8-.6 1.7-.9 2.7-.9 2.2 0 3.9 1.4 4.4 4.2" /></> }] : []),
  { href: "/carnet", label: "Carnet", icon: <><path d="M6 3.5h10.5A1.5 1.5 0 0 1 18 5v15.5H7.5A1.5 1.5 0 0 1 6 19z" /><path d="M6 17.5h12M9.5 8h5M9.5 11h5" /></> },
  { href: "/suivi", label: "Suivi", icon: <path d="M4 20V10M10 20V4M16 20v-7M21 20H3" /> },
  { href: "/plus", label: "Plus", icon: <><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { S, hydrated, ui, setUi, toastMsg, toastAction, dismissToast } = useStore();
  const path = usePathname() || "/";
  const router = useRouter();
  const onb = hydrated && needsOnboarding(S);
  const isWelcome = path === "/bienvenue";
  const redirect = hydrated && (onb ? !isWelcome : isWelcome && !ui.forceOb);
  const lecture = !!ui.lecture && path === "/";

  useEffect(() => {
    if (!redirect) return;
    router.replace(onb ? "/bienvenue" : "/");
  }, [redirect, onb, router]);

  // Nombre de pages visitées depuis l’ouverture : sert au bouton Retour.
  const navCount = useRef(-1);
  useEffect(() => { navCount.current++; window.scrollTo(0, 0); }, [path]);

  // Lecture guidée : le bouton retour du téléphone la ferme, et on retrouve sa place dans la page.
  const pushed = useRef(false), backY = useRef(0);
  useEffect(() => {
    if (lecture) {
      backY.current = ui.lecture?.scrollY || 0;
      if (window.location.hash !== "#lecture") { window.history.pushState(null, "", "#lecture"); pushed.current = true; }
    } else {
      if (pushed.current && window.location.hash === "#lecture") { pushed.current = false; window.history.back(); }
      else if (window.location.hash === "#lecture") window.history.replaceState(null, "", window.location.pathname);
      const y = backY.current; backY.current = 0;
      if (y) requestAnimationFrame(() => window.scrollTo(0, y));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecture]);
  useEffect(() => {
    const onPop = () => { if (window.location.hash !== "#lecture") { pushed.current = false; setUi((u) => (u.lecture ? { lecture: null } : {})); } };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setUi((u) => (u.lecture ? { lecture: null } : {})); };
    window.addEventListener("popstate", onPop); window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("popstate", onPop); window.removeEventListener("keydown", onKey); };
  }, [setUi]);

  const tab = TAB_OF[path] || path;
  const parent = TAB_OF[path];
  const navigate = useViewTransitions(path);
  const back = () => navigate(() => { if (navCount.current > 0) router.back(); else router.push(parent || "/"); });

  // Glisser depuis le bord gauche : ferme la lecture, ou revient à l’écran précédent.
  const mainRef = useRef<HTMLElement>(null);
  const live = useRef({ lecture, parent, path }); live.current = { lecture, parent, path };
  const canBack = useCallback(() => live.current.lecture || !!live.current.parent, []);
  const onEdgeBack = useCallback(() => {
    if (live.current.lecture) { setUi(() => ({ lecture: null })); return; }
    if (navCount.current > 0) router.back(); else router.push(live.current.parent || "/");
  }, [router, setUi]);
  useEdgeSwipeBack(mainRef, canBack, onEdgeBack);
  return (
    <>
      <main className="app" id="view" ref={mainRef}>
        {hydrated && !redirect ? (
          <div className="view" key={path}>
            {parent && (
              <div className="subbar">
                <button onClick={back}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>Retour</button>
              </div>
            )}
            {children}
          </div>
        ) : <div className="boot" aria-busy="true" />}
      </main>
      <div className="tabs" hidden={isWelcome || !hydrated || onb || lecture}>
        <nav aria-label="Navigation">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={tab === t.href ? "page" : undefined}
              onClick={(e) => {
                // Retoucher l’onglet déjà ouvert : retour en haut (et à aujourd’hui sur la page Jour).
                if (path !== t.href) return;
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                if (t.href === "/") setUi(() => ({ sel: today(), dir: 0 }));
              }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{t.icon}</svg>
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className={`toast${toastMsg ? " show" : ""}${toastAction ? " act" : ""}`} role="status">
        <span>{toastMsg}</span>
        {toastAction && <button onClick={() => { toastAction.run(); dismissToast(); }}>{toastAction.label}</button>}
      </div>
    </>
  );
}

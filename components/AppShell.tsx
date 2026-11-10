"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "./Store";
import { needsOnboarding } from "@/lib/state";
import { supabase } from "@/lib/supabase";

const TAB_OF: Record<string, string> = {
  "/chemin": "/",
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
  const { S, hydrated, ui, toastMsg } = useStore();
  const path = usePathname() || "/";
  const router = useRouter();
  const onb = hydrated && needsOnboarding(S);
  const isWelcome = path === "/bienvenue";
  const redirect = hydrated && (onb ? !isWelcome : isWelcome && !ui.forceOb);

  useEffect(() => {
    if (!redirect) return;
    router.replace(onb ? "/bienvenue" : "/");
  }, [redirect, onb, router]);

  useEffect(() => { window.scrollTo(0, 0); }, [path]);

  const tab = TAB_OF[path] || path;
  return (
    <>
      <main className="app" id="view">
        {hydrated && !redirect ? <div className="view" key={path}>{children}</div> : <div className="boot" aria-busy="true" />}
      </main>
      <div className="tabs" hidden={isWelcome || !hydrated || onb || (!!ui.lecture && path === "/")}>
        <nav aria-label="Navigation">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} aria-current={tab === t.href ? "page" : undefined}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{t.icon}</svg>
              <span>{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className={`toast${toastMsg ? " show" : ""}`} role="status">{toastMsg}</div>
    </>
  );
}

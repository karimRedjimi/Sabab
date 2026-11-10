"use client";
// État de l’application : données personnelles (enregistrées sur l’appareil)
// et état d’interface en mémoire (jour sélectionné, sections ouvertes…).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { merge, type State } from "@/lib/state";
import { keyOf, monday, today } from "@/lib/dates";
import type { Kind } from "@/lib/bilan";
import type { Entry } from "@/lib/program";
import { saveLocal, loadLocal } from "@/lib/storage";

export interface UI {
  sel: Date;
  weekRef: Date;
  bilan: { kind: Kind; ref: Date };
  forceOb: boolean;
  /** Détails « Pourquoi cette invocation » ouverts */
  openSet: Record<string, boolean>;
  /** Texte d’une carte affiché ou masqué, par invocation */
  textState: Record<string, boolean>;
  /** Sections de moment ouvertes ou fermées, par jour et moment */
  momentOpen: Record<string, boolean>;
  /** Lecture guidée en cours : la file des étapes et la position. */
  lecture: { queue: Entry[]; i: number; label: string; intention?: boolean } | null;
}

interface Ctx {
  S: State;
  hydrated: boolean;
  /** Modifie les données personnelles et les enregistre. */
  update: (fn: (S: State) => void) => void;
  /** Remplace toutes les données (synchronisation depuis le compte). */
  replace: (S: State) => void;
  ui: UI;
  setUi: (fn: (u: UI) => Partial<UI>) => void;
  toast: (msg: string) => void;
  toastMsg: string | null;
  /** Heure courante, rafraîchie chaque minute. */
  now: Date;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [S, setS] = useState<State>(() => merge({ onboarded: true }));
  const ref = useRef(S);
  const [hydrated, setHydrated] = useState(false);
  const [ui, setUiState] = useState<UI>(() => ({
    sel: today(), weekRef: monday(today()), bilan: { kind: "semaine", ref: monday(today()) },
    forceOb: false, openSet: {}, textState: {}, momentOpen: {}, lecture: null,
  }));
  const [now, setNow] = useState(() => new Date());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const s = merge(loadLocal());
    ref.current = s; setS(s); setHydrated(true);
  }, []);

  const update = useCallback((fn: (S: State) => void) => {
    const next = structuredClone(ref.current);
    fn(next);
    next.updated = Date.now();
    ref.current = next;
    setS(next);
    saveLocal(next);
  }, []);

  const replace = useCallback((next: State) => { ref.current = next; setS(next); saveLocal(next); }, []);

  const setUi = useCallback((fn: (u: UI) => Partial<UI>) => setUiState((u) => ({ ...u, ...fn(u) })), []);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2200);
  }, []);

  // Changement de jour et rafraîchissement des horaires, chaque minute.
  useEffect(() => {
    let last = keyOf(today());
    const t = setInterval(() => {
      const k = keyOf(today());
      if (k !== last) { setUiState((u) => (keyOf(u.sel) === last ? { ...u, sel: today() } : u)); last = k; }
      setNow(new Date());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  // Synchronisation entre onglets ouverts sur le même appareil.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.newValue && e.key === "rizq-tracker-v1") {
        try { const s = merge(JSON.parse(e.newValue)); ref.current = s; setS(s); } catch { /* ignoré */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({ S, hydrated, update, replace, ui, setUi, toast, toastMsg, now }), [S, hydrated, update, replace, ui, setUi, toast, toastMsg, now]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore hors de StoreProvider");
  return c;
}

export function buzz(p: number | number[]) {
  try { navigator.vibrate?.(p); } catch { /* non pris en charge */ }
}

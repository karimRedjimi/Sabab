"use client";
// Compte et synchronisation : la progression suit la personne sur tous ses appareils.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, CONSENT_VERSION } from "@/lib/supabase";
import { combine, merge } from "@/lib/state";

const LINK_KEY = "rizq-linked-account";
import { useStore } from "./Store";

type Status = "off" | "loading" | "out" | "consent" | "in";
interface Acc {
  status: Status;
  email: string | null;
  sync: "idle" | "syncing" | "ok" | "error";
  moderator: boolean;
  giveConsent: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}
const AccCtx = createContext<Acc | null>(null);
export const useAccount = () => useContext(AccCtx)!;

export function AccountProvider({ children }: { children: ReactNode }) {
  const { S, hydrated, replace } = useStore();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>(supabase ? "loading" : "off");
  const [sync, setSync] = useState<Acc["sync"]>("idle");
  const [moderator, setModerator] = useState(false);
  const ready = useRef(false);
  const lastPushed = useRef(0);
  const sRef = useRef(S); sRef.current = S;

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setStatus("out"); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (!s) { setStatus("out"); ready.current = false; } });
    return () => data.subscription.unsubscribe();
  }, []);

  // Après connexion : consentement, puis récupération des données.
  const pull = useCallback(async (uid: string) => {
    if (!supabase) return;
    setSync("syncing");
    const { data, error } = await supabase.from("trackers").select("data, updated_at").eq("user_id", uid).maybeSingle();
    if (error) { setSync("error"); return; }
    const local = sRef.current;
    // Cet appareil a-t-il déjà été synchronisé avec ce compte ?
    let linked = false; try { linked = localStorage.getItem(LINK_KEY) === uid; } catch { /* stockage indisponible */ }
    if (data && !linked) {
      const both = combine(data.data, local);
      replace(both);
      const { error: e3 } = await supabase.from("trackers").upsert({ user_id: uid, data: both, updated_at: both.updated });
      if (e3) { setSync("error"); return; }
      lastPushed.current = both.updated;
    } else if (data && data.updated_at > (local.updated || 0)) { replace(merge(data.data)); lastPushed.current = data.updated_at; }
    else {
      const { error: e2 } = await supabase.from("trackers").upsert({ user_id: uid, data: local, updated_at: local.updated || Date.now() });
      if (e2) { setSync("error"); return; }
      lastPushed.current = local.updated;
    }
    try { localStorage.setItem(LINK_KEY, uid); } catch { /* stockage indisponible */ }
    ready.current = true; setSync("ok");
    const { data: mod } = await supabase.rpc("is_moderator"); setModerator(!!mod);
  }, [replace]);

  useEffect(() => {
    if (!supabase || !session || !hydrated) return;
    (async () => {
      const { data } = await supabase.from("profiles").select("id").eq("id", session.user.id).maybeSingle();
      if (!data) { setStatus("consent"); return; }
      setStatus("in"); await pull(session.user.id);
    })();
  }, [session, hydrated, pull]);

  // Envoi des modifications, regroupées.
  useEffect(() => {
    if (!supabase || status !== "in" || !ready.current || !session) return;
    if ((S.updated || 0) <= lastPushed.current) return;
    const t = setTimeout(async () => {
      setSync("syncing");
      const cur = sRef.current;
      const { error } = await supabase!.from("trackers").upsert({ user_id: session.user.id, data: cur, updated_at: cur.updated });
      if (error) setSync("error"); else { lastPushed.current = cur.updated; setSync("ok"); }
    }, 900);
    return () => clearTimeout(t);
  }, [S, status, session]);

  const giveConsent = useCallback(async () => {
    if (!supabase || !session) return;
    const { error } = await supabase.from("profiles").insert({ id: session.user.id, consent_at: new Date().toISOString(), consent_version: CONSENT_VERSION });
    if (error) throw error;
    setStatus("in"); await pull(session.user.id);
  }, [session, pull]);

  const signOut = useCallback(async () => { await supabase?.auth.signOut(); setModerator(false); try { localStorage.removeItem(LINK_KEY); } catch { /* */ } }, []);
  const deleteAccount = useCallback(async () => {
    if (!supabase) return;
    // Les enregistrements audio partent avec le compte.
    try { const { data } = await supabase.rpc("my_recitation_paths"); if (Array.isArray(data) && data.length) await supabase.storage.from("recitations").remove(data as string[]); } catch { /* base sans récitations */ }
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    await supabase.auth.signOut(); setModerator(false); try { localStorage.removeItem(LINK_KEY); } catch { /* */ }
  }, []);

  return (
    <AccCtx.Provider value={{ status, email: session?.user.email ?? null, sync, moderator, giveConsent, signOut, deleteAccount }}>
      {children}
    </AccCtx.Provider>
  );
}

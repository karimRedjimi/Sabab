// Connexion à Supabase. Sans configuration, l’application reste entièrement locale.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit", storageKey: "rizq-auth" } })
  : null;

/** Version du texte de consentement : à changer si le texte change. */
export const CONSENT_VERSION = "2026-11-v1";

export interface RequestView {
  id: string; cat: string; text: string; pseudo: string; status: "pending" | "approved" | "rejected";
  answered: boolean; prayers: number; created_at: string; mine: boolean; prayed: boolean;
}

/** Correspondance entre le domaine de l’objectif et la catégorie des demandes. */
export const REQ_CAT_OF: Record<string, string> = { emploi: "emploi", activite: "activite", dette: "dette", mariage: "mariage", etudes: "etudes", epreuve: "epreuve", autre: "autre" };

/** Message d’erreur lisible à partir d’une erreur Supabase. */
export function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message || "";
  if (/limite atteinte/.test(m)) return "Tu as déjà publié trois demandes aujourd’hui";
  if (/consentement/.test(m)) return "Il faut d’abord accepter les conditions de ton compte";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "Pas de connexion pour le moment";
  return "Une erreur est survenue, réessaie";
}

// Connexion à Supabase. Sans configuration, l’application reste entièrement locale.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && key
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit", storageKey: "rizq-auth" } })
  : null;

/** La connexion avec Google est-elle activée sur le projet Supabase ? (On ne montre le bouton que si oui.) */
export async function googleEnabled(): Promise<boolean> {
  if (!url || !key) return false;
  try {
    const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    if (!r.ok) return false;
    const j = (await r.json()) as { external?: { google?: boolean } };
    return !!j.external?.google;
  } catch { return false; }
}

/** Version du texte de consentement : à changer si le texte change. */
export const CONSENT_VERSION = "2026-11-v1";

export interface RequestView {
  id: string; cat: string; text: string; pseudo: string; status: "pending" | "approved" | "rejected";
  answered: boolean; prayers: number; created_at: string; mine: boolean; prayed: boolean;
}

export interface RecitationView {
  id: string; day: string; ref: string; path: string; seconds: number; status: "pending" | "approved" | "rejected";
  created_at: string; mine: boolean; cheered: boolean; cheers: number | null;
}

/** Correspondance entre le domaine de l’objectif et la catégorie des demandes. */
export const REQ_CAT_OF: Record<string, string> = { emploi: "emploi", activite: "activite", dette: "dette", mariage: "mariage", etudes: "etudes", epreuve: "epreuve", autre: "autre" };

/** Message d’erreur lisible à partir d’une erreur Supabase. */
export function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message || "";
  if (/limite atteinte/.test(m)) return "Tu as déjà publié trois demandes aujourd’hui";
  if (/une récitation par jour/.test(m)) return "Tu as déjà partagé ta récitation aujourd’hui";
  if (/accord pour la voix/.test(m)) return "Il faut d’abord donner ton accord pour partager ta voix";
  if (/refusé : vulgarité/.test(m)) return "Ce message contient des mots qui ne peuvent pas être publiés";
  if (/refusé : contact/.test(m)) return "Pas de lien, de numéro ni de réseau social dans ton souhait";
  if (/trop courte/.test(m)) return "Ta récitation est trop courte";
  if (/consentement/.test(m)) return "Il faut d’abord accepter les conditions de ton compte";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "Pas de connexion pour le moment";
  return "Une erreur est survenue, réessaie";
}

/** Marque que la page du compte est ouverte à la fin de la configuration du début. */
export const DEBUT_KEY = "sabab-debut";

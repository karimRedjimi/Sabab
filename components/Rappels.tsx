"use client";
// Synchronise les rappels : à chaque ouverture et à chaque changement utile, le téléphone recalcule
// les rappels des 7 prochains jours et remplace la liste côté serveur.
import { useEffect, useRef, useState } from "react";
import { keyOf, today } from "@/lib/dates";
import { compterIgnores, espaces, planifier, prefs, type Rappel, type Suivi } from "@/lib/notifs";
import { abonnement } from "@/lib/push";
import { supabase } from "@/lib/supabase";
import { useAccount } from "./Account";
import { useStore } from "./Store";

const K_ENVOYES = "sabab-notif-envoyes", K_OUVERTS = "sabab-notif-ouverts", K_SUIVI = "sabab-notif-suivi";
const lire = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; } };
const ecrire = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* stockage indisponible */ } };
export const suiviRappels = () => lire<Suivi>(K_SUIVI, { vus: [], ignores: {} });
export const remettreRappel = (kind: string) => { const s = suiviRappels(); delete (s.ignores as Record<string, number>)[kind]; ecrire(K_SUIVI, s); };

export function RappelsSync() {
  const { S } = useStore();
  const acc = useAccount();
  const ouvert = useRef(new Date());
  const inscrit = useRef("");
  const [tick, setTick] = useState(0);

  // Ouverte depuis un rappel : on le note (il n’a pas été ignoré), puis on nettoie l’adresse.
  useEffect(() => {
    const u = new URL(window.location.href), id = u.searchParams.get("i");
    if (!id) return;
    ecrire(K_OUVERTS, [...lire<string[]>(K_OUVERTS, []), id].slice(-100));
    u.searchParams.delete("n"); u.searchParams.delete("i");
    window.history.replaceState(window.history.state, "", u.pathname + u.search);
  }, []);
  useEffect(() => {
    const f = () => { if (document.visibilityState === "visible") { ouvert.current = new Date(); setTick((t) => t + 1); } };
    document.addEventListener("visibilitychange", f);
    return () => document.removeEventListener("visibilitychange", f);
  }, []);

  const dk = keyOf(today());
  const cle = JSON.stringify([S.notifs, S.prayer, S.days[dk], S.salat?.[dk], S.learn, S.prophete, S.objective?.cat, tick]);
  useEffect(() => {
    if (acc.status !== "in" || !supabase) return;
    const t = setTimeout(async () => {
      const p = prefs(S);
      const sub = await abonnement(p.on);
      if (!sub) return;
      const j = sub.toJSON();
      if (!j.endpoint || !j.keys) return;
      if (inscrit.current !== j.endpoint) {
        const { error } = await supabase!.rpc("push_subscribe", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth });
        if (error) return;
        inscrit.current = j.endpoint;
      }
      const now = new Date();
      const suivi = compterIgnores(suiviRappels(), lire<Rappel[]>(K_ENVOYES, []), new Set(lire<string[]>(K_OUVERTS, [])), now);
      ecrire(K_SUIVI, suivi);
      const items = p.on ? planifier(S, now, { ouvert: ouvert.current, espaces: espaces(suivi) }) : [];
      const { error } = await supabase!.rpc("push_schedule", { p_endpoint: j.endpoint, p_items: items });
      if (!error) ecrire(K_ENVOYES, items);
    }, 1500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cle, acc.status]);
  return null;
}

// Les rappels : le téléphone calcule lui-même ce qu’il faut envoyer dans les 7 prochains jours,
// puis envoie seulement cette liste d’heures au serveur. Ta position ne quitte jamais l’appareil.
import { HELD } from "@/content/reglages";
import { addDays, keyOf } from "./dates";
import { planDuJour } from "./journee";
import { dayPct, entryPct, type Entry } from "./program";
import { prayerTimes, type Times } from "./prayer";
import { SALAT, SALAT_LABEL, salatOf, type SalatKey } from "./salat";
import type { State } from "./state";

export type NotifKind = "priere" | "matin" | "soir" | "relance" | "verset" | "vendredi" | "nuit";
export interface NotifPrefs {
  on: boolean;
  prieres: Record<SalatKey, boolean>;
  avant: 5 | 10 | 15 | 30;
  matin: boolean; soir: boolean; relance: boolean; verset: boolean; vendredi: boolean; nuit: boolean;
  /** Écran verrouillé : « Sabab · un moment t’attend », sans rien de religieux. */
  discret: boolean;
}
export const NOTIFS_DEFAUT: NotifPrefs = {
  on: false,
  prieres: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  avant: 10,
  matin: true, soir: true, relance: true, verset: false, vendredi: true, nuit: false,
  discret: false,
};
export const prefs = (S: State): NotifPrefs => ({ ...NOTIFS_DEFAUT, ...(S.notifs || {}), prieres: { ...NOTIFS_DEFAUT.prieres, ...(S.notifs?.prieres || {}) } });

export interface Rappel { id: string; at: string; kind: NotifKind; title: string; body: string; url: string; tag: string }

/** Plus de 3 rappels par jour en dehors des prières ? Jamais. Dans cet ordre de priorité. */
export const MAX_PAR_JOUR = 3;
const PRIORITE: NotifKind[] = ["soir", "matin", "vendredi", "relance", "verset", "nuit"];
/** Deux rappels à moins de 30 minutes n’en font qu’un. */
const ECART_MIN = 30;
/** Plage calme : de 22 h à 30 minutes avant le Fajr (sauf la prière du Fajr et la prière de nuit). */
const CALME_DEBUT = 22;
/** Ignoré 5 fois de suite : le rappel ne vient plus qu’un jour sur deux. */
export const IGNORES_AVANT_ESPACER = 5;

const pick = <T,>(l: T[], n: number) => l[((n % l.length) + l.length) % l.length];
const dayNum = (d: Date) => Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const at = (d: Date, h: number) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return new Date(x.getTime() + Math.round(h * 60) * 60000); };

const TEXTES: Record<Exclude<NotifKind, "priere">, [string, string][]> = {
  matin: [["Le matin est là", "Tes invocations du matin t’attendent, quelques minutes suffisent."], ["Bismillâh pour ta journée", "Commence par tes invocations du matin."], ["Un matin béni", "Prends un instant pour tes invocations du matin."]],
  soir: [["Le soir est là", "Tes invocations du soir t’attendent."], ["Avant le Maghreb", "C’est le moment de tes invocations du soir."], ["Un instant pour le soir", "Quelques minutes pour tes invocations du soir."]],
  relance: [["Ta journée t’attend encore", "Il reste un peu de temps pour la tenir, sans pression."], ["Un dernier pas aujourd’hui ?", "Même un petit moment compte auprès d’Allah."], ["Avant de dormir", "Ce qui reste de ta journée t’attend, si tu le peux."]],
  verset: [["Le verset du jour", "Récite-le à voix haute, et partage ta voix si tu le souhaites."], ["Un jour, un verset", "Le verset du jour t’attend dans Communauté."]],
  vendredi: [["La dernière heure du vendredi", "Un moment où l’invocation est exaucée : pense à ton besoin."], ["Vendredi, avant le Maghreb", "Profite de la dernière heure pour invoquer."]],
  nuit: [["Le dernier tiers de la nuit", "Allah descend au ciel le plus proche : c’est le moment de prier et d’invoquer."], ["La nuit est à toi", "Une prière, une invocation, dans le calme du dernier tiers."]],
};

function invocationsFaites(S: State, d: Date, m: "matin" | "soir") {
  const l: Entry[] = planDuJour(S, d).sections[m].filter((e) => !e.opt);
  return l.length > 0 && l.every((e) => entryPct(S, keyOf(d), e) >= 1);
}

export interface Contexte {
  /** Moment de l’ouverture de l’application (pour ne pas relancer dans l’heure). */
  ouvert?: Date;
  /** Types de rappels espacés (ignorés trop souvent) : un jour sur deux. */
  espaces?: Set<NotifKind>;
}

/** Les rappels des `jours` prochains jours, à partir de `now`. */
export function planifier(S: State, now: Date, ctx: Contexte = {}, jours = 7): Rappel[] {
  const P = prefs(S);
  if (!P.on || !S.prayer) return [];
  const out: Rappel[] = [];
  const titre = (t: string) => (P.discret ? "Sabab" : t), corps = (b: string) => (P.discret ? "Un moment t’attend." : b);
  for (let j = 0; j < jours; j++) {
    const d = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), j), dk = keyOf(d), n = dayNum(d);
    const pt = prayerTimes(d, S.prayer) as Times | null, tom = prayerTimes(addDays(d, 1), S.prayer) as Times | null;
    if (!pt || !tom) continue;
    const today = j === 0;
    const day: { kind: NotifKind; t: Date; title: string; body: string; key?: SalatKey }[] = [];
    // Les prières (non comptées dans la limite)
    for (const k of SALAT) {
      if (!P.prieres[k]) continue;
      if (today && salatOf(S, dk, k)) continue;
      const nom = SALAT_LABEL[k];
      day.push({ kind: "priere", key: k, t: at(d, pt[k] - P.avant / 60), title: titre(`${nom} dans ${P.avant} min`), body: corps(pick([`Prépare-toi pour la prière du ${nom}.`, `La prière du ${nom} approche.`, `Bientôt l’appel du ${nom}.`], n + SALAT.indexOf(k))) });
    }
    const autres: { kind: Exclude<NotifKind, "priere">; t: Date; extra?: string }[] = [];
    if (P.matin && !(today && invocationsFaites(S, d, "matin"))) {
      const h = Math.min(Math.max(pt.fajr + 1, 7.5), pt.dhuhr - 0.5);
      const due = Object.values(S.learn || {}).filter((l) => l.next <= dk).length;
      autres.push({ kind: "matin", t: at(d, h), extra: due ? ` Et ${due} invocation${due > 1 ? "s" : ""} à réviser.` : "" });
    }
    if (P.soir && !(today && invocationsFaites(S, d, "soir"))) autres.push({ kind: "soir", t: at(d, pt.asr + 0.5) });
    if (P.relance && !(today && dayPct(S, d) >= HELD)) autres.push({ kind: "relance", t: at(d, Math.max(Math.min(pt.isha + 0.75, 21.5), pt.asr + 1.5)) });
    if (P.verset) autres.push({ kind: "verset", t: at(d, pt.dhuhr + 0.5) });
    if (P.vendredi && d.getDay() === 5) autres.push({ kind: "vendredi", t: at(d, pt.maghrib - 1) });
    if (P.nuit) autres.push({ kind: "nuit", t: at(d, pt.maghrib + (2 * (tom.fajr + 24 - pt.maghrib)) / 3) });

    const choisis = autres
      .filter((a) => !(ctx.espaces?.has(a.kind) && n % 2 === 1))
      .filter((a) => {
        const h = a.t.getHours() + a.t.getMinutes() / 60;
        if (a.kind === "nuit") return true;
        return h < CALME_DEBUT && a.t.getTime() >= at(d, pt.fajr - 0.5).getTime();
      })
      .sort((a, b) => PRIORITE.indexOf(a.kind) - PRIORITE.indexOf(b.kind));
    const gardes: typeof choisis = [];
    for (const a of choisis) {
      if (gardes.length >= MAX_PAR_JOUR) break;
      const proche = [...gardes.map((g) => g.t), ...day.map((p) => p.t)].some((t) => Math.abs(t.getTime() - a.t.getTime()) < ECART_MIN * 60000);
      if (!proche) gardes.push(a);
    }
    for (const a of gardes) {
      const [t, b] = pick(TEXTES[a.kind], n);
      day.push({ kind: a.kind, t: a.t, title: titre(t), body: corps(b + (a.extra || "")) });
    }
    for (const r of day) {
      if (r.t.getTime() <= now.getTime()) continue;
      // Ouverte dans l’heure : pas de rappel en dehors des prières.
      if (ctx.ouvert && r.kind !== "priere" && r.t.getTime() - ctx.ouvert.getTime() < 3600000) continue;
      const id = `${dk}-${r.key || r.kind}`;
      out.push({ id, at: r.t.toISOString(), kind: r.kind, title: r.title, body: r.body, url: r.kind === "verset" ? `/communaute?n=${r.kind}&i=${id}` : `/?n=${r.kind}&i=${id}`, tag: r.key || r.kind });
    }
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

/** Suivi des rappels ignorés : on compte, par type, ceux qui sont passés sans être ouverts. */
export interface Suivi { vus: string[]; ignores: Partial<Record<NotifKind, number>> }
export function compterIgnores(suivi: Suivi, envoyes: Rappel[], ouverts: Set<string>, now: Date): Suivi {
  const vus = new Set(suivi.vus), ignores = { ...suivi.ignores };
  for (const r of envoyes) {
    if (vus.has(r.id) || new Date(r.at).getTime() > now.getTime() || r.kind === "priere") continue;
    vus.add(r.id);
    ignores[r.kind] = ouverts.has(r.id) ? 0 : (ignores[r.kind] || 0) + 1;
  }
  return { vus: [...vus].slice(-200), ignores };
}
export const espaces = (s: Suivi) => new Set((Object.keys(s.ignores) as NotifKind[]).filter((k) => (s.ignores[k] || 0) >= IGNORES_AVANT_ESPACER));

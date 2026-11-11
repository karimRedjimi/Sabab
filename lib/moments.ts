// Les moments favorables à l’invocation, calés sur les horaires de prière de la personne.
import { ITEMS } from "@/content/programme";
import { MOMENTS_FAVORABLES } from "@/content/textes";
import { addDays } from "./dates";
import { prayerTimes, hm } from "./prayer";
import type { State } from "./state";

export interface Favorable { key: string; label: string; when: string; now: boolean; source: string; start: number; /** L’heure en quelques mots, pour la ligne repliée. */ short: string }

const PRAYERS: [string, keyof ReturnType<typeof times>][] = [["Fajr", "fajr"], ["Dhuhr", "dhuhr"], ["ʿAsr", "asr"], ["Maghreb", "maghrib"], ["ʿIchâ", "isha"]];
function times(d: Date, S: State) { return prayerTimes(d, S.prayer)!; }
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Les prochains moments favorables, du plus proche au plus lointain (heures relatives à aujourd’hui). */
export function favorableMoments(S: State, now = new Date()): Favorable[] {
  if (!S.prayer) return [];
  const d = new Date(now); d.setHours(0, 0, 0, 0);
  const pt = times(d, S), tom = times(addDays(d, 1), S), yes = times(addDays(d, -1), S);
  const h = now.getHours() + now.getMinutes() / 60;
  const out: Favorable[] = [];
  const N = MOMENTS_FAVORABLES;

  // Dernier tiers de la nuit : la nuit en cours (avant le Fajr) ou la prochaine.
  const lastNight = { start: yes.maghrib - 24 + (2 * (pt.fajr + 24 - yes.maghrib)) / 3, end: pt.fajr };
  const tonight = { start: pt.maghrib + (2 * (tom.fajr + 24 - pt.maghrib)) / 3, end: tom.fajr + 24 };
  const night = h < lastNight.end ? lastNight : tonight;
  const nightNow = h >= night.start && h < night.end;
  out.push({ key: "nuit", label: N.nuit.label, source: N.nuit.source, start: night.start, now: nightNow,
    short: nightNow ? `jusqu’au Fajr, ${hm(night.end)}` : `cette nuit dès ${hm(night.start)}`,
    when: nightNow ? `Maintenant, jusqu’au Fajr (${hm(night.end)})` : `Cette nuit, de ${hm(night.start)} au Fajr (${hm(night.end)})` });

  // Le prochain appel à la prière.
  const next = PRAYERS.map(([n, k]) => [n, pt[k]] as const).find(([, t]) => t > h) || (["Fajr", tom.fajr + 24] as const);
  out.push({ key: "appel", label: cap(N.appel.label), source: N.appel.source, start: next[1], now: false,
    short: `à l’appel, ${hm(next[1])}`,
    when: `Au prochain appel, ${next[0]} à ${hm(next[1])}` });

  // La dernière heure du vendredi.
  if (d.getDay() === 5 && h < pt.maghrib) {
    const it = ITEMS.heure, isNow = h >= pt.maghrib - 1;
    out.push({ key: "vendredi", label: "La dernière heure du vendredi", source: it.src || "", start: pt.maghrib - 1, now: isNow,
      short: isNow ? `jusqu’au Maghreb, ${hm(pt.maghrib)}` : `de ${hm(pt.maghrib - 1)} à ${hm(pt.maghrib)}`,
      when: isNow ? `Maintenant, jusqu’au Maghreb (${hm(pt.maghrib)})` : `Aujourd’hui, de ${hm(pt.maghrib - 1)} à ${hm(pt.maghrib)}` });
  }
  out.sort((a, b) => (b.now ? 1 : 0) - (a.now ? 1 : 0) || a.start - b.start);
  return out;
}
export const sujud = () => ({ label: cap(MOMENTS_FAVORABLES.sujud.label), source: MOMENTS_FAVORABLES.sujud.source });

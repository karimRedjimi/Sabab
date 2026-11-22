// Fabrique l’état de l’utilisateur de démo à partir de la logique de l’appli : 5 semaines d’usage, la plupart des jours tenus.
//   cd <appli> && npx tsx <pubs>/captures/demo.ts > /tmp/demo.json
import { countable, slotsOf } from "@/lib/program";
import { planDuJour } from "@/lib/journee";
const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const T0 = new Date(); T0.setHours(12, 0, 0, 0);
const jour = (n: number) => { const d = new Date(T0); d.setDate(d.getDate() + n); return d; };
const debut = key(jour(-36));
const S: any = { onboarded: true, guide: "done", start: debut, rampDone: key(jour(-35)), prophete: { lvl: 2, since: debut },
  prayer: { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" }, objective: { title: "Rembourser ma dette", cat: "dette", why: "Être libéré", since: debut },
  parcours: { id: "dettes", start: debut }, show: { ar: true, ph: true, fr: true }, days: {}, salat: {}, coran: {}, gratitude: {}, cycles: {} };
const G = ["Ma mère", "La santé", "Un nouveau client", "La pluie", "Mon frère", "Une prière à l’heure", "Le Coran", "Un ami fidèle", "Mes enfants", "La paix du cœur", "Un bon repas", "Ma femme"];
for (let i = 36; i >= 1; i--) {
  const d = jour(-i), dk = key(d), r = (i * 7919) % 10;
  const c: Record<string, number> = {};
  // 8 jours sur 10 complets, les autres à moitié : une régularité crédible.
  const ids = countable(S, d);
  ids.forEach((id, j) => { if (r > 1 || j % 2 === 0) slotsOf(id).forEach((s, k) => { c[`${id}:${k}`] = s.t; }); });
  // Tous les moments de la journée (y compris le Coran du matin et du soir) les jours complets.
  if (r > 1) Object.values(planDuJour(S, d).sections).flat().forEach((e: any) => { if (!e.opt) e.sl.forEach((k: number) => { c[`${e.id}:${k}`] = slotsOf(e.id)[k]?.t ?? 1; }); });
  S.days[dk] = { c, note: "" };
  S.salat[dk] = { fajr: r > 2 ? { s: "on", t: 405 } : { s: "qada" }, dhuhr: { s: "on", m: r > 6, t: 765 }, asr: { s: "on", t: 905 }, maghrib: { s: "on", m: r > 4, t: 1010 }, isha: { s: "on", t: 1125 } };
  if (r > 2) S.coran[dk] = { n: 4 + r, t: 140 + r * 20 };
  if (i % 3 === 0 && G[i / 3]) S.gratitude[dk] = G[i / 3];
}
// Aujourd’hui : le matin fait, le reste à venir.
const t = jour(0), tk = key(t), c: Record<string, number> = {};
countable(S, t).slice(0, 4).forEach((id) => slotsOf(id).forEach((s, k) => { c[`${id}:${k}`] = s.t; }));
S.days[tk] = { c, note: "", demain: "Prier le Fajr à l’heure" };
S.salat[tk] = { fajr: { s: "on", t: 402 }, dhuhr: { s: "on", m: true, t: 760 } };
S.lastIntention = tk; S.updated = Date.now();
process.stdout.write(JSON.stringify(S));

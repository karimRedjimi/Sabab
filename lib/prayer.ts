// Horaires de prière calculés sur l’appareil (algorithme astronomique du prototype).
import { METHODS } from "@/content/reglages";
import { keyOf, pad } from "./dates";
import type { Prayer } from "./state";

export interface Times { fajr: number; sunrise: number; dhuhr: number; asr: number; sunset: number; isha: number; maghrib: number }

const rad = (d: number) => (d * Math.PI) / 180, deg = (r: number) => (r * 180) / Math.PI;
const dsin = (d: number) => Math.sin(rad(d)), dcos = (d: number) => Math.cos(rad(d)), dtan = (d: number) => Math.tan(rad(d));
const darcsin = (x: number) => deg(Math.asin(x)), darccos = (x: number) => deg(Math.acos(x));
const darctan2 = (y: number, x: number) => deg(Math.atan2(y, x)), darccot = (x: number) => deg(Math.atan(1 / x));
const fix = (a: number, b: number) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

function julian(y: number, m: number, d: number) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function sunPos(jd: number) {
  const D = jd - 2451545, g = fix(357.529 + 0.98560028 * D, 360), q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * dsin(g) + 0.02 * dsin(2 * g), 360), e = 23.439 - 0.00000036 * D;
  const RA = darctan2(dcos(e) * dsin(L), dcos(L)) / 15;
  return { decl: darcsin(dsin(e) * dsin(L)), eqt: q / 15 - fix(RA, 24) };
}

const cache = new Map<string, Times>();
export function prayerTimes(date: Date, P: Prayer | null): Times | null {
  if (!P) return null;
  const ck = keyOf(date) + P.lat + P.lng + P.method;
  const hit = cache.get(ck); if (hit) return hit;
  const m = METHODS[P.method] || METHODS.uoif, lat = P.lat, lng = P.lng;
  const jd = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lng / (15 * 24);
  const tz = -new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTimezoneOffset() / 60;
  const mid = (t: number) => fix(12 - sunPos(jd + t).eqt, 24);
  const angT = (a: number, t: number, ccw: boolean) => {
    const { decl } = sunPos(jd + t);
    const x = (-dsin(a) - dsin(decl) * dsin(lat)) / (dcos(decl) * dcos(lat));
    if (x < -1 || x > 1) return NaN;
    const T = darccos(x) / 15; return mid(t) + (ccw ? -T : T);
  };
  const asrT = (f: number, t: number) => { const { decl } = sunPos(jd + t); return angT(-darccot(f + dtan(Math.abs(lat - decl))), t, false); };
  const t: Record<string, number> = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 };
  for (let i = 0; i < 2; i++) {
    const n: Record<string, number> = {
      fajr: angT(m.f, t.fajr / 24, true), sunrise: angT(0.833, t.sunrise / 24, true), dhuhr: mid(t.dhuhr / 24),
      asr: asrT(1, t.asr / 24), sunset: angT(0.833, t.sunset / 24, false), isha: angT(m.i, t.isha / 24, false),
    };
    for (const k in n) if (!isNaN(n[k])) t[k] = n[k]; else if (i === 1) t[k] = NaN;
  }
  const night = 24 - (t.sunset - t.sunrise);
  const pf = (m.f / 60) * night, pi = (m.i / 60) * night;
  if (isNaN(t.fajr) || t.sunrise - t.fajr > pf) t.fajr = t.sunrise - pf;
  if (isNaN(t.isha) || t.isha - t.sunset > pi) t.isha = t.sunset + pi;
  const adj = tz - lng / 15;
  const out: Record<string, number> = {};
  for (const k in t) out[k] = t[k] + adj;
  out.dhuhr += 2 / 60;
  out.maghrib = out.sunset;
  const res = out as unknown as Times;
  cache.set(ck, res);
  return res;
}
export function hm(h: number | null | undefined) {
  if (h == null || isNaN(h)) return "--:--";
  let mins = Math.round(h * 60); mins = ((mins % 1440) + 1440) % 1440;
  return `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
}

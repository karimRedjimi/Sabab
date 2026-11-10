"use client";
import Link from "next/link";
import { CITIES } from "@/content/reglages";
import { sameDay, today } from "@/lib/dates";
import { prayerTimes, hm } from "@/lib/prayer";
import { useStore } from "./Store";

export function PrayerStrip({ d }: { d: Date }) {
  const { S, now } = useStore();
  const pt = prayerTimes(d, S.prayer);
  if (!pt || !S.prayer)
    return (
      <div className="setup">
        <p>Choisis ta ville pour caler le programme sur tes horaires de prière.</p>
        <Link className="navbtn strong" href="/priere">Choisir ma ville</Link>
      </div>
    );
  const isToday = sameDay(d, today());
  const h = now.getHours() + now.getMinutes() / 60;
  const list: [string, number][] = [["Fajr", pt.fajr], ["Lever", pt.sunrise], ["Dhuhr", pt.dhuhr], ["ʿAsr", pt.asr], ["Maghreb", pt.maghrib], ["ʿIchâ", pt.isha]];
  const nextIdx = isToday ? list.findIndex(([, t], i) => i !== 1 && t > h) : -1;
  const morning = isToday && h >= pt.fajr && h < pt.dhuhr;
  const evening = isToday && h >= pt.asr && h < pt.maghrib;
  const lastHour = isToday && d.getDay() === 5 && h >= pt.maghrib - 1 && h < pt.maghrib;
  return (
    <>
      <div className="pr" aria-label={`Horaires de prière, ${S.prayer.city}`}>
        {list.map(([n, t], i) => <div key={n} className={i === nextIdx ? "n" : ""}><b>{hm(t)}</b><span>{n}</span></div>)}
      </div>
      <p className="secintro" style={{ margin: "8px 4px 0" }}>
        {morning ? "Maintenant : adhkâr du matin" : evening ? "Maintenant : adhkâr du soir" : `Adhkâr du soir de ${hm(pt.asr)} à ${hm(pt.maghrib)}`}
        {d.getDay() === 5 && <><br /><span style={{ color: "var(--brass)" }}>{lastHour ? "Maintenant : " : ""}dernière heure du vendredi, de {hm(pt.maghrib - 1)} à {hm(pt.maghrib)}</span></>}
      </p>
    </>
  );
}

/** Choix de la ville et bouton « Utiliser ma position ». La position reste sur l’appareil. */
export function CityPicker({ id }: { id: string }) {
  const { S, update, toast } = useStore();
  const P = S.prayer;
  const custom = P && !CITIES.some((c) => c[0] === P.city);
  const geoloc = () => {
    if (!navigator.geolocation) { toast("Position indisponible : choisis ta ville dans la liste"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => update((s) => { s.prayer = { city: "Ma position", lat: +pos.coords.latitude.toFixed(4), lng: +pos.coords.longitude.toFixed(4), method: s.prayer?.method || "uoif" }; }),
      () => toast("Position refusée : choisis ta ville dans la liste"),
      { timeout: 10000 },
    );
  };
  return (
    <>
      <label className="field"><span>Ville</span>
        <select className="select" id={id} value={P?.city || ""} onChange={(e) => {
          const c = CITIES.find((x) => x[0] === e.target.value);
          if (c) update((s) => { s.prayer = { city: c[0], lat: c[1], lng: c[2], method: s.prayer?.method || "uoif" }; });
        }}>
          <option value="">Choisir…</option>
          {CITIES.map((c) => <option key={c[0]} value={c[0]}>{c[0]}</option>)}
          {custom && <option value={P.city}>{P.city}</option>}
        </select>
      </label>
      <p style={{ margin: "-4px 0 14px" }}><button className="link" onClick={geoloc}>Utiliser ma position</button></p>
    </>
  );
}

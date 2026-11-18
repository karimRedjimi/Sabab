import { describe, expect, it } from "vitest";
import { etoiles, intentionDHier, placeEtoile, souvenir } from "@/lib/journal";
import { NOTIFS_DEFAUT, planifier } from "@/lib/notifs";
import { dayPct } from "@/lib/program";
import { merge, type State } from "@/lib/state";

const paris = { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" };
const S = (extra: Partial<State> = {}): State => merge({ onboarded: true, start: "2026-10-01", rampDone: "2026-10-02", prayer: paris, notifs: { ...NOTIFS_DEFAUT, on: true }, ...extra });
const jeudi = new Date(2026, 10, 12, 6, 0);

describe("journal du soir", () => {
  it("une étoile par al-hamdulillâh, dans l’ordre des jours, sans les vides", () => {
    const s = S({ gratitude: { "2026-11-10": "La santé", "2026-11-08": "Ma mère", "2026-11-09": "  " } });
    expect(etoiles(s).map((e) => e.dk)).toEqual(["2026-11-08", "2026-11-10"]);
  });
  it("les étoiles restent dans le ciel", () => {
    for (const n of [1, 5, 12, 40]) for (let i = 0; i < n; i++) {
      const p = placeEtoile(i, `2026-11-${String((i % 28) + 1).padStart(2, "0")}`, n);
      expect(p.x).toBeGreaterThan(10); expect(p.x).toBeLessThan(350);
      expect(p.y).toBeGreaterThan(10); expect(p.y).toBeLessThan(210);
    }
  });
  it("l’intention d’hier revient aujourd’hui", () => {
    const s = S({ days: { "2026-11-11": { c: {}, note: "", demain: "Prier le Fajr à l’heure" } } });
    expect(intentionDHier(s, jeudi)).toBe("Prier le Fajr à l’heure");
  });
  it("un souvenir d’environ un mois, pas plus d’une fois par semaine", () => {
    const s = S({ gratitude: { "2026-10-13": "Un nouveau travail", "2026-11-10": "Hier" } });
    expect(souvenir(s, jeudi)?.text).toBe("Un nouveau travail");
    expect(souvenir({ ...s, souvenirVu: "2026-11-09" }, jeudi)).toBeNull();
    expect(souvenir({ ...s, souvenirVu: "2026-11-01" }, jeudi)?.jours).toBe(30);
  });
  it("le journal ne compte jamais dans le pourcentage de la journée", () => {
    const a = S(), b = S({ gratitude: { "2026-11-12": "La santé" }, days: { "2026-11-12": { c: {}, note: "Un pas", demain: "Lire", clos: true } } });
    expect(dayPct(b, jeudi)).toBe(dayPct(a, jeudi));
  });
  it("le rappel du journal : avant 22 h, et plus rien une fois rempli", () => {
    // La limite de 3 rappels : le journal prend la place de la relance quand la journée est tenue (ici, relance coupée).
    const sansRelance = { notifs: { ...NOTIFS_DEFAUT, on: true, relance: false } };
    const l = planifier(S(sansRelance), jeudi).filter((r) => r.kind === "journal");
    expect(l.length).toBeGreaterThan(0);
    for (const r of l) { expect(new Date(r.at).getHours()).toBeLessThan(22); expect(r.url).toContain("journal=1"); }
    const rempli = planifier(S({ ...sansRelance, gratitude: { "2026-11-12": "La santé" } }), jeudi).filter((r) => r.kind === "journal" && r.id.startsWith("2026-11-12"));
    expect(rempli).toEqual([]);
    const off = planifier(S({ notifs: { ...NOTIFS_DEFAUT, on: true, journal: false } }), jeudi).filter((r) => r.kind === "journal");
    expect(off).toEqual([]);
  });
});

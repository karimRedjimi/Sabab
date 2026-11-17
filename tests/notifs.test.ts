import { describe, expect, it } from "vitest";
import { compterIgnores, espaces, MAX_PAR_JOUR, NOTIFS_DEFAUT, planifier, type Rappel } from "@/lib/notifs";
import { planDuJour } from "@/lib/journee";
import { keyOf } from "@/lib/dates";
import { merge, type State } from "@/lib/state";

const paris = { city: "Paris", lat: 48.8566, lng: 2.3522, method: "uoif" };
const S = (extra: Partial<State> = {}): State => merge({ onboarded: true, start: "2026-10-01", rampDone: "2026-10-02", prayer: paris, notifs: { ...NOTIFS_DEFAUT, on: true }, ...extra });
const jeudi = new Date(2026, 10, 12, 6, 0); // jeudi 12 novembre, 6 h
const duJour = (l: Rappel[], dk: string) => l.filter((r) => r.id.startsWith(dk));

describe("rappels", () => {
  it("rien sans accord ni ville", () => {
    expect(planifier(merge({ prayer: paris }), jeudi)).toEqual([]);
    expect(planifier(S({ prayer: null }), jeudi)).toEqual([]);
  });
  it("les cinq prières, 10 minutes avant l’appel, sur 7 jours, dans l’ordre", () => {
    const l = planifier(S(), jeudi);
    const p = duJour(l, "2026-11-12").filter((r) => r.kind === "priere");
    expect(p.map((r) => r.tag)).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
    expect(p[1].title).toBe("Dhuhr dans 10 min");
    expect(new Set(l.map((r) => r.id.slice(0, 10))).size).toBe(7);
    expect([...l].sort((a, b) => a.at.localeCompare(b.at))).toEqual(l);
    expect(new Set(l.map((r) => r.id)).size).toBe(l.length);
  });
  it("jamais plus de 3 rappels par jour en dehors des prières, jamais la nuit (sauf la prière de nuit)", () => {
    const tout = S({ notifs: { ...NOTIFS_DEFAUT, on: true, verset: true, nuit: true } });
    for (const r of planifier(tout, jeudi)) {
      const h = new Date(r.at).getHours();
      if (r.kind !== "priere" && r.kind !== "nuit") expect(h).toBeLessThan(22);
    }
    const parJour = new Map<string, number>();
    for (const r of planifier(tout, jeudi)) if (r.kind !== "priere") parJour.set(r.id.slice(0, 10), (parJour.get(r.id.slice(0, 10)) || 0) + 1);
    for (const n of parJour.values()) expect(n).toBeLessThanOrEqual(MAX_PAR_JOUR);
  });
  it("deux rappels ne tombent jamais à moins de 30 minutes d’un autre (hors prières entre elles)", () => {
    const l = planifier(S({ notifs: { ...NOTIFS_DEFAUT, on: true, verset: true } }), jeudi);
    for (const dk of new Set(l.map((r) => r.id.slice(0, 10)))) {
      const j = duJour(l, dk);
      for (const a of j) for (const b of j) if (a !== b && (a.kind !== "priere" || b.kind !== "priere"))
        expect(Math.abs(new Date(a.at).getTime() - new Date(b.at).getTime())).toBeGreaterThanOrEqual(30 * 60000);
    }
  });
  it("pas de rappel pour ce qui est déjà fait aujourd’hui", () => {
    const s = S();
    const dk = keyOf(jeudi);
    const P = planDuJour(s, jeudi);
    s.days[dk] = { c: Object.fromEntries(P.sections.matin.flatMap((e) => e.sl.map((i) => [`${e.id}:${i}`, 1000]))), note: "" };
    s.salat = { [dk]: { fajr: { s: "on" } } };
    const l = duJour(planifier(s, jeudi), dk);
    expect(l.some((r) => r.kind === "matin")).toBe(false);
    expect(l.some((r) => r.tag === "fajr")).toBe(false);
    expect(duJour(planifier(s, jeudi), "2026-11-13").some((r) => r.kind === "matin")).toBe(true);
  });
  it("ouverte dans l’heure : pas de relance, mais la prière reste", () => {
    const midi = new Date(2026, 10, 12, 12, 0);
    const l = planifier(S({ notifs: { ...NOTIFS_DEFAUT, on: true, verset: true } }), midi, { ouvert: midi });
    const avant13 = l.filter((r) => new Date(r.at).getTime() < midi.getTime() + 3600000);
    expect(avant13.every((r) => r.kind === "priere")).toBe(true);
    expect(avant13.some((r) => r.tag === "dhuhr")).toBe(true);
  });
  it("le vendredi, la dernière heure ; le mode discret ne dit rien de religieux", () => {
    const l = planifier(S(), jeudi);
    expect(duJour(l, "2026-11-13").some((r) => r.kind === "vendredi")).toBe(true);
    expect(duJour(l, "2026-11-12").some((r) => r.kind === "vendredi")).toBe(false);
    const d = planifier(S({ notifs: { ...NOTIFS_DEFAUT, on: true, discret: true } }), jeudi);
    for (const r of d) { expect(r.title).toBe("Sabab"); expect(r.body).toBe("Un moment t’attend."); }
  });
  it("ignoré 5 fois de suite : un jour sur deux ; ouvert : on repart de zéro", () => {
    const envoyes = planifier(S(), new Date(2026, 10, 1, 5, 0)).filter((r) => r.kind === "soir").slice(0, 6);
    const apres = new Date(2026, 10, 9);
    let suivi = compterIgnores({ vus: [], ignores: {} }, envoyes.slice(0, 5), new Set(), apres);
    expect(suivi.ignores.soir).toBe(5);
    expect(espaces(suivi).has("soir")).toBe(true);
    const l = planifier(S(), jeudi, { espaces: espaces(suivi) }).filter((r) => r.kind === "soir");
    expect(l.length).toBeLessThanOrEqual(4);
    suivi = compterIgnores(suivi, envoyes, new Set([envoyes[5].id]), apres);
    expect(suivi.ignores.soir).toBe(0);
  });
});

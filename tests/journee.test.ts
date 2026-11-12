import { describe, expect, it } from "vitest";
import { EXTRAITS } from "@/content/coran-extraits";
import { APRES_PRIERE, JOURNEE_ITEMS, MATIN_NIVEAU, NUIT_NIVEAU, RAWATIB } from "@/content/journee";
import { ITEMS } from "@/content/programme";
import { addDays } from "@/lib/dates";
import { apresPriere, choisirNiveau, niveau, niveauSuivant, planDuJour, plusTard, rawatib } from "@/lib/journee";
import { countable, dayPct, getItem, plan, slotsOf, type Entry } from "@/lib/program";
import { merge, type State } from "@/lib/state";

const d0 = new Date(2026, 10, 12); // un jeudi
const S = (lvl?: 1 | 2 | 3 | 4 | 5): State => merge({ onboarded: true, start: "2026-10-01", rampDone: "2026-10-02", ...(lvl ? { prophete: { lvl, since: "2026-11-01" } } : {}) });
const ids = (l: Entry[]) => l.map((e) => e.id);

describe("contenu de la journée du Prophète ﷺ", () => {
  it("chaque élément a une source, une note de vérification, et n’écrase aucun élément existant", () => {
    for (const [id, it] of Object.entries(JOURNEE_ITEMS)) {
      expect(ITEMS[id]).toBeUndefined();
      expect(it.src, id).toBeTruthy();
      expect(it.grade, id).toBeTruthy();
      expect(it.verif, id).toBe(false); // en attente de la relecture par un imam
      expect(it.ar || it.desc, id).toBeTruthy();
    }
  });
  it("les versets sont ceux de la source, sans modification", () => {
    for (const [id, ref] of [["pKursi", "2:255"], ["nKursi", "2:255"], ["nBaqara", "2:285-286"]] as const) {
      const ar = JOURNEE_ITEMS[id].ar!;
      for (const v of EXTRAITS[ref].verses) expect(ar).toContain(v.ar);
    }
    for (const ref of ["112:1-4", "113:1-5", "114:1-6"]) for (const v of EXTRAITS[ref].verses) expect(JOURNEE_ITEMS.nQuls.ar).toContain(v.ar);
  });
  it("le mot « péché » n’apparaît pas dans les nouveaux textes", () => {
    for (const it of Object.values(JOURNEE_ITEMS)) expect(`${it.title} ${it.fr || ""} ${it.desc || ""}`).not.toMatch(/péché/i);
  });
  it("toutes les références de niveau existent", () => {
    for (const id of [...APRES_PRIERE.court, ...APRES_PRIERE.complet, ...MATIN_NIVEAU.map((x) => x[0]), ...NUIT_NIVEAU.map((x) => x[0])]) expect(JOURNEE_ITEMS[id], id).toBeTruthy();
    for (const r of Object.values(RAWATIB)) for (const x of [r.avant, r.apres]) if (x) expect(slotsOf(x[0])[x[1]]).toBeTruthy();
    expect(getItem(S(), "pKursi", d0).title).toBe("Ayat al-Kursî");
  });
});

describe("ce que chaque niveau ajoute", () => {
  it("niveau 1 par défaut : rien la nuit, rien de plus le matin que le Coran", () => {
    expect(niveau(S())).toBe(1);
    const P = planDuJour(S(), d0);
    expect(P.sections.nuit).toEqual([]);
    expect(ids(P.sections.matin).filter((i) => JOURNEE_ITEMS[i])).toEqual([]);
    expect(ids(apresPriere(S(), "dhuhr"))).toEqual(["pKursi"]);
    expect(rawatib(S(), "fajr")).toEqual({ avant: null, apres: null });
  });
  it("niveau 2 : les invocations complètes et les deux unités avant le Fajr", () => {
    expect(ids(apresPriere(S(2), "asr"))).toEqual(APRES_PRIERE.complet);
    expect(apresPriere(S(2), "asr").every((e) => e.sl[0] === 2)).toBe(true);
    expect(rawatib(S(2), "fajr").avant?.key).toBe("rAvant:0");
    expect(rawatib(S(2), "dhuhr")).toEqual({ avant: null, apres: null });
  });
  it("niveau 3 : toutes les unités, le witr et le coucher la nuit", () => {
    expect(rawatib(S(3), "dhuhr")).toMatchObject({ avant: { key: "rAvant:1" }, apres: { key: "rApres:0" } });
    expect(rawatib(S(3), "isha").apres?.key).toBe("rApres:2");
    expect(ids(planDuJour(S(3), d0).sections.nuit)).toEqual(["nKursi", "nBaqara", "nQuls", "nBismika", "witr"]);
  });
  it("niveau 4 puis 5 : duhâ et prière de nuit, puis rester après le Fajr et le dernier tiers", () => {
    const P4 = planDuJour(S(4), d0), P5 = planDuJour(S(5), d0);
    expect(ids(P4.sections.matin)).toContain("duha");
    expect(ids(P4.sections.nuit)).toContain("qiyam");
    expect(ids(P5.sections.nuit)).toContain("qiyamTiers");
    expect(ids(P5.sections.nuit)).not.toContain("qiyam");
    expect(ids(P5.sections.matin)).toEqual(expect.arrayContaining(["apresFajr", "duha"]));
  });
  it("les jours de minimum, rien n’est ajouté", () => {
    const s = S(5); s.days["2026-11-12"] = { c: {}, note: "", light: true };
    expect(planDuJour(s, d0)).toEqual(plan(s, d0));
  });
  it("le pourcentage de la journée (suivi) ne change pas avec le niveau", () => {
    const a = S(1), b = S(5);
    for (const x of [a, b]) x.days["2026-11-12"] = { c: { "fajr:0": 1, "sayyid:0": 1 }, note: "" };
    expect(dayPct(b, d0)).toBe(dayPct(a, d0));
  });
});

describe("passer au niveau suivant", () => {
  const held = (lvl: 1 | 5, days: number) => {
    const s = S(lvl);
    s.prophete = { lvl, since: "2026-10-20" };
    for (let i = 0; i < days; i++) { const k = addDays(d0, -i); const dk = `${k.getFullYear()}-${String(k.getMonth() + 1).padStart(2, "0")}-${String(k.getDate()).padStart(2, "0")}`; s.days[dk] = { c: Object.fromEntries(countable(s, k).flatMap((id) => slotsOf(id).map((_, j) => [`${id}:${j}`, 1000]))), note: "" }; }
    return s;
  };
  it("proposé après quatorze jours tenus, jamais au-delà de 5", () => {
    expect(niveauSuivant(held(1, 13), d0)).toBeNull();
    expect(niveauSuivant(held(1, 15), d0)).toBe(2);
    expect(niveauSuivant(held(5, 15), d0)).toBeNull();
  });
  it("« Plus tard » met la proposition de côté une semaine ; choisir un niveau repart de zéro", () => {
    const s = held(1, 15);
    plusTard(s, d0);
    expect(niveauSuivant(s, d0)).toBeNull();
    expect(niveauSuivant(s, addDays(d0, 6))).toBeNull();
    expect(niveauSuivant(s, addDays(d0, 7))).toBe(2);
    choisirNiveau(s, 2, d0);
    expect(niveau(s)).toBe(2);
    expect(niveauSuivant(s, d0)).toBeNull();
  });
});

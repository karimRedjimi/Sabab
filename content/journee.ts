/*
 * « La journée du Prophète ﷺ » : les niveaux et leur contenu.
 *
 * ⚠ CONTENU À VÉRIFIER. Ces textes ont été ajoutés à la demande du porteur du projet, qui les fera
 * relire par un imam. Chaque élément porte `verif: false` tant qu’il n’a pas été validé :
 * l’application affiche alors « Texte en cours de vérification ». Une fois un élément validé,
 * passer `verif` à true (et corriger le texte ou la source si besoin).
 *
 * Les versets du Coran ne sont pas saisis à la main : arabe, phonétique et traduction viennent
 * de content/coran-extraits.ts (généré depuis la source, vérifié par un test).
 */
import { EXTRAITS } from "./coran-extraits";
import type { Item, Slot } from "./types";

export type NiveauId = 1 | 2 | 3 | 4 | 5;
export const NIVEAUX: Record<NiveauId, { titre: string; ajoute: string }> = {
  1: { titre: "Les fondations", ajoute: "Les cinq prières à l’heure, les invocations du matin et du soir, Ayat al-Kursî après chaque prière" },
  2: { titre: "Autour de la prière", ajoute: "+ les invocations après chaque prière, les deux unités avant le Fajr" },
  3: { titre: "Les sunna du jour", ajoute: "+ les unités surérogatoires autour des prières, le witr, les invocations du coucher" },
  4: { titre: "Le matin et la nuit", ajoute: "+ la prière du duhâ, une première prière de nuit" },
  5: { titre: "S’en approcher", ajoute: "+ rester après le Fajr jusqu’au lever du soleil, la prière au dernier tiers de la nuit" },
};

/** Les cinq prières, dans l’ordre des créneaux (slots) des invocations d’après la prière. */
export const PRIERES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const APRES_LE = ["Après le Fajr", "Après le Dhuhr", "Après le ʿAsr", "Après le Maghreb", "Après le ʿIchâ"];
const parPriere = (t: number): Slot[] => APRES_LE.map((l) => ({ l, t }));

/** Un passage du Coran, avec le numéro de chaque verset. */
function coran(ref: string) {
  const e = EXTRAITS[ref];
  const n = (v: { n: number }) => (e.from === e.to ? "" : ` (${v.n})`);
  return {
    ar: e.verses.map((v) => v.ar).join(" ۝ "),
    ph: e.verses.map((v) => v.ph + n(v)).join(" "),
    fr: e.verses.map((v) => v.fr + n(v)).join(" "),
  };
}
const COURTES = [coran("112:1-4"), coran("113:1-5"), coran("114:1-6")];

export interface ItemJournee extends Item { verif: boolean }

export const JOURNEE_ITEMS: Record<string, ItemJournee> = {
  /* ---------- Après chaque prière ---------- */
  pIstighfar: {
    kind: "dua", title: "Demander pardon", moment: "Après la prière", slots: parPriere(3),
    ar: "أَسْتَغْفِرُ اللَّهَ", ph: "Astaghfiru-llâh", fr: "Je demande pardon à Allah.",
    grade: "sahih", src: "Muslim (n° 591)", verif: false,
  },
  pSalam: {
    kind: "dua", title: "Allâhumma anta s-salâm", moment: "Après la prière", slots: parPriere(1),
    ar: "اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    ph: "Allâhumma anta s-salâm, wa minka s-salâm, tabârakta yâ dha-l-jalâli wa-l-ikrâm.",
    fr: "Ô Allah, Tu es la Paix et la paix vient de Toi. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.",
    grade: "sahih", src: "Muslim (n° 591)", verif: false,
  },
  pKursi: {
    kind: "dua", title: "Ayat al-Kursî", moment: "Après chaque prière obligatoire", slots: parPriere(1),
    ...coran("2:255"),
    grade: "coran", src: "Coran, Al-Baqara 2:255 ; après la prière : An-Nasâ’î (As-Sunan al-Kubrâ), authentifié par Al-Albânî", verif: false,
  },
  pTasbih: {
    kind: "dua", title: "Subhâna-llâh", moment: "Après la prière", slots: parPriere(33),
    ar: "سُبْحَانَ اللَّهِ", ph: "Subhâna-llâh", fr: "Gloire à Allah.",
    grade: "sahih", src: "Muslim (n° 597)", verif: false,
  },
  pTahmid: {
    kind: "dua", title: "Al-hamdu li-llâh", moment: "Après la prière", slots: parPriere(33),
    ar: "الْحَمْدُ لِلَّهِ", ph: "Al-hamdu li-llâh", fr: "Louange à Allah.",
    grade: "sahih", src: "Muslim (n° 597)", verif: false,
  },
  pTakbir: {
    kind: "dua", title: "Allâhu akbar", moment: "Après la prière", slots: parPriere(33),
    ar: "اللَّهُ أَكْبَرُ", ph: "Allâhu akbar", fr: "Allah est le plus grand.",
    grade: "sahih", src: "Muslim (n° 597)", verif: false,
  },
  pTahlil: {
    kind: "dua", title: "Lâ ilâha illa-llâh", moment: "Pour compléter la centaine", slots: parPriere(1),
    ar: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    ph: "Lâ ilâha illa-llâhu wahdahu lâ sharîka lah, lahu-l-mulku wa lahu-l-hamd, wa huwa ʿalâ kulli shay’in qadîr.",
    fr: "Il n’y a de divinité qu’Allah, Seul, sans associé. À Lui la royauté, à Lui la louange, et Il est capable de toute chose.",
    grade: "sahih", src: "Muslim (n° 597)", verif: false,
  },

  /* ---------- Unités surérogatoires autour des prières (une case par prière) ---------- */
  rAvant: {
    kind: "action", title: "Unités surérogatoires avant la prière",
    slots: [{ l: "2 unités avant le Fajr", t: 1 }, { l: "4 unités avant le Dhuhr", t: 1 }],
    desc: "Deux unités avant le Fajr, quatre avant le Dhuhr.",
    grade: "sahih", src: "Muslim (n° 725) et (n° 728) ; le détail : At-Tirmidhî (n° 415)", verif: false,
  },
  rApres: {
    kind: "action", title: "Unités surérogatoires après la prière",
    slots: [{ l: "2 unités après le Dhuhr", t: 1 }, { l: "2 unités après le Maghreb", t: 1 }, { l: "2 unités après le ʿIchâ", t: 1 }],
    desc: "Deux unités après le Dhuhr, le Maghreb et le ʿIchâ.",
    grade: "sahih", src: "Muslim (n° 728) ; le détail : At-Tirmidhî (n° 415)", verif: false,
  },

  /* ---------- Le matin ---------- */
  apresFajr: {
    kind: "action", title: "Rester après le Fajr", moment: "Jusqu’au lever du soleil",
    desc: "Rester à sa place après la prière du Fajr, dans le rappel d’Allah, jusqu’à ce que le soleil soit levé.",
    grade: "sahih", src: "Muslim (n° 670)", verif: false,
  },
  duha: {
    kind: "action", title: "La prière du duhâ", moment: "Après le lever du soleil, avant le Dhuhr",
    desc: "Au moins deux unités, une fois le soleil levé et avant le Dhuhr.",
    grade: "sahih", src: "Muslim (n° 720)", verif: false,
  },

  /* ---------- La nuit ---------- */
  nKursi: {
    kind: "dua", title: "Ayat al-Kursî avant de dormir", moment: "Au coucher",
    ...coran("2:255"),
    grade: "coran", src: "Coran, Al-Baqara 2:255 ; au coucher : Al-Bukhârî (n° 2311)", verif: false,
  },
  nBaqara: {
    kind: "dua", title: "Les deux derniers versets d’Al-Baqara", moment: "Au coucher",
    ...coran("2:285-286"),
    grade: "coran", src: "Coran, Al-Baqara 2:285-286 ; Al-Bukhârî (n° 5009)", verif: false,
  },
  nQuls: {
    kind: "dua", title: "Les trois dernières sourates", moment: "Au coucher, trois fois", slots: [{ l: "Au coucher", t: 3 }],
    ar: COURTES.map((c) => c.ar).join(" ۞ "),
    ph: COURTES.map((c) => c.ph).join(" · "),
    fr: COURTES.map((c) => c.fr).join(" · "),
    desc: "Al-Ikhlâs, Al-Falaq et An-Nâs, puis souffler dans ses mains et les passer sur son corps.",
    grade: "coran", src: "Coran, sourates 112, 113 et 114 ; Al-Bukhârî (n° 5017)", verif: false,
  },
  nBismika: {
    kind: "dua", title: "Bismika-llâhumma", moment: "Au coucher",
    ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", ph: "Bismika-llâhumma amûtu wa ahyâ.",
    fr: "C’est par Ton nom, ô Allah, que je meurs et que je vis.",
    grade: "sahih", src: "Al-Bukhârî (n° 6324)", verif: false,
  },
  qiyam: {
    kind: "action", title: "Une prière de nuit", moment: "Après le ʿIchâ, avant le witr",
    desc: "Commencer par deux unités, la nuit, avant le witr.",
    grade: "sahih", src: "Al-Bukhârî (n° 1147)", verif: false,
  },
  qiyamTiers: {
    kind: "action", title: "Prier au dernier tiers de la nuit", moment: "Avant le Fajr",
    desc: "Le Prophète ﷺ dormait au début de la nuit et se levait dans sa dernière partie.",
    grade: "sahih", src: "Al-Bukhârî (n° 1145) et (n° 1146)", verif: false,
  },
  witr: {
    kind: "action", title: "Le witr", moment: "Pour clore la prière de la nuit",
    desc: "Faire du witr la dernière prière de la nuit.",
    grade: "sahih", src: "Al-Bukhârî (n° 998) ; Muslim (n° 751)", verif: false,
  },
};

/** Les invocations après la prière, dans l’ordre, selon le niveau. */
export const APRES_PRIERE: Record<"court" | "complet", string[]> = {
  court: ["pKursi"],
  complet: ["pIstighfar", "pSalam", "pKursi", "pTasbih", "pTahmid", "pTakbir", "pTahlil"],
};

/** Les unités surérogatoires de chaque prière : quelle case, à partir de quel niveau. */
export const RAWATIB: Partial<Record<(typeof PRIERES)[number], { avant?: [string, number, NiveauId]; apres?: [string, number, NiveauId] }>> = {
  fajr: { avant: ["rAvant", 0, 2] },
  dhuhr: { avant: ["rAvant", 1, 3], apres: ["rApres", 0, 3] },
  maghrib: { apres: ["rApres", 1, 3] },
  isha: { apres: ["rApres", 2, 3] },
};

/** Ce qui s’ajoute au matin et à la nuit, à partir de quel niveau. */
export const MATIN_NIVEAU: [string, NiveauId][] = [["apresFajr", 5], ["duha", 4]];
export const NUIT_NIVEAU: [string, NiveauId, NiveauId?][] = [
  ["nKursi", 3], ["nBaqara", 3], ["nQuls", 3], ["nBismika", 3],
  ["qiyam", 4, 4], ["qiyamTiers", 5], ["witr", 3],
];

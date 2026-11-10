/*
 * Réglages et libellés de l’interface : villes, méthodes de calcul, niveaux d’arabe, seuils.
 *
 * Copié à l’identique du prototype de référence (reference/rizq.html).
 * RÈGLE : ne jamais modifier un texte arabe, une phonétique, une traduction ou une source
 * sans demande explicite. Le test tests/content.test.ts vérifie l’identité avec le prototype.
 */
import type { City, Method, Level } from "./types";

/** [nom, latitude, longitude] */
export const CITIES: City[] = [
  ["Avignon", 43.9493, 4.8055],
  ["Marseille", 43.2965, 5.3698],
  ["Paris", 48.8566, 2.3522],
  ["Lyon", 45.764, 4.8357],
  ["Toulouse", 43.6047, 1.4442],
  ["Nice", 43.7102, 7.262],
  ["Montpellier", 43.6108, 3.8767],
  ["Bordeaux", 44.8378, -0.5792],
  ["Lille", 50.6292, 3.0573],
  ["Strasbourg", 48.5734, 7.7521],
  ["Nantes", 47.2184, -1.5536],
  ["Grenoble", 45.1885, 5.7245],
  ["Saint-Étienne", 45.4397, 4.3872],
  ["Nîmes", 43.8367, 4.3601],
  ["Toulon", 43.1242, 5.928],
  ["Bruxelles", 50.8503, 4.3517],
  ["Genève", 46.2044, 6.1432]
];

export const METHODS: Record<string, Method> = {
  uoif: { l: "UOIF (12°)", f: 12, i: 12 },
  isna: { l: "15°", f: 15, i: 15 },
  mwl: { l: "Ligue islamique mondiale (18° et 17°)", f: 18, i: 17 }
};

export const LEVELS: Record<string, Level> = {
  none: {
    l: "Je ne lis pas l’arabe",
    d: "Tu suivras la phonétique et la traduction.",
    show: { ar: true, ph: true, fr: true }
  },
  read: {
    l: "Je lis l’arabe sans bien le comprendre",
    d: "Le texte arabe et la traduction, sans phonétique.",
    show: { ar: true, ph: false, fr: true }
  },
  fluent: {
    l: "Je lis et je comprends l’arabe",
    d: "Le texte arabe seul. Tu pourras réafficher le reste à tout moment.",
    show: { ar: true, ph: false, fr: false }
  }
};

export const MONTHS: string[] = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
/** Seuil à partir duquel une journée est « tenue ». */
export const HELD = 0.8;
/** Intervalles de révision, en jours, par niveau. */
export const INTERVALS: number[] = [0, 1, 2, 4, 7, 15, 30];
/** Niveau à partir duquel une invocation est « sue par cœur ». */
export const MASTER = 5;

// Phase 2 : communauté
export const ENCOURAGEMENTS: string[] = ["Qu’Allah te facilite", "Qu’Allah accepte de toi", "Tiens bon, bârakallâhu fîk", "Je fais une du’â pour toi"];
export const REQ_CATS: Record<string, string> = {
  emploi: "Emploi et revenus",
  activite: "Activité et projets",
  dette: "Dettes",
  mariage: "Mariage",
  famille: "Famille et enfants",
  etudes: "Études",
  sante: "Santé",
  epreuve: "Épreuve",
  autre: "Autre"
};
export const KINDS: Record<string, string> = {
  exact: "Ce que j’avais demandé",
  better: "Autre chose, de meilleur",
  protect: "Un mal a été écarté",
  peace: "Pas encore, mais j’ai trouvé la paix"
};
export const DELAYS: Record<string, string> = {
  w: "Moins d’une semaine",
  m: "Quelques semaines",
  mo: "Quelques mois",
  y: "Plus d’un an"
};
export const GROUP_NAMES: Record<string, string> = {
  general: "Programme de la semaine",
  rizq: "Portes du rizq",
  dettes: "Sortir des dettes",
  mariage: "Mariage",
  etudes: "Études et examens",
  epreuve: "Traverser une épreuve",
  deuil: "Le deuil"
};
export const MILESTONES: number[] = [7, 14, 21, 30, 40, 60, 90, 100, 150, 200, 365];

/*
 * Rappels du Coran : quels versets proposer selon la situation de la personne.
 *
 * Ce fichier ne contient que des RÉFÉRENCES (sourate:verset). Le texte arabe et la traduction
 * sont extraits tels quels de la source par scripts/extract-versets.mjs (content/coran-extraits.ts).
 * Seuls des versets entiers sont proposés, choisis parce que leur texte parle du sujet de lui-même.
 * La sélection est à valider par le porteur du projet : on peut retirer ou ajouter une référence ici,
 * puis relancer « npm run versets:extract ».
 */

/** Versets liés au domaine de l’objectif (clés de OBJ_CATS). */
export const VERSETS_THEME: Record<string, string[]> = {
  emploi: ["11:6", "51:58", "62:10", "67:15", "29:60", "34:39", "42:19", "35:2", "17:30", "20:132", "16:97", "14:7", "53:39-41", "28:24", "3:37"],
  activite: ["62:10", "67:15", "53:39-41", "28:77", "17:35", "83:1-3", "2:188", "35:29", "24:37", "34:39", "51:58", "14:7"],
  dette: ["2:280", "65:7", "17:26-27", "17:29", "25:67", "2:268", "2:245", "94:5-6", "11:6", "34:39"],
  mariage: ["30:21", "24:32", "4:1", "16:72", "51:49", "36:36", "49:13", "2:201", "28:24"],
  etudes: ["20:114", "96:1-5", "58:11", "39:9", "2:269", "18:66", "55:1-4", "16:43", "35:28", "53:39-41", "94:5-6"],
  epreuve: ["2:155-157", "94:5-6", "93:3-5", "2:214", "29:2-3", "21:83-84", "21:87-88", "12:86", "12:87", "39:10", "64:11", "57:22-23", "13:28", "2:153", "10:107", "65:7"],
};

/** Rappels pour tous : confiance en Allah, invocation, patience, gratitude, pardon. */
export const VERSETS_GENERAL: string[] = [
  "2:152", "2:186", "2:153", "40:60", "9:51", "29:69", "25:58", "15:49", "39:53", "33:3", "13:28", "14:7",
  "6:17", "2:261", "3:8", "7:23", "2:201", "93:3-5", "94:5-6", "12:87", "64:11", "16:97", "42:19", "35:2",
];

/** D’où vient le texte affiché. */
export const VERSETS_SOURCE = {
  arabe: "Texte uthmani : Encyclopédie du Noble Coran (quranenc.com)",
  traduction: "Traduction : Muhammad Hamidullah",
  phonetique: "Phonétique : translittération de tanzil.net",
};

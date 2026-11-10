/*
 * Textes religieux affichés dans les pages (citations, sources, précisions).
 * Copiés à l’identique du prototype ; tests/content.test.ts vérifie que chacun
 * y figure mot pour mot. Ne pas modifier sans demande explicite.
 */

/** Hadith de la régularité, cité dans l’accompagnement et le bilan. */
export const REGULARITE = {
  texte: "Les œuvres les plus aimées d’Allah sont les plus régulières, même si elles sont peu nombreuses.",
  source: "Al-Bukhârî (n° 6464) ; Muslim (n° 783)",
};

/** Page « Le programme » : lecture des sources. */
export const LIRE_LES_SOURCES = [
  { terme: "Coran", def: "le texte vient directement d’un verset." },
  { terme: "Sahîh", def: "hadith authentique, la plus haute catégorie." },
  { terme: "Hasan", def: "hadith bon, accepté comme preuve. Les hadiths faibles ne figurent pas dans le programme ; quand une pratique repose sur une chaîne discutée, la note de la carte le signale." },
];

export const PROGRAMME_INTRO =
  "Un socle fixe chaque jour, et un thème différent pour chaque jour de la semaine. Toutes les invocations viennent du Coran ou de hadiths authentiques ; quand une pratique est discutée, c’est indiqué.";

/** Page « Le programme » : ce qui donne sa force au programme. */
export const FORCE_DU_PROGRAMME = [
  { titre: "La taqwa", texte: "« Quiconque craint Allah, Il lui donne une issue et le pourvoit d’où il ne s’y attend pas. »", label: "Source", source: "Coran, At-Talâq 65:2-3" },
  { titre: "Un revenu halal", texte: "Le Prophète ﷺ a évoqué l’homme qui lève les mains au ciel en invoquant, alors que sa nourriture et ses vêtements viennent de l’illicite : comment serait-il exaucé ?", label: "Source", source: "Muslim (n° 1015)" },
  { titre: "Le tawakkul avec l’effort", texte: "Si vous placiez votre confiance en Allah comme il se doit, Il vous nourrirait comme les oiseaux : ils partent le ventre vide et reviennent rassasiés. Les oiseaux partent : la confiance n’empêche pas d’agir.", label: "Source", source: "At-Tirmidhî (n° 2344)" },
  { titre: "Les moments où l’invocation est exaucée", texte: "Le dernier tiers de la nuit, entre l’appel à la prière et l’iqâma, et pendant la prosternation.", label: "Sources", source: "Al-Bukhârî (n° 1145) ; Abû Dâwûd (n° 521) ; Muslim (n° 482)" },
];

export const PRECISION_WAQIA =
  "On entend souvent que lire la sourate Al-Wâqiʿa chaque soir éloigne la pauvreté. Le hadith qui l’affirme est jugé faible par les savants du hadith. Tu peux la lire comme lecture du Coran, sans compter sur cette promesse précise. Pour toute question de détail, un imam ou un savant de confiance reste la meilleure référence.";

/** Page « Carnet » : rappel en bas de page. */
export const CARNET_RAPPEL =
  "« Votre Seigneur a dit : invoquez-Moi, Je vous répondrai. » (Coran, Ghâfir 40:60). La réponse peut être ce que tu as demandé, un mal écarté, ou une récompense gardée pour l’au-delà (Ahmad, n° 11133).";

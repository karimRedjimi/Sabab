/*
 * Récitation des versets de l’application : cheikh Mahmoud Khalil al-Husary (murattal), lente et nette, pour apprendre.
 * Fichiers verset par verset tirés d’EveryAyah (everyayah.com, dossier Husary_64kbps), réencodés en mono pour être légers.
 * Ils sont hébergés avec l’application (public/audio/versets/), jamais chez un tiers :
 * écouter un verset ne doit rien révéler à un service extérieur.
 */
export const RECITATEUR = { nom: "Mahmoud Khalil al-Husary", source: "EveryAyah (everyayah.com)" };
/** Les versets disponibles, sous la forme sourate (3 chiffres) + verset (3 chiffres). */
export const VERSETS_AUDIO: ReadonlySet<string> = new Set(["002152", "002153", "002155", "002156", "002157", "002186", "002188", "002201", "002214", "002245", "002255", "002261", "002268", "002269", "002280", "002285", "002286", "003008", "003037", "004001", "006017", "007023", "009051", "010107", "011006", "012086", "012087", "013028", "014007", "015049", "016043", "016072", "016097", "017026", "017027", "017029", "017030", "017035", "018066", "020114", "020132", "021083", "021084", "021087", "021088", "024032", "024037", "025058", "025067", "028024", "028077", "029002", "029003", "029060", "029069", "030021", "033003", "034039", "035002", "035028", "035029", "036036", "039009", "039010", "039053", "040060", "042019", "049013", "051049", "051058", "053039", "053040", "053041", "055001", "055002", "055003", "055004", "057022", "057023", "058011", "062010", "064011", "065007", "067015", "083001", "083002", "083003", "093003", "093004", "093005", "094005", "094006", "096001", "096002", "096003", "096004", "096005", "112001", "112002", "112003", "112004", "113001", "113002", "113003", "113004", "113005", "114001", "114002", "114003", "114004", "114005", "114006"]);
const pad = (n: number) => String(n).padStart(3, "0");
/** Le fichier d’un verset, ou null s’il n’est pas disponible. */
export const fichierVerset = (s: number, n: number) => (VERSETS_AUDIO.has(pad(s) + pad(n)) ? `/audio/versets/${pad(s)}${pad(n)}.mp3` : null);

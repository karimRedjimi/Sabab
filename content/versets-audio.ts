/*
 * Audio du récitateur pour « Un jour, un verset ».
 * Les fichiers sont hébergés avec l’application (public/audio/versets/), jamais chez un tiers :
 * écouter un verset ne doit rien révéler à un service extérieur.
 * Tant qu’un verset n’a pas de fichier listé ici, l’application n’affiche pas le lecteur.
 * Avant d’ajouter des fichiers : vérifier que le récitateur ou son éditeur autorise leur diffusion.
 */
export const AUDIO_RECITATEUR: { nom: string; fichiers: Record<string, string> } = {
  nom: "",
  fichiers: {
    // "2:152": "/audio/versets/002152.mp3",
  },
};

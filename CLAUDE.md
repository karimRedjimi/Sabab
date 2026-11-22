# Les pubs Sabab : la fabrication de nuit

Cette branche (`pubs`) du dépôt Sabab contient le studio qui fabrique les pubs TikTok de l’application.
Elle ne contient pas l’appli (elle est sur `main`). Chaque nuit, une session automatique fabrique **7 vidéos**,
une par format de `planning.json`, et les livre au porteur du projet (Karim) pour validation.
Personne ne surveille la nuit : travailler seul, jusqu’au bout, sans poser de question.

Le niveau attendu : celui des vidéos `studio/src/videos/communaute.tsx` et `studio/src/exemples/Saviez.tsx`.
Motion design avec de vrais écrans, voix de Guillaume, sous-titres mot à mot, bruitages. Rendu rapide (pas de vidéo
de fond, pas de 3D, pas de grain image par image : une vidéo se rend en 3 à 5 minutes).

## Règles non négociables (reprises de l’appli)

1. **Contenu religieux** : n’utiliser QUE des invocations, versets et hadiths présents dans le dépôt de l’appli
   (`content/programme.ts`, `content/journee.ts`, `content/citadelle.json`, `content/textes.ts`, `content/versets.ts`,
   `content/coran-extraits.ts`). Arabe, phonétique, traduction et source **copiés à l’identique**, par programme
   (lire le fichier et extraire le champ), jamais retapés ni « améliorés ». On peut couper un texte arabe pour l’afficher
   en plusieurs lignes, pas le modifier. Jamais d’invocation, de hadith ou de chiffre religieux non sourcé.
   Si une phrase de la voix résume un hadith, elle doit rester fidèle au texte et à sa source affichée.
2. **Ne jamais promettre** qu’une du’â « marche », qu’un souci sera réglé, ni un résultat. On parle de demander,
   de se confier à Allah, de tenir, de ne pas être seul.
3. **Vocabulaire** : jamais « péché » ; jamais « don », « sadaqa », « zakât » pour parler de l’appli ;
   ne pas dire « gratuit » (l’appli sera peut-être payante). Ton bienveillant, jamais moralisateur, jamais culpabilisant.
4. **Pas de visage, pas de personne réelle**, pas de marque, pas de musique avec instruments. Les demandes visibles
   dans les écrans de la communauté sont des exemples de démo, sans nom.
5. **Données** : rien d’un vrai utilisateur. Les captures viennent du faux serveur (`captures/faux-serveur.cjs`).
6. **Relecture par l’imam** : chaque vidéo qui contient un texte religieux part avec la liste exacte de ce qu’il faut
   faire relire. On ne publie rien soi-même.

## La nuit, étape par étape

Dossiers (adapter les chemins) : l’appli = le dépôt cloné (branche `main`, souvent `../Sabab`), le studio = ce dossier.

0. **Préparer**
   - `git -C <appli> pull` (dernière version de l’appli) ; `cd studio && npm ci` si `node_modules` manque.
   - Vérifier le crédit ElevenLabs :
     `curl -s https://api.elevenlabs.io/v1/user/subscription -H "xi-api-key: proxy-injected"`
     (`character_limit - character_count`). Une vidéo coûte environ 1 000 caractères avec les essais.
     S’il n’y en a pas assez pour 7, faire les formats dans l’ordre jusqu’à épuisement et le dire dans le compte rendu.
1. **Captures** (une fois pour les 7 vidéos)
   - `captures/lancer.sh <appli>` puis `node captures/tout.cjs <appli> studio/public/ecrans` puis `python3 qa/captures.py studio/public/ecrans`.
   - Toutes doivent passer (✓). Regarder une planche des captures (PIL) : écrans entiers, propres, à jour.
   - `studio/public/ecrans/manifeste.json` donne, pour chaque écran, la position de chaque texte visible
     (`b` = x, y, largeur, hauteur en fractions de l’image). S’en servir pour `<Surligne>` : ne jamais deviner une position.
   - Besoin d’un écran qui n’existe pas : l’ajouter dans `captures/tout.cjs` (même méthode : page entière, cadrée sur
     un titre avec `haut`/`hautTexte`, jamais coupée au milieu d’une carte), relancer, et le garder pour les nuits suivantes.
2. **Pour chacune des 7 vidéos** (ordre de `planning.json`)
   1. **Choisir** l’angle utilisé le moins récemment dans `historique.json` pour ce format, et un contenu jamais utilisé
      (même invocation = interdit à moins de 30 jours d’écart).
   2. **Écrire le script** : `studio/public/voix/<id>.lignes.json` = `[{"affiche": "…"}]`, une phrase par ligne.
      - Accroche dans la première seconde : question directe, chiffre, situation vécue. Phrases courtes (8 à 16 mots).
      - Texte `affiche` = exactement ce qui s’affiche en sous-titres (typographie française : ’ « » espaces avant ; : ? !).
      - La prononciation est gérée par `voix/lexique.json` (du’â → dou’a, ﷺ → paix et salut sur lui, nombres en lettres…).
        Un mot nouveau difficile (nom propre, mot arabe) : l’ajouter au lexique, pas dans le texte affiché.
      - Ne pas faire lire l’arabe par la voix (elle le prononce mal) : l’arabe s’affiche, la voix dit la traduction.
      - Dernière phrase : « Sabab. … le lien est en bio. » ou la fin propre au format.
   3. **Voix** : `python3 -I voix/voix.py studio/public/voix/<id>.lignes.json ohItIVrXTBI80RrUECOD studio/public/voix/<id>`
      - Lire `<id>-rapport.json` : chaque phrase doit être `"parfait": true`. Sinon : reformuler la phrase (mots plus simples,
        ponctuation) et refaire seulement elle (4ᵉ argument : numéros séparés par des virgules), au plus 2 fois.
      - Puis `voix/verif.sh studio/public/voix/<id>.mp3` : la transcription du fichier entier doit redonner le script,
        sans mot doublé, sans bégaiement, sans mot coupé.
   4. **La vidéo** : `studio/src/videos/<id>.tsx`, sur le modèle de `videos/communaute.tsx`, avec les briques de
      `studio/src/moteur.tsx` (minutage, SousTitres, Fond, Phone, Surligne, Pastille, Scene, Flash, Logo, Son).
      L’ajouter à `studio/src/videos/liste.ts` (et retirer les vidéos des nuits précédentes, sauf `communaute`).
      - Tout le minutage vient de la voix : `T.L[i]` (début de la phrase i), `T.mot(/^mot/, i)` (le mot dit, à partir de la phrase i).
        Jamais d’images codées en dur pour caler une scène sur la voix.
      - **Écrans** : `<Phone ecran="ecrans/<nom>">`, toujours l’écran ENTIER. Zoom au plus ×1,12 (plafonné dans le moteur).
        Pour montrer un détail : `<Surligne>` avec la position du manifeste, ou une `<Pastille>` hors du texte important.
        Pas plus d’un écran toutes les 2 à 4 secondes ; un écran reste au moins le temps de lire ce qui est surligné.
      - **Varier** : entrées et sorties différentes d’un écran à l’autre, au moins une scène graphique sans téléphone,
        pas deux vidéos de la nuit avec la même accroche visuelle.
      - **Sous-titres** : `or` = 5 à 12 mots clés en or ; rien d’important dans la bande du bas (y > 1440) où ils s’affichent.
      - **Son** : un bruitage à chaque changement de scène et à chaque élément qui apparaît, jamais deux sons forts
        au même instant, jamais de son fort pendant une phrase importante (hadith, invocation) : là, seulement `shimmer`
        ou rien. Volumes 0,3 à 0,8 (le moteur les réduit déjà). Format apaisant : sons doux uniquement (pop, tick, shimmer).
   5. **Contrôle avant rendu** : `npx tsc -p studio` sans erreur, puis
      `node studio/render.cjs <id> still <6 à 10 images clés>` et REGARDER chaque image : rien de coupé, rien qui déborde,
      surlignages exactement sur leur texte, pastilles lisibles et hors du texte important, sous-titres lisibles,
      texte arabe complet. Corriger et recommencer tant que ce n’est pas parfait.
   6. **Rendu et finition** : `node studio/render.cjs <id>` puis
      `qa/finaliser.sh <id> <AAAA-MM-JJ>-<n>-<id>` (date = jour de publication prévu, le lendemain).
      Tous les contrôles doivent être ✓. Regarder la planche `-planche.jpg`.
      Écouter n’est pas possible : relire `-qa.json` (volume, crête, silences) et, en cas de doute,
      `voix/verif.sh` sur le fichier final.
   7. **Noter** la vidéo dans `historique.json` (date, format, angle, contenu avec sa source, titre, fichier).
   Si une vidéo échoue deux fois aux contrôles, la laisser de côté, passer à la suivante et l’expliquer dans le compte rendu.
3. **Livrer**
   - Envoyer les vidéos finales avec l’outil d’envoi de fichiers (SendUserFile, `display: "render"`, `status: "proactive"`),
     une par une, avec en légende : le numéro, le format, le titre.
   - Puis un compte rendu en français simple (Karim n’est pas développeur, il tutoie) :
     pour chaque vidéo : titre, durée, la légende TikTok proposée (2 lignes + 4 à 6 hashtags), et **« À faire relire par
     l’imam »** avec les textes exacts et leurs sources. Signaler toute vidéo manquante et pourquoi, et le crédit
     ElevenLabs restant.
   - Une notification sur son téléphone (PushNotification) : « Tes 7 pubs de demain sont prêtes. »
   - Committer sur la branche `pubs` : `historique.json`, les scripts (`studio/public/voix/*.lignes.json`), les vidéos
     `studio/src/videos/*.tsx`, et toute amélioration du studio. Jamais les .mp4, .mp3 ni les captures (voir .gitignore).
     `git push origin pubs`. Ne jamais toucher à `main`.

## Améliorer la recette

Si quelque chose a mal marché (mot mal prononcé, capture ratée, idée de scène réussie), corriger l’outil concerné
(lexique, captures, moteur) et noter en une ligne dans `NOTES.md` ce qui a été appris, pour les nuits suivantes.

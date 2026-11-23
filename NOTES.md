# Ce que les nuits ont appris

- 2026-11-22 : les captures doivent faire 1170 × 2532 (viewport 390 × 844 à ×3), sinon le cadre du téléphone rogne les côtés.
- 2026-11-22 : ne pas zoomer sur les écrans (×1,12 au plus) : surligner le détail à la place.
- 2026-11-22 : « in shâ’ Allâh » est mal transcrit ; préférer l’éviter ou vérifier à l’oreille.
- 2026-11-22 (essai) : « rizq » était prononcé « risque » → lexique (« la subsistance »).
- 2026-11-22 (essai) : ﷺ s’affiche mal en DM Sans gras → police Amiri pour les mots qui le contiennent (fait dans SousTitres ; à faire aussi dans les cartes de texte).
- 2026-11-22 (essai) : la voix « apaisant » à 1,12 était trop courte (14 s) → VITESSE=0.92 pour ce format.
- 2026-11-22 (essai) : un même texte peut apparaître deux fois sur un écran (ex. « 24 » du calendrier et « 24 / 30 ») → vérifier l’occurrence (3ᵉ argument de zone).
- 2026-11-23 : captures datées du jour de publication avec `DECALAGE_JOURS=1` (« Mardi 24 novembre », thème du mardi) ; la session du faux serveur reste à l’heure réelle (géré dans tout.cjs).
- 2026-11-23 : ElevenLabs refuse au-delà de ~3 voix en parallèle (429) : lancer les voix par 3.
- 2026-11-23 : un « et » ajouté en fin de phrase passait le contrôle (les « et » étaient ignorés) → voix.py compte maintenant les mots en trop.
- 2026-11-23 : homophones que la transcription ne distingue pas (priée/prier, rattrapée/rattrapé) → reformuler.
- 2026-11-23 : un bruitage sur un mot peut le rendre incompréhensible dans le mix final (« tenus » entendu « finis ») → toujours `voix/verif.sh` sur le .mp4 final, et sons placés entre les mots.
- 2026-11-23 : crête à -0,9 dB après AAC → finaliser.sh vise maintenant -2 dB.
- 2026-11-23 : écrans en bas de page (bibliothèque, journée) : on ne peut pas descendre plus, cadrer sur le début d’une ligne ; bannières « patience » et « souvenir » marquées vues dans l’état de démo.
- 2026-11-23 : nouveaux écrans : moments (moments favorables dépliés), fiche-dormir, fiche-fajr, accueil-mariage, parcours-mariage. `voix/textes.ts` copie les textes religieux par programme.

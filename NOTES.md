# Ce que les nuits ont appris

- 2026-11-22 : les captures doivent faire 1170 × 2532 (viewport 390 × 844 à ×3), sinon le cadre du téléphone rogne les côtés.
- 2026-11-22 : ne pas zoomer sur les écrans (×1,12 au plus) : surligner le détail à la place.
- 2026-11-22 : « in shâ’ Allâh » est mal transcrit ; préférer l’éviter ou vérifier à l’oreille.
- 2026-11-22 (essai) : « rizq » était prononcé « risque » → lexique (« la subsistance »).
- 2026-11-22 (essai) : ﷺ s’affiche mal en DM Sans gras → police Amiri pour les mots qui le contiennent (fait dans SousTitres ; à faire aussi dans les cartes de texte).
- 2026-11-22 (essai) : la voix « apaisant » à 1,12 était trop courte (14 s) → VITESSE=0.92 pour ce format.
- 2026-11-22 (essai) : un même texte peut apparaître deux fois sur un écran (ex. « 24 » du calendrier et « 24 / 30 ») → vérifier l’occurrence (3ᵉ argument de zone).
- 2026-11-22 (nuit) : lancer les 7 voix en même temps donne des erreurs 429 → voix.py attend et recommence tout seul ; mieux vaut quand même 2 ou 3 à la fois.
- 2026-11-22 (nuit) : « pour quoi » est transcrit « pourquoi » (jamais parfait) → reformuler (« de quoi »).
- 2026-11-22 (nuit) : apaisant trop court → PAUSE=0.9 (silence entre phrases, variable de voix.py) + VITESSE=0.92 ; rester sous 1,2 s de silence.
- 2026-11-22 (nuit) : voix/textes.ts copie les textes religieux par programme (programme, journee, citadelle, parcours, textes) → plus rien à extraire à la main.
- 2026-11-22 (nuit) : nouvelles captures « moments » (moments favorables dépliés) et « mariage-accueil / mariage-journee / mariage-lecture » (autre besoin que la dette) ; « ciel » recadré sans carte coupée.
- 2026-11-22 (nuit) : dans les écrans en surimpression (journal, geste), le manifeste contient aussi les textes de la page dessous : vérifier le n° d’occurrence (zone lève une erreur si absent).
- 2026-11-22 (nuit) : les mots avec apostrophe (« l’apprends », « l’heure », « l’imprévu ») : chercher /apprends/ sans ^ dans mot().
- 2026-11-22 (nuit) : ne pas afficher « Les moments où l’invocation est exaucée » (titre de textes.ts) dans une pub : ça sonne comme une promesse → « Les moments favorables ».
- 2026-11-22 (nuit) : pas de faux commentaires d’utilisateurs (même dans un quiz) : proposer des réponses (« Oui, trouvé ✓ / Pas cette fois »).

# Programme du rizq

Application de suivi d'invocations islamiques (du'â et adhkâr) reliées à un objectif concret.
Public : musulmans francophones (France, Belgique, Maghreb, Afrique de l'Ouest, Québec).
Langue de l'interface : français.

## Le prototype de référence

Le fichier `reference/rizq.html` est le prototype complet, validé par le porteur du projet.
Il contient tout le contenu (invocations, sources, parcours), le design et la logique.
Il sert de cahier des charges vivant : reproduire son comportement, ses textes et son design,
sans recopier son architecture (un seul fichier HTML, stockage propre à claude.ai).

Avant toute fonctionnalité, relire la partie correspondante du prototype.

## Stack technique

- Next.js (App Router) + TypeScript, en application web installable (PWA)
- Supabase : authentification, base Postgres, temps réel, Row Level Security
- Hébergement : Vercel
- Plus tard : Capacitor pour publier sur l'App Store et Google Play

## Règles non négociables

1. **Contenu religieux** : ne jamais modifier un texte arabe, une phonétique, une traduction
   ou une source sans demande explicite. Ne jamais ajouter d'invocation non sourcée.
   Tout le contenu religieux vit dans un seul fichier de données (`content/`), pas dans les composants.
2. **Données sensibles** : l'usage de l'application révèle la religion de l'utilisateur
   (donnée sensible au sens de l'article 9 du RGPD). Consentement explicite à l'inscription,
   aucune donnée envoyée à un tiers, aucun outil d'analyse publicitaire.
3. **Anonymat de la communauté** : les publications et statistiques communautaires
   ne doivent jamais permettre de relier une activité à l'identité d'un utilisateur.
   Utiliser un identifiant anonyme distinct de l'identifiant du compte.
4. **Sécurité** : toutes les règles d'accès sont appliquées côté serveur (RLS Supabase),
   jamais seulement dans l'interface. Un utilisateur ne peut modifier que ses propres données.
5. **Pas d'ostentation** : aucun classement individuel, aucun score public nominatif.
6. **Vocabulaire** : la contribution financière s'appelle « Soutenir l'application »,
   jamais « don », « sadaqa » ni « zakât ».

## Fonctionnalités, par phase

### Phase 1 : le cœur personnel
- Accueil en trois questions (ville, objectif, niveau d'arabe) puis choix du rythme
- Page Jour organisée par moments (matin, journée, soir, mes actions), cartes compactes,
  ligne « prochaine étape », démarrage en douceur, minimum du jour, message bienveillant
- Horaires de prière calculés localement (méthode UOIF 12° par défaut)
- Objectif, parcours de 40 jours (rotation d'une invocation par jour)
- Apprendre par cœur (révision espacée avec masquage progressif)
- Carnet des invocations exaucées
- Suivi, bilan de la semaine et du mois
- Comptes utilisateurs et synchronisation entre appareils
- Export des données personnelles

### Phase 2 : la communauté
- Statistiques collectives, cercles thématiques, fil du jour, défis collectifs
- Demandes de du'â et mur des du'â exaucées
- Modération : file de validation avant publication, signalement, rôle administrateur
- Binôme (optionnel)

### Phase 3 : notifications et soutien
- Notifications push (une par jour maximum, choisies par l'utilisateur)
- Contribution à prix libre (Stripe sur le web)

### Phase 4 : les stores
- Emballage Capacitor, paiements intégrés des stores si requis

## Méthode de travail

- Avancer par petites étapes testables, une fonctionnalité à la fois.
- Proposer un plan avant de coder une fonctionnalité importante.
- Faire un commit Git après chaque étape qui fonctionne.
- Interface mobile d'abord, mode clair et sombre, accessible au clavier.
- Écrire les textes de l'interface en français, avec la typographie française
  (apostrophe ’, guillemets « », espaces avant : ; ? !).

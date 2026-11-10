# Programme du rizq

Application web installable (PWA) de suivi d’invocations reliées à un objectif concret.
Cahier des charges : `CLAUDE.md`. Prototype de référence : `reference/rizq.html`.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # contenu identique au prototype + logique comparée au prototype
npm run build      # version de production
```

## Organisation

- `content/` : tout le contenu religieux (invocations, sources, thèmes, parcours) et les réglages.
  Généré une fois à l’identique depuis le prototype (`scripts/extract-content.mjs`) ;
  `tests/content.test.ts` vérifie qu’aucun texte n’a changé.
- `lib/` : logique pure (dates, horaires de prière, modèle d’une journée, révision, bilans, stockage).
- `components/` : interface ; `components/views/` : une vue par page.
- `app/` : routes Next.js, manifeste PWA. `public/sw.js` : fonctionnement hors ligne.

## État

Sans configuration Supabase, les données restent sur l’appareil, avec export, import et effacement
dans « Plus › Mes données ». Avec Supabase (voir `supabase/README.md`) : comptes par code e-mail,
synchronisation entre appareils, communauté anonyme avec modération.

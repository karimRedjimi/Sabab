# Mettre en place Supabase

Sans ces réglages, l’application fonctionne entièrement sur l’appareil (pas de compte, pas de communauté).

## 1. Créer la base

Supabase › **SQL Editor** › **New query** : coller tout le contenu de `migrations/0001_init.sql`, puis **Run**.

Le schéma est testé en local : `supabase/tests/run.sh` (nécessite un Postgres local).

## 2. Connexion par code à 6 chiffres

Supabase › **Authentication** › **Emails** › **Templates** › **Magic Link** : remplacer le contenu par

```html
<h2>Ton code de connexion</h2>
<p>Voici ton code pour te connecter à Sabab :</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>Il est valable une heure. Si tu n’as rien demandé, ignore ce message.</p>
```

Faire de même pour le modèle **Confirm signup** (premier compte).

Supabase › **Authentication** › **URL Configuration** : **Site URL** = l’adresse Vercel (par exemple `https://sabab.vercel.app`).

Pour la production, configurer un envoi d’e-mails dédié (Authentication › **SMTP Settings**) : l’envoi intégré de Supabase est limité à quelques e-mails par heure.

## 3. Brancher l’application

Vercel › projet › **Settings** › **Environment Variables** :

- `NEXT_PUBLIC_SUPABASE_URL` = la Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la clé *anon public*

Puis **Deployments** › dernier déploiement › **Redeploy**.

## 4. Nommer un modérateur

Après t’être connecté une première fois dans l’application, dans le **SQL Editor** :

```sql
insert into private.moderators (user_id)
select id from auth.users where email = 'ton-adresse@exemple.fr';
```

La page **Plus › Mon compte › Modération** apparaît alors.

## Ce que garantit le schéma

- Chaque membre ne lit et ne modifie que ses propres données (règles d’accès côté serveur).
- Rien n’est enregistré sans consentement explicite.
- Dans la communauté, les membres ne voient jamais d’identifiant : seulement le texte, la catégorie, le prénom choisi et un compteur collectif. Le lien entre un compte et son identifiant anonyme est gardé dans un schéma privé, inaccessible depuis l’application.
- Une demande n’est visible qu’après relecture ; trois signalements la renvoient en relecture.
- Une seule du’â comptée par membre et par demande ; trois demandes par jour au plus.
- « Supprimer mon compte » efface le compte, les données, les demandes et les du’â.

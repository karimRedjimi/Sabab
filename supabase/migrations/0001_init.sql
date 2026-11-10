-- =====================================================================
-- Programme du rizq : schéma initial
-- Règles du cahier des charges :
--  - consentement explicite (article 9 du RGPD) avant tout enregistrement ;
--  - chaque utilisateur ne lit et ne modifie que ses propres données (RLS) ;
--  - dans la communauté, aucune donnée ne relie une activité au compte :
--    un identifiant anonyme distinct, gardé dans un schéma privé ;
--  - aucun classement, aucun score nominatif : seulement des compteurs collectifs.
-- À exécuter dans Supabase : SQL Editor › New query › coller › Run.
-- =====================================================================

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;

-- ---------------------------------------------------------------------
-- 1. Profil et consentement
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  consent_at timestamptz not null,
  consent_version text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profil : lecture du sien" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profil : création du sien" on public.profiles for insert to authenticated with check (id = auth.uid() and consent_at is not null);
create policy "profil : mise à jour du sien" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create function private.has_consent() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 2. Données personnelles synchronisées (progression, carnet, notes…)
-- ---------------------------------------------------------------------
create table public.trackers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at bigint not null,
  check (octet_length(data::text) < 2000000)
);
alter table public.trackers enable row level security;
create policy "données : lecture des siennes" on public.trackers for select to authenticated using (user_id = auth.uid());
create policy "données : création des siennes" on public.trackers for insert to authenticated with check (user_id = auth.uid() and private.has_consent());
create policy "données : mise à jour des siennes" on public.trackers for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "données : suppression des siennes" on public.trackers for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 3. Identité anonyme et rôles (schéma privé, jamais exposé aux clients)
-- ---------------------------------------------------------------------
create table private.anon_ids (
  user_id uuid primary key references auth.users(id) on delete cascade,
  anon_id uuid not null unique default gen_random_uuid()
);
create table private.moderators (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create function private.my_anon_id() returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid;
begin
  if auth.uid() is null then return null; end if;
  select anon_id into a from private.anon_ids where user_id = auth.uid();
  if a is null then
    insert into private.anon_ids (user_id) values (auth.uid()) on conflict (user_id) do nothing;
    select anon_id into a from private.anon_ids where user_id = auth.uid();
  end if;
  return a;
end $$;

create function public.is_moderator() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from private.moderators where user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------
-- 4. Demandes de du’â (anonymes, relues avant publication)
-- ---------------------------------------------------------------------
create table private.requests (
  id uuid primary key default gen_random_uuid(),
  anon_id uuid not null,
  cat text not null check (cat in ('emploi','activite','dette','mariage','famille','etudes','sante','epreuve','autre')),
  text text not null check (char_length(text) between 10 and 300),
  pseudo text not null default '' check (char_length(pseudo) <= 30),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  answered boolean not null default false,
  prayers integer not null default 0,
  reports integer not null default 0,
  created_at timestamptz not null default now()
);
create index on private.requests (status, created_at desc);
create index on private.requests (anon_id);

create table private.prayers (
  request_id uuid not null references private.requests(id) on delete cascade,
  anon_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (request_id, anon_id)
);
create table private.reports (
  request_id uuid not null references private.requests(id) on delete cascade,
  anon_id uuid not null,
  reason text not null default '' check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  primary key (request_id, anon_id)
);

-- Ce que voit un membre : jamais l’identifiant anonyme d’autrui.
create type public.request_view as (
  id uuid, cat text, text text, pseudo text, status text, answered boolean,
  prayers integer, created_at timestamptz, mine boolean, prayed boolean
);

-- Publier une demande (3 par jour au plus).
create function public.post_request(p_cat text, p_text text, p_pseudo text default '') returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id(); r uuid;
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if (select count(*) from private.requests where anon_id = a and created_at > now() - interval '1 day') >= 3 then
    raise exception 'limite atteinte : trois demandes par jour';
  end if;
  insert into private.requests (anon_id, cat, text, pseudo) values (a, p_cat, btrim(p_text), btrim(coalesce(p_pseudo, ''))) returning id into r;
  return r;
end $$;

-- Le fil : demandes publiées et non exaucées des autres, d’une catégorie ou de toutes.
create function public.feed_requests(p_cat text default null, p_limit integer default 30) returns setof public.request_view
language sql volatile security definer set search_path = '' as $$
  select r.id, r.cat, r.text, r.pseudo, r.status, r.answered, r.prayers, r.created_at, false,
         exists (select 1 from private.prayers p where p.request_id = r.id and p.anon_id = private.my_anon_id())
  from private.requests r
  where r.status = 'approved' and not r.answered
    and r.anon_id <> private.my_anon_id()
    and (p_cat is null or r.cat = p_cat)
    and private.has_consent()
  order by r.created_at desc
  limit least(greatest(p_limit, 1), 100);
$$;

-- Mes demandes, avec le nombre de du’â reçues.
create function public.my_requests() returns setof public.request_view
language sql volatile security definer set search_path = '' as $$
  select r.id, r.cat, r.text, r.pseudo, r.status, r.answered, r.prayers, r.created_at, true, false
  from private.requests r where r.anon_id = private.my_anon_id() order by r.created_at desc;
$$;

-- « J’ai fait une du’â » : une fois par demande et par membre, jamais pour soi-même.
create function public.pray_for(p_id uuid) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id(); n integer;
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if not exists (select 1 from private.requests where id = p_id and status = 'approved' and anon_id <> a) then
    raise exception 'demande introuvable';
  end if;
  insert into private.prayers (request_id, anon_id) values (p_id, a) on conflict do nothing;
  if found then update private.requests set prayers = prayers + 1 where id = p_id; end if;
  select prayers into n from private.requests where id = p_id;
  return n;
end $$;

create function public.mark_answered(p_id uuid) returns void
language sql volatile security definer set search_path = '' as $$
  update private.requests set answered = true where id = p_id and anon_id = private.my_anon_id();
$$;

create function public.delete_request(p_id uuid) returns void
language sql volatile security definer set search_path = '' as $$
  delete from private.requests where id = p_id and (anon_id = private.my_anon_id() or public.is_moderator());
$$;

-- Signaler : à trois signalements, la demande repart en relecture.
create function public.report_request(p_id uuid, p_reason text default '') returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id();
begin
  if a is null then raise exception 'connexion requise'; end if;
  insert into private.reports (request_id, anon_id, reason) values (p_id, a, left(coalesce(p_reason, ''), 200)) on conflict do nothing;
  if found then
    update private.requests set reports = reports + 1,
      status = case when reports + 1 >= 3 and status = 'approved' then 'pending' else status end
    where id = p_id;
  end if;
end $$;

-- Modération (rôle administrateur).
create function public.moderation_queue() returns setof public.request_view
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_moderator() then raise exception 'réservé à la modération'; end if;
  return query select r.id, r.cat, r.text, r.pseudo, r.status, r.answered, r.reports, r.created_at, false, false
    from private.requests r where r.status = 'pending' order by r.reports desc, r.created_at;
end $$;

create function public.moderate(p_id uuid, p_status text) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_moderator() then raise exception 'réservé à la modération'; end if;
  if p_status not in ('approved', 'rejected') then raise exception 'statut invalide'; end if;
  update private.requests set status = p_status, reports = case when p_status = 'approved' then 0 else reports end where id = p_id;
end $$;

-- ---------------------------------------------------------------------
-- 5. Supprimer son compte et toutes ses données
-- ---------------------------------------------------------------------
create function public.delete_my_account() returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select anon_id into a from private.anon_ids where user_id = auth.uid();
  if a is not null then
    delete from private.requests where anon_id = a;
    delete from private.prayers where anon_id = a;
    delete from private.reports where anon_id = a;
  end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------------------------------------------------------------------
-- 6. Droits : seules les fonctions ci-dessus sont accessibles, et seulement connecté
-- ---------------------------------------------------------------------
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
-- La règle d’accès aux données personnelles vérifie le consentement : elle doit pouvoir l’appeler.
grant usage on schema private to authenticated;
grant execute on function private.has_consent() to authenticated;
revoke execute on all functions in schema public from public, anon;
revoke all on public.profiles, public.trackers from anon;
grant execute on function
  public.is_moderator(), public.post_request(text, text, text), public.feed_requests(text, integer),
  public.my_requests(), public.pray_for(uuid), public.mark_answered(uuid), public.delete_request(uuid),
  public.report_request(uuid, text), public.moderation_queue(), public.moderate(uuid, text), public.delete_my_account()
to authenticated;

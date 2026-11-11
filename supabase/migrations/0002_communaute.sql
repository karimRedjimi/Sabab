-- =====================================================================
-- Communauté, deuxième volet :
--   1. « Une minute pour les autres » : la file de du’â du jour
--   2. « Un jour, un verset » : récitations audio de la communauté
-- À exécuter après 0001_init.sql, dans l’éditeur SQL de Supabase.
-- Mêmes principes : rien n’est accessible hors des fonctions ci-dessous,
-- personne ne voit l’identifiant d’un autre, tout est relu avant publication.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. La file de du’â : des demandes pour lesquelles je n’ai pas encore invoqué.
--    Celles de mon domaine d’abord, puis celles qui ont reçu le moins de du’â :
--    ainsi personne n’est oublié.
-- ---------------------------------------------------------------------
create function public.dua_queue(p_cat text default null, p_limit integer default 5) returns setof public.request_view
language sql volatile security definer set search_path = '' as $$
  select r.id, r.cat, r.text, r.pseudo, r.status, r.answered, r.prayers, r.created_at, false, false
  from private.requests r
  where r.status = 'approved' and not r.answered
    and r.anon_id <> private.my_anon_id()
    and not exists (select 1 from private.prayers p where p.request_id = r.id and p.anon_id = private.my_anon_id())
    and private.has_consent()
  order by (p_cat is not null and r.cat = p_cat) desc, r.prayers asc, r.created_at asc
  limit least(greatest(p_limit, 1), 20);
$$;

-- ---------------------------------------------------------------------
-- 2. Récitations audio
-- ---------------------------------------------------------------------
create table private.recitations (
  id uuid primary key default gen_random_uuid(),
  anon_id uuid not null,
  day date not null,
  ref text not null check (ref ~ '^[0-9]{1,3}:[0-9]{1,3}$'),
  path text not null unique,
  seconds integer not null check (seconds between 1 and 90),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  cheers integer not null default 0,
  reports integer not null default 0,
  voice_consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (anon_id, day)
);
create index on private.recitations (day, status, created_at desc);

create table private.recitation_cheers (
  recitation_id uuid not null references private.recitations(id) on delete cascade,
  anon_id uuid not null,
  primary key (recitation_id, anon_id)
);
create table private.recitation_reports (
  recitation_id uuid not null references private.recitations(id) on delete cascade,
  anon_id uuid not null,
  primary key (recitation_id, anon_id)
);
alter table private.recitations enable row level security;
alter table private.recitation_cheers enable row level security;
alter table private.recitation_reports enable row level security;

-- Ce que voit un membre : jamais l’identifiant anonyme d’autrui.
-- Le nombre d’encouragements n’est visible que par l’auteur (pas de score public).
create type public.recitation_view as (
  id uuid, day date, ref text, path text, seconds integer, status text,
  created_at timestamptz, mine boolean, cheered boolean, cheers integer
);

-- Le dossier où je dépose mes enregistrements : mon identifiant anonyme, jamais celui du compte.
create function public.recitation_folder() returns text
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not private.has_consent() then raise exception 'consentement requis'; end if;
  return private.my_anon_id()::text;
end $$;

-- Publier sa récitation du jour (une par jour ; l’accord pour la voix est obligatoire).
create function public.post_recitation(p_day date, p_ref text, p_path text, p_seconds integer, p_voice_consent boolean) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id(); r uuid;
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if p_voice_consent is not true then raise exception 'accord pour la voix requis'; end if;
  if p_day is null or abs(p_day - current_date) > 1 then raise exception 'jour invalide'; end if;
  if p_path not like a::text || '/%' or p_path like '%..%' then raise exception 'chemin invalide'; end if;
  if exists (select 1 from private.recitations where anon_id = a and day = p_day) then
    raise exception 'limite atteinte : une récitation par jour';
  end if;
  insert into private.recitations (anon_id, day, ref, path, seconds) values (a, p_day, p_ref, p_path, p_seconds) returning id into r;
  return r;
end $$;

-- Les récitations du jour : les miennes (quel que soit leur état) puis celles des autres, publiées.
create function public.feed_recitations(p_day date) returns setof public.recitation_view
language sql volatile security definer set search_path = '' as $$
  select r.id, r.day, r.ref, r.path, r.seconds, r.status, r.created_at,
         r.anon_id = private.my_anon_id(),
         exists (select 1 from private.recitation_cheers c where c.recitation_id = r.id and c.anon_id = private.my_anon_id()),
         case when r.anon_id = private.my_anon_id() then r.cheers else null end
  from private.recitations r
  where r.day = p_day and private.has_consent()
    and (r.status = 'approved' or r.anon_id = private.my_anon_id())
  order by (r.anon_id = private.my_anon_id()) desc, r.created_at desc
  limit 60;
$$;

-- Encourager une récitation : une fois, jamais la sienne.
create function public.cheer_recitation(p_id uuid) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id();
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if not exists (select 1 from private.recitations where id = p_id and status = 'approved' and anon_id <> a) then
    raise exception 'récitation introuvable';
  end if;
  insert into private.recitation_cheers (recitation_id, anon_id) values (p_id, a) on conflict do nothing;
  if found then update private.recitations set cheers = cheers + 1 where id = p_id; end if;
end $$;

-- Signaler : à trois signalements, la récitation repart en relecture.
create function public.report_recitation(p_id uuid) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id();
begin
  if a is null then raise exception 'connexion requise'; end if;
  insert into private.recitation_reports (recitation_id, anon_id) values (p_id, a) on conflict do nothing;
  if found then
    update private.recitations set reports = reports + 1,
      status = case when reports + 1 >= 3 and status = 'approved' then 'pending' else status end
    where id = p_id;
  end if;
end $$;

-- Supprimer sa récitation (ou, pour la modération, n’importe laquelle). Renvoie le fichier à effacer.
create function public.delete_recitation(p_id uuid) returns text
language sql volatile security definer set search_path = '' as $$
  delete from private.recitations where id = p_id and (anon_id = private.my_anon_id() or public.is_moderator()) returning path;
$$;

-- Les fichiers de mes récitations (pour les effacer avant de supprimer son compte).
create function public.my_recitation_paths() returns setof text
language sql volatile security definer set search_path = '' as $$
  select path from private.recitations where anon_id = private.my_anon_id();
$$;

-- Qui peut écouter un fichier : son auteur, la modération, et tout membre une fois la récitation publiée.
create function public.can_hear(p_path text) returns boolean
language sql volatile security definer set search_path = '' as $$
  select private.has_consent() and exists (
    select 1 from private.recitations r where r.path = p_path
      and (r.status = 'approved' or r.anon_id = private.my_anon_id() or public.is_moderator()));
$$;

-- Modération des récitations.
create function public.recitation_queue() returns setof public.recitation_view
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_moderator() then raise exception 'réservé à la modération'; end if;
  return query select r.id, r.day, r.ref, r.path, r.seconds, r.status, r.created_at, false, false, r.reports
    from private.recitations r where r.status = 'pending' order by r.reports desc, r.created_at;
end $$;

create function public.moderate_recitation(p_id uuid, p_status text) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if not public.is_moderator() then raise exception 'réservé à la modération'; end if;
  if p_status not in ('approved', 'rejected') then raise exception 'statut invalide'; end if;
  update private.recitations set status = p_status, reports = case when p_status = 'approved' then 0 else reports end where id = p_id;
end $$;

-- Supprimer son compte : les récitations partent aussi.
create or replace function public.delete_my_account() returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid;
begin
  if auth.uid() is null then raise exception 'connexion requise'; end if;
  select anon_id into a from private.anon_ids where user_id = auth.uid();
  if a is not null then
    delete from private.requests where anon_id = a;
    delete from private.prayers where anon_id = a;
    delete from private.reports where anon_id = a;
    delete from private.recitations where anon_id = a;
    delete from private.recitation_cheers where anon_id = a;
    delete from private.recitation_reports where anon_id = a;
  end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------------------------------------------------------------------
-- 3. Stockage des fichiers audio : un espace privé, jamais public.
--    Chacun dépose dans son dossier anonyme ; on n’écoute que ce qui est publié.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recitations', 'recitations', false, 2097152, array['audio/mp4', 'audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/aac'])
on conflict (id) do nothing;

create policy "recitations : déposer dans son dossier" on storage.objects for insert to authenticated
  with check (bucket_id = 'recitations' and (storage.foldername(name))[1] = public.recitation_folder());
create policy "recitations : écouter ce qui est publié" on storage.objects for select to authenticated
  using (bucket_id = 'recitations' and public.can_hear(name));
create policy "recitations : effacer les siens" on storage.objects for delete to authenticated
  using (bucket_id = 'recitations' and ((storage.foldername(name))[1] = public.recitation_folder() or public.is_moderator()));

-- ---------------------------------------------------------------------
-- 4. Droits
-- ---------------------------------------------------------------------
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_consent() to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.dua_queue(text, integer), public.recitation_folder(),
  public.post_recitation(date, text, text, integer, boolean), public.feed_recitations(date),
  public.cheer_recitation(uuid), public.report_recitation(uuid), public.delete_recitation(uuid),
  public.my_recitation_paths(), public.can_hear(text), public.recitation_queue(),
  public.moderate_recitation(uuid, text), public.delete_my_account()
to authenticated;

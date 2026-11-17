-- =====================================================================
-- Les rappels (notifications). À exécuter après 0003_moderation_auto.sql.
-- Avant : Supabase › Database › Extensions › activer « pg_cron » et « pg_net ».
--
-- Principe : le téléphone calcule lui-même les rappels des 7 prochains jours
-- (sa position ne quitte jamais l’appareil) et envoie seulement la liste
-- des heures et des textes. Chaque minute, la base transmet ceux qui sont dus
-- à l’application (route /api/push), qui les chiffre et les envoie.
-- =====================================================================

-- Les appareils abonnés aux rappels
create table private.push_subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and char_length(endpoint) < 1000),
  p256dh text not null check (char_length(p256dh) < 200),
  auth text not null check (char_length(auth) < 100),
  created_at timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
create index on private.push_subs (user_id);

-- Les rappels à venir
create table private.push_queue (
  id bigserial primary key,
  sub_id uuid not null references private.push_subs(id) on delete cascade,
  at timestamptz not null,
  payload jsonb not null,
  sent_at timestamptz
);
create index on private.push_queue (at) where sent_at is null;
create index on private.push_queue (sub_id);

-- Réglages de l’envoi : l’adresse de l’application et le secret partagé avec elle
create table private.push_config (k text primary key, v text not null);
insert into private.push_config values
  ('url', 'https://sabab-six.vercel.app/api/push'),
  ('secret', replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
on conflict (k) do nothing;

-- Les envois en cours (pour retirer les appareils qui se sont désabonnés)
create table private.push_requests (req_id bigint primary key, created_at timestamptz not null default now());

alter table private.push_subs enable row level security;
alter table private.push_queue enable row level security;
alter table private.push_config enable row level security;
alter table private.push_requests enable row level security;

-- S’abonner (un appareil appartient au dernier compte qui s’y est connecté)
create function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text) returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  if auth.uid() is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  insert into private.push_subs (user_id, endpoint, p256dh, auth) values (auth.uid(), p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, last_seen = now();
end $$;

-- Se désabonner
create function public.push_unsubscribe(p_endpoint text) returns void
language sql volatile security definer set search_path = '' as $$
  delete from private.push_subs where endpoint = p_endpoint and user_id = auth.uid();
$$;

-- Remplacer les rappels à venir de cet appareil (au plus 150, dans les 8 prochains jours)
create function public.push_schedule(p_endpoint text, p_items jsonb) returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare s uuid; n integer;
begin
  if auth.uid() is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  select id into s from private.push_subs where endpoint = p_endpoint and user_id = auth.uid();
  if s is null then raise exception 'appareil inconnu'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 150 then raise exception 'liste invalide'; end if;
  update private.push_subs set last_seen = now() where id = s;
  delete from private.push_queue where sub_id = s and sent_at is null;
  insert into private.push_queue (sub_id, at, payload)
    select s, (i->>'at')::timestamptz,
           jsonb_build_object('title', left(i->>'title', 80), 'body', left(i->>'body', 200), 'url', i->>'url', 'tag', left(i->>'tag', 40), 'id', left(i->>'id', 60))
    from jsonb_array_elements(p_items) i
    where (i->>'at')::timestamptz > now() and (i->>'at')::timestamptz < now() + interval '8 days'
      and coalesce(i->>'url', '') ~ '^/[^/]' and coalesce(i->>'title', '') <> '';
  get diagnostics n = row_count;
  return n;
end $$;

-- Chaque minute : transmettre les rappels dus, et retirer les appareils désabonnés
create function private.push_tick() returns integer
language plpgsql volatile security definer set search_path = '' as $$
declare u text; sec text; batch jsonb; r record; req bigint; n integer := 0;
begin
  select v into u from private.push_config where k = 'url';
  select v into sec from private.push_config where k = 'secret';
  if u is null or sec is null then return 0; end if;

  for r in select p.req_id, h.status_code, h.content from private.push_requests p join net._http_response h on h.id = p.req_id loop
    if r.status_code = 200 and r.content is not null then
      delete from private.push_subs where endpoint in (select jsonb_array_elements_text((r.content::jsonb)->'gone'));
    end if;
    delete from private.push_requests where req_id = r.req_id;
  end loop;
  delete from private.push_requests where created_at < now() - interval '1 hour';

  with due as (
    update private.push_queue q set sent_at = now()
    where q.id in (select id from private.push_queue where sent_at is null and at <= now() and at > now() - interval '15 minutes' order by at limit 500 for update skip locked)
    returning q.sub_id, q.payload
  )
  select jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'p256dh', s.p256dh, 'auth', s.auth, 'payload', d.payload)), count(*)
    into batch, n
  from due d join private.push_subs s on s.id = d.sub_id;

  if batch is not null then
    select net.http_post(url := u, body := jsonb_build_object('items', batch),
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', sec), timeout_milliseconds := 15000) into req;
    insert into private.push_requests (req_id) values (req);
  end if;

  delete from private.push_queue where at < now() - interval '2 days';
  delete from private.push_queue where sent_at is null and at <= now() - interval '15 minutes';
  return coalesce(n, 0);
end $$;

-- Droits
revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_consent() to authenticated;
revoke execute on all functions in schema public from public, anon;
grant execute on function public.push_subscribe(text, text, text), public.push_unsubscribe(text), public.push_schedule(text, jsonb) to authenticated;

-- Lancer l’envoi chaque minute (si pg_cron est activé ; sinon, relancer cette ligne après l’avoir activé)
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('sabab-rappels', '* * * * *', 'select private.push_tick()');
  end if;
end $$;

-- =====================================================================
-- Modération automatique (à exécuter après 0002_communaute.sql).
--   · Souhaits écrits : un filtre refuse les vulgarités, les insultes,
--     les liens et les moyens de contact. Ce qui passe est publié aussitôt.
--   · Récitations audio : publiées aussitôt (une par jour, 3 secondes au moins).
--   · Filet de sécurité : les signalements des membres masquent le contenu
--     (3 pour un souhait, 2 pour une récitation), sans intervention humaine.
-- Aucun texte n’est envoyé à un service extérieur : tout se fait dans la base.
-- Pour ajouter un mot à refuser :  insert into private.banned_words values ('mot');
-- (en minuscules, sans accent ; une expression de plusieurs mots est possible)
-- =====================================================================

create table private.banned_words (word text primary key check (word = lower(word) and word !~ '[^a-z ]'));
alter table private.banned_words enable row level security;

insert into private.banned_words (word) values
  -- français
  ('merde'),('merdique'),('emmerde'),('emmerder'),('putain'),('pute'),('putes'),('salope'),('salopard'),('salaud'),('connard'),('connasse'),
  ('con'),('conne'),('encule'),('enculer'),('enculee'),('batard'),('batarde'),('pd'),('pede'),('tapette'),('tarlouze'),('gouine'),
  ('bite'),('couille'),('couilles'),('chier'),('chiant'),('chiotte'),('nique'),('niquer'),('ntm'),('fdp'),('tg'),('ta gueule'),
  ('fils de pute'),('fils de chien'),('nique ta mere'),('nique ta race'),('va te faire'),('bordel'),('foutre'),('branleur'),('branler'),
  ('bouffon'),('abruti'),('abrutie'),('enfoire'),('petasse'),('pouffiasse'),('poufiasse'),('trou du cul'),('trouduc'),('ta chatte'),
  ('porno'),('porn'),('baise'),('baiser'),('suce'),('sale arabe'),('sale noir'),('sale juif'),('sale blanc'),('sale race'),
  ('negre'),('negro'),('bougnoule'),('youpin'),('raton'),('bicot'),('creve'),('va mourir'),('suicide toi'),
  -- anglais
  ('fuck'),('fucking'),('fucker'),('motherfucker'),('shit'),('bullshit'),('bitch'),('asshole'),('dick'),('pussy'),('cunt'),('whore'),
  ('slut'),('bastard'),('nigger'),('nigga'),('faggot'),('wtf'),('stfu'),
  -- arabe écrit en lettres latines
  ('zebi'),('zebbi'),('zeb'),('zob'),('zobi'),('qahba'),('kahba'),('kehba'),('gahba'),('zamel'),('zemel'),('miboun'),('mibun'),
  ('attay'),('sharmouta'),('charmouta'),('sharmuta'),('nik mok'),('nikmok'),('nik'),('niquemok'),('tabon'),('taboun'),('terma'),
  ('wld lqahba'),('weld el kahba'),('yal kalb'),('din mok'),('dine mok'),('naal'),('nal bouk'),('yelean'),('yelan')
on conflict do nothing;

-- Met un texte à plat pour le comparer : minuscules, sans accents, chiffres « déguisés » remis en lettres,
-- ponctuation retirée, lettres étirées ramenées à une seule (« meeerde » → « merde »).
create function private.flatten(t text) returns text
language sql immutable set search_path = '' as $$
  select btrim(regexp_replace(
    regexp_replace(
      regexp_replace(
        translate(lower(coalesce(t, '')),
          'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ013457@$9',
          'aaaaaaceeeeiiiinooooouuuuyyoaoieashasq'),
        '[^a-z]+', ' ', 'g'),
      '([a-z])\1{2,}', '\1', 'g'),
    ' +', ' ', 'g'));
$$;

-- Vérifie un texte : 'ok', 'vulgaire' ou 'contact'.
create function private.text_check(t text) returns text
language plpgsql stable security definer set search_path = '' as $$
declare raw text := coalesce(t, ''); flat text := private.flatten(t); pat text;
begin
  -- Liens, adresses, numéros, comptes de réseaux sociaux : ni publicité, ni moyen de retrouver quelqu’un.
  if raw ~* '(https?://|www\.|[a-z0-9._-]+@[a-z0-9-]+\.[a-z]{2,}|\.(com|fr|net|org|io|be|ma|dz|tn)\M)'
     or regexp_replace(raw, '[^0-9]', '', 'g') ~ '[0-9]{8,}'
     or raw ~ '(^|\s)@[A-Za-z0-9_.]{3,}'
     or flat ~ '\m(whatsapp|telegram|snapchat|snap|insta|instagram|tiktok|facebook|paypal|lydia|cagnotte|leetchi)\M' then
    return 'contact';
  end if;
  select '\m(' || string_agg(replace(word, ' ', ' ?'), '|') || ')(e?s?|x)?\M' into pat from private.banned_words;
  -- Les lettres détachées (« p u t e », « p.u.t.e ») sont recollées avant la comparaison.
  if pat is not null and (flat ~ pat or regexp_replace(flat, '\m([a-z]) (?=[a-z]\M)', '\1', 'g') ~ pat) then return 'vulgaire'; end if;
  return 'ok';
end $$;

-- Publier un souhait : vérifié automatiquement, publié aussitôt (3 par jour au plus).
create or replace function public.post_request(p_cat text, p_text text, p_pseudo text default '') returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id(); r uuid; c text;
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if (select count(*) from private.requests where anon_id = a and created_at > now() - interval '1 day') >= 3 then
    raise exception 'limite atteinte : trois demandes par jour';
  end if;
  c := private.text_check(coalesce(p_text, '') || ' ' || coalesce(p_pseudo, ''));
  if c = 'vulgaire' then raise exception 'message refusé : vulgarité'; end if;
  if c = 'contact' then raise exception 'message refusé : contact'; end if;
  insert into private.requests (anon_id, cat, text, pseudo, status)
    values (a, p_cat, btrim(p_text), btrim(coalesce(p_pseudo, '')), 'approved') returning id into r;
  return r;
end $$;

-- Publier sa récitation : aussitôt visible (une par jour, 3 secondes au moins, accord pour la voix obligatoire).
create or replace function public.post_recitation(p_day date, p_ref text, p_path text, p_seconds integer, p_voice_consent boolean) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id(); r uuid;
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if p_voice_consent is not true then raise exception 'accord pour la voix requis'; end if;
  if p_day is null or abs(p_day - current_date) > 1 then raise exception 'jour invalide'; end if;
  if p_seconds < 3 then raise exception 'récitation trop courte'; end if;
  if p_path not like a::text || '/%' or p_path like '%..%' then raise exception 'chemin invalide'; end if;
  if exists (select 1 from private.recitations where anon_id = a and day = p_day) then
    raise exception 'limite atteinte : une récitation par jour';
  end if;
  insert into private.recitations (anon_id, day, ref, path, seconds, status) values (a, p_day, p_ref, p_path, p_seconds, 'approved') returning id into r;
  return r;
end $$;

-- Signaler une récitation : à deux signalements, elle est masquée.
create or replace function public.report_recitation(p_id uuid) returns void
language plpgsql volatile security definer set search_path = '' as $$
declare a uuid := private.my_anon_id();
begin
  if a is null or not private.has_consent() then raise exception 'consentement requis'; end if;
  if exists (select 1 from private.recitations where id = p_id and anon_id = a) then return; end if;
  insert into private.recitation_reports (recitation_id, anon_id) values (p_id, a) on conflict do nothing;
  if found then
    update private.recitations set reports = reports + 1,
      status = case when reports + 1 >= 2 and status = 'approved' then 'pending' else status end
    where id = p_id;
  end if;
end $$;

-- Ce qui attendait une relecture manuelle est repris par le filtre.
update private.requests set status = case when private.text_check(text || ' ' || pseudo) = 'ok' then 'approved' else 'rejected' end
  where status = 'pending' and reports = 0;
update private.recitations set status = 'approved' where status = 'pending' and reports = 0;

revoke all on all tables in schema private from public, anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_consent() to authenticated;
revoke execute on all functions in schema public from public, anon;

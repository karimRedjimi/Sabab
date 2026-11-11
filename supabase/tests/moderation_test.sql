-- Tests de la modération automatique.
\set ON_ERROR_STOP 1
-- Le filtre, mot par mot
do $$ declare ok text[] := array[
    'Je cherche un conjoint pieux, invoquez pour moi', 'Une dispute avec mon frère me pèse, une du’â svp', 'J’habite loin de ma famille, facilitez-moi',
    'Que Allah m’accorde le succès à mon concours', 'Ma mère est malade depuis 3 mois, une du’â pour elle', 'Je passe mon permis le 12, invoquez pour moi',
    'Une situation compliquée au travail, qu’Allah facilite', 'Mon fils a des difficultés à l’école', 'Je veux rembourser 2500 euros de dettes'];
  bad text[] := array['c’est de la merde', 'MEEERDE alors', 'bande de c0nnards', 'sale p.u.t.e', 'fils de pute', 'va te faire voir', 'what the fuck', 'ya zebi', 'nique ta mère', 'espèce de salope', 'PUTAIN de vie'];
  contact text[] := array['écrivez-moi sur instagram', 'mon numéro 06 12 34 56 78', 'voir www.exemple.com', 'contact moi@exemple.fr', 'mon snap @karim_93', 'aidez-moi via paypal'];
  t text;
begin
  foreach t in array ok loop if private.text_check(t) <> 'ok' then raise exception 'ÉCHEC : refusé à tort : % (%)', t, private.text_check(t); end if; end loop;
  foreach t in array bad loop if private.text_check(t) <> 'vulgaire' then raise exception 'ÉCHEC : vulgarité non détectée : % (%)', t, private.flatten(t); end if; end loop;
  foreach t in array contact loop if private.text_check(t) <> 'contact' then raise exception 'ÉCHEC : contact non détecté : %', t; end if; end loop;
end $$;

insert into auth.users values ('00000000-0000-0000-0000-000000000021','h@x'),('00000000-0000-0000-0000-000000000022','i@x'),('00000000-0000-0000-0000-000000000023','j@x');
create function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
create temp table t2 (k text primary key, v text); grant all on t2 to authenticated;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-000000000021'); insert into public.profiles values (auth.uid(), now(), 'v1');
select pg_temp.as_user('00000000-0000-0000-0000-000000000022'); insert into public.profiles values (auth.uid(), now(), 'v1');
select pg_temp.as_user('00000000-0000-0000-0000-000000000023'); insert into public.profiles values (auth.uid(), now(), 'v1');

-- H : un message vulgaire ou avec contact est refusé, un message correct est publié aussitôt
select pg_temp.as_user('00000000-0000-0000-0000-000000000021');
do $$ begin
  begin perform public.post_request('autre', 'Vous êtes tous des connards', ''); raise exception 'ÉCHEC : vulgarité publiée'; exception when raise_exception then if sqlerrm not like 'message refusé : vulgarité' then raise; end if; end;
  begin perform public.post_request('autre', 'Une du’â pour moi svp merci', 'ptit con'); raise exception 'ÉCHEC : pseudo vulgaire publié'; exception when raise_exception then if sqlerrm not like 'message refusé : vulgarité' then raise; end if; end;
  begin perform public.post_request('autre', 'Ajoutez-moi sur snapchat pour discuter', ''); raise exception 'ÉCHEC : contact publié'; exception when raise_exception then if sqlerrm not like 'message refusé : contact' then raise; end if; end;
  begin perform * from private.banned_words; raise exception 'ÉCHEC : liste lisible'; exception when insufficient_privilege then null; end;
  begin perform private.text_check('x'); raise exception 'ÉCHEC : filtre appelable directement'; exception when insufficient_privilege then null; end;
end $$;
insert into t2 values ('req', public.post_request('emploi', 'Un entretien important jeudi, invoquez pour moi', '')::text);
insert into t2 values ('folder', public.recitation_folder());
insert into storage.objects (bucket_id, name) values ('recitations', (select v from t2 where k = 'folder') || '/a.m4a');
do $$ begin
  begin perform public.post_recitation(current_date, '2:152', (select v from t2 where k = 'folder') || '/a.m4a', 1, true); raise exception 'ÉCHEC : récitation trop courte acceptée'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;
insert into t2 values ('rec', public.post_recitation(current_date, '2:152', (select v from t2 where k = 'folder') || '/a.m4a', 12, true)::text);
select public.report_recitation((select v from t2 where k = 'rec')::uuid);

-- I voit tout de suite le souhait et la récitation, sans relecture
select pg_temp.as_user('00000000-0000-0000-0000-000000000022');
do $$ begin
  if not exists (select 1 from public.dua_queue() where id = (select v from t2 where k = 'req')::uuid) then raise exception 'ÉCHEC : souhait non publié aussitôt'; end if;
  if not exists (select 1 from public.feed_recitations(current_date) where id = (select v from t2 where k = 'rec')::uuid) then raise exception 'ÉCHEC : récitation non publiée aussitôt (ou masquée par son propre auteur)'; end if;
  if (select count(*) from storage.objects where name like (select v from t2 where k = 'folder') || '/%') <> 1 then raise exception 'ÉCHEC : fichier illisible'; end if;
  perform public.report_recitation((select v from t2 where k = 'rec')::uuid); perform public.report_recitation((select v from t2 where k = 'rec')::uuid);
  if not exists (select 1 from public.feed_recitations(current_date) where id = (select v from t2 where k = 'rec')::uuid) then raise exception 'ÉCHEC : un seul signalement a suffi'; end if;
end $$;
-- J signale aussi : à deux signalements, la récitation est masquée
select pg_temp.as_user('00000000-0000-0000-0000-000000000023');
select public.report_recitation((select v from t2 where k = 'rec')::uuid);
do $$ begin
  if exists (select 1 from public.feed_recitations(current_date) where id = (select v from t2 where k = 'rec')::uuid) then raise exception 'ÉCHEC : récitation encore visible après deux signalements'; end if;
  if (select count(*) from storage.objects where name like (select v from t2 where k = 'folder') || '/%') <> 0 then raise exception 'ÉCHEC : fichier encore écoutable'; end if;
end $$;
reset role;
select 'TOUS LES TESTS DE LA MODÉRATION AUTOMATIQUE PASSENT' as resultat;

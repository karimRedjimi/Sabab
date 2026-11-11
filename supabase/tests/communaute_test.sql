-- Tests du deuxième volet de la communauté (file de du’â, récitations audio).
\set ON_ERROR_STOP 1
insert into auth.users values ('00000000-0000-0000-0000-00000000000d','d@x'),('00000000-0000-0000-0000-00000000000e','e@x'),('00000000-0000-0000-0000-00000000000f','f@x'),('00000000-0000-0000-0000-000000000010','g@x');
insert into private.moderators values ('00000000-0000-0000-0000-00000000000f');
create function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
create temp table t (k text primary key, v text); grant all on t to authenticated;
set role authenticated;

-- D et E consentent ; G ne consent pas
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d'); insert into public.profiles values (auth.uid(), now(), 'v1');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e'); insert into public.profiles values (auth.uid(), now(), 'v1');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000f'); insert into public.profiles values (auth.uid(), now(), 'v1');

-- D publie deux demandes, la modération les publie
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
insert into t values ('r1', public.post_request('mariage', 'Une du’â pour mon mariage svp', '')::text), ('r2', public.post_request('emploi', 'Une du’â pour mon entretien svp', '')::text);
do $$ begin if (select count(*) from public.dua_queue()) <> 0 then raise exception 'ÉCHEC : D voit ses propres demandes dans la file'; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
do $$ begin if (select count(*) from public.dua_queue()) <> 0 then raise exception 'ÉCHEC : demande visible avant relecture'; end if; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000f');
select public.moderate((select v from t where k = 'r1')::uuid, 'approved'), public.moderate((select v from t where k = 'r2')::uuid, 'approved');

-- E : la file met son domaine d’abord, et retire ce pour quoi il a déjà invoqué
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
do $$ declare first uuid; begin
  if (select count(*) from public.dua_queue('emploi', 5)) <> 2 then raise exception 'ÉCHEC : file incomplète'; end if;
  select id into first from public.dua_queue('emploi', 5) limit 1;
  if first::text <> (select v from t where k = 'r2') then raise exception 'ÉCHEC : le domaine de la personne ne passe pas en premier'; end if;
  perform public.pray_for(first);
  if (select count(*) from public.dua_queue('emploi', 5)) <> 1 then raise exception 'ÉCHEC : demande déjà invoquée encore dans la file'; end if;
end $$;

-- Récitations : G (sans consentement) ne peut rien
select pg_temp.as_user('00000000-0000-0000-0000-000000000010');
do $$ begin
  begin perform public.recitation_folder(); raise exception 'ÉCHEC : dossier sans consentement'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  if (select count(*) from public.feed_recitations(current_date)) <> 0 then raise exception 'ÉCHEC : écoute sans consentement'; end if;
end $$;

-- D dépose un fichier dans son dossier, pas dans celui d’un autre
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
insert into t values ('dfolder', public.recitation_folder());
insert into storage.objects (bucket_id, name) values ('recitations', (select v from t where k = 'dfolder') || '/a.m4a');
do $$ begin
  begin insert into storage.objects (bucket_id, name) values ('recitations', 'autre-dossier/a.m4a'); raise exception 'ÉCHEC : dépôt hors de son dossier'; exception when insufficient_privilege then null; end;
  begin perform public.post_recitation(current_date, '2:152', (select v from t where k = 'dfolder') || '/a.m4a', 20, false); raise exception 'ÉCHEC : publication sans accord pour la voix'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  begin perform public.post_recitation(current_date, '2:152', 'autre-dossier/a.m4a', 20, true); raise exception 'ÉCHEC : chemin d’un autre dossier accepté'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;
insert into t values ('rec', public.post_recitation(current_date, '2:152', (select v from t where k = 'dfolder') || '/a.m4a', 20, true)::text);
do $$ begin
  begin perform public.post_recitation(current_date, '2:152', (select v from t where k = 'dfolder') || '/b.m4a', 20, true); raise exception 'ÉCHEC : deux récitations le même jour'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  if (select count(*) from public.feed_recitations(current_date) where mine and status = 'pending') <> 1 then raise exception 'ÉCHEC : D ne voit pas sa récitation en relecture'; end if;
end $$;

-- E ne voit ni n’entend rien avant relecture
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
do $$ begin
  if (select count(*) from public.feed_recitations(current_date)) <> 0 then raise exception 'ÉCHEC : récitation visible avant relecture'; end if;
  if (select count(*) from storage.objects) <> 0 then raise exception 'ÉCHEC : fichier lisible avant relecture'; end if;
  begin perform * from private.recitations; raise exception 'ÉCHEC : lecture directe de la table'; exception when insufficient_privilege then null; end;
  begin perform public.recitation_queue(); raise exception 'ÉCHEC : file de modération ouverte'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  begin perform public.moderate_recitation((select v from t where k = 'rec')::uuid, 'approved'); raise exception 'ÉCHEC : modération ouverte'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;

-- La modération écoute puis publie
select pg_temp.as_user('00000000-0000-0000-0000-00000000000f');
do $$ begin
  if (select count(*) from public.recitation_queue()) <> 1 then raise exception 'ÉCHEC : file de modération vide'; end if;
  if (select count(*) from storage.objects) <> 1 then raise exception 'ÉCHEC : la modération ne peut pas écouter'; end if;
  perform public.moderate_recitation((select v from t where k = 'rec')::uuid, 'approved');
end $$;

-- E écoute, encourage une fois ; ne voit ni l’auteur ni le compteur
select pg_temp.as_user('00000000-0000-0000-0000-00000000000e');
do $$ declare r public.recitation_view; begin
  select * into r from public.feed_recitations(current_date) limit 1;
  if r.id is null or r.mine or r.cheers is not null then raise exception 'ÉCHEC : fil des récitations (%)', r; end if;
  if (select count(*) from storage.objects) <> 1 then raise exception 'ÉCHEC : fichier publié illisible'; end if;
  perform public.cheer_recitation(r.id); perform public.cheer_recitation(r.id);
  if not (select cheered from public.feed_recitations(current_date) limit 1) then raise exception 'ÉCHEC : encouragement non noté'; end if;
  begin delete from storage.objects; if found then raise exception 'ÉCHEC : E efface le fichier de D'; end if; end;
  if public.delete_recitation(r.id) is not null then raise exception 'ÉCHEC : E supprime la récitation de D'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
do $$ begin
  if (select cheers from public.feed_recitations(current_date) where mine) <> 1 then raise exception 'ÉCHEC : compteur d’encouragements'; end if;
  begin perform public.cheer_recitation((select v from t where k = 'rec')::uuid); raise exception 'ÉCHEC : s’encourager soi-même'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;

-- Non connecté : rien
reset role; set role anon; select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  begin perform public.feed_recitations(current_date); raise exception 'ÉCHEC : accès anonyme aux récitations'; exception when insufficient_privilege then null; end;
  begin perform public.dua_queue(); raise exception 'ÉCHEC : accès anonyme à la file'; exception when insufficient_privilege then null; end;
end $$;

-- D supprime son compte : sa récitation disparaît
reset role; set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000d');
select public.delete_my_account();
reset role;
do $$ begin
  if (select count(*) from private.recitations) <> 0 then raise exception 'ÉCHEC : récitations restantes'; end if;
  if (select count(*) from private.recitation_cheers) <> 0 then raise exception 'ÉCHEC : encouragements restants'; end if;
end $$;
select 'TOUS LES TESTS DE LA COMMUNAUTÉ PASSENT' as resultat;

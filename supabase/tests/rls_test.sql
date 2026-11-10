-- Tests des règles d’accès. Chaque bloc échoue bruyamment si une règle est violée.
\set ON_ERROR_STOP 1
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','a@x'),('00000000-0000-0000-0000-00000000000b','b@x'),('00000000-0000-0000-0000-00000000000c','c@x');
insert into private.moderators values ('00000000-0000-0000-0000-00000000000c');

create function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
set role authenticated;

-- A sans consentement ne peut rien enregistrer
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ begin
  begin insert into public.trackers values (auth.uid(), '{}', 1); raise exception 'ÉCHEC : écriture sans consentement'; exception when insufficient_privilege or check_violation then null; end;
  begin perform public.post_request('mariage','Faites une du’â pour moi svp',''); raise exception 'ÉCHEC : demande sans consentement'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;
insert into public.profiles values (auth.uid(), now(), 'v1');
insert into public.trackers values (auth.uid(), '{"days":{}}', 1);

-- B consent et ne voit pas les données de A
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.profiles values (auth.uid(), now(), 'v1');
do $$ begin
  if (select count(*) from public.trackers) <> 0 then raise exception 'ÉCHEC : B voit les données de A'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'ÉCHEC : B voit le profil de A'; end if;
  update public.trackers set data = '{}' where user_id = '00000000-0000-0000-0000-00000000000a';
  begin insert into public.trackers values ('00000000-0000-0000-0000-00000000000a', '{}', 2); raise exception 'ÉCHEC : B écrit chez A'; exception when insufficient_privilege or unique_violation then null; end;
  begin perform * from private.anon_ids; raise exception 'ÉCHEC : B lit les identités anonymes'; exception when insufficient_privilege then null; end;
  begin perform * from private.requests; raise exception 'ÉCHEC : B lit la table des demandes'; exception when insufficient_privilege then null; end;
end $$;

-- A publie une demande : elle n’est pas visible avant relecture
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.post_request('mariage', 'Je cherche un conjoint pieux, faites une du’â pour moi', 'Sara') as req \gset
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ begin if (select count(*) from public.feed_requests()) <> 0 then raise exception 'ÉCHEC : demande visible avant relecture'; end if;
  begin perform public.moderation_queue(); raise exception 'ÉCHEC : B accède à la modération'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end; end $$;

-- C (modération) publie la demande
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin if (select count(*) from public.moderation_queue()) <> 1 then raise exception 'ÉCHEC : file de modération'; end if; end $$;
select public.moderate(:'req', 'approved');

-- B la voit, sans identifiant anonyme, et invoque une seule fois
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
do $$ declare r record; begin
  select * into r from public.feed_requests('mariage');
  if r.id is null or r.pseudo <> 'Sara' or r.mine then raise exception 'ÉCHEC : fil'; end if;
  if public.pray_for(r.id) <> 1 or public.pray_for(r.id) <> 1 then raise exception 'ÉCHEC : double du’â comptée'; end if;
  if not (select prayed from public.feed_requests('mariage') limit 1) then raise exception 'ÉCHEC : du’â non mémorisée'; end if;
  perform public.mark_answered(r.id); perform public.delete_request(r.id);
end $$;

-- A ne peut pas invoquer pour sa propre demande, voit le compteur ; la demande existe toujours
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
do $$ declare r record; begin
  select * into r from public.my_requests();
  if r.prayers <> 1 or r.answered then raise exception 'ÉCHEC : B a modifié la demande de A'; end if;
  begin perform public.pray_for(r.id); raise exception 'ÉCHEC : du’â pour soi-même'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
  if (select count(*) from public.feed_requests()) <> 0 then raise exception 'ÉCHEC : sa propre demande dans le fil'; end if;
  perform public.mark_answered(r.id);
  if not (select answered from public.my_requests() limit 1) then raise exception 'ÉCHEC : marquer exaucée'; end if;
end $$;

-- Limite de trois demandes par jour
do $$ begin
  perform public.post_request('emploi', 'Deuxième demande pour tester', '');
  perform public.post_request('emploi', 'Troisième demande pour tester', '');
  begin perform public.post_request('emploi', 'Quatrième demande de trop', ''); raise exception 'ÉCHEC : limite'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;

-- Anonyme (non connecté) : aucun accès
reset role; set role anon; select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  begin perform public.feed_requests(); raise exception 'ÉCHEC : accès anonyme au fil'; exception when insufficient_privilege then null; end;
  begin perform * from public.trackers; raise exception 'ÉCHEC : accès anonyme aux données'; exception when insufficient_privilege then null; end;
end $$;

-- Suppression du compte : tout disparaît
reset role; set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.delete_my_account();
reset role;
do $$ begin
  if exists (select 1 from auth.users where id = '00000000-0000-0000-0000-00000000000a') then raise exception 'ÉCHEC : compte non supprimé'; end if;
  if exists (select 1 from public.trackers where user_id = '00000000-0000-0000-0000-00000000000a') then raise exception 'ÉCHEC : données restantes'; end if;
  if (select count(*) from private.requests) <> 0 then raise exception 'ÉCHEC : demandes restantes'; end if;
  if (select count(*) from private.prayers) <> 0 then raise exception 'ÉCHEC : du’â restantes'; end if;
end $$;
select 'TOUS LES TESTS DE SÉCURITÉ PASSENT' as resultat;

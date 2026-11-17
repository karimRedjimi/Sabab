-- Tests des rappels
\set ON_ERROR_STOP 1
insert into auth.users values ('00000000-0000-0000-0000-000000000031','r@x'),('00000000-0000-0000-0000-000000000032','s@x');
create function pg_temp.as_user(u text) returns void language sql as $$ select set_config('request.jwt.claim.sub', u, false) $$;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-000000000031');
do $$ begin
  begin perform public.push_subscribe('https://push.example/a', 'k', 'a'); raise exception 'ÉCHEC : abonnement sans consentement'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;
insert into public.profiles values (auth.uid(), now(), 'v1');
select public.push_subscribe('https://push.example/a', 'k', 'a');
do $$ declare n int; begin
  n := public.push_schedule('https://push.example/a', jsonb_build_array(
    jsonb_build_object('at', now() + interval '1 hour', 'title', 'ʿAsr dans 10 min', 'body', 'b', 'url', '/?n=priere', 'tag', 'asr', 'id', 'x1'),
    jsonb_build_object('at', now() - interval '1 hour', 'title', 'passé', 'body', 'b', 'url', '/', 'tag', 't', 'id', 'x2'),
    jsonb_build_object('at', now() + interval '20 days', 'title', 'trop loin', 'body', 'b', 'url', '/', 'tag', 't', 'id', 'x3'),
    jsonb_build_object('at', now() + interval '2 hours', 'title', 'lien externe', 'body', 'b', 'url', 'https://mal.example', 'tag', 't', 'id', 'x4'),
    jsonb_build_object('at', now() + interval '3 hours', 'title', 'ok', 'body', 'b', 'url', '/communaute?n=verset', 'tag', 'verset', 'id', 'x5')));
  if n <> 2 then raise exception 'ÉCHEC : filtrage des rappels (% gardés)', n; end if;
  begin perform * from private.push_queue; raise exception 'ÉCHEC : file lisible'; exception when insufficient_privilege then null; end;
  begin perform private.push_tick(); raise exception 'ÉCHEC : envoi déclenchable par un membre'; exception when insufficient_privilege then null; end;
end $$;
-- S ne peut pas remplir la file de l’appareil de R
select pg_temp.as_user('00000000-0000-0000-0000-000000000032');
insert into public.profiles values (auth.uid(), now(), 'v1');
do $$ begin
  begin perform public.push_schedule('https://push.example/a', '[]'::jsonb); raise exception 'ÉCHEC : appareil d’un autre'; exception when raise_exception then if sqlerrm like 'ÉCHEC%' then raise; end if; end;
end $$;
reset role;
-- Les rappels dus partent, avec le secret, puis l’appareil désabonné est retiré
update private.push_queue set at = now() - interval '1 minute' where payload->>'id' = 'x1';
do $$ declare n int; b jsonb; h jsonb; begin
  n := private.push_tick();
  if n <> 1 then raise exception 'ÉCHEC : % rappel(s) envoyé(s)', n; end if;
  select body, headers into b, h from net.sent order by id desc limit 1;
  if b->'items'->0->>'endpoint' <> 'https://push.example/a' or b->'items'->0->'payload'->>'title' <> 'ʿAsr dans 10 min' then raise exception 'ÉCHEC : contenu envoyé %', b; end if;
  if h->>'x-cron-secret' <> (select v from private.push_config where k = 'secret') then raise exception 'ÉCHEC : secret absent'; end if;
  if private.push_tick() <> 0 then raise exception 'ÉCHEC : envoyé deux fois'; end if;
  insert into net._http_response values ((select max(id) from net.sent), 200, '{"sent":1,"gone":["https://push.example/a"]}');
  perform private.push_tick();
  if exists (select 1 from private.push_subs) then raise exception 'ÉCHEC : appareil désabonné non retiré'; end if;
  if exists (select 1 from private.push_queue) then raise exception 'ÉCHEC : rappels restants'; end if;
end $$;
select 'TOUS LES TESTS DES RAPPELS PASSENT' as resultat;

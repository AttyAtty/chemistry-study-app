-- Phase 4: item rows, RLS, one explicitly claimed writer device; no multi-device merge.
begin;

create table public.learning_cloud_bindings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id uuid not null,
  last_revision bigint not null default 0 check (last_revision between 0 and 9007199254740991),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.flashcard_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null check (length(card_id) between 1 and 500),
  status text not null check (status in ('known','review')),
  review_step integer check (review_step between -1 and 3),
  next_review_at timestamptz, last_reviewed_at timestamptz,
  last_result text check (last_result in ('remembered','forgot')),
  remembered_count bigint not null check (remembered_count between 0 and 9007199254740991),
  forgot_count bigint not null check (forgot_count between 0 and 9007199254740991),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  schema_version integer not null check (schema_version = 2),
  source_revision bigint not null,
  client_created_at timestamptz not null, client_updated_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (user_id,card_id)
);
create table public.question_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id text not null check (length(record_id) between 1 and 500),
  unit_slug text not null, question_id text not null,
  attempt_count bigint not null check (attempt_count between 0 and 9007199254740991),
  correct_count bigint not null check (correct_count between 0 and 9007199254740991),
  incorrect_count bigint not null check (incorrect_count between 0 and 9007199254740991),
  last_answered_at timestamptz, needs_review boolean not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  schema_version integer not null check (schema_version = 2), source_revision bigint not null,
  client_created_at timestamptz not null, client_updated_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (user_id,record_id), unique (user_id,unit_slug,question_id)
);
create table public.study_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  unit_slug text not null check (length(unit_slug) between 1 and 500),
  attempts bigint not null check (attempts between 0 and 9007199254740991),
  correct bigint not null check (correct between 0 and 9007199254740991),
  total bigint not null check (total between 0 and 9007199254740991),
  best_percent numeric not null check (best_percent between 0 and 100),
  last_studied timestamptz,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  schema_version integer not null check (schema_version = 2), source_revision bigint not null,
  client_created_at timestamptz not null, client_updated_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (user_id,unit_slug)
);
create index flashcard_progress_user_updated on public.flashcard_progress (user_id,updated_at);
create index question_history_user_updated on public.question_history (user_id,updated_at);
create index study_progress_user_updated on public.study_progress (user_id,updated_at);

-- Explicit grants plus owner checks on all four operations; anon has no table access.
do $rls$
declare t text;
begin
  foreach t in array array['learning_cloud_bindings','flashcard_progress','question_history','study_progress'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('alter table public.%I force row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated',t);
    execute format('create policy owner_select on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_update on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
    execute format('create policy owner_delete on public.%I for delete to authenticated using ((select auth.uid()) = user_id)',t);
  end loop;
end $rls$;

-- SECURITY INVOKER: the real JWT user's RLS and grants apply even inside this RPC.
-- Absolute snapshots, not counter increments. One transaction covers all three stores.
create function public.save_chemica_learning(p_device_id uuid,p_revision bigint,p_records jsonb,p_initial boolean default false)
returns jsonb
language plpgsql security invoker set search_path = ''
as $function$
declare
  u uuid := auth.uid();
  binding public.learning_cloud_bindings%rowtype;
  item jsonb; d jsonb; ident text; unit text; question text;
begin
  if u is null then raise exception 'authentication required'; end if;
  if p_device_id is null or p_revision is null or p_revision < 1 or p_revision > 9007199254740991
    or jsonb_typeof(p_records) is distinct from 'array' or jsonb_array_length(p_records)>10000
    or octet_length(p_records::text)>4000000 then raise exception 'invalid cloud payload'; end if;

  select * into binding from public.learning_cloud_bindings where user_id=u for update;
  if not found then
    if p_initial is not true then raise exception 'initial confirmation required'; end if;
    if exists(select 1 from public.flashcard_progress where user_id=u)
      or exists(select 1 from public.question_history where user_id=u)
      or exists(select 1 from public.study_progress where user_id=u) then raise exception 'existing cloud data: hold for phase 5'; end if;
    insert into public.learning_cloud_bindings(user_id,device_id) values(u,p_device_id) on conflict(user_id) do nothing;
    select * into binding from public.learning_cloud_bindings where user_id=u for update;
  end if;
  if binding.device_id <> p_device_id then raise exception 'another device: hold for phase 5'; end if;
  if p_revision <= binding.last_revision then
    return jsonb_build_object('user_id',u,'revision',binding.last_revision,'applied',false);
  end if;
  if exists(
    select 1 from jsonb_array_elements(p_records) a
    group by a->>'kind',a->>'record_id' having count(*)>1
  ) then raise exception 'duplicate learning item'; end if;

  for item in select value from jsonb_array_elements(p_records) loop
    d := item->'data'; ident := item->>'record_id';
    if ident is null or length(ident) not between 1 and 500 or jsonb_typeof(d) is distinct from 'object'
      or (item->>'schema_version')::int is distinct from 2 then raise exception 'invalid learning item'; end if;
    if item->>'kind'='flashcard' then
      insert into public.flashcard_progress as old
        (user_id,card_id,status,review_step,next_review_at,last_reviewed_at,last_result,remembered_count,forgot_count,
         payload,schema_version,source_revision,client_created_at,client_updated_at)
      values(u,ident,d->>'status',(d->>'reviewStep')::int,nullif(d->>'nextReviewAt','')::timestamptz,
        nullif(d->>'lastReviewedAt','')::timestamptz,d->>'lastResult',coalesce((d->>'rememberedCount')::bigint,0),
        coalesce((d->>'forgotCount')::bigint,0),d,2,p_revision,(item->>'client_created_at')::timestamptz,(item->>'client_updated_at')::timestamptz)
      on conflict(user_id,card_id) do update set status=excluded.status,review_step=excluded.review_step,
        next_review_at=excluded.next_review_at,last_reviewed_at=excluded.last_reviewed_at,last_result=excluded.last_result,
        remembered_count=excluded.remembered_count,forgot_count=excluded.forgot_count,payload=excluded.payload,
        source_revision=excluded.source_revision,client_updated_at=excluded.client_updated_at,updated_at=now()
      where old.payload is distinct from excluded.payload or old.client_updated_at is distinct from excluded.client_updated_at;
    elsif item->>'kind'='question' then
      -- Unknown legacy IDs remain intact in record_id; known IDs keep unit::question.
      unit := case when strpos(ident,'::')>0 then split_part(ident,'::',1) else '' end;
      question := case when strpos(ident,'::')>0 then substring(ident from strpos(ident,'::')+2) else ident end;
      insert into public.question_history as old
        (user_id,record_id,unit_slug,question_id,attempt_count,correct_count,incorrect_count,last_answered_at,needs_review,
         payload,schema_version,source_revision,client_created_at,client_updated_at)
      values(u,ident,unit,question,(d->>'attemptCount')::bigint,(d->>'correctCount')::bigint,(d->>'incorrectCount')::bigint,
        nullif(d->>'lastAnsweredAt','')::timestamptz,(d->>'needsReview')::boolean,d,2,p_revision,
        (item->>'client_created_at')::timestamptz,(item->>'client_updated_at')::timestamptz)
      on conflict(user_id,record_id) do update set attempt_count=excluded.attempt_count,correct_count=excluded.correct_count,
        incorrect_count=excluded.incorrect_count,last_answered_at=excluded.last_answered_at,needs_review=excluded.needs_review,
        payload=excluded.payload,source_revision=excluded.source_revision,client_updated_at=excluded.client_updated_at,updated_at=now()
      where old.payload is distinct from excluded.payload or old.client_updated_at is distinct from excluded.client_updated_at;
    elsif item->>'kind'='study' then
      insert into public.study_progress as old
        (user_id,unit_slug,attempts,correct,total,best_percent,last_studied,payload,schema_version,source_revision,client_created_at,client_updated_at)
      values(u,ident,(d->>'attempts')::bigint,(d->>'correct')::bigint,(d->>'total')::bigint,(d->>'bestPercent')::numeric,
        nullif(d->>'lastStudied','')::timestamptz,d,2,p_revision,(item->>'client_created_at')::timestamptz,(item->>'client_updated_at')::timestamptz)
      on conflict(user_id,unit_slug) do update set attempts=excluded.attempts,correct=excluded.correct,total=excluded.total,
        best_percent=excluded.best_percent,last_studied=excluded.last_studied,payload=excluded.payload,
        source_revision=excluded.source_revision,client_updated_at=excluded.client_updated_at,updated_at=now()
      where old.payload is distinct from excluded.payload or old.client_updated_at is distinct from excluded.client_updated_at;
    else raise exception 'unknown learning kind';
    end if;
  end loop;
  update public.learning_cloud_bindings set last_revision=p_revision,updated_at=now() where user_id=u;
  return jsonb_build_object('user_id',u,'revision',p_revision,'applied',true);
end $function$;
revoke all on function public.save_chemica_learning(uuid,bigint,jsonb,boolean) from public,anon;
grant execute on function public.save_chemica_learning(uuid,bigint,jsonb,boolean) to authenticated;
commit;

-- Migration Suivapp V0.3 : onglet Entraînement. À exécuter dans l'éditeur SQL de Supabase,
-- après migration_v0.2.sql. Le script peut être relancé sans risque.

create table if not exists training_exercises (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  muscle text not null default '',
  measure text not null default 'reps_weight' check (measure in ('reps_weight', 'reps', 'duration')),
  unilateral boolean not null default false,
  notes text not null default ''
);

create table if not exists training_sessions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  discipline text not null default 'sport',
  place text not null default 'gym',
  position int not null default 0,
  warmup text not null default '',
  items jsonb not null default '[]',
  finisher boolean not null default true,
  archived boolean not null default false
);

-- Routines de mobilité : catégorie et niveaux (Rapide / Normal / Complet).
alter table training_sessions
  add column if not exists category text not null default '',
  add column if not exists levels jsonb not null default '[]';

create table if not exists training_wods (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  format text not null check (format in ('amrap', 'emom', 'for_time', 'tabata')),
  minutes int not null default 10,
  rounds int not null default 0,
  items text[] not null default '{}',
  builtin boolean not null default false
);

create table if not exists training_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  session_id uuid references training_sessions on delete set null,
  discipline text not null default 'sport',
  name text not null,
  day date not null,
  started_at timestamptz not null,
  duration_s int not null default 0,
  feeling text,
  note text not null default '',
  warmup_done boolean not null default false,
  circuits jsonb not null default '{}',
  sets jsonb not null default '[]',
  wod_id uuid references training_wods on delete set null,
  wod_result text not null default '',
  records text[] not null default '{}',
  family_id uuid references families on delete set null,
  xp_earned int not null default 0
);

do $$
declare t text;
begin
  foreach t in array array['training_exercises','training_sessions','training_wods','training_logs'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists owner_only on %I', t);
    execute format('create policy owner_only on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('grant select, insert, update, delete on %I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

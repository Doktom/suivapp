-- Schéma Suivapp (installation neuve) : exécuter ce fichier, puis migration_v0.3.sql (onglet Entraînement).
-- Pour une base V0.1 existante, exécuter migration_v0.2.sql puis migration_v0.3.sql.
-- À exécuter une fois dans l'éditeur SQL de Supabase.
-- Chaque table est privée : la RLS limite les lignes à leur propriétaire.

create table families (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  color text not null,
  stat_name text not null,
  position int not null default 0
);

create table habit_templates (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  family_id uuid references families on delete set null,
  name text not null,
  tracking text not null check (tracking in ('simple', 'duration', 'quantity', 'levels', 'routine', 'avoid')),
  goal numeric not null default 1,
  unit text not null default '',
  frequency jsonb not null,
  moments text[] not null,
  levels jsonb not null default '[]',
  steps jsonb not null default '[]',
  avoid jsonb,
  builtin boolean not null default false
);

create table habits (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  family_id uuid references families on delete set null,
  name text not null,
  description text not null default '',
  tracking text not null check (tracking in ('simple', 'duration', 'quantity', 'levels', 'routine', 'avoid')),
  goal numeric not null default 1,
  unit text not null default '',
  frequency jsonb not null,
  moments text[] not null,
  levels jsonb not null default '[]',
  steps jsonb not null default '[]',
  avoid jsonb,
  time_of_day text,
  start_date date not null,
  end_date date,
  pauses jsonb not null default '[]',
  archived boolean not null default false
);

create table validations (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null references habits on delete cascade,
  day date not null,
  moment text not null,
  value numeric not null,
  steps text[] not null default '{}',
  xp_earned int not null default 0,
  unique (habit_id, day, moment)
);

create table slips (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  habit_id uuid not null references habits on delete cascade,
  day date not null,
  time text not null
);

create table task_lists (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  color text not null
);

create table tasks (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  list_id uuid references task_lists on delete set null,
  parent_id uuid references tasks on delete cascade,
  title text not null,
  note text not null default '',
  due_date date,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  recurrence jsonb,
  previous_id uuid,
  checklist_id uuid,
  position int not null default 0,
  completed_at timestamptz,
  xp_earned int not null default 0
);

create table checklists (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  items text[] not null default '{}',
  list_id uuid references task_lists on delete set null,
  recurrence jsonb
);

create table events (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  day date not null,
  start_time text,
  end_time text,
  note text not null default '',
  color text not null default '#3F6B52'
);

create table profile (
  id uuid primary key,
  user_id uuid not null unique default auth.uid() references auth.users on delete cascade,
  day_rollover_hour int not null default 4 check (day_rollover_hour between 0 and 12),
  xp jsonb
);

do $$
declare t text;
begin
  foreach t in array array['families','habit_templates','habits','validations','slips','task_lists','tasks','checklists','events','profile'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy owner_only on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('grant select, insert, update, delete on %I to authenticated', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

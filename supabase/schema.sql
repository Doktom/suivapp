-- Schéma Suivapp V0.1. À exécuter une fois dans l'éditeur SQL de Supabase.
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
  tracking text not null check (tracking in ('simple', 'duration', 'quantity')),
  goal numeric not null default 1,
  unit text not null default '',
  frequency jsonb not null,
  moments text[] not null,
  builtin boolean not null default false
);

create table habits (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  family_id uuid references families on delete set null,
  name text not null,
  description text not null default '',
  tracking text not null check (tracking in ('simple', 'duration', 'quantity')),
  goal numeric not null default 1,
  unit text not null default '',
  frequency jsonb not null,
  moments text[] not null,
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
  xp_earned int not null default 0,
  unique (habit_id, day, moment)
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
  completed_at timestamptz,
  xp_earned int not null default 0
);

create table profile (
  id uuid primary key,
  user_id uuid not null unique default auth.uid() references auth.users on delete cascade,
  day_rollover_hour int not null default 4 check (day_rollover_hour between 0 and 12)
);

do $$
declare t text;
begin
  foreach t in array array['families','habit_templates','habits','validations','task_lists','tasks','profile'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy owner_only on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

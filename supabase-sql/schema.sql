-- MacroFit: perfil por usuario + registros de comidas
-- Ejecutar en Supabase → SQL Editor

create table if not exists public.profiles (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name text,
  profile jsonb,                                  -- sexo, edad, altura, peso, actividad, objetivo, objetivos manuales
  settings jsonb not null default '{}'::jsonb,    -- proveedor IA y claves de IA del usuario
  custom_foods jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  day date not null,
  meal text not null,
  name text not null,
  grams numeric,
  kcal numeric not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  ai boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists entries_user_day_idx on public.entries (user_id, day);

alter table public.profiles enable row level security;
alter table public.entries enable row level security;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.entries to authenticated;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = user_id);

create policy "entries_select_own" on public.entries for select to authenticated using ((select auth.uid()) = user_id);
create policy "entries_insert_own" on public.entries for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "entries_update_own" on public.entries for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "entries_delete_own" on public.entries for delete to authenticated using ((select auth.uid()) = user_id);

-- La tabla user_data de la versión anterior ya no se usa. Si está vacía puedes borrarla:
-- drop table if exists public.user_data;

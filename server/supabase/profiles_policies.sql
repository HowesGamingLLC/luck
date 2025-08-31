-- Fix RLS recursion on profiles by removing self-referential subqueries
-- Run this in Supabase SQL editor

create table if not exists admins (
  user_id uuid primary key
);

alter table profiles enable row level security;

-- Drop potentially problematic existing policies
drop policy if exists "profiles all policy" on profiles;
drop policy if exists "Allow read own profile" on profiles;
drop policy if exists "Allow admins all" on profiles;
drop policy if exists "Allow users insert own" on profiles;
drop policy if exists "Allow users update own" on profiles;
drop policy if exists "profiles_select_own" on profiles;
drop policy if exists "profiles_select_admin" on profiles;
drop policy if exists "profiles_update_own" on profiles;
drop policy if exists "profiles_update_admin" on profiles;
drop policy if exists "profiles_insert_own" on profiles;
drop policy if exists "profiles_insert_admin" on profiles;

-- SELECT: user can read own profile
create policy "profiles_select_own" on profiles
for select
using ( id = auth.uid() );

-- SELECT: admins can read any profile
create policy "profiles_select_admin" on profiles
for select
using ( exists(select 1 from admins a where a.user_id = auth.uid()) );

-- UPDATE: user can update own profile
create policy "profiles_update_own" on profiles
for update
using ( id = auth.uid() );

-- UPDATE: admins can update any profile
create policy "profiles_update_admin" on profiles
for update
using ( exists(select 1 from admins a where a.user_id = auth.uid()) );

-- INSERT: user can insert only their own row
create policy "profiles_insert_own" on profiles
for insert
with check ( id = auth.uid() );

-- INSERT: admins can insert any
create policy "profiles_insert_admin" on profiles
for insert
with check ( exists(select 1 from admins a where a.user_id = auth.uid()) );

-- Note: Service role bypasses RLS automatically.

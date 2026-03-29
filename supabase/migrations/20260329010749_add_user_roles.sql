-- ============================================================
-- Migration: add_user_roles
-- Purpose: Introduce admin vs user role-based access (issue #1)
-- ============================================================

-- 1. Create user_roles table
-- Each authenticated user gets one role: 'admin' or 'user'.
-- Only admins (site owner) can create/edit/delete entries.
-- Regular users can only comment.
create table user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now()
);

alter table user_roles enable row level security;

-- Users can read their own role (needed by frontend auth context)
create policy "Users can read own role"
  on user_roles for select
  using (auth.uid() = user_id);

-- 2. Create is_admin() helper function
-- Used in RLS policies on other tables to check admin status.
-- security definer: bypasses RLS on user_roles to avoid circular deps.
-- stable: result doesn't change within a single SQL statement.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from user_roles
    where user_id = auth.uid()
      and role = 'admin'
  );
$$;

-- 3. Update entries RLS policies
-- Drop old owner-based write policies and replace with admin-only.
-- The "Public can read all entries" SELECT policy remains untouched.
drop policy "Users can read own entries" on entries;
drop policy "Users can insert own entries" on entries;
drop policy "Users can update own entries" on entries;

-- Only admins can create entries
create policy "Admins can insert entries"
  on entries for insert
  with check (is_admin());

-- Only admins can edit entries
create policy "Admins can update entries"
  on entries for update
  using (is_admin());

-- Only admins can delete entries (new — no delete policy existed before)
create policy "Admins can delete entries"
  on entries for delete
  using (is_admin());

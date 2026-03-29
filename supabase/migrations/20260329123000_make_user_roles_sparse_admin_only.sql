-- ============================================================
-- Migration: make_user_roles_sparse_admin_only
-- Purpose: Align user_roles with the sparse admin-only model
-- ============================================================

-- Regular authenticated users are represented by the absence of a row.
-- Existing explicit 'user' rows can be removed without changing access.
delete from user_roles
where role = 'user';

alter table user_roles
  alter column role drop default;

alter table user_roles
  drop constraint if exists user_roles_role_check;

alter table user_roles
  add constraint user_roles_role_check check (role = 'admin');

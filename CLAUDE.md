# Blog Editor — Agent Instructions

## Project Overview

A Vite + React single-page blog editor backed by Supabase for auth and data storage. The app uses hash-based routing so it can still be deployed statically. Role-based access (admin vs user) controls who can create, edit, and delete entries — regular users can only read and comment.

## Key Files

- `src/main.jsx` — React mount point with `HashRouter` and `AuthProvider`
- `src/app.jsx` — Route tree with lazy-loaded pages
- `src/components/layout.jsx` — Shared shell and navigation
- `src/components/protected-route.jsx` — ProtectedRoute (auth gate) and AdminRoute (admin gate)
- `src/components/tiptap-editor.jsx` — Tiptap editor wrapper
- `src/pages/` — Login, entries, view, and editor pages
- `src/contexts/auth-context.jsx` — Supabase auth state and auth actions
- `src/hooks/use-entries.js` — Entry fetch/create/update/delete logic
- `src/lib/supabase.js` — Supabase client init
- `supabase/migrations/` — Database schema migrations

## Documentation Policy

This project maintains two separate docs that must stay in sync with the codebase:

### README.md — Technical Documentation

- Audience: developers and future agents
- Covers: tech stack, architecture, file structure, database schema, setup instructions, development workflow
- Update whenever: file structure changes, new dependencies are added, database schema changes, routing changes, or setup steps change

### USAGE.md — User-Facing Documentation

- Audience: end users of the application
- Covers: how to use the app — account creation, writing/editing/viewing entries, feature explanations
- Update whenever: a user-facing feature is added, removed, or changed in behavior
- Keep free of technical details (no schema, no file paths, no code)

### Sync Rule

After making any code change, check whether README.md and/or USAGE.md need updating. If a feature was added or changed, update both. If only internal architecture changed, update README.md only. Do not let docs drift out of sync with the code.

## Development Commands

- `npm install` — install dependencies
- `npm run dev` — start the Vite development server
- `npm run build` — build the production bundle

## Supabase

- Project URL: `https://zmplxklzsjkuipttflnd.supabase.co`
- Migrations are managed via the Supabase CLI (`npx supabase migration new`, `npx supabase db push`)
- RLS is enabled — entry writes restricted to admin role via `is_admin()` function; comments restricted to own rows
- Roles are stored in `user_roles` table — manage via Supabase dashboard SQL editor

## Projects and Tasks

- React migration to Vite/React/shadcn/ui/Tiptap completed on 2026-03-27
- Admin vs user role-based access implemented on 2026-03-29 (issue #1)
- Keep future work aligned with the React architecture and avoid reintroducing vanilla app files

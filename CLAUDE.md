# Blog Editor — Agent Instructions

## Project Overview

A static single-page blog editor backed by Supabase for auth and data storage. No build step — vanilla HTML/CSS/JS served as static files.

## Key Files

- `index.html` — HTML structure
- `styles.css` — All styles
- `app.js` — Routing, auth, CRUD, editor logic
- `supabase-client.js` — Supabase client init
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

## Supabase

- Project URL: `https://zmplxklzsjkuipttflnd.supabase.co`
- Migrations are managed via the Supabase CLI (`npx supabase migration new`, `npx supabase db push`)
- RLS is enabled — all table policies restrict access to the authenticated user's own rows

## Projects and Tasks

*(No outstanding tasks)*

# Blog Editor

A lightweight React blog editor backed by Supabase for authentication and entry storage. The app uses hash-based routing so it can still be deployed as a static site. Role-based access control separates admin capabilities (create, edit, delete entries and manage profile) from regular user capabilities (read entries and comment).

## Tech Stack

- **Frontend**: React 19, Vite 8, React Router, Tailwind CSS v4
- **UI**: shadcn/ui on top of Base UI primitives
- **Editor**: Tiptap with StarterKit
- **Database/Auth**: Supabase Postgres + Supabase Auth

## Architecture

```
index.html                     Vite entry HTML
src/main.jsx                   React mount point with HashRouter + AuthProvider
src/app.jsx                    Route tree with lazy-loaded pages
src/components/layout.jsx      Shared shell with session bar and navigation
src/components/protected-route.jsx
                               ProtectedRoute (auth gate) and AdminRoute (admin gate)
src/components/tiptap-editor.jsx
                               Rich text editor wrapper and toolbar
src/pages/login-page.jsx       Login and sign-up flow
src/pages/entries-page.jsx     Entries list with conditional edit actions
src/pages/view-page.jsx        Read-only entry display
src/pages/editor-page.jsx      Create and edit entry flow
src/contexts/auth-context.jsx  Supabase auth state and auth helpers
src/hooks/use-entries.js       Entries CRUD helpers
src/lib/supabase.js            Supabase client initialization
supabase/                      Existing project config and migrations
```

## Routing

The app uses `HashRouter`, which keeps static hosting simple while still supporting direct navigation:

| Route | Description |
|-------|-------------|
| `#/login` | Email/password login or sign-up |
| `#/entries` | Public entries list |
| `#/view/:entryId` | Public read-only entry page |
| `#/editor` | Admin-only page for creating a new entry |
| `#/editor/:entryId` | Admin-only page for editing an existing entry |
| `#/profile` | Admin-only profile management page |

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Create, edit, delete entries; manage profile; comment |
| **User** | Read entries; comment |
| **Visitor** (unauthenticated) | Read entries |

Roles are stored in the `user_roles` table. An `is_admin()` SQL function is used in RLS policies to restrict entry writes to admins.

## Entry Behavior

- Visitors can browse the entries list and open an entry view
- Admin users see edit/delete actions on entries and can create new ones
- Regular users can read entries and comment, but cannot create or modify entries
- Rich text content is stored as HTML and rendered directly on the view page
- New entries and updates redirect back to the entries list after save

## Database Schema

### entries

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | Foreign key to `auth.users` |
| `title` | text | Entry title |
| `content` | text | Entry body stored as HTML |
| `published_at` | date | Publication date |
| `created_at` | timestamptz | Row creation timestamp |

### user_roles

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | Foreign key to `auth.users` (unique) |
| `role` | text | Either `'admin'` or `'user'` |
| `created_at` | timestamptz | Row creation timestamp |

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Confirm `src/lib/supabase.js` points at the correct Supabase project
3. Apply database migrations if needed:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- `npm run dev` starts the Vite development server
- `npm run build` creates a production build in `dist/`
- Route pages are lazy loaded so the editor bundle does not inflate the initial payload

When creating new database changes, keep using the migrations in `supabase/migrations/`:

```bash
npx supabase migration new <migration_name>
# edit the generated .sql file
npx supabase db push
```

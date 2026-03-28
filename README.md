# Blog Editor

A lightweight blog editor built as a static single-page application. Entries are stored in a Supabase Postgres database with row-level security, so each user can only access their own content.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks)
- **Database**: Supabase (Postgres)
- **Auth**: Supabase Auth (email/password)
- **Hosting**: Static files — no build step required

## Architecture

```
index.html            HTML structure (auth screen, editor, entries list, entry view)
styles.css            All application styles
app.js                Routing, auth state management, CRUD operations, editor logic
supabase-client.js    Initializes the Supabase JS client
supabase/             Supabase project config and migrations
```

### Routing

Hash-based client-side routing with three routes:

| Route | Description |
|-------|-------------|
| `#/editor` | Rich text editor for creating new entries |
| `#/editor/<id>` | Edit an existing entry |
| `#/entries` | List of all entries with edit/view actions |
| `#/view/<id>` | Read-only view of a single entry |

### Database Schema

**`entries`** table:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | Foreign key to `auth.users` (auto-set via `auth.uid()`) |
| `title` | text | Entry title |
| `content` | text | Entry body (stored as HTML) |
| `published_at` | date | Publication date (defaults to current date) |
| `created_at` | timestamptz | Row creation timestamp |

RLS policies restrict all operations (select, insert, update) to rows where `user_id` matches the authenticated user.

### Authentication

Email/password auth via Supabase Auth. The app shell is hidden behind an auth gate — unauthenticated users see only the login/signup form.

## Setup

1. Create a [Supabase](https://supabase.com) project
2. Update `supabase-client.js` with your project URL and anon key
3. Run the database migration:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
4. Serve the files with any static server (e.g. `python3 -m http.server`)

## Development

No build tools or dependencies to install. Edit the files directly and refresh the browser.

Database migrations live in `supabase/migrations/`. To create a new migration:

```bash
npx supabase migration new <migration_name>
# edit the generated .sql file
npx supabase db push
```

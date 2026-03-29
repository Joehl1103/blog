# Entry Sidebar Grouping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tag-based and year/month archive filtering to the entries page, with canonical multi-tag support for each entry in the editor.

**Architecture:** Keep the feature centered around the existing entries page and editor page. Use a normalized Supabase schema (`tags` + `entry_tags`), a small pure helper module for tag normalization and sidebar grouping, a focused sidebar component for filter UI, and a focused tag-input component for editor tag management.

**Tech Stack:** React 19, Vite 8, Supabase Postgres + RLS, Vitest, Tailwind CSS v4, shadcn/ui, React Router

---

## File Structure

- Modify: `package.json`
- Create: `src/lib/entry-taxonomy.js`
- Create: `src/lib/entry-taxonomy.test.js`
- Create: `supabase/migrations/20260328143000_add_tags_and_entry_groups.sql`
- Create: `src/lib/entry-tags.js`
- Modify: `src/hooks/use-entries.js`
- Create: `src/components/entries-sidebar.jsx`
- Create: `src/components/tag-input.jsx`
- Modify: `src/pages/entries-page.jsx`
- Modify: `src/pages/editor-page.jsx`
- Modify: `README.md`
- Modify: `USAGE.md`

Keep the new behavior split into small units:

- `entry-taxonomy.js` owns pure normalization, grouping, and filtering logic.
- `entry-tags.js` owns Supabase tag queries and entry-tag synchronization.
- `entries-sidebar.jsx` owns the sidebar rendering and active-filter controls.
- `tag-input.jsx` owns live tag suggestions, keyboard selection, and selected-chip UI.

---

### Task 1: Add Taxonomy Test Coverage and Pure Helpers

**Files:**
- Modify: `package.json`
- Create: `src/lib/entry-taxonomy.js`
- Create: `src/lib/entry-taxonomy.test.js`

- [ ] **Step 1: Install Vitest and add a test script**

Run:

```bash
npm install -D vitest
```

Update `package.json` scripts and devDependencies to include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@vitejs/plugin-react": "^6.0.1",
    "autoprefixer": "^10.4.27",
    "postcss": "^8.5.8",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.3",
    "vitest": "^3.2.4"
  }
}
```

- [ ] **Step 2: Write the failing helper test first**

Create `src/lib/entry-taxonomy.test.js`:

```js
import { describe, expect, it } from "vitest";
import {
  buildArchiveGroups,
  buildTagGroups,
  createTagSlug,
  filterEntries,
  normalizeSelectedTag,
} from "@/lib/entry-taxonomy";

const entries = [
  {
    id: "entry-1",
    published_at: "2026-03-20",
    tags: [
      { id: "tag-1", name: "React Hooks", slug: "react-hooks" },
      { id: "tag-2", name: "Supabase", slug: "supabase" },
    ],
  },
  {
    id: "entry-2",
    published_at: "2026-03-02",
    tags: [{ id: "tag-1", name: "React Hooks", slug: "react-hooks" }],
  },
  {
    id: "entry-3",
    published_at: "2026-02-14",
    tags: [{ id: "tag-3", name: "Writing", slug: "writing" }],
  },
];

describe("normalizeSelectedTag", () => {
  it("trims and collapses whitespace before generating a slug", () => {
    expect(normalizeSelectedTag("  React   Hooks  ")).toEqual({
      name: "React Hooks",
      slug: "react-hooks",
    });
  });

  it("returns null for empty values", () => {
    expect(normalizeSelectedTag("   ")).toBeNull();
  });
});

describe("createTagSlug", () => {
  it("lowercases, strips punctuation, and hyphenates spaces", () => {
    expect(createTagSlug("Portfolio & CV Notes")).toBe("portfolio-cv-notes");
  });
});

describe("buildTagGroups", () => {
  it("counts tags across entries and sorts them alphabetically", () => {
    expect(buildTagGroups(entries)).toEqual([
      { count: 2, name: "React Hooks", slug: "react-hooks" },
      { count: 1, name: "Supabase", slug: "supabase" },
      { count: 1, name: "Writing", slug: "writing" },
    ]);
  });
});

describe("buildArchiveGroups", () => {
  it("groups entries by year and month in descending order", () => {
    expect(buildArchiveGroups(entries)).toEqual([
      {
        months: [
          { count: 2, label: "March", month: 3 },
          { count: 1, label: "February", month: 2 },
        ],
        year: 2026,
      },
    ]);
  });
});

describe("filterEntries", () => {
  it("filters by tag slug", () => {
    expect(filterEntries(entries, { type: "tag", slug: "react-hooks" })).toHaveLength(2);
  });

  it("filters by archive month", () => {
    expect(filterEntries(entries, { type: "archive", year: 2026, month: 2 })).toEqual([
      entries[2],
    ]);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails for the missing module**

Run:

```bash
npm test -- src/lib/entry-taxonomy.test.js
```

Expected: FAIL with a module resolution error for `@/lib/entry-taxonomy`.

- [ ] **Step 4: Implement the minimal helper module**

Create `src/lib/entry-taxonomy.js`:

```js
const archiveMonthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
});

const toEntryDate = (publishedAt) => {
  if (!publishedAt) {
    return null;
  }

  return new Date(`${publishedAt}T12:00:00`);
};

export const normalizeTagName = (value) => value.trim().replace(/\s+/g, " ");

export const createTagSlug = (value) =>
  normalizeTagName(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const normalizeSelectedTag = (value) => {
  const name = normalizeTagName(value);
  const slug = createTagSlug(name);

  if (!name || !slug) {
    return null;
  }

  return { name, slug };
};

export const mapEntryRecord = (entry) => ({
  ...entry,
  tags: (entry.entry_tags ?? [])
    .map((link) => link.tags)
    .filter(Boolean)
    .sort((left, right) => left.name.localeCompare(right.name)),
});

export const buildTagGroups = (entries) => {
  const tagCounts = new Map();

  for (const entry of entries) {
    for (const tag of entry.tags ?? []) {
      const existing = tagCounts.get(tag.slug);

      tagCounts.set(tag.slug, {
        count: existing ? existing.count + 1 : 1,
        name: tag.name,
        slug: tag.slug,
      });
    }
  }

  return [...tagCounts.values()].sort((left, right) => left.name.localeCompare(right.name));
};

export const buildArchiveGroups = (entries) => {
  const yearMap = new Map();

  for (const entry of entries) {
    const date = toEntryDate(entry.published_at);

    if (!date) {
      continue;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const months = yearMap.get(year) ?? new Map();
    const currentMonth = months.get(month) ?? {
      count: 0,
      label: archiveMonthFormatter.format(date),
      month,
    };

    currentMonth.count += 1;
    months.set(month, currentMonth);
    yearMap.set(year, months);
  }

  return [...yearMap.entries()]
    .sort((left, right) => right[0] - left[0])
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((left, right) => right.month - left.month),
    }));
};

export const filterEntries = (entries, activeFilter) => {
  if (!activeFilter) {
    return entries;
  }

  if (activeFilter.type === "tag") {
    return entries.filter((entry) =>
      (entry.tags ?? []).some((tag) => tag.slug === activeFilter.slug)
    );
  }

  if (activeFilter.type === "archive") {
    return entries.filter((entry) => {
      const date = toEntryDate(entry.published_at);

      return (
        date &&
        date.getFullYear() === activeFilter.year &&
        date.getMonth() + 1 === activeFilter.month
      );
    });
  }

  return entries;
};
```

- [ ] **Step 5: Run the tests and verify they pass**

Run:

```bash
npm test -- src/lib/entry-taxonomy.test.js
```

Expected: PASS with 6 passing assertions.

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/entry-taxonomy.js src/lib/entry-taxonomy.test.js
git commit -m "test: cover entry taxonomy helper behavior"
```

---

### Task 2: Add the Supabase Tag Schema and Policies

**Files:**
- Create: `supabase/migrations/20260328143000_add_tags_and_entry_groups.sql`

- [ ] **Step 1: Create the migration for tags and entry_tags**

Create `supabase/migrations/20260328143000_add_tags_and_entry_groups.sql`:

```sql
-- ============================================================
-- Migration: add_tags_and_entry_groups
-- Purpose: Add canonical tags and entry-to-tag links for sidebar grouping
-- ============================================================

create table tags (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

create table entry_tags (
  entry_id uuid not null references entries(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (entry_id, tag_id)
);

create index entry_tags_tag_id_idx on entry_tags(tag_id);

alter table tags enable row level security;
alter table entry_tags enable row level security;

create policy "Public can read all tags"
  on tags for select
  using (true);

create policy "Admins can insert tags"
  on tags for insert
  with check (is_admin());

create policy "Public can read all entry tags"
  on entry_tags for select
  using (true);

create policy "Admins can insert entry tags"
  on entry_tags for insert
  with check (is_admin());

create policy "Admins can delete entry tags"
  on entry_tags for delete
  using (is_admin());
```

- [ ] **Step 2: Apply the migration**

Run:

```bash
npx supabase db push
```

Expected: the CLI applies the new migration without SQL or RLS errors.

- [ ] **Step 3: Verify the schema with direct SQL checks**

Run these in Supabase SQL Editor after the push:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('tags', 'entry_tags')
order by table_name;

select policyname, tablename
from pg_policies
where schemaname = 'public'
  and tablename in ('tags', 'entry_tags')
order by tablename, policyname;
```

Expected: both tables exist and the five policies from the migration are present.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260328143000_add_tags_and_entry_groups.sql
git commit -m "feat: add canonical tags and entry tag links"
```

---

### Task 3: Extend the Data Layer for Nested Tags and Tag Search

**Files:**
- Create: `src/lib/entry-tags.js`
- Modify: `src/hooks/use-entries.js`

- [ ] **Step 1: Create the tag query and sync module**

Create `src/lib/entry-tags.js`:

```js
import { supabase } from "@/lib/supabase";
import { createTagSlug, normalizeSelectedTag } from "@/lib/entry-taxonomy";

const dedupeTags = (selectedTags) => {
  const uniqueTags = new Map();

  for (const selectedTag of selectedTags) {
    const normalized = normalizeSelectedTag(selectedTag.name ?? selectedTag);

    if (!normalized) {
      continue;
    }

    uniqueTags.set(normalized.slug, normalized);
  }

  return [...uniqueTags.values()];
};

export async function searchTags(query) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return { error: null, tags: [] };
  }

  const slugQuery = createTagSlug(normalizedQuery);
  const escapedNameQuery = normalizedQuery.replace(/\s+/g, "%");

  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug")
    .or(`name.ilike.${escapedNameQuery}%,slug.ilike.${slugQuery}%`)
    .order("name", { ascending: true })
    .limit(6);

  return { error, tags: data ?? [] };
}

export async function syncEntryTags(entryId, selectedTags) {
  const normalizedTags = dedupeTags(selectedTags);

  if (normalizedTags.length === 0) {
    const { error } = await supabase
      .from("entry_tags")
      .delete()
      .eq("entry_id", entryId);

    return { error: error ?? null };
  }

  const { data: existingTags, error: existingError } = await supabase
    .from("tags")
    .select("id, name, slug")
    .in("slug", normalizedTags.map((tag) => tag.slug));

  if (existingError) {
    return { error: existingError };
  }

  const existingBySlug = new Map((existingTags ?? []).map((tag) => [tag.slug, tag]));
  const missingTags = normalizedTags.filter((tag) => !existingBySlug.has(tag.slug));

  let insertedTags = [];

  if (missingTags.length > 0) {
    const { data, error } = await supabase
      .from("tags")
      .insert(missingTags)
      .select("id, name, slug");

    if (error) {
      return { error };
    }

    insertedTags = data ?? [];
  }

  const resolvedTags = [...(existingTags ?? []), ...insertedTags];

  const { error: deleteError } = await supabase
    .from("entry_tags")
    .delete()
    .eq("entry_id", entryId);

  if (deleteError || resolvedTags.length === 0) {
    return { error: deleteError ?? null };
  }

  const { error: linkError } = await supabase
    .from("entry_tags")
    .insert(resolvedTags.map((tag) => ({ entry_id: entryId, tag_id: tag.id })));

  return { error: linkError ?? null };
}
```

- [ ] **Step 2: Update entries fetching and saving to include tags**

Replace `src/hooks/use-entries.js` with:

```js
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { mapEntryRecord } from "@/lib/entry-taxonomy";

const ENTRY_LIST_SELECT = `
  id,
  title,
  published_at,
  created_at,
  user_id,
  entry_tags (
    tags (
      id,
      name,
      slug
    )
  )
`;

const ENTRY_DETAIL_SELECT = `
  id,
  title,
  content,
  published_at,
  created_at,
  user_id,
  entry_tags (
    tags (
      id,
      name,
      slug
    )
  )
`;

export function useEntries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("entries")
      .select(ENTRY_LIST_SELECT)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setEntries((data ?? []).map(mapEntryRecord));
    }

    setLoading(false);
  }, []);

  return { entries, loading, error, fetchEntries };
}

export async function fetchEntry(id) {
  const { data, error } = await supabase
    .from("entries")
    .select(ENTRY_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  return { entry: data ? mapEntryRecord(data) : null, error };
}

export async function createEntry({ title, content }) {
  const { data, error } = await supabase
    .from("entries")
    .insert({ title, content })
    .select("id")
    .single();

  return { entry: data, error };
}

export async function updateEntry(id, { title, content }) {
  const { data, error } = await supabase
    .from("entries")
    .update({ title, content })
    .eq("id", id)
    .select("id")
    .single();

  return { entry: data, error };
}

export async function deleteEntry(id) {
  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("id", id);

  return { error };
}
```

- [ ] **Step 3: Verify the helper tests still pass after the data-layer changes**

Run:

```bash
npm test -- src/lib/entry-taxonomy.test.js
```

Expected: PASS with the helper behavior unchanged.

- [ ] **Step 4: Build the app to catch import and query-shape mistakes**

Run:

```bash
npm run build
```

Expected: build succeeds with no unresolved imports.

- [ ] **Step 5: Commit**

```bash
git add src/lib/entry-tags.js src/hooks/use-entries.js
git commit -m "feat: load nested tags and sync entry tag links"
```

---

### Task 4: Add the Sidebar Filter UI to the Entries Page

**Files:**
- Create: `src/components/entries-sidebar.jsx`
- Modify: `src/pages/entries-page.jsx`

- [ ] **Step 1: Create the sidebar component**

Create `src/components/entries-sidebar.jsx`:

```jsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const itemClassName = (isActive) =>
  [
    "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground",
  ].join(" ");

export function EntriesSidebar({
  activeFilter,
  archiveGroups,
  onArchiveSelect,
  onClearFilter,
  onTagSelect,
  tagGroups,
}) {
  return (
    <Card className="border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="space-y-3 p-5 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg font-semibold tracking-tight">Browse</CardTitle>
          {activeFilter ? (
            <Button onClick={onClearFilter} size="sm" variant="ghost">
              Clear filter
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5 pt-0">
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Tags
          </h3>

          {tagGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet.</p>
          ) : (
            <div className="space-y-1">
              {tagGroups.map((tag) => (
                <button
                  className={itemClassName(
                    activeFilter?.type === "tag" && activeFilter.slug === tag.slug
                  )}
                  key={tag.slug}
                  onClick={() => onTagSelect(tag)}
                  type="button"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs opacity-80">{tag.count}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Archive
          </h3>

          {archiveGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published entries yet.</p>
          ) : (
            <div className="space-y-4">
              {archiveGroups.map((yearGroup) => (
                <div className="space-y-1" key={yearGroup.year}>
                  <p className="text-sm font-semibold text-foreground">{yearGroup.year}</p>

                  {yearGroup.months.map((monthGroup) => (
                    <button
                      className={itemClassName(
                        activeFilter?.type === "archive" &&
                          activeFilter.year === yearGroup.year &&
                          activeFilter.month === monthGroup.month
                      )}
                      key={`${yearGroup.year}-${monthGroup.month}`}
                      onClick={() => onArchiveSelect(yearGroup.year, monthGroup.month)}
                      type="button"
                    >
                      <span>{monthGroup.label}</span>
                      <span className="text-xs opacity-80">{monthGroup.count}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Update the entries page to derive groups and render the sidebar**

Replace `src/pages/entries-page.jsx` with:

```jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PencilLine, RefreshCw } from "lucide-react";
import { EntriesSidebar } from "@/components/entries-sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import {
  buildArchiveGroups,
  buildTagGroups,
  filterEntries,
} from "@/lib/entry-taxonomy";
import { useEntries, deleteEntry } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";

const formatPublishedDate = (publishedAt) => {
  if (!publishedAt) {
    return "Draft";
  }

  return new Date(`${publishedAt}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function EntriesPage() {
  const { isAdmin } = useAuth();
  const { entries, loading, error, fetchEntries } = useEntries();
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const tagGroups = useMemo(() => buildTagGroups(entries), [entries]);
  const archiveGroups = useMemo(() => buildArchiveGroups(entries), [entries]);
  const visibleEntries = useMemo(
    () => filterEntries(entries, activeFilter),
    [activeFilter, entries]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <EntriesSidebar
        activeFilter={activeFilter}
        archiveGroups={archiveGroups}
        onArchiveSelect={(year, month) => setActiveFilter({ type: "archive", year, month })}
        onClearFilter={() => setActiveFilter(null)}
        onTagSelect={(tag) => setActiveFilter({ type: "tag", slug: tag.slug })}
        tagGroups={tagGroups}
      />

      <Card className="border-border/70 bg-background/95 shadow-lg shadow-black/5">
        <CardHeader className="flex flex-col gap-4 p-8 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Latest entries
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Browse everything in the blog. Filter by topic or month from the sidebar.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void fetchEntries()} type="button" variant="outline">
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>

            {isAdmin ? (
              <Link className={cn(buttonVariants())} to="/editor">
                <PencilLine className="mr-2 size-4" />
                New entry
              </Link>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-2">
          {loading ? (
            <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              Loading entries...
            </p>
          ) : null}

          {!loading && error ? (
            <p className="border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!loading && !error && visibleEntries.length === 0 ? (
            <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No entries match this filter.
            </p>
          ) : null}

          {!loading && !error && visibleEntries.length > 0 ? (
            <div className="space-y-3">
              {visibleEntries.map((entry) => (
                <article
                  className="flex flex-col gap-4 border border-border/70 bg-muted/30 p-5 transition-transform hover:-translate-y-0.5 hover:bg-muted/45 sm:flex-row sm:items-center sm:justify-between"
                  key={entry.id}
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {formatPublishedDate(entry.published_at)}
                      </p>
                      <h3 className="text-lg font-semibold text-foreground">
                        {entry.title || "Untitled"}
                      </h3>
                    </div>

                    {entry.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag) => (
                          <span
                            className="border border-border/70 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                            key={tag.slug}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {isAdmin ? (
                      <>
                        <Link
                          className={cn(buttonVariants({ variant: "outline" }))}
                          to={`/editor/${entry.id}`}
                        >
                          Edit
                        </Link>
                        <Button
                          onClick={async () => {
                            const { error } = await deleteEntry(entry.id);
                            if (!error) {
                              void fetchEntries();
                            }
                          }}
                          variant="outline"
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}

                    <Link className={cn(buttonVariants())} to={`/view/${entry.id}`}>
                      View entry
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Run the helper tests again before the UI manual check**

Run:

```bash
npm test -- src/lib/entry-taxonomy.test.js
```

Expected: PASS.

- [ ] **Step 4: Manually verify the sidebar behavior in the browser**

Run:

```bash
npm run dev
```

Manual checks:

- sidebar shows `Tags` above `Archive`
- clicking a tag filters the list in place
- clicking a month clears the tag filter and applies the archive filter
- `Clear filter` resets the full list
- entry cards show tag chips when tags exist

- [ ] **Step 5: Commit**

```bash
git add src/components/entries-sidebar.jsx src/pages/entries-page.jsx
git commit -m "feat: add sidebar filters for tags and archive months"
```

---

### Task 5: Add the Editor Tag Input and Save Flow

**Files:**
- Create: `src/components/tag-input.jsx`
- Modify: `src/pages/editor-page.jsx`

- [ ] **Step 1: Create the tag input component**

Create `src/components/tag-input.jsx`:

```jsx
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { searchTags } from "@/lib/entry-tags";
import { normalizeSelectedTag } from "@/lib/entry-taxonomy";

const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => window.clearTimeout(timerId);
  }, [delay, value]);

  return debouncedValue;
};

export function TagInput({ disabled, selectedTags, onChange }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const debouncedQuery = useDebouncedValue(query, 150);

  const selectedSlugs = useMemo(
    () => new Set(selectedTags.map((tag) => tag.slug)),
    [selectedTags]
  );

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setHighlightedIndex(0);
      return;
    }

    let cancelled = false;

    const loadSuggestions = async () => {
      const { error, tags } = await searchTags(debouncedQuery);

      if (cancelled) {
        return;
      }

      if (error) {
        setErrorMessage("Unable to load tag suggestions.");
        setSuggestions([]);
        return;
      }

      setErrorMessage("");
      setSuggestions(tags.filter((tag) => !selectedSlugs.has(tag.slug)));
      setHighlightedIndex(0);
    };

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, selectedSlugs]);

  const addTag = (value) => {
    const normalized = normalizeSelectedTag(value.name ?? value);

    if (!normalized || selectedSlugs.has(normalized.slug)) {
      setQuery("");
      return;
    }

    onChange([...selectedTags, normalized]);
    setQuery("");
    setSuggestions([]);
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) =>
        suggestions.length === 0 ? 0 : Math.min(currentIndex + 1, suggestions.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      addTag(suggestions[highlightedIndex] ?? query);
    }
  };

  return (
    <div className="space-y-3">
      <Input
        disabled={disabled}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a tag and press Enter"
        value={query}
      />

      <p className="text-xs text-muted-foreground">
        Existing tags appear as you type. Press Enter to reuse the highlighted tag or create a new one.
      </p>

      {errorMessage ? (
        <p className="border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="border border-border/70 bg-background">
          {suggestions.map((tag, index) => (
            <button
              className={[
                "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                index === highlightedIndex ? "bg-muted" : "hover:bg-muted/60",
              ].join(" ")}
              key={tag.slug}
              onClick={() => addTag(tag)}
              type="button"
            >
              <span>{tag.name}</span>
              <span className="text-xs text-muted-foreground">reuse</span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              className="inline-flex items-center gap-2 border border-border/70 bg-muted/40 px-3 py-1 text-sm"
              key={tag.slug}
            >
              {tag.name}
              <Button
                className="h-auto px-0 text-muted-foreground"
                onClick={() => onChange(selectedTags.filter((item) => item.slug !== tag.slug))}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="size-3.5" />
              </Button>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Update the editor page to load, display, and save tags**

Replace `src/pages/editor-page.jsx` with:

```jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { TagInput } from "@/components/tag-input";
import { TiptapEditor } from "@/components/tiptap-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { syncEntryTags } from "@/lib/entry-tags";
import { createEntry, fetchEntry, updateEntry } from "@/hooks/use-entries";
import { cn } from "@/lib/utils";

const getPlainText = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function EditorPage() {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [contentText, setContentText] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingEntry, setLoadingEntry] = useState(Boolean(entryId));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(entryId);

  useEffect(() => {
    let isMounted = true;

    const loadEntry = async () => {
      if (!entryId) {
        setTitle("");
        setContent("<p></p>");
        setContentText("");
        setSelectedTags([]);
        setLoadingEntry(false);
        setErrorMessage("");
        return;
      }

      setLoadingEntry(true);
      setErrorMessage("");

      const { entry, error } = await fetchEntry(entryId);

      if (!isMounted) {
        return;
      }

      if (error || !entry) {
        setTitle("");
        setContent("<p></p>");
        setContentText("");
        setSelectedTags([]);
        setErrorMessage(error?.message || "Unable to load this entry.");
        setLoadingEntry(false);
        return;
      }

      setTitle(entry.title || "");
      setContent(entry.content || "<p></p>");
      setContentText(getPlainText(entry.content || ""));
      setSelectedTags(entry.tags ?? []);
      setLoadingEntry(false);
    };

    void loadEntry();

    return () => {
      isMounted = false;
    };
  }, [entryId]);

  const editorDescription = useMemo(
    () =>
      isEditing
        ? "Update an existing entry, adjust its tags, and publish the revised HTML back to Supabase."
        : "Compose a new entry, assign tags, and publish it to Supabase.",
    [isEditing]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!contentText.trim()) {
      setErrorMessage("Add some content before publishing.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    const payload = {
      content,
      title: title.trim(),
    };

    const { entry, error } = isEditing
      ? await updateEntry(entryId, payload)
      : await createEntry(payload);

    if (error || !entry) {
      setErrorMessage(error?.message || "Unable to save this entry.");
      setIsSaving(false);
      return;
    }

    const { error: tagsError } = await syncEntryTags(entry.id, selectedTags);

    if (tagsError) {
      setErrorMessage(`Entry saved, but tags could not be updated: ${tagsError.message}`);
      setIsSaving(false);
      return;
    }

    navigate("/entries");
  };

  return (
    <Card className="mx-auto max-w-5xl border-border/70 bg-background/95 shadow-lg shadow-black/5">
      <CardHeader className="space-y-5 p-8 pb-4">
        <Link className={cn(buttonVariants({ variant: "outline" }), "w-fit")} to="/entries">
          <ArrowLeft className="mr-2 size-4" />
          Back to entries
        </Link>

        <div className="space-y-2">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {isEditing ? "Edit entry" : "Write a new entry"}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            {editorDescription}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 p-8 pt-2">
          <div className="space-y-2">
            <Label htmlFor="entry-title">Title</Label>
            <Input
              id="entry-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give this entry a clear title"
              value={title}
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              disabled={isSaving || loadingEntry}
              onChange={setSelectedTags}
              selectedTags={selectedTags}
            />
          </div>

          {errorMessage ? (
            <p className="border border-destructive/20 bg-destructive/5 px-4 py-4 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          {loadingEntry ? (
            <p className="border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              Loading entry...
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Label>Content</Label>
                <p className="text-xs text-muted-foreground">
                  Basic formatting: bold, italic, headings, lists, and quotes.
                </p>
              </div>

              <TiptapEditor
                disabled={isSaving}
                onChange={({ html, text }) => {
                  setContent(html);
                  setContentText(text);
                }}
                value={content}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col items-start justify-between gap-4 border-t border-border/70 p-8 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Content is stored as HTML so it can be rendered directly on the public view page.
          </p>

          <Button disabled={isSaving || loadingEntry} type="submit">
            <Save className="mr-2 size-4" />
            {isSaving ? "Saving..." : isEditing ? "Update entry" : "Publish entry"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 3: Run the helper tests before the browser check**

Run:

```bash
npm test -- src/lib/entry-taxonomy.test.js
```

Expected: PASS.

- [ ] **Step 4: Manually verify the tag-entry workflow in the browser**

Run:

```bash
npm run dev
```

Manual checks:

- typing in the tag field shows live suggestions from existing tags
- arrow keys move the highlighted suggestion
- pressing `Enter` reuses the highlighted suggestion when present
- pressing `Enter` with no matching suggestion creates a new tag chip
- removing a chip updates the selected tag list
- saving a new or existing entry persists the selected tags

- [ ] **Step 5: Commit**

```bash
git add src/components/tag-input.jsx src/pages/editor-page.jsx
git commit -m "feat: add live tag selection to the entry editor"
```

---

### Task 6: Update Docs and Run Final Verification

**Files:**
- Modify: `README.md`
- Modify: `USAGE.md`

- [ ] **Step 1: Update the technical documentation**

Add the tag schema and sidebar architecture to `README.md`. Include these additions in the relevant sections:

```md
### tags

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `name` | text | Human-readable tag label |
| `slug` | text | Canonical unique tag identifier |
| `created_at` | timestamptz | Row creation timestamp |

### entry_tags

| Column | Type | Description |
|--------|------|-------------|
| `entry_id` | uuid | Foreign key to `entries.id` |
| `tag_id` | uuid | Foreign key to `tags.id` |

The entries page derives sidebar groups from fetched entry data. Tags are shown in one sidebar section above the year/month archive.
```

- [ ] **Step 2: Update the user-facing documentation**

Add the new behavior to `USAGE.md`:

```md
## Browsing by Tag or Date

Use the sidebar on the Entries page to narrow what you see:

- **Tags** filters entries by topic
- **Archive** filters entries by year and month
- Only one filter is active at a time
- Click **Clear filter** to return to the full list

## Adding Tags (Admin Only)

When writing or editing an entry:

1. Type into the tag field near the title
2. Choose an existing tag from the live suggestions, or press **Enter** to create a new one
3. Added tags appear as removable chips
```

- [ ] **Step 3: Run the full automated verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected:

- `npm test` passes
- `npm run build` passes
- `git diff --check` produces no output

- [ ] **Step 4: Run the final manual verification pass**

Run:

```bash
npm run dev
```

Manual checks:

- create a new entry with two tags
- edit the same entry and remove one tag
- confirm the sidebar tag counts update after refresh
- filter by a tag and by a month
- verify only one filter is active at a time

- [ ] **Step 5: Commit**

```bash
git add README.md USAGE.md
git commit -m "docs: describe tag grouping and sidebar filters"
```

---

## Self-Review

### Spec Coverage

- Sidebar tags above archive: covered in Task 4.
- One active filter at a time: covered in Task 4 helper usage and sidebar state.
- Multiple canonical tags per entry: covered in Tasks 2, 3, and 5.
- Live fetch of existing tags: covered in Task 5.
- Year > Month archive: covered in Tasks 1 and 4.
- Docs updates: covered in Task 6.

### Placeholder Scan

The plan uses concrete file paths, exact commands, concrete migration SQL, and concrete code blocks. No `TODO`, `TBD`, or “similar to above” placeholders remain.

### Type Consistency

- The active filter shape is consistently `tag` or `archive`.
- Tag objects consistently use `{ name, slug }` plus optional `id` from the database.
- The save flow consistently returns `entry.id` before syncing tags.

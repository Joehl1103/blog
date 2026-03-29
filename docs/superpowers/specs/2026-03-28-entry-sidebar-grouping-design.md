# Entry Sidebar Grouping Design

Date: 2026-03-28
Status: Approved for planning

## Summary

Add a sidebar grouping feature to the entries page that lets readers filter entries by tag or archive month. The sidebar will use one stacked section with tags on top and a year/month archive underneath. This requires introducing canonical tags in the database and linking entries to multiple tags.

## Goals

- Let readers discover entries by topic and by publication date.
- Add multiple tags to each entry.
- Reuse existing tags when possible instead of creating duplicates.
- Keep v1 filtering simple by allowing only one active filter at a time.

## Non-Goals

- No multi-filter combinations in v1.
- No standalone tag management screen in v1.
- No clickable year-level archive filters in v1.
- No separate taxonomy features such as tag descriptions, colors, or ordering rules.

## Product Decisions

### Sidebar Structure

The entries page will gain a sidebar column with one stacked navigation area:

- `Tags` section first
- `Archive` section second

The main content area remains the entries list.

### Filter Behavior

The page supports one active filter at a time:

- Clicking a tag filters the entries list to entries linked to that tag.
- Clicking an archive month filters the entries list to entries published in that month.
- Selecting one filter clears any previously active filter.
- A `Clear filter` action appears when a filter is active.

Filtering happens in place on the entries page rather than navigating to a new route.

### Tag Behavior

Each entry can have multiple tags.

Tag entry is free-form, but tags become canonical when committed:

- The admin types into a tag input.
- A live search fetches matching existing tags.
- Pressing `Enter` adds the highlighted match if one is selected.
- If no match is selected, pressing `Enter` creates a new normalized tag.

Tags are shown as removable chips in the editor.

### Archive Behavior

Archive grouping uses `Year > Month`:

- Years render as headings.
- Months render beneath each year with entry counts.
- Month rows are clickable filters.
- Years are not clickable in v1.

## Data Model

Use a normalized many-to-many tag model.

### `tags`

- `id uuid primary key default gen_random_uuid()`
- `name text not null`
- `slug text not null unique`
- `created_at timestamptz default now()`

### `entry_tags`

- `entry_id uuid not null references entries(id) on delete cascade`
- `tag_id uuid not null references tags(id) on delete cascade`
- `primary key (entry_id, tag_id)`

### Slug Rules

The slug is the canonical normalized identifier for a tag. It is used to prevent duplicates and match existing tags consistently.

Normalization rules for v1:

- trim leading and trailing whitespace
- collapse repeated internal spaces
- lowercase
- convert spaces to hyphens

Examples:

- `React Hooks` -> `react-hooks`
- `Personal   Projects` -> `personal-projects`

## Backend and Query Design

### Entry List Data

The entries query should return each entry along with its linked tags so the entries page can derive:

- the rendered tag chips for each entry
- tag counts for the sidebar
- archive counts for the sidebar
- the filtered in-memory list

The page should not need separate sidebar-specific APIs in v1.

### Tag Search

The editor should perform a debounced live query against `tags` while the admin types.

Matching rules:

- case-insensitive
- match against `name` and `slug`
- prefix matching is preferred for v1

### Save Strategy

Saving an entry with tags should follow this flow:

1. Save the entry row.
2. Resolve each selected tag to an existing `tags` row by slug.
3. Create any missing tags.
4. Replace the entry's `entry_tags` rows with the selected set.

Replacing links on save is preferred to incremental patching because it is easier to reason about and keeps the client logic smaller.

## UI Design

### Entries Page

Add a responsive two-column layout:

- Sidebar column for tags and archive navigation
- Main column for the current entries list

The sidebar should show:

- tags sorted alphabetically with counts, for example `React (3)`
- archive grouped by year and month with counts, for example `March (4)` under `2026`

The filtered list should still reuse the existing entry cards and entry actions.

### Editor Page

Add a tag input near the title field.

The tag input should support:

- live suggestions under the input
- keyboard selection
- `Enter` to add the current suggestion or create a new normalized tag
- removable chips for selected tags

When editing an existing entry, the page should load and display the current linked tags as chips.

## State Management

### Entries Page State

Keep one filter state in the entries page:

- `null`
- `{ type: "tag", slug: string }`
- `{ type: "archive", year: number, month: number }`

The visible entries list is derived from the full fetched list plus this filter state.

### Editor State

The editor keeps local state for:

- current tag input text
- suggestion results
- highlighted suggestion index
- selected tags for the entry

## Error Handling

- If live tag suggestions fail, the admin can still create a new tag by pressing `Enter`.
- Empty tags are ignored.
- Duplicate selected tags are ignored after normalization.
- If entry-tag save operations fail, the editor should show a clear error and not silently pretend the tag update succeeded.

## Documentation Impact

When implemented, update:

- `README.md` with the new schema and entries-page architecture
- `USAGE.md` with the new sidebar filtering and tag editing behavior

## Verification Plan

Primary manual verification for v1:

- create an entry with new tags
- reuse an existing tag from live suggestions
- edit an entry and add or remove tags
- filter entries by tag
- filter entries by archive month
- clear the active filter

One targeted regression test is appropriate if tag normalization or tag-resolution logic is extracted into a standalone helper.

## Open Decisions Resolved

- Sidebar uses one stacked section with tags above archive.
- Entries support multiple tags.
- Archive uses `Year > Month`.
- Filtering happens in place on the entries page.
- Tag entry is free-form with live fetch and canonical reuse.
- Only one active filter is allowed at a time in v1.

-- Comments on blog entries
create table comments (
  id uuid default gen_random_uuid() primary key,
  entry_id uuid references entries(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null default auth.uid(),
  body text not null,
  created_at timestamptz default now()
);

-- RLS
alter table comments enable row level security;

-- Anyone can read comments (matches entries' public read policy)
create policy "Public can read all comments"
  on comments for select
  using (true);

-- Authenticated users can add comments to any entry
create policy "Authenticated users can insert own comments"
  on comments for insert
  with check (auth.uid() = user_id);

-- Comment authors can update their own comments
create policy "Users can update own comments"
  on comments for update
  using (auth.uid() = user_id);

-- Comment authors can delete their own comments
create policy "Users can delete own comments"
  on comments for delete
  using (auth.uid() = user_id);

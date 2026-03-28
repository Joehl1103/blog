create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null default auth.uid(),
  title text,
  content text not null,
  published_at date not null default current_date,
  created_at timestamptz default now()
);

-- RLS: users can only access their own entries
alter table entries enable row level security;

create policy "Users can read own entries"
  on entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own entries"
  on entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own entries"
  on entries for update
  using (auth.uid() = user_id);

-- Allow anyone (including unauthenticated users) to read all entries
create policy "Public can read all entries"
  on entries for select
  using (true);

create table if not exists public.client_diagnostics (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  app_version text not null check (char_length(app_version) between 1 and 20),
  event_type text not null check (event_type in ('error', 'promise', 'network', 'call')),
  message text not null check (char_length(message) between 1 and 500),
  path text not null default '/' check (char_length(path) between 1 and 120),
  created_at timestamptz not null default now()
);

create index if not exists client_diagnostics_created_at_idx
  on public.client_diagnostics (created_at desc);

create index if not exists client_diagnostics_user_created_at_idx
  on public.client_diagnostics (user_id, created_at desc);

alter table public.client_diagnostics enable row level security;

revoke all on table public.client_diagnostics from anon, authenticated;
grant insert on table public.client_diagnostics to authenticated;

revoke all on sequence public.client_diagnostics_id_seq from anon, authenticated;
grant usage, select on sequence public.client_diagnostics_id_seq to authenticated;

drop policy if exists "users can submit own diagnostics" on public.client_diagnostics;
create policy "users can submit own diagnostics"
  on public.client_diagnostics
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

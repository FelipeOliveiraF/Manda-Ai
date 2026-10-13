create table public.user_preferences (
  id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'purple' check (theme in ('purple', 'dark', 'light')),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using ((select auth.uid()) = id);

create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke all on table public.user_preferences from anon;
grant select, insert, update on table public.user_preferences to authenticated;

begin;

alter table public.room_invites
  add column if not exists max_uses integer,
  add constraint room_invites_max_uses_check check (max_uses is null or max_uses between 1 and 1000);

create table if not exists public.room_channel_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  channel_id bigint not null,
  last_read_at timestamptz not null default now(),
  primary key (user_id, channel_id),
  constraint room_channel_reads_room_channel_fkey foreign key (room_id, channel_id)
    references public.room_channels(room_id, id) on delete cascade
);

create index if not exists room_channel_reads_room_user_idx on public.room_channel_reads(room_id, user_id);

create table if not exists public.room_notification_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  muted boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

create table if not exists public.room_bans (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  banned_by uuid not null references auth.users(id),
  banned_until timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  primary key (room_id, user_id),
  constraint room_bans_reason_check check (reason is null or char_length(reason) <= 300)
);

create index if not exists room_bans_active_idx on public.room_bans(room_id, banned_until);

create table if not exists public.room_moderation_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.rooms(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('role_changed','microphone_changed','screen_share_changed','member_removed','member_banned','member_unbanned','chat_cleared','invite_revoked')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists room_moderation_events_room_created_idx on public.room_moderation_events(room_id, created_at desc);

alter table public.room_channel_reads enable row level security;
alter table public.room_notification_preferences enable row level security;
alter table public.room_bans enable row level security;
alter table public.room_moderation_events enable row level security;

create policy room_channel_reads_own_select on public.room_channel_reads for select to authenticated using ((select auth.uid()) = user_id);
create policy room_channel_reads_own_insert on public.room_channel_reads for insert to authenticated with check ((select auth.uid()) = user_id and (select private.is_room_member(room_id)));
create policy room_channel_reads_own_update on public.room_channel_reads for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and (select private.is_room_member(room_id)));

create policy room_notification_preferences_own_select on public.room_notification_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy room_notification_preferences_own_insert on public.room_notification_preferences for insert to authenticated with check ((select auth.uid()) = user_id and (select private.is_room_member(room_id)));
create policy room_notification_preferences_own_update on public.room_notification_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and (select private.is_room_member(room_id)));

create policy room_bans_admin_read on public.room_bans for select to authenticated using ((select private.is_room_admin(room_id)));
create policy room_moderation_events_admin_read on public.room_moderation_events for select to authenticated using ((select private.is_room_admin(room_id)));

revoke all on table public.room_channel_reads, public.room_notification_preferences, public.room_bans, public.room_moderation_events from anon, authenticated;
grant select, insert, update on public.room_channel_reads to authenticated;
grant select, insert, update on public.room_notification_preferences to authenticated;

create or replace function private.log_room_moderation(
  target_room_id uuid,
  target_user_id uuid,
  event_action text,
  event_details jsonb default '{}'::jsonb
) returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.room_moderation_events(room_id, actor_id, target_user_id, action, details)
  values (target_room_id, (select auth.uid()), target_user_id, event_action, coalesce(event_details, '{}'::jsonb));
$$;

revoke all on function private.log_room_moderation(uuid, uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.mark_room_channel_read(p_channel_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_room_id uuid;
begin
  select room_id into target_room_id from public.room_channels where id = p_channel_id;
  if (select auth.uid()) is null or target_room_id is null or not private.is_room_member(target_room_id) then
    raise exception 'room membership required';
  end if;
  insert into public.room_channel_reads(user_id, room_id, channel_id, last_read_at)
  values ((select auth.uid()), target_room_id, p_channel_id, now())
  on conflict (user_id, channel_id) do update set last_read_at = excluded.last_read_at, room_id = excluded.room_id;
end;
$$;

create or replace function public.get_unread_counts()
returns table(room_id uuid, channel_id bigint, unread_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select m.room_id, m.channel_id, count(*)::bigint
  from public.room_messages m
  join public.room_members rm on rm.room_id = m.room_id and rm.user_id = (select auth.uid())
  left join public.room_channel_reads r on r.user_id = rm.user_id and r.channel_id = m.channel_id
  where (select auth.uid()) is not null
    and m.user_id <> (select auth.uid())
    and m.created_at > coalesce(r.last_read_at, rm.created_at, '-infinity'::timestamptz)
  group by m.room_id, m.channel_id;
$$;

create or replace function public.create_room_invite_managed(p_room_id uuid, p_expires_in_hours integer default null, p_max_uses integer default null)
returns table(token text, invite_id uuid, expires_at timestamptz, max_uses integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  raw_token text;
  created_invite_id uuid;
  calculated_expiry timestamptz;
begin
  if current_user_id is null or not private.is_room_member(p_room_id) then raise exception 'room membership required'; end if;
  if p_expires_in_hours is not null and p_expires_in_hours not between 1 and 720 then raise exception 'expiry must be between 1 and 720 hours'; end if;
  if p_max_uses is not null and p_max_uses not between 1 and 1000 then raise exception 'max uses must be between 1 and 1000'; end if;
  raw_token := encode(extensions.gen_random_bytes(24), 'hex');
  calculated_expiry := case when p_expires_in_hours is null then null else now() + make_interval(hours => p_expires_in_hours) end;
  insert into public.room_invites(room_id, token_hash, created_by, expires_at, max_uses)
  values (p_room_id, encode(extensions.digest(raw_token, 'sha256'), 'hex'), current_user_id, calculated_expiry, p_max_uses)
  returning id into created_invite_id;
  return query select raw_token, created_invite_id, calculated_expiry, p_max_uses;
end;
$$;

create or replace function public.get_room_invite_preview(p_token text)
returns table(room_name text, inviter_name text, expires_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.name, p.display_name, i.expires_at
  from public.room_invites i join public.rooms r on r.id=i.room_id join public.profiles p on p.id=i.created_by
  where i.token_hash=encode(extensions.digest(trim(p_token),'sha256'),'hex') and i.revoked_at is null
    and (i.expires_at is null or i.expires_at>now()) and (i.max_uses is null or i.use_count<i.max_uses)
  limit 1;
$$;

create or replace function public.accept_room_invite(p_token text)
returns table(room_id uuid)
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid()); found_invite public.room_invites; member_name text;
begin
  if current_user_id is null then raise exception 'authentication required'; end if;
  select * into found_invite from public.room_invites
  where token_hash=encode(extensions.digest(trim(p_token),'sha256'),'hex') and revoked_at is null
    and (expires_at is null or expires_at>now()) and (max_uses is null or use_count<max_uses)
  for update;
  if found_invite.id is null then raise exception 'invite not found or expired'; end if;
  delete from public.room_bans where room_id=found_invite.room_id and user_id=current_user_id and banned_until is not null and banned_until<=now();
  if exists(select 1 from public.room_bans where room_id=found_invite.room_id and user_id=current_user_id and (banned_until is null or banned_until>now())) then raise exception 'room access blocked'; end if;
  select left(coalesce(nullif(trim(display_name),''),'Amigo'),60) into member_name from public.profiles where id=current_user_id;
  insert into public.room_members(room_id,user_id,role,display_name,last_joined_at)
  values(found_invite.room_id,current_user_id,'member',coalesce(member_name,'Amigo'),now())
  on conflict on constraint room_members_pkey do update set last_joined_at=excluded.last_joined_at;
  update public.room_invites set use_count=use_count+1 where id=found_invite.id;
  return query select found_invite.room_id;
end;
$$;

drop function if exists public.list_room_invites(uuid);
create function public.list_room_invites(p_room_id uuid)
returns table(id uuid, created_by uuid, creator_name text, expires_at timestamptz, revoked_at timestamptz, use_count integer, max_uses integer, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_room_admin(p_room_id) then raise exception 'room administrator required'; end if;
  return query select i.id,i.created_by,p.display_name,i.expires_at,i.revoked_at,i.use_count,i.max_uses,i.created_at
  from public.room_invites i join public.profiles p on p.id=i.created_by where i.room_id=p_room_id order by i.created_at desc limit 100;
end;
$$;

create or replace function public.ban_room_member(p_room_id uuid, p_user_id uuid, p_duration_hours integer default null, p_reason text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare caller_role text; target_role text;
begin
  select role into caller_role from public.room_members where room_id=p_room_id and user_id=(select auth.uid());
  select role into target_role from public.room_members where room_id=p_room_id and user_id=p_user_id;
  if caller_role not in ('owner','admin') then raise exception 'room administrator required'; end if;
  if target_role is null or target_role='owner' or (target_role='admin' and caller_role<>'owner') then raise exception 'this member cannot be blocked'; end if;
  if p_duration_hours is not null and p_duration_hours not between 1 and 8760 then raise exception 'invalid duration'; end if;
  insert into public.room_bans(room_id,user_id,banned_by,banned_until,reason)
  values(p_room_id,p_user_id,(select auth.uid()),case when p_duration_hours is null then null else now()+make_interval(hours=>p_duration_hours) end,nullif(left(trim(p_reason),300),''))
  on conflict(room_id,user_id) do update set banned_by=excluded.banned_by,banned_until=excluded.banned_until,reason=excluded.reason,created_at=now();
  perform private.log_room_moderation(p_room_id,p_user_id,'member_banned',jsonb_build_object('duration_hours',p_duration_hours,'reason',nullif(left(trim(p_reason),300),'')));
  delete from public.room_members where room_id=p_room_id and user_id=p_user_id;
end;
$$;

create or replace function public.unban_room_member(p_room_id uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_room_admin(p_room_id) then raise exception 'room administrator required'; end if;
  delete from public.room_bans where room_id=p_room_id and user_id=p_user_id;
  perform private.log_room_moderation(p_room_id,p_user_id,'member_unbanned','{}'::jsonb);
end;
$$;

create or replace function public.list_room_bans(p_room_id uuid)
returns table(user_id uuid, display_name text, banned_until timestamptz, reason text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_room_admin(p_room_id) then raise exception 'room administrator required'; end if;
  return query select b.user_id,coalesce(p.display_name,'Pessoa'),b.banned_until,b.reason,b.created_at
  from public.room_bans b left join public.profiles p on p.id=b.user_id
  where b.room_id=p_room_id and (b.banned_until is null or b.banned_until>now()) order by b.created_at desc;
end;
$$;

create or replace function public.list_room_moderation_events(p_room_id uuid)
returns table(action text, actor_name text, target_name text, summary text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not private.is_room_admin(p_room_id) then raise exception 'room administrator required'; end if;
  return query select e.action,coalesce(a.display_name,'Administrador'),coalesce(t.display_name,'Pessoa'),
    case e.action when 'role_changed' then coalesce(t.display_name,'Pessoa')||' teve o cargo alterado'
      when 'microphone_changed' then 'Permissão de microfone alterada para '||coalesce(t.display_name,'Pessoa')
      when 'screen_share_changed' then 'Permissão de tela alterada para '||coalesce(t.display_name,'Pessoa')
      when 'member_removed' then coalesce(t.display_name,'Pessoa')||' foi removido(a)'
      when 'member_banned' then coalesce(t.display_name,'Pessoa')||' teve o acesso bloqueado'
      when 'member_unbanned' then coalesce(t.display_name,'Pessoa')||' foi desbloqueado(a)'
      when 'chat_cleared' then 'Um chat de texto foi limpo'
      when 'invite_revoked' then 'Um convite foi revogado' else 'Ação administrativa realizada' end,
    e.created_at
  from public.room_moderation_events e left join public.profiles a on a.id=e.actor_id left join public.profiles t on t.id=e.target_user_id
  where e.room_id=p_room_id order by e.created_at desc limit 50;
end;
$$;

create or replace function public.set_room_member_role(p_room_id uuid,p_user_id uuid,p_role text)
returns public.room_members language plpgsql security definer set search_path=''
as $$
declare updated_member public.room_members;
begin
  if (select auth.uid()) is null or not private.is_room_owner(p_room_id) then raise exception 'room owner required'; end if;
  if p_role not in ('admin','member') or p_user_id=(select auth.uid()) then raise exception 'invalid role'; end if;
  update public.room_members set role=p_role where room_id=p_room_id and user_id=p_user_id and role<>'owner' returning * into updated_member;
  if updated_member.user_id is null then raise exception 'member not found'; end if;
  perform private.log_room_moderation(p_room_id,p_user_id,'role_changed',jsonb_build_object('role',p_role)); return updated_member;
end;
$$;

create or replace function public.set_room_member_controls(p_room_id uuid,p_user_id uuid,p_is_muted boolean,p_can_share_screen boolean)
returns public.room_members language plpgsql security definer set search_path=''
as $$
declare caller_role text; target_role text; previous_muted boolean; previous_share boolean; updated_member public.room_members;
begin
  select role into caller_role from public.room_members where room_id=p_room_id and user_id=(select auth.uid());
  select role,is_muted,can_share_screen into target_role,previous_muted,previous_share from public.room_members where room_id=p_room_id and user_id=p_user_id;
  if caller_role not in ('owner','admin') or target_role is null or target_role='owner' or (target_role='admin' and caller_role<>'owner') then raise exception 'member cannot be moderated'; end if;
  update public.room_members set is_muted=p_is_muted,can_share_screen=p_can_share_screen where room_id=p_room_id and user_id=p_user_id returning * into updated_member;
  if previous_muted is distinct from p_is_muted then perform private.log_room_moderation(p_room_id,p_user_id,'microphone_changed',jsonb_build_object('muted',p_is_muted)); end if;
  if previous_share is distinct from p_can_share_screen then perform private.log_room_moderation(p_room_id,p_user_id,'screen_share_changed',jsonb_build_object('allowed',p_can_share_screen)); end if;
  return updated_member;
end;
$$;

create or replace function public.remove_room_member(p_room_id uuid,p_user_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
declare caller_role text; target_role text;
begin
  select role into caller_role from public.room_members where room_id=p_room_id and user_id=(select auth.uid());
  select role into target_role from public.room_members where room_id=p_room_id and user_id=p_user_id;
  if caller_role not in ('owner','admin') or target_role is null or target_role='owner' or (target_role='admin' and caller_role<>'owner') then raise exception 'member cannot be removed'; end if;
  perform private.log_room_moderation(p_room_id,p_user_id,'member_removed','{}'::jsonb);
  delete from public.room_members where room_id=p_room_id and user_id=p_user_id;
end;
$$;

create or replace function public.clear_room_channel(p_channel_id bigint)
returns void language plpgsql security definer set search_path=''
as $$
declare target_room_id uuid;
begin
  select room_id into target_room_id from public.room_channels where id=p_channel_id;
  if target_room_id is null or not private.is_room_admin(target_room_id) then raise exception 'room administrator required'; end if;
  delete from public.room_messages where channel_id=p_channel_id;
  perform private.log_room_moderation(target_room_id,null,'chat_cleared',jsonb_build_object('channel_id',p_channel_id));
end;
$$;

create or replace function public.revoke_room_invite(p_invite_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
declare target_room_id uuid; invite_creator uuid;
begin
  select room_id,created_by into target_room_id,invite_creator from public.room_invites where id=p_invite_id;
  if target_room_id is null or (invite_creator<>(select auth.uid()) and not private.is_room_admin(target_room_id)) then raise exception 'invite manager required'; end if;
  update public.room_invites set revoked_at=coalesce(revoked_at,now()) where id=p_invite_id;
  perform private.log_room_moderation(target_room_id,null,'invite_revoked',jsonb_build_object('invite_id',p_invite_id));
end;
$$;

revoke all on function public.mark_room_channel_read(bigint), public.get_unread_counts(), public.create_room_invite_managed(uuid,integer,integer), public.ban_room_member(uuid,uuid,integer,text), public.unban_room_member(uuid,uuid), public.list_room_bans(uuid), public.list_room_moderation_events(uuid) from public,anon,authenticated;
grant execute on function public.mark_room_channel_read(bigint), public.get_unread_counts(), public.create_room_invite_managed(uuid,integer,integer), public.ban_room_member(uuid,uuid,integer,text), public.unban_room_member(uuid,uuid), public.list_room_bans(uuid), public.list_room_moderation_events(uuid) to authenticated;
revoke all on function public.list_room_invites(uuid) from public,anon,authenticated;
grant execute on function public.list_room_invites(uuid) to authenticated;

-- Least privilege for every table exposed through the Data API.
revoke all on table public.room_channels,public.room_invites,public.room_messages,public.room_message_reactions from anon;
revoke all on table public.room_channels,public.room_invites,public.room_messages,public.room_message_reactions from authenticated;
grant select on public.room_channels to authenticated;
grant select,insert,delete on public.room_messages to authenticated;
grant select,insert,delete on public.room_message_reactions to authenticated;
revoke insert,delete on public.room_members from authenticated;
grant usage,select on sequence public.room_messages_id_seq,public.room_message_reactions_id_seq to authenticated;

commit;

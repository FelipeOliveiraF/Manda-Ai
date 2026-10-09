-- Avoid ambiguity between the RETURNS TABLE output variable "room_id" and
-- the columns used by the room_members primary key.
create or replace function public.accept_room_invite(p_token text)
returns table(room_id uuid)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  current_user_id uuid := (select auth.uid());
  found_invite public.room_invites;
begin
  if current_user_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into found_invite
  from public.room_invites
  where token_hash = encode(extensions.digest(trim(p_token), 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now())
  for update;

  if found_invite.id is null then
    raise exception 'invite not found or expired';
  end if;

  insert into public.room_members(room_id, user_id, role, last_joined_at)
  values (found_invite.room_id, current_user_id, 'member', now())
  on conflict on constraint room_members_pkey
  do update set last_joined_at = excluded.last_joined_at;

  update public.room_invites
  set use_count = use_count + 1
  where id = found_invite.id;

  return query select found_invite.room_id;
end;
$function$;

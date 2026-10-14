revoke all on function public.create_room_invite(uuid) from public, anon, authenticated;
revoke all on function public.create_room_invite_with_expiry(uuid, integer) from public, anon, authenticated;

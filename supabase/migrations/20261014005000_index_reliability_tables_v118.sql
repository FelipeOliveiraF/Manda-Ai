begin;

create index if not exists room_bans_user_id_idx
  on public.room_bans(user_id);

create index if not exists room_bans_banned_by_idx
  on public.room_bans(banned_by);

create index if not exists room_channel_reads_room_channel_idx
  on public.room_channel_reads(room_id, channel_id);

create index if not exists room_notification_preferences_room_id_idx
  on public.room_notification_preferences(room_id);

create index if not exists room_moderation_events_actor_id_idx
  on public.room_moderation_events(actor_id);

create index if not exists room_moderation_events_target_user_id_idx
  on public.room_moderation_events(target_user_id);

commit;

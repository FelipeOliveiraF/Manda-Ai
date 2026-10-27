begin;

create table public.room_chess_games (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  challenger_id uuid not null references public.profiles(id) on delete cascade,
  opponent_id uuid not null references public.profiles(id) on delete cascade,
  white_id uuid not null references public.profiles(id) on delete cascade,
  black_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','white_won','black_won','draw','declined','cancelled')),
  fen text not null default 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn text not null default '',
  last_move text,
  move_number integer not null default 0 check (move_number >= 0),
  winner_id uuid references public.profiles(id) on delete set null,
  result_reason text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  responded_at timestamptz,
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint room_chess_distinct_players_check check (challenger_id <> opponent_id and white_id <> black_id),
  constraint room_chess_fen_length_check check (char_length(fen) between 15 and 120),
  constraint room_chess_pgn_length_check check (char_length(pgn) <= 12000),
  constraint room_chess_last_move_check check (last_move is null or last_move ~ '^[a-h][1-8][a-h][1-8][qrbn]?$')
);

create index room_chess_games_room_updated_idx on public.room_chess_games(room_id, updated_at desc);
create index room_chess_games_challenger_status_idx on public.room_chess_games(challenger_id, status);
create index room_chess_games_opponent_status_idx on public.room_chess_games(opponent_id, status);
create index room_chess_games_white_id_idx on public.room_chess_games(white_id);
create index room_chess_games_black_id_idx on public.room_chess_games(black_id);
create index room_chess_games_winner_id_idx on public.room_chess_games(winner_id) where winner_id is not null;

alter table public.room_chess_games enable row level security;

create policy room_chess_games_member_read
on public.room_chess_games for select to authenticated
using ((select private.is_room_member(room_id)));

revoke all on table public.room_chess_games from public, anon, authenticated;
grant select on table public.room_chess_games to authenticated;

create or replace function public.create_chess_challenge(p_room_id uuid, p_opponent_id uuid)
returns public.room_chess_games
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  created_game public.room_chess_games;
begin
  if current_user_id is null or current_user_id = p_opponent_id then
    raise exception 'invalid chess opponent';
  end if;
  if not private.is_room_member(p_room_id)
    or not exists (select 1 from public.room_members where room_id = p_room_id and user_id = p_opponent_id) then
    raise exception 'both players must be room members';
  end if;
  if exists (
    select 1 from public.room_chess_games
    where room_id = p_room_id
      and status in ('pending','active')
      and (expires_at > now() or status = 'active')
      and current_user_id in (challenger_id, opponent_id)
  ) then
    raise exception 'player already has an open chess game';
  end if;
  if exists (
    select 1 from public.room_chess_games
    where room_id = p_room_id
      and status in ('pending','active')
      and (expires_at > now() or status = 'active')
      and p_opponent_id in (challenger_id, opponent_id)
  ) then
    raise exception 'opponent already has an open chess game';
  end if;

  insert into public.room_chess_games(room_id, challenger_id, opponent_id, white_id, black_id)
  values (p_room_id, current_user_id, p_opponent_id, current_user_id, p_opponent_id)
  returning * into created_game;
  return created_game;
end;
$$;

create or replace function public.respond_chess_challenge(p_game_id uuid, p_accept boolean)
returns public.room_chess_games
language plpgsql
security definer
set search_path = ''
as $$
declare game public.room_chess_games;
begin
  select * into game from public.room_chess_games where id = p_game_id for update;
  if game.id is null or game.opponent_id <> (select auth.uid()) or game.status <> 'pending' then
    raise exception 'challenge is not available';
  end if;
  if game.expires_at <= now() then
    update public.room_chess_games set status = 'cancelled', updated_at = now() where id = p_game_id returning * into game;
    return game;
  end if;
  if p_accept and (not private.is_room_member(game.room_id)
    or not exists (select 1 from public.room_members where room_id = game.room_id and user_id = game.challenger_id)) then
    raise exception 'both players must still be room members';
  end if;
  update public.room_chess_games
  set status = case when p_accept then 'active' else 'declined' end,
      responded_at = now(), updated_at = now()
  where id = p_game_id returning * into game;
  return game;
end;
$$;

create or replace function public.cancel_chess_challenge(p_game_id uuid)
returns public.room_chess_games
language plpgsql
security definer
set search_path = ''
as $$
declare game public.room_chess_games;
begin
  select * into game from public.room_chess_games where id = p_game_id for update;
  if game.id is null or game.challenger_id <> (select auth.uid()) or game.status <> 'pending' then
    raise exception 'challenge cannot be cancelled';
  end if;
  update public.room_chess_games set status = 'cancelled', updated_at = now() where id = p_game_id returning * into game;
  return game;
end;
$$;

create or replace function public.make_chess_move(
  p_game_id uuid,
  p_from text,
  p_to text,
  p_promotion text,
  p_fen text,
  p_pgn text,
  p_san text,
  p_expected_move_number integer,
  p_outcome text default 'active'
)
returns public.room_chess_games
language plpgsql
security definer
set search_path = ''
as $$
declare
  game public.room_chess_games;
  current_turn text;
  next_turn text;
  moving_user uuid;
  winner uuid;
begin
  select * into game from public.room_chess_games where id = p_game_id for update;
  if game.id is null or game.status <> 'active' then raise exception 'game is not active'; end if;
  if not private.is_room_member(game.room_id) then raise exception 'room membership required'; end if;
  if p_expected_move_number <> game.move_number then raise exception 'game changed; refresh and try again'; end if;
  if p_from !~ '^[a-h][1-8]$' or p_to !~ '^[a-h][1-8]$' or coalesce(p_promotion, '') !~ '^(|q|r|b|n)$' then
    raise exception 'invalid move coordinates';
  end if;
  if char_length(p_fen) not between 15 and 120 or char_length(p_pgn) > 12000 or char_length(coalesce(p_san,'')) > 20 then
    raise exception 'invalid chess state';
  end if;
  if p_outcome not in ('active','white_won','black_won','draw') then raise exception 'invalid outcome'; end if;
  current_turn := split_part(game.fen, ' ', 2);
  next_turn := split_part(p_fen, ' ', 2);
  moving_user := case when current_turn = 'w' then game.white_id else game.black_id end;
  if moving_user <> (select auth.uid()) then raise exception 'not your turn'; end if;
  if next_turn = current_turn or next_turn not in ('w','b') then raise exception 'invalid next turn'; end if;
  winner := case when p_outcome = 'white_won' then game.white_id when p_outcome = 'black_won' then game.black_id else null end;

  update public.room_chess_games
  set fen = p_fen,
      pgn = p_pgn,
      last_move = p_from || p_to || coalesce(p_promotion, ''),
      move_number = move_number + 1,
      status = p_outcome,
      winner_id = winner,
      result_reason = case when p_outcome = 'draw' then 'Empate' when p_outcome <> 'active' then 'Xeque-mate' else p_san end,
      finished_at = case when p_outcome <> 'active' then now() else null end,
      updated_at = now()
  where id = p_game_id returning * into game;
  return game;
end;
$$;

create or replace function public.resign_chess_game(p_game_id uuid)
returns public.room_chess_games
language plpgsql
security definer
set search_path = ''
as $$
declare game public.room_chess_games; current_user_id uuid := (select auth.uid());
begin
  select * into game from public.room_chess_games where id = p_game_id for update;
  if game.id is null or game.status <> 'active' or current_user_id not in (game.white_id, game.black_id) then
    raise exception 'game cannot be resigned';
  end if;
  update public.room_chess_games
  set status = case when current_user_id = white_id then 'black_won' else 'white_won' end,
      winner_id = case when current_user_id = white_id then black_id else white_id end,
      result_reason = 'Desistência', finished_at = now(), updated_at = now()
  where id = p_game_id returning * into game;
  return game;
end;
$$;

revoke all on function public.create_chess_challenge(uuid,uuid), public.respond_chess_challenge(uuid,boolean),
  public.cancel_chess_challenge(uuid), public.make_chess_move(uuid,text,text,text,text,text,text,integer,text),
  public.resign_chess_game(uuid) from public, anon, authenticated;

grant execute on function public.create_chess_challenge(uuid,uuid), public.respond_chess_challenge(uuid,boolean),
  public.cancel_chess_challenge(uuid), public.make_chess_move(uuid,text,text,text,text,text,text,integer,text),
  public.resign_chess_game(uuid) to authenticated;

alter publication supabase_realtime add table public.room_chess_games;

commit;

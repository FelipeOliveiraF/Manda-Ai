import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Chess } from "chess.js";

const game = new Chess();
for (const move of ["f3", "e5", "g4", "Qh4#"]) game.move(move);
assert.equal(game.isCheckmate(), true, "o motor precisa reconhecer xeque-mate");
assert.equal(game.turn(), "w", "o turno precisa alternar depois de cada jogada");

const migration = await readFile(new URL("../supabase/migrations/20261027045258_room_chess_v119.sql", import.meta.url), "utf8");
for (const marker of ["enable row level security", "room_chess_games_member_read", "create_chess_challenge", "respond_chess_challenge", "make_chess_move", "resign_chess_game", "supabase_realtime"]) {
  assert.match(migration, new RegExp(marker));
}
assert.match(migration, /revoke all on table public\.room_chess_games from public, anon, authenticated/);

console.log("PASS: regras do xadrez, sincronização e controles de acesso estão conectados");

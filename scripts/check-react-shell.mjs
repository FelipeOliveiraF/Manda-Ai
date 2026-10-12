import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { page } from "../worker/page.js";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const shellFiles = ["AppShell.tsx", "Sidebar.tsx", "RoomHeader.tsx", "Stage.tsx", "ChatPanel.tsx"];
const shellSource = (await Promise.all([
  ...shellFiles.map((file) => readFile(resolve(root, "src/components/shell", file), "utf8")),
  readFile(resolve(root, "src/components/call/PrejoinDialog.tsx"), "utf8"),
  ...["AuthScreen.tsx", "InviteDialogs.tsx", "AccountDialogs.tsx", "RoomDialogs.tsx", "MembersDialog.tsx", "ComplementarySurfaces.tsx"]
    .map((file) => readFile(resolve(root, "src/components/complementary", file), "utf8")),
])).join("\n");
const idsIn = (source, pattern = /id=["']([^"']+)["']/g) => [...source.matchAll(pattern)].map((match) => match[1]);
const expected = idsIn(page);
const rendered = idsIn(shellSource);

assert.equal(rendered.length, new Set(rendered).size, "React e superfícies compatíveis não podem repetir IDs");
for (const id of expected) assert.ok(rendered.includes(id), `ID ausente na migração React: ${id}`);
for (const component of ["app-shell", "sidebar", "room-header", "stage", "media-controls", "chat-panel", "prejoin-dialog", "auth-screen", "room-dialogs", "invite-dialogs", "account-dialogs", "members-dialog"]) {
  assert.match(shellSource, new RegExp(`data-component=["']${component}["']`), `Componente React ausente: ${component}`);
}

console.log(`PASS: React preserva ${expected.length} IDs e 12 superfícies nativas`);

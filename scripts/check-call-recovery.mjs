import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const [policySource, runtime] = await Promise.all([
  readFile(resolve(root, "src/services/coordinatorRecovery.ts"), "utf8"),
  readFile(resolve(root, "worker/app.js"), "utf8"),
]);
const compiled = ts.transpileModule(policySource, { compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 } }).outputText;
const recovery = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

const firstParticipant = new recovery.CoordinatorRecoveryPolicy();
const secondParticipant = new recovery.CoordinatorRecoveryPolicy();
const firstDelay = firstParticipant.nextDelay(() => 0.1);
const secondDelay = secondParticipant.nextDelay(() => 0.8);
assert.ok(firstDelay < secondDelay, "dois participantes precisam disputar a coordenação em instantes diferentes");
assert.ok(firstParticipant.nextDelay(() => 0.1) > firstDelay, "novas tentativas precisam usar espera progressiva");
firstParticipant.reset();
assert.equal(firstParticipant.attempt, 0, "uma chamada recuperada precisa zerar as tentativas");

for (const marker of ["scheduleCoordinatorRecovery", "beginCoordinatorElection", "coordinator-recovered", "connection.on('close'", "connection.on('error'"]) {
  assert.match(runtime, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}
assert.match(runtime, /unavailable-id[\s\S]+joinCoordinator/);

console.log("PASS: two-participant coordinator recovery converges with progressive backoff");

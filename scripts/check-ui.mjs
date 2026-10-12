import assert from 'node:assert/strict';
import {page} from '../worker/page.js';
import {appScript} from '../worker/app.js';
import app from '../worker/index.js';
assert.match(page,/Versão 1\.13/);
new Function(appScript);
const ids=[...page.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
for(const match of appScript.matchAll(/\$\('#([\w-]+)'\)/g)){
 assert.ok(ids.includes(match[1]),'Missing element: '+match[1]);
}
for(const path of ['/','/app.js','/app.css','/privacy','/manifest.webmanifest']){
 const result=await app.fetch(new Request('https://local.invalid'+path));
 assert.equal(result.status,200,path);
 assert.ok((await result.text()).length>20,path);
}
assert.equal((await app.fetch(new Request('https://local.invalid/test-fixture'))).status,404);
assert.match(appScript,/tile-volume-range/);
assert.match(appScript,/getAudioTracks/);
assert.match(appScript,/requestFullscreen/);
assert.match(appScript,/tile-fullscreen/);
assert.match(appScript,/systemAudio: 'exclude'/);
assert.match(appScript,/windowAudio: 'exclude'/);
assert.match(appScript,/displaySurface === 'browser'/);
assert.match(appScript,/update_room_nickname/);
assert.match(appScript,/create_room_channel/);
assert.match(appScript,/set_room_member_role/);
assert.match(appScript,/set_room_member_controls/);
assert.match(appScript,/remove_room_member/);
assert.match(appScript,/room_channels/);
assert.match(appScript,/focus-mode/);
assert.match(appScript,/room-controls-/);
console.log('PASS: client syntax, unique IDs, client selectors, routes, fixture excluded');

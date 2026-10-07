// Local-only UI fixture. No backend calls, accounts, uploads or messages are real.
import http from 'node:http';
import app from '../worker/index.js';
const fixture = `
const user={id:'fixture-owner',email:'teste@example.invalid',user_metadata:{full_name:'Marina Costa'}};
const tables={
 profiles:[{id:user.id,display_name:'Marina Costa',avatar_url:null}],
 rooms:['Ponto de encontro','Sala de estudos','Noite de jogos'].map((name,i)=>({id:'fixture-'+i,name,code:'AMIGOS'+i,owner_id:user.id,media_key:'local-only',avatar_url:null})),
 room_messages:[{id:'msg1',room_id:'fixture-0',user_id:'fixture-friend',body:'Quem vai entrar na chamada hoje?',created_at:new Date().toISOString(),profiles:{display_name:'Lucas'}},{id:'msg2',room_id:'fixture-0',user_id:user.id,body:'Já estou por aqui! 👋',created_at:new Date().toISOString(),profiles:{display_name:'Marina Costa'}}]
};
window.supabase={createClient:()=>({
 auth:{onAuthStateChange(){},getSession:async()=>({data:{session:{user}}}),signOut:async()=>location.reload()},
 from(table){let result=tables[table]||[],values;const q={
 select(){return q},order(){return q},limit(){return q},
 eq(key,value){result=result.filter(r=>r[key]===value);return q},in(key,values){result=result.filter(r=>values.includes(r[key]));return q},
 update(v){values=v;return q},insert(){return Promise.resolve({error:null})},
 single(){if(values)result.forEach(r=>Object.assign(r,values));return Promise.resolve({data:result[0],error:null})},
 then(resolve){resolve({data:result,error:null})}};return q},
 channel(){return {on(){return this},subscribe(){return this}}},removeChannel(){},
 storage:{from(){return {createSignedUrl:async()=>({error:true}),upload:async()=>({error:null}),remove:async()=>({error:null})}}},
 rpc:async()=>({error:{message:'Prévia local'}})
})};
window.Peer=class{constructor(id){this.id=id||'fixture-peer';this.open=true;this.events={};setTimeout(()=>this.events.open?.(),50)}on(event,fn){this.events[event]=fn}destroy(){}};
document.title='Prévia local · dados de teste';
document.querySelector('.sidebar-intro').textContent='PRÉVIA LOCAL · DADOS DE TESTE';
`;
http.createServer(async(req,res)=>{
 const response=await app.fetch(new Request('http://127.0.0.1:4174'+req.url));
 let body=await response.text();
 if(req.url==='/'){
  body=body.replace(/<script[^>]*src="https:[^>]*><\/script>/g,'');
  body=body.replace('<script src="/app.js"', '<script>'+fixture+'</script><script src="/app.js"');
 }
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(body);
}).listen(4174,'127.0.0.1',()=>console.log('Fixture: http://127.0.0.1:4174'));

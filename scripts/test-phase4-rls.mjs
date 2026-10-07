import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const A="11111111-1111-4111-8111-111111111111",B="22222222-2222-4222-8222-222222222222",device="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const date="2026-10-08T00:00:00Z";
const records=[
 {kind:"flashcard",record_id:"phase4-test-card",data:{status:"review",lastReviewedAt:date,rememberedCount:2,forgotCount:1,extra:"preserved"}},
 {kind:"question",record_id:"phase4-unit::phase4-question",data:{attemptCount:3,correctCount:2,incorrectCount:1,lastAnsweredAt:date,needsReview:true}},
 {kind:"study",record_id:"phase4-unit",data:{attempts:1,correct:2,total:3,bestPercent:67,lastStudied:date}},
].map(r=>({...r,schema_version:2,client_created_at:date,client_updated_at:date}));
test("actual PostgreSQL migration: owner CRUD, RLS isolation, RPC atomicity and idempotency",async t=>{
 const db=new PGlite();
 try {
 await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
 insert into auth.users values ('${A}'),('${B}');`);
 await db.exec(fs.readFileSync("supabase/migrations/202610080001_phase4_learning.sql","utf8"));
 const as=async(user,fn)=>{await db.exec("set role authenticated");await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user]);try{return await fn();}finally{await db.exec("reset role");}};
 const rpc=(revision,payload=records,initial=false,writer=device)=>db.query("select public.save_chemica_learning($1,$2,$3::jsonb,$4) as result",[writer,revision,JSON.stringify(payload),initial]);
 await t.test("initial confirmation required, including NULL",async()=>{
  await as(A,async()=>{await assert.rejects(rpc(1,records,false),/confirmation/);await assert.rejects(rpc(1,records,null),/confirmation/);});
 });
 await as(A,()=>rpc(1,records,true));
 const tables=[["learning_cloud_bindings","device_id"],["flashcard_progress","card_id"],["question_history","record_id"],["study_progress","unit_slug"]];
 for(const [table,column] of tables){
  await t.test(table+": own select/update, other user select/update/delete denied",async()=>{
   await as(A,async()=>{assert.equal((await db.query("select * from public."+table)).rows.length,1);assert.equal((await db.query("update public."+table+" set updated_at=updated_at where user_id=$1 returning user_id",[A])).rows.length,1);
    await assert.rejects(db.query("update public."+table+" set user_id=$1 where user_id=$2",[B,A]),/row-level security/);
   });
   await as(B,async()=>{assert.equal((await db.query("select * from public."+table+" where user_id=$1",[A])).rows.length,0);
    assert.equal((await db.query("update public."+table+" set updated_at=updated_at where user_id=$1 returning user_id",[A])).rows.length,0);
    assert.equal((await db.query("delete from public."+table+" where user_id=$1 returning user_id",[A])).rows.length,0);
   });
   await as(A,async()=>{
    await assert.rejects(db.query("insert into public."+table+" select "+(table==="learning_cloud_bindings"?"$1,device_id,last_revision,created_at,updated_at":"$1,"+(await db.query("select column_name from information_schema.columns where table_schema='public' and table_name=$1 and column_name<>'user_id' order by ordinal_position",[table])).rows.map(r=>r.column_name).join(","))+" from public."+table+" where user_id=$2",[B,A]),/row-level security/);
   });
   assert.ok(column);
  });
 }
 await t.test("same教材ID may exist for both users; A cannot see B",async()=>{
  await as(B,()=>rpc(1,records,true,"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"));
  await as(A,async()=>{assert.equal((await db.query("select * from public.flashcard_progress")).rows.length,1);});
 });
 await t.test("retry uses absolute counters, not additions",async()=>{
  await as(A,async()=>{
   assert.equal((await rpc(1)).rows[0].result.applied,false);
   await rpc(2);
   assert.equal((await db.query("select remembered_count,payload from public.flashcard_progress")).rows[0].remembered_count,2);
   assert.equal((await db.query("select payload from public.flashcard_progress")).rows[0].payload.extra,"preserved");
  });
 });
 await t.test("another device and malformed mixed batch are rejected atomically",async()=>{
  await as(A,async()=>{
   await assert.rejects(rpc(3,records,false,"cccccccc-cccc-4ccc-8ccc-cccccccccccc"),/another device/);
   await assert.rejects(rpc(3,[{...records[0],data:{...records[0].data,rememberedCount:99}},{...records[1],data:{...records[1].data,attemptCount:-1}}]));
   assert.equal((await db.query("select remembered_count from public.flashcard_progress")).rows[0].remembered_count,2);
   assert.equal((await db.query("select last_revision from public.learning_cloud_bindings")).rows[0].last_revision,2);
   await assert.rejects(rpc(3,[records[0],records[0]]),/duplicate/);
  });
 });
 await t.test("anonymous has no table or RPC access",async()=>{
  await db.exec("set role anon");
  try{for(const [table] of tables)await assert.rejects(db.query("select * from public."+table),/permission denied/);await assert.rejects(rpc(1),/permission denied/);}finally{await db.exec("reset role");}
 });
 await t.test("own delete succeeds on every table",async()=>{
  await as(A,async()=>{for(const [table] of tables)assert.equal((await db.query("delete from public."+table+" where user_id=$1 returning user_id",[A])).rows.length,1);});
 });
 const policies=await db.query("select * from pg_policies where schemaname='public'");
 assert.equal(policies.rows.length,16);
 }finally{await db.close();}
});

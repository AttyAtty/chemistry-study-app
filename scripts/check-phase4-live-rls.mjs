// Only two ordinary user access tokens. Never uses service_role, secret key or DB password.
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd(),false,{info(){},error(){}});
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const tokens=[process.env.CHEMICA_RLS_USER_A_TOKEN,process.env.CHEMICA_RLS_USER_B_TOKEN];
if(!url||!key?.startsWith("sb_publishable_")||tokens.some(t=>!t)){console.error("設定不足：Publishable keyと検証用2ユーザーのaccess tokenが必要です。値はログに出しません。");process.exit(1);}
const client=token=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{headers:token?{Authorization:"Bearer "+token}:{}}});
const [a,b]=tokens.map(client),anon=client();
const [ua,ub]=await Promise.all([a.auth.getUser(tokens[0]),b.auth.getUser(tokens[1])]);
if(ua.error||ub.error||ua.data.user.id===ub.data.user.id){console.error("別々の有効な2ユーザーが必要です。");process.exit(1);}
const A=ua.data.user.id,B=ub.data.user.id,id="chemica-rls-check-"+randomUUID(),date=new Date().toISOString();
const base={user_id:A,payload:{test:true},schema_version:2,source_revision:1,client_created_at:date,client_updated_at:date};
const fixtures=[
 ["flashcard_progress","card_id",{...base,card_id:id,status:"review",remembered_count:0,forgot_count:0}],
 ["question_history","record_id",{...base,record_id:id,unit_slug:id,question_id:id,attempt_count:0,correct_count:0,incorrect_count:0,needs_review:false}],
 ["study_progress","unit_slug",{...base,unit_slug:id,attempts:0,correct:0,total:0,best_percent:0}],
];
function check(ok,label){if(!ok)throw new Error(label+"：失敗");console.log(label+"：成功");}
try{
 for(const [table,pk,row]of fixtures){
  let r=await a.from(table).insert(row).select(pk);check(!r.error&&r.data.length===1,table+" A insert");
  r=await a.from(table).select(pk).eq(pk,id);check(!r.error&&r.data.length===1,table+" A select");
  r=await a.from(table).update({payload:{test:"updated"}}).eq(pk,id).select(pk);check(!r.error&&r.data.length===1,table+" A update");
  r=await b.from(table).select(pk).eq(pk,id).eq("user_id",A);check(!r.error&&r.data.length===0,table+" B cannot select A");
  r=await b.from(table).update({payload:{test:"forbidden"}}).eq(pk,id).eq("user_id",A).select(pk);check(!r.error&&r.data.length===0,table+" B cannot update A");
  r=await b.from(table).delete().eq(pk,id).eq("user_id",A).select(pk);check(!r.error&&r.data.length===0,table+" B cannot delete A");
  r=await a.from(table).insert({...row,user_id:B});check(Boolean(r.error),table+" A cannot insert B");
  r=await a.from(table).update({user_id:B}).eq(pk,id);check(Boolean(r.error),table+" A cannot change owner");
  r=await anon.from(table).select(pk).eq(pk,id);check(Boolean(r.error)||r.data?.length===0,table+" anon denied");
  r=await a.from(table).delete().eq(pk,id).eq("user_id",A).select(pk);check(!r.error&&r.data.length===1,table+" A delete");
 }
 console.log("実プロジェクトRLS検証完了（専用テスト行のみ）");
}catch(error){console.error(error instanceof Error?error.message:"RLS検証失敗");process.exitCode=1;}
finally{for(const [table,pk]of fixtures){const ra=await a.from(table).delete().eq(pk,id).eq("user_id",A);const rb=await b.from(table).delete().eq(pk,id).eq("user_id",B);if(ra.error||rb.error){console.error("検証用rowの削除に失敗しました。専用ID："+id);process.exitCode=1;}}}

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import { randomUUID } from "node:crypto";
class MemoryStorage{
 values=new Map();fault=null;removes=[];
 getItem(key){return this.values.get(key)??null;}
 setItem(key,value){if(this.fault?.(key,value))throw new Error("QuotaExceededError");this.values.set(key,String(value));}
 removeItem(key){this.removes.push(key);this.values.delete(key);}
}
function harness(factory=new IDBFactory(),store=new MemoryStorage()){
 globalThis.window={localStorage:store,indexedDB:factory};
 const modules=new Map();
 function load(filename){
  const file=path.resolve(filename);if(modules.has(file))return modules.get(file);
  const exports={};modules.set(file,exports);
  const source=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function("exports","require","module","crypto",source)(exports,id=>{
   const base=id.startsWith("@/")?path.resolve("src",id.slice(2)):path.resolve(path.dirname(file),id);
   return load(fs.existsSync(base+".ts")?base+".ts":path.join(base,"index.ts"));
  },{exports},{randomUUID});
  return exports;
 }
 const api=load("src/lib/learningStorage.ts"),ids=load("src/lib/learningIds.ts"),map=load("src/data/learningIdMigrationMap.ts").learningIdMigrationMap;
 const db=load("src/lib/indexedDbLearningStorage.ts"),repo=load("src/lib/learningRepository.ts");
 return {load,store,factory,api,ids,map,db,repo,copy:options=>db.copyLocalStorageToIndexedDB({factory,storage:store,appVersion:"0.2.0",...options})};
}
const K=["chemica-flashcard-progress-v1","chemistry-question-history-v1","chemistry-study-progress-v1"],time="2026-10-05T00:00:00.000Z";
function seed(h){
 const card=Object.keys(h.map.flashcards)[0],q=Object.keys(h.map.questionHistory)[0];
 h.store.setItem(K[0],JSON.stringify({[card]:{status:"review",lastReviewedAt:time,nextReviewAt:time,reviewStep:-1,lastResult:"forgot",rememberedCount:3,forgotCount:2,extra:{keep:true}}}));
 h.store.setItem(K[1],JSON.stringify({[q]:{attemptCount:5,correctCount:3,incorrectCount:2,lastAnsweredAt:time,needsReview:true,extra:"keep"}}));
 h.store.setItem(K[2],JSON.stringify({"chemistry-basic-composition":{attempts:2,correct:4,total:6,bestPercent:80,lastStudied:time}}));
 return {card,q,newCard:h.map.flashcards[card],newQ:h.map.questionHistory[q]};
}
const raw=h=>K.map(key=>h.store.getItem(key));
async function inspect(h){const db=await h.db.openLearningDatabase(h.factory);try{return await h.db.readVerifiedCopy(db);}finally{db.close();}}
async function tamper(h,store,id,change){
 const db=await h.db.openLearningDatabase(h.factory);
 await new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.oncomplete=resolve;tx.onabort=reject;const req=tx.objectStore(store).get(id);req.onsuccess=()=>tx.objectStore(store).put(change(req.result));});
 db.close();
}
test("first copy preserves all raw keys, aliases, fields and verifies counts",async()=>{
 const h=harness(),id=seed(h),before=raw(h),copy=await h.copy();
 assert.deepEqual(raw(h),before);assert.deepEqual(copy.metadata.counts,[1,1,1]);
 assert.equal(copy.data[K[0]][id.newCard].forgotCount,2);assert.equal(copy.data[K[1]][id.newQ].needsReview,true);
 assert.ok(h.store.getItem(copy.metadata.archiveKey));assert.equal(h.store.removes.length,0);
 assert.deepEqual((await inspect(h)).data,copy.data);
});
test("empty localStorage/IndexedDB is usable and creates no learning key",async()=>{
 const h=harness(),before=raw(h),copy=await h.copy();assert.deepEqual(copy.metadata.counts,[0,0,0]);assert.deepEqual(raw(h),before);
});
test("rerun and page/PWA-style restart reuse verified copy without repeated backup",async()=>{
 const h=harness();seed(h);const first=await h.copy(),size=h.store.values.size;const next=await h.copy();
 assert.equal(next.metadata.archiveKey,first.metadata.archiveKey);assert.equal(h.store.values.size,size);
 const restarted=harness(h.factory,h.store);assert.deepEqual((await restarted.copy()).data,first.data);
});
test("ID mapping is idempotent; old/new aliases never double counts",()=>{
 const h=harness(),id=seed(h);const canonical=h.ids.canonicalRecords(K[1],JSON.parse(h.store.getItem(K[1])));
 assert.deepEqual(h.ids.canonicalRecords(K[1],canonical),canonical);
 const both={...JSON.parse(h.store.getItem(K[1])),...canonical};assert.equal(Object.keys(h.ids.canonicalRecords(K[1],both)).length,1);
 const conflict={...both,[id.newQ]:{...canonical[id.newQ],attemptCount:99}};assert.throws(()=>h.ids.canonicalRecords(K[1],conflict));
});
test("answer to new ID updates old history in place, preserves unknown fields",()=>{
 const h=harness(),id=seed(h),[unit,q]=id.newQ.split("::");
 assert.equal(h.load("src/lib/questionHistory.ts").recordQuestionAnswer(unit,q,true).ok,true);
 const records=JSON.parse(h.store.getItem(K[1]));
 assert.equal(records[id.q].attemptCount,6);assert.equal(records[id.q].extra,"keep");assert.equal(Object.hasOwn(records,id.newQ),false);
 assert.equal(h.load("src/lib/questionHistory.ts").readQuestionHistory()[id.newQ].attemptCount,6);
});
test("migration conflict blocks copying/writing and retains every original record",async()=>{
 const h=harness(),id=seed(h),records=JSON.parse(h.store.getItem(K[1]));
 records[id.newQ]={...records[id.q],attemptCount:100};h.store.setItem(K[1],JSON.stringify(records));const before=raw(h);
 await assert.rejects(h.copy());const [unit,q]=id.newQ.split("::");
 assert.equal(h.load("src/lib/questionHistory.ts").recordQuestionAnswer(unit,q,true).ok,false);assert.deepEqual(raw(h),before);
});
test("IndexedDB unavailable and open exception leave localStorage usable",async()=>{
 const h=harness();seed(h);const before=raw(h);
 await assert.rejects(h.copy({factory:{open(){throw new Error("SecurityError");}}}));assert.deepEqual(raw(h),before);
 assert.equal(JSON.parse(h.store.getItem(h.db.COPY_STATE_KEY)).status,"failed");
 assert.equal(h.load("src/lib/progress.ts").saveQuizResult("unit",1,1).ok,true);
});
test("transaction abort preserves previous database and permits retry",async()=>{
 const h=harness(),id=seed(h),first=await h.copy();
 h.load("src/lib/flashcardProgress.ts").saveFlashcardStatus(id.newCard,"known");const before=raw(h);
 await assert.rejects(h.copy({beforeVerify(tx){tx.abort();throw new Error("Injected copy failure");}}));
 assert.deepEqual(raw(h),before);assert.deepEqual((await inspect(h)).data,first.data);
 assert.equal(JSON.parse(h.store.getItem(h.db.COPY_STATE_KEY)).status,"failed");
 assert.equal((await h.copy()).data[K[0]][id.newCard].rememberedCount,4);
});
test("first copy abort never records migration completion",async()=>{
 const h=harness();seed(h);await assert.rejects(h.copy({beforeVerify(){throw new Error("Fault");}}));assert.equal(await inspect(h),null);
});
test("corrupt localStorage is retained and never replaces verified IndexedDB",async()=>{
 const h=harness();seed(h);const first=await h.copy();h.store.setItem(K[1],"{broken");const before=raw(h);
 await assert.rejects(h.copy());assert.deepEqual(raw(h),before);assert.deepEqual((await inspect(h)).data,first.data);
 assert.equal(h.api.exportLearningBackup("test").value.data[K[1]],"{broken");
});
test("corrupt IndexedDB is retained; copy stops and readers fall back",async()=>{
 const h=harness(),id=seed(h);await h.copy();const before=raw(h);
 await tamper(h,"questionHistory",id.newQ,row=>({...row,value:{...row.value,attemptCount:"wrong"}}));
 await assert.rejects(h.copy());assert.deepEqual(raw(h),before);
 assert.equal(h.load("src/lib/questionHistory.ts").readQuestionHistory()[id.newQ].attemptCount,5);
});
test("backup format v1 still exports old IDs; restore re-copies canonical IndexedDB",async()=>{
 const h=harness(),id=seed(h);await h.copy();const backup=h.api.exportLearningBackup("test").value;
 assert.equal(backup.schemaVersion,1);assert.ok(JSON.parse(backup.data[K[0]])[id.card]);
 backup.data[K[1]]=JSON.stringify({"other::fixed":{attemptCount:1,correctCount:1,incorrectCount:0,lastAnsweredAt:time,needsReview:false}});
 const prepared=h.api.prepareRestore(JSON.stringify(backup),"test");assert.equal(prepared.ok,true);
 assert.equal(h.api.applyRestore(prepared.value).ok,true);const copy=await h.copy();
 assert.equal(copy.data[K[1]]["other::fixed"].attemptCount,1);assert.equal(copy.metadata.restoreToken,prepared.value.backupKey);
 assert.ok(h.store.getItem(prepared.value.backupKey));
});
test("invalid restoration does not change either storage",async()=>{
 const h=harness();seed(h);const first=await h.copy(),before=raw(h);
 assert.equal(h.api.prepareRestore("{bad","test").ok,false);assert.deepEqual(raw(h),before);assert.deepEqual((await inspect(h)).data,first.data);
});
test("missing/decreased local history never erases IndexedDB data",async()=>{
 const h=harness();seed(h);const first=await h.copy();h.store.setItem(K[1],"{}");
 await assert.rejects(h.copy());assert.deepEqual((await inspect(h)).data,first.data);assert.equal(h.store.getItem(K[1]),"{}");
});
test("archive quota failure stops initial migration without touching learning keys",async()=>{
 const h=harness();seed(h);const before=raw(h);h.store.fault=key=>key.startsWith(h.api.BACKUP_KEY_PREFIX);
 await assert.rejects(h.copy());assert.deepEqual(raw(h),before);assert.equal(await inspect(h),null);
});
test("multiple-tab change during verification aborts stale mirror",async()=>{
 const h=harness(),id=seed(h);const first=await h.copy();
 h.load("src/lib/flashcardProgress.ts").saveFlashcardStatus(id.newCard,"known");
 await assert.rejects(h.copy({beforeVerify(){
   const records=JSON.parse(h.store.getItem(K[1]));records[id.q].attemptCount++;h.store.setItem(K[1],JSON.stringify(records));
 }}));
 assert.deepEqual((await inspect(h)).data,first.data);assert.equal(JSON.parse(h.store.getItem(K[1]))[id.q].attemptCount,6);
 assert.equal((await h.copy()).data[K[1]][id.newQ].attemptCount,6);
});
test("simultaneous initial copies remain idempotent",async()=>{
 const h=harness();seed(h);const before=raw(h);await Promise.all([h.copy(),h.copy()]);assert.deepEqual(raw(h),before);assert.ok(await inspect(h));
});
test("derived due/weak/unattempted state survives canonical conversion",async()=>{
 const h=harness(),id=seed(h);await h.copy();
 const flash=h.load("src/lib/flashcardProgress.ts"),question=h.load("src/lib/questionHistory.ts");
 assert.equal(flash.getDueFlashcards([{id:id.newCard}],flash.readFlashcardProgress()).length,1);
 assert.equal(flash.getNewFlashcards([{id:id.newCard},{id:"new-card"}],flash.readFlashcardProgress()).length,1);
 assert.equal(question.getReviewQuestionCount(),1);
 assert.equal(h.load("src/lib/progress.ts").readProgress()["chemistry-basic-composition"].attempts,2);
});

test("legacy API IDs update the same canonical record without resetting counts",()=>{
 const h=harness(),id=seed(h),[unit,question]=id.q.split("::");
 assert.equal(h.load("src/lib/questionHistory.ts").recordQuestionAnswer(unit,question,true).ok,true);
 assert.equal(h.load("src/lib/flashcardProgress.ts").saveFlashcardStatus(id.card,"known").ok,true);
 assert.equal(JSON.parse(h.store.getItem(K[1]))[id.q].attemptCount,6);
 assert.equal(JSON.parse(h.store.getItem(K[0]))[id.card].rememberedCount,4);
});
test("Phase 1 pending restore blocks IndexedDB copy and keeps prior snapshot",async()=>{
 const h=harness();seed(h);const first=await h.copy(),backup=h.api.exportLearningBackup("test").value;
 backup.data[K[1]]=JSON.stringify({"other::q":{attemptCount:1,correctCount:1,incorrectCount:0,lastAnsweredAt:time,needsReview:false}});
 const prepared=h.api.prepareRestore(JSON.stringify(backup),"test");
 h.store.setItem(h.api.RESTORE_JOURNAL_KEY,JSON.stringify({format:"chemica-restore-journal",schemaVersion:1,status:"pending",backupKey:prepared.value.backupKey,target:backup.data}));
 await assert.rejects(h.copy());assert.deepEqual((await inspect(h)).data,first.data);
 assert.equal(h.api.recoverPendingRestore().ok,true);assert.ok(await h.copy());
});
test("repository runtime tracks save/restore/storage events and guards stale reads",async()=>{
 const h=harness(),id=seed(h),events=new Map();
 window.addEventListener=(name,listener)=>events.set(name,listener);
 window.removeEventListener=name=>events.delete(name);
 const runtime=h.load("src/lib/learningStorageRuntime.ts"),stop=runtime.startLearningStorage("test");
 try{
  await runtime.refreshIndexedDb();assert.equal(runtime.getStorageStatus().state,"verified");
  const flash=h.load("src/lib/flashcardProgress.ts");
  const viewed=flash.readFlashcardProgress();viewed[id.newCard].forgotCount=500;
  assert.equal(flash.readFlashcardProgress()[id.newCard].forgotCount,2);
  flash.saveFlashcardStatus(id.newCard,"known");
  assert.equal(flash.readFlashcardProgress()[id.newCard].rememberedCount,4);
  await runtime.refreshIndexedDb();assert.equal((await inspect(h)).data[K[0]][id.newCard].rememberedCount,4);
  const backup=h.api.exportLearningBackup("test").value;
  backup.data[K[1]]=JSON.stringify({"restored::q":{attemptCount:2,correctCount:1,incorrectCount:1,lastAnsweredAt:time,needsReview:true}});
  const prepared=h.api.prepareRestore(JSON.stringify(backup),"test");assert.equal(h.api.applyRestore(prepared.value).ok,true);
  await new Promise(resolve=>queueMicrotask(resolve));await runtime.refreshIndexedDb();
  assert.equal((await inspect(h)).data[K[1]]["restored::q"].attemptCount,2);
  const records=JSON.parse(h.store.getItem(K[1]));records["restored::q"].attemptCount=3;
  h.store.setItem(K[1],JSON.stringify(records));events.get("storage")({key:K[1]});
  await runtime.refreshIndexedDb();assert.equal((await inspect(h)).data[K[1]]["restored::q"].attemptCount,3);
 }finally{stop();}
});
test("three legacy question histories still identify weak unit and today's review",async()=>{
 const h=harness();const {chemistryUnits}=h.load("src/data/chemistry.ts");
 const unit=chemistryUnits.find(unit=>unit.slug==="chemistry-basic-composition"),history={};
 for(const question of unit.questions.slice(0,3)){
  const key=unit.slug+"::"+question.id;
  const old=Object.keys(h.map.questionHistory).find(old=>h.map.questionHistory[old]===key);
  assert.ok(old);history[old]={attemptCount:1,correctCount:0,incorrectCount:1,lastAnsweredAt:time,needsReview:true};
 }
 h.store.setItem(K[1],JSON.stringify(history));
 const oldCard=Object.keys(h.map.flashcards)[0];
 h.store.setItem(K[0],JSON.stringify({[oldCard]:{status:"review",lastReviewedAt:time}}));
 await h.copy();
 const insights=h.load("src/lib/learningInsights.ts").getLearningInsights(
  h.load("src/lib/questionHistory.ts").readQuestionHistory(),
  h.load("src/lib/flashcardProgress.ts").readFlashcardProgress(),new Date(time));
 assert.equal(insights.answeredQuestions,3);assert.equal(insights.reviewQuestions,3);
 assert.equal(insights.dueCards,1);assert.equal(insights.weakUnits[0].unitSlug,unit.slug);
});
test("copy retry reuses immutable original archive after first-copy failure",async()=>{
 const h=harness();seed(h);
 await assert.rejects(h.copy({beforeVerify(){throw new Error("fail");}}));
 const archives=[...h.store.values.keys()].filter(key=>key.startsWith(h.api.BACKUP_KEY_PREFIX));
 const result=await h.copy();
 assert.equal([...h.store.values.keys()].filter(key=>key.startsWith(h.api.BACKUP_KEY_PREFIX)).length,archives.length);
 assert.equal(result.metadata.archiveKey,archives[0]);
});

test("synchronous IndexedDB put failure aborts the whole mirror",async()=>{
 const h=harness(),id=seed(h);const first=await h.copy();
 h.load("src/lib/flashcardProgress.ts").saveFlashcardStatus(id.newCard,"known");
 const original=IDBObjectStore.prototype.put;
 IDBObjectStore.prototype.put=function(...args){if(this.name==="questionHistory")throw new Error("DataCloneError");return original.apply(this,args);};
 try{await assert.rejects(h.copy());}finally{IDBObjectStore.prototype.put=original;}
 assert.deepEqual((await inspect(h)).data,first.data);assert.ok(await h.copy());
});
test("unknown-field and metadata-count corruption fail verification",async()=>{
 const h=harness(),id=seed(h);await h.copy();const before=raw(h);
 await tamper(h,"questionHistory",id.newQ,row=>({...row,value:{...row.value,extra:"lost"}}));
 await assert.rejects(h.copy());assert.deepEqual(raw(h),before);
 const other=harness();seed(other);await other.copy();
 await tamper(other,"metadata","current",meta=>({...meta,counts:[0,0,0]}));
 await assert.rejects(other.copy());
});

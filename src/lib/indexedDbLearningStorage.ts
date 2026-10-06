import {
  LEARNING_KEYS, BACKUP_KEY_PREFIX, archiveLearningSnapshot, exportLearningBackup, readRestoreArchive,
  validateLearningRecord, type LearningKey, type RawSnapshot, type StoragePort,
} from "./learningStorage";
import { canonicalRecords, aliases, type Records } from "./learningIds";
export const LEARNING_DB_NAME = "chemica-learning";
export const LEARNING_DB_VERSION = 1;
export const DATA_SCHEMA_VERSION = 2;
export const COPY_STATE_KEY = "chemica-storage-copy-state-v2";
export const STORES = ["flashcardProgress","questionHistory","studyProgress"] as const;
export type StoredRecord = { id:string; value:Record<string,unknown>; schemaVersion:2; createdAt:string; updatedAt:string; dirty:boolean; legacyIds:string[] };
export type CopyMetadata = {
  id:"current"; schemaVersion:2; idMigrationVersion:1; status:"verified";
  source:RawSnapshot; counts:number[]; archiveKey:string|null;
  createdAt:string; updatedAt:string; migratedAt:string; restoreToken:string|null;
};
export type VerifiedCopy = { metadata:CopyMetadata; data:Record<LearningKey,Records>; rows:StoredRecord[][] };
type Options = { factory?:IDBFactory; storage?:StoragePort; appVersion?:string; beforeVerify?: (tx:IDBTransaction) => void };
export function sourceMatches(source:RawSnapshot, port:StoragePort) { return LEARNING_KEYS.every(key=>port.getItem(key)===source[key]); }
function request<T>(req:IDBRequest<T>):Promise<T> { return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error ?? new Error("IndexedDB request failed"));}); }
export function openLearningDatabase(factory:IDBFactory):Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const req=factory.open(LEARNING_DB_NAME,LEARNING_DB_VERSION);
    let blocked=false;
    req.onupgradeneeded=()=>{ for(const name of [...STORES,"metadata"]) if(!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name,{keyPath:"id"}); };
    req.onerror=()=>reject(req.error ?? new Error("IndexedDB unavailable"));
    req.onblocked=()=>{blocked=true;reject(new Error("別タブが保存基盤を利用しています。タブを閉じて再試行してください。"));
};
    req.onsuccess=()=>{if(blocked){req.result.close();return;}req.result.onversionchange=()=>req.result.close();resolve(req.result);};
  });
}
function completed(tx:IDBTransaction):Promise<void> {return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error??new Error("IndexedDB transaction aborted"));tx.onerror=()=>{/* onabort reports failure */};});}
function equal(a:unknown,b:unknown):boolean { return JSON.stringify(a)===JSON.stringify(b); }
function parseSource(source:RawSnapshot):Record<LearningKey,Records> {
  return Object.fromEntries(LEARNING_KEYS.map(key=>{
    const value:unknown=source[key]===null?{}:JSON.parse(source[key]!);
    if(!validateLearningRecord(key,value)) throw new Error("localStorageの記録が不正です。原文を保持してコピーを停止しました。");
    return [key,canonicalRecords(key,value)];
  })) as Record<LearningKey,Records>;
}
function verifyRows(meta:CopyMetadata, rows:StoredRecord[][]):VerifiedCopy {
  if(meta.id!=="current" || meta.schemaVersion!==2 || meta.idMigrationVersion!==1 || meta.status!=="verified"
    || !Array.isArray(meta.counts) || meta.counts.length!==3 || !meta.source
    || !LEARNING_KEYS.every(key=>Object.hasOwn(meta.source,key)&&(meta.source[key]===null||typeof meta.source[key]==="string"))
    || !Number.isFinite(Date.parse(meta.createdAt)) || !Number.isFinite(Date.parse(meta.updatedAt))
    || !Number.isFinite(Date.parse(meta.migratedAt))) throw new Error("IndexedDB metadata is invalid");
  const expected=parseSource(meta.source);
  const data=Object.create(null) as Record<LearningKey,Records>;
  LEARNING_KEYS.forEach((key,index)=>{
    const records:Records=Object.create(null);
    for(const row of rows[index]) {
      if(!row || typeof row.id!=="string" || row.schemaVersion!==2 || Object.hasOwn(records,row.id)
        || !Number.isFinite(Date.parse(row.createdAt)) || !Number.isFinite(Date.parse(row.updatedAt))
        || typeof row.dirty!=="boolean" || !Array.isArray(row.legacyIds) || !row.legacyIds.every(id=>typeof id==="string")) throw new Error("IndexedDB record metadata is invalid");
      records[row.id]=row.value;
    }
    if(!validateLearningRecord(key,records) || Object.keys(records).length!==meta.counts[index]
      || !equal(Object.keys(records).sort(),Object.keys(expected[key]).sort())
      || Object.entries(expected[key]).some(([id,value])=>!equal(records[id],value))) throw new Error("IndexedDB copy verification failed");
    data[key]=records;
  });
  return {metadata:meta,data,rows};
}
export async function readVerifiedCopy(db:IDBDatabase):Promise<VerifiedCopy|null> {
  const tx=db.transaction([...STORES,"metadata"],"readonly");const done=completed(tx);
  const [reads]=await Promise.all([Promise.all([request(tx.objectStore("metadata").get("current")), ...STORES.map(name=>request(tx.objectStore(name).getAll()))]),done]);
  const meta=reads[0] as CopyMetadata|undefined;
  if(!meta) {if(reads.slice(1).some(rows=>(rows as unknown[]).length)) throw new Error("Unverified IndexedDB data exists");return null;}
  return verifyRows(meta,reads.slice(1) as StoredRecord[][]);
}
function restoreToken(port:StoragePort):string|null {
  const raw=port.getItem("chemica-storage-restore-journal-v1");
  if(!raw)return null;
  const journal=JSON.parse(raw);
  return journal.status==="committed"?journal.backupKey:null;
}
function preventLoss(previous:VerifiedCopy,next:Record<LearningKey,Records>,token:string|null) {
  if(previous.metadata.restoreToken!==token && token!==null)return; // Phase 1 confirmed restore, archived before replacement.
  const cumulative=["attemptCount","correctCount","incorrectCount","attempts","correct","total","rememberedCount","forgotCount"];
  for(const key of LEARNING_KEYS)for(const [id,entry]of Object.entries(previous.data[key])) {
    if(!Object.hasOwn(next[key],id))throw new Error("IndexedDBにのみ存在する履歴があります。自動上書きを停止しました。");
    for(const field of cumulative)if(typeof entry[field]==="number"&&(typeof next[key][id][field]!=="number" || (next[key][id][field] as number)<(entry[field] as number)))throw new Error("履歴の回数が減少しています。自動上書きを停止しました。");
  }
}
export async function copyLocalStorageToIndexedDB(options:Options={}):Promise<VerifiedCopy> {
  const port=options.storage??window.localStorage;
  const factory=options.factory??window.indexedDB;
  let db:IDBDatabase|undefined;
  let archiveKey:string|null=null;
  try {
    const archiveStatus=readRestoreArchive(port);
    if(!archiveStatus.ok || archiveStatus.value?.pending)throw new Error("復元処理を完了してからIndexedDBへのコピーを再試行してください。");
    const backup=exportLearningBackup(options.appVersion??"phase2",port);
    if(!backup.ok)throw new Error(backup.error);
    const source=backup.value.data;
    const data=parseSource(source);
    const token=restoreToken(port);
    if(!factory)throw new Error("IndexedDBを利用できません。localStorageで学習を続けられます。");
    db=await openLearningDatabase(factory);
    const previous=await readVerifiedCopy(db); // Corrupt DB is preserved, never silently reset.
    if(previous && equal(previous.metadata.source,source) && previous.metadata.restoreToken===token) {
      if(!sourceMatches(source,port))throw new Error("Source changed while reading IndexedDB");
      try { port.setItem(COPY_STATE_KEY,JSON.stringify({status:"verified",updatedAt:new Date().toISOString(),archiveKey:previous.metadata.archiveKey})); } catch { /* Nonessential status. */ }
      return previous;
    }
    if(previous)preventLoss(previous,data,token);
    archiveKey=previous?.metadata.archiveKey??null;
    if(!previous) {
      try {
        const state=JSON.parse(port.getItem(COPY_STATE_KEY)??"null");
        if(typeof state?.archiveKey==="string" && state.archiveKey.startsWith(BACKUP_KEY_PREFIX)) {
          const saved=JSON.parse(port.getItem(state.archiveKey)??"null");
          if(saved?.format==="chemica-learning-backup" && saved.schemaVersion===1 && equal(saved.data,source))archiveKey=state.archiveKey;
        }
      } catch { /* Invalid retry metadata never changes original data. */ }
    }
    if(!previous && !archiveKey && LEARNING_KEYS.some(key=>source[key]!==null)) {
      const archived=archiveLearningSnapshot(options.appVersion??"phase2",port);
      if(!archived.ok)throw new Error(archived.error);
      if(!equal(archived.value.before.data,source))throw new Error("Source changed before archive");
      archiveKey=archived.value.backupKey;
    }
    if(!sourceMatches(source,port))throw new Error("コピー中に他のタブで更新されました。再試行してください。");
    const now=new Date().toISOString();
    const metadata:CopyMetadata={id:"current",schemaVersion:2,idMigrationVersion:1,status:"verified",source,
      counts:LEARNING_KEYS.map(key=>Object.keys(data[key]).length),archiveKey,
      createdAt:previous?.metadata.createdAt??now,updatedAt:now,migratedAt:previous?.metadata.migratedAt??now,restoreToken:token};
    const tx=db.transaction([...STORES,"metadata"],"readwrite");const done=completed(tx);
    let verificationError:unknown;
    // All callbacks stay inside request events, keeping the transaction active.
    const readbacks:StoredRecord[][]=[];
    let remaining=3;
    try {
      for(let index=0;index<3;index++) {
        const key=LEARNING_KEYS[index],objectStore=tx.objectStore(STORES[index]);
        const previousRows=new Map(previous?.rows[index].map(row=>[row.id,row]));
        const legacyGroups=new Map<string,string[]>();
        const map=aliases(key);
        for(const oldId of Object.keys(JSON.parse(source[key]??"{}"))) {
          if(!Object.hasOwn(map,oldId))continue;
          const target=map[oldId];
          legacyGroups.set(target,[...(legacyGroups.get(target)??[]),oldId]);
        }
        objectStore.clear(); // Only the transactional, verified mirror; never localStorage.
        for(const [id,value]of Object.entries(data[key])) {
          const oldRow=previousRows.get(id);
          const old=oldRow?.value;
          objectStore.put({id,value,schemaVersion:2,createdAt:oldRow?.createdAt??now,updatedAt:old&&equal(old,value)?oldRow!.updatedAt:now,
            dirty:true,legacyIds:legacyGroups.get(id)??[]} satisfies StoredRecord);
        }
        const req=objectStore.getAll();
        req.onsuccess=()=>{
          readbacks[index]=req.result;
          if(--remaining!==0)return;
          try {
            options.beforeVerify?.(tx);
            verifyRows(metadata,readbacks);
            if(!sourceMatches(source,port)||restoreToken(port)!==token)throw new Error("コピー中の更新を検出しました。");
            tx.objectStore("metadata").put(metadata);
            if(!previous)tx.objectStore("metadata").put({id:"original-id-snapshot",schemaVersion:1,source,archiveKey,createdAt:now});
            tx.objectStore("metadata").put({id:"id-migration",version:1,status:"verified",archiveKey,migratedAt:now});
          }catch(error){verificationError=error;tx.abort();}
        };
      }
    } catch(error) {
      verificationError=error;
      try { tx.abort(); } catch { /* Already aborted. */ }
    }
    try{await done;}catch(error){throw verificationError??error;}
    const verified=await readVerifiedCopy(db);
    if(!verified || !sourceMatches(source,port))throw new Error("コピー後に原文が変更されました。localStorageで継続します。");
    try{port.setItem(COPY_STATE_KEY,JSON.stringify({status:"verified",updatedAt:now,archiveKey}));}catch{/* Nonessential status cannot break data. */}
    return verified;
  }catch(error){
    try{port.setItem(COPY_STATE_KEY,JSON.stringify({status:"failed",updatedAt:new Date().toISOString(),error:String(error),archiveKey}));}catch{/* localStorage restrictions */ }
    throw error;
  }finally{db?.close();}
}

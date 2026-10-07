import { LEARNING_KEYS } from "./learningStorage";
import { installVerifiedReader, subscribeLearningChanges } from "./learningRepository";
import { copyLocalStorageToIndexedDB, sourceMatches, type VerifiedCopy } from "./indexedDbLearningStorage";
export type StorageStatus={state:"pending"|"copying"|"verified"|"fallback";message:string};
const serverStatus:StorageStatus={state:"pending",message:"端末内に保存"};
let status:StorageStatus=serverStatus;
const listeners=new Set<()=>void>();
let cache:VerifiedCopy|undefined;
let running:Promise<void>|undefined;
let requested=false;
let appVersion="phase2";
let active=0;
function publish(next:StorageStatus){status=next;for(const listener of listeners)listener();}
export const getStorageStatus=()=>status;
export const getServerStorageStatus=()=>serverStatus;
export function subscribeStorageStatus(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function refreshIndexedDb():Promise<void>{
  requested=true;
  if(running)return running;
  running=(async()=>{
    do{
      requested=false;publish({state:"copying",message:"IndexedDBのコピーを検証中"});
      try{
        cache=await copyLocalStorageToIndexedDB({appVersion});
        publish({state:"verified",message:"IndexedDBコピー検証済み / localStorageも保持"});
      }catch(error){
        cache=undefined;publish({state:"fallback",message:(error instanceof Error?error.message:"コピーに失敗しました。")+" localStorageで継続します。"});
      }
    }while(requested);
  })().finally(()=>{running=undefined;});
  return running;
}
export function startLearningStorage(version:string){
  appVersion=version;
  if(++active>1)return()=>{active--;};
  installVerifiedReader(key=>{
    try{
      const journal=window.localStorage.getItem("chemica-storage-restore-journal-v1");
      if(journal && JSON.parse(journal).status==="pending")return;
      if(cache&&sourceMatches(cache.metadata.source,window.localStorage))
        return JSON.parse(JSON.stringify(cache.data[key])); // Callers cannot mutate the verified cache.
    }catch{/* Fall back to Phase 1 protected reader. */}
  });
  const onChange=()=>{cache=undefined;void refreshIndexedDb();};
  const unsubscribe=subscribeLearningChanges(onChange);
  const onStorage=(event:StorageEvent)=>{
    if(event.key===null || LEARNING_KEYS.some(key=>key===event.key) || event.key==="chemica-storage-restore-journal-v1")onChange();
  };
  window.addEventListener("storage",onStorage);
  window.addEventListener("online",onChange);
  void refreshIndexedDb();
  return()=>{if(--active===0){unsubscribe();window.removeEventListener("storage",onStorage);window.removeEventListener("online",onChange);}};
}

export function getVerifiedCopyForCloud(){
  try{if(cache&&sourceMatches(cache.metadata.source,window.localStorage))return JSON.parse(JSON.stringify(cache)) as VerifiedCopy;}catch{}
  return undefined;
}

"use client";
import { useSyncExternalStore } from "react";
import { getStorageStatus,getServerStorageStatus,subscribeStorageStatus,refreshIndexedDb } from "@/lib/learningStorageRuntime";
export function StorageBackendStatus(){
  const status=useSyncExternalStore(subscribeStorageStatus,getStorageStatus,getServerStorageStatus);
  return <section className="data-panel"><h2>端末内の保存基盤</h2><p role="status">{status.message}</p><p>この段階ではlocalStorageへ安全に保存し、IndexedDBへ検証付きでコピーします。ログインは不要です。元データと復元前のバックアップは保持します。</p><button className="button secondary" type="button" disabled={status.state==="copying"} onClick={()=>{void refreshIndexedDb();}}>コピーを再検証</button></section>;
}

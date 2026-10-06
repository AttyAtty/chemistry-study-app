"use client";
import { useEffect, useRef, useState } from "react";
import { PWA_BUILD_ID } from "@/lib/pwaBuild";
import { useNetworkStatus } from "@/lib/useNetworkStatus";
function ask(worker:ServiceWorker,type:string):Promise<{version:string;ready:boolean}>{
  return new Promise((resolve,reject)=>{
    const channel=new MessageChannel();
    const timer=window.setTimeout(()=>{channel.port1.close();reject(new Error("Worker timeout"));},30000);
    channel.port1.onmessage=event=>{window.clearTimeout(timer);channel.port1.close();resolve(event.data);};
    worker.postMessage({type},[channel.port2]);
  });
}
export function PwaStatus(){
  const online=useNetworkStatus();
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const [updating,setUpdating]=useState(false);
  const [newVersion,setNewVersion]=useState(false);
  const registration=useRef<ServiceWorkerRegistration|null>(null);
  const reloadRequested=useRef(false);
  useEffect(()=>{
    if(process.env.NODE_ENV!=="production" || !("serviceWorker" in navigator) || !window.isSecureContext)return;
    let alive=true;
    const watched=new Set<ServiceWorker>();
    const check=async()=>{
      const worker=navigator.serviceWorker.controller??registration.current?.active;
      if(!worker)return;
      try{
        const state=await ask(worker,"CHEMICA_STATUS");
        if(alive){setReady(state.ready);setFailed(!state.ready);if(state.version!==PWA_BUILD_ID)setNewVersion(true);}
      }catch{if(alive)setFailed(true);}
    };
    const watch=(worker:ServiceWorker|null)=>{
      if(!worker||watched.has(worker))return;
      watched.add(worker);
      worker.addEventListener("statechange",()=>{
        if(!alive)return;
        if(worker.state==="installed"&&registration.current?.waiting&&navigator.serviceWorker.controller)setNewVersion(true);
        if(worker.state==="activated")void check();
        if(worker.state==="redundant"&&!registration.current?.active)setFailed(true);
      });
    };
    const onMessage=(event:MessageEvent)=>{
      if(event.data?.type==="CHEMICA_CLIENT_VERSION")event.ports[0]?.postMessage({version:PWA_BUILD_ID});
    };
    const onController=()=>{
      if(reloadRequested.current){reloadRequested.current=false;window.location.reload();return;}
      void check();
    };
    const onOnline=()=>{
      const reg=registration.current;
      if(navigator.onLine&&reg?.active&&!reg.installing)void reg.update().catch(()=>{});
      navigator.serviceWorker.controller?.postMessage({type:"CHEMICA_CLEANUP"});
      void check();
    };
    navigator.serviceWorker.addEventListener("message",onMessage);
    navigator.serviceWorker.addEventListener("controllerchange",onController);
    window.addEventListener("online",onOnline);window.addEventListener("focus",onOnline);
    void navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).then(reg=>{
      if(!alive)return;
      registration.current=reg;watch(reg.installing);
      reg.addEventListener("updatefound",()=>watch(reg.installing));
      if(reg.waiting)setNewVersion(true);
      void check();
      reg.active?.postMessage({type:"CHEMICA_CLEANUP"});
    }).catch(()=>{if(alive)setFailed(true);});
    return()=>{alive=false;navigator.serviceWorker.removeEventListener("message",onMessage);navigator.serviceWorker.removeEventListener("controllerchange",onController);window.removeEventListener("online",onOnline);window.removeEventListener("focus",onOnline);};
  },[]);
  const repair=async()=>{
    setUpdating(true);
    try{
      const reg=registration.current??await navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"});
      registration.current=reg;
      if(reg.active){const state=await ask(reg.active,"CHEMICA_REPAIR");setReady(state.ready);setFailed(!state.ready);}
      else{await reg.update();setFailed(false);}
    }catch{setFailed(true);}finally{setUpdating(false);}
  };
  const update=()=>{
    if(registration.current?.waiting){reloadRequested.current=true;registration.current.waiting.postMessage({type:"CHEMICA_SKIP_WAITING"});}
    else window.location.reload();
  };
  if(process.env.NODE_ENV!=="production")return online?null:<div className="pwa-status">オフライン・端末内に保存</div>;
  return <div className="pwa-status no-print" aria-live="polite">
    <span>{!online?"オフライン・端末内に保存":ready?"オフライン利用可能":failed?"オフライン保存を準備できませんでした":"オフライン保存を準備中…"}</span>
    {failed&&online&&"serviceWorker" in navigator&&<button type="button" onClick={()=>{void repair();}} disabled={updating}>{updating?"保存確認中…":"保存を再確認"}</button>}
    {newVersion&&<><span>新しい版があります。学習を区切ってから</span><button type="button" onClick={update}>再読み込み</button></>}
  </div>;
}

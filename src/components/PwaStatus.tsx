"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
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
  const pathname=usePathname();
  const [settingsHost,setSettingsHost]=useState<HTMLElement|null>(null);
  const [feedbackVisible,setFeedbackVisible]=useState(false);
  const [updatedNotice,setUpdatedNotice]=useState(false);
  // Presentation-only marker for a user-requested reload; never learning storage.
  const rememberUpdate=()=>{
    try{sessionStorage.setItem("chemica-pwa-update-notice",PWA_BUILD_ID);}catch{}
  };
  useEffect(()=>{
    const timer=window.setTimeout(()=>setSettingsHost(pathname==="/settings/data"?document.getElementById("pwa-settings-controls"):null),0);
    return()=>window.clearTimeout(timer);
  },[pathname]);
  useEffect(()=>{
    let hide:number|undefined;
    const timer=window.setTimeout(()=>{
      try{
        const previous=sessionStorage.getItem("chemica-pwa-update-notice");
        sessionStorage.removeItem("chemica-pwa-update-notice");
        if(previous&&previous!==PWA_BUILD_ID){
          setUpdatedNotice(true);hide=window.setTimeout(()=>setUpdatedNotice(false),2500);
        }
      }catch{}
    },0);
    return()=>{window.clearTimeout(timer);if(hide!==undefined)window.clearTimeout(hide);};
  },[]);
  const [ready,setReady]=useState(false);
  const [failed,setFailed]=useState(false);
  const [updating,setUpdating]=useState(false);
  const [newVersion,setNewVersion]=useState(false);
  const [versionMismatch,setVersionMismatch]=useState(false);
  const [checking,setChecking]=useState(false);
  const [checkResult,setCheckResult]=useState("");
  useEffect(()=>{
    if(!feedbackVisible||!checkResult||checking)return;
    const timer=window.setTimeout(()=>setFeedbackVisible(false),2500);
    return()=>window.clearTimeout(timer);
  },[feedbackVisible,checkResult,checking]);
  const registration=useRef<ServiceWorkerRegistration|null>(null);
  const reloadRequested=useRef<ServiceWorker|null>(null);
  const checkForUpdate=useRef<(()=>Promise<void>)|null>(null);
  useEffect(()=>{
    if(process.env.NODE_ENV!=="production" || !("serviceWorker" in navigator) || !window.isSecureContext)return;
    let alive=true;
    let lastUpdateCheck=0;
    let pending:Promise<void>|null=null;
    const watched=new Map<ServiceWorker,()=>void>();
    const detectWaiting=()=>{
      const reg=registration.current;
      if(alive&&reg?.waiting&&(navigator.serviceWorker.controller||reg.active))setNewVersion(true);
    };
    const check=async()=>{
      detectWaiting();
      const worker=navigator.serviceWorker.controller??registration.current?.active;
      if(!worker)return;
      try{
        const state=await ask(worker,"CHEMICA_STATUS");
        if(alive){setReady(state.ready);setFailed(!state.ready);setVersionMismatch(state.version!==PWA_BUILD_ID);detectWaiting();}
      }catch{if(alive)setFailed(true);}
    };
    const watch=(worker:ServiceWorker|null)=>{
      if(!worker||watched.has(worker))return;
      const onState=()=>{
        if(!alive)return;
        if(worker.state==="installed")detectWaiting();
        if(worker.state==="activated")void check();
        if(worker.state==="redundant"&&!registration.current?.active)setFailed(true);
      };
      watched.set(worker,onState);
      worker.addEventListener("statechange",onState);
      onState();
    };
    const requestUpdate=async(manual=false)=>{
      const reg=registration.current;
      detectWaiting();
      if(!reg||!navigator.onLine)return;
      if(pending)return pending;
      if(!manual&&Date.now()-lastUpdateCheck<60000)return;
      lastUpdateCheck=Date.now();
      pending=(async()=>{
        try{
          await reg.update();
          if(alive){detectWaiting();setCheckResult(reg.waiting?"新版の準備ができました":reg.installing?"新版の保存を準備中です":"更新確認が完了しました");}
        }catch{if(alive)setCheckResult("更新を確認できませんでした。オンラインで再確認してください");}
        finally{pending=null;}
      })();
      return pending;
    };
    checkForUpdate.current=()=>requestUpdate(true);
    const onMessage=(event:MessageEvent)=>{
      if(event.data?.type==="CHEMICA_CLIENT_VERSION")event.ports[0]?.postMessage({version:PWA_BUILD_ID});
    };
    const onController=()=>{
      if(reloadRequested.current&&navigator.serviceWorker.controller===reloadRequested.current){
        reloadRequested.current=null;try{sessionStorage.setItem("chemica-pwa-update-notice",PWA_BUILD_ID);}catch{}window.location.reload();return;
      }
      void check();
    };
    const onOnline=()=>{
      detectWaiting();void requestUpdate();
      navigator.serviceWorker.controller?.postMessage({type:"CHEMICA_CLEANUP"});
      void check();
    };
    const onVisible=()=>{if(document.visibilityState==="visible")onOnline();};
    const onUpdateFound=()=>watch(registration.current?.installing??null);
    navigator.serviceWorker.addEventListener("message",onMessage);
    navigator.serviceWorker.addEventListener("controllerchange",onController);
    window.addEventListener("online",onOnline);window.addEventListener("focus",onOnline);
    document.addEventListener("visibilitychange",onVisible);
    const interval=window.setInterval(()=>{if(document.visibilityState==="visible")onOnline();},60000);
    void navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).then(reg=>{
      if(!alive)return;
      registration.current=reg;
      reg.addEventListener("updatefound",onUpdateFound);
      watch(reg.installing);detectWaiting();void check();void requestUpdate();
      reg.active?.postMessage({type:"CHEMICA_CLEANUP"});
    }).catch(()=>{if(alive)setFailed(true);});
    return()=>{
      alive=false;checkForUpdate.current=null;window.clearInterval(interval);
      registration.current?.removeEventListener("updatefound",onUpdateFound);
      for(const [worker,listener] of watched)worker.removeEventListener("statechange",listener);
      navigator.serviceWorker.removeEventListener("message",onMessage);
      navigator.serviceWorker.removeEventListener("controllerchange",onController);
      window.removeEventListener("online",onOnline);window.removeEventListener("focus",onOnline);
      document.removeEventListener("visibilitychange",onVisible);
    };
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
    if(registration.current?.waiting){
      reloadRequested.current=registration.current.waiting;
      registration.current.waiting.postMessage({type:"CHEMICA_SKIP_WAITING"});
    }else{rememberUpdate();window.location.reload();}
  };
  const manuallyCheck=async()=>{
    setChecking(true);setCheckResult("");setFeedbackVisible(true);
    try{await checkForUpdate.current?.();}finally{setChecking(false);}
  };
  if(process.env.NODE_ENV!=="production")return online?null:<div className="pwa-status pwa-offline no-print">オフライン</div>;
  return <>
    {!online&&<div className="pwa-status pwa-offline no-print" role="status">オフライン</div>}
    {(checking||updatedNotice)&&<div className="pwa-transient no-print" role="status" aria-live="polite">{updatedNotice?"更新しました":"更新を確認中…"}</div>}
    {settingsHost&&createPortal(<div className="pwa-settings" aria-live="polite">
      <p>{!online?"オフラインです":ready?"オフライン利用可能":failed?"オフライン保存を準備できませんでした":"オフライン保存を準備中…"}</p>
      {"serviceWorker" in navigator&&<button className="button secondary" type="button" onClick={()=>{void manuallyCheck();}} disabled={!online||checking}>{checking?"更新を確認中…":"更新を確認"}</button>}
      {failed&&online&&"serviceWorker" in navigator&&<button className="button secondary" type="button" onClick={()=>{void repair();}} disabled={updating}>{updating?"保存確認中…":"保存を再確認"}</button>}
      {feedbackVisible&&!checking&&checkResult&&<p>{checkResult}</p>}
      {versionMismatch&&!newVersion&&<p>表示中のアプリとオフライン保存の版が異なります。更新を確認してください。</p>}
    </div>,settingsHost)}
    {newVersion&&<div className="pwa-update-notice no-print" role="status" aria-live="polite">
      <span>新しいバージョンがあります。学習を区切ってから再読み込みしてください。</span>
      <button type="button" onClick={update}>再読み込み</button>
    </div>}
  </>;
}

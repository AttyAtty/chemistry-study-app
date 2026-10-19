"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { usePathname } from "next/navigation";
import { subscribeLearningChanges } from "@/lib/learningStorage";
import { readQuestionHistory } from "@/lib/questionHistory";
import { readFlashcardProgress } from "@/lib/flashcardProgress";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const isApp = () => window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const browserCanInstall = () => typeof navigator !== "undefined" && ((/Chrome|Edg|SamsungBrowser/.test(navigator.userAgent) && !/(CriOS|EdgiOS)/.test(navigator.userAgent)) || (/iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/(CriOS|FxiOS|EdgiOS)/.test(navigator.userAgent)));

export function InstallPrompt() {
  const [installed, setInstalled] = useState(true);
  const [available, setAvailable] = useState(browserCanInstall);
  useEffect(() => {
    const update = () => setInstalled(isApp());
    const capture = () => setAvailable(true);
    const frame = requestAnimationFrame(update);
    window.addEventListener("appinstalled", update);
    window.addEventListener("beforeinstallprompt", capture);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("appinstalled", update); window.removeEventListener("beforeinstallprompt", capture); };
  }, []);
  return installed || !available ? null : <button type="button" className="install-trigger" onClick={() => window.dispatchEvent(new Event("chemica-install-guide"))}>ホーム画面に追加</button>;
}

export function InstallRuntime() {
  const pathname = usePathname();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const dismiss = useCallback(() => { try { localStorage.setItem("chemica-install-offered", "1"); } catch {} setOpen(false); }, []);
  useDialogFocus(open, dialogRef, dismiss);
  useEffect(() => {
    const capture = (candidate: Event) => { candidate.preventDefault(); setEvent(candidate as InstallEvent); };
    const show = () => { const iosSafari = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && /Safari/.test(navigator.userAgent) && !/(CriOS|FxiOS|EdgiOS)/.test(navigator.userAgent); const chromium = /Chrome|Edg|SamsungBrowser/.test(navigator.userAgent) && !/(CriOS|EdgiOS)/.test(navigator.userAgent); if (!isApp() && (iosSafari || chromium)) { setIos(iosSafari); setOpen(true); } };
    const installed = () => { setOpen(false); setEvent(null); };
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", installed);
    window.addEventListener("chemica-install-guide", show);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture); window.removeEventListener("appinstalled", installed);
      window.removeEventListener("chemica-install-guide", show);
    };
  }, []);
  useEffect(() => {
    const offer = () => {
      try {
        const supportsGuide = (/Chrome|Edg|SamsungBrowser/.test(navigator.userAgent) && !/(CriOS|EdgiOS)/.test(navigator.userAgent)) || (/iPad|iPhone|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent) && !/(CriOS|FxiOS|EdgiOS)/.test(navigator.userAgent));
        if (isApp() || !supportsGuide || !["/home", "/progress"].includes(pathname) || localStorage.getItem("chemica-install-offered")) return;
        if (!Object.keys(readQuestionHistory()).length && !Object.keys(readFlashcardProgress()).length) return;
        localStorage.setItem("chemica-install-offered", "1");
        window.dispatchEvent(new Event("chemica-install-guide"));
      } catch {}
    };
    const timer = window.setTimeout(offer, 1500);
    const stop = subscribeLearningChanges(offer);
    return () => { clearTimeout(timer); stop(); };
  }, [pathname]);
  const install = async () => {
    if (!event) return;
    try { await event.prompt(); const choice = await event.userChoice; setEvent(null); if (choice.outcome === "accepted") dismiss(); else setMessage("追加はキャンセルされました。後からメニューで追加できます。"); }
    catch { setEvent(null); setMessage("ブラウザのメニューから追加してください。"); }
  };
  return !open ? null : <div className="share-backdrop no-print" onClick={dismiss}>
    <section className="share-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={e => e.stopPropagation()}>
      <button className="share-close" onClick={dismiss} aria-label="追加案内を閉じる">×</button>
      <h2 id="install-title">ホーム画面に追加</h2><p>最初に対応ブラウザでChemicaを開き、インストール操作を行います。追加後はホーム画面やアプリ一覧のアイコンから開けます。</p>
      {event ? <button className="button primary" onClick={() => { void install(); }}>アプリを追加する</button> : ios ? <p>iPhone・iPadではSafariで開き、共有メニュー →「ホーム画面に追加」→「追加」を選んでください。</p> : <p>ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選んでください。表示されない場合は、そのブラウザで追加に対応していません。</p>}
      {message && <p role="status">{message}</p>}<button className="button secondary" onClick={dismiss}>今は閉じる</button>
    </section>
  </div>;
}

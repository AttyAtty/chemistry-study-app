"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChemicaLogo, type ChemicaMarkState } from "@/components/ChemicaLogo";
import { readProgress } from "@/lib/progress";
import { readQuestionHistory } from "@/lib/questionHistory";
import { readFlashcardProgress } from "@/lib/flashcardProgress";

export function StartPage() {
  const router = useRouter();
  const [markState, setMarkState] = useState<ChemicaMarkState>("idle");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    router.prefetch("/home");
    try {
      const hasRecords = Object.keys(readProgress()).length + Object.keys(readQuestionHistory()).length + Object.keys(readFlashcardProgress()).length > 0;
      if (localStorage.getItem("chemica-visited") || localStorage.getItem("chemica-last-material") || hasRecords || window.matchMedia("(display-mode: standalone)").matches) router.replace("/home");
    } catch {}
  }, [router]);

  function start() {
    if (transitioning) return;
    try { localStorage.setItem("chemica-visited", "1"); } catch {}
    setTransitioning(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setMarkState("connected");
      window.setTimeout(() => router.push("/home"), 160);
      return;
    }
    setMarkState("connecting");
    window.setTimeout(() => setMarkState("loading"), 900);
    window.setTimeout(() => router.push("/home"), 1080);
  }

  return <main className={`start-page ${transitioning ? "is-transitioning" : ""}`} aria-busy={transitioning}>
    <section className="start-content" aria-labelledby="start-title">
      <h1 id="start-title" className="start-logo"><ChemicaLogo variant="hero" showTagline markState={markState}/></h1>
      <p>図で理解し、暗記カードで覚え、問題演習で確かめる。</p><p>ログインなしで使えます。学習記録はこの端末に保存されます。</p>
      <button className="start-button" type="button" disabled={transitioning} onClick={start}>{transitioning ? "読み込み中" : "始める"}</button>
      <span className="sr-only" aria-live="polite">{transitioning ? "Chemicaの学習ホームを読み込んでいます" : ""}</span>
    </section>
  </main>;
}

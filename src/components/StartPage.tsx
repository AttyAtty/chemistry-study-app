"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChemicaLogo, type ChemicaMarkState } from "@/components/ChemicaLogo";
import { ChemicaStartBackground } from "@/components/ChemicaStartBackground";

export function StartPage() {
  const router = useRouter();
  const [markState, setMarkState] = useState<ChemicaMarkState>("idle");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => { router.prefetch("/home"); }, [router]);

  function start() {
    if (transitioning) return;
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
    <ChemicaStartBackground />
    <section className="start-content" aria-labelledby="start-title">
      <h1 id="start-title" className="start-logo"><ChemicaLogo variant="hero" showTagline markState={markState}/></h1>
      <button className="start-button" type="button" disabled={transitioning} onClick={start}>{transitioning ? "読み込み中" : "始める"}</button>
      <span className="sr-only" aria-live="polite">{transitioning ? "Chemicaの学習ホームを読み込んでいます" : ""}</span>
    </section>
  </main>;
}

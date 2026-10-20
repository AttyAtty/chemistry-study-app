"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import { homeTour, parseTutorialState, shouldAutoStart, TUTORIAL_KEY, TUTORIAL_VERSION, type TutorialStatus } from "@/lib/tutorial";

export function TutorialLink({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname();
  return <Link href="/home?guide=1" onClick={event => { onClick?.(); if (pathname === "/home") { event.preventDefault(); window.dispatchEvent(new Event("chemica-open-guide")); } }}>使い方ガイドをもう一度見る</Link>;
}
function readState() { try { return parseTutorialState(localStorage.getItem(TUTORIAL_KEY)); } catch { return parseTutorialState(null); } }
function visibleTarget(selector?: string) {
  return selector ? [...document.querySelectorAll<HTMLElement>(selector)].find(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden") : undefined;
}
export function Tutorial() {
  const pathname = usePathname();
  const [index, setIndex] = useState<number | null>(null);
  const [geometry, setGeometry] = useState<{ ring?: CSSProperties; card: CSSProperties; clipped: boolean }>({ card: {}, clipped: false });
  const dialog = useRef<HTMLDivElement>(null);
  const checked = useRef(false);
  const manual = useRef(false);
  const direction = useRef(1);
  const close = useCallback((status: TutorialStatus) => {
    const previous = readState();
    // Merely replaying a guide must never clear a permanent dismissal or completion.
    const keep = manual.current && (previous.tutorialStatus === "dismissed" || (previous.tutorialStatus === "completed" && status === "skipped"));
    if (!keep) { try { localStorage.setItem(TUTORIAL_KEY, JSON.stringify({ tutorialStatus: status, tutorialVersion: TUTORIAL_VERSION })); } catch {} }
    setIndex(null);
  }, []);
  const skip = useCallback(() => close("skipped"), [close]);
  useDialogFocus(index !== null, dialog, skip);
  useEffect(() => {
    const start = () => { if (pathname === "/home") { manual.current = true; direction.current = 1; setIndex(0); } };
    window.addEventListener("chemica-open-guide", start);
    const timer = setTimeout(() => {
      if (pathname !== "/home") return;
      const requested = new URLSearchParams(location.search).get("guide") === "1";
      if (requested) { history.replaceState(history.state, "", "/home" + location.hash); start(); }
      else if (!checked.current && shouldAutoStart(readState())) { manual.current = false; setIndex(0); }
      checked.current = true;
    }, 100);
    return () => { clearTimeout(timer); window.removeEventListener("chemica-open-guide", start); };
  }, [pathname]);
  const open = index !== null;
  useLayoutEffect(() => {
    if (!open) return;
    document.body.classList.add("chemica-tutorial-open");
    // Keep the background inert, but allow scrolling to inspect a whole long block.
    const siblings = [...document.body.children].filter(el => el instanceof HTMLElement && !el.contains(dialog.current)) as HTMLElement[];
    const inertValues = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    return () => {
      document.body.classList.remove("chemica-tutorial-open");
      siblings.forEach((el, i) => { el.inert = inertValues[i]; });
    };
  }, [open]);
  useLayoutEffect(() => {
    if (index === null) return;
    const step = homeTour[index];
    const movePastMissing = () => {
      const next = index + direction.current;
      if (next < 0 || next >= homeTour.length) close("skipped");
      else setIndex(next);
    };
    const target = visibleTarget(step.target);
    if (step.target && !target) {
      const timer = setTimeout(movePastMissing, 0);
      return () => clearTimeout(timer);
    }
    const update = () => {
      const width = window.innerWidth, height = window.innerHeight;
      const rail = width >= 1100;
      const nav = visibleTarget('[data-tutorial="bottom-navigation"]');
      const fixedNav = nav?.parentElement && getComputedStyle(nav.parentElement).position === "fixed";
      const navRect = nav?.getBoundingClientRect();
      const bottomInset = fixedNav && navRect ? height - navRect.top + 12 : 12;
      const topInset = width <= 680 ? 12 : 88;
      const cardWidth = Math.min(380, width - 24);
      const maxHeight = Math.max(180, Math.min(height - topInset - bottomInset, rail ? 460 : Math.max(300, height * .5)));
      const cardHeight = Math.min(dialog.current?.offsetHeight || 300, maxHeight);
      const r = visibleTarget(step.target)?.getBoundingClientRect();
      const navigation = step.target === '[data-tutorial="bottom-navigation"]';
      let left = rail ? width - cardWidth - 24 : (width - cardWidth) / 2;
      let top = rail ? topInset + 12 : height - bottomInset - cardHeight;
      if (!step.target) { left = (width - cardWidth) / 2; top = (height - cardHeight) / 2; }
      if (navigation && r) top = Math.min(top, r.top - cardHeight - 16);
      top = Math.max(12, Math.min(top, height - cardHeight - bottomInset));
      // Highlight the whole DOM block. Only its visible portion is outlined when
      // it is taller than the viewport; scrolling exposes the rest of that block.
      const ringTop = r ? Math.max(topInset, r.top - 4) : 0;
      const ringBottom = r ? Math.min(height - 4, !rail && !navigation ? top - 12 : height, r.bottom + 4) : 0;
      const ring = r && ringBottom > ringTop ? {
        left: Math.max(4, r.left - 4), top: ringTop,
        width: Math.min(width - 8, r.width + 8), height: ringBottom - ringTop,
      } : undefined;
      setGeometry({ ring, card: { left, top, width: cardWidth, maxHeight },
        clipped: Boolean(r && !navigation && (r.top < topInset || r.bottom > ringBottom)) });
    };
    if (index === 0) window.scrollTo({ top: 0, behavior: "instant" });
    else if (target && getComputedStyle(target.parentElement || target).position !== "fixed") {
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      const desired = Math.max(0, targetTop - (window.innerWidth >= 681 ? 96 : 24));
      // Forward steps never pull the viewport back up. Back is explicitly reversible.
      window.scrollTo({ top: direction.current > 0 ? Math.max(window.scrollY, desired) : desired,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    update();
    const observer = new ResizeObserver(update);
    if (dialog.current) observer.observe(dialog.current);
    if (target) observer.observe(target);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const focus = requestAnimationFrame(() => dialog.current?.focus({ preventScroll: true }));
    return () => { observer.disconnect(); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); cancelAnimationFrame(focus); };
  }, [index, close]);
  if (index === null) return null;
  const step = homeTour[index];
  return <div className="tutorial-layer" data-tour-target={step.target || "welcome"}>
    {geometry.ring ? <div className="tutorial-spotlight" style={geometry.ring} aria-hidden="true" /> : <div className="tutorial-shade" aria-hidden="true" />}
    <div ref={dialog} className="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description" aria-label="使い方ガイド" tabIndex={-1} style={geometry.card}>
      <p className="tutorial-position" aria-live="polite">使い方ガイド · {index + 1} / {homeTour.length}</p>
      <h2 id="tutorial-title">{step.title}</h2><div className="tutorial-copy"><p id="tutorial-description">{step.description}</p></div>{geometry.clipped && <p className="tutorial-scroll-hint">スクロールでブロック全体を確認</p>}
      <div className="tutorial-actions"><button className="button secondary" disabled={index === 0} onClick={() => { direction.current = -1; setIndex(index - 1); }}>戻る</button><button className="button primary" onClick={() => { if (index === homeTour.length - 1) close("completed"); else { direction.current = 1; setIndex(index + 1); } }}>{index === homeTour.length - 1 ? "完了" : "次へ"}</button></div>
      <div className="tutorial-actions tutorial-secondary-actions"><button className="tutorial-skip" onClick={skip}>スキップ</button><button className="tutorial-dismiss" onClick={() => close("dismissed")}>今後は表示しない</button></div>
    </div>
  </div>;
}

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
  const [geometry, setGeometry] = useState<{ ring?: CSSProperties; card: CSSProperties }>({ card: {} });
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
  useLayoutEffect(() => {
    if (index === null) return;
    const step = homeTour[index];
    const target = visibleTarget(step.target);
    if (step.target && !target) {
      const next = index + direction.current;
      const timer = setTimeout(() => { if (next < 0 || next >= homeTour.length) close("skipped"); else setIndex(next); }, 0);
      return () => clearTimeout(timer);
    }
    // Inert the background while retaining the original attributes on cleanup.
    const siblings = [...document.body.children].filter(el => el instanceof HTMLElement && !el.contains(dialog.current)) as HTMLElement[];
    const inertValues = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const update = () => {
      const width = window.innerWidth, height = window.innerHeight;
      const cardWidth = Math.min(360, width - 24), cardHeight = dialog.current?.offsetHeight || 290;
      const r = target?.getBoundingClientRect();
      let left = (width - cardWidth) / 2, top = Math.max(12, (height - cardHeight) / 2);
      if (r) {
        const below = height - r.bottom - 16;
        if (width >= 768 && r.right + cardWidth + 28 < width) { left = r.right + 16; top = r.top; }
        else if (below >= cardHeight + 88) { left = r.left; top = r.bottom + 16; }
        else if (r.top >= cardHeight + 24) { left = r.left; top = r.top - cardHeight - 16; }
        else { top = height - cardHeight - (width < 768 ? 96 : 16); }
      }
      setGeometry({ ring: r ? { left: Math.max(4, r.left - 5), top: r.top - 5, width: Math.min(width - 8, r.width + 10), height: Math.min(height - 8, r.height + 10) } : undefined,
        card: { left: Math.max(12, Math.min(left, width - cardWidth - 12)), top: Math.max(12, Math.min(top, height - cardHeight - (width < 768 ? 96 : 12))), width: cardWidth, maxHeight: r && width < 768 ? Math.max(160, height - r.height - 212) : height - 112 } });
    };
    if (target && !target.closest(".site-header, .mobile-nav-shell")) {
      const targetTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, targetTop - 100), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    update();
    const observer = new ResizeObserver(update);
    if (dialog.current) observer.observe(dialog.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const focus = requestAnimationFrame(() => dialog.current?.focus({ preventScroll: true }));
    return () => { siblings.forEach((el, i) => { el.inert = inertValues[i]; }); document.body.style.overflow = oldOverflow; observer.disconnect(); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); cancelAnimationFrame(focus); };
  }, [index, close]);
  if (index === null) return null;
  const step = homeTour[index];
  return <div className="tutorial-layer">
    {geometry.ring ? <div className="tutorial-spotlight" style={geometry.ring} aria-hidden="true" /> : <div className="tutorial-shade" aria-hidden="true" />}
    <div ref={dialog} className="tutorial-card" role="dialog" aria-modal="true" aria-labelledby="tutorial-title" aria-describedby="tutorial-description" aria-label="使い方ガイド" tabIndex={-1} style={geometry.card}>
      <p className="tutorial-position" aria-live="polite">使い方ガイド · {index + 1} / {homeTour.length}</p>
      <h2 id="tutorial-title">{step.title}</h2><p id="tutorial-description">{step.description}</p>
      <div className="tutorial-actions"><button disabled={index === 0} onClick={() => { direction.current = -1; setIndex(index - 1); }}>戻る</button><button className="tutorial-primary" onClick={() => { if (index === homeTour.length - 1) close("completed"); else { direction.current = 1; setIndex(index + 1); } }}>{index === homeTour.length - 1 ? "完了" : "次へ"}</button></div>
      <div className="tutorial-actions"><button onClick={skip}>スキップ</button><button onClick={() => close("dismissed")}>今後は表示しない</button></div>
    </div>
  </div>;
}

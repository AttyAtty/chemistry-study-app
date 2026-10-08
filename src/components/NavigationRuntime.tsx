"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function NavigationRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    let frame = 0, followup = 0, timer = 0;
    let highlighted: HTMLElement | null = null;
    const navigate = (hash = window.location.hash) => {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      for (let ancestor: HTMLElement | null = target; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor instanceof HTMLDetailsElement) ancestor.open = true;
      }
      cancelAnimationFrame(frame); cancelAnimationFrame(followup);
      frame = requestAnimationFrame(() => { followup = requestAnimationFrame(() => {
        let saved: number | null = null;
        try { const raw = sessionStorage.getItem("chemica-unit-list-scroll"); saved = raw === null ? null : Number(raw); } catch {}
        if (pathname === "/home" && id === "fields" && saved !== null && Number.isFinite(saved)) {
          window.scrollTo({ top: saved, behavior: "instant" });
        } else target.scrollIntoView({ block: "start", behavior: "instant" });
        highlighted?.classList.remove("anchor-highlight");
        highlighted = target;
        target.classList.add("anchor-highlight");
        clearTimeout(timer);
        timer = window.setTimeout(() => target.classList.remove("anchor-highlight"), 2400);
      }); });
    };
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const url = new URL(anchor.href);
      if (url.origin !== location.origin) return;
      if (pathname === "/home" && (url.pathname.startsWith("/units/") || url.pathname.startsWith("/courses/"))) {
        try { sessionStorage.setItem("chemica-unit-list-scroll", String(window.scrollY)); } catch {}
      }
      if (url.pathname === pathname && url.hash) navigate(url.hash);
    };
    if (pathname.startsWith("/units/")) {
      try { localStorage.setItem("chemica-last-material", pathname + window.location.hash); } catch {}
    }
    navigate();
    const locationChanged = () => navigate();
    window.addEventListener("hashchange", locationChanged);
    window.addEventListener("popstate", locationChanged);
    document.addEventListener("click", click, true);
    // Also catches content rendered after hydration without polling indefinitely.
    const observer = new MutationObserver(() => {
      if (window.location.hash && !highlighted) navigate();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(followup); clearTimeout(timer);
      highlighted?.classList.remove("anchor-highlight");
      window.removeEventListener("hashchange", locationChanged); window.removeEventListener("popstate", locationChanged);
      document.removeEventListener("click", click, true);
    };
  }, [pathname]);
  return null;
}

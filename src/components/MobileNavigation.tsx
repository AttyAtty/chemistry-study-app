"use client";
import { DataSettingsLink } from "@/components/DataSettingsLink";

import { StudyLink as Link } from "@/components/StudyLink";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SharePanel } from "./SharePanel";
import { InstallPrompt } from "./InstallPrompt";
import { CHEMICA_VERSION_LABEL } from "@/lib/appVersion";

const items = [
  { href: "/home#fields", label: "単元", icon: "▦", match: (path: string) => path === "/home" || path.startsWith("/units/") || path.startsWith("/courses/") },
  { href: "/quiz", label: "問題演習", icon: "✓", match: (path: string) => path === "/quiz" },
  { href: "/tools/memory-quiz", label: "印刷小テスト", icon: "✎", match: (path: string) => path.startsWith("/tools/memory-quiz") },
  { href: "/progress", label: "記録", icon: "⌁", match: (path: string) => path === "/progress" },
];

export function MobileNavigation() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return <div className="mobile-nav-shell" ref={menuRef}>
    {moreOpen && <div className="mobile-more-menu" id="mobile-more-menu">
      <DataSettingsLink onClick={() => setMoreOpen(false)}>ログイン・データ保存</DataSettingsLink>
      <SharePanel /><InstallPrompt />
      <Link href="/feedback" onClick={() => setMoreOpen(false)}>お問い合わせ</Link>
      <Link href="/privacy" onClick={() => setMoreOpen(false)}>プライバシーポリシー</Link>
      <span>{CHEMICA_VERSION_LABEL}</span>
    </div>}
    <nav className="mobile-bottom-nav" aria-label="モバイルメインナビゲーション">
      {items.map(item => {
        const current = item.match(pathname);
        return <Link href={item.href} scroll={item.href !== "/home#fields"} className={current ? "is-current" : ""} aria-current={current ? "page" : undefined} onClick={() => setMoreOpen(false)} key={item.label}>
          <span aria-hidden="true">{item.icon}</span><small>{item.href === "/tools/memory-quiz" ? <>印刷<br/>小テスト</> : item.label}</small>
        </Link>;
      })}
      <button type="button" className={moreOpen || pathname === "/feedback" || pathname.startsWith("/settings/") ? "is-current" : ""} aria-expanded={moreOpen} aria-controls="mobile-more-menu" onClick={() => setMoreOpen(value => !value)}>
        <span aria-hidden="true">•••</span><small>その他</small>
      </button>
    </nav>
  </div>;
}

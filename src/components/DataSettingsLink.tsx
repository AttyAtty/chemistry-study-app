"use client";
import Link from "next/link";
import type { ReactNode } from "react";

export function DataSettingsLink({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <Link href="/settings/data" className={className} onClick={() => {
    try { if (!location.pathname.startsWith("/settings/")) sessionStorage.setItem("chemica-account-return", location.pathname + location.search + location.hash); } catch {}
    onClick?.();
  }}>{children}</Link>;
}

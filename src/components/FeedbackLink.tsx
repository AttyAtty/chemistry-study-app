"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackLink({ label = "ご意見・お問い合わせ" }: { label?: string }) {
  const pathname = usePathname();
  return <Link href={`/feedback?source=${encodeURIComponent(pathname)}`}>{label}</Link>;
}

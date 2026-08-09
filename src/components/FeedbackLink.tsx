"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FeedbackLink() {
  const pathname = usePathname();
  return <Link href={`/feedback?source=${encodeURIComponent(pathname)}`}>ご意見・お問い合わせ</Link>;
}

"use client";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getServerStorageIssues, getStorageIssues, subscribeStorageIssues } from "@/lib/learningStorage";
export function StorageNotice() {
  const issues = useSyncExternalStore(subscribeStorageIssues, getStorageIssues, getServerStorageIssues);
  if (!issues.length) return null;
  return <aside className="storage-notice no-print" role="alert" aria-label="学習データの保存について">
    <strong>学習データの保存を確認してください</strong>
    {issues.map(message => <p key={message}>{message}</p>)}
    <Link href="/settings/data">バックアップ・復旧を開く</Link>
  </aside>;
}

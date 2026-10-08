"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { getAccountState, getServerAccountState, subscribeAccount } from "@/lib/accountRuntime";

const labels = {
  anonymous: "端末保存", checking: "保存先を確認中", consent: "ログイン済み・クラウド保存未設定",
  conflict: "クラウド保存保留・保存先の確認が必要", foreign: "別アカウントとの連携を確認",
  ready: "クラウド保存済み", paused: "ログイン済み・クラウド保存保留",
  saving: "クラウド保存中", pending: "クラウド未送信・通信状態を確認", error: "保存先の確認に失敗",
};
export function AccountStatus() {
  const state = useSyncExternalStore(subscribeAccount, getAccountState, getServerAccountState);
  const pathname = usePathname();
  return <aside className="account-status no-print" aria-label="ログイン・データ保存状態">
    <strong>{state.loading ? "保存状態を確認中" : !state.available ? "端末保存・アカウント連携を利用できません" : labels[state.cloud.phase]}</strong>
    <p>{state.cloud.message}</p>
    {state.user && <small>ログイン済み。クラウド保存の有効化は別の操作です。複数端末の統合は行いません。</small>}
    <Link href={`/settings/data?returnTo=${encodeURIComponent(pathname)}`}>ログイン・データ保存 →</Link>
  </aside>;
}

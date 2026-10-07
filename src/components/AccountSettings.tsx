"use client";
import { useState, useSyncExternalStore } from "react";
import { subscribeAccount, getAccountState, getServerAccountState, sendLoginCode, verifyLoginCode, logoutAccount, enableCloudSaving, pauseCloudSaving, refreshAccount } from "@/lib/accountRuntime";
export function AccountSettings() {
  const state = useSyncExternalStore(subscribeAccount, getAccountState, getServerAccountState);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  async function run(action: () => Promise<void>, success = "") {
    setBusy(true); setMessage("");
    try { await action(); setMessage(success); }
    catch (error) { setMessage(error instanceof Error ? error.message : "操作できませんでした。"); }
    finally { setBusy(false); }
  }
  return <section className="data-panel account-settings" aria-labelledby="account-heading">
    <h2 id="account-heading">アカウント・クラウド保存</h2>
    <p>{state.cloud.message}</p>
    {!state.user ? <>
      <p>ログインなしでも利用できます。ログインすると、自分専用のクラウド保存を選べます。</p>
      <form onSubmit={event => { event.preventDefault(); void run(async () => { if (sent) await verifyLoginCode(email, token); else { await sendLoginCode(email); setSent(true); } }, sent ? "ログインしました。" : "メールの確認コードを入力してください。"); }}>
        <label>メールアドレス<input type="email" autoComplete="email" required value={email} onChange={event => { setEmail(event.target.value); setSent(false); }} disabled={busy || !state.available} /></label>
        {sent && <label>確認コード<input inputMode="numeric" autoComplete="one-time-code" required maxLength={10} value={token} onChange={event => setToken(event.target.value)} disabled={busy} /></label>}
        <div className="data-actions"><button className="button secondary" disabled={busy || state.loading || !state.available}>{sent ? "コードでログイン" : "確認コードを送信"}</button>
        {sent && <button type="button" disabled={busy} onClick={() => { setSent(false); setToken(""); }}>コードを再送する</button>}</div>
      </form>
    </> : <>
      <p>メール認証でログイン中：{state.user.email}</p>
      {state.cloud.phase === "consent" && <>
        <p>この端末のデータをバックアップしてから送信します。複数端末の統合はまだ行いません。</p>
        <label><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /> この端末の学習データを、このアカウントのクラウドへ保存する</label>
        <button className="button primary" disabled={busy || !consent} onClick={() => { void run(enableCloudSaving); }}>バックアップしてクラウド保存</button>
      </>}
      {(state.cloud.phase === "conflict" || state.cloud.phase === "foreign" || state.cloud.phase === "paused") && <p>端末内データを維持します。別アカウントへの引き継ぎや、クラウドとの統合は保留しています。</p>}
      <div className="data-actions">
        <button type="button" disabled={busy} onClick={() => { void run(refreshAccount); }}>保存先を再確認</button>
        {(state.cloud.phase === "ready" || state.cloud.phase === "saving" || state.cloud.phase === "pending") && <button type="button" disabled={busy} onClick={() => { void run(pauseCloudSaving); }}>クラウド保存を保留</button>}
        <button type="button" disabled={busy} onClick={() => { void run(logoutAccount, "ログアウトしました。端末内の学習データは保持しています。"); }}>ログアウト</button>
      </div>
    </>}
    {message && <p role="status">{message}</p>}
  </section>;
}

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase/client";
import { createCloudTransport } from "./supabase/cloudTransport";
import { CloudLearningCoordinator, type CloudState } from "./cloudLearningCoordinator";
import { CLOUD_BINDING_KEY, isUserId } from "./cloudLearning";
import { archiveLearningSnapshot, subscribeLearningChanges } from "./learningStorage";
import { getVerifiedCopyForCloud } from "./learningStorageRuntime";

export type AccountState = { user: { id: string; email: string } | null; loading: boolean; available: boolean; cloud: CloudState };
const initial: AccountState = { user: null, loading: true, available: true, cloud: { phase: "anonymous", message: "この端末に保存されています。" } };
let state = initial;
const listeners = new Set<() => void>();
export const getAccountState = () => state;
export const getServerAccountState = () => initial;
export function subscribeAccount(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function publish(patch: Partial<AccountState>) { state = { ...state, ...patch }; listeners.forEach(fn => fn()); }
let client: SupabaseClient | null = null;
let coordinator: CloudLearningCoordinator | null = null;
let session: Session | null = null;
let request: AbortController | null = null;
let epoch = 0;
let active = 0;
let stop: (() => void) | null = null;
async function acceptSession(candidate: Session | null) {
  const generation = ++epoch;
  request?.abort(); coordinator?.invalidate();
  session = null;
  if (!candidate) { publish({ user: null, loading: false }); await coordinator?.connect(null); return; }
  try {
    if (!isUserId(candidate.user.id)) throw new Error("Invalid identity");
    if (navigator.onLine) {
      const verified = await client!.auth.getUser(candidate.access_token);
      if (verified.error || verified.data.user?.id !== candidate.user.id) throw new Error("Invalid session");
    }
    if (generation !== epoch) return;
    session = candidate;
    request = new AbortController();
    publish({ user: { id: candidate.user.id, email: candidate.user.email ?? "" }, loading: false });
    await coordinator?.connect({ userId: candidate.user.id, transport: createCloudTransport(candidate, request.signal) });
  } catch {
    if (generation === epoch) publish({ user: null, loading: false, cloud: { phase: "error", message: "ログイン状態を確認できません。端末内の学習は続けられます。" } });
  }
}
export function startAccountRuntime() {
  if (++active > 1) return () => { active--; };
  try {
    client = getSupabaseBrowserClient();
    coordinator = new CloudLearningCoordinator({
      storage: window.localStorage, online: () => navigator.onLine, uuid: () => crypto.randomUUID(),
      lock: async action => {
        if (!navigator.locks) return Promise.reject(new Error("安全なアカウント連携に対応していないブラウザです。端末内で利用できます。"));
        return await navigator.locks.request("chemica-cloud-binding", action);
      },
      verified: getVerifiedCopyForCloud, publish: cloud => publish({ cloud }),
    });
    const unsubscribe = subscribeLearningChanges(() => { void coordinator?.localChanged(); });
    const onOnline = () => { void refreshAccount(); };
    const onOffline = () => { if (session) publish({ cloud: { phase: "pending", message: "オフライン：端末内に保存しています。" } }); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === CLOUD_BINDING_KEY || event.key === null) void refreshAccount();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("storage", onStorage);
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      // Never call Supabase Auth methods inside its notification lock.
      queueMicrotask(() => { if (active) void acceptSession(next); });
    });
    void refreshAccount();
    stop = () => {
      data.subscription.unsubscribe(); unsubscribe(); request?.abort(); coordinator?.invalidate(); ++epoch;
      window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); window.removeEventListener("storage", onStorage);
    };
  } catch {
    publish({ loading: false, available: false, cloud: { phase: "error", message: "アカウント連携を初期化できません。端末内の学習は利用できます。" } });
  }
  return () => { if (--active === 0) { stop?.(); stop = null; } };
}
export async function refreshAccount() {
  if (!client) return;
  const result = await client.auth.getSession();
  if (result.error) { publish({ loading: false, cloud: { phase: "error", message: "ログイン状態を確認できません。" } }); return; }
  await acceptSession(result.data.session);
}
export async function sendLoginCode(email: string) {
  if (!client || !navigator.onLine) throw new Error("ログインにはオンライン接続が必要です。");
  const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
  if (error) throw new Error("確認コードを送信できません。メール設定・送信制限を確認し、時間をおいて再試行してください。");
}
export async function verifyLoginCode(email: string, token: string) {
  if (!client || !navigator.onLine) throw new Error("ログインにはオンライン接続が必要です。");
  // Phase 1 archive must succeed before claiming an account. It never changes learning keys.
  const backup = archiveLearningSnapshot("phase4-login", window.localStorage);
  if (!backup.ok) throw new Error(backup.error);
  const { error } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "email" });
  if (error) throw new Error("確認コードが無効、または期限切れです。コードを再送して試してください。");
  await refreshAccount();
}
export async function logoutAccount() {
  request?.abort(); coordinator?.invalidate(); ++epoch; session = null;
  if (!client) return;
  const { error } = await client.auth.signOut({ scope: "local" });
  const remaining = await client.auth.getSession();
  if (error && remaining.data.session) {
    publish({ cloud: { phase: "paused", message: "クラウド送信を停止しました。ログアウトの完了にはオンラインで再試行してください。" } });
    throw new Error("ログアウトを完了できませんでした。オンラインで再試行してください。");
  }
  publish({ user: null, loading: false }); await coordinator?.connect(null);
}
export async function enableCloudSaving() {
  try { await coordinator?.enable(); }
  catch {
    publish({ cloud: { phase: "pending", message: "クラウド保存できませんでした。端末内データとバックアップは保持しています。保存先を再確認してください。" } });
    throw new Error("クラウド保存できませんでした。端末内の学習データは保持しています。");
  }
}
export async function pauseCloudSaving() { await coordinator?.pause(); }

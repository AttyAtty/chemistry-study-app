/** Phase 1: preserve legacy keys and raw data; no automatic migration. */
export const LEARNING_KEYS = [
  "chemica-flashcard-progress-v1",
  "chemistry-question-history-v1",
  "chemistry-study-progress-v1",
] as const;
export type LearningKey = typeof LEARNING_KEYS[number];
export const BACKUP_SCHEMA_VERSION = 1;
export const RESTORE_JOURNAL_KEY = "chemica-storage-restore-journal-v1";
export const BACKUP_KEY_PREFIX = "chemica-storage-backup-v1:";
export type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export type RawSnapshot = Record<LearningKey, string | null>;
export type LearningBackup = {
  format: "chemica-learning-backup";
  schemaVersion: 1;
  exportedAt: string;
  appVersion: string;
  // Raw strings retain whitespace, unknown fields, unknown IDs and damaged JSON.
  data: RawSnapshot;
};
export type StorageResult<T> = { ok: true; value: T } | { ok: false; error: string };
type DataRecord = Record<string, Record<string, unknown>>;
type RestoreJournal = {
  format: "chemica-restore-journal";
  schemaVersion: 1;
  status: "pending" | "committed" | "rolled-back";
  backupKey: string;
  target: RawSnapshot;
};
export type PreparedRestore = { backup: LearningBackup; before: LearningBackup; backupKey: string };

const changeListeners = new Set<() => void>();
export function subscribeLearningChanges(listener: () => void) { changeListeners.add(listener); return () => { changeListeners.delete(listener); }; }
function notifyLearningChanged() { queueMicrotask(() => { for (const listener of changeListeners) listener(); }); }

const issues = new Map<string, string>();
let issueSnapshot: readonly string[] = [];
const listeners = new Set<() => void>();
export function subscribeStorageIssues(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getStorageIssues() { return issueSnapshot; }
const serverIssues: readonly string[] = [];
export function getServerStorageIssues() { return serverIssues; }
function issue(slot: string, message?: string) {
  if (message ? issues.get(slot) === message : !issues.has(slot)) return;
  if (message) issues.set(slot, message); else issues.delete(slot);
  issueSnapshot = [...issues.values()];
  // Readers may run during a React render. Notify after the current stack.
  queueMicrotask(() => { for (const listener of listeners) listener(); });
}
function failure<T>(slot: string, error: string): StorageResult<T> { issue(slot, error); return { ok: false, error }; }
function storage(port?: StoragePort): StoragePort {
  if (port) return port;
  if (typeof window === "undefined") throw new Error("Browser storage is unavailable");
  return window.localStorage;
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
const own = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);
const count = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const date = (value: unknown) => typeof value === "string" && (value === "" || !Number.isNaN(Date.parse(value)));
const optional = (entry: Record<string, unknown>, key: string, check: (value: unknown) => boolean) => !own(entry, key) || check(entry[key]);
function validEntry(key: LearningKey, entry: unknown) {
  if (!isRecord(entry)) return false;
  if (key === LEARNING_KEYS[0]) {
    return (entry.status === "known" || entry.status === "review") && date(entry.lastReviewedAt)
      && optional(entry, "reviewStep", value => typeof value === "number" && Number.isInteger(value) && value >= -1 && value <= 3)
      && optional(entry, "nextReviewAt", date)
      && optional(entry, "lastResult", value => value === "remembered" || value === "forgot")
      && optional(entry, "rememberedCount", count) && optional(entry, "forgotCount", count);
  }
  if (key === LEARNING_KEYS[1]) {
    return count(entry.attemptCount) && count(entry.correctCount) && count(entry.incorrectCount)
      && date(entry.lastAnsweredAt) && typeof entry.needsReview === "boolean";
  }
  return count(entry.attempts) && count(entry.correct) && count(entry.total)
    && typeof entry.bestPercent === "number" && Number.isFinite(entry.bestPercent) && entry.bestPercent >= 0 && entry.bestPercent <= 100
    && date(entry.lastStudied);
}
function jsonSafe(value: unknown, seen = new Set<object>(), depth = 0): boolean {
  if (depth > 100) return false;
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || seen.has(value)) return false;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) return false;
  seen.add(value);
  const valid = Object.values(value).every(item => jsonSafe(item, seen, depth + 1));
  seen.delete(value);
  return valid;
}
export function validateLearningRecord(key: LearningKey, value: unknown): value is DataRecord {
  return isRecord(value) && jsonSafe(value) && Object.entries(value).every(([id, entry]) => id.length > 0 && validEntry(key, entry));
}
function parseRecord(key: LearningKey, raw: string | null): DataRecord {
  if (raw === null) return Object.create(null) as DataRecord;
  const parsed: unknown = JSON.parse(raw);
  if (!validateLearningRecord(key, parsed)) throw new Error("学習データの項目または型が不正です。復元を中止しました。");
  return parsed;
}
function validSnapshot(value: unknown): value is RawSnapshot {
  return isRecord(value) && Object.keys(value).length === LEARNING_KEYS.length
    && LEARNING_KEYS.every(key => own(value, key) && (value[key] === null || typeof value[key] === "string"));
}
function readJournal(port: StoragePort): RestoreJournal | null {
  const raw = port.getItem(RESTORE_JOURNAL_KEY);
  if (raw === null) return null;
  const value: unknown = JSON.parse(raw);
  if (!isRecord(value) || value.format !== "chemica-restore-journal" || value.schemaVersion !== 1
    || !["pending", "committed", "rolled-back"].includes(String(value.status))
    || typeof value.backupKey !== "string" || !value.backupKey.startsWith(BACKUP_KEY_PREFIX) || !validSnapshot(value.target)) {
    throw new Error("Invalid restore journal");
  }
  return value as RestoreJournal;
}
function assertNoPendingRestore(port: StoragePort) {
  if (readJournal(port)?.status === "pending") throw new Error("Pending restore");
}
function snapshot(port: StoragePort): RawSnapshot {
  return Object.fromEntries(LEARNING_KEYS.map(key => [key, port.getItem(key)])) as RawSnapshot;
}
const equal = (a: RawSnapshot, b: RawSnapshot) => LEARNING_KEYS.every(key => a[key] === b[key]);
function backupFrom(data: RawSnapshot, appVersion: string): LearningBackup {
  return { format: "chemica-learning-backup", schemaVersion: BACKUP_SCHEMA_VERSION, exportedAt: new Date().toISOString(), appVersion, data };
}
function parseEnvelope(text: string): LearningBackup {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value) || value.format !== "chemica-learning-backup") throw new Error("Chemicaのバックアップ形式ではありません。");
  if (value.schemaVersion !== BACKUP_SCHEMA_VERSION) throw new Error("対応していないschemaVersionです。復元を中止しました。");
  if (typeof value.exportedAt !== "string" || !value.exportedAt || !date(value.exportedAt)
    || typeof value.appVersion !== "string" || !value.appVersion.trim() || !validSnapshot(value.data)) {
    throw new Error("バックアップの必須項目・保存key・型が不正です。");
  }
  return value as LearningBackup;
}
export function validateBackup(text: string): StorageResult<LearningBackup> {
  try {
    const backup = parseEnvelope(text);
    let entries = 0;
    for (const key of LEARNING_KEYS) entries += Object.keys(parseRecord(key, backup.data[key])).length;
    if (entries === 0) throw new Error("学習データが空です。空データで現在の記録を置き換えることはできません。");
    return { ok: true, value: backup };
  } catch (error) {
    return { ok: false, error: error instanceof SyntaxError ? "JSONが壊れています。復元を中止しました。" : error instanceof Error ? error.message : "バックアップを検証できませんでした。" };
  }
}
export function exportLearningBackup(appVersion: string, port?: StoragePort): StorageResult<LearningBackup> {
  try {
    const store = storage(port);
    const journal = readJournal(store);
    // During recovery, export the original snapshot, never the partially applied keys.
    const data = journal?.status === "pending" ? loadOriginal(journal, store).data : snapshot(store);
    return { ok: true, value: backupFrom(data, appVersion) };
  } catch { return failure("backup", "保存領域を読み取れないため、バックアップを作成できません。元データは変更していません。"); }
}
function loadOriginal(journal: RestoreJournal, port: StoragePort) {
  const raw = port.getItem(journal.backupKey);
  if (raw === null) throw new Error("Missing recovery backup");
  return parseEnvelope(raw); // Original raw data may be damaged; do not normalize it.
}
export function readLearningData<T>(key: LearningKey, port?: StoragePort): T {
  if (!port && typeof window === "undefined") return {} as T;
  let raw: string | null = null;
  try {
    const store = storage(port);
    const journal = readJournal(store);
    if (journal?.status === "pending") {
      raw = loadOriginal(journal, store).data[key];
      issue("restore", "復元が完了していません。退避した元データを表示し、保存を停止しています。学習データ設定で元に戻してください。");
    } else raw = store.getItem(key);
    const parsed = parseRecord(key, raw);
    issue(key);
    return parsed as T;
  } catch {
    issue(key, `${key} を正常に読み込めません。元データを保持し、この項目への保存を停止しています。バックアップで原文を退避できます。`);
    // Show valid entries where possible, without writing or sanitizing the source.
    try {
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      if (isRecord(parsed)) return Object.fromEntries(Object.entries(parsed).filter(([id, entry]) => id.length > 0 && validEntry(key, entry))) as T;
    } catch { /* Damaged JSON remains unchanged. */ }
    return {} as T;
  }
}
export function updateLearningData<T>(key: LearningKey, update: (current: T) => T, port?: StoragePort): StorageResult<T> {
  try {
    const store = storage(port);
    assertNoPendingRestore(store);
    const before = store.getItem(key);
    const current = parseRecord(key, before);
    const next = update(current as T);
    if (!validateLearningRecord(key, next)) throw new Error("Invalid update");
    if (Object.keys(current).some(id => !own(next, id))) throw new Error("Removing existing IDs is forbidden");
    if (Object.keys(next).length === 0) throw new Error("Empty write is forbidden");
    const raw = JSON.stringify(next);
    if (typeof raw !== "string" || !validateLearningRecord(key, JSON.parse(raw))) throw new Error("Serialization failed");
    // Catch changes between reading and saving; no cross-tab atomicity is claimed.
    assertNoPendingRestore(store);
    if (store.getItem(key) !== before) throw new Error("Data changed while saving");
    store.setItem(key, raw); // A failed native setItem does not replace the previous value.
    issue(key);
    notifyLearningChanged();
    return { ok: true, value: next as T };
  } catch {
    return failure(key, `${key} を保存できませんでした。既存データは初期化していません。破損・容量不足・ブラウザの保存制限を確認してください。`);
  }
}
export function archiveLearningSnapshot(appVersion: string, port?: StoragePort): StorageResult<{ before: LearningBackup; backupKey: string }> {
  try {
    const store = storage(port);
    assertNoPendingRestore(store);
    const before = backupFrom(snapshot(store), appVersion);
    const backupKey = `${BACKUP_KEY_PREFIX}${crypto.randomUUID()}`;
    const raw = JSON.stringify(before);
    if (store.getItem(backupKey) !== null) throw new Error("Archive collision");
    store.setItem(backupKey, raw);
    if (store.getItem(backupKey) !== raw) throw new Error("Archive verification failed");
    issue("archive");
    return { ok: true, value: { before, backupKey } };
  } catch { return failure("archive", "原文の自動バックアップを保存できません。既存データは変更していません。"); }
}

export function prepareRestore(text: string, appVersion: string, port?: StoragePort): StorageResult<PreparedRestore> {
  const validated = validateBackup(text);
  if (!validated.ok) return validated;
  try {
    const store = storage(port);
    assertNoPendingRestore(store);
    const archived = archiveLearningSnapshot(appVersion, store);
    if (!archived.ok) return archived;
    return { ok: true, value: { backup: validated.value, ...archived.value } };
  } catch { return failure("restore", "復元前の自動バックアップを保存できません。学習データには変更せず、復元を中止しました。"); }
}
function targetSnapshot(prepared: PreparedRestore): RawSnapshot {
  // Empty/missing source data never clears an existing key in Phase 1.
  return Object.fromEntries(LEARNING_KEYS.map(key => {
    const raw = prepared.backup.data[key];
    return [key, Object.keys(parseRecord(key, raw)).length ? raw : prepared.before.data[key]];
  })) as RawSnapshot;
}
function writeJournal(journal: RestoreJournal, port: StoragePort) {
  const raw = JSON.stringify(journal);
  port.setItem(RESTORE_JOURNAL_KEY, raw);
  if (port.getItem(RESTORE_JOURNAL_KEY) !== raw) throw new Error("Journal verification failed");
}
function rollback(journal: RestoreJournal, port: StoragePort): boolean {
  try {
    const before = loadOriginal(journal, port).data;
    // Preflight all keys before changing anything. Never clobber another tab's edit.
    for (const key of LEARNING_KEYS) {
      const current = port.getItem(key);
      if (current !== before[key] && current !== journal.target[key]) throw new Error("Concurrent edit during recovery");
    }
    for (const key of LEARNING_KEYS) {
      const original = before[key];
      if (port.getItem(key) === original) continue;
      if (original === null) {
        // Only a key CREATED by this restore is removed. Pre-existing keys are never deleted.
        if (port.getItem(key) !== journal.target[key]) throw new Error("Concurrent edit");
        port.removeItem(key);
      } else port.setItem(key, original);
    }
    if (!equal(snapshot(port), before)) throw new Error("Rollback verification failed");
    writeJournal({ ...journal, status: "rolled-back" }, port);
    issue("restore");
    notifyLearningChanged();
    return true;
  } catch { return false; }
}
export function applyRestore(prepared: PreparedRestore, port?: StoragePort): StorageResult<void> {
  let journal: RestoreJournal | undefined;
  let store: StoragePort | undefined;
  let started = false;
  try {
    store = storage(port);
    assertNoPendingRestore(store);
    // Revalidate even if a caller changed the prepared object.
    const validated = validateBackup(JSON.stringify(prepared.backup));
    if (!validated.ok) return validated;
    const archived = store.getItem(prepared.backupKey);
    if (!archived || JSON.stringify(parseEnvelope(archived)) !== JSON.stringify(prepared.before)) throw new Error("Invalid archive");
    if (!equal(snapshot(store), prepared.before.data)) throw new Error("確認中に学習データが更新されました。ファイルを選び直してください。");
    journal = { format: "chemica-restore-journal", schemaVersion: 1, status: "pending", backupKey: prepared.backupKey, target: targetSnapshot(prepared) };
    writeJournal(journal, store);
    started = true;
    for (const key of LEARNING_KEYS) {
      if (store.getItem(key) !== prepared.before.data[key]) throw new Error("Concurrent edit during restore");
      const target = journal.target[key];
      if (target !== prepared.before.data[key] && target !== null) store.setItem(key, target);
    }
    if (!equal(snapshot(store), journal.target)) throw new Error("Restore verification failed");
    writeJournal({ ...journal, status: "committed" }, store);
    for (const key of LEARNING_KEYS) issue(key);
    issue("restore");
    notifyLearningChanged();
    return { ok: true, value: undefined };
  } catch (error) {
    const recovered = started && journal && store ? rollback(journal, store) : false;
    return failure("restore", recovered
      ? "復元に失敗しました。退避した元データへ戻しました。"
      : started
        ? "復元を中止しました。元データは自動バックアップに残っています。保存を停止しているため、設定画面で元に戻してください。"
        : error instanceof Error && error.message.includes("確認中") ? error.message : "復元を開始できませんでした。既存の学習データは変更していません。");
  }
}
export function recoverPendingRestore(port?: StoragePort): StorageResult<void> {
  try {
    const store = storage(port);
    const journal = readJournal(store);
    if (!journal || journal.status !== "pending") return { ok: true, value: undefined };
    if (!rollback(journal, store)) throw new Error("Recovery failed");
    for (const key of LEARNING_KEYS) issue(key);
    issue("restore");
    notifyLearningChanged();
    return { ok: true, value: undefined };
  } catch { return failure("restore", "元データへの復旧を完了できません。自動バックアップは保持しています。別タブを閉じ、空き容量・保存制限を確認して再試行してください。"); }
}
export function readRestoreArchive(port?: StoragePort): StorageResult<{ pending: boolean; backup: LearningBackup } | null> {
  try {
    const store = storage(port);
    const journal = readJournal(store);
    return { ok: true, value: journal ? { pending: journal.status === "pending", backup: loadOriginal(journal, store) } : null };
  } catch { return failure("restore", "復元管理情報を読み取れません。学習データは変更していません。"); }
}

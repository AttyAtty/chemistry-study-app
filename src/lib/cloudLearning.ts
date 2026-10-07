import { LEARNING_KEYS, RESTORE_JOURNAL_KEY, exportLearningBackup, validateLearningRecord, type RawSnapshot, type StoragePort } from "./learningStorage";
import { canonicalRecords } from "./learningIds";
import type { VerifiedCopy } from "./indexedDbLearningStorage";

export const CLOUD_BINDING_KEY = "chemica-cloud-binding-v1";
export const isUserId = (id: unknown): id is string => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export type CloudBinding = {
  version: 1; ownerUserId: string; deviceId: string; revision: number;
  lastUploadedRevision: number; enabled: boolean; needsReview: boolean;
  backupKey: string; updatedAt: string;
};
export function readCloudBinding(port: StoragePort): CloudBinding | null {
  const raw = port.getItem(CLOUD_BINDING_KEY);
  if (raw === null) return null;
  const b = JSON.parse(raw) as CloudBinding;
  if (b?.version !== 1 || !isUserId(b.ownerUserId) || !isUserId(b.deviceId) ||
      !Number.isSafeInteger(b.revision) || b.revision < 1 ||
      !Number.isSafeInteger(b.lastUploadedRevision) || b.lastUploadedRevision < 0 || b.lastUploadedRevision > b.revision ||
      typeof b.enabled !== "boolean" || typeof b.needsReview !== "boolean" ||
      typeof b.backupKey !== "string" || !b.backupKey.startsWith("chemica-storage-backup-v1:") ||
      !Number.isFinite(Date.parse(b.updatedAt))) throw new Error("クラウド所有情報を確認できません。端末内のデータを保持してクラウド保存を停止します。");
  return b;
}
export function writeCloudBinding(port: StoragePort, binding: CloudBinding) {
  const raw = JSON.stringify(binding);
  port.setItem(CLOUD_BINDING_KEY, raw);
  if (port.getItem(CLOUD_BINDING_KEY) !== raw) throw new Error("クラウド所有情報を保存できませんでした。");
}
export function canWriteCloud(binding: CloudBinding | null, userId: string | null) {
  return Boolean(binding && userId && binding.ownerUserId === userId && binding.enabled && !binding.needsReview);
}
/** Restore never changes ownership; it pauses cloud writes before local replacement. */
export function pauseCloudForRestore(port: StoragePort = window.localStorage) {
  const binding = readCloudBinding(port);
  if (binding) writeCloudBinding(port, { ...binding, enabled: false, needsReview: true, updatedAt: new Date().toISOString() });
}
export type CloudRecord = {
  kind: "flashcard" | "question" | "study"; record_id: string;
  data: Record<string, unknown>; client_created_at: string; client_updated_at: string; schema_version: 2;
};
export type CloudSnapshot = { source: RawSnapshot; records: CloudRecord[] };
export function captureCloudSnapshot(port: StoragePort, fallbackDate: string, verified?: VerifiedCopy): CloudSnapshot {
  const journal = port.getItem(RESTORE_JOURNAL_KEY);
  if (journal && JSON.parse(journal).status === "pending") throw new Error("復元処理中はクラウド保存を行いません。");
  const backup = exportLearningBackup("phase4", port);
  if (!backup.ok) throw new Error(backup.error);
  const source = backup.value.data;
  const kinds = ["flashcard", "question", "study"] as const;
  const dates = ["lastReviewedAt", "lastAnsweredAt", "lastStudied"] as const;
  const verifiedMatches = verified && LEARNING_KEYS.every(key => verified.metadata.source[key] === source[key]);
  const records: CloudRecord[] = [];
  LEARNING_KEYS.forEach((key, index) => {
    const parsed: unknown = JSON.parse(source[key] ?? "{}");
    if (!validateLearningRecord(key, parsed)) throw new Error("学習データを検証できません。原文を保持してクラウド保存を停止します。");
    const canonical = canonicalRecords(key, parsed);
    const metadata = new Map(verifiedMatches ? verified.rows[index].map(row => [row.id, row]) : []);
    for (const [id, value] of Object.entries(canonical)) {
      const row = metadata.get(id);
      const event = value[dates[index]];
      const date = typeof event === "string" && event && Number.isFinite(Date.parse(event)) ? new Date(event).toISOString() : fallbackDate;
      records.push({ kind: kinds[index], record_id: id, data: value, schema_version: 2,
        client_created_at: row?.createdAt ?? date, client_updated_at: row?.updatedAt ?? date });
    }
  });
  return { source, records };
}

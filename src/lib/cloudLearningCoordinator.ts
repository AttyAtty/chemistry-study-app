import { archiveLearningSnapshot, type StoragePort } from "./learningStorage";
import { CLOUD_BINDING_KEY, canWriteCloud, captureCloudSnapshot, readCloudBinding, writeCloudBinding, type CloudBinding } from "./cloudLearning";
import type { CloudTransport, CloudInspection } from "./supabase/cloudTransport";
import type { VerifiedCopy } from "./indexedDbLearningStorage";

export type CloudState = { phase: "anonymous" | "checking" | "consent" | "conflict" | "foreign" | "ready" | "paused" | "saving" | "pending" | "error"; message: string };
type Identity = { userId: string; transport: CloudTransport };
type Dependencies = {
  storage: StoragePort; online: () => boolean; uuid: () => string;
  lock: <T>(action: () => Promise<T>) => Promise<T>;
  verified?: () => VerifiedCopy | undefined; publish: (state: CloudState) => void;
};
export class CloudLearningCoordinator {
  private identity: Identity | null = null;
  private generation = 0;
  private inspection: CloudInspection | null = null;
  private running: Promise<void> | null = null;
  private requested = false;
  private autoAllowed = false;
  constructor(private deps: Dependencies) {}
  private set(phase: CloudState["phase"], message: string) { this.deps.publish({ phase, message }); }
  async connect(identity: Identity | null) {
    const generation = ++this.generation;
    this.identity = identity; this.inspection = null; this.autoAllowed = false;
    if (!identity) { this.set("anonymous", "この端末に保存されています。"); return; }
    try {
      const binding = readCloudBinding(this.deps.storage);
      if (binding && binding.ownerUserId !== identity.userId) {
        this.set("foreign", "この端末のデータは別のアカウントに連携済みです。このアカウントには送信しません。"); return;
      }
      if (!this.deps.online()) { this.set("pending", "オフラインのため端末内に保存しています。"); return; }
      this.set("checking", "クラウドの保存先を確認中…");
      const inspection = await identity.transport.inspect();
      if (generation !== this.generation) return;
      this.inspection = inspection;
      // Re-read after the network request: another tab may have claimed this profile.
      const current = readCloudBinding(this.deps.storage);
      if (current && current.ownerUserId !== identity.userId) { this.set("foreign", "別のアカウントのデータを保持しています。送信しません。"); return; }
      if (current?.needsReview) { this.set("paused", "復元後のデータは端末内に保持しています。クラウドとの統合は保留しています。"); return; }
      if (inspection.hasData && (!current || inspection.deviceId !== current.deviceId || inspection.revision > current.revision)) {
        this.set("conflict", "クラウドにも学習データがあります。上書きや合算をせず、この端末のデータを保持します。"); return;
      }
      if (current?.enabled && inspection.deviceId === current.deviceId) {
        this.autoAllowed = true;
        this.set("ready", "クラウド保存：有効");
        if (current.revision > current.lastUploadedRevision) void this.flush();
      } else {
        this.set("consent", inspection.hasData ? "この端末と連携済みの保存先です。確認してクラウド保存を再開できます。" : "この端末の学習データを、あなたのクラウド領域へ保存できます。");
      }
    } catch { if (generation === this.generation) this.set("error", "クラウドを確認できません。端末内の学習は続けられます。"); }
  }
  async enable() {
    const identity = this.identity, generation = this.generation;
    if (!identity || !this.inspection || !this.deps.online()) throw new Error("オンラインで保存先を確認してから操作してください。");
    const initial = !this.inspection.hasData;
    await this.deps.lock(async () => {
      if (generation !== this.generation) throw new Error("アカウントが切り替わりました。");
      const existing = readCloudBinding(this.deps.storage);
      if (existing && (existing.ownerUserId !== identity.userId || existing.needsReview)) throw new Error("所有情報が異なるため送信を停止しました。");
      if (!initial && (!existing || this.inspection?.deviceId !== existing.deviceId || this.inspection.revision > existing.revision)) throw new Error("既存クラウドデータの上書きは保留しています。");
      const now = new Date().toISOString();
      // Validate all original data before backing up/binding. Never upload a filtered subset.
      captureCloudSnapshot(this.deps.storage, now, this.deps.verified?.());
      const archive = archiveLearningSnapshot("phase4", this.deps.storage);
      if (!archive.ok) throw new Error(archive.error);
      const binding: CloudBinding = {
        version: 1, ownerUserId: identity.userId, deviceId: existing?.deviceId ?? this.deps.uuid(),
        revision: (existing?.revision ?? 0) + 1, lastUploadedRevision: existing?.lastUploadedRevision ?? 0,
        enabled: false, needsReview: false, backupKey: archive.value.backupKey, updatedAt: now,
      };
      // Ownership is persisted BEFORE any cloud request, even if upload later fails.
      writeCloudBinding(this.deps.storage, binding);
      this.set("saving", "バックアップを作成し、クラウドに保存中…");
      const snapshot = captureCloudSnapshot(this.deps.storage, now, this.deps.verified?.());
      const result = await identity.transport.save(binding.deviceId, binding.revision, snapshot.records, initial);
      if (generation !== this.generation) return;
      const current = readCloudBinding(this.deps.storage);
      if (!current || current.ownerUserId !== identity.userId || current.deviceId !== binding.deviceId || current.needsReview) return;
      if (result.revision > current.revision) throw new Error("クラウド側の版が進んでいるため保存を保留します。");
      writeCloudBinding(this.deps.storage, { ...current, enabled: true, lastUploadedRevision: binding.revision });
      this.autoAllowed = true;
      this.inspection = { hasData: true, deviceId: binding.deviceId, revision: result.revision };
      this.set("ready", "クラウド保存：有効");
    });
  }
  async pause() {
    this.autoAllowed = false;
    await this.deps.lock(async () => {
      const binding = readCloudBinding(this.deps.storage);
      if (binding && this.identity?.userId === binding.ownerUserId) writeCloudBinding(this.deps.storage, { ...binding, enabled: false });
    });
    this.set("paused", "この端末に保存しています。クラウドへの送信は保留中です。");
  }
  async localChanged() {
    try {
      await this.deps.lock(async () => {
        const binding = readCloudBinding(this.deps.storage);
        if (!binding) return;
        writeCloudBinding(this.deps.storage, { ...binding, revision: binding.revision + 1, updatedAt: new Date().toISOString() });
      });
      // A local write was already committed. A cloud failure never reaches its UI result.
      if (this.identity) void this.flush();
    } catch { this.autoAllowed = false; this.set("error", "端末内には保存済みです。所有情報を保存できないためクラウド送信を停止しました。"); }
  }
  flush(): Promise<void> {
    this.requested = true;
    if (this.running) return this.running;
    const startedGeneration = this.generation;
    this.running = (async () => {
      do {
        this.requested = false;
        const identity = this.identity, generation = this.generation;
        const binding = readCloudBinding(this.deps.storage);
        if (!identity || !this.autoAllowed || !canWriteCloud(binding, identity.userId)) return;
        if (!this.deps.online()) { this.set("pending", "オフラインのため端末内に保存しています。未送信の情報は保持されています。"); return; }
        if (!binding || binding.revision <= binding.lastUploadedRevision) return;
        const snapshot = captureCloudSnapshot(this.deps.storage, binding.updatedAt, this.deps.verified?.());
        this.set("saving", "クラウドに保存中…");
        const result = await identity.transport.save(binding.deviceId, binding.revision, snapshot.records, false);
        if (generation !== this.generation) return;
        await this.deps.lock(async () => {
          const current = readCloudBinding(this.deps.storage);
          if (!current || !canWriteCloud(current, identity.userId) || current.deviceId !== binding.deviceId) return;
          if (result.revision > current.revision) throw new Error("Cloud revision ahead");
          writeCloudBinding(this.deps.storage, { ...current, lastUploadedRevision: Math.max(current.lastUploadedRevision, binding.revision) });
          this.requested ||= current.revision > binding.revision;
        });
        this.set("ready", "クラウド保存：有効");
      } while (this.requested);
    })().catch(() => { if(startedGeneration === this.generation) this.set("pending", "端末内には保存済みです。クラウドは未送信のため、オンラインで保存を再確認してください。"); })
      .finally(() => { this.running = null; if(this.requested && this.autoAllowed) void this.flush(); });
    return this.running;
  }
  invalidate() { this.generation++; this.identity = null; this.autoAllowed = false; }
}
export { CLOUD_BINDING_KEY };

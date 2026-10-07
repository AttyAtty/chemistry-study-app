import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseRequestClient } from "./client";
import type { CloudRecord } from "../cloudLearning";

export type CloudInspection = { hasData: boolean; deviceId: string | null; revision: number };
export interface CloudTransport {
  inspect(): Promise<CloudInspection>;
  save(deviceId: string, revision: number, records: CloudRecord[], initial: boolean): Promise<{ userId: string; revision: number }>;
}
/** Capture the token for this identity. A later account switch cannot redirect an old write. */
export function createCloudTransport(session: Session, signal: AbortSignal): CloudTransport {
  const client: SupabaseClient = getSupabaseRequestClient(session.access_token);
  const userId = session.user.id;
  return {
    async inspect() {
      const { data, error } = await client.from("learning_cloud_bindings").select("device_id,last_revision").eq("user_id", userId).abortSignal(signal).maybeSingle();
      if (error) throw new Error("クラウド領域を確認できません。端末内の学習は続けられます。");
      let hasData = Boolean(data);
      if (!data) {
        for (const table of ["flashcard_progress", "question_history", "study_progress"]) {
          const result = await client.from(table).select("user_id", { count: "exact", head: true }).eq("user_id", userId).abortSignal(signal);
          if (result.error) throw new Error("クラウド領域を確認できません。");
          hasData ||= Boolean(result.count);
        }
      }
      return { hasData, deviceId: data?.device_id ?? null, revision: Number(data?.last_revision ?? 0) };
    },
    async save(deviceId, revision, records, initial) {
      const { data, error } = await client.rpc("save_chemica_learning", {
        p_device_id: deviceId, p_revision: revision, p_records: records, p_initial: initial,
      }).abortSignal(signal);
      if (error || data?.user_id !== userId || !Number.isSafeInteger(Number(data?.revision))) {
        throw new Error("クラウド保存を完了できませんでした。端末内のデータは保持されています。");
      }
      return { userId: data.user_id, revision: Number(data.revision) };
    },
  };
}

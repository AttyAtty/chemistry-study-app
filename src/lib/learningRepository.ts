import { readLearningData, updateLearningData, type LearningKey, type StorageResult } from "./learningStorage";
import { canonicalRecords, legacyCompatibleRecords, type Records } from "./learningIds";
type VerifiedReader = (key: LearningKey) => Records | undefined;
let verifiedReader: VerifiedReader | undefined;
export function installVerifiedReader(reader: VerifiedReader) { verifiedReader = reader; }
export { subscribeLearningChanges } from "./learningStorage";
export function readRepositoryData<T>(key: LearningKey): T {
  const original = readLearningData<Records>(key);
  try { return (verifiedReader?.(key) ?? canonicalRecords(key,original)) as T; }
  catch { return original as T; }
}
export function updateRepositoryData<T>(key: LearningKey, update: (current: T) => T): StorageResult<T> {
  const result = updateLearningData<Records>(key, original => {
    const next = update(canonicalRecords(key, original) as T) as Records;
    return legacyCompatibleRecords(key,original,canonicalRecords(key,next));
  });
  if (!result.ok) return result;
  return { ok:true,value:canonicalRecords(key,result.value) as T };
}

import { learningIdMigrationMap } from "@/data/learningIdMigrationMap";
import { LEARNING_KEYS, type LearningKey } from "./learningStorage";
export type Records = Record<string, Record<string, unknown>>;
export function aliases(key: LearningKey): Readonly<Record<string,string>> {
  return key === LEARNING_KEYS[0] ? learningIdMigrationMap.flashcards : key === LEARNING_KEYS[1] ? learningIdMigrationMap.questionHistory : learningIdMigrationMap.unitSlugs;
}
export function canonicalId(key: LearningKey, id: string) { const map = aliases(key); return Object.hasOwn(map,id) ? map[id] : id; }
export function canonicalRecords(key: LearningKey, records: Records): Records {
  const result: Records = Object.create(null);
  for (const [id,value] of Object.entries(records)) {
    const target = canonicalId(key,id);
    if (Object.hasOwn(result,target) && JSON.stringify(result[target]) !== JSON.stringify(value)) throw new Error("旧IDと新IDの記録が競合しています。元データを保持して変換を停止しました。");
    result[target] = value;
  }
  return result;
}
export function legacyCompatibleRecords(key: LearningKey, original: Records, next: Records): Records {
  const result: Records = Object.create(null);
  for (const [id,value] of Object.entries(next)) {
    const originals = Object.keys(original).filter(old => canonicalId(key,old) === id);
    const targets = originals.length ? originals : [id];
    for (const target of targets) result[target] = value;
  }
  return result;
}

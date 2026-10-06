/** IDs are fixed source literals. Keep them when editing display text. */
export type LearningRow = string[] & { learningId: string };
export function learningRow(learningId: string, cells: string[]): LearningRow {
  return Object.assign(cells, { learningId });
}

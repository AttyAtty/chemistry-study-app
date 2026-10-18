export type LessonSlug = "polymers" | "carbohydrates";
export type AnswerCategory = "monomer" | "polymer" | "polymerization" | "sugar" | "composition" | "reducing" | "hydrolysis";
export type AnswerField = { id: string; text: string; blankCategory: AnswerCategory; blankable: boolean };
export function field(id: string, text: string, blankCategory: AnswerCategory): AnswerField {
  return { id, text, blankCategory, blankable: true };
}
export type Atom = { id: string; label: string; x: number; y: number; role?: "reactive" | "linkage" };
export type Bond = { id: string; from: string; to: string; order: 1 | 2 | 3 };
export type MolecularDrawing = {
  id: string; width: number; height: number; atoms: Atom[]; bonds: Bond[];
  repeat?: { left: number; right: number; top: number; bottom: number };
  caption?: string;
};
export type Monomer = { id: string; name: AnswerField; structure: MolecularDrawing };
export type Polymer = {
  id: string; name: AnswerField; monomers: Monomer[]; method: AnswerField;
  family: "addition" | "condensation" | "network" | "rubber" | "ring-opening";
  repeat?: MolecularDrawing; repeatDescription: string;
  functionalGroups: string; byproduct: string; thermal: string;
  properties: string; uses: string; note: string;
};
export type SugarUnit = "glucose" | "fructose" | "galactose";
export type Sugar = {
  id: string; name: AnswerField; category: "mono" | "di" | "poly"; formula: string;
  composition: AnswerField; units: SugarUnit[]; reducing: AnswerField;
  reducingKind: "yes" | "no" | "negligible";
  hydrolysis: AnswerField; hydrolysisProducts: SugarUnit[];
  linkage: string; reaction: string; note: string;
  /** D-series Fischer projection, OH sides from the upper stereocentre downward. */
  fischer?: { carbonyl: "aldehyde" | "ketone"; ohSides: ("left" | "right")[] };
};
export const illustratedLessons = [
  { slug: "polymers", title: "高分子を図で理解", description: "原料の構造から、重合・繰り返し単位・性質と用途をつなぐ。" },
  { slug: "carbohydrates", title: "糖を図で理解", description: "分類・構成単糖・還元性・加水分解を一つの関係として見る。" },
] as const;

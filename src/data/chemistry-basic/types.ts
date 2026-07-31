export type ChemistryBasicCourseUnit = { slug:string; title:string; order:number; description:string; accent:"mint"|"purple"|"pink" };
export type FormulaReference = {
  title: string;
  formula: string;
  meaning: string;
  condition?: string;
};
export type GlossaryEntry = { term:string; category:string; definition:string };

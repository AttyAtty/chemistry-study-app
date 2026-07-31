import type { Metadata } from "next";
import { ChemistryBasicCourse } from "@/components/ChemistryBasicCourse";
import {
  chemistryBasicComprehensiveQuestions,
  chemistryBasicFormulas,
  chemistryBasicGlossary,
  chemistryBasicUnits,
} from "@/data/chemistry-basic";

export const metadata: Metadata = { title: "化学基礎コース | Chemica" };

export default function ChemistryBasicCoursePage() {
  return <ChemistryBasicCourse units={chemistryBasicUnits} formulas={chemistryBasicFormulas} glossary={chemistryBasicGlossary} comprehensiveCount={chemistryBasicComprehensiveQuestions.length} />;
}

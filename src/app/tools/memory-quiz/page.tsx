import type { Metadata } from "next";
import { MemoryQuizMaker } from "@/components/MemoryQuizMaker";
import { getMemoryQuizCandidates } from "@/data/memoryQuizCandidates";

export const metadata: Metadata = { title: "印刷小テスト" };

export default function MemoryQuizPage() {
  return <main className="page-container memory-quiz-page"><MemoryQuizMaker candidates={getMemoryQuizCandidates()} /></main>;
}

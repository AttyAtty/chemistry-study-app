import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizRoute } from "@/components/QuizRoute";
export const metadata: Metadata = { title: "問題演習" };
export default function QuizPage() { return <Suspense fallback={<main className="page-container"><p role="status">演習を準備しています</p></main>}><QuizRoute /></Suspense>; }

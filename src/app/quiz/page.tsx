import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizRoute } from "@/components/QuizRoute";
export const metadata: Metadata = { title: "テスト" };
export default function QuizPage() { return <Suspense fallback={<main className="page-container"><p role="status">テストを準備しています</p></main>}><QuizRoute /></Suspense>; }

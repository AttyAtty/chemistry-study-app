import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizRoute } from "@/components/QuizRoute";
export const metadata: Metadata = { title: "問題演習" };
export default function QuizPage() { return <Suspense fallback={<main className="page-container quiz-loading" aria-busy="true"><section className="quiz-loading-panel"><p className="eyebrow">QUIZ</p><p role="status">問題を読み込んでいます。画面が切り替わるまでお待ちください。</p><div className="quiz-loading-skeletons" aria-hidden="true"><i/><i/><i/></div><span className="quiz-loading-note">問題データは端末内にあるため、オフラインでも開けます。</span></section></main>}><QuizRoute /></Suspense>; }

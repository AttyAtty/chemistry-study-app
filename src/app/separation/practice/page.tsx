import type { Metadata } from "next";
import { Suspense } from "react";
import { SeparationPractice } from "@/components/separation/SeparationPractice";
import "@/components/separation/separation.css";

export const metadata: Metadata = { title: "系統分離の穴埋め練習" };
export default function SeparationPracticePage() {
  return <main className="page-container separation-page">
    <Suspense fallback={<p>問題の設定を準備しています…</p>}><SeparationPractice/></Suspense>
  </main>;
}

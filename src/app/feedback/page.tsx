import type { Metadata } from "next";
import Link from "next/link";
import { FeedbackForm } from "@/components/FeedbackForm";
import { isFeedbackType } from "@/lib/feedback";

export const metadata: Metadata = { title: "ご意見・お問い合わせ" };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ type?: string; source?: string }> }) {
  const params = await searchParams;
  return <main className="page-container feedback-page"><section className="feedback-panel" aria-labelledby="feedback-title"><p className="eyebrow">FEEDBACK</p><h1 id="feedback-title">ご意見・お問い合わせ</h1><p>Chemicaについての質問、不具合、教材内容の誤り、改善案などをお送りいただけます。</p><FeedbackForm initialType={isFeedbackType(params.type) ? params.type : "質問"} source={params.source ?? ""}/><Link className="feedback-back" href="/home">← 学習ホームへ戻る</Link></section></main>;
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "更新履歴" };

export default function ChangelogPage() {
  return <main className="page-container"><article className="content-card changelog-page">
    <p className="eyebrow">CHEMICA RELEASE NOTES</p><h1>更新履歴</h1>
    <section><h2>Beta v0.6.0</h2><p>図解教材と計算学習をつなぎ、教材を探しやすくする改善をまとめました。</p>
      <h3>追加</h3><ul><li>理論・無機・有機の図解教材、図解教材ハブ</li><li>重要公式、典型例題、練習問題、印刷用シート</li><li>学習記録、オフライン表示、アカウント同期の基盤</li></ul>
      <h3>改善</h3><ul><li>検索、スマートフォンの導線、教材の品質監査</li></ul>
      <h3>修正</h3><ul><li>空解答を印刷候補から除外し、中性リトマスの色を紫に修正</li></ul>
    </section><p><Link href="/home">ホームへ戻る →</Link></p>
  </article></main>;
}

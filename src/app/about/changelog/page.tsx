import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { alternates: { canonical: "/about/changelog" }, openGraph: { url: "/about/changelog" }, title: "更新履歴" };

export default function ChangelogPage() {
  return <main className="page-container"><article className="content-card changelog-page">
    <p className="eyebrow">CHEMICA RELEASE NOTES</p><h1>更新履歴</h1>
    <section><h2>Beta v0.7.2</h2><h3>修正</h3><ul><li>Next.jsなどの依存ライブラリをセキュリティ更新</li><li>スマホでの例題の数式はみ出しと、公式穴埋め印刷の改ページを修正</li><li>典型例題・系統分析学習ページの空白印刷を修正</li><li>非Vercel環境でのAnalytics 404を修正</li><li>公開前のバージョン・移行案内・クラウド保存の説明を整備</li><li>正式公開URLの説明を共通設定へ集約</li><li>初回ガイドと既存機能の検証を分離</li></ul></section>
    <section><h2>Beta v0.7.1</h2><h3>改善</h3><ul><li>初回ガイドをホームの表示順に沿う6ステップへ再構成</li><li>ブロック単位の案内へ統一し、図解ハブの説明を目的別教材へ統合</li><li>Chemica本体に合わせたガイドの配色・カード・ボタン階層</li><li>PC・スマホの配置と長いブロックのスクロールを改善</li><li>ホーム下部の共通ナビをPCでも利用可能に</li></ul></section>
    <section><h2>Beta v0.7.0</h2><h3>追加</h3><ul><li>主要機能を紹介する初回チュートリアル（7ステップ）</li><li>使い方ガイドの再表示とtutorialVersionによる管理</li></ul><h3>改善</h3><p>初めて使う方の導線と、Chemicaの主要機能の見つけやすさを改善しました。</p></section>
    <section><h2>Beta v0.6.0</h2><p>図解教材と計算学習をつなぎ、教材を探しやすくする改善をまとめました。</p>
      <h3>追加</h3><ul><li>理論・無機・有機の図解教材、図解教材ハブ</li><li>重要公式、典型例題、練習問題、印刷用シート</li><li>学習記録、オフライン表示、アカウント同期の基盤</li></ul>
      <h3>改善</h3><ul><li>検索、スマートフォンの導線、教材の品質監査</li></ul>
      <h3>修正</h3><ul><li>空解答を印刷候補から除外し、中性リトマスの色を紫に修正</li></ul>
    </section><p><Link href="/home">ホームへ戻る →</Link></p>
  </article></main>;
}

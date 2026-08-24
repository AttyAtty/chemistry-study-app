import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "プライバシーポリシー", description: "Chemica Betaにおける利用データとお問い合わせ情報の取り扱い" };

export default function PrivacyPage() {
  return <main className="privacy-page">
    <header><span className="eyebrow">Chemica Beta</span><h1>プライバシーポリシー</h1><p>学習データとお問い合わせ情報の取り扱いを、現在の実装に沿って説明します。</p></header>
    <div className="privacy-content">
      <section><h2>学習データ</h2><p>暗記カードの進捗、復習予定、テストの解答履歴などは、お使いのブラウザのlocalStorageへ保存されます。Chemicaにはアカウント機能やクラウド同期はなく、これらの学習データをサーバーへ保存する仕組みは現在ありません。ブラウザのサイトデータを消去すると、学習履歴も削除される場合があります。</p></section>
      <section><h2>アクセス解析</h2><p>使いやすさの改善と利用状況の把握のため、Vercel Web Analyticsを使用しています。ページ閲覧、参照元、端末・ブラウザの種類、おおよその地域などの集計情報が扱われる場合があります。広告配信を目的とした解析サービスは導入していません。詳しくは<a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Web Analyticsのプライバシーに関する説明</a>をご確認ください。</p></section>
      <section><h2>お問い合わせ</h2><p>お問い合わせでは、カテゴリ、本文、送信元ページと、入力した場合のみメールアドレスを送信します。内容の確認、返信、教材・機能の改善に利用します。送信にはResendを利用しています。送信回数の制限には、ネットワーク情報から作成した一時的な識別値をサーバーのメモリ上で使用します。</p><p>本名、学校名、住所、生年月日など、問い合わせに不要な個人情報は入力しないでください。メールアドレスは返信を希望する場合のみ任意で入力できます。</p></section>
      <section><h2>Cookie・外部サービス</h2><p>Chemica自身は、アカウント、広告配信、行動ターゲティングのためのCookieを設けていません。学習履歴の保存にはCookieではなくlocalStorageを使います。現在利用している主な外部サービスは、アクセス解析のVercel Web Analyticsと、お問い合わせ送信のResendです。</p></section>
      <section><h2>変更・お問い合わせ</h2><p>機能や利用サービスの変更に合わせて、この内容を更新する場合があります。ご質問は<Link href="/feedback?source=%2Fprivacy">お問い合わせフォーム</Link>からお知らせください。</p><p><small>制定・最終更新：2026年8月25日</small></p></section>
    </div>
  </main>;
}

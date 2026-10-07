import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "プライバシーポリシー", description: "Chemica Betaにおける利用データとお問い合わせ情報の取り扱い" };

export default function PrivacyPage() {
  return <main className="privacy-page">
    <header><span className="eyebrow">Chemica Beta</span><h1>プライバシーポリシー</h1><p>学習データとお問い合わせ情報の取り扱いを、現在の実装に沿って説明します。</p></header>
    <div className="privacy-content">
      <section><h2>学習データ・アカウント</h2><p>ログインなしでも利用でき、学習記録はこの端末のlocalStorageとIndexedDBに保存します。JSONバックアップを保存・復元できます。サイトデータの削除で端末内の記録やログイン状態が失われることがあります。</p><p>希望する方はSupabase Authのメール確認コードでログインできます。認証にはメールアドレスとSupabaseのユーザー識別子を利用します。ログイン状態はブラウザのlocalStorageに保存し、セッションを自動更新します。パスワードはChemicaで管理しません。</p><p>クラウド保存を確認して有効にした場合、カード進捗・問題の回答履歴・テスト集計を、ユーザー識別子と紐付けてSupabaseへ送信します。各アカウントのデータを分離し、他のアカウントから参照・更新できないよう制限します。複数端末の統合はまだ行いません。通信失敗時も端末内の学習を続けられます。</p><p>ログアウトしても学習記録は端末に残ります。共有端末では、この端末の学習記録を他の利用者が閲覧できることに注意してください。初回連携や復元前のバックアップも端末に保持します。クラウド保存の保留・ログアウトはクラウド側データの削除ではありません。削除やアカウントに関するご相談はお問い合わせからご連絡ください。</p></section>
      <section><h2>アクセス解析</h2><p>使いやすさの改善と利用状況の把握のため、Vercel Web Analyticsを使用しています。ページ閲覧、参照元、端末・ブラウザの種類、おおよその地域などの集計情報が扱われる場合があります。広告配信を目的とした解析サービスは導入していません。詳しくは<a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Web Analyticsのプライバシーに関する説明</a>をご確認ください。</p></section>
      <section><h2>お問い合わせ</h2><p>お問い合わせでは、カテゴリ、本文、送信元ページと、入力した場合のみメールアドレスを送信します。内容の確認、返信、教材・機能の改善に利用します。送信にはResendを利用しています。送信回数の制限には、ネットワーク情報から作成した一時的な識別値をサーバーのメモリ上で使用します。</p><p>本名、学校名、住所、生年月日など、問い合わせに不要な個人情報は入力しないでください。メールアドレスは返信を希望する場合のみ任意で入力できます。</p></section>
      <section><h2>Cookie・外部サービス</h2><p>現在の認証と学習保存にはCookieではなくlocalStorage・IndexedDBを利用します。Auth APIやユーザー別クラウドデータをService Workerのキャッシュへ保存しません。主な外部サービスは、認証・クラウド保存のSupabase、アクセス集計のVercel Web Analytics、お問い合わせ送信のResendです。広告配信や行動ターゲティング用のCookieは設けていません。</p></section>
      <section><h2>変更・お問い合わせ</h2><p>機能や利用サービスの変更に合わせて、この内容を更新する場合があります。ご質問は<Link href="/feedback?source=%2Fprivacy">お問い合わせフォーム</Link>からお知らせください。</p><p><small>制定・最終更新：2026年10月8日</small></p></section>
    </div>
  </main>;
}

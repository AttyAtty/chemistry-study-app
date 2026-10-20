# Chemica Beta 公開前リリースチェック

- 確認日: 2026-10-21
- 公開候補: **0.7.2-beta**
- 判定: **B: コード側の修正を反映済み。下記の本番設定・実機確認を完了してから公開可能**
- DNS / Vercel / Supabase / Resend設定、DB migration、既存データ削除、本番deploy、Git tag作成・pushは実行していない。

## 発見と修正

| 問題 | 対応 |
|---|---|
| 実行時依存の監査でCritical 1 / High 4を検出 | Next.js / eslint-config-nextを16.4.2へ、PostCSSを8.5.31へ更新し、関連patch依存を更新。実行時監査は0件 |
| VERSIONINGの基準が0.6.0、ドメインが候補/未提示という旧説明 | 現行版・公開予定origin・実際のクラウド保存範囲へ訂正 |
| 公式・例題・更新履歴のcanonical/OG URL、例題のsitemap掲載が不足 | 相対パスを共通metadataBaseへ接続しsitemapへ追加 |
| 例題、EnergyMapに付随する長い式がスマホのページ全体を横へ押し出す | 数式・例欄だけを横スクロール化 |
| 公式穴埋めの酸塩基カテゴリがA4からあふれる | 印刷時の表余白・数式サイズを調整し6カテゴリ6ページへ |
| 系統分析の学習ページと典型例題が共通print CSSにより空白印刷 | 該当ページに限定して本文visibilityを復帰 |
| 閉じた練習問題の解答・解説が印刷されない | beforeprint時だけ展開しafterprint/解除時に元の状態へ復帰 |
| EnergyMapの既存横向き用CSSに必要な教材属性がない | data-lesson-idを追加し既存A4横向き幅指定へ接続 |
| ローカル本番起動でVercel Analyticsの専用パスが404 | Vercel環境だけでAnalyticsを読み込む |
| 古いE2Eのカード件数、MathMLテキスト、重複セレクタ、初回ガイド干渉 | データに基づく件数・対象限定・ガイドを別途検証するテスト前提へ更新 |

## 自動検証と実画面

- lint / typecheck / test / build: 成功。testは171件（保存互換・復元ロールバック・RLS/coordinator・計算・問題IDを含む）。
- 本番ビルドだけに `NEXT_PUBLIC_APP_URL=https://chemica.app` を指定。Vercelやユーザーの.env.localは変更していない。
- 化学データ監査: 有機166、無機103、redox20、気体14、電気化学16、整合性成功。
- 教材監査: 12単元、744問題、742印刷候補、20図解ハブ項目。空解答・重複ID・参照切れ・印刷候補の検証成功。
- 反応図: 38レイアウトのノード/ラベル等の衝突0。経路同士の交差はこの監査では許容。
- ブラウザ: Chrome / Edgeの計82ケースを実行。初回68成功・14失敗を切り分け、修正対象を再試験して全82ケースの成功を確認（単一の最終82件一括実行ではない）。最後の変更は対象テストを追加実行。
- Auth: 実ブラウザ + Auth/RESTモック。新規OTP、期限切れ、再送、email変更、session維持、logout、local保持、再login、別account混同防止、通信失敗・offline保存を確認。実メール・本番RLSとは区別する。
- ホーム/ガイド: 1440px・390px・320px。6ブロック順の案内、上下方向、手動再表示、completed/skipped/dismissed、Escape、フォーカス/inertを確認。
- 主要18ページを1440px・390px・320pxで表示。スマホのページ全体の横はみ出しなし。
- 図解ハブ全20リンクのHTTP成功。高分子・糖・系統分析/分離・蒸気圧・滴定・平衡・エンタルピー・EnergyMap・無機教材を確認。
- 検索: 糖、グルコース、高分子、系統分析、炎色反応、沈殿、蒸気圧、滴定、エンタルピー、ヘス、電池、電気分解の期待教材が上位5件以内。
- 理論: 分数/上付き/下付きのMathML、15典型例題、12練習問題、数値類題、10計算分野のデータ/式のテストを確認。中性リトマスの紫も維持。
- 印刷: 小テスト、イオン化傾向、系統分析、高分子、糖、公式、例題・練習、EnergyMapのPDFを作り、本文抽出とPoppler画像で確認。通常8種55ページに空白なし。公式穴埋め6ページも確認。実プリンタ/OS印刷UIは未検証。
- PWA: 48ページ・47資産をprecache。worker15件成功。更新待機/明示更新、offline再起動、cache修復、IndexedDB不可時、backup/restoreを実ブラウザで検証。Auth/POST/APIがcacheに入らないことを確認。
- 主要ページの予期しないfirst-party 404、pageerror、hydration/React/worker errorなし（意図した404ページ・問い合わせエラーモックを除く）。
- URL: ビルド結果のcanonical/OG/JSON-LD/robots/sitemapでchemica.appを検証。共有・QRは閲覧中origin、manifest/start_urlは相対パス。旧Vercelホストのハードコードなし。
- 不正URL: HTTP 404と案内画面を確認。
- パフォーマンス: 全ルート合計JS約2.0MB（未圧縮、初回DL量ではない）、最大chunk約266KB、gzip最大約72KB。public画像最大約264KB。無限再レンダリング警告なし。Lighthouse/実機性能測定は未実施。

## 未修正・未確認

- 開発依存のみHigh 5件: @next/eslint-plugin-next / eslint-config-next / fast-glob / micromatch / braces。実行時依存の `npm audit --omit=dev` は0件。監査のforce修正はeslint-config-nextの旧メジャーへの変更を提案するため行っていない。互換修正版を継続監視する。
- 現在のGit管理対象と追加ソースで秘密値パターン検出なし。.env.localはGit対象外。これは履歴全体/外部設定の機密監査を意味しない。
- この環境からchemica.appはENOTFOUND。本番canonical/TLS/公開ページの動作を確認済みとは扱わない。
- 読み取り専用Supabase接続確認: configured/clientInitializedはtrueだがnetwork失敗。実OTP・本番cloud upload・本番RLSは未確認。
- ローカルのResend秘密変数は未設定。本番値は参照・変更していない。問い合わせ成功/失敗UIはモックで確認し、実メールを送っていない。
- クラウド取り込み・複数端末統合は既存仕様として未対応。JSON backup/restoreで移行。保存形式・学習ID・DB schemaは変更していない。
- iPhone/Androidの実インストール、実タッチ、読み上げソフト、実ブラウザ印刷は人間が確認する。

## 公開前に人間が行う作業

- [ ] Vercelの対象Production projectにchemica.appが登録されていることを確認。
- [ ] 管理権限・DNS・必要ならwwwからapexへの転送を確認。
- [ ] 有効なTLS証明書、HTTPS応答、HTTPからHTTPSへの遷移を確認。
- [ ] Production環境に `NEXT_PUBLIC_APP_URL=https://chemica.app` を設定し、意図したリリース手順で反映。
- [ ] `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` が対象projectの公開値であることを確認（secret/service_role禁止）。
- [ ] Supabase Site URL: `https://chemica.app`。
- [ ] Redirect URLs: 完全一致の `https://chemica.app/` を基本とし、本番は不要な `/**` を許可しない。現行OTPはredirect/callbackを使わない。将来redirectToを追加する場合だけ実パスを許可。
- [ ] Email signup/OTP設定とメール本文の `{{ .Token }}` を確認。
- [ ] Custom SMTPとResendドメイン認証（SPF/DKIM/必要なDMARC）を確認。Auth Senderは `Chemica <no-reply@chemica.app>` を推奨。
- [ ] サーバー専用の `RESEND_API_KEY` と `CHEMICA_FEEDBACK_FROM_EMAIL=Chemica <feedback@chemica.app>` を確認。SMTP secretも含めNEXT_PUBLICへ置かない。
- [ ] 本物の外部メールで新規OTP、コード入力、再送、失敗、再login、reload、logout後local保持を確認。
- [ ] 問い合わせを1件送信し、固定の受信先・From・Reply-To・到達/迷惑メールを確認。
- [ ] 本番DBの現行schema/RLSとA/Bのユーザーデータ隔離を確認（自動migrationは行わない）。
- [ ] 旧originの記録は消さずJSONを保存し、新originで復元・件数・正答率を確認。
- [ ] iPhoneのSafari/PWA追加・起動・offline・更新を確認。
- [ ] Android/ChromeのPWA追加・起動・offline・更新を確認。
- [ ] 実ブラウザのA4印刷で問題/解答、SVG、数式、EnergyMapの横向きと余白を確認。
- [ ] 公開後のchemica.appでcanonical、og:url、JSON-LD、robots、sitemap、共有/QRを確認。

Site URL/完全一致allowlistの考え方は [Supabase redirect公式文書](https://supabase.com/docs/guides/auth/redirect-urls)、公開向けSMTPの条件は [Supabase SMTP公式文書](https://supabase.com/docs/guides/auth/auth-smtp)を参照。

## 公開後の最初の監視

Vercelの5xx/例外/404とJS chunk失敗、OTP送信/verify失敗・制限、Resend配信/バウンス、問い合わせ失敗/429、PWA precache/更新待機/旧版混在、IndexedDB/localStorage容量・cloud失敗・復元相談を優先する。

## 手動Git tag

手動チェック完了・差分レビュー・通常のリリースcommit後にのみ実行。今回は実行していない。

```bash
git tag v0.7.2-beta
git push origin v0.7.2-beta
```

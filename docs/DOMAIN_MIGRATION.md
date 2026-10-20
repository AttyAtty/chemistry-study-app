# chemica.app 移行手順

`chemica.app` は移行先として指定されていますが、このリポジトリの変更ではDNS、Vercelのドメイン登録、Supabase設定を変更しません。正式な切替前に、次の外部設定とデータ移行を確認してください。

## アプリ内のorigin

`src/lib/siteConfig.ts` が公開originを一元管理します。`NEXT_PUBLIC_APP_URL` を最優先し、未設定時はVercelの `VERCEL_PROJECT_PRODUCTION_URL` / `VERCEL_URL`、ローカルでは `http://localhost:3000` を使います。metadataBase、ページ別canonical、Open Graph、JSON-LD、sitemapはこのoriginを参照します。manifest、教材リンク、share linkは相対URLまたは現在開いているページのURLを使います。

移行を行うときは、VercelのProduction環境へ次を設定して再デプロイします。

```text
NEXT_PUBLIC_APP_URL=https://chemica.app
```

Preview環境はVercelのデプロイホストを使うため、Productionとは別のURLとして扱います。`.env.local` には秘密情報を記録し、リポジトリには追加しないでください。

## 切替前の外部設定

1. ドメインの管理権限を確認し、Vercelプロジェクトへ `chemica.app` と必要な `www` ドメインを追加します。Vercelが案内するDNSレコードを設定し、HTTPS証明書とProductionデプロイの応答を確認します。
2. VercelのProduction環境変数 `NEXT_PUBLIC_APP_URL` を `https://chemica.app` に設定して再デプロイします。`/robots.txt`、`/sitemap.xml`、canonical、Open GraphのURLが新originを使うことを確認します。
3. Supabase AuthenticationのSite URLを新originへ更新し、Redirect URLsは本番で実際に使う完全一致URL（`https://chemica.app/`）を許可します。本番での包括的な `/**` は避け、別の認証リダイレクトを実装した場合だけ該当パスを追加します。現在のメールOTPは `emailRedirectTo` を指定せず、SupabaseのSite URLを使います。切替期間は既存originも必要な範囲で許可リストに残します。
4. Resendの送信元ドメインを使っている場合は、新ドメインのDNS認証と送信者設定が必要か確認します。既存のResend APIキーやSupabase秘密情報を `NEXT_PUBLIC_*` に設定しないでください。
5. 新originのブラウザーで、メールOTP、共有リンク、フィードバック、PWAインストール、オフライン再表示を確認します。旧originでも利用者がデータを書き出す時間を確保してから、移行案内や旧サイトの扱いを決めます。

## 学習データとPWA

ブラウザーのlocalStorage、IndexedDB、ログイン状態、Service Workerキャッシュはoriginごとに分離されています。旧originの学習記録やPWAキャッシュは新originへ自動移行しません。

1. 旧サイトの「ログイン・データ保存」でJSONバックアップをダウンロードし、ファイルを確認します。
2. 新サイトをブラウザーで開き、同じ画面からJSONを復元します。復元後にクイズ記録・暗記カードを確認し、必要なら新originで再ログインします。
3. 新サイトをPWAとして改めてインストールします。インストール後はホーム画面またはアプリ一覧から通常のアプリとして起動できます。
4. 旧サイトは移行を確認するまで利用可能な状態で残します。クラウド記録の複数origin間同期・統合機能はありません。

## 今回コードで用意したもの

- originをまとめる `NEXT_PUBLIC_APP_URL` とVercel/localhost fallback
- metadataBase、ページcanonical、Open Graph、WebSite structured metadata
- 教材URLから作るsitemapと、設定・クイズ・APIを除外するrobots設定
- 正式URL未確定という旧文言の更新

DNS、Vercel、Supabase、Resendなどの外部アカウント設定と、実際の切替は未実施です。

# Chemica

高校化学を単元・問題・図解から学ぶ Next.js アプリです。理論化学、無機化学、有機化学に加え、電池、気体、系統分析、高分子、糖などの横断教材を収録しています。

## 主な機能

- 単元ごとの学習、クイズ、暗記カード、学習記録
- SVGと構造化データによる理論・無機・有機の図解教材
- 図解教材の穴埋め、解答表示、印刷
- ローカル保存、PWAインストール、オフライン閲覧
- 任意のSupabaseログイン・この端末のクラウドバックアップ（取り込み・複数端末統合は未対応）
- JSON形式の学習データ書き出し・復元

## 開発

Node.js 22以降を使用します。

```powershell
npm install
npm run dev
```

ブラウザーで `http://localhost:3000` を開きます。Supabaseやフィードバック送信を使う場合は `.env.local.example` を参考に `.env.local` を設定してください。公開用の正規URLは `NEXT_PUBLIC_APP_URL` で設定します。未設定時はVercelのデプロイホスト、ローカルではlocalhostを使います。

## 品質確認

```powershell
npm run lint
npm run typecheck
npm run audit:chemistry
npm run audit:study-materials
npm run test
npm run build
```

`npm run build` はPWAのオフライン保存対象とサービスワーカーも生成します。

## chemica.appへの移行

本番DNS・TLSとSupabase AuthのSite URL / Redirect URLsを準備したあと、本番環境の `NEXT_PUBLIC_APP_URL` を `https://chemica.app` に設定します。移行時は旧URLの端末内データ・ログイン・PWAキャッシュが自動移行しないため、必要な学習データをJSONで書き出し、新URLで復元してからPWAを再インストールしてください。DNSやSupabase設定はこのリポジトリのビルドでは変更されません。

移行前後の確認項目は [DOMAIN_MIGRATION.md](docs/DOMAIN_MIGRATION.md) にまとめています。

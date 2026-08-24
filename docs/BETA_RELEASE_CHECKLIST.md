# Chemica Beta Release Checklist

公開・更新の前に、実装内容に応じて以下を確認する。

## Build and data

- [ ] `npm run lint` が完了する
- [ ] `npm run audit:chemistry` が完了する
- [ ] `npx tsc --noEmit` が完了する
- [ ] `npm run build` が完了し、主要routeが生成される
- [ ] QuizのID重複、同義問題、正答index、実問題数表示を確認する
- [ ] Reaction Map・表・Flashcard・Testが共通データと矛盾しない

## Major journeys

- [ ] `/` → Start → `/home` → 各主要単元
- [ ] Homeの検索、今日の復習、10問チャレンジ
- [ ] 各単元のQuick Actions → Flashcard / Test / 主要教材
- [ ] Flashcardの「覚えた / まだ」と復習予定
- [ ] Testの出題数選択、解答、結果、needsReview、unseen
- [ ] 酸化還元の生成物予測 → 骨格 → 半反応式
- [ ] 検索結果 → 教材・関連知識・暗記・Test
- [ ] 学習記録の空状態と履歴あり状態
- [ ] お問い合わせの入力検証、成功・失敗表示、source URL

## Responsive and accessibility

- [ ] 320 / 375 / 390 / 430pxで横スクロールや1文字折返しがない
- [ ] 1366×768 / 1440×900 / 1920×1080で余白とカラムが自然
- [ ] Bottom Navigationが本文と重ならずsafe-areaが効く
- [ ] 表・化学式・Flashcard・Test・検索がスマートフォンで操作できる
- [ ] Reaction Mapの初期表示、node/label、zoom、ページ横スクロールを確認する
- [ ] keyboard、focus、button/link semantics、aria-label、tap target、contrastを確認する
- [ ] 印刷時にNavigation、Quick Actions、Footerが出ない

## Public release

- [ ] Beta表記とpackage.json由来のversion表示を確認する
- [ ] Privacy Policyが実際のAnalytics・Feedback・保存方式と一致する
- [ ] Vercel Analyticsが一度だけ読み込まれる
- [ ] FeedbackのResend環境変数と送信先を本番環境で確認する
- [ ] manifest、192/512 icon、apple-touch-icon、start_url、standalone、theme colorを確認する
- [ ] PWA iconがC symbol主体になっている
- [ ] 検索結果なし、復習なし、履歴なし等の空状態に次の行動がある
- [ ] stack trace、undefined、NaN、内部IDがユーザー画面に出ない
- [ ] 主要な化学式、反応条件、触媒、温度、液性を最終確認する


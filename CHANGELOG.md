# Changelog

## v0.7.2-beta — 2026-10-21

### Fixed
- 開始画面が静的生成されない環境のPWA生成を修正し、オフライン時は学習ホームへ接続（必須教材の検証は維持）
- Next.js 16.4.2・PostCSS等のセキュリティ更新（実行時依存の監査で検出された問題を解消）
- スマホの典型例題ページで数式がページ全体を横にはみ出す問題を修正
- 公式穴埋め印刷の酸塩基カテゴリをA4に収める余白調整
- 典型例題・系統分析学習ページの空白印刷を修正
- 練習問題の解答・解説を印刷時に表示し、印刷後は元の開閉状態へ復帰
- EnergyMapに併設する公式欄のスマホ横はみ出しを修正
- EnergyMapの教材識別属性を補い、既存のA4横向き幅指定を適用
- 非Vercel環境でAnalytics用スクリプトが404になる問題を修正
- 公開前チェックでバージョン管理文書とドメイン移行・クラウド保存の説明を更新
- 正式公開URLのアプリ内説明をsiteConfigへ集約
- 公式・例題・更新履歴のcanonicalとOpen Graph URL、sitemap掲載を整備
- ナビ・更新通知・オフラインの既存テストを初回ガイドから分離


## v0.7.1-beta — 2026-10-21

### Improved
- 初回ガイドをホームの表示順に再構成（6ステップ）
- QUICK START・今日の3問・主要4分野・目的別教材・ナビのブロック単位の案内へ統一
- 図解ハブの説明を目的別教材へ統合し、自動スクロールを上から下へ統一
- Chemica本体のデザイントークンに合わせてガイドの配色・カード・ボタン階層を調整
- PCの説明用スペース、スマホの説明カードと長いブロックのスクロールに対応
- ホーム下部の共通ナビゲーションをPCでも利用可能に


## v0.7.0-beta — 2026-10-20

### Added
- 初回チュートリアル / 使い方ガイド（7ステップ）
- その他・フッターからのガイド再表示
- 学習データから独立したtutorialStatus・tutorialVersion管理

### Improved
- 初めて使うユーザー向けの導線と主要機能の発見性
- キーボード・スマートフォン・オフラインに対応したガイド


## v0.6.0-beta — 2026-10-19

First consolidated release history. Earlier point releases were not reconstructed.

### Added
- Visual learning materials for theory, inorganic, and organic chemistry, including separation analysis, polymers, carbohydrates, gases, electrochemistry, and energy changes.
- Formula catalogue, calculation examples, printable practice sheets, answer reveal, and offline-capable visual lessons.
- Searchable illustrated-material hub, printable memory quizzes, learning records, and Supabase account/cloud-save foundation.

### Improved
- Organized theory chemistry pathways across states and solutions, thermochemistry, equilibrium, acids and bases, and electrochemistry.
- Improved mobile navigation, material discovery, search, and answer-quality auditing.

### Fixed
- Excluded blank and placeholder answers from printable quiz candidates.
- Corrected the neutral litmus color to purple.

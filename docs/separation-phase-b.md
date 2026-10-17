# 系統分離の穴埋め練習 Phase B

## 追加・変更ファイル
- 追加：`src/lib/separationExercise.ts`、`src/components/separation/ExerciseField.tsx`、`src/components/separation/SeparationPractice.tsx`、`src/app/separation/practice/page.tsx`。
- 変更：`src/data/separation/types.ts` / `diagrams.ts`、`src/components/separation/SeparationDiagram.tsx` / `BenzeneStructure.tsx` / `separation.css`、`src/app/separation/[slug]/page.tsx`。
- 検証：`scripts/test-separation-exercise.mjs`、`tests/pwa/separation-practice.spec.ts`を追加。`package.json`のtest:separationを更新。
- PWA：`scripts/generate-service-worker.mjs`、生成される`docs/verification/phase3-precache.json`。設計記録は本ファイル。

## 入口と表示
通常図の「練習問題を作る」から `/separation/practice?diagram=...` に移動する。
作成画面では分野・4モードを選択し、ランダムでは20/30/50/70%とseedを設定する。
設定は作成ボタンでプレビューに反映。生成した設定をプレビューに表示し、別の問題ボタンは生成済み問題の設定を引き継ぐ。
通常図と練習は同じ `SeparationDiagram` / `BenzeneStructure` を使う。ノード座標・枝線・枠は変更しない。

## 対象の分類
`types.ts` の `blankCategoryLabels` が分類の定義元（species / reagent / condition / operation / amount / action / result）。
`Blankable.blankCategory` で既定分類を上書きできる。対象の選択に化学名の文字列検索は使わない。

| 表示要素 | 安定ID | 既定分類 |
| --- | --- | --- |
| 無機の物質行 | nodeID:line:index | species |
| 無機の沈殿色 | nodeID:line:index:result | result |
| 属・分離結果の見出し | nodeID:label | result |
| 熱水処理後のPbCl₂見出し | 同上、明示メタデータ | species |
| 有機の各構造式・名称 | nodeID:compound:compoundID | species |
| 試薬・条件・加え方・操作 | 既存field ID | 対応する型の分類 |
| 図中のCO₂発生 | Note ID、明示blankable | result |
| 補足操作 | 既存action ID、practiceSupplement | action |

非表示の中間ろ液・blankable=falseの項目は対象外。mixture型の出発物は全モードで保護する。
沈殿の式と色は型付きlinePartsで分離し、物質モードでは色のヒントを残す。通常図は従来の行表示を使い、位置・見た目を維持する。
主図にない静置・分液・ガス抜き・ろ別等は補足操作欄に出題する。図と同じ空欄番号を見出しに再利用して対応づける。
物質名を不要に答えとして露出させないよう、補足の冷却・ろ別操作には型付きのpracticeLabelを設定する。

## 4モード
- 全体：主要な出題可能フィールドをすべて空欄化。水層／エーテル層という構造上のラベルは残す。
- 物質：speciesのみ。試薬・操作を残す。
- 試薬・操作：reagent / condition / operation / amount / actionのみ。物質・構造式を残す。
- ランダム：同じ対象集合から指定率（件数は四捨五入、最低1件）を選ぶ。

## seedと再現性
`separationExercise.ts` は副作用のない関数。FNV-1aで図ID・seedを32bit状態へ変換し、Mulberry32の疑似乱数でID順に整列した候補をFisher–Yatesシャッフルする。Math.random・現在時刻・ネットワークは使わない。
同じ図データ・モード・率・seed・構造式設定なら同じ問題を再現する。
「別の問題」はseed末尾を決定的に更新し、偶然同じ選択になったものをスキップする。任意の異なるseedの選択が必ず異なるという数学的保証はない（有限の空欄組合せのため）。

## 問題と解答
選んだIDは番号付きの下線へ置換する。SVGの形状・位置は変えない。補足欄はHTMLの下線を使用する。
解答切替は同じID集合だけを青字の答えへ切り替える。空欄番号・選択集合は切替前後で不変。
問題画面では通常図の詳細・文章版・注記を出さず、title/aria-labelにも隠した答えを表示しない。
有機の物質モードは構造式ヒント＋名前の空欄が標準。全体・ランダムは対象構造式を隠す設定が標準。チェックボックスで変更可能。

## オフラインと学習データ
作成ページを静的生成し、既存PWAのプリキャッシュ必須ルートへ追加。図・生成・解答はローカルのデータとReact stateで完結する。
進捗・IndexedDB・Supabaseコードは変更しない。成績・作成設定の永続保存は実装しない。

## Phase Cへの接続
問題オブジェクトはschemaVersion / generatorVersion / diagramId / 設定 / 対象ID・分類・答え / 選択IDを持ち、JSON化可能。
同じ問題オブジェクトを `exercise`、問題／解答の状態を `showAnswers` として渡せる。
Phase Cではこの共通描画と補足操作欄を印刷コンテナに収め、用紙サイズ・改ページ・操作UIの非表示を追加する。印刷・PDF・自動採点・文字入力は今回の対象外。

## 検証
`npm run test:separation` に純粋な生成テストを追加。全モード、混合物保護、カテゴリ分離、seed、率、別問題、メタデータ上書き、元データ非変更を検証する。
`tests/pwa/separation-practice.spec.ts` はChrome/Edgeで通常図との形状一致、4モード、構造式、解答切替、seed、モバイル幅、オフライン生成を検証する。

最終検証：lint・typecheck・build成功。`node --test scripts/test-*.mjs` は既存分を含む120件成功。
`npx playwright test` はChrome/Edge合計52件成功（通常図・新しい練習画面・既存認証／保存／PWA／UIを含む）。
新ページを静的生成し、26ページ・39アセットのプリキャッシュへ収録。無機全体穴埋めと有機構造式ヒントの保存画像を目視確認した。

# Phase F：無機の図解教材

## 教材と既存データの参照

- `/illustrated/ionization`：17項目の序列、水・熱水・水蒸気・希酸の反応帯、置換反応。新しい `ionizationSeries.ts` を既存化学基礎教材でも参照。
- `/illustrated/flame-tests`：既存 `chemistry.ts` の `flame-tests` セクションを参照。色のRGB値と元素名は描画用の補足。
- `/illustrated/precipitates`：既存 `inorganicComplexes.ts` の安定したセクションID・行IDを参照。個別レコードのなかった一部の沈殿は `inorganicPrecipitates.ts` に切り出し、既存色表も同じ値を使用。
- `/illustrated/gases`：`gases.ts` の8気体を参照。製法・捕集・検出・性質・注意を再管理しない。
- `/illustrated/electrochemistry`：`electrochemistry.ts` のダニエル電池・水の電気分解を参照。半反応・質量変化・移動方向を再管理しない。
- AgClのNH₃溶解・酸性化による再沈殿は既存系統分析と共通の記述を使用。

データの組立てはサーバーで行い、クライアントには該当教材の値だけを渡す。既存教材全体を描画用クライアントバンドルへ取り込まない。

## 出題・印刷・端末表示

- AnswerFieldの安定ID・カテゴリを使い、文字列検索で対象を判定しない。
- 全体／元素・物質・電極／色・反応範囲・酸化還元／試薬・製法・捕集・電子移動。該当フィールドのあるモードだけ表示。
- 既存のSVG空欄・HTML空欄・解答表示・Sheet・Canvas・A4プレビュー・印刷CSSを再利用。
- 沈殿の化学式と色、気体の製法の操作文は、一つの回答単位。
- 炎の色を問う場合は炎を無彩色化。捕集法を問う場合は装置の捕集部分も伏せる。
- 電子方向を問う場合は矢印も伏せる。反応範囲を問う場合は帯の端点から答えが分からない共通幅にする。
- 問題時は補足説明や気体の詳細性質を省略し、関連ヒントの漏出を防ぐ。
- 拡大時は図内を横スクロール。通常のモバイル表示でページ全体は横にはみ出さない。
- 印刷はA4縦、各図・表のSheetごとに改ページ。気体は捕集原理1枚＋8気体、通常時は補足を追加する複数枚構成。

## 科学的な扱いと範囲

- イオン化傾向の系列と水との反応速度の順序は区別。Mg・Alの皮膜、温度、Pbの難溶性塩、酸化性の酸を補足。
- 金属イオンとの置換はZn/Cu²⁺で例示。水と激しく反応する金属を水溶液に加える場合を単純な析出として扱わない。
- 沈殿表の「—」は通常の希薄水溶液で沈殿しない、「未掲載」は判断を記載しない組合せ。全組合せを無理に埋めない。
- OH⁻は少量添加。Ag⁺ではAg₂O。CaSO₄の濃度依存、PbCl₂の熱水溶解、硫化物のpH依存を補足。
- Fe³⁺とH₂Sは酸化還元を伴うため、単純な硫化物のセルを作らない。
- 気体装置は原理の模式図。乾燥・逆流防止・排気吸収などを省略し、その旨を表示。有害気体の実捕集を推奨する図ではない。
- 水の電気分解は希硫酸・不活性電極の例。電源から両電極への接続と、共通の電解液を描く。
- ダニエル電池は電子が外部回路、イオンが塩橋を移動する。電極の符号と酸化還元の関係を電気分解と比較。

## 検証

- `npm run lint`：成功。
- `npm run typecheck`：成功。
- `node --test scripts/test-*.mjs`：135件成功。
- `npm run build`：成功、5ページを静的生成。PWAは全33ページ・43資産を保存対象に生成。
- Playwright：新無機図解・有機図解・系統図・系統図問題の4仕様をChrome／Edgeで実行し、8件成功。
- 各新教材で通常版／問題版のA4ページ数とSheet数の一致を確認。
- PDFをPNGへ変換し、反応帯・炎の空欄・沈殿表・確認反応・アンモニア装置・電池／電気分解を目視確認。
- 390px幅、拡大スクロール、オフラインでの直接遷移・再読込・問題化・解答表示を確認。
- データ保存、IndexedDB、Supabase同期の変更なし。

## 変更ファイル

追加：
`src/data/ionizationSeries.ts`、`src/data/inorganicPrecipitates.ts`、
`src/data/illustrated/inorganic.ts`、`src/data/illustrated/inorganicTypes.ts`、
`src/components/illustrated/InorganicLesson.tsx`、`src/components/illustrated/InorganicDiagrams.tsx`、
`src/lib/inorganicExercise.ts`、`scripts/test-inorganic-illustrated.mjs`、
`scripts/helpers/pure-typescript.mjs`、`tests/pwa/inorganic-illustrated.spec.ts`、本書。

変更：
`src/app/illustrated/[slug]/page.tsx`、`src/app/units/[slug]/page.tsx`、
`src/components/illustrated/IllustratedLessonLinks.tsx`、`src/components/illustrated/illustrated.css`、
`src/data/illustrated/types.ts`、`src/data/chemistry-basic/acid-base-redox.ts`、
`src/data/inorganicComplexes.ts`、`src/data/separation/diagrams.ts`、
`scripts/generate-service-worker.mjs`、`scripts/test-separation.mjs`、
`scripts/test-separation-exercise.mjs`、`docs/verification/phase3-precache.json`。

既存系統図の純粋データテストは、共通データへの相対importを読めるヘルパーへ更新。出題や図のレイアウトの仕様は変更しない。

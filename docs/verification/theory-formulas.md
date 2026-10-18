# 理論化学の全体像・公式と計算（2026-10-19）

## 既存教材の配置と整理

- 化学基礎の「物質の構成」に三態、「物質量と反応」にmol・濃度、「酸塩基と酸化還元」に中和を収録済み。
- 理論化学単元には濃度・溶解度・水和物・平衡・電離平衡との接続・コロイドがある。
- 気体は実験・気体単元と既存気体図解、電気化学は電池・電気分解単元と既存無機図解にある。
- 熱化学は独立したまとまった教材がなかったため、新規図解を追加。
- これらを削除・複製せず、理論化学の入口を「単元から」「図で」「公式・計算から」の3つに整理。学習地図は状態・気体・溶液／熱化学／速度・平衡／酸塩基／電気化学の5分類。

## 追加・変更ファイル

新規：

- `src/data/theoryCurriculum.ts`：5分類と既存教材のリンク
- `src/data/thermochemistry.ts`：熱化学の代表値・出典
- `src/data/illustrated/formulas.ts`：21公式と記号・単位・条件・例題・関連教材
- `src/lib/formulaCalculations.ts`：単位換算・量的関係・熱・電気の純粋計算関数
- `src/components/illustrated/TheoryCurriculum.tsx`：学習地図と3入口
- `src/components/illustrated/FormulaSection.tsx`：共通公式・計算カード
- `src/components/illustrated/FormulaCatalogue.tsx`：6分類のまとめ／個別解説／出題
- `src/components/illustrated/ThermochemistryDiagrams.tsx`：熱化学SVG
- `src/components/illustrated/ElectroCalculation.tsx`：Qから析出量へのSVG
- `src/app/theory/formulas/page.tsx`：公式まとめルート
- `scripts/test-formula-calculations.mjs`：代表計算とメタデータ検査
- `tests/pwa/theory-formulas.spec.ts`：画面・出題・A4・オフライン検査

変更：

- `src/app/units/[slug]/page.tsx`：理論学習地図への接続
- `src/data/illustrated/theory.ts`：熱化学図解・安定ID・出典
- `src/data/chemistry.ts`：既存表示とファラデー定数の共通化（表示値は同じ）
- `src/data/theoryChemistry.ts`：理論全体を示す見出し・概要・キーワード（既存教材とIDは維持）
- `src/lib/theoryModels.ts`：公式を計算カテゴリの穴埋めへ登録
- `src/components/illustrated/TheoryLesson.tsx`：熱化学・公式セクション
- `src/components/illustrated/InorganicLesson.tsx`：既存気体・電気化学への計算接続
- `src/components/illustrated/DiagramParts.tsx`：シートへのアンカーID
- `src/components/illustrated/illustrated.css`：学習地図・公式カード・A4スタイル
- `scripts/generate-service-worker.mjs`：新規2ページの保存必須対象
- `scripts/test-theory-illustrated.mjs`：図解と公式の統合出題対象
- `tests/pwa/theory-illustrated.spec.ts`、`tests/pwa/theory-advanced.spec.ts`：新分類・追加公式シートのページ数
- `docs/verification/phase3-precache.json`：ビルド時の生成記録

## 公式UIと出題

21レコードは6分類。式の左辺／意味のある右辺、記号・単位、使う場面、図との対応、例題（問題・使用式・代入・答え）、よくある間違い、関連教材を持つ。
式右辺と計算過程・答えに安定IDを付け、既存`AnswerField`のcalculation分類、HTML/SVG空欄、解答切替、印刷Sheetを再利用。式を1文字ずつ分割しない。
同じレコードを図解下と公式一覧で表示する。通常図解の配置や既存教材の学習ID・保存処理は変更しない。
理論ページでは「計算・関係式を確認」、気体・電気化学では既存の「試薬・製法・捕集・電子移動」または全体モードで公式も出題。公式一覧では専用の「公式・計算穴埋め」を選べる。

## 内容・典型計算

- mol：9.00 g / 18.0 g/mol = 0.500 mol
- 濃度：0.0500 mol / 0.250 L = 0.200 mol/L
- 気体：1.00 mol、27.0 ℃、100 kPa → 24.9 L（R=8.31の単位系）
- 分圧：100 kPa × 0.20 = 20 kPa
- 溶解度：水50.0 gなら基準値の半分。再結晶(80−30)×50/100=25.0 g（模式値）
- ヘンリー：同温・同じ液体量で分圧3倍→溶解量3倍。気体体積の測定条件に注意
- pH・pOH、水のイオン積（25 ℃）、中和の価数、弱酸の電離近似、緩衝液の濃度比
- Kc：反応式係数が指数。速度：反応物の減少に負号、係数で規格化
- ΔH、標準生成エンタルピー、ヘスの法則、結合エネルギーの概算
- 標準電池電圧0.34−(−0.76)=1.10 V
- 2.00 A×965 s=1930 C → 電子0.0200 mol → Cu 0.0100 mol → 0.635 g

## 科学的条件

溶解度は水100 g基準。冷却差分は高温飽和・水の蒸発なし・無水結晶の場合。水和物は既存教材へ接続。
pHの濃度近似、Kwの温度依存、弱酸近似と緩衝液近似の条件を明示。
平衡は濃度一致ではなく速度一致。純固体・純液体を通常省く扱いと、厳密な無次元Kの違いを注記。
ΔHは系の変化。発熱は負、吸熱は正。状態と反応式の量を指定し、係数倍・反転をΔHにも適用。
結合エネルギーは気相平均値による概算。H–H=436、Cl–Cl=243、H–Cl=432 kJ/mol、例題結果は約−185 kJ。
電極電位は両極とも還元方向の値。電子数をそろえても電位を係数倍しない。
F=9.65×10⁴ C/molは既存受験教材と一致する近似値。問題指定値を優先。電気分解例は電流効率100%。

確認資料：

- [OpenStax エンタルピー・ヘスの法則](https://openstax.org/books/chemistry-2e/pages/5-3-enthalpy)
- [OpenStax 結合エネルギー](https://openstax.org/books/chemistry-2e/pages/7-5-strengths-of-ionic-and-covalent-bonds)

## 印刷・オフライン

公式一覧は6分類ごとのA4、個別解説は1枚。図解の追加公式は2レコードずつ別シートに配置し、既存図を縮めない。
式・例題は同じ出題状態を印刷に反映。従来の図解の印刷代表状態を維持。
新規公式まとめと熱化学を必須プリキャッシュに追加。すべて内部データ・SVG・ローカル計算で動き、外部APIは使わない。

## 次の拡張候補

浸透圧・凝固点降下・蒸気圧降下、Kspの定量計算、水和物析出の収支例題、熱量q=mcΔT、実在気体補正。今回は既存教材への導線を残し、これらの新規計算教材は増やしていない。

## 検証結果

- `npm run lint`：成功。
- `npm run typecheck`：成功。
- 全`scripts/test-*.mjs`をNodeで実行：163件成功。新規7件と熱化学を含む既存拡張テストを含む。
- `npm run build`：成功。PWA保存対象44ページ・44資産。新規2ルートは静的生成。
- `npm run test:pwa:browser`：Chrome／Edge、全62件成功。既存認証・学習保存・更新処理・導線も回帰検証。
- 最終の見出し・代表値・単位表記・電池反応の調整後、`theory-formulas.spec.ts`と`inorganic-illustrated.spec.ts`を両ブラウザーで再実行：4件成功。
- 学習地図は5分類・3入口。390pxでページ全体の横はみ出しなし。表は内部スクロール。
- 公式右辺と計算過程・答えをまとまりでマスクし、解答表示で復元。両ブラウザーのオフライン直接遷移・再読込でも確認。
- 公式一覧6ページ、個別解説1ページ、熱化学4ページ、電気化学の追加シートを含め、PDFページ数が表示シート数に一致。意図しないページ分割なし。
- A4 PDFを画像化し、全6分類のまとめ、穴埋め、公式の詳細、熱化学の2図、Q→電子→Cu→質量と半反応の加算を目視確認。グラフ・既存図解の印刷は回帰テストで確認。
- `git diff --check`：差分エラーなし。

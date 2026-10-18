# 有機図解教材 Phase D

## ページと構成

- `/illustrated/polymers`：15種。二重結合の付加、PET・ナイロン66の縮合、熱硬化性樹脂の網目、開環重合、天然・合成ゴム。図5セクション、比較表3セクション、補足。
- `/illustrated/carbohydrates`：単糖・二糖・多糖各3種。分類、D系列Fischer投影、二糖の加水分解、多糖の形状、比較表、補足。
- 入口は有機反応単元の「図で理解する有機化学」。既存の系統分離へのリンクはそのまま。

## データとSVG

主な追加・変更ファイル：

- データ：`src/data/illustrated/{types,structures,polymers,carbohydrates}.ts`
- ページ：`src/app/illustrated/[slug]/page.tsx`
- 描画：`src/components/illustrated/{ChemicalStructure,PolymerDiagrams,CarbohydrateDiagrams,DiagramParts}.tsx`
- 画面・表・導線：同ディレクトリの`IllustratedLesson.tsx`、`LessonTables.tsx`、`LessonField.tsx`、`IllustratedLessonLinks.tsx`、`illustrated.css`
- 問題生成：`src/lib/illustratedExercise.ts`
- 既存部品：`src/components/separation/ExerciseField.tsx`（表示契約のみ共用化）
- 既存導線：`src/app/units/[slug]/page.tsx`
- オフライン：`scripts/generate-service-worker.mjs`、生成確認用`docs/verification/phase3-precache.json`
- 検証：`scripts/test-illustrated.mjs`、`tests/pwa/illustrated.spec.ts`

`src/data/illustrated/`で内容を管理する。`MolecularDrawing`は原子／縮合基、結合次数、座標、繰り返し括弧を保持し、ReactはそれをSVGへ変換する。芳香環もSVGの結合で描く。

糖のD系列Fischer投影はカルボニル位置とOHの左右をデータ化。糖単位の丸、架橋、らせん、分岐は模式図であり、立体配置・環員数・実際の鎖長を示す構造式とは区別する。天然ゴムの式は結合順のみを示し、cis配置は本文で説明する。

## 穴埋め

`AnswerField`は安定ID、本文、`blankCategory`、`blankable`を持つ。同じ項目は図・表で同じIDと番号を使う。カテゴリは高分子の原料／名称／重合形式、糖の名称／構成／還元性／加水分解。カテゴリ名の配列を選択して生成し、化学名の文字列検索には依存しない。

構造式は名前を答えるヒントとして残す。構成単糖と加水分解生成物は関連ヒントになるため連動して隠す。還元性の問題では陽性／陰性の説明も伏せ、補足は解答表示まで隠す。

既存の`ExerciseText`、`SvgBlank`、`HtmlExerciseField`に、`blankIds`と解答表示状態だけを必要とする`BlankView`を追加して共用した。系統分離の化学データモデル・座標・問題生成方式は変更していない。新教材を無理に`Diagram`や系統分離の出題カテゴリへ変換していない。

## 印刷とオフライン

各`Sheet`をA4縦1ページとして印刷する。拡大状態を解除する印刷CSSを持ち、比較表も紙幅へ収める。学習表示は高分子9ページ・糖7ページ。問題表示は補足を除き、高分子8ページ・糖6ページ。画面と印刷で同じSVG・問題IDを用いる。印刷専用データの複製はしない。

両ページは静的生成され、ビルド時にPWA必須経路として検証する。描画・問題生成・解答はローカルで完結し、外部画像・API・フォントを要求しない。確認資料のリンクを開くときのみ外部通信を行う。成績・IndexedDB・Supabaseの保存処理は追加していない。

## 検証

- `node --test scripts/test-illustrated.mjs`：化学関係、構造グラフ、Fischer配置、カテゴリ・連動マスク。
- `npx playwright test tests/pwa/illustrated.spec.ts`：Chrome／Edgeの画面、解答切替、スマホ、A4寸法・ページ数、オフライン直開き・再読込。
- 既存の系統分離2種のブラウザーテストも実行する。
- 印刷PDFを画像へ変換して図・表・問題の見切れを確認する。

ランダム問題、解答入力・採点、成績保存、環状糖の詳細なHaworth投影は今回の対象外。今後は立体配置表示、ビニロン・タンパク質・油脂などへデータと専用図を拡張できる。

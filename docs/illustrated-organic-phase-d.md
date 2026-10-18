# 有機図解教材 Phase D

## ページと構成

- `/illustrated/polymers`：15種。二重結合の付加、PET・ナイロン66の縮合、熱硬化性樹脂の網目、開環重合、天然・合成ゴム。図5セクション、比較表3セクション、補足。
- `/illustrated/carbohydrates`：単糖・二糖・多糖各3種。分類、環状構造の横並び比較、補助のD系列Fischer投影、二糖の加水分解、多糖の形状、比較表、補足。
- 入口は有機反応単元の「図で理解する有機化学」。既存の系統分離へのリンクはそのまま。

## データとSVG

主な追加・変更ファイル：

- データ：`src/data/illustrated/{types,structures,polymers,carbohydrates,sugarRings}.ts`
- ページ：`src/app/illustrated/[slug]/page.tsx`
- 描画：`src/components/illustrated/{ChemicalStructure,PolymerDiagrams,CarbohydrateDiagrams,SugarRingStructure,DiagramParts}.tsx`
- 画面・表・導線：同ディレクトリの`IllustratedLesson.tsx`、`LessonTables.tsx`、`LessonField.tsx`、`IllustratedLessonLinks.tsx`、`illustrated.css`
- 問題生成：`src/lib/illustratedExercise.ts`
- 既存部品：`src/components/separation/ExerciseField.tsx`（表示契約のみ共用化）
- 既存導線：`src/app/units/[slug]/page.tsx`
- オフライン：`scripts/generate-service-worker.mjs`、生成確認用`docs/verification/phase3-precache.json`
- 検証：`scripts/test-illustrated.mjs`、`tests/pwa/illustrated.spec.ts`

`src/data/illustrated/`で内容を管理する。`MolecularDrawing`は原子／縮合基、結合次数、座標、繰り返し括弧を保持し、ReactはそれをSVGへ変換する。芳香環もSVGの結合で描く。

糖の主表示はHaworth投影。グルコース・ガラクトースはα-D体の六員環でそろえ、C4のOH配置を比較する。フルクトースはβ-D体の五員環を基本とし、六員環にも切替可能。環原子、環外基、上下方向、炭素番号、アノマー位置、強調対象の安定IDをデータ化している。フルクトースを五炭糖と誤解しないよう、全炭素数6と環員数を区別する。

`StructureDisplayOptions`の`highlightedAtoms`／`highlightedGroups`、炭素番号・差異強調の切替は、他分野の差分表示にも使える表示語彙。OHは色に加えて枠と太線で強調し、白黒印刷でも識別できる。

Fischer投影は補助図として表示切替でき、カルボニル位置とOHの左右もデータで保持。二糖などの小環は対応する単糖の代表的環骨格の記号であり、完全な二糖構造式ではない。架橋、らせん、分岐は模式図。天然ゴムの式は結合順のみを示し、cis配置は本文で説明する。

## 穴埋め

`AnswerField`は安定ID、本文、`blankCategory`、`blankable`を持つ。同じ項目は図・表で同じIDと番号を使う。カテゴリは高分子の原料／名称／重合形式、糖の名称／構成／還元性／加水分解、鎖状形の分類／OH配置／構造ラベル／アノマー位置。カテゴリ名の配列を選択して生成し、化学名の文字列検索には依存しない。

構造式は名前を答えるヒントとして残す。構成単糖と加水分解生成物は関連ヒントになるため連動して隠す。還元性の問題では陽性／陰性の説明も伏せ、補足は解答表示まで隠す。

単糖の既存`composition`のIDは維持し、内容をアルド／ケトヘキソースの分類として扱う。構造ラベルの問題では、そのOHを直接書いた配置メモも伏せる。配置問題は環状構造を手掛かりに句単位で答える。フルクトースの両環状形で、C2のOHの回答IDとβ配置を共用する。

既存の`ExerciseText`、`SvgBlank`、`HtmlExerciseField`に、`blankIds`と解答表示状態だけを必要とする`BlankView`を追加して共用した。系統分離の化学データモデル・座標・問題生成方式は変更していない。新教材を無理に`Diagram`や系統分離の出題カテゴリへ変換していない。

## 印刷とオフライン

各`Sheet`をA4縦1ページとして印刷する。拡大状態を解除する印刷CSSを持ち、比較表も紙幅へ収める。学習表示は高分子9ページ・糖7ページ。問題表示は補足を除き、高分子8ページ・糖6ページ。画面と印刷で同じSVG・問題IDを用いる。印刷専用データの複製はしない。

両ページは静的生成され、ビルド時にPWA必須経路として検証する。描画・問題生成・解答はローカルで完結し、外部画像・API・フォントを要求しない。確認資料のリンクを開くときのみ外部通信を行う。成績・IndexedDB・Supabaseの保存処理は追加していない。

## 検証

- `node --test scripts/test-illustrated.mjs`：化学関係、構造グラフ、Fischer配置、カテゴリ・連動マスク。
- `npx playwright test tests/pwa/illustrated.spec.ts`：Chrome／Edgeの画面、解答切替、スマホ、A4寸法・ページ数、オフライン直開き・再読込。
- 既存の系統分離2種のブラウザーテストも実行する。
- 印刷PDFを画像へ変換して図・表・問題の見切れを確認する。

ランダム問題、解答入力・採点、成績保存は今回の対象外。今後はα／β切替、いす形配座、完全な二糖のグリコシド結合、ビニロン・タンパク質・油脂などへデータと専用図を拡張できる。

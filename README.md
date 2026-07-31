# Chemica

高校化学の暗記・確認テスト用に作った、Next.js + TypeScript の学習サイトです。

## 現在入っている単元

- 有機化学の反応系統
- 無機化学の反応整理
- 電池と電気分解
- イオン・物質の色と確認反応
- 工業的製法
- イオン反応式

各単元には、学習資料、5問または最大10問のテスト、解説、ブラウザ内の進捗保存があります。

## 1. 必要なもの

- Windows 10 / 11
- Node.js 20.9 以上
- Visual Studio Code
- インターネット接続（最初の `npm install` のみ）

## 2. 起動方法

PowerShellを開き、このフォルダへ移動します。

```powershell
cd "C:\このフォルダを置いた場所\chemistry-study-app"
```

初回だけ依存パッケージを入れます。

```powershell
npm install
```

開発用サーバーを起動します。

```powershell
npm run dev
```

ブラウザで次を開きます。

```text
http://localhost:3000
```

終了するときは、PowerShellで `Ctrl + C` を押します。

## 3. 教材データを編集する場所

すべての教材と問題は、次のファイルにまとめています。

```text
src/data/chemistry.ts
```

### 問題を1問追加する例

追加したい単元の `questions: []` の中に、次の形式で追加します。

```ts
{
  id: "color-7",
  prompt: "硫化銅(II)の沈殿の色はどれですか。",
  choices: ["白色", "黒色", "黄色", "赤褐色"],
  answerIndex: 1,
  explanation: "CuSは黒色沈殿です。",
  tags: ["沈殿", "硫化物"],
},
```

`answerIndex` は0から数えます。

- 0 = 1番目
- 1 = 2番目
- 2 = 3番目
- 3 = 4番目

### 表に1行追加する例

`kind: "table"` の `rows: []` に1行追加します。

```ts
["Co²⁺", "赤色", "条件や錯体により変化"],
```

列数は、その表の `columns` の数とそろえてください。

### 系統図を追加する例

`kind: "flow"` の `flows: []` に追加します。

```ts
{
  title: "メタンからクロロメタン",
  nodes: ["CH₄", "CH₃Cl", "CH₂Cl₂", "CHCl₃", "CCl₄"],
  note: "光を当てた塩素との置換反応です。",
},
```

## 4. 新しい単元を追加する方法

`src/data/chemistry.ts` の `chemistryUnits` 配列に、既存単元を参考にして次の構造を追加します。

```ts
{
  slug: "chemical-equilibrium",
  title: "化学平衡",
  shortTitle: "化学平衡",
  icon: "⚖️",
  summary: "平衡移動と平衡定数を整理します。",
  level: "高校化学",
  keywords: ["平衡", "ルシャトリエ", "平衡定数"],
  sections: [
    // 表、カード、系統図
  ],
  questions: [
    // 四択問題
  ],
},
```

このデータを追加するだけで、トップページ、単元ページ、テスト選択画面に自動表示されます。

## 5. 本番用の動作確認

```powershell
npm run build
npm run start
```

エラーが出なければ、公開用ビルドも成功しています。

## 6. Vercelで公開する流れ

1. GitHubで新しいリポジトリを作る
2. このプロジェクトをGitHubへpushする
3. Vercelにログインする
4. `Add New Project` を押す
5. GitHubのリポジトリを選ぶ
6. Framework PresetがNext.jsになっていることを確認する
7. `Deploy` を押す

公開後は、GitHubへ変更をpushするたびにVercel側も自動更新できます。

## 7. 現在の保存方式

学習記録は `localStorage` に保存しています。そのため、同じブラウザ・同じ端末では残りますが、別の端末には共有されません。

生徒ごとのログイン、塾全体の成績確認、教師画面を付ける段階では、Supabaseなどのデータベースを追加します。

## 8. 今後追加しやすい機能

- 生徒アカウントと講師アカウント
- クラス別の課題配信
- 記述式・穴埋め式問題
- 苦手問題だけの再テスト
- CSVからの問題一括登録
- 画像付き反応系統図
- 制限時間付き小テスト
- 単元ごとの正答率グラフ
- スマートフォン向けPWA化

## 注意

教材データは動作確認用の初期例です。実際の授業で使う前に、採用教科書、学校の進度、入試範囲、表記方針に合わせて内容を確認してください。

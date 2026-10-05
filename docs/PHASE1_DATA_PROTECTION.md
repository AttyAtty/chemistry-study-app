# Chemica Phase 1: 学習データ保護

調査・実装日: 2026-10-05。対象: chemistry-study-app (Chemica 0.2.0)、変更前HEAD d2f688a。
ブラウザの実ユーザーデータは読み取り・変更していない。Supabase、認証、同期、IndexedDB、Service Workerは追加していない。

## 既存key・型・更新・削除

| key | 型 / ID | 更新 | Phase 1の削除 |
|---|---|---|---|
| chemica-flashcard-progress-v1 | Record<card.id, FlashcardProgressEntry> | 「覚えた」「まだ」判定が保存に成功したとき | なし |
| chemistry-question-history-v1 | Record<unitSlug::questionId, QuestionHistoryItem> | 選択肢の回答が保存に成功したとき | なし |
| chemistry-study-progress-v1 | Record<unitSlug, UnitProgress>。総合はall | 最終問題の結果表示操作が保存に成功したとき | なし |

FlashcardProgressEntry: status: known/review、lastReviewedAt: string、
optional reviewStep: number(-1..3)、nextReviewAt: string、lastResult: remembered/forgot、
rememberedCount/forgotCount: number。
旧形式のstatus/lastReviewedAtのみの記録も、そのまま読み込む。

QuestionHistoryItem: attemptCount/correctCount/incorrectCount: number、
lastAnsweredAt: string、needsReview: boolean。
UnitProgress: attempts/correct/total/bestPercent: number、lastStudied: string。
日付は通常ISO文字列。既存実装で使われる空文字も許容。カウンタは非負の安全な整数。

stageはreviewStep、間隔は1/3/7/14日。忘れたときは-1。
問題のneedsReviewは最後の不正解でtrue、最後の正解でfalse。
未挑戦は履歴なし/attemptCount=0。新しいカードはエントリなし。
今日の復習・弱点単元・学習記録の表示はこれらから計算し、独立したkeyには保存しない。
受験ごと・回答ごとの明細は既存形式にはない。
各レコードの未知フィールド・未知IDは保持する。IDを教材の現在リストに限定しない。

変更前の読み取りはJSON例外を{}扱い、問題/カードではフィールド再構築により未知項目を落としていた。
保存例外は未処理。集計resetはremoveItemを使用していた。
今回、IOをlearningStorage.tsに集中し、reset APIとUIを停止した。
feedback API等のJSON処理は学習ストレージと無関係なので変更しない。

## バックアップ

JSON外側:
- format: chemica-learning-backup
- schemaVersion: 1
- exportedAt: ISO文字列
- appVersion: package.json由来
- data: 既存3keyをすべて含む、値は元のJSON文字列またはnull(未存在)

既存keyの形式は変更しない。backupのdataはパース済みオブジェクトではなく原文文字列。
未知フィールド、教材から消えたID、空白、壊れたJSONもそのまま退避できる。
破損データを含むバックアップは保全用として出力できるが、安全な自動復元の検証には通らない。
手動エクスポートはlocalStorageに書き込まない。

## 復元とrollback

1. 外側JSON、format、schemaVersion、日時、appVersion、3keyの存在・型を検証。
2. 各key内部のJSONと全エントリの型を検証。不正なら書き込みゼロで中止。
3. 全項目が空のbackupは拒否。一部がnull/{}なら、その項目の現在値を保持する。
4. 現在の全原文をユニークな自動退避keyへ保存し、読み返して照合。失敗したら中止。
5. 復元内容を表示し、ユーザーの確認操作を待つ。この時点では学習keyは変わらない。
6. 確認中に現在データが変わった場合は再選択を要求。
7. durableなpending journalを保存・照合してから、対象keyへ反映。
8. 全keyを照合した後にcommittedを記録。成功後だけ復元完了と表示。
9. 途中失敗は原文へrollback。rollback失敗やタブ終了ではpendingを残す。
10. pending中、新版アプリの読み取りは退避した元データを表示し、通常保存・次の復元を停止。
11. 設定画面から「中断した復元を元に戻す」で再試行。元データのファイル出力も可能。

追加key:
- chemica-storage-backup-v1:<UUID>: 復元前の全原文バックアップ。上書き・自動削除なし。
- chemica-storage-restore-journal-v1: schemaVersion=1、状態、退避key、復元対象原文。
  新しい復元でjournalを更新するが、過去の退避keyは残す。
  キャンセルした復元の退避データも保持する。

rollbackでは既存keyを削除しない。復元前に存在せず、その復元が新規作成したkeyだけをremoveItemで元の未存在状態へ戻す。
他タブ由来の値を検知した場合は、その値を上書きせず復旧を保留する。

localStorageには複数keyのトランザクションがない。
pending/commitの管理で新版アプリへ途中状態を公開せず、原文を耐久退避して回復可能にする。
旧版の開きっぱなしタブや他のコード・DevToolsはこのjournalを認識しない。
復元時は他タブを閉じる。Web Locks等による完全な同時タブ排他はPhase 1では実装していない。
容量不足がrollbackも妨げる場合、原文退避は残るが、全keyの物理的回復がすぐ完了するとは保証できない。
退避ファイルをダウンロードし、空き容量/保存制限を解決して復旧する。
端末故障・ブラウザの消去に対する永久保存保証はないため、端末外のJSONファイルが重要。

## 保存・読み取り保護

正常な旧データは原形で読み、更新対象以外のID・未知項目を残して保存。
読み取りエラー/壊れたJSON/不正エントリを検出したら原文を変更せず、表示用fallbackを返す。
一部エントリのみ不正なら表示は正常な部分だけを使用するが、保存はkey全体で拒否。
保存時にも再読込・全体検証するため、fallbackが元データへ書き戻されない。
null/undefined、空データ、既存ID削除、NaN/Infinity、循環参照、シリアライズ不能値、型不正を拒否。
JSON.stringifyとsetItemの例外を捕捉し、初期化やデフォルト値の保存はしない。
容量超過・保存領域のアクセス制限はエラー表示する。
保存失敗時、暗記カードは進めず、テストは回答確定/結果完了にしないため再試行できる。
通常保存は書き込み直前に原文一致を確認するが、異なるタブの同時保存を完全には排他しない。

## stable ID調査とPhase 2

今回、教材データと既存IDは一切変更していない。
verification/phase1-id-baseline.jsonに現時点のunit、問題ID/履歴key/問題文/指紋、
カードID/表裏/指紋、有機反応IDと対応内容を記録。
これは教材データの資料であり、実ユーザーの学習記録は含まない。
再生成すると基準資料が変わるため、Phase 2で教材を変更する前の版を保持する。

| 対象 | 生成方式・箇所 | リスク / Phase 2 |
|---|---|---|
| unit | chemistry.ts等の明示slug、総合all、chemistry-basic-comprehensive | slug改名時は集計keyと問題履歴keyのaliasが必要 |
| セクションカード | flashcards.ts: unit.slug-section.id-card-index | 途中挿入/並べ替えで別教材の進捗に対応。現行IDを固定、対応表が必要 |
| 表カード/逆向き | flashcards.ts: unit.slug-section.id-row-index[-reverse] | 行順・列内容の変更、逆向き生成条件変更に注意。同上 |
| flowカード | flashcards.ts: unit.slug-section.id-flow-index | 並べ替えでID変更。同上 |
| 化学基礎問題 | chemistry-basic/helpers.ts: prefix-index-a/b/c | facts挿入/順序変更で問題履歴がずれる。ID/content対応を固定 |
| 明示問題 | chemistry.ts、coverageExpansionQuestions.ts、questions-comprehensive.ts等 | org-1等は順序変更に耐えるがID再利用は不可。内容置換時の履歴扱い要検討 |
| 問題由来カード | unit.slug-question-question.id | 元問題ID/slugに依存。生成上限や重複除外で非表示化し得る |
| 気体カード | gas-gas.id-formula/identity/color/collection/preparation/detection | 明示gas.idに依存。ID改名時alias |
| 電池カード | ec-card.id-anode/cathode/overall/flow | 明示教材IDに依存。ID改名時alias |
| 酸化還元 | flash-item.id / quiz-item.id | redoxProductPredictionsの明示IDに依存 |
| 無機カード | inorganic-network-id | 明示行IDに依存。表から生成する別カードはindexのリスクあり |
| 有機compound | 優先固定IDまたはname/formulaのhash (organicReactionMaps.ts) | 名称・化学式編集でhash変化。対応表が必要 |
| 有機reaction | sourceId/targetId/label/conditionの32bit hash | 表記・条件編集でID変化。hash衝突の監査も必要 |
| 有機問題/カード | organic-reaction.id | 上記hash変化を引き継ぐ。絞り込み・sliceにより教材から外れる場合あり |
| Reaction Map | map/sectionの明示ID。path.stepsは位置でsource/targetを対応 | map操作状態は現在未保存。将来保存するなら別途ID設計 |
| 印刷用memory候補 | memoryQuizCandidates.ts: flash-card.id-field-index等 | フィールド順変更でID変更。現状は学習履歴に保存していない |

Phase 2はこの対応表とバックアップを入口に、強制削除なしのコピーmigrationを設計する。
教材から消えたIDを孤立レコードとして保持する。schemaVersionが未知なら書き換えず中止。
旧累積履歴だけでは端末間の重複判定はできない。合算方針・認証前データ所属は別途決定。
自動退避keyが増えるため容量監視・ユーザー主導の管理もPhase 2以降で検討する。

## UIと確認

/settings/dataを追加。「その他」、学習記録の集計欄、footerからアクセス。
グローバルの保存エラー通知を追加。既存Bottom Navigationの項目数・教材/Reaction Map/PWA manifestは維持。
禁止された削除を防ぐため、既存の集計リセットだけ停止した。

実行確認:
- npm run test:storage: 初回30件成功。
- npm run lint: 成功。
- npx tsc --noEmit --incremental false: 成功。
- npm run build: 成功。新規/settings/dataを含む27ページ生成。
- ブラウザUI/スマートフォン実機: ブラウザ接続がなく未実施。DOM操作・ファイル選択・ダウンロード・confirmの実機QAは別途必要。
本番利用者の実データ/本番環境は未検証。テストは隔離したメモリストレージのfixtureで実行。

最終確認の追記:
- ID基準資料: 13単元（化学基礎総合を含む）、744問題、763カード、166有機反応。カードID重複なし。
- ビルド済みサーバーへのHTTP確認: /home、/progress、/flashcards/review?flashcards=due、
  /quiz?unit=all&count=10、/units/organic-reactions、/settings/data、manifest、192/512アイコンの9件すべて200。
- 設定ページのファイル入力とJSON指定、manifestのstandalone/start_url、HTMLに置換文字がないことを確認。
- HTTP確認はブラウザのhydrate、ダウンロード保存、confirm、スマートフォン幅での描画の実機確認を代替しない。

最終のデータ保護回帰テストは35件すべて成功。実教材を使った今日の復習・未挑戦・弱点単元の集計も確認。

ID基準資料には無機反応・無機物質・有機compound・Reaction MapのIDと内容指紋も含む。これらの明示IDも改名/再利用時はaliasや対応表が必要。

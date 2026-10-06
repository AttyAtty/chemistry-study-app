# Chemica Phase 2：固定ID・保存層・IndexedDBコピー
対象：C:/Web_App_Original/chemistry-study-app / Chemica 0.2.0。2026-10-05。
実ユーザーのブラウザ保存領域にはアクセスしていない。検証は隔離fixtureとfake-indexeddbを使用。

## Phase 1の引継ぎと保存方針
learningStorage.tsの検証・例外保護・旧形式読取・JSONバックアップ・復元journalを維持。
原文退避処理だけarchiveLearningSnapshotへ抽出し、復元とコピーの両方で再利用。
学習データ3keyの削除・初期化・IDの一括置換は行わない。

| localStorage key | 内容 / 型 | 更新 |
|---|---|---|
| chemica-flashcard-progress-v1 | Record<cardId, FlashcardProgressEntry>。status、lastReviewedAt、任意のreviewStep/nextReviewAt/lastResult/rememberedCount/forgotCount | カード判定の保存成功時 |
| chemistry-question-history-v1 | Record<unitSlug::questionId, QuestionHistoryItem>。attemptCount/correctCount/incorrectCount、lastAnsweredAt、needsReview | 回答の保存成功時 |
| chemistry-study-progress-v1 | Record<unitSlug, UnitProgress>。attempts/correct/total/bestPercent、lastStudied | テスト完了時 |
| chemica-storage-backup-v1:<UUID> | Phase 1形式の全3key原文バックアップ | 復元前、初回コピー前 |
| chemica-storage-restore-journal-v1 | schemaVersion=1、pending/committed/rolled-back、backupKey、target | Phase 1復元処理 |
| chemica-storage-copy-state-v2 | verified/failed、updatedAt、archiveKey、任意error | コピー結果。失敗記録自体が保存不可でも学習継続 |

既存3keyの中身は従来のJSON recordのまま。未知のID・フィールドを保持。
今日の復習、弱点単元、未挑戦は独立保存せず既存記録から計算する。

Phase 2は「検証済みコピーを追加する段階」。localStorageが同期的な確定保存元。
書込み：Repository → Phase 1保護付きlocalStorage → バックグラウンドIndexedDBコピー。
読取り：元データ保護確認 → 原文一致する検証済みIndexedDBキャッシュ → localStorage互換読取。
IndexedDBの完了待ちで回答やカード操作を止めない。独立した二つの正本は作らない。
IndexedDBを唯一の書込先へ切り替える作業は今回行っていない。

## ID調査 A〜F
全ID一覧はverification/phase2-id-classification.json、対応表はsrc/data/learningIdMigrationMap.ts。
分類は重複する。

| 分類 | 対象 | 今回 |
|---|---|---|
| A 明示ID | 気体・電池・無機network・redox・手書き問題等 | 維持。ID再利用禁止 |
| B 配列順依存 | 化学基礎facts問題、section/table/flowカード、問題由来カード | 問題315件、カード504件を固定IDへ対応 |
| C 表記hash依存 | 有機反応166件、一部compound、それを使う有機問題64件・カード | 維持。graph共有・重複排除・endpointを一緒に保護する別migrationが必要 |
| D slug依存 | 全13unit、unitSlug::questionId、section prefixを含むカード | slugとsection IDを維持。将来改名時alias必須 |
| E migration | Bの旧ID→新ID対応 | canonical viewとIndexedDBコピーに適用 |
| F 維持が安全 | A/C/D、表示専用Reaction Map、未保存memory quiz候補ID | 今回変更しない |

固定learningIdは教材ソースの各fact/card/flowへリテラルとして追加。
表行はlearningRow(id, cells)でIDを行に保持し、並び替え・挿入でも行と一緒に移動する。
IDを現在の文言から実行時に再生成しない。例：basic1-0-a → basic1-純物質-definition。
化学基礎の選択肢配置にはindexを使うが、問題IDには使わない。
既存の明示IDは変えない。unit/section/prefixの改名は別途aliasが必要。

prepare-phase2-source-ids.mjsは今回の一度限りのソース編集記録。
対応表が存在する状態では実行を拒否する。リリース後の対応表を再生成してはならない。
新教材の追加は固定IDを明示して行う。

## ID migrationとrollback
localStorageの旧IDレコードを直接書き換えず、Repositoryで新IDへ参照変換する。
新IDの回答でも既存の旧IDに紐付く記録を更新し、回数を継続する。
新旧が同値なら表示上は1件。異なる値なら合算・LWWはせずコピー/保存を停止し原文を保持。
未知IDもコピーする。過去教材の記録を現在教材リストでフィルタしない。
移行version=1、migrationId=stable-learning-ids-v2。IndexedDB metadataに完了記録を持つ。
同じ原文での再実行は検証済みコピーを再使用する。失敗後の再試行は同じ原文退避を再使用。

初回の非空コピー前に全3key原文をPhase 1 backup keyへ保存・読戻し検証。
Phase 1のpending/不正journalがあればコピーを開始しない。
ID変換はIndexedDBの単一transaction内で反映し、metadataのid-migrationを同時commitする。
Phase 1復元journalを別用途で上書きしない。
途中失敗はIndexedDB transactionをabortし、旧コピーを維持。localStorageは変更していないため旧IDへの書戻しは不要。
コピー前原文はPhase 1 JSON形式。必要なら既存の確認付き復元UIで復元できる。
復元は従来どおり原文退避・pending journal・rollback・再起動後の復旧を使う。

## 保存層
- Feature：flashcardProgress.ts / questionHistory.ts / progress.ts
- learningRepository.ts：新旧ID互換、表示用canonical view、旧IDを維持する更新
- learningStorage.ts：従来localStorage adapter、型検証、backup/restore、変更通知
- indexedDbLearningStorage.ts：DB adapter、コピー、全項目検証、atomic commit
- learningStorageRuntime.ts：起動、更新通知、再試行、キャッシュ、他タブstorageイベント
- LearningStorageRuntime.tsx：layoutで起動
- StorageBackendStatus.tsx：/settings/dataの状態と再検証ボタン

通常保存、復元成功、rollback/復旧の変更通知から自動再コピーする。
キャッシュは3key原文が現在localStorageと完全一致する場合のみ利用。
キャッシュから返す値はcloneし、画面側の変更でキャッシュが壊れないようにする。

## IndexedDB schemaとコピー
DB名：chemica-learning。DB構造version：1。data schemaVersion：2。
4store：flashcardProgress、questionHistory、studyProgress、metadata。すべてkeyPath=id。
各データ行：id / value（従来entryを未知fieldごと保持）/ schemaVersion /
createdAt / updatedAt / dirty=true / legacyIds。
metadata：
- current：verified、source全3key原文、counts、archiveKey、schemaVersion、
  idMigrationVersion、createdAt/updatedAt/migratedAt、restoreToken
- original-id-snapshot：初回の原文と退避key
- id-migration：version、verified、退避key、migratedAt

dirtyは将来の変更識別用。同期キュー・通信・lastSyncedAt・ユーザーIDはない。
日時はこの端末の時計。クラウド競合解決用の確定順序にはまだ使えない。
DB version=store構造、data schemaVersion=record envelope、ID migration version=alias対応。
Phase 1バックアップschemaVersion=1は変更しない。

コピー手順：
1. 復元journal確認、原文取得、Phase 1型検証、新旧ID競合検出。
2. 既存DBのmetadata/全行を検証。不正DBを自動初期化しない。
3. 初回原文退避。退避が保存不可ならコピー中止。
4. 過去DBにあるIDの欠落・累積回数の減少を検出したら自動上書き停止。
   Phase 1の確認済み復元による新しいrestoreTokenの場合のみ置換を許可。
5. 4store単一transactionでコピー。旧mirrorのclearはtransaction内のみ。
   localStorage.clear/deleteは行わない。
6. 読戻しで件数、全ID、全entry JSON、未知fieldまで照合する。
   attempt/needsReview/reviewStep/nextReviewAt/lastReviewedAt/correct/incorrect/
   lastStudiedも全entry比較に含む。
7. コピー中に原文/復元tokenが変化したらabort。検証後のみmetadataをcommit。
8. transaction後も検証し、原文一致を確認してキャッシュを公開。
9. 失敗状態をbest effortで記録。localStorageで継続。設定で再試行可能。

IndexedDB未対応・open拒否・quota・transaction中断・同期put例外でもlocalStorageの学習を継続。
壊れたIndexedDBは保存したままfallback。自動削除して再構築はしない。
DBだけに記録が残る状態は自動上書きを止める。現段階の画面/backupはlocalStorage基準であり、
DBだけの履歴を自動復旧する独立した画面は未実装。Phase 3以降で別途回復手順を設ける。

## backup / restore / UI
Phase 1 JSON形式・schemaVersion=1・原文3keyを維持。
旧IDと新IDのどちらを含むバックアップもPhase 1の型検証を通り、新版Repositoryで参照できる。
不正ファイルでDBに書き込まない。復元成功後は自動再コピーし、古いキャッシュを採用しない。
/settings/dataに保存基盤の状態・コピー再検証ボタンのみ追加。
Bottom Navigation、Reaction Map、manifest、教材表示・テスト操作の構成は維持。
ログイン不要。この端末内の保存のまま。Supabase/Auth/cloud/Service Workerは追加していない。

## 複数タブとPhase 3前の注意
storageイベントでキャッシュを無効化し再コピー。コピー中の別タブ更新は原文照合で検出しabort。
IndexedDB更新は単一transactionで排他される。
ただし同期localStorageの「読取→比較→書込」はタブ間の完全atomic操作ではない。
複数タブが同じ学習keyへ極小の時間差で回答する競合を完全には排除していない。
復元中は引き続き他タブを閉じる。完全排他は非同期Repository化とWeb Locks等を別途検討する。

次段階で必要な作業：
- 実ブラウザ/スマートフォン/PWAインストール実機でのQA
- 有機hash IDの固定化とgraph全体を対象にした追加alias migration
- slug/section改名時のaliasとID再利用防止
- IndexedDBの唯一の書込先への切替・DBのみのデータ回復を別設計
- async保存、タブ競合、バックアップ容量管理、Safari等のquota/保存制限の確認
- Phase 3のService Worker/cacheは次回。現時点ではオフライン起動を保証しない

## 最終検証結果
2026-10-05、最終ソースで確認。
- npm run test:storage：35/35成功（Phase 1全テスト）。
- npm run test:storage:phase2：25/25成功。
- npm run lint：成功、warningなし。
- npx tsc --noEmit --incremental false：成功。最終npm run buildの型検査も成功。
- npm run audit:chemistry：成功。organic=166、inorganic=103、redox=20、gases=14、electrochemistry=16。
- npm run audit:learning-ids：成功。13unit、744問、763カード。ID重複なし。
  新旧対応は315問・504カード。問題/カード内容fingerprintと件数がPhase 1と一致。
  有機/無機反応、物質、compound、38map参照も一致。
  Phase 1 baselineを更新せずphase2-id-baseline.jsonへ出力。
- git diff --exit-code -- docs/verification/phase1-id-baseline.json public/site.webmanifest：成功。
- git diff --check：成功。
- npm run build：成功。27ページ生成。

Phase 2の25テスト対象（scripts/test-phase2-storage.mjs）：
1. 初回コピーの原文/旧ID/全field/件数保持。
2. localStorage/IndexedDB空。
3. 再実行、保存領域を保ったmodule再起動。
4. ID対応のidempotencyと新旧重複排除。
5. 新IDで回答して既存旧IDの回数・未知fieldを継続。
6. 新旧ID競合時の保存/コピー停止と原文保持。
7. IndexedDB open拒否・利用不可のfallback。
8. 更新コピー途中のtransaction abort、旧DB保持、再試行。
9. 初回コピー中断ではmigration完了記録を作らない。
10. 壊れたlocalStorageの保持と既存DB保護。
11. 壊れたIndexedDBの保持と読取fallback。
12. backup v1と旧ID保持、正常restore後のcanonicalコピー。
13. 不正JSON復元で両保存領域が変わらない。
14. ID欠落/回数減少時のDB上書き防止。
15. 原文退避のquota失敗時にコピー開始しない。
16. 他タブ更新の割込み検出と古いコピーのabort。
17. 同時初回コピーの整合性。
18. 復習予定/未挑戦/needsReview/学習集計の維持。
19. 旧ID APIで回答しても回数が初期化されない。
20. Phase 1 pending journalによるコピー停止と復旧。
21. runtimeの保存/復元/storage event連動、古いキャッシュ排除。
22. 実教材の旧ID履歴から弱点単元/今日の復習/未挑戦を集計。
23. コピー失敗後の原文退避key再利用。
24. put同期例外でもtransaction全体abort、旧DB保持。
25. 未知field/metadata件数の破損を検出。

Phase 1全35件：旧形式/無データ/破損JSON、backup、各種不正復元、
schema不一致/欠損key/型不正、stringify/setItem/quota/private制限、
復元途中/commit/rollback失敗、再起動復旧、未知ID/field保持、実教材集計を再確認。

最終本番サーバーにHTTPアクセスし、以下10URLはすべて200：
/home、/progress、/flashcards/review?flashcards=due、
/quiz?unit=all&count=10、/units/organic-reactions、
/units/chemistry-basic-composition、/settings/data、/site.webmanifest、
/icons/icon-192.png、/icons/icon-512.png。
設定HTMLのbackup file input/JSON MIME/保存基盤表示、manifestのstandalone/start_urlも確認。

実ブラウザ接続先がないため、hydrate後の操作・JSONダウンロード・file picker/confirm、
PC/スマートフォンの視覚的レスポンシブ、実際の複数タブ、インストールPWA再起動は未確認。
再起動/複数タブテストはfixtureであり、実機試験の代替ではない。
本番ユーザーの既存データと端末保存制限の実測は未実施。

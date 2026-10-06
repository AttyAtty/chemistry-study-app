# Phase 3: オフライン起動・学習

## 実装と調査

調査対象は C:/Web_App_Original/chemistry-study-app。Next.js 16.2.10 / App Router / React 19.2.4。
既存 site.webmanifest は start_url=/、scope=/、display=standalone。192/512px アイコン、Apple icon、favicon は変更していない。
既存 Service Worker、next-pwa、Serwist、Workbox はなかった。教材・問題・カード・関連知識は TypeScript のビルド内データ、Reaction Map はインライン SVG。基本表示は system font、外部フォントなし。
外部通信はお問い合わせ API、外部 QR 画像、Vercel Analytics など。これらをキャッシュ対象に含めない。

小規模な Cache Storage 専用 custom Service Worker を採用。ビルドが把握する静的ページ・バンドルを列挙し、Next の RSC と HTML を混在させず、学習保存層には触れない方式が現在の構成に適するため。
PWA ランタイムライブラリは追加していない。@playwright/test は検証用 devDependency のみ。

## 生成・登録

- npm run build の prebuild がビルドごとの UUID を src/lib/pwaBuild.ts に生成。
- Next generateBuildId と HTML meta chemica-build は同じ UUID。
- postbuild が .next の静的 HTML / static asset を調査し public/sw.js を生成。
- 完全な対象一覧: [phase3-precache.json](verification/phase3-precache.json)。今回 23 ページ、36 assets。
- public/sw.js と pwaBuild.ts は生成物として Git ignore。デプロイは npm run build を使うこと。next build 単独では postbuild を実行しない。
- 本番かつ HTTPS / secure localhost のみ登録。scope=/、updateViaCache=none。sw.js は no-store / no-cache。
- 開発モードでは新規登録しない。開発と本番検証に別ポートを使い、既存本番 worker の影響を避ける。

## キャッシュ分類・戦略

| 対象 | 戦略 |
| --- | --- |
| 静的 HTML 23 ページ | install 時 precache。通常 navigation は Network First、3秒 timeout、キャッシュ fallback |
| JS / CSS / hashed Next assets / local icon / manifest | precache + Cache First |
| 教材・検索・関連知識・Reaction Map | ビルド内 JS / inline SVG として保存 |
| runtime assets | 同一 origin の許可 assets / Next static のみ。上限80件 |
| Next RSC / Flight | Network Only。offline は非 RSC の503を返して Next の document navigation fallback を利用 |
| API / POST / 外部 origin / analytics / sw.js | intercept・cache しない |
| お問い合わせ画面 | dynamic のため precache しない。未保存 offline navigation は fallback |

install は4並列・各取得15秒 timeout。全ページの HTML build marker と成功 status を検証し、全件完了してから準備完了 marker を保存。失敗した新 worker は activate せず、その版の候補キャッシュのみ削除する。以前の版と学習データは保持する。
quiz/search はクエリを client で扱う静的 shell に変更した。任意の unit/count/mode/q を offline でも評価できる。問題選択・採点・教材 ID は変更していない。
オフラインの Link 遷移は RSC が取得できないため document navigation に切り替わることがある。進行中の未確定テストを離れる際は通常の画面遷移と同様に注意が必要。

## 利用範囲・fallback

ホーム、単元一覧、化学基礎、理論・無機・有機、全12 unit page、暗記カード、今日の復習、テスト、小テストメーカー、学習記録・弱点表示、Reaction Map、検索、関連知識、/settings/data が対象。
最初のオンライン起動で主要ページ全部を取得するため、各ページを一度ずつ開く必要はない。
「オフライン利用可能」表示後に接続を切ること。初回からネット接続がない場合、まだ取得していない asset、ブラウザのキャッシュ消去・容量による eviction には完全保証できない。

未保存 URL は /offline に fallback。「このページはまだオフライン保存されていません」とホーム・データ管理リンクを表示。
Cache Storage 全体が消えた場合も、worker が残っていれば JS/CSS 不要の inline HTML emergency fallback を返す。
お問い合わせ送信は offline で明示的に停止。通常送信も10秒 timeout。入力内容は維持する。外部 QR 画像は offline 時に取得せず、リンクコピーは利用できる。

## 更新・古い版の保護

キャッシュ名: chemica-pwa-v3:<build UUID>:precache / runtime。DB version や学習 schemaVersion と独立。
新 worker は install 完了後 waiting。自動 skipWaiting / 強制 reload を行わない。
「新しい版があります。学習を区切ってから」「再読み込み」でユーザーが切り替える。別タブの強制 reload は行わない。
新しい教材の HTML を旧版キャッシュへ上書きしない。marker 不一致のネットワーク応答はオンライン表示するが旧版保存はしない。
activate / startup / focus / online で cleanup。開いているタブにビルド版を問い合わせ、現在版と開いている旧版のキャッシュを保持。応答不明のタブがあれば削除を保留する。
旧タブを閉じた後の再確認で不要版を削除。対象は Chemica の prefix の Cache Storage のみ。他アプリのキャッシュも保持。

## 学習データ・オンライン復帰・バックアップ

Phase 1/2 の learningStorage / learningRepository / IndexedDB 構造・ID・schemaVersion を変更していない。
現在の Phase 2 は localStorage への安全な互換保存を先に行い、IndexedDB へ検証付きコピーする方式。確認済みコピーを読み、条件が合わなければ保護済み localStorage reader に fallback。
オフラインでも同じ Repository を使用。カード進捗、reviewStep / nextReviewAt、テスト履歴、attemptCount、needsReview、study progress、updatedAt / dirty が保存される。
Service Worker は IndexedDB / localStorage を一切操作しない。cache cleanup と学習データ削除は別処理。
online event で既存 IndexedDB コピー処理を再確認する。通信復帰で worker は通常の Network First に戻る。クラウド送信・dirty の同期済み化は行わない。

Phase 1 JSON backup / restore / journal はそのまま。復元後の既存通知で IndexedDB へ検証付き再コピー。offline でもファイル download / file input restore が動く。
/settings/data に「アプリキャッシュ」「学習データ」「JSON バックアップ」は別物である旨を追記。ブラウザのサイトデータ削除は学習データも消すため外部 JSON backup を事前に保存する必要がある。
保存容量不足やブラウザ側のサイトデータ削除までアプリ内で防ぐことはできない。バックアップは引き続き重要。

## UI

共通 layout の小さな status に「オフライン保存を準備中」「オフライン利用可能」「オフライン・端末内保存」を表示。準備失敗時はオンラインで再確認可能。
更新通知はユーザー操作時のみ reload。Bottom Navigation・レスポンシブ構造・教材 UI は維持。
お問い合わせと QR のみ通信不可時の説明を追加。

## 検証

本番 npm run build、lint、typecheck を実行。Phase 1 storage 35件、Phase 2 storage 25件、worker 単体14件を再実行。
教材 audit と ID audit: 13 units / 744 questions / 763 cards。315 question aliases / 504 card aliases、64 hash questions を保持。ID重複なし。Phase 1 baseline は変更なし。manifest / icons / Phase 1 storage / Phase 2 repository / IndexedDB コアも git diff で変更なしを確認。

Chrome / Edge の実ブラウザ headless 各4件、計8件:
1. 初回登録・準備完了、offline direct reload、home/course/unit/card/quiz/progress/map/settings/search、小テスト再生成、RSC fallback navigation、未保存ページfallback、mobile390px、manifest/icons、オンライン復帰。
2. offline カード・不正解テスト・needsReview / attempt / study / dirty metadata、reload、JSON backup / restore、IndexedDB 整合、persistent browser 完全終了・再起動、復帰後データ保持。
3. obsolete cache cleanup / unrelated cache 保持、キャッシュ全消去でも学習データ保持、emergency fallback、オンライン repair。
4. IndexedDB を SecurityError として利用不可にした場合も localStorage 保存・reload・offline 継続。

ブラウザ用プロファイルは実ユーザーのものを使わず .next/pwa-tests の短い専用パス。長いテスト出力パスをプロファイルに使うと Chrome の準備が完了しない現象があり、専用短パスで解消した。
worker 単体では新旧版 cleanup・旧タブ保護・明示 update・取得失敗・build mismatch・RSC/API分離・緊急 fallback を確認する。実デプロイの二版入れ替えは以下の手動確認対象。

## 手動確認が必要な項目

- install 済み Windows / iOS / Android PWA を offline で完全終了し、OS から再起動する。
- 実機 standalone の起動画面・icon・Bottom Navigation、端末の省電力・ストレージ制限。
- 本番 HTTPS / CDN が sw.js no-store / scope=/ を維持し、ビルド版と静的 assets を同時に配信する。
- 実デプロイの教材更新で旧タブを開いたまま新 worker の通知・任意切替・旧タブ終了後cleanupを確認。
- ブラウザに登録済みの拡張機能・実機 DevTools Offline を使った補助確認。自動テストでは browser context の Offline を使用した。

これらを自動テスト成功と混同しない。install 済み native PWA の OS 再起動は未検証。

## Phase 4 の注意

Supabase / Auth / user_id / cloud sync / Background Sync は未追加。
今後認証・ユーザー固有 SSR/API を導入する際は、本 precache の静的公開ページ前提を見直す。ユーザー固有レスポンスを現在の共有 page cache へ混ぜない。
学習 schema・ID migration・匿名データの扱いは Phase 1/2 の backup / journal / verified copy を継承する。
デプロイ時は npm run build の postbuild 成功を必須とし、UUID ごとの worker/HTML/assets 一致を確認する。

## 最終実行結果（2026-10-06）

npm run build: 成功（静的生成28件、offline precache23ページ / 36 assets）。lint / typecheck: 成功。Phase 1 35/35、Phase 2 25/25、Service Worker 14/14、Chrome・Edge browser 8/8 が成功。教材 audit / ID audit / git diff --check も成功。
ブラウザ版の offline 起動・終了後再起動・オンライン復帰・保存・復元を確認した。install 済み PWA の OS からの起動と実デプロイ更新は未検証であり、上記手動確認が必要。

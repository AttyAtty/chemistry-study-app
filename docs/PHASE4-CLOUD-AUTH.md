# Phase 4 後半：認証・ユーザー別クラウド保存

## 実装と本番設定の区別
コード・SQL migration・ローカルPostgreSQL RLS検証を実装済みです。本番DBへのmigration適用、Email OTPテンプレート/送信設定、実メールでの認証、本番2アカウントRLS検証は未確認です。これらが済むまでPhase 4の完了条件を満たした扱いにはしません。今回の変更は本番へデプロイしていません。

## 認証方式・構成
メールの確認コード（Email OTP）を採用しました。公開Auth設定ではEmail有効、Google無効を確認しています。Google OAuthや独自パスワードは追加していません。コード入力なら別端末のメールリンクで異なるブラウザへ移る問題を避けられ、PWAにも適しています。
- 共通client.tsにBrowser Auth clientと、送信時のユーザーJWTを固定したrequest clientを追加。既存health用clientはsession無効のままです。
- AuthはBrowserのみ。公開ページは従来通り静的生成し、SSRへ個人sessionを持ち込みません。認証SSRが不要なため@supabase/ssr、認証Cookie、middleware、OAuth callbackは追加していません。
- Browser clientはpersistSession/autoRefreshTokenを有効、URL callback検出は無効。session保存先は独立したchemica-supabase-auth-v1です。auth.getUserでオンライン時のidentityを検証します。オフラインのcached sessionは表示にのみ使用し、送信しません。
- NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYのみ。Secret/service_role/DB passwordは不使用。user_idはAuthのuser.idで、別のユーザーIDを作りません。メール以外の表示名/avatarを別DBへ保存しません。

## DB / RLS
supabase/migrations/202610080001_phase4_learning.sql を管理します。
| テーブル | 主キー・制約 | 内容 |
|---|---|---|
| flashcard_progress | user_id + card_id | 既存status、復習段階・日付・remembered/forgotCount |
| question_history | user_id + record_id、unique(user_id,unit_slug,question_id) | 既存回答回数・正誤・復習状態。未知の旧IDもrecord_idで保護 |
| study_progress | user_id + unit_slug | 既存attempts/correct/total/bestPercent/lastStudied |
| learning_cloud_bindings | user_id | Phase 4の書込端末ID、last_revision |
既存local schemaに合わせた列を採用し、unknown fieldsもpayloadへ保存します。巨大なユーザーJSONではなく教材項目ごとのrowです。各rowにschema_version/source_revision/client_created_at/client_updated_at/server created_at/updated_atを持ちます。検索indexは(user_id,updated_at)です。

4テーブルすべてENABLE/FORCE RLS、匿名には権限なし。authenticatedのselect/insert/update/deleteそれぞれにauth.uid() = user_idを適用し、updateはUSINGとWITH CHECKの両方でownerを検証します。RPCはSECURITY INVOKERでRLSを適用します。RPCはAuthからuser_idを取得し、呼出元が別ownerを指定する引数を設けません。

## local-first・cloud write
既存Storage Repository/保護付きlocalStorage/IndexedDBを再利用します。学習保存コードの成功結果は従来どおり即時に返り、共通変更通知後に非同期でクラウド送信します。通信失敗は学習操作エラーにしません。IndexedDBのschemaは変更せず、Phase 2のdirty metadataをクリアしません。
RPC save_chemica_learning が3種類の項目を1transactionでupsertします。累積件数は絶対値で置換し、再送で加算しません。版番号で古い再送を拒否し、不正な一部データがあれば全体をrollbackします。ローカルの原文全体を検証してから送信し、不正レコードを取り除いた部分的uploadはしません。

Phase 4では確認した1端末だけを書込元として登録します。別端末や進んだcloud revisionを検出した場合は保留します。定期pull、Realtime、完全queue、merge、クラウドから端末への置換はありません。スナップショット送信は項目ごとの更新で、cloud上の未収録項目を勝手に削除しません。大きすぎるpayloadはcloudのみ失敗しlocalを保持します。

## 初回login / upload / restore / account混同
1. コード検証前にPhase 1の原文バックアップを検証付きで作成。
2. ログイン後に自分のcloud領域の有無だけ確認。まだ送信しない。
3. cloudなしなら設定画面でユーザー確認。再度バックアップを作成。
4. 端末ownerをuser.idへ固定してから初回upload。失敗してもowner・原文・backup保持。
5. 有効化済みの同一owner/同一端末は、その後の学習変更を非同期で保存。

cloudにもdataがあり、同じ端末との既存連携が確認できない場合は「保留」。合算・上書き・local削除を行いません。ログアウトではAuth sessionと送信接続のみ解除し、学習データとownerは残します。Aの端末をBで利用しても、AのデータをBへuploadする操作は提供しません。共有端末ではlocal閲覧までアカウント分離する機能ではないため、privacyにも明記しました。
chemica-cloud-binding-v1にowner/device/revision/ack/backupKey/enabled/needsReviewを保存します。Web Locksで同一originの複数タブ間のclaim/metadata更新を直列化し、非対応・破損・保存不能時はcloud送信を停止してlocalを維持します。送信JWTはリクエスト開始時のidentityへ固定します。
backup restore前はcloudを停止しneedsReviewを記録し、ownerを変更しません。復元済みデータの自動送信はせずPhase 5まで保留します。

## オフライン・UI・Service Worker・Privacy
- 未ログイン：従来の学習・カード保存・テスト保存・backup/restoreが利用可能。
- ログイン済み：端末保存→UI更新→cloud保存。オフラインはlocal保存、dirty/revision保持。オンライン復帰でAuthと同じ保存先を確認し、既に承認された同一端末の未送信snapshotを再試行。完全同期queueではありません。
- /settings/dataへアカウント、OTP入力、初回upload同意、現在の保存状態、保存保留、logoutを追加。既存ナビゲーションからPC/スマホともアクセス可能。
- 更新通知・Service Workerのactivate/reload方式は変更していません。/authと/auth/*、Authorization付きrequestをNetwork Onlyへ除外。既存/api/*除外と別origin除外を維持。SupabaseのAuth/REST/RPCをcacheしません。静的settings HTMLには個人情報が含まれません。
- Privacy PolicyはlocalStorage/IndexedDB、任意Email Auth、session保存、ユーザー別学習cloud、Supabase、logout後のlocal保持、共有端末の注意、削除相談窓口を記載。実際に使用していないAuth Cookieは記載していません。クラウド削除・account削除UIは未実装です。

## ユーザーが行う手動設定
1. Supabase Dashboard > 対象Chemica project > SQL Editor > New query。
   migrationファイルの内容を確認して実行してください。既存同名tableがある場合はそのまま実行せず差分確認が必要です（IF NOT EXISTSで想定違いを隠しません）。
2. Table Editor / Database Policiesで4tableと16owner policy、RLSを確認。
3. Authentication > Sign In / Providers > Email：Email sign-inとsignupを有効。メールOTP方式なのでEmail+PasswordやGoogle設定は不要。
4. Authentication > Email Templates > Magic Link：メール本文に {{ .Token }} を入れ、確認コード入力の案内に変更。デフォルトのリンクだけのテンプレートでは今回のUIを利用できません。
5. Authentication > Email / SMTP（Dashboardの表示名に応じてEmail settings）：送信元とSMTPを設定。標準の送信環境では送信対象や回数に制約があるため、一般利用前にcustom SMTP・到達確認が必要。SMTP secretはDashboardにのみ設定しコード・報告書へ書かないでください。
6. Authentication > URL Configuration：Site URLは実際のChemica本番origin。本番URLは未提示なので推測しません。今回のOTPはredirect/callbackを使用しません。localhost/Vercel Preview用OAuth redirectは不要です。
7. デプロイ後Chrome/Edge/PWAで実メール認証・reload・logout・offline/onlineを確認。
8. 検証専用の別々の2アカウントでloginし、各自のaccess tokenをローカルの一時環境変数CHEMICA_RLS_USER_A_TOKEN / CHEMICA_RLS_USER_B_TOKENへ設定して npm run check:phase4:rls。
   トークンはチャット・git・ログへ貼らないでください。scriptはPublishable keyと普通のuser tokenのみ利用し、専用UUID付きテストrowだけ作成・更新・削除します。既存learning bindingを変更しません。使用後は一時環境変数を消してください。

Googleを後で追加する場合は、Google Cloud OAuth同意画面/client ID・secret、Supabase Google provider、Google側のSupabase callback URL、Chemica callback route、Site/Redirect URLのlocalhost・production・Preview許可を別途設計します。今回はGoogleを実装・設定した扱いにはしません。

参考： [Supabase Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless)、[RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)、[SSR構成](https://supabase.com/docs/guides/auth/server-side/creating-a-client)。

## 検証
- npm run test:phase4：実TS coordinatorとPostgreSQL(PGlite)にmigrationをそのまま適用。19件成功。A/B owner CRUD、偽owner insert/update拒否、anon拒否、同教材IDの別user row、重複再送、別writer拒否、transaction rollback、初回確認、local保持・backup・restore停止・account切替を検証。
- tests/pwa/auth.spec.ts：Chrome/Edgeの実ブラウザ、Auth/RESTはmock。OTP/session/reload/logout/local保持、明示的cloud upload、B混同防止、既存cloud保留を検証。実Supabase Auth/RLSの検証とは区別します。
- 実メールlogin、本番SQL適用、実SupabaseのA/B RLS、本番cloud writeは未確認。check:phase4:rlsで確認する手段を用意しています。
- Phase 1/2 storage tests、Phase 3 worker/browser tests、foundation、build/lint/typecheck、chemistry/ID auditは全て成功。詳細はverification/phase4-verification.jsonに記録しました。Phase 1は35件、Phase 2は25件、workerは15件、foundationは8件、Phase 4は19件、Chrome/EdgeはPhase 3の14件とPhase 4の8件が成功しました。ログイン中のoffline保存・online復帰・通信失敗時logout後のreloadも確認しました。

## Phase 5へ進む前
本番migration・メール設定・実アカウントRLS確認を完了してください。Phase 5では「既存累積回数を単純加算しない」イベント識別/重複排除、競合比較、削除tombstone、端末owner profile、cloud既存dataのpull/merge、offline queue、複数端末writerへの安全な移行を設計します。Phase 4のwriter bindingを無断で切り替えず、ローカルバックアップを先に確保してください。

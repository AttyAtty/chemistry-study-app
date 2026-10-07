# Phase 4前半: Supabase接続基盤（2026-10-08）

## 実装範囲
@supabase/supabase-js 2.117.3を新規追加。認証UI、Googleログイン、ユーザーテーブル、クラウド同期、DB migrationは未実装。
clientはsrc/lib/supabase/client.tsのgetSupabaseClient()で遅延初期化し、初期化に成功したinstanceを再利用する。
src/lib/supabase/config.tsは設定の検証、src/lib/supabase/connection.tsは読み取り専用の接続確認を担当。
学習画面や保存RepositoryからSupabaseは呼び出さず、既存UIも変更しない。

使用する環境変数はNEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEYのみ。
URLはHTTPSのproject origin、キーはsb_publishable_形式だけを受け付ける。Secret key、service_roleを含むlegacy JWT、legacy anon keyを使用しない。
環境変数の値、SDK instance、request headers、upstream bodyはログやAPI応答に出さない。
.env.localはGit ignoreを維持。空の.env.local.exampleだけ追跡可能にした。

初期化時のAuth設定はpersistSession=false、autoRefreshToken=false、detectSessionInUrl=false。
SDKによるlocalStorageへのsession保存やURLからのOAuth処理を開始しない。IndexedDB・学習保存key/schema/IDにも変更なし。
import時にはclientを生成しない。設定不備はgetSupabaseClient()呼出時に変数名を含む安全な設定エラーとして返す。
接続確認APIでは設定不備・SDK初期化失敗・通信失敗・8秒timeoutなどをcatchし、503と安全なmessageを返す。学習画面の起動を妨げない。

SDKのNode engineは>=22.0.0。ローカル検証はNode24.18.0。
package.jsonもengines.node>=22.0.0を指定し、Vercelの古いNode20設定で動くことを前提にしない。

## 接続確認
GET /api/supabase/health は明示的な確認専用。
dynamic Node route。No-store。既存SWの/api/除外によりcache/interceptしない。
SDK clientを初期化したうえで、設定済みprojectの/auth/v1/healthにapikey headerでGETし、GoTrueの正常応答を検証する。
AuthorizationにPublishable keyをJWTとして入れない。credentialsを送らず、redirectを拒否する。
ログイン、ユーザー作成、table操作、Realtime接続、cloud syncは行わない。
この成功は接続/初期化を示し、ユーザー認証やDBのRLS/読み書き権限の検証とは異なる。

ローカル確認:
- .env.localにURLとPublishable形式keyがあることを値を出力せず確認。
- npm run check:supabase: ok=true / configured=true / clientInitialized=true。
- npm run build後のnext start（127.0.0.1:3212）: /api/supabase/healthがHTTP200、同じ3項目true、Cache-Control=no-store。

本番確認:
- 本番URLの回答待ち。今回のコードはcommit/push/deployしていないため、本番の新client初期化・接続は未確認。
- ユーザーの「Vercelに環境変数を設定し再deploy済み」という報告は把握済み。ただし今回追加したAPIのdeployとは区別する。
- この版をnpm run buildでdeployし、本番の/api/supabase/healthでHTTP200と3項目trueを確認する。
- CLI確認: npm run check:supabase -- --production-url https://<本番のChemicaドメイン>
- CLIは本番APIの安全なboolean/statusだけを表示。404なら未deploy、503なら設定/接続確認失敗として扱い、成功とは報告しない。
- 設定するVercel EnvironmentのProduction/Preview scopeとNode runtimeを確認する。

## 検証結果
npm run build / npm run lint / npm run typecheck: 成功。
新規Supabase基盤テスト: 8/8成功。
Phase1 storage35件・Phase2 storage25件・Phase3 Worker14件: 合計74/74成功。
Chrome/EdgeのPhase3 offline/update: 14/14成功。
本番buildでprecacheは従来どおり23ページ/36assets。APIはprecache対象外。
学習保存層、Service Worker template、登録・更新UI、Next設定は変更なし。
npm audit: 既存Next/eslint-config-next/sharp/postcssなどに12件（high11、critical1）。@supabase依存の該当なし。既存依存の自動更新はしない。

## 次にAuthへ進む際の注意
現在のclientは未認証の接続基盤専用。persistSession等を有効にする前にAuth保存と学習保存を分離し、ログアウト時も学習データを消さない方針を決める。
SSR認証を行う場合はブラウザclientとrequest単位のserver clientを分け、cookie処理（例:@supabase/ssr）を設計する。現在のsingletonを認証済みユーザーのserver session共有に使わない。
ユーザーtable導入時はRLS/auth.uid()による所有者制御を先に設計。Publishable keyだけでユーザーデータが保護されるとは考えない。
認証・ユーザー固有SSR/APIを追加する際は現在の公開静的HTMLのoffline cache方針を再検討し、ユーザー固有responseを共通cacheに入れない。
匿名の既存学習データをログイン時に勝手に移行・上書きしない。Phase1/2のbackup・journal・検証コピーを維持した移行/同期方針が別途必要。
Google providerやredirect URLの設定は今回は開始していない。

参考:
- https://supabase.com/docs/reference/javascript/initializing
- https://supabase.com/docs/guides/getting-started/api-keys
- https://github.com/supabase/auth/blob/master/openapi.yaml （/health）
- https://vercel.com/docs/functions/runtimes/node-js/node-js-versions

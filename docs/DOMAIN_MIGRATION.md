# Chemica：独自ドメインへ移行する手順

`chemica.app` は候補です。取得・所有・正式採用・接続済みとは扱いません。この変更では本番デプロイ、DNS、Vercel、Supabaseの設定変更を行っていません。

## コード側の準備

- 画面のリンク・manifest・アイコンは同一originの相対URL。共有リンクとQRコードは、開いているページのURLから作成するため、接続後は新サイトで作り直す。
- OTPはメールの確認コードを入力する方式。`emailRedirectTo`、OAuth、認証callbackを使用していない。ログイン後の「元のページへ戻る」は同一originの相対パスのみ許可する。
- manifestは `id: "/"`、`start_url: "/home"`、`scope: "/"`、`display: "standalone"`。192/512pxのアイコンと180pxのApple用アイコンを既存のまま利用する。旧manifestの省略時id（旧start_url `/`）と同じidを明示し、同一origin内のアプリ識別を維持する。
- 設定画面に移行手順を追加。旧サイトへのアクセスを維持し、即時の強制転送は追加しない。
- 学習データの3キー、ID変換、IndexedDB、復元前退避、クラウドの所有者・端末確認は変更しない。

## 管理画面での作業（正式URL決定後）

1. ドメインの所有・正式採用を確認する。
2. Vercelで対象プロジェクト → Settings → Domains → Add Domain。決定したドメインを登録する。DNS事業者では、**そのプロジェクトの画面に示された**A/CNAME/TXTレコードを設定する。既存のメール用MX・SPF・DKIM等を残す。HTTPS証明書とドメイン状態が正常になったことを確認する。[Vercel公式手順](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
3. VercelのProduction環境で既存のSupabase接続設定と問い合わせ用 `RESEND_API_KEY` / `CHEMICA_FEEDBACK_FROM_EMAIL` を確認する。値をログや手順書へ貼り付けない。独自ドメイン用の未使用の環境変数を新設する必要はない。
4. Supabase → Authentication → URL Configuration のSite URLを、決定・接続確認済みのHTTPS originに変更する。現在のOTP画面の復帰にRedirect URLsは使用しない。将来リンク認証/OAuthを追加する場合には実装するcallbackの完全URLを登録し、旧originの必要なURLも移行期間中保持する。Productionに広いワイルドカードを設定しない。[Supabase公式説明](https://supabase.com/docs/guides/auth/redirect-urls)
5. AuthenticationのEmailを有効にし、Magic Linkテンプレートに `{{ .Token }}` を表示する。期限・送信間隔は管理画面設定と合わせ、送信・再送・期限切れを実際のメールで確認する。画面の60秒再送待ちはUIの抑制であり、サーバーの制限を変更するものではない。
6. Custom SMTPを使用する場合はSupabase管理画面で設定する。ResendならSMTP host `smtp.resend.com`、username `resend`、管理画面で選択したTLS対応portと、Auth専用の送信権限API keyをSMTP passwordに設定する。認証済みドメインの送信元を使用する。SMTP Secretをアプリや `NEXT_PUBLIC_*` に追加しない。[Resend公式SMTP手順](https://resend.com/docs/send-with-smtp)
7. 正式URLを外部掲載先で更新する。canonical/metadataBaseや絶対OG URLを将来追加する場合も、接続確認済みのoriginを採用する。現状は候補ドメインをコードに固定していない。

## 利用者のデータ移行

ブラウザのlocalStorage・IndexedDB・ログイン状態・PWAキャッシュはoriginごとに分離される。旧Vercel URLから新ドメインへ自動共有されない。

1. **旧サイト**で「ログイン・データ保存」→「JSONバックアップを保存」。ダウンロード済みファイルを確認する。
2. **新サイト**で同画面の「データを復元」からファイルを選び、検証・自動退避・内容確認後に復元する。
3. 記録・暗記カードを確認する。空のバックアップ項目は既存記録を保持し、復元前データは退避される。複数データの合算は行わない。
4. 必要に応じて新originで再ログインする。**現在のクラウド実装は保存先確認・アップロードのみで、クラウド記録のダウンロードや複数端末統合を提供しない。** 旧originで同じアカウントへ保存済みなら新originは別端末扱いになり、所有者・既存クラウド競合の保護で送信が保留される可能性がある。保護を解除したりクラウドを空にせず、JSONで移行した端末記録を使う。クラウドの端末引き継ぎは別途設計・確認が必要。
5. 新originをホーム画面へ追加する。古いPWAのキャッシュや学習データを移行前に削除しない。新サイトで共有リンク・QRを作り直す。
6. 旧サイトは移行確認まで閲覧・バックアップ可能な状態で維持する。今回、旧サイトの転送・削除を追加していない。

## 本番で確認が必要な項目

- 実メールのOTP配信・再送制限・期限切れ、問い合わせの到達。
- HTTPS、旧/new origin両方からのログイン、旧サイトでのバックアップ、新サイトでの復元。
- iPhone実機のSafari共有メニューからの追加、Android/デスクトップ対応ブラウザのインストール確認、起動先 `/home` とアイコン。
- 新originの共有URLとQR、再インストール後のオフライン起動。
- 最終クラウド保存時刻は現状の保存メタデータに独立した成功時刻がないため表示しない。`updatedAt`は端末内変更時刻であり、クラウド保存成功時刻とは扱わない。

`beforeinstallprompt`は対応ブラウザでのみ使えるため、非対応端末では追加手順を表示する。[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)

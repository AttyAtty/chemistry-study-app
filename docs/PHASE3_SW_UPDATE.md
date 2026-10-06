# Phase 3 Service Worker更新調査（2026-10-07）

## 対象と結論
実装: C:/Web_App_Original/chemistry-study-app。調査開始時 git status clean。
本番URL・実機の当時のイベント記録は提供されていないため、通知を見なかった原因の断定、本番の実際の配信ヘッダー、iOS/Android standaloneでの新版切替確認は未実施。

## 現在の方式
- npm run build の prebuild で randomUUID() を生成。Next BUILD_ID、HTML meta chemica-build、生成sw.jsのCONFIG.versionに同じ値を使用。
- 再ビルドするとUUIDが変化。ビルド済み成果物をそのまま再deployする場合は同じUUID。next build単独はprebuild/postbuildを実行しない。
- /sw.js を production・secure contextで登録。scope=/、updateViaCache=none。Next設定はno-cache/no-store。
- 更新確認で新しいsw.jsが見つかるとupdatefound。installで全ページ・assetsをprecacheし、HTMLのbuild一致も検証。
- 旧workerのcontrolled clientが残る間はinstalled/waiting。installでskipWaitingしない。
- 初回登録、または旧版を使う全clientが閉じた場合はブラウザが自然にactivateする。これはアプリの自動skipWaitingとは異なる。
- activateでclients.claim。controllerchangeは制御workerの切替を通知するが、ページ自体を再読み込みするイベントではない。
- ユーザーが通知の再読み込みを押した場合のみwaitingへCHEMICA_SKIP_WAITINGを送り、指定workerがcontrollerになった時に操作した画面をreload。他の画面はreloadしない。
- Network Firstの通常navigationでは旧worker配下でも新HTMLが取得されることがある。HTMLの版とworkerの版は別々に確認する。

## 通知が見えなかった可能性
時間で通知を消すコードはなく、newVersionをfalseに戻す処理もない。「一瞬で自動消去」はコードから確認できない。
全client終了後の自然activateにより、PWA再起動時には新版で通知不要だった可能性がある。
従来は上部の小さなstatus行だけなのでスクロール中に見えにくい。継続表示中の定期確認やvisibilitychange確認はなかった。
installが失敗するとwaitingに到達せず通知しない。通信失敗・HTMLのbuild不一致などはその候補。
同じ成果物の再deployならworker scriptが変化せず、updatefoundは発生しない。
従来はHTMLと制御workerのUUIDの不一致も「新しい版」と扱っていたため、新HTML/旧workerという状態まで混同していた。

## 修正
PwaStatusと通知CSSを変更。Workerのcache・activate処理と学習保存層は変更しない。
- 手動「更新を確認」。これだけではskipWaiting/reloadを行わない。
- 起動、online、focus、visibilitychange、表示中の1分間隔で確認。自動確認は1分内の重複を抑制。
- waitingをイベントだけでなく登録完了、status確認、復帰、更新確認後にも確認。既にinstalledのworkerも監視開始時に評価。
- 通知はstickyバナー。時間・focus・onlineによって非表示にしない。別画面がactivateしても表示済み通知は維持し、ボタンで手動reloadできる。
- HTML/workerの版不一致は別メッセージ。UUID不一致だけで「新しい版」とは言わない。
- controllerchangeでのreloadは、ユーザーが要求したworkerへの切替時のみ。
- event listenerとintervalをunmount時に解除。

## PWAと通常ブラウザ
standalone判定による別更新ロジックはない。同一origin・同一storage partitionならregistrationを共有し得るが、OS/ブラウザによりPWAの保存領域が分離される場合もあり、共有を前提にしない。
通常ブラウザでは旧タブがwaitingを維持する。PWAも旧画面が存続すれば同様。全画面終了後の自然activateやバックグラウンドのタイマー停止で見え方・検知時刻が異なる。
スマホの背景停止中は1分間隔を保証できない。前面復帰のvisibilitychangeと手動確認で補う。
Chrome/Edgeのmobile viewportテストはOSインストール済みPWA実機の代用ではない。

## 学習データ
localStorage / IndexedDB、learningStorage / learningRepository、schema、IDを変更していない。Supabase / Auth / cloud sync未追加。
WorkerはCache Storageのみ操作。保存済み学習データとアプリcacheは別。手動reload時の未確定の入力・学習画面状態は通常reload同様なので、学習を区切って操作する。

## 本番の確認方法
最初に今回の通知改善をdeployし、その版をオンラインで起動して「オフライン利用可能」を待つ。その画面を開いたまま、次の別ビルドを同じ本番originへdeployする。通知改善のdeployを旧UIから確認するだけでは改善版UIの確認にならない。

1. npm run buildのprebuild/postbuildが成功した別UUIDの版をdeploy。
2. 旧画面を閉じず、再読み込みせず「更新を確認」。precache完了まで待つ。
3. 「新しい版があります」のバナーがスクロール後も残ること、学習中にnavigation/reloadが起きないことを確認。
4. DevTools Application > Service Workersで旧activeと新waitingを確認。Update on reload / Bypass for networkはOFF。skipWaitingリンクは押さない。
5. 学習を区切ってバナーの再読み込みを押す。新版controllerとHTMLのUUID一致、保存済み進捗・履歴保持、別の旧タブが勝手にreloadしないことを確認。
6. 別のビルドで、通知ボタンを押さず全Chemicaタブ/PWAを終了してから再起動。自然activateして通知なしで新版になり得ることを確認。
7. 通常ブラウザとPWAそれぞれで行う。PWA側が別storage partitionなら、そのPWAで旧版を先に準備する。
8. 新版も「オフライン利用可能」を確認してからoffline reloadし、進捗・履歴を再確認。

本番consoleでの読み取り用確認（学習データの変更なし）:
```js
const reg = await navigator.serviceWorker.getRegistration();
const read = worker => !worker ? Promise.resolve(null) : new Promise(resolve => {
  const channel = new MessageChannel();
  const timer = setTimeout(() => { channel.port1.close(); resolve({ timeout: true }); }, 5000);
  channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
  worker.postMessage({ type: "CHEMICA_STATUS" }, [channel.port2]);
});
console.log({
  html: document.querySelector('meta[name="chemica-build"]')?.content,
  controller: await read(navigator.serviceWorker.controller),
  active: await read(reg?.active),
  waiting: await read(reg?.waiting),
  installingState: reg?.installing?.state,
  waitingState: reg?.waiting?.state,
  standalone: matchMedia("(display-mode: standalone)").matches || navigator.standalone === true
});
reg?.addEventListener("updatefound", () => console.log("updatefound", reg.installing?.state));
navigator.serviceWorker.addEventListener("controllerchange", () => console.log("controllerchange"));
```
新版UUIDはdeployログ、生成sw.js、HTML metaを比較する。本番URL不明のため、この調査では実deployごとの変化を確認したとは扱わない。

参考: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
参考: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/controllerchange_event

## 最終検証結果
- npm run build: 成功（prebuild / postbuildを含む）。
- npm run lint: 成功。TypeScript: 本番buildおよびtsc --noEmit --incremental falseで成功。
- Service Worker単体: 14/14成功。
- Chrome / Edge: 全14/14成功（従来offline各4件、今回update各3件）。
- 実Workerテストは専用HTTP originに本体templateを配信し、old→new→restartの3版でwaiting、明示activate、updatefound/controllerchange、別client維持、全client終了後の自然activateを確認。
- 通知UIテストは本番build画面にmock registrationを注入し、初期waiting・updatefound後の通知、focus/visibilitychange/スクロール/手動確認後の維持、意図しないreloadなし、ボタン操作でのみreloadを確認。実Workerテストとは分けており、実本番二版deployの統合検証ではない。
- 既存offlineテストで初回登録の一時waitingの誤通知を検出し修正。旧controllerまたはactiveが存在する場合だけ通知する。
- 既存offlineカード/quiz/履歴/dirty/JSON backup/restore、persistent browser再起動、cache cleanup/repair、IndexedDB利用不可時のlocalStorage fallbackを再検証し成功。
- 学習保存層、SW template、UUID生成スクリプト、Next設定にgit差分なし。git diff --check成功。
- 調査前UUID: 1fe5c3b3-ed6c-4ecf-976d-f51bc7579355
- 1回目build UUID: 3029d6e4-d86d-4e00-87b4-5a0fbc09fa17
- 最終build UUID: 21c789cf-83cd-4c77-85b3-d5a953f1984e
- 最終UUIDはNext BUILD_ID、pwaBuild.ts、sw.js、precache対象23ページすべてで一致。
- docs/verification/phase3-precache.jsonはbuild生成に伴い最新UUID/assetsへ更新。
- 本番deploy / commit / pushは行っていない。実機PWAと本番更新は上記手動手順で確認する。

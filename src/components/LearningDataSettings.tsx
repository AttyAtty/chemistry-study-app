"use client";
import { AccountSettings } from "./AccountSettings";
import { pauseCloudForRestore } from "@/lib/cloudLearning";
import { StorageBackendStatus } from "./StorageBackendStatus";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CHEMICA_VERSION } from "@/lib/appVersion";
import { applyRestore, exportLearningBackup, LEARNING_KEYS, prepareRestore, readRestoreArchive, recoverPendingRestore, type LearningBackup, type PreparedRestore } from "@/lib/learningStorage";
function download(backup: LearningBackup, label = "backup") {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url; link.download = `chemica-${label}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  document.body.appendChild(link);
  try { link.click(); } finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
const labels = ["暗記カード進捗", "問題別の回答履歴", "テストの受験集計"];
function entryCount(raw: string | null) { if (raw === null) return 0; try { return Object.keys(JSON.parse(raw)).length; } catch { return null; } }
export function LearningDataSettings() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [prepared, setPrepared] = useState<PreparedRestore | null>(null);
  const [busy, setBusy] = useState(false);
  const [archive, setArchive] = useState<{ pending: boolean; backup: LearningBackup } | null>(null);
  const selection = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const refreshArchive = () => { const result = readRestoreArchive(); if (result.ok) setArchive(result.value); else { setError(true); setMessage(result.error); } };
  useEffect(() => { const timer = window.setTimeout(refreshArchive, 0); return () => window.clearTimeout(timer); }, []);
  const exportData = () => {
    const result = exportLearningBackup(CHEMICA_VERSION);
    if (!result.ok) { setError(true); setMessage(result.error); return; }
    try { download(result.value); setError(false); setMessage("ダウンロードを開始しました。保存されたファイルを確認してください。破損した記録も原文のまま含まれます。"); }
    catch { setError(true); setMessage("ファイルをダウンロードできませんでした。学習データは変更していません。"); }
  };
  const chooseFile = async (file: File | undefined) => {
    const request = ++selection.current;
    setPrepared(null); setMessage("");
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      if (request !== selection.current) return;
      const result = prepareRestore(text, CHEMICA_VERSION);
      if (!result.ok) { setError(true); setMessage(result.error); return; }
      setPrepared(result.value); setError(false); setMessage("ファイルを検証し、現在のデータを端末内へ自動退避しました。まだ学習データは置き換えていません。");
    } catch { if (request === selection.current) { setError(true); setMessage("ファイルを読み取れませんでした。既存の学習データは変更していません。"); } }
    finally { if (request === selection.current) setBusy(false); }
  };
  const restore = () => {
    if (!prepared || busy) return;
    if (!window.confirm("現在の学習データをバックアップの内容に置き換えます。空の項目は現在の記録を保持します。復元前データは自動退避済みです。復元しますか？")) return;
    setBusy(true);
    try { pauseCloudForRestore(); } catch { setBusy(false); setError(true); setMessage("クラウド送信を停止できないため復元を中止しました。端末内データは保持しています。"); return; }
    const result = applyRestore(prepared);
    setError(!result.ok); setMessage(result.ok ? "復元が完了しました。学習記録やカードを開くと復元後のデータが表示されます。" : result.error);
    setPrepared(null); if (fileInput.current) fileInput.current.value = "";
    refreshArchive(); setBusy(false);
  };
  const recover = () => {
    if (!window.confirm("中断した復元を取り消し、復元前に退避した元データへ戻しますか？")) return;
    try { pauseCloudForRestore(); } catch { setError(true); setMessage("クラウド送信を停止できないため復旧を中止しました。"); return; }
    const result = recoverPendingRestore();
    setError(!result.ok); setMessage(result.ok ? "復元前の元データへ戻しました。" : result.error); refreshArchive();
  };
  return <main className="page-container data-settings">
    <header className="page-intro compact"><p className="eyebrow">LEARNING DATA</p><h1>ログイン・データ保存</h1><p>学習データはログインなしで、この端末のブラウザ内に保存されます。</p></header>
    <AccountSettings />
    <section className="data-panel"><h2>バックアップ</h2><p>暗記カードの進捗・復習予定・問題別の回答履歴・テスト集計をJSONファイルに保存します。ブラウザのサイトデータを消去する前に、ファイルを保存してください。</p><button className="button primary" type="button" onClick={exportData} disabled={busy}>JSONバックアップを保存</button></section>
    <section className="data-panel"><h2>データを復元</h2><p>現在の学習データを置き換えます。ファイルを検証し、現在データを自動退避した後、確認してから復元します。空の項目では現在データを消しません。複数端末のデータの合算は行いません。復元中は別タブでの学習を止めてください。</p>
      <label className="backup-file-label" htmlFor="learning-backup">ChemicaのバックアップJSON<input id="learning-backup" ref={fileInput} type="file" accept=".json,application/json" disabled={busy || archive?.pending === true} onChange={event => { void chooseFile(event.target.files?.[0]); }} /></label>
      {prepared && <div className="restore-preview"><h3>復元内容の確認</h3><p>作成日時：{prepared.backup.exportedAt}<br/>アプリ：{prepared.backup.appVersion} / schema：{prepared.backup.schemaVersion}</p>
        <ul>{LEARNING_KEYS.map((key, index) => { const count = entryCount(prepared.backup.data[key]); return <li key={key}>{labels[index]}：{count ? `${count}件に置き換え` : "現在データを保持"}</li>; })}</ul>
        <div className="data-actions"><button className="button secondary" type="button" onClick={() => { try { download(prepared.before, "before-restore"); } catch { setError(true); setMessage("ダウンロードを開始できませんでした。"); } }}>復元前データもファイルに保存</button><button className="button primary" type="button" onClick={restore} disabled={busy}>確認して復元する</button><button type="button" onClick={() => { ++selection.current; setPrepared(null); if (fileInput.current) fileInput.current.value = ""; setMessage("復元をキャンセルしました。学習データは変更していません。自動退避データは保持します。"); }}>キャンセル</button></div>
      </div>}
    </section>
    {archive && <section className="data-panel"><h2>復元前の退避データ</h2><p>直近の復元前データは端末内に保持されています。以前の退避データも自動削除しません。端末内の退避データはサイトデータ消去で失われるため、ファイルにも保存してください。</p><div className="data-actions"><button className="button secondary" type="button" onClick={() => { try { download(archive.backup, "before-restore"); } catch { setError(true); setMessage("ダウンロードを開始できませんでした。"); } }}>直近の復元前データを保存</button>{archive.pending && <button className="button primary" type="button" onClick={recover}>中断した復元を元に戻す</button>}</div></section>}
    <section className="data-panel" id="domain-migration"><h2>別ドメインへの移行</h2>
      <p>ドメインが変わると、この端末の記録やログイン状態は自動で引き継がれません。正式URLはまだ未確定です。</p>
      <ol><li>旧サイトでJSONバックアップを保存し、ファイルを確認します。</li><li>新サイトのURLを確認して開き、この画面でバックアップを復元します。</li><li>記録・カードを確認してから、必要に応じて再ログインし、クラウド保存先を確認します。</li><li>新サイトをホーム画面に追加し直し、共有リンク・QRコードも新サイトで作り直します。</li></ol>
      <p>現在、クラウドに保存した記録を新端末・新ドメインへ取り込む機能や、複数端末の統合はありません。移行にはJSONバックアップ・復元を使ってください。旧サイトの記録は移行確認まで残してください。</p>
    </section>
    <section className="data-panel"><h2>アプリの更新</h2><div id="pwa-settings-controls" /></section>
    <details className="data-panel"><summary>保存の詳細・診断</summary><StorageBackendStatus /></details>
    {message && <p className={`data-message ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}>{message}</p>}
    <Link className="text-link" href="/progress">学習記録へ戻る →</Link>
  </main>;
}

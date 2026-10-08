"use client";
/* eslint-disable @next/next/no-img-element -- QR生成サービスの動的URLをそのまま表示するため */

import { useNetworkStatus } from "@/lib/useNetworkStatus";
import { useCallback, useRef, useState } from "react";
import { useDialogFocus } from "@/lib/useDialogFocus";

export function SharePanel() {
  const online = useNetworkStatus();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDialogFocus(open, dialogRef, close);

  function openPanel() {
    setCopied(false);
    setUrl(window.location.href);
    setOpen(true);
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: document.title, text: "高校化学の学習ページを共有します。", url });
      else await copyLink();
    } catch { /* Dismissing the native share sheet leaves this dialog available. */ }
  }

  const qrUrl = url ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(url)}` : "";

  return <div className="share-widget no-print">
    <button className="share-trigger" type="button" onClick={openPanel} aria-haspopup="dialog"><span aria-hidden="true">↗</span> リンク共有</button>
    {open && <div className="share-backdrop" role="presentation" onMouseDown={close}>
      <section className="share-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={event => event.stopPropagation()}>
        <button className="share-close" type="button" onClick={close} aria-label="閉じる">×</button>
        <span className="share-kicker">SHARE CHEMICA</span>
        <h2 id="share-title">このページを共有</h2>
        <p>QRコードを読み取るか、リンクをコピーして送れます。</p>
        {qrUrl && online && <img className="share-qr" src={qrUrl} alt="このページを開くQRコード" width="220" height="220" />}
        {!online && <small>QRコードの取得にはインターネット接続が必要です。リンクのコピーは利用できます。</small>}
        <label className="share-url"><span>ページのリンク</span><input value={url} readOnly onFocus={event => event.currentTarget.select()} /></label>
        <div className="share-actions">
          <button type="button" onClick={copyLink}>{copied ? "コピーしました ✓" : "リンクをコピー"}</button>
          <button type="button" className="secondary" onClick={share}>共有メニューを開く</button>
        </div>
        <small>Created by <strong>Atty</strong></small>
      </section>
    </div>}
  </div>;
}

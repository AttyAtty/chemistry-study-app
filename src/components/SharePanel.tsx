"use client";
/* eslint-disable @next/next/no-img-element -- QR生成サービスの動的URLをそのまま表示するため */

import { useState } from "react";

export function SharePanel() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  function openPanel() {
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
    if (navigator.share) await navigator.share({ title: document.title, text: "高校化学の学習ページを共有します。", url });
    else await copyLink();
  }

  const qrUrl = url ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(url)}` : "";

  return <div className="share-widget no-print">
    <button className="share-trigger" type="button" onClick={openPanel} aria-haspopup="dialog"><span aria-hidden="true">↗</span> 共有</button>
    {open && <div className="share-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="share-dialog" role="dialog" aria-modal="true" aria-labelledby="share-title" onMouseDown={event => event.stopPropagation()}>
        <button className="share-close" type="button" onClick={() => setOpen(false)} aria-label="閉じる">×</button>
        <span className="share-kicker">SHARE CHEMISTRY TRAINER</span>
        <h2 id="share-title">このページを共有</h2>
        <p>QRコードを読み取るか、リンクをコピーして送れます。</p>
        {qrUrl && <img className="share-qr" src={qrUrl} alt="このページを開くQRコード" width="220" height="220" />}
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

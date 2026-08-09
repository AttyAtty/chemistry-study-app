"use client";

import { useRef, useState, type FormEvent } from "react";
import { FEEDBACK_CONTENT_MAX, FEEDBACK_CONTENT_MIN, FEEDBACK_TYPES, isValidEmail, type FeedbackType } from "@/lib/feedback";

type Status = { type: "idle" | "success" | "error"; message: string };

export function FeedbackForm({ initialType = "質問", source = "" }: { initialType?: FeedbackType; source?: string }) {
  const [type, setType] = useState<FeedbackType>(initialType);
  const [content, setContent] = useState("");
  const [email, setEmail] = useState("");
  const startedAt = useRef(0);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const beginInput = () => { if (!startedAt.current) startedAt.current = Date.now(); };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const trimmed = content.trim();
    if (trimmed.length < FEEDBACK_CONTENT_MIN || trimmed.length > FEEDBACK_CONTENT_MAX) return setStatus({ type:"error", message:`内容は${FEEDBACK_CONTENT_MIN}～${FEEDBACK_CONTENT_MAX}文字で入力してください。` });
    if (email.trim() && !isValidEmail(email.trim())) return setStatus({ type:"error", message:"メールアドレスの形式を確認してください。" });
    setPending(true); setStatus({ type:"idle", message:"" });
    const form = event.currentTarget;
    const website = new FormData(form).get("website")?.toString() ?? "";
    let sourceUrl = "";
    try { sourceUrl = source ? new URL(source, window.location.origin).toString() : document.referrer || ""; } catch { sourceUrl = ""; }
    try {
      const response = await fetch("/api/feedback", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ type, content:trimmed, email:email.trim(), sourceUrl, website, startedAt:startedAt.current }) });
      const result = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) throw new Error(result.message || "送信できませんでした。時間をおいて再度お試しください。");
      setContent(""); setEmail(""); startedAt.current=0; setStatus({ type:"success", message:"送信しました。ありがとうございます。" });
    } catch (error) {
      setStatus({ type:"error", message:error instanceof Error ? error.message : "送信できませんでした。時間をおいて再度お試しください。" });
    } finally { setPending(false); }
  };

  return <form className="feedback-form" onSubmit={submit} noValidate>
    <div className="feedback-field"><label htmlFor="feedback-type">種類 <b>必須</b></label><select id="feedback-type" value={type} onChange={(event) => {beginInput();setType(event.target.value as FeedbackType);}} required>{FEEDBACK_TYPES.map((item) => <option key={item}>{item}</option>)}</select></div>
    <div className="feedback-field"><label htmlFor="feedback-content">内容 <b>必須</b></label><textarea id="feedback-content" value={content} onChange={(event) => {beginInput();setContent(event.target.value);}} minLength={FEEDBACK_CONTENT_MIN} maxLength={FEEDBACK_CONTENT_MAX} rows={9} required aria-describedby="feedback-content-help feedback-count"/><div className="feedback-field-meta"><small id="feedback-content-help">具体的な内容を10文字以上で入力してください。</small><small id="feedback-count">{content.length} / {FEEDBACK_CONTENT_MAX}</small></div></div>
    <div className="feedback-field"><label htmlFor="feedback-email">メールアドレス <span>任意・返信を希望する場合のみ</span></label><input id="feedback-email" type="email" value={email} onChange={(event) => {beginInput();setEmail(event.target.value);}} inputMode="email" autoComplete="email" maxLength={254}/></div>
    {source && <div className="feedback-source"><span>対象ページ</span><code>{source}</code></div>}
    <div className="feedback-honeypot" aria-hidden="true"><label htmlFor="feedback-website">Webサイト</label><input id="feedback-website" name="website" type="text" tabIndex={-1} autoComplete="off"/></div>
    <button className="button primary feedback-submit" type="submit" disabled={pending}>{pending ? "送信中…" : "送信する"}</button>
    <div className={`feedback-status ${status.type}`} role={status.type === "error" ? "alert" : "status"} aria-live="polite">{status.message}</div>
  </form>;
}

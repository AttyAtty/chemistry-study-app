"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { chemistryUnits } from "@/data/chemistry";
import { readProgress, resetProgress, type ProgressData } from "@/lib/progress";

export function ProgressClient() {
  const [progress, setProgress] = useState<ProgressData>({});

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setProgress(readProgress());
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const summary = useMemo(() => {
    const values = Object.values(progress);
    const attempts = values.reduce((sum, item) => sum + item.attempts, 0);
    const correct = values.reduce((sum, item) => sum + item.correct, 0);
    const total = values.reduce((sum, item) => sum + item.total, 0);
    return { attempts, correct, total, percent: total ? Math.round((correct / total) * 100) : 0 };
  }, [progress]);

  const handleReset = () => {
    const confirmed = window.confirm("この端末に保存された学習記録をすべて削除しますか？");
    if (!confirmed) return;
    resetProgress();
    setProgress({});
  };

  return (
    <main className="page-container">
      <section className="page-intro compact">
        <p className="eyebrow">PROGRESS</p>
        <h1>学習記録</h1>
        <p>この記録は現在使っているブラウザの中に保存されています。</p>
      </section>

      <section className="summary-grid">
        <div><span>受験回数</span><strong>{summary.attempts}</strong></div>
        <div><span>総正解数</span><strong>{summary.correct}</strong></div>
        <div><span>総問題数</span><strong>{summary.total}</strong></div>
        <div><span>総合正答率</span><strong>{summary.percent}%</strong></div>
      </section>

      <section className="progress-list-section">
        <div className="section-heading">
          <div><p className="eyebrow">BY UNIT</p><h2>単元別</h2></div>
          <button className="danger-link" type="button" onClick={handleReset}>記録をリセット</button>
        </div>
        <div className="progress-list">
          {chemistryUnits.map((unit) => {
            const item = progress[unit.slug];
            const accuracy = item?.total ? Math.round((item.correct / item.total) * 100) : 0;
            return (
              <article className="progress-item" key={unit.slug}>
                <span className="unit-icon small" aria-hidden="true">{unit.icon}</span>
                <div className="progress-item-main">
                  <div><h3>{unit.shortTitle}</h3><span>{item ? `${item.attempts}回受験` : "未受験"}</span></div>
                  <div className="progress-track slim"><span style={{ width: `${accuracy}%` }} /></div>
                </div>
                <div className="progress-numbers">
                  <strong>{accuracy}%</strong>
                  <small>最高 {item?.bestPercent ?? 0}%</small>
                </div>
                <Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=5`}>解く</Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

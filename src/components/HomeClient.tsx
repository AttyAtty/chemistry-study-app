"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ChemistryUnit } from "@/data/chemistry";

export function HomeClient({ units }: { units: ChemistryUnit[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return units;

    return units.filter((unit) =>
      [unit.title, unit.summary, ...unit.keywords].join(" ").toLowerCase().includes(normalized),
    );
  }, [query, units]);

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">CHEMISTRY LEARNING HUB</p>
          <h1>反応をつなげ、色を比べ、問題で定着させる。</h1>
          <p className="hero-copy">
            有機・無機の反応系統、電池、色、工業的製法、イオン反応式を、単元別の資料とテストで学べます。
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/quiz?unit=all&count=10">
              10問テストを始める
            </Link>
            <Link className="button secondary" href="/progress">
              学習記録を見る
            </Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="学習の流れ">
          <div><span>1</span><strong>見る</strong><small>表・系統図で整理</small></div>
          <div><span>2</span><strong>解く</strong><small>単元別テスト</small></div>
          <div><span>3</span><strong>残す</strong><small>正答率を端末保存</small></div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">UNITS</p>
            <h2>単元から学ぶ</h2>
          </div>
          <label className="search-box">
            <span>検索</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="例：沈殿、電池、ベンゼン"
            />
          </label>
        </div>

        <div className="unit-grid">
          {filtered.map((unit) => (
            <article className="unit-card" key={unit.slug}>
              <div className="unit-card-top">
                <span className="unit-icon" aria-hidden="true">{unit.icon}</span>
                <span className="level-chip">{unit.level}</span>
              </div>
              <h3>{unit.title}</h3>
              <p>{unit.summary}</p>
              <div className="tag-row">
                {unit.keywords.slice(0, 3).map((keyword) => <span key={keyword}>{keyword}</span>)}
              </div>
              <div className="card-actions">
                <Link className="text-link" href={`/units/${unit.slug}`}>資料を見る →</Link>
                <Link className="mini-button" href={`/quiz?unit=${unit.slug}&count=5`}>5問テスト</Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">該当する単元がありません。検索語を短くしてみてください。</div>
        )}
      </section>
    </>
  );
}

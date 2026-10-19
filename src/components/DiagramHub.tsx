"use client";

import { useMemo, useState } from "react";
import { StudyLink } from "@/components/StudyLink";
import { diagramCategoryLabels, diagramHubEntries, type DiagramCategory } from "@/data/illustrated/hub";

const categories: Array<DiagramCategory | "all"> = ["all", "theory", "inorganic", "organic", "experiment", "reaction-map"];

export function DiagramHub() {
  const [selected, setSelected] = useState<DiagramCategory | "all">("all");
  const entries = useMemo(() => selected === "all" ? diagramHubEntries : diagramHubEntries.filter((entry) => entry.categories.includes(selected)), [selected]);
  const grouped = selected === "all"
    ? (categories.slice(1) as DiagramCategory[]).map((category) => ({ category, entries: entries.filter((entry) => entry.primary === category) })).filter((group) => group.entries.length > 0)
    : [{ category: selected as DiagramCategory, entries }];

  return <main className="page-container diagram-hub-page">
    <header className="page-intro compact"><p className="eyebrow">VISUAL CHEMISTRY</p><h1>図で理解する</h1>
      <p>グラフ・構造・反応の流れから化学を学べる図解教材です。教材データは各分野のページと共有しています。</p></header>
    <nav className="diagram-hub-filters" aria-label="図解教材を分野で絞り込む">
      {categories.map((category) => <button key={category} type="button" aria-pressed={selected === category} onClick={() => setSelected(category)}>
        {category === "all" ? "すべて" : diagramCategoryLabels[category]}
      </button>)}
    </nav>
    {grouped.map(({ category, entries: groupEntries }) => <section className="diagram-hub-group" key={category} aria-labelledby={`diagram-group-${category}`}>
      <div className="section-heading"><div><p className="eyebrow">{category.toUpperCase()}</p><h2 id={`diagram-group-${category}`}>{diagramCategoryLabels[category]}</h2></div></div>
      <div className="diagram-hub-grid">{groupEntries.map((entry) => <StudyLink className="diagram-hub-card" key={entry.id} href={entry.href}>
        <span className="diagram-hub-card-domain">{diagramCategoryLabels[entry.primary]}</span>
        <strong>{entry.title}</strong><p>{entry.description}</p>
        <span className="diagram-hub-card-cta">図を見る <span aria-hidden="true">→</span></span>
      </StudyLink>)}</div>
    </section>)}
    <p className="diagram-hub-note">穴埋め・解答表示・印刷がある教材では、各教材ページから利用できます。</p>
  </main>;
}

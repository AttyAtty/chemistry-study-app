"use client";

import { useId, useState } from "react";
import type { Diagram } from "@/data/separation/types";

export function SeparationDiagram({ diagram }: { diagram: Diagram }) {
  const [detailed, setDetailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const uid = useId().replaceAll(":", "");
  const byId = new Map(diagram.nodes.map(node => [node.id, node]));
  return <section className="separation-viewer" aria-label={diagram.title}>
    <div className="separation-controls">
      <div role="group" aria-label="表示モード">
        <button type="button" aria-pressed={!detailed} onClick={() => setDetailed(false)}>基本表示</button>
        <button type="button" aria-pressed={detailed} onClick={() => setDetailed(true)}>詳細表示</button>
      </div>
      <button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? "全体を表示" : "拡大して読む"}</button>
    </div>
    <p id={`${uid}-hint`}>左の列を上から下へ進み、枝分かれした物質を回収します。小さい画面では図を横にスクロールできます。</p>
    <div className="separation-scroll" role="region" aria-label={`${diagram.title}の図（横スクロール可能）`} aria-describedby={`${uid}-hint`} tabIndex={0}>
      <svg className={`separation-svg${zoom ? " is-zoomed" : ""}`} viewBox={`0 0 ${diagram.width} ${diagram.height}`} style={{maxWidth: zoom ? undefined : diagram.width}} role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
        <title id={`${uid}-title`}>{diagram.title}</title>
        <desc id={`${uid}-desc`}>{diagram.description} 図の全内容は下の「図の内容を文章で読む」でも確認できます。</desc>
        <defs><marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
        {diagram.edges.map(edge => {
          const from = byId.get(edge.from)!; const to = byId.get(edge.to)!;
          const sameRow = from.y === to.y;
          const startX = sameRow ? from.x + from.width : from.x + from.width / 2;
          const startY = sameRow ? from.y + from.height / 2 : from.y + from.height;
          const endX = sameRow ? to.x : to.x + to.width / 2;
          const endY = sameRow ? to.y + to.height / 2 : to.y;
          const bendY = to.y - 82;
          return <g key={edge.id} data-edge-id={edge.id}>
            <path className="separation-edge" d={sameRow ? `M${startX},${startY} H${endX}` : `M${startX},${startY} V${bendY} H${endX} V${endY}`} markerEnd={`url(#${uid}-arrow)`} />
            <text className="separation-reagent" x={edge.labelX} y={edge.labelY}>{edge.reagent?.label}</text>
            {edge.condition && <text className="separation-condition" x={edge.labelX} y={edge.labelY + 24}>{edge.condition.label}</text>}
          </g>;
        })}
        {diagram.nodes.map(node => {
          const layer = diagram.layers.find(layer => layer.id === node.layerId);
          return <g key={node.id} data-node-id={node.id} className={`separation-node ${layer?.kind ?? node.kind}`}>
            <title>{[node.label,node.formula,...node.lines].join("。")}</title>
            <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="14" />
            <text className="separation-node-title" x={node.x+16} y={node.y+29}>{node.label}</text>
            {node.lines.map((line,i) => <text x={node.x+16} y={node.y+61+i*26} key={i}>{line}</text>)}
            {layer && <text className="separation-layer" x={node.x+16} y={node.y+129}>{layer.label}</text>}
            {node.color && <circle cx={node.x+node.width-24} cy={node.y+node.height-23} r="8" fill={node.color} stroke="var(--muted)" />}
          </g>;
        })}
      </svg>
    </div>
    {detailed && <div className="separation-details" aria-label="物質・操作の詳細">
      {diagram.nodes.filter(node=>node.notes.length).map(node=><article key={node.id}>
        <h3>{node.label}</h3><p className="separation-formula">{node.formula}</p>
        {node.colorLabel && <p>沈殿色：{node.colorLabel}</p>}
        {node.notes.map(note=><p key={note.id}>{note.text}</p>)}
      </article>)}
    </div>}
    <details className="separation-text"><summary>図の内容を文章で読む</summary>
      {diagram.nodes.map(node=><article key={node.id}><h3>{node.label}</h3><p>{node.formula}</p><p>{node.lines.join(" / ")}</p>
        {diagram.edges.filter(edge=>edge.from===node.id).map(edge=><p key={edge.id}>→ {edge.reagent?.label} {edge.condition?.label}：{byId.get(edge.to)?.label}{edge.note && `（${edge.note.text}）`}</p>)}
      </article>)}
    </details>
    <aside className="separation-notes"><h2>補足説明</h2>{diagram.notes.map(note=><p key={note.id}>{note.text}</p>)}
      <details><summary>内容の確認に用いた資料</summary>{diagram.sources.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></p>)}<p>図と解説はアプリ内に保存されます。参考資料を開く場合のみ通信が必要です。</p></details>
    </aside>
  </section>;
}

"use client";

import { useId, useState } from "react";
import type { Diagram } from "@/data/separation/types";
import { BenzeneStructure } from "./BenzeneStructure";
import type { SeparationExercise } from "@/lib/separationExercise";
import { ExerciseText, ExerciseTextParts, HtmlExerciseField, type ExerciseView } from "./ExerciseField";

export function SeparationDiagram({ diagram, exercise, showAnswers=false }: { diagram: Diagram; exercise?: SeparationExercise; showAnswers?: boolean }) {
  const [detailed, setDetailed] = useState(false);
  const [zoom, setZoom] = useState(false);
  const uid = useId().replaceAll(":", "");
  const byId = new Map(diagram.nodes.map(node => [node.id, node]));
  const view: ExerciseView | undefined = exercise ? {exercise,showAnswers} : undefined;
  return <section className="separation-viewer" aria-label={diagram.title}>
    <div className="separation-controls">
      {!exercise && <div role="group" aria-label="表示モード">
        <button type="button" aria-pressed={!detailed} onClick={() => setDetailed(false)}>基本表示</button>
        <button type="button" aria-pressed={detailed} onClick={() => setDetailed(true)}>詳細表示</button>
      </div>}
      <button type="button" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? "全体を表示" : "拡大して読む"}</button>
    </div>
    <p id={`${uid}-hint`}>{diagram.readingHint} 図全体を縮小表示しています。「拡大して読む」で細部を確認できます。</p>
    <div className="separation-scroll" role="region" aria-label={`${diagram.title}の図（横スクロール可能）`} aria-describedby={`${uid}-hint`} tabIndex={0}>
      <svg className={`separation-svg ${diagram.variant ?? ""}${zoom ? " is-zoomed" : ""}`} viewBox={`0 0 ${diagram.width} ${diagram.height}`} style={{maxWidth: zoom ? undefined : diagram.width}} role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
        <title id={`${uid}-title`}>{diagram.title}</title>
        <desc id={`${uid}-desc`}>{exercise ? "番号付きの下線が空欄です。答えを表示すると選択された空欄だけを解答に切り替えます。" : `${diagram.description} 図の全内容は下の「図の内容を文章で読む」でも確認できます。`}</desc>
        <defs><marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
        {diagram.edges.map(edge => {
          const from = byId.get(edge.from)!; const to = byId.get(edge.to)!;
          const sameRow = from.y === to.y;
          const startX = sameRow ? from.x + from.width : from.x + from.width / 2;
          const startY = sameRow ? from.y + from.height / 2 : from.y + from.height;
          const endX = sameRow ? to.x : to.x + to.width / 2;
          const endY = sameRow ? to.y + to.height / 2 : to.y;
          const bendY = to.y - 82;
          const path = edge.display?.points.map(([x,y],i)=>`${i ? "L" : "M"}${x},${y}`).join(" ")
            ?? (sameRow ? `M${startX},${startY} H${endX}` : `M${startX},${startY} V${bendY} H${endX} V${endY}`);
          return <g key={edge.id} data-edge-id={edge.id}>
            <path className="separation-edge" d={path} markerEnd={edge.to && !byId.get(edge.to)?.display?.hidden ? `url(#${uid}-arrow)` : undefined} />
            {!edge.display?.hideLabel && (edge.display?.instructions ? <g>
              {edge.display.instructions.map((instruction,i)=><ExerciseText key={`${instruction.fieldId}-${i}`}
                fieldId={instruction.fieldId} kind={instruction.kind} text={instruction.text} view={view}
                className={`separation-instruction ${instruction.kind === "reagent" ? "separation-reagent" : "separation-operation"} tone-${instruction.kind === "reagent" ? edge.display?.tone ?? "default" : "default"}`}
                fontSize={instruction.kind === "reagent" ? 19 : 13} x={instruction.x} y={instruction.y}/>)}
            </g> : <g>
              <text data-field-id={edge.reagent?.id} className={`separation-reagent tone-${edge.display?.tone ?? "default"}`} x={edge.labelX} y={edge.labelY}>
                {(edge.display?.reagentLines ?? [edge.reagent?.label ?? ""]).map((line,i)=><tspan key={i} x={edge.labelX} dy={i ? 26 : 0}>{line}</tspan>)}
              </text>
              {edge.condition && (edge.display?.condition ?? edge.condition.label) && <text data-field-id={edge.condition.id} className="separation-condition" x={edge.display?.conditionPosition?.x ?? edge.labelX} y={edge.display?.conditionPosition?.y ?? edge.labelY + 23}>{edge.display?.condition ?? edge.condition.label}</text>}
            </g>)}
          </g>;
        })}
        {diagram.nodes.map(node => {
          const layer = diagram.layers.find(layer => layer.id === node.layerId);
          const compact = node.display;
          if (compact?.hidden) return null;
          const compounds = compact?.compounds?.map(id => diagram.compounds!.find(compound => compound.id === id)!);
          return <g key={node.id} data-node-id={node.id} data-field-id={node.id} className={`separation-node ${node.kind} ${layer?.kind ?? ""}`}>
            <title>{exercise && node.kind !== "mixture" ? "分離段階" : [node.label,node.formula,...node.lines].join("。")}</title>
            {!compact?.unboxed && <rect x={node.x} y={node.y} width={node.width} height={node.height} rx="0" />}
            {compounds ? <>
              {layer && <text className={`separation-layer layer-${layer.kind}${node.kind === "product" ? " recovered-layer" : ""}`} x={node.x + (layer.kind === "aqueous" || node.kind === "product" ? 4 : node.width - 4)} y={node.y-10} textAnchor={layer.kind === "aqueous" || node.kind === "product" ? "start" : "end"}>{layer.kind === "aqueous" ? "水層" : "エーテル層"}</text>}
              {compounds.map((compound,i)=><BenzeneStructure key={compound.id} compound={compound}
                x={node.x+node.width*(i+.5)/compounds.length} y={node.y+66}
                fieldId={`${node.id}:compound:${compound.id}`} showName={compact?.showCompoundNames} view={view} slotWidth={node.width/compounds.length} />)}
            </> : <>
              {(compact?.label ?? node.label) && <ExerciseText fieldId={`${node.id}:label`} text={compact?.label ?? node.label} className={`separation-node-title tone-${compact?.tone ?? "default"}`} x={node.x+node.width/2} y={node.y+26} anchor="middle" maxWidth={node.width-20} fontSize={19} view={view}/>}
              {(compact?.lines ?? node.lines).map((line,i) => view && compact?.lineParts?.[i]
                ? <ExerciseTextParts key={i} parts={compact.lineParts[i]} x={node.x+node.width/2} y={node.y+58+i*29} view={view}/>
                : <ExerciseText fieldId={`${node.id}:line:${i}`} text={line} x={node.x+node.width/2} y={node.y+(compact?.label === "" ? 35 : 58)+i*29} anchor="middle" maxWidth={node.width-20} view={view} key={i}/>)}
            </>}
            {compact?.caption && <ExerciseText fieldId={`${node.id}:caption`} text={compact.caption} className="separation-condition" x={node.x+node.width/2} y={node.y+node.height-8} anchor="middle" maxWidth={node.width-20} fontSize={16} view={view}/>}
          </g>;
        })}
      </svg>
    </div>
    {view && <section className="separation-supplement" aria-label="補足操作の問題">
      <h3>補足操作の確認</h3><p>図中の試薬・操作と同じ空欄番号を目印に、続く手順を確認してください。</p>
      <div className="separation-supplement-grid">{diagram.edges.map(edge=>{
        const items=view.exercise.targets.filter(target=>target.location === "supplement" && target.edgeId===edge.id);
        if(!items.length) return null;
        const context=view.exercise.targets.find(target=>target.edgeId===edge.id && target.location==="diagram" && target.blankCategory==="reagent")
          ?? view.exercise.targets.find(target=>target.edgeId===edge.id && target.location==="diagram");
        return <article key={edge.id}><h4>図中の{context ? <HtmlExerciseField fieldId={context.id} text={context.answer} view={view}/> : "処理"}の操作</h4>
          <ol>{items.map(target=><li key={target.id}><HtmlExerciseField fieldId={target.id} text={target.answer} view={view}/></li>)}</ol>
        </article>;
      })}</div>
    </section>}
    {!exercise && detailed && <section className="separation-operation-details" aria-label="分離操作の詳細">
      <h2>分離操作の詳細</h2>
      <div className="separation-operation-grid">{diagram.edges.filter(edge=>edge.operation && !edge.display?.hideLabel).map(edge=><article key={edge.id} data-operation-id={edge.operation!.id}>
        <h3>{edge.reagent?.label}</h3>
        <p className="separation-operation-context">{byId.get(edge.from)?.label} → {byId.get(edge.to)?.label}</p>
        <dl>
          {edge.reagent && edge.reagent.role !== "process" && <><dt>試薬</dt><dd data-field-id={edge.reagent.id} data-field-kind="reagent">{edge.reagent.label}{edge.reagent.alternatives?.length ? `（代替：${edge.reagent.alternatives.join(" / ")}）` : ""}</dd></>}
          {edge.condition && <><dt>条件</dt><dd data-field-id={edge.condition.id} data-field-kind="condition">{edge.condition.label}</dd></>}
          {edge.operation!.amount && <><dt>加え方・程度</dt><dd data-field-id={edge.operation!.amount.id} data-field-kind="amount">{edge.operation!.amount.label}</dd></>}
          <dt>操作</dt><dd data-field-id={edge.operation!.id} data-field-kind="operation">{edge.operation!.label}</dd>
        </dl>
        <ol>{edge.operation!.actions.map(action=><li key={action.id} data-field-id={action.id} data-field-kind="action">{action.label}</li>)}</ol>
        {edge.operation!.notes.map(note=><p key={note.id}>{note.text}</p>)}
      </article>)}</div>
    </section>}
    {!exercise && detailed && <div className="separation-details" aria-label="物質・操作の詳細">
      <h2>物質・操作の詳細</h2>
      {diagram.nodes.filter(node=>node.notes.length).map(node=><article key={node.id}>
        <h3>{node.label}</h3><p className="separation-formula">{node.formula}</p>
        {node.colorLabel && <p>沈殿色：{node.colorLabel}</p>}
        {node.notes.map(note=><p key={note.id}>{note.text}</p>)}
      </article>)}
    </div>}
    {!exercise && <><details className="separation-text"><summary>図の内容を文章で読む</summary>
      {diagram.nodes.map(node=><article key={node.id}><h3>{node.label}</h3><p>{node.formula}</p><p>{node.lines.join(" / ")}</p>
        {diagram.edges.filter(edge=>edge.from===node.id).map(edge=><p key={edge.id}>→ {edge.reagent?.label} {edge.condition?.label}{edge.operation && ` / ${edge.operation.label}`}：{byId.get(edge.to)?.label}{edge.note && `（${edge.note.text}）`}</p>)}
      </article>)}
    </details>
    <aside className="separation-notes"><h2>補足説明</h2>{diagram.notes.map(note=><p key={note.id}>{note.text}</p>)}
      <details><summary>内容の確認に用いた資料</summary>{diagram.sources.map(source=><p key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></p>)}<p>図と解説はアプリ内に保存されます。参考資料を開く場合のみ通信が必要です。</p></details>
    </aside></>}
  </section>;
}

import type { AromaticCompound } from "@/data/separation/types";
import { ExerciseText, SvgBlank, type ExerciseView } from "./ExerciseField";

/** SVG primitives remain selectable/maskable, and scale without raster assets. */
export function BenzeneStructure({ compound, x, y, fieldId, showName = false, view, slotWidth=180 }: {
  compound: AromaticCompound; x: number; y: number; fieldId: string; showName?: boolean; view?: ExerciseView; slotWidth?: number;
}) {
  const selected = view?.exercise.blankIds.includes(fieldId) ?? false;
  const masked = selected && view && !view.showAnswers;
  const hideStructure = masked && view.exercise.structurePolicy === "hide";
  const nameFont = Math.min(15,(slotWidth-12)/Math.max(1,compound.name.length));
  if (hideStructure) return <g transform={`translate(${x} ${y})`} data-compound-id={compound.id} className="separation-structure">
    <SvgBlank fieldId={fieldId} x={0} y={40} width={Math.max(55,Math.min(slotWidth-20,140))} anchor="middle" view={view}/>
  </g>;
  return <g transform={`translate(${x} ${y})`} className="separation-structure"
    data-compound-id={compound.id} data-field-id={fieldId} role="img" aria-label={masked ? "構造式（物質名は空欄）" : `${compound.name}の構造式`}>
    <title>{masked ? "構造式のヒント" : `${compound.name}：ベンゼン環に${compound.substituent}`}</title>
    <g className="benzene-bonds">
      <polygon points="0,0 30,17 30,52 0,69 -30,52 -30,17" />
      <path d="M4,9 L23,20 M23,47 L4,59 M-23,47 L-23,22" />
      <path d="M0,0 V-19" />
    </g>
    <text className={`benzene-substituent${compound.ionic ? " is-ionic" : ""}`} x="-7" y="-28">{compound.substituent}</text>
    {view && view.exercise.targets.some(target=>target.id===fieldId) ? <g style={{fontSize:nameFont}} className="separation-compound-name">
      <ExerciseText fieldId={fieldId} text={compound.name} x={0} y={90} anchor="middle" maxWidth={slotWidth-14} fontSize={nameFont} view={view}/>
    </g> : showName && <>
      <text className="benzene-name" x="0" y="102" textAnchor="middle">{compound.name}</text>
      <text className={`benzene-category category-${compound.category}`} x="0" y="127" textAnchor="middle">（{compound.category}）</text>
    </>}
  </g>;
}

import type { AromaticCompound } from "@/data/separation/types";

/** SVG primitives remain selectable/maskable, and scale without raster assets. */
export function BenzeneStructure({ compound, x, y, fieldId, showName = false }: {
  compound: AromaticCompound; x: number; y: number; fieldId: string; showName?: boolean;
}) {
  return <g transform={`translate(${x} ${y})`} className="separation-structure"
    data-compound-id={compound.id} data-field-id={fieldId} role="img" aria-label={`${compound.name}の構造式`}>
    <title>{compound.name}：ベンゼン環に{compound.substituent}</title>
    <g className="benzene-bonds">
      <polygon points="0,0 30,17 30,52 0,69 -30,52 -30,17" />
      <path d="M4,9 L23,20 M23,47 L4,59 M-23,47 L-23,22" />
      <path d="M0,0 V-19" />
    </g>
    <text className={`benzene-substituent${compound.ionic ? " is-ionic" : ""}`} x="-7" y="-28">{compound.substituent}</text>
    {showName && <>
      <text className="benzene-name" x="0" y="102" textAnchor="middle">{compound.name}</text>
      <text className={`benzene-category category-${compound.category}`} x="0" y="127" textAnchor="middle">（{compound.category}）</text>
    </>}
  </g>;
}

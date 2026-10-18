import type { Polymer } from "@/data/illustrated/types";
import type { BlankView } from "@/components/separation/ExerciseField";
import { Arrow, Canvas } from "./DiagramParts";
import { ChemicalStructure } from "./ChemicalStructure";
import { isMasked, SvgField } from "./LessonField";

export function PolymerMechanisms() {
  return <Canvas title="二重結合を使う連結と、官能基を使う連結の比較" height={245}>
    <rect className="diagram-panel" x={15} y={10} width={520} height={220}/><rect className="diagram-panel" x={565} y={10} width={520} height={220}/>
    <text x={40} y={45}>二重結合を使って連結</text>
    <text x={60} y={105} className="formula">n C=C</text><Arrow x1={205} y1={100} x2={290} y2={100}/><text x={310} y={105} className="formula">[−C−C−]ₙ</text>
    <text x={40} y={155} className="diagram-small">π結合を使い、単位の両端を隣へつなぐ</text>
    <text x={40} y={195} className="diagram-small">単純なビニルモノマーでは小分子の脱離なし</text>
    <text x={590} y={45}>官能基どうしをつなぐ</text>
    <text x={590} y={100} className="formula">−COOH ＋ HO−</text><Arrow x1={825} y1={95} x2={885} y2={95}/><text x={905} y={100} className="formula">−COO−</text>
    <text x={900} y={143} className="formula">＋ H₂O</text>
    <text x={590} y={195} className="diagram-small">両端に官能基をもつ原料なら、連結が続く</text>
  </Canvas>;
}
function Network({copolymer=false}:{copolymer?:boolean}) {
  if(copolymer)return <g className="network-scheme">
    <path d="M755 135 H1030"/>{["A","A","B","A","B","B"].map((label,i)=><g key={i}><circle cx={765+i*49} cy={135} r={18}/><text x={765+i*49} y={141} textAnchor="middle">{label}</text></g>)}
    <text className="diagram-small" x={890} y={193} textAnchor="middle">A・B：異なる原料由来の単位</text>
    <text className="diagram-small" x={890} y={219} textAnchor="middle">配列の一例（周期性は仮定しない）</text>
  </g>;
  return <g className="network-scheme"><path d="M760 90 H1020 M760 145 H1020 M760 200 H1020 M790 90 L850 145 L790 200 M970 90 L910 145 L970 200"/>
    {[90,145,200].flatMap(y=>[790,850,910,970].map(x=><circle key={`${x}-${y}`} cx={x} cy={y} r={6}/>))}
    <text className="diagram-small" x={890} y={237} textAnchor="middle">三次元網目のつながり（模式図）</text>
  </g>;
}
export function PolymerRows({items,view}:{items:Polymer[];view:BlankView}) {
  return <Canvas title="原料の構造から高分子の単位へ" height={items.length*290}>
    {items.map((p,i)=><g key={p.id} data-polymer-id={p.id} transform={`translate(0 ${i*290})`}>
      <rect className="diagram-panel" x={15} y={8} width={430} height={245}/><rect className="diagram-panel product-panel" x={715} y={8} width={370} height={245}/>
      {p.monomers.map((m,j)=><g key={m.id}>
        <SvgField field={m.name} x={p.monomers.length===1 ? 230 : 125+j*210} y={38} width={p.monomers.length===1 ? 400 : 200} view={view}/>
        <ChemicalStructure drawing={m.structure} x={p.monomers.length===1 ? 72 : 25+j*210} y={50} width={p.monomers.length===1 ? 320 : 200} height={195}/>
      </g>)}
      {p.monomers.length>1 && <text x={230} y={150} textAnchor="middle">＋</text>}
      <SvgField field={p.method} x={580} y={115} width={225} view={view}/>
      <Arrow x1={460} y1={140} x2={700} y2={140}/>
      <text className="diagram-small" x={580} y={180} textAnchor="middle">{p.family==="network" ? "架橋して網目へ" : "結合順とつながりに注目"}</text>
      <SvgField field={p.name} x={900} y={38} width={345} view={view}/>
      {p.repeat ? <ChemicalStructure drawing={p.repeat} x={730} y={53} width={340} height={190}/> : <Network copolymer={p.id==="sbr"}/>}
      <text className="diagram-small" x={30} y={278}>{isMasked(view,p.name) ? "用途は解答表示で確認" : `用途：${p.uses}`}</text>
    </g>)}
  </Canvas>;
}
export function CondensationMap({polymer:p,view}:{polymer:Polymer;view:BlankView}) {
  return <Canvas title="二官能性の原料と脱離する小分子" height={520}>
    {p.monomers.map((m,i)=><g key={m.id}>
      <SvgField field={m.name} x={255+i*590} y={36} width={460} view={view}/>
      <ChemicalStructure drawing={m.structure} x={40+i*590} y={55} width={430} height={145}/>
    </g>)}
    <text x={550} y={140} textAnchor="middle">＋</text>
    <Arrow x1={550} y1={195} x2={550} y2={280}/>
    <SvgField field={p.method} x={755} y={230} width={320} view={view}/>
    <text className="diagram-small" x={30} y={230}>{p.functionalGroups}</text>
    <text className="diagram-small" x={30} y={262}>{p.byproduct}</text>
    <SvgField field={p.name} x={550} y={315} width={750} view={view}/>
    <ChemicalStructure drawing={p.repeat!} x={185} y={335} width={730} height={160}/>
    <text className="diagram-small" x={550} y={510} textAnchor="middle">{p.repeatDescription} ／ 末端基は省略</text>
  </Canvas>;
}

import { sugarCategoryLabels } from "@/data/illustrated/carbohydrates";
import { defaultSugarStructureOptions, selectedSugarRing, sugarCyclicStructures } from "@/data/illustrated/sugarRings";
import type { Sugar, SugarStructureOptions, SugarUnit } from "@/data/illustrated/types";
import type { BlankView } from "@/components/separation/ExerciseField";
import { Arrow, Canvas } from "./DiagramParts";
import { isMasked, SvgField } from "./LessonField";
import { SugarRingSkeleton, SugarRingStructure } from "./SugarRingStructure";

const unitNames:Record<SugarUnit,string>={glucose:"G",fructose:"F",galactose:"Gal"};
export function SugarUnitIcon({unit,x,y,hidden=false}:{unit:SugarUnit;x:number;y:number;hidden?:boolean}) {
  return <g className={`sugar-unit unit-${hidden ? "masked" : unit}`}>
    <SugarRingSkeleton ring={sugarCyclicStructures[unit].primary} x={x} y={y} hidden={hidden}/>{!hidden && <text x={x} y={y+7} textAnchor="middle">{unitNames[unit]}</text>}
  </g>;
}
export function Fischer({sugar:s,x=0,y=0,scale=1}:{sugar:Sugar;x?:number;y?:number;scale?:number}) {
  if(!s.fischer)return null;
  const ketone=s.fischer.carbonyl==="ketone";
  return <g transform={`translate(${x} ${y}) scale(${scale})`} className="fischer-structure" data-fischer-id={s.id}>
    <path d="M160 50 V292"/>
    <text x={160} y={38} textAnchor="middle">{ketone ? "CH₂OH" : "CHO"}</text>
    {ketone && <><path d="M160 75 H230 M160 82 H230"/><text x={245} y={85}>O</text><rect x={149} y={67} width={22} height={27}/><text x={160} y={85} textAnchor="middle">C</text></>}
    {s.fischer.ohSides.map((side,i)=>{
      const cy=(ketone ? 130 : 80)+i*50;
      return <g key={i} data-oh-side={side}><path d={`M96 ${cy} H224`}/><text x={65} y={cy+7} textAnchor="middle">{side==="left" ? "HO" : "H"}</text><text x={255} y={cy+7} textAnchor="middle">{side==="right" ? "OH" : "H"}</text><text className="carbon-number" x={180} y={cy-10}>{i+(ketone ? 3 : 2)}</text></g>;
    })}
    <text x={160} y={318} textAnchor="middle">CH₂OH</text>
  </g>;
}
export function SugarClassification({items,view,options=defaultSugarStructureOptions}:{items:Sugar[];view:BlankView;options?:SugarStructureOptions}) {
  return <Canvas title="糖類の分類と単位数" height={810}>
    <rect className="diagram-panel" x={470} y={10} width={160} height={60}/><text x={550} y={48} textAnchor="middle">糖類</text>
    <path className="classification-line" d="M550 70 V105 H185 V135 M550 105 V135 M550 105 H915 V135"/>
    {(["mono","di","poly"] as const).map((category,col)=><g key={category}>
      <rect className="category-band" x={30+col*365} y={135} width={310} height={55}/>
      <text x={185+col*365} y={170} textAnchor="middle">{sugarCategoryLabels[category]}</text>
      <path className="classification-line" d={`M${185+col*365} 190 V200 H${20+col*365} V695`}/>
      {items.filter(s=>s.category===category).map((s,row)=><g key={s.id} data-sugar-id={s.id}>
        <path className="classification-line" d={`M${20+col*365} ${305+row*195} H${30+col*365}`}/>
        <rect className="diagram-panel" x={30+col*365} y={215+row*195} width={310} height={180}/>
        <SvgField field={s.name} x={185+col*365} y={247+row*195} width={285} view={view}/>
        {s.cyclic ? <SugarRingStructure sugar={s} x={65+col*365} y={250+row*195} width={240} height={140} compact options={{...options,showCarbonNumbers:false,showDifferenceHints:false}} view={view}/> : <>
          <path className="classification-line" d={`M${110+col*365} ${310+row*195} H${260+col*365}`}/>
          {(s.category==="di" ? s.units : ["glucose","glucose","glucose"] as SugarUnit[]).map((unit,i)=><SugarUnitIcon key={i} unit={unit} x={s.category==="di" ? 140+col*365+i*90 : 115+col*365+i*70} y={310+row*195} hidden={isMasked(view,s.composition)||isMasked(view,s.name)} />)}
          <text className="diagram-small" x={185+col*365} y={367+row*195} textAnchor="middle">{s.category==="di" ? "単糖が2個連結" : "多数の単糖が連結"}</text>
        </>}
      </g>)}
    </g>)}
  </Canvas>;
}
export function MonosaccharideStructures({items,view,options=defaultSugarStructureOptions}:{items:Sugar[];view:BlankView;options?:SugarStructureOptions}) {
  const ordered=[...items].sort((a,b)=>["glucose","galactose","fructose"].indexOf(a.id)-["glucose","galactose","fructose"].indexOf(b.id));
  return <Canvas title="六炭糖の環状構造と差異の比較" height={620}>
    {ordered.map((s,i)=>{
      const ring=selectedSugarRing(s,options.fructoseRing)!;
      const labelMasked=ring.groups.some(g=>g.answer&&isMasked(view,g.answer));
      return <g key={s.id} data-ring-comparison={s.id}>
      <rect className="diagram-panel" x={15+i*365} y={10} width={340} height={595}/>
      <SvgField field={s.name} x={185+i*365} y={45} width={300} view={view}/>
      <text className="diagram-small" x={185+i*365} y={78} textAnchor="middle">{ring.anomer}-D体 ／ {ring.ringSize}員環の例</text>
      <SugarRingStructure sugar={s} x={15+i*365} y={85} width={340} height={335} options={options} view={view}/>
      <SvgField field={s.composition} x={185+i*365} y={450} width={300} view={view}/>
      <text className="diagram-small" x={35+i*365} y={495}>アノマー炭素：</text><SvgField field={s.cyclic!.anomericPosition} x={275+i*365} y={495} width={95} view={view}/>
      {(options.showDifferenceHints || view.exercise.blankIds.includes(s.cyclic!.configuration.id)) && (!labelMasked || view.exercise.blankIds.includes(s.cyclic!.configuration.id))
        ? <SvgField field={s.cyclic!.configuration} x={185+i*365} y={545} width={300} view={view}/>
        : <text className="diagram-small" x={185+i*365} y={545} textAnchor="middle">結合と置換基の向きを比較</text>}
      <text className="diagram-small" x={185+i*365} y={583} textAnchor="middle">炭素数6 ／ {s.formula}</text>
    </g>;})}
  </Canvas>;
}
export function FischerComparison({items,view}:{items:Sugar[];view:BlankView}) {
  const ordered=[...items].sort((a,b)=>["glucose","galactose","fructose"].indexOf(a.id)-["glucose","galactose","fructose"].indexOf(b.id));
  return <Canvas title="補助図：環状構造に対応するD系列の鎖状Fischer投影" height={360}>
    {ordered.map((s,i)=><g key={s.id}>
      <rect className="diagram-panel" x={15+i*365} y={5} width={340} height={350}/>
      <SvgField field={s.name} x={185+i*365} y={35} width={300} view={view}/>
      <Fischer sugar={s} x={57+i*365} y={45} scale={.8}/>
    </g>)}
  </Canvas>;
}
export function DisaccharideHydrolysis({items,view}:{items:Sugar[];view:BlankView}) {
  return <Canvas title="二糖の構成単糖と加水分解" height={items.length*265}>
    {items.map((s,i)=><g key={s.id} transform={`translate(0 ${i*265})`}>
      <rect className="diagram-panel" x={15} y={10} width={1070} height={240}/>
      <SvgField field={s.name} x={225} y={45} width={380} view={view}/>
      <line className="classification-line" x1={160} y1={100} x2={290} y2={100}/>
      {s.units.map((unit,j)=><SugarUnitIcon key={j} unit={unit} x={160+j*130} y={100} hidden={isMasked(view,s.composition)||isMasked(view,s.name)}/>)}
      <text className="diagram-small" x={225} y={154} textAnchor="middle">{s.linkage}</text>
      <SvgField field={s.composition} x={225} y={192} width={385} view={view}/>
      <text className="diagram-small" x={500} y={65} textAnchor="middle">H₂O・酸または適切な酵素</text>
      <Arrow x1={430} y1={103} x2={650} y2={103}/>
      <text className="diagram-small" x={540} y={145} textAnchor="middle">加水分解</text>
      {s.hydrolysisProducts.map((unit,j)=><SugarUnitIcon key={j} unit={unit} x={750+j*200} y={100} hidden={isMasked(view,s.hydrolysis)||isMasked(view,s.name)}/>)}
      <text x={850} y={108} textAnchor="middle">＋</text>
      <SvgField field={s.hydrolysis} x={850} y={192} width={425} view={view}/>
      <text className="diagram-small" x={65} y={232}>還元性（加水分解前）：</text><SvgField field={s.reducing} x={355} y={232} width={140} view={view}/>
    </g>)}
  </Canvas>;
}
function Chain({x,y,branch=false,dense=false,straight=false}:{x:number;y:number;branch?:boolean;dense?:boolean;straight?:boolean}) {
  const points=Array.from({length:7},(_,i)=>[x+i*36,y+(straight?0:Math.sin(i*1.4)*17)]);
  return <g className="polysaccharide-chain">
    <path d={points.map(([px,py],i)=>`${i?"L":"M"}${px} ${py}`).join(" ")}/>
    {points.map(([px,py],i)=><g key={i}><circle cx={px} cy={py} r={9}/>{branch && (dense ? i%2===0 : i===2) && <><path d={`M${px} ${py} l22 -36 l30 -12`}/><circle cx={px+22} cy={py-36} r={8}/><circle cx={px+52} cy={py-48} r={8}/>{dense&&<path d={`M${px+22} ${py-36} l-12 -24`}/>}</>}</g>)}
  </g>;
}
export function PolysaccharideComparison({items,view}:{items:Sugar[];view:BlankView}) {
  return <Canvas title="多糖の結合・立体的なつながりと加水分解" height={690}>
    {items.map((s,i)=><g key={s.id} transform={`translate(${i*365} 0)`}>
      <rect className="diagram-panel" x={15} y={10} width={340} height={665}/>
      <SvgField field={s.name} x={185} y={48} width={305} view={view}/>
      <SvgField field={s.composition} x={185} y={90} width={295} view={view}/>
      {s.id==="starch" ? <>
        <path className="helix-scheme" d="M65 180 C65 120 115 120 115 180 S165 240 165 180 S215 120 215 180 S265 240 265 180"/>
        <text className="diagram-small" x={185} y={250} textAnchor="middle">アミロース：らせん状</text>
        <Chain x={60} y={365} branch/>
        <text className="diagram-small" x={185} y={415} textAnchor="middle">アミロペクチン：分岐あり</text>
      </> : s.id==="glycogen" ? <>
        <Chain x={60} y={225} branch dense/><Chain x={60} y={350} branch dense/>
        <text className="diagram-small" x={185} y={415} textAnchor="middle">短い間隔で多くの分岐</text>
      </> : <>
        <Chain x={60} y={180} straight/><Chain x={60} y={260} straight/><Chain x={60} y={340} straight/>
        {[0,1].flatMap(row=>[0,1,2,3,4,5].map(n=><path key={`${row}-${n}`} className="hydrogen-bond" d={`M${60+n*36} ${192+row*80} v55`}/>))}
        <text className="diagram-small" x={185} y={415} textAnchor="middle">直鎖が水素結合で束になる</text>
      </>}
      <text className="diagram-small" x={185} y={455} textAnchor="middle">{s.id==="cellulose" ? "β(1→4)結合" : "α(1→4)結合・α(1→6)分岐"}</text>
      <Arrow x1={185} y1={485} x2={185} y2={540}/>
      <text className="diagram-small" x={270} y={515} textAnchor="middle">完全加水分解</text>
      <SvgField field={s.hydrolysis} x={185} y={580} width={310} view={view}/>
      <text className="diagram-small" x={185} y={630} textAnchor="middle">いずれも (C₆H₁₀O₅)ₙ</text>
    </g>)}
  </Canvas>;
}

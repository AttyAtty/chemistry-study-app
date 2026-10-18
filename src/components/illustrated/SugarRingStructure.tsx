import type { Sugar, SugarRing, SugarStructureOptions } from "@/data/illustrated/types";
import { defaultSugarStructureOptions, selectedSugarRing } from "@/data/illustrated/sugarRings";
import { ExerciseText, type BlankView } from "@/components/separation/ExerciseField";

/** Haworth projections with explicit substituents; an educational projection, not a chair conformation. */
export function SugarRingStructure({sugar,x=0,y=0,width=380,height=365,options=defaultSugarStructureOptions,view,compact=false}: {
  sugar:Sugar;x?:number;y?:number;width?:number;height?:number;options?:SugarStructureOptions;view:BlankView;compact?:boolean;
}) {
  const ring=selectedSugarRing(sugar,options.fructoseRing);
  if(!ring)return null;
  const atoms=new Map(ring.atoms.map(atom=>[atom.id,atom]));
  const emphasizedAtoms=options.highlightedAtoms??ring.highlightedAtoms;
  const emphasizedGroups=options.highlightedGroups??ring.highlightedGroups;
  const emphasis=options.showDifferenceHints&&!compact;
  const anomer=atoms.get(ring.anomericAtomId)!;
  return <svg x={x} y={y} width={width} height={height} viewBox="0 0 380 365" className="sugar-ring-drawing" role="img" aria-label={`${ring.ringSize}員環のHaworth投影`} data-ring-id={ring.id} data-anomer={ring.anomer} data-ring-size={ring.ringSize}>
    <title>{`${ring.anomer}-D体の環状構造の一例`}</title>
    {ring.atoms.map((a,i)=>{
      const b=ring.atoms[(i+1)%ring.atoms.length];
      const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy),pad=12;
      const front=ring.frontEdges.some(([from,to])=>(from===a.id&&to===b.id)||(from===b.id&&to===a.id));
      return <line key={`${a.id}-${b.id}`} className={front ? "ring-front-bond" : ""} x1={a.x+dx/length*pad} y1={a.y+dy/length*pad} x2={b.x-dx/length*pad} y2={b.y-dy/length*pad}/>;
    })}
    {emphasis && <circle className="anomeric-position" cx={anomer.x} cy={anomer.y} r={21} data-anomeric-atom={ring.anomericAtomId}/>}
    {ring.groups.map(group=>{
      const from=atoms.get(group.from)!;
      const highlighted=emphasis&&emphasizedGroups.includes(group.id);
      const masked=group.answer&&view.exercise.blankIds.includes(group.answer.id)&&!view.showAnswers;
      const dx=group.x-from.x,dy=group.y-from.y,length=Math.hypot(dx,dy);
      const boxWidth=group.label==="CH₂OH" ? 78 : 48;
      return <g key={group.id} data-group-id={group.id} data-direction={group.direction} data-highlighted={highlighted ? "true" : undefined} className={highlighted ? "structure-emphasis" : ""}>
        <line x1={from.x+dx/length*14} y1={from.y+dy/length*14} x2={group.x-dx/length*15} y2={group.y-dy/length*15}/>
        {highlighted && <rect x={group.x-boxWidth/2} y={group.y-17} width={boxWidth} height={34} rx={2}/>}
        {group.answer ? <ExerciseText fieldId={group.answer.id} text={group.label} x={group.x} y={group.y+7} anchor="middle" maxWidth={44} fontSize={20} kind="phrase" view={view}/>
          : <text x={group.x} y={group.y} textAnchor="middle" dominantBaseline="central">{group.label}</text>}
        {options.showCarbonNumbers && !compact && group.carbonNumber && <text className="ring-carbon-number" x={group.x-20} y={group.y-24}>{group.carbonNumber}</text>}
        {masked && <title>置換基のラベルは空欄</title>}
      </g>;
    })}
    {ring.atoms.map(a=><g key={a.id} data-ring-atom={a.id} data-highlighted={emphasis&&emphasizedAtoms.includes(a.id) ? "true" : undefined}>
      <text className={emphasis&&emphasizedAtoms.includes(a.id) ? "emphasized-atom" : undefined} x={a.x} y={a.y} textAnchor="middle" dominantBaseline="central">{a.label}</text>
      {options.showCarbonNumbers && !compact && a.carbonNumber && <text className="ring-carbon-number" x={a.x+(a.x>200 ? 16 : -23)} y={a.y+(a.y>220 ? 25 : -15)}>{a.carbonNumber}</text>}
    </g>)}
  </svg>;
}

/** Ring skeletons identify the parent unit without claiming to draw a complete disaccharide. */
export function SugarRingSkeleton({ring,x,y,width=65,hidden=false}:{ring:SugarRing;x:number;y:number;width?:number;hidden?:boolean}) {
  const points=ring.ringSize===6 ? "8,30 23,8 48,8 63,30 48,52 23,52" : "8,25 36,6 63,25 54,52 18,52";
  const oxygenX=ring.ringSize===6 ? 48 : 36;
  return <svg x={x-width/2} y={y-28} width={width} height={56} viewBox="0 0 72 60" className="sugar-ring-skeleton" aria-label={hidden ? "単糖の環骨格" : `${ring.ringSize}員環の単糖骨格`} data-skeleton-size={ring.ringSize}>
    <polygon points={points}/><rect x={oxygenX-9} y={0} width={18} height={17}/><text x={oxygenX} y={13} textAnchor="middle">O</text>
  </svg>;
}

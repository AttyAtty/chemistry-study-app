import type { MolecularDrawing } from "@/data/illustrated/types";

/** Bonds and atoms are independent SVG elements; no raster or external renderer. */
export function ChemicalStructure({drawing,x=0,y=0,width=drawing.width,height=drawing.height}:{drawing:MolecularDrawing;x?:number;y?:number;width?:number;height?:number}) {
  const atoms=new Map(drawing.atoms.map(a=>[a.id,a]));
  return <svg x={x} y={y} width={width} height={height} viewBox={`0 0 ${drawing.width} ${drawing.height}`} className="molecular-drawing" data-structure-id={drawing.id} aria-label="結合と官能基の構造図" role="img">
    {drawing.bonds.map(b=>{
      const from=atoms.get(b.from)!,to=atoms.get(b.to)!;
      const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy),ux=dx/length,uy=dy/length;
      const pad=(label:string)=>label ? Math.min(48,Math.max(13,[...label].length*6+5)) : 0;
      const start=pad(from.label),end=pad(to.label);
      return <g key={b.id} data-bond-id={b.id}>{Array.from({length:b.order},(_,i)=>{
        const offset=(i-(b.order-1)/2)*5;
        return <line key={i} x1={from.x+ux*start-uy*offset} y1={from.y+uy*start+ux*offset} x2={to.x-ux*end-uy*offset} y2={to.y-uy*end+ux*offset}/>;
      })}</g>;
    })}
    {drawing.atoms.filter(a=>a.label).map(a=><text key={a.id} x={a.x} y={a.y} textAnchor="middle" dominantBaseline="central" className={a.role ? `atom-${a.role}` : undefined} data-atom-id={a.id}>{a.label}</text>)}
    {drawing.repeat && <g className="repeat-bracket" data-repeat-bracket="true">
      <path d={`M${drawing.repeat.left+12},${drawing.repeat.top} h-12 v${drawing.repeat.bottom-drawing.repeat.top} h12 M${drawing.repeat.right-12},${drawing.repeat.top} h12 v${drawing.repeat.bottom-drawing.repeat.top} h-12`}/>
      <text x={drawing.repeat.right+12} y={drawing.repeat.bottom+3}>n</text>
    </g>}
  </svg>;
}

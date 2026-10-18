import type { ReactNode } from "react";
import { Arrow } from "./DiagramParts";
import { graphScale } from "@/lib/theoryModels";

export type PlotSpec={xDomain:[number,number];yDomain:[number,number];xTicks:number[];yTicks:number[];xLabel:string;yLabel:string};
export function plotCoordinates(spec:PlotSpec){return {x:graphScale(spec.xDomain,[135,970]),y:graphScale(spec.yDomain,[345,65])};}
/** Fixed plot margins keep axes, units, ticks and overlays inside the printable SVG. */
export function CartesianPlot({spec,points,children}:{spec:PlotSpec;points:[number,number][];children?:ReactNode}) {
 const {x,y}=plotCoordinates(spec);
 return <g className="theory-plot"><text x={135} y={27} className="plot-axis-title">{spec.yLabel}</text>
  {spec.xTicks.map(t=><g key={t}><line x1={x(t)} y1={65} x2={x(t)} y2={345} className="plot-grid"/><text x={x(t)} y={371} textAnchor="middle">{t}</text></g>)}
  {spec.yTicks.map(t=><g key={t}><line x1={135} y1={y(t)} x2={970} y2={y(t)} className="plot-grid"/><text x={117} y={y(t)+6} textAnchor="end">{t}</text></g>)}
  <Arrow x1={135} y1={345} x2={995} y2={345}/><Arrow x1={135} y1={345} x2={135} y2={48}/>
  <text x={965} y={410} textAnchor="end" className="plot-axis-title">{spec.xLabel}</text>
  <polyline data-plot-curve="true" points={points.map(([px,py])=>`${x(px)},${y(py)}`).join(" ")} className="plot-curve"/>{children}
 </g>;
}

/** Counts are visual symbols, not a molecular simulation or a concentration scale. */
export function ParticleVessel({x=0,y=0,width=220,height=200,liquidParticles=12,gasParticles=0,crystals=0,closed=false,evaporating=false,condensing=false,condensationFraction=1,bubbles=false}:{x?:number;y?:number;width?:number;height?:number;liquidParticles?:number;gasParticles?:number;crystals?:number;closed?:boolean;evaporating?:boolean;condensing?:boolean;condensationFraction?:number;bubbles?:boolean}) {
 const liquidY=height*.55;
 return <g transform={`translate(${x} ${y})`} className="particle-vessel" data-liquid-particles={liquidParticles} data-gas-particles={gasParticles} data-crystals={crystals}>
  <path d={`M10 5 V${height} H${width-10} V5`} className="vessel-wall"/>
  {closed&&<line x1={10} y1={5} x2={width-10} y2={5} className="vessel-lid"/>}
  <rect x={12} y={liquidY} width={width-24} height={height-liquidY-2} fill="#e4f0f6"/>
  {Array.from({length:liquidParticles},(_,i)=><circle key={`l${i}`} className="liquid-particle" cx={27+(i%8)*(width-54)/7} cy={liquidY+18+Math.floor(i/8)*19} r={4}/>)}
  {Array.from({length:gasParticles},(_,i)=><circle key={`g${i}`} className="gas-particle" cx={29+(i%6)*(width-58)/5} cy={25+Math.floor(i/6)*20} r={4}/>)}
  {Array.from({length:crystals},(_,i)=><rect key={`c${i}`} x={24+i*19} y={height-13} width={12} height={9} className="crystal-particle"/>)}
  {evaporating&&<Arrow x1={width*.35} y1={liquidY+9} x2={width*.35} y2={liquidY-35}/>}
  {condensing&&<Arrow x1={width*.65} y1={liquidY-35*condensationFraction} x2={width*.65} y2={liquidY+9}/>}
  {bubbles&&[0,1,2].map(i=><circle key={i} cx={width*.7-i*18} cy={height-27-i*19} r={7+i*2} className="vapor-bubble"/>)}
 </g>;
}
export function InteractivePrintPair({interactive,printable}:{interactive:ReactNode;printable:ReactNode}){return <><div className="theory-interactive no-print">{interactive}</div><div className="theory-print-only" aria-hidden="true">{printable}</div></>;}

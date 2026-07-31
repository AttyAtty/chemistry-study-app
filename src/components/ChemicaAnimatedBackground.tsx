"use client";

import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

type MotifType = "formula"|"reaction"|"benzene"|"molecule"|"flask"|"test-tube"|"beaker"|"battery"|"electrolysis"|"bubble";
type ChemistryMotif = { id:string; type:MotifType; content?:string; size:number; opacity:number; duration:number; delay:number; startX:number; driftX:number; rotation:number; color:string };

const motifs: ChemistryMotif[] = [
  {id:"water",type:"formula",content:"H₂O",size:28,opacity:.12,duration:31,delay:-12,startX:7,driftX:24,rotation:4,color:"#73b9dc"},
  {id:"copper",type:"formula",content:"Cu²⁺",size:21,opacity:.11,duration:26,delay:-20,startX:89,driftX:-18,rotation:-3,color:"#7797dd"},
  {id:"sulfate",type:"formula",content:"SO₄²⁻",size:24,opacity:.09,duration:39,delay:-4,startX:19,driftX:15,rotation:3,color:"#9a84d1"},
  {id:"ammonia",type:"formula",content:"NH₃",size:19,opacity:.12,duration:24,delay:-31,startX:75,driftX:-14,rotation:-4,color:"#d881a9"},
  {id:"ions",type:"formula",content:"Na⁺  Cl⁻",size:17,opacity:.1,duration:29,delay:-8,startX:47,driftX:20,rotation:2,color:"#d39d4e"},
  {id:"neutralize",type:"reaction",content:"H⁺ + OH⁻ → H₂O",size:19,opacity:.09,duration:48,delay:-34,startX:4,driftX:32,rotation:2,color:"#6cbda8"},
  {id:"daniel",type:"reaction",content:"Zn + Cu²⁺ → Zn²⁺ + Cu",size:17,opacity:.08,duration:55,delay:-17,startX:58,driftX:-28,rotation:-2,color:"#8f83ce"},
  {id:"silver",type:"reaction",content:"Ag⁺ + Cl⁻ → AgCl↓",size:16,opacity:.09,duration:43,delay:-2,startX:29,driftX:24,rotation:2,color:"#d98baa"},
  {id:"benzene",type:"benzene",size:112,opacity:.09,duration:67,delay:-41,startX:83,driftX:-35,rotation:24,color:"#80aee0"},
  {id:"molecule",type:"molecule",size:108,opacity:.12,duration:46,delay:-25,startX:12,driftX:30,rotation:-18,color:"#d783aa"},
  {id:"flask",type:"flask",size:116,opacity:.13,duration:62,delay:-9,startX:68,driftX:-22,rotation:8,color:"#65bfa8"},
  {id:"tube",type:"test-tube",size:76,opacity:.14,duration:35,delay:-28,startX:39,driftX:18,rotation:12,color:"#d59b54"},
  {id:"beaker",type:"beaker",size:94,opacity:.12,duration:52,delay:-46,startX:93,driftX:-25,rotation:-7,color:"#849bd8"},
  {id:"battery",type:"battery",size:118,opacity:.1,duration:59,delay:-15,startX:22,driftX:28,rotation:4,color:"#bc7fa9"},
  {id:"electrolysis",type:"electrolysis",size:124,opacity:.08,duration:70,delay:-53,startX:54,driftX:-30,rotation:-4,color:"#67b9c0"},
  {id:"bubble1",type:"bubble",size:24,opacity:.14,duration:22,delay:-7,startX:16,driftX:18,rotation:0,color:"#8cc9ff"},
  {id:"bubble2",type:"bubble",size:15,opacity:.12,duration:27,delay:-18,startX:63,driftX:-12,rotation:0,color:"#c5a6ff"},
  {id:"bubble3",type:"bubble",size:32,opacity:.1,duration:34,delay:-29,startX:84,driftX:20,rotation:0,color:"#a6f2d5"},
  {id:"bubble4",type:"bubble",size:11,opacity:.15,duration:21,delay:-3,startX:34,driftX:-10,rotation:0,color:"#ffb27a"},
];

function MotifGraphic({ motif }: { motif: ChemistryMotif }): ReactNode {
  if (motif.type === "formula" || motif.type === "reaction") return <span>{motif.content}</span>;
  if (motif.type === "bubble") return <i/>;
  const common = { viewBox:"0 0 120 120", "aria-hidden":true };
  if (motif.type === "benzene") return <svg {...common}><path d="M60 12 101 36v48L60 108 19 84V36Z"/><circle cx="60" cy="60" r="31"/></svg>;
  if (motif.type === "molecule") return <svg {...common}><circle cx="18" cy="64" r="11"/><circle cx="61" cy="28" r="15"/><circle cx="102" cy="72" r="12"/><path d="m27 57 23-19m23 1 20 23"/></svg>;
  if (motif.type === "flask") return <svg {...common}><path d="M43 7h34M49 7v39L20 96c-7 12 2 18 14 18h52c12 0 21-6 14-18L71 46V7M30 89h60"/><path d="M30 90c18-9 38 8 60 0"/></svg>;
  if (motif.type === "test-tube") return <svg {...common}><path d="M36 10h48M44 10v78c0 18 32 18 32 0V10M45 72h30"/></svg>;
  if (motif.type === "beaker") return <svg {...common}><path d="M25 12h70M32 12v86c0 9 7 14 16 14h24c9 0 16-5 16-14V12M33 77h54"/><path d="M33 79c17-8 34 7 54 0"/></svg>;
  if (motif.type === "battery") return <svg {...common}><path d="M15 30h90v64H15zM36 18v58M84 18v58M36 24h48"/><path d="M27 87h18m-9-9v18M76 87h18"/></svg>;
  return <svg {...common}><path d="M12 22h96v78H12zM38 12v67M82 12v67M38 18h44"/><circle cx="31" cy="83" r="4"/><circle cx="89" cy="83" r="4"/><path d="M22 91h76"/></svg>;
}

export function ChemicaAnimatedBackground() {
  const pathname = usePathname();
  const variant = pathname === "/" ? "entrance" : pathname === "/home" ? "home" : "content";
  return <div className={`chemica-animated-background background-${variant}`} aria-hidden="true">
    <div className="animated-background-wash"/>
    {motifs.map(motif => <div className={`chemistry-motif motif-${motif.type}`} key={motif.id} style={{
      "--motif-x":`${motif.startX}%`, "--motif-size":`${motif.size}px`, "--motif-opacity":motif.opacity,
      "--motif-duration":`${motif.duration}s`, "--motif-delay":`${motif.delay}s`, "--motif-drift":`${motif.driftX}px`,
      "--motif-rotation":`${motif.rotation}deg`, "--motif-color":motif.color,
    } as CSSProperties}><MotifGraphic motif={motif}/></div>)}
  </div>;
}

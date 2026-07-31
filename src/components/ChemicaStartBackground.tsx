import type { CSSProperties } from "react";

const motifs = ["H₂O","Na⁺","Cl⁻","NH₃","CO₂","SO₄²⁻","OH⁻","H⁺","C₆H₆"];

export function ChemicaStartBackground() {
  return <div className="start-background" aria-hidden="true">
    <div className="start-aurora aurora-one"/><div className="start-aurora aurora-two"/>
    {motifs.map((motif,index) => <span className="floating-formula" key={motif} style={{
      "--float-x":`${7 + (index * 13) % 87}%`,
      "--float-duration":`${38 + (index % 4) * 8}s`,
      "--float-delay":`${-7 - index * 6}s`,
      "--float-size":`${17 + (index % 3) * 7}px`,
    } as CSSProperties}>{motif}</span>)}
    <svg className="floating-motif motif-ring" viewBox="0 0 110 110"><path d="M80 83 53 99 20 80 19 43 51 24 81 42"/><circle cx="19" cy="43" r="6"/><circle cx="20" cy="80" r="6"/><circle cx="53" cy="99" r="6"/><circle cx="80" cy="83" r="6"/><circle cx="81" cy="42" r="6"/></svg>
    <svg className="floating-motif motif-flask" viewBox="0 0 100 120"><path d="M37 6h26M42 6v38L17 91c-7 14 2 23 16 23h34c14 0 23-9 16-23L58 44V6M27 86h46"/></svg>
    <svg className="floating-motif motif-molecule" viewBox="0 0 120 90"><circle cx="15" cy="45" r="10"/><circle cx="60" cy="18" r="14"/><circle cx="104" cy="56" r="11"/><path d="m24 39 24-14m24 3 23 20"/></svg>
    <div className="start-bubbles">{Array.from({length:8},(_,index)=><i key={index}/>)}</div>
  </div>;
}

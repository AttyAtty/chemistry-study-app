import type { ReactNode } from "react";

export function Canvas({title,width=1100,height,children}:{title:string;width?:number;height:number;children:ReactNode}) {
  return <div className="illustrated-scroll" role="region" aria-label={`${title}（横スクロール可）`} tabIndex={0}>
    <svg className="illustrated-diagram" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
      <title>{title}</title>{children}
    </svg>
  </div>;
}
export function Arrow({x1,y1,x2,y2}:{x1:number;y1:number;x2:number;y2:number}) {
  const length=Math.hypot(x2-x1,y2-y1),ux=(x2-x1)/length,uy=(y2-y1)/length;
  return <g className="illustrated-arrow"><line x1={x1} y1={y1} x2={x2-ux*10} y2={y2-uy*10}/>
    <polygon points={`${x2},${y2} ${x2-ux*12-uy*5},${y2-uy*12+ux*5} ${x2-ux*12+uy*5},${y2-uy*12-ux*5}`}/></g>;
}
export function Sheet({title,children,className=""}:{title:string;children:ReactNode;className?:string}) {
  return <section className={`illustrated-sheet ${className}`} data-print-sheet="true"><h2>{title}</h2>{children}</section>;
}

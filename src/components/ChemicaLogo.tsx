import { useId } from "react";

export type ChemicaMarkState = "idle" | "connecting" | "connected" | "loading";
type LogoProps = { variant?: "header" | "hero"; showTagline?: boolean; markState?: ChemicaMarkState };

export function ChemicaMark({ className = "", state = "connected" }: { className?: string; state?: ChemicaMarkState }) {
  const gradientId = useId().replace(/:/g, "");
  const links = [
    { d:"M43 23 16 40", from:"#8cc9ff", to:"#a6f2d5" },
    { d:"M16 40 17 72", from:"#a6f2d5", to:"#8cc9ff" },
    { d:"M17 72 45 88", from:"#8cc9ff", to:"#ff9bc4" },
    { d:"M45 88 68 75", from:"#ff9bc4", to:"#ffd776" },
    { d:"M43 23 69 38", from:"#8cc9ff", to:"#c5a6ff" },
  ];
  return <svg className={`chemica-mark chemica-mark-${state} ${className}`} viewBox="0 0 92 104" role="img" aria-label="Chemicaの環状Cマーク">
    <defs>{links.map((link,index)=><linearGradient id={`${gradientId}-${index}`} x1="0" y1="0" x2="1" y2="1" key={index}><stop stopColor={link.from}/><stop offset="1" stopColor={link.to}/></linearGradient>)}</defs>
    <g className="chemica-mark-motion">
      <g className="chemica-mark-links">{links.map((link,index)=><path className={`chemica-link chemica-link-${index+1}`} d={link.d} fill="none" stroke={`url(#${gradientId}-${index})`} strokeWidth="8" strokeLinecap="round" pathLength="1" key={link.d}/>)}</g>
      <g className="chemica-mark-dots">
        <circle cx="43" cy="23" r="8" fill="#fff" stroke="#8cc9ff" strokeWidth="5"/><circle cx="16" cy="40" r="8" fill="#a6f2d5"/><circle cx="17" cy="72" r="8" fill="#8cc9ff"/><circle cx="45" cy="88" r="8" fill="#ff9bc4"/><circle cx="68" cy="75" r="8" fill="#ffd776"/><circle cx="69" cy="38" r="8" fill="#c5a6ff"/>
      </g>
    </g>
  </svg>;
}

export function ChemicaLoadingMark({ label = "読み込み中" }: { label?: string }) {
  return <span className="chemica-loading-mark" role="status" aria-live="polite"><ChemicaMark state="loading"/><span>{label}</span></span>;
}

export function ChemicaLogo({ variant = "header", showTagline = false, markState = "connected" }: LogoProps) {
  return <span className={`chemica-logo chemica-logo-${variant}`} aria-label="Chemica">
    <span className="chemica-wordmark"><ChemicaMark state={markState}/><strong>hemica</strong></span>
    {showTagline && <small>化学の、<span>味方に。</span></small>}
  </span>;
}

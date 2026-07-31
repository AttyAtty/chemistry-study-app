type LogoProps = { variant?: "header" | "hero"; showTagline?: boolean };

export function ChemicaMark({ className = "" }: { className?: string }) {
  return <svg className={`chemica-mark ${className}`} viewBox="0 0 92 92" role="img" aria-label="Chemicaの環状Cマーク">
    <path d="M68 75 45 88 17 72 16 40 43 23 69 38" fill="none" stroke="url(#chemica-ring)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="43" cy="23" r="8" fill="#fff" stroke="#8cc9ff" strokeWidth="5"/><circle cx="16" cy="40" r="8" fill="#a6f2d5"/><circle cx="17" cy="72" r="8" fill="#8cc9ff"/><circle cx="45" cy="88" r="8" fill="#ff9bc4"/><circle cx="68" cy="75" r="8" fill="#ffd776"/><circle cx="69" cy="38" r="8" fill="#c5a6ff"/>
    <defs><linearGradient id="chemica-ring" x1="10" y1="22" x2="75" y2="86" gradientUnits="userSpaceOnUse"><stop stopColor="#a6f2d5"/><stop offset=".25" stopColor="#8cc9ff"/><stop offset=".52" stopColor="#c5a6ff"/><stop offset=".76" stopColor="#ff9bc4"/><stop offset="1" stopColor="#ffd776"/></linearGradient></defs>
  </svg>;
}

export function ChemicaLogo({ variant = "header", showTagline = false }: LogoProps) {
  return <span className={`chemica-logo chemica-logo-${variant}`} aria-label="Chemica">
    <span className="chemica-wordmark"><ChemicaMark/><strong>hemica</strong></span>
    {showTagline && <small>化学を、<span>味方に。</span></small>}
  </span>;
}

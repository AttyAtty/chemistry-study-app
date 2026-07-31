export function ChemicaBackground() {
  return <div className="chemica-background" aria-hidden="true">
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <g className="chem-bg-formulas">
        <text x="55" y="115" className="mint large">H₂O</text>
        <text x="1310" y="105" className="lavender">Cu²⁺</text>
        <text x="1410" y="315" className="pink large">NH₃</text>
        <text x="45" y="430" className="blue">SO₄²⁻</text>
        <text x="1315" y="585" className="yellow">H⁺ + OH⁻ → H₂O</text>
        <text x="80" y="770" className="pink">2H₂ + O₂ → 2H₂O</text>
        <text x="1240" y="900" className="mint large">CO₂</text>
        <text x="415" y="965" className="lavender">CH₄ + 2O₂ → CO₂ + 2H₂O</text>
      </g>
      <g className="chem-bg-lines blue-stroke" transform="translate(105 195)">
        <path d="M0 45 38 22l38 23v44l-38 23L0 89Z"/><circle cx="38" cy="67" r="28"/>
      </g>
      <g className="chem-bg-lines lavender-stroke" transform="translate(1370 700)">
        <path d="M0 45 38 22l38 23v44l-38 23L0 89Z"/><path d="m76 45 38-23 38 23v44l-38 23-38-23"/>
      </g>
      <g className="chem-bg-lines mint-stroke" transform="translate(215 845)">
        <circle cx="0" cy="20" r="13"/><circle cx="58" cy="0" r="18"/><circle cx="102" cy="42" r="12"/><path d="M12 16 41 6M72 14l20 20"/>
      </g>
      <g className="chem-bg-lines pink-stroke" transform="translate(1370 165)">
        <circle cx="0" cy="20" r="13"/><circle cx="58" cy="0" r="18"/><circle cx="102" cy="42" r="12"/><path d="M12 16 41 6M72 14l20 20"/>
      </g>
      <g className="chem-bg-apparatus yellow-stroke" transform="translate(50 535)">
        <path d="M35 0v50L5 108c-8 16 3 31 20 31h78c17 0 28-15 20-31L93 50V0M28 0h72M20 102h90"/>
        <path d="M20 104c25-15 55 13 89-1" className="liquid"/>
      </g>
      <g className="chem-bg-apparatus blue-stroke" transform="translate(1430 420)">
        <path d="M0 0h90M12 0v112c0 17 13 28 33 28s33-11 33-28V0M13 86h64"/><path d="M14 88c18-9 40 10 63 0" className="liquid"/>
      </g>
      <g className="chem-bg-apparatus mint-stroke" transform="translate(1190 185)">
        <path d="M20 0v62C-12 93-2 140 42 140s54-47 22-78V0M12 0h60M8 105h68"/>
      </g>
      <g className="chem-bg-cell lavender-stroke" transform="translate(265 315)">
        <path d="M0 25h126v90H0zM28 0v88M98 0v88M28 8h70"/><text x="19" y="108">−</text><text x="91" y="108">＋</text>
      </g>
      <g className="chem-bg-dots">
        <circle cx="215" cy="130" r="7" className="pink-fill"/><circle cx="280" cy="95" r="12" className="yellow-fill"/>
        <circle cx="1260" cy="360" r="9" className="mint-fill"/><circle cx="1510" cy="820" r="13" className="blue-fill"/>
        <circle cx="365" cy="705" r="8" className="lavender-fill"/><circle cx="1170" cy="770" r="7" className="pink-fill"/>
      </g>
    </svg>
  </div>;
}

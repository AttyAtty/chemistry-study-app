type Substituent = { position: number; label: string; tone?: "red" | "blue" };

const structures: Array<[RegExp, Substituent[]]> = [
  [/^ベンゼン$/, []],
  [/^ニトロベンゼン$/, [{ position: 0, label: "NO₂", tone: "red" }]],
  [/^アニリン$/, [{ position: 0, label: "NH₂", tone: "blue" }]],
  [/^アニリン塩酸塩$/, [{ position: 0, label: "NH₃⁺", tone: "blue" }, { position: 3, label: "Cl⁻" }]],
  [/^フェノール$/, [{ position: 0, label: "OH", tone: "red" }]],
  [/^クロロベンゼン$/, [{ position: 0, label: "Cl" }]],
  [/^ベンゼンスルホン酸$/, [{ position: 0, label: "SO₃H", tone: "red" }]],
  [/^塩化ベンゼンジアゾニウム$/, [{ position: 0, label: "N₂⁺", tone: "blue" }, { position: 3, label: "Cl⁻" }]],
  [/^ナトリウムフェノキシド$/, [{ position: 0, label: "ONa", tone: "red" }]],
  [/^サリチル酸ナトリウム$/, [{ position: 0, label: "OH", tone: "red" }, { position: 1, label: "COONa", tone: "red" }]],
  [/^サリチル酸$/, [{ position: 0, label: "OH", tone: "red" }, { position: 1, label: "COOH", tone: "red" }]],
  [/^2,4,6-トリブロモフェノール$/, [{ position: 0, label: "OH", tone: "red" }, { position: 1, label: "Br" }, { position: 3, label: "Br" }, { position: 5, label: "Br" }]],
  [/^2,4,6-トリブロモアニリン$/, [{ position: 0, label: "NH₂", tone: "blue" }, { position: 1, label: "Br" }, { position: 3, label: "Br" }, { position: 5, label: "Br" }]],
  [/^ピクリン酸$/, [{ position: 0, label: "OH", tone: "red" }, { position: 1, label: "NO₂", tone: "red" }, { position: 3, label: "NO₂", tone: "red" }, { position: 5, label: "NO₂", tone: "red" }]],
];

export function isAromaticCompound(name: string) {
  return structures.some(([pattern]) => pattern.test(name));
}

export function AromaticStructure({ name }: { name: string }) {
  const match = structures.find(([pattern]) => pattern.test(name));
  if (!match) return null;
  const points = [[55,9],[81,24],[81,54],[55,69],[29,54],[29,24]];
  const outer = [[55,-1],[98,18],[98,60],[55,79],[12,60],[12,18]];
  return <svg className="aromatic-structure" viewBox="0 -8 110 94" role="img" aria-label={`${name}の構造式`}>
    <polygon points={points.map(point=>point.join(",")).join(" ")} />
    <circle cx="55" cy="39" r="20" />
    {match[1].map((sub,index) => {
      const [x1,y1]=points[sub.position]; const [x2,y2]=outer[sub.position];
      const anchor = x2 < 35 ? "end" : x2 > 75 ? "start" : "middle";
      const tx = x2 < 35 ? x2-2 : x2 > 75 ? x2+2 : x2;
      const ty = sub.position === 0 ? y2-2 : sub.position === 3 ? y2+8 : y2+4;
      return <g key={`${sub.label}-${index}`}><line x1={x1} y1={y1} x2={x2} y2={y2}/><text className={sub.tone??""} x={tx} y={ty} textAnchor={anchor}>{sub.label}</text></g>;
    })}
  </svg>;
}

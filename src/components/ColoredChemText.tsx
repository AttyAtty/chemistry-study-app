import type { ReactNode } from "react";

const colors: Array<[string, string]> = [
  ["[Cu(NH₃)₄]²⁺", "#173b91"], ["[Fe(SCN)ₙ]⁽³⁻ⁿ⁾", "#a9132b"],
  ["Cr³⁺", "#3f8a58"], ["Mn²⁺", "#d993a8"], ["Co²⁺", "#cc4f62"],
  ["MnO₄⁻", "#8b1a9b"], ["Cr₂O₇²⁻", "#e46f18"], ["CrO₄²⁻", "#c69a00"],
  ["Cu²⁺", "#1673c9"], ["Cu(OH)₂", "#289dcc"], ["[Cu(NH₃)₄]²⁺", "#243b91"],
  ["Fe²⁺", "#5b9b70"], ["Fe³⁺", "#a36b22"], ["Fe(OH)₂", "#78a68a"], ["Fe(OH)₃", "#a8452d"],
  ["Ni²⁺", "#24875a"], ["AgBr", "#b89b41"], ["AgI", "#c79c00"], ["AgCl", "#64748b"],
  ["CdS", "#c69a00"], ["CuS", "#111827"], ["ZnS", "#64748b"],
  ["Co²⁺", "#d45a89"], ["[FeSCN]²⁺", "#b5162b"],
  ["淡青紫色", "#7566b5"], ["濃青色", "#173b91"], ["赤橙色", "#d95c20"], ["淡桃色", "#d993a8"],
  ["灰緑色", "#627c68"], ["暗赤色", "#922d35"], ["暗褐色", "#59413a"], ["黒褐色", "#3e302c"],
  ["赤紫色", "#8b1a9b"], ["血赤色", "#b5162b"], ["赤褐色", "#a8452d"], ["黄褐色", "#a36b22"],
  ["青白色", "#289dcc"], ["青緑色", "#008b87"], ["淡緑色", "#5b9b70"], ["緑白色", "#78a68a"],
  ["黄緑色", "#78a800"], ["淡黄色", "#b89b41"], ["橙赤色", "#db572a"], ["橙色", "#e46f18"],
  ["紅色", "#c83253"], ["紫色", "#7445a5"], ["黄色", "#c69a00"], ["青色", "#1673c9"],
  ["緑色", "#24875a"], ["赤色", "#d63838"], ["黒色", "#111827"], ["白色", "#64748b"],
];

const pattern = new RegExp(`(${colors.map(([token]) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
const lookup = new Map(colors);

export function ColoredChemText({ children }: { children: string }): ReactNode {
  return children.split(pattern).map((part, index) => {
    const color = lookup.get(part);
    return color ? <span className={`chemical-color ${part.endsWith("色") ? "color-chip" : ""}`} style={{ color }} key={`${part}-${index}`}>{part}</span> : part;
  });
}

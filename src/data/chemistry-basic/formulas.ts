import type { FormulaReference } from "./types";

export const chemistryBasicFormulas: FormulaReference[] = [
  { title: "中性子数", formula: "中性子数 = 質量数 − 原子番号", meaning: "核種の中性子数を求める", condition: "質量数A、原子番号Zを使う" },
  { title: "相対原子質量", formula: "Σ（同位体の相対質量 × 存在比）", meaning: "同位体を加重平均する", condition: "百分率は小数へ直す" },
  { title: "物質量", formula: "n = m / M", meaning: "質量mから物質量nを求める", condition: "m: g、M: g/mol" },
  { title: "粒子数", formula: "N = nNₐ", meaning: "molと粒子数を変換する", condition: "Nₐ ≈ 6.0×10²³ mol⁻¹" },
  { title: "標準状態の気体", formula: "n = V / 22.4", meaning: "気体体積V(L)からmolを求める", condition: "0 ℃、1.013×10⁵ Paだけ" },
  { title: "モル濃度", formula: "c = n / V", meaning: "溶液1 L当たりの溶質mol", condition: "VはL" },
  { title: "質量パーセント濃度", formula: "溶質質量 / 溶液質量 × 100", meaning: "溶液中の溶質の質量割合", condition: "溶液質量=溶質+溶媒" },
  { title: "希釈", formula: "c₁V₁ = c₂V₂", meaning: "希釈前後の溶質mol保存", condition: "反応や溶質損失がない" },
  { title: "中和", formula: "cₐVₐa = cᵦVᵦb", meaning: "H⁺とOH⁻のmolを等しくする", condition: "a,bは酸・塩基の価数" },
  { title: "pH", formula: "pH = −log₁₀[H⁺]", meaning: "水素イオン濃度をpHへ変換", condition: "[H⁺]はmol/L" },
  { title: "水のイオン積", formula: "[H⁺][OH⁻] = 1.0×10⁻¹⁴", meaning: "H⁺とOH⁻を結ぶ", condition: "常温" },
  { title: "pHとpOH", formula: "pH + pOH = 14", meaning: "OH⁻濃度からpHを求める", condition: "常温" },
];

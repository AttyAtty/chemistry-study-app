"use client";

const batteries = [
  ["ボルタ電池", "負極：Zn → Zn²⁺ + 2e⁻", "正極：2H⁺ + 2e⁻ → H₂", "全体：Zn + 2H⁺ → Zn²⁺ + H₂"],
  ["ダニエル電池", "負極：Zn → Zn²⁺ + 2e⁻", "正極：Cu²⁺ + 2e⁻ → Cu", "全体：Zn + Cu²⁺ → Zn²⁺ + Cu"],
  ["マンガン乾電池", "負極：Zn → Zn²⁺ + 2e⁻", "正極：2MnO₂ + 2NH₄⁺ + 2e⁻ → Mn₂O₃ + 2NH₃ + H₂O", "代表的な全体式：Zn + 2MnO₂ + 2NH₄Cl → ZnCl₂ + Mn₂O₃ + 2NH₃ + H₂O"],
  ["アルカリマンガン乾電池", "負極：Zn + 2OH⁻ → ZnO + H₂O + 2e⁻", "正極：2MnO₂ + H₂O + 2e⁻ → Mn₂O₃ + 2OH⁻", "全体：Zn + 2MnO₂ → ZnO + Mn₂O₃"],
  ["酸化銀電池", "負極：Zn + 2OH⁻ → ZnO + H₂O + 2e⁻", "正極：Ag₂O + H₂O + 2e⁻ → 2Ag + 2OH⁻", "全体：Zn + Ag₂O → ZnO + 2Ag"],
  ["空気亜鉛電池", "負極：2Zn + 4OH⁻ → 2ZnO + 2H₂O + 4e⁻", "正極：O₂ + 2H₂O + 4e⁻ → 4OH⁻", "全体：2Zn + O₂ → 2ZnO"],
  ["鉛蓄電池（放電）", "負極：Pb + SO₄²⁻ → PbSO₄ + 2e⁻", "正極：PbO₂ + 4H⁺ + SO₄²⁻ + 2e⁻ → PbSO₄ + 2H₂O", "全体：Pb + PbO₂ + 2H₂SO₄ → 2PbSO₄ + 2H₂O"],
  ["ニッケル・カドミウム電池", "負極：Cd + 2OH⁻ → Cd(OH)₂ + 2e⁻", "正極：2NiO(OH) + 2H₂O + 2e⁻ → 2Ni(OH)₂ + 2OH⁻", "全体：Cd + 2NiO(OH) + 2H₂O → Cd(OH)₂ + 2Ni(OH)₂"],
  ["ニッケル水素電池", "負極：MH + OH⁻ → M + H₂O + e⁻", "正極：NiO(OH) + H₂O + e⁻ → Ni(OH)₂ + OH⁻", "全体：MH + NiO(OH) → M + Ni(OH)₂"],
  ["リチウムイオン電池（放電・代表例）", "負極：LiC₆ → C₆ + Li⁺ + e⁻", "正極：CoO₂ + Li⁺ + e⁻ → LiCoO₂", "全体：LiC₆ + CoO₂ → C₆ + LiCoO₂"],
  ["水素燃料電池（酸性）", "負極：2H₂ → 4H⁺ + 4e⁻", "正極：O₂ + 4H⁺ + 4e⁻ → 2H₂O", "全体：2H₂ + O₂ → 2H₂O"],
  ["水素燃料電池（アルカリ性）", "負極：2H₂ + 4OH⁻ → 4H₂O + 4e⁻", "正極：O₂ + 2H₂O + 4e⁻ → 4OH⁻", "全体：2H₂ + O₂ → 2H₂O"],
];

export function BatteryReactionWorksheet() {
  return <div className="worksheet-shell">
    <div className="worksheet-toolbar"><p>反応式を紙に書いて演習できます。印刷時は解答が別ページになります。</p><button onClick={() => window.print()}>このプリントを印刷</button></div>
    <div className="worksheet-page worksheet-questions">
      <h3>電池の電極反応式 総合演習</h3><p className="worksheet-meta">氏名　　　　　　　　　　　　日付　　　　　　　　</p>
      {batteries.map(([name]) => <div className="worksheet-item" key={name}><b>{name}</b><p>負極：　　　　　　　　　　　　　　　　　　　　　　　　　</p><p>正極：　　　　　　　　　　　　　　　　　　　　　　　　　</p><p>全体：　　　　　　　　　　　　　　　　　　　　　　　　　</p></div>)}
    </div>
    <div className="worksheet-page worksheet-answers">
      <h3>解答</h3>{batteries.map(([name, ...answers]) => <div className="worksheet-answer" key={name}><b>{name}</b>{answers.map(answer => <p key={answer}>{answer}</p>)}</div>)}
    </div>
  </div>;
}

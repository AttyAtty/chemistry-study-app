"use client";

import { useState } from "react";
import type { ElectrolysisCase } from "@/data/chemistry";

export function ElectrolysisWorkbench({ cases }: { cases: ElectrolysisCase[] }) {
  const [selected, setSelected] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const current = cases[selected];

  function selectCase(index: number) {
    setSelected(index);
    setShowAnswer(false);
  }

  return (
    <div className="electrolysis-workbench">
      <div className="case-tabs" role="tablist" aria-label="電気分解の条件">
        {cases.map((item, index) => (
          <button
            className={index === selected ? "active" : ""}
            key={item.title}
            onClick={() => selectCase(index)}
            role="tab"
            aria-selected={index === selected}
          >
            {item.title}
          </button>
        ))}
      </div>

      <article className="electrolysis-case">
        <header>
          <div><span>溶液・融解塩</span><strong>{current.medium}</strong></div>
          <div><span>電極</span><strong>{current.electrodes}</strong></div>
        </header>

        <div className="electrolysis-diagram" aria-label={`${current.title}の模式図`}>
          <div className="power-source"><b>直流電源</b><span>電子 e⁻ は導線中を移動</span></div>
          <div className="electrode cathode">
            <span className="pole">陰極（−）</span>
            <span className="electron">e⁻を受け取る＝還元</span>
            <b>{current.cathodeProduct}</b>
          </div>
          <div className="solution-vessel">
            <span>陽イオン → 陰極</span>
            <strong>{current.medium}</strong>
            <span>陽極 ← 陰イオン</span>
          </div>
          <div className="electrode anode">
            <span className="pole">陽極（＋）</span>
            <span className="electron">e⁻を放出＝酸化</span>
            <b>{current.anodeProduct}</b>
          </div>
        </div>

        <div className="equation-practice">
          <h3>自分でイオン反応式を書く</h3><p>自己採点用です。入力内容の自動採点・保存は行いません。選択した条件の入力例を参考に、解答と比べてください。</p>
          <label>陰極式<input key={`${selected}-c`} placeholder={`例：${current.cathodeEquation}`} /></label>
          <label>陽極式<input key={`${selected}-a`} placeholder={`例：${current.anodeEquation}`} /></label>
          <label>全体式<input key={`${selected}-o`} placeholder={current.overallEquation ? `例：${current.overallEquation}` : "電子数をそろえて加える"} /></label>
          <button className="answer-toggle" onClick={() => setShowAnswer((value) => !value)}>
            {showAnswer ? "解答を隠す" : "解答を表示"}
          </button>
          {showAnswer && (
            <div className="practice-answer" aria-live="polite">
              <p><b>陰極：</b>{current.cathodeEquation}　→ {current.cathodeProduct}</p>
              <p><b>陽極：</b>{current.anodeEquation}　→ {current.anodeProduct}</p>
              {current.overallEquation && <p><b>全体：</b>{current.overallEquation}</p>}
              <p><b>溶液などの変化：</b>{current.solutionChange}</p>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

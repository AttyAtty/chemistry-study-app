import type { BlankView } from "../separation/ExerciseField";
import type { InorganicMaterial, GasLesson, CellLesson } from "@/data/illustrated/inorganicTypes";
import { densityLabels, solubilityLabels } from "@/data/gases";
import { Canvas, Arrow, Sheet } from "./DiagramParts";
import { SvgField, TableField, isMasked } from "./LessonField";

export function IonizationDiagram({data,view}:{data:InorganicMaterial;view:BlankView}) {
  return <><Sheet title="イオン化傾向 ― 序列と反応の境界"><Canvas title="イオン化傾向と水・酸との反応範囲" width={1200} height={620}>
    <text x={30} y={35}>大 ← イオン化傾向 → 小</text><text x={30} y={65}>← 酸化されやすい（電子を失いやすい）</text>
    {data.elements!.map((e,i)=><g key={e.id} data-rank={i}><rect x={25+i*68} y={90} width={62} height={62} rx={5} className="inorganic-box"/><SvgField field={e} x={56+i*68} y={127} width={54} view={view}/></g>)}
    {data.bands!.map((b,i)=><g key={b.id}><rect x={isMasked(view,b.answer)?25:25+b.start*68} y={184+i*90} width={isMasked(view,b.answer)?1150:(b.end-b.start+1)*68-6} height={12} rx={5} className={`reaction-band band-${i}`} data-range-masked={isMasked(view,b.answer)}/><SvgField field={b.answer} x={30} y={228+i*90} width={1040} anchor="start" view={view}/></g>)}
    <line x1={25+11*68+31} y1={155} x2={25+11*68+31} y2={545} stroke="currentColor" strokeDasharray="5 5"/>
    <text x={30} y={593}>反応帯は代表的な条件を示す。皮膜・濃度・温度による例外は下の補足へ。</text>
  </Canvas></Sheet><Sheet title="金属イオンとの置換 ― 電子の受け渡し"><Canvas title="亜鉛から銅イオンへの電子移動" height={240}>
    <rect x={50} y={55} width={220} height={95} className="inorganic-box"/><text x={160} y={95} textAnchor="middle">反応前の金属</text><text x={160} y={127} textAnchor="middle">Zn</text>
    <Arrow x1={300} y1={100} x2={700} y2={100}/><text x={500} y={75} textAnchor="middle">電子 2e⁻ を渡す</text>
    <rect x={730} y={55} width={270} height={95} className="inorganic-box"/><text x={865} y={95} textAnchor="middle">反応前の金属イオン</text><text x={865} y={127} textAnchor="middle">Cu²⁺</text>
    <text x={550} y={205} textAnchor="middle">Zn + Cu²⁺ → Zn²⁺ + Cu（左側の金属が右側の金属イオンを還元）</text>
  </Canvas></Sheet></>;
}

export function FlameDiagram({data,view}:{data:InorganicMaterial;view:BlankView}) {
  return <Sheet title="炎色反応 ― 元素と発光色を対応させる"><Canvas title="7元素の炎色反応" height={680}>
    {data.flames!.map((f,i)=>{const x=45+(i%4)*270,y=30+Math.floor(i/4)*320,hidden=isMasked(view,f.color);return <g key={f.id} data-flame={f.id} transform={`translate(${x} ${y})`}>
      <rect width={240} height={285} rx={12} className="inorganic-box"/>
      <path data-flame-paint={hidden?"masked":"visible"} d="M120 28 C142 70 177 88 173 137 C170 184 76 189 69 140 C65 107 96 77 98 62 C109 84 117 74 120 28Z" fill={hidden?"#c9cdd4":f.paint} stroke="#5f6570" strokeWidth={2}/>
      <path d="M120 103 Q152 153 120 168 Q92 154 120 103" fill={hidden?"#e2e4e8":"#fff2b9"}/>
      <SvgField field={f.element} x={120} y={221} width={220} view={view}/><SvgField field={f.color} x={120} y={263} width={210} view={view}/>
    </g>;})}
  </Canvas><p className="illustrated-caption">色名は必ず併記。色を答えるときは炎も無彩色になり、色名だけを消した問題にはしません。</p></Sheet>;
}

export function PrecipitateDiagram({data,view}:{data:InorganicMaterial;view:BlankView}) {
  return <><Sheet title="沈殿マトリクス ― 陽イオン × 試薬"><div className="illustrated-table-scroll" tabIndex={0}><table className="illustrated-table inorganic-matrix"><thead><tr><th>陽イオン</th>{data.reagents!.map(r=><th key={r.id}><TableField field={r} view={view}/></th>)}</tr></thead><tbody>{data.matrix!.map(row=><tr key={row.id}><th><TableField field={row.ion} view={view}/></th>{row.cells.map(c=><td key={c.id} data-cell={c.id} data-status={c.status}>{c.answer?<TableField field={c.answer} view={view}/>:c.status==="none"?"—":"未掲載"}</td>)}</tr>)}</tbody></table></div><p className="illustrated-caption">—：通常の希薄水溶液で沈殿しない。未掲載：この表では扱わない組合せ。式と色は一つの回答として隠します。条件は補足参照。</p></Sheet>
    <Sheet title="確認反応 ― 少量・過剰・酸性化を区別"><Canvas title="鉄・銅・銀の確認反応" height={620}>{data.confirmations!.map((c,i)=><g key={c.id} transform={`translate(0 ${i*200})`}>
      <rect x={20} y={40} width={170} height={70} className="inorganic-box"/><SvgField field={c.input} x={105} y={83} width={150} view={view}/>
      <SvgField field={c.operation} x={610} y={40} width={750} view={view}/><Arrow x1={215} y1={83} x2={1040} y2={83}/>
      <SvgField field={c.result} x={550} y={150} width={1030} view={view}/>
    </g>)}</Canvas></Sheet>
    {(view.exercise.blankIds.length===0||view.showAnswers)&&<Sheet title="沈殿の条件・溶解性"><ul className="illustrated-notes">{data.matrix!.flatMap(r=>r.cells.filter(c=>c.note).map(c=><li key={c.id}>{c.answer?.text}：{c.note}</li>))}</ul></Sheet>}
  </>;
}

function GasApparatus({gas,view}:{gas:GasLesson;view:BlankView}) {
  const maskCollection=isMasked(view,gas.collection),maskPreparation=isMasked(view,gas.preparation);
  return <Canvas title="気体の発生と捕集の模式図" width={1100} height={300}>
    <path d="M85 40 H155 V105 L205 205 Q210 225 185 225 H55 Q30 225 35 205 L85 105Z" className="inorganic-glass"/>
    <path d="M57 180 H182 L196 207 H44Z" fill="#c5d9e6"/>
    <path d="M125 60 V25 H570 V120" className="inorganic-tube"/>
    <text x={120} y={262} textAnchor="middle">発生容器（模式図）</text>
    {!maskPreparation&&gas.heated&&<g><path d="M105 224 Q90 248 120 250 Q145 244 128 221 Q124 239 105 224" fill="#c47835"/><text x={245} y={215}>加熱</text></g>}
    {maskCollection?<g data-collection-mask="true"><rect x={465} y={75} width={390} height={150} rx={10} className="inorganic-box"/><text x={660} y={154} textAnchor="middle">捕集装置を考えよう</text></g>:gas.method==="water"?<g>
      <path d="M480 155 V235 H850 V155" className="inorganic-glass"/><path d="M482 185 H848 V233 H482Z" fill="#d5ebf5"/>
      <path d="M645 206 V70 H760 V206" className="inorganic-glass"/><path d="M570 120 V210 H685 V175" className="inorganic-tube"/>
      <circle cx={685} cy={151} r={7} fill="none" stroke="currentColor"/><circle cx={685} cy={125} r={9} fill="none" stroke="currentColor"/>
      <Arrow x1={716} y1={173} x2={716} y2={95}/><text x={910} y={205}>水槽</text>
    </g>:<g>
      {gas.method==="up"?<><path d="M630 220 V70 H810 V220" className="inorganic-glass"/><path d="M570 120 V235 H720 V115" className="inorganic-tube"/><Arrow x1={745} y1={197} x2={745} y2={100}/><Arrow x1={845} y1={170} x2={845} y2={235}/></>:<><path d="M630 70 V225 H810 V70" className="inorganic-glass"/><path d="M570 120 V55 H720 V195" className="inorganic-tube"/><Arrow x1={745} y1={100} x2={745} y2={200}/><Arrow x1={845} y1={150} x2={845} y2={70}/></>}
      <text x={915} y={145}>外へ出る空気</text>
    </g>}
  </Canvas>;
}

export function GasDiagrams({data,view}:{data:InorganicMaterial;view:BlankView}) {
  const solving=view.exercise.blankIds.length>0&&!view.showAnswers;
  return <><Sheet title="捕集法を選ぶ ― 溶解性 → 密度"><Canvas title="気体捕集法の選択フロー" height={340}>
    <rect x={350} y={10} width={400} height={60} className="inorganic-box"/><text x={550} y={48} textAnchor="middle">水に溶けにくく、水と反応しにくい？</text>
    <Arrow x1={350} y1={70} x2={180} y2={140}/><text x={215} y={98}>はい</text><text x={180} y={175} textAnchor="middle">{solving?"捕集法を考える":"水上置換"}</text>
    <Arrow x1={750} y1={70} x2={850} y2={140}/><text x={790} y={98}>いいえ</text><text x={850} y={175} textAnchor="middle">空気と密度を比較</text>
    <Arrow x1={790} y1={195} x2={650} y2={260}/><Arrow x1={910} y1={195} x2={1000} y2={260}/><text x={650} y={300} textAnchor="middle">{solving?"軽い場合は？":"軽い → 上方置換"}</text><text x={1000} y={300} textAnchor="middle">{solving?"重い場合は？":"重い → 下方置換"}</text>
  </Canvas><p className="illustrated-caption">捕集法には複数の選択肢がある場合があります。実験条件・安全性も考慮します。</p></Sheet>
  {data.gases!.map(g=><Sheet key={g.source.id} title="気体の製法と捕集"><h3><TableField field={g.name} view={view}/></h3><GasApparatus gas={g} view={view}/>
    <dl className="inorganic-facts"><dt>捕集法</dt><dd><TableField field={g.collection} view={view}/></dd><dt>製法</dt><dd><TableField field={g.preparation} view={view}/></dd><dt>検出</dt><dd><TableField field={g.detection} view={view}/></dd></dl>
    {(!solving)&&<><p className="illustrated-caption">{[g.source.color,g.source.odor,solubilityLabels[g.source.waterSolubility],densityLabels[g.source.relativeDensity]].join(" / ")}</p><p className="illustrated-caption">{g.source.properties.join("・")}</p><p className="illustrated-caption">{g.source.hazards.join(" / ")}</p></>}
  </Sheet>)}</>;
}

function CellDiagram({cell,view}:{cell:CellLesson;view:BlankView}) {
  const battery=cell.source.mode==="galvanic-cell",anode=cell.source.electrodes.findIndex(e=>e.electrodeRole==="anode"),left=cell.electrodes[anode],right=cell.electrodes[1-anode];
  const hideElectrodes=isMasked(view,left.label)||isMasked(view,right.label),hideElectron=isMasked(view,cell.electron);
  return <Canvas title={battery?"ダニエル電池の電子とイオンの移動":"水の電気分解と電源の接続"} height={740}>
    <path d="M180 290 V95 H760 V290" className="inorganic-tube"/>
    {!battery&&<><rect x={455} y={65} width={190} height={60} className="inorganic-box"/><text x={550} y={102} textAnchor="middle">直流電源</text>{!hideElectrodes&&<><text x={430} y={100}>＋</text><text x={660} y={100}>−</text></>}</>}
    {!hideElectron&&<g data-electron-arrow="true">{battery?<Arrow x1={310} y1={95} x2={710} y2={95}/>:<><Arrow x1={250} y1={95} x2={410} y2={95}/><Arrow x1={670} y1={95} x2={730} y2={95}/></>}</g>}
    <SvgField field={cell.electron} x={550} y={40} width={1030} view={view}/>
    {!battery&&<g><path d="M45 235 V455 H1055 V235" className="inorganic-glass"/><path d="M47 300 H1053 V453 H47Z" fill="#e3edf1"/></g>}
    {[0,1].map(i=><g key={i} transform={`translate(${i*580} 0)`}>{battery&&<><path d="M45 235 V455 H475 V235" className="inorganic-glass"/><path d="M47 300 H473 V453 H47Z" fill={i===1&&!hideElectrodes?"#c9e5f7":"#e3edf1"}/></>}<rect x={166} y={220} width={28} height={170} fill={hideElectrodes?"#a4aab1":battery&&i===1?"#bd784d":"#949ca7"}/></g>)}
    {battery?<><path d="M380 350 V225 Q380 195 410 195 H690 Q720 195 720 225 V350" fill="none" stroke="#9a91b5" strokeWidth={25}/><text x={550} y={170} textAnchor="middle">塩橋（イオンが移動）</text>
      {!isMasked(view,cell.ions[0])&&<Arrow x1={520} y1={222} x2={400} y2={222}/>} {!isMasked(view,cell.ions[1])&&<Arrow x1={580} y1={222} x2={700} y2={222}/>}</>:<text x={550} y={190} textAnchor="middle">不活性電極・希硫酸を加えた水</text>}
    {[left,right].map((e,i)=><g key={e.label.id}><SvgField field={e.label} x={260+i*580} y={495} width={440} view={view}/><SvgField field={e.redox} x={260+i*580} y={535} width={440} view={view}/><SvgField field={e.equation} x={260+i*580} y={579} width={465} view={view}/><text x={80+i*580} y={623}>電極の質量：</text><SvgField field={e.mass} x={350+i*580} y={623} width={190} view={view}/></g>)}
    {!hideElectrodes&&<><text x={260} y={425} textAnchor="middle">{battery?cell.source.electrolytes[0]:"電解液"}</text><text x={840} y={425} textAnchor="middle">{battery?cell.source.electrolytes[1]:"電解液"}</text></>}
    {cell.ions.map((a,i)=><SvgField key={a.id} field={a} x={550} y={675+i*40} width={1040} view={view}/>)}
  </Canvas>;
}
export function ElectrochemistryDiagrams({data,view}:{data:InorganicMaterial;view:BlankView}) {
  return <>{data.cells!.map(c=><Sheet key={c.source.id} title={c.source.name}><CellDiagram cell={c} view={view}/>{(view.exercise.blankIds.length===0||view.showAnswers)&&<p className="illustrated-caption">{c.source.solutionChanges.join(" / ")}</p>}</Sheet>)}<Sheet title="電池と電気分解 ― 共通する反応、異なる駆動力"><div className="illustrated-table-scroll"><table className="illustrated-table"><thead><tr><th>比較</th><th>電池</th><th>電気分解</th></tr></thead><tbody><tr><th>エネルギー</th><td>自発的な化学反応 → 電気</td><td>電源の電気 → 化学反応</td></tr>{["酸化する電極","還元する電極"].map((label,i)=><tr key={label}><th>{label}</th>{data.cells!.map(c=>{const e=c.electrodes[c.source.electrodes.findIndex(e=>e.reactionType===(i===0?"oxidation":"reduction"))];return <td key={c.source.id}><TableField field={e.label} view={view}/><br/><TableField field={e.redox} view={view}/></td>;})}</tr>)}</tbody></table></div></Sheet></>;
}

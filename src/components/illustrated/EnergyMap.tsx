import type { ReactNode } from "react";
import type { AnswerField } from "@/data/illustrated/types";
import type { BlankView } from "../separation/ExerciseField";
import { theoryFields } from "@/data/illustrated/theory";
import { Arrow, Canvas, Sheet } from "./DiagramParts";
import { TableField } from "./LessonField";
import { StudyLink } from "../StudyLink";

const f=theoryFields["energy-map"];
function Level({field,x,y,width,view,group}:{field:AnswerField;x:number;y:number;width:number;view:BlankView;group?:string}) {
 const blank=!view.showAnswers&&view.exercise.blankIds.includes(field.id);
 return <g className="energy-map-level"><line x1={x} x2={x+width} y1={y} y2={y}/>{group&&!blank&&<text x={x-12} y={y+5} textAnchor="end" className="energy-group-label">{group}</text>}<foreignObject x={x+14} y={y-38} width={width-24} height={34}><div className="energy-state-label"><TableField field={field} view={view}/></div></foreignObject></g>;
}
function Step({field,x,y,width=190,view,align="start"}:{field:AnswerField;x:number;y:number;width?:number;view:BlankView;align?:"start"|"end"}) {
 return <foreignObject x={align==="end"?x-width:x} y={y} width={width} height={56}><div className={`energy-step-label energy-step-${align}`}><TableField field={field} view={view}/></div></foreignObject>;
}
function Notes({children}:{children:ReactNode}) {return <p className="illustrated-caption">{children}</p>}

export function EnergyMap({view}:{view:BlankView}) {
 const show=view.showAnswers||view.exercise.blankIds.length===0;
 return <><style>{"@media print{@page{size:A4 landscape;margin:8mm}}"}</style><div className="energy-map-material">
  <Sheet title="1. エネルギー変化の総まとめ ― 状態を結ぶ準位図">
   <Canvas title="状態変化・原子化・イオン化・格子形成・水和のエネルギー準位総まとめ" width={1760} height={850}>
    <text x={35} y={38} className="diagram-small">上向き：吸熱　／　下向き：発熱　　※別の反応系同士の準位の高さを比較する図ではありません</text>
    <line x1={420} x2={420} y1={72} y2={790} className="energy-lane-divider"/><line x1={850} x2={850} y1={72} y2={790} className="energy-lane-divider"/><line x1={1290} x2={1290} y1={72} y2={790} className="energy-lane-divider"/>
    <text x={45} y={90} className="energy-panel-title">水の相変化</text>
    <Level field={f.waterGas} x={90} y={190} width={240} group="気体" view={view}/><Level field={f.waterLiquid} x={90} y={410} width={240} group="液体" view={view}/><Level field={f.waterSolid} x={90} y={630} width={240} group="固体" view={view}/>
    <Arrow x1={345} y1={630} x2={345} y2={410}/><Step field={f.fusion} x={335} y={485} width={135} align="end" view={view}/><Arrow x1={385} y1={410} x2={385} y2={630}/><Step field={f.freezing} x={375} y={525} width={135} align="end" view={view}/>
    <Arrow x1={345} y1={410} x2={345} y2={190}/><Step field={f.vaporization} x={335} y={270} width={135} align="end" view={view}/><Arrow x1={385} y1={190} x2={385} y2={410}/><Step field={f.condensation} x={375} y={320} width={135} align="end" view={view}/><Arrow x1={285} y1={630} x2={285} y2={190}/><Step field={f.sublimation} x={275} y={650} width={125} align="end" view={view}/>

    <text x={445} y={90} className="energy-panel-title">分子から原子へ</text>
    <Level field={f.atom} x={500} y={260} width={250} group="気体原子" view={view}/><Level field={f.gas} x={500} y={610} width={250} group="分子" view={view}/><Arrow x1={690} y1={610} x2={690} y2={260}/><Step field={f.bond} x={705} y={390} width={140} view={view}/>

    <text x={875} y={90} className="energy-panel-title">気体原子とイオン</text>
    <Level field={f.neutralAtom} x={925} y={450} width={285} group="原子" view={view}/><Level field={f.ionizedPair} x={925} y={220} width={285} group="陽イオン化後" view={view}/><Arrow x1={1175} y1={450} x2={1175} y2={220}/><Step field={f.ionization} x={1280} y={310} width={105} align="end" view={view}/>
    <Level field={f.clAtomElectron} x={925} y={600} width={285} group="別の反応例" view={view}/><Level field={f.clAnion} x={925} y={720} width={285} group="電子受容後" view={view}/><Arrow x1={1150} y1={620} x2={1150} y2={700}/><Step field={f.affinity} x={1135} y={635} width={135} align="end" view={view}/>

    <text x={1315} y={90} className="energy-panel-title">結晶・気体イオン・水溶液</text>
    <Level field={f.ion} x={1370} y={220} width={310} group="気体イオン" view={view}/><Level field={f.aqueous} x={1370} y={420} width={310} group="水溶液" view={view}/><Level field={f.solid} x={1370} y={640} width={310} group="イオン結晶" view={view}/><Arrow x1={1630} y1={245} x2={1630} y2={395}/><Step field={f.hydration} x={1610} y={295} width={145} align="end" view={view}/><Arrow x1={1660} y1={615} x2={1660} y2={245}/><Step field={f.lattice} x={1645} y={475} width={110} align="end" view={view}/>
   </Canvas>
   <Notes>{show?"各列は個別の反応系を示す模式図です。列をまたいで準位の絶対値を比べません。結合を切る・電離・格子分解は吸熱、結合形成・電子受容・水和・格子形成は通常発熱です。":"準位線と矢印から、状態名・エネルギー変化・熱の出入りを確認してください。"}</Notes>
  </Sheet>
  <Sheet title="2. Born–Haber cycle ― NaClの生成を準位線で追う">
   <Canvas title="NaCl Born–Haber cycle：六つのエネルギー準位を段階的な縦矢印で結ぶ図" width={1740} height={850}>
    <text x={35} y={38} className="diagram-small">高い準位ほど高エネルギー　／　同一反応系の模式図（数値・縮尺なし）</text>
    {show&&<g className="energy-group-label"><text x={190} y={140}>気体イオン</text><text x={190} y={270}>気体イオン</text><text x={190} y={395}>気体原子</text><text x={190} y={515}>気体分子・原子</text><text x={190} y={640}>単体標準状態</text><text x={190} y={770}>イオン結晶</text></g>}
    <Level field={f.bornCation} x={250} y={155} width={1380} view={view}/>
    <Level field={f.bornGasIons} x={250} y={285} width={1380} view={view}/>
    <Level field={f.bornAtoms} x={250} y={410} width={1380} view={view}/>
    <Level field={f.bornNaGas} x={250} y={530} width={1380} view={view}/>
    <Level field={f.bornStandard} x={250} y={655} width={1380} view={view}/>
    <Level field={f.bornCrystal} x={250} y={785} width={1380} view={view}/>
    <Arrow x1={480} y1={655} x2={480} y2={530}/><Step field={f.naSublimation} x={495} y={558} width={190} view={view}/>
    <Arrow x1={700} y1={530} x2={700} y2={410}/><Step field={f.clDissociation} x={715} y={438} width={205} view={view}/>
    <Arrow x1={940} y1={410} x2={940} y2={155}/><Step field={f.ionization} x={955} y={250} width={180} view={view}/>
    <Arrow x1={1170} y1={155} x2={1170} y2={285}/><Step field={f.affinity} x={1155} y={185} width={200} align="end" view={view}/>
    <Arrow x1={1400} y1={285} x2={1400} y2={785}/><Step field={f.lattice} x={1385} y={495} width={190} align="end" view={view}/>
    <Arrow x1={1580} y1={655} x2={1580} y2={785}/><Step field={f.bornFormation} x={1560} y={690} width={170} align="end" view={view}/>
   </Canvas>
   <Notes>{show?"各準位を水平線で示し、各矢印は必ず始状態と終状態の線を結びます。途中経路のΔHを合計すると、単体標準状態からNaCl(s)への生成エンタルピーになります。":"矢印が結ぶ準位をたどり、反応名とΔHの符号を答えてください。"}</Notes>
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-formation">生成エンタルピー公式 →</StudyLink><StudyLink href="/theory/formulas#formula-hess">ヘスの法則公式 →</StudyLink><StudyLink href="/theory/practice#hess">ヘスの法則の典型例題 →</StudyLink></p>
  </Sheet>
  <Sheet title="3. 水の状態変化 ― 1本の準位図">
   <Canvas title="H₂Oの固体・液体・気体を縦のエネルギー準位線と状態変化矢印で結ぶ" width={1180} height={720}>
    <text x={40} y={38} className="diagram-small">高い準位ほど高エネルギー（同一物質 H₂O の模式図）</text>
    <Level field={f.waterGas} x={220} y={170} width={650} group="気体" view={view}/><Level field={f.waterLiquid} x={220} y={390} width={650} group="液体" view={view}/><Level field={f.waterSolid} x={220} y={610} width={650} group="固体" view={view}/>
    <Arrow x1={710} y1={610} x2={710} y2={390}/><Step field={f.fusion} x={730} y={465} width={210} view={view}/><Arrow x1={850} y1={390} x2={850} y2={610}/><Step field={f.freezing} x={830} y={505} width={190} align="end" view={view}/>
    <Arrow x1={710} y1={390} x2={710} y2={170}/><Step field={f.vaporization} x={730} y={245} width={210} view={view}/><Arrow x1={850} y1={170} x2={850} y2={390}/><Step field={f.condensation} x={830} y={285} width={190} align="end" view={view}/>
    <Arrow x1={1035} y1={610} x2={1035} y2={170}/><Step field={f.sublimation} x={1020} y={390} width={150} align="end" view={view}/>
   </Canvas>
   <Notes>{show?"融解・蒸発・昇華は上向きで吸熱（ΔH > 0）、凝固・凝縮は下向きで発熱（ΔH < 0）。昇華は固体から気体への直接経路です。":"矢印の向きと熱の出入りを確認してください。"}</Notes>
  </Sheet>
  <Sheet title="4. NaClの溶解 ― 格子分解・水和・溶解熱">
   <Canvas title="NaClの固体・気体イオン・水溶液を準位線と三つの反応矢印で結ぶ" width={1280} height={650}>
    <text x={40} y={38} className="diagram-small">NaClの同一反応系：気体イオンを中間状態として経路を結ぶ</text>
    <Level field={f.bornGasIons} x={210} y={170} width={720} group="気体イオン" view={view}/><Level field={f.aqueous} x={210} y={410} width={720} group="水溶液" view={view}/><Level field={f.bornCrystal} x={210} y={540} width={720} group="結晶" view={view}/>
    <Arrow x1={560} y1={540} x2={560} y2={170}/><Step field={f.latticeReverse} x={575} y={315} width={210} view={view}/>
    <Arrow x1={850} y1={170} x2={850} y2={410}/><Step field={f.hydration} x={865} y={255} width={190} view={view}/>
    <Arrow x1={1080} y1={540} x2={1080} y2={410}/><Step field={f.dissolution} x={1065} y={450} width={205} align="end" view={view}/>
   </Canvas>
   <Notes>{show?"格子分解（結晶→気体イオン）は吸熱、水和（気体イオン→水溶液中のイオン）は発熱です。溶解熱は両過程の和で、NaClは室温付近でわずかに吸熱となります。":"3本の矢印が結ぶ始状態・終状態から、各エネルギー変化を確認してください。"}</Notes>
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-enthalpy">反応エンタルピー公式 →</StudyLink><StudyLink href="/theory/practice#hess">熱化学の計算例題 →</StudyLink></p>
  </Sheet>
  <Sheet title="5. 矢印の読み方・よくある混同">
   <div className="energy-term-grid">{([f.formation,f.combustion,f.neutralization,f.reaction] as const).map(term=><div key={term.id}><TableField field={term} view={view}/></div>)}</div>
   {show&&<ul className="energy-notes"><li>矢印を逆向きにたどると、同じ変化のΔHの符号が反転します。</li><li>ヘスの法則では、同じ始状態と終状態なら経路によらずΔHは一定です。</li><li>格子形成（気体イオン→結晶）は発熱、格子分解（結晶→気体イオン）は吸熱です。</li><li>Cl(g)+e⁻→Cl⁻(g)では通常エネルギーを放出します。</li><li>単体標準状態の生成エンタルピーは0ですが、Na(g)など気体原子は標準状態の単体ではありません。</li></ul>}
  </Sheet>
 </div></>;
}

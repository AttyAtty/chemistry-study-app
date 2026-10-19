import type { ReactNode } from "react";
import type { AnswerField } from "@/data/illustrated/types";
import type { BlankView } from "../separation/ExerciseField";
import { theoryFields } from "@/data/illustrated/theory";
import { Canvas, Arrow, Sheet } from "./DiagramParts";
import { TableField } from "./LessonField";
import { StudyLink } from "../StudyLink";

const f=theoryFields["energy-map"];
function Level({field,x,y,width=470,view,group}:{field:AnswerField;x:number;y:number;width?:number;view:BlankView;group:string}) {
 const masked=!view.showAnswers&&view.exercise.blankIds.includes(field.id);
 return <g className="energy-map-level">{group&&!masked&&<text x={x} y={y-12} className="energy-group-label">{group}</text>}<line x1={x} x2={x+width} y1={y} y2={y}/><foreignObject x={x+8} y={y-43} width={width-16} height={38}><div className="energy-state-label"><TableField field={field} view={view}/></div></foreignObject></g>;
}
function StepLabel({field,x,y,width=280,view}:{field:AnswerField;x:number;y:number;width?:number;view:BlankView}) {
 return <foreignObject x={x} y={y} width={width} height={70}><div className="energy-step-label"><TableField field={field} view={view}/></div></foreignObject>;
}
function Panel({x,title,children}:{x:number;title:string;children:ReactNode}) {
 return <g><rect x={x} y={72} width={425} height={652} rx={12} className="diagram-panel"/><text x={x+14} y={106} className="energy-panel-title">{title}</text>{children}</g>;
}

export function EnergyMap({view}:{view:BlankView}) {
 const show=view.showAnswers||view.exercise.blankIds.length===0;
 return <div className="energy-map-material">
  <Sheet title="1. エネルギー変化の総まとめ ― 状態・粒子・経路">
   <Canvas title="相の変化、原子化、イオン化、格子形成、水和の局所的なエネルギー準位模式図" width={1800} height={770}>
    <text x={40} y={46} className="diagram-small">各パネル内：高い位置ほど高エネルギー（模式的な相対関係）</text>
    <Panel x={15} title="水の状態変化">
     <Level field={f.waterGas} x={35} y={205} width={245} group="分子・気体" view={view}/><Level field={f.waterLiquid} x={35} y={385} width={245} group="分子・液体" view={view}/><Level field={f.waterSolid} x={35} y={565} width={245} group="分子・固体" view={view}/>
     <Arrow x1={310} y1={550} x2={310} y2={400}/><StepLabel field={f.fusion} x={320} y={425} width={112} view={view}/>
     <Arrow x1={360} y1={400} x2={360} y2={550}/><StepLabel field={f.freezing} x={292} y={500} width={116} view={view}/>
     <Arrow x1={310} y1={370} x2={310} y2={220}/><StepLabel field={f.vaporization} x={320} y={250} width={112} view={view}/>
     <Arrow x1={360} y1={220} x2={360} y2={370}/><StepLabel field={f.condensation} x={292} y={310} width={116} view={view}/>
    </Panel>
    <Panel x={465} title="分子から気体原子へ">
     <Level field={f.gas} x={485} y={555} width={225} group="分子" view={view}/><Level field={f.atom} x={485} y={260} width={225} group="気体原子" view={view}/>
     <Arrow x1={750} y1={530} x2={750} y2={285}/><StepLabel field={f.bond} x={762} y={355} width={116} view={view}/>
     {show&&<text x={488} y={620} className="diagram-small">結合を切る・原子化：吸熱</text>}
    </Panel>
    <Panel x={915} title="気体原子・イオン（個別の反応対）">
     <Level field={f.ionizedPair} x={935} y={275} width={220} group="陽イオン化後" view={view}/>
     <Level field={f.neutralAtom} x={935} y={500} width={220} group="中性原子" view={view}/>
     <Arrow x1={1190} y1={480} x2={1190} y2={300}/><StepLabel field={f.ionization} x={1200} y={365} width={128} view={view}/>
     <Level field={f.clAtomElectron} x={935} y={590} width={220} group="別例の反応物" view={view}/><Level field={f.clAnion} x={935} y={680} width={220} group="生成物" view={view}/>
     <Arrow x1={1190} y1={605} x2={1190} y2={660}/><StepLabel field={f.affinity} x={1200} y={615} width={128} view={view}/>
    </Panel>
    <Panel x={1365} title="気体イオン・結晶・水溶液">
     <Level field={f.ion} x={1385} y={220} width={245} group="気体イオン" view={view}/><Level field={f.aqueous} x={1385} y={405} width={245} group="水和イオン" view={view}/><Level field={f.solid} x={1385} y={590} width={245} group="イオン結晶" view={view}/>
     <Arrow x1={1660} y1={250} x2={1660} y2={375}/><StepLabel field={f.hydration} x={1670} y={300} width={112} view={view}/>
     <Arrow x1={1715} y1={250} x2={1715} y2={560}/><StepLabel field={f.lattice} x={1725} y={435} width={112} view={view}/>
    </Panel>
    <text x={32} y={752} className="diagram-small">注意：物質ごとに基準となるエネルギーは異なります。各パネルの高さを物質横断で比較しません。</text>
   </Canvas>
   {show?<p className="illustrated-caption">総まとめ図は各変化の向きと符号を示す模式図です。異なる物質・反応系の準位を一つの尺度で順位づけてはいません。固体→液体→気体は吸熱方向、逆向きは発熱方向。気体イオン→結晶は格子形成で発熱、逆向きの格子分解は吸熱です。</p>:<p className="illustrated-caption">各矢印の名称・向き・熱の出入りを、空欄と一緒に考えてください。各パネルは別々の模式的な尺度です。</p>}
  </Sheet>
  <Sheet title="2. Born–Haber cycle ― NaClの生成経路">
   <Canvas title="NaClのBorn–Haberサイクルを状態準位と縦矢印で示した模式図" width={1500} height={700}>
    <text x={35} y={40} className="diagram-small">エネルギー ↑　／　同一反応系の模式的な相対準位（数値・縮尺なし）</text>
    {show&&<g className="energy-group-label"><text x={42} y={156}>気体イオン</text><text x={42} y={267}>気体イオン</text><text x={42} y={380}>気体原子</text><text x={42} y={462}>気体分子＋原子</text><text x={42} y={552}>単体標準状態</text><text x={42} y={646}>イオン結晶</text></g>}
    <Level field={f.bornCation} x={205} y={175} width={560} group="" view={view}/>
    <Level field={f.bornGasIons} x={205} y={285} width={560} group="" view={view}/>
    <Level field={f.bornAtoms} x={205} y={395} width={560} group="" view={view}/>
    <Level field={f.bornNaGas} x={205} y={480} width={560} group="" view={view}/>
    <Level field={f.bornStandard} x={205} y={570} width={560} group="" view={view}/>
    <Level field={f.bornCrystal} x={205} y={660} width={560} group="" view={view}/>
    <Arrow x1={820} y1={560} x2={820} y2={490}/><StepLabel field={f.naSublimation} x={838} y={500} width={160} view={view}/>
    <Arrow x1={1120} y1={470} x2={1120} y2={410}/><StepLabel field={f.clDissociation} x={1138} y={420} width={250} view={view}/>
    <Arrow x1={820} y1={375} x2={820} y2={200}/><StepLabel field={f.ionization} x={838} y={260} width={245} view={view}/>
    <Arrow x1={1120} y1={200} x2={1120} y2={265}/><StepLabel field={f.affinity} x={1138} y={210} width={260} view={view}/>
    <Arrow x1={1010} y1={300} x2={1010} y2={635}/><StepLabel field={f.lattice} x={1025} y={500} width={190} view={view}/>
    <Arrow x1={1405} y1={570} x2={1405} y2={645}/><StepLabel field={f.bornFormation} x={1220} y={575} width={180} view={view}/>
    {show&&<text x={205} y={690} className="diagram-small">中間経路のΔHを加えると、元素からNaCl(固)への直接生成と一致（ヘスの法則）。</text>}
   </Canvas>
   {show?<p className="illustrated-caption">矢印は始状態から終状態への反応方向です。Na昇華・Cl₂解離・電離は吸熱、Clの電子受容・格子形成は発熱。実測値を示さない模式図なので準位差の寸法は定量比較に使いません。</p>:<p className="illustrated-caption">矢印が示す反応の向きと、始状態・終状態のエネルギー差を空欄に記入してください。</p>}
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-formation">生成エンタルピー公式 →</StudyLink><StudyLink href="/theory/formulas#formula-hess">ヘスの法則公式 →</StudyLink><StudyLink href="/theory/practice#hess">ヘスの法則の典型例題 →</StudyLink></p>
  </Sheet>
  <Sheet title="3. 水の状態変化 ― 同じ物質の相を比べる">
   <Canvas title="水の固体・液体・気体のエネルギー準位と状態変化" width={1300} height={650}>
    <text x={45} y={42} className="diagram-small">同一物質 H₂O：高い準位ほど高エネルギー（模式図）</text>
    <Level field={f.waterGas} x={130} y={150} width={610} group="気体" view={view}/><Level field={f.waterLiquid} x={130} y={340} width={610} group="液体" view={view}/><Level field={f.waterSolid} x={130} y={530} width={610} group="固体" view={view}/>
    <Arrow x1={850} y1={515} x2={850} y2={365}/><StepLabel field={f.fusion} x={870} y={405} width={300} view={view}/>
    <Arrow x1={1135} y1={365} x2={1135} y2={515}/><StepLabel field={f.freezing} x={945} y={470} width={180} view={view}/>
    <Arrow x1={850} y1={315} x2={850} y2={175}/><StepLabel field={f.vaporization} x={870} y={205} width={300} view={view}/>
    <Arrow x1={1135} y1={175} x2={1135} y2={315}/><StepLabel field={f.condensation} x={945} y={255} width={180} view={view}/>
    <Arrow x1={1240} y1={510} x2={1240} y2={175}/><StepLabel field={f.sublimation} x={920} y={570} width={290} view={view}/>
   </Canvas>
   {show?<p className="illustrated-caption">融解・蒸発・昇華は上向きの吸熱変化（ΔH &gt; 0）。凝固・凝縮は逆向きで発熱（ΔH &lt; 0）。昇華熱は融解熱と蒸発熱の和として経路でも考えられます。</p>:<p className="illustrated-caption">各矢印が表す状態変化と、逆向きにした際のΔHの符号を考えてください。</p>}
  </Sheet>
  <Sheet title="4. NaClの溶解 ― 格子分解・水和・溶解熱">
   <Canvas title="NaCl固体から水溶液中のイオンまでのエネルギー準位図" width={1300} height={590}>
   {show&&<text x={45} y={42} className="diagram-small">NaClについての模式的な相対準位（気体イオンを共通中間状態とする）</text>}
    <Level field={f.bornGasIons} x={145} y={165} width={620} group="気体イオン" view={view}/><Level field={f.aqueous} x={145} y={355} width={620} group="水溶液中のイオン" view={view}/><Level field={f.bornCrystal} x={145} y={525} width={620} group="結晶" view={view}/>
    <Arrow x1={850} y1={500} x2={850} y2={195}/><StepLabel field={f.latticeReverse} x={870} y={305} width={330} view={view}/>
    <Arrow x1={1200} y1={195} x2={1200} y2={330}/><StepLabel field={f.hydration} x={1010} y={230} width={175} view={view}/>
    <Arrow x1={1240} y1={500} x2={1240} y2={390}/><StepLabel field={f.dissolution} x={1015} y={410} width={205} view={view}/>
   </Canvas>
   {show?<p className="illustrated-caption">NaCl(s) → Na⁺(aq) + Cl⁻(aq)の溶解熱は、格子分解（吸熱）と水和（発熱）の和です。NaClの溶解は室温付近でわずかに吸熱ですが、図は量を示さない模式図です。</p>:<p className="illustrated-caption">3本の矢印の始点・終点から、格子分解・水和・溶解の関係を考えてください。</p>}
   <p className="energy-links"><StudyLink href="/theory/formulas#formula-enthalpy">反応エンタルピー公式 →</StudyLink><StudyLink href="/theory/practice#hess">熱化学の計算例題 →</StudyLink></p>
  </Sheet>
  <Sheet title="5. 矢印の読み方・よくある混同">
   <div className="energy-term-grid">{([f.formation,f.combustion,f.neutralization,f.reaction] as const).map(term=><div key={term.id}><TableField field={term} view={view}/></div>)}</div>
   {show&&<ul className="energy-notes"><li>矢印を逆向きにたどると、同じ変化のΔHの符号が反転します。</li><li>ヘスの法則では、同じ始状態と終状態なら経路によらずΔHは一定です。</li><li>格子形成（気体イオン→結晶）は発熱、格子分解（結晶→気体イオン）は吸熱。資料間の定義方向の違いに注意。</li><li>Cl(g)+e⁻→Cl⁻(g)では通常エネルギーを放出します。「電子親和力」を放出エネルギーの正の大きさで表す資料では、反応のΔHは負です。</li><li>単体標準状態の生成エンタルピーは0ですが、Na(g)など気体原子は標準状態の単体ではありません。</li></ul>}
   {show&&<p className="illustrated-caption">図を使う典型問題：複数段階のΔHから未知の反応熱を求める、生成経路を並べてヘスの法則で加算する、状態変化の逆向きから符号を判断する。</p>}
  </Sheet>
 </div>;
}

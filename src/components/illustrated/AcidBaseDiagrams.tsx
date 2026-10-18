import type {BlankView} from "../separation/ExerciseField";
import type {AnswerField} from "@/data/illustrated/types";
import {advancedTheoryFields as fields} from "@/data/illustrated/theoryAdvanced";
import {acidBaseIndicators} from "@/data/acidBaseIndicators";
import {titrationPH,titrationVolumes,bufferPH,waterWithAcidPH} from "@/lib/theoryAdvancedModels";
import {Canvas,Arrow,Sheet} from "./DiagramParts";
import {SvgField,TableField,isMasked} from "./LessonField";
import {CartesianPlot,plotCoordinates,InteractivePrintPair,type PlotSpec} from "./TheoryParts";

export function TheoryAnswer({field,view}:{field:AnswerField;view:BlankView}){return <div className="theory-answer-line"><TableField field={field} view={view}/></div>;}
const learn=(view:BlankView)=>view.showAnswers||view.exercise.blankIds.length===0;
/** Symbol counts compare states, not absolute concentrations or ionization constants. */
export function IonBox({x=0,y=0,width=280,height=160,ions}:{x?:number;y?:number;width?:number;height?:number;ions:{label:string;count:number;tone?:string}[]}){
 const particles=ions.flatMap(i=>Array.from({length:i.count},()=>i));
 return <g transform={`translate(${x} ${y})`} data-ion-box="true"><rect width={width} height={height} rx={8} fill="#f3f8fb" stroke="#8097aa"/>{particles.map((p,i)=><g key={i} transform={`translate(${25+(i%6)*(width-50)/5} ${26+Math.floor(i/6)*34})`}><circle r={15} fill={p.tone??"#e3eaf0"} stroke="#526a80"/><text textAnchor="middle" y={4} className="ion-symbol">{p.label}</text></g>)}</g>;
}
export function PHScale({pH=7}:{pH?:number}){
 const x=(v:number)=>100+v*900/14;
 return <Canvas title="25 ℃のpHスケール" height={175}><rect x={100} y={65} width={450} height={27} fill="#f4d4cf"/><rect x={550} y={65} width={450} height={27} fill="#d5e5f0"/>{Array.from({length:15},(_,i)=><g key={i}><line x1={x(i)} y1={62} x2={x(i)} y2={101} stroke="#4e6477"/><text x={x(i)} y={126} textAnchor="middle">{i}</text></g>)}<line x1={x(pH)} y1={45} x2={x(pH)} y2={100} stroke="#744e74" strokeWidth={4}/><text x={300} y={35} textAnchor="middle">酸性（pH &lt; 7）</text><text x={550} y={35} textAnchor="middle">中性 7</text><text x={800} y={35} textAnchor="middle">塩基性（pH &gt; 7）</text><text x={1000} y={164} textAnchor="end">pH（無次元）</text></Canvas>;
}
export function AcidBaseLesson({view}:{view:BlankView}){
 const f=fields["acid-base"];
 return <><Sheet title="1. どちらのイオンが多い？ ― pHを粒子で見る"><Canvas title="酸性・中性・塩基性のイオンの偏り" height={265}>
  {[[10,1],[3,3],[1,10]].map(([h,oh],i)=><g key={i}><IonBox x={45+i*355} y={10} ions={[{label:"H⁺",count:h,tone:"#f2d2ce"},{label:"OH⁻",count:oh,tone:"#d1e5ef"}]}/><SvgField field={[f.acid,f.neutral,f.base][i]} x={185+i*355} y={225} width={330} view={view}/></g>)}
 </Canvas><p className="illustrated-caption">粒子数は相対関係の模式表現。対イオンや水分子は省略しています。H⁺は水和したプロトンの略記です。</p><PHScale/>
 <Canvas title="pHが1下がるとHイオン濃度は10倍" height={170}><text x={160} y={60}>pH 3</text><text x={160} y={105}>[H⁺] = 10⁻³ mol/L</text><Arrow x1={430} y1={75} x2={680} y2={75}/><text x={790} y={60}>pH 2</text><text x={790} y={105}>[H⁺] = 10⁻² mol/L</text><text x={550} y={143} textAnchor="middle">濃度比を考えよう</text></Canvas><TheoryAnswer field={f.log} view={view}/><TheoryAnswer field={f.kw} view={view}/>
 <p className="illustrated-caption">25 ℃・希薄な理想水溶液として扱います。{learn(view)&&"中性とは[H⁺] = [OH⁻]のこと。"}中性のpHは温度で変わり、pHが0〜14を超える水溶液もあります。</p></Sheet>
 <Sheet title="2. 強い／弱い と 濃い／薄い を分ける"><Canvas title="同じ体積で濃度と電離の程度を別々に比べる" height={515}>
  {[{name:"濃い側",units:12},{name:"薄い側",units:6}].map((row,j)=><g key={j}><text x={60} y={40+j*235}>{row.name}（同じ体積）</text>{[true,false].map((strong,i)=><g key={i}><text x={335+i*410} y={40+j*235} textAnchor="middle">{strong?"ほぼ全て電離する酸":"一部だけ電離する酸"}</text><IonBox x={200+i*410} y={60+j*235} ions={[{label:"H⁺",count:strong?row.units:1,tone:"#f2d2ce"},{label:"A⁻",count:strong?row.units:1,tone:"#d1e5ef"},{label:"HA",count:strong?0:row.units-1}]}/></g>)}</g>)}
 </Canvas><TheoryAnswer field={f.strength} view={view}/>{learn(view)&&<p className="illustrated-caption">同じ行は溶かした酸HAの形式濃度が同じ。縦方向は溶かした量、横方向は電離の程度を比較します。弱酸の電離度は濃度にも依存するため、図の個数から一定の電離度を読み取らないでください。強弱は本来、溶媒・温度を指定した電離平衡で比べます。</p>}</Sheet></>;
}

const titrationSpec:PlotSpec={xDomain:[0,50],yDomain:[0,14],xTicks:[0,10,20,25,30,40,50],yTicks:[0,2,4,6,7,8,10,12,14],xLabel:"加えた0.100 mol/L NaOHの体積 [mL]",yLabel:"pH（25 ℃、無次元）"};
export function TitrationGraph({volume,indicatorId,view}:{volume:number;indicatorId?:string;view:BlankView}){
 const {x,y}=plotCoordinates(titrationSpec),pH=titrationPH(volume),indicator=acidBaseIndicators.find(i=>i.id===indicatorId),masked=indicator&&isMasked(view,fields.indicators[indicator.id]);
 return <Canvas title="強酸・強塩基の滴定曲線" height={450}><CartesianPlot spec={titrationSpec} points={titrationVolumes.map(v=>[v,titrationPH(v)])}>
  {indicator&&!masked&&<g data-indicator-band={indicator.id}><rect x={135} y={y(indicator.high)} width={835} height={y(indicator.low)-y(indicator.high)} fill={indicator.basePaint} opacity={.2}/><text x={150} y={y(indicator.high)-7}>{indicator.learningId}の変色域</text></g>}
  <line x1={x(25)} x2={x(25)} y1={65} y2={345} className="plot-reference"/><circle cx={x(25)} cy={y(7)} r={8} fill="none" stroke="#935c6b" strokeWidth={3}/>
  <circle data-titration-point="true" data-volume={volume} data-ph={pH.toFixed(2)} cx={x(volume)} cy={y(pH)} r={6} className="plot-point"/>
  <text x={x(25)+15} y={90}>25.0 mLの点</text>
 </CartesianPlot></Canvas>;
}
function TitrationApparatus({view}:{view:BlankView}){
 const f=fields.titration;
 return <Canvas title="ビュレットと三角フラスコによる滴定装置" height={390}>
  <path d="M150 20 V210 H180 V20 M150 210 L165 235 L180 210 M165 235 V255" className="vessel-wall"/>{Array.from({length:10},(_,i)=><line key={i} x1={150} y1={35+i*16} x2={i%2?160:170} y2={35+i*16} stroke="#53687c"/>)}<line x1={135} y1={218} x2={195} y2={218} stroke="#694e55" strokeWidth={5}/><text x={215} y={224}>コック</text><path d="M165 268 Q151 285 165 289 Q180 284 165 268" fill="#79a5c3"/>
  <path d="M137 290 V308 L100 367 H230 L193 308 V290" className="vessel-wall"/><path d="M116 343 H214 L226 363 H104Z" fill="#d9d3e9"/>
  <SvgField field={f.burette} x={700} y={105} width={670} view={view}/><Arrow x1={380} y1={115} x2={190} y2={115}/>
  <SvgField field={f.flask} x={700} y={310} width={670} view={view}/><Arrow x1={380} y1={320} x2={226} y2={340}/>
  <text x={670} y={359} textAnchor="middle">試料：0.100 mol/L HCl 25.0 mL ／ 滴定液：0.100 mol/L NaOH</text>
 </Canvas>;
}
export function TitrationLesson({view,volume,onVolume}:{view:BlankView;volume:number;onVolume:(n:number)=>void}){
 const f=fields.titration;
 return <><Sheet title="1. 装置から、中和する物質量を見る"><TitrationApparatus view={view}/><Canvas title="滴下前から当量点後までのイオンの変化" height={265}>
  {[{v:0,h:10,oh:0},{v:20,h:2,oh:0},{v:25,h:1,oh:1},{v:30,h:0,oh:2}].map((s,i)=><g key={i}><text x={140+i*270} y={27} textAnchor="middle">{s.v.toFixed(1)} mL添加</text><IonBox x={25+i*270} y={52} width={235} height={130} ions={[{label:"H⁺",count:s.h,tone:"#f2d2ce"},{label:"OH⁻",count:s.oh,tone:"#d1e5ef"}]}/><text x={140+i*270} y={225} textAnchor="middle">{["滴下前","滴下・酸が残る","過不足なく反応","塩基が過剰"][i]}</text></g>)}
 </Canvas><p className="illustrated-caption">H⁺ + OH⁻ → H₂O。粒子数は過不足の記号で、水分子・対イオンを省略。当量点にも水の電離によるH⁺・OH⁻があります。</p><TheoryAnswer field={f.equivalence} view={view}/><TheoryAnswer field={f.calculation} view={view}/></Sheet>
 <Sheet title="2. 滴下量を、曲線上のpHにつなげる"><div className="theory-controls no-print"><h3>加えた体積で、酸が残る側から塩基が残る側へ追う</h3><label htmlFor="titration-volume">NaOHの添加体積 [mL]</label><input id="titration-volume" type="range" min={0} max={50} step={.1} value={volume} onChange={e=>onVolume(Number(e.target.value))}/><output data-titration-output="true">{volume.toFixed(1)} mL：pH {titrationPH(volume).toFixed(2)}</output><div className="theory-presets">{[0,24.9,25,30].map(v=><button className="button" key={v} onClick={()=>onVolume(v)}>{v} mL</button>)}</div></div>
 <InteractivePrintPair interactive={<TitrationGraph volume={volume} view={view}/>} printable={<TitrationGraph volume={25} view={view}/>}/><TheoryAnswer field={f.endpoint} view={view}/>
 <p className="illustrated-caption">25 ℃、活量を濃度で近似し体積を加算した強酸・強塩基のモデル。水の電離も含めて計算しています。印刷は25.0 mL。</p>
 {learn(view)&&<p className="illustrated-caption">この組合せの当量点はpH 7ですが、「pH 7だから当量点」ではありません。弱酸＋強塩基では当量点が塩基性側、強酸＋弱塩基では酸性側にずれます。指示薬の終点は当量点にできるだけ近づける実験上の判断です。</p>}</Sheet></>;
}

export function IndicatorLesson({view,indicatorId,onIndicator}:{view:BlankView;indicatorId:string;onIndicator:(id:string)=>void}){
 const f=fields.indicators;
 return <><Sheet title="1. 変色域をpH軸上の帯で比べる"><Canvas title="4指示薬の変色域と両側の色" height={600}>
  {Array.from({length:15},(_,i)=><g key={i}><text x={100+i*900/14} y={35} textAnchor="middle">{i}</text><line x1={100+i*900/14} x2={100+i*900/14} y1={50} y2={550} stroke="#e0e8ee"/></g>)}
  {acidBaseIndicators.map((i,index)=>{const hidden=isMasked(view,f[i.id]),y=80+index*120;return <g key={i.id} data-indicator-row={i.id}><SvgField field={f[i.id]} x={550} y={y} width={1030} view={view}/>{!hidden?<><rect x={100} y={y+20} width={i.low*900/14} height={28} fill={i.acidPaint} stroke="#8c9ca8"/><rect x={100+i.low*900/14} y={y+20} width={(i.high-i.low)*900/14} height={28} fill="#e8dcd4" stroke="#6d7f8f" strokeDasharray="4 3"/><rect x={100+i.high*900/14} y={y+20} width={(14-i.high)*900/14} height={28} fill={i.basePaint} stroke="#8c9ca8"/><text x={100} y={y+80}>{i.acid}（酸性側）</text><text x={1000} y={y+80} textAnchor="end">{i.base}（塩基性側）</text></>:<rect x={100} y={y+20} width={900} height={28} fill="#e4e7eb" stroke="#8c9ca8"/>}</g>;})}<text x={1000} y={589} textAnchor="end">pH（25 ℃付近の代表値）</text>
 </Canvas><p className="illustrated-caption">変色は帯の範囲で徐々に進みます。温度・溶媒・資料により変色域には多少の差があります。問題で隠すと色・境界位置も同時に伏せます。</p></Sheet>
 <Sheet title="2. 滴定曲線の急変する範囲と重ねる"><div className="theory-controls no-print"><label htmlFor="indicator-choice">変色域を重ねる指示薬</label><select id="indicator-choice" value={indicatorId} onChange={e=>onIndicator(e.target.value)}>{acidBaseIndicators.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
 <InteractivePrintPair interactive={<TitrationGraph volume={25} indicatorId={indicatorId} view={view}/>} printable={<TitrationGraph volume={25} indicatorId="phenolphthalein" view={view}/>}/><TheoryAnswer field={f.selection} view={view}/><TheoryAnswer field={f.range} view={view}/>
 {learn(view)&&<p className="illustrated-caption">この0.100 mol/L同士の例では、メチルオレンジ・メチルレッド・BTB・フェノールフタレインの変色域はいずれも急変域に入ります。希薄な溶液や別の酸塩基の組合せでは選択し直します。弱酸＋強塩基では酸性側で変色する指示薬は一般に不適切。変色域にpH 7を含むこと自体を選択基準にしません。印刷はフェノールフタレインの帯です。</p>}</Sheet></>;
}

const bufferSpec:PlotSpec={xDomain:[0,1],yDomain:[0,8],xTicks:[0,.25,.5,.75,1],yTicks:[0,2,4,6,8],xLabel:"100 mLに加えた強酸の物質量 [mmol]",yLabel:"pH（25 ℃、無次元）"};
export function BufferLesson({view}:{view:BlankView}){
 const f=fields.buffers,{x,y}=plotCoordinates(bufferSpec),samples=[0,.000001,.00001,.0001,.001,.005,...Array.from({length:100},(_,i)=>(i+1)/100)];
 return <><Sheet title="1. 酸・塩基を受け止める2種類の粒子"><Canvas title="HAとAイオンによる緩衝作用" height={475}>
  <IonBox x={45} y={50} width={320} height={180} ions={[{label:"HA",count:6},{label:"A⁻",count:6,tone:"#d1e5ef"}]}/><text x={205} y={29} textAnchor="middle">弱酸 HA + 共役塩基 A⁻</text>
  <Arrow x1={390} y1={100} x2={640} y2={100}/><text x={515} y={72} textAnchor="middle">H⁺を少量加える</text><IonBox x={680} y={38} width={320} height={155} ions={[{label:"HA",count:7},{label:"A⁻",count:5,tone:"#d1e5ef"}]}/>
  <Arrow x1={390} y1={210} x2={640} y2={300}/><text x={520} y={270} textAnchor="middle">OH⁻を少量加える</text><IonBox x={680} y={260} width={320} height={155} ions={[{label:"HA",count:5},{label:"A⁻",count:7,tone:"#d1e5ef"}]}/>
  <text x={840} y={226} textAnchor="middle">A⁻ + H⁺ → HA</text><text x={840} y={450} textAnchor="middle">HA + OH⁻ → A⁻ + H₂O</text>
 </Canvas><TheoryAnswer field={f.acid} view={view}/><TheoryAnswer field={f.base} view={view}/><p className="illustrated-caption">粒子は反応の向きを示す記号。HA/A⁻の比は少し変わるため、pHも完全に一定ではありません。</p></Sheet>
 <Sheet title="2. 同量の酸を加えたとき、水とどう違う？"><Canvas title="水と緩衝液のpH変化" height={450}><CartesianPlot spec={bufferSpec} points={samples.map(a=>[a,waterWithAcidPH(a)])}><polyline points={samples.map(a=>`${x(a)},${y(bufferPH(a))}`).join(" ")} className="buffer-curve"/><text x={700} y={70}>破線：HA/A⁻の緩衝液</text><text x={700} y={100}>実線：水</text></CartesianPlot></Canvas>
 <TheoryAnswer field={f.formula} view={view}/><TheoryAnswer field={f.capacity} view={view}/><p className="illustrated-caption">比較条件：各100 mL、強酸を0〜1 mmol添加、添加液の体積は無視。緩衝液はHAとA⁻を各5 mmol、pKa = 4.76の模式例で、近似式を用います。水は水の電離を含む計算。初期pHの違いと、加えた後の変化量を区別して読みます。</p>{learn(view)&&<p className="illustrated-caption">1 mmol添加時：水はpH 7から約2へ、緩衝液は4.76から約{bufferPH(1).toFixed(2)}へ。水での大きな変化は原点付近に集中します。対イオンは省略しており、溶液全体の電気的中性は保たれます。</p>}</Sheet></>;
}

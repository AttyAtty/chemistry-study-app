import {field,type AnswerField} from "./types";
import {acidBaseIndicators} from "../acidBaseIndicators";
const c=(id:string,text:string)=>field(id,text,"concept"),n=(id:string,text:string)=>field(id,text,"calculation");
const indicatorFields=Object.fromEntries(acidBaseIndicators.map(i=>[i.id,c(`indicator:${i.id}`,`${i.name}：pH ${i.low.toFixed(1)}–${i.high.toFixed(1)}、${i.acid} → ${i.base}`)])) as Record<typeof acidBaseIndicators[number]["id"],AnswerField>;
export const advancedTheoryLessons=[
 {slug:"acid-base",title:"酸・塩基・pHを図で理解",description:"粒子の偏り、pHの対数性、強弱と濃薄を区別する。"},
 {slug:"titration",title:"中和滴定を図で理解",description:"装置・中和する粒子・滴定曲線をつなぐ。"},
 {slug:"indicators",title:"指示薬を図で理解",description:"変色域をpH軸と滴定曲線で読む。"},
 {slug:"buffers",title:"緩衝液を図で理解",description:"弱酸と共役塩基が加えた酸・塩基を受け止める。"},
 {slug:"equilibrium",title:"化学平衡・ルシャトリエを図で理解",description:"正逆の速さと、条件変更への応答を比べる。"},
 {slug:"kinetics",title:"反応速度・活性化エネルギーを図で理解",description:"有効な衝突とエネルギー障壁をつなぐ。"},
] as const;
export type AdvancedTheorySlug=typeof advancedTheoryLessons[number]["slug"];
export const advancedTheoryFields={
 "acid-base":{
  acid:c("ph:acid","酸性：[H⁺] > [OH⁻]"),neutral:c("ph:neutral","中性：[H⁺] = [OH⁻]"),base:c("ph:base","塩基性：[H⁺] < [OH⁻]"),
  strength:c("ph:strength","強弱は電離の程度、濃薄は溶質の濃度。別の概念である"),log:n("ph:log","pH = −log₁₀[H⁺]。pHが1下がると[H⁺]は10倍"),kw:n("ph:kw","25 ℃では[H⁺][OH⁻] = 1.0×10⁻¹⁴、pH + pOH = 14"),
 },
 titration:{burette:c("titration:burette","ビュレット：既知濃度の滴定液を量って加える"),flask:c("titration:flask","三角フラスコ：量り取った試料と少量の指示薬を入れる"),
  equivalence:c("titration:equivalence","当量点：酸と塩基が化学量論的に過不足なく反応した点"),endpoint:c("titration:endpoint","終点：指示薬の変色などから実験的に判断した終了点"),calculation:n("titration:calculation","0.100 mol/L × 25.0 mL = 0.100 mol/L × V → V = 25.0 mL"),
 },
 indicators:{
  ...indicatorFields,
  selection:c("indicator:selection","変色域が当量点付近のpH急変域に入る指示薬を選ぶ"),range:n("indicator:range","この強酸・強塩基の例では、いずれの変色域も当量点付近の急変域に入る"),
 },
 buffers:{acid:c("buffer:acid","加えたH⁺をA⁻が受け取り、HAになる"),base:c("buffer:base","加えたOH⁻をHAが中和し、A⁻とH₂Oになる"),capacity:c("buffer:capacity","緩衝液にも容量があり、多量の酸・塩基にはpH変化を抑えきれない"),formula:n("buffer:formula","pH ≈ pKa + log₁₀([A⁻]/[HA])（両成分が十分に残るとき）")},
 equilibrium:{dynamic:c("equilibrium:dynamic","動的平衡：正反応速度 = 逆反応速度。濃度が等しいという意味ではない"),concentration:c("equilibrium:concentration","反応物を加える／生成物を除くと、それを減らす／補う向きへ進む"),pressure:c("equilibrium:pressure","温度一定で容器を圧縮すると、気体の物質量が少ない側が有利になる"),heat:c("equilibrium:heat","発熱反応は加熱で逆向き、吸熱反応は加熱で正向きが有利になる"),catalyst:c("equilibrium:catalyst","触媒は正逆両反応を速め、平衡位置と平衡定数を変えない"),constant:n("equilibrium:constant","A + B ⇄ C + D：Kc = [C][D] / ([A][B])（温度一定）")},
 kinetics:{collision:c("kinetics:collision","反応には衝突のエネルギーと適切な向きが必要"),concentration:c("kinetics:concentration","濃度上昇：単位体積当たりの粒子が増え、衝突の機会が増える"),temperature:c("kinetics:temperature","温度上昇：運動が速くなり、障壁を越えられる粒子の割合が増える"),surface:c("kinetics:surface","同じ質量の固体でも細かくすると表面積が増え、接触する機会が増える"),catalyst:c("kinetics:catalyst","触媒は別の反応経路を与え、活性化エネルギーを下げる"),heat:n("kinetics:heat","生成物と反応物のエネルギー差（ΔH）は触媒で変わらない")},
};
export const theoryGroups=[
 {title:"溶液・酸塩基",slugs:["solubility","acid-base","titration","indicators","buffers"]},
 {title:"平衡",slugs:["equilibrium"]},{title:"反応速度",slugs:["kinetics"]},{title:"状態・気体",slugs:["vapor-pressure","henry"]},
];

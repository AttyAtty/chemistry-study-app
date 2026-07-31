import type { QuizQuestion } from "@/data/chemistry";
import { cards, factQuestions, makeBasicUnit, table, type BasicFact } from "./helpers";

const facts: BasicFact[] = [
  { term: "原子量", definition: "元素の同位体を天然存在比で平均した相対質量", distractors: ["原子1個の質量をgで表した値", "陽子数と電子数の和", "分子中の原子数"] },
  { term: "分子量", definition: "分子を構成する原子の原子量の総和", distractors: ["イオンの個数", "溶液1 Lの質量", "物質1 molの体積"] },
  { term: "式量", definition: "組成式などに含まれる原子の原子量の総和", distractors: ["反応式の係数の和", "物質量の別名", "密度と体積の積"] },
  { term: "1 mol", definition: "約6.0×10²³個の粒子を含む物質量", distractors: ["22.4個の粒子", "1 gの物質", "すべての気体1 L"] },
  { term: "アボガドロ定数", definition: "1 mol当たりの粒子数で約6.0×10²³ mol⁻¹", distractors: ["標準状態のモル体積", "水のイオン積", "気体定数だけ"] },
  { term: "モル質量", definition: "物質1 mol当たりの質量で単位はg/mol", distractors: ["1個当たりの体積", "溶液100 g中の溶質質量", "密度の別名"] },
  { term: "物質量と質量", definition: "物質量＝質量÷モル質量", distractors: ["物質量＝質量×モル質量", "物質量＝体積×密度", "物質量＝粒子数×アボガドロ定数"] },
  { term: "粒子数", definition: "粒子数＝物質量×アボガドロ定数", distractors: ["物質量÷アボガドロ定数", "質量×22.4", "モル質量÷物質量"] },
  { term: "標準状態", definition: "0 ℃、1.013×10⁵ Paの状態", distractors: ["25 ℃、1 Pa", "0 K、1 atm", "室温なら圧力を問わない状態"] },
  { term: "標準状態のモル体積", definition: "気体1 mol当たり22.4 L", distractors: ["気体1 mol当たり24.0 mL", "液体1 mol当たり22.4 L", "条件によらず常に22.4 L"] },
  { term: "質量パーセント濃度", definition: "溶質の質量÷溶液の質量×100", distractors: ["溶媒の質量÷溶質の質量×100", "物質量÷溶液体積", "溶質質量÷溶媒体積"] },
  { term: "モル濃度", definition: "溶質の物質量÷溶液の体積(L)", distractors: ["溶質の質量÷溶液の質量", "溶液体積÷物質量", "溶媒の物質量÷溶液質量"] },
  { term: "希釈", definition: "溶媒を加えて濃度を下げる操作で、溶質の物質量は保存される", distractors: ["溶質を除いて濃度を上げる操作", "化学反応で溶質を変える操作", "温度だけを上げる操作"] },
  { term: "化学反応式の係数", definition: "反応する粒子数・物質量の最簡整数比", distractors: ["化学式中の原子数を変える添字", "反応速度を示す数字", "原子量を示す数字"] },
  { term: "質量保存の法則", definition: "閉じた系では化学反応前後の総質量が等しい", distractors: ["生成物の質量は必ず減る", "気体が出ると原子が消える", "反応後の物質量の総和が必ず同じ"] },
  { term: "定比例の法則", definition: "同じ化合物では構成元素の質量比が常に一定", distractors: ["混合物の組成が一定", "気体体積が必ず等しい", "同位体存在比が人工的に一定"] },
  { term: "粒子数比", definition: "化学反応式の係数比と等しい反応粒子の個数比", distractors: ["原子量比", "密度比", "温度比"] },
  { term: "物質量比", definition: "化学反応式の係数比と等しいmolの比", distractors: ["モル質量比", "質量比と常に同じ", "濃度比と常に同じ"] },
  { term: "気体体積比", definition: "同温・同圧の気体では反応式の係数比に等しい体積比", distractors: ["条件に関係なく質量比に等しい", "液体にも常に適用できる", "原子量比に等しい"] },
  { term: "限界試薬", definition: "反応物のうち先に使い切られ、生成物の最大量を決める物質", distractors: ["反応後に必ず余る物質", "触媒の別名", "最もモル質量が大きい物質"] },
  { term: "過剰試薬", definition: "限界試薬がなくなった後も一部が残る反応物", distractors: ["最初に使い切られる物質", "生成物", "反応を速めるだけの物質"] },
  { term: "収量", definition: "反応で実際に得られた生成物の量", distractors: ["反応物の初期質量だけ", "触媒の量", "溶媒の体積"] },
  { term: "反応量計算の第1段階", definition: "化学反応式を書き、係数を合わせる", distractors: ["直ちに質量を足す", "化学式の添字を書き換える", "単位を消す"] },
  { term: "反応量計算の中心", definition: "与えられた量をmolへ直し、係数比を使う", distractors: ["質量比を推測する", "すべて22.4で割る", "原子量を無視する"] },
  { term: "mLからLへの換算", definition: "mLの値を1000で割る", distractors: ["1000倍する", "100で割る", "22.4で割る"] },
  { term: "指数表記", definition: "非常に大きい・小さい数をa×10ⁿの形で表す方法", distractors: ["単位を省略する方法", "化学式の係数", "有効数字を無限に増やす方法"] },
  { term: "有効数字", definition: "測定値として意味をもつ桁で、結果は測定精度に合わせる", distractors: ["小数点以下の桁だけ", "必ず整数1桁", "単位を付けないための規則"] },
];

const customQuestions: QuizQuestion[] = [
  { id: "basic2-calc-1", prompt: "H₂Oの分子量をH=1.0、O=16.0として求めるといくつですか。", choices: ["18.0", "17.0", "16.0", "20.0"], answerIndex: 0, explanation: "2×1.0+16.0=18.0です。", tags: ["計算", "分子量"] },
  { id: "basic2-calc-2", prompt: "Ca(OH)₂の式量をCa=40、O=16、H=1として求めるといくつですか。", choices: ["74", "57", "58", "92"], answerIndex: 0, explanation: "40+2×(16+1)=74です。括弧全体を2倍します。", tags: ["計算", "式量"] },
  { id: "basic2-calc-3", prompt: "18 gのH₂Oは何molですか（モル質量18 g/mol）。", choices: ["1.0 mol", "0.50 mol", "18 mol", "324 mol"], answerIndex: 0, explanation: "18 g÷18 g/mol=1.0 molです。", tags: ["計算", "mol"] },
  { id: "basic2-calc-4", prompt: "0.50 molの粒子数は何個ですか。", choices: ["3.0×10²³個", "6.0×10²³個", "1.2×10²⁴個", "8.3×10⁻²⁵個"], answerIndex: 0, explanation: "0.50×6.0×10²³=3.0×10²³個です。", tags: ["計算", "粒子数"] },
  { id: "basic2-calc-5", prompt: "標準状態で11.2 Lの気体は何molですか。", choices: ["0.50 mol", "1.0 mol", "2.0 mol", "22.4 mol"], answerIndex: 0, explanation: "11.2÷22.4=0.50 molです。", tags: ["計算", "気体"] },
  { id: "basic2-calc-6", prompt: "NaCl 0.20 molを水に溶かして500 mLとした溶液のモル濃度は？", choices: ["0.40 mol/L", "0.10 mol/L", "2.5 mol/L", "100 mol/L"], answerIndex: 0, explanation: "500 mL=0.500 L。0.20÷0.500=0.40 mol/Lです。", tags: ["計算", "濃度"] },
  { id: "basic2-calc-7", prompt: "食塩10 gと水90 gからなる溶液の質量パーセント濃度は？", choices: ["10%", "11%", "9.0%", "90%"], answerIndex: 0, explanation: "溶液は100 gなので10÷100×100=10%です。", tags: ["計算", "濃度"] },
  { id: "basic2-calc-8", prompt: "2H₂+O₂→2H₂Oで、H₂ 3 molに十分なO₂を反応させるとH₂Oは何mol生じますか。", choices: ["3 mol", "1.5 mol", "6 mol", "2 mol"], answerIndex: 0, explanation: "H₂:H₂O=2:2=1:1です。", tags: ["計算", "係数比"] },
  { id: "basic2-calc-9", prompt: "2H₂+O₂→2H₂Oで、H₂ 2 molとO₂ 2 molを混ぜたときの限界試薬は？", choices: ["H₂", "O₂", "H₂O", "どちらも同時"], answerIndex: 0, explanation: "H₂ 2 molに必要なO₂は1 mol。H₂が先になくなります。", tags: ["計算", "限界試薬"] },
  { id: "basic2-calc-10", prompt: "開放容器で炭酸塩に酸を加えると測定質量が減った理由として適切なのは？", choices: ["発生した気体が系外へ出た", "原子が消滅した", "質量保存が成立しない", "触媒が質量を奪った"], answerIndex: 0, explanation: "系外へ出た気体も含めれば質量は保存されます。", tags: ["実験", "質量保存"] },
  { id: "basic2-calc-11", prompt: "反応式の係数合わせで変更してはいけないものは？", choices: ["化学式中の添字", "式の前の係数", "左右の係数比", "最簡整数倍"], answerIndex: 0, explanation: "添字を変えると別の物質になります。", tags: ["反応式"] },
  { id: "basic2-calc-12", prompt: "標準状態でない気体へ22.4 L/molを無条件に使えない理由は？", choices: ["気体体積は温度と圧力で変わる", "物質量は単位をもたない", "気体に質量がない", "原子量が温度で変わる"], answerIndex: 0, explanation: "22.4 L/molは0 ℃、1.013×10⁵ Paという条件の値です。", tags: ["共通テスト", "気体"] },
];

export const chemistryBasicMole = makeBasicUnit({
  slug: "chemistry-basic-mole-reactions",
  title: "化学基礎Ⅱ：物質量と化学反応式",
  shortTitle: "基礎Ⅱ 物質量と反応式",
  icon: "∑",
  summary: "原子量・mol・濃度・反応式を、単位を意識した共通手順で計算できるようにします。",
  keywords: ["化学基礎", "mol", "濃度", "反応式", "限界試薬", "有効数字"],
  sections: [
    table("mass", "原子量・分子量・式量", "化学式に含まれる原子量を、添字と括弧に注意して合計します。", ["例", "計算"], [["H₂O", "2×1.0+16.0=18.0"], ["NaCl", "23.0+35.5=58.5"], ["Ca(OH)₂", "40.0+2×(16.0+1.0)=74.0"]]),
    cards("mole", "物質量・粒子数・質量・気体体積", "すべてmolを中心に行き来します。", [
      { title: "粒子数", body: "N=nNₐ。Nₐ≈6.0×10²³ mol⁻¹。分子、原子、イオン、化学式単位のどれを数えるか確認します。" },
      { title: "質量", body: "n=m/M、m=nM。Mはモル質量(g/mol)です。式と数値だけでなく単位も書きます。" },
      { title: "気体", body: "標準状態（0 ℃、1.013×10⁵ Pa）ではn=V/22.4。条件が異なると22.4 L/molは使えません。" },
    ]),
    table("concentration", "溶液の濃度", "溶液体積はLへ換算します。", ["濃度", "式・注意"], [["質量%", "溶質質量/溶液質量×100"], ["モル濃度", "溶質mol/溶液L"], ["希釈", "希釈前後で溶質molが保存：c₁V₁=c₂V₂"]]),
    cards("equations", "化学反応式", "原子数と電荷を保存し、係数を最簡整数比にします。", [
      { title: "係数と添字", body: "H₂+O₂→H₂Oは2H₂+O₂→2H₂O。変えてよいのは式の前の係数で、添字を変えると別物質になります。" },
      { title: "式が表す関係", body: "係数比は粒子数比・物質量比、同温同圧の気体なら体積比を表します。質量比はモル質量も考えます。" },
      { title: "状態・現象", body: "必要に応じて(s)(l)(g)(aq)、気体↑、沈殿↓、加熱や触媒を記します。触媒は反応物の係数へ含めません。" },
    ]),
    cards("procedure", "反応量計算の5ステップ", "毎回同じ順番で解きます。", [
      { title: "1–2", body: "①化学反応式を書く ②係数を合わせる" },
      { title: "3–4", body: "③与えられた量をmolへ変換 ④係数比で目的物質のmolを求める" },
      { title: "5", body: "⑤質量・粒子数・体積・濃度など、求める単位へ戻す" },
    ]),
    cards("limiting", "過不足・保存則・測定値", "複数の情報を組み合わせる入試問題へつなげます。", [
      { title: "限界試薬", body: "各反応物のmolを係数で割り、小さい側が先になくなります。そこから生成物の最大量と余る物質を求めます。" },
      { title: "質量保存", body: "閉じた系の総質量は一定です。開放系では気体の出入りにより見かけの質量が変わるため、系の範囲を確認します。" },
      { title: "単位と有効数字", body: "mL↔L、g↔kg、指数表記を正しく変換し、結果の桁は与えられた測定値の精度に合わせます。" },
    ]),
  ],
  questions: [...factQuestions("basic2", facts), ...customQuestions],
});

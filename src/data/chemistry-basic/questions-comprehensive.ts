import { factQuestions, type BasicFact } from "./helpers";

const comprehensiveFacts: BasicFact[] = [
  { term: "物質分類の判断", definition: "空気は混合物、O₂は単体、H₂Oは化合物である", distractors: ["空気は純物質である", "O₂は化合物である", "H₂Oは単体である"], tags: ["総合", "物質"] },
  { term: "分離法の選択", definition: "食塩水から水を得るには沸点差を利用する蒸留が適する", distractors: ["ろ過だけで水を得る", "炎色反応で分ける", "中和滴定で分ける"], tags: ["総合", "実験"] },
  { term: "核種の粒子数", definition: "質量数A、原子番号Zなら陽子Z、中性子A−Zである", distractors: ["陽子A、中性子Z", "電子A−Zだけ", "中性子A+Z"], tags: ["総合", "原子"] },
  { term: "同位体の平均", definition: "相対原子質量は相対質量を天然存在比で加重平均する", distractors: ["質量数を単純平均する", "最大質量だけ採る", "電子数を平均する"], tags: ["総合", "計算"] },
  { term: "周期表とイオン", definition: "17族典型元素は価電子7で1価陰イオンになりやすい", distractors: ["1価陽イオンになりやすい", "価電子2である", "必ず反応しない"], tags: ["総合", "周期表"] },
  { term: "結合と伝導性", definition: "イオン結晶は固体で不導体だが融解物や水溶液では導体になる", distractors: ["固体だけが導体", "常に不導体", "自由電子が水中を流れる"], tags: ["総合", "結合"] },
  { term: "分子の極性", definition: "CO₂は結合に極性があっても直線形で打ち消し合い無極性である", distractors: ["CO₂は必ずイオンになる", "H₂Oも直線形で無極性", "極性は形と無関係"], tags: ["総合", "分子"] },
  { term: "mol換算", definition: "質量をモル質量で割ってmolへ直し、粒子数や反応係数比へ進む", distractors: ["質量へ22.4を掛ける", "添字を書き換える", "単位を無視する"], tags: ["総合", "計算"] },
  { term: "標準状態の注意", definition: "22.4 L/molは0 ℃、1.013×10⁵ Paの気体に用いる", distractors: ["すべての温度・圧力で使う", "液体にも使う", "固体の密度式である"], tags: ["総合", "気体"] },
  { term: "濃度計算", definition: "モル濃度では溶液体積をmLからLへ直す", distractors: ["溶媒体積だけを使う", "mLのまま必ず使う", "質量を体積へ足す"], tags: ["総合", "濃度"] },
  { term: "反応量計算", definition: "反応式を合わせ、molへ変換し、係数比を使って求める単位へ戻す", distractors: ["最初に質量を直接比較するだけ", "係数を無視する", "添字を変えて合わせる"], tags: ["総合", "反応式"] },
  { term: "酸の強弱", definition: "酸の強弱は電離の程度で、溶液の濃度とは別の概念である", distractors: ["薄い酸はすべて弱酸", "価数と強弱は同じ", "pHだけで物質を強酸と決める"], tags: ["総合", "酸塩基"] },
  { term: "pHの関係", definition: "常温では[H⁺][OH⁻]=1.0×10⁻¹⁴かつpH+pOH=14", distractors: ["[H⁺]+[OH⁻]=14", "pH×pOH=14", "温度に関係なく常に同じと断定する"], tags: ["総合", "pH"] },
  { term: "滴定器具", definition: "ビュレットとホールピペットは使用液で共洗いする", distractors: ["コニカルビーカーだけ共洗いする", "すべて加熱乾燥する", "メスフラスコを直火加熱する"], tags: ["総合", "実験"] },
  { term: "酸化数と電子", definition: "酸化数が増加した粒子は電子を失い酸化されている", distractors: ["電子を受け取り還元されている", "必ず中和されている", "電荷保存と無関係である"], tags: ["総合", "酸化還元"] },
  { term: "金属の置換", definition: "イオン化傾向の大きい金属は小さい金属のイオンを還元できる", distractors: ["逆だけが起こる", "金属の密度だけで決まる", "電子移動を伴わない"], tags: ["総合", "金属"] },
  { term: "電池の電子", definition: "電池では負極で酸化、正極で還元が起こり、電子は外部回路を負極から正極へ流れる", distractors: ["正極で酸化が起こる", "電子が電解液中を負極から正極へ流れる", "両極で還元が起こる"], tags: ["総合", "電池"] },
];

export const chemistryBasicComprehensiveQuestions = factQuestions("basic-total", comprehensiveFacts);

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  tags: string[];
};

export type CardEntry = {
  title: string;
  body: string;
  equation?: string;
  note?: string;
};

export type FlowEntry = {
  title: string;
  nodes: string[];
  note?: string;
};

export type StudySection =
  | {
      id: string;
      title: string;
      description?: string;
      kind: "cards";
      entries: CardEntry[];
    }
  | {
      id: string;
      title: string;
      description?: string;
      kind: "table";
      columns: string[];
      rows: string[][];
    }
  | {
      id: string;
      title: string;
      description?: string;
      kind: "flow";
      flows: FlowEntry[];
    };

export type ChemistryUnit = {
  slug: string;
  title: string;
  shortTitle: string;
  icon: string;
  summary: string;
  level: string;
  keywords: string[];
  sections: StudySection[];
  questions: QuizQuestion[];
};

export const chemistryUnits: ChemistryUnit[] = [
  {
    slug: "organic-reactions",
    title: "有機化学の反応系統",
    shortTitle: "有機反応",
    icon: "🧪",
    summary: "官能基の変換、芳香族化合物、高分子までを反応の流れで整理します。",
    level: "高校化学",
    keywords: ["有機", "官能基", "アルコール", "カルボン酸", "ベンゼン"],
    sections: [
      {
        id: "aliphatic-flow",
        title: "脂肪族化合物の基本系統",
        description: "物質名を単独で覚えるより、何を酸化・還元・加水分解したかでつなげます。",
        kind: "flow",
        flows: [
          {
            title: "エチレンから酢酸エチルまで",
            nodes: [
              "エチレン CH₂=CH₂",
              "エタノール C₂H₅OH",
              "アセトアルデヒド CH₃CHO",
              "酢酸 CH₃COOH",
              "酢酸エチル CH₃COOC₂H₅",
            ],
            note: "順に、水和、穏やかな酸化、酸化、エステル化。逆向きの代表は加水分解や還元です。",
          },
          {
            title: "アセチレンの付加反応",
            nodes: ["アセチレン HC≡CH", "アセトアルデヒド CH₃CHO", "酢酸 CH₃COOH"],
            note: "アセチレンに水を付加すると、途中の不安定なエノール形を経てアセトアルデヒドになります。",
          },
        ],
      },
      {
        id: "functional-groups",
        title: "代表的な官能基反応",
        kind: "cards",
        entries: [
          {
            title: "アルコールの酸化",
            body: "第一級アルコールはアルデヒドを経てカルボン酸へ、第二級アルコールはケトンへ酸化されます。第三級アルコールは通常の条件では酸化されにくいです。",
            equation: "R-CH₂OH → R-CHO → R-COOH",
          },
          {
            title: "エステル化",
            body: "カルボン酸とアルコールを濃硫酸存在下で加熱すると、エステルと水が生じます。反応は可逆です。",
            equation: "R-COOH + R'-OH ⇄ R-COOR' + H₂O",
          },
          {
            title: "けん化",
            body: "エステルを水酸化ナトリウム水溶液と加熱すると、カルボン酸塩とアルコールが生じます。油脂のけん化では高級脂肪酸塩が石けんになります。",
            equation: "R-COOR' + NaOH → R-COONa + R'-OH",
          },
          {
            title: "銀鏡反応",
            body: "アルデヒド基をもつ物質はアンモニア性硝酸銀水溶液を還元し、銀を析出させます。ギ酸や還元糖も陽性です。",
            note: "ケトンは原則として陰性です。",
          },
        ],
      },
      {
        id: "aromatic",
        title: "芳香族化合物の整理",
        kind: "table",
        columns: ["出発物質", "反応・試薬", "主生成物", "重要事項"],
        rows: [
          ["ベンゼン", "濃硝酸＋濃硫酸", "ニトロベンゼン", "ニトロ化"],
          ["ベンゼン", "濃硫酸・加熱", "ベンゼンスルホン酸", "スルホン化"],
          ["ベンゼン", "Cl₂、FeCl₃", "クロロベンゼン", "置換反応"],
          ["トルエン", "強い酸化", "安息香酸", "側鎖がカルボキシ基へ"],
          ["フェノール", "臭素水", "2,4,6-トリブロモフェノール", "白色沈殿"],
          ["アニリン", "塩酸", "アニリン塩酸塩", "弱塩基として反応"],
        ],
      },
    ],
    questions: [
      {
        id: "org-1",
        prompt: "エタノールを穏やかに酸化したとき、最初に生じる主生成物はどれですか。",
        choices: ["酢酸", "アセトアルデヒド", "アセトン", "エチレン"],
        answerIndex: 1,
        explanation: "エタノールは第一級アルコールなので、まずアセトアルデヒドになり、さらに酸化されると酢酸になります。",
        tags: ["アルコール", "酸化"],
      },
      {
        id: "org-2",
        prompt: "酢酸とエタノールを濃硫酸存在下で加熱すると主に何が生じますか。",
        choices: ["酢酸エチル", "ジエチルエーテル", "アセトアルデヒド", "エチレン"],
        answerIndex: 0,
        explanation: "カルボン酸とアルコールの脱水縮合でエステルが生じます。",
        tags: ["エステル化"],
      },
      {
        id: "org-3",
        prompt: "次のうち、銀鏡反応を示すものはどれですか。",
        choices: ["アセトン", "酢酸エチル", "アセトアルデヒド", "ベンゼン"],
        answerIndex: 2,
        explanation: "アルデヒド基をもつアセトアルデヒドは銀鏡反応を示します。",
        tags: ["検出反応"],
      },
      {
        id: "org-4",
        prompt: "油脂を水酸化ナトリウム水溶液と加熱する反応を何といいますか。",
        choices: ["加水分解", "けん化", "重合", "ニトロ化"],
        answerIndex: 1,
        explanation: "油脂の塩基性条件での加水分解をけん化といい、石けんとグリセリンが生じます。",
        tags: ["油脂", "けん化"],
      },
      {
        id: "org-5",
        prompt: "フェノールに臭素水を加えたときに生じる沈殿の色はどれですか。",
        choices: ["青色", "赤褐色", "白色", "黒色"],
        answerIndex: 2,
        explanation: "2,4,6-トリブロモフェノールの白色沈殿が生じます。",
        tags: ["芳香族", "フェノール"],
      },
      {
        id: "org-6",
        prompt: "第二級アルコールを酸化すると、一般に何になりますか。",
        choices: ["アルデヒド", "カルボン酸", "ケトン", "エステル"],
        answerIndex: 2,
        explanation: "第二級アルコールの酸化では、ヒドロキシ基のある炭素がカルボニル炭素となりケトンが生じます。",
        tags: ["アルコール", "酸化"],
      },
    ],
  },
  {
    slug: "inorganic-reactions",
    title: "無機化学の反応整理",
    shortTitle: "無機反応",
    icon: "⚗️",
    summary: "気体発生、沈殿、両性元素、酸化還元を反応パターン別に整理します。",
    level: "高校化学",
    keywords: ["無機", "気体", "沈殿", "両性", "酸化還元"],
    sections: [
      {
        id: "gas-generation",
        title: "代表的な気体の発生法",
        kind: "table",
        columns: ["気体", "実験室での代表的製法", "捕集法", "確認・性質"],
        rows: [
          ["H₂", "Zn + 希H₂SO₄", "水上置換", "点火すると音を立てて燃える"],
          ["O₂", "H₂O₂をMnO₂で分解", "水上置換", "線香の火が激しくなる"],
          ["CO₂", "CaCO₃ + 希HCl", "下方置換", "石灰水を白濁"],
          ["NH₃", "NH₄Cl + Ca(OH)₂を加熱", "上方置換", "湿らせた赤リトマス紙を青変"],
          ["Cl₂", "MnO₂ + 濃HClを加熱", "下方置換", "黄緑色、漂白・酸化作用"],
          ["H₂S", "FeS + 希HCl", "下方置換", "腐卵臭、重金属イオンと硫化物沈殿"],
        ],
      },
      {
        id: "amphoteric",
        title: "両性元素と両性水酸化物",
        kind: "cards",
        entries: [
          {
            title: "アルミニウム",
            body: "Al、Al₂O₃、Al(OH)₃は酸にも強塩基にも反応します。Al(OH)₃は白色ゲル状沈殿です。",
            equation: "Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻",
          },
          {
            title: "亜鉛",
            body: "Zn、ZnO、Zn(OH)₂は両性を示します。Zn(OH)₂は過剰のNaOHに溶け、錯イオンを作ります。",
            equation: "Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻",
          },
          {
            title: "スズ・鉛",
            body: "SnやPbの酸化物・水酸化物にも両性を示すものがあります。高校範囲では Al、Zn、Sn、Pb をまとめて覚えます。",
            note: "両性元素の語呂だけで終わらず、酸・強塩基の両方に反応する意味を確認します。",
          },
        ],
      },
      {
        id: "redox-patterns",
        title: "無機反応で頻出の酸化還元",
        kind: "flow",
        flows: [
          {
            title: "ハロゲンの酸化力",
            nodes: ["F₂", "Cl₂", "Br₂", "I₂"],
            note: "左ほど酸化力が強いです。Cl₂はBr⁻やI⁻を酸化できます。",
          },
          {
            title: "硫黄の酸化数変化",
            nodes: ["H₂S：−2", "S：0", "SO₂：+4", "H₂SO₄：+6"],
            note: "反応式を丸暗記する前に、硫黄の酸化数を追うと酸化剤・還元剤を判定できます。",
          },
        ],
      },
    ],
    questions: [
      {
        id: "inorg-1",
        prompt: "アンモニアの捕集に適する方法はどれですか。",
        choices: ["水上置換", "上方置換", "下方置換", "どれでも同じ"],
        answerIndex: 1,
        explanation: "アンモニアは水に非常によく溶け、空気より軽いため上方置換で集めます。",
        tags: ["気体", "捕集"],
      },
      {
        id: "inorg-2",
        prompt: "二酸化炭素を石灰水に通したとき、最初に生じる白色沈殿は何ですか。",
        choices: ["CaO", "CaCO₃", "Ca(HCO₃)₂", "CaSO₄"],
        answerIndex: 1,
        explanation: "CO₂ + Ca(OH)₂ → CaCO₃↓ + H₂O により炭酸カルシウムが沈殿します。",
        tags: ["二酸化炭素", "沈殿"],
      },
      {
        id: "inorg-3",
        prompt: "次のうち両性元素ではないものはどれですか。",
        choices: ["Al", "Zn", "Na", "Sn"],
        answerIndex: 2,
        explanation: "高校範囲で代表的な両性元素は Al、Zn、Sn、Pb です。Naはアルカリ金属です。",
        tags: ["両性元素"],
      },
      {
        id: "inorg-4",
        prompt: "塩素がヨウ化物イオンを含む水溶液に加わると、主に何が起こりますか。",
        choices: ["I₂がI⁻に還元される", "I⁻がI₂に酸化される", "Cl₂が酸化される", "変化しない"],
        answerIndex: 1,
        explanation: "塩素の方がヨウ素より酸化力が強いため、2I⁻ + Cl₂ → I₂ + 2Cl⁻ が起こります。",
        tags: ["ハロゲン", "酸化還元"],
      },
      {
        id: "inorg-5",
        prompt: "過酸化水素から酸素を発生させるとき、二酸化マンガンの役割は何ですか。",
        choices: ["酸化剤", "還元剤", "触媒", "乾燥剤"],
        answerIndex: 2,
        explanation: "MnO₂は過酸化水素の分解速度を高めますが、反応前後で実質的に消費されない触媒です。",
        tags: ["気体発生", "触媒"],
      },
      {
        id: "inorg-6",
        prompt: "硫化水素に含まれる硫黄の酸化数はいくつですか。",
        choices: ["−2", "0", "+4", "+6"],
        answerIndex: 0,
        explanation: "Hは通常+1なので、H₂S全体が0になるためSは−2です。",
        tags: ["酸化数"],
      },
    ],
  },
  {
    slug: "batteries-electrolysis",
    title: "電池と電気分解",
    shortTitle: "電池・電気分解",
    icon: "🔋",
    summary: "正極・負極、電子の流れ、電極反応、電気分解の生成物を整理します。",
    level: "高校化学",
    keywords: ["電池", "電気分解", "電極", "酸化", "還元"],
    sections: [
      {
        id: "battery-table",
        title: "代表的な電池",
        kind: "table",
        columns: ["電池", "負極側", "正極側", "ポイント"],
        rows: [
          ["ダニエル電池", "Zn → Zn²⁺ + 2e⁻", "Cu²⁺ + 2e⁻ → Cu", "電子はZn極からCu極へ"],
          ["鉛蓄電池（放電）", "Pb + SO₄²⁻ → PbSO₄ + 2e⁻", "PbO₂が還元されPbSO₄へ", "放電で両極にPbSO₄が生成"],
          ["水素燃料電池", "H₂が酸化", "O₂が還元", "全体として水が生成"],
          ["アルカリマンガン乾電池", "Znが酸化", "MnO₂が還元", "電解質は強塩基性"],
        ],
      },
      {
        id: "electrolysis-rules",
        title: "電気分解の判断手順",
        kind: "flow",
        flows: [
          {
            title: "陰極で何が生じるか",
            nodes: ["陽イオンを確認", "金属イオンかH⁺・水かを比較", "還元されやすい粒子が電子を受け取る"],
            note: "水溶液では、イオン化傾向が大きい金属のイオンより水やH⁺が還元されやすい場合があります。",
          },
          {
            title: "陽極で何が生じるか",
            nodes: ["陰イオンと電極材料を確認", "ハロゲン化物イオンまたは水・OH⁻を比較", "酸化されやすい粒子が電子を放出"],
            note: "銅などの活性電極では、電極自身が溶ける反応も候補になります。",
          },
        ],
      },
      {
        id: "electrolysis-examples",
        title: "代表的な電気分解",
        kind: "cards",
        entries: [
          {
            title: "CuSO₄水溶液・白金電極",
            body: "陰極ではCu²⁺が還元されCuが析出し、陽極では水が酸化されO₂が発生します。",
            equation: "陰極：Cu²⁺ + 2e⁻ → Cu",
          },
          {
            title: "NaCl水溶液・不活性電極",
            body: "陰極では水が還元されH₂、陽極ではCl⁻が酸化されCl₂が生じます。溶液中にはNaOHが残ります。",
            equation: "2NaCl + 2H₂O → 2NaOH + H₂ + Cl₂",
          },
          {
            title: "CuSO₄水溶液・銅電極",
            body: "陰極で銅が析出し、陽極では銅がCu²⁺として溶けます。銅の電解精錬や電解めっきの基本です。",
            equation: "陽極：Cu → Cu²⁺ + 2e⁻",
          },
        ],
      },
    ],
    questions: [
      {
        id: "bat-1",
        prompt: "ダニエル電池の放電中、電子は外部回路をどちら向きに流れますか。",
        choices: ["Cu極からZn極", "Zn極からCu極", "塩橋からZn極", "電解液から外部回路"],
        answerIndex: 1,
        explanation: "Zn極で酸化により電子が生じ、Cu極でCu²⁺が電子を受け取ります。",
        tags: ["ダニエル電池"],
      },
      {
        id: "bat-2",
        prompt: "電池の負極で起こる反応は一般にどれですか。",
        choices: ["還元", "中和", "酸化", "沈殿"],
        answerIndex: 2,
        explanation: "電池では負極で酸化、正極で還元が起こります。",
        tags: ["電極反応"],
      },
      {
        id: "bat-3",
        prompt: "硫酸銅水溶液を白金電極で電気分解したとき、陰極に析出する物質は何ですか。",
        choices: ["水素", "酸素", "銅", "硫黄"],
        answerIndex: 2,
        explanation: "陰極ではCu²⁺ + 2e⁻ → Cu が起こり、銅が析出します。",
        tags: ["電気分解"],
      },
      {
        id: "bat-4",
        prompt: "塩化ナトリウム水溶液を不活性電極で電気分解したとき、陽極で生じる気体は何ですか。",
        choices: ["H₂", "O₂", "Cl₂", "NH₃"],
        answerIndex: 2,
        explanation: "陽極では2Cl⁻ → Cl₂ + 2e⁻ が起こります。",
        tags: ["電気分解", "食塩水"],
      },
      {
        id: "bat-5",
        prompt: "鉛蓄電池の放電が進むと、両極に増える物質はどれですか。",
        choices: ["PbO₂", "PbSO₄", "PbCl₂", "H₂SO₄"],
        answerIndex: 1,
        explanation: "放電では負極のPbと正極のPbO₂がともにPbSO₄へ変化します。",
        tags: ["鉛蓄電池"],
      },
      {
        id: "bat-6",
        prompt: "水素燃料電池の全体反応で主に生成する物質は何ですか。",
        choices: ["水", "アンモニア", "塩化水素", "過酸化水素のみ"],
        answerIndex: 0,
        explanation: "水素と酸素の反応により、全体として水が生成します。",
        tags: ["燃料電池"],
      },
    ],
  },
  {
    slug: "colors-and-tests",
    title: "イオン・物質の色と確認反応",
    shortTitle: "色・確認反応",
    icon: "🎨",
    summary: "水溶液、沈殿、固体、炎色反応の色を比較しながら覚えます。",
    level: "高校化学",
    keywords: ["色", "イオン", "沈殿", "炎色反応", "確認反応"],
    sections: [
      {
        id: "solution-colors",
        title: "水溶液中の代表的なイオンの色",
        kind: "table",
        columns: ["イオン", "代表的な色", "覚える際の注意"],
        rows: [
          ["Cu²⁺", "青色", "水和銅(II)イオン"],
          ["Fe²⁺", "淡緑色", "空気酸化でFe³⁺へ変化しやすい"],
          ["Fe³⁺", "黄褐色", "SCN⁻で血赤色の錯体"],
          ["Ni²⁺", "緑色", "錯体形成で色が変わる場合あり"],
          ["CrO₄²⁻", "黄色", "酸性でCr₂O₇²⁻側へ"],
          ["Cr₂O₇²⁻", "橙色", "強い酸化剤"],
          ["MnO₄⁻", "赤紫色", "過マンガン酸イオン"],
        ],
      },
      {
        id: "precipitate-colors",
        title: "沈殿の色",
        kind: "table",
        columns: ["沈殿", "色", "生成例"],
        rows: [
          ["AgCl", "白色", "Ag⁺ + Cl⁻ → AgCl↓"],
          ["AgBr", "淡黄色", "Ag⁺ + Br⁻ → AgBr↓"],
          ["AgI", "黄色", "Ag⁺ + I⁻ → AgI↓"],
          ["Cu(OH)₂", "青白色", "Cu²⁺ + 2OH⁻ → Cu(OH)₂↓"],
          ["Fe(OH)₂", "緑白色", "空気中で酸化され褐色へ"],
          ["Fe(OH)₃", "赤褐色", "Fe³⁺ + 3OH⁻ → Fe(OH)₃↓"],
          ["ZnS", "白色", "Zn²⁺ + S²⁻ → ZnS↓"],
          ["CuS", "黒色", "Cu²⁺ + S²⁻ → CuS↓"],
          ["CdS", "黄色", "Cd²⁺ + S²⁻ → CdS↓"],
        ],
      },
      {
        id: "flame-tests",
        title: "炎色反応",
        kind: "cards",
        entries: [
          { title: "Li", body: "赤色" },
          { title: "Na", body: "黄色" },
          { title: "K", body: "紫色", note: "Naの黄色を避けるためコバルトガラスを使うことがあります。" },
          { title: "Ca", body: "橙赤色" },
          { title: "Sr", body: "紅色" },
          { title: "Ba", body: "黄緑色" },
          { title: "Cu", body: "青緑色" },
        ],
      },
    ],
    questions: [
      {
        id: "color-1",
        prompt: "銅(II)イオンを含む水溶液の代表的な色はどれですか。",
        choices: ["青色", "赤紫色", "黄色", "無色"],
        answerIndex: 0,
        explanation: "水和したCu²⁺を含む水溶液は青色を示します。",
        tags: ["イオンの色"],
      },
      {
        id: "color-2",
        prompt: "水酸化鉄(III)の沈殿の色はどれですか。",
        choices: ["白色", "青白色", "赤褐色", "黄色"],
        answerIndex: 2,
        explanation: "Fe(OH)₃は赤褐色沈殿です。",
        tags: ["沈殿"],
      },
      {
        id: "color-3",
        prompt: "過マンガン酸イオン MnO₄⁻ の色はどれですか。",
        choices: ["橙色", "赤紫色", "淡緑色", "青色"],
        answerIndex: 1,
        explanation: "MnO₄⁻は濃い赤紫色を示します。",
        tags: ["イオンの色"],
      },
      {
        id: "color-4",
        prompt: "ナトリウムの炎色反応は何色ですか。",
        choices: ["黄色", "紫色", "青緑色", "紅色"],
        answerIndex: 0,
        explanation: "Naは強い黄色の炎色反応を示します。",
        tags: ["炎色反応"],
      },
      {
        id: "color-5",
        prompt: "塩化銀 AgCl の沈殿の色はどれですか。",
        choices: ["黒色", "白色", "黄色", "赤褐色"],
        answerIndex: 1,
        explanation: "AgClは白色、AgBrは淡黄色、AgIは黄色です。",
        tags: ["銀塩"],
      },
      {
        id: "color-6",
        prompt: "二クロム酸イオン Cr₂O₇²⁻ の色はどれですか。",
        choices: ["黄色", "橙色", "赤紫色", "緑色"],
        answerIndex: 1,
        explanation: "Cr₂O₇²⁻は橙色、CrO₄²⁻は黄色です。",
        tags: ["クロム"],
      },
    ],
  },
  {
    slug: "industrial-processes",
    title: "工業的製法",
    shortTitle: "工業的製法",
    icon: "🏭",
    summary: "原料、触媒、温度・圧力、循環工程を製法ごとにまとめます。",
    level: "高校化学",
    keywords: ["工業", "ハーバー", "接触法", "オストワルト", "ソルベー"],
    sections: [
      {
        id: "industrial-table",
        title: "主要な工業的製法の比較",
        kind: "table",
        columns: ["製法", "目的物", "主反応・原料", "条件・触媒"],
        rows: [
          ["ハーバー・ボッシュ法", "NH₃", "N₂ + 3H₂ ⇄ 2NH₃", "鉄系触媒、高温・高圧"],
          ["オストワルト法", "HNO₃", "NH₃をNOへ酸化し、NO₂を経て吸収", "Pt-Rh触媒"],
          ["接触法", "H₂SO₄", "2SO₂ + O₂ ⇄ 2SO₃", "V₂O₅触媒"],
          ["アンモニアソーダ法", "Na₂CO₃", "飽和食塩水、NH₃、CO₂", "NaHCO₃を沈殿・熱分解"],
          ["溶融塩電解", "Al", "溶融Al₂O₃を電解", "氷晶石に溶かして融点低下"],
          ["高炉法", "Fe", "鉄鉱石をCOで還元", "コークス・石灰石を使用"],
          ["食塩水電解", "Cl₂、H₂、NaOH", "濃いNaCl水溶液を電解", "イオン交換膜法など"],
        ],
      },
      {
        id: "industrial-flows",
        title: "工程の流れ",
        kind: "flow",
        flows: [
          {
            title: "硝酸製造（オストワルト法）",
            nodes: ["NH₃", "NO", "NO₂", "HNO₃"],
            note: "アンモニアの接触酸化、NOの酸化、NO₂の水への吸収という順です。",
          },
          {
            title: "硫酸製造（接触法）",
            nodes: ["Sまたは硫化鉱", "SO₂", "SO₃", "発煙硫酸", "H₂SO₄"],
            note: "SO₃を直接水に吸収させると硫酸ミストが生じやすいため、濃硫酸に吸収させます。",
          },
          {
            title: "炭酸ナトリウム製造",
            nodes: ["飽和食塩水＋NH₃", "CO₂導入", "NaHCO₃沈殿", "加熱", "Na₂CO₃"],
            note: "NH₃は工程内で再利用されます。",
          },
        ],
      },
    ],
    questions: [
      {
        id: "ind-1",
        prompt: "ハーバー・ボッシュ法で製造する物質は何ですか。",
        choices: ["硫酸", "硝酸", "アンモニア", "炭酸ナトリウム"],
        answerIndex: 2,
        explanation: "窒素と水素からアンモニアを合成する方法です。",
        tags: ["ハーバー法"],
      },
      {
        id: "ind-2",
        prompt: "接触法でSO₂をSO₃に酸化するときの代表的な触媒はどれですか。",
        choices: ["Fe", "V₂O₅", "MnO₂", "Ni"],
        answerIndex: 1,
        explanation: "接触法では酸化バナジウム(V) V₂O₅が代表的な触媒です。",
        tags: ["接触法"],
      },
      {
        id: "ind-3",
        prompt: "オストワルト法の出発原料として使われる物質はどれですか。",
        choices: ["NH₃", "NaCl", "CaCO₃", "Fe₂O₃"],
        answerIndex: 0,
        explanation: "アンモニアを接触酸化してNO、NO₂を経て硝酸を得ます。",
        tags: ["オストワルト法"],
      },
      {
        id: "ind-4",
        prompt: "アンモニアソーダ法で途中に沈殿させる物質は何ですか。",
        choices: ["NaCl", "NaHCO₃", "NH₄Cl", "CaCO₃"],
        answerIndex: 1,
        explanation: "溶解度の小さいNaHCO₃を沈殿させ、加熱してNa₂CO₃にします。",
        tags: ["ソルベー法"],
      },
      {
        id: "ind-5",
        prompt: "アルミニウム製錬で酸化アルミニウムを氷晶石に溶かす主な目的は何ですか。",
        choices: ["酸化力を強くする", "融点を下げて電解しやすくする", "沈殿を作る", "アルミニウムを酸化する"],
        answerIndex: 1,
        explanation: "Al₂O₃単独では融点が高いため、氷晶石に溶かして溶融塩電解します。",
        tags: ["アルミニウム"],
      },
      {
        id: "ind-6",
        prompt: "高炉内で酸化鉄を主に還元する物質は何ですか。",
        choices: ["O₂", "CO", "CO₂", "N₂"],
        answerIndex: 1,
        explanation: "コークスから生じた一酸化炭素が酸化鉄を還元します。",
        tags: ["高炉"],
      },
    ],
  },
  {
    slug: "ionic-equations",
    title: "イオン反応式",
    shortTitle: "イオン反応式",
    icon: "➕",
    summary: "中和、沈殿、気体発生、酸化還元、錯イオン形成を正味の変化で理解します。",
    level: "高校化学",
    keywords: ["イオン反応式", "中和", "沈殿", "酸化還元", "錯イオン"],
    sections: [
      {
        id: "ionic-patterns",
        title: "頻出の正味イオン反応式",
        kind: "cards",
        entries: [
          {
            title: "中和",
            body: "強酸と強塩基の本質的な反応です。",
            equation: "H⁺ + OH⁻ → H₂O",
          },
          {
            title: "塩化銀の沈殿",
            body: "硝酸銀水溶液と塩化物イオンを含む水溶液の反応です。",
            equation: "Ag⁺ + Cl⁻ → AgCl↓",
          },
          {
            title: "硫酸バリウムの沈殿",
            body: "Ba²⁺とSO₄²⁻から白色沈殿が生じます。",
            equation: "Ba²⁺ + SO₄²⁻ → BaSO₄↓",
          },
          {
            title: "炭酸塩と酸",
            body: "炭酸イオンに酸を加えると二酸化炭素と水が生じます。",
            equation: "CO₃²⁻ + 2H⁺ → CO₂ + H₂O",
          },
          {
            title: "アンモニウム塩と強塩基",
            body: "アンモニウムイオンからアンモニアが遊離します。",
            equation: "NH₄⁺ + OH⁻ → NH₃ + H₂O",
          },
          {
            title: "鉄(III)イオンとチオシアン酸イオン",
            body: "血赤色の錯イオンを形成します。",
            equation: "Fe³⁺ + SCN⁻ ⇄ [FeSCN]²⁺",
          },
        ],
      },
      {
        id: "how-to-write",
        title: "イオン反応式の作り方",
        kind: "flow",
        flows: [
          {
            title: "基本手順",
            nodes: [
              "分子式の反応式を書く",
              "水溶液中で強電解質として存在するものをイオンに分ける",
              "両辺に同じ形で存在する傍観イオンを消す",
              "原子数と電荷が保存されているか確認する",
            ],
            note: "沈殿、気体、弱電解質、水、単体は原則として勝手にイオンへ分けません。",
          },
        ],
      },
      {
        id: "redox-ionic",
        title: "酸化還元型の例",
        kind: "table",
        columns: ["反応", "イオン反応式", "見方"],
        rows: [
          ["Fe²⁺とCe⁴⁺", "Fe²⁺ + Ce⁴⁺ → Fe³⁺ + Ce³⁺", "1電子の受け渡し"],
          ["ZnとCu²⁺", "Zn + Cu²⁺ → Zn²⁺ + Cu", "Znが酸化、Cu²⁺が還元"],
          ["Cl₂とI⁻", "Cl₂ + 2I⁻ → 2Cl⁻ + I₂", "Cl₂が酸化剤"],
          ["酸性条件のMnO₄⁻", "MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O", "半反応式"],
        ],
      },
    ],
    questions: [
      {
        id: "ion-1",
        prompt: "強酸と強塩基の中和を表す正味イオン反応式はどれですか。",
        choices: ["H⁺ + OH⁻ → H₂O", "Na⁺ + Cl⁻ → NaCl", "2H⁺ → H₂", "OH⁻ → O²⁻ + H⁺"],
        answerIndex: 0,
        explanation: "Na⁺やCl⁻などは反応前後で変化しない傍観イオンです。",
        tags: ["中和"],
      },
      {
        id: "ion-2",
        prompt: "Ag⁺とCl⁻を混合したときの正味イオン反応式はどれですか。",
        choices: ["Ag⁺ + Cl⁻ → AgCl↓", "Ag + Cl → AgCl", "AgCl → Ag⁺ + Cl⁻", "2Ag⁺ + Cl₂ → 2AgCl"],
        answerIndex: 0,
        explanation: "難溶性の塩化銀が沈殿します。",
        tags: ["沈殿"],
      },
      {
        id: "ion-3",
        prompt: "炭酸イオンに十分な酸を加えたときに生じる気体は何ですか。",
        choices: ["H₂", "O₂", "CO₂", "NH₃"],
        answerIndex: 2,
        explanation: "CO₃²⁻ + 2H⁺ → CO₂ + H₂O です。",
        tags: ["気体発生"],
      },
      {
        id: "ion-4",
        prompt: "イオン反応式を作るとき、通常イオンに分けずに書くものはどれですか。",
        choices: ["水溶液中のNaCl", "水溶液中のHCl", "沈殿したAgCl", "水溶液中のNaOH"],
        answerIndex: 2,
        explanation: "沈殿、気体、水、弱電解質、単体などは、生成物や反応物の形を保って書きます。",
        tags: ["作り方"],
      },
      {
        id: "ion-5",
        prompt: "Zn + Cu²⁺ → Zn²⁺ + Cu において、還元される粒子はどれですか。",
        choices: ["Zn", "Cu²⁺", "Zn²⁺", "Cu"],
        answerIndex: 1,
        explanation: "Cu²⁺は電子を受け取りCuになるため還元されます。",
        tags: ["酸化還元"],
      },
      {
        id: "ion-6",
        prompt: "NH₄⁺ + OH⁻ → NH₃ + H₂O で発生する気体は何ですか。",
        choices: ["塩素", "二酸化炭素", "アンモニア", "硫化水素"],
        answerIndex: 2,
        explanation: "アンモニウム塩に強塩基を加えて加熱するとアンモニアが発生します。",
        tags: ["アンモニア"],
      },
    ],
  },
];

export function getUnit(slug: string) {
  return chemistryUnits.find((unit) => unit.slug === slug);
}

export function getAllQuestions() {
  return chemistryUnits.flatMap((unit) =>
    unit.questions.map((question) => ({ ...question, unitSlug: unit.slug, unitTitle: unit.shortTitle })),
  );
}

import type { Diagram, SeparationNode, SeparationEdge } from "./types";

const notes = (id: string, texts: string[]) => texts.map((text, i) => ({ id: `${id}-note-${i}`, text }));
function node(id: string, label: string, formula: string, lines: string[], x: number, y: number,
  detail: string[] = [], extra: Partial<SeparationNode> = {}): SeparationNode {
  return { id, label, formula, lines, x, y, width: 360, height: 148, kind: "solution", blankable: true, notes: notes(id, detail), ...extra };
}
function edge(id: string, from: SeparationNode, to: SeparationNode, reagent?: string, condition?: string, detail?: string): SeparationEdge {
  return { id, from: from.id, to: to.id, blankable: Boolean(reagent),
    reagent: reagent ? { id: `${id}-reagent`, label: reagent, blankable: true } : undefined,
    condition: condition ? { id: `${id}-condition`, label: condition, blankable: true } : undefined,
    note: detail ? { id: `${id}-note`, text: detail } : undefined,
    labelX: to.x + 10, labelY: to.y - 48 };
}

const inorganicNodes: SeparationNode[] = [
  node("metal-mix", "出発：10種の金属イオン", "Ag⁺, Pb²⁺, Cu²⁺, Al³⁺, Fe³⁺, Zn²⁺, Ca²⁺, Ba²⁺, Na⁺, K⁺", ["Ag⁺ / Pb²⁺ / Cu²⁺ / Al³⁺ / Fe³⁺", "Zn²⁺ / Ca²⁺ / Ba²⁺ / Na⁺ / K⁺"], 20, 20, [], { kind: "mixture" }),
  node("chlorides", "第1群：塩化物の沈殿", "AgCl / PbCl₂", ["AgCl：白色沈殿", "PbCl₂：白色沈殿"], 440, 270,
    ["PbCl₂は熱水に溶けるため、AgClと分けられる。溶解度があるので鉛の沈殿は完全とは限らない。", "AgClはNH₃水に溶けて[Ag(NH₃)₂]⁺となり、HNO₃で酸性にするとAgClが再沈殿する。"], { kind: "precipitate", color: "#ffffff", colorLabel: "白色" }),
  node("after-hcl", "第1段階のろ液", "Cu²⁺ / Al³⁺ / Fe³⁺ / Zn²⁺ / Ca²⁺ / Ba²⁺ / Na⁺ / K⁺", ["Cu²⁺ / Al³⁺ / Fe³⁺ / Zn²⁺", "Ca²⁺ / Ba²⁺ / Na⁺ / K⁺"], 20, 270),
  node("copper", "第2群：硫化物の沈殿", "CuS", ["CuS：黒色沈殿"], 440, 520,
    ["Cu²⁺の別試料に過剰NH₃水を加えると、深青色の[Cu(NH₃)₄]²⁺を生じる。"], { kind: "precipitate", color: "#202020", colorLabel: "黒色" }),
  node("after-copper", "第2段階のろ液（模式表記）", "Al³⁺ / Fe³⁺ / Zn²⁺ / Ca²⁺ / Ba²⁺ / Na⁺ / K⁺", ["Al³⁺ / Fe³⁺※ / Zn²⁺", "Ca²⁺ / Ba²⁺ / Na⁺ / K⁺"], 20, 520,
    ["※H₂SはFe³⁺をFe²⁺に還元し、硫黄を生じうる。図は元素の行方を中心とした模式図。CuSをろ別し、残存H₂Sを除去後、HNO₃等でFe²⁺をFe³⁺へ再酸化して次へ進む。"]),
  node("hydroxides", "第3群：水酸化物の沈殿", "Al(OH)₃ / Fe(OH)₃", ["Al(OH)₃：白色沈殿", "Fe(OH)₃：赤褐色沈殿"], 440, 770,
    ["NH₄Clと過剰NH₃水で塩基性を調整する。過剰NaOHを使うと両性のAl(OH)₃が溶けるため、この段階の試薬として置き換えない。", "Fe³⁺の確認：酸性の別試料でSCN⁻を加えると、鉄(III)のチオシアン酸錯体による血赤色を示す。"], { kind: "precipitate", colorLabel: "白色 / 赤褐色" }),
  node("after-hydroxides", "第3段階のろ液", "[Zn(NH₃)₄]²⁺ / Ca²⁺ / Ba²⁺ / Na⁺ / K⁺", ["Zn：主に[Zn(NH₃)₄]²⁺として残る", "Ca²⁺ / Ba²⁺ / Na⁺ / K⁺"], 20, 770,
    ["亜鉛は過剰NH₃中でアンミン錯体となり溶液に残る。NH₃量・pHに依存するので、単に塩基性とだけ表記しない。"]),
  node("zinc", "第4群：硫化物の沈殿", "ZnS", ["ZnS：白色沈殿"], 440, 1020,
    ["塩基性ではS²⁻濃度が高まり、亜鉛のアンミン錯体からもZnSが沈殿する。", "Zn(OH)₂は両性水酸化物で、過剰NaOHに溶けて[Zn(OH)₄]²⁻となる。"], { kind: "precipitate", color: "#ffffff", colorLabel: "白色" }),
  node("after-zinc", "第4段階のろ液", "Ca²⁺ / Ba²⁺ / Na⁺ / K⁺", ["Ca²⁺ / Ba²⁺ / Na⁺ / K⁺"], 20, 1020),
  node("carbonates", "第5群：炭酸塩の沈殿", "CaCO₃ / BaCO₃", ["CaCO₃：白色沈殿", "BaCO₃：白色沈殿"], 440, 1270,
    ["NH₃・NH₄Clを含む条件で(NH₄)₂CO₃を加え、炭酸塩として沈殿させる。", "別試料での炎色反応：Caは橙赤色、Baは黄緑色。"], { kind: "precipitate", color: "#ffffff", colorLabel: "白色" }),
  node("alkali", "最終ろ液：炎色反応で確認", "Na⁺ / K⁺", ["Na：黄色", "K：赤紫色"], 20, 1270,
    ["Naの強い発光はKの観察を妨げる。Kはコバルトガラス等を通して確認する。", "沈殿を回収するたびにろ過し、そのろ液に次の操作を行う。"]),
];
const m = Object.fromEntries(inorganicNodes.map(n => [n.id, n]));
const inorganicEdges: SeparationEdge[] = [];
for (const [i, from, residue, solid, reagent, condition] of [
  [1,"metal-mix","after-hcl","chlorides","希HCl","塩化物をろ別"],
  [2,"after-hcl","after-copper","copper","H₂Sを通す","酸性・沈殿をろ別"],
  [3,"after-copper","after-hydroxides","hydroxides","NH₄Cl＋過剰NH₃水","H₂S除去・Fe再酸化後"],
  [4,"after-hydroxides","after-zinc","zinc","H₂Sを通す","塩基性・沈殿をろ別"],
  [5,"after-zinc","alkali","carbonates","(NH₄)₂CO₃","NH₃・NH₄Cl共存"],
] as const) {
  inorganicEdges.push(edge(`metal-${i}-residue`,m[from],m[residue],reagent,condition));
  inorganicEdges.push(edge(`metal-${i}-solid`,m[from],m[solid],"沈殿を回収"));
}
export const metalAnalysis: Diagram = {
  id: "metal-analysis", title: "金属イオンの系統分析", description: "沈殿とろ液の行方をたどり、10種の金属イオンを段階的に分けます。",
  width: 820, height: 1440, nodes: inorganicNodes, edges: inorganicEdges, layers: [],
  groups: [{ id: "metal-solids", label: "分離した沈殿", nodeIds: ["chlorides","copper","hydroxides","zinc","carbonates"] }],
  notes: notes("metal", ["対象10種に限定した高校化学の模式図です。沈殿の溶解度、濃度、pHによって実際の分離の程度は変わります。", "基本表示は分離の流れ、詳細表示は錯体・確認反応・操作条件を示します。"]),
  sources: [{ title: "金属イオンの定性分析（大学教材）", url: "https://chem.libretexts.org/Courses/University_of_Missouri/MU%3A__1330H_%28Keller%29/17%3A_Additional_Aspects_of_Aqueous_Equilibria/17.7%3A_Qualitative_Analysis_for_Metallic_Elements" }],
};

const organicNodes: SeparationNode[] = [
  node("ether-start", "出発：エーテル溶液", "C₆H₅COOH / C₆H₅OH / C₆H₅NH₂ / C₆H₅NO₂ / C₆H₅CH₃", ["安息香酸 / フェノール / アニリン", "ニトロベンゼン / トルエン"], 20, 20, [], {kind:"mixture",layerId:"ether"}),
  node("ether-1", "エーテル層：残った物質", "C₆H₅COOH / C₆H₅OH / C₆H₅NO₂ / C₆H₅CH₃", ["安息香酸 / フェノール", "ニトロベンゼン / トルエン"], 20, 280, [], {layerId:"ether"}),
  node("anilinium", "水層：アニリン塩酸塩", "C₆H₅NH₃⁺Cl⁻", ["アニリニウムイオンとして水層へ"], 440, 280,
    ["C₆H₅NH₂ + H⁺ → C₆H₅NH₃⁺。塩基性のアニリンがプロトンを受け取り、イオン性の塩になって水層へ移る。"], {layerId:"water"}),
  node("aniline", "回収：アニリン", "C₆H₅NH₂", ["NaOHで塩基性にして遊離"], 860, 280,
    ["C₆H₅NH₃⁺ + OH⁻ → C₆H₅NH₂ + H₂O。遊離後、エーテルで再抽出し、乾燥・溶媒除去で回収する。"], {kind:"product"}),
  node("ether-2", "エーテル層：残った物質", "C₆H₅OH / C₆H₅NO₂ / C₆H₅CH₃", ["フェノール / ニトロベンゼン", "トルエン"], 20, 540, [], {layerId:"ether"}),
  node("benzoate", "水層：安息香酸ナトリウム", "C₆H₅COO⁻Na⁺", ["イオン性の安息香酸塩として水層へ"], 440, 540,
    ["C₆H₅COOH + HCO₃⁻ → C₆H₅COO⁻ + CO₂ + H₂O。カルボン酸を塩に変えるため水層へ移る。", "フェノールはNaHCO₃では通常ほとんど脱プロトン化されず、エーテル層に残る。"], {layerId:"water"}),
  node("benzoic-acid", "回収：安息香酸", "C₆H₅COOH", ["HClで酸性にして遊離・析出"], 860, 540,
    ["C₆H₅COO⁻ + H⁺ → C₆H₅COOH。非イオン性になり水への溶解度が低下する。十分な濃度なら析出し、冷却・ろ過して回収する。"], {kind:"product"}),
  node("neutral", "エーテル層：中性化合物", "C₆H₅NO₂ / C₆H₅CH₃", ["ニトロベンゼン / トルエン"], 20, 800,
    ["この酸塩基抽出では2種の中性化合物は分かれない。溶媒除去後、沸点差を利用した蒸留などで分離する。"], {layerId:"ether"}),
  node("phenoxide", "水層：ナトリウムフェノキシド", "C₆H₅O⁻Na⁺", ["フェノキシドイオンとして水層へ"], 440, 800,
    ["C₆H₅OH + OH⁻ → C₆H₅O⁻ + H₂O。NaOHなら弱酸のフェノールをイオンに変え、水層へ移せる。", "NaOHは安息香酸とも反応するため、先にNaHCO₃で安息香酸を除く。"], {layerId:"water"}),
  node("phenol", "回収：フェノール", "C₆H₅OH", ["HClで酸性にして遊離"], 860, 800,
    ["C₆H₅O⁻ + H⁺ → C₆H₅OH。遊離後も一部は水に溶けるため、エーテルで再抽出し、乾燥・溶媒除去して回収する。"], {kind:"product"}),
];
const o = Object.fromEntries(organicNodes.map(n => [n.id,n]));
const organicEdges: SeparationEdge[] = [];
for (const [i,from,residue,aqueous,product,reagent,recovery] of [
  [1,"ether-start","ether-1","anilinium","aniline","HCl水溶液","NaOH水溶液"],
  [2,"ether-1","ether-2","benzoate","benzoic-acid","NaHCO₃水溶液","HCl水溶液"],
  [3,"ether-2","neutral","phenoxide","phenol","NaOH水溶液","HCl水溶液"],
] as const) {
  organicEdges.push(edge(`organic-${i}-extract`,o[from],o[residue],reagent,"混合後、二層を分ける"));
  organicEdges.push(edge(`organic-${i}-aqueous`,o[from],o[aqueous],"水層を分取"));
  const recoveryEdge = edge(`organic-${i}-recover`,o[aqueous],o[product],recovery,"遊離・回収");
  recoveryEdge.labelY = o[product].y - 48;
  organicEdges.push(recoveryEdge);
}
export const aromaticSeparation: Diagram = {
  id:"aromatic-separation", title:"芳香族化合物の系統分離", description:"酸・塩基で物質をイオンに変え、水層とエーテル層への分配を利用して分けます。",
  width:1240,height:970,nodes:organicNodes,edges:organicEdges,
  layers:[{id:"ether",label:"エーテル層（通常は上層）",kind:"ether"},{id:"water",label:"水層（通常は下層）",kind:"aqueous"}],
  groups:[{id:"recovered",label:"遊離した物質",nodeIds:["aniline","benzoic-acid","phenol"]}],
  notes:notes("organic",["最初は5種をジエチルエーテルに溶かした状態。図の左右は操作の枝分かれを表し、分液漏斗内の上下配置ではありません。", "イオン性の塩は水層へ、非イオン性の分子は主にエーテル層へ分配されます。分配は完全ではなく、実際の回収には再抽出等が必要です。", "NaHCO₃との反応ではCO₂が発生します。これは分離原理の学習図で、実験手順書ではありません。"]),
  sources:[{title:"酸塩基抽出（Nichols実験教材）",url:"https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_Lab_Techniques_%28Nichols%29/04%3A_Extraction/4.08%3A_Acid-Base_Extraction"}],
};
/** Coordinates follow the two supplied reference images, not a generic column layout.
 * Hidden filtrates retain their IDs and chemistry for explanations and future exercises.
 */
function place(n: SeparationNode, x: number, y: number, width: number, height: number,
  label: string, lines: string[], caption?: string) {
  Object.assign(n, { x, y, width, height, display: { label, lines, caption } });
}
function route(e: SeparationEdge, points: [number, number][], labelX: number, labelY: number,
  condition?: string, hideLabel = false) {
  Object.assign(e, { labelX, labelY, display: { points, condition, hideLabel } });
}

metalAnalysis.width = 1060;
metalAnalysis.height = 950;
metalAnalysis.variant = "metal-staircase";
metalAnalysis.readingHint = "混合イオンから右下へ階段状に分離します。下向きの枝が各属の沈殿です。";
place(m["metal-mix"], 20, 30, 1020, 55, "", [
  "Ag⁺　Pb²⁺　Cu²⁺　Al³⁺　Fe³⁺　Zn²⁺　Ca²⁺　Ba²⁺　Na⁺　K⁺",
]);
const metalStages = [
  ["chlorides", "after-hcl", "第1属：塩化物沈殿", ["AgCl（白）", "PbCl₂（白）"], "orange"],
  ["copper", "after-copper", "第2属：硫化物沈殿", ["CuS（黒）"], "pink"],
  ["hydroxides", "after-hydroxides", "第3属：水酸化物沈殿", ["Al(OH)₃（白）", "Fe(OH)₃（赤褐色）"], "green"],
  ["zinc", "after-zinc", "第4属：硫化物沈殿", ["ZnS（白）"], "cyan"],
  ["carbonates", "alkali", "第5属：炭酸塩沈殿", ["CaCO₃（白）", "BaCO₃（白）"], "blue"],
] as const;
metalStages.forEach(([solidId, residueId, label, lines, tone], i) => {
  const junctionY = 175 + i * 130;
  const axis = 275 + i * 130;
  const solidAxis = axis - 130;
  const solid = m[solidId]; const residue = m[residueId];
  place(solid, solidAxis - 140, junctionY + 48, 280, 100, label, [...lines]);
  Object.assign(solid.display!, { unboxed: true, tone });
  // These are chemical intermediates, not additional visible boxes in the reference.
  place(residue, axis + 130, junctionY, 0, 0, residue.label, []);
  residue.display!.hidden = i < 4;
  const startY = i === 0 ? 85 : junctionY - 130;
  route(inorganicEdges[i * 2], [[axis, startY], [axis, junctionY], [axis + 130, junctionY]], axis + 9, startY + 51, "");
  inorganicEdges[i * 2].display!.tone = tone;
  inorganicEdges[i * 2].display!.reagentLines = [
    ["HCl"], ["H₂S（酸性条件）"], ["① 煮沸（H₂S除去）", "② HNO₃", "③ NH₃・NH₄Cl"],
    ["H₂S（塩基性条件）"], ["(NH₄)₂CO₃"],
  ][i];
  route(inorganicEdges[i * 2 + 1], [[axis, junctionY], [solidAxis, junctionY], [solidAxis, junctionY + 39]], 0, 0, undefined, true);
});
place(m.alkali, 805, 825, 245, 100, "第6属：沈殿しない", ["Na⁺　K⁺", "炎色反応で分析"]);
Object.assign(m.alkali.display!, { unboxed: true, tone: "purple" });
inorganicEdges[8].display!.points.push([925, 816]);
const leadHotWater = node("lead-hot-water", "PbCl₂のみ溶ける", "Pb²⁺", ["Pb²⁺になる"], 5, 520, [], { kind: "product", width: 260, height: 80 });
leadHotWater.display = { label: "PbCl₂のみ溶ける", lines: ["（Pb²⁺になる）"], unboxed: true };
metalAnalysis.nodes.push(leadHotWater);
const hotWaterEdge = edge("metal-lead-hot-water", m.chlorides, leadHotWater, "熱水");
route(hotWaterEdge, [[145, 323], [145, 510]], 88, 405, "");
hotWaterEdge.display!.tone = "red";
metalAnalysis.edges.push(hotWaterEdge);

aromaticSeparation.width = 1100;
aromaticSeparation.height = 1370;
aromaticSeparation.variant = "organic-staircase";
aromaticSeparation.readingHint = "上の5種の混合物から開始します。右下へ続くエーテル層と、各水層から下へ続く遊離操作をたどります。";
aromaticSeparation.compounds = [
  { id: "benzoic-acid", name: "安息香酸", substituent: "COOH", category: "酸性" },
  { id: "phenol", name: "フェノール", substituent: "OH", category: "酸性" },
  { id: "aniline", name: "アニリン", substituent: "NH₂", category: "塩基性" },
  { id: "nitrobenzene", name: "ニトロベンゼン", substituent: "NO₂", category: "中性" },
  { id: "toluene", name: "トルエン", substituent: "CH₃", category: "中性" },
  { id: "anilinium", name: "アニリン塩酸塩", substituent: "NH₃⁺ Cl⁻", category: "塩", ionic: true },
  { id: "benzoate", name: "安息香酸ナトリウム", substituent: "COO⁻Na⁺", category: "塩", ionic: true },
  { id: "phenoxide", name: "ナトリウムフェノキシド", substituent: "O⁻Na⁺", category: "塩", ionic: true },
];
place(o["ether-start"], 40, 40, 1000, 220, "", []);
Object.assign(o["ether-start"].display!, { compounds: ["benzoic-acid", "phenol", "aniline", "nitrobenzene", "toluene"], showCompoundNames: true });
const organicStages = [
  ["anilinium", "ether-1", "aniline", 40, 160, 270, 770, ["benzoic-acid", "phenol", "nitrobenzene", "toluene"], "弱塩基の遊離", "塩基性化合物が中和"],
  ["benzoate", "ether-2", "benzoic-acid", 270, 175, 550, 490, ["phenol", "nitrobenzene", "toluene"], "弱酸の遊離", "CO₂の遊離"],
  ["phenoxide", "neutral", "phenol", 550, 170, 800, 240, ["nitrobenzene", "toluene"], "弱酸の遊離", "酸性化合物が中和"],
] as const;
organicStages.forEach(([waterId, etherId, productId, waterX, waterWidth, etherX, etherWidth, compounds, recovery, condition], i) => {
  const y = 340 + i * 270;
  const water = o[waterId]; const ether = o[etherId]; const product = o[productId];
  place(water, waterX, y, waterWidth, 170, "水層", []);
  water.display!.compounds = [waterId];
  place(ether, etherX, y, etherWidth, 170, "エーテル層", []);
  ether.display!.compounds = [...compounds];
  place(product, waterX, y + 270, waterWidth, 170, "エーテル層", []);
  product.layerId = "ether";
  product.display!.compounds = [productId];
  const from = i === 0 ? o["ether-start"] : o[organicStages[i - 1][1]];
  const axis = from.x + from.width / 2;
  const waterAxis = waterX + waterWidth / 2; const etherAxis = etherX + etherWidth / 2;
  const junctionY = y - 30;
  route(organicEdges[i * 3], [[axis, from.y + from.height], [axis, junctionY], [etherAxis, junctionY], [etherAxis, y]], axis + 9, from.y + from.height + 35, condition);
  organicEdges[i * 3].display!.tone = "red";
  organicEdges[i * 3].display!.conditionPosition = { x: waterAxis + 9, y: junctionY - 10 };
  // Use the exact short labels in the reference while preserving reagent objects.
  organicEdges[i * 3].display!.reagentLines = [["HCl"], ["NaHCO₃"], ["NaOH"]][i];
  route(organicEdges[i * 3 + 1], [[axis, junctionY], [waterAxis, junctionY], [waterAxis, y]], 0, 0, undefined, true);
  route(organicEdges[i * 3 + 2], [[waterAxis, water.y + water.height], [waterAxis, product.y]], waterAxis + 9, water.y + water.height + 35, recovery);
  Object.assign(organicEdges[i * 3 + 2].display!, { tone: i === 0 ? "cyan" : "red", reagentLines: [["NaOH"], ["HCl"], ["HCl または CO₂"]][i] });
  if (i === 2) organicEdges[i * 3 + 2].reagent!.alternatives = ["CO₂"];
});
for (const [id, x, width, compound] of [["nitrobenzene-product", 800, 110, "nitrobenzene"], ["toluene-product", 940, 100, "toluene"]] as const) {
  const product = node(id, compound === "toluene" ? "トルエン" : "ニトロベンゼン", compound === "toluene" ? "C₆H₅CH₃" : "C₆H₅NO₂", [], x, 1150,
    ["溶媒を除いた中性物質を、沸点差を利用して分留する。"], { kind: "product", width, height: 170 });
  product.display = { label: "", lines: [], compounds: [compound] };
  aromaticSeparation.nodes.push(product);
  const fraction = edge(`organic-distill-${compound}`, o.neutral, product, "分留");
  route(fraction, [[920, 1050], [920, 1120], [x + width / 2, 1120], [x + width / 2, 1150]], 930, 1090, "", compound === "toluene");
  fraction.display!.tone = "purple";
  aromaticSeparation.edges.push(fraction);
}
export const separationDiagrams = [metalAnalysis, aromaticSeparation];

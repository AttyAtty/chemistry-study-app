import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPureTypeScript } from "./helpers/pure-typescript.mjs";

// Compile only the pure data module, without Next.js or a browser runtime.
const { metalAnalysis, aromaticSeparation, separationDiagrams } = await loadPureTypeScript("src/data/separation/diagrams.ts");

test("all diagrams have stable unique IDs, valid references and reachable nodes", () => {
  for (const diagram of separationDiagrams) {
    const ids = new Set();
    for (const item of [...diagram.nodes, ...diagram.edges, ...diagram.groups, ...diagram.layers]) {
      assert.ok(!ids.has(item.id), item.id); ids.add(item.id);
    }
    const nodes = new Map(diagram.nodes.map(n=>[n.id,n]));
    for (const n of diagram.nodes) {
      assert.equal(typeof n.blankable,"boolean");
      assert.ok(n.formula && n.label);
      assert.ok(n.x >= 0 && n.y >= 0 && n.x+n.width <= diagram.width && n.y+n.height <= diagram.height);
      if(n.layerId) assert.ok(diagram.layers.some(l=>l.id===n.layerId));
    }
    for(const e of diagram.edges) { assert.ok(nodes.has(e.from)); assert.ok(nodes.has(e.to)); }
    for(const g of diagram.groups) for(const id of g.nodeIds) assert.ok(nodes.has(id));
    const reached = new Set([diagram.nodes[0].id]);
    for(let i=0;i<diagram.nodes.length;i++) for(const e of diagram.edges) if(reached.has(e.from)) reached.add(e.to);
    assert.equal(reached.size,diagram.nodes.length);
  }
});
test("metal workflow preserves required fractions and conditional zinc chemistry", () => {
  const formula=metalAnalysis.nodes.map(n=>n.formula).join(" ");
  for(const species of ["AgCl","PbCl₂","CuS","Al(OH)₃","Fe(OH)₃","ZnS","CaCO₃","BaCO₃","Na⁺","K⁺"]) assert.ok(formula.includes(species));
  assert.ok(metalAnalysis.edges.some(e=>e.reagent?.label === "NH₃水・NH₄Cl" && e.operation?.amount?.kind === "excess"));
  assert.match(metalAnalysis.nodes.find(n=>n.id==="after-hydroxides").formula,/Zn\(NH₃\)/);
  assert.ok(metalAnalysis.nodes.some(n=>n.notes.some(note=>note.text.includes("再酸化"))));
});
test("organic extraction branches into aqueous salts and recovered compounds in order", () => {
  const reagents=aromaticSeparation.edges.filter(e=>e.id.endsWith("-extract")).map(e=>e.reagent.label);
  assert.deepEqual(reagents,["HCl水溶液","NaHCO₃水溶液","NaOH水溶液"]);
  for(const id of ["anilinium","benzoate","phenoxide"]) assert.equal(aromaticSeparation.nodes.find(n=>n.id===id).layerId,"water");
  for(const id of ["aniline","benzoic-acid","phenol"]) assert.equal(aromaticSeparation.nodes.find(n=>n.id===id).kind,"product");
  assert.match(aromaticSeparation.nodes.find(n=>n.id==="neutral").formula,/C₆H₅NO₂ \/ C₆H₅CH₃/);
});

test("textbook templates use orthogonal descending branches and distinct recovery rows", () => {
  for (const diagram of separationDiagrams) {
    const start = diagram.nodes[0];
    assert.ok(start.width >= 900, "mixture spans both branches");
    for (const edge of diagram.edges) {
      const points = edge.display.points;
      for (let i = 1; i < points.length; i++) {
        assert.ok(points[i][0] === points[i-1][0] || points[i][1] === points[i-1][1], edge.id);
        assert.ok(points[i][1] >= points[i-1][1], edge.id);
      }
      for (const [x,y] of points) assert.ok(x >= 0 && x <= diagram.width && y >= 0 && y <= diagram.height);
    }
    for (let i = 0; i < diagram.nodes.length; i++) for (const b of diagram.nodes.slice(i+1)) {
      const a = diagram.nodes[i];
      assert.ok(a.x+a.width <= b.x || b.x+b.width <= a.x || a.y+a.height <= b.y || b.y+b.height <= a.y, `${a.id} overlaps ${b.id}`);
    }
  }
  for (const [salt, product] of [["anilinium","aniline"],["benzoate","benzoic-acid"],["phenoxide","phenol"]]) {
    const a = aromaticSeparation.nodes.find(n=>n.id===salt);
    const b = aromaticSeparation.nodes.find(n=>n.id===product);
    assert.equal(a.x,b.x); assert.ok(b.y > a.y+a.height);
  }
});

test("reference staircase omits intermediate boxes and advances to the right", () => {
  for (const id of ["after-hcl","after-copper","after-hydroxides","after-zinc"]) {
    assert.equal(metalAnalysis.nodes.find(n=>n.id===id).display.hidden,true);
  }
  const solids=["chlorides","copper","hydroxides","zinc","carbonates"].map(id=>metalAnalysis.nodes.find(n=>n.id===id));
  solids.forEach((n,i)=>{ assert.equal(n.display.unboxed,true); if(i) { assert.ok(n.x > solids[i-1].x); assert.ok(n.y > solids[i-1].y); } });
  assert.ok(metalAnalysis.edges.some(e=>e.id==="metal-lead-hot-water" && e.reagent.label==="熱水"));
});

test("organic structures track every fraction, its substituent and final distillation", () => {
  const compounds=new Map(aromaticSeparation.compounds.map(c=>[c.id,c]));
  assert.equal(compounds.size,aromaticSeparation.compounds.length);
  for(const n of aromaticSeparation.nodes) for(const id of n.display.compounds) assert.ok(compounds.has(id));
  assert.deepEqual(aromaticSeparation.nodes[0].display.compounds,["benzoic-acid","phenol","aniline","nitrobenzene","toluene"]);
  for(const id of ["anilinium","benzoate","phenoxide"]) assert.equal(compounds.get(id).ionic,true);
  assert.equal(aromaticSeparation.edges.filter(e=>e.reagent?.label==="分留").length,2);
  const residues=["ether-1","ether-2","neutral"].map(id=>aromaticSeparation.nodes.find(n=>n.id===id));
  residues.forEach((n,i)=>{ if(i) { assert.ok(n.x > residues[i-1].x); assert.ok(n.width < residues[i-1].width); } });
});

test("operations keep reagent, condition, amount and actions independently addressable", () => {
  const ids=new Set();
  for(const diagram of separationDiagrams) for(const e of diagram.edges) {
    if(!e.operation) continue;
    const fields=[e.reagent,e.condition,e.operation,e.operation.amount,...e.operation.actions,...e.operation.notes].filter(Boolean);
    const allowed=new Set(fields.map(f=>f.id));
    for(const field of fields) { assert.ok(!ids.has(field.id),field.id); ids.add(field.id); }
    for(const field of [e.operation,e.operation.amount,...e.operation.actions].filter(Boolean)) assert.equal(field.blankable,true);
    for(const item of e.display.instructions??[]) assert.ok(allowed.has(item.fieldId),item.fieldId);
    assert.doesNotMatch(JSON.stringify(e.operation),/\d+\s*(?:mL|ml|ミリリットル)/);
  }
  const acidGas=metalAnalysis.edges.find(e=>e.id==="metal-2-residue");
  assert.equal(acidGas.condition.label,"酸性");
  assert.equal(acidGas.operation.amount.kind,"sufficient");
  const basicGas=metalAnalysis.edges.find(e=>e.id==="metal-4-residue");
  assert.equal(basicGas.condition.label,"塩基性");
  const excess=metalAnalysis.edges.filter(e=>e.operation?.amount?.kind==="excess");
  assert.deepEqual(excess.map(e=>e.id),["metal-3-residue"]);
});

test("extraction operations retain settling, venting and selective qualitative amounts", () => {
  const extraction=aromaticSeparation.edges.filter(e=>e.id.endsWith("-extract"));
  for(const e of extraction) {
    assert.ok(e.operation.actions.some(a=>a.label.includes("静置") && a.label.includes("分液")));
    assert.ok(e.operation.actions.some(a=>a.label.includes("ガス抜き")));
  }
  const bicarbonate=extraction[1];
  assert.equal(bicarbonate.operation.amount.kind,"small-portions");
  assert.ok(bicarbonate.operation.notes.some(n=>n.text.includes("CO₂") && n.text.includes("少量ずつ") && n.text.includes("ガス抜き")));
  assert.ok(aromaticSeparation.edges.find(e=>e.id==="organic-3-recover").operation.actions.some(a=>a.id.endsWith("pass-gas")));
});

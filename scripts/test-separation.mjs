import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

// Compile only the pure data module, without Next.js or a browser runtime.
const source = fs.readFileSync("src/data/separation/diagrams.ts", "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { metalAnalysis, aromaticSeparation, separationDiagrams } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

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
  assert.ok(metalAnalysis.edges.some(e=>e.reagent?.label.includes("NH₄Cl＋過剰NH₃")));
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

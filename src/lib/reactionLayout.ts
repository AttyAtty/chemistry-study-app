export type LayoutZone = "center" | "top" | "bottom" | "left" | "right";
export type LayoutNode = { id:string; width:number; height:number; zone?:LayoutZone };
export type LayoutPoint = { x:number; y:number };
export type LayoutBox = { minX:number; maxX:number; minY:number; maxY:number; width:number; height:number; centerX:number; centerY:number };
export type PageOrientation = "portrait" | "landscape";
export type GraphEdge = { id:string; from:string; to:string; label:string; labelLines?:string[] };
export type GraphRoute = { points:LayoutPoint[]; label:LayoutPoint; labelWidth:number; labelHeight:number };
export type ReactionGraphLayout = { canvas:{width:number;height:number}; positions:Record<string,LayoutPoint>; routes:Record<string,GraphRoute>; bbox:LayoutBox };

type Rect={left:number;right:number;top:number;bottom:number};
export const REACTION_SPACING = {
  desktop: { nodeGap: 88, ringX: 520, ringY: 280, column: 360, row: 270 },
  mobile: { nodeGap: 64, column: 320, row: 250 },
  padding: 64, nodeClearance: 24, labelClearance: 16, edgeClearance: 12,
  portGap: 14, laneGap: 20, labelWidth: 248,
} as const;
const PAD=REACTION_SPACING.padding;
const distribute = (count:number,start:number,end:number) => Array.from({length:count},(_,i)=>count===1?(start+end)/2:start+(end-start)*i/(count-1));
const rectFor=(node:LayoutNode,point:LayoutPoint,pad=0):Rect=>({left:point.x-node.width/2-pad,right:point.x+node.width/2+pad,top:point.y-node.height/2-pad,bottom:point.y+node.height/2+pad});
const overlapArea=(a:Rect,b:Rect)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));

export function computeBoundingBox(nodes:LayoutNode[],positions:Record<string,LayoutPoint>):LayoutBox {
  if(!nodes.length)return {minX:0,maxX:1,minY:0,maxY:1,width:1,height:1,centerX:.5,centerY:.5};
  const bounds=nodes.map(node=>rectFor(node,positions[node.id]));
  return boxFromRects(bounds);
}

function boxFromRects(rects:Rect[]):LayoutBox{
  const minX=Math.min(...rects.map(item=>item.left)),maxX=Math.max(...rects.map(item=>item.right));
  const minY=Math.min(...rects.map(item=>item.top)),maxY=Math.max(...rects.map(item=>item.bottom));
  return {minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY,centerX:(minX+maxX)/2,centerY:(minY+maxY)/2};
}

export function centerLayoutInPage(nodes:LayoutNode[],positions:Record<string,LayoutPoint>,canvasWidth:number,canvasHeight:number) {
  const box=computeBoundingBox(nodes,positions),offsetX=canvasWidth/2-box.centerX,offsetY=canvasHeight/2-box.centerY;
  return Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{x:p.x+offsetX,y:p.y+offsetY}]));
}

function separateOverlaps(nodes:LayoutNode[],positions:Record<string,LayoutPoint>,gap=42) {
  const next=Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{...p}]));
  for(let pass=0;pass<40;pass++) for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) {
    const a=nodes[i],b=nodes[j],pa=next[a.id],pb=next[b.id],dx=pb.x-pa.x,dy=pb.y-pa.y;
    const overlapX=(a.width+b.width)/2+gap-Math.abs(dx),overlapY=(a.height+b.height)/2+gap-Math.abs(dy);
    if(overlapX>0&&overlapY>0){if(overlapX<overlapY){const push=overlapX/2+1,sign=dx>=0?1:-1;pa.x-=push*sign;pb.x+=push*sign;}else{const push=overlapY/2+1,sign=dy>=0?1:-1;pa.y-=push*sign;pb.y+=push*sign;}}
  }
  return next;
}

export function computeLayout(nodes:LayoutNode[],canvasWidth:number,canvasHeight:number):Record<string,LayoutPoint> {
  const paddingX=Math.max(105,canvasWidth*.09),paddingY=Math.max(85,canvasHeight*.1),cx=canvasWidth/2,cy=canvasHeight/2;
  const groups:Record<LayoutZone,LayoutNode[]>={center:[],top:[],bottom:[],left:[],right:[]};
  nodes.forEach((node,index)=>groups[node.zone??(["top","right","bottom","left"] as LayoutZone[])[index%4]].push(node));
  const result:Record<string,LayoutPoint>={};
  groups.center.forEach(node=>result[node.id]={x:cx,y:cy});
  distribute(groups.top.length,paddingX,canvasWidth-paddingX).forEach((x,i)=>result[groups.top[i].id]={x,y:paddingY});
  distribute(groups.bottom.length,paddingX,canvasWidth-paddingX).forEach((x,i)=>result[groups.bottom[i].id]={x,y:canvasHeight-paddingY});
  distribute(groups.left.length,paddingY,canvasHeight-paddingY).forEach((y,i)=>result[groups.left[i].id]={x:paddingX,y});
  distribute(groups.right.length,paddingY,canvasHeight-paddingY).forEach((y,i)=>result[groups.right[i].id]={x:canvasWidth-paddingX,y});
  return centerLayoutInPage(nodes,separateOverlaps(nodes,result),canvasWidth,canvasHeight);
}

const estimateLabel=(edge:GraphEdge)=>{
  // Each rendered field occupies its own row; Japanese glyphs are full width.
  const parts=edge.labelLines??edge.label.split("\n");
  const textWidth=(text:string)=>[...text].reduce((sum,c)=>sum+(/[\u0000-\u00ff]/.test(c)?7:12),0);
  const width=Math.min(REACTION_SPACING.labelWidth,Math.max(144,...parts.map(p=>textWidth(p)+24)));
  const wrapped=parts.reduce((sum,line)=>sum+Math.max(1,Math.ceil(textWidth(line)/(width-24))),0);
  return {width,height:20+wrapped*18+Math.max(0,parts.length-1)*4};
};

function buildLevels(nodes:LayoutNode[],edges:GraphEdge[],centerId:string){
  const adjacency=new Map(nodes.map(node=>[node.id,[] as string[]]));
  edges.forEach(edge=>{adjacency.get(edge.from)?.push(edge.to);adjacency.get(edge.to)?.push(edge.from);});
  const level=new Map<string,number>([[centerId,0]]),queue=[centerId];
  while(queue.length){const id=queue.shift()!;for(const next of adjacency.get(id)??[])if(!level.has(next)){level.set(next,(level.get(id)??0)+1);queue.push(next);}}
  nodes.forEach(node=>{
    if(level.has(node.id))return;
    level.set(node.id,1);
    const componentQueue=[node.id];
    while(componentQueue.length){const id=componentQueue.shift()!;for(const next of adjacency.get(id)??[])if(!level.has(next)){level.set(next,(level.get(id)??1)+1);componentQueue.push(next);}}
  });
  return {adjacency,level};
}

function initialGraphPositions(nodes:LayoutNode[],edges:GraphEdge[],centerId:string,mobile:boolean){
  const spacing=mobile?REACTION_SPACING.mobile:REACTION_SPACING.desktop;
  const {adjacency,level}=buildLevels(nodes,edges,centerId),maxDegree=Math.max(0,...nodes.map(n=>adjacency.get(n.id)?.length??0));
  const chain=maxDegree<=2&&edges.length>=nodes.length-1;
  const positions:Record<string,LayoutPoint>={};
  if(chain){
    const order:string[]=[];let current=nodes.find(n=>(adjacency.get(n.id)?.length??0)<=1)?.id??centerId,previous="";
    while(current&&!order.includes(current)){order.push(current);const next=(adjacency.get(current)??[]).find(id=>id!==previous&&!order.includes(id));previous=current;current=next??"";}
    nodes.forEach(n=>{if(!order.includes(n.id))order.push(n.id);});
    order.forEach((id,index)=>positions[id]=mobile?{x:260,y:120+index*spacing.row}:{x:130+index*spacing.column,y:270+(index%2?48:-48)});
    return positions;
  }
  if(mobile){
    const groups=new Map<number,LayoutNode[]>();nodes.forEach(node=>{const key=level.get(node.id)??0;groups.set(key,[...(groups.get(key)??[]),node]);});
    let y=120;
    [...groups.entries()].sort(([a],[b])=>a-b).forEach(([,items])=>{
      const columns=items.length===1?1:2,rowCount=Math.ceil(items.length/columns);
      items.forEach((node,index)=>positions[node.id]={x:columns===1?spacing.column/2:(index%2)*spacing.column,y:y+Math.floor(index/2)*spacing.row});
      y+=rowCount*spacing.row+96;
    });
    return positions;
  }
  positions[centerId]={x:900,y:390};
  const rings=new Map<number,LayoutNode[]>();nodes.filter(n=>n.id!==centerId).forEach(node=>{const key=level.get(node.id)??1;rings.set(key,[...(rings.get(key)??[]),node]);});
  [...rings.entries()].sort(([a],[b])=>a-b).forEach(([ring,items])=>{
    const radiusX=Math.max(REACTION_SPACING.desktop.ringX*ring,(items.length*340)/(2*Math.PI)*1.5),radiusY=Math.max(REACTION_SPACING.desktop.ringY*ring,(items.length*230)/(2*Math.PI));
    const zoneGroups=new Map<LayoutZone|"auto",LayoutNode[]>();
    items.forEach(node=>{const zone=node.zone??"auto";zoneGroups.set(zone,[...(zoneGroups.get(zone)??[]),node]);});
    let autoIndex=0;
    for(const [zone,group] of zoneGroups){
      group.forEach((node,index)=>{
        let angle:number;
        if(zone==="auto"){angle=-Math.PI/2+(Math.PI*2*autoIndex/Math.max(1,zoneGroups.get("auto")?.length??1))+(ring%2)*.2;autoIndex++;}
        else {
          const base=zone==="top"?-Math.PI/2:zone==="right"?0:zone==="bottom"?Math.PI/2:Math.PI;
          const spread=(zone==="top"||zone==="bottom") ? .78 : .52;
          angle=base+(group.length===1?0:(index/(group.length-1)-.5)*spread);
        }
        positions[node.id]={x:900+Math.cos(angle)*radiusX,y:390+Math.sin(angle)*radiusY};
      });
    }
  });
  return positions;
}

function segmentHitsRect(a:LayoutPoint,b:LayoutPoint,r:Rect){
  if(a.x===b.x)return a.x>r.left&&a.x<r.right&&Math.max(a.y,b.y)>r.top&&Math.min(a.y,b.y)<r.bottom;
  if(a.y===b.y)return a.y>r.top&&a.y<r.bottom&&Math.max(a.x,b.x)>r.left&&Math.min(a.x,b.x)<r.right;
  return false;
}

const inflate=(r:Rect,gap:number):Rect=>({left:r.left-gap,right:r.right+gap,top:r.top-gap,bottom:r.bottom+gap});
const segments=(points:LayoutPoint[])=>points.slice(1).map((p,i)=>({a:points[i],b:p}));
const segmentRect=(a:LayoutPoint,b:LayoutPoint,gap:number):Rect=>({left:Math.min(a.x,b.x)-gap,right:Math.max(a.x,b.x)+gap,top:Math.min(a.y,b.y)-gap,bottom:Math.max(a.y,b.y)+gap});

function routeEdge(edge:GraphEdge,index:number,positions:Record<string,LayoutPoint>,nodeById:Map<string,LayoutNode>,allRects:Map<string,Rect>,previous:LayoutPoint[][]){
  const ports=(id:string)=>{
    const p=positions[id],n=nodeById.get(id)!,gap=REACTION_SPACING.portGap;
    const offset=((index%3)-1)*REACTION_SPACING.laneGap/2;
    return [{x:p.x-n.width/2-gap,y:p.y+offset},{x:p.x+n.width/2+gap,y:p.y+offset},
      {x:p.x+offset,y:p.y-n.height/2-gap},{x:p.x+offset,y:p.y+n.height/2+gap}];
  };
  const obstacles=[...allRects.entries()].map(([id,r])=>id===edge.from||id===edge.to?rectFor(nodeById.get(id)!,positions[id],6):r);
  const lane=((index%5)-2)*REACTION_SPACING.laneGap;
  const xs=[...new Set(obstacles.flatMap(r=>[r.left-REACTION_SPACING.edgeClearance,r.right+REACTION_SPACING.edgeClearance]))];
  const ys=[...new Set(obstacles.flatMap(r=>[r.top-REACTION_SPACING.edgeClearance,r.bottom+REACTION_SPACING.edgeClearance]))];
  const occupied=previous.flatMap(points=>segments(points).map(({a,b})=>segmentRect(a,b,REACTION_SPACING.edgeClearance)));
  let best:LayoutPoint[]=[],bestScore=Infinity;
  const consider=(points:LayoutPoint[])=>{
    points=points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y);
    const parts=segments(points);
    if(!parts.length)return;
    // Node avoidance is mandatory when a clear candidate exists. Shared edge
    // corridors are penalized by length, so crossings beat long overlaid arrows.
    const hits=parts.reduce((sum,{a,b})=>sum+obstacles.filter(r=>segmentHitsRect(a,b,r)).length,0);
    const length=parts.reduce((sum,{a,b})=>sum+Math.abs(a.x-b.x)+Math.abs(a.y-b.y),0);
    if(hits*1e7+length>=bestScore)return;
    const congestion=parts.reduce((sum,{a,b})=>sum+occupied.reduce((cost,r)=>cost+overlapArea(segmentRect(a,b,1),r),0),0);
    const score=hits*1e7+length+parts.length*18+congestion*2;
    if(score<bestScore){bestScore=score;best=points;}
  };
  for(const a of ports(edge.from))for(const b of ports(edge.to)){
    consider([a,{x:b.x,y:a.y},b]);consider([a,{x:a.x,y:b.y},b]);
    for(const x of [(a.x+b.x)/2+lane,...xs])consider([a,{x,y:a.y},{x,y:b.y},b]);
    for(const y of [(a.y+b.y)/2+lane,...ys])consider([a,{x:a.x,y},{x:b.x,y},b]);
  }
  return best;
}

export function computeReactionGraphLayout(nodes:LayoutNode[],edges:GraphEdge[],centerId:string,mobile=false):ReactionGraphLayout{
  if(!nodes.length)return {canvas:{width:1,height:1},positions:{},routes:{},bbox:{minX:0,maxX:1,minY:0,maxY:1,width:1,height:1,centerX:.5,centerY:.5}};
  let positions=separateOverlaps(nodes,initialGraphPositions(nodes,edges,centerId,mobile),mobile?REACTION_SPACING.mobile.nodeGap:REACTION_SPACING.desktop.nodeGap);
  const raw=computeBoundingBox(nodes,positions),shiftX=PAD-raw.minX,shiftY=PAD-raw.minY;
  positions=Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{x:p.x+shiftX,y:p.y+shiftY}]));
  const routes=computeReactionRoutes(nodes,edges,positions);
  const labelRects=Object.values(routes).map(route=>({left:route.label.x-route.labelWidth/2,right:route.label.x+route.labelWidth/2,top:route.label.y-route.labelHeight/2,bottom:route.label.y+route.labelHeight/2}));
  const nodeBounds=nodes.map(node=>rectFor(node,positions[node.id])),routePoints=Object.values(routes).flatMap(route=>route.points.map(p=>({left:p.x,right:p.x,top:p.y,bottom:p.y})));
  const box=boxFromRects([...nodeBounds,...labelRects,...routePoints]);
  // Labels and detours can extend to the left/top of the initial node bounds.
  const dx=PAD-box.minX,dy=PAD-box.minY;
  const translate=(p:LayoutPoint)=>({x:p.x+dx,y:p.y+dy});
  positions=Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,translate(p)]));
  Object.values(routes).forEach(route=>{route.points=route.points.map(translate);route.label=translate(route.label);});
  return {canvas:{width:Math.ceil(box.width+2*PAD),height:Math.ceil(box.height+2*PAD)},positions,routes,
    bbox:{...box,minX:PAD,minY:PAD,maxX:PAD+box.width,maxY:PAD+box.height,centerX:PAD+box.width/2,centerY:PAD+box.height/2}};
}

export function computeReactionRoutes(nodes:LayoutNode[],edges:GraphEdge[],positions:Record<string,LayoutPoint>):Record<string,GraphRoute>{
  const nodeById=new Map(nodes.map(node=>[node.id,node])),nodeRects=new Map(nodes.map(node=>[node.id,rectFor(node,positions[node.id],REACTION_SPACING.nodeClearance)]));
  const routes:Record<string,GraphRoute>={},previous:LayoutPoint[][]=[];
  // Route all arrows first, then reserve labels against ALL arrows, including
  // those belonging to later reactions. Never hide a collision behind a label.
  edges.forEach((edge,index)=>{
    const points=routeEdge(edge,index,positions,nodeById,nodeRects,previous),size=estimateLabel(edge);
    previous.push(points);routes[edge.id]={points,label:{x:0,y:0},labelWidth:size.width,labelHeight:size.height};
  });
  const edgeRects=previous.flatMap(points=>segments(points).map(({a,b})=>segmentRect(a,b,REACTION_SPACING.edgeClearance)));
  const reserved:Rect[]=[...nodeRects.values(),...edgeRects];
  // Place the hardest (largest) labels first. Expand only when nearby slots
  // are occupied; segment anchors keep the reaction association local.
  [...edges].sort((a,b)=>routes[b.id].labelHeight-routes[a.id].labelHeight).forEach(edge=>{
    const route=routes[edge.id],w=route.labelWidth,h=route.labelHeight;
    const anchors=segments(route.points).flatMap(({a,b})=>[.5,.25,.75].map(t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,horizontal:a.y===b.y})));
    const rect=(p:LayoutPoint):Rect=>({left:p.x-w/2,right:p.x+w/2,top:p.y-h/2,bottom:p.y+h/2});
    let label:LayoutPoint|undefined;
    for(let ring=0;!label;ring++){
      const candidates=anchors.flatMap(p=>[-1,1].map(sign=>({x:p.x+(p.horizontal?0:sign*(w/2+REACTION_SPACING.edgeClearance+ring*REACTION_SPACING.laneGap)),y:p.y+(p.horizontal?sign*(h/2+REACTION_SPACING.edgeClearance+ring*REACTION_SPACING.laneGap):0)})));
      label=candidates.find(p=>reserved.every(r=>overlapArea(rect(p),r)===0));
    }
    route.label=label;reserved.push(inflate(rect(label),REACTION_SPACING.labelClearance));
  });
  return routes;
}

export function routeToSvgPath(points:LayoutPoint[]){return points.map((p,index)=>`${index?"L":"M"}${Math.round(p.x)} ${Math.round(p.y)}`).join(" ");}
export function getBestPageOrientation(box:Pick<LayoutBox,"width"|"height">):PageOrientation { return box.width/box.height>1.1?"landscape":"portrait"; }
export function computeScaleToFitA4(box:Pick<LayoutBox,"width"|"height">,orientation:PageOrientation,fit=true) {if(!fit)return 1;const safe=orientation==="landscape"?{width:1040,height:700}:{width:700,height:1040};return Math.min(1,safe.width/box.width,safe.height/box.height);}

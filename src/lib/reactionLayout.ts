export type LayoutZone = "center" | "top" | "bottom" | "left" | "right";
export type LayoutNode = { id:string; width:number; height:number; zone?:LayoutZone };
export type LayoutPoint = { x:number; y:number };
export type LayoutBox = { minX:number; maxX:number; minY:number; maxY:number; width:number; height:number; centerX:number; centerY:number };
export type PageOrientation = "portrait" | "landscape";
export type GraphEdge = { id:string; from:string; to:string; label:string };
export type GraphRoute = { points:LayoutPoint[]; label:LayoutPoint; labelWidth:number; labelHeight:number };
export type ReactionGraphLayout = { canvas:{width:number;height:number}; positions:Record<string,LayoutPoint>; routes:Record<string,GraphRoute>; bbox:LayoutBox };

type Rect={left:number;right:number;top:number;bottom:number};
const PAD=54;
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

const estimateLabel=(text:string)=>{
  const parts=text.split("\n"),longest=Math.max(8,...parts.map(x=>x.length));
  const width=Math.min(220,Math.max(104,longest*7+20));
  const wrapped=parts.reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/28)),0);
  return {width,height:Math.min(112,Math.max(42,18+wrapped*15))};
};

function buildLevels(nodes:LayoutNode[],edges:GraphEdge[],centerId:string){
  const adjacency=new Map(nodes.map(node=>[node.id,[] as string[]]));
  edges.forEach(edge=>{adjacency.get(edge.from)?.push(edge.to);adjacency.get(edge.to)?.push(edge.from);});
  const level=new Map<string,number>([[centerId,0]]),queue=[centerId];
  while(queue.length){const id=queue.shift()!;for(const next of adjacency.get(id)??[])if(!level.has(next)){level.set(next,(level.get(id)??0)+1);queue.push(next);}}
  nodes.forEach(node=>{if(!level.has(node.id))level.set(node.id,Math.max(1,...level.values())+1);});
  return {adjacency,level};
}

function initialGraphPositions(nodes:LayoutNode[],edges:GraphEdge[],centerId:string,mobile:boolean){
  const {adjacency,level}=buildLevels(nodes,edges,centerId),maxDegree=Math.max(0,...nodes.map(n=>adjacency.get(n.id)?.length??0));
  const chain=maxDegree<=2&&edges.length>=nodes.length-1;
  const positions:Record<string,LayoutPoint>={};
  if(chain){
    const order:string[]=[];let current=nodes.find(n=>(adjacency.get(n.id)?.length??0)<=1)?.id??centerId,previous="";
    while(current&&!order.includes(current)){order.push(current);const next=(adjacency.get(current)??[]).find(id=>id!==previous&&!order.includes(id));previous=current;current=next??"";}
    nodes.forEach(n=>{if(!order.includes(n.id))order.push(n.id);});
    order.forEach((id,index)=>positions[id]=mobile?{x:260,y:120+index*220}:{x:130+index*280,y:270+(index%2?36:-36)});
    return positions;
  }
  if(mobile){
    const groups=new Map<number,LayoutNode[]>();nodes.forEach(node=>{const key=level.get(node.id)??0;groups.set(key,[...(groups.get(key)??[]),node]);});
    let y=120;
    [...groups.entries()].sort(([a],[b])=>a-b).forEach(([,items])=>{
      const columns=items.length===1?1:2,rowCount=Math.ceil(items.length/columns);
      items.forEach((node,index)=>positions[node.id]={x:columns===1?260:index%2===0?125:395,y:y+Math.floor(index/2)*190});
      y+=rowCount*190+72;
    });
    return positions;
  }
  positions[centerId]={x:500,y:400};
  const rings=new Map<number,LayoutNode[]>();nodes.filter(n=>n.id!==centerId).forEach(node=>{const key=level.get(node.id)??1;rings.set(key,[...(rings.get(key)??[]),node]);});
  [...rings.entries()].sort(([a],[b])=>a-b).forEach(([ring,items])=>{
    const radius=Math.max(290*ring,(items.length*(210+ring*10))/(2*Math.PI));
    items.forEach((node,index)=>{
      const zone=node.zone,zoneAngle=zone==="top"?-Math.PI/2:zone==="right"?0:zone==="bottom"?Math.PI/2:zone==="left"?Math.PI:undefined;
      const angle=zoneAngle??(-Math.PI/2+(Math.PI*2*index/items.length)+(ring%2)*.18);
      positions[node.id]={x:500+Math.cos(angle)*radius,y:400+Math.sin(angle)*radius};
    });
  });
  return positions;
}

function segmentHitsRect(a:LayoutPoint,b:LayoutPoint,r:Rect){
  if(a.x===b.x)return a.x>r.left&&a.x<r.right&&Math.max(a.y,b.y)>r.top&&Math.min(a.y,b.y)<r.bottom;
  if(a.y===b.y)return a.y>r.top&&a.y<r.bottom&&Math.max(a.x,b.x)>r.left&&Math.min(a.x,b.x)<r.right;
  return false;
}

function routeEdge(edge:GraphEdge,index:number,positions:Record<string,LayoutPoint>,nodeById:Map<string,LayoutNode>,allRects:Map<string,Rect>){
  const a=positions[edge.from],b=positions[edge.to],source=nodeById.get(edge.from)!,target=nodeById.get(edge.to)!;
  const lane=((index%5)-2)*11,dx=b.x-a.x,dy=b.y-a.y;
  const horizontal=Math.abs(dx)>=Math.abs(dy);
  const sx=horizontal?a.x+Math.sign(dx||1)*(source.width/2+8):a.x;
  const sy=horizontal?a.y:a.y+Math.sign(dy||1)*(source.height/2+8);
  const ex=horizontal?b.x-Math.sign(dx||1)*(target.width/2+10):b.x;
  const ey=horizontal?b.y:b.y-Math.sign(dy||1)*(target.height/2+10);
  const candidates:LayoutPoint[][]=horizontal
    ?[[{x:sx,y:sy},{x:(sx+ex)/2+lane,y:sy},{x:(sx+ex)/2+lane,y:ey},{x:ex,y:ey}],[{x:sx,y:sy},{x:sx,y:(sy+ey)/2+lane},{x:ex,y:(sy+ey)/2+lane},{x:ex,y:ey}]]
    :[[{x:sx,y:sy},{x:sx,y:(sy+ey)/2+lane},{x:ex,y:(sy+ey)/2+lane},{x:ex,y:ey}],[{x:sx,y:sy},{x:(sx+ex)/2+lane,y:sy},{x:(sx+ex)/2+lane,y:ey},{x:ex,y:ey}]];
  const score=(points:LayoutPoint[])=>points.slice(1).reduce((sum,p,i)=>sum+Math.abs(p.x-points[i].x)+Math.abs(p.y-points[i].y),0)+[...allRects.entries()].filter(([id])=>id!==edge.from&&id!==edge.to).reduce((sum,[,rect])=>sum+points.slice(1).filter((p,i)=>segmentHitsRect(points[i],p,rect)).length*10000,0);
  return candidates.sort((x,y)=>score(x)-score(y))[0];
}

function pathMidpoint(points:LayoutPoint[]){
  const lengths=points.slice(1).map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y)),total=lengths.reduce((a,b)=>a+b,0);let walked=0;
  for(let i=0;i<lengths.length;i++){if(walked+lengths[i]>=total/2){const t=(total/2-walked)/(lengths[i]||1);return {point:{x:points[i].x+(points[i+1].x-points[i].x)*t,y:points[i].y+(points[i+1].y-points[i].y)*t},horizontal:Math.abs(points[i+1].x-points[i].x)>=Math.abs(points[i+1].y-points[i].y)};}walked+=lengths[i];}
  return {point:points[0],horizontal:true};
}

export function computeReactionGraphLayout(nodes:LayoutNode[],edges:GraphEdge[],centerId:string,mobile=false):ReactionGraphLayout{
  if(!nodes.length)return {canvas:{width:1,height:1},positions:{},routes:{},bbox:{minX:0,maxX:1,minY:0,maxY:1,width:1,height:1,centerX:.5,centerY:.5}};
  let positions=separateOverlaps(nodes,initialGraphPositions(nodes,edges,centerId,mobile),mobile?38:56);
  const raw=computeBoundingBox(nodes,positions),shiftX=PAD-raw.minX,shiftY=PAD-raw.minY;
  positions=Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{x:p.x+shiftX,y:p.y+shiftY}]));
  const routes=computeReactionRoutes(nodes,edges,positions);
  const labelRects=Object.values(routes).map(route=>({left:route.label.x-route.labelWidth/2,right:route.label.x+route.labelWidth/2,top:route.label.y-route.labelHeight/2,bottom:route.label.y+route.labelHeight/2}));
  const nodeBounds=nodes.map(node=>rectFor(node,positions[node.id])),routePoints=Object.values(routes).flatMap(route=>route.points.map(p=>({left:p.x,right:p.x,top:p.y,bottom:p.y})));
  const all=[...nodeBounds,...labelRects,...routePoints],box=boxFromRects(all),canvas={width:Math.ceil(box.maxX+PAD),height:Math.ceil(box.maxY+PAD)};
  return {canvas,positions,routes,bbox:box};
}

export function computeReactionRoutes(nodes:LayoutNode[],edges:GraphEdge[],positions:Record<string,LayoutPoint>):Record<string,GraphRoute>{
  const nodeById=new Map(nodes.map(node=>[node.id,node])),nodeRects=new Map(nodes.map(node=>[node.id,rectFor(node,positions[node.id],14)]));
  const labelRects:Rect[]=[],routes:Record<string,GraphRoute>={};
  edges.forEach((edge,index)=>{
    const points=routeEdge(edge,index,positions,nodeById,nodeRects),mid=pathMidpoint(points),size=estimateLabel(edge.label);
    const candidates=[34,-34,58,-58,82,-82].flatMap(offset=>[0,-.18,.18].map(shift=>({x:mid.point.x+(mid.horizontal?shift*Math.abs(points.at(-1)!.x-points[0].x):offset),y:mid.point.y+(mid.horizontal?offset:shift*Math.abs(points.at(-1)!.y-points[0].y))})));
    const rect=(p:LayoutPoint):Rect=>({left:p.x-size.width/2,right:p.x+size.width/2,top:p.y-size.height/2,bottom:p.y+size.height/2});
    const score=(p:LayoutPoint)=>[...nodeRects.values()].reduce((sum,r)=>sum+overlapArea(rect(p),r)*8,0)+labelRects.reduce((sum,r)=>sum+overlapArea(rect(p),r)*12,0)+Math.hypot(p.x-mid.point.x,p.y-mid.point.y);
    const label=candidates.sort((a,b)=>score(a)-score(b))[0],labelRect=rect(label);labelRects.push(labelRect);routes[edge.id]={points,label,labelWidth:size.width,labelHeight:size.height};
  });
  return routes;
}

export function routeToSvgPath(points:LayoutPoint[]){return points.map((p,index)=>`${index?"L":"M"}${Math.round(p.x)} ${Math.round(p.y)}`).join(" ");}
export function getBestPageOrientation(box:Pick<LayoutBox,"width"|"height">):PageOrientation { return box.width/box.height>1.1?"landscape":"portrait"; }
export function computeScaleToFitA4(box:Pick<LayoutBox,"width"|"height">,orientation:PageOrientation,fit=true) {if(!fit)return 1;const safe=orientation==="landscape"?{width:1040,height:700}:{width:700,height:1040};return Math.min(1,safe.width/box.width,safe.height/box.height);}

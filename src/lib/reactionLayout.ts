export type LayoutZone = "center" | "top" | "bottom" | "left" | "right";
export type LayoutNode = { id:string; width:number; height:number; zone?:LayoutZone };
export type LayoutPoint = { x:number; y:number };
export type LayoutBox = { minX:number; maxX:number; minY:number; maxY:number; width:number; height:number; centerX:number; centerY:number };
export type PageOrientation = "portrait" | "landscape";

const distribute = (count:number,start:number,end:number) => Array.from({length:count},(_,i)=>count===1?(start+end)/2:start+(end-start)*i/(count-1));

export function computeBoundingBox(nodes:LayoutNode[],positions:Record<string,LayoutPoint>):LayoutBox {
  const bounds=nodes.map(node=>({left:positions[node.id].x-node.width/2,right:positions[node.id].x+node.width/2,top:positions[node.id].y-node.height/2,bottom:positions[node.id].y+node.height/2}));
  const minX=Math.min(...bounds.map(item=>item.left)),maxX=Math.max(...bounds.map(item=>item.right));
  const minY=Math.min(...bounds.map(item=>item.top)),maxY=Math.max(...bounds.map(item=>item.bottom));
  return {minX,maxX,minY,maxY,width:maxX-minX,height:maxY-minY,centerX:(minX+maxX)/2,centerY:(minY+maxY)/2};
}

export function centerLayoutInPage(nodes:LayoutNode[],positions:Record<string,LayoutPoint>,canvasWidth:number,canvasHeight:number) {
  const box=computeBoundingBox(nodes,positions),offsetX=canvasWidth/2-box.centerX,offsetY=canvasHeight/2-box.centerY;
  return Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{x:p.x+offsetX,y:p.y+offsetY}]));
}

function separateOverlaps(nodes:LayoutNode[],positions:Record<string,LayoutPoint>,gap=32) {
  const next=Object.fromEntries(Object.entries(positions).map(([id,p])=>[id,{...p}]));
  for(let pass=0;pass<24;pass++) for(let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++) {
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

export function getBestPageOrientation(box:Pick<LayoutBox,"width"|"height">):PageOrientation { return box.width/box.height>1.1?"landscape":"portrait"; }

export function computeScaleToFitA4(box:Pick<LayoutBox,"width"|"height">,orientation:PageOrientation,fit=true) {
  if(!fit)return 1;
  const safe=orientation==="landscape"?{width:1040,height:700}:{width:700,height:1040};
  return Math.min(1,safe.width/box.width,safe.height/box.height);
}

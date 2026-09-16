export type Grain={id:number;x:number;y:number;px:number;py:number;released:boolean};
const radius=2.5,diameter=radius*2;
export function grainUnit(seconds:number){return seconds<30?([.05,.1,.25,.5].find(v=>seconds/v<=120)??.5):seconds<=180?1:([2,5,10,30,60,120].find(v=>seconds/v<=180)??120)}
function walls(p:Grain){
 if(p.y<150){
  const slope=(145-p.y)*.38<7?0:.38,half=Math.max(7,(145-p.y)*.38),excess=Math.abs(p.x-65)+radius-half;
  if(excess>0){const sign=p.x>=65?1:-1;p.x-=sign*excess/(1+slope*slope);p.y-=slope*excess/(1+slope*slope)}
  if(!p.released&&p.y>138){p.y=138}
  p.y=Math.max(23,p.y);
 }else{
  const slope=.39,half=Math.min(47,3+(p.y-150)*slope),excess=Math.abs(p.x-65)+radius-half;
  if(excess>0){p.x-=(p.x>=65?1:-1)*excess/(1+slope*slope);p.y+=slope*excess/(1+slope*slope)}
  p.y=Math.min(277,p.y);
 }
}
export function physicsStep(grains:Grain[],dt=1/120){
 for(const p of grains){const vx=(p.x-p.px)*.975,vy=(p.y-p.py)*.985;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+650*dt*dt;walls(p)}
 for(let pass=0;pass<5;pass++){
  for(let i=0;i<grains.length;i++)for(let j=i+1;j<grains.length;j++){
   const a=grains[i],b=grains[j],dx=b.x-a.x,dy=b.y-a.y;
   if(Math.abs(dx)>=diameter||Math.abs(dy)>=diameter)continue;
   const distance=Math.hypot(dx,dy);if(distance<diameter){const nx=distance>1e-6?dx/distance:1,ny=distance>1e-6?dy/distance:0,shift=(diameter-distance)*.5;a.x-=nx*shift;a.y-=ny*shift;b.x+=nx*shift;b.y+=ny*shift;}
  }
  for(const p of grains)walls(p);
 }
}
export function makeSand(seconds:number){
 const unit=grainUnit(seconds),count=Math.ceil(seconds/unit),grains:Grain[]=[];
 for(let y=30;y<=135&&grains.length<count;y+=5.2)for(let x=23;x<=107&&grains.length<count;x+=5.2){if(Math.abs(x-65)<(145-y)*.38-3)grains.push({id:grains.length,x,y,px:x,py:y,released:false})}
 for(let i=0;i<240;i++)physicsStep(grains);
 for(const p of grains){p.px=p.x;p.py=p.y}
 return {unit,count:grains.length,grains,time:0,releases:[] as number[]};
}
export function advanceSand(model:ReturnType<typeof makeSand>,elapsed:number,seconds:number){
 if(elapsed<=model.time)return;
 const target=Math.min(model.count,Math.floor(model.count*Math.min(seconds,elapsed+.55)/seconds));
 while(model.releases.length<target){
  const candidates=model.grains.filter(p=>!p.released);candidates.sort((a,b)=>Math.hypot(a.x-65,a.y-145)-Math.hypot(b.x-65,b.y-145));
  const grain=candidates[0];if(!grain)break;grain.released=true;model.releases.push(grain.id);
  // Let the neighbors settle before admitting another grain after a long frame gap.
  physicsStep(model.grains);
 }
 const delta=elapsed-model.time,steps=Math.min(120,Math.max(1,Math.ceil(delta*120)));
 for(let i=0;i<steps;i++)physicsStep(model.grains);

 model.time=elapsed;
}



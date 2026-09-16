import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/800.css';
import './style.css';
import {makeSand,advanceSand,physicsStep} from './sand';
type City={name:string;zone:string};
const cities:City[]=[['Madrid','Europe/Madrid'],['London','Europe/London'],['New York','America/New_York'],['Tokyo','Asia/Tokyo'],['Sydney','Australia/Sydney'],['Mexico City','America/Mexico_City'],['Buenos Aires','America/Argentina/Buenos_Aires'],['Los Angeles','America/Los_Angeles'],['Dubai','Asia/Dubai'],['Singapore','Asia/Singapore'],['Reykjavik','Atlantic/Reykjavik'],['New Delhi','Asia/Kolkata'],['Paris','Europe/Paris'],['Berlin','Europe/Berlin'],['Seoul','Asia/Seoul'],['Cairo','Africa/Cairo'],['Honolulu','Pacific/Honolulu'],['Auckland','Pacific/Auckland']].map(([name,zone])=>({name,zone}));
function offset(c:City,now:number){return new Intl.DateTimeFormat('en',{timeZone:c.zone,timeZoneName:'shortOffset'}).formatToParts(now).find(p=>p.type==='timeZoneName')!.value;}
function PixelMatrix({cells,size=31}:{cells:number[][];size?:number}){return <svg className="pixels" viewBox={`0 0 ${size*5} ${size*5}`} aria-hidden="true">{cells.flatMap((row,y)=>row.map((v,x)=>v?<rect key={`${x}-${y}`} x={x*5} y={y*5} width="4" height="4" fill={v===2?'var(--hand)':'currentColor'}/>:null))}</svg>}
const palettes=[
 {paper:'#ffe500',ink:'#171300',accent:'#ff4938'},
 {paper:'#39ff14',ink:'#062b19',accent:'#00e5ff'},
 {paper:'#ff4938',ink:'#260800',accent:'#ffe500'},
 {paper:'#00e5ff',ink:'#002a3b',accent:'#ff78b8'},
 {paper:'#ff8a00',ink:'#311100',accent:'#a8ff00'},
 {paper:'#ff69b4',ink:'#350c35',accent:'#ffe500'},
];
function theme(city:City){const i=cities.findIndex(c=>c.zone===city.zone);const p=palettes[i%palettes.length];return {'--clock-bg':p.paper,'--clock-ink':p.ink,'--clock-accent':p.accent} as React.CSSProperties;}
const digits=[['11111','10001','10001','10001','10001','10001','11111'],['00100','01100','00100','00100','00100','00100','01110'],['11111','00001','00001','11111','10000','10000','11111'],['11111','00001','00001','01111','00001','00001','11111'],['10001','10001','10001','11111','00001','00001','00001'],['11111','10000','10000','11111','00001','00001','11111'],['11111','10000','10000','11111','10001','10001','11111'],['11111','00001','00010','00100','01000','01000','01000'],['11111','10001','10001','11111','10001','10001','11111'],['11111','10001','10001','11111','00001','00001','11111']];
function PixelDigitalClock({city,now}:{city:City;now:number}){
 const time=new Intl.DateTimeFormat('en-GB',{timeZone:city.zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 const values=time.replace(':','');const cells=Array.from({length:15},()=>Array(15).fill(0));
 [...values].forEach((digit,i)=>digits[Number(digit)].forEach((row,y)=>[...row].forEach((v,x)=>{if(v==='1')cells[y+Math.floor(i/2)*8][x+(i%2)*6+2]=i<2?1:2;})));
 return <><span className="sr-only" id={`time-${city.zone}`}>{time}</span><PixelMatrix size={15} cells={cells}/></>;
}
const glyphs={plus:['000110000','000110000','000110000','111111111','111111111','000110000','000110000','000110000','000000000'],minus:['000000000','000000000','000000000','111111111','111111111','000000000','000000000','000000000','000000000'],check:['000000011','000000110','000001100','000011000','110110000','011100000','001000000','000000000','000000000'],back:['001000000','011000000','111111100','011000110','001000011','000000011','000000110','000111100','000000000']};
function Glyph({kind}:{kind:keyof typeof glyphs}){return <PixelMatrix size={9} cells={glyphs[kind].map(r=>r.split('').map(Number))}/>}
function PaperL(){return <svg className="paper" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true"><defs><pattern id="fibers" width="37" height="41" patternUnits="userSpaceOnUse"><path d="M3 7l4 1m20 18l2-2M12 34l3 0" stroke="#da285c" strokeWidth=".6"/></pattern></defs><path id="paperShape" d="M245 0H390V844H0V277L13 277 33 282 54 275 76 284 99 276 123 282 143 275 165 281 185 273 207 280 225 271 238 261 233 240 241 220 234 200 242 178 236 157 243 134 236 110 244 90 238 69 245 49 239 28Z" fill="var(--paper)"/><use href="#paperShape" fill="url(#fibers)"/><g fill="none" stroke="#c72f59" strokeWidth="1.2"><path d="M282 22Q277 230 288 401T278 829M15 421Q163 404 383 432M12 732Q197 744 386 717M34 284L52 318 47 349 75 409 64 456M282 400L329 451 384 459M278 733L230 780 215 831"/><path d="M286 25Q281 230 292 401M16 425Q163 408 382 436" stroke="#ff88ad"/></g></svg>}
function SandGrains({seconds,remaining,kick=0,paused=false}:{seconds:number;remaining:number;kick?:number;paused?:boolean}){
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const q=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(q.matches);q.addEventListener('change',update);return()=>q.removeEventListener('change',update)},[]);
 const model=useMemo(()=>makeSand(seconds),[seconds]);
 const [,refresh]=useState(0);
 useEffect(()=>{if(!kick||reduced)return;const direction=kick%2?1:-1;for(const grain of model.grains)grain.px+=direction*.82;let frames=0;const id=setInterval(()=>{physicsStep(model.grains);physicsStep(model.grains);refresh(v=>v+1);if(++frames>=16)clearInterval(id)},1000/60);return()=>clearInterval(id)},[kick,model,reduced]);
 useEffect(()=>{if(!paused||reduced)return;let ticks=0;const id=setInterval(()=>{physicsStep(model.grains);physicsStep(model.grains);refresh(v=>v+1);const moving=model.grains.some(p=>p.released&&(p.y<220||Math.hypot(p.x-p.px,p.y-p.py)>.04));if(!moving||++ticks>=240)clearInterval(id)},1000/60);return()=>clearInterval(id)},[paused,model,reduced]);
 useEffect(()=>{if(remaining!==0||reduced)return;let ticks=0;const id=setInterval(()=>{for(let i=0;i<4;i++)physicsStep(model.grains);refresh(v=>v+1);ticks++;if(ticks>=300||model.grains.every(p=>p.y>150&&Math.hypot(p.x-p.px,p.y-p.py)<.04))clearInterval(id)},1000/30);return()=>clearInterval(id)},[remaining===0,model,reduced]);
 const elapsed=Math.max(0,seconds-remaining);
 if(elapsed<model.time){Object.assign(model,makeSand(seconds))}
 advanceSand(model,elapsed,seconds);
 return <g className="sand-grains" data-grain-count={model.count} data-grain-seconds={model.unit}>{model.grains.map(p=>{
 const state=!p.released?'top':p.y>220&&Math.abs(p.y-p.py)<.15?'bottom':'falling';
 // Reduced motion keeps stationary chamber indicators instead of moving particles.
 const x=reduced?30+(p.id%14)*5:p.x,y=reduced?(p.released?270:45)-Math.floor(p.id/14)*3:p.y;
 return <path key={p.id} data-grain={p.id} data-state={reduced?(p.released?'bottom':'top'):state} data-x={p.x} data-y={p.y} d={`M${x.toFixed(3)} ${y.toFixed(3)}h0.001`} fill="none" stroke="#050505" strokeWidth="3.2" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>;
 })}</g>;
}
function TotalDurationInput({value,onChange,onCommit,onEditingChange,ariaLabel='Total duration in minutes and seconds'}:{value:string;onChange:(value:string)=>void;onCommit?:(value:string)=>void;onEditingChange?:(editing:boolean)=>void;ariaLabel?:string}){
 const ref=useRef<HTMLInputElement>(null),caret=useRef<number|null>(null),selection=useRef([0,5]);
 const slots=[0,1,3,4];
 const animateDigits=(name:'digits-engage'|'digits-commit')=>{const input=ref.current;if(!input)return;input.classList.remove('digits-engage','digits-commit');void input.offsetWidth;input.classList.add(name)};
 useLayoutEffect(()=>{if(caret.current!==null){ref.current?.setSelectionRange(caret.current,caret.current);caret.current=null}},[value]);
 const edit=(text:string,kind='insert',range?:number[])=>{
  const el=ref.current;if(!el)return;
  const [start,end]=range??[el.selectionStart??0,el.selectionEnd??0];
  const chars=value.split('');let next=start;
  if(end>start){for(const slot of slots)if(slot>=start&&slot<end)chars[slot]='0'}
  if(kind==='backward'||kind==='forward'){
   if(start===end){const slot=kind==='backward'?[...slots].reverse().find(p=>p<start):slots.find(p=>p>=start);if(slot!==undefined){chars[slot]='0';next=slot}}
  }else{
   let index=slots.findIndex(p=>p>=start);if(index<0)index=4;
   for(const digit of text.replace(/\D/g,'')){if(index>=4)break;const slot=slots[index++];chars[slot]=digit;next=index<4?slots[index]:5}
  }
  chars[2]=':';const formatted=chars.join('');caret.current=next;selection.current=[next,next];onChange(formatted);el.value=formatted;el.setSelectionRange(next,next);
 };
 const editRef=useRef(edit);editRef.current=edit;
 useEffect(()=>{const el=ref.current!;const before=(event:InputEvent)=>{
  if(event.inputType.startsWith('delete')){event.preventDefault();editRef.current('',event.inputType.includes('Backward')?'backward':'forward')}
  else if(event.inputType.startsWith('insert')&&event.data!==null){event.preventDefault();editRef.current(event.data)}
 };el.addEventListener('beforeinput',before);return()=>el.removeEventListener('beforeinput',before)},[]);
 return <input ref={ref} className="time-input" aria-label={ariaLabel} inputMode="numeric" autoComplete="off" spellCheck={false} value={value}
 onFocus={e=>{e.currentTarget.select();selection.current=[0,5];onEditingChange?.(true);animateDigits('digits-engage')}} onClick={e=>{e.currentTarget.select();selection.current=[0,5]}}
 onSelect={e=>{selection.current=[e.currentTarget.selectionStart??0,e.currentTarget.selectionEnd??0]}}
 onPaste={e=>{e.preventDefault();edit(e.clipboardData.getData('text'))}}
 onKeyDown={e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Enter'){e.preventDefault();e.currentTarget.blur()}else if(/^\d$/.test(e.key)){e.preventDefault();edit(e.key)}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();edit('',e.key==='Backspace'?'backward':'forward')}else if(e.key.length===1){e.preventDefault()}}}
 onChange={e=>{const event=e.nativeEvent as InputEvent;edit(event.data??e.target.value,event.inputType?.startsWith('delete')?(event.inputType.includes('Backward')?'backward':'forward'):'insert',selection.current)}}
 onBlur={()=>{const seconds=Math.min(99*60+59,Number(value.slice(0,2))*60+Number(value.slice(3))),normalized=duration(seconds);onChange(normalized);onCommit?.(normalized);onEditingChange?.(false);animateDigits('digits-commit')}}/>
}
function RemainingReadout({remaining,editable,breaking,onSetRemaining}:{remaining:number;editable:boolean;breaking:boolean;onSetRemaining:(seconds:number)=>void}){
 const [draft,setDraft]=useState(duration(remaining)),[editing,setEditing]=useState(false);
 useEffect(()=>{if(!editing)setDraft(duration(remaining))},[remaining,editing]);
 return <div className={`remaining ${editable?'is-active':'is-plain'}`}><span>REMAINING</span><div className="remaining-number">{editable?<div className="remaining-card"><TotalDurationInput value={draft} onChange={setDraft} onCommit={value=>onSetRemaining(parseDuration(value))} onEditingChange={setEditing
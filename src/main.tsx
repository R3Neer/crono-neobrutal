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
function RemainingReadout({remaining,editable,onSetRemaining}:{remaining:number;editable:boolean;onSetRemaining:(seconds:number)=>void}){
 const [draft,setDraft]=useState(duration(remaining)),[editing,setEditing]=useState(false),[breaking,setBreaking]=useState(false),previous=useRef(editable);
 useEffect(()=>{if(!editing)setDraft(duration(remaining))},[remaining,editing]);
 useEffect(()=>{let timeout:ReturnType<typeof setTimeout>|undefined;if(previous.current&&!editable){setBreaking(true);timeout=setTimeout(()=>setBreaking(false),420)}else if(editable)setBreaking(false);previous.current=editable;return()=>clearTimeout(timeout)},[editable]);
 return <div className={`remaining ${editable?'is-active':'is-plain'}`}><span>REMAINING</span><div className="remaining-number">{editable?<div className="remaining-card"><TotalDurationInput value={draft} onChange={setDraft} onCommit={value=>onSetRemaining(parseDuration(value))} onEditingChange={setEditing} ariaLabel="Remaining timer duration"/></div>:<output aria-label="Remaining time">{duration(remaining)}</output>}{breaking&&<div className="remaining-fragments" aria-hidden="true"><i>{draft}</i><i>{draft}</i></div>}</div></div>;
}
function HourglassTimer({total,setTotal,remaining,running,paused,finished,onToggle,onReset,onSetRemaining}:{total:string;setTotal:(v:string)=>void;remaining:number;running:boolean;paused:boolean;finished:boolean;onToggle:()=>void;onReset:()=>void;onSetRemaining:(seconds:number)=>void}){
 const seconds=parseDuration(total)||1,[kick,setKick]=useState(0);
 const react=()=>setKick(value=>value+1);
 return <section className={`timer ${running?'running':''} ${finished?'finished':''} ${paused?'paused':''}`} aria-label="Timer"><div className="timer-name">TIMER</div><RemainingReadout remaining={remaining} editable={running||paused||finished} onSetRemaining={onSetRemaining}/><div className={`hourglass ${kick?kick%2?'wobble-right':'wobble-left':''}`} onPointerDown={react}><svg viewBox="0 0 130 300" preserveAspectRatio="none" aria-hidden="true"><path d="M12 12L116 15M15 20Q12 85 57 139Q67 148 56 165Q11 218 16 281M114 21Q117 78 72 138Q59 149 74 167Q115 220 117 280M11 287L121 290M20 6L112 9M18 296L115 296" fill="none" stroke="#050505" strokeWidth="5" strokeLinecap="square"/><SandGrains seconds={seconds} remaining={remaining} kick={kick} paused={paused}/></svg><button className="timer-control hard" onClick={onToggle}>{running?'PAUSE':paused?'CONTINUE':'START'}</button><TimerReset open={paused||finished} onReset={onReset}/></div><TotalCard total={total} setTotal={setTotal} locked={running||paused||finished}/>{finished&&<span className="done" role="status">TIME'S UP</span>}</section>
}
function parseDuration(v:string){if(!/^\d{1,2}:[0-5]\d$/.test(v))return 0;const [m,s]=v.split(':').map(Number);return m*60+s;}
function duration(s:number){s=Math.max(0,Math.ceil(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
function stopwatch(ms:number){return `${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(Math.floor(ms/10)%100).padStart(2,'0')}`;}
function readSaved(){try{const v=JSON.parse(localStorage.getItem('crono-clocks')||'null');if(v&&Array.isArray(v.saved)){const saved=v.saved.filter((i:unknown)=>Number.isInteger(i)&&Number(i)>=0&&Number(i)<cities.length);if(saved.length)return {saved:[...new Set(saved)] as number[],main:saved.includes(v.main)?v.main:saved[0]};}}catch{}return {saved:[0,1,2,3],main:0};}
function TotalCard({total,setTotal,locked}:{total:string;setTotal:(value:string)=>void;locked:boolean}){
 const [breaking,setBreaking]=useState(false);const previous=useRef(locked);
 useEffect(()=>{let timeout:ReturnType<typeof setTimeout>|undefined;if(!previous.current&&locked){setBreaking(true);timeout=setTimeout(()=>setBreaking(false),420)}else if(!locked)setBreaking(false);previous.current=locked;return()=>clearTimeout(timeout)},[locked]);
 const face=<><span className="fragment-total-label">TOTAL · SET</span><span className="fragment-total-value">{total}</span></>;
 return <div className={`value-card total ${locked?'is-locked':'is-editable'}`}><span>{locked?'TOTAL · LOCK':'TOTAL · SET'}</span>{locked?<output aria-label="Configured total duration">{total}</output>:<TotalDurationInput value={total} onChange={setTotal}/>}
 {breaking&&<div className="total-fragments" aria-hidden="true"><span className="reset-fragment fragment-left">{face}</span><span className="reset-fragment fragment-right">{face}</span></div>}</div>;
}
function TimerReset({open,onReset}:{open:boolean;onReset:()=>void}){
 return <button className={`timer-reset ${open?'is-open':''}`} disabled={!open} aria-hidden={!open} tabIndex={open?0:-1} onClick={e=>{e.currentTarget.parentElement?.querySelector<HTMLButtonElement>('.timer-control')?.focus();onReset()}} aria-label="Reset timer">RESET</button>;
}
function StopwatchReset({open,onReset}:{open:boolean;onReset:()=>void}){
 return <div className={`reset-cutout ${open?'is-open':''}`} aria-hidden={!open}>
 <button className="small-hole" disabled={!open} tabIndex={open?0:-1} aria-label="Reset stopwatch" onClick={e=>{const watch=e.currentTarget.closest<HTMLElement>('.stopwatch'),delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:300;watch?.classList.add('resetting');watch?.querySelector<HTMLButtonElement>('.primary')?.focus();e.currentTarget.disabled=true;setTimeout(()=>{onReset();watch?.classList.remove('resetting')},delay)}}><span className="control-card-depth"><span className="control-card"><b aria-hidden="true">↺</b><span>RESET</span></span></span></button>
 </div>;
}
function StopwatchFace({elapsed}:{elapsed:number}){
 const [pulse,setPulse]=useState(0);
 return <div className="torn-hole" onPointerDown={()=>setPulse(value=>value+1)}><span className="crono-label" aria-hidden="true">CRONO</span><output className={pulse?pulse%2?'ink-wobble-right':'ink-wobble-left':''} aria-label="Stopwatch elapsed time">{stopwatch(elapsed)}</output></div>;
}
function isMobileHandset(){
 const browser=navigator as Navigator&{userAgentData?:{mobile?:boolean}};
 const agent=navigator.userAgent;
 const compactTouchScreen=navigator.maxTouchPoints>0&&Math.min(window.screen.width,window.screen.height)<=600;
 if(compactTouchScreen)return true;
 if(/iPad/i.test(agent)||(/Macintosh/i.test(agent)&&navigator.maxTouchPoints>1))return false;
 if(/Android/i.test(agent)&&!/Mobile/i.test(agent))return false;
 if(typeof browser.userAgentData?.mobile==='boolean')return browser.userAgentData.mobile;
 return /iPhone|iPod|Windows Phone|Android.*Mobile|\bMobi\b/i.test(agent);
}
function DeviceCanvas({children}:{children:React.ReactNode}){
 const [handset]=useState(isMobileHandset);
 const [zoom,setZoom]=useState(()=>Math.min(1,Math.max(.55,(window.innerWidth-28)/438)));
 const change=(delta:number)=>setZoom(value=>Math.min(1.35,Math.max(.5,Math.round((value+delta)*20)/20)));
 return <div className={`device-workbench ${handset?'mobile-handset':''}`}><div className="zoom-controls" aria-label="Canvas zoom controls"><button aria-label="Zoom out" onClick={()=>change(-.1)}>−</button><output aria-label="Canvas zoom">{Math.round(zoom*100)}%</output><button aria-label="Zoom in" onClick={()=>change(.1)}>+</button></div><div className="device-stage" style={{'--device-zoom':zoom} as React.CSSProperties}><div className="device-shell"><i className="side-button silent"/><i className="side-button volume-up"/><i className="side-button volume-down"/><i className="side-button power"/><div className="device-screen">{children}<div className="dynamic-island" aria-hidden="true"><i/><b/></div><div className="home-indicator" aria-hidden="true"/></div></div></div></div>;
}
function App(){const [initial]=useState(readSaved),[saved,setSaved]=useState<number[]>(initial.saved),[main,setMain]=useState<number>(initial.main),[screen,setScreen]=useState('home'),[now,setNow]=useState(Date.now()),[total,setTotal]=useState('05:00'),[deadline,setDeadline]=useState<number|null>(null),[pausedTime,setPausedTime]=useState<number|null>(null),[finished,setFinished]=useState(false),[swStart,setSwStart]=useState<number|null>(null),[swBase,setSwBase]=useState(0),[deleting,setDeleting]=useState(false),[selected,setSelected]=useState<number[]>([]),[search,setSearch]=useState('');useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),32);return()=>clearInterval(t)},[]);useEffect(()=>{if(deadline!==null&&now>=deadline){setDeadline(null);setFinished(true)}},[now,deadline]);useEffect(()=>{try{localStorage.setItem('crono-clocks',JSON.stringify({saved,main}))}catch{}},[saved,main]);useEffect(()=>{document.querySelector<HTMLElement>('h1')?.focus()},[screen]);useLayoutEffect(()=>{if(screen!=='home')return;const app=document.querySelector<HTMLElement>('.app')!;const glass=document.querySelector<HTMLElement>('.hourglass')!;const align=()=>{const r=glass.getBoundingClientRect(),a=app.getBoundingClientRect(),scale=a.width/app.offsetWidth;app.style.setProperty('--timer-center',((r.top+r.height/2-a.top)/scale)+'px')};align();const observer=new ResizeObserver(align);observer.observe(glass);observer.observe(app);return()=>observer.disconnect()},[screen]);const remaining=deadline?Math.max(0,(deadline-now)/1000):pausedTime!==null?pausedTime:finished?0:parseDuration(total);const elapsed=swBase+(swStart===null?0:now-swStart);function resetDelete(){setDeleting(false);setSelected([])}function remove(){const next=saved.filter(i=>!selected.includes(i));if(next.length){setSaved(next);if(!next.includes(main))setMain(next[0]);resetDelete()}}function removeOne(index:number){if(saved.length<=1)return;const next=saved.filter(i=>i!==index);setSaved(next);if(main===index)setMain(next[0])}return <DeviceCanvas><main className={`app ${screen}`}>
{screen==='home'?<><PaperL/><button className="world-preview" style={theme(cities[main])} aria-describedby={`time-${cities[main].zone}`} aria-label={`World Clock, ${cities[main].name}`} onClick={()=>setScreen('world')}><PixelDigitalClock city={cities[main]} now={now}/><strong style={cities[main].name.length>10?{fontSize:26}:undefined}>{cities[main].name}</strong><span>{offset(cities[main],now)}</span></button><HourglassTimer total={total} setTotal={v=>{setTotal(v);setFinished(false)}} remaining={remaining} running={deadline!==null} paused={pausedTime!==null} finished={finished} onReset={()=>{setDeadline(null);setPausedTime(null);setFinished(false)}} onSetRemaining={seconds=>{if(deadline!==null){setDeadline(seconds?Date.now()+seconds*1000:null);setPausedTime(seconds?null:0)}else setPausedTime(seconds);setFinished(false)}} onToggle={()=>{if(deadline!==null){const rest=Math.max(0,(deadline-Date.now())/1000);setDeadline(null);setPausedTime(rest>0?rest:null);setFinished(rest===0)}else if(pausedTime!==null){setDeadline(Date.now()+pausedTime*1000);setPausedTime(null)}else if(parseDuration(total)){setDeadline(Date.now()+parseDuration(total)*1000);setFinished(false)}}}/><section className={`stopwatch ${swStart!==null?'running':''} ${swStart===null&&swBase>0?'paused':''} ${swStart!==null&&swBase>0?'resumed':''}`} aria-label="Stopwatch"><StopwatchFace elapsed={elapsed}/><div className="stopwatch-controls"><button className="small-hole primary" aria-label={swStart!==null?'Pause stopwatch':swBase?'Resume stopwatch':'Start stopwatch'} onClick={()=>{if(swStart!==null){setSwBase(swBase+Date.now()-swStart);setSwStart(null)}else setSwStart(Date.now())}}><span className="control-card-depth"><span className="control-card"><b aria-hidden="true">{swStart!==null?<span className="pause-icon"><i/><i/></span>:'▶'}</b><span>{swStart!==null?'PAUSE':swBase?'RESUME':'START'}</span></span></span></button><StopwatchReset open={swStart===null&&swBase>0} onReset={()=>{setSwBase(0);setSwStart(null)}}/></div></section></>:<><header><button className="back" aria-label="Back" onClick={()=>{setScreen(screen==='add'?'world':'home');resetDelete();setSearch('')}}><span className="back-card" aria-hidden="true">←</span></button><h1 tabIndex={-1}>{screen==='add'?'ADD CLOCK':'WORLD CLOCK'}</h1></header>{screen==='world'?<><div className="clock-grid">{saved.map(i=><div className="city-cell" key={i}><button style={theme(cities[i])} className={`clock-tile ${main===i?'main-clock':''} ${selected.includes(i)?'delete-selected':''}`} aria-describedby={`time-${cities[i].zone}`} aria-label={`${cities[i].name}${deleting?', select for deletion':''}`} aria-pressed={deleting?selected.includes(i):main===i} onClick={()=>deleting?setSelected(selected.includes(i)?selected.filter(x=>x!==i):[...selected,i]):setMain(i)}><PixelDigitalClock city={cities[i]} now={now}/><strong>{cities[i].name}</strong>{main===i&&<span className="main-badge">MAIN</span>}<span>{offset(cities[i],now)}</span>{selected.includes(i)&&<span className="remove-label">REMOVE</span>}</button>{!deleting&&<button className="delete-badge" disabled={saved.length<=1} aria-label={`Remove ${cities[i].name}`} onClick={event=>{event.stopPropagation();removeOne(i)}}><Glyph kind="minus"/></button>}</div>)}<button className="clock-tile action-tile" aria-label={deleting?'Cancel deletion':'Add clock'} onClick={()=>deleting?resetDelete():setScreen('add')}><Glyph kind={deleting?'back':'plus'}/></button><button className="clock-tile action-tile" aria-label={deleting?'Confirm deletion':'Delete clocks'} disabled={deleting&&(!selected.length||selected.length===saved.length)} onClick={()=>deleting?remove():setDeleting(true)}><Glyph kind={deleting?'check':'minus'}/></button></div>{deleting&&selected.length===saved.length&&<p className="notice" role="status">Keep at least one clock.</p>}</>:<><input className="search" aria-label="Search cities" placeholder="SEARCH CITY" value={search} onChange={e=>setSearch(e.target.value)}/><div className="city-list">{cities.map((city,i)=>({city,i})).filter(({city,i})=>!saved.includes(i)&&city.name.toLowerCase().includes(search.toLowerCase())).map(({city,i})=><button key={i} onClick={()=>{setSaved([...saved,i]);setSearch('');setScreen('world')}}><strong>{city.name}</strong><span>{offset(city,now)}</span></button>)}{!cities.some((c,i)=>!saved.includes(i)&&c.name.toLowerCase().includes(search.toLowerCase()))&&<p>No cities found.</p>}</div></>}</>}
</main></DeviceCanvas>}
createRoot(document.getElementById('root')!).render(<App/>);









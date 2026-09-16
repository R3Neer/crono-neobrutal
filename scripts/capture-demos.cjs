const {chromium}=require('@playwright/test');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const frameRoot=path.join(root,'artifacts','demo-frames');
const frameMs=83;

function resetDir(dir){fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});}

async function prepare(page){
 await page.goto('http://127.0.0.1:5173/');
 await page.evaluate(()=>localStorage.clear());
 await page.reload();
 await page.evaluate(()=>document.fonts.ready);
 await page.addStyleTag({content:`
  html,body{width:462px!important;height:940px!important;overflow:hidden!important}
  .device-workbench{width:462px!important;min-width:462px!important;height:940px!important;min-height:940px!important;padding:12px!important;align-items:flex-start!important}
  .device-stage{--device-zoom:1!important}
  .zoom-controls{display:none!important}
  #demo-touch{position:fixed;z-index:10000;width:22px;height:22px;background:#ffe500;border:3px solid #050505;box-shadow:3px 3px 0 #050505;pointer-events:none;opacity:0;transform:translate(-50%,-50%) rotate(45deg) scale(.3)}
  #demo-touch.hit{animation:demo-touch 415ms steps(4)}
  @keyframes demo-touch{0%{opacity:0;transform:translate(-50%,-50%) rotate(45deg) scale(1.45)}18%,68%{opacity:1;transform:translate(-50%,-50%) rotate(45deg) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) rotate(45deg) scale(.35)}}
 `});
 await page.evaluate(()=>{const marker=document.createElement('i');marker.id='demo-touch';document.body.append(marker)});
}

async function record(name,sequence){
 const dir=path.join(frameRoot,name);resetDir(dir);
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:462,height:940},deviceScaleFactor:1});
 let number=0;
 const frame=()=>page.screenshot({path:path.join(dir,`${String(number++).padStart(4,'0')}.png`)});
 const hold=async ms=>{
  const count=Math.max(1,Math.round(ms/frameMs));
  for(let i=0;i<count;i++){
   const started=Date.now();await frame();
   await page.waitForTimeout(Math.max(0,frameMs-(Date.now()-started)));
  }
 };
 const mark=async(locator,position)=>{
  const box=await locator.boundingBox();if(!box)throw new Error('Target is not visible');
  const x=box.x+(position?.x??box.width/2),y=box.y+(position?.y??box.height/2);
  await page.evaluate(({x,y})=>{const marker=document.querySelector('#demo-touch');marker.classList.remove('hit');void marker.offsetWidth;marker.style.left=`${x}px`;marker.style.top=`${y}px`;marker.classList.add('hit')},{x,y});
 };
 const tap=async(locator,after=500,position)=>{await mark(locator,position);await locator.click(position?{position}:undefined);await hold(after)};
 try{await prepare(page);await sequence({page,hold,tap,mark});}
 finally{await browser.close()}
 console.log(`${name}: ${number} frames`);
}

async function homeDemo({page,hold,tap}){
 await hold(830);
 const total=page.getByLabel('Total duration in minutes and seconds');
 await tap(total,249);
 for(const key of '0010'){await page.keyboard.press(key);await hold(83)}
 await page.keyboard.press('Enter');await hold(415);

 const timer=page.locator('.timer-control');
 await tap(timer,664);
 await hold(1660);
 const glass=page.locator('.hourglass');
 const glassBox=await glass.boundingBox();
 await tap(glass,581,{x:glassBox.width*.78,y:glassBox.height*.28});
 await hold(996);
 await tap(timer,747);
 await hold(581);
 await tap(timer,664);
 await hold(1411);
 await tap(timer,498);
 await tap(page.getByLabel('Reset timer',{exact:true}),747);

 await tap(page.locator('.torn-hole'),498,{x:125,y:132});
 await tap(page.getByLabel('Start stopwatch',{exact:true}),498);
 await hold(747);
 await tap(page.getByLabel('Pause stopwatch',{exact:true}),830);
 await tap(page.getByLabel('Resume stopwatch',{exact:true}),664);
 await hold(498);
 await tap(page.getByLabel('Pause stopwatch',{exact:true}),664);
 await tap(page.getByLabel('Reset stopwatch',{exact:true}),913);
}

async function worldDemo({page,hold,tap,mark}){
 await hold(830);
 const worldPreview=page.getByRole('button',{name:/^World Clock,/});
 await mark(worldPreview);await hold(249);await worldPreview.click();await hold(581);
 await hold(830);
 await tap(page.getByRole('button',{name:'Tokyo',exact:true}),747);
 await tap(page.getByLabel('Delete clocks',{exact:true}),664);
 await tap(page.getByRole('button',{name:'London, select for deletion',exact:true}),913);
 await tap(page.getByLabel('Cancel deletion',{exact:true}),664);
 await tap(page.getByLabel('Remove New York',{exact:true}),747);
 await tap(page.getByLabel('Add clock',{exact:true}),581);
 const search=page.getByLabel('Search cities');
 await tap(search,249);
 for(const key of 'SEOUL'){await page.keyboard.press(key);await hold(83)}
 await hold(332);
 await tap(page.locator('.city-list button'),664);
 await tap(page.getByRole('button',{name:'Seoul',exact:true}),747);
 await tap(page.getByLabel('Back',{exact:true}),581);
 await hold(996);
}

(async()=>{
 const requested=process.argv[2];
 if(!requested)resetDir(frameRoot);
 if(!requested||requested==='01-time-and-physics')await record('01-time-and-physics',homeDemo);
 if(!requested||requested==='02-world-palettes')await record('02-world-palettes',worldDemo);
})().catch(error=>{console.error(error);process.exit(1)});

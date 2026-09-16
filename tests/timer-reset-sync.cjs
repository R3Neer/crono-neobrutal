const {chromium,expect}=require('@playwright/test');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:5173/');
 await page.locator('.timer-control').click();
 await page.locator('.timer-control').click();
 const reset=page.getByLabel('Reset timer',{exact:true});
 await expect(reset).toBeEnabled();
 await reset.dispatchEvent('pointerdown',{pointerType:'mouse',button:0,bubbles:true});
 await expect(page.locator('.remaining-fragments i')).toHaveCount(2);
 await page.evaluate(()=>new Promise(requestAnimationFrame));
 const timing=await page.evaluate(()=>{
  const wobble=document.querySelector('.hourglass').getAnimations().find(animation=>animation.animationName.startsWith('glass-wobble'));
  const fracture=document.querySelector('.remaining-fragments i').getAnimations()[0];
  return {wobbleStart:wobble?.startTime,fractureStart:fracture?.startTime};
 });
 expect(timing.wobbleStart).not.toBeNull();
 expect(timing.fractureStart).not.toBeNull();
 expect(Math.abs(timing.wobbleStart-timing.fractureStart)).toBeLessThanOrEqual(17);
 await reset.dispatchEvent('pointerup',{pointerType:'mouse',button:0,bubbles:true});
 await reset.dispatchEvent('click',{button:0,bubbles:true});
 await expect(page.getByLabel('Remaining time',{exact:true})).toHaveText('05:00');
 await expect(page.locator('.remaining-fragments i')).toHaveCount(0,{timeout:700});
 await browser.close();
 console.log('Timer RESET wobble and REMAINING fracture start in the same frame');
})().catch(error=>{console.error(error);process.exit(1)});

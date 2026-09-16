const {chromium,expect}=require('@playwright/test');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:5173/');
 const control=page.locator('.timer-control');
 const hourglass=page.locator('.hourglass');
 await control.click();
 await control.click();
 const reset=page.getByLabel('Reset timer',{exact:true});
 await expect(reset).toHaveClass(/is-open/);
 await page.waitForTimeout(280);
 const before=await hourglass.evaluate(el=>el.getAnimations().filter(a=>a.animationName?.startsWith('glass-wobble')).length);
 expect(before).toBe(0);
 await control.dispatchEvent('pointerdown',{pointerType:'mouse',button:0,bubbles:true});
 await expect(reset).not.toHaveClass(/is-open/);
 const wobbleDuringRetract=await hourglass.evaluate(el=>el.getAnimations().filter(a=>a.animationName?.startsWith('glass-wobble')).length);
 expect(wobbleDuringRetract).toBe(0);
 const y1=(await reset.boundingBox()).y;
 await page.waitForTimeout(80);
 const y2=(await reset.boundingBox()).y;
 expect(y2).toBeLessThanOrEqual(y1);
 await control.dispatchEvent('pointerup',{pointerType:'mouse',button:0,bubbles:true});
 await control.dispatchEvent('click',{button:0,bubbles:true});
 await expect(control).toHaveText('PAUSE');
 await browser.close();
 console.log('Timer RESET retracts immediately without inheriting the hourglass wobble');
})().catch(error=>{console.error(error);process.exit(1)});

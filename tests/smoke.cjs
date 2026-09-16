const {chromium,expect}=require('@playwright/test');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:462,height:940}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:5173/');
 await page.evaluate(()=>localStorage.clear());await page.reload();

 const total=page.getByLabel('Total duration in minutes and seconds');
 await total.click();await page.keyboard.type('0010');await page.keyboard.press('Enter');
 await expect(total).toHaveValue('00:10');
 await page.locator('.timer-control').click();await page.waitForTimeout(1100);
 await expect(page.getByLabel('Remaining timer duration')).not.toHaveValue('00:10');
 await page.locator('.timer-control').click();
 await expect(page.locator('.timer-control')).toHaveText('CONTINUE');
 await page.getByLabel('Reset timer',{exact:true}).click();
 await expect(page.getByLabel('Remaining time')).toHaveText('00:10');

 await page.getByLabel('Start stopwatch',{exact:true}).click();await page.waitForTimeout(100);
 await page.getByLabel('Pause stopwatch',{exact:true}).click();await page.waitForTimeout(350);
 const positions=await page.evaluate(()=>{const reset=document.querySelector('[aria-label="Reset stopwatch"]').getBoundingClientRect(),resume=document.querySelector('[aria-label="Resume stopwatch"]').getBoundingClientRect();return {reset:reset.x,resume:resume.x}});
 expect(positions.reset).toBeLessThan(positions.resume);
 await page.getByLabel('Reset stopwatch',{exact:true}).click();await page.waitForTimeout(350);
 await expect(page.getByLabel('Stopwatch elapsed time')).toHaveText('00:00.00');

 await page.getByRole('button',{name:/^World Clock,/}).click();
 expect(await page.locator('.device-screen').evaluate(element=>getComputedStyle(element).backgroundColor)).toBe('rgb(5, 5, 5)');
 await page.getByLabel('Remove New York',{exact:true}).click();
 await expect(page.getByRole('button',{name:'New York',exact:true})).toHaveCount(0);
 await page.getByLabel('Delete clocks',{exact:true}).click();
 await page.getByRole('button',{name:'London, select for deletion',exact:true}).click();
 await expect(page.locator('.remove-label')).toHaveText('REMOVE');
 await page.getByLabel('Cancel deletion',{exact:true}).click();
 await page.getByLabel('Add clock',{exact:true}).click();
 await page.getByLabel('Search cities').fill('Seoul');
 await page.locator('.city-list button').click();
 await page.getByRole('button',{name:'Seoul',exact:true}).click();
 await page.getByLabel('Back',{exact:true}).click();
 await expect(page.getByRole('button',{name:'World Clock, Seoul'})).toBeVisible();

 expect(errors).toEqual([]);
 console.log('Current timer, stopwatch, world-clock and selection flows verified');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});

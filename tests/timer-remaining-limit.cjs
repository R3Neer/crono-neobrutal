const {chromium,expect}=require('@playwright/test');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:5173/');
 const total=page.getByLabel('Total duration in minutes and seconds');
 await total.fill('00:10');
 await total.press('Enter');
 await page.locator('.timer-control').click();
 await page.locator('.timer-control').click();
 const remaining=page.getByLabel('Remaining timer duration');
 await remaining.fill('99:59');
 await remaining.press('Enter');
 await expect(remaining).toHaveValue('00:10');
 await remaining.fill('00:07');
 await remaining.press('Enter');
 await expect(remaining).toHaveValue('00:07');
 await page.locator('.timer-control').click();
 await remaining.fill('99:59');
 await remaining.press('Enter');
 await expect(remaining).toHaveValue('00:10');
 await browser.close();
 console.log('Editable REMAINING saturates at TOTAL while paused and running');
})().catch(error=>{console.error(error);process.exit(1)});

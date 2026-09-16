const {chromium,expect}=require('@playwright/test');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const phone=await browser.newContext({
  viewport:{width:390,height:844},
  isMobile:true,
  hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
 });
 const phonePage=await phone.newPage();await phonePage.goto('http://127.0.0.1:5173/');
 await expect(phonePage.locator('.device-workbench')).toHaveClass(/mobile-handset/);
 await expect(phonePage.locator('.zoom-controls')).toBeHidden();
 await expect(phonePage.locator('.dynamic-island')).toBeHidden();
 const phoneGeometry=await phonePage.evaluate(()=>{const screen=document.querySelector('.device-screen').getBoundingClientRect(),app=document.querySelector('.app').getBoundingClientRect();return {screen:{x:screen.x,y:screen.y,width:screen.width,height:screen.height},app:{x:app.x,width:app.width},viewport:{width:innerWidth,height:innerHeight}}});
 expect(phoneGeometry.screen).toEqual({x:0,y:0,width:390,height:844});
 expect(phoneGeometry.app.x).toBe(0);expect(phoneGeometry.app.width).toBe(390);
 await phone.close();

 const tablet=await browser.newContext({
  viewport:{width:820,height:1180},
  isMobile:true,
  hasTouch:true,
  userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
 });
 const tabletPage=await tablet.newPage();await tabletPage.goto('http://127.0.0.1:5173/');
 await expect(tabletPage.locator('.device-workbench')).not.toHaveClass(/mobile-handset/);
 await expect(tabletPage.locator('.zoom-controls')).toBeVisible();
 await expect(tabletPage.locator('.dynamic-island')).toBeVisible();
 await tablet.close();

 console.log('Native phone view and framed tablet view verified');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});

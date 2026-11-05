const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');
  const links=page.locator('.quick-start a');
  assert.equal(await links.count(),3);
  assert.equal(await links.nth(0).getAttribute('href'),'#chapters');
  assert.equal(await links.nth(1).getAttribute('href'),'#kem-prediction');
  assert.equal(await links.nth(2).getAttribute('href'),'#reference');
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:950});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`quick-start overflow at ${width}px`);}
  await links.nth(1).click();await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="kem-prediction"]')?.open);
  assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true','KEM shortcut should open its chapter automatically');
  assert.equal(await page.evaluate(()=>location.hash),'#kem-prediction');
  await page.locator('.quick-start a[href="#reference"]').click();assert.equal(await page.evaluate(()=>location.hash),'#reference');
  assert.equal(await page.locator('.intro .coach-entry a').count(),2,'Existing learning-check and independent-mission entry points remain available');
  assert.deepEqual(errors,[]);
  console.log('PASS: three clear start routes, KEM chapter routing, retained self-check/mission links, and 320/390/768/1440px layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');
  const menu=page.locator('#quick-jump'),summary=menu.locator('summary');
  assert.equal(await menu.evaluate(element=>element.open),false);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:844});const bounds=await summary.boundingBox();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}px`);const smallDisclosures=await page.locator('summary').evaluateAll(items=>items.filter(item=>item.getClientRects().length&&item.getBoundingClientRect().height<44).map(item=>`${item.textContent.trim()}: ${Math.round(item.getBoundingClientRect().height)}px`));assert.deepEqual(smallDisclosures,[],`Disclosure targets below 44px at ${width}px`);
   assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=width,`jump control must fit at ${width}px`);
  }
  await summary.click();assert.equal(await menu.evaluate(element=>element.open),true);
  assert.equal(await menu.locator('nav a').count(),6);
  await page.keyboard.press('Tab');await page.keyboard.press('Escape');
  assert.equal(await menu.evaluate(element=>element.open),false,'Escape should close quick navigation');
  assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#quick-jump summary')),true,'Escape should return focus to the disclosure');
  await summary.click();await page.locator('#quick-jump a[href="#kem-prediction"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="kem-prediction"]')?.open);
  assert.equal(await menu.evaluate(element=>element.open),false,'Following a route should close the menu');
  assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true');
  await summary.click();await page.locator('#quick-jump a[href="#wire-glossary"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="build-the-wire"]')?.open);
  assert.equal(await page.locator('#wire-glossary dl').isVisible(),true,'Quick glossary route should open its definitions.');
  assert.equal(await menu.evaluate(element=>element.open),false);
  assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true');
  await summary.click();await page.locator('#quick-jump a[href="#reference"]').click();
  await page.waitForFunction(()=>location.hash==='#reference');
  assert.equal(await menu.evaluate(element=>element.open),false);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'reference','Section links should retain useful destination focus');
  assert.deepEqual(errors,[]);
  console.log('PASS: compact quick navigation, Escape/focus behavior, exercise routing, reference focus, and 320/390/768/1440px bounds.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

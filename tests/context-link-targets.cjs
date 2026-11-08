const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {act}=require('./navigation-helper.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>errors.push(request.url()));
  page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  const root=process.env.TEST_URL||'http://127.0.0.1:8780/';
  const widths=[320,390,768,1440];
  const audit=async selector=>{
   for(const width of widths){
    await page.setViewportSize({width,height:950});
    const link=page.locator(selector),box=await link.boundingBox();
    assert.equal(await link.isVisible(),true,`${selector} should remain visible at ${width}px`);
    assert.ok(box&&box.height>=44,`${selector} target is ${box?.height}px at ${width}px`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${selector} causes overflow at ${width}px`);
   }
  };

  await page.goto(root+'?chapter=4');
  await page.locator('[data-threat-mode="active"]').click();
  await audit('#kem-threat-link');
  await page.setViewportSize({width:1440,height:950});
  await page.locator('#kem-threat-link').click();
  assert.equal(await page.evaluate(()=>location.hash),'#attack-playground');

  await page.goto(root+'?chapter=4#build-the-wire');
  await page.locator('#wire-send-ek').click();
  await page.locator('#wire-send-c').click();
  await audit('#wire-reflect');
  await page.setViewportSize({width:1440,height:950});
  await page.locator('#wire-reflect').click();
  assert.equal(await page.evaluate(()=>location.hash),'#teach-it-back');
  assert.equal(await page.inputValue('#teach-topic'),'0');

  for(const [topic,href] of [['0','#build-the-wire'],['1','#build-the-wire'],['2','#attack-playground']]){
   await act(page,'#teach-topic','selectOption',topic);
   assert.equal(await page.locator('#teach-action').getAttribute('href'),href);
   await audit('#teach-action');
  }

  await page.selectOption('#exercise-picker','guided-missions');
  await page.locator('#exercise-open').click();
  if(!await page.locator('#independent-missions').evaluate(element=>element.open))await page.locator('#independent-missions>summary').click();
  assert.equal(await page.locator('#ind-link').getAttribute('href'),'#message-journey');
  await audit('#ind-link');
  if(process.env.EVIDENCE_DIR){
   await page.setViewportSize({width:1440,height:950});await page.locator('#ind-link').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'context-links-desktop.png')});
   await page.setViewportSize({width:390,height:844});await page.locator('#ind-link').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'context-links-mobile.png')});
  }
  assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false,'UI remains English');
  assert.deepEqual(errors,[]);
  console.log('PASS: four contextual handoff links keep 44px targets, correct routes and responsive layouts at 320/390/768/1440px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

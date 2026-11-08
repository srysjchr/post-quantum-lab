const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce',hasTouch:true});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  const root=process.env.TEST_URL||'http://127.0.0.1:8765/';
  await page.goto(root+'?chapter=2');await page.waitForSelector('#scene canvas');
  assert.equal(await page.locator('#scene').getAttribute('aria-describedby'),'scene-controls-help','The focused 3D view must announce its keyboard instructions.');assert.equal(await page.locator('#scene-controls-help').count(),1);
  assert.equal(await page.locator('#scene-rotate-left').isDisabled(),false);
  assert.equal(await page.locator('#scene-rotate-right').isDisabled(),false);
  assert.match(await page.locator('#scene-annotation').innerText(),/SHOR.*PERIOD FINDING/);
  await page.locator('[data-algorithm="grover"]').click();
  assert.equal(await page.locator('[data-algorithm="grover"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#scene-annotation').innerText(),/GROVER.*SEARCH AMPLIFICATION/);
  assert.match(await page.locator('#quantum-description').innerText(),/square-root query reduction/);
  const before=await page.locator('#scene canvas').screenshot();
  await page.locator('#scene-rotate-right').click();
  assert.match(await page.locator('#scene-rotation-status').innerText(),/right/i);
  assert.notDeepEqual(await page.locator('#scene canvas').screenshot(),before,'The button must rotate the rendered model.');
  await page.locator('#scene').focus();const beforeKey=await page.locator('#scene canvas').screenshot();
  await page.keyboard.press('ArrowLeft');
  assert.match(await page.locator('#scene-rotation-status').innerText(),/left/i);
  assert.notDeepEqual(await page.locator('#scene canvas').screenshot(),beforeKey,'Arrow keys must keep rotating the rendered model.');
  await page.keyboard.press('Home');assert.match(await page.locator('#scene-rotation-status').innerText(),/reset/i);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page overflow at '+width+'px');
   const undersized=await page.locator('button').evaluateAll(buttons=>buttons.filter(button=>{const rect=button.getBoundingClientRect();return rect.width>0&&rect.height>0&&getComputedStyle(button).visibility!=='hidden'&&!button.closest('[hidden],[aria-hidden="true"],details:not([open])')&&rect.height<44}).map(button=>`${button.textContent.trim()||button.id||'unnamed'}: ${Math.round(button.getBoundingClientRect().height)}px`));assert.deepEqual(undersized,[],`Interactive buttons below 44px at ${width}px`);
   if(width<=740){const hintFont=await page.locator('#scene-controls-help').evaluate(element=>parseFloat(getComputedStyle(element).fontSize));assert.ok(hintFont>=11,'Mobile camera guidance below 11px at '+width+'px');for(const link of await page.locator('header nav a').all()){const box=await link.boundingBox();assert.ok(box&&box.height>=44,'Mobile navigation target below 44px at '+width+'px');assert.ok(box.x>=0&&box.x+box.width<=width,'Mobile navigation target outside viewport at '+width+'px');}}
   for(const [id,label] of [['scene-rotate-left','Rotate view left'],['scene-rotate-right','Rotate view right']]){
    const button=page.locator('#'+id),box=await button.boundingBox();assert.ok(box&&box.width>=44&&box.height>=44,id+' touch target below 44px at '+width+'px');
    assert.equal(await button.getAttribute('aria-label'),label);
    assert.ok(box.x>=0&&box.x+box.width<=width,id+' out of viewport at '+width+'px');
   }
   if(process.env.EVIDENCE_DIR&&[320,1440].includes(width))await page.locator('.visual').screenshot({path:path.join(process.env.EVIDENCE_DIR,'main-scene-'+width+'.png')});
  }
  await page.setViewportSize({width:390,height:844});await page.locator('#scene-rotate-left').scrollIntoViewIfNeeded();
  const left=await page.locator('#scene-rotate-left').boundingBox();await page.touchscreen.tap(left.x+left.width/2,left.y+left.height/2);
  assert.match(await page.locator('#scene-rotation-status').innerText(),/left/i);
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
  console.log('PASS: main-scene rotation buttons; rendered rotation and reset; keyboard and touch; Shor/Grover annotation; 320/390/768/1440 widths; English; no runtime/request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

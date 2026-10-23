const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 await page.goto(root+'?chapter=4#key-substitution-story');await page.waitForSelector('#substitution-next');
 for(let n=0;n<4;n++)await page.locator('#substitution-next').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description','Last story step must retain a useful keyboard position');
 assert.equal(await page.locator('#substitution-next').isDisabled(),true);
 await page.locator('[data-substitution-step="2"]').press('Space');assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description','Rebuilt stage buttons must not drop focus');
 assert.match(await page.locator('#substitution-count').innerText(),/3 \/ 5/);
 for(let n=0;n<2;n++)await page.locator('#substitution-prev').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description');
 assert.equal(await page.locator('#substitution-prev').isDisabled(),true);
 assert.equal(await page.locator('#substitution-check').isDisabled(),true);
 // Explanation errors identify the relevant answer group and clear on edits.
 await exercise('protocol-repair');await page.locator('#repair-form button[type="submit"]').click();
 assert.equal(await page.locator('#repair-choices').getAttribute('aria-invalid'),'true','Missing patch feedback must identify the choice group');
 assert.equal(await page.locator('#repair-choices').getAttribute('aria-describedby'),'repair-feedback');
 assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('data-repair-control')),'kem');
 await page.check('[data-repair-control="kem"]');assert.equal(await page.locator('#repair-choices').getAttribute('aria-invalid'),null);
 await page.locator('#repair-form button[type="submit"]').click();assert.equal(await page.locator('#repair-choices').getAttribute('aria-invalid'),'true');
 await page.uncheck('[data-repair-control="kem"]');await page.check('[data-repair-control="identity"]');await page.check('[data-repair-control="keysize"]');
 await page.locator('#repair-form button[type="submit"]').click();assert.equal(await page.locator('#repair-choices').getAttribute('aria-invalid'),'true','An extra protection is not the accepted minimal patch');
 await page.uncheck('[data-repair-control="keysize"]');await page.locator('#repair-form button[type="submit"]').click();assert.equal(await page.locator('#repair-choices').getAttribute('aria-describedby'),null);
 await page.locator('#repair-next').click();assert.equal(await page.locator('#repair-choices').getAttribute('aria-invalid'),null);
 await exercise('double-encapsulation');
 for(const actor of ['alice','eve']){await page.locator(`#double-encaps-${actor}`).click();await page.locator('#double-decaps').click();}
 await page.locator('#double-check').click();assert.equal(await page.locator('#double-answers').getAttribute('aria-invalid'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'double-answer');
 await page.check('#double-answers input[value="shared"]');assert.equal(await page.locator('#double-answers').getAttribute('aria-invalid'),null);
 await page.locator('#double-check').click();assert.equal(await page.locator('#double-answers').getAttribute('aria-describedby'),'double-feedback');
 await page.check('#double-answers input[value="separate"]');await page.locator('#double-check').click();assert.equal(await page.locator('#double-answers').getAttribute('aria-invalid'),null);
 await page.locator('#double-encaps-alice').click();assert.equal(await page.locator('#double-answers').getAttribute('aria-describedby'),null);assert.equal(await page.locator('#double-check').isDisabled(),true);
 await exercise('key-substitution-story');for(let n=0;n<4;n++)await page.locator('#substitution-next').click();
 await page.locator('#substitution-check').click();assert.equal(await page.locator('#substitution-answers').getAttribute('aria-invalid'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'substitution-answer');
 await page.check('#substitution-answers input[value="alice-bob"]');await page.locator('#substitution-check').click();assert.equal(await page.locator('#substitution-answers').getAttribute('aria-describedby'),'substitution-feedback');
 await page.check('#substitution-answers input[value="alice-eve"]');assert.equal(await page.locator('#substitution-feedback').getAttribute('class'),'');
 await page.locator('#substitution-check').click();assert.equal(await page.locator('#substitution-answers').getAttribute('aria-invalid'),null);
 await page.locator('#substitution-prev').click();assert.equal(await page.locator('#substitution-answers').getAttribute('aria-describedby'),null);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await exercise('protocol-repair');await page.locator('#repair-reset').click();await page.locator('#repair-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Repair overflow at ${width}`);
  assert.equal(await page.locator('#repair-feedback').isVisible(),true);
  if(process.env.EVIDENCE_DIR&&[320,1440].includes(width)){await page.locator('#repair-form').scrollIntoViewIfNeeded();await page.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`lab-validation-${width}.png`)});}
 }
 assert.deepEqual(errors,[]);console.log('PASS: key-substitution stage/button focus; first/last navigation endpoints; unchanged explanation gates; associated missing/wrong/extra answer errors and cleanup in three labs; four widths; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

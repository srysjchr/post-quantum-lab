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
 // Slow local crypto must return focus to its action unless the learner moved.
 await exercise('attack-playground');await page.selectOption('#attack-mode','tamper');
 await page.evaluate(()=>{const generate=crypto.subtle.generateKey.bind(crypto.subtle);crypto.subtle.generateKey=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,300));return generate(...args);};});
 await page.locator('#attack-prepare').press('Enter');await page.waitForFunction(()=>document.getElementById('attack-result').textContent.startsWith('Fresh packet'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'attack-prepare','Delayed preparation must restore keyboard focus');
 await page.evaluate(()=>{const decrypt=crypto.subtle.decrypt.bind(crypto.subtle);crypto.subtle.decrypt=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,300));return decrypt(...args);};});
 await page.locator('#attack-run').press('Space');await page.waitForFunction(()=>document.getElementById('attack-result').textContent.startsWith('REJECTED'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'attack-run');
 await page.locator('#attack-prepare').press('Enter');await page.locator('#attack-reset').focus();
 await page.waitForFunction(()=>document.getElementById('attack-result').textContent.startsWith('Fresh packet'));assert.equal(await page.evaluate(()=>document.activeElement.id),'attack-reset','Completion must respect an intentional focus move');
 await page.locator('#attack-prepare').press('Enter');await page.locator('#attack-reset').press('Enter');await page.waitForTimeout(400);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'attack-reset');assert.equal(await page.locator('#attack-run').isDisabled(),true);
 assert.match(await page.locator('#attack-result').innerText(),/Prepare a fresh/);
 await page.locator('#attack-prepare').press('Enter');await exercise('scenario-lab');
 await page.waitForFunction(()=>document.getElementById('attack-result').textContent.startsWith('Fresh packet'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-lab');assert.equal(await page.locator('[data-exercise-panel="attack-playground"]').getAttribute('open'),null);
 await exercise('attack-playground');await page.evaluate(()=>{crypto.subtle.generateKey=async()=>{await new Promise(resolve=>setTimeout(resolve,300));throw new Error('Deliberate crypto failure');};});
 await page.locator('#attack-prepare').press('Enter');await page.waitForFunction(()=>document.getElementById('attack-result').textContent.startsWith('Unable to run'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'attack-prepare');assert.equal(await page.locator('#attack-prepare').isEnabled(),true);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await exercise('protocol-repair');await page.locator('#repair-reset').click();await page.locator('#repair-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Repair overflow at ${width}`);
  assert.equal(await page.locator('#repair-feedback').isVisible(),true);
  if(process.env.EVIDENCE_DIR&&[320,1440].includes(width)){await page.locator('#repair-form').scrollIntoViewIfNeeded();await page.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`lab-validation-${width}.png`)});}
 }
 assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false,'Interface stays English');
 assert.deepEqual(errors,[]);console.log('PASS: key-substitution stage/button focus; first/last navigation endpoints; unchanged explanation gates; associated missing/wrong/extra answer errors and cleanup in three labs; delayed real-crypto action focus; no focus theft after reset/navigation/error; four widths; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:8766/')+'?chapter=4#message-journey');await page.waitForSelector('#authenticate');
 await page.locator('#authenticate').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'authenticate','Rerendering a journey action must retain keyboard focus');
 await page.locator('#journey-forward').press('Enter');await page.locator('#encapsulate').press('Space');assert.equal(await page.evaluate(()=>document.activeElement.id),'encapsulate');
 await page.locator('#journey-forward').press('Enter');await page.locator('#derive').press('Enter');
 await page.waitForFunction(()=>document.getElementById('journey-status').textContent.includes('Independent HKDF'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'derive','Completing an asynchronous derivation restores its control');
 await page.locator('#journey-forward').press('Enter');await page.fill('#journey-message','Keyboard-delivered message');await page.locator('#journey-encrypt').press('Enter');
 await page.waitForFunction(()=>document.getElementById('journey-status').textContent.includes('Encrypted locally'));assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-encrypt');
 await page.locator('#journey-forward').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-step-title','At the last stage focus must not fall off its disabled Next button');
 await page.locator('#journey-verify').press('Enter');await page.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Verified:'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-verify');
 await page.locator('#journey-tamper').press('Space');assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-tamper');
 await page.locator('#journey-verify').press('Enter');await page.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Rejected:'));assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-verify');
 await page.locator('#journey-tamper').press('Enter');await page.locator('#journey-verify').press('Enter');await page.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Verified:'));
 assert.match(await page.locator('#journey-payload').innerText(),/Keyboard-delivered message/);
 // Delayed crypto must not reclaim focus after an intentional move elsewhere.
 await page.locator('[data-stage="2"]').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.stage),'2');
 await page.evaluate(()=>{const derive=crypto.subtle.deriveKey.bind(crypto.subtle);crypto.subtle.deriveKey=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,400));return derive(...args);};});
 await page.locator('#derive').press('Enter');await page.locator('#journey-reset').focus();
 await page.waitForFunction(()=>document.getElementById('journey-status').textContent.includes('Independent HKDF'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-reset','Async completion must respect intentional external focus');
 await page.locator('#derive').press('Enter');await page.locator('#exercise-picker').focus();
 await page.waitForFunction(()=>document.getElementById('journey-status').textContent.includes('Independent HKDF'));
 assert.equal(await page.evaluate(()=>document.activeElement.id),'exercise-picker','Crypto must not steal focus from the exercise menu');
 await page.locator('#derive').press('Enter');await page.locator('#journey-reset').press('Enter');await page.waitForTimeout(550);
 assert.equal(await page.locator('#journey-step-title').innerText(),'Authenticate');assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-reset');
 assert.doesNotMatch(await page.locator('#journey-status').innerText(),/Independent HKDF/,'A reset must invalidate the old operation and its focus request');
 await page.locator('#substituted-key').press('Space');assert.equal(await page.evaluate(()=>document.activeElement.id),'substituted-key');
 await page.locator('#authenticate').press('Enter');assert.match(await page.locator('#journey-status').innerText(),/Blocked/);assert.equal(await page.evaluate(()=>document.activeElement.id),'authenticate');
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.locator('#journey-reset').click();
  if(await page.locator('#substituted-key').isChecked())await page.locator('#substituted-key').uncheck();
  await page.locator('#authenticate').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'authenticate');
  await page.locator('#journey-forward').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'journey-step-title');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Journey overflow at ${width}`);
  if(process.env.EVIDENCE_DIR&&[320,1440].includes(width)){await page.locator('#journey-step-title').scrollIntoViewIfNeeded();await page.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`journey-keyboard-${width}.png`)});}
 }
 assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
 assert.deepEqual(errors,[]);console.log('PASS: keyboard journey actions and stage endpoints; real HKDF/AES verification/tamper/restore; retained dynamic control focus; no async focus theft; blocked identity path.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

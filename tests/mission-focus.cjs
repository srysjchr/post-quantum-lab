const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  await page.addInitScript(()=>{
   const decrypt=crypto.subtle.decrypt.bind(crypto.subtle);
   crypto.subtle.decrypt=async(...args)=>{if(window.holdDecrypt)await new Promise(resolve=>window.releaseDecrypt=resolve);return decrypt(...args);};
  });
  const root=process.env.TEST_URL||'http://127.0.0.1:8767/';
  await page.goto(root+'?chapter=4#guided-missions');
  await page.waitForSelector('#mission-options input');
  assert.match(await page.title(),/Post.*Quantum/);
  const open=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
  const waitResult=word=>page.waitForFunction(word=>document.getElementById('attack-result').textContent.includes(word),word);
  const startHeldReplay=async guard=>{
   await open('attack-playground');await page.locator('#replay-policy').setChecked(guard);
   await page.evaluate(()=>{window.holdDecrypt=true;window.releaseDecrypt=null;});
   await page.locator('#attack-run').press('Enter');await page.waitForFunction(()=>typeof window.releaseDecrypt==='function');
  };
  const finishReplay=async guard=>{
   await page.evaluate(()=>{window.holdDecrypt=false;window.releaseDecrypt();});
   await waitResult(guard?'DUPLICATE REJECTED':'REPLAY ACCEPTED');
  };
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});await open('guided-missions');await page.selectOption('#mission-select','2');
   await open('attack-playground');await page.selectOption('#attack-mode','replay');await page.locator('#attack-prepare').click();await waitResult('Fresh packet');
   await startHeldReplay(false);await open('guided-missions');
   await page.locator('#mission-options input[value="1"]').press('Space');
   await finishReplay(false);
   assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#mission-options input[value="1"]')),true,`Evidence update must retain the focused answer at ${width}`);
   assert.equal(await page.locator('#mission-options input[value="1"]').isChecked(),true);
   assert.equal(await page.locator('#mission-checklist .correct').count(),1);
   await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#mission-options input[value="0"]').isChecked(),true,'Arrow navigation must continue in the answer group');
   await page.locator('#mission-form button').press('Enter');assert.match(await page.locator('#mission-feedback').innerText(),/Complete both/);
   await startHeldReplay(true);await open('guided-missions');await page.locator('#mission-options input[value="0"]').focus();
   await finishReplay(true);
   assert.equal(await page.evaluate(()=>document.activeElement===document.querySelector('#mission-options input[value="0"]')),true);
   assert.equal(await page.locator('#mission-options input[value="0"]').isChecked(),true);
   assert.equal(await page.locator('#mission-feedback').innerText(),'');assert.equal(await page.locator('#mission-checklist .correct').count(),2);
   await page.locator('#mission-form button').press('Enter');assert.match(await page.locator('#mission-counter').innerText(),/COMPLETE/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   if(process.env.EVIDENCE_DIR&&[320,1440].includes(width)){await page.locator('#mission-form').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,`mission-focus-${width}.png`)});}
  }
  // Completion must not pull focus into a hidden mission or reopen it.
  await startHeldReplay(true);await open('scenario-lab');await finishReplay(true);
  assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-lab');
  assert.equal(await page.locator('[data-exercise-panel="guided-missions"]').getAttribute('open'),null);
  await open('guided-missions');await page.selectOption('#mission-select','1');assert.equal(await page.locator('#mission-options input:checked').count(),0);
  await page.locator('#mission-form button').click();assert.match(await page.locator('#mission-feedback').innerText(),/Complete both/);
  await page.locator('#mission-restart').click();assert.equal(await page.locator('#mission-checklist .correct').count(),0);assert.equal(await page.locator('#mission-options input:checked').count(),0);
  assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
  assert.deepEqual(errors,[]);console.log('PASS: real delayed replay evidence retains focused/selected mission answers; continued arrow navigation; evidence gates and completion; no hidden-panel focus theft; mission switch/restart; 320/390/768/1440; English; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

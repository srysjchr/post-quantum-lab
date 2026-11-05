const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');
  const quizNext=page.locator('#quiz-next-step');
  assert.equal(await quizNext.isVisible(),false,'No next action before the quiz.');
  const correct=await page.evaluate(()=>LESSONS[0].correct),wrong=(correct+1)%3;
  await page.check('#answers input[value="'+wrong+'"]');await page.locator('#quiz button[type="submit"]').click();
  assert.match(await page.locator('#feedback').innerText(),/^Not quite/);
  assert.equal(await quizNext.isVisible(),false,'Wrong answers must not expose a continue action.');
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('post-quantum-lab.progress.v1')||'{}').completed?.includes('chapter-0')===true),false);
  await page.check('#answers input[value="'+correct+'"]');await page.locator('#quiz button[type="submit"]').click();
  assert.equal(await quizNext.isVisible(),true);assert.match(await quizNext.innerText(),/Continue to Chapter 2: Quantum threat/);
  assert.equal(await page.locator('[data-exercise-panel][open]').count(),0,'A correct answer must offer a choice, not navigate automatically.');
  assert.equal(await page.locator('[data-chapter="0"]').getAttribute('aria-pressed'),'true');
  await quizNext.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-chapter="1"]')?.getAttribute('aria-pressed')==='true');
  for(let index=1;index<6;index++){
   const answer=await page.evaluate(index=>LESSONS[index].correct,index);
   await page.check('#answers input[value="'+answer+'"]');await page.locator('#quiz button[type="submit"]').click();
   assert.equal(await quizNext.isVisible(),true);
   assert.equal(await page.locator('[data-chapter="'+index+'"]').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('[data-exercise-panel][open]').count(),0,'Quiz success must not navigate without a choice.');
   if(index<5){
    assert.match(await quizNext.innerText(),new RegExp('Continue to Chapter '+(index+2)+':'));
    await quizNext.focus();await page.keyboard.press('Enter');
    await page.waitForFunction(expected=>document.querySelector('[data-chapter="'+expected+'"]')?.getAttribute('aria-pressed')==='true',index+1);
   }else assert.match(await quizNext.innerText(),/Continue to Scenario 1/);
  }
  await quizNext.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="scenario-lab"]')?.open);
  assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-lab');
  assert.equal(await page.locator('[data-exercise-panel="scenario-lab"] [data-learning-next]').count(),0,'No exercise CTA before an exercise completion.');
  await page.check('#scenario-options input[value="0"]');await page.locator('#scenario-form button[type="submit"]').click();
  const exerciseNext=page.locator('[data-exercise-panel="scenario-lab"] [data-learning-next]');
  await exerciseNext.waitFor({state:'visible'});
  assert.match(await exerciseNext.innerText(),/Continue to Scenario 2/);
  await exerciseNext.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.getElementById('scenario-count').textContent.includes('SCENARIO 2 / 3'));
  assert.equal(await page.locator('#scenario-options input:checked').count(),0,'The next scenario starts without carrying over a previous answer.');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-lab');
  const completed=await page.evaluate(()=>JSON.parse(localStorage.getItem('post-quantum-lab.progress.v1')).completed);
  assert.deepEqual(completed,['chapter-0','chapter-1','chapter-2','chapter-3','chapter-4','chapter-5','scenario-0']);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page overflow at '+width+'px');
   await exerciseNext.scrollIntoViewIfNeeded();const box=await exerciseNext.boundingBox();
   assert.ok(box&&box.height>=44,'Exercise continue action must remain a comfortable touch target at '+width+'px');
   if(process.env.EVIDENCE_DIR&&[320,1440].includes(width))await page.locator('[data-exercise-panel="scenario-lab"] .exercise-footer').screenshot({path:path.join(process.env.EVIDENCE_DIR,'next-action-'+width+'.png')});
  }
  await page.locator('#learning-clear').click();assert.equal(await exerciseNext.count(),0,'Clearing saved progress removes stale continuation actions.');
  const clearPage=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await clearPage.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');const firstCorrect=await clearPage.evaluate(()=>LESSONS[0].correct);await clearPage.check('#answers input[value="'+firstCorrect+'"]');await clearPage.locator('#quiz button[type="submit"]').click();assert.equal(await clearPage.locator('#quiz-next-step').isVisible(),true);await clearPage.locator('#learning-clear').click();assert.equal(await clearPage.locator('#quiz-next-step').isVisible(),false,'Clearing progress hides the quiz continuation action.');await clearPage.close();
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
  console.log('PASS: correct-only quiz CTA; no automatic navigation; keyboard continuation; completed exercise CTA; accurate next scenario; four responsive widths; English; no runtime/request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

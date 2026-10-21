const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 await page.goto(root+'?chapter=2');await page.waitForSelector('[data-algorithm="grover"]');
 await page.locator('[data-algorithm="grover"]').click();
 await exercise('attack-playground');await page.selectOption('#attack-mode','replay');
 assert.match(await page.locator('#attack-description').innerText(),/freshness policy/,'Attack description must update independently of the quantum chapter');
 assert.match(await page.locator('#quantum-description').innerText(),/square-root query reduction/,'Quantum description must keep the selected algorithm');
 for(let chapter=0;chapter<6;chapter++){
  await page.locator(`[data-chapter="${chapter}"]`).click();
  assert.deepEqual(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return [...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];}),[],`Unique document IDs in chapter ${chapter+1}`);
 }
 // Activating a projected token with a keyboard must not drop focus to the body.
 await exercise('build-the-wire');await page.locator('#wire-reset').click();
 await page.locator('[data-wire-token="ek"]').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect','Keyboard token transmission hands focus to inspection');
 assert.equal(await page.locator('#wire-transcript li').count(),1);
 await page.locator('[data-wire-token="c"]').press('Space');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 await page.locator('#wire-reset').click();await page.locator('[data-wire-token="ek"]').click();
 assert.notEqual(await page.evaluate(()=>document.activeElement.id),'wire-inspect','Pointer token transmission does not force inspection focus');
 assert.equal(await page.locator('#wire-transcript li').count(),1);
 // Rebuilding or leaving the scene releases any in-progress pointer capture.
 await page.locator('#wire-reset').click();
 const startDrag=async()=>{
  const token=page.locator('[data-wire-token="c"]');await token.scrollIntoViewIfNeeded();
  await token.evaluate(e=>e.addEventListener('pointerdown',event=>window.testPointer=event.pointerId,{once:true}));
  const rect=await token.boundingBox();await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await page.mouse.down();await page.mouse.move(rect.x+rect.width/2+20,rect.y+rect.height/2+15);
  assert.equal(await token.evaluate(e=>e.hasPointerCapture(window.testPointer)),true);return token;
 };
 let dragged=await startDrag();await page.locator('#wire-perspectives [data-wire-observer="eve"]').press('Enter');
 assert.equal(await dragged.evaluate(e=>e.hasPointerCapture(window.testPointer)),false,'Observer changes must release pointer capture');
 await page.mouse.up();assert.equal(await page.locator('#wire-transcript li').count(),0);
 dragged=await startDrag();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));
 assert.equal(await dragged.evaluate(e=>e.hasPointerCapture(window.testPointer)),false,'Page hiding must release pointer capture');
 await page.mouse.up();await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow')));
 assert.equal(await page.locator('#wire-scene').evaluate(e=>e.classList.contains('dragging')),false);
 assert.equal(await page.locator('#wire-transcript li').count(),0);
 // Guided predictions move keyboard focus through the question and result.
 await exercise('kem-prediction');await page.locator('#prediction-start').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'kem-prediction','Starting predictions focuses an answer');
 for(let checkpoint=0;checkpoint<3;checkpoint++){
  await page.locator('#prediction-answers input[value="0"]').check();await page.locator('#prediction-reveal').press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'prediction-feedback','Revealing focuses its explanation');
  assert.match(await page.locator('#prediction-feedback').innerText(),/Correct prediction/);
  if(checkpoint<2){await page.locator('#prediction-next').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.name),'kem-prediction');}
 }
 assert.equal(await page.locator('#prediction-next').isVisible(),false);
 // Main-scene context loss must also expose unavailable controls accurately.
 await page.goto(root);await page.waitForSelector('#scene canvas');await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('#pause').click();assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
 await page.evaluate(()=>{window.mainLoss=document.querySelector('#scene canvas').getContext('webgl2').getExtension('WEBGL_lose_context');window.mainLoss.loseContext();});
 await page.waitForSelector('#fallback:not([hidden])');
 assert.equal(await page.locator('#reset').isDisabled(),true,'Interrupted main camera reset must be disabled');
 assert.equal(await page.locator('#pause').isDisabled(),true);assert.equal(await page.locator('#scene').getAttribute('aria-keyshortcuts'),null);
 assert.match(await page.locator('#scene-motion-note').innerText(),/interrupted/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.emulateMedia({reducedMotion:'no-preference'});
 assert.equal(await page.locator('#pause').isDisabled(),true);
 await page.locator('[data-chapter="3"]').click();assert.equal(await page.locator('[data-phase="1"]').isEnabled(),true);
 await page.evaluate(()=>window.mainLoss.restoreContext());await page.waitForSelector('#fallback[hidden]',{state:'attached'});
 assert.equal(await page.locator('#reset').isEnabled(),true);assert.equal(await page.locator('#pause').isEnabled(),true);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true','Restoration retains manual pause preference');
 assert.match(await page.locator('#scene').getAttribute('aria-keyshortcuts'),/ArrowLeft/);
 assert.deepEqual(errors,[]);
 console.log('PASS: independent quantum/attack descriptions; unique document IDs across six chapters; no runtime or HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

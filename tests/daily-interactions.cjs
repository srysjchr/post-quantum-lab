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
 // Sequential navigation announces the new lesson/case instead of losing focus at an endpoint.
 await page.goto(root+'?chapter=5');await page.waitForSelector('#next');await page.locator('#next').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'lesson-title','Next chapter focuses its new heading');
 assert.equal(await page.locator('#next').isDisabled(),true);await page.locator('#previous').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'lesson-title');
 await exercise('scenario-lab');await page.locator('#scenario-reset').click();
 for(let index=1;index<3;index++){await page.locator('#scenario-next').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-title');}
 assert.equal(await page.locator('#scenario-next').isDisabled(),true);await page.locator('#scenario-prev').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-title');
 await exercise('protocol-repair');await page.locator('#repair-reset').click();
 for(let index=1;index<4;index++){await page.locator('#repair-next').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'repair-title');}
 assert.equal(await page.locator('#repair-next').isDisabled(),true);await page.locator('#repair-prev').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'repair-title');
 // Missing/wrong radio answers describe the feedback at the answer group.
 await page.goto(root);await page.waitForSelector('#answers input');await page.locator('#quiz button[type="submit"]').click();
 assert.equal(await page.locator('#answers').getAttribute('aria-invalid'),'true','Quiz errors identify the answer group');
 assert.equal(await page.locator('#answers').getAttribute('aria-describedby'),'feedback');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'answer');
 await page.locator('#answers input[value="0"]').check();assert.equal(await page.locator('#answers').getAttribute('aria-invalid'),null);
 await page.locator('[data-chapter="1"]').click();assert.equal(await page.locator('#answers').getAttribute('aria-describedby'),null);
 await exercise('scenario-lab');await page.locator('#scenario-reset').click();await page.locator('#scenario-form button').click();
 assert.equal(await page.locator('#scenario-options').getAttribute('aria-invalid'),'true');
 assert.equal(await page.locator('#scenario-options').getAttribute('aria-describedby'),'scenario-feedback');
 assert.equal(await page.evaluate(()=>document.activeElement.name),'scenario-answer');
 await page.locator('#scenario-options input[value="1"]').check();assert.equal(await page.locator('#scenario-options').getAttribute('aria-invalid'),null);
 await page.locator('#scenario-form button').click();assert.equal(await page.locator('#scenario-options').getAttribute('aria-invalid'),'true');
 await page.locator('#scenario-options input[value="0"]').check();assert.equal(await page.locator('#scenario-feedback').getAttribute('class'),'');
 await page.locator('#scenario-form button').click();assert.equal(await page.locator('#scenario-options').getAttribute('aria-describedby'),null);
 await page.locator('#scenario-next').click();assert.equal(await page.locator('#scenario-options').getAttribute('aria-invalid'),null);
 // Opening a reflection in a new tab must not reset a pending explanation here.
 await exercise('teach-it-back');await page.selectOption('#teach-topic','0');await page.selectOption('#teach-field-0','pair');
 await exercise('build-the-wire');await page.locator('#wire-reset').click();
 for(const id of ['dk','c'])await page.check(`[data-wire-object="${id}"]`);await page.locator('#wire-send').click();
 const popupPromise=page.context().waitForEvent('page');await page.locator('#wire-reflect').click({modifiers:['Control']});const popup=await popupPromise;
 await popup.waitForLoadState('domcontentloaded');assert.equal(new URL(popup.url()).hash,'#teach-it-back');await popup.close();
 assert.equal(await page.inputValue('#teach-topic'),'0','Ctrl-click must not change the source explanation topic');
 assert.equal(await page.inputValue('#teach-field-0'),'pair','Ctrl-click must preserve pending source claims');
 assert.equal(new URL(page.url()).hash,'#build-the-wire');
 await page.locator('#wire-reflect').click();assert.equal(await page.inputValue('#teach-topic'),'1');assert.equal(new URL(page.url()).hash,'#teach-it-back');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 // Changed surfaces remain usable without horizontal overflow at narrow widths.
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:950});await page.emulateMedia({reducedMotion:'reduce'});
  await exercise('build-the-wire');await page.locator('#wire-reset').click();await page.locator('#wire-perspectives [data-wire-observer="eve"]').click();
  await page.locator('#wire-scene').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Wire overflow at ${width}`);
  if(process.env.EVIDENCE_DIR&&[320,1440].includes(width))await page.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`daily-interactions-wire-${width}.png`)});
  await page.locator('[data-wire-token="ek"]').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');
  await exercise('scenario-lab');await page.locator('#scenario-reset').click();await page.locator('#scenario-form button').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Scenario overflow at ${width}`);
  if(process.env.EVIDENCE_DIR&&[320,1440].includes(width))await page.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`daily-interactions-error-${width}.png`)});
  await exercise('kem-prediction');await page.locator('#prediction-start').press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.name),'kem-prediction');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Prediction overflow at ${width}`);
  assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false,'UI stays English');
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: independent descriptions and unique IDs; keyboard token/prediction/navigation focus; interrupted drag release without sends; real main WebGL loss/restoration; accessible answer validation; modified reflection links; 320/390/768/1440 layouts; English; no runtime or HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

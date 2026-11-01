const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {act}=require('./navigation-helper.cjs');
const assert=require('node:assert/strict');
const root=process.env.TEST_URL||'http://127.0.0.1:8771/';
async function journey(p){
 const click=s=>act(p,s,'click'),wait=text=>p.waitForFunction(text=>document.getElementById('journey-status').textContent.includes(text),text);
 await click('#journey-reset');await click('#authenticate');await click('#journey-forward');await click('#encapsulate');await click('#journey-forward');await click('#derive');await wait('completed');await click('#journey-forward');await click('#journey-encrypt');await wait('Encrypted');await click('#journey-forward');await click('#journey-verify');await wait('Verified');
}
const cases={
 async 'mission-answer-state'(context,p){
  await p.goto(root+'?chapter=4');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});await journey(p);
   await act(p,'#mission-options input[value="0"]','check');await act(p,'#mission-form button','click');assert.match(await p.locator('#mission-counter').innerText(),/COMPLETE/);
   await p.check('#mission-options input[value="1"]');assert.match(await p.locator('#mission-counter').innerText(),/IN PROGRESS/,'Changing the explanation must invalidate current-run completion');
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('post-quantum-lab.progress.v1')).completed.includes('mission-0')),true,'Saved completion history is retained');
   await p.check('#mission-options input[value="0"]');await p.locator('#mission-form button').click();assert.match(await p.locator('#mission-counter').innerText(),/COMPLETE/);
  }
 },
 async 'teach-error-focus'(context,p){
  await p.goto(root+'?chapter=4#build-the-wire');await p.waitForSelector('#wire-send');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});await act(p,'#wire-reset','click');for(const id of ['ek','c'])await p.check(`[data-wire-object="${id}"]`);await p.locator('#wire-send').click();
   await act(p,'#teach-topic','selectOption','0');for(const [i,value]of ['dk','c','private-ek'].entries())await p.selectOption(`#teach-field-${i}`,value);
   await p.locator('#teach-form button').press('Enter');assert.equal(await p.evaluate(()=>document.activeElement.id),'teach-field-0','Incorrect claims must focus the first field needing revision');
   assert.equal(await p.locator('#teach-field-0').getAttribute('aria-invalid'),'true');
   for(const [i,value]of ['pair','secret','resistance'].entries())await p.selectOption(`#teach-field-${i}`,value);await p.locator('#teach-form button').click();assert.equal(await p.locator('#teach-sentence').isVisible(),true);
  }
 },
 async 'check-reset-focus'(context,p){
  await p.goto(root+'?chapter=4#learning-check');await p.waitForSelector('#assessment-answer-0');
  const other=await context.newPage();await other.goto(root+'?chapter=4#learning-check');await other.waitForSelector('#assessment-reset');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});await p.selectOption('#assessment-answer-2','correct');await p.locator('#assessment-answer-2').focus();
   await other.evaluate(()=>localStorage.setItem('post-quantum-lab.check.v1',JSON.stringify({version:1,before:[true,true,true,true,true,true],after:null})));
   await p.waitForFunction(()=>document.getElementById('assessment-summary').textContent.includes('Before: 6'));
   await other.locator('#assessment-reset').click();await p.waitForFunction(()=>document.getElementById('assessment-summary').textContent.includes('No baseline'));
   assert.equal(await p.evaluate(()=>document.activeElement.id),'assessment-answer-2','A reset from another tab must not discard keyboard focus');
   assert.equal(await p.inputValue('#assessment-answer-2'),'');
  }
 },
 async 'invalid-history-sync'(context,p){
  await p.goto(root+'?chapter=4#independent-missions');await p.waitForSelector('#ind-level');
  const other=await context.newPage();await other.goto(root);await other.waitForSelector('#answers input');
  for(const width of [1440,390])for(const raw of ['{broken',JSON.stringify({version:2,completed:['independent-0','independent-1']}),'']){
   await p.setViewportSize({width,height:950});await other.evaluate(()=>localStorage.setItem('post-quantum-lab.progress.v1',JSON.stringify({version:1,completed:['independent-0','independent-1'],last:{chapter:3,section:'independent-missions'}})));
   await p.waitForFunction(()=>!document.querySelector('#ind-level option[value="2"]').disabled);await p.selectOption('#ind-level','2');
   await other.evaluate(raw=>localStorage.setItem('post-quantum-lab.progress.v1',raw),raw);
   await p.waitForFunction(()=>document.getElementById('learning-summary').textContent.includes('0 / 29'));
   assert.equal(await p.locator('#ind-level option[value="2"]').isDisabled(),true,'Invalid cross-tab progress must revoke old mission unlocks');
   assert.equal(await p.inputValue('#ind-level'),'0');assert.match(await p.locator('#ind-current').innerText(),/not complete/);
  }
 },
 async 'modified-scene-shortcuts'(context,p){
  await p.goto(root+'?chapter=4#build-the-wire');await p.waitForSelector('#wire-scene canvas');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});
   for(const id of ['scene','wire-scene']){
    const outcomes=await p.locator('#'+id).evaluate(el=>{const result=[];for(const modifier of ['ctrlKey','altKey','metaKey'])for(const key of ['Home','ArrowLeft']){const e=new KeyboardEvent('keydown',{key,[modifier]:true,bubbles:true,cancelable:true});el.dispatchEvent(e);result.push(e.defaultPrevented);}const plain=new KeyboardEvent('keydown',{key:'Home',bubbles:true,cancelable:true});el.dispatchEvent(plain);return {modified:result,plain:plain.defaultPrevented};});
    assert.deepEqual(outcomes.modified,[false,false,false,false,false,false],id+' must leave browser/assistive modified shortcuts available');assert.equal(outcomes.plain,true,'Unmodified Home still resets the model');
   }
  }
 },
 async 'same-chapter-draft'(context,p){
  await p.goto(root+'?chapter=1');await p.waitForSelector('#rsa-product');
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});await p.locator('[data-chapter="0"]').click();await p.check('#answers input[value="1"]');await p.selectOption('#rsa-product','899');
   await p.locator('[data-chapter="0"]').click();assert.equal(await p.locator('#answers input[value="1"]').isChecked(),true,'Reopening the current chapter must retain a pending quiz');assert.equal(await p.inputValue('#rsa-product'),'899');
   await p.locator('[data-chapter="4"]').click();await p.fill('#message','Retain this in-page draft');await p.locator('[data-chapter="4"]').click();assert.equal(await p.inputValue('#message'),'Retain this in-page draft');
   await p.locator('[data-chapter="0"]').click();assert.equal(await p.locator('#rsa-product').isVisible(),true);
  }
 }
};
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let failed=0;
try{for(const [name,test]of Object.entries(cases)){if(process.env.PQLAB_CASE&&process.env.PQLAB_CASE!==name)continue;const c=await b.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));try{await test(c,p);assert.match(await p.title(),/Post \/ Quantum/);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await c.close();}}}finally{await b.close();}if(failed)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
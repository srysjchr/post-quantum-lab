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
 },
 async 'same-check-milestone'(context,p){
  await p.goto(root+'?chapter=4#learning-check');await p.waitForSelector('#assessment-answer-0');
  await p.locator('#learning-progress details>summary').click();
  for(const width of [1440,390]){
   await p.setViewportSize({width,height:950});await p.selectOption('#assessment-answer-0','correct');
   await p.locator('[data-progress-id="check-before"]').click();assert.equal(await p.inputValue('#assessment-answer-0'),'correct','Opening the active learning-check milestone must keep unsent answers');
  }
  for(let i=0;i<6;i++)await p.selectOption('#assessment-answer-'+i,'correct');await p.locator('#assessment-submit').click();
  await p.locator('[data-progress-id="check-after"]').click();assert.equal(await p.inputValue('#assessment-phase'),'after');assert.equal(await p.inputValue('#assessment-answer-0'),'');
  await p.selectOption('#assessment-answer-0','wrong-a');await p.locator('[data-progress-id="check-after"]').click();assert.equal(await p.inputValue('#assessment-answer-0'),'wrong-a');
 },
 async 'duplicate-evidence-feedback'(context,p){
  await p.goto(root+'?chapter=4');await journey(p);
  await act(p,'#mission-options input[value="1"]','check');await p.locator('#mission-form button').click();assert.match(await p.locator('#mission-feedback').innerText(),/Not quite/);
  await act(p,'#journey-verify','click');await p.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Verified:'));
  await act(p,'#mission-form button','focus');const guidedErrorRetained=(await p.locator('#mission-feedback').innerText()).includes('Not quite');
  await p.getByRole('link',{name:'Try an independent mission →',exact:true}).click();await act(p,'#ind-operation','selectOption','bind');await p.locator('#ind-add').click();for(const op of ['encaps','send','decaps','derive','encrypt','verify','fresh']){await p.selectOption('#ind-operation',op);await p.locator('#ind-add').click();}await p.locator('#ind-check-plan').click();
  await act(p,'#journey-verify','click');await p.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Verified:'));await act(p,'#ind-form button','click');assert.equal(await p.locator('#ind-claims [aria-invalid="true"]').count(),3);
  await act(p,'#journey-verify','click');await p.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Verified:'));await act(p,'#ind-form button','focus');assert.deepEqual({guided:guidedErrorRetained,independent:await p.locator('#ind-claims [aria-invalid="true"]').count()},{guided:true,independent:3},'Duplicate evidence must retain feedback in both mission forms');
 },
 async 'kem-rejection-note'(context,p){
  await p.goto(root+'?chapter=4');await p.waitForSelector('#kem-boundaries');
  const summary=p.getByText('Does ML-KEM reject a changed ciphertext like AES-GCM?',{exact:true});assert.equal(await summary.count(),1,'Explain the different KEM and AEAD rejection boundaries');const faq=summary.locator('..');
  for(const width of [1440,320]){
   await p.setViewportSize({width,height:950});if(await faq.evaluate(e=>e.open))await summary.click();await summary.focus();await p.keyboard.press('Enter');assert.equal(await faq.locator('p').first().isVisible(),true);
   assert.equal(await faq.locator('a').getAttribute('href'),'https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf#page=42');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   if(process.env.EVIDENCE_DIR){await faq.scrollIntoViewIfNeeded();await p.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`kem-rejection-${width}.png`)});}
  }
 },
 async 'teach-choice-preview'(context,p){
  await p.goto(root+'?chapter=4#teach-it-back');await p.waitForSelector('#teach-field-0');
  for(const width of [1440,320]){
   await p.setViewportSize({width,height:950});await p.selectOption('#teach-topic','1');await p.selectOption('#teach-field-2','decaps');const preview=p.locator('#teach-choice-2');
   assert.equal(await preview.count(),1,'Show the entire selected claim outside the narrow native select');assert.equal(await preview.isVisible(),true);assert.match(await preview.innerText(),/Matching dk allows decapsulation of c/);
   await p.selectOption('#teach-field-1','derived');await p.selectOption('#teach-field-0','private-pair');assert.equal(await p.locator('#teach-choice-0').isVisible(),true);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   if(process.env.EVIDENCE_DIR){await preview.scrollIntoViewIfNeeded();await p.screenshot({path:require('node:path').join(process.env.EVIDENCE_DIR,`teach-preview-${width}.png`)});}
   await p.selectOption('#teach-field-2','');assert.equal(await preview.isVisible(),false);await p.locator('#teach-reset').click();assert.equal(await p.locator('#teach-choice-0').isVisible(),false);
  }
 }
};
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let failed=0;
try{for(const [name,test]of Object.entries(cases)){if(process.env.PQLAB_CASE&&process.env.PQLAB_CASE!==name)continue;const c=await b.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));try{await test(c,p);assert.match(await p.title(),/Post \/ Quantum/);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await c.close();}}}finally{await b.close();}if(failed)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
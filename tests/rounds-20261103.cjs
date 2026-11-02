const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {act}=require('./navigation-helper.cjs');
const assert=require('node:assert/strict');
const root=process.env.TEST_URL||'http://127.0.0.1:8771/';
async function journey(p){
 const click=s=>act(p,s,'click'),wait=text=>p.waitForFunction(text=>document.getElementById('journey-status').textContent.includes(text),text);
 await click('#journey-reset');await click('#authenticate');await click('#journey-forward');await click('#encapsulate');await click('#journey-forward');await click('#derive');await wait('completed');await click('#journey-forward');await click('#journey-encrypt');await wait('Encrypted');await click('#journey-forward');await click('#journey-verify');await wait('Verified');
}
const cases={
 async 'teach-repeat-replay'(context,p){
  await p.goto(root+'?chapter=4#attack-playground');await p.waitForSelector('#attack-mode');await p.selectOption('#attack-mode','replay');await p.locator('#attack-prepare').click();await p.waitForFunction(()=>document.getElementById('attack-result').textContent.includes('Fresh packet'));for(const guard of [false,true]){await p.locator('#replay-policy').setChecked(guard);await p.locator('#attack-run').click();await p.waitForFunction(()=>!document.getElementById('attack-run').disabled);}
  await act(p,'#teach-topic','selectOption','2');for(const [i,v]of ['valid','freshness','history'].entries())await p.selectOption('#teach-field-'+i,v);await p.locator('#teach-form button').click();assert.equal(await p.locator('#teach-sentence').isVisible(),true);
  for(const width of [1440,390]){await p.setViewportSize({width,height:950});await act(p,'#attack-run','click');await p.waitForFunction(()=>!document.getElementById('attack-run').disabled);await act(p,'#teach-form button','focus');assert.equal(await p.locator('#teach-sentence').isVisible(),true,'A repeated replay outcome must preserve its checked explanation');}
 },
 async 'active-independent-milestone'(context,p){
  await p.goto(root+'?chapter=4#independent-missions');await p.waitForSelector('#ind-operation');await p.locator('#learning-progress details>summary').click();
  for(const width of [1440,390]){await p.setViewportSize({width,height:950});await p.selectOption('#ind-operation','bind');await p.locator('#ind-hints>summary').click();await p.waitForFunction(()=>document.getElementById('ind-hints').open);await p.locator('[data-progress-id="independent-0"]').click();assert.equal(await p.inputValue('#ind-operation'),'bind','Reopening the active mission must retain a pending operation');assert.equal(await p.locator('#ind-hints').evaluate(e=>e.open),true);await p.locator('#ind-add').press('Enter');assert.equal(await p.locator('#ind-plan li').count(),1);await p.locator('#ind-reset').click();}
 },
 async 'current-journey-stage'(context,p){
  await p.goto(root+'?chapter=4#message-journey');await p.waitForSelector('#authenticate');
  for(const width of [1440,390]){await p.setViewportSize({width,height:950});await p.locator('#journey-reset').click();await p.locator('#authenticate').click();const status=await p.locator('#journey-status').innerText();await p.locator('#journey-stages [data-stage="0"]').click();assert.equal(await p.locator('#journey-status').innerText(),status,'The current stage button must not erase its operation result');await p.locator('#journey-forward').click();assert.match(await p.locator('#journey-step-title').innerText(),/ML-KEM/);}
 },
 async 'journey-draft-salt'(context,p){
  await p.goto(root+'?chapter=4');await journey(p);await act(p,'#journey-back','click');
  for(const width of [1440,390]){await p.setViewportSize({width,height:950});const salt=await p.locator('#journey-payload code').first().innerText();await p.fill('#journey-message','Revised message '+width);assert.equal(await p.locator('#journey-payload').isVisible(),true,'Editing plaintext must retain the already-shared HKDF salt');assert.equal(await p.locator('#journey-payload code').count(),1,'The obsolete packet must disappear');assert.equal(await p.locator('#journey-payload code').innerText(),salt);assert.equal(await p.locator('#journey-forward').isDisabled(),true);await p.locator('#journey-encrypt').click();await p.waitForFunction(()=>document.getElementById('journey-status').textContent.startsWith('Encrypted'));assert.equal(await p.locator('#journey-payload code').count(),3);}
 }
};
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let failed=0;
try{for(const [name,test]of Object.entries(cases)){if(process.env.PQLAB_CASE&&process.env.PQLAB_CASE!==name)continue;const c=await b.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));try{await test(c,p);assert.match(await p.title(),/Post \/ Quantum/);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await c.close();}}}finally{await b.close();}if(failed)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
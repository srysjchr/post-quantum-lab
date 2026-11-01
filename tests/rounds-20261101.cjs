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
 }
};
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let failed=0;
try{for(const [name,test]of Object.entries(cases)){if(process.env.PQLAB_CASE&&process.env.PQLAB_CASE!==name)continue;const c=await b.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));try{await test(c,p);assert.match(await p.title(),/Post \/ Quantum/);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await c.close();}}}finally{await b.close();}if(failed)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
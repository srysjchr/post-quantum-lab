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
 }
};
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let failed=0;
try{for(const [name,test]of Object.entries(cases)){if(process.env.PQLAB_CASE&&process.env.PQLAB_CASE!==name)continue;const c=await b.newContext({viewport:{width:1440,height:950},reducedMotion:'reduce'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));try{await test(c,p);assert.match(await p.title(),/Post \/ Quantum/);assert.deepEqual(errors,[]);assert.equal(await p.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await c.close();}}}finally{await b.close();}if(failed)process.exitCode=1;})().catch(e=>{console.error(e);process.exitCode=1;});
const {act}=require('./navigation-helper.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const path=require('node:path');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});const url=process.env.TEST_URL||'http://127.0.0.1:8765/';await page.goto(url+'?chapter=4');await page.waitForSelector('#kem-knowledge tbody tr',{state:'attached'});
const cell=(object,role)=>act(page,`#kem-knowledge tr[data-object="${object}"] td[data-role="${role}"]`,'innerText');
for(let phase=0;phase<4;phase++){
 await act(page,`[data-phase="${phase}"]`,'click');assert.equal(await page.locator('#kem-transcript li').count(),phase===0?1:2);
 for(const role of ['alice','bob','eve']){
  await act(page,`[data-observer="${role}"]`,'click');assert.equal(await page.locator('#kem-knowledge .selected-perspective').count(),6);
  for(const r of ['alice','bob','eve'])assert.equal(await cell('ek',r),'Public');
  assert.equal(await cell('dk','alice'),'Hidden');assert.equal(await cell('dk','bob'),'Private');assert.equal(await cell('dk','eve'),'Hidden');
  assert.equal(await cell('c','eve'),phase>=1?'Public':'Not yet');assert.equal(await cell('K','alice'),phase>=1?'Private':'Not yet');assert.equal(await cell('K','bob'),phase>=2?'Private':'Not yet');assert.equal(await cell('K','eve'),phase>=1?'Hidden':'Not yet');assert.equal(await cell('Traffic key','eve'),phase===3?'Hidden':'Not yet');
  const model=await page.locator('#scene').getAttribute('aria-label');if(role==='eve'){assert.doesNotMatch(model,/dk: private|K: private|traffic key: private/);assert.match(model,phase===0?/no c yet/:/ek and c/);}
 }
}
await act(page,'[data-phase="1"]','click');assert.match(await page.locator('#observer-panel article').nth(1).innerText(),/not decapsulated/);
await act(page,'[data-observer="learner"]','click');assert.equal(await page.locator('#kem-knowledge .selected-perspective').count(),0);await act(page,'#kem-eve-view','click');assert.equal(await page.locator('[data-observer="eve"]').getAttribute('aria-pressed'),'true');
await act(page,'[data-threat-mode="active"]','focus');await page.keyboard.press('Enter');assert.match(await act(page,'#kem-threat-description','innerText'),/establish a secret with Eve/);assert.equal(await page.locator('#kem-threat-link').isVisible(),true);await act(page,'[data-threat-mode="passive"]','click');assert.equal(await page.locator('#kem-threat-link').isVisible(),false);
for(const details of await page.locator('.kem-questions details').all()){await details.locator('summary').click();assert.equal(await details.locator('p').isVisible(),true);}
assert.match(await act(page,'.kem-questions','innerText'),/own randomness/);assert.match(await act(page,'.kem-questions','innerText'),/not a human identity/);assert.match(await act(page,'.kem-questions','innerText'),/timing/);
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow ${width}`);}
if(process.env.EVIDENCE_DIR){await page.setViewportSize({width:1440,height:1000});await page.locator('#kem-boundaries').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'kem-desktop.png')});await page.setViewportSize({width:390,height:844});await page.locator('#kem-knowledge').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'kem-mobile.png')});}
await act(page,'[data-chapter="0"]','click');assert.equal(await page.locator('#kem-boundaries').isVisible(),false);await act(page,'[data-chapter="3"]','click');assert.equal(await cell('c','eve'),'Not yet');assert.equal(await page.locator('#kem-transcript li').count(),1);assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);assert.deepEqual(errors,[]);
const fallback=await browser.newPage();await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});await fallback.goto(url+'?chapter=4');await fallback.waitForSelector('#kem-knowledge tbody tr',{state:'attached'});await act(fallback,'#kem-eve-view','click');await act(fallback,'[data-phase="2"]','click');assert.equal(await act(fallback,'#kem-knowledge tr[data-object="K"] td[data-role="bob"]','innerText'),'Private');assert.match(await act(fallback,'#fallback','innerText'),/unavailable/);
console.log('PASS: 4 KEM stages × 3 roles; staged public transcript; hidden secret objects; keyboard attacker controls; 4 deeper explanations; 4 responsive widths; chapter reset; English; reduced motion; WebGL fallback; no runtime/resource errors.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});

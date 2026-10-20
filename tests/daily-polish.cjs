const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 const send=async(...ids)=>{for(const id of ids)await page.check(`[data-wire-object="${id}"]`);await page.locator('#wire-send').click();};
 await page.goto(root);await page.waitForSelector('#answers input');
 await page.check('#answers input[value="1"]');await page.locator('#learning-continue').click();
 assert.equal(await page.locator('#answers input[value="1"]').isChecked(),true,'Continue in the same chapter must retain a pending answer');
 await page.locator('[data-chapter="4"]').click();await page.fill('#message','Keep this session draft');
 await page.locator('#learning-continue').click();assert.equal(await page.inputValue('#message'),'Keep this session draft');
 await page.reload();await page.waitForSelector('#message');assert.notEqual(await page.inputValue('#message'),'Keep this session draft','Reload must not restore sensitive drafts');
 // A deep link reveals the nested comparison and glossary, not just their exercise.
 await page.goto(root+'?chapter=4#wire-comparison');await page.waitForSelector('#wire-send');
 assert.equal(await page.locator('#wire-comparison').isVisible(),true,'Comparison deep link must open its nested details');
 await page.goto(root+'?chapter=4#wire-glossary');await page.waitForSelector('#wire-send');
 assert.equal(await page.locator('#wire-glossary dl').isVisible(),true,'Glossary deep link must reveal its contents');
 // Modified exercise links retain the browser's normal new-tab behavior.
 await exercise('guided-missions');
 const popupPromise=context.waitForEvent('page',{timeout:4000}).catch(()=>null);
 await page.locator('#mission-link').click({modifiers:['Control']});
 const popup=await popupPromise;assert.ok(popup,'Ctrl-click must open the exercise in a new tab');
 await popup.waitForLoadState('domcontentloaded');assert.equal(new URL(popup.url()).hash,'#message-journey');
 assert.equal(new URL(page.url()).hash,'#guided-missions');assert.equal(await page.locator('[data-exercise-panel][open]').getAttribute('data-exercise-panel'),'guided-missions');await popup.close();
 // Keyboard transmission hands focus to inspection when its send button becomes disabled.
 await exercise('build-the-wire');await page.locator('#wire-reset').click();await page.check('[data-wire-object="ek"]');
 await page.locator('#wire-send').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');
 assert.equal(await page.locator('#wire-transcript li').count(),1);
 await page.locator('#wire-send-c').press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');assert.equal(await page.locator('#wire-transcript li').count(),2);
 await page.locator('#wire-reset').click();await page.locator('#wire-send-ek').click();
 assert.notEqual(await page.evaluate(()=>document.activeElement.id),'wire-inspect','Pointer sends must not force a scroll to inspection');
 // MORE_CHECKS
 assert.deepEqual(errors,[]);console.log('PASS: daily learning, KEM and accessibility refinements; no runtime or request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

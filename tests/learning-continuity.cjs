const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 await page.goto(root+'?chapter=4&view=compact#build-the-wire');await page.waitForSelector('#wire-send');
 await page.locator('#wire-send-ek').click();await page.locator('#learning-continue').click();
 assert.equal(new URL(page.url()).hash,'#build-the-wire');
 assert.equal(new URL(page.url()).searchParams.get('view'),'compact');
 assert.equal(await page.locator('#wire-transcript li').count(),1,'Continue must preserve session evidence');
 await page.locator('#learning-progress details summary').click();await page.locator('[data-progress-id="double"]').click();
 assert.equal(new URL(page.url()).hash,'#double-encapsulation');
 await page.reload();await page.waitForFunction(()=>document.activeElement.id==='double-encapsulation');
 assert.equal(await page.locator('[data-exercise-panel][open]').getAttribute('data-exercise-panel'),'double-encapsulation');
 assert.equal(await page.locator('#wire-transcript li').count(),0,'Reload must not restore experiment evidence');
 // Real cross-tab progress updates keep the focused checklist button usable.
 await page.locator('#learning-progress details summary').click();
 await page.locator('[data-progress-id="chapter-0"]').focus();
 const other=await page.context().newPage();await other.goto(root);await other.waitForSelector('#answers input');
 const correct=await other.evaluate(()=>LESSONS[0].correct);
 await other.check(`#answers input[value="${correct}"]`);await other.locator('#quiz button').click();
 await page.waitForFunction(()=>document.querySelector('[data-chapter="0"]').dataset.completed==='true');
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.progressId),'chapter-0');
 assert.match(await page.locator('[data-progress-id="chapter-0"]').innerText(),/Completed/);
 await page.locator('#learning-continue').focus();await other.locator('#learning-clear').click();
 await page.waitForFunction(()=>document.querySelector('[data-chapter="0"]').dataset.completed==='false');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'learning-continue');await other.close();
 // MORE_CHECKS
 assert.deepEqual(errors,[]);
 console.log('PASS: learning continuity and main-scene accessibility; no runtime or request errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
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
 // MORE_CHECKS
 assert.deepEqual(errors,[]);
 console.log('PASS: learning continuity and main-scene accessibility; no runtime or request errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

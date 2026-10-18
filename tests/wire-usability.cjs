const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 await page.goto(root+'?chapter=4#build-the-wire');await page.waitForSelector('#wire-send');
 const reset=()=>page.locator('#wire-reset').click();
 const send=async(...ids)=>{for(const id of ids)await page.check(`[data-wire-object="${id}"]`);await page.locator('#wire-send').click();};
 // Distinguish captured objects from additional inferred knowledge, without double-counting.
 assert.equal(await page.locator('#wire-eve-sources').count(),1);
 assert.match(await page.locator('#wire-eve-sources').innerText(),/0 directly captured.*0 inferred/);
 await send('dk');assert.match(await page.locator('#wire-eve-sources').innerText(),/1 directly captured.*1 inferred/);
 await send('c');assert.match(await page.locator('#wire-eve-sources').innerText(),/2 directly captured.*3 inferred/);
 await send('K');assert.match(await page.locator('#wire-eve-sources').innerText(),/3 directly captured.*2 inferred/);
 await reset();assert.match(await page.locator('#wire-eve-sources').innerText(),/0 directly captured.*0 inferred/);
 // MORE_CHECKS
 assert.deepEqual(errors,[]);
 console.log('PASS: wire usability and navigation refinements; no runtime or request errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

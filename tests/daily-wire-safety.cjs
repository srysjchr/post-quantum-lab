const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 const send=async(...ids)=>{for(const id of ids)await page.check(`[data-wire-object="${id}"]`);await page.locator('#wire-send').click();};
 await page.goto(root+'?chapter=4#build-the-wire');await page.waitForSelector('#wire-send');
 await send('traffic');assert.match(await page.locator('[data-route-step="capture"] span').innerText(),/traffic key.*directly/i,'A secret traffic-key capture is not a public-only transcript');
 assert.doesNotMatch(await page.locator('[data-route-step="capture"] span').innerText(),/Public copies do not reveal/);
 await page.locator('#wire-reset').click();await send('dk');assert.match(await page.locator('[data-route-step="capture"] span').innerText(),/matching c/);
 await page.locator('#wire-send-c').click();assert.match(await page.locator('[data-route-step="capture"] span').innerText(),/recover K.*dk.*c/);
 await page.locator('#wire-reset').click();await send('K');assert.match(await page.locator('[data-route-step="capture"] span').innerText(),/K.*directly/);
 await page.locator('#wire-reset').click();await send('ek','c');assert.match(await page.locator('[data-route-step="capture"] span').innerText(),/Public copies do not reveal K/);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);
 await page.locator('#wire-reset').click();await send('dk');await page.waitForFunction(()=>document.getElementById('wire-packet-route').dataset.stage==='delivery');
 assert.equal(await page.locator('[aria-current="step"][data-route-step]').getAttribute('data-route-step'),'capture','Secret-only travel must not highlight publishing public ek');
 assert.equal(await page.locator('[data-route-step="ek"]').getAttribute('data-state'),'pending');
 assert.deepEqual(errors,[]);console.log('PASS: capture provenance for public/traffic/dk/K/mixed exposures; secret-only route highlighting; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

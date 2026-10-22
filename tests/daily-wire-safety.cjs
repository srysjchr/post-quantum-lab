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
 // Resizing during a real drag must release capture without sending.
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#wire-reset').click();
 const token=page.locator('[data-wire-token="c"]');await token.scrollIntoViewIfNeeded();
 await token.evaluate(e=>e.addEventListener('pointerdown',event=>window.dragPointer=event.pointerId,{once:true}));
 const box=await token.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+20,box.y+box.height/2+15);
 assert.equal(await token.evaluate(e=>e.hasPointerCapture(dragPointer)),true);
 await page.setViewportSize({width:390,height:900});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.equal(await token.evaluate(e=>e.hasPointerCapture(dragPointer)),false,'Resize must cancel pointer capture');
 const drop=await page.locator('#wire-drop-target').boundingBox();await page.mouse.move(drop.x+drop.width/2,drop.y+drop.height/2);await page.mouse.up();
 assert.equal(await page.locator('#wire-transcript li').count(),0);assert.equal(await page.locator('#wire-scene').evaluate(e=>e.classList.contains('dragging')),false);
 // Collapsing the exercise stops motion and preserves the settled experiment.
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);await page.locator('#wire-send-c').click();
 await exercise('scenario-lab');await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 assert.equal(await page.locator('#wire-packet-route').getAttribute('data-stage'),'settled','A hidden exercise must not keep an active delivery stage');
 await exercise('build-the-wire');assert.equal(await page.locator('#wire-transcript li').count(),1);
 assert.equal(await page.locator('[data-route-step="decaps"]').getAttribute('data-state'),'complete');
 assert.deepEqual(errors,[]);console.log('PASS: capture provenance for public/traffic/dk/K/mixed exposures; secret-only route highlighting; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

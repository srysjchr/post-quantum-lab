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
 // Leaving an exercise via a page link closes its panel and focuses the destination.
 await page.locator('header a[href="#reference"]').click();await page.waitForURL('**#reference');
 assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'reference');
 assert.match(await page.locator('#exercise-current').innerText(),/Choose an exercise/);
 await page.goBack();await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="double-encapsulation"]').open);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'double-encapsulation');
 await page.goForward();await page.waitForFunction(()=>document.activeElement.id==='reference');
 assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);
 // Manual pause survives changes to the system motion preference.
 await page.goto(root+'?chapter=1');await page.waitForSelector('#rsa-product');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);
 await page.locator('#pause').click();assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.getElementById('wire-animate').disabled);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true','System changes must retain a manual pause');
 await page.locator('#pause').click();assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.getElementById('wire-animate').disabled);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);
 assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'false','Automatic pause resumes when motion is allowed');
 // The main motion control explains system policy and cannot start animation while reduced.
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.getElementById('wire-animate').disabled);
 assert.equal(await page.locator('#pause').isDisabled(),true);
 assert.match(await page.locator('#scene-motion-note').innerText(),/System reduced motion is active/);
 assert.equal(await page.locator('#pause').getAttribute('aria-describedby'),'scene-motion-note');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);
 assert.equal(await page.locator('#pause').isEnabled(),true);await page.locator('#pause').click();
 assert.match(await page.locator('#scene-motion-note').innerText(),/Motion is paused/);
 await page.locator('#pause').click();await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.getElementById('wire-animate').disabled);
 // Home restores the actual rendered main camera after keyboard rotation.
 await page.locator('#reset').click();await page.locator('#scene').focus();
 const frame=async()=>require('node:crypto').createHash('sha256').update(await page.locator('#scene canvas').screenshot()).digest('hex');
 const baseline=await frame();await page.locator('#scene').press('ArrowRight');
 assert.notEqual(await frame(),baseline,'Arrow rotation must change the rendered model');
 await page.locator('#scene').press('Home');assert.equal(await frame(),baseline,'Home must restore the original rendered view');
 assert.match(await page.locator('#scene').getAttribute('aria-keyshortcuts'),/Home/);
 // MORE_CHECKS
 assert.deepEqual(errors,[]);
 console.log('PASS: learning continuity and main-scene accessibility; no runtime or request errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

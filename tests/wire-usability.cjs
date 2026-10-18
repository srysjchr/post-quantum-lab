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
 // Explain only additional inferred objects, using the current capture as evidence.
 assert.equal(await page.locator('#wire-eve-reasons').count(),1);
 assert.equal(await page.locator('#wire-eve-reasons li').count(),0);
 await send('dk','c');
 assert.match(await page.locator('#wire-eve-reasons').innerText(),/ek:.*dk/);
 assert.match(await page.locator('#wire-eve-reasons').innerText(),/K:.*captured c.*captured dk/);
 assert.match(await page.locator('#wire-eve-reasons').innerText(),/Traffic key:.*K.*public context/);
 await send('K','traffic');assert.equal(await page.locator('#wire-eve-reasons li').count(),1);
 await reset();await send('traffic');assert.equal(await page.locator('#wire-eve-reasons li').count(),0);await reset();
 // Inspect a transcript entry without retransmission, including keyboard use.
 await send('ek','c');
 const captureButton=page.locator('[data-wire-capture="c"] button');
 assert.equal(await captureButton.count(),1);await captureButton.focus();await page.keyboard.press('Enter');
 assert.equal(await page.inputValue('#wire-inspect'),'c');assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');
 assert.equal(await captureButton.getAttribute('aria-pressed'),'true');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 await page.locator('[data-wire-capture="ek"] button').click();assert.equal(await page.inputValue('#wire-inspect'),'ek');
 assert.equal(await captureButton.getAttribute('aria-pressed'),'false');await reset();
 // Jump to the latest capture after a batch, preserving evidence and disable states.
 assert.equal(await page.locator('#wire-inspect-latest').count(),1);
 assert.equal(await page.locator('#wire-inspect-latest').isDisabled(),true);
 await send('ek');assert.equal(await page.locator('#wire-inspect-latest').isDisabled(),true);
 await send('c','dk','K','traffic');assert.equal(await page.locator('#wire-inspect-latest').isEnabled(),true);
 await page.locator('#wire-inspect-latest').click();assert.equal(await page.inputValue('#wire-inspect'),'traffic');
 assert.match(await page.locator('#wire-inspection-position').innerText(),/Capture 5 of 5/);
 assert.equal(await page.locator('#wire-inspect-latest').isDisabled(),true);
 assert.equal(await page.locator('#wire-transcript li').count(),5);await reset();
 assert.equal(await page.locator('#wire-inspect-latest').isDisabled(),true);
 // Eve's 3D overlay explains how K is known rather than implying it travelled.
 await page.locator('#wire-perspectives [data-wire-observer="eve"]').click();
 assert.match(await page.locator('#wire-observer-knowledge').innerText(),/K source: unavailable from the current capture/);
 await send('dk','c');assert.match(await page.locator('#wire-observer-knowledge').innerText(),/K source: inferred from captured dk \+ c/);
 await send('K');assert.match(await page.locator('#wire-observer-knowledge').innerText(),/K source: captured directly/);
 assert.equal(await page.locator('#wire-transcript li').count(),3);
 await page.locator('#wire-perspectives [data-wire-observer="bob"]').click();
 assert.doesNotMatch(await page.locator('#wire-observer-knowledge').innerText(),/K source:/);
 await reset();await page.locator('#wire-perspectives [data-wire-observer="learner"]').click();
 // The drop target names only unsent public objects and reflects completion/reset.
 assert.match(await page.locator('#wire-drop-target small').innerText(),/Drop ek or c here/);
 await page.check('[data-wire-object="K"]');assert.match(await page.locator('#wire-drop-target small').innerText(),/Drop ek or c here/);
 await page.locator('#wire-send-c').click();assert.match(await page.locator('#wire-drop-target small').innerText(),/Drop ek here/);
 await page.locator('#wire-send-ek').click();assert.match(await page.locator('#wire-drop-target small').innerText(),/Both public objects sent/);
 assert.equal(await page.locator('[data-wire-capture="K"]').count(),0);await reset();
 await page.locator('#wire-send-ek').click();assert.match(await page.locator('#wire-drop-target small').innerText(),/Drop c here/);await reset();
 // Native summary activation must keep the exercise picker in sync.
 await page.locator('[data-exercise-panel="scenario-lab"] > summary').click();
 await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="scenario-lab"]').open);
 assert.equal(await page.inputValue('#exercise-picker'),'scenario-lab');
 await page.locator('[data-exercise-panel="teach-it-back"] > summary').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.querySelector('[data-exercise-panel="teach-it-back"]').open);
 assert.equal(await page.inputValue('#exercise-picker'),'teach-it-back');
 // A delayed toggle must not overwrite a new menu selection the learner has not opened yet.
 await page.selectOption('#exercise-picker','attack-playground');
 await page.waitForTimeout(100);assert.equal(await page.inputValue('#exercise-picker'),'attack-playground');
 // MORE_CHECKS
 assert.deepEqual(errors,[]);
 console.log('PASS: wire usability and navigation refinements; no runtime or request errors.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

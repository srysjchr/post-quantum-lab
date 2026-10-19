const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 await page.goto(root+'?chapter=4&view=compact#scenario-lab');await page.waitForSelector('#scenario-form button');
 const milestone=async id=>{const summary=page.locator('#learning-progress details summary');if(!await page.locator('#learning-progress details').evaluate(e=>e.open))await summary.click();await page.locator(`[data-progress-id="${id}"]`).click();};
 const completed=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('post-quantum-lab.progress.v1'))?.completed||[]);
 await milestone('chapter-2');assert.equal(new URL(page.url()).hash,'#lesson-title');
 assert.equal(new URL(page.url()).searchParams.get('chapter'),'3');assert.equal(new URL(page.url()).searchParams.get('view'),'compact');
 assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);assert.equal(await page.evaluate(()=>document.activeElement.id),'lesson-title');
 await page.reload();await page.waitForSelector('[data-chapter="2"][aria-pressed="true"]');
 await milestone('aes');assert.equal(new URL(page.url()).hash,'#interaction');assert.equal(new URL(page.url()).searchParams.get('chapter'),'5');
 assert.equal(await page.locator('#message').isVisible(),true);assert.deepEqual(await completed(),[]);
 // Scenario milestones select the named scenario; revisiting it retains a pending answer.
 await milestone('scenario-2');assert.match(await page.locator('#scenario-count').innerText(),/SCENARIO 3 \/ 3/);
 await page.check('#scenario-options input[value="2"]');await milestone('scenario-2');
 assert.equal(await page.locator('#scenario-options input[value="2"]').isChecked(),true);
 await milestone('scenario-0');assert.match(await page.locator('#scenario-count').innerText(),/SCENARIO 1 \/ 3/);
 assert.equal(await page.locator('#scenario-options input:checked').count(),0);assert.deepEqual(await completed(),[]);
 // Protocol repair milestones select their case without awarding a patch.
 await milestone('repair-3');assert.match(await page.locator('#repair-count').innerText(),/CASE 4 \/ 4/);
 await page.check('[data-repair-control="kem"]');await milestone('repair-3');
 assert.equal(await page.locator('[data-repair-control="kem"]').isChecked(),true);
 await milestone('repair-1');assert.match(await page.locator('#repair-count').innerText(),/CASE 2 \/ 4/);
 assert.equal(await page.locator('#repair-options input:checked').count(),0);assert.deepEqual(await completed(),[]);
 // Teach It Back milestones open their topic and keep optional notes local.
 await milestone('teach-2');assert.equal(await page.inputValue('#teach-topic'),'2');
 await page.fill('#teach-notes','Session reflection only');await page.selectOption('#teach-field-0','valid');
 await milestone('teach-2');assert.equal(await page.inputValue('#teach-field-0'),'valid');
 await milestone('teach-0');assert.equal(await page.inputValue('#teach-topic'),'0');assert.equal(await page.inputValue('#teach-field-0'),'');
 assert.equal(await page.inputValue('#teach-notes'),'Session reflection only');assert.match(await page.locator('#teach-evidence').innerText(),/NOT READY/);
 assert.deepEqual(await completed(),[]);
 // Mission milestones select their mission without skipping its experiment checklist.
 await milestone('mission-2');assert.equal(await page.inputValue('#mission-select'),'2');
 await page.check('#mission-options input[value="0"]');await milestone('mission-2');
 assert.equal(await page.locator('#mission-options input[value="0"]').isChecked(),true);
 await milestone('mission-1');assert.equal(await page.inputValue('#mission-select'),'1');
 assert.equal(await page.locator('#mission-options input:checked').count(),0);
 await page.locator('#mission-form button').click();assert.match(await page.locator('#mission-feedback').innerText(),/Complete both experiment steps/);
 assert.deepEqual(await completed(),[]);
 // Attack milestones configure the intended action/policy without running an attack.
 await milestone('tamper-rejected');assert.equal(await page.inputValue('#attack-mode'),'tamper');assert.equal(await page.locator('#attack-run').isDisabled(),true);
 await page.locator('#attack-prepare').click();await page.waitForFunction(()=>!document.getElementById('attack-run').disabled);
 const packet=await page.locator('#attack-wire').innerText();await milestone('tamper-rejected');assert.equal(await page.locator('#attack-wire').innerText(),packet);
 await milestone('replay-unguarded');assert.equal(await page.inputValue('#attack-mode'),'replay');assert.equal(await page.locator('#replay-policy').isChecked(),false);
 await page.locator('#attack-prepare').click();await page.waitForFunction(()=>!document.getElementById('attack-run').disabled);
 const replayPacket=await page.locator('#attack-wire').innerText();await milestone('replay-guarded');assert.equal(await page.locator('#replay-policy').isChecked(),true);
 assert.equal(await page.locator('#attack-wire').innerText(),replayPacket);assert.equal(await page.locator('#attack-run').isEnabled(),true);
 await milestone('drop-observed');assert.equal(await page.inputValue('#attack-mode'),'drop');assert.equal(await page.locator('#attack-run').isDisabled(),true);
 await milestone('untrusted-blocked');assert.equal(await page.inputValue('#attack-mode'),'substitute');assert.deepEqual(await completed(),[]);
 // Completion filters keep focus usable when another tab removes an unfinished item.
 assert.equal(await page.locator('#learning-filter').count(),1);
 await page.selectOption('#learning-filter','completed');assert.equal(await page.locator('#learning-checklist li').count(),0);
 assert.equal(await page.locator('#learning-empty').isVisible(),true);
 await page.selectOption('#learning-filter','unfinished');assert.equal(await page.locator('#learning-checklist li').count(),30);
 await page.locator('[data-progress-id="chapter-0"]').focus();
 const other=await context.newPage();await other.goto(root);await other.waitForSelector('#answers input');
 const correct=await other.evaluate(()=>LESSONS[0].correct);await other.check(`#answers input[value="${correct}"]`);await other.locator('#quiz button').click();
 await page.waitForFunction(()=>document.querySelector('[data-chapter="0"]').dataset.completed==='true');
 assert.equal(await page.inputValue('#learning-filter'),'unfinished');assert.equal(await page.locator('#learning-checklist li').count(),29);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'learning-filter');await other.close();
 await page.selectOption('#learning-filter','completed');assert.equal(await page.locator('#learning-checklist li').count(),1);
 assert.match(await page.locator('#learning-filter-count').innerText(),/1 of 30/);
 await page.selectOption('#learning-filter','all');assert.equal(await page.locator('#learning-checklist li').count(),30);
 // MORE_CHECKS
 assert.deepEqual(errors,[]);console.log('PASS: precise milestone navigation and progress controls; no runtime or request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

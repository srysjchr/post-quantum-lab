const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');await page.waitForSelector('#scenario-options input');
 assert.match(await page.title(),/Post.*Quantum/);assert.equal(await page.locator('html').getAttribute('lang'),'en');
 const click=s=>page.locator(s).click(),text=s=>page.locator(s).innerText();
 const waitStatus=(id,word)=>page.waitForFunction(({id,word})=>document.getElementById(id).textContent.includes(word),{id,word});
 await click('#scenario-form button');assert.match(await text('#scenario-feedback'),/Choose a tool/);
 for(let i=0;i<3;i++){
   await click(`#scenario-options input[value="${(i+1)%3}"]`);await click('#scenario-form button');assert.equal(await page.locator('#scenario-feedback').getAttribute('class'),'incorrect');
   await click(`#scenario-options input[value="${i}"]`);await click('#scenario-form button');assert.match(await text('#scenario-feedback'),/^Correct/);if(i<2)await click('#scenario-next');
 }
 assert.match(await text('#scenario-count'),/3 solved/);assert.equal(await page.locator('#scenario-next').isDisabled(),true);await click('#scenario-reset');assert.match(await text('#scenario-count'),/0 solved/);
 // Mission 1 cannot be completed by selecting an answer without doing the work.
 await click('#mission-options input[value="0"]');await click('#mission-form button');assert.match(await text('#mission-feedback'),/Complete both experiment steps/);
 await page.locator('#mission-hints summary').click();assert.equal(await page.locator('#mission-hints').getAttribute('open'),'');assert.match(await text('#mission-hint'),/Authenticate/);
 await click('#authenticate');await click('#journey-forward');await click('#encapsulate');await click('#journey-forward');await click('#derive');await waitStatus('journey-status','completed');await click('#journey-forward');
 await page.fill('#journey-message','Mission message 🔐 <b>literal</b>');await click('#journey-encrypt');await waitStatus('journey-status','Encrypted');assert.equal(await page.locator('#mission-checklist .correct').count(),1);await click('#journey-forward');await click('#journey-verify');await waitStatus('journey-status','Verified');assert.equal(await page.locator('#mission-checklist .correct').count(),2);
 await click('#mission-options input[value="1"]');await click('#mission-form button');assert.match(await text('#mission-feedback'),/Not quite/);await click('#mission-options input[value="0"]');await click('#mission-form button');assert.match(await text('#mission-counter'),/COMPLETE/);
 await click('#journey-reset');assert.equal(await text('#mission-feedback'),'');assert.equal(await page.locator('#mission-checklist .correct').count(),0);assert.match(await text('#mission-counter'),/IN PROGRESS/);
 // Mission 2: two distinct protections, real tag rejection and simulated identity binding.
 await page.selectOption('#mission-select','1');assert.equal(await page.locator('#attack-run').isDisabled(),true);
 const prepare=async()=>{await click('#attack-prepare');await waitStatus('attack-result','Fresh packet prepared');};
 await prepare();const oldWire=await text('#attack-wire');const oldNonce=await page.locator('#attack-wire code').first().innerText();await click('#attack-run');await waitStatus('attack-result','BLOCKED');assert.equal(await page.locator('#mission-checklist .correct').count(),1);
 await page.selectOption('#attack-mode','tamper');assert.equal(await page.locator('#attack-run').isDisabled(),true);await prepare();assert.notEqual(await text('#attack-wire'),oldWire);assert.notEqual(await page.locator('#attack-wire code').first().innerText(),oldNonce);await click('#attack-run');await waitStatus('attack-result','REJECTED');assert.equal(await page.locator('#mission-checklist .correct').count(),2);await click('#mission-options input[value="1"]');await click('#mission-form button');assert.match(await text('#mission-counter'),/COMPLETE/);
 // Mission 3: valid unchanged GCM bytes are accepted twice without freshness state.
 await page.selectOption('#mission-select','2');await page.selectOption('#attack-mode','replay');await prepare();await page.uncheck('#replay-policy');await click('#attack-run');await waitStatus('attack-result','REPLAY ACCEPTED');assert.equal(await page.locator('#mission-checklist .correct').count(),1);await page.check('#replay-policy');await click('#attack-run');await waitStatus('attack-result','DUPLICATE REJECTED');assert.equal(await page.locator('#mission-checklist .correct').count(),2);await click('#mission-form button');assert.match(await text('#mission-feedback'),/Choose an explanation/);await click('#mission-options input[value="0"]');await click('#mission-form button');assert.match(await text('#mission-counter'),/COMPLETE/);
 await click('#mission-restart');assert.equal(await page.locator('#mission-checklist .correct').count(),0);assert.equal(await page.locator('#mission-options input:checked').count(),0);
 await page.selectOption('#attack-mode','drop');await prepare();await click('#attack-run');await waitStatus('attack-result','NOT DELIVERED');assert.match(await text('#attack-result'),/GCM was never invoked/);await click('#attack-reset');assert.equal(await page.locator('#attack-run').isDisabled(),true);assert.match(await text('#attack-wire'),/No packet/);
 // Reset while encryption is pending must not revive an obsolete packet.
 await page.evaluate(()=>{const encrypt=crypto.subtle.encrypt.bind(crypto.subtle);crypto.subtle.encrypt=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,250));return encrypt(...args);};});await click('#attack-prepare');await click('#attack-reset');await page.waitForTimeout(500);assert.equal(await page.locator('#attack-run').isDisabled(),true);assert.match(await text('#attack-wire'),/No packet/);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);}
 // Existing chapters and observer changes do not erase independent lab progress.
 await click('#scenario-options input[value="0"]');await click('#scenario-form button');await click('[data-chapter="5"]');await click('[data-observer=eve]');assert.match(await text('#scenario-count'),/1 solved/);assert.equal(await page.locator('#scenario-options input:checked').count(),1);
 assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
 if(process.env.EVIDENCE_DIR){await page.setViewportSize({width:1440,height:1000});await page.locator('#practice-labs').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'labs-desktop.png')});await page.locator('#guided-missions').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'missions-desktop.png')});await page.setViewportSize({width:390,height:844});await page.locator('#scenario-lab').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'labs-mobile.png')});}
 assert.deepEqual(errors,[]);
 // Unsupported crypto must show an actionable error without breaking scenarios.
 const limited=await browser.newPage();await limited.addInitScript(()=>Object.defineProperty(window,'crypto',{value:{getRandomValues:()=>{},subtle:undefined}}));await limited.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');await limited.waitForSelector('#scenario-options input');await limited.locator('#attack-prepare').click();await limited.waitForFunction(()=>document.getElementById('attack-result').textContent.includes('HTTPS or localhost'));assert.equal(await limited.locator('#attack-run').isDisabled(),true);await limited.locator('#scenario-options input[value="0"]').check();await limited.locator('#scenario-form button').click();assert.match(await limited.locator('#scenario-feedback').innerText(),/^Correct/);
 assert.equal(await page.evaluate(ids=>{const saved=JSON.parse(localStorage.getItem('post-quantum-lab.progress.v1'));return ids.every(id=>saved.completed.includes(id));},["scenario-0", "scenario-1", "scenario-2", "mission-0", "mission-1", "mission-2", "untrusted-blocked", "tamper-rejected", "drop-observed", "replay-unguarded", "replay-guarded"]),true,'Completion history must match successful exercises');console.log('PASS: 3 scenarios; wrong/missing answers; 4 attacks; fresh nonces; replay policy on/off; 3 evidence-gated missions; hints/restarts; pending-operation reset; 4 responsive widths; English; graceful crypto fallback; no runtime/resource errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8765/';
 await page.goto(root);await page.waitForSelector('#exercise-picker option',{state:'attached'});
 const panel=id=>page.locator(`[data-exercise-panel="${id}"]`);
 const open=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();await expectOpen(id);};
 const expectOpen=async id=>{await page.waitForFunction(id=>document.querySelector(`[data-exercise-panel="${id}"]`).open,id);assert.equal(await page.locator('[data-exercise-panel][open]').count(),1);};
 assert.equal(await page.locator('[data-exercise-panel]').count(),10);assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);assert.equal(await page.locator('#exercise-picker option').count(),10);assert.equal(await page.locator('#exercise-path li').count(),10);
 const collapsedHeight=await page.evaluate(()=>document.documentElement.scrollHeight);
 await open('scenario-lab');assert.equal(await page.locator('#exercise-prev').isDisabled(),true);assert.equal(await page.evaluate(()=>document.activeElement.id),'scenario-lab');
 await page.goBack();await page.waitForFunction(()=>!document.querySelector('[data-exercise-panel][open]'));await page.goForward();await expectOpen('scenario-lab');
 await page.locator('#exercise-next').click();await expectOpen('kem-prediction');assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true');
 await panel('kem-prediction').getByRole('button',{name:'Next exercise',exact:false}).click();await expectOpen('double-encapsulation');
 await page.goBack();await expectOpen('kem-prediction');await page.goForward();await expectOpen('double-encapsulation');
 await open('build-the-wire');await page.check('[data-wire-object="ek"]');await page.locator('#wire-send').click();await open('teach-it-back');await page.fill('#teach-notes','Keep my session notes');assert.equal(await page.locator('#exercise-next').isDisabled(),true);
 await open('build-the-wire');assert.equal(await page.locator('#wire-transcript li').count(),1);await open('teach-it-back');assert.equal(await page.inputValue('#teach-notes'),'Keep my session notes');
 await panel('teach-it-back').getByRole('button',{name:'Back to exercise menu'}).click();assert.equal(await page.evaluate(()=>document.activeElement.id),'exercise-picker');
 await panel('teach-it-back').locator('summary').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('[data-exercise-panel="teach-it-back"]').open);await page.keyboard.press('Enter');await expectOpen('teach-it-back');
 // Continue learning expands a saved exercise on an otherwise collapsed page.
 await page.goto(root);await page.locator('#learning-continue').click();await expectOpen('teach-it-back');assert.equal(await page.evaluate(()=>document.activeElement.id),'teach-it-back');assert.equal(await page.inputValue('#teach-notes'),'');
 await page.goto(root+'?chapter=1#build-the-wire');await expectOpen('build-the-wire');assert.equal(new URL(page.url()).hash,'#build-the-wire');assert.equal(await page.locator('[data-chapter="3"]').getAttribute('aria-pressed'),'true');
 await page.locator('[data-chapter="0"]').click();assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);
 await page.goto(root+'#%E0%A4%A');await page.waitForSelector('#exercise-picker');assert.equal(await page.locator('[data-exercise-panel][open]').count(),0);
 // Existing cross-exercise links also expand their destinations.
 await open('guided-missions');const link=page.locator('#guided-missions a[href^="#"]').first();const target=(await link.getAttribute('href')).slice(1);await link.click();assert.equal(await page.locator('#'+target).isVisible(),true);assert.equal(await page.locator('[data-exercise-panel][open]').count(),1);
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(const id of ['scenario-lab','build-the-wire','teach-it-back']){await open(id);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id} overflow ${width}`);}}
 await page.goto(root);await page.waitForSelector('#exercise-picker');assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight),collapsedHeight);
 await page.locator('#exercise-navigation details summary').click();await page.locator('[data-route-exercise="protocol-repair"]').focus();await page.keyboard.press('Enter');await expectOpen('protocol-repair');
 await page.locator('#learning-progress details summary').click();await page.locator('[data-progress-id="wire"]').click();await expectOpen('build-the-wire');assert.equal(await page.evaluate(()=>document.activeElement.id),'build-the-wire');
 await page.goto(root);await page.waitForSelector('#exercise-picker');
 if(process.env.EVIDENCE_DIR){for(const [width,name] of [[1440,'desktop'],[390,'mobile']]){await page.setViewportSize({width,height:900});await page.locator('#exercise-navigation').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,`navigation-${name}.png`)});}}
 assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
 console.log('PASS: 10 collapsed exercises; ordered menu; previous/next endpoints; chapter routing; history; focus/keyboard; preserved session experiments/notes; Continue; deep links/malformed hash; mission links; four widths; English; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

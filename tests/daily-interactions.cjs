const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 await page.goto(root+'?chapter=2');await page.waitForSelector('[data-algorithm="grover"]');
 await page.locator('[data-algorithm="grover"]').click();
 await exercise('attack-playground');await page.selectOption('#attack-mode','replay');
 assert.match(await page.locator('#attack-description').innerText(),/freshness policy/,'Attack description must update independently of the quantum chapter');
 assert.match(await page.locator('#quantum-description').innerText(),/square-root query reduction/,'Quantum description must keep the selected algorithm');
 for(let chapter=0;chapter<6;chapter++){
  await page.locator(`[data-chapter="${chapter}"]`).click();
  assert.deepEqual(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return [...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];}),[],`Unique document IDs in chapter ${chapter+1}`);
 }
 // Activating a projected token with a keyboard must not drop focus to the body.
 await exercise('build-the-wire');await page.locator('#wire-reset').click();
 await page.locator('[data-wire-token="ek"]').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect','Keyboard token transmission hands focus to inspection');
 assert.equal(await page.locator('#wire-transcript li').count(),1);
 await page.locator('[data-wire-token="c"]').press('Space');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'wire-inspect');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 await page.locator('#wire-reset').click();await page.locator('[data-wire-token="ek"]').click();
 assert.notEqual(await page.evaluate(()=>document.activeElement.id),'wire-inspect','Pointer token transmission does not force inspection focus');
 assert.equal(await page.locator('#wire-transcript li').count(),1);
 assert.deepEqual(errors,[]);
 console.log('PASS: independent quantum/attack descriptions; unique document IDs across six chapters; no runtime or HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

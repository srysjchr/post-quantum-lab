const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
 const root=process.env.TEST_URL||'http://127.0.0.1:8766/';
 const exercise=async id=>{await page.selectOption('#exercise-picker',id);await page.locator('#exercise-open').click();};
 await page.goto(root+'?chapter=4#key-substitution-story');await page.waitForSelector('#substitution-next');
 for(let n=0;n<4;n++)await page.locator('#substitution-next').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description','Last story step must retain a useful keyboard position');
 assert.equal(await page.locator('#substitution-next').isDisabled(),true);
 await page.locator('[data-substitution-step="2"]').press('Space');assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description','Rebuilt stage buttons must not drop focus');
 assert.match(await page.locator('#substitution-count').innerText(),/3 \/ 5/);
 for(let n=0;n<2;n++)await page.locator('#substitution-prev').press('Enter');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'substitution-description');
 assert.equal(await page.locator('#substitution-prev').isDisabled(),true);
 assert.equal(await page.locator('#substitution-check').isDisabled(),true);
 assert.deepEqual(errors,[]);console.log('PASS: key-substitution stage/button focus; first/last navigation endpoints; unchanged explanation gate; no runtime/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

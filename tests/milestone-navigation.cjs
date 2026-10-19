const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
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
 // MORE_CHECKS
 assert.deepEqual(errors,[]);console.log('PASS: precise milestone navigation and progress controls; no runtime or request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});

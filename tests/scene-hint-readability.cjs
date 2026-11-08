const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8780/');
  await page.waitForSelector('#scene canvas');
  await page.waitForFunction(()=>!document.getElementById('scene-rotate-left').disabled);
  await page.locator('#scene-rotate-left').click();
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:950});
   const sizes=await page.locator('#scene-controls-help,#scene-motion-note,#scene-rotation-status').evaluateAll(elements=>elements.map(element=>parseFloat(getComputedStyle(element).fontSize)));
   assert.ok(sizes.every(size=>size>=12),`3D guidance/status text must be at least 12px at ${width}px: ${sizes}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`3D guidance overflows at ${width}px`);
  }
  assert.match(await page.locator('#scene-controls-help').innerText(),/Arrow keys.*rotate/);
  assert.match(await page.locator('#scene-rotation-status').innerText(),/View rotated left/);
  assert.deepEqual(errors,[]);
  console.log('PASS: 3D keyboard instructions and live camera status remain readable without overflow at 320/390/768/1440px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

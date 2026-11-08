const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8780/');
  const current=()=>page.locator('header nav a[aria-current="location"]');
  const waitCurrent=href=>page.waitForFunction(href=>document.querySelector('header nav a[aria-current="location"]')?.getAttribute('href')===href,href);
  assert.equal(await current().count(),1,'The visible lesson section starts as the current navigation location');
  assert.equal(await current().getAttribute('href'),'#lesson');
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:900});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`header navigation overflows at ${width}px`);
   await page.locator('header nav a[href="#exercise-navigation"]').click();
   await waitCurrent('#exercise-navigation');
   assert.equal(await current().evaluate(link=>getComputedStyle(link).color),'rgb(166, 244, 197)');
   assert.equal(await page.evaluate(()=>location.hash),'#exercise-navigation');
   await page.evaluate(()=>scrollTo(0,0));await waitCurrent('#lesson');
   await page.locator('header nav a[href="#reference"]').click();
   await waitCurrent('#reference');
   assert.equal(await current().evaluate(link=>getComputedStyle(link).color),'rgb(166, 244, 197)');
   assert.equal(await page.evaluate(()=>location.hash),'#reference');
   await page.evaluate(()=>scrollTo(0,0));await waitCurrent('#lesson');
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: header navigation tracks the visible lesson, practice and reference sections at 320/390/768/1440px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

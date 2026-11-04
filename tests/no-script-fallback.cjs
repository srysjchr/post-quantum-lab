const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:950}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765/');
  const notice=page.locator('#no-script-message');
  assert.equal(await notice.isVisible(),true,'Explain why the lesson content is unavailable without JavaScript');
  assert.match(await notice.innerText(),/JavaScript.*render.*lesson|enable JavaScript.*reload/i);
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:950});
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No-script fallback overflows at ${width}px`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: no-script notice explains the required action and fits 320/390/768/1440px layouts.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

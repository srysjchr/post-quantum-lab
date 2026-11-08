const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>errors.push(request.url()));
  page.on('response',response=>{if(response.status()>=400)errors.push(response.url());});
  const root=process.env.TEST_URL||'http://127.0.0.1:8780/';
  const inspect=async context=>{
   for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:950});
    const links=await page.locator('main p a:visible').evaluateAll(items=>items.map(link=>({text:link.textContent.trim().replace(/\s+/g,' '),height:link.getBoundingClientRect().height})));
    assert.ok(links.length,`${context} should expose paragraph links at ${width}px`);
    assert.ok(links.every(link=>link.height>=44),`${context} has a small paragraph link at ${width}px: ${JSON.stringify(links)}`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${context} overflows at ${width}px`);
   }
  };
  await page.goto(root+'?chapter=4');
  await inspect('KEM explanations and references');
  const fips=page.locator('.kem-questions a[href^="https://nvlpubs.nist.gov/"]');
  assert.equal(await fips.getAttribute('target'),'_blank');
  assert.match(await fips.getAttribute('rel'),/noopener/);

  await page.selectOption('#exercise-picker','protocol-repair');
  await page.locator('#exercise-open').click();
  await inspect('protocol repair cross-reference');
  await page.setViewportSize({width:1440,height:950});
  await page.locator('#protocol-repair a[href="#attack-playground"]').click();
  assert.equal(await page.evaluate(()=>location.hash),'#attack-playground');
  assert.equal(await page.locator('[data-exercise-panel="attack-playground"]').evaluate(element=>element.open),true);
  if(process.env.EVIDENCE_DIR){
   await page.setViewportSize({width:1440,height:950});await page.locator('#attack-playground').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'inline-links-desktop.png')});
   await page.setViewportSize({width:390,height:844});await page.locator('#attack-playground').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'inline-links-mobile.png')});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: paragraph links keep 44px targets, intact source safety and route behavior, with no overflow at 320/390/768/1440px.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});

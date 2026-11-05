const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()));page.on('response',r=>{if(r.status()>=400)errors.push(r.url());});
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};});
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:8766/')+'?chapter=4#build-the-wire');
  const scene=page.locator('#scene'),wire=page.locator('#wire-scene');
  assert.match(await page.locator('#fallback').innerText(),/3D is unavailable/);
  assert.equal(await scene.getAttribute('tabindex'),null,'Unavailable lesson 3D must not stay in the tab order');
  assert.equal(await scene.getAttribute('aria-keyshortcuts'),null);
  assert.match(await scene.getAttribute('aria-label'),/unavailable/i);
  assert.equal(await page.locator('#pause').isDisabled(),true);assert.equal(await page.locator('#reset').isDisabled(),true);assert.equal(await page.locator('#scene-rotate-left').isDisabled(),true);assert.equal(await page.locator('#scene-rotate-right').isDisabled(),true);
  assert.equal(await wire.getAttribute('tabindex'),null,'Unavailable wire camera must not stay in the tab order');
  assert.equal(await wire.getAttribute('aria-keyshortcuts'),null);
  assert.equal(await wire.evaluate(e=>e.classList.contains('unavailable')),true);
  for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow at ${width}`);}
  await page.locator('#wire-send-ek').click();assert.equal(await page.locator('#wire-transcript li').count(),1,'Non-3D experiment controls must remain usable');
  assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);assert.deepEqual(errors,[]);
  const live=await browser.newPage({viewport:{width:1440,height:950},reducedMotion:'reduce'}),liveErrors=[];
  live.on('pageerror',e=>liveErrors.push(e.message));live.on('requestfailed',r=>liveErrors.push(r.url()));live.on('response',r=>{if(r.status()>=400)liveErrors.push(r.url());});
  await live.goto((process.env.TEST_URL||'http://127.0.0.1:8766/')+'?chapter=4#build-the-wire');
  await live.waitForSelector('#scene canvas');await live.waitForSelector('#wire-scene canvas');
  await live.evaluate(()=>{
   const main=document.querySelector('#scene canvas').getContext('webgl2').getExtension('WEBGL_lose_context');
   const wire=document.querySelector('#wire-scene canvas').getContext('webgl2').getExtension('WEBGL_lose_context');
   if(!main||!wire)throw new Error('WebGL context loss extension unavailable');
   window.mainLoss=main;window.wireLoss=wire;main.loseContext();wire.loseContext();
  });
  await live.waitForFunction(()=>!document.getElementById('fallback').hidden&&!document.getElementById('wire-scene-fallback').hidden);
  assert.equal(await live.locator('#scene').getAttribute('tabindex'),null);assert.equal(await live.locator('#scene').getAttribute('aria-keyshortcuts'),null);assert.match(await live.locator('#scene').getAttribute('aria-label'),/interrupted/i);
  assert.equal(await live.locator('#wire-scene').getAttribute('tabindex'),null);assert.equal(await live.locator('#wire-scene').getAttribute('aria-keyshortcuts'),null);assert.match(await live.locator('#wire-keyboard-help').innerText(),/unavailable/i);
  assert.equal(await live.locator('#wire-turn-left').isDisabled(),true);assert.equal(await live.locator('#pause').isDisabled(),true);
  await live.locator('#wire-send-ek').click();assert.equal(await live.locator('#wire-transcript li').count(),1,'Experiment controls remain usable during context loss');
  await live.evaluate(()=>{window.mainLoss.restoreContext();window.wireLoss.restoreContext();});
  await live.waitForFunction(()=>document.getElementById('fallback').hidden&&document.getElementById('wire-scene-fallback').hidden);
  assert.equal(await live.locator('#scene').getAttribute('tabindex'),'0');assert.match(await live.locator('#scene').getAttribute('aria-keyshortcuts'),/ArrowLeft/);
  assert.equal(await live.locator('#wire-scene').getAttribute('tabindex'),'0');assert.match(await live.locator('#wire-scene').getAttribute('aria-keyshortcuts'),/ArrowLeft/);assert.equal(await live.locator('#wire-turn-left').isDisabled(),false);assert.equal(await live.locator('#scene-rotate-left').isDisabled(),false);assert.equal(await live.locator('#scene-rotate-right').isDisabled(),false);
  for(const width of [390,1440]){await live.setViewportSize({width,height:900});assert.equal(await live.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'restored-scene overflow at '+width);}
  assert.deepEqual(liveErrors,[]);
  assert.equal(await live.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
  console.log('PASS: startup WebGL fallback, interrupted/restored camera focus and shortcuts, usable non-3D controls, four no-WebGL widths, mobile/desktop recovery, English, and no runtime/request errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

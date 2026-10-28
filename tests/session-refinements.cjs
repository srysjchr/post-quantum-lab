const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const root=process.env.TEST_URL||'http://127.0.0.1:8771/';
const progressKey='post-quantum-lab.progress.v1';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const cases={
  async 'assessment-reset'(context,p){
   await p.goto(root+'?chapter=4#learning-check');await p.waitForSelector('#assessment-answer-0');
   for(let i=0;i<6;i++)await p.selectOption('#assessment-answer-'+i,'correct');await p.locator('#assessment-submit').click();
   await p.selectOption('#assessment-phase','after');await p.selectOption('#assessment-answer-0','wrong-a');await p.locator('#assessment-submit').click();
   const other=await context.newPage();await other.goto(root+'?chapter=4#learning-check');await other.locator('#assessment-reset').click();
   await p.waitForFunction(()=>document.getElementById('assessment-phase').value==='before');
   assert.match(await p.locator('label[for="assessment-answer-0"]').innerText(),/What does Encaps produce/,'Reset must restore before questions, not retain after prompts');
   assert.equal(await p.inputValue('#assessment-answer-0'),'');assert.equal(await p.locator('#assessment-choice-0').isVisible(),false);assert.equal(await p.locator('#assessment-fields [aria-invalid]').count(),0);
  },
  async 'storage-scope'(context,p){
   await p.goto(root);await p.waitForSelector('#answers input');await p.check('#answers input[value="1"]');await p.locator('#quiz button').click();
   const before=await p.locator('#learning-summary').innerText();assert.match(before,/1 \/ 6 chapters/);
   await p.evaluate(()=>{sessionStorage.setItem('unrelated','value');window.addEventListener('storage',e=>{if(e.storageArea===sessionStorage&&e.key===null)window.sessionClearObserved=true;});const iframe=document.createElement('iframe');iframe.srcdoc='<script>sessionStorage.clear()</script>';document.body.append(iframe);});
   await p.waitForFunction(()=>window.sessionClearObserved===true);
   assert.equal(await p.locator('#learning-summary').innerText(),before,'Session storage clear must not reset local learning progress');
  },
  async 'mission-locks'(context,p){
   await p.addInitScript(key=>localStorage.setItem(key,JSON.stringify({version:1,completed:['independent-0','independent-1'],last:{chapter:3,section:'independent-missions'}})),progressKey);
   await p.goto(root+'?chapter=4#independent-missions');await p.waitForSelector('#ind-level');await p.selectOption('#ind-level','2');
   const other=await context.newPage();await other.goto(root);await other.evaluate(key=>localStorage.setItem(key,JSON.stringify({version:1,completed:[],last:{chapter:0,section:'lesson-title'}})),progressKey);
   await p.waitForFunction(()=>document.querySelector('#ind-level option[value="2"]').disabled);
   assert.equal(await p.inputValue('#ind-level'),'0','A revoked prerequisite must leave the now-locked mission');
   assert.match(await p.locator('#ind-goal').innerText(),/one authentic confidential delivery/);
  },
  async 'scene-fallback'(context,p){
   await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /^webgl|^experimental-webgl/.test(type)?null:original.call(this,type,...args);};});
   await p.goto(root+'?chapter=4');await p.waitForSelector('#answers input');
   assert.equal(await p.locator('#scene').getAttribute('aria-keyshortcuts'),null,'Unavailable 3D must not advertise working keyboard shortcuts');
   assert.match(await p.locator('#scene-motion-note').innerText(),/unavailable/);
   assert.equal(await p.locator('#pause').isDisabled(),true);assert.equal(await p.locator('#reset').isDisabled(),true);
   await p.check('#answers input[value="1"]');await p.locator('#quiz button').click();assert.match(await p.locator('#feedback').innerText(),/Correct/);
  }
 };
 let failed=0;
 try{for(const [name,test] of Object.entries(cases)){if(process.argv[2]&&process.argv[2]!==name)continue;const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{await test(context,p);assert.deepEqual(errors,[]);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await context.close();}}}finally{await browser.close();}if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
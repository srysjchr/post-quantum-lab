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
  }
 };
 let failed=0;
 try{for(const [name,test] of Object.entries(cases)){if(process.argv[2]&&process.argv[2]!==name)continue;const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));try{await test(context,p);assert.deepEqual(errors,[]);console.log('PASS: '+name);}catch(e){failed++;console.error('FAIL: '+name+' '+e.message);if(errors.length)console.error(errors);}finally{await context.close();}}}finally{await browser.close();}if(failed)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1;});
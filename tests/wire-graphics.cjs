const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const url=(process.env.TEST_URL||'http://127.0.0.1:8766/')+'?chapter=4#build-the-wire';
 await page.goto(url);await page.waitForSelector('#wire-send');
 // Observe the real render graph to verify object geometry and secret locality.
 await page.evaluate(()=>{
  const project=THREE.Vector3.prototype.project;THREE.Vector3.prototype.project=function(camera){window.wireLastCamera=camera;return project.call(this,camera);};
  window.wireFrames=[];const add=THREE.Object3D.prototype.add,update=THREE.Scene.prototype.updateMatrixWorld;
  THREE.Object3D.prototype.add=function(...objects){if(objects.some(o=>o.userData.object))window.wireGraph=this.parent;return add.apply(this,objects);};
  THREE.Scene.prototype.updateMatrixWorld=function(force){
   if(this===window.wireGraph){
    const scene=this;
    const objects=[];scene.traverse(o=>{if(o.userData.object){const geometry=[];o.traverse(child=>{if(child.geometry)geometry.push(child.geometry.type);});objects.push({id:o.userData.object,zone:o.userData.zone,actor:o.userData.actor,position:o.position.toArray(),geometry,visible:o.visible});}});
    window.wireFrames.push(objects);if(window.wireFrames.length>300)window.wireFrames.shift();
   }
   return update.call(this,force);
  };
 });
 await page.locator('#wire-camera-reset').click();
 const shapes=await page.evaluate(()=>Object.fromEntries(wireFrames.at(-1).map(o=>[o.id,[...new Set(o.geometry)].sort()])));
 assert.deepEqual(shapes.ek,['BoxGeometry','TorusGeometry']);
 assert.deepEqual(shapes.c,['CylinderGeometry','SphereGeometry','TorusGeometry']);
 assert.deepEqual(shapes.dk,['BoxGeometry','TorusGeometry']);
 assert.deepEqual(shapes.K,['OctahedronGeometry']);assert.deepEqual(shapes.traffic,['BoxGeometry']);
 assert.equal(await page.locator('[data-wire-participant]').count(),3,'Readable participant labels must sit outside the drag canvas');
 for(const id of ['ek','c','dk','K','traffic'])assert.equal(await page.locator(`[data-wire-shape="${id}"]`).count(),1,`${id} needs a shape legend`);
 await page.locator('#wire-send-ek').click();await page.locator('#wire-send-c').click();
 assert.match(await page.locator('#wire-path-caption').innerText(),/Decaps\(dk, c\).*locally/);
 assert.match(await page.locator('[data-route-step="capture"]').innerText(),/ek.*c/);
 assert.equal(await page.locator('[data-route-step="decaps"]').getAttribute('data-state'),'complete');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 assert.equal(await page.locator('[data-wire-capture="K"]').count(),0);
 await page.locator('#wire-perspectives [data-wire-observer="eve"]').click();
 assert.match(await page.locator('[data-wire-participant="bob"]').innerText(),/dk: Unknown/);
 assert.match(await page.locator('[data-wire-participant="bob"]').innerText(),/K: Unknown/);
 assert.doesNotMatch(await page.locator('[data-wire-participant="bob"]').innerText(),/private/);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1100});await page.locator('#wire-reset').click();
  for(const role of ['learner','alice','bob','eve']){
   await page.locator(`#wire-perspectives [data-wire-observer="${role}"]`).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Page overflow: ${width}/${role}`);
   const bounds=await page.locator('#wire-scene').boundingBox();
   for(const id of ['ek','c']){
    const token=await page.locator(`[data-wire-token="${id}"]`).boundingBox();
    assert.ok(token.x>=bounds.x&&token.x+token.width<=bounds.x+bounds.width&&token.y>=bounds.y&&token.y+token.height<=bounds.y+bounds.height,`Token clipped: ${width}/${role}/${id}`);
   }
   for(let turn=0;turn<3;turn++){
    if(turn)for(let n=0;n<5;n++)await page.locator('#wire-turn-right').click();
    const visible=await page.evaluate(()=>{const camera=wireLastCamera,points=[];wireGraph.traverse(o=>{if(o.userData.participant){for(const dx of [-1,1])for(const dz of [-1,1])for(const dy of [-.7,1]){const p=o.position.clone().add(new THREE.Vector3(dx,dy,dz)).project(camera);points.push(Math.abs(p.x)<1&&Math.abs(p.y)<1);}}});return points.every(Boolean);});
    assert.ok(visible,`Endpoint zone clipped: ${width}/${role}/${turn*75}`);
   }
   await page.locator('#wire-camera-reset').click();
   for(const card of await page.locator('[data-wire-participant]').all()){
    assert.equal(await card.evaluate(e=>e.getBoundingClientRect().top>=document.getElementById('wire-scene').getBoundingClientRect().bottom),true,'Labels must not overlap the drag canvas');
    assert.equal(await card.evaluate(e=>e.scrollWidth<=e.clientWidth),true,'Knowledge label clipped');
   }
  }
  if(process.env.EVIDENCE_DIR&&[390,1440].includes(width)){
   await page.locator('#wire-scene').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,`wire-graphics-scene-${width}.png`)});
   await page.locator('#wire-packet-route').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,`wire-graphics-route-${width}.png`)});
  }
 }
 // Animated delivery shows c and its copy; K remains inside endpoint zones.
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('#wire-perspectives [data-wire-observer="learner"]').click();await page.locator('#wire-reset').click();
 await page.locator('#wire-send-ek').click();await page.evaluate(()=>{wireFrames=[];});await page.locator('#wire-send-c').click();
 await page.waitForFunction(()=>document.getElementById('wire-packet-route').dataset.stage==='decaps');
 assert.match(await page.locator('#wire-flight-status').innerText(),/Decaps\(dk, c\) locally/);
 assert.match(await page.locator('#wire-path-caption').innerText(),/Eve records c, not K/);
 const animated=await page.evaluate(()=>wireFrames);
 assert.ok(animated.some(frame=>frame.some(o=>o.zone==='packet'&&o.id==='c'&&o.visible)),'A capsule must visibly travel to Bob');
 assert.ok(animated.some(frame=>frame.some(o=>o.zone==='packet-copy'&&o.id==='c'&&o.visible)),'Eve receives a separate public copy');
 for(const frame of animated){
  assert.equal(frame.some(o=>['packet','packet-copy'].includes(o.zone)&&['K','dk','traffic'].includes(o.id)),false,'No secret object may travel during a public exchange');
  for(const object of frame.filter(o=>o.zone==='local'&&o.actor==='bob'))assert.ok(Math.hypot(object.position[0]-3,object.position[2]+1)<1,'Bob keeps local secret objects inside his zone');
 }
 if(process.env.EVIDENCE_DIR){await page.locator('#wire-scene').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,'wire-graphics-delivery.png')});}
 await page.waitForFunction(()=>document.getElementById('wire-packet-route').dataset.stage==='settled');
 assert.equal(await page.locator('#wire-transcript li').count(),2);
 // Motion changes and resets settle the route and cannot revive an old packet.
 await page.locator('#wire-reset').click();await page.locator('#wire-send-c').click();await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>document.getElementById('wire-packet-route').dataset.stage==='settled');
 assert.equal(await page.evaluate(()=>wireFrames.at(-1).some(o=>o.zone==='packet')),false);
 assert.match(await page.locator('#wire-path-caption').innerText(),/K never travels/);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForFunction(()=>!document.getElementById('wire-animate').disabled);await page.locator('#wire-reset').click();await page.locator('#wire-send-c').click();await page.uncheck('#wire-animate');
 assert.equal(await page.locator('#wire-packet-route').getAttribute('data-stage'),'settled');
 await page.locator('#wire-reset').click();assert.equal(await page.locator('#wire-transcript li').count(),0);
 assert.equal(await page.locator('[data-route-step="decaps"]').getAttribute('data-state'),'pending');
 assert.equal(await page.evaluate(()=>wireFrames.at(-1).some(o=>o.zone==='local'&&o.actor==='bob')),false);
 // A previous dk exposure changes Eve's knowledge even though c stays public.
 await page.check('[data-wire-object="dk"]');await page.locator('#wire-send').click();await page.check('#wire-animate');await page.locator('#wire-send-c').click();
 await page.waitForFunction(()=>document.getElementById('wire-packet-route').dataset.stage==='decaps');
 assert.match(await page.locator('#wire-path-caption').innerText(),/Eve also knows K through the explicit secret exposure/);
 assert.doesNotMatch(await page.locator('#wire-path-caption').innerText(),/Eve records c, not K/);
 await page.locator('#wire-reset').click();await page.waitForTimeout(2100);
 assert.equal(await page.locator('#wire-transcript li').count(),0);assert.equal(await page.locator('#wire-packet-route').getAttribute('data-stage'),'settled');
 assert.equal(await page.evaluate(()=>/[\u0e00-\u0e7f]/.test(document.body.innerText)),false);
 // Direct secret exposures keep their own shapes and do not imply Decaps ran.
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.getElementById('wire-animate').disabled);
 for(const id of ['K','traffic']){
  await page.locator('#wire-reset').click();await page.check(`[data-wire-object="${id}"]`);await page.locator('#wire-send').click();
  assert.equal(await page.locator('[data-route-step="decaps"]').getAttribute('data-state'),'pending');
  assert.match(await page.locator('#wire-path-caption').innerText(),/Secret exposure/);
  if(id==='traffic')assert.match(await page.locator('[data-wire-participant="eve"]').innerText(),/K: Unknown/);
  else assert.match(await page.locator('[data-route-step="decaps"]').innerText(),/explicit secret exposure/);
 }
 // Graphics failure keeps labels, the static path and transmission usable.
 const fallback=await browser.newPage({reducedMotion:'reduce'});fallback.on('pageerror',e=>errors.push(e.message));await fallback.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:get.call(this,type,...args);};});
 await fallback.goto(url);await fallback.locator('#wire-send-c').click();
 assert.equal(await fallback.locator('[data-wire-participant]').count(),3);assert.match(await fallback.locator('#wire-path-caption').innerText(),/Decaps\(dk, c\) locally/);
 assert.equal(await fallback.locator('#wire-turn-left').isDisabled(),true);await fallback.close();
 console.log('PASS: distinct rendered object geometry; readable labels and four cameras at 320/390/768/1440; animated capsule delivery/Eve copy; local secret positions; reduced/manual motion; reset without stale packets; prior-dk-exposure narration; English; WebGL fallback.');
 assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

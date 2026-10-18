'use strict';
// Rendering adapter only: all transmission and knowledge rules live in wire-builder.js.
window.createWireScene = function (transmit) {
  const host = document.getElementById('wire-scene');
  const fallback = document.getElementById('wire-scene-fallback');
  const status = document.getElementById('wire-scene-status');
  const drop = document.getElementById('wire-drop-target');
  const tokens = [...host.querySelectorAll('[data-wire-token]')];
  const THREE = window.THREE;
  const positions = {alice:[-3,0,-1], bob:[3,0,-1], eve:[0,0,3]};
  const publicPositions = {ek:[3,1,-1], c:[-3,1,-1]};
  const origins = {...publicPositions, dk:[3,1,-1], K:[-3,1,-1], traffic:[-3,1,-1]};
  const secretIds = ['dk','K','traffic'];
  let renderer, scene, camera, root, snapshot, drag=null, frame=0, interrupted=false;
  let previous=new Set(), disposed=false, yaw=0, sceneDescription='', userMotion=true;
  const motionControl=document.getElementById('wire-animate');
  function syncMotion(){motionControl.disabled=motion.matches;motionControl.checked=userMotion&&!motion.matches;document.getElementById('wire-motion-note').textContent=motion.matches?'System reduced motion is active. Packets update without animated travel.':userMotion?'Packet travel is animated; final knowledge updates immediately.':'Packet travel is off; transmission and knowledge rules are unchanged.';}
  const meshes = new Map();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  function announce(data) {
    const role=data.observer;
    document.getElementById('wire-camera-label').textContent=role==='learner'?'Overview camera':`${role[0].toUpperCase()+role.slice(1)}-side camera`;
    const remaining=['ek','c'].filter(id=>!data.sent.includes(id));
    drop.querySelector('small').textContent=remaining.length?`Drop ${remaining.join(' or ')} here`:'Both public objects sent';
    const captured=data.sent;
    const exposed=data.sent.filter(id=>secretIds.includes(id));
    const exposure=document.getElementById('wire-exposure');exposure.textContent=exposed.length?`EXPOSED: ${exposed.join(', ')}. Red packets are secret objects sent by mistake. Eve’s knowledge cards include any resulting inference; more public data cannot recall this capture.`:'Secret objects remain local. Orange packets are intended public objects; red packets illustrate an explicit secret exposure.';exposure.classList.toggle('incorrect',exposed.length>0);
    status.textContent=`${captured.length?'Eve captured '+captured.join(' and ')+'.':'No public objects transmitted yet.'} ${data.known.bob.includes('K')?'Bob has K locally.':'Bob has not decapsulated c yet.'} ${data.known.eve.includes('K')?'Eve knows K in this experiment.':'Eve cannot infer K from the public transcript in this model.'}`;
    sceneDescription=`${role} participant camera. ${status.textContent} Private contents of other participants are Unknown unless known to this observer. No shared secret crosses the channel in the intended exchange.`;if(data.focus)sceneDescription+=` Inspecting captured ${data.focus}.`;host.setAttribute('aria-label',sceneDescription);
    document.getElementById('wire-observer-knowledge').textContent=role==='learner'?'Overview: private state at both endpoints is visible.':`${role.toUpperCase()} KNOWS: ${data.known[role].join(', ')||'no exchange objects yet'} · ${data.known[role].includes('K')?'K: Known':'K: Unknown'} · ${data.known[role].includes('dk')?'dk: Known':'dk: Unknown'}`;
    if(role==='eve'){
      const source=data.sent.includes('K')?'captured directly':data.known.eve.includes('K')?'inferred from captured dk + c':'unavailable from the current capture';
      document.getElementById('wire-observer-knowledge').textContent+=` · K source: ${source}.`;
    }
    for(const token of tokens) token.disabled=data.sent.includes(token.dataset.wireToken);
  }
  try {
    if(!THREE)throw new Error('Three.js unavailable');
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.domElement.setAttribute('aria-hidden','true');host.prepend(renderer.domElement);fallback.hidden=true;
    scene=new THREE.Scene();root=new THREE.Group();scene.add(root);
    camera=new THREE.PerspectiveCamera(43,1,.1,60);
  } catch {
    for(const id of ['wire-turn-left','wire-turn-right','wire-camera-reset'])document.getElementById(id).disabled=true;
    motionControl.disabled=true;document.getElementById('wire-motion-note').textContent='3D motion is unavailable; the experiment controls still work.';
    host.removeAttribute('aria-keyshortcuts');
    host.classList.add('unavailable');fallback.textContent='3D is unavailable. Use the Send buttons and participant knowledge cards below; the same experiment still works.';
    return {render:announce};
  }
  function material(color,opacity=1){return new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity});}
  function sphere(position,color,radius=.16){const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,16,12),material(color));mesh.position.set(...position);root.add(mesh);return mesh;}
  function text(value,position,color='#d9e7ee',scale=1){
    const canvas=document.createElement('canvas');canvas.width=384;canvas.height=100;
    const ctx=canvas.getContext('2d');ctx.font='bold 48px Arial';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,192,62);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthWrite:false,depthTest:false}));sprite.position.set(...position);sprite.scale.set(3.6*scale,.94*scale,1);sprite.userData.label=value;root.add(sprite);
  }
  function line(from,to,color=0x88a8ce){root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from),new THREE.Vector3(...to)]),new THREE.LineBasicMaterial({color,transparent:true,opacity:.6})));}
  function clear(){
    cancelAnimationFrame(frame);frame=0;meshes.clear();
    const geometries=new Set(),materials=new Set(),textures=new Set();
    root.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const m of [].concat(object.material)){materials.add(m);if(m.map)textures.add(m.map);}});
    geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());root.clear();
  }
  function draw(){if(!interrupted&&!disposed)renderer.render(scene,camera);}
  function project(position){const v=new THREE.Vector3(...position).project(camera);return{x:(v.x+1)*host.clientWidth/2,y:(1-v.y)*host.clientHeight/2};}
  function overlays(){
    if(!snapshot||!host.clientWidth)return;
    for(const token of tokens){const point=project(publicPositions[token.dataset.wireToken]);token.style.left=`${point.x}px`;token.style.top=`${point.y}px`;}
    const point=project([0,.65,0]);drop.style.left=`${point.x}px`;drop.style.top=`${point.y}px`;
  }
  function setCamera(role){
    const presets={learner:[0,8,11],alice:[-7,6,8],bob:[7,6,8],eve:[0,5,11]};
    camera.zoom=host.clientWidth>700?1.4:host.clientWidth>400?1.1:.85;camera.updateProjectionMatrix();
    const target=new THREE.Vector3(0,.1,.4);
    camera.position.fromArray(presets[role]).sub(target).applyAxisAngle(new THREE.Vector3(0,1,0),yaw*Math.PI/180).add(target);camera.lookAt(target);camera.updateMatrixWorld();
    document.getElementById('wire-camera-angle').textContent=`Camera offset: ${yaw}°`;

    // Reserve screen space for the 54px drag controls, including narrow side views.
    const extent=Math.max(...Object.values(publicPositions).map(p=>Math.abs(new THREE.Vector3(...p).project(camera).x)));
    const safe=Math.max(.3,1-72/Math.max(host.clientWidth,1));
    if(extent>safe){camera.zoom*=safe/extent;camera.updateProjectionMatrix();}

  }
  function privateLabel(role,key){
    if(!snapshot.known[role].includes(key))return `${key}: not yet`;
    const observer=snapshot.observer;
    if(observer==='learner'||observer===role||snapshot.known[observer]?.includes(key))return `${key}: ${snapshot.known.eve.includes(key)?'exposed':'private'}`;
    return `${key}: Unknown`;
  }
  function build(){
    clear();setCamera(snapshot.observer);
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(4.8,4.8,.07,48),material(0x18313c,.65));platform.position.y=-.6;root.add(platform);
    const labels=[];
    for(const role of ['alice','bob','eve']){
      const [x,y,z]=positions[role],active=snapshot.observer===role;
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.33,.5,.75,16),material(role==='eve'?0xffb15c:active?0xa6f4c5:0x88a8ce,.65));body.position.set(x,y,z);root.add(body);sphere([x,.65,z],role==='eve'?0xffb15c:0xa6f4c5,.23);
      text(role.toUpperCase(),[x,-.85,z],role==='eve'?'#ffb15c':'#a6f4c5',.8);
      const key=privateLabel(role,'K');labels.push(`${role} ${key}`);if(role!=='eve')text(key,[x,1.7,z],key.includes('Unknown')?'#a5b8cc':'#a6f4c5',.68);
      if(role==='bob'){const dk=privateLabel(role,'dk');labels.push(`bob ${dk}`);text(dk,[x,2.15,z],'#a5b8cc',.6);}
      // The marker stays inside the participant area; it never follows a public packet.
      if(snapshot.known[role].includes('K'))sphere([x+.48,.3,z],key.includes('Unknown')?0x526577:0xa6f4c5,.12);
    }
    line([-3,.2,-1],[0,.2,0]);line([3,.2,-1],[0,.2,0]);line([0,.2,0],[0,.2,3],0xffb15c);

    for(const id of ['ek','c'])if(!snapshot.sent.includes(id))meshes.set(id,sphere(publicPositions[id],0xffb15c,.2));
    snapshot.sent.forEach((id,index)=>{
      const x=(index-(snapshot.sent.length-1)/2)*.42;
      sphere([x,.6,2.5],secretIds.includes(id)?0xff6969:0xffb15c,id===snapshot.focus ? .17 : .12);
      if(id===snapshot.focus){const ring=new THREE.Mesh(new THREE.TorusGeometry(.23,.025,8,32),material(0xffffff));ring.position.set(x,.6,2.5);ring.rotation.x=Math.PI/2;root.add(ring);}
    });
    host.setAttribute('aria-label',`${sceneDescription} ${labels.join('. ')}.`);
    overlays();draw();
  }
  function animateTransmissions(ids){
    if(!userMotion||motion.matches||document.hidden||interrupted)return;
    const channel=new THREE.Vector3(0,.7,0),eve=new THREE.Vector3(0,.7,2.5);
    const packets=ids.map(id=>{
      const start=new THREE.Vector3(...origins[id]),end=new THREE.Vector3(...positions[id==='ek'||id==='dk'?'alice':'bob']);end.y=1;
      const color=secretIds.includes(id)?0xff6969:0xffb15c;
      return {start,end,packet:sphere(start.toArray(),color,.15),copy:sphere(start.toArray(),color,.12)};
    });
    const began=performance.now();
    function tick(now){
      const t=Math.min((now-began)/1100,1);
      for(const {start,end,packet,copy} of packets){
        if(t<.5){packet.position.lerpVectors(start,channel,t*2);copy.position.copy(packet.position);}else{packet.position.lerpVectors(channel,end,(t-.5)*2);copy.position.lerpVectors(channel,eve,(t-.5)*2);}
      }
      draw();if(t<1&&userMotion&&!motion.matches&&!document.hidden&&!interrupted)frame=requestAnimationFrame(tick);else{packets.forEach(({packet,copy})=>{packet.visible=false;copy.visible=false;});frame=0;draw();}
    }
    frame=requestAnimationFrame(tick);
  }
  function turn(delta){cancelDrag();yaw=((yaw+delta+540)%360)-180;if(snapshot)build();}
  document.getElementById('wire-turn-left').onclick=()=>turn(-15);
  document.getElementById('wire-turn-right').onclick=()=>turn(15);
  function resetCamera(){cancelDrag();yaw=0;if(snapshot)build();}
  document.getElementById('wire-camera-reset').onclick=resetCamera;
  host.addEventListener('keydown',event=>{
    if(event.target!==host||!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
    event.preventDefault();if(event.key==='Home')resetCamera();else turn(event.key==='ArrowLeft'?-15:15);
  });
  function cancelDrag(){
    if(!drag)return;const {token,pointer}=drag;drag=null;host.classList.remove('dragging');
    if(token.hasPointerCapture?.(pointer))token.releasePointerCapture(pointer);
    if(snapshot)build();
  }
  for(const token of tokens){
    let suppressClick=false;
    token.addEventListener('pointerdown',event=>{
      if(!event.isPrimary||event.button!==0||token.disabled)return;
      drag={token,id:token.dataset.wireToken,pointer:event.pointerId,x:event.clientX,y:event.clientY,moved:false};suppressClick=false;token.setPointerCapture(event.pointerId);host.classList.add('dragging');
    });
    token.addEventListener('pointermove',event=>{
      if(!drag||drag.pointer!==event.pointerId)return;
      if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>6)drag.moved=true;
      const bounds=host.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((event.clientX-bounds.left)/bounds.width*2-1,1-(event.clientY-bounds.top)/bounds.height*2),camera);
      const point=new THREE.Vector3();if(ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-1),point))meshes.get(drag.id)?.position.copy(point);
      token.style.left=`${event.clientX-bounds.left}px`;token.style.top=`${event.clientY-bounds.top}px`;draw();
    });
    token.addEventListener('pointerup',event=>{
      if(!drag||drag.pointer!==event.pointerId)return;
      const pending=drag,rect=drop.getBoundingClientRect();suppressClick=pending.moved;
      const inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      cancelDrag();if(pending.moved&&inside)transmit(pending.id);else if(pending.moved)status.textContent='Nothing sent. Drop the object inside the public channel, or use a Send button.';
    });
    token.addEventListener('click',()=>{if(!suppressClick&&!token.disabled)transmit(token.dataset.wireToken);suppressClick=false;});
    token.addEventListener('pointercancel',()=>{suppressClick=true;cancelDrag();});
    token.addEventListener('lostpointercapture',cancelDrag);
    token.addEventListener('keydown',event=>{if(event.key==='Escape'){suppressClick=true;cancelDrag();}});
  }
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;if(snapshot)setCamera(snapshot.observer);camera.updateProjectionMatrix();renderer.setSize(w,h,false);overlays();draw();}).observe(host);
  syncMotion();motionControl.onchange=()=>{userMotion=motionControl.checked;syncMotion();if(snapshot)build();};
  motion.addEventListener('change',()=>{syncMotion();if(snapshot)build();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;cancelDrag();}else if(snapshot)build();});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();interrupted=true;cancelAnimationFrame(frame);frame=0;cancelDrag();fallback.hidden=false;fallback.textContent='3D was interrupted. Use the Send buttons while the browser restores it.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{interrupted=false;fallback.hidden=true;if(snapshot)build();});
  window.addEventListener('pagehide',()=>{disposed=true;cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',()=>{disposed=false;if(snapshot)build();});
  return {render(data){if(snapshot&&snapshot.observer!==data.observer)yaw=0;const fresh=data.sent.filter(id=>!previous.has(id)&&origins[id]);snapshot=data;previous=new Set(data.sent);drag=null;host.classList.remove('dragging');announce(data);build();if(fresh.length)animateTransmissions(fresh);}};
};

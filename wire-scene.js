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
  const publicPositions = {ek:[3,2.35,-1], c:[-3,2.35,-1]};
  const actorColors={alice:0x78c9ff,bob:0xa6f4c5,eve:0xffb15c};
  const origins = {...publicPositions, dk:[3,1,-1], K:[-3,1,-1], traffic:[-3,1,-1]};
  const secretIds = ['dk','K','traffic'];
  let renderer, scene, camera, root, snapshot, drag=null, frame=0, interrupted=false, suppressClick=false;
  let previous=new Set(), disposed=false, yaw=0, sceneDescription='', userMotion=true;
  const motionControl=document.getElementById('wire-animate');
  function syncMotion(){motionControl.disabled=motion.matches||interrupted;motionControl.checked=userMotion&&!motion.matches;document.getElementById('wire-motion-note').textContent=interrupted?'3D is interrupted. Send buttons and knowledge cards still work.':motion.matches?'System reduced motion is active. Packets update without animated travel.':userMotion?'Packet travel is animated; final knowledge updates immediately.':'Packet travel is off; transmission and knowledge rules are unchanged.';}
  function syncControls(){
    for(const id of ['wire-turn-left','wire-turn-right','wire-camera-reset'])document.getElementById(id).disabled=interrupted;
    if(interrupted)host.removeAttribute('aria-keyshortcuts');else host.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight Home');
    syncMotion();
  }
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
    for(const card of document.querySelectorAll('[data-wire-participant]')){
      const actor=card.dataset.wireParticipant;card.classList.toggle('active',role===actor);
      const lines=actor==='bob'?[privateLabel(actor,'dk',data),privateLabel(actor,'K',data)]:[privateLabel(actor,'K',data)];
      if(actor==='eve')lines.push(`Captured: ${data.sent.join(', ')||'nothing yet'}`);
      card.querySelector('[data-participant-state]').textContent=lines.join('\n');
    }
    renderRoute(data);
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
    const canvas=document.createElement('canvas');canvas.width=192;canvas.height=96;
    const ctx=canvas.getContext('2d');ctx.font='bold 64px Arial';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(value,96,70);
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),depthWrite:false,depthTest:false}));sprite.position.set(...position);sprite.scale.set(1.8*scale,.9*scale,1);root.add(sprite);
  }
  // Each symbolic object keeps its shape in local state, in flight and in capture.
  function objectShape(id,position,scale=1,color=0xffb15c,zone='local'){
    const group=new THREE.Group();group.position.set(...position);group.scale.setScalar(scale);group.userData={object:id,zone};
    const add=(geometry,x=0,y=0,z=0,tint=color)=>{const mesh=new THREE.Mesh(geometry,material(tint));mesh.position.set(x,y,z);group.add(mesh);return mesh;};
    if(id==='ek'){
      add(new THREE.TorusGeometry(.18,.055,8,20),-.2);
      add(new THREE.BoxGeometry(.42,.09,.09),.15);
      add(new THREE.BoxGeometry(.09,.17,.09),.27,-.06);
      add(new THREE.BoxGeometry(.09,.13,.09),.11,-.04);
    }else if(id==='c'){
      const body=add(new THREE.CylinderGeometry(.13,.13,.38,16));body.rotation.z=Math.PI/2;
      add(new THREE.SphereGeometry(.13,12,8),-.19);add(new THREE.SphereGeometry(.13,12,8),.19);
      const seal=add(new THREE.TorusGeometry(.137,.022,6,16),0,0,0,0x18232d);seal.rotation.y=Math.PI/2;
    }else if(id==='dk'){
      add(new THREE.BoxGeometry(.48,.44,.3));
      add(new THREE.BoxGeometry(.39,.35,.035),0,0,.17,0x18313c);
      add(new THREE.TorusGeometry(.09,.026,6,16),0,0,.2);
      add(new THREE.BoxGeometry(.025,.15,.025),0,0,.21);
    }else if(id==='K'){
      add(new THREE.OctahedronGeometry(.27));
    }else{
      add(new THREE.BoxGeometry(.48,.32,.055));
      for(const y of [-.07,.02,.1])add(new THREE.BoxGeometry(.32,.025,.015),0,y,.04,0x18313c);
    }
    root.add(group);return group;
  }
  function line(from,to,color=0x88a8ce,dashed=false){
    const geometry=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...from),new THREE.Vector3(...to)]);
    const stroke=dashed?new THREE.LineDashedMaterial({color,dashSize:.13,gapSize:.09,transparent:true,opacity:.75}):new THREE.LineBasicMaterial({color,transparent:true,opacity:.7});
    const segment=new THREE.Line(geometry,stroke);if(dashed)segment.computeLineDistances();root.add(segment);
  }
  function arrow(from,to,color=0xffb15c,dashed=false){
    if(dashed)line(from,to,color,true);
    const origin=new THREE.Vector3(...from),direction=new THREE.Vector3(...to).sub(origin),length=direction.length();direction.normalize();
    const helper=new THREE.ArrowHelper(direction,origin,length,color,.22,.12);if(dashed)helper.line.visible=false;root.add(helper);
  }
  function renderRoute(data){
    const delivered=data.sent.includes('c'),published=data.sent.includes('ek');
    for(const [step,done] of [['ek',published],['c',delivered],['decaps',delivered],['capture',data.sent.length>0]]){
      const item=document.querySelector(`[data-route-step="${step}"]`);item.dataset.state=done?'complete':'pending';item.removeAttribute('aria-current');
    }
    document.getElementById('wire-packet-route').dataset.stage='settled';
    document.querySelector('[data-route-step="decaps"] span').textContent=delivered?'Complete: Decaps(dk, c) runs inside Bob. K stays local.':data.sent.includes('K')?'No c delivered yet. Bob knows K through the explicit secret exposure.':'Waiting for c. Bob will compute Decaps(dk, c) locally.';
    let captureReason='Public copies do not reveal K under this model’s assumptions.';
    if(data.sent.includes('K'))captureReason='K was captured directly; Eve can derive the traffic key using agreed public context.';
    else if(data.known.eve.includes('K'))captureReason='Eve can recover K from captured dk and matching c, then derive the traffic key.';
    else if(data.sent.includes('dk'))captureReason='The private dk is compromised. Capturing matching c would let Eve recover K; K is not yet recovered.';
    else if(data.sent.includes('traffic'))captureReason='The traffic key was captured directly. This does not by itself reveal K or dk.';
    if(data.sent.includes('traffic')&&data.sent.some(id=>['dk','K'].includes(id)))captureReason+=' The traffic key was also captured directly.';
    document.querySelector('[data-route-step="capture"] span').textContent=data.sent.length?`Captured: ${data.sent.join(', ')}. ${captureReason}`:'No captures yet. Eve receives copies when objects are sent.';
    const exposed=data.sent.filter(id=>secretIds.includes(id));
    document.getElementById('wire-flight-status').textContent=exposed.length?'Secret exposure changes Eve’s knowledge.':delivered?'c delivered · Bob computed K locally.':published?'ek delivered · send public c next.':'Public ek and c travel. K stays inside the endpoints.';
    document.getElementById('wire-path-caption').textContent=exposed.length?`Secret exposure: ${exposed.join(', ')}. Red objects travelled by mistake; this is not the intended public-only exchange.`:delivered?'Public c travels Alice → Bob, with a copy to Eve. Bob computes Decaps(dk, c) locally; K never travels with c.':published?'Public ek travels Bob → Alice, with a copy to Eve. Next, send Alice’s public capsule c.':'Prepared exchange: Alice already holds authenticated ek and has created (K, c). Send ek or c to trace a public object. Arrows show delivery; dashed branches show Eve’s recorded copy.';
  }
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
    const safe=Math.max(.3,1-82/Math.max(host.clientWidth,1));
    if(extent>safe){camera.zoom*=safe/extent;camera.updateProjectionMatrix();}
    const vertical=Math.max(...Object.values(publicPositions).map(p=>Math.abs(new THREE.Vector3(...p).project(camera).y)));
    const safeY=1-88/Math.max(host.clientHeight,100);
    if(vertical>safeY){camera.zoom*=safeY/vertical;camera.updateProjectionMatrix();}
    // Keep every endpoint zone in view when a side camera is rotated.
    const corners=Object.values(positions).flatMap(([x,y,z])=>[-1.05,1.05].flatMap(dx=>[-1.05,1.05].flatMap(dz=>[-.8,1].map(dy=>new THREE.Vector3(x+dx,y+dy,z+dz).project(camera)))));
    const actorExtent=Math.max(...corners.map(v=>Math.max(Math.abs(v.x),Math.abs(v.y))));
    if(actorExtent>.94){camera.zoom*=.94/actorExtent;camera.updateProjectionMatrix();}


  }
  function privateLabel(role,key,data=snapshot){
    if(!data.known[role].includes(key))return `${key}: ${role==='eve'?'Unknown':'not yet'}`;
    const observer=data.observer;
    if(observer==='learner'||observer===role||data.known[observer]?.includes(key))return `${key}: ${data.known.eve.includes(key)?'exposed':'private'}`;
    return `${key}: Unknown`;
  }
  function build(){
    clear();renderRoute(snapshot);setCamera(snapshot.observer);
    const platform=new THREE.Mesh(new THREE.CylinderGeometry(4.8,4.8,.07,48),material(0x132c38,.85));platform.position.y=-.6;root.add(platform);
    const labels=[];
    for(const role of ['alice','bob','eve']){
      const [x,y,z]=positions[role],color=actorColors[role],active=snapshot.observer===role;
      const zone=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.06,32),material(color,active ? .18 : .08));zone.position.set(x,-.47,z);root.add(zone);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(1,.018,6,40),material(color,.65));rim.rotation.x=Math.PI/2;rim.position.set(x,-.42,z);root.add(rim);
      const body=new THREE.Mesh(new THREE.CylinderGeometry(.3,.43,.7,16),material(color,.85));body.position.set(x,y,z);body.userData.participant=role;root.add(body);sphere([x,.64,z],color,.22);
      text(role[0].toUpperCase(),[x,-.7,z+.6],`#${color.toString(16)}`,1);
      const key=privateLabel(role,'K');labels.push(`${role} ${key}`);
      if(role==='bob'){
        labels.push(`bob ${privateLabel(role,'dk')}`);
        objectShape('dk',[x-.7,.1,z],1.1,privateLabel(role,'dk').includes('Unknown')?0x526577:color);
      }
      if(snapshot.known[role].includes('K'))objectShape('K',[x+.65,.2,z],1,key.includes('Unknown')?0x526577:color).userData.actor=role;
      if(snapshot.known[role].includes('traffic'))objectShape('traffic',[x+.65,.05,z+.5],.8,key.includes('Unknown')?0x526577:color).userData.actor=role;
    }
    const route=secretIds.includes(snapshot.focus)?snapshot.focus:snapshot.sent.includes('c')?'c':'ek';
    const origin=origins[route],channel=[0,.9,0],destination=[...positions[route==='ek'||route==='dk'?'alice':'bob']];destination[1]=.9;
    const color=secretIds.includes(route)?0xff6969:0xffb15c;
    arrow(origin,channel,color);arrow(channel,destination,color);arrow(channel,[0,.6,2.35],color,true);
    for(const id of ['ek','c'])if(!snapshot.sent.includes(id))meshes.set(id,objectShape(id,publicPositions[id],1.2,0xffb15c,'public'));
    snapshot.sent.forEach((id,index)=>{
      const x=(index-(snapshot.sent.length-1)/2)*.56;
      objectShape(id,[x,.55,2.35],snapshot.focus===id ? .75 : .58,secretIds.includes(id)?0xff6969:0xffb15c,'capture');
      if(id===snapshot.focus){const ring=new THREE.Mesh(new THREE.TorusGeometry(.27,.025,8,32),material(0xffffff));ring.position.set(x,.55,2.35);ring.rotation.x=Math.PI/2;root.add(ring);}
    });
    host.setAttribute('aria-label',`${sceneDescription} ${labels.join('. ')}. Key shape: ek. Capsule: c. Vault: dk. Diamond: K. Solid arrows show delivery; dashed arrows show Eve’s copy.`);
    overlays();draw();
  }
  function animateTransmissions(ids){
    if(!userMotion||motion.matches||document.hidden||interrupted||disposed)return;
    const channel=new THREE.Vector3(0,.9,0),eve=new THREE.Vector3(0,.6,2.35);
    const packets=ids.map(id=>{
      const start=new THREE.Vector3(...origins[id]),end=new THREE.Vector3(...positions[id==='ek'||id==='dk'?'alice':'bob']);end.y=.9;
      const color=secretIds.includes(id)?0xff6969:0xffb15c;
      return {id,start,end,packet:objectShape(id,start.toArray(),.9,color,'packet'),copy:objectShape(id,start.toArray(),.7,color,'packet-copy')};
    });
    const hasC=ids.includes('c'),publicOnly=ids.every(id=>!secretIds.includes(id));
    let pulse=null,lastStage='';
    if(hasC){pulse=new THREE.Mesh(new THREE.TorusGeometry(.85,.045,8,32),material(0xa6f4c5));pulse.rotation.x=Math.PI/2;pulse.position.set(3,-.38,-1);pulse.visible=false;root.add(pulse);}
    const began=performance.now(),duration=hasC?1900:1400;
    function tick(now){
      const t=Math.min((now-began)/duration,1),travel=Math.min(t/.72,1);
      for(const {start,end,packet,copy} of packets){
        if(travel<.45){packet.position.lerpVectors(start,channel,travel/.45);copy.position.copy(packet.position);}else{packet.position.lerpVectors(channel,end,(travel-.45)/.55);copy.position.lerpVectors(channel,eve,(travel-.45)/.55);}
        packet.visible=travel<1;copy.visible=travel<1;
      }
      const stage=travel<1?'delivery':hasC?'decaps':'capture';
      if(stage!==lastStage){
        lastStage=stage;document.getElementById('wire-packet-route').dataset.stage=stage;
        for(const item of document.querySelectorAll('[data-route-step]'))item.removeAttribute('aria-current');
        const current=stage==='delivery'?(hasC?'c':ids.includes('ek')?'ek':'capture'):stage;document.querySelector(`[data-route-step="${current}"]`)?.setAttribute('aria-current','step');
        document.getElementById('wire-flight-status').textContent=stage==='decaps'?'Bob: Decaps(dk, c) locally.':publicOnly?(hasC?'c → Bob · public copy → Eve.':'ek → Alice · public copy → Eve.'):'Secret exposure · Eve records the objects.';
        document.getElementById('wire-path-caption').textContent=stage==='decaps'?`Bob computes Decaps(dk, c) locally. The diamond K stays inside Bob’s endpoint. ${snapshot.known.eve.includes('K')?'Eve also knows K through the explicit secret exposure in this experiment.':'Eve records c, not K.'}`:publicOnly?'Orange public objects travel to their recipient. The dashed branch records Eve’s copy of the same object.':'Red objects illustrate explicit secret exposure. Eve records these objects too.';
      }
      if(pulse){pulse.visible=stage==='decaps';pulse.scale.setScalar(1+Math.sin((t-.72)/.28*Math.PI)*.2);}
      draw();
      if(t<1&&!document.hidden&&!interrupted&&!disposed)frame=requestAnimationFrame(tick);
      else{for(const {packet,copy} of packets){packet.visible=false;copy.visible=false;}if(pulse)pulse.visible=false;frame=0;renderRoute(snapshot);draw();}
    }
    frame=requestAnimationFrame(tick);
  }
  function turn(delta){cancelDrag();yaw=((yaw+delta+540)%360)-180;if(snapshot)build();}
  document.getElementById('wire-turn-left').onclick=()=>turn(-15);
  document.getElementById('wire-turn-right').onclick=()=>turn(15);
  function resetCamera(){cancelDrag();yaw=0;if(snapshot)build();}
  document.getElementById('wire-camera-reset').onclick=resetCamera;
  host.addEventListener('keydown',event=>{
    if(interrupted||event.target!==host||!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;
    event.preventDefault();if(event.key==='Home')resetCamera();else turn(event.key==='ArrowLeft'?-15:15);
  });
  function cancelDrag(rebuild=true){
    if(!drag)return;const {token,pointer}=drag;drag=null;suppressClick=true;host.classList.remove('dragging');
    if(token.hasPointerCapture?.(pointer))token.releasePointerCapture(pointer);
    if(rebuild&&snapshot)build();
  }
  for(const token of tokens){
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
      cancelDrag();suppressClick=pending.moved;if(pending.moved&&inside)transmit(pending.id);else if(pending.moved)status.textContent='Nothing sent. Drop the object inside the public channel, or use a Send button.';
    });
    token.addEventListener('click',event=>{if((event.detail===0||!suppressClick)&&!token.disabled)transmit(token.dataset.wireToken,event);suppressClick=false;});
    token.addEventListener('pointercancel',()=>{suppressClick=true;cancelDrag();});
    token.addEventListener('lostpointercapture',cancelDrag);
    token.addEventListener('keydown',event=>{if(event.key==='Escape'){suppressClick=true;cancelDrag();}});
  }
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;if(snapshot)setCamera(snapshot.observer);camera.updateProjectionMatrix();renderer.setSize(w,h,false);overlays();draw();}).observe(host);
  syncControls();motionControl.onchange=()=>{userMotion=motionControl.checked;syncMotion();if(snapshot)build();};
  motion.addEventListener('change',()=>{syncMotion();if(snapshot)build();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;cancelDrag();}else if(snapshot)build();});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();interrupted=true;syncControls();cancelAnimationFrame(frame);frame=0;cancelDrag();if(snapshot)renderRoute(snapshot);fallback.hidden=false;fallback.textContent='3D was interrupted. Use the Send buttons while the browser restores it.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{interrupted=false;syncControls();fallback.hidden=true;if(snapshot)build();});
  window.addEventListener('pagehide',()=>{cancelDrag(false);disposed=true;cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',()=>{disposed=false;if(snapshot)build();});
  return {render(data){cancelDrag(false);if(snapshot&&snapshot.observer!==data.observer)yaw=0;const fresh=data.sent.filter(id=>!previous.has(id)&&origins[id]);snapshot=data;previous=new Set(data.sent);announce(data);build();if(fresh.length)animateTransmissions(fresh);}};
};

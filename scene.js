'use strict';
window.createLearningScene = function (container, fallback) {
  const THREE = window.THREE;
  let renderer;
  try {
    if (!THREE) throw new Error('Three.js is unavailable');
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (error) {
    fallback.textContent = '3D is unavailable. Enable WebGL or use a recent browser. All lessons, controls, and the encryption demo still work.';
    return null;
  }
  fallback.hidden = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080e1c, 0.026);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 70);
  camera.position.set(6.8, 4.4, 8.3); camera.lookAt(0, 0, 0);
  const root = new THREE.Group(); scene.add(root);
  const grid = new THREE.GridHelper(24, 30, 0x284854, 0x142c38);
  grid.position.y = -2.3; grid.material.transparent = true; grid.material.opacity = 0.45; scene.add(grid);
  const colors = { mint: 0xa6f4c5, orange: 0xffb15c, blue: 0x88a8ce };
  const state = { mode: 'rsa', noise: 2, phase: 0, algorithm: 'shor', hybrid: true, encrypted: false, rsa: { n: 323, p: 17, q: 19, revealed: false }, observer: 'learner' };
  let movingObject = null, observation = null, noiseLine = null, noiseArrow = null, time = 0, frame = 0, lastTime = 0, dragging = null, lost = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false, paused = motion.matches;
  let inViewport = typeof IntersectionObserver !== 'function';
  function material(color, opacity = 1) { return new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity }); }
  function ball(position, radius, color) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material(color));
    mesh.position.set(...position); root.add(mesh); return mesh;
  }
  function line(points, color = colors.mint, opacity = 0.4) {
    const mesh = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
    root.add(mesh); return mesh;
  }
  function box(position, size, color) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, 0.12));
    mesh.position.set(...position); root.add(mesh);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 }));
    mesh.add(edge); return mesh;
  }
  function label(text, position, color = '#c5d6e7', scale = 1) {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
    const ctx = canvas.getContext('2d'); ctx.font = '28px Arial'; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, 256, 55);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }));
    sprite.userData.text = text; sprite.position.set(...position); sprite.scale.set(3.3 * scale, 0.62 * scale, 1); root.add(sprite); return sprite;
  }
  function clear() {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    root.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) for (const mat of [].concat(object.material)) { materials.add(mat); if (mat.map) textures.add(mat.map); } });
    geometries.forEach(g => g.dispose()); textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose());
    root.clear(); movingObject = observation = noiseLine = noiseArrow = null;
  }
  function makeLattice() {
    const geometry = new THREE.SphereGeometry(0.055, 10, 8);
    const nodeMaterial = material(colors.mint);
    const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
    const context=glowCanvas.getContext('2d');const glow=context.createRadialGradient(32,32,0,32,32,32);
    glow.addColorStop(0,'rgba(255,255,255,.7)');glow.addColorStop(.2,'rgba(255,255,255,.2)');glow.addColorStop(1,'rgba(255,255,255,0)');
    context.fillStyle=glow;context.fillRect(0,0,64,64);
    const haloMaterial=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(glowCanvas),color:colors.mint,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
    const positions = [];
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) for (let z = 0; z < 5; z++) {
      const point = [(x - 2) * 0.85, (y - 2) * 0.85, (z - 2) * 0.85];
      const node = new THREE.Mesh(geometry, nodeMaterial); node.position.set(...point); const halo=new THREE.Sprite(haloMaterial);halo.scale.set(.45,.45,1);node.add(halo);root.add(node);
      for (let axis = 0; axis < 3; axis++) if ([x, y, z][axis] < 4) { const end = [...point]; end[axis] += 0.85; positions.push(...point, ...end); }
    }
    const edgeGeometry = new THREE.BufferGeometry(); edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    root.add(new THREE.LineSegments(edgeGeometry, new THREE.LineBasicMaterial({ color: colors.mint, transparent: true, opacity: 0.32 })));
    if (state.observer !== 'eve') { ball([0.85, 0.85, 0.85], 0.085, colors.mint); label('Reference point', [0.85, 1.3, 0.85], '#a6f4c5', 0.6); }
    observation = ball([0.85, 0.85, 0.85], 0.115, colors.orange);
    noiseLine = line([[0.85,0.85,0.85], [0.85,0.85,0.85]], colors.orange, 0.8);
    noiseArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0.85,0.85,0.85), 0.1, colors.orange, 0.15, 0.09);
    root.add(noiseArrow);
    label('Noisy observation', [1.9, 0.7, 1.6], '#ffb15c', 0.6);
    updateNoise();
  }
  function updateNoise() {
    if (!observation) return;
    const n = state.noise / 5;
    observation.position.set(0.85 + n * 0.85, 0.85 - n * 0.55, 0.85 + n * 0.65);
    const p = noiseLine.geometry.attributes.position;
    p.setXYZ(1, observation.position.x, observation.position.y, observation.position.z); p.needsUpdate = true;
    noiseLine.geometry.computeBoundingSphere();
    const delta = observation.position.clone().sub(new THREE.Vector3(0.85,0.85,0.85));
    noiseLine.visible = state.observer !== 'eve' && n > 0;
    noiseArrow.visible = state.observer !== 'eve' && n > 0;
    if (n > 0) { noiseArrow.setDirection(delta.clone().normalize()); noiseArrow.setLength(delta.length(), Math.min(0.15, delta.length() * 0.3), Math.min(0.09, delta.length() * 0.2)); }
  }
  function makeModel() {
    clear();
    if (state.mode === 'lattice') makeLattice();
    if (state.mode === 'rsa') {
      const { n, p, q, revealed } = state.rsa;
      const visible = state.observer === 'bob' || (state.observer === 'learner' && revealed);
      ball([0, 1.2, 0], 0.6, colors.mint); label(`N = ${n}`, [0, 2.25, 0]);
      ball([-2.1, -1, 0], 0.4, visible ? colors.orange : colors.blue); ball([2.1, -1, 0], 0.4, visible ? colors.orange : colors.blue);
      label(visible ? `p = ${p}` : 'p = ?', [-2.1, -1.85, 0], visible ? '#ffb15c' : '#9eb0c8', 0.8);
      label(visible ? `q = ${q}` : 'q = ?', [2.1, -1.85, 0], visible ? '#ffb15c' : '#9eb0c8', 0.8);
      line([[-2.1,-1,0],[0,1.2,0],[2.1,-1,0]], colors.mint, 0.5);
      label(visible ? `${p} × ${q} = ${n}` : 'public product / hidden factors', [0, -2.5, 0], '#9eb0c8', 0.9);
    }
    if (state.mode === 'quantum') {
      const points = [];
      for (let i = 0; i <= 180; i++) { const x = i / 180 * 7 - 3.5; points.push([x, Math.sin(x * (state.algorithm === 'shor' ? 3 : 1.3)) * 0.85, Math.cos(x * 3) * 0.6]); }
      line(points, colors.mint, 0.8);
      line([[-3.7,0,0],[3.7,0,0]], colors.blue, 0.3);
      for (let x = -3; x <= 3; x += 1.5) { ball([x, 0, 0], 0.07, colors.orange); line([[x,-1.3,0],[x,1.3,0]], colors.orange, 0.25); }
      label(state.algorithm === 'shor' ? 'SHOR / PERIODIC STRUCTURE' : 'GROVER / SEARCH AMPLIFICATION', [0, 1.9, 0]);
      label('illustration only — no quantum computation', [0,-1.9,0], '#9eb0c8', 0.9);
      movingObject = ball([-3,0.5,0], 0.12, colors.orange);
    }
    if (state.mode === 'kem') {
      box([-2.5,0,0], [1.3,1.6,1.3], colors.mint); box([2.5,0,0], [1.3,1.6,1.3], colors.mint);
      label('ALICE', [-2.5,-1.35,0], '#a6f4c5', 0.8); label('BOB', [2.5,-1.35,0], '#a6f4c5', 0.8);
      line([[-1.8,0,0],[1.8,0,0]], colors.blue, 0.35);
      box([0,-0.5,2.8], [0.8,1,0.8], colors.orange);label('EVE / PUBLIC CAPTURE', [0,-1.35,2.8], '#ffb15c',0.65);
      const alicePrivate = state.observer === 'learner' || state.observer === 'alice';
      const bobPrivate = state.observer === 'learner' || state.observer === 'bob';
      if (state.phase === 0) {
        label('ek: Bob → Alice', [0,0.8,0], '#ffb15c',0.75);
        movingObject = ball([1.8,0,0],0.14,colors.orange);
      } else if (state.phase === 1) {
        label('c: Alice → Bob', [0,0.8,0], '#ffb15c',0.75);
        movingObject = box([-1.8,0,0],[0.45,0.45,0.45],colors.orange);
      } else {
        label('no secret crosses the channel', [0,-0.65,0], '#9eb0c8',0.7);
        label(state.phase === 2 ? 'Decaps: local at Bob' : 'KDF: local at each endpoint', [0,0.9,0], '#c5d6e7',0.75);
      }
      if (state.phase >= 1 && alicePrivate) { ball([-2.5,1.4,0],0.15,colors.mint); label(state.phase === 3 ? 'traffic key: private' : 'K: private', [-2.5,2,0], '#a6f4c5',0.7); }
      if (bobPrivate) { ball([2.5,1.4,0],0.15,colors.mint); label(state.phase >= 2 ? (state.phase === 3 ? 'traffic key: private' : 'K: private') : 'dk: private', [2.5,2,0], '#a6f4c5',0.7); }
      if (state.observer === 'eve') label(state.phase===0?'EVE sees ek; no c yet':'EVE sees ek and c only', [0,2,0], '#ffb15c',0.85);
    }
    if (state.mode === 'aes') {
      box([0,0,0], [3.2,1.8,0.8], colors.orange);
      line([[-1.6,0.9,0.42],[0,-0.3,0.42],[1.6,0.9,0.42]], colors.orange,0.7);
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.42,0.07,8,32,Math.PI),material(colors.mint)); arc.position.set(0,0.1,0.6); root.add(arc);
      box([0,-0.05,0.65],[0.85,0.6,0.15],colors.mint);
      label(state.encrypted ? 'ENCRYPTED + VERIFIED' : 'MESSAGE + AUTHENTICATION TAG', [0,1.65,0], '#ffb15c',0.9);
      label('secret AES key stays at the endpoints', [0,-1.6,0], '#a6f4c5',0.85);
    }
    if (state.mode === 'migration') {
      const ring = (x,color) => { const mesh = new THREE.Mesh(new THREE.TorusGeometry(1.35,0.055,8,72),material(color)); mesh.position.set(x,0,0); root.add(mesh); };
      ring(state.hybrid ? -0.8 : 0,colors.blue);
      if (state.hybrid) ring(0.8,colors.mint);
      label(state.hybrid ? 'CLASSICAL + POST-QUANTUM' : 'CLASSICAL COMPONENT ONLY', [0,2,0], '#c5d6e7',0.9);
      label(state.hybrid ? 'a specified protocol combiner matters' : 'vulnerable public-key math remains', [0,-2,0], '#9eb0c8',0.8);
      movingObject = ball([0,0,0.1],0.16,state.hybrid ? colors.mint : colors.orange);
    }
    container.setAttribute('aria-label', `${state.mode} educational model. ${root.children.filter(object => object.userData.text).map(object => object.userData.text).join('. ')}. Drag or use arrow keys to rotate.`);
  }
  function participantCamera() {
    const presets = {learner:[6.8,4.4,8.3],alice:[-7,4.4,7],bob:[7,4.4,7],eve:[0,5.5,10]};
    camera.position.set(...(state.mode === 'kem' ? presets[state.observer] : presets.learner));
    camera.lookAt(0,0,0);
  }
  function draw() { if (!lost) renderer.render(scene, camera); }
  function animate(now) {
    frame = 0;
    if (paused || document.hidden || lost || !inViewport) return;
    const delta = lastTime ? Math.min((now-lastTime)/1000,0.05) : 0; lastTime = now; time += delta;
    if (!dragging && state.mode !== 'kem') root.rotation.y += delta * (state.mode === 'lattice' ? 0.06 : 0.025);
    if (movingObject) {
      if (state.mode === 'kem') movingObject.position.x = (state.phase === 0 ? 1 : -1) * (1.8 - ((time * 0.3) % 1) * 3.6);
      if (state.mode === 'quantum') movingObject.position.set(Math.sin(time * 0.6) * 3, Math.sin(time * 2) * 0.85, 0.4);
      if (state.mode === 'migration') movingObject.position.set(Math.cos(time)*0.7,Math.sin(time)*0.7,0.2);
    }
    draw(); frame = requestAnimationFrame(animate);
  }
  function schedule() { if (!frame && !paused && !document.hidden && !lost && inViewport) { lastTime = 0; frame = requestAnimationFrame(animate); } }
  function syncPause() { const button=document.getElementById('pause'); button.textContent=paused?'Play motion':'Pause motion'; button.setAttribute('aria-pressed',String(paused)); }
  const api = {
    select(mode) { state.mode=mode; camera.zoom=container.clientWidth<500?0.95:(mode==='lattice'?1.5:1.05);camera.updateProjectionMatrix(); root.rotation.set(0,0,0); participantCamera(); time=0; makeModel(); draw(); schedule(); },
    set(name,value) { state[name]=value; if(name==='observer'&&state.mode==='kem'){root.rotation.set(0,0,0);participantCamera();} if (name==='noise') updateNoise(); else makeModel(); draw(); },
    reset() { root.rotation.set(0,0,0); participantCamera(); draw(); },
    togglePause() { userPaused=!userPaused; paused=userPaused||motion.matches; if (paused) { cancelAnimationFrame(frame); frame=0; } syncPause(); schedule(); }
  };
  document.getElementById('reset').addEventListener('click',api.reset);
  document.getElementById('pause').addEventListener('click',api.togglePause);
  motion.addEventListener('change',event => { paused=userPaused||event.matches; if (paused) { cancelAnimationFrame(frame); frame=0; } syncPause(); schedule(); });
  document.addEventListener('visibilitychange',() => { if (document.hidden) { cancelAnimationFrame(frame); frame=0; } else schedule(); });
  if (typeof IntersectionObserver === 'function') new IntersectionObserver(entries => {
    inViewport = entries.some(entry => entry.isIntersecting);
    if (inViewport) schedule();
    else { cancelAnimationFrame(frame); frame=0; lastTime=0; }
  }).observe(container);
  new ResizeObserver(() => {
    const {width,height}=container.getBoundingClientRect(); if (!width || !height) return;
    camera.aspect=width/height; camera.zoom=width<500?0.95:(state.mode==='lattice'?1.5:1.05); camera.updateProjectionMatrix(); renderer.setSize(width,height,false); draw();
  }).observe(container);
  container.addEventListener('pointerdown',event => { if (!event.isPrimary || event.button!==0) return; dragging={id:event.pointerId,x:event.clientX,y:event.clientY}; container.setPointerCapture(event.pointerId); });
  container.addEventListener('pointermove',event => { if (!dragging || event.pointerId!==dragging.id) return; root.rotation.y+=(event.clientX-dragging.x)*0.006; root.rotation.x=THREE.MathUtils.clamp(root.rotation.x+(event.clientY-dragging.y)*0.004,-0.7,0.7); dragging.x=event.clientX;dragging.y=event.clientY;draw(); });
  for (const event of ['pointerup','pointercancel','lostpointercapture']) container.addEventListener(event,()=>{dragging=null;});
  container.addEventListener('keydown',event => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return; event.preventDefault(); if (event.key==='ArrowLeft') root.rotation.y-=0.15; if (event.key==='ArrowRight') root.rotation.y+=0.15; if (event.key==='ArrowUp') root.rotation.x=Math.max(-0.7,root.rotation.x-0.1); if (event.key==='ArrowDown') root.rotation.x=Math.min(0.7,root.rotation.x+0.1);draw(); });
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;fallback.hidden=false;fallback.textContent='The 3D context was interrupted. The lesson remains available while the browser restores it.';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;fallback.hidden=true;draw();schedule();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',schedule);
  syncPause(); return api;
};

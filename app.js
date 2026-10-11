'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const lessons = window.LESSONS;
  const scene = window.createLearningScene($('scene'), $('fallback'));
  if (!scene) { $('pause').disabled=true; $('reset').disabled=true; }
  let chapter=0, renderVersion=0, observer='learner', rsa={n:323,p:17,q:19,revealed:false}, phase=0;
  const journey=window.createMessageJourney();
  let refreshAes=()=>{};
  function updateObserver(){
    document.querySelectorAll('[data-observer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.observer===observer)));
    setScene('observer',observer);journey.setObserver(observer);refreshAes();
    const descriptions=chapter===0?['Public N and public exponent; no private factors.','Private factors and private exponent.','Public N. Tiny examples can be factored by hand; real RSA needs cryptographic sizes.']:chapter===3?['Authenticated ek'+(phase>=1?'; local K and ciphertext c.':'.'), 'Private dk'+(phase>=2?'; decapsulated K.':'; published ek.'), 'Published ek and transmitted c; no dk or K.']:['Public protocol data and Alice’s local secrets.','Public protocol data and Bob’s local secrets.','Public observations and transmitted data. Secrets are hidden in this teaching view; the browser itself is not a security boundary.'];
    $('observer-panel').replaceChildren(...['alice','bob','eve'].map((name,i)=>{const article=make('article',undefined,observer===name?'active':'');article.append(make('h3',name.toUpperCase()+(name==='eve'?' · ATTACKER':'')),make('p',descriptions[i]));return article;}));
    if(chapter===0)refreshRsa();
    if(chapter===3)$('scene-annotation').textContent=['PUBLIC ek: BOB → ALICE','PUBLIC c: ALICE → BOB','LOCAL: BOB DECAPSULATES','LOCAL: ENDPOINTS DERIVE KEYS'][phase]+' · Illustrative protocol state';
  }
  function refreshRsa(){
    const visible=observer==='bob'||(observer==='learner'&&rsa.revealed);
    $('formula').textContent=visible?`${rsa.n} = ${rsa.p} × ${rsa.q}`:`N = ${rsa.n} = p × q; private factors hidden`;
    $('scene-annotation').textContent=visible?'The product and both factors now match your selected example.':'The public product is visible. Private factors stay hidden in this perspective.';
    $('rsa-result').textContent=visible?`${rsa.n} = ${rsa.p} × ${rsa.q}. Tiny educational example, not secure RSA.`:'Choose Learner and reveal, or Bob, to inspect the private factors.';
    $('reveal-factors').disabled=observer!=='learner';setScene('rsa',rsa);
  }
  const setScene=(key,value)=>scene?.set(key,value);
  const make=(tag,text,className)=>{const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(className)element.className=className;return element;};
  lessons.forEach((lesson,index)=>{
    const button=make('button',undefined,'chapter');button.dataset.chapter=index;button.append(make('span',String(index+1).padStart(2,'0')),document.createTextNode(lesson.name));button.addEventListener('click',()=>select(index));$('chapters').append(button);
  });
  function renderRsa(parent) {
    const row=make('label',undefined,'interaction-label');row.htmlFor='rsa-product';row.append(document.createTextNode('Try another product'));const select=make('select');select.id='rsa-product';select.style.cssText='background:#0c1724;color:#a6f4c5;border:1px solid #2b3e51;padding:8px;font:13px monospace';
    const products=[[323,17,19],[899,29,31],[1763,41,43]];for(const [value] of products){const option=make('option',String(value));option.value=value;select.append(option);}row.append(select);parent.append(row);
    const button=make('button','Reveal the factors');button.id='reveal-factors';const result=make('p','The real difficulty appears at cryptographic sizes.','micro');result.id='rsa-result';parent.append(button,result);
    rsa={n:323,p:17,q:19,revealed:false};
    button.addEventListener('click',()=>{rsa.revealed=true;refreshRsa();});
    select.addEventListener('change',()=>{const [n,p,q]=products.find(item=>item[0]===Number(select.value));rsa={n,p,q,revealed:false};refreshRsa();});refreshRsa();
  }
  function renderQuantum(parent) {
    const buttons=make('div',undefined,'choice-buttons');const description=make('p',undefined,'micro');description.id='attack-description';
    const values=[['shor','Shor','Factoring and discrete logarithms: a structural threat to RSA, DH, and ECC.'],['grover','Grover','Generic search: an idealized square-root query reduction, not an instant AES break.']];
    values.forEach(([value,name,text],index)=>{const button=make('button',name);button.dataset.algorithm=value;button.setAttribute('aria-pressed',String(index===0));button.addEventListener('click',()=>{buttons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));description.textContent=text;setScene('algorithm',value);});buttons.append(button);});
    description.textContent=values[0][2];parent.append(buttons,description);setScene('algorithm','shor');
  }
  function renderNoise(parent) {
    const label=make('label',undefined,'interaction-label');label.htmlFor='noise';label.append(document.createTextNode('Noise level'));const output=make('output','2');output.id='noise-value';output.htmlFor='noise';label.append(output);
    const input=make('input');input.id='noise';input.type='range';input.min=0;input.max=5;input.step=0.1;input.value=2;input.setAttribute('aria-describedby','noise-description');
    const description=make('p','Move the orange observation away from a fixed lattice point. This is a visual scale, not an ML-KEM parameter.','micro');description.id='noise-description';
    input.addEventListener('input',()=>{output.value=input.value;setScene('noise',Number(input.value));const distance=Number(input.value)/5*Math.hypot(.85,.55,.65);description.textContent=`Observation displacement: ${distance.toFixed(3)} illustration units. This is not an ML-KEM parameter or a security score.`;});parent.append(label,input,description);setScene('noise',2);
  }
  function renderKem(parent) {
    const stages=[['KeyGen','Bob creates ek and dk. Only ek is published; dk remains private.'],['Encaps','Alice uses Bob’s authenticated ek to generate secret K and ciphertext c.'],['Decaps','Bob applies dk to c and obtains the same K for a valid encapsulation.'],['Derive','The protocol derives traffic keys from K, then protects messages with AES-GCM.']];
    const buttons=make('div',undefined,'phase-buttons');const description=make('p',stages[0][1],'phase-description');description.id='phase-description';description.setAttribute('aria-live','polite');
    stages.forEach(([name,text],index)=>{const button=make('button',`${index+1} · ${name}`);button.dataset.phase=index;button.setAttribute('aria-pressed',String(index===0));button.addEventListener('click',()=>{buttons.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));description.textContent=text;phase=index;setScene('phase',index);updateObserver();});buttons.append(button);});
    parent.append(buttons,description,make('p','Protocol illustration only. No real ML-KEM operation is executed.','micro'));phase=0;setScene('phase',0);
  }
  function renderAes(parent,version) {
    const label=make('label','Your message','demo-label');label.htmlFor='message';const input=make('textarea');input.id='message';input.maxLength=500;input.value='The future should not reveal today’s secrets.';input.setAttribute('aria-describedby','aes-note');
    const actions=make('div',undefined,'demo-actions');const encrypt=make('button','Encrypt & decrypt','primary');encrypt.id='encrypt';const tamper=make('button','Test a modified ciphertext');tamper.id='tamper';tamper.hidden=true;actions.append(encrypt,tamper);
    const note=make('p','Real AES-256-GCM · fresh random key + 96-bit nonce · local only · no ML-KEM','micro');note.id='aes-note';const status=make('p','','micro');status.id='aes-status';status.setAttribute('role','status');const output=make('div',undefined,'demo-output');output.id='aes-output';output.hidden=true;
    parent.append(label,input,actions,note,status,output);
    let result=null,attempt=0,draft=input.value;
    refreshAes=()=>{input.disabled=observer==='eve';input.value=observer==='eve'?'':(result?.plain||'The future should not reveal today’s secrets.');if(result){output.replaceChildren(make('span','PUBLIC CIPHERTEXT + TAG (BASE64)'),document.createTextNode(btoa(String.fromCharCode(...new Uint8Array(result.cipher)))),make('span','PUBLIC NONCE (BASE64)'),document.createTextNode(btoa(String.fromCharCode(...result.iv))));if(observer!=='eve')output.append(make('span','RECOVERED MESSAGE'),document.createTextNode(result.plain||'(empty message)'));}encrypt.disabled=observer==='eve';};
    input.addEventListener('input',()=>{draft=input.value;attempt++;result=null;tamper.hidden=true;output.hidden=true;status.textContent='';setScene('encrypted',false);});
    encrypt.addEventListener('click',async()=>{
      const currentAttempt=++attempt;const message=input.value;result=null;output.hidden=true;tamper.hidden=true;encrypt.disabled=true;status.textContent='Encrypting locally…';
      const isCurrent=()=>version===renderVersion&&currentAttempt===attempt;
      try {
        if(!window.crypto?.subtle)throw new Error('Web Crypto requires a supported browser and a secure context such as localhost.');
        const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
        const iv=crypto.getRandomValues(new Uint8Array(12));const bytes=new TextEncoder().encode(message);const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:128},key,bytes);
        const recovered=await crypto.subtle.decrypt({name:'AES-GCM',iv,tagLength:128},key,cipher);
        const plain=new TextDecoder().decode(recovered);if(plain!==message)throw new Error('The round-trip comparison failed.');if(!isCurrent())return;
        result={key,iv,cipher,plain};output.replaceChildren(make('span','CIPHERTEXT + 128-BIT AUTHENTICATION TAG (BASE64)'),document.createTextNode(btoa(String.fromCharCode(...new Uint8Array(cipher)))),make('span','NONCE (BASE64)'),document.createTextNode(btoa(String.fromCharCode(...iv))),make('span','RECOVERED MESSAGE'),document.createTextNode(plain||'(empty message)'));
        output.hidden=false;tamper.hidden=false;status.textContent=`Verified: ${bytes.length} plaintext bytes → ${cipher.byteLength} ciphertext/tag bytes. The recovered message matches exactly.`;setScene('encrypted',true);refreshAes();
      }catch(error){if(isCurrent())status.textContent=error.message;}finally{if(version===renderVersion)encrypt.disabled=observer==='eve';}
    });
    tamper.addEventListener('click',async()=>{
      if(!result)return;const snapshot=result;const modified=new Uint8Array(snapshot.cipher.slice(0));modified[0]^=1;
      try {await crypto.subtle.decrypt({name:'AES-GCM',iv:snapshot.iv,tagLength:128},snapshot.key,modified);if(version===renderVersion&&result===snapshot)status.textContent='Unexpected result: modified ciphertext was accepted.';}
      catch{if(version===renderVersion&&result===snapshot)status.textContent='Tampering detected: changing one ciphertext byte made authentication fail. No plaintext was accepted.';}
    });setScene('encrypted',false);
  }
  function renderMigration(parent) {
    const label=make('label',undefined,'toggle-row');const checkbox=make('input');checkbox.type='checkbox';checkbox.id='hybrid';checkbox.checked=true;label.append(checkbox,document.createTextNode('Show a hybrid transition'));const text=make('p','Combines classical and post-quantum components within a specified protocol. The combiner and authentication still matter.','micro');text.id='hybrid-description';
    checkbox.addEventListener('change',()=>{setScene('hybrid',checkbox.checked);text.textContent=checkbox.checked?'Combines classical and post-quantum components within a specified protocol. The combiner and authentication still matter.':'Classical-only public-key protection retains the Shor-related risk. This toggle illustrates composition, not a production security test.';});parent.append(label,text);setScene('hybrid',true);
  }
  const renderers={rsa:renderRsa,quantum:renderQuantum,noise:renderNoise,kem:renderKem,aes:renderAes,migration:renderMigration};
  function select(index) {
    chapter=Math.max(0,Math.min(lessons.length-1,index));renderVersion++;refreshAes=()=>{};const lesson=lessons[chapter];
    document.querySelectorAll('[data-chapter]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.chapter)===chapter)));
    $('chapter-count').textContent=`CHAPTER ${String(chapter+1).padStart(2,'0')} / 06`;$('lesson-title').textContent=lesson.title;$('summary').replaceChildren(...lesson.summary.map(text=>make('p',text)));$('formula').textContent=lesson.formula;
    $('scene').setAttribute('aria-label',`${lesson.name}: ${lesson.title} Illustrative 3D model. Drag or use arrow keys to rotate.`);$('scene-annotation').textContent=lesson.annotation;
    $('legend').replaceChildren(...lesson.legend.map((text,index)=>{const item=make('span',undefined,'legend-item');item.append(make('span','','dot'+(index?' orange':'')),document.createTextNode(text));return item;}));
    scene?.select(lesson.scene);$('interaction').replaceChildren();renderers[lesson.interaction]($('interaction'),renderVersion);
    $('deep-dive').replaceChildren(...lesson.deep.map(([title,text],index)=>{const article=make('article',undefined,'deep-item');const heading=make('h3');const icon=make('span',['◇','≋','△'][index],'deep-icon');icon.setAttribute('aria-hidden','true');heading.append(icon,document.createTextNode(title));article.append(heading,make('p',text));return article;}));
    const details=make('div',undefined,'details-grid');lesson.details.forEach(([title,html])=>{const article=make('article',undefined,'detail-block');article.append(make('h3',title));const content=make('div');content.innerHTML=html;article.append(content);details.append(article);});$('details-content').replaceChildren(details);
    $('question').textContent=lesson.question;const answers=$('answers');answers.replaceChildren(make('legend','Choose an answer','sr-only'));
    lesson.options.forEach((text,index)=>{const label=make('label',undefined,'answer');const input=make('input');input.type='radio';input.name='answer';input.value=index;label.append(input,document.createTextNode(text));answers.append(label);});$('feedback').textContent='';$('feedback').className='';$('previous').disabled=chapter===0;$('next').disabled=chapter===lessons.length-1;updateObserver();
  }
  $('previous').addEventListener('click',()=>select(chapter-1));$('next').addEventListener('click',()=>select(chapter+1));
  $('quiz').addEventListener('change',()=>{$('feedback').textContent='';$('feedback').className='';});
  $('quiz').addEventListener('submit',event=>{event.preventDefault();const selected=$('answers').querySelector('input:checked');if(!selected){$('feedback').textContent='Choose an answer first.';$('feedback').className='incorrect';return;}const lesson=lessons[chapter];const correct=Number(selected.value)===lesson.correct;$('feedback').textContent=(correct?'Correct. ':'Not quite. ')+lesson.feedback;$('feedback').className=correct?'correct':'incorrect';});
  document.querySelectorAll('[data-observer]').forEach(button=>button.addEventListener('click',()=>{observer=button.dataset.observer;updateObserver();}));
  const initial=Number(new URLSearchParams(location.search).get('chapter'));select(Number.isInteger(initial)&&initial>=1&&initial<=6?initial-1:0);
})();

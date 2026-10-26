'use strict';
window.createLearningCheck = function () {
  const $=id=>document.getElementById(id),key='post-quantum-lab.check.v1';
  const concepts=[
    ['KEM purpose','What does Encaps produce for Alice?','You need to protect a long chat message. What role does ML-KEM fill?',
     ['A shared secret K and a public KEM ciphertext c','Establish secret material; derive traffic keys and use AEAD for the message'],
     ['An encrypted chat message and Bob’s private key','Encrypt the entire chat message directly'],['A signature proving Bob’s identity','Replace both authentication and AEAD'],
     'A KEM establishes secret material. Key derivation and authenticated symmetric encryption protect application messages.','#message-journey','Follow Message Journey'],
    ['Passive observation','Eve copies public ek and c. Under the model’s security assumptions, what does she learn?','A passive recorder saves the valid public transcript. Which statement follows?',
     ['The public transcript, without learning K','Copying a KEM ciphertext does not by itself recover its shared secret'],
     ['K, because every ciphertext contains readable secrets','Eve automatically obtains K from the copied bytes'],['Bob’s private dk','The public ek must be kept secret for the KEM to work'],
     'Public ek and c are expected to be observable. This does not promise security after secret exposure or against every future attack.','#build-the-wire','Inspect Eve’s public capture'],
    ['Local decapsulation','Alice has sent c, but Bob has not run Decaps. Does Bob already hold K in this staged model?','Bob receives c. Which operation obtains its corresponding K?',
     ['No; he has dk and c, but has not decapsulated yet','Bob runs Decaps locally with his matching private dk and c'],
     ['Yes; receipt of c is the same as decapsulation','Eve sends K to Bob in plaintext'],['No; Alice must transmit her K directly','Alice reveals Bob’s private dk to the network'],
     'Receiving public bytes and computing a local secret are distinct steps. The intended transcript does not transmit K or dk.','#double-encapsulation','Compare local decapsulation'],
    ['Identity binding','Alice accepts Eve’s key labeled “Bob” without checking ownership. What can happen?','A substituted key allows Eve to decapsulate Alice’s K. What was missing?',
     ['Alice can establish a secret with Eve instead of Bob','Authentication binding the encapsulation key to the intended Bob'],
     ['Successful encapsulation guarantees the key belongs to Bob','A larger AES key would authenticate Bob'],['This requires breaking the ML-KEM mathematics','This proves the KEM mathematics was broken'],
     'A successful KEM operation does not authenticate a claimed identity. Check the public key’s identity binding before encapsulation.','#key-substitution-story','Trace the substituted key'],
    ['Secret exposure','Eve obtains matching dk and c. What follows in this teaching model?','Why does “we never sent K” fail after dk and matching c are exposed?',
     ['She can decapsulate K and derive the traffic key using public context','K can be recovered by decapsulation even when K was not transmitted directly'],
     ['K remains safe solely because it was never transmitted','Only directly transmitted secrets can ever be learned'],['A traffic key alone reveals every private dk','All public-key algorithms provide forward secrecy after static dk exposure'],
     'Follow the inference chain dk + matching c → K → traffic key. A traffic key alone does not reverse that chain to dk.','#build-the-wire','Experiment with private-key exposure'],
    ['Replay freshness','An unchanged old packet has a valid GCM tag. Is that sufficient to accept it as new?','The same authentic packet arrives twice. What additional protocol policy can reject the duplicate?',
     ['No; the receiver also needs an authenticated freshness policy','Track authenticated sequence/session information and reject duplicates'],
     ['Yes; a valid tag proves a packet has never been received','Increase AES key size to remember deliveries'],['A quantum-resistant KEM automatically rejects replay','Treat every valid tag as a fresh delivery'],
     'AEAD authenticates bytes; it does not by itself remember delivery history. Freshness requires correctly bound protocol state.','#attack-playground','Compare replay policies']
  ];
  let results={version:1,before:null,after:null},persistent=true;
  const valid=value=>Array.isArray(value)&&value.length===6&&value.every(x=>typeof x==='boolean');
  function decode(raw){try{if(!raw||raw.length>1000)return {version:1,before:null,after:null};const x=JSON.parse(raw);if(x.version===1&&valid(x.before)&&(x.after===null||valid(x.after)))return {version:1,before:x.before,after:x.after||null};}catch{}return {version:1,before:null,after:null};}
  try{results=decode(localStorage.getItem(key));}catch{persistent=false;}
  const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
  function clearError(){ $('assessment-error').textContent='';$('assessment-fields').querySelectorAll('select').forEach(e=>{e.removeAttribute('aria-invalid');e.removeAttribute('aria-describedby');}); }
  function renderForm(){
    clearError();const after=$('assessment-phase').value==='after';$('assessment-fields').replaceChildren();
    concepts.forEach((c,i)=>{const field=node('div'),label=node('label',`${i+1}. ${c[after?2:1]}`),select=node('select');select.id=`assessment-answer-${i}`;label.htmlFor=select.id;
      const options=[['','Choose an answer…'],['wrong-a',c[4][after?1:0]],['correct',c[3][after?1:0]],['wrong-b',c[5][after?1:0]]];
      // Alternate the visible order; position is not the answer across concepts or phases.
      if((i+(after?1:0))%2)options.splice(1,3,options[3],options[1],options[2]);
      options.forEach(([value,text])=>{const o=node('option',text);o.value=value;select.append(o);});const preview=node('p');preview.id=`assessment-choice-${i}`;preview.className='coach-choice';preview.hidden=true;select.addEventListener('change',()=>{preview.textContent=select.value?select.selectedOptions[0].textContent:'';preview.hidden=!select.value;});field.append(label,select,preview);$('assessment-fields').append(field);
    });
    $('assessment-submit').disabled=!after&&!!results.before;
  }
  function renderResults(){
    const score=v=>v.filter(Boolean).length,old=results.before,latest=results.after;
    $('assessment-phase').querySelector('[value="after"]').disabled=!old;
    $('assessment-summary').textContent=old?`Before: ${score(old)} / 6${latest?` · After: ${score(latest)} / 6 · Change: ${score(latest)-score(old)>=0?'+':''}${score(latest)-score(old)} / 6`:' · Complete experiments, then take the after check.'}`:'No baseline recorded. Try the before check before opening the suggested experiments.';
    $('assessment-storage').textContent=persistent?'Only first-before/latest-after correctness by concept is saved in this browser. No answer text, notes, messages or keys.':'Storage unavailable: comparison results are session-only.';
    $('assessment-results').replaceChildren();if(!old)return;
    concepts.forEach((c,i)=>{const li=node('li'),state=!latest?(old[i]?'correct':'review'):latest[i]?(old[i]?'retained':'improved'):(old[i]?'needs-review':'still-review');li.dataset.change=state;
      li.append(node('strong',`${c[0]} · ${state.replaceAll('-',' ')}`));
      li.append(node('p',latest?c[6]:old[i]?'Correct on this check. Try explaining the reasoning in an independent mission.':c[6]));
      const a=node('a',c[8]+' →');a.href=c[7];li.append(a);$('assessment-results').append(li);
    });
  }
  function save(){if(persistent)try{localStorage.setItem(key,JSON.stringify(results));}catch{persistent=false;}renderResults();}
  $('assessment-phase').onchange=renderForm;
  $('assessment-form').onchange=clearError;
  $('assessment-form').onsubmit=event=>{
    event.preventDefault();clearError();const phase=$('assessment-phase').value;if(phase==='after'&&!results.before)return;if(phase==='before'&&results.before)return;
    const fields=[...$('assessment-fields').querySelectorAll('select')],missing=fields.filter(e=>!e.value);
    if(missing.length){$('assessment-error').textContent='Answer all six questions before submitting. Your first baseline is saved only after a complete submission.';missing.forEach(e=>{e.setAttribute('aria-invalid','true');e.setAttribute('aria-describedby','assessment-error');});missing[0].focus();return;}
    results[phase]=fields.map(e=>e.value==='correct');save();window.completeLearning(`check-${phase}`);$('assessment-submit').disabled=phase==='before';$('assessment-summary').focus({preventScroll:true});
  };
  function reset(){results={version:1,before:null,after:null};try{localStorage.removeItem(key);}catch{persistent=false;}$('assessment-phase').value='before';renderForm();renderResults();}
  $('assessment-reset').onclick=reset;
  window.addEventListener('pqlab:progress-cleared',reset);
  window.addEventListener('storage',event=>{try{if(event.storageArea!==localStorage)return;}catch{return;}if(event.key===key||event.key===null){results=decode(event.key===null?null:event.newValue);if(!results.before)$('assessment-phase').value='before';renderResults();$('assessment-submit').disabled=$('assessment-phase').value==='before'&&!!results.before;}});
  window.addEventListener('pqlab:milestone-open',event=>{if(event.detail?.id==='check-before'||event.detail?.id==='check-after'){$('assessment-phase').value=event.detail.id==='check-after'&&results.before?'after':'before';renderForm();}});
  $('assessment-phase').value=results.before?'after':'before';renderForm();renderResults();
};

'use strict';
window.createWireBuilder = function () {
  const $ = id => document.getElementById(id);
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  const objects = [
    { id: 'ek', name: 'ek · public encapsulation key', direction: 'Bob → public channel', explanation: 'Intended public object. Authentication must bind this key to Bob.' },
    { id: 'c', name: 'c · public KEM ciphertext', direction: 'Alice → Bob', explanation: 'Intended public object. Bob can decapsulate using his local private dk.' },
    { id: 'dk', name: 'dk · Bob’s private decapsulation key', direction: 'Bob → public channel (mistake)', explanation: 'Exposure lets Eve decapsulate this exchange when she also captures c. Other encapsulations using this compromised key are at risk too.' },
    { id: 'K', name: 'K · Alice’s shared secret', direction: 'Alice → public channel (mistake)', explanation: 'Exposure gives Eve this secret directly and lets her derive the corresponding traffic key from public context.' },
    { id: 'traffic', name: 'Traffic key · Alice’s derived key', direction: 'Alice → public channel (mistake)', explanation: 'Exposure gives Eve the message-protection key directly. It does not by itself reveal dk or the input K.' }
  ];
  const sent = new Set(), queued = new Set();
  let observer = 'learner', focus = '', reflectionTopic=null;
  const wireScene = window.createWireScene((id,event) => event ? sendFromButton([id],event) : transmit([id]));
  function knowledge(transcript = sent) {
    const eveK = transcript.has('K') || (transcript.has('dk') && transcript.has('c'));
    const result = {
      alice: ['ek', 'c', 'K', 'traffic', ...(transcript.has('dk') ? ['dk'] : [])],
      bob: ['ek', 'dk', ...(transcript.has('c') ? ['c', 'K', 'traffic'] : []), ...(transcript.has('K') ? ['K', 'traffic'] : []), ...(transcript.has('traffic') ? ['traffic'] : [])],
      eve: [...transcript, ...(transcript.has('dk') ? ['ek'] : []), ...(eveK ? ['K', 'traffic'] : [])]
    };
    return Object.fromEntries(Object.entries(result).map(([role,values])=>[role,[...new Set(values)]]));
  }
  function renderQueued() {
    const privateSelection=['dk','K','traffic'].filter(id=>queued.has(id));
    const alreadyKnown=privateSelection.filter(id=>knowledge().eve.includes(id));
    $('wire-queued-privacy').hidden=privateSelection.length===0;
    $('wire-queued-privacy').textContent=privateSelection.length?`Private objects selected: ${privateSelection.join(', ')}. The selection is still local; these objects have not been sent directly. ${alreadyKnown.length?`Eve already knows ${alreadyKnown.join(', ')} through earlier inference. `:''}Sending adds direct captures; public Send buttons send only their named object.`:'';
    $('wire-send').disabled=queued.size===0;$('wire-clear-queued').disabled=queued.size===0;
    $('wire-queued-summary').textContent=queued.size?`${queued.size} selected: ${[...queued].join(', ')}. These objects have not been sent directly.`:'No unsent selections. Clearing selections does not recall captured data.';
  }
  function render() {
    $('wire-objects').replaceChildren(...objects.map(object => {
      const label = node('label', ''), input = document.createElement('input');
      label.className = 'answer'; input.type = 'checkbox'; input.value = object.id; input.dataset.wireObject = object.id;
      input.disabled = sent.has(object.id); input.checked = queued.has(object.id);
      input.onchange = () => { if(input.checked)queued.add(object.id);else queued.delete(object.id);renderQueued(); };
      label.append(input, document.createTextNode(object.name + (sent.has(object.id) ? ' · already captured' : ''))); return label;
    }));
    renderQueued();
    $('wire-send-ek').disabled = sent.has('ek');
    $('wire-send-c').disabled = sent.has('c');
    const exposed = ['dk','K','traffic'].filter(id => sent.has(id));
    $('wire-capture-count').textContent=`${sent.size} captured · ${sent.size-exposed.length} public · ${exposed.length} secret`;
    $('wire-capture-empty').hidden=sent.size>0;
    $('wire-guide-status').textContent = exposed.length ? `Secret exposure: ${exposed.join(', ')}. Observe Eve, then start a fresh experiment to build a safe transcript.` : !sent.has('ek') ? 'Next: send Bob’s public ek. The guide tracks transmitted objects, not queued selections.' : !sent.has('c') ? 'Next: send Alice’s public c. Bob will decapsulate locally; K is not a packet.' : 'Compare Bob and Eve. Bob has K locally; Eve has ek and c. Use Check my wire to explain the boundary.';
    $('wire-guide').children[0].textContent = `${sent.has('ek')?'✓ Sent':'To do'}: Bob’s public ek.`;
    $('wire-guide').children[1].textContent = `${sent.has('c')?'✓ Sent':'To do'}: Alice’s public c.`;
    reflectionTopic=sent.has('dk')&&sent.has('c')?1:sent.has('ek')&&sent.has('c')&&!exposed.length?0:null;
    $('wire-reflect').hidden=reflectionTopic===null;
    $('wire-reflect').textContent=reflectionTopic===1?'Explain private-key exposure in Teach It Back →':'Explain the public transcript in Teach It Back →';
    $('wire-next-step').textContent=reflectionTopic===null?'Next: prepare a public-only ek + c transcript, or a dk + c exposure, for a matching explanation exercise.':reflectionTopic===0?'Evidence ready: explain why copying public ek and c does not reveal K under this model’s assumptions.':'Evidence ready: explain how captured dk and matching c allow recovery of K and derivation of the traffic key.';
    const known = knowledge();
    const inferred=known.eve.filter(id=>!sent.has(id));
    $('wire-eve-sources').textContent=`Eve knows ${known.eve.length} of ${objects.length} exchange objects: ${sent.size} directly captured, ${inferred.length} inferred${inferred.length?' ('+inferred.join(', ')+')':''}. Inferred knowledge does not add packets to the capture.`;
    const reasons={ek:'ek: obtained from compromised dk in this model.',K:'K: recovered by decapsulating captured c with captured dk.',traffic:'Traffic key: derived from known K and agreed public context.'};
    $('wire-eve-reasons').replaceChildren(...inferred.map(id=>node('li',reasons[id])));
    const baseline = knowledge(new Set(['ek','c']));
    $('wire-comparison-status').textContent=exposed.length?'Secret exposure changes Eve’s knowledge. Compare the Known/Unknown cells; reset starts a different exchange and cannot recall a real leak.':!sent.has('ek')||!sent.has('c')?'Incomplete public transcript. The reference includes both ek and c; an empty capture does not establish a working exchange.':'Same object knowledge as the public-only reference in this model. This alone does not prove a complete protocol secure.';
    const differences=[];
    $('wire-comparison').querySelector('tbody').replaceChildren(...objects.map(object=>{
      const row=document.createElement('tr');row.dataset.compareObject=object.id;
      const name=node('th',object.id==='traffic'?'Traffic key':object.id);name.scope='row';row.append(name);
      for(const [kind,values] of [['baseline',baseline.eve],['actual',known.eve]]){const cell=node('td',values.includes(object.id)?'Known':'Unknown');cell.dataset.compare=kind;row.append(cell);}
      if(baseline.eve.includes(object.id)!==known.eve.includes(object.id)){row.className='comparison-difference';differences.push(node('li',`${object.id==='traffic'?'Traffic key':object.id}: ${known.eve.includes(object.id)?`additional knowledge in your experiment, ${sent.has(object.id)?'captured directly':'inferred from captured objects'}.`:'not yet known in your experiment; the reference includes a complete public transcript.'}`));}
      return row;
    }));
    $('wire-comparison-differences').textContent=`${differences.length} of ${objects.length} objects differ from the public-only baseline. Missing public objects indicate an incomplete capture, not stronger protection.`;
    $('wire-comparison-changes').replaceChildren(...differences);
    $('wire-knowledge').replaceChildren(...['alice', 'bob', 'eve'].map(role => {
      const article = node('article', ''); article.dataset.wireActor = role; article.className = role === observer ? 'active' : '';
      article.append(node('h4', role.toUpperCase()));
      const list = document.createElement('ul');
      objects.forEach(object => {
        const item = node('li', `${object.id === 'traffic' ? 'Traffic key' : object.id}: ${known[role].includes(object.id) ? 'Known' : 'Not known in this model'}`);
        item.dataset.knowledge = object.id; list.append(item);
      });
      article.append(list); return article;
    }));
    if(!sent.has(focus))focus=[...sent].at(-1)||'';
    $('wire-inspect').replaceChildren(...(sent.size?[...sent].map(id=>{const option=node('option',objects.find(object=>object.id===id).name);option.value=id;return option;}):[node('option','No captured objects yet')]));
    $('wire-inspect').disabled=sent.size===0;$('wire-inspect').value=focus;
    $('wire-transcript').querySelectorAll('button[data-inspect-capture]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.inspectCapture===focus)));
    const focusIndex=[...sent].indexOf(focus);$('wire-inspect-prev').disabled=focusIndex<=0;$('wire-inspect-next').disabled=focusIndex<0||focusIndex===sent.size-1;
    $('wire-inspect-latest').disabled=focusIndex<0||focusIndex===sent.size-1;
    $('wire-inspection-position').textContent=focusIndex<0?'No capture selected':`Capture ${focusIndex+1} of ${sent.size}`;
    const inspected=objects.find(object=>object.id===focus);
    $('wire-inspection').replaceChildren(...(inspected?[node('h4',inspected.name),node('p',inspected.direction),node('p',inspected.explanation),node('p','Inspection highlights the capture without sending another object or changing evidence.')]:[node('p','Send an object to inspect its origin, purpose and effect on the public transcript.')]));
    wireScene.render({sent:[...sent], known, observer, focus});
    const eveK = known.eve.includes('K');
    let inference;
    if(sent.has('dk')&&sent.has('c')){
      inference=`EVE’S INFERENCE: captured dk + c → decapsulate K → derive traffic key using public context. ${sent.has('K')?'K was also sent directly; both exposure paths apply.':'Even though K was never sent, it is now exposed in this model.'}`;
      if(sent.has('traffic'))inference+=' The traffic key was also sent directly.';
    }else if(sent.has('K')){
      inference='EVE’S INFERENCE: K was sent directly. Eve can derive the traffic key using the agreed public context. '+(sent.has('traffic')?'The traffic key was also sent directly.':'Keeping the traffic key off the wire no longer protects it.');
      if(sent.has('dk'))inference+=' Bob’s private dk was also captured.';
    }else if(sent.has('traffic')){
      inference='EVE’S INFERENCE: the traffic key was sent directly. Eve can use it against packets protected by that key; '+(sent.has('dk')?'Bob’s private dk was also captured. K is not yet recovered on this illustrated path without the matching c.':'this does not establish knowledge of dk or K.');
    }else if(sent.has('dk')){
      inference='EVE’S INFERENCE: dk is exposed. This exchange’s K is not yet obtained in the illustrated path, but capturing c would let Eve decapsulate it. A compromised private key is unsafe even before c arrives.';
    }else{
      inference='EVE’S INFERENCE: public ek and c do not expose dk, K or the traffic key under the stated KEM assumptions. Timing, ordering and sizes can still be visible.';
    }
    $('wire-inference').textContent=inference;
    $('wire-view').textContent = `${observer.toUpperCase()} VIEW · Captures are cumulative within this experiment. ${eveK ? 'Eve knows K and the traffic key.' : 'Use the knowledge cards to distinguish transmitted objects from secrets inferred later.'}`;
  }
  function transmit(ids) {
    const selection = ids.filter(id => objects.some(object => object.id === id) && !sent.has(id));
    if (!selection.length) return;
    selection.forEach(id => {
      sent.add(id); const object = objects.find(item => item.id === id), entry = document.createElement('li');
      entry.dataset.wireCapture = id; entry.append(node('strong', object.name), node('p', object.direction), node('p', object.explanation));
      const inspect=node('button',`Inspect capture ${id}`);inspect.type='button';inspect.dataset.inspectCapture=id;
      inspect.onclick=()=>{focus=id;render();$('wire-inspect').scrollIntoView({block:'center'});$('wire-inspect').focus({preventScroll:true});};
      entry.append(inspect);$('wire-transcript').append(entry);
    });
    selection.forEach(id => queued.delete(id));
    $('wire-feedback').textContent = ''; $('wire-feedback').className = '';
    $('wire-status').textContent = `Transmitted ${selection.join(', ')}. Eve’s capture and inferred knowledge have updated.`;
    render();
    window.dispatchEvent(new CustomEvent('pqlab:activity',{detail:{type:'wire-updated'}}));
  };
  $('wire-reflect').onclick=event=>{const link=event.currentTarget;if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||link.hasAttribute('download')||(link.target&&link.target!=='_self')||reflectionTopic===null)return;const select=$('teach-topic');if(select.value!==String(reflectionTopic)){select.value=String(reflectionTopic);select.dispatchEvent(new Event('change',{bubbles:true}));}};
  function focusAfterAction(event,target){if(event.detail===0&&event.currentTarget.disabled&&target){target.scrollIntoView({block:'nearest'});target.focus({preventScroll:true});}}
  function moveInspection(delta,event){const ids=[...sent],index=ids.indexOf(focus);if(ids[index+delta]){focus=ids[index+delta];render();focusAfterAction(event,$('wire-inspect'));}}
  $('wire-inspect-prev').onclick=event=>moveInspection(-1,event);$('wire-inspect-next').onclick=event=>moveInspection(1,event);
  $('wire-inspect-latest').onclick=event=>{if(sent.size){focus=[...sent].at(-1);render();focusAfterAction(event,$('wire-inspect'));}};
  $('wire-clear-queued').onclick=event=>{queued.clear();render();focusAfterAction(event,$('wire-objects').querySelector('input:not(:disabled)'));};
  $('wire-inspect').onchange=()=>{focus=$('wire-inspect').value;render();};
  function sendFromButton(ids,event){
    transmit(ids);
    focusAfterAction(event,$('wire-inspect'));
  }
  $('wire-send').onclick = event => sendFromButton([...queued],event);
  $('wire-send-ek').onclick = event => sendFromButton(['ek'],event);
  $('wire-send-c').onclick = event => sendFromButton(['c'],event);
  $('wire-check').onclick = () => {
    const leaked = ['dk', 'K', 'traffic'].filter(id => sent.has(id));
    if(!leaked.length&&sent.has('ek')&&sent.has('c'))window.completeLearning('wire');
    $('wire-feedback').className = leaked.length ? 'incorrect' : sent.has('ek') && sent.has('c') ? 'correct' : '';
    $('wire-feedback').textContent = leaked.length ? `Secret exposure: ${leaked.join(', ')}. Sending more public data cannot undo a capture. Start a fresh experiment and keep secret objects local.` : !sent.has('ek') || !sent.has('c') ? 'Incomplete public transcript. Include both Bob’s public ek and Alice’s public c; neither private key nor shared secret belongs on the wire.' : 'Correct wire. Only ek and c were transmitted; Bob decapsulates locally and derives his key. Eve has the public transcript, not the private secrets, under the stated assumptions. A real protocol also needs authentication, AEAD and freshness policies.';
  };
  $('wire-reset').onclick = () => {
    sent.clear(); queued.clear(); $('wire-transcript').replaceChildren(); $('wire-feedback').textContent = ''; $('wire-feedback').className = '';
    $('wire-status').textContent = 'Fresh illustrative exchange. The previous capture belongs to a different experiment; a real leaked secret cannot be recalled.';
    render();
    window.dispatchEvent(new CustomEvent('pqlab:activity',{detail:{type:'wire-updated'}}));
  };
  render(); return { setObserver(value) { observer = value; render(); }, snapshot() { return { sent:[...sent] }; } };
};

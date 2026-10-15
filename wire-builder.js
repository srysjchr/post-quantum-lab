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
  let observer = 'learner';
  function knowledge() {
    const eveK = sent.has('K') || (sent.has('dk') && sent.has('c'));
    return {
      alice: ['ek', 'c', 'K', 'traffic', ...(sent.has('dk') ? ['dk'] : [])],
      bob: ['ek', 'dk', ...(sent.has('c') ? ['c', 'K', 'traffic'] : []), ...(sent.has('K') ? ['K', 'traffic'] : []), ...(sent.has('traffic') ? ['traffic'] : [])],
      eve: [...sent, ...(sent.has('dk') ? ['ek'] : []), ...(eveK ? ['K', 'traffic'] : [])]
    };
  }
  function render() {
    $('wire-objects').replaceChildren(...objects.map(object => {
      const label = node('label', ''), input = document.createElement('input');
      label.className = 'answer'; input.type = 'checkbox'; input.value = object.id; input.dataset.wireObject = object.id;
      input.disabled = sent.has(object.id); input.checked = queued.has(object.id);
      input.onchange = () => { if(input.checked)queued.add(object.id);else queued.delete(object.id);$('wire-send').disabled = queued.size===0; };
      label.append(input, document.createTextNode(object.name + (sent.has(object.id) ? ' · already captured' : ''))); return label;
    }));
    $('wire-send').disabled = queued.size===0;
    const known = knowledge();
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
    const eveK = known.eve.includes('K');
    $('wire-inference').textContent = sent.has('dk') && sent.has('c') ? 'EVE’S INFERENCE: captured dk + c → decapsulate K → derive traffic key using public context. Even though K was never sent, it is now exposed in this model.' : sent.has('K') ? 'EVE’S INFERENCE: K was sent directly. Eve can derive the traffic key using the agreed public context. Keeping the traffic key off the wire no longer protects it.' : sent.has('traffic') ? 'EVE’S INFERENCE: the traffic key was sent directly. Eve can use it against packets protected by that key; this does not establish knowledge of dk or K.' : sent.has('dk') ? 'EVE’S INFERENCE: dk is exposed. This exchange’s K is not yet obtained in the illustrated path, but capturing c would let Eve decapsulate it. A compromised private key is unsafe even before c arrives.' : 'EVE’S INFERENCE: public ek and c do not expose dk, K or the traffic key under the stated KEM assumptions. Timing, ordering and sizes can still be visible.';
    $('wire-view').textContent = `${observer.toUpperCase()} VIEW · Captures are cumulative within this experiment. ${eveK ? 'Eve knows K and the traffic key.' : 'Use the knowledge cards to distinguish transmitted objects from secrets inferred later.'}`;
  }
  $('wire-send').onclick = () => {
    const selection = [...queued];
    if (!selection.length) return;
    selection.forEach(id => {
      sent.add(id); const object = objects.find(item => item.id === id), entry = document.createElement('li');
      entry.dataset.wireCapture = id; entry.append(node('strong', object.name), node('p', object.direction), node('p', object.explanation));
      $('wire-transcript').append(entry);
    });
    queued.clear();
    $('wire-feedback').textContent = ''; $('wire-feedback').className = '';
    $('wire-status').textContent = `Transmitted ${selection.join(', ')}. Eve’s capture and inferred knowledge have updated.`;
    render();
    window.dispatchEvent(new CustomEvent('pqlab:activity',{detail:{type:'wire-updated'}}));
  };
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

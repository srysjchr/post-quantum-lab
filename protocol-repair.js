'use strict';
window.createProtocolRepair = function () {
  const $ = id => document.getElementById(id);
  const controls = [
    ['kem', 'Key establishment using ML-KEM in this protocol'],
    ['identity', 'Identity binding for the public key'],
    ['aead', 'Authenticated message encryption (AEAD)'],
    ['freshness', 'Freshness policy with authenticated sequence tracking'],
    ['keysize', 'Increase the symmetric key size']
  ];
  const cases = [
    { title: 'A valid key belongs to the wrong person', present: ['kem', 'aead', 'freshness'], missing: 'identity', attack: 'Eve substitutes her own public key before encapsulation.', before: 'Alice establishes a secret with Eve while believing the peer is Bob. Message encryption does not fix the wrong key owner.', after: 'The identity-binding check rejects Eve’s key before encapsulation. Alice does not create a secret for that substituted key.', why: 'A KEM establishes secret material for the supplied key. Bind the intended peer identity to that key first.' },
    { title: 'The message has confidentiality but no integrity check', present: ['kem', 'identity', 'freshness'], missing: 'aead', attack: 'Eve changes bytes of the encrypted message. This protocol has encryption but no message authentication.', before: 'The receiver lacks a cryptographic integrity check and cannot rely on detecting the modification before accepting plaintext.', after: 'AEAD authentication rejects the modified packet before accepting plaintext under the modeled conditions.', why: 'Encryption alone is not an integrity check. Use authenticated encryption with correct keys and nonce handling.' },
    { title: 'Yesterday’s valid packet arrives twice', present: ['kem', 'identity', 'aead'], missing: 'freshness', attack: 'Eve replays an unchanged, previously accepted packet with a valid authentication tag.', before: 'The old bytes still pass message authentication. Without duplicate tracking, this protocol accepts the same delivery twice.', after: 'The receiver validates the packet, recognizes the authenticated sequence as already used, and rejects the duplicate delivery.', why: 'GCM authenticates bytes; it does not itself remember prior deliveries. Freshness state belongs to the protocol.' },
    { title: 'There is no shared input for key derivation', present: ['identity', 'aead', 'freshness'], missing: 'kem', attack: 'Alice and Bob try to start a new session, but this intended ML-KEM protocol has no key-establishment step.', before: 'There is no agreed secret input for deriving the traffic keys. The planned message-protection session cannot start.', after: 'ML-KEM with an authenticated ek establishes K; the protocol derives traffic keys with agreed context, then uses AEAD.', why: 'A KDF needs suitable secret input; public context is not a replacement. This exercise uses ML-KEM; other reviewed authenticated key-establishment protocols can meet that role.' }
  ];
  let index = 0;
  const solved = new Set();
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  function clearFeedback(){
    $('repair-feedback').textContent='';$('repair-feedback').className='';
    $('repair-choices').removeAttribute('aria-invalid');$('repair-choices').removeAttribute('aria-describedby');
  }
  function answerError(){ $('repair-choices').setAttribute('aria-invalid','true');$('repair-choices').setAttribute('aria-describedby','repair-feedback'); }
  function render() {
    const item = cases[index];
    $('repair-count').textContent = `CASE ${index + 1} / ${cases.length} · ${solved.size} patched`;
    $('repair-title').textContent = item.title; $('repair-attack').textContent = item.attack;
    $('repair-existing').replaceChildren(...item.present.map(id => node('li', controls.find(control => control[0] === id)[1])));
    $('repair-options').replaceChildren();
    controls.forEach(([id, text]) => {
      const label = node('label', ''), input = document.createElement('input'); label.className = 'answer';
      input.type = 'checkbox'; input.value = id; input.dataset.repairControl = id;
      label.append(input, document.createTextNode(text)); $('repair-options').append(label);
    });
    $('repair-before').textContent = 'Run the baseline to observe the modeled failure.';
    $('repair-after').textContent = 'Choose the smallest missing protection, then apply the patch.';
    clearFeedback();
    $('repair-prev').disabled = index === 0; $('repair-next').disabled = index === cases.length - 1;
  }
  $('repair-baseline').onclick = () => { $('repair-before').textContent = cases[index].before; };
  $('repair-options').onchange = () => {
    $('repair-after').textContent = 'Selection changed. Apply the patch again to test this configuration.';
    clearFeedback();
  };
  $('repair-form').onsubmit = event => {
    event.preventDefault();clearFeedback();
    const selected = [...$('repair-options').querySelectorAll('input:checked')].map(input => input.value), item = cases[index];
    if (!selected.length) { $('repair-feedback').textContent = 'Choose a protection to add first.';answerError();$('repair-options').querySelector('input').focus(); return; }
    const fixes = selected.includes(item.missing);
    $('repair-before').textContent = item.before;
    $('repair-after').textContent = fixes ? item.after : `Defect still present. ${item.before}`;
    if (fixes && selected.length === 1) {
      solved.add(index);window.completeLearning(`repair-${index}`); $('repair-count').textContent = `CASE ${index + 1} / ${cases.length} · ${solved.size} patched`;
      $('repair-feedback').className = 'correct'; $('repair-feedback').textContent = `Minimal patch accepted. ${item.why} This fixes the modeled defect, not every possible protocol weakness.`;
    } else {
      answerError();
      $('repair-feedback').className = 'incorrect';
      $('repair-feedback').textContent = fixes ? `The defect is addressed, but this is not the smallest patch. Other selected roles are already present or unrelated. ${item.why}` : `Patch does not address the missing role. ${item.why}`;
    }
  };
  function navigateCase(offset){index+=offset;render();$('repair-title').scrollIntoView({block:'nearest'});$('repair-title').focus({preventScroll:true});}
  $('repair-prev').onclick = () => navigateCase(-1);
  $('repair-next').onclick = () => navigateCase(1);
  $('repair-reset').onclick = () => { index = 0; solved.clear(); render(); };
  window.addEventListener('pqlab:milestone-open',event=>{
    const target=cases.findIndex((_,caseIndex)=>event.detail?.id===`repair-${caseIndex}`);
    if(target>=0&&target!==index){index=target;render();}
  });
  render();
};

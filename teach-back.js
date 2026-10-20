'use strict';
window.createTeachBack = function (readWire) {
  const $ = id => document.getElementById(id);
  const replay = new Set();
  const topics = [
    { title: 'Explain the public transcript', labels: ['Eve sees', 'But does not learn', 'Because'], fields: [
      [['pair','Public ek and c'],['dk','Bob’s private dk'],['K','The shared secret K']],
      [['secret','K and the derived traffic key'],['c','The transmitted ciphertext c'],['nothing','Nothing; Eve already knows all secrets']],
      [['resistance','The KEM is designed to resist recovering K from public ek and c under its assumptions'],['private-ek','The public key is secret'],['plaintext','The ciphertext sends K as readable plaintext']]
    ], answers: ['pair','secret','resistance'], hints: ['Distinguish public transmitted objects from local private material.','Eve can copy c. Copying c is not the same as recovering K.','Public-key secrecy is not the defense. KEM security depends on its assumptions and correct authenticated protocol use.'], action: '#build-the-wire', instruction: 'In Build the Wire, start a fresh experiment and transmit only ek and c. Then return here.' },
    { title: 'Explain a private-key exposure', labels: ['Eve captures', 'Then can recover', 'Because'], fields: [
      [['private-pair','dk and c, not just public objects'],['public-only','Only public ek and c'],['nothing','No transmitted data']],
      [['derived','K and the derived traffic key'],['dk-only','Only dk; K remains protected despite c'],['reverse','Every private key from one traffic key']],
      [['decaps','Matching dk allows decapsulation of c, then public context allows key derivation from K'],['public-dk','dk is intended to be public'],['no-inference','A secret is safe whenever it was not sent directly']]
    ], answers: ['private-pair','derived','decaps'], hints: ['The distinguishing evidence is a private dk on the wire.','Captured dk plus the matching c enables K recovery in this model.','A secret can be inferred without being transmitted directly. Follow dk + c → K → traffic key.'], action: '#build-the-wire', instruction: 'In Build the Wire, start a fresh experiment and transmit dk and c, in either order. Then return here.' },
    { title: 'Explain the replay boundary', labels: ['Eve replays', 'The missing protection is', 'Because'], fields: [
      [['valid','An unchanged packet with a valid tag'],['bad','A packet with a broken tag'],['secret','The private traffic key as the nonce']],
      [['freshness','A protocol freshness policy with authenticated duplicate tracking'],['keysize','A larger encryption key'],['kem','Another encapsulation for every identical replay']],
      [['history','GCM authenticates the bytes; the receiver must separately track already accepted deliveries'],['tag','A valid tag automatically means a new delivery'],['instant','Quantum resistance alone stops duplicate delivery']]
    ], answers: ['valid','freshness','history'], hints: ['The replay experiment repeats unchanged, authentic bytes.','Key size does not remember prior deliveries. The protocol needs freshness state.','A valid authentication tag says nothing by itself about whether this packet was already accepted.'], action: '#attack-playground', instruction: 'In Attack Playground, choose Replay a valid packet and prepare it. Run once with freshness off, then once with freshness on.' }
  ];
  let topic = 0;
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  function ready() {
    const wire = readWire();
    if (topic === 0) return wire.sent.includes('ek') && wire.sent.includes('c') && !wire.sent.some(id => ['dk','K','traffic'].includes(id));
    if (topic === 1) return wire.sent.includes('dk') && wire.sent.includes('c');
    return replay.has('replay-unguarded') && replay.has('replay-guarded');
  }
  function evidence() {
    $('teach-evidence').textContent = ready() ? topic === 2 ? 'EVIDENCE READY · Both replay outcomes were observed during this page session.' : `EVIDENCE READY · Current wire capture: ${readWire().sent.join(', ')}.` : 'EVIDENCE NOT READY · Complete the relevant experiment first.';
    $('teach-instructions').textContent = topics[topic].instruction;
    $('teach-action').href = topics[topic].action;
  }
  function clearFeedback(){
    $('teach-feedback').replaceChildren();$('teach-sentence').hidden=true;
    $('teach-fields').querySelectorAll('select').forEach(field=>{field.removeAttribute('aria-invalid');field.removeAttribute('aria-describedby');});
  }
  function markInvalid(index,errorId){const field=$(`teach-field-${index}`);field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',errorId);}
  function render() {
    const item = topics[topic];
    $('teach-title').textContent = item.title; $('teach-fields').replaceChildren();
    item.fields.forEach((options, index) => {
      const label = node('label', item.labels[index]), select = document.createElement('select');
      select.id = `teach-field-${index}`; label.htmlFor = select.id;
      const placeholder = node('option','Choose a claim…'); placeholder.value = ''; select.append(placeholder);
      options.forEach(([value,text]) => { const option = node('option',text); option.value = value; select.append(option); });
      $('teach-fields').append(label,select);
    });
    clearFeedback(); evidence();
  }
  $('teach-topic').onchange = () => { topic = Number($('teach-topic').value); render(); };
  window.addEventListener('pqlab:milestone-open',event=>{
    const target=topics.findIndex((_,index)=>event.detail?.id===`teach-${index}`);
    if(target>=0&&target!==topic){$('teach-topic').value=String(target);$('teach-topic').dispatchEvent(new Event('change',{bubbles:true}));}
  });
  $('teach-form').onchange = () => { clearFeedback(); };
  $('teach-form').onsubmit = event => {
    event.preventDefault();
    clearFeedback();
    if (!ready()) { $('teach-feedback').append(node('p','Complete the experiment before checking your explanation. Open the linked exercise for guidance.')); return; }
    const item = topics[topic], values = item.fields.map((_,index) => $(`teach-field-${index}`).value);
    if (values.some(value => !value)) {
      const message=node('p','Fill all three claims first.');message.id='teach-error-missing';$('teach-feedback').append(message);
      values.forEach((value,index)=>{if(!value)markInvalid(index,message.id);});return;
    }
    const mistakes = values.map((value,index) => value === item.answers[index] ? null : index).filter(index => index !== null);
    if (mistakes.length) {
      mistakes.forEach(index => { const paragraph = node('p', `${item.labels[index]}: ${item.hints[index]}`); paragraph.className = 'incorrect';paragraph.id=`teach-error-${index}`;markInvalid(index,paragraph.id); $('teach-feedback').append(paragraph); }); return;
    }
    window.completeLearning(`teach-${topic}`);
    const paragraph = node('p','Explanation supported by the experiment. These checks assess the selected claims; your optional notes are for your own reflection.'); paragraph.className = 'correct'; $('teach-feedback').append(paragraph);
    $('teach-sentence').textContent = item.labels.map((label,index) => { const claim=$(`teach-field-${index}`).selectedOptions[0].textContent.replace(/^(Public|The|An|A|Matching)\b/,word=>word.toLowerCase()); return `${index===0?label:label.toLowerCase()} ${claim}`; }).join('; ') + '.';
    $('teach-sentence').hidden = false;
  };
  window.addEventListener('pqlab:activity', event => {
    const type = event.detail?.type;
    if (type === 'replay-unguarded' || type === 'replay-guarded') replay.add(type);
    else if (type !== 'wire-updated') return;
    evidence(); clearFeedback();
  });
  $('teach-reset').onclick = () => { $('teach-notes').value = ''; render(); };
  render();
};

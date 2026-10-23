'use strict';
window.createKeySubstitutionStory = function () {
  const $ = id => document.getElementById(id);
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  const names = ['Publish Bob’s key', 'Eve substitutes her key', 'Check or skip identity binding', 'Alice encapsulates', 'Eve decapsulates'];
  const steps = [
    'Bob publishes ek_Bob and keeps dk_Bob private. Eve has her own separate pair (ek_Eve, dk_Eve). Alice intends to communicate with Bob.',
    'Eve replaces the unauthenticated key Alice receives with ek_Eve, presented as if it were Bob’s key. Bob’s genuine private dk_Bob has not been stolen.',
    'Compare a correct identity-binding check against skipping that check. The protected path rejects the substituted key; the unchecked path treats ek_Eve as Bob’s key.',
    'Only the unchecked path continues. Alice runs Encaps(ek_Eve) and obtains (K_AE, c_Eve), keeping K_AE local. Alice’s intended peer is Bob, but the ciphertext targets Eve’s key.',
    'Eve receives c_Eve and computes Decaps(dk_Eve, c_Eve), obtaining K_AE. Alice and Eve now hold this secret. Bob was never a party to that encapsulation.'
  ];
  let step = 0, observer = 'learner';
  function clearAnswer() {
    $('substitution-feedback').textContent = ''; $('substitution-feedback').className = '';
    $('substitution-answers').querySelectorAll('input').forEach(input => { input.checked = false; });
  }
  function move(index) {
    const trigger=document.activeElement,inside=$('key-substitution-story').contains(trigger);
    step=Math.max(0,Math.min(4,index));clearAnswer();render();
    if(inside&&(!trigger.isConnected||trigger.disabled)){$('substitution-description').scrollIntoView({block:'nearest'});$('substitution-description').focus({preventScroll:true});}
  }
  function render() {
    $('substitution-stages').replaceChildren(...names.map((text, index) => {
      const item = node('li', ''), button = node('button', `${index + 1}. ${text}`);
      button.dataset.substitutionStep = index; button.disabled = index > step;
      button.setAttribute('aria-current', index === step ? 'step' : 'false'); button.onclick = () => move(index);
      item.append(button); return item;
    }));
    $('substitution-count').textContent = `STEP ${step + 1} / 5`;
    $('substitution-description').textContent = steps[step];
    const stopped = step >= 2;
    $('substitution-protected-status').textContent = stopped ? 'BLOCKED before Encaps' : step === 0 ? 'Awaiting key delivery' : 'Untrusted key received; check pending';
    $('substitution-unchecked-status').textContent = step === 4 ? 'Alice and Eve share K_AE' : step === 3 ? 'Alice created K_AE for Eve’s key' : step === 2 ? 'Continues without checking the key owner' : step === 1 ? 'Substituted key received' : 'Awaiting key delivery';
    $('substitution-protected-wire').textContent = step === 0 ? 'Bob publishes ek_Bob' : 'ek_Eve offered as “Bob’s key”' + (stopped ? ' → rejected; no c or K created' : ' → identity check pending');
    $('substitution-unchecked-wire').textContent = step < 1 ? 'Bob publishes ek_Bob' : step < 3 ? 'Eve → Alice: ek_Eve labeled as “Bob’s key”' : 'Alice → Eve: c_Eve · K_AE stays local';
    $('substitution-protected-people').replaceChildren(...[
      ['alice', stopped ? 'Rejects the key. No K created.' : 'Intends to talk to Bob. No K yet.'],
      ['bob', 'Keeps dk_Bob private. No encapsulation secret in this path.'],
      ['eve', 'Owns dk_Eve, but receives no ciphertext for decapsulation.']
    ].map(([role, text]) => actor(role, text)));
    $('substitution-unchecked-people').replaceChildren(...[
      ['alice', step >= 3 ? 'Believes the peer is Bob; privately holds K_AE.' : 'Intends to talk to Bob. No K yet.'],
      ['bob', 'Keeps dk_Bob private. Does not hold K_AE.'],
      ['eve', step === 4 ? 'Uses her own dk_Eve; privately holds K_AE.' : step === 3 ? 'Has c_Eve and her own dk_Eve; Decaps has not run yet.' : 'Owns dk_Eve. No encapsulation secret yet.']
    ].map(([role, text]) => actor(role, text)));
    $('substitution-view').textContent = observer === 'alice' ? 'ALICE VIEW · The unchecked path shows why an intended peer name is not proof of the public key’s owner.' : observer === 'bob' ? 'BOB VIEW · Bob has not lost his private key. The unchecked encapsulation used a different public key and did not establish a secret with Bob.' : observer === 'eve' ? 'EVE VIEW · This attack uses Eve’s own private key. It does not factor a key, break ML-KEM, or recover Bob’s dk.' : 'LEARNER VIEW · Compare the intended peer, the actual key owner, and who obtains the shared secret. These labels explain ownership, not real secret bytes.';
    $('substitution-prev').disabled = step === 0; $('substitution-next').disabled = step === 4;
    $('substitution-check').disabled = step !== 4;
  }
  function actor(role, text) {
    const item = node('li', ''); item.dataset.actor = role; item.className = observer === role ? 'selected-perspective' : '';
    item.append(node('strong', role.toUpperCase()), node('p', text)); return item;
  }
  $('substitution-prev').onclick = () => move(step - 1);
  $('substitution-next').onclick = () => move(step + 1);
  $('substitution-reset').onclick = () => move(0);
  $('substitution-form').onsubmit = event => {
    event.preventDefault();
    if (step !== 4) { $('substitution-feedback').textContent = 'Walk through all five steps before checking your explanation.'; return; }
    const answer = $('substitution-answers').querySelector('input:checked');
    if (!answer) { $('substitution-feedback').textContent = 'Choose who actually holds the secret.'; return; }
    const correct = answer.value === 'alice-eve';if(correct)window.completeLearning('substitution');
    $('substitution-feedback').className = correct ? 'correct' : 'incorrect';
    $('substitution-feedback').textContent = correct ? 'Correct. Alice believes her peer is Bob, but Alice and Eve hold K_AE. Correct identity binding would have rejected ek_Eve before any encapsulation. A KEM does not authenticate an advertised name on its own.' : answer.value === 'alice-bob' ? 'Not quite. Alice used ek_Eve. Bob’s dk_Bob is not the matching private key for this encapsulation; Eve holds the matching dk_Eve.' : 'Not quite. A public encapsulation key does not reveal every shared secret. Eve learns this K because Alice encapsulated to Eve’s key and Eve used its matching private dk.';
  };
  $('substitution-form').addEventListener('change', () => { $('substitution-feedback').textContent = ''; });
  render(); return { setObserver(value) { observer = value; render(); } };
};

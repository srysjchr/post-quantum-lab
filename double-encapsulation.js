'use strict';
window.createDoubleEncapsulation = function () {
  const $ = id => document.getElementById(id);
  const node = (tag, text) => { const element = document.createElement(tag); element.textContent = text; return element; };
  let observer = 'learner', serial = 0, selected = 'alice';
  const pairs = { alice: null, eve: null };
  const recovered = { alice: false, eve: false };
  const visible = party => observer === 'learner' || observer === party || (observer === 'bob' && recovered[party]);
  function render() {
    const body = $('double-pairs').querySelector('tbody');
    body.replaceChildren(...['alice', 'eve'].map(party => {
      const row = document.createElement('tr'); row.dataset.party = party;
      const heading = node('th', party.toUpperCase()); heading.scope = 'row'; row.append(heading);
      const pair = pairs[party];
      const values = ['ek_Bob', pair ? pair.c : 'Not created', pair ? (visible(party) ? pair.k : 'Hidden in this perspective') : 'Not created', recovered[party] ? (visible(party) ? `${pair.k} · matches this encapsulation` : 'Matched locally · secret hidden') : 'Not decapsulated'];
      values.forEach((text, index) => { const cell = node('td', text); cell.dataset.field = ['ek', 'c', 'k', 'recovered'][index]; row.append(cell); });
      return row;
    }));
    const select = $('double-ciphertext');
    select.replaceChildren(...['alice', 'eve'].filter(party => pairs[party]).map(party => { const option = node('option', `${party.toUpperCase()} · ${pairs[party].c}`); option.value = party; return option; }));
    if (!pairs[selected] && (pairs.alice || pairs.eve)) selected = pairs.alice ? 'alice' : 'eve';
    select.value = selected; select.disabled = !pairs.alice && !pairs.eve;
    $('double-decaps').disabled = select.disabled;
    $('double-view').textContent = `${observer.toUpperCase()} VIEW · ${observer === 'eve' ? 'Eve knows her own encapsulation secret. Alice’s K stays hidden, even after Bob decapsulates it.' : observer === 'bob' ? 'Bob learns the selected K only after a local decapsulation with his private dk.' : observer === 'alice' ? 'Alice knows her own encapsulation secret. Eve’s K stays hidden.' : 'Learner view exposes symbolic labels for comparison. These are not cryptographic key bytes.'}`;
    const ready = pairs.alice && pairs.eve && recovered.alice && recovered.eve;
    $('double-check').disabled = !ready;
    $('double-comparison').textContent = ready ? 'Bob recovered the corresponding secret for each ciphertext: Alice’s K for Alice’s c, Eve’s K for Eve’s c. The two independent encapsulations use the same ek but represent different secrets in this illustration.' : 'Create both pairs and let Bob decapsulate each ciphertext to compare the results.';
  }
  function clearFeedback() { $('double-feedback').textContent = ''; $('double-feedback').className = ''; }
  ['alice', 'eve'].forEach(party => {
    $(`double-encaps-${party}`).onclick = () => {
      serial++;
      pairs[party] = { c: `c_${party}_${serial}`, k: `K_${party}_${serial}` };
      recovered[party] = false; selected = party;
      $('double-result').textContent = `${party.toUpperCase()} used ek_Bob with independent encapsulation randomness (simulated). A new public c was delivered to Bob; K stayed local. A new pair replaces that party’s previous pair.`;
      clearFeedback(); $('double-answers').querySelectorAll('input').forEach(input => { input.checked = false; }); render();
    };
  });
  $('double-ciphertext').onchange = () => { selected = $('double-ciphertext').value; };
  $('double-decaps').onclick = () => {
    if (!pairs[selected]) return;
    recovered[selected] = true;
    $('double-result').textContent = `Bob ran Decaps(dk_Bob, ${pairs[selected].c}) locally (simulated). His result matches the secret created for this ciphertext. The shared secret was not sent over the wire. This does not authenticate the sender’s identity.`;
    render();
  };
  $('double-reset').onclick = () => {
    pairs.alice = pairs.eve = null; recovered.alice = recovered.eve = false; selected = 'alice';
    $('double-result').textContent = 'New experiment. Neither encapsulation has happened yet.';
    $('double-answers').querySelectorAll('input').forEach(input => { input.checked = false; }); clearFeedback(); render();
  };
  $('double-form').onsubmit = event => {
    event.preventDefault();
    if (!pairs.alice || !pairs.eve || !recovered.alice || !recovered.eve) { $('double-feedback').textContent = 'Create and decapsulate both pairs before checking your explanation.'; return; }
    const answer = $('double-answers').querySelector('input:checked');
    if (!answer) { $('double-feedback').textContent = 'Choose an explanation first.'; return; }
    const correct = answer.value === 'separate';
    $('double-feedback').className = correct ? 'correct' : 'incorrect';
    $('double-feedback').textContent = correct ? 'Correct. Eve’s own Encaps gives Eve her own K. It does not recover Alice’s K from Alice’s public ciphertext. Bob can decapsulate both because both were created for his ek and he holds the matching private dk.' : 'Not quite. Sharing a public ek does not make every encapsulation share one K. Fresh encapsulation randomness creates a separate pair. Knowing Eve’s K does not give Eve Alice’s K.';
  };
  $('double-form').addEventListener('change', clearFeedback);
  render();
  return { setObserver(value) { observer = value; render(); } };
};

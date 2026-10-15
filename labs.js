'use strict';
window.createPracticeLabs = function () {
  const $ = id => document.getElementById(id);
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  const activity = type => window.dispatchEvent(new CustomEvent('pqlab:activity', { detail: { type } }));
  const scenarios = [
    { title: 'A medical archive for the next 20 years', prompt: 'You need to keep stored records confidential. Which tool protects the record contents?', options: ['Authenticated symmetric encryption, with careful key management', 'ML-KEM by itself', 'A digital signature by itself'], correct: 0, feedback: ['Correct. AEAD protects record contents and detects changes. Long-term key protection and any public-key key establishment also need a migration plan.', 'ML-KEM establishes shared key material; it does not encrypt the archive contents. Combine key management with authenticated symmetric encryption.', 'A signature helps verify origin and integrity; it does not hide the records.'] },
    { title: 'Establish a shared secret over a public network', prompt: 'Alice already has an authenticated copy of Bob’s public key. Which tool establishes shared secret material for later encryption?', options: ['A digital signature alone', 'A key-encapsulation mechanism such as ML-KEM', 'Sending the AES key in plaintext'], correct: 1, feedback: ['A signature authenticates signed data. A KEM supplies shared secret material, followed by protocol key derivation.', 'Correct. A KEM establishes shared secret material. Derive traffic keys and use AEAD for the messages; authenticated public keys remain essential.', 'An eavesdropper would learn that key. Use authenticated key establishment instead.'] },
    { title: 'Verify a software release', prompt: 'Anyone may download the file, but users must check that the publisher approved it. Which tool fits?', options: ['Encryption only', 'ML-KEM only', 'A digital signature and a trusted publisher verification key'], correct: 2, feedback: ['Encryption hides content. It does not by itself provide public verification of the publisher’s approval.', 'A KEM establishes secrets, not public approval of a release.', 'Correct. Verify a signature with a trusted publisher key. The file need not be secret; signatures do not encrypt it.'] }
  ];
  let scenario = 0;
  const solved = new Set();
  function renderScenario() {
    const item = scenarios[scenario];
    $('scenario-count').textContent = `SCENARIO ${scenario + 1} / ${scenarios.length} · ${solved.size} solved`;
    $('scenario-title').textContent = item.title;
    $('scenario-prompt').textContent = item.prompt;
    $('scenario-options').replaceChildren(node('legend', 'Choose the tool that meets the goal', 'sr-only'));
    item.options.forEach((text, index) => {
      const label = node('label', undefined, 'answer');
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'scenario-answer'; input.value = index;
      label.append(input, document.createTextNode(text)); $('scenario-options').append(label);
    });
    $('scenario-feedback').textContent = '';
    $('scenario-feedback').className = '';
    $('scenario-prev').disabled = scenario === 0;
    $('scenario-next').disabled = scenario === scenarios.length - 1;
  }
  $('scenario-form').addEventListener('submit', event => {
    event.preventDefault();
    const answer = $('scenario-options').querySelector('input:checked');
    if (!answer) { $('scenario-feedback').textContent = 'Choose a tool first.'; return; }
    const index = Number(answer.value), item = scenarios[scenario];
    $('scenario-feedback').textContent = item.feedback[index];
    $('scenario-feedback').className = index === item.correct ? 'correct' : 'incorrect';
    if (index === item.correct) { solved.add(scenario);window.completeLearning(`scenario-${scenario}`); $('scenario-count').textContent = `SCENARIO ${scenario + 1} / ${scenarios.length} · ${solved.size} solved`; }
  });
  $('scenario-form').addEventListener('change', () => { $('scenario-feedback').textContent = ''; });
  $('scenario-prev').onclick = () => { scenario--; renderScenario(); };
  $('scenario-next').onclick = () => { scenario++; renderScenario(); };
  $('scenario-reset').onclick = () => { scenario = 0; solved.clear(); renderScenario(); };
  renderScenario();

  const attacks = {
    substitute: { title: 'Substitute a public key', description: 'Eve offers her key in place of Bob’s. An identity-binding check must stop Alice before encapsulation. This check is simulated.' },
    tamper: { title: 'Modify a packet byte', description: 'Eve changes one byte of ciphertext or its tag. Bob runs real AES-GCM verification on the changed packet.' },
    replay: { title: 'Replay a valid packet', description: 'Eve retransmits an unchanged, previously accepted packet. GCM authenticates its bytes; a separate freshness policy must reject duplicates.' },
    drop: { title: 'Drop the packet', description: 'Eve prevents delivery. Encryption cannot force a network to deliver data. Availability and timeouts need protocol design.' }
  };
  let mode = 'substitute', generation = 0, busy = false, packet = null, key = null;
  function clearPacket() {
    generation++; busy = false; packet = key = null;
    $('attack-result').textContent = 'Prepare a fresh packet to begin.';
    $('attack-result').className = '';
    $('attack-wire').replaceChildren(node('p', 'No packet prepared.'));
    syncAttack();
  }
  function syncAttack() {
    $('attack-title').textContent = attacks[mode].title;
    $('attack-description').textContent = attacks[mode].description;
    $('attack-run').disabled = busy || !packet;
    $('attack-prepare').disabled = busy;
    $('attack-mode').disabled = busy;
    $('replay-policy').disabled = busy;
    $('replay-control').hidden = mode !== 'replay';
  }
  async function execute(operation) {
    if (busy) return;
    const current = generation;
    busy = true; $('attack-result').textContent = 'Working locally…'; syncAttack();
    try { const commit = await operation(); if (current === generation) commit(); }
    catch (error) { if (current === generation) $('attack-result').textContent = `Unable to run this experiment: ${error.message}`; }
    finally { if (current === generation) { busy = false; syncAttack(); } }
  }
  $('attack-mode').onchange = () => { mode = $('attack-mode').value; clearPacket(); };
  $('attack-reset').onclick = clearPacket;
  $('replay-policy').onchange = () => { $('attack-result').textContent = 'Policy changed. Run the replay experiment again to compare.'; };
  $('attack-prepare').onclick = () => execute(async () => {
    if (!window.crypto?.subtle) throw new Error('Web Crypto requires HTTPS or localhost.');
    const nextKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // Bind the exercise sequence number to the packet using authenticated data.
    const aad = new TextEncoder().encode('post-quantum-lab / session packet 1');
    const bytes = new TextEncoder().encode('An educational packet for Bob.');
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: aad, tagLength: 128 }, nextKey, bytes);
    return () => {
      key = nextKey; packet = { iv, aad, cipher };
      const b64 = value => btoa(String.fromCharCode(...new Uint8Array(value)));
      $('attack-wire').replaceChildren(node('strong', 'EVE’S PUBLIC NETWORK VIEW'), node('p', 'Sequence 1 · fresh session · nonce + ciphertext + tag'), node('code', `Nonce: ${b64(iv)}`), node('code', `Ciphertext + tag: ${b64(cipher)}`));
      $('attack-result').textContent = 'Fresh packet prepared with real AES-256-GCM. No secret key or plaintext is displayed.';
    };
  });
  $('attack-run').onclick = () => execute(async () => {
    const snapshot = packet, localKey = key, selected = mode, guard = $('replay-policy').checked;
    if (selected === 'substitute') return () => {
      $('attack-result').textContent = 'BLOCKED (simulation): the substituted key is not bound to Bob’s trusted identity. Alice must not encapsulate. A KEM alone does not authenticate its public key.';
      activity('untrusted-blocked');
    };
    if (selected === 'drop') return () => {
      $('attack-result').textContent = 'NOT DELIVERED (simulation): Bob received nothing and accepted no plaintext. GCM was never invoked. A protocol needs a timeout, retry strategy and availability handling.';
      activity('drop-observed');
    };
    const decrypt = bytes => crypto.subtle.decrypt({ name: 'AES-GCM', iv: snapshot.iv, additionalData: snapshot.aad, tagLength: 128 }, localKey, bytes);
    if (selected === 'tamper') {
      const changed = new Uint8Array(snapshot.cipher.slice(0)); changed[0] ^= 1;
      try { await decrypt(changed); throw new Error('Modified packet unexpectedly passed verification.'); }
      catch (error) {
        if (error.name !== 'OperationError') throw error;
        return () => { $('attack-result').textContent = 'REJECTED (real AES-GCM): a byte changed, so authentication failed. Bob accepted no plaintext. This checks integrity, not delivery or freshness.'; activity('tamper-rejected'); };
      }
    }
    // Each experiment starts with a clean receiver and first accepts the original.
    const seen = new Set();
    async function receive() {
      await decrypt(snapshot.cipher);
      if (guard && seen.has(1)) return false;
      seen.add(1);
      return true;
    }
    await receive();
    const replayAccepted = await receive();
    return () => {
      if (!replayAccepted) {
        $('attack-result').textContent = 'DUPLICATE REJECTED: first delivery passed real GCM verification. The replay also has a valid tag, but the demo receiver remembers sequence 1 and refuses a second delivery.';
        activity('replay-guarded');
      } else {
        $('attack-result').textContent = 'REPLAY ACCEPTED: both deliveries passed real GCM verification. Without a freshness policy, an unchanged old packet can be accepted twice. GCM alone does not prevent replay.';
        activity('replay-unguarded');
      }
    };
  });
  clearPacket();

  const missions = [
    { title: 'Deliver one authentic message', link: '#message-journey', action: 'Open the message journey', requirements: [['encrypted', 'Encrypt a message with Alice’s derived key'], ['verified', 'Verify and decrypt the authentic packet at Bob']], hint: 'Use Learner or Alice. Complete Authenticate → ML-KEM → Derive → AES-GCM → Verify. Start a new journey if needed.', question: 'What allowed Bob to accept the message?', options: ['Matching derived keys and successful GCM authentication', 'The public nonce made the plaintext public'], correct: 0 },
    { title: 'Stop a substituted key and a modified packet', link: '#attack-playground', action: 'Open Attack Playground', requirements: [['untrusted-blocked', 'Block an untrusted substituted public key'], ['tamper-rejected', 'Reject a modified packet using real GCM verification']], hint: 'Prepare a packet and run Substitute a public key. Then choose Modify a packet byte, prepare a fresh packet and run it. The two checks protect different boundaries.', question: 'Why are both checks necessary?', options: ['GCM automatically proves every public key belongs to Bob', 'Identity binding protects key establishment; GCM detects packet modification'], correct: 1 },
    { title: 'Explain the replay boundary', link: '#attack-playground', action: 'Open Attack Playground', requirements: [['replay-unguarded', 'Observe a replay accepted without the freshness policy'], ['replay-guarded', 'Reject that replay with the freshness policy enabled']], hint: 'Choose Replay a valid packet and prepare it. Turn the freshness policy off, run once, then turn it on and run again. Compare both outcomes.', question: 'Why did the policy change the result?', options: ['The receiver tracked a duplicate sequence; GCM alone only authenticated the bytes', 'The second packet used a broken authentication tag'], correct: 0 }
  ];
  let mission = 0;
  const evidence = new Set();
  let missionComplete = false;
  function renderMission() {
    const item = missions[mission];
    $('mission-title').textContent = item.title;
    $('mission-counter').textContent = `MISSION ${mission + 1} / ${missions.length} · ${missionComplete ? 'COMPLETE' : 'IN PROGRESS'}`;
    $('mission-link').href = item.link; $('mission-link').textContent = item.action + ' →';
    $('mission-checklist').replaceChildren(...item.requirements.map(([type, text]) => node('li', `${evidence.has(type) ? '✓' : '○'} ${text}`, evidence.has(type) ? 'correct' : '')));
    $('mission-hint').textContent = item.hint;
    $('mission-question').textContent = item.question;
    $('mission-options').replaceChildren(node('legend', 'Explain your result', 'sr-only'));
    item.options.forEach((text, index) => {
      const label = node('label', undefined, 'answer'), input = document.createElement('input');
      input.type = 'radio'; input.name = 'mission-answer'; input.value = index;
      label.append(input, document.createTextNode(text)); $('mission-options').append(label);
    });
  }
  $('mission-select').onchange = () => {
    mission = Number($('mission-select').value); evidence.clear(); missionComplete = false;
    $('mission-feedback').textContent = ''; $('mission-hints').open = false; renderMission();
  };
  $('mission-restart').onclick = () => {
    evidence.clear(); missionComplete = false; $('mission-feedback').textContent = ''; renderMission();
  };
  window.addEventListener('pqlab:activity', event => {
    const type = event.detail.type;
    if (type === 'journey-reset' && mission === 0) { evidence.clear(); missionComplete = false; }
    else if (missions[mission].requirements.some(([required]) => type === required)) evidence.add(type);
    else return;
    $('mission-feedback').textContent = '';
    // Keep the reflection selection while updating experiment evidence.
    const selected = $('mission-options').querySelector('input:checked')?.value;
    renderMission();
    if (selected !== undefined) $('mission-options').querySelector(`input[value="${selected}"]`).checked = true;
  });
  $('mission-form').addEventListener('change', () => { $('mission-feedback').textContent = ''; });
  $('mission-form').onsubmit = event => {
    event.preventDefault();
    const item = missions[mission], answer = $('mission-options').querySelector('input:checked');
    if (!item.requirements.every(([type]) => evidence.has(type))) { $('mission-feedback').textContent = 'Complete both experiment steps first. Open the hint for guidance.'; return; }
    if (!answer) { $('mission-feedback').textContent = 'Choose an explanation for your result.'; return; }
    if (Number(answer.value) !== item.correct) { $('mission-feedback').textContent = 'Not quite. Compare the experiment outcomes and try the explanation again.'; return; }
    missionComplete = true;window.completeLearning(`mission-${mission}`);
    $('mission-counter').textContent = `MISSION ${mission + 1} / ${missions.length} · COMPLETE`;
    $('mission-feedback').textContent = 'Mission complete. You demonstrated the behavior and explained why it happened.';
  };
  renderMission();
};

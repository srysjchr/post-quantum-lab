# Post / Quantum — A Visual Field Guide

A detailed, all-English HTML/CSS/Three.js learning experience. No framework or build step is required.

## Online

[Open the live website](https://srysjchr.github.io/post-quantum-lab/)

Hosted on GitHub Pages over HTTPS. Updates pushed to main are published automatically. The GitHub repository is public.

## Open

Open index.html directly in Chrome, Edge, or Firefox. All libraries are bundled, so the lessons work offline. Keep index.html, styles.css, lessons.js, scene.js, journey.js, labs.js, double-encapsulation.js, key-substitution.js, wire-scene.js, wire-builder.js, protocol-repair.js, teach-back.js, progress.js, navigation.js, app.js, and vendor together.

For a local web server:

    python -m http.server 8080 --bind 127.0.0.1 --directory C:/Cybersecurity/post-quantum-lab

Then open http://127.0.0.1:8080. Add ?chapter=3 to start with Lattices & noise; values 1 through 6 are supported.

## Six complete chapters

1. Foundations — one-way problems, public/private keys, symmetric cryptography, and tiny RSA factor examples.
2. Quantum threat — Shor versus Grover, algorithm-specific risks, and harvest-now/decrypt-later.
3. Lattices & noise — modular equations, a worked toy equation, Module-LWE, and an observation-displacement slider.
4. Key exchange — four interactive ML-KEM protocol stages, public/private objects, authentication, and ML-KEM-768 object sizes.
5. Protect a message — KDF/AEAD roles, an actual local AES-256-GCM round trip, and modified-ciphertext rejection.
6. Migration — signatures, hybrid protocol composition, cryptographic agility, and deployment considerations.

Each chapter has a distinct 3D illustration, deeper explanations, a worked example or comparison, and a question with explanatory feedback. Use the mouse or focused arrow keys to rotate a model. Reset view and pause/play controls are available. Reduced-motion preferences are respected.

## Cryptography and limitations

The Three.js scenes, noise slider, RSA examples, and ML-KEM states are educational models. They do not run ML-KEM or quantify attack effort. The standalone AES demo performs real cryptography via Web Crypto: a fresh non-extractable AES-256 key, random 96-bit nonce, and 128-bit authentication tag for each encryption. It verifies an exact UTF-8 round trip and can check rejection after changing one ciphertext byte. No data or key is sent to a server or saved by the application.

The AES demo is not an authenticated post-quantum channel. A real deployment needs reviewed libraries, a supported protocol, correct peer authentication, key derivation, nonce management, and operational security. WebGL failure does not prevent reading lessons or using the learning controls. Web Crypto availability depends on browser/context support; localhost is supported by modern browsers.

## Sources and dependencies

Primary sources are linked in the Reference section: NIST FIPS 203, FIPS 204, PQC FAQ, NCCoE migration guidance, and Shor's original paper.

Three.js 0.160.1 is bundled as a classic browser script to support direct file opening. MIT license: vendor/THREE-LICENSE.txt. No external fonts or runtime network dependencies are required.

## Perspectives and one-message journey

Learner, Alice, Bob, and Eve views update the model and information panel. RSA products, hidden/revealed factors, and formulas share one state. The lattice observation moves from a fixed reference; the slider measures illustration displacement, not security. KEM transmissions travel Bob to Alice for ek and Alice to Bob for c; private secrets stay at their endpoints.

The continuous journey gates five stages: simulated identity binding, simulated ML-KEM, real HKDF-SHA-256, real AES-256-GCM, and authenticated verification. A random stand-in secret supplies the HKDF demo; this is explicitly not an ML-KEM output. Independent endpoint derivations must decrypt the same packet. Try an untrusted public key, change a packet byte, restore it, or switch to Eve. Private values are hidden for teaching; all code and demo state run in the same browser and do not create an isolation boundary.

Web Crypto reference: https://www.w3.org/TR/webcrypto/

## Browser regression checks

Install Playwright in your test environment and supply a Chromium executable if required. Serve the repository over localhost and run `node tests/browser.cjs`. Optional environment variables: `TEST_URL`, `PLAYWRIGHT_MODULE`, and `CHROMIUM_PATH`. The test captures the desktop and mobile previews in the repository root.

## Practice labs

Use the Practice navigation link to reach three interactive learning surfaces:

- Scenario Lab: three decisions about archive confidentiality, shared-secret establishment and signed software releases. Every choice has explanatory feedback; solved scenarios are counted once.
- Attack Playground: substitute a public key (simulated identity binding), change a ciphertext/tag byte (real AES-GCM rejection), replay a valid packet with and without duplicate tracking, and drop a packet (simulated delivery failure). Packet preparation uses a fresh non-exportable AES-256 key and a fresh 96-bit nonce. The exercise sequence is authenticated as additional data. No private key or message bytes are displayed.
- Guided Missions: three missions record actual experiment outcomes and require a correct explanation. Checklists cannot be completed just by selecting an answer. Hints link to the existing message journey or playground. Choose a mission before experimenting; changing missions starts a fresh checklist.

All experiments run locally. No account or backend is needed, and progress lasts only for the current page session. The playground has its own packet and keys; it does not reuse the journey’s keys. Each replay comparison starts a clean demo receiver, accepts one packet, then presents its duplicate. Duplicate tracking illustrates a protocol policy; this is not a complete secure network protocol.

Run `node tests/labs.cjs` with the same Playwright configuration as the chapter suite. Set `EVIDENCE_DIR` to an existing directory to capture desktop and mobile screenshots outside the repository. Use `SKIP_SCREENSHOTS=1` with `tests/browser.cjs` when you only need regression checks.

AEAD protocol boundaries: https://www.rfc-editor.org/rfc/rfc5116#section-1.2

## Deeper attacker perspective

In chapter 4, open “Look through Eve’s eyes” to highlight Eve’s knowledge and hide private objects in the 3D model. The phase-specific comparison lists ek, dk, c, K and traffic keys for Alice, Bob and Eve. It distinguishes public data, private local knowledge, hidden data and operations that have not happened yet. At Encaps, Bob has c but does not have K until Decaps; at KeyGen, Eve has ek but there is no c to capture.

The captured transcript shows only transmissions that have occurred. Passive eavesdropping and active interference explain different capabilities, including public-key substitution and metadata observations. Expand the four questions to distinguish encapsulating a new secret from recovering Alice’s secret, key possession from identity, and a KEM ciphertext from an encrypted chat message. All values are symbolic illustrations; no real ML-KEM secrets are generated or disclosed.

Run `node tests/kem-perspectives.cjs` with the same Playwright environment variables as the other suites. Optional `EVIDENCE_DIR` captures desktop/mobile screenshots outside the repository.

## Predict Before Reveal

Chapter 4 includes an optional three-checkpoint exercise: predict what Encaps gives Alice, whether Bob holds K before Decaps, and whether deriving traffic keys sends secrets over the wire. Choose an answer to unlock the next operation. The result updates the same phase buttons, 3D model, knowledge table and captured transcript, with feedback for both correct and incorrect predictions. Observer changes preserve your selection. Restart resets to KeyGen; manual phase exploration exits the guided exercise. This is still a symbolic KEM illustration.

Run `node tests/predictions.cjs` with the existing Playwright configuration. `TEST_URL` accepts the site root; `EVIDENCE_DIR` optionally captures screenshots outside the repository.

## Two Encapsulations, Two Secrets

Chapter 4 now lets Alice and Eve independently create symbolic (K, c) pairs using Bob’s same public ek. Select each public ciphertext and let Bob decapsulate it locally. Bob recovers the corresponding secret, while Eve’s view shows only Eve’s own K, not Alice’s K. Regenerating a party’s pair invalidates Bob’s recovery for that old pair. Both recoveries are required before checking the explanation.

This is an explicitly labeled symbolic simulation: labels and the recovery mapping are teaching examples, not real ML-KEM randomness, ciphertexts or secrets. It models valid encapsulations and does not prove sender identity or guarantee that mathematical collisions are impossible. The experiment has independent state from the four-step timeline; perspective controls apply to both. Small screens can scroll the comparison table with touch or keyboard.

Run `node tests/double-encapsulation.cjs` with the existing Playwright configuration. `TEST_URL` accepts the site root; `EVIDENCE_DIR` optionally captures screenshots outside the repository.

## Key Substitution Story

Chapter 4 includes a five-step symbolic story comparing correct identity binding with skipping that check. Eve substitutes her own public ek_Eve as if it belonged to Bob. The protected path stops before encapsulation. In the unchecked path Alice encapsulates to ek_Eve, then Eve decapsulates with her own dk_Eve; Alice and Eve hold K_AE, while Bob does not. Bob’s private key was never stolen, and the story does not model breaking ML-KEM.

Step controls reveal the sequence, actor cards track local knowledge and the global perspective controls highlight the selected actor. The final explanation is gated on completing the story. Rewinding or restarting clears the answer. Story state is independent from the main timeline and other experiments. All operations and identity checks are explicitly simulated; no ML-KEM, certificate or signature implementation is added.

Run `node tests/key-substitution.cjs` using the existing Playwright configuration. `TEST_URL` accepts the site root; `EVIDENCE_DIR` captures optional screenshots outside the repository.

## Build the Wire

Choose symbolic ek, c, dk, K or traffic-key objects and transmit a batch to a public channel. Eve’s capture persists within the experiment. The participant cards distinguish direct observations from the illustrated inference chains: compromised dk exposes the matching public ek; dk plus c yields K; K plus public context yields the traffic key. Direct traffic-key exposure does not establish knowledge of K or dk. Bob’s valid local decapsulation and derivation are illustrated when c arrives.

A correct intended public transcript contains ek and c without secret objects. A captured secret cannot be removed by changing a selection; start a fresh illustrative exchange instead. Queued selections survive observer changes. The model starts with prepared valid objects, tracks limited inference rules, and does not perform real ML-KEM or exhaustive cryptanalysis.

Run `node tests/wire-builder.cjs` with the existing Playwright configuration. Optional `EVIDENCE_DIR` captures desktop/mobile screenshots outside the repository.

## Find the Missing Protection

Four symbolic cases distinguish authenticated key establishment, public-key identity binding, authenticated message encryption and freshness state. Run a baseline, select the smallest missing protection and apply the patch to compare outcomes. A larger symmetric key is a deliberate distractor; adding an already-present or unrelated role does not count as a minimal patch. Each accepted case is counted only once per page session. Changing a selection invalidates the displayed patch result.

Cases isolate wrong-key ownership, missing ciphertext integrity, unchanged-packet replay and absent shared secret input for a proposed ML-KEM session. Other reviewed authenticated key-establishment protocols can fill the same role; the exercise does not claim ML-KEM is the only option. All before/after outcomes are simulated and assume the other listed roles are implemented correctly. Use Attack Playground for actual AES-GCM experiments.

Run `node tests/protocol-repair.cjs` with the existing Playwright configuration. Optional `EVIDENCE_DIR` captures screenshots outside the repository.

## Teach It Back

Three explanation topics use evidence from the current Build the Wire experiment (public-only transcript or dk+c exposure) and both observed replay-policy outcomes from Attack Playground. Fill three claims to build an explanation; feedback identifies each misconception rather than accepting a memorized word. Evidence changes invalidate the checked explanation. Replay evidence is historical within this page session; wire evidence always reflects the current exchange.

Optional notes let learners restate the result in their own words. Notes are not automatically graded, saved or submitted. Clearing the form preserves experiment evidence; resetting the wire starts a different symbolic exchange. No AI service or backend is used.

Run `node tests/teach-back.cjs` using the existing Playwright configuration. Optional `EVIDENCE_DIR` captures screenshots outside the repository.

## Learning Progress

The learning panel saves a versioned, browser-local completion history for six chapter quizzes and 24 exercise milestones. A visit alone never completes a lesson. Existing exercise success paths record milestones; all three guided predictions must be correct in one run. Continue learning opens the last chapter or exercise section. The completion checklist opens the relevant section, and chapter buttons show completion badges.

Only milestone IDs and the last chapter/section are saved under `post-quantum-lab.progress.v1` in localStorage. Messages, secret keys, ciphertext, radio answers, reflection notes and running experiments are not saved. Exercise counters and experimental state restart for the page session; past completion history remains independent. No account, backend or cross-device sync is used. Progress is specific to this browser/profile and origin. Clearing browser data also clears it.

Clear saved progress removes only this app’s history. Other open tabs update their history display. Corrupt/unsupported records and unknown IDs are filtered safely. Blocked storage or quota failures fall back to session-only progress without blocking lessons or experiments.

Run `node tests/progress.cjs` with the existing Playwright environment variables. Existing exercise suites also assert their corresponding saved completion milestones. Optional `EVIDENCE_DIR` captures screenshots outside the repository.


## Learning Navigation

The exercise menu provides direct entry to ten exercises and a recommended sequence, from selecting cryptographic roles to explaining observed attacker behavior. Previous/next controls follow this order; Back to exercise menu returns focus to the picker. The six chapter buttons remain available independently, with no locked prerequisites.

Exercises use native keyboard-accessible disclosure panels. Only one is expanded at a time, reducing page length while retaining running experiments and typed notes in the current page session. Opening a KEM-specific exercise selects chapter 4 automatically. Direct fragment links, mission links, Continue learning and the completion checklist expand their destination before scrolling and focusing it. Browser back/forward follows exercise links; changing chapters clears stale exercise fragments. Reloading still resets experimental inputs as described under Learning Progress.

`navigation.js` owns the menu and panel navigation. Run `node tests/navigation.cjs` in the existing Playwright environment. Existing regression suites use `tests/navigation-helper.cjs` to enter collapsed exercises through the visible menu. Optional `EVIDENCE_DIR` saves navigation screenshots outside the repository.


## Participant cameras and interactive 3D wire

Open **Build the Wire** in the exercise menu. Overview and Alice/Bob/Eve cameras show participant areas, a public channel and Eve's copy of transmitted objects. The local perspective buttons stay synchronized with the page's observer controls. The existing chapter-4 timeline also changes camera position for each participant and includes Eve's public-capture area.

Drag the orange ek or c marker into the public channel, click a marker, or use the explicit Send buttons/keyboard. Touch dragging is supported. Dropping outside the channel or pressing Escape cancels a drag. The public packet moves toward its recipient with a copy branching toward Eve; reduced-motion users receive the same final state without animation. Each public object is captured only once. Other queued selections remain local until explicitly sent.

This shares Build the Wire's existing symbolic rules, transcript, knowledge cards, reflection evidence and completion history. Alice starts with authenticated ek and a prepared (K, c); sending c illustrates Bob's local decapsulation. K has no public trajectory. Transmitting dk, K or a traffic key through the existing object list updates the same 3D knowledge view, including compromise inference. Unknown labels represent unavailable knowledge rather than missing protocol roles. These are teaching models, not real ML-KEM operations or browser-side security boundaries.

`wire-scene.js` only renders the model and forwards send actions to `wire-builder.js`; it does not implement parallel cryptographic rules. Without WebGL, the Send controls and knowledge cards retain the complete experiment. No new dependencies or saved data are introduced. Run `node tests/wire-3d.cjs` with the existing Playwright setup; optional `EVIDENCE_DIR` saves desktop/mobile screenshots outside the repo.


## Continue exploring the 3D wire

The live three-check guide follows transmitted objects and offers a shortcut to Eve's view; it leaves free exploration and either sending order available. Red packets illustrate explicit dk/K/traffic-key exposure, while orange packets represent intended public ek/c. Every object in a multi-object transmission is animated and retained in Eve's capture.

Rotate left/right inspects the scene in 15-degree steps. Reset camera preserves the experiment; changing participant restores that participant's preset. The capture inspector uses the existing object's origin and explanation and highlights it in 3D without transmitting again or changing evidence. Camera and inspection choices are not stored.

Expand **Compare with a public-only exchange** to compare Eve's current object knowledge with an ek+c reference using the same inference function. Incomplete transcripts are labelled incomplete. A matching table is not a proof of protocol security; identity binding, AEAD, freshness and implementation security remain separate requirements. A fresh experiment clears the illustrative capture rather than recalling a real secret leak.

Run `node tests/wire-learning.cjs` for guide, exposure, camera, inspection, reference-comparison and responsive checks. The full browser suite also covers the existing learning history, exercises and crypto demonstrations.


## Small wire usability improvements

The unsent-selection summary and clear action affect only queued selections, while capture totals distinguish public and exposed secret objects. Previous/next inspection follows capture order without sending again. Focus the 3D view to rotate with Left/Right and restore the participant camera with Home; form controls retain their native keys.

**Animate packet paths** can disable travel animations for the page session; system reduced motion takes precedence. Transmission, inference and evidence work identically with animation off or without WebGL. The on-demand glossary explains all five object symbols and the visual markers. Baseline differences have explicit text as well as color.

When the current transcript supports a public-only or private-key-exposure explanation, a link opens the matching Teach It Back topic. Switching topics clears the other topic's selected claims as usual, while retaining optional notes and the wire experiment. A visit never completes a milestone. Run `node tests/wire-polish.cjs` for the complete usability flow, including keyboard, motion preference changes, preserved notes/evidence and four responsive widths.


## Refinement checks

Mixed direct-K and dk+c exposures describe both paths accurately. Baseline differences distinguish direct captures from inference, and queued private objects are explicitly labelled still local. Inspection includes the selected capture's position.

The main scene suspends animation when offscreen, resumes on visibility and preserves manual pause/reduced-motion preferences. Exercise links preserve native tab order; disabled destinations focus the containing section. Browser Back to the menu restores picker focus without taking focus during initial loading. Chapter choices update the chapter query parameter, retaining other parameters, and reload/history restores the corresponding lesson. KEM exercise routing keeps its fragment while correcting the effective chapter.

Run `node tests/wire-refinements.cjs` and `node tests/render-visibility.cjs` alongside the existing suites. The animation test measures scheduled callbacks across visible/offscreen/resumed/paused states rather than requiring specific frame rates.

## Attacker knowledge and capture inspection

Build the Wire separates directly captured objects from additional inferred knowledge and lists the evidence for each inferred object. Eve's 3D overlay identifies whether K was captured directly, recovered from dk+c, or remains unavailable. These explanations follow the existing symbolic model; no real KEM bytes are generated.

Inspect a capture from its transcript entry, use previous/next, or jump to the latest capture without transmitting again. The 3D drop target names remaining public objects. Opening an exercise from its summary keeps the picker and URL aligned; closing it clears its exercise fragment while retaining query parameters.

Run `node tests/wire-usability.cjs` for knowledge provenance, non-mutating inspection, 3D guidance, pointer/keyboard summary activation, route reloads, reset behavior and four responsive widths.


## Learning continuity and main scene controls

Continue learning and saved exercise milestones keep a reloadable exercise URL without restoring in-progress experiment data. Cross-tab progress updates retain the focused checklist entry. Page-section links close the exercise and focus their destination; browser history restores the corresponding exercise or section.

The main 3D model retains manual pause independently of system reduced motion. The motion status explains why animation is stopped, and the playback control stays disabled while reduced motion is active. Focus the model to rotate with arrow keys, reset with Home, or end a drag with Escape. Reset, chapter/model changes and context interruption release stale pointer ownership. The model, controls and motion hints occupy separate rows on narrow and wide layouts.

Run `node tests/learning-continuity.cjs` for real cross-tab updates, reload/history, motion-policy transitions, rendered camera comparisons, pointer cancellation/context restoration and four responsive widths. Optional `EVIDENCE_DIR` saves desktop/mobile screenshots outside the repository.


## Find the next learning step

The completion checklist can show all, unfinished, or completed milestones with an explicit empty state and result count. Filters apply only to the current page session. Open next unfinished step follows the existing learning order and completion history, independently of the filter; visiting a destination does not award completion. The control becomes unavailable when all milestones are completed.

Individual scenario, protocol-repair, explanation and mission entries select the matching part of the exercise. Attack entries select the corresponding action and replay policy without preparing or running the attack. Reopening the same part retains pending selections; switching parts follows the exercise's normal reset/evidence rules. Notes and experiment data are still never restored from learning metadata.

Run `node tests/milestone-navigation.cjs` for precise destinations, preserved same-part work, evidence boundaries, real cross-tab completion/filter focus, next unfinished steps, completed-state handling and four responsive widths. Optional EVIDENCE_DIR saves mobile/desktop screenshots outside the repository.


## Keyboard access and accurate current-state feedback

Skip to lesson is the first keyboard stop and appears when focused, bypassing long navigation and progress sections without changing the chapter. Same-chapter Continue retains pending quiz choices and AES drafts in the current page; reload still starts fresh sensitive state. Exercise deep links open targeted/nested details, and modified link clicks retain normal browser new-tab behavior.

Keyboard wire sends move focus to inspection when their active send button becomes disabled; pointer sends keep the existing viewport behavior. Teach It Back associates missing/wrong claims with their field errors and clears stale associations after edits or evidence changes. Interrupted WebGL disables unavailable wire camera/motion controls while transmission and knowledge remain usable. Mixed traffic-key/private-key/shared-secret narration follows the actual capture without changing inference rules.

Run `node tests/daily-polish.cjs` for these interactions, actual new-tab/WebGL behavior and four responsive widths. Optional EVIDENCE_DIR saves skip-link, mixed-exposure and explanation screenshots outside the repository.


## Interaction reliability and keyboard continuity

Quantum algorithm explanations and Attack Playground descriptions have independent targets across all six chapters. Keyboard transmission through projected public tokens moves focus to capture inspection; interrupted drags release pointer capture and cannot become accidental sends. Main-scene WebGL loss exposes unavailable controls and preserves the manual pause preference on restoration.

Guided predictions focus the next answer or revealed explanation. Previous/next lesson, scenario and repair navigation focuses the new heading, including at disabled endpoints. Quiz and scenario errors describe their answer groups and clear on edits or navigation. Modified reflection links open normally without changing a pending explanation in the source tab; an ordinary click still selects the matching topic.

Run `node tests/daily-interactions.cjs` with the existing Playwright configuration for these regressions, real WebGL loss/restoration, real Ctrl-click new tabs and 320/390/768/1440 viewport checks. Optional `EVIDENCE_DIR` saves wire and scenario screenshots outside the repository. These changes add no dependencies or stored learning data.


## Readable 3D wire graphics

The Build the Wire scene gives Alice, Bob and Eve separate endpoint zones with matching A/B/E badges and readable participant cards outside the drag canvas. Public drag controls sit above the endpoint models. Camera fitting keeps the public controls and all participant zones visible across narrow screens and rotated side views.

Object shapes remain consistent in the endpoint, in flight and in Eve's capture: ek is a key, c a capsule, dk a vault, K a diamond and the traffic key a card. A text-and-shape legend supplements the public/exposure colors. Unknown state stays filtered by the selected observer; shape visibility never exposes secret bytes.

Solid arrows show delivery; a dashed branch shows Eve's recorded copy. The four-step route and nearby flight status connect public ek, public c, Bob's local Decaps and Eve's capture. Only the sent objects travel; Bob's K and derived traffic key stay inside his endpoint during the intended exchange. A local pulse illustrates Decaps, while the final knowledge state updates immediately as before. Reduced/manual motion and WebGL fallback retain the static explanation. Secret-exposure narration accounts for previously captured dk or K.

Run `node tests/wire-graphics.cjs` with the existing Playwright environment for rendered shape geometry, animated public delivery/copy, local secret positions, all camera presets and rotated views at 320/390/768/1440 widths, motion/reset behavior, exposures and WebGL fallback. Optional `EVIDENCE_DIR` saves desktop/mobile screenshots outside the repository. No dependencies or stored profile fields are added.

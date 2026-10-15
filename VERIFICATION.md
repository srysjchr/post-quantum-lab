# Verification report

The final product is a six-chapter, all-English educational site. Source and README contain no Thai text. The visible lesson text, formulas, detailed explanations, quiz choices, feedback, demo output labels, error messages, and controls are English.

## Functional verification

Passed with bundled Playwright and installed Chromium headless shell using software WebGL. The browser connector first validated all six chapters, quizzes, noise/KEM controls, AES round trip, and ciphertext tampering. Its connection repeatedly restarted and one target closed; Playwright was used for the complete repeatable verification.

- Correct page title, meaningful content, canvas, and English document language.
- All six chapters: three deep-dive explanations, two detailed sections, and one three-choice quiz each.
- Correct quiz answer and explanatory feedback for every chapter; missing and wrong-answer handling.
- RSA factors for 323 and 899; Shor/Grover toggle; noise slider; all four KEM stages; hybrid toggle.
- AES-GCM exact round trips for empty text, Unicode including emoji and literal HTML, and 500 characters.
- Literal HTML displayed as text without DOM injection.
- Different ciphertext after repeating encryption; rejection after changing a ciphertext byte.
- Clearing stale ciphertext when the input changes.
- Paused and resumed motion, keyboard rotation/reset, and reduced-motion initial state.
- No horizontal overflow in all six chapters at widths 320, 390, and 768.
- WebGL disabled: fallback is visible and chapter navigation still works.
- No application runtime errors or failed resources in the final Playwright run.

The bundled classic Three.js 0.160.1 script emits its upstream deprecation warning. The classic build was retained for direct file opening and offline support. No other runtime dependencies are needed.

## Visual verification

Image Gen concept: C:/Users/Msii/.codex/generated_images/01a12be3-db2c-7d01-b447-9b01d5002304/exec-46f30db4-5530-4656-806e-5313e779f9d7.png

Final desktop: preview.png, 1536 × 1024.
Final mobile: mobile-preview.png, full page at width 390.

The concept and both final screenshots were directly inspected with view_image.

Comparison points:
1. Header hierarchy, English brand, title, and horizontal chapter navigation match the concept direction.
2. Dark navy background, mint highlight, orange observation, and muted explanatory text are consistent.
3. Left explanation / right interactive scene composition and three-column deep dive are preserved.
4. The initial small lattice was enlarged and node halos added after screenshot inspection.
5. Formula, noise slider, legend, and reset/pause controls are rendered as actual HTML controls.
6. Mobile stacks the lesson, visualization, detailed content, quizzes, and references without overflow.
7. Text and controls remain readable, with explicit typography and focus states.

Intentional changes from the generated concept:
- Revised the lattice text and formulas to distinguish a simple visual displacement from real Module-LWE. Removed invented distribution/axis annotations that could imply actual cryptographic parameters.
- Added chapter count, previous/next navigation, a keyboard hint, deeper sections, quizzes, and primary references to satisfy the request for substantially more detail.
- Replaced decorative concept icons with restrained native glyphs.
- The final page continues below the first viewport, because every chapter now includes detailed educational content.
- Only the explicitly labeled AES-GCM demo executes cryptography; the other scenes are educational models.

Above-the-fold copy was checked against the title, navigation, lesson content, and intentional changes above. No accidental Thai copy or unrelated marketing content remains. No outstanding functional failures were found. Visual direction and implementation were compared directly; the changes above are deliberate adaptations for correctness and the expanded learning scope.

## Perspective and journey update — 2026-10-12

Validated with Playwright and Chromium software WebGL. Reviewed desktop and mobile screenshots.

- All six chapters, correct quizzes, deep explanations and detail sections.
- Selected RSA product/formula/model synchronization, reveal gating and Eve redaction.
- Fixed lattice reference, numeric displacement and hidden reference in Eve view.
- Correct ek and c transmission directions; decapsulation remains local.
- Sequential journey gates and blocked substituted identity key.
- Independent real HKDF keys and AES-GCM round trips for empty text, Unicode/literal HTML, and 500 characters.
- Modified packet rejection, cleared recovered plaintext, restoration and re-verification.
- Eve cannot see message input or recovered plaintext; public ciphertext stays available.
- Reset returns to authentication and invalidates pending operations.
- Existing standalone AES demo round trip, Eve redaction and tampering rejection.
- All six chapters at 320, 390, 768 and 1440 pixels without horizontal overflow.
- English visible content; no application runtime or resource HTTP errors.
- WebGL unavailable fallback retains authentication and progression controls; reduced-motion preference supported.

Authentication and ML-KEM remain simulations. The HKDF input is fresh random stand-in material. This is an educational browser experience, not a deployed post-quantum secure channel.

## Scenario Lab, Attack Playground and Guided Missions — 2026-10-13

Validated using the committed Playwright suites on localhost with Chromium and software WebGL. Browser plugin was not available. Desktop and mobile screenshots were captured outside the repository and visually reviewed.

- Three scenario choices: missing answer, incorrect explanation, correct explanation, unique solved count, navigation and reset.
- Four attacks: simulated key substitution blocking, real AES-GCM tag rejection, real verification of a replay with duplicate policy on/off, and simulated missing delivery.
- New packet preparations produce different public packet bytes and fresh nonces.
- Three missions require both recorded experiment outcomes plus a correct reflection answer. Missing steps, missing/wrong explanations, hints, mission changes and restarts were checked.
- Journey resets clear mission evidence and completion feedback. Chapter and observer changes preserve independent scenario state.
- Reset during an asynchronous packet preparation cannot restore an obsolete packet.
- Missing Web Crypto displays an actionable error while scenario exercises remain usable.
- English-only visible content, no horizontal overflow at 320, 390, 768 and 1440 pixels, and no application runtime or HTTP resource errors.
- Existing six-chapter suite passed, including quizzes, 3D synchronization, observer boundaries, real HKDF/AES round trips, tamper rejection, pending-operation reset and WebGL fallback.

Identity binding, ML-KEM and network delivery remain illustrative. AES-GCM operations are real; replay tracking is an in-memory demonstration policy. Tested browser coverage is Chromium, not a claim of cross-browser certification.

## Deeper KEM attacker perspective — 2026-10-13

- Verified all four KEM phases for Alice, Bob and Eve: five knowledge rows, highlighted role, correct public transcript length and hidden private 3D objects.
- Corrected the initial Eve view to show ek only; c appears after encapsulation.
- Verified Bob’s K remains “Not yet” until decapsulation; traffic keys appear only at Derive.
- Tested the Eve shortcut, keyboard-operated passive/active controls, experiment link visibility and four expandable explanations.
- Reviewed screenshots at 1440 and 390 pixels; checked no page overflow at 320, 390, 768 and 1440 pixels.
- Verified chapter re-entry resets the KEM timeline, English-only visible content, reduced motion and fully functional knowledge tables without WebGL.
- Existing practice-lab and six-chapter regression suites were run after integration.

The comparison shows who knows symbolic objects under stated assumptions; it does not execute ML-KEM, estimate attack effort or isolate browser memory.

## Predict Before Reveal — 2026-10-13

Verified three checkpoints with correct and incorrect answers, disabled reveal before selection, guarded form submission, keyboard reveal, observer-selection persistence, synchronized KEM phase/table/transcript, restart, manual timeline exit and chapter re-entry. Reviewed desktop/mobile screenshots and checked 320, 390, 768 and 1440 pixel layouts, English visible content and runtime errors. Existing KEM perspective and six-chapter regression suites were also run. The exercise does not execute real ML-KEM.

## Two Encapsulations, Two Secrets — 2026-10-14

Verified same public key and separate symbolic pairs, selective Bob decapsulation, matching per-ciphertext recovery, all perspective visibility rules (including Eve knowing only her own secret), regeneration invalidation, explanation gates and wrong/missing answers, reset, keyboard controls, independent timeline/chapter state, English content and WebGL fallback. Checked 320/390/768/1440 pixel layouts and reviewed desktop/mobile screenshots. The comparison table supports focused keyboard horizontal scrolling on small screens. Existing chapter, KEM perspective and prediction regression suites were also run. This model does not execute ML-KEM.

## Key Substitution Story — 2026-10-14

Verified five sequential stages, protected-path blocking before Encaps, unchecked Alice/Eve secret ownership, Bob’s absence from that encapsulation, Eve’s pre-Decaps state, missing/wrong/correct reflection answers, guarded early submission, actor highlighting, preserved observer selection, rewind/reset, independent chapter/timeline state and keyboard navigation. Checked 320/390/768/1440 pixel layouts, English visible content, WebGL fallback and runtime/resource errors; reviewed desktop/mobile screenshots. Existing chapter, double-encapsulation and prediction suites were also run. This is an explicitly symbolic trust-boundary demonstration.

## Build the Wire — 2026-10-14

Verified public-only and incomplete transcripts, queued selection privacy/persistence, dk+c secret inference in both transmission orders, direct K and traffic-key exposure, no reverse inference from a traffic key, cumulative capture, inability to recall transmitted secrets, participant views, reset, independent timeline/chapter state, keyboard operation, four responsive widths, English and WebGL fallback. Reviewed styled desktop/mobile screenshots; request failures and missing CSS are checked by the new suite. This exercise uses symbolic prepared objects and limited inference rules, not actual cryptographic operations.

## Find the Missing Protection — 2026-10-14

Verified four defects and minimal patches, baseline outcomes, missing/wrong/extra selections, unique solved counts, stale-result invalidation, observer/chapter persistence, navigation/reset, keyboard operation, four responsive widths, English and styled UI, and runtime/request errors. Reviewed desktop/mobile screenshots. Reran Build the Wire on the combined page; existing chapter and key-substitution regressions also passed. All repair outcomes are symbolic, not executed cryptographic attacks or a proof of complete protocol security.

## Teach It Back — 2026-10-14

Verified three evidence-backed explanations; blocked checks before experiment completion; missing/wrong/correct claims; per-field misconception feedback; invalidation when wire evidence changes; both real AES-GCM replay-policy outcomes; observer persistence; safe local-only literal-HTML notes; reset; four responsive widths; English content and runtime/request errors. Reviewed desktop/mobile screenshots and reran wire and chapter regression suites. Freeform notes are explicitly not automatically graded.

## Browser-local Learning Progress — 2026-10-15

- Dedicated progress suite: correct-only chapter completion, duplicate prevention, actual exercise completion, reload and Continue learning for chapter/exercise sections, no experimental-state restoration, metadata-only storage, clear-history and cross-tab updates, corrupt and untrusted saved data, blocked storage and quota failures, four responsive widths and runtime errors.
- Existing chapter and exercise suites assert saved milestones after real successful flows: six quizzes, scenarios, missions, five attack outcomes, verified journey, standalone AES, predictions, two-encapsulation explanation, substitution story, public-only wire, four repairs and three Teach It Back topics.
- All eight updated exercise suites passed, including their original behavior checks. Desktop and mobile screenshots were reviewed outside the repository.
- Storage holds only validated completion IDs and last-location metadata. Experiment secrets and typed reflection/message data are excluded. This history is a learning aid, not an assessment credential or cloud sync service.

## Learning Navigation — 2026-10-15

- Added one menu for ten exercises, a recommended learning sequence, previous/next controls and a return-to-menu action. Native disclosure panels keep only one exercise expanded while preserving current page-session experiments and notes.
- Dedicated navigation suite passed: initial collapsed state, menu/order/endpoints, automatic KEM chapter selection, preserved shareable fragments, browser Back/Forward including the initial collapsed page, keyboard/focus, recommended-path buttons, mission links, Continue learning, checklist destinations, session-state preservation, malformed hashes, four responsive widths, English, and runtime/HTTP errors.
- All eleven browser suites passed across navigation, progress, six chapters/real crypto flows, KEM perspectives, predictions, independent encapsulations, key substitution, scenarios/attacks/missions, wire building, protocol repair and Teach It Back. Navigation and progress were rerun after the final automatic-routing correction.
- Existing regression flows enter collapsed exercises through the visible exercise picker. JavaScript syntax and Git whitespace checks passed. Desktop/mobile menu and expanded-wire screenshots were reviewed outside the repository.
- The browser plugin is unavailable in this environment; verification used the bundled Playwright/Chromium fallback with software WebGL and the existing no-WebGL/crypto/storage fallback cases.

## Participant Cameras and Interactive 3D Wire — 2026-10-15

- Added overview and Alice/Bob/Eve cameras to Build the Wire, with synchronized observer controls, participant knowledge labels, a readable observer overlay, projected draggable public objects and a public-channel drop target. The chapter-4 scene also has participant camera presets and Eve's capture area.
- The new browser suite passed pointer dragging, keyboard sending, touch dragging through Chromium input, exactly-once captures, no transmission on an invalid drop or Escape, local Bob decapsulation, no Eve secret inference from public ek/c, compromise inference from the existing secret-exposure controls, queued-secret privacy, reset during animation, context interruption/restoration, session preservation, English, four widths across all cameras and no-WebGL operation. No runtime or HTTP errors were observed in the completed new-suite runs.
- All twelve browser suites passed: browser, double-encapsulation, kem-perspectives, key-substitution, labs, navigation, predictions, progress, protocol-repair, teach-back, wire-3d and wire-builder. Initial key-substitution runs encountered timeouts; script/network/navigation diagnostics and three consecutive runs of the original unchanged suite subsequently passed. No timeouts or assertions were relaxed.
- Reviewed desktop/mobile screenshots plus initial Alice/Bob/Eve camera views. Fixed projected packet clipping at 320px and overlapping labels based on rendered evidence. Screenshots and diagnostic scripts remain outside the repository.
- JavaScript syntax checks and Git whitespace checks passed. Used bundled Playwright/Chromium with software WebGL because the browser plugin is unavailable. No new dependency, server, authentication or stored learner data was introduced.
- This remains a symbolic prepared-exchange model. Wire state and inference rules have a single source in wire-builder.js; wire-scene.js renders that state and forwards public-send actions. Actual ML-KEM is not executed.

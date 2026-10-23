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

## 3D continuation 1/5 — 2026-10-16
Added a live three-check guide inside Build the Wire with an Eve-view shortcut. Queued selections never count as transmissions; either order remains available. Guide, exposure/reset and the full wire-3d suite passed, plus syntax/whitespace checks.

## 3D continuation 2/5 — 2026-10-16
The scene now renders every captured object and animates all newly sent objects in a batch. Secret exposures use red packets and explicit text, while intended public packets remain orange. Secret-exposure checks for dk/K/traffic, wire-3d, wire-builder, syntax and whitespace checks passed. Inference remains owned by wire-builder.js.

## 3D continuation 3/5 — 2026-10-16
Added 15-degree camera rotation and reset controls that preserve transmissions and reset to each newly selected participant view. Responsive projection still fits drag controls. Fixed repeated redraws appending duplicate accessible labels. Camera/guide tests and wire-3d passed with syntax and whitespace checks.

## 3D continuation 4/5 — 2026-10-16
Added capture inspection with shared object descriptions and a 3D selection ring. Inspection never sends objects, changes evidence, or stores data. Empty/reset and origin/selection checks passed with wire-3d and Teach It Back regressions; syntax and whitespace checks passed.

## 3D continuation 5/5 — 2026-10-16
Added an expandable reference/current comparison of Eve’s knowledge using the same inference function for both inputs. Incomplete transcripts, public-only matches, dk+c compromise and traffic-key-only exposure have distinct, accurate outcomes. The table does not claim complete protocol security. Deduplicated knowledge lists when capture and inference produce the same object; verified the previously repeated ek label is removed.

All thirteen browser suites passed in the final complete run, plus JavaScript syntax and whitespace checks. Earlier default-preview runs had intermittent initialization timeouts; the complete final run used a local threaded preview with a larger connection queue on port 8766. No timeout or assertion was relaxed. Reviewed final desktop/mobile 3D captures, inspection UI and comparison table screenshots outside the repository. All new interface text is English; no dependencies or persisted learner data were added.

## Small 3D polish 1/8 — 2026-10-17
Added a live unsent-selection summary and Clear unsent selections. Clearing never recalls a capture or resets an experiment. wire-polish and wire-builder passed; syntax and whitespace checks passed.

## Small 3D polish 2/8 — 2026-10-17
Added capture totals split into public/secret objects and an explicit empty state. Counts follow transmissions and reset, never queued selections. wire-polish, syntax and whitespace checks passed.

## Small 3D polish 3/8 — 2026-10-17
Added previous/next capture browsing with correct empty and endpoint states. Inspection preserves transmission counts and evidence. wire-polish and wire-learning passed with syntax/whitespace checks.

## Small 3D polish 4/8 — 2026-10-17
The 3D view is keyboard focusable: Left/Right rotate and Home restores the participant camera. Shortcuts are scoped to the view itself, preserving native input/select behavior. wire-polish, syntax and whitespace checks passed.

## Small 3D polish 5/8 — 2026-10-17
Added a packet-animation toggle. System reduced motion takes precedence; the manual page-session choice survives changes back to no-preference. Disabling motion preserves all transmissions and knowledge outcomes. wire-polish and wire-3d passed, including motion resets and WebGL fallback, plus syntax/whitespace checks.

## Small 3D polish 6/8 — 2026-10-17
Added an on-demand symbol/color glossary beside the scene, distinguishing KEM c from AEAD-protected application messages and explaining local secret state. Keyboard open/close and unchanged capture state passed in wire-polish; whitespace checks passed.

## Small 3D polish 7/8 — 2026-10-17
Added textual baseline difference counts and object-by-object explanations. Missing public capture and additional attacker knowledge have different descriptions; color is supplementary. wire-polish and wire-learning passed across safe/incomplete/compromised cases with syntax/whitespace checks.

## Small 3D polish 8/8 — 2026-10-17
Added an evidence-aware handoff to the matching public-transcript or private-key-exposure Teach It Back topic. The link appears only when the current wire supports that topic; opening it preserves captures and optional notes without awarding completion. Existing topic-change behavior resets the other topic’s selected claims.

All fourteen browser suites passed in the final complete run, including wire-polish, wire-3d, wire-learning, original wire/explanation exercises, navigation, progress, crypto demonstrations and fallback cases. JavaScript syntax and whitespace checks passed. Reviewed final desktop and 320px-mobile controls/inspector/comparison/handoff screenshots outside the repository. New interface text remains English; no dependencies or persistent settings were introduced.

## Small refinements 1/8 — 2026-10-18
Fixed the inference narration for mixed exposure: when K is sent along with dk+c, it now describes both paths instead of claiming K was never sent. Both transmission orders and inference-only dk+c passed, with wire-builder regression and source checks.

## Small refinements 2/8 — 2026-10-18
Baseline differences now distinguish direct capture from inference using the actual sent set. Tested dk+c recovery, direct K capture and derived traffic knowledge without changing inference rules. wire-refinements and source checks passed.

## Small refinements 3/8 — 2026-10-18
Private queued selections now have an explicit still-local explanation; public direct-send actions remain separate. Tested selecting K, sending only ek, and clearing the queue without recalling the capture. wire-refinements and source checks passed.

## Small refinements 4/8 — 2026-10-18
Added an accessible capture-position description next to inspection navigation. Tested first/last positions, empty state and reset without retransmission. wire-refinements and source checks passed.

## Small refinements 5/8 — 2026-10-18
The main 3D scene suspends its animation loop outside the viewport and resumes when visible, preserving pause/reduced-motion settings. A measured regression confirmed the previous offscreen frame activity and verified suspension, resumption and manual pause. render-visibility and the six-chapter browser suite passed with source checks.

## Small refinements 6/8 — 2026-10-18
Deep links preserve native and explicit tab order instead of assigning -1 to every target. Disabled controls hand focus to their containing section. Tested scene/button/disabled destinations and the navigation regression; source checks passed.

## Small refinements 7/8 — 2026-10-18
Browser Back to the empty exercise route now returns focus to the exercise picker. Initial page loading does not steal focus; Forward reopens/focuses the exercise. wire-refinements and source checks passed.

## Small refinements 8/8 - 2026-10-18
Chapter URLs now follow lesson selection and restore the effective lesson on reload and history navigation, retaining unrelated query parameters and KEM exercise routes. Queue explanations distinguish unsent selections from knowledge Eve already inferred.

All sixteen browser suites passed against the final product changes. The progress corruption fixture now begins on a query-free route while retaining its original assertions; a complementary explicit-chapter plus corrupt-storage case also passed. JavaScript syntax and whitespace checks passed. Desktop and mobile queue/provenance screenshots were reviewed. Interface text remains English; no dependencies or persisted data were added.

## Wire usability 1/8 - 2026-10-18
Added Eve's separate direct-capture and inferred-knowledge totals. The browser regression first failed for the absent summary, then passed for empty, dk-only, dk+c, mixed direct K, and reset states. No double-counting or inference-rule changes.

## Wire usability 2/8 - 2026-10-18
Added explicit evidence for each additionally inferred object: compromised dk to ek, dk+c to K, and K+public context to traffic key. Directly captured objects are excluded from this list. Verified failing/passing regression, mixed captures, traffic-only boundary, and reset.

## Wire usability 3/8 - 2026-10-18
Transcript entries now offer an accessible Inspect capture button that selects and focuses the existing inspector, updates its 3D highlight, and marks the selected entry. Keyboard and pointer regressions passed without adding transmissions or changing knowledge.

## Wire usability 4/8 - 2026-10-18
Added Latest capture beside sequential inspection controls. Tested empty/single/current-latest disabled states and a five-object batch jump without retransmission. Existing inspection selection remains stable when further captures arrive.

## Wire usability 5/8 - 2026-10-18
Eve's 3D knowledge overlay now identifies whether K is unavailable, inferred from dk+c, or captured directly. Verified transitions, mixed exposure, observer changes and unchanged capture counts with the accumulated browser suite.

## Wire usability 6/8 - 2026-10-18
The 3D public-channel target identifies remaining public objects and confirms when both are sent, instead of continuing to ask for a drop with no public tokens left. Tested both orders, reset, and queued K staying unsent.

## Wire usability 7/8 - 2026-10-18
Manual summary activation now updates the exercise picker synchronously. Pointer and Enter activation passed after reproducing the previous mismatch. Delayed toggle events still cannot overwrite a separate pending menu choice.

## Wire usability 8/8 - 2026-10-18
Manual exercise summaries now use the same opening route as the menu, with aligned picker/focus and reloadable fragments. Closing a summary clears only its own exercise fragment and preserves query parameters. Keyboard, pointer, reload, close/reset and four-width regressions passed. The keyboard test explicitly enters chapter four before focusing its KEM summary, since that summary is hidden in other chapters.

Final verification: all seventeen browser suites passed against the final product changes. One progress-suite run encountered Chromium ERR_INSUFFICIENT_RESOURCES during reload; its fresh-browser rerun passed all original assertions without source/test relaxation. All root JavaScript syntax and whitespace checks passed. Reviewed desktop and 320px mobile scene and evidence screenshots outside the repository. English UI, no new dependencies, no additional persisted state, and unchanged symbolic inference rules. Browser plugin not available; bundled Playwright/Chromium was used.

## Learning continuity 1/8 - 2026-10-19
Continue learning and saved exercise milestones now replace the current URL with the exercise destination while retaining chapter/query parameters. Browser regression reproduced the missing route, then passed for session capture preservation, checklist navigation and fresh-state reload into the selected exercise.

## Learning continuity 2/8 - 2026-10-19
Checklist rendering retains the focused milestone when another tab updates progress. Verified with a real chapter quiz completion in a shared storage context, plus cross-tab clear while focus is outside the checklist. The regression failed for lost focus before the fix; completion labels and storage updates remain intact.

## Learning continuity 3/8 - 2026-10-19
Valid page-anchor navigation now closes the active exercise, clears its path status and focuses the page destination. Reference navigation and browser Back/Forward passed after reproducing the stale panel. Initial page anchors retain browser focus behavior; malformed/unknown destinations remain ignored.

## Learning continuity 4/8 - 2026-10-19
Main-scene manual pause is now separate from the system motion preference. Verified that manual pause survives reduce/on-off changes, while a system-only pause resumes when motion is permitted. The browser regression reproduced the previous unwanted resume before the fix.

## Learning continuity 5/8 - 2026-10-19
The main scene motion control is disabled while system reduced motion is active and has an accessible status explanation. Manual pause and enabled animation states also have clear English descriptions. Verified system-policy transitions and manual control without changing lesson operations.

## Learning continuity 6/8 - 2026-10-19
Home now resets the focused main 3D view, matching the wire scene's keyboard convention. Declared shortcuts and visible/accessibility hints describe the action. Canvas screenshot hashes verified that ArrowRight changes the rendered view and Home restores the original view with motion reduced.

## Learning continuity 7/8 - 2026-10-19
Escape ends a main-scene pointer drag and releases pointer capture while retaining its current orientation. Real pointer events and rendered canvas comparisons reproduced the former continued rotation, then verified cancellation and subsequent Home reset. Keyboard hints include Escape.

## Learning continuity 8/8 - 2026-10-19
Main-scene reset, model/chapter changes, hidden-page lifecycle and WebGL interruption release stale pointer ownership through the shared drag cancellation function. Real pointer tests verified reset and chapter replacement do not inherit dragging, and context loss releases capture before restoration. Removing reset cancellation deliberately reproduced the stale-drag failure; restoring it passed.

The new status hint exposed a canvas/control overlap in the old fixed inset layout. The scene now participates in the visual column's flow with space between the model, controls and variable-length hints. Verified the overlap regression and inspected 320px mobile and 1440px desktop screenshots; four viewport widths passed.

Final verification: all eighteen browser suites passed in the final run, including the new learning-continuity suite and every existing lesson, KEM, wire, progress, navigation and cryptographic demonstration regression. All root JavaScript syntax checks and git diff --check passed. Interface text remains English; no dependencies or persisted settings were added. Browser plugin not available; validation used bundled Playwright/Chromium and screenshots outside the repository.

## Milestone navigation 1/8 - 2026-10-19
Saved chapter and AES milestones now align their page fragment as well as their chapter, closing any open exercise. Reproduced the stale/empty fragment, then verified chapter reload, preserved unrelated query parameters, AES destination and no completion awarded by navigation.

## Milestone navigation 2/8 - 2026-10-19
Scenario checklist entries open their exact scenario through a validated milestone-navigation event. A different scenario starts its normal fresh answer state; reopening the current scenario preserves its pending answer. Verified the previously incorrect Scenario 3 destination and that navigation awards no completion.

## Milestone navigation 3/8 - 2026-10-19
Protocol repair milestones now select the corresponding defect case. Reopening the same case keeps its patch selection; changing cases uses the normal fresh configuration. Browser regression reproduced the old Case 1 default and verified exact destinations with no solved/completion credit from navigation.

## Milestone navigation 4/8 - 2026-10-19
Teach It Back milestones select the matching explanation topic through its existing change behavior. Same-topic pending claims and optional session notes survive reopening; different-topic claims reset normally. Verified no evidence or completion is manufactured by a milestone visit.

## Milestone navigation 5/8 - 2026-10-19
Guided Mission milestone links select the named mission using its existing selection path. Same-mission reflection choices remain; different missions start fresh evidence as documented. Exact mission selection, pending-choice preservation and experiment-first gating passed in the browser.

## Milestone navigation 6/8 - 2026-10-19
Attack milestones configure the matching action and replay freshness policy without preparing/running it or granting evidence. Mode changes use normal packet invalidation; same-mode reopening preserves a ready packet, including policy comparison on one replay packet. Verified all five milestone destinations, packet preservation and unchanged completion.

## Milestone navigation 7/8 - 2026-10-19
Added All/Unfinished/Completed checklist filters with result count and empty state. Filters are session UI only, not new saved metadata. A real cross-tab quiz completion verifies filtered counts and moves focus to the filter when its formerly focused unfinished entry disappears; other existing focus behavior is preserved.

## Milestone navigation 8/8 - 2026-10-19
Added Open next unfinished step using the existing checklist order and completion metadata, independent of its display filter. Real quiz completions advanced through chapters, then a real scenario completion advanced to the matching next scenario. A valid all-completed profile verified the disabled terminal state; clearing progress restores the next-step action. Opening a destination never completes it.

Final verification: all nineteen browser suites passed in the final run, including exact milestone destinations, same-part pending work, evidence gates, real cross-tab filter focus, completion history, existing KEM/3D/cryptographic demonstrations and fallback paths. Root JavaScript syntax and whitespace checks passed. Reviewed 320px mobile and 1440px desktop progress screenshots; 320/390/768/1440 widths passed. All interface text remains English, with no new dependencies or persisted profile fields. Browser plugin not available; bundled Playwright/Chromium was used, with screenshots outside the repository.

## Daily polish 1/8 - 2026-10-20
Continue/checklist navigation avoids rerendering an already selected chapter. Pending quiz choices and AES drafts now survive same-page continuation; reloading still does not restore sensitive drafts. Reproduced the lost pending answer, then verified both flows. Resume copy distinguishes continuation from reload.

## Daily polish 2/8 - 2026-10-20
Exercise deep links reveal the targeted details block and any containing details, in addition to opening the exercise. Reproduced the glossary bookmark leaving its definition list closed. Verified glossary and nested comparison bookmarks reveal content without transmitting objects.

## Daily polish 3/8 - 2026-10-20
Internal exercise routing respects modified clicks and explicit browser link targets/downloads. A real Ctrl-click regression reproduced the missing new tab, then verified a fresh message-journey tab and unchanged source exercise. Ordinary in-page routing remains covered by the regression suites.

## Daily polish 4/8 - 2026-10-20
Keyboard activation of a wire send button hands focus to the capture inspector when the button becomes disabled. Reproduced focus falling to the document body, then verified batch/direct keyboard sends with exactly-once captures. Pointer sends retain their existing viewport behavior.

## Daily polish 5/8 - 2026-10-20
Teach It Back missing/wrong claims expose aria-invalid and a description linked to the matching feedback. Error associations clear on edits, successful checks, topic/reset render and evidence changes. Browser checks verified three wrong claims, missing-only marking, valid completion and removal of stale error references.

## Daily polish 6/8 - 2026-10-20
Wire-scene context interruption disables camera/motion controls and removes unavailable keyboard shortcuts while leaving transmission and knowledge controls usable. Real WebGL loss/restoration verified disabled state across motion-policy changes, unchanged camera offset, continued capture, and restored manual motion preference.

## Daily polish 7/8 - 2026-10-20
Inference narration now describes mixed traffic-key/private-key and traffic-key/shared-secret exposures without reusing the traffic-only boundary. It acknowledges directly captured traffic alongside dk+c recovery and K exposure. Verified mixed captures against Eve's cards and retained the traffic-only no-reversal explanation. Knowledge rules are unchanged.

## Daily polish 8/8 - 2026-10-20
Added a visible-on-focus Skip to lesson link as the first keyboard stop. Verified Tab/Enter transfers focus to the current lesson heading without changing chapters. Reviewed mobile/desktop skip-link, mixed-exposure and explanation-error screenshots, with no horizontal overflow at 320/390/768/1440 widths.

Final verification: all twenty browser suites passed in the final run, including same-chapter continuation, real modified-click new tabs, nested bookmarks, keyboard transmission focus, claim error associations, real wire WebGL loss/restoration, mixed secret captures, existing learning/crypto/3D flows and fallback cases. Root JavaScript syntax and whitespace checks passed. Interface text stays English; no dependencies, new persistent profile fields or symbolic knowledge-rule changes. Browser plugin not available; bundled Playwright/Chromium was used with screenshots outside the repository.

## Daily interactions 1 - 2026-10-21
Separated the quantum algorithm description ID from the Attack Playground description. Reproduced the duplicate-ID failure and incorrect target update, then checked independent Grover/replay descriptions and unique IDs across all six chapters in Chromium. No cryptographic or knowledge rules changed.

## Daily interactions 2 - 2026-10-21
Projected 3D public tokens now use the existing keyboard send-focus handoff. Reproduced focus falling to body on Enter; verified Enter and Space each capture once and focus inspection, while pointer clicks retain their viewport behavior. Drag sends keep their existing path.

## Daily interactions 3 - 2026-10-21
Scene updates and page hiding cancel active drags and release pointer capture before rebuilding. Cancellation suppresses a following pointer click without swallowing an intentional keyboard activation. Reproduced held capture after observer changes and an unintended send after pagehide; verified both interruptions keep the transcript empty. Existing pointer/touch sends, Escape cancellation, camera rotation and WebGL regression checks passed.

## Daily interactions 4 - 2026-10-21
Guided prediction start/next actions focus the new answer group; reveal focuses its explanation instead of leaving focus on a disabled submit button. The group describes its actual question for assistive technology. Verified all three correct checkpoints, final completion and existing wrong-answer/restart/observer regressions in Chromium.

## Daily interactions 5 - 2026-10-21
Main-scene WebGL interruption disables reset/motion controls, removes unavailable shortcuts, blocks rotation input and explains that lessons remain usable. Restoration restores availability and the manual pause preference. Verified real loss/restoration across system-motion changes, chapter controls during loss, plus offscreen suspension/resumption and pause regression checks.

## Daily interactions 6 - 2026-10-21
Previous/next chapter, scenario and repair-case navigation now focuses the new content heading, including when the activated navigation button becomes disabled at an endpoint. Reproduced body focus at the last chapter; verified forward/backward paths for all three flows plus existing scenario/attack/mission and repair regressions.

## Daily interactions 7 - 2026-10-21
Chapter quizzes and Scenario Lab associate missing/wrong-answer feedback with their answer groups and focus the first answer for an empty submission. Groups use the actual question as their accessible label. Errors and stale styles clear on edits, correct answers and navigation. Verified empty/wrong/correct flows and the existing labs regressions. The new error assertions were added during the preceding commit; this commit makes those red assertions pass.

## Daily interactions 8 - 2026-10-21
Modified wire reflection links now respect browser new-tab/target/download behavior before selecting a topic. Reproduced Ctrl-click changing the source topic and clearing a pending claim. Verified a real new tab leaves source claims, topic and wire capture intact, while ordinary clicks still select the matching explanation.

Final verification: all 21 browser suites passed sequentially on the final product code. Root JavaScript syntax and `git diff --check` passed. New checks cover independent quantum/attack descriptions and unique IDs in all six chapters; projected-token keyboard focus; interrupted pointer capture and accidental-send prevention; three prediction question/result handoffs; real main WebGL loss/restoration and pause preservation; sequential lesson/case focus; quiz/scenario error association and cleanup; real Ctrl-click reflection behavior. Existing suites cover KEM knowledge boundaries, real HKDF/AES-GCM, attacks, learning progress/history and 3D fallback/touch behavior. Verified 320/390/768/1440 layouts and visually reviewed wire/scenario screenshots at 320 and 1440 widths, saved outside the repository. Browser plugin not available; bundled Playwright/Chromium used. English interface retained; no dependencies, new storage fields, cryptographic or symbolic knowledge-rule changes.


## 3D wire graphics - 2026-10-21

Reworked Build the Wire with separate endpoint zones, matching A/B/E badges and readable observer-filtered participant labels outside the canvas. Public drag controls sit above the endpoint models. Camera fitting reserves space for controls and keeps all three endpoint zones visible during side-view rotation on narrow screens.

Added consistent symbolic geometry and a text/shape legend: key for ek, capsule for c, vault for dk, diamond for K and card for the traffic key. Solid delivery arrows and a dashed recording branch distinguish the recipient from Eve's public copy. A four-step route, nearby flight status and local Bob pulse explain public delivery followed by local Decaps; final knowledge still updates immediately. Motion-policy changes, manual pause, reset, context interruption and fallback return to a static settled explanation. Previously exposed dk/K and traffic-only exposure retain accurate narration.

Validation: first reproduced the missing participant-label surface in the new browser test. The completed `tests/wire-graphics.cjs` verifies actual rendered geometry, animated capsule delivery and its Eve copy, absence of secret packets during a public exchange, Bob's local secret positions, observer-filtered labels, all four camera presets and 0/75/150-degree offsets at 320/390/768/1440 widths, control bounds, no horizontal overflow, reduced/manual motion cancellation, reset without stale packets, prior-dk and direct-secret exposure, English UI and WebGL fallback. Visually reviewed desktop/mobile scene, route and local-decapsulation screenshots saved outside the repository.

Final regression run: all 22 browser suites passed sequentially on the completed product code, including main lessons, real HKDF/AES-GCM, attack labs, progress/history, keyboard and pointer/touch transmission, WebGL interruption/restoration, knowledge boundaries and existing exercise navigation. Root JavaScript syntax, new test syntax and `git diff --check` passed. Browser plugin not available; bundled Playwright/Chromium used. No dependencies, new persistent data, cryptographic or symbolic knowledge-rule changes.

## Daily wire reliability 1 - 2026-10-22
Capture-route narration now distinguishes public copies, direct traffic/K exposure and compromised dk with or without matching c. Secret-only animation highlights capture instead of implying public ek was published. Reproduced traffic-only capture being described as public copies, then verified provenance, local-decapsulation graphics and exposure regressions. Knowledge rules are unchanged.

## Daily wire reliability 2 - 2026-10-22
Wire resize/exercise-toggle changes cancel active drag capture and settle packet motion. Reopening rebuilds the current experiment without stale packets. Reproduced held capture after a real desktop-to-mobile resize and motion continuing inside a collapsed native details panel; verified no send on release over the new drop position, collapse/reopen state, pointer/touch transmission, rotated bounds and motion/fallback regressions.

## Daily wire reliability 3 - 2026-10-22
Packet-route headings explicitly state Waiting/delivered/local Decaps complete and capture counts, so progress does not rely on border color. Participant cards expose a named semantic group. Reproduced the absent accessible group and verified c-first pending/delivered states, singular/plural capture counts, reset and 320/390/768/1440 layouts with screenshot evidence.

## Daily wire reliability 4 - 2026-10-22
Keyboard capture browsing hands focus to inspection when Previous/Next/Latest becomes disabled; clearing unsent selections focuses the first available checkbox. The existing keyboard send handoff shares the same small helper. Reproduced body focus at the first capture, then verified Enter/Space endpoints, unchanged captures, no accidental queue selection and unchanged pointer behavior, plus prior keyboard/usability regressions.

## Daily wire reliability 5 - 2026-10-22
Message Journey preserves its focused dynamic control across synchronous rerenders and asynchronous crypto; a disabled stage endpoint falls back to the current heading. A pending focus request is used only while focus remains on the document body, so deliberate moves to another control/menu are respected. Reset and epoch invalidation cannot revive an old crypto operation or its focus. Reproduced focus falling to body after authentication. Verified keyboard authentication/encapsulation, real HKDF/AES encryption/verification, tamper/rejection/restore, substituted-key blocking, delayed-crypto focus moves, reset during work and four responsive widths.

Final verification for this daily round: all 24 browser suites passed sequentially on the final product code. Root JavaScript/new-test syntax and `git diff --check` passed. Added regressions cover exposure provenance, secret-only route selection, real resize pointer cancellation, native exercise collapse/reopen, semantic/textual route states, capture/queue keyboard focus and the full keyboard message journey. Existing suites cover KEM knowledge, attack labs, learning progress/history, main lessons, pointer/touch, actual WebGL loss/restoration and fallback. Reviewed 320/1440 screenshots and checked 320/390/768/1440 layouts. Browser plugin not available; bundled Playwright/Chromium used. Interface remains English; no dependencies, persistent data fields or cryptographic/knowledge rules changed. Five coherent fixes were identified for this round; no commits were added solely to reach a count.

## Daily lab accessibility 1 - 2026-10-23
Key-substitution story navigation hands focus to the current narrative when the activated stage button is recreated or the Previous/Next endpoint becomes disabled. Reproduced focus remaining on an unusable final Next control; verified first/last endpoints, keyboard stage rewinding and unchanged explanation gates, plus all existing story identity/ownership regressions.

## Daily lab accessibility 2 - 2026-10-23
Protocol Repair, Two Encapsulations and Key Substitution associate missing/wrong explanation feedback with their native choice groups. Missing answers focus the first option; edits, correct answers, resets and evidence-changing navigation clear stale associations and styles. Repair also marks an extra/nonminimal patch as an invalid task answer. The two radio groups use their actual questions as accessible names. Verified missing/wrong/correct answers, extra controls, cleared state after regenerated pairs/rewinding, existing evidence gates and all three lab regression suites. Checked 320/390/768/1440 layouts and reviewed mobile error feedback. No scoring, cryptographic or knowledge rules changed.

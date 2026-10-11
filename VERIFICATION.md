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

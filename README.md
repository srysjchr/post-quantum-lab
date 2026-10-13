# Post / Quantum — A Visual Field Guide

A detailed, all-English HTML/CSS/Three.js learning experience. No framework or build step is required.

## Online

[Open the live website](https://srysjchr.github.io/post-quantum-lab/)

Hosted on GitHub Pages over HTTPS. Updates pushed to main are published automatically. The GitHub repository is public.

## Open

Open index.html directly in Chrome, Edge, or Firefox. All libraries are bundled, so the lessons work offline. Keep index.html, styles.css, lessons.js, scene.js, journey.js, labs.js, app.js, and vendor together.

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

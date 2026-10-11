# Post / Quantum — A Visual Field Guide

A detailed, all-English HTML/CSS/Three.js learning experience. No framework or build step is required.

## Online

[Open the live website](https://srysjchr.github.io/post-quantum-lab/)

Hosted on GitHub Pages over HTTPS. Updates pushed to main are published automatically. The GitHub repository is public.

## Open

Open index.html directly in Chrome, Edge, or Firefox. All libraries are bundled, so the lessons work offline. Keep index.html, styles.css, lessons.js, scene.js, app.js, and vendor together.

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

The Three.js scenes, noise slider, RSA examples, and ML-KEM states are educational models. They do not run ML-KEM or quantify attack effort. The AES demo alone performs real cryptography via Web Crypto: a fresh non-extractable AES-256 key, random 96-bit nonce, and 128-bit authentication tag for each encryption. It verifies an exact UTF-8 round trip and can check rejection after changing one ciphertext byte. No data or key is sent to a server or saved by the application.

The AES demo is not an authenticated post-quantum channel. A real deployment needs reviewed libraries, a supported protocol, correct peer authentication, key derivation, nonce management, and operational security. WebGL failure does not prevent reading lessons or using the learning controls. Web Crypto availability depends on browser/context support; localhost is supported by modern browsers.

## Sources and dependencies

Primary sources are linked in the Reference section: NIST FIPS 203, FIPS 204, PQC FAQ, NCCoE migration guidance, and Shor's original paper.

Three.js 0.160.1 is bundled as a classic browser script to support direct file opening. MIT license: vendor/THREE-LICENSE.txt. No external fonts or runtime network dependencies are required.

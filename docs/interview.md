# Password Analyzer: interview notes

## Thirty-second explanation

“I built a browser-side password assessment app. zxcvbn estimates guessability locally, Web Crypto hashes the password in the browser, and only the first five SHA-1 characters go to Have I Been Pwned's range API. The browser compares returned suffixes; Flask only serves the files and has no endpoint that receives plaintext. I explicitly distinguish found, not found in the corpus, and unavailable rather than treating an outage as a clean result.”

## Demonstration and architecture

1. Start `python app.py` and open localhost. The local zxcvbn bundle loads without a third-party script tag. Use a made-up test phrase, not a current personal password.
2. Nothing is sent while typing. Clicking Analyze runs zxcvbn locally and generates a SHA-1 lookup digest with Web Crypto. The input clears after analysis.
3. The browser requests `/range/{first five hex characters}` from HIBP with `Add-Padding: true`, checks the returned 35-character suffix against the digest, and discards all unrelated rows.
4. Show that the Flask app has only `GET /`; `POST /analyze` is 404. Open `static/password-check.js` and the mocked tests to prove the request includes no plaintext or full hash.
5. Explain the limits: a match count is corpus appearances; no match is not proof of safety; an unavailable network result is unknown. The crack-time display is scenario-dependent.

## Difficult questions

- **Why SHA-1?** HIBP's range API protocol uses a SHA-1 lookup hash. We are not storing credentials; using SHA-1 for a stored password would be inappropriate.
- **Does k-anonymity make the query perfectly private?** No. HIBP sees a hash prefix and network metadata. It does not receive the plaintext or full hash; other privacy risks remain.
- **Why browser-only?** The old Flask design received plaintext on each strength request. Moving zxcvbn and hashing into the browser removes that server-side exposure entirely.
- **Why bundle zxcvbn rather than use a CDN?** A remote script would execute in the same page as the password field. A local pinned asset reduces that dependency at runtime, though build integrity still needs review.
- **Why not check every keystroke?** A sequence of hash-prefix lookups can reveal information about the password being typed. One explicit lookup after input is complete avoids that behavior.
- **How do you know the API is clean?** You do not. The UI says only “not found in this corpus” after a valid 200 range response; malformed responses, errors, and timeouts are “unavailable.”
- **What does the count mean?** Appearances of the password hash in the Pwned Passwords corpus, not distinct websites or breach incidents.
- **What would you improve?** Reproducible pinned asset builds with checksums, real-browser UI tests, and optional offline screening. There is still no account system or deployment claim.

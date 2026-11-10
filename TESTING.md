# Verification

Run `npm test` with Node.js 22 or newer. Tests exercise blank output, phrase catalog coverage, single/multiple selection, mutually exclusive accompanying-person choices, foster formatting, literal free text, synthetic demo validity, static-resource delivery, content security policy, and denial of nonallowlisted paths.

These automated tests verify deterministic application behavior, not clinical correctness, accessibility conformance, or production suitability.

## Manual browser acceptance

- Load the local URL: there should be no preset findings and no console errors.
- Load the synthetic example: history, examination, diagnosis and next visit should appear.
- Toggle a phrase, enter notes, then make a final preview edit. Copy should use the edited preview.
- If clipboard permission is denied, copy should select the preview and display keyboard instructions.
- Clear: all selections, free text and preview should be blank. Reload: no draft should return.
- Use keyboard navigation and a narrow viewport; controls and preview should remain reachable.
- Check the network panel: only local static assets should load; entering or copying notes should cause no network requests.

## Browser smoke result

On 2026-11-09, all nine Node tests and `scripts/browser-smoke.cjs` passed. The smoke check used headless Microsoft Edge with Playwright installed outside this repository. It verified blank start, synthetic example, history phrase toggles, treatment details and deselection, free-text output, cancellation of preview overwrite, actual clipboard text including final preview edits, canceled and accepted clear, reload clearing, no horizontal overflow at 390px, no page errors, and only loopback network requests. The synthetic-only `screenshot.png` was refreshed at 1440 × 1050.

To rerun, provide Playwright in your tooling environment (it is optional and not a runtime dependency). Set `PLAYWRIGHT_MODULE` to its module path if not otherwise resolvable and optionally `BROWSER_EXECUTABLE` to a Chromium browser, then run `node scripts/browser-smoke.cjs`. The script starts and stops its own ephemeral loopback server. A default Playwright Chromium installation can be used without `BROWSER_EXECUTABLE`.

This was a smoke check, not a full keyboard, screen reader, or cross-browser audit. Clipboard-denied fallback is present but was not exercised in that automated run.

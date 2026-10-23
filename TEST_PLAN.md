# nanoville test plan

nanoville becomes a Chorus frontend. Backend behavior is verified in Chorus; retain real component and browser regression coverage here.

- Setup retains scenario, persona, location, model, length and judge selections.
- Catalog and model choices come from Chorus; artwork remains local.
- Creating a session sends configuration once; subsequent requests use its ID and authoritative revision.
- Display committed discussion, skipped notices, unchanged canvas, token/latency metadata, judge checkpoints and final judgement.
- Pause/Resume/Stop and Back call backend commands; no browser speaker rotation, generation retry, judge timing or canvas mutation remains.
- Journals appear only in observer panels and never leak into public requests/events.
- Reload/reconnect restores the selected durable session without creating another run; stale responses cannot overwrite a newer session.
- Backend unavailability, malformed responses, context overflow and revision conflicts produce readable recovery states.
- Same-origin API proxy forwards cancellation, SSE and errors without model logic.

Run lint, typecheck, component/unit tests, production build and Playwright smoke tests (`npm run check`). Browser tests start fake Ollama, a real Chorus service with an isolated temporary SQLite database, and this application on test-only ports. Cover completion, checkpoint/final review, pause/resume, early stop, Back cancellation, invalid canvas recovery, skipped speech, restart/reconnect and journal isolation. Tests must not depend on installed Ollama models.

## Latest local verification — 22 October 2026

npm run check passed: lint, TypeScript, 6 component/client tests, production build, and 8 browser integration tests against real Chorus with fake Ollama.


## Live built-in browser verification — 22 October 2026

Started the production application on http://localhost:43188 with real Chorus and Ollama, after testing chorus-web.

- Launch an AI reply helper, qwen3.5:2b-mlx, five turns, judge disabled: session `08e7992c-2433-4cc2-a827-0ceabfd2233b`. Verified pause/reload/resume, five-turn completion, token/latency display, and a nonempty saved Riley Chen inner-voice entry in its separate observer panel. The public conversation remained separate. No canvas edit was accepted, leaving an empty final document; this does not pass document-quality acceptance.
- Learn from a service outage, gemma4:e2b-mlx, five turns, judge enabled: session `2940064a-68f8-471d-ae5b-2408e6cc444f`. Saved five contributions and a shared incident-review canvas. Final review failed validation and showed a recoverable paused state. Reload restored the same five-turn session, canvas, and paused review. Judge completion did not pass real-model acceptance.

The full automated check passed again: six component/client tests and eight browser tests, plus lint, types, and production build. Automated browser tests use fake Ollama and do not cover model reliability.

Screenshots are saved under `output/browser-tests/`, including `reply-helper-result.jpg`, `outage-review-paused.jpg`, and `outage-document-status.jpg`.

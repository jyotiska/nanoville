## Project

nanoville is one local-first Next.js 16.4 application using the App Router, React 19, strict TypeScript, and a local Ollama model. Sessions belong to Chorus and persist in SQLite. The browser remembers a session ID and renders committed backend state.

## Development

Use Node 24 (`.nvmrc`) and npm. Install locked dependencies with `npm ci`. Install the smoke-test browser once with `npx playwright install chromium`.

- `npm run dev`: development server.
- `npm test`: deterministic unit, service, API, and real React component tests; no Ollama required.
- `npm run test:watch`: watch those tests.
- `npm run lint`: lint, including import boundary checks.
- `npm run typecheck`: generate Next.js route types and check TypeScript.
- `npm run build`: production build.
- `npm run test:e2e`: browser smoke tests against the last production build and a fake Ollama server.
- `npm run check`: lint, types, tests, production build, and browser smoke tests in order.

Use targeted tests during development and `npm run check` before handing off a change. Browser tests reserve localhost ports 3100 and 11435 and must not run alongside another smoke run. Keep verification local; CI has not been requested. Report any checks that cannot run and why.

## Architecture and ownership

Chorus is the Python execution backend on port 43187. nanoville runs on 43188 and owns rendering and user controls. All model execution, validation, prompts, scheduling, cancellation, and persistence belong to Chorus. Sessions survive reloads and backend restarts; interrupted sessions recover as paused.

- `src/components/studio/`: setup, scene, profiles, and panels.
- `src/features/discussion/client/use-discussion.ts`: backend commands, committed events, session restoration, and separate observer journals.
- `src/features/discussion/session.ts`: presentation types/selectors only; never choose or schedule a speaker/review.
- `src/api/chorus/`: generated schemas/types and shared client from `../chorus/sdk/`. Regenerate from Chorus with `scripts/export_contracts.py`; never edit generated copies directly.
- `src/app/api/chorus/[...path]/route.ts`: transport proxy only, configured through server-side `CHORUS_API_URL`.
- `src/data/`: frontend artwork and location presentation. Semantic scenarios/personas/models are served by Chorus.
- `tests/`: component/client tests and browser journeys against real Chorus and fake Ollama. Backend regression source references live in Chorus's `tests/reference/nanoville/` and executable regressions in its Python tests.

Never call Ollama from the application. Do not duplicate backend policies or apply canvas edits in the browser. Journals remain outside public context. Browser tests reserve ports 3100, 43190, and 11435. See TEST_PLAN.md.

## Behavioral invariants

- Commit a valid spoken contribution, the accepted or preserved canvas, and journal together. An unchanged valid canvas is a normal no-edit turn. After bounded canvas validation retries fail, preserve the previous canvas (even if empty) and continue with a useful spoken contribution that does not claim an edit. No-edit turns count toward rotation, turn limits, and judge checkpoints; show their unchanged status without a blocking error. Keep rejected drafts out of retry context. Transport failures pause and preserve prior work; Resume retries pending work.
- Canvas generation returns one strict JSON operation: create only while empty, unchanged, replace one section's direct body while preserving descendants, or append one child section. Paths include every ancestor heading. Evidence is outside the editable region; the browser receives only the complete validated canvas, never edit drafts.
- After three invalid spoken replies, discard the pending canvas edit and skip the slot without pausing. Preserve prior canvas and journals; do not generate a journal or invent speech for a skipped slot. Record an explicit system notice with empty text, advance rotation, and count the slot toward the turn limit and checkpoint timing. Participants and the judge receive skipped slots as system notices; the judge must distinguish skipped slots from actual contributions. Cancellation still discards pending work, including late skip responses.
- A journal failure yields an unavailable entry and preserves valid public output. Cancelling the overall operation discards the pending turn.
- Treat the scenario as the only verified factual source. The server preserves its evidence section verbatim in revised canvases; models generate the proposed plan and open decisions. Generated measurements, dates, and capabilities remain proposals or unknowns. Judge strengths and positive requirement assessments quote the current canvas; validate those excerpts and complete sentences before publication. Keep unpublished judge drafts out of retry context.
- Private journals are observer-only. Never send them to participants or the judge, or use them to update persona stats.
- Judge checkpoints occur after every five participant slots, including skipped slots, except at the turn limit, which triggers only a final review. Judge messages do not consume turns or change participant rotation.
- Stop cancels pending work and, when enabled, reviews only committed work. Pause and Back cancel pending turns or reviews immediately. Late responses cannot commit.
- The final deliverable is the same shared Markdown canvas; there is no extra summary request.
- Retain full public history. Context-budget overflow pauses safely; never silently truncate or summarize history.

## Change workflow

Before editing, inspect the relevant implementation, tests, and docs. State assumptions that affect behavior; ask when materially different interpretations remain. Make the smallest complete change. Do not reformat unrelated files or introduce abstractions without a concrete need.

Read the relevant installed Next.js guide in `node_modules/next/dist/docs/` before changing framework code. Follow installed documentation over remembered APIs. Do not edit `node_modules/`, `.next/`, generated types, or other generated files to implement behavior.

Keep requests and responses aligned through shared schemas. Test invalid external data and the behavioral invariant affected by a change. Preserve existing regression cases when moving modules; test public behavior instead of component internals. Use real React rendering, not custom implementations of hooks.

Prompt changes belong in Chorus and require its regression tests and prompt-version update. Preserve separation of public context and private journals. Model logs contain metadata and rejection categories, never prompt or journal contents.

Use strict types, `@/` imports, double quotes, semicolons, and CSS Modules for feature styles. Preserve nearby conventions in existing UI primitives. Keep model addresses in the Chorus environment. Use `CHORUS_API_URL` in `.env.local`, with a safe `.env.example`.

Update `README.md` when behavior or setup changes and update this map when ownership or verification commands change.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

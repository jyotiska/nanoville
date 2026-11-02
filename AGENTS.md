# Nanoville

Nanoville is a local Next.js/React application for Chorus's independent-agent harness. Chorus owns model execution, prompts, tools, validation, scheduling, persistence, cancellation, and authoritative accounting. The browser renders committed backend state and sends user controls.

## Development

Use Node 24 and npm. `npm run check` runs lint, generated route/type checks, unit/component/client tests, production build, and Playwright browser tests. Install Chromium once with `npx playwright install chromium`. Use targeted tests during development and the full check before delivery. Browser suites reserve 3100/43190/11435; run sequentially with chorus-web. Tests use real Chorus, fake providers, and isolated SQLite databases. Report unavailable checks.

Read relevant installed Next.js guides in `node_modules/next/dist/docs/` before framework changes. Keep strict TypeScript, double quotes, semicolons, and CSS Modules. No frontend model execution, speaker selection, canvas patching, simulated agent stats, or authoritative usage calculation.

## Ownership

- `src/app/page.tsx` opens the shared harness workspace in Nanoville mode.
- `src/api/chorus/harness-workspace.tsx`, its CSS, client, contracts, and usage files are generated from `../chorus/sdk/`. Modify the canonical source and run `scripts/export_contracts.py`; never hand-edit copies.
- `src/app/api/chorus/[...path]/route.ts` is a thin same-origin v2/legacy-read proxy, configured only with server-side `CHORUS_API_URL`.
- The new scene supports 2–50 personas using packaged custom animated sprites, pan/zoom, search, keyboard selection, and reduced motion. Artwork/manifest belong to Chorus; animation reflects committed worker state and canvas-lock ownership.
- Existing studio components and v1 schemas remain for historical decoding/regression compatibility. `/archive` is read-only in production. Explicit test switches exercise old behavior without making it the default product.

## Behavioral invariants

Luna is the default. Each problem auto-selects its five relevant agents; the observer may edit the roster before starting. Rerenders/catalog refreshes cannot overwrite edits. A problem switch initializes its own roster. Turn caps are per agent; show current turn, cap, and completed cycles.

The board stays flat. Each post is one or two sentences, <=60 words/400 characters; reactions use selected @FirstName mentions and share the three-post-per-turn allowance. Energy/confidence and floating stat effects are absent from new sessions.

Only Chorus grants canvas lockfile leases and commits validated edits/changelog entries. Published posts and edits survive later cycle failure. Pause, Stop, and restart invalidate late publication while preserving committed work and budgets. Reload/reconnection must not duplicate records, roll back revisions, or replay old transient activity.

New structured reasoning summaries are visible to their author, observer, and final judge, but not peers. Historical journals retain observer-only isolation. Provider-private reasoning is excluded. Hidden adversary assignment metadata must never enter judge/peer prompts. Never log content or credentials.

The judge runs only at the end against a frozen result with read-only tools. Correctness is deterministic; qualitative conversation/agent grades require source references. Usage aggregates come from the unique backend call ledger and distinguish unknown, zero, reported, and estimated values. Retain complete history; context overflow pauses rather than truncating silently.

Update README.md, TEST_PLAN.md, and ownership guidance when behavior or verification changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

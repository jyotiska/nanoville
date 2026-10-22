# Nanoville

Nanoville depends on [Chorus](https://github.com/jyotiska/chorus), the independent research framework that runs its agent simulations, model calls, shared-document edits, judge reviews, and persistent sessions. Nanoville uses Chorus’s APIs to set up and control discussions and display conversations, documents, and observer journals.

Nanoville is a small scenario studio where business and technology personas work through shared challenges in a pixel-art scene.

## Getting Started

Use Node 24 (see `.nvmrc`) and npm. Install the locked dependencies and start development:

```bash
npm ci
npm run dev
```

Start Chorus in the sibling `chorus/` directory (`.venv/bin/chorus serve`). Copy `.env.example` to `.env.local` to configure `CHORUS_API_URL`. Open [http://localhost:43188](http://localhost:43188) with your browser to see the result.

The page composition lives in `src/components/scenario-studio.tsx`; its sections live in `src/components/studio/`. The page updates automatically during development.

## Discussions

Choose a challenge, 2–5 agents, a location, a local model, and a turn limit of 5, 10, 20, 50, 75, or 100 on the setup screen. Entering the scene starts the discussion automatically. Each turn is one participant’s scheduled slot, including any slot skipped after repeated invalid replies.

The conversation appears on the right with the latest reply first, fills the scene column’s height, and scrolls within the panel. All agents read and revise one shared Markdown document beneath the scene. Each turn advances the requested deliverable with a useful discussion contribution and, when needed, a canvas revision. If there is no substantive edit, the existing canvas is preserved and the discussion continues. Agents build on existing work, address missing requirements, and clearly label proposals and unresolved decisions. The canvas renders the full document and is read-only for the user. Click an agent or their name badge to see their profile; dismiss it with the close button, Escape, or by clicking outside.

The server requests one compact JSON canvas operation, then the spoken contribution, without relying on model tool-call support. A participant can create the initial document while the canvas is empty, return `{"op":"UNCHANGED"}`, replace one existing section's direct body, or append one child section. Creation remains available on later turns if earlier attempts failed or were skipped. Heading paths include every ancestor, including the document title; repeated names under different parents are valid. Missing or ambiguous targets and duplicate sibling headings are rejected. Replacement preserves its heading, child sections, and siblings. Append inserts after the parent's existing descendants; an empty parent path appends a level-one section at the document root. Bodies cannot introduce headings, raw HTML, or unclosed code fences. Chorus uses a Python Markdown parser and splices source to preserve untouched Markdown; parity tests cover the original Nanoville section-edit cases. The browser receives the complete validated canvas and never applies patches.

The server preserves the supplied scenario evidence verbatim outside the editable document; models cannot target or recreate its section. It validates the reconstructed complete canvas for empty, heading-only, oversized, or repeated content and unsupported factual confirmations. Changed canvases remain bounded to 800 words and 6,000 characters; initial plans target 350–500 words and typical section edits target about 200 output tokens. Near the size limit, participants should shorten an existing section or leave it unchanged. Cosmetic replacements are normal no-edit turns and preserve the exact original document. These grounding checks reduce unsupported assertions but do not prove every statement true. New dates, rules, owners, measures, and product capabilities must remain proposals or open decisions; unavailable incident times and measurements remain unknown. Missing information becomes a proposed real-world validation task with an owner, completion check, and fallback.

Each public generation stage allows up to three attempts. Rejected edit drafts never enter retry context; fresh operations address the original committed canvas. If all edits fail, the previous canvas is preserved, including an empty canvas, and useful speech continues without claiming an edit. Speech sees the accepted operation description, actual changed-line excerpts, full public history, and complete current canvas. Spoken explanations contain at most four complete sentences, 120 words, and 1,800 characters and are checked for repeated content and unsupported confirmations. The feed marks no-edit turns “Canvas unchanged this turn”; they count toward rotation, the turn limit, and judge checkpoints. Valid speech, the accepted or preserved canvas, and the journal commit together.

If all three spoken replies are empty, oversized, repeated, cut off, or contain tool calls, the slot is skipped automatically. Its pending canvas edit is discarded, the previously saved canvas and journals remain intact, and no journal is generated for that slot. The feed shows a system notice rather than invented participant speech. The next participant continues without Resume. Skipped slots count toward rotation, the turn limit, and judge checkpoints so a failing model cannot create an endless discussion. Participants and the judge receive skipped slots as system notices; the judge sees separate completed and skipped counts and must not credit skipped work. Model service failures still pause and preserve completed work; Resume retries the pending turn.

Every completed participant turn also records a private inner voice entry about their feelings, the task, or their peers. Entries aim for 1–2 complete sentences and 20–40 words. The full text wraps naturally without a character cutoff or line clamp, and the journal scrolls when needed. Click 💭 in an agent’s profile to open a third column with their journal, newest first. Entries are generated even while the column is closed. On narrow screens, the journal appears below the discussion. The journal is visible to the human observer only: entries are never sent to any participant or the judge, included in the canvas, or used to update agent stats. Each entry uses a separate, tool-free model call after the public contribution and canvas are finalized, adding some turn latency. The discussion shows each participant turn and judge checkpoint’s input tokens, output tokens, and total server-side generation latency in seconds; participant latency includes canvas work, speech, and inner voice generation. If generation is cut short, it retries once with a request for one complete sentence; if it still cannot finish or the call fails, the public work is preserved and the entry is marked unavailable. Journals remain available after Pause, Stop, completion, and reload, persisted in Chorus. They are fetched separately from the public session snapshot.

Pause cancels the pending reply; Resume retries that turn. Stop ends the session and preserves its conversation and canvas. Every agent knows the turn limit and works toward the scenario’s requested deliverable in the shared Markdown document. At the chosen turn limit, that same document becomes the final deliverable, with no separate summary or facilitator request. Returning to setup explicitly pauses pending backend work; entering another discussion creates a fresh session. Closing the browser does not stop backend execution.

The optional Judge dropdown defaults to No. When enabled, a judge observes the scene and uses the same selected local model to review the entire conversation and current canvas after every five participant slots, including skipped slots. Checkpoint feedback appears in the Discussion feed and is included in subsequent agents’ context. Reviews finish before the next agent speaks and do not consume turns or change the speaking order. The judge can read the canvas but cannot edit it. Reviews must contain complete short sentences. When no plan exists, the strengths field explicitly states that no written deliverable exists instead of inventing a citation. Strengths and positive requirement ratings must cite the team’s proposed plan in the current canvas using square brackets; the supplied Scenario evidence section does not count as team output; nonexistent quotes, letter fragments, and cut-off generations are retried before publication. Decoder character caps are omitted to avoid cutting a string mid-word; runtime length limits still apply. Unpublished review drafts are excluded from retry context. Concerns that remain unchanged after reviewing the current evidence are labelled explicitly; the judge is not forced to invent different concerns. Final generation uses keyed requirement assessments to prevent missing or duplicate criteria, then preserves the existing public response format. If both attempts fail, the review pauses and preserves completed work.

At the turn limit, the judge produces only a final judgement in a dedicated panel, covering requirements, strengths, improvements, response to earlier feedback, and remaining priorities. Stop also triggers a final review of the work completed so far, labelled as an early-stop review. Pause and Back to setup cancel pending reviews; Resume retries a paused review without repeating an agent contribution. The judge sprite and its generation prompt are saved in `public/agents/judge.webp` and `public/agents/judge-prompt.txt`.

## Development and verification

Install Chromium once for browser checks:

```bash
npx playwright install chromium
```

Run `npm run check` before handing off changes. It runs lint, type checking, unit and component tests, a production build, and browser smoke tests. Ollama is not required: tests use model fixtures, and browser tests start a fake model server on port 11435, a real Chorus service on 43190 with an isolated temporary SQLite store, and the production app on 3100. Keep those ports free. Verification is local; no CI service is configured.

For faster feedback, use `npm test`, `npm run test:watch`, `npm run lint`, or `npm run typecheck`. To run browser checks separately, run `npm run build` followed by `npm run test:e2e`.

Backend regressions have moved to the Chorus Python suite; original TypeScript tests are retained there as porting references. This project tests runtime contract validation, real React rendering, and browser integration against Chorus. Browser tests cover completion, judge reviews, pause/resume, early stop, journal isolation, invalid canvas recovery, skipped speech, and returning to setup.

## Architecture

Chorus owns all execution, prompts, validation, model connections, authoritative session transitions, judging, and persistence. Nanoville owns presentation and controls.

- `src/components/studio/` renders setup, scene, profiles, and observer/document/discussion panels.
- `src/features/discussion/client/use-discussion.ts` sends commands, subscribes to committed session events, restores sessions, and fetches observer journals.
- `src/features/discussion/session.ts` contains display-only selectors; it never schedules work.
- `src/api/chorus/` contains generated contracts and the shared runtime-validating client, sourced from Chorus.
- `src/app/api/chorus/[...path]/route.ts` is a thin same-origin transport proxy configured by `CHORUS_API_URL`.
- `src/data/` retains artwork mappings, locations, and judge presentation metadata; semantic catalogs come from Chorus.

The selected backend session ID is remembered locally. Reload restores the same durable session. A `?session=SESSION_ID` URL opens an existing Chorus session, including one created by the CLI or another app. Reconnection resumes ordered session events without starting another run. A backend restart preserves work and recovers interrupted execution as paused.

## Model execution limits

Each model call has a three-minute deadline, with a ten-minute deadline for an entire turn or review. Each private journal attempt has a separate 30-second deadline; if it stalls, the validated public contribution is preserved and its journal is unavailable. Chorus owns execution deadlines; the browser reconnects its event subscription when transport is interrupted. Existing generation retry limits remain unchanged. Spoken output flagged as cut off is retried rather than published.

The adapter requests a 32,768-token context window and reserves space for generated output. It conservatively estimates input from UTF-8 content bytes, including message framing and tool definitions, without counting JSON escaping or output-decoding schemas as prompt text. Schemas explicitly written into a message still count as input. Speech includes the full current canvas once plus a bounded, explicitly labelled excerpt of actual changed lines to ground edit claims, and canvas-operation and judge schemas are passed through the structured-output parameter. Canvas creation and edits retain a 2,400-token output ceiling; the roughly 200-token edit target is not a hard cap. Final reviews reserve 3,000 tokens. Turns preflight existing input before generation and reject revised canvases that leave too little speech context space. This can reject inputs that a tokenizer might fit. When the full public history exceeds the budget, the session pauses with completed work intact; history is never silently removed or summarized. A context overflow requires starting a shorter discussion; Resume is disabled for that error while saved work remains readable. A completed canvas is shown as the final document even if its judge review is blocked.

Decoding schemas omit document/body string-length caps because the local structured-output runner suppresses escaped Markdown newlines when those caps are present. Runtime schemas and reconstructed-canvas limits remain enforced.

Execution limits live in Chorus under `chorus/llm/transport.py` and `chorus/services/generation.py`. Structured server logs identify a run, model, prompt version, phase, attempt, request duration, estimated and actual input tokens, output-token allowance and actual output tokens, Ollama load/prompt-evaluation/generation durations, token rates, and outcome. Rejected generations record fixed validation reasons. Turn metadata distinguishes generated and committed operation types, voluntary unchanged turns, cosmetic no-ops, retry-exhaustion fallbacks, and skipped speech. Prompt and journal contents are excluded from these logs.

## Local model discussions

The Chorus backend uses Ollama on your computer. Start Ollama and install at least one of the models listed in the model menu. The app defaults to `qwen3.5:4b-mlx` for more reliable canvas contributions and instruction following; it uses more memory than the smaller models, which remain available in the menu. You can choose another installed model before starting a discussion.

Configure `OLLAMA_HOST` in the Chorus environment if Ollama runs elsewhere. Configure only `CHORUS_API_URL` in Nanoville’s `.env.local`. The backend model catalog is shared with chorus-web and the CLI. Canvas edits use structured JSON model responses, so native tool-call support is not required.


## Canvas edit benchmark

A local 20-slot comparison on 2026-10-20 used the AI feature launch scenario, Software engineer and Product manager personas, `qwen3.5:4b-mlx`, and no judge. The fresh full-rewrite baseline took 407.4 seconds; targeted edits took 201.7 seconds, a 50.5% reduction. Canvas generation fell from 309.3 to 105.3 seconds. Canvas validation rejections fell from one to zero, and both runs skipped three slots. The targeted run committed one creation, eight replacements, and eight unchanged contributions; three slots were skipped. Committed replacements averaged 297.1 output tokens, above the roughly 200-token target. These are single-run observations, and both final documents retain unresolved product and validation decisions.

Actual per-phase tokens, durations, retries, operation counts, final public canvases, model metadata, and comparison limitations are recorded in [`benchmarks/targeted-canvas-2026-10-20.json`](benchmarks/targeted-canvas-2026-10-20.json). Model events contain metadata and fixed rejection reasons; private journals and rejected edit contents are excluded.

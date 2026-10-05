# Phonaria feature map

This map describes how to reach features, not a claim that all features pass. Only the common-word transcription journey below has an executable verification recipe. Other entries are navigation references awaiting dedicated journeys.

| Feature | Entry point | Coverage here |
| --- | --- | --- |
| Common-word transcription | `/`, header **Transcription** | Executable journey below |
| Other pronunciation variants | Transcribe a word, **Show other pronunciations of hello** | Not exercised |
| Word definitions | Transcribe, **Definition of hello** | Not exercised; requires Worker/Wiktionary |
| Spelling suggestions and server lookup | `/`, words outside the bundled lists | Not exercised; server lookup needs Turso |
| Consonant chart | `/ipa-chart/consonants`, header **IPA Chart** | Not exercised |
| Vowel chart | `/ipa-chart/vowels`, **Show diphthongs** | Not exercised |
| Practice | `/practice`, header **Practice** | Not exercised; controlled by `FLAG_PRACTICE` |
| Credits and theme | `/credits`, footer **Credits** / **Toggle theme** | Not exercised |

## Adding a journey

The CLI lists registered journeys with `bun run verify list`; `init <feature> [origin]` requires an explicit registered name. The shared session helper handles browser operations, evidence, cleanup, and reporting for the feature recorded in each run.

To support another feature, create `scripts/<feature>.ts`, import `observation` and the `Feature` type from [feature.ts](../scripts/feature.ts), and export a definition satisfying `Feature`. Supply a display title, named checkpoints pairing `observation(read, expected)`, and honest coverage limits. Expected values are checked against the function's return type. Browser functions must be synchronous, return JSON-compatible state, and keep their dependencies inside their body because they execute in the page after serialization.

Register the definition under its CLI name in [features.ts](../scripts/features.ts) and add its entry route, prerequisites, actions, checkpoint meanings, and viewport to this map. Every registered checkpoint is required to pass that journey; make separate journeys when only a subset is relevant. Run `bun run verify:types`, the helper checks, and the actual browser journey. Navigation references above remain unverified until a dedicated journey is exercised.

## Common-word transcription

Target accent: American English (`en-us`). UI expectations below use the current English labels. Local default: `http://127.0.0.1:3000`; no database or spelling-service credentials are needed. `hello` is in curated-10k, and `world` is in curated-1k. Phoneme details load media from `assets.rigos.dev` by default.

Expected primary IPA is **hello: `hə·ˈloʊ`**, **world: `ˈwɝld`**. These literal expectations are independently grounded in the curated pronunciations (`H AX0 L OU1`, `W ER1 L D`) and core IPA map. The rendered syllable separator is `·`; copied IPA uses `.`. Hidden hello alternatives must not be included in the primary IPA comparison.

The maintained [TypeScript checkpoints](../scripts/transcription.ts) pair typed, read-only DOM functions with literal expected values. They read the input, URL, labels, enabled state, visibility, focus, and active `data-ipa-token` text. Each function is serialized and executed in the browser, so it must keep its dependencies inside its body. They do not read application stores or call transcription implementation helpers. Generated run data and reports remain JSON.

### Controls

| User control | CLI locator |
| --- | --- |
| Input | `find label "Text to transcribe"` |
| Submit | `find role button ... --name "Transcribe text" --exact` |
| Clear | `find role button ... --name "Clear text" --exact` |
| Copy | Accessible name **Copy IPA transcription** |
| Word labels | **Definition of hello**, **Definition of world** |
| Sound details | **Details for /h/** |
| Empty-state example | Button **Hello world** |

Enter submits when the input is focused. Escape clears a nonempty focused input. Escape while a popup is focused can close the popup instead; explicitly focus the input for the clear check.

### Executable journey

Start with `bun run verify init transcription` and save its returned path as `VERIFY_RUN`. Run `bun run verify serve "$VERIFY_RUN"` in a separate persistent process, retaining its handle, and wait for the ready message. This journey uses a 1280 × 720 desktop viewport. Every command below is run from the repo root. The `browser` helper forwards the remaining arguments to agent-browser in the owned session.

```bash
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 720
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" empty

bun run verify browser "$VERIFY_RUN" find label "Text to transcribe" fill "hello world"
bun run verify browser "$VERIFY_RUN" find role button click --name "Transcribe text" --exact
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" submitted

bun run verify browser "$VERIFY_RUN" find role button click --name "Details for /h/" --exact
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" details

bun run verify browser "$VERIFY_RUN" reload
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" restored

bun run verify browser "$VERIFY_RUN" find role button click --name "Clear text" --exact
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" cleared

bun run verify browser "$VERIFY_RUN" find label "Text to transcribe" fill "hello"
bun run verify observe "$VERIFY_RUN" draft
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" escape
```

For an alternate local port or an explicit deployed run, replace the default URL in `open` with the origin recorded in `run.json`. Skip `serve` for deployed runs. Every checkpoint also asserts that the actual page origin matches the recorded target.

`submitted` and `restored` require both primary IPAs, input/query `hello world`, enabled visible Copy, and no page alerts. `details` requires the /h/ popup open, **Voiceless glottal fricative**, both audio controls, and the diagram element visible. `cleared` and `escape` require empty input, absent `q`, input focus, no IPA/copy/clear controls, and restored example chips. `draft` proves Escape was tested on a nonempty focused field.

Each observation saves `<checkpoint>-<unique-id>.png`, `<checkpoint>-<unique-id>.snapshot.json`, and its expected/actual values plus evidence paths in `run.json`. Repeated observations retain separate artifacts. Review those images and `diagnostics.json`, then finish with an accurate review note. Evidence is kept under ignored `test-results/verification/`; retain or copy a particular report outside that ignored folder when permanent storage is requested.

### Limits and troubleshooting

This journey covers desktop Chromium, client common-word lookup, shared-query reload, details content, and clearing. It does not test clipboard contents, alternate pronunciation selection, audio playback, media fidelity, server dictionary lookup, spelling, definitions, mobile layout, or performance. Existing CI browser checks remain in `packages/browser-contract`.

- An occupied local port: stop only your own earlier server or initialize with another origin such as `http://127.0.0.1:3001`. Do not reuse an unknown checkout's server.
- A missing /h/ diagram or failed asset request: inspect browser diagnostics and public asset settings. Do not copy placeholder `.env.example` values into local settings.
- A changed primary IPA: inspect curated word data and `src/core/ipa-map.ts` before changing expected literals. Do not derive the expected value using the same function that produced the UI.
- A failed assertion: inspect its actual values and screenshot, preserve this run, and start a new run after a fix. Do not overwrite a failure with a later success claim.

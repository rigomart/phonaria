# Phonaria feature map

This map describes how to reach features, not a claim that all features pass. The common-word transcription, transcription history, sound-frequency, minimal-pair speaking, and Language Spread journeys below have executable verification recipes. Other entries are navigation references awaiting dedicated journeys.

| Feature | Entry point | Coverage here |
| --- | --- | --- |
| Common-word transcription | `/`, header **Transcription** | Executable journey below |
| Transcription history | `/`, focus the input once this browser has a transcription | Executable journey below |
| Other pronunciation variants | Transcribe a word, **Show other pronunciations of hello** | Not exercised |
| Word definitions | Transcribe, **Definition of hello** | Not exercised; requires Worker/Wiktionary |
| Spelling suggestions and server lookup | `/`, words outside the bundled lists | Not exercised; server lookup needs Turso |
| Consonant chart | `/ipa-chart/consonants`, header **IPA Chart** → **Consonants** | Not exercised beyond the sound-frequency check that it stays unshaded |
| Vowel chart | `/ipa-chart/vowels`, **Show diphthongs** | Not exercised |
| Frequency | `/ipa-chart/frequency`, header **IPA Chart** → **Frequency** tab | Executable journey below |
| Sound card "Frequency" and "Spelling" | Any sound, or **Details for /h/** after transcribing | Executable journey below |
| Sound card merger notes | `/ipa-chart/vowels`, /ɔ/, /æ/ or /ɛ/, then **More about …** | Executable journey below |
| Language Spread | `/language-spread`, header **Language Spread** (behind `FLAG_LANGUAGE_SPREAD`) | Executable journeys below: `language-spread` (flag on) and `language-spread-off` |
| Practice | `/practice`, header **Practice** | Not exercised; controlled by `FLAG_PRACTICE` |
| Minimal-pair speaking practice | `/practice/minimal-pairs`, Practice index **Minimal pairs** (behind `FLAG_SPEECH`, independent of `FLAG_PRACTICE`) | Executable journeys below: `minimal-pairs` (flag on) and `minimal-pairs-off` |
| Credits and theme | `/credits`, footer **Credits**, header **Theme** button (cycles System, Light, Dark) | Not exercised |
| Word recordings | Sound card **Compare with** and **Spelling**, Practice reveal, **Definition of …** after transcribing | Executable journey below |

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
| Sound details | **Details for /h/**, then **More about /h/** for the full view |
| Empty-state example | Button **Hello world** |

Enter submits when the input is focused. Escape clears a nonempty focused input. When the history list under the input is open, the first Escape closes it and the second clears. Escape while a popup is focused can close the popup instead; explicitly focus the input for the clear check.

### Executable journey

Start with `bun run verify init transcription` and save its returned path as `VERIFY_RUN`. Run `bun run verify serve "$VERIFY_RUN"` in a separate persistent process, retaining its handle, and wait for the ready message. This journey uses a 1280 × 720 desktop viewport. Wait for hydration before filling: on a cold dev server, a click on **Transcribe text** can land while the server-rendered button is still `aria-disabled` and ignores pointer events. Every command below is run from the repo root. The `browser` helper forwards the remaining arguments to agent-browser in the owned session.

```bash
HYD="Object.keys(document.querySelector('[aria-label=\"Text to transcribe\"]')||{}).some(k=>k.startsWith('__reactProps'))"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 720
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" empty

bun run verify browser "$VERIFY_RUN" find label "Text to transcribe" fill "hello world"
bun run verify browser "$VERIFY_RUN" find role button click --name "Transcribe text" --exact
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" submitted

bun run verify browser "$VERIFY_RUN" find role button click --name "Details for /h/" --exact
bun run verify browser "$VERIFY_RUN" find role button click --name "More about /h/"
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
# The history list shows "hello world": the first Escape closes it.
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify browser "$VERIFY_RUN" snapshot -i
bun run verify observe "$VERIFY_RUN" escape
```

For an alternate local port or an explicit deployed run, replace the default URL in `open` with the origin recorded in `run.json`. Skip `serve` for deployed runs. Every checkpoint also asserts that the actual page origin matches the recorded target.

`submitted` and `restored` require both primary IPAs, input/query `hello world`, enabled visible Copy, and no page alerts. `details` requires the /h/ trigger marked open (`data-details-open`), **Voiceless glottal fricative**, exactly one visible play button labelled **Play /h/** before any audio interaction, and the diagram element visible. No second play control may be visible. The click on **Details for /h/** opens the compact card; **More about /h/** opens the side panel with the diagram. `cleared` and `escape` require empty input, absent `q`, input focus, no IPA/copy/clear controls, and restored example chips. `draft` proves Escape was tested on a nonempty focused field.

Each observation saves `<checkpoint>-<unique-id>.png`, `<checkpoint>-<unique-id>.snapshot.json`, and its expected/actual values plus evidence paths in `run.json`. Repeated observations retain separate artifacts. Review those images and `diagnostics.json`, then finish with an accurate review note. Evidence is kept under ignored `test-results/verification/`; retain or copy a particular report outside that ignored folder when permanent storage is requested.

### Limits and troubleshooting

This journey covers desktop Chromium, client common-word lookup, shared-query reload, details content (including the sound tile's label), and clearing. It does not test clipboard contents, alternate pronunciation selection, audio playback, media fidelity, server dictionary lookup, spelling, definitions, mobile layout, or performance. Existing CI browser checks remain in `packages/browser-contract`.

- An occupied local port: stop only your own earlier server or initialize with another origin such as `http://127.0.0.1:3001`. Do not reuse an unknown checkout's server.
- A missing /h/ diagram or failed asset request: inspect browser diagnostics and public asset settings. Do not copy placeholder `.env.example` values into local settings.
- A changed primary IPA: inspect curated word data and `src/core/ipa-map.ts` before changing expected literals. Do not derive the expected value using the same function that produced the UI.
- A failed assertion: inspect its actual values and screenshot, preserve this run, and start a new run after a fix. Do not overwrite a failure with a later success claim.

## Frequency page without categories

Use `init frequency-page` for a focused check of `/ipa-chart/frequency`. Open the page at 1280 × 900, then run `observe "$VERIFY_RUN" ranking`. Expect 40 ranked sounds, no category legend or category names in row labels, and 40 distinct shades that vary continuously with frequency. Review screenshots in both themes and at a narrow width. Sound details and audio are outside this focused journey.

## Transcription history

Recent transcriptions are saved in this browser's `localStorage` (`transcription-history`) and shown in a list under the input. There is no header button or panel. The list opens when the focused field is empty (newest first, at most 8) or when typed text matches saved entries. It stays closed while the field holds the text whose result is showing. Each row shows the text and its IPA. Picking a row (click, or arrows then Enter) submits it.

The [checkpoints](../scripts/transcription-history.ts) read the input, URL, focus, the listbox and its option texts, the IPA under **Hello world**, whether a header **History** button exists, and the stored entry texts. Expected `hə.ˈloʊ ˈwɝld` is the stored copy format of the transcription journey's grounded **hello world** IPA (`.` for syllables). Base UI hides the rest of the page from the accessibility tree while the list is open, so close it with Escape before clicking page controls such as the example chips.

### Controls

| User control | CLI locator |
| --- | --- |
| History list | `[role="listbox"]` named **Recent transcriptions**; rows are `[role="option"]` |
| Remove a row | Highlight it with the arrow keys, then `press Shift+Delete`; or the row's **Remove "…" from history** button (pointer only, `tabIndex=-1`) |
| Clear all | **Clear history**, then **Clear** (or **Cancel**) in the list's footer. Tab from the input moves into the footer. |

### Executable journey

Desktop viewport 1280 × 720, fresh browser profile. After `init transcription-history` and `serve`:

```bash
HYD="Object.keys(document.querySelector('[aria-label=\"Text to transcribe\"]')||{}).some(k=>k.startsWith('__reactProps'))"
DONE="document.querySelectorAll('[data-ipa-token]').length>0 && !document.querySelector('[aria-label=\"Text to transcribe\"]').disabled"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 720
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify browser "$VERIFY_RUN" find role button click --name "Hello world" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "new URL(location.href).searchParams.get('q')==='Hello world' && $DONE"
bun run verify browser "$VERIFY_RUN" find role button click --name "Clear text" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('[role=listbox]')"
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify browser "$VERIFY_RUN" wait --fn "!document.querySelector('[role=listbox]')"
bun run verify browser "$VERIFY_RUN" find role button click --name "She chose well" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "new URL(location.href).searchParams.get('q')==='She chose well' && $DONE"
bun run verify browser "$VERIFY_RUN" find role button click --name "Clear text" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "document.querySelectorAll('[role=option]').length===2"
bun run verify observe "$VERIFY_RUN" recent

bun run verify browser "$VERIFY_RUN" keyboard type "hel"
bun run verify browser "$VERIFY_RUN" wait --fn "document.querySelectorAll('[role=option]').length===1"
bun run verify observe "$VERIFY_RUN" filtered
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify browser "$VERIFY_RUN" wait --fn "!document.querySelector('[role=listbox]')"
bun run verify observe "$VERIFY_RUN" escape-closes
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify observe "$VERIFY_RUN" escape-clears

bun run verify browser "$VERIFY_RUN" press ArrowDown
bun run verify browser "$VERIFY_RUN" press ArrowDown
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify browser "$VERIFY_RUN" wait --fn "new URL(location.href).searchParams.get('q')==='She chose well' && $DONE"
bun run verify observe "$VERIFY_RUN" picked
bun run verify browser "$VERIFY_RUN" find label "Text to transcribe" click
bun run verify browser "$VERIFY_RUN" wait 400
bun run verify observe "$VERIFY_RUN" no-list-for-result

bun run verify browser "$VERIFY_RUN" find role button click --name "Clear text" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "document.querySelectorAll('[role=option]').length===2"
bun run verify browser "$VERIFY_RUN" press ArrowDown
bun run verify browser "$VERIFY_RUN" press Shift+Delete
bun run verify browser "$VERIFY_RUN" wait --fn "document.querySelectorAll('[role=option]').length===1"
bun run verify observe "$VERIFY_RUN" removed
bun run verify browser "$VERIFY_RUN" press Tab
bun run verify observe "$VERIFY_RUN" footer-focus
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify browser "$VERIFY_RUN" find role button click --name "Clear" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "!document.querySelector('[role=listbox]')"
bun run verify observe "$VERIFY_RUN" emptied
```

The first ArrowDown opens the list on the empty field and the second highlights the newest entry. `recent` requires both entries newest first, the **Hello world** IPA, input focus, no header button, and both entries stored. `filtered` and `escape-closes` prove the list narrows to text matches and that the first Escape only closes it. `escape-clears` requires an empty, focused field with the list still closed. `picked` requires the picked text submitted to `?q=`. The field is disabled while transcribing, so it is unfocused there. `no-list-for-result` requires the list to stay closed when the field is focused again. `removed` requires the highlighted entry gone from the list and storage. `footer-focus` requires Tab to reach **Clear history** with the list open. `emptied` requires empty storage and a closed list with focus back in the field.

### Limits

Desktop Chromium only. It does not check the phone list height, the row × button with a pointer or touch, the rest of the footer focus order (Shift+Tab back to the field, Tab out to submit, Escape), or cross-tab sync.

## Sound frequency

Target accent: American English (`en-us`). Expected ranks, shares, bands and card text are literal values from `docs/research/issue-287-phoneme-frequency.md`, the record of the generated `phoneme-frequency.json`. The [checkpoints](../scripts/sound-frequency.ts) read the page heading, legend, ranked rows and their bar color classes, header chart tabs, and the details header's frequency block (band, rank, lit meter bars, and the block's own link to the Frequency page) and the Spelling section. A click on a sound opens a compact card; clicking its name (**More about …**) opens the panel with the sections.

Interact only after the page hydrates. On a cold dev server, an early click can land before React attaches handlers and nothing happens. Wait with `wait --fn` until the control has React props, as below. If port 3000 is taken by another server, initialize the run with `http://127.0.0.1:3001` and use that origin in `open`.

### Controls

| User control | CLI locator |
| --- | --- |
| A ranked sound | `find role button click --name "/ð/ as in this: 11th, 3.1%" --exact` (rank and share) |
| Full details | `find role button click --name "More about /ð/"` (the compact card's symbol and name; its name continues with the sound's name) |
| Frequency link | `find role link click --name "Less common: 29th most common of 40 sounds. See all sounds by frequency" --exact` |

### Executable journey

Desktop viewport 1280 × 900. After `init sound-frequency` and `serve`:

```bash
HYD="Object.keys(document.querySelector('ol button')||{}).some(k=>k.startsWith('__reactProps'))"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 900
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/ipa-chart/frequency
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify observe "$VERIFY_RUN" ranking
bun run verify browser "$VERIFY_RUN" find role button click --name "/ð/ as in this: 11th, 3.1%" --exact
bun run verify browser "$VERIFY_RUN" find role button click --name "More about /ð/"
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('[data-phoneme-details] section h3')"
bun run verify observe "$VERIFY_RUN" page-card

bun run verify browser "$VERIFY_RUN" press Escape
bun run verify observe "$VERIFY_RUN" menu

bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/ipa-chart/consonants
bun run verify observe "$VERIFY_RUN" plain-charts

bun run verify browser "$VERIFY_RUN" open "http://127.0.0.1:3000/?q=hello"
bun run verify browser "$VERIFY_RUN" find role button click --name "Details for /h/" --exact
bun run verify browser "$VERIFY_RUN" find role button click --name "More about /h/"
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('[data-phoneme-details] section h3')"
bun run verify observe "$VERIFY_RUN" result-card
bun run verify browser "$VERIFY_RUN" find role link click --name "Less common: 29th most common of 40 sounds. See all sounds by frequency" --exact
bun run verify browser "$VERIFY_RUN" wait --fn "location.pathname === '/ipa-chart/frequency'"
bun run verify observe "$VERIFY_RUN" followed-link
```

`ranking` requires the Frequency heading, no tabs or comparison chart, no category legend, 40 rows led by /ə/, /t/, /n/ and ending with /ʒ/, and 40 distinct frequency shades without category labels. `page-card` requires the /ð/ row marked open (`data-details-open`), "Common", "11th most common" of 40 with 3 of 4 meter bars lit (3.1%) and no link on the Frequency page itself, and the pattern `th` paired with "this, mother", both `th` emphasized. `menu` requires the header's three IPA Chart tabs, which show on every chart page. `plain-charts` requires the consonant chart without any switch. `result-card` requires the /h/ panel from a transcription result to show "Less common", "29th most common" of 40 with 2 of 4 meter bars lit (1.35% in `phoneme-frequency.json`), the block linking to the Frequency page, and the pattern `h` paired with "house, hello"; `followed-link` requires that link to open the Frequency page.

Clicking a sound whose card or panel is already open closes it; clicking another sound while the panel is open swaps the panel to it. Review screenshots in both themes and at a narrow width. The unavailable-accent path has no route and is covered by unit tests.

## Merger notes

Target accent: American English (`en-us`). The [checkpoints](../scripts/merger-notes.ts) read the open sound's section titles and each note's text, italic words and IPA spans. Expected text is the copy approved in [#365](https://github.com/rigomart/phonaria/issues/365), with /r/ written as the app's /ɹ/. `o-note` requires /ɔ/ to end with a **Cot and caught** section after Spelling; `ae-note` and `e-note` require **Mary, marry and merry** after Spelling; `no-note` requires /ɑ/ to have How it's made, Compare with and Spelling only.

The journey takes viewport screenshots and no trace. Full-page captures of the pinned panel, or tracing, drove the renderer to 100% CPU after three or four panel opens, on sounds with and without notes, until every command timed out.

### Executable journey

Run each layout in light and dark: desktop 1280 × 900 opens the compact card and then the side panel; mobile 390 × 844 opens the drawer and expands it. On mobile, open the page fresh for each sound and wait about 1.5 s after hydration, or the tap can land while the previous drawer is still closing. After `init merger-notes`, `serve`, and `open about:blank`:

```bash
HYD="Object.keys(document.querySelector('main button')||{}).some(k=>k.startsWith('__reactProps'))"
bun run verify browser "$VERIFY_RUN" set viewport 1280 900   # or 390 844
bun run verify browser "$VERIFY_RUN" set media light          # then dark
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/ipa-chart/vowels
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
# For each of o-note (ɔ, "Open-mid back rounded vowel (ɔ)"), ae-note (æ), e-note (ɛ), no-note (ɑ):
bun run verify browser "$VERIFY_RUN" find role button click --name "Open-mid back rounded vowel (ɔ)" --exact
bun run verify browser "$VERIFY_RUN" find role button click --name "More about /ɔ/"
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('[data-phoneme-details] section h3')"
# Scroll the last section into view so the screenshot shows the note.
bun run verify observe "$VERIFY_RUN" o-note
bun run verify capture "$VERIFY_RUN" o-note-desktop-light
bun run verify browser "$VERIFY_RUN" press Escape
```

### Limits

The note words have no recordings, so playback is not exercised. es-419 has no notes and no route renders its details; unit tests cover it.

## Minimal-pair speaking practice

Target accent: American English (`en-us`). The learner picks a contrast, gets a word from one of its pairs, records it, and the page checks that the recording holds the word with `gateWord`, then judges every sound with `judgeWord`, on the evidence from `POST /api/speech/score`. The result leads with the contrast sound's sentence in the live region; under it, outside the live region, a **Sound by sound** row has one tile per sound (`[data-sound-result="match|swapped|unclear"]`) with the sound's glyph, the heard sound beside it for a swap, an icon and a sentence such as "/ɪ/ sounded like /i/" (the sound's name is screen-reader text). Every glyph opens the sound card. Expected copy comes from [#332](https://github.com/rigomart/phonaria/issues/332), [#334](https://github.com/rigomart/phonaria/issues/334) and [#344](https://github.com/rigomart/phonaria/issues/344); the IPA for *ship* (`SH IX1 P`) is `ˈʃɪp` from the curated dictionary. The [checkpoints](../scripts/minimal-pairs.ts) read the page heading, the IPA tokens, the marked sound's label, the visible buttons, the sentence in the result live region and the sound-by-sound tiles.

Live scoring needs `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION` in `apps/phonaria/.dev.vars`; without them the route answers 503 and `match`, `swapped`, `not-heard`, `random-word`, `added-sounds` and `phrase` are **blocked**. Never print the key. Each recorded attempt is two live Azure calls (assessment and plain recognition), so the journey costs twelve.

Headless Chromium has no microphone. The journey's `fakeMic` helper replaces `navigator.mediaDevices.getUserMedia` with a stream that plays a catalog recording passed in as base64 (the asset bucket sends no CORS headers, so the page can't fetch it), or silence for `null`. Download the recordings first: `https://assets.rigos.dev/audio/en-us/words/jenny/ship.ogg` and `sheep.ogg`. The wrong-word attempts need Azure TTS of *kid*, *ships* and "a ship" in any voice; the wrong-word investigation's `audio-src/jenny-kid.wav`, `jenny-ships.wav` and `jenny-a_ship.wav` (Jenny at -10% rate, 24 kHz) are what the expectations were checked with. `failMic` makes `getUserMedia` reject with a given `DOMException` name, `failRoute` answers the scoring route from the page with a given status, `stubVowel` answers it with evidence for the vowel of *ship* so the browser judge decides the verdict, and `stubSounds` answers it with evidence for each sound of *ship*.

### Controls

| User control | CLI locator |
| --- | --- |
| Practice index link | `find role link click --name "Minimal pairs Say a word like ship or sheep and find out which sound came through. Pick a pair of sounds to start."` |
| A contrast | `find label "seat and sit" click` (named by its first pair) |
| Record, Stop, Try again, Next word | `find role button click --name "Record"` (and so on) |
| Play the word, play the heard word | `find role button click --name "Hear ship"`, `"Hear sheep"` |
| A sound in the sound-by-sound row | `find role button click --name "Details for /i/"` (a heard sound; the IPA display above has its own **Details for** buttons, so scope to `[data-sound-result]` when the label repeats) |

### Executable journey (flag on)

```bash
caffeinate -u -t 3600 &
bun run verify init minimal-pairs
bun run verify serve "$VERIFY_RUN"
js() { bun run verify browser "$VERIFY_RUN" eval -b "$(bun -e 'const [n, a] = process.argv.slice(-2); const j = await import("./.agents/skills/verify-phonaria/scripts/minimal-pairs.ts"); const v = a.startsWith("@") ? JSON.stringify(Buffer.from(await Bun.file(a.slice(1)).arrayBuffer()).toString("base64")) : a; process.stdout.write(Buffer.from(`(${j[n]})(${v})`).toString("base64"))' -- "$1" "$2")"; }
settled="!!document.querySelector('[aria-live=polite][aria-atomic=true] p') && !/^(Listening|Checking|Waiting)/.test(document.querySelector('[aria-live=polite][aria-atomic=true]').textContent)"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 900
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/practice
bun run verify observe "$VERIFY_RUN" index-link
# Click the Practice index link, wait for the list, then:
bun run verify observe "$VERIFY_RUN" picker
bun run verify browser "$VERIFY_RUN" open "http://127.0.0.1:3000/practice/minimal-pairs?contrast=i-ix&word=ship"
bun run verify observe "$VERIFY_RUN" word
# For each attempt: set up, click, wait for "$settled", observe.
js fakeMic @/path/to/ship.ogg;   # click Record     -> observe match
js fakeMic @/path/to/sheep.ogg;  # click Try again  -> observe swapped
js fakeMic null;                 # click Try again  -> observe not-heard (5 s of silence)
js fakeMic @/path/to/kid.wav;    # click Try again  -> observe random-word
js fakeMic @/path/to/ships.wav;  # click Try again  -> observe added-sounds
js fakeMic @/path/to/a-ship.wav; # click Try again  -> observe phrase
js fakeMic @/path/to/ship.ogg; js stubVowel '{ "targetScore": 0.6, "rival": "I", "rivalScore": 0.62 }'  # Try again -> observe close-call
js stubVowel '{ "targetScore": 0.2, "rival": "E", "rivalScore": 0.9 }'  # click Try again -> observe other-sound
js stubSounds '[{ "phonemeId": "SH", "targetScore": 0.9 }, { "phonemeId": "IX", "targetScore": 0.02, "rival": "I", "rivalScore": 1 }, { "phonemeId": "P", "targetScore": 0.2 }]'  # Try again -> observe every-sound
# Click the heard /i/ in the row (Details for /i/) -> observe heard-card, then press Escape
js failMic '"NotAllowedError"';  # click Try again  -> observe denied
js failMic '"NotFoundError"';    # click Try again  -> observe unsupported
js fakeMic @/path/to/ship.ogg; js failRoute 429  # Try again -> observe rate-limited
js failRoute 503                 # click Try again  -> observe unavailable
js failRoute 502                 # click Try again  -> observe scoring-failed
# Click Next word, wait for a new h1, then:
bun run verify observe "$VERIFY_RUN" next-word
```

`index-link` requires the Practice index to list Schwa and a link to `/practice/minimal-pairs`. `picker` requires the **Minimal pairs** h1, **Consonants** and **Vowels** groups and 27 contrast links, the first named **pat and bat**. `word` requires `ˈʃɪp` with /ɪ/ labelled **Details for /ɪ/, the marked sound**, **Hear ship** and **Record** buttons, the privacy line and an empty result. `match`, `swapped`, `not-heard`, `random-word`, `added-sounds`, `phrase`, `close-call` and `other-sound` require their exact sentences (`swapped` also a **Hear sheep** button; the wrong-word ones no sound named); `every-sound` requires the swapped sentence above a **Sound by sound** row of three tiles: /ʃ/ `match` "/ʃ/ sounded right", /ɪ/ `swapped` with the marked /ɪ/ and the heard /i/ as buttons and "/ɪ/ sounded like /i/", and /p/ `unclear` "/p/ wasn't clear". `heard-card` requires the heard /i/ tile button to be the open trigger and the card to be titled **More about /i/**. Each failure checkpoint requires its one-line message. `next-word` requires another i-ix word, matching the URL, with no result showing.

### Flag off

```bash
bun run verify init minimal-pairs-off
FLAG_SPEECH=0 bun run verify serve "$VERIFY_RUN"
# open about:blank, trace start, set viewport 1280 900
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/practice/minimal-pairs
bun run verify observe "$VERIFY_RUN" not-found
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/practice
bun run verify observe "$VERIFY_RUN" index-hidden
```

`not-found` requires HTTP 404 with the shared **This page doesn't exist** h1 and no **Record** button; `index-hidden` requires the Practice index to list Schwa without the minimal-pairs link.

### Limits

Chromium only, with the microphone replaced by a stream playing Azure Jenny TTS, so real voices and real microphones are not exercised. Close-call, other-sound, every-sound, heard-card, denied, unsupported and the route failures are simulated in the page, so they check the page and the browser judge, not the route or Azure. The wrong words are TTS, not learners. Only i-ix and *ship* are recorded; the no-evidence sentence and the word named for a swapped sound outside the contrast are covered by unit tests only. The live region is read from the DOM, not through a screen reader.

## Language Spread

"The story of English" is a scroll story at `/language-spread`, behind `FLAG_LANGUAGE_SPREAD` (on locally, off in production unless set). A canvas globe (orthographic) stays pinned under the 48 px sticky header. Scrolling moves through 11 steps; each step's card fades in at the place its step gives it (`card` in the story data: top, middle or bottom, left or right, on wide screens; always at the bottom on phones), and the previous card fades out. The active step is the `<li data-step="<id>">` with `aria-current="step"`. The expected literals come from the story data in `apps/phonaria/src/lib/language-spread/story.ts` and the product requirements, not from importing the app's helpers: 11 steps (intro, indo-european, germanic, old-english, vikings, norman-conquest, great-vowel-shift, printing, america, around-the-world, today), 9 places, 8 routes, 9 main works.

The [checkpoints](../scripts/language-spread.ts) read the era dial (`[data-era]`, its 11 ticks and the `Step N of 11` screen-reader text), the Previous/Next step buttons, `data-stop` pins (`data-revealed`, the pin's `<li>` `inert` until revealed, and the pin's positioned parent hidden and `inert` on the far side of the globe), the cards (computed opacity, whether their chips sit inside an `inert` element, their box against the screen edges), and the map region's box and attributes: `data-camera` (`dragging` while the reader holds the globe, `moving` during a flight or the glide after a drag, `settled` once it rests), `data-camera-center` (`lon,lat`, 1 decimal), `data-camera-zoom` (2 decimals; 1 means the whole globe exactly fits the area the card and dial leave free, the whole-globe view reads 0.88, steps on England read 4 to 16) and `data-routes-drawn` (arrows fully drawn, far side included), and `data-spinning` while the globe turns slowly eastward at `today` (about one turn per 100 s; paused by hovering the globe or a pin, focus in the map, open details or a drag, resuming about 2 s later; off with reduced motion, a hidden tab, or less than half the map on screen). Centre and zoom are written only when the camera lands. After a drag moves the step's centre more than 48 px, or behind the globe, a **Recenter on this step** button (`[data-recenter]`) appears at the bottom middle of the free area. The active card shows only once the globe reveals its step (about 60% into a flight, at most 1.6 s), so waits require it opaque. Arrows are painted on the canvas, so there are no paths to count. Also the details panel `[data-stop-details]`, the card chips and the sources section.

### Controls

| User control | CLI locator |
| --- | --- |
| Map region | `[role="region"][aria-label^="Map of where languages spread"]` (carries the camera attributes) |
| A story step | `scrollIntoView()` on `[data-step=<id>]`, then wait for the camera |
| Previous / Next step | `button[aria-label="Previous step"]`, `button[aria-label="Next step"]` in the era dial; they scroll the page to the step |
| A pin | `click '[data-stop="old-norse"]'` (a button; the pin's `<li>` is `inert` until revealed) |
| A card chip | `button[aria-label="Old Norse, show details"]` inside the card's `ul[aria-label="Places on the map"]` |
| Close details | `press Escape`, or **Close Old Norse**; focus returns to the opener |
| Header link | **Language Spread** in `nav[aria-label="Main"]`, `aria-current="page"` on the page |
| Drag the globe | `mouse move X Y`, `mouse down`, `mouse move X2 Y2 --steps 10 --duration 200`, `mouse up` on empty globe (the canvas); a move under 4 px stays a click |
| Recenter | `click '[data-recenter]'` (**Recenter on this step**) |
| Touch spin | no native touch in desktop Chromium: `js touchSpin "DX, DY"` dispatches touch pointer events on the canvas |

### Executable journey (flag on)

Start with `bun run verify init language-spread` and `bun run verify serve "$VERIFY_RUN"`. Keep the display awake first: on a Mac whose display sleeps, headless Chrome's frame clock stops, `requestAnimationFrame` barely runs, scroll steps never change and flights stay `moving` (see the troubleshooting note in the skill). The active step, the camera and the arrows all run on animation frames, so wait for the expected state after every step change instead of sleeping. A flight lasts 0.9 to 2.2 s and a step's arrows draw after it lands, so wait on the step, a landed centre inside the step's bounds and the route count together; `data-camera` still reads `settled` from the previous step for a moment. These recipes do not start a DevTools trace: on the earlier version of this page, tracing stalled the renderer until browser commands timed out.

The `*-flight` checkpoints need a recorder installed just before the step changes. `recordFlight` in the journey file saves, on every frame while the camera is `moving` and once after it lands, where each pin on the near side of the globe was drawn. The checkpoint then works out the globe's radius on each frame from those positions (a least-squares fit of the orthographic projection over a grid of camera centres) and turns it into the page's zoom with the radius at landing. The `rec` helper below sends the recorder with `eval -b`; `land` also waits for the recording to finish.

```bash
caffeinate -u -t 3600 & CAFFEINATE=$!
O=http://127.0.0.1:3000
HYD="!!document.querySelector('[data-camera=settled]') && Object.keys(document.querySelector('[data-stop]')||{}).some(k=>k.startsWith('__reactProps'))"
# land STEP W S E N ROUTES: STEP is active and its card visible, the camera has landed inside the bounds (degrees), ROUTES arrows are drawn.
land() { echo "(()=>{const d=document.querySelector('[data-camera]').dataset;const a=document.querySelector('[data-step][aria-current=step]');if(a?.dataset.step!=='$1'||getComputedStyle(a.querySelector('article')).opacity!=='1'||d.camera!=='settled'||d.routesDrawn!=='$6'||(window.__spreadFlight&&!window.__spreadFlight.done))return false;const [lon,lat]=d.cameraCenter.split(',').map(Number);return lon>=$2&&lon<=$4&&lat>=$3&&lat<=$5})()"; }
step() { bun run verify browser "$VERIFY_RUN" eval "document.querySelector('[data-step=$1]').scrollIntoView()"; }
# js NAME ARGS: runs an exported helper from the journey file in the page, e.g. js fastScroll '"today"'.
js() { bun run verify browser "$VERIFY_RUN" eval -b "$(bun -e 'const [n, a] = process.argv.slice(-2); const j = await import("./.agents/skills/verify-phonaria/scripts/language-spread.ts"); process.stdout.write(Buffer.from(`(${j[n]})(${a})`).toString("base64"))' -- "$1" "$2")"; }
rec() { js recordFlight ""; }
# A mouse drag that starts at (X1, Y1), ends at (X2, Y2) and lets go at once, so the globe glides.
from() { bun run verify browser "$VERIFY_RUN" eval "window.__dragFrom=document.querySelector('[data-camera]').dataset.cameraCenter"; }
press() { bun run verify browser "$VERIFY_RUN" mouse move $1 $2; bun run verify browser "$VERIFY_RUN" mouse down; bun run verify browser "$VERIFY_RUN" mouse move $3 $4 --steps 10 --duration 200; }
release() { bun run verify browser "$VERIFY_RUN" mouse up; bun run verify browser "$VERIFY_RUN" wait --fn "(()=>{const d=document.querySelector('[data-camera]').dataset;return d.camera==='settled'&&d.cameraCenter!==window.__dragFrom})()"; }
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" open $O/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify observe "$VERIFY_RUN" intro

bun run verify browser "$VERIFY_RUN" focus 'button[aria-label="Next step"]'
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify browser "$VERIFY_RUN" wait --fn "$(land indo-european 5 36 75 62 1)"
bun run verify observe "$VERIFY_RUN" next-step
bun run verify browser "$VERIFY_RUN" focus 'button[aria-label="Previous step"]'
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify browser "$VERIFY_RUN" wait --fn "$(land intro -180 -90 180 90 0)"
bun run verify observe "$VERIFY_RUN" previous-step

step old-english
bun run verify browser "$VERIFY_RUN" wait --fn "$(land old-english -14 47 14 60 3)"
rec; step vikings
bun run verify browser "$VERIFY_RUN" wait --fn "$(land vikings -14 48 16 63 5)"
bun run verify observe "$VERIFY_RUN" near-flight
bun run verify observe "$VERIFY_RUN" near-move

# Drag the globe 150 px left over open sea and land, then go on with Next.
from; press 600 650 450 650; release
bun run verify observe "$VERIFY_RUN" drag-mid-story
rec
bun run verify browser "$VERIFY_RUN" focus 'button[aria-label="Next step"]'
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify browser "$VERIFY_RUN" wait --fn "$(land norman-conquest -8 46 8 56 6)"
bun run verify observe "$VERIFY_RUN" drag-flight
bun run verify observe "$VERIFY_RUN" after-drag-next

step printing
bun run verify browser "$VERIFY_RUN" wait --fn "$(land printing -6 49.5 4 55 6)"
bun run verify browser "$VERIFY_RUN" click '[data-stop="old-norse"]'
bun run verify observe "$VERIFY_RUN" earlier-pin-mid-story
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify observe "$VERIFY_RUN" details-closed
# Open it again and click empty globe, clear of pins and the panel.
bun run verify browser "$VERIFY_RUN" click '[data-stop="old-norse"]'
bun run verify browser "$VERIFY_RUN" wait '[data-stop-details]'
from
bun run verify browser "$VERIFY_RUN" mouse move 600 650
bun run verify browser "$VERIFY_RUN" mouse down
bun run verify browser "$VERIFY_RUN" mouse up
bun run verify observe "$VERIFY_RUN" globe-click-closes-details
bun run verify browser "$VERIFY_RUN" focus 'button[aria-label^="Theme:"]'
bun run verify browser "$VERIFY_RUN" press Tab
bun run verify observe "$VERIFY_RUN" off-map-pins
# Give focus back to the Old Norse pin for the focus checks in atlantic and far-move.
bun run verify browser "$VERIFY_RUN" focus '[data-stop="old-norse"]'

rec; step america
bun run verify browser "$VERIFY_RUN" wait --fn "$(land america -90 25 5 58 7)"
bun run verify observe "$VERIFY_RUN" atlantic-flight
bun run verify observe "$VERIFY_RUN" atlantic

rec; step around-the-world
bun run verify browser "$VERIFY_RUN" wait --fn "$(land around-the-world 10 -45 160 20 8)"
bun run verify observe "$VERIFY_RUN" far-flight
bun run verify observe "$VERIFY_RUN" far-move

step germanic
bun run verify browser "$VERIFY_RUN" wait --fn "$(land germanic -12 44 30 64 1)"
bun run verify observe "$VERIFY_RUN" scroll-back

# Scroll to today over 24 frames, through 8 steps, and watch which cards show. This needs a fresh
# page: after a synthetic key press, headless Chrome starves page tasks while a script runs every
# frame, so React would not commit the step changes until the scroll ends.
bun run verify browser "$VERIFY_RUN" open $O/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
step germanic
bun run verify browser "$VERIFY_RUN" wait --fn "$(land germanic -12 44 30 64 1)"
js fastScroll '"today"'
bun run verify observe "$VERIFY_RUN" fast-scroll
bun run verify browser "$VERIFY_RUN" wait --fn "$(land today -180 -90 180 90 8)"
bun run verify observe "$VERIFY_RUN" today

# Today spins once landed. Keep the mouse off the globe, save a pin's place, then hover the globe.
SPIN="(()=>document.querySelector('[data-camera]').hasAttribute('data-spinning'))()"
bun run verify browser "$VERIFY_RUN" mouse move 1200 700
bun run verify browser "$VERIFY_RUN" wait --fn "$SPIN"
bun run verify browser "$VERIFY_RUN" eval "window.__pinAt=document.querySelector('[data-stop=\"indo-european\"]').closest('li').firstElementChild.style.transform"
bun run verify observe "$VERIFY_RUN" spin-today
bun run verify browser "$VERIFY_RUN" mouse move 838 475
bun run verify observe "$VERIFY_RUN" spin-hover

# Drag the whole globe 140 px left and 60 px up, observing while the button is held, then recenter.
from; press 900 560 760 500
bun run verify observe "$VERIFY_RUN" drag-held
release
bun run verify observe "$VERIFY_RUN" drag-released
bun run verify browser "$VERIFY_RUN" click '[data-recenter]'
bun run verify browser "$VERIFY_RUN" wait --fn "(()=>{const d=document.querySelector('[data-camera]').dataset;return d.camera==='settled'&&d.cameraCenter.endsWith(',11.0')&&!document.querySelector('[data-recenter]')})()"
bun run verify observe "$VERIFY_RUN" recentered

# The spin resumes off the globe, stops at the sources, and stops on leaving today.
bun run verify browser "$VERIFY_RUN" mouse move 1200 700
bun run verify browser "$VERIFY_RUN" wait --fn "$SPIN"
bun run verify browser "$VERIFY_RUN" eval "document.querySelector('section[aria-labelledby=language-spread-sources]').scrollIntoView()"
bun run verify observe "$VERIFY_RUN" spin-sources
step today
bun run verify browser "$VERIFY_RUN" wait --fn "$SPIN"
step around-the-world
bun run verify browser "$VERIFY_RUN" wait --fn "$(land around-the-world 10 -45 160 20 8)"
bun run verify observe "$VERIFY_RUN" left-today
js readSitemap ""
bun run verify observe "$VERIFY_RUN" sitemap

# Phone: a fresh page at 390 x 844, scrolled to the Vikings step, then a touch swipe.
bun run verify browser "$VERIFY_RUN" set viewport 390 844
bun run verify browser "$VERIFY_RUN" open $O/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
step vikings
bun run verify browser "$VERIFY_RUN" wait --fn "$(land vikings -14 48 16 63 5)"
bun run verify observe "$VERIFY_RUN" mobile
js touchSpin "-120, -60"
bun run verify observe "$VERIFY_RUN" phone-spin

# Reduced motion: desktop again, then scroll and require a landed camera and a shown card within 300 ms.
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" set media light reduced-motion
bun run verify browser "$VERIFY_RUN" open $O/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify browser "$VERIFY_RUN" eval "document.querySelector('[data-step=vikings]').scrollIntoView(); new Promise((ok,fail)=>setTimeout(()=>{const d=document.querySelector('[data-camera]').dataset;const [lon,lat]=(d.cameraCenter||'').split(',').map(Number);const card=getComputedStyle(document.querySelector('[data-step=vikings] article')).opacity;d.camera==='settled'&&d.routesDrawn==='5'&&card==='1'&&lon>=-14&&lon<=16&&lat>=48&&lat<=63?ok('landed within 300 ms'):fail(new Error('not landed: '+JSON.stringify({...d,card})))},300))"
bun run verify observe "$VERIFY_RUN" reduced-motion
js watchSpin '"today"'
bun run verify observe "$VERIFY_RUN" reduced-no-spin
kill $CAFFEINATE
```

The `eval` in the last block rejects (the command fails and is logged in `commands.jsonl`) unless the camera has landed on the Vikings step, with its arrows drawn, 300 ms after the scroll; this is the only timing check, since `observe` polls. Use the same origin as `serve` (change `O` for another port or a deployed target).

- `intro` requires path `/language-spread`, title **The history of English, from Old English to today - Phonaria**, h1 **The story of English**, the header link with `aria-current="page"`, `<meta name="robots" content="noindex, follow">` (robots follows `SITE_INDEXING_ENABLED`, which is `0` in the local vars of `wrangler.jsonc` and unset in `.dev.vars`; expect `index, follow` where indexing is on), share metadata (`og:type` `article`; `og:title` and `twitter:title` the document title without the site name; `og:description` starting **English from Indo-European roots**; every `og:image` and `twitter:image` ending in `/og/language-spread.jpg`, 1200 × 630; `twitter:card` `summary_large_image`; one `application/ld+json` script with `@type` `Article` and 28 `citation` entries), era `~4000 BCE`, step `intro`, **Step 1 of 11**, the 11 step ids in order, 11 ticks, 9 pins and none revealed, `data-routes-drawn` 0, a landed whole-globe view (zoom below 1; it reads 0.88), the map region within 2 px of the header (top 48, height `innerHeight - 48`), the intro card opaque, not inert and centred on the left (24 px inside the map region's left edge, centred top to bottom). Placement is measured against the map region, not the window, since the page's scrollbar narrows it, the other 10 cards transparent, Previous step disabled, and the **Sources** section with 9 `https` links.
- `next-step` requires Enter on the focused **Next step** button to scroll the page to `indo-european` (era still `~4000 BCE`, the steppe pin revealed), the new card opaque and every other card transparent, the dial's `[role="status"]` region reading **Step 2 of 11, ~4000 BCE: One ancestor, many languages**, and focus on the new card.
- `previous-step` requires Enter on the focused **Previous step** button to go back to `intro` (no pins revealed), the status reading **Step 1 of 11, ~4000 BCE: The story of English**, and focus on the intro card. Scrolling by hand leaves the status unchanged, so only these two steps announce.
- `near-flight` requires, for old-english to vikings, a recorded flight whose pins fit one globe within 3 px, landing above zoom 1, and a zoom that never drops below 95% of the lower of the two ends: a near move pans and zooms without pulling back. Measured: 6.20 to 5.55, lowest 5.55.
- `near-move` requires era `~800 CE`, revealed pins exactly `indo-european`, `germanic`, `old-english`, `old-norse`, 5 routes drawn, a landed camera inside the step bounds (-14, 48, 16, 63 as west, south, east, north) above zoom 1, the vikings card opaque at the bottom right (24 px inside the map region's right and bottom edges) with reachable chips, the old-english card transparent with its chips inside an `inert` element, and the Old Norse pin below the era dial, on screen and clear of the card.
- `earlier-pin-mid-story` requires, at `printing`, the panel for **Old Norse** (the vikings step's place) inside the `aria-live` region: kind and date `Language, ~800 CE`, its description, **Roughly in the east and north of England. The pin marks the general area, not an exact spot.**, **Sources (2)**, a **Close Old Norse** button, the pin `aria-expanded="true"`, and the era still `~1476 CE` (opening an old pin does not move the story). The pin stands right of the top-left card and is clicked with the pointer.
- `details-closed` requires the panel gone, the pin `aria-expanded="false"`, and focus back on the **Old Norse** pin after Escape.
- `globe-click-closes-details` requires, after opening Old Norse again and a mouse press and release on empty globe, the panel gone, the pin `aria-expanded="false"`, the camera settled where it was (a click is not a drag), and no Recenter button.
- `off-map-pins` requires, still at `printing`, the steppe (Indo-European) pin, far off the right edge, hidden and `inert`; Tab from the header's theme button landing on another pin whose box lies wholly inside the map region; and the map region's `scrollLeft` still 0 (the region clips, so a focused pin near the edge never scrolls it).
- `atlantic-flight` requires, for printing to america, a recorded flight that fits within 3 px, lands above zoom 1, and does not dip: america's bounds take in both sides of the Atlantic, so the camera zooms out from England (about 15.6) to about 1.5 and never pulls back further.
- `atlantic` requires era `~1607 CE`, 8 pins revealed including Jamestown's, 7 routes drawn, a landed camera inside america's bounds (-90, 25, 5, 58) above zoom 1, the america card opaque at the bottom left, the printing card transparent with its chips inert, the Jamestown pin below the dial, on screen and clear of the card, and focus still on the Old Norse pin from `details-closed`, which is on the near side.
- `far-flight` requires, for america to around-the-world, a recorded flight that fits within 3 px, dips below both ends and below zoom 1 (the whole globe; measured 0.88), and lands above 1 (measured 1.06).
- `far-move` requires era `~1788 CE`, all 9 pins revealed, 8 routes drawn, a landed camera inside the bounds (10, -45, 160, 20) above zoom 1, the card at the top right (24 px inside the region's right edge and below the header), the Sydney pin below the dial and clear of the card, the London and Jamestown pins hidden and `inert` behind the globe while the Sydney pin is not, and focus on the card: the focused Old Norse pin went behind the globe and handed it over.
- `drag-mid-story` requires, at `vikings` after a 150 px mouse drag released at once, the camera settled on a new centre (it glides, then settles) and the **Recenter on this step** button shown.
- `drag-flight` requires the flight that Next then starts to begin where the dragged view was (every pin within 10 px of its place before the step changed), fit within 3 px, land above zoom 1 and not dip.
- `after-drag-next` requires `norman-conquest` (era `~1066 CE`), a landed camera inside its bounds (-8, 46, 8, 56), its card opaque, and the Recenter button gone.
- `scroll-back` requires era `~500 BCE`, step `germanic`, revealed pins exactly `indo-european` and `germanic`, the later `old-english` and `american-english` pins' `<li>` `inert` and not revealed, 1 route drawn (down from 8), and a landed camera inside germanic's bounds (-12, 44, 30, 64) above zoom 1.
- `fast-scroll` requires, on a fresh page, a scroll from `germanic` to `today` spread over 24 frames to pass through at least 4 active steps while only the germanic and today cards ever reach an opacity above 0.05.
- `today` requires era `Today`, **Step 11 of 11**, all 9 pins revealed, 8 routes drawn, the whole-globe view (zoom below 1), all 11 ticks filled, and Next step disabled.
- `spin-today` requires, with the mouse off the globe, `data-spinning` on the map at `today` while `data-camera` stays `settled` and `data-camera-center` keeps the landing `10.0,11.0`, and the steppe pin's transform different from the one saved after the spin began, so the globe really turns.
- `spin-hover` requires, with the mouse over the globe, `data-spinning` gone (it eases out within about a second).
- `drag-held` requires `data-camera="dragging"` at `today` while the mouse button is still down after a 140 px move.
- `drag-released` requires, after release, the camera settled on a new centre and the Recenter button shown with its name.
- `recentered` requires, after clicking Recenter, the camera settled at latitude `11.0` (the drag also moved it 60 px south, and the spin only turns longitude) and a longitude at or west of today's `10.0` (the spin has turned the step's view since), with the button gone.
- `spin-sources` requires, still at `today`, the spin stopped once the page scrolls to the sources and less than half the map is on screen.
- `left-today` requires, after the spin was running again, scrolling back to `around-the-world` to stop it, with the camera settled.
- `sitemap` requires `/sitemap.xml`, fetched into the page by `js readSitemap`, to list exactly `/`, `/ipa-chart/consonants`, `/ipa-chart/vowels`, `/ipa-chart/frequency`, `/credits` and `/language-spread`. Opening the XML directly would request a favicon the app doesn't serve, a failed request.
- `mobile` requires, at 390 × 844 on `vikings`, a landed camera inside the step bounds above zoom 1, the map pinned, the active card across the width and within 40 px of the bottom edge, the era dial in the top 160 px, and the Old Norse pin on screen between the dial and the card. The desktop nav is hidden at this width, so the nav is not asserted.
- `phone-spin` requires, after `touchSpin` swipes 120 px left and 60 px up with touch pointer events, the camera settled with its longitude moved east by more than a degree and its latitude unchanged (touch only spins), and computed `touch-action: pan-y pinch-zoom` on the canvas, which leaves vertical swipes to the page.
- `reduced-motion` requires `prefers-reduced-motion` matched, era `~800 CE`, step `vikings`, a landed camera inside the step bounds with its 5 arrows drawn, the vikings card opaque with no running animations, and computed `transition-property: none` on the Old Norse pin. The 300 ms `eval` also requires the card opaque by then.
- `reduced-no-spin` requires, with reduced motion, that `js watchSpin '"today"'` scrolled to `today` and never saw `data-spinning` on any frame for 3.5 s.

### Flag off

The flag is read when the server starts, so this journey needs its own run and its own server. Stop the flag-on server first (or pick another port in `init`).

```bash
caffeinate -u -t 3600 &
bun run verify init language-spread-off
FLAG_LANGUAGE_SPREAD=0 bun run verify serve "$VERIFY_RUN"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" trace start
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('h1')"
bun run verify observe "$VERIFY_RUN" not-found
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('nav[aria-label=Main] a')"
bun run verify observe "$VERIFY_RUN" nav-hidden
js() { bun run verify browser "$VERIFY_RUN" eval -b "$(bun -e 'const [n, a] = process.argv.slice(-2); const j = await import("./.agents/skills/verify-phonaria/scripts/language-spread.ts"); process.stdout.write(Buffer.from(`(${j[n]})(${a})`).toString("base64"))' -- "$1" "$2")"; }
js readSitemap ""
bun run verify observe "$VERIFY_RUN" sitemap-hidden
```

`not-found` requires, on `/language-spread`, HTTP status 404 (from the navigation timing entry, so the page must be opened directly, not reached by a link), the shared **This page doesn't exist** h1, no map region or pins, and main nav labels exactly **Transcription**, **IPA Chart**, **Practice**. `nav-hidden` requires the same labels on `/`, all visible, and no `a[href="/language-spread"]` anywhere in the page. Practice is on in local dev unless `FLAG_PRACTICE=0` (checked: a dev server started with only `FLAG_LANGUAGE_SPREAD=0` shows all three). The journey cannot tell whether the server really had the flag off; it only sees its effects. `sitemap-hidden` requires the fetched sitemap to list the same pages without `/language-spread`.

### Limits

Chromium only, with the page flag on or off as noted. The landed camera is checked as a centre inside the step's bounds and a zoom above or below 1, not as a pixel position. The land, areas and arrows are painted on a canvas, so they are judged from the saved screenshots; arrows are counted through `data-routes-drawn`, which the page keeps. Mid-flight zoom is inferred from where pins were drawn on each frame, not read from the page; frames with fewer than three separate places on the near side are skipped. No frame rate or flight smoothness is measured. Only intro, indo-european, germanic, old-english, vikings, norman-conquest, printing, america, around-the-world and today are visited, and place descriptions are read from the page, not checked against the cited studies. The step announcement is read from the status region's text, not through a screen reader. Drags use the mouse; touch is synthetic pointer events (`pointerType: "touch"`), since desktop Chromium has no native touch here, so the browser's own panning under `touch-action` is not exercised and vertical page scrolling during a swipe is inferred from the computed `touch-action` only. Pen input, pinch zoom, the ±75° latitude cap and the glide's shape are not checked. The spin is checked at 1280 × 800 by its attribute and one pin's movement: its speed, the pauses for pin hover, focus and open details, the 2 s resume and a hidden tab are not. No DevTools trace is saved (see above). Phone coverage is one step; the mobile menu and landscape are not opened.

After any synthetic key press (`press`), headless Chrome here runs almost no page tasks while a script runs every animation frame, on any page including `about:blank`, until the next page load; React then cannot commit step changes during a scripted scroll. The recipe runs `fast-scroll` on a fresh page for that reason. It is a browser automation effect, not the app's.

## Word recordings

Target accent: American English (`en-us`). A word with a recording in the word-audio manifest (`packages/phonetics-data/data/en/word-audio.json`) plays it from `assets.rigos.dev` through the shared audio manager, which sets the button's `data-status` to `loading`, `playing`, then `idle`, or `error` with a **Playback error** toast. Single-word surfaces play a word's main recording: minimal pairs under **Compare with** and spelling examples under **Spelling** on a sound card, and each word of a Practice reveal. The lookup popover a transcribed word opens (**Definition of seat**) shows one button per recording; a word with labelled forms gets one per form, named "Hear read, past tense" (#370). The [checkpoints](../scripts/word-audio.ts) read the `Hear …` buttons of each surface and any button in the `error` state or playback toast.

The /i/ card lists the catalog's seat/sit and sheep/ship pairs and the spelling examples seed, sea, happy and be, all recorded. Practice draws five words at random; the reveal row's button must name its own word.

### Executable journey

Run once per viewport and theme: 1280 × 800 and 390 × 844, `set media light` and `set media dark`. Each surface is opened with `open`, a cold page load. After `init word-audio` and `serve`:

```bash
v() { bun run verify browser "$VERIFY_RUN" "$@"; }
playing() { v wait --fn "document.querySelector('[aria-label=\"$1\"]')?.dataset.status==='playing'"; }
v open about:blank
v trace start
v set viewport 1280 800
v set media light
v open http://127.0.0.1:3000/ipa-chart/vowels
v wait --fn "Object.keys(document.querySelector('[aria-label=\"Close front unrounded vowel (i)\"]')||{}).some(k=>k.startsWith('__reactProps'))"
v find role button click --name "Close front unrounded vowel (i)" --exact
v find role button click --name "More about /i/: Close front unrounded vowel"
v wait 1500
bun run verify observe "$VERIFY_RUN" sound-card
v find role button click --name "Hear seat" --exact
playing "Hear seat"
v find role button click --name "Hear happy" --exact
playing "Hear happy"
bun run verify observe "$VERIFY_RUN" played

v open http://127.0.0.1:3000/practice/schwa
v find role button click --name "Start session" --exact   # after hydration
v find role button click --name "Next word" --exact       # four times
v find role button click --name "Finish session" --exact
v find role button click --name "Submit with 5 blanks" --exact
v wait 1500
bun run verify observe "$VERIFY_RUN" practice-reveal
v click "li button[aria-label^=\"Hear \"]"
v wait --fn "document.querySelector('li button[aria-label^=\"Hear \"]')?.dataset.status==='playing'"
bun run verify observe "$VERIFY_RUN" played

v open "http://127.0.0.1:3000/?q=seat"
v find role button click --name "Definition of seat" --exact   # after hydration
bun run verify observe "$VERIFY_RUN" lookup
v find role button click --name "Hear seat" --exact
playing "Hear seat"
bun run verify observe "$VERIFY_RUN" played
```

`sound-card` requires the four pair words and four spelling examples as `Hear …` buttons. `practice-reveal` requires five rows, each button named for its row's word. `lookup` requires exactly **Hear seat**. `played` requires no button in the `error` state and no playback toast. A `wait` for `playing` that times out fails the run.

### Limits

Playback is proven by the `playing` state, set on the media element's `playing` event; nobody listens to the sound. The published manifest has no labelled forms yet, so the per-form buttons are covered by unit tests with a manifest fixture. Definitions need the Worker to reach Wiktionary and are not checked.


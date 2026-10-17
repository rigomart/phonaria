# Phonaria feature map

This map describes how to reach features, not a claim that all features pass. The common-word transcription, transcription history, sound-frequency, and Language Spread journeys below have executable verification recipes. Other entries are navigation references awaiting dedicated journeys.

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
| Language Spread | `/language-spread`, header **Language Spread** (behind `FLAG_LANGUAGE_SPREAD`) | Executable journeys below: `language-spread` (flag on) and `language-spread-off` |
| Practice | `/practice`, header **Practice** | Not exercised; controlled by `FLAG_PRACTICE` |
| Credits and theme | `/credits`, footer **Credits**, header **Theme** button (cycles System, Light, Dark) | Not exercised |

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

`submitted` and `restored` require both primary IPAs, input/query `hello world`, enabled visible Copy, and no page alerts. `details` requires the /h/ trigger marked open (`data-details-open`), **Voiceless glottal fricative**, both audio controls, and the diagram element visible. The click on **Details for /h/** opens the compact card; **More about /h/** opens the side panel with the diagram. `cleared` and `escape` require empty input, absent `q`, input focus, no IPA/copy/clear controls, and restored example chips. `draft` proves Escape was tested on a nonempty focused field.

Each observation saves `<checkpoint>-<unique-id>.png`, `<checkpoint>-<unique-id>.snapshot.json`, and its expected/actual values plus evidence paths in `run.json`. Repeated observations retain separate artifacts. Review those images and `diagnostics.json`, then finish with an accurate review note. Evidence is kept under ignored `test-results/verification/`; retain or copy a particular report outside that ignored folder when permanent storage is requested.

### Limits and troubleshooting

This journey covers desktop Chromium, client common-word lookup, shared-query reload, details content, and clearing. It does not test clipboard contents, alternate pronunciation selection, audio playback, media fidelity, server dictionary lookup, spelling, definitions, mobile layout, or performance. Existing CI browser checks remain in `packages/browser-contract`.

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

## Language Spread

"How languages spread" is a scroll story at `/language-spread`, behind `FLAG_LANGUAGE_SPREAD` (on locally, off in production unless set). A map region stays pinned under the 48 px sticky header while 25 story cards scroll over it. The active card is the `<li data-step="<id>">` with `aria-current="step"`. The expected literals come from the story data in `apps/phonaria/src/lib/language-spread/story.ts` and the product requirements, not from importing the app's helpers: 25 steps (intro, africa, out-of-africa, americas, afroasiatic, sino-tibetan, indo-european, sahul-families, bantu, austronesian, southern-asia, uralic, americas-families, oldest-texts, east-asia, lapita, europe, arabic, indian-ocean, steppe, polynesia, americas-late, iberia, empires, today), 49 places, 80 routes, 12 main works.

The [checkpoints](../scripts/language-spread.ts) read the era indicator (`[data-era]`), the tick strip and its `Step N of 25` text, `data-stop` pins (`data-revealed`, inert `<li>`, visible name labels), route paths (`path[pathLength]`, drawn when computed `stroke-dashoffset` is `0px`, counted in one of the three map tiles), the map region's box, its `data-camera`, `data-camera-center` (`lon,lat`) and `data-camera-zoom` (1 means the whole map is as wide as the screen), the details panel `[data-stop-details]`, the card chips, and the sources section.

### Controls

| User control | CLI locator |
| --- | --- |
| Map region | `[role="region"][aria-label^="Map of where languages spread"]` (carries the camera attributes) |
| A story step | `scrollIntoView()` on `[data-step=<id>]`, then wait for the camera |
| A pin | `click '[data-stop="sino-tibetan"]'` (a button; the pin's `<li>` is `inert` until revealed) |
| A card chip | `button[aria-label="Austronesian, show details"]` inside the card's `ul[aria-label="Places on the map"]` |
| Close details | `press Escape`, or **Close Sino-Tibetan**; focus returns to the opener |
| Header link | **Language Spread** in `nav[aria-label="Main"]`, `aria-current="page"` on the page |

### Executable journey (flag on)

Start with `bun run verify init language-spread` and `bun run verify serve "$VERIFY_RUN"`. Keep the display awake first: on a Mac whose display sleeps, headless Chrome's frame clock stops, `requestAnimationFrame` barely runs, scroll steps never change and flights stay "moving" (see the troubleshooting note in the skill). The scroll position, active step and camera all run on animation frames, so wait for the expected state after every scroll instead of sleeping. A flight lasts about 1.1 s; `data-camera` can still read `settled` from the previous step for a moment, so wait on the new camera center, not on `settled` alone. Unlike the other journeys, these recipes do not start a DevTools trace: with tracing on, the trace buffer for this page's composited 3D frames grows until the renderer's main thread does little but record events, and browser commands time out after a few checkpoints.

```bash
caffeinate -u -t 3600 &
HYD="!!document.querySelector('[data-camera=settled]') && Object.keys(document.querySelector('[data-stop]')||{}).some(k=>k.startsWith('__reactProps'))"
# cam W S E N: the camera has landed with its centre inside the step's bounds (degrees).
cam() { echo "(()=>{const r=document.querySelector('[data-camera=settled]');if(!r||!r.dataset.cameraCenter)return false;const [lon,lat]=r.dataset.cameraCenter.split(',').map(Number);return lon>=$1&&lon<=$3&&lat>=$2&&lat<=$4})()"; }
step() { bun run verify browser "$VERIFY_RUN" eval "document.querySelector('[data-step=$1]').scrollIntoView()"; }
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify observe "$VERIFY_RUN" intro

step out-of-africa
bun run verify browser "$VERIFY_RUN" wait --fn "$(cam 20 -40 150 45)"
bun run verify observe "$VERIFY_RUN" out-of-africa

step austronesian
bun run verify browser "$VERIFY_RUN" wait --fn "$(cam 95 -12 160 28)"
bun run verify browser "$VERIFY_RUN" click '[data-stop="sino-tibetan"]'
bun run verify observe "$VERIFY_RUN" earlier-pin-mid-story
bun run verify browser "$VERIFY_RUN" press Escape
bun run verify observe "$VERIFY_RUN" details-closed

bun run verify browser "$VERIFY_RUN" focus '[data-step="austronesian"] ul[aria-label="Places on the map"] button[aria-label="Austronesian, show details"]'
bun run verify browser "$VERIFY_RUN" press Enter
bun run verify observe "$VERIFY_RUN" chip-keyboard
bun run verify browser "$VERIFY_RUN" press Escape

step africa
bun run verify browser "$VERIFY_RUN" wait --fn "$(cam -20 -36 55 38) && Number(document.querySelector('[data-camera]').dataset.cameraZoom)>1"
bun run verify observe "$VERIFY_RUN" scroll-back

step today
bun run verify browser "$VERIFY_RUN" wait --fn "document.querySelector('[data-era]').textContent==='Today' && !!document.querySelector('[data-camera=settled]')"
bun run verify observe "$VERIFY_RUN" today

# Phone: a fresh page at 390 x 844, scrolled to the Bantu step.
bun run verify browser "$VERIFY_RUN" set viewport 390 844
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
step bantu
bun run verify browser "$VERIFY_RUN" wait --fn "$(cam -12 -36 52 16)"
bun run verify observe "$VERIFY_RUN" mobile

# Reduced motion: desktop again, then scroll and require a landed camera within 300 ms.
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" set media light reduced-motion
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "$HYD"
bun run verify browser "$VERIFY_RUN" eval "document.querySelector('[data-step=bantu]').scrollIntoView(); new Promise((ok,fail)=>setTimeout(()=>{const d=document.querySelector('[data-camera]').dataset; d.camera==='settled'&&d.cameraCenter==='20.0,-10.5'?ok('settled within 300 ms'):fail(new Error('not settled: '+JSON.stringify(d)))},300))"
bun run verify observe "$VERIFY_RUN" reduced-motion
```

The `eval` in the last block rejects (the command fails and is logged in `commands.jsonl`) unless the camera has landed on Bantu 300 ms after the scroll; this is the only timing check, since `observe` polls. Use the same origin as `serve` (replace `http://127.0.0.1:3000` for another port or a deployed target).

- `intro` requires path `/language-spread`, h1 **How languages spread**, the header link with `aria-current="page"`, `<meta name="robots" content="noindex, follow">`, era `~70,000 years ago`, step `intro`, **Step 1 of 25**, the 25 step ids in order, 25 ticks, 49 pins and none revealed, 80 routes in a tile and none drawn, the map region within 2 px of the header (top 48, height `innerHeight - 48`), and the **Sources** section with 12 `https` links.
- `out-of-africa` requires era `~60,000 years ago`, revealed pins exactly `humans-in-africa`, `leaving-africa`, `sahul`, name labels shown for the two current pins (**Leaving Africa**, **Reaching Australia**) and hidden for the earlier one, 2 routes drawn per tile (the cumulative total for steps up to this one), a landed camera whose centre is inside the step bounds (20, -40, 150, 45 as west, south, east, north), zoom above 1 (the intro measures 0.54, this step 1.23), and the map still pinned.
- `earlier-pin-mid-story` requires, at `austronesian`, the panel for **Sino-Tibetan** (an earlier step) inside the `aria-live` region: kind and date `Language family, ~7,200–5,900 years ago`, its description, **Roughly the middle Yellow River in northern China, in two dated studies; others favour the eastern Himalaya. The pin marks the general area, not an exact spot.**, **Sources (3)**, a **Close Sino-Tibetan** button, the pin `aria-expanded="true"`, and the era still `~3000 BCE` (clicking an old pin does not move the story). The Bantu pin is off the left edge of the screen at this step (x of about -140), so a pointer cannot reach it; use its card chip to open it.
- `details-closed` requires the panel gone, the pin `aria-expanded="false"`, and focus back on the **Sino-Tibetan** pin after Escape.
- `chip-keyboard` requires Enter on the focused chip **Austronesian, show details** to open the panel for `austronesian` (**Sources (3)**), the chip `aria-expanded="true"` and still focused.
- `scroll-back` requires era `~70,000 years ago`, step `africa`, revealed pins exactly `humans-in-africa`, the later `sahul` and `bantu` pins' `<li>` still `inert` and not revealed, 0 routes drawn (the intro and africa have none), and a landed camera centred inside africa's bounds (-20, -36, 55, 38) with zoom above 1. The intro's world view also has a centre inside those bounds, which is why the zoom is checked too.
- `today` requires era `Today`, **Step 25 of 25**, all 49 pins revealed, 80 routes drawn, and all 25 ticks filled.
- `mobile` requires, at 390 × 844 on `bantu`, the map pinned, the active card within 40 px of the bottom edge, the era indicator in the top 160 px, and the Bantu pin on screen above the card's top edge. The desktop nav is hidden at this width, so the nav is not asserted.
- `reduced-motion` requires `prefers-reduced-motion` matched, era `~3000 BCE`, step `bantu`, a landed camera inside Bantu's bounds (-12, -36, 52, 16), and computed `transition-property: none` on the first route path and the Bantu pin. The computed `transition-duration` stays at its default (0.9 s and 0.4 s) because `motion-reduce:transition-none` removes the property rather than zeroing the duration.

### Flag off

The flag is read when the server starts, so this journey needs its own run and its own server. Stop the flag-on server first (or pick another port in `init`).

```bash
caffeinate -u -t 3600 &
bun run verify init language-spread-off
FLAG_LANGUAGE_SPREAD=0 bun run verify serve "$VERIFY_RUN"
bun run verify browser "$VERIFY_RUN" open about:blank
bun run verify browser "$VERIFY_RUN" set viewport 1280 800
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/language-spread
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('h1')"
bun run verify observe "$VERIFY_RUN" not-found
bun run verify browser "$VERIFY_RUN" open http://127.0.0.1:3000/
bun run verify browser "$VERIFY_RUN" wait --fn "!!document.querySelector('nav[aria-label=Main] a')"
bun run verify observe "$VERIFY_RUN" nav-hidden
```

`not-found` requires, on `/language-spread`, HTTP status 404 (from the navigation timing entry, so the page must be opened directly, not reached by a link), the shared **This page doesn't exist** h1, no map region or pins, and main nav labels exactly **Transcription**, **IPA Chart**, **Practice**. `nav-hidden` requires the same labels on `/`, all visible, and no `a[href="/language-spread"]` anywhere in the page. Practice is on in local dev unless `FLAG_PRACTICE=0` (checked: a dev server started with only `FLAG_LANGUAGE_SPREAD=0` shows all three). The journey cannot tell whether the server really had the flag off; it only sees its effects.

### Limits

Chromium only, with the page flag on or off as noted. The camera is checked as a centre inside the step's bounds and a zoom above 1, not as a pixel position; pin placement, the map art, the tilt and visual quality are judged from the saved screenshots. No frame rate or flight smoothness is measured. Only intro, africa, out-of-africa, austronesian, bantu and today are visited, and place descriptions are read from the page, not checked against the cited studies. Route drawing is read from `stroke-dashoffset`, not from painted pixels. No DevTools trace is saved (see above). Phone coverage is one step; the mobile menu and landscape are not opened.

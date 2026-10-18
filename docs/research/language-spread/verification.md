# Language spread: verification record

Browser verification of `/language-spread` with the verify-phonaria skill, run on 2026-10-17 against a local dev server. The full evidence (checkpoint screenshots, page snapshots, `diagnostics.json`, `commands.jsonl`, `server.log`, and `report.md`/`report.json`) is under the git-ignored `test-results/verification/<run>/` in the checkout where the runs were made. This file records the outcomes so they survive outside that folder.

The journeys, their checkpoints and their limits are described in [the feature map](../../../.agents/skills/verify-phonaria/references/feature-map.md#language-spread).

## The globe and the story of English

These runs cover the current page: the 11-step story of English on a canvas globe that the reader can drag, with cards that enter at each step's placement as the globe reveals the step, and an era dial with Previous and Next buttons. All were made on the uncommitted working tree on `ceaddbc`, in headless Chrome through agent-browser 0.38.1, with the display kept awake by `caffeinate -u`. The latest runs used port 3008, since the owner's dev server held 3000.

| Run | Journey | Revision | Result |
| --- | --- | --- | --- |
| `1792286704816-79889` | `language-spread` (flag on) | uncommitted on `ceaddbc` | Passed: all 31 checkpoints, at 1280 × 800, at 390 × 844 and with reduced motion, with no browser errors, console errors or failed requests. This is the pre-ship run, after a cleanup pass renamed symbols in the app and the journey with no behaviour change. The same 31 checkpoints passed before the renames in `1792285299813-60102`, the first run on the code with the search title and share metadata, the indexing-aware robots tag, the sitemap entry and the spin at today. Earlier passes on earlier code: `1792284085122-3521` (25 checkpoints, drag and Recenter), `1792281080266-72843` (16), `1792280875653-65392` (16), `1792280267755-54082` (15) and `1792279978990-47549` (14) |
| `1792286769400-82431` | `language-spread-off` (`FLAG_LANGUAGE_SPREAD=0`) | uncommitted on `ceaddbc` | Passed: the pre-ship run, after the renames. `/language-spread` returns 404 with the shared not-found page, the nav has no Language Spread link, and the sitemap leaves the page out. Earlier passes are `1792285697020-65515` (before the renames), `1792284162177-4430` and `1792280111191-48175` |

The flag-on run included the code review fixes made while this journey was written: inactive cards keep their text for screen readers with only their chips and sources inert, Previous and Next announce the step and move focus to the new card, and focus moves to the active card when a focused pin goes behind the globe.

Checkpoints in the flag-on run, in order:

| Checkpoint | Viewport | What it showed |
| --- | --- | --- |
| `intro` | 1280 × 800 | Title **The history of English, from Old English to today - Phonaria** and h1 **The story of English**, `noindex, follow` (local indexing is off), `og:type` `article` with the page's title, description and 1200 × 630 image, a large Twitter card, one Article JSON-LD with 28 citations, era `~4000 BCE`, Step 1 of 11, 11 ticks, 9 pins with none revealed, no arrows drawn, the whole globe (zoom below 1), the intro card visible and centred on the left, the other 10 cards transparent, Previous disabled, and 9 sources |
| `next-step` | 1280 × 800 | Enter on the focused Next step button moved to `indo-european`, showed its card, announced **Step 2 of 11, ~4000 BCE: One ancestor, many languages** in the dial's status region, and put focus on that card |
| `previous-step` | 1280 × 800 | Enter on the focused Previous step button went back to the intro, announced **Step 1 of 11, ~4000 BCE: The story of English**, and put focus on the intro card |
| `near-flight` | 1280 × 800 | Old English to the Vikings never zoomed out below either end, so the camera did not pull back |
| `near-move` | 1280 × 800 | Vikings: era `~800 CE`, 4 pins revealed, 5 arrows, camera inside the step's bounds and zoomed in, the card at the bottom right, the Old English card transparent with its chips inert, and the Old Norse pin clear of the card and the dial |
| `drag-mid-story` | 1280 × 800 | A 150 px mouse drag at the Vikings step turned the globe, which glided and settled on a new centre, and **Recenter on this step** appeared |
| `drag-flight` | 1280 × 800 | Next then flew from the dragged view, every pin starting within 10 px of where the drag left it, without a dip |
| `after-drag-next` | 1280 × 800 | The flight landed on the Norman Conquest (`~1066 CE`), its card showed, and the Recenter button was gone |
| `earlier-pin-mid-story` | 1280 × 800 | At the printing step, clicking the Old Norse pin opened its details in the live region without moving the story |
| `details-closed` | 1280 × 800 | Escape closed the details and returned focus to the Old Norse pin |
| `globe-click-closes-details` | 1280 × 800 | With Old Norse open again, a mouse press and release on empty globe closed the details without moving the camera |
| `off-map-pins` | 1280 × 800 | At printing, the steppe pin far off the right edge was hidden and inert, Tab from the header's theme button landed on another pin wholly inside the map, and the map did not scroll sideways |
| `atlantic-flight` | 1280 × 800 | Printing to America zoomed straight out from England with no dip |
| `atlantic` | 1280 × 800 | America: era `~1607 CE`, the Jamestown pin revealed and clear of the card, 7 arrows, the card at the bottom left, the printing card transparent, and focus still on the Old Norse pin, which is on the near side |
| `far-flight` | 1280 × 800 | America to Around the world pulled back below zoom 1, the whole globe, then landed above 1 |
| `far-move` | 1280 × 800 | Around the world: era `~1788 CE`, all 9 pins revealed, 8 arrows, the card at the top right, the Sydney pin clear of it, the London and Jamestown pins hidden and unreachable behind the globe, and focus on the card: the focused Old Norse pin went behind the globe and handed it over |
| `scroll-back` | 1280 × 800 | Scrolling back to Germanic left only its 2 pins revealed, hid the later Old English and Jamestown pins again, and dropped the drawn arrows from 8 to 1 |
| `fast-scroll` | 1280 × 800 | On a fresh page, scrolling from Germanic to Today over 24 frames passed through 9 active steps, and only the Germanic and Today cards ever became visible |
| `today` | 1280 × 800 | Era `Today`, Step 11 of 11, all 9 pins and 8 arrows, all 11 ticks filled, the whole globe, Next disabled |
| `spin-today` | 1280 × 800 | With the mouse off the globe, the map read `data-spinning` while the camera attributes kept the landing `10.0,11.0`, and a pin moved |
| `spin-hover` | 1280 × 800 | Hovering the globe stopped the spin |
| `drag-held` | 1280 × 800 | With the mouse still down after a 140 px move at Today, the map read `data-camera="dragging"` |
| `drag-released` | 1280 × 800 | After release the globe glided and settled on a new centre, with the Recenter button shown |
| `recentered` | 1280 × 800 | Clicking Recenter flew back to Today's latitude, `11.0`, at a longitude the spin had turned west of `10.0`, and hid the button |
| `spin-sources` | 1280 × 800 | Once the spin had resumed, scrolling down to the sources stopped it |
| `left-today` | 1280 × 800 | With the spin running again, going back to Around the world stopped it |
| `sitemap` | 1280 × 800 | The sitemap lists the five indexable pages and `/language-spread` |
| `mobile` | 390 × 844 | Vikings on a phone: the card across the bottom, the dial across the top, and the Old Norse pin between them |
| `phone-spin` | 390 × 844 | A swipe 120 px left and 60 px up, sent as synthetic touch pointer events, turned the globe east with its latitude unchanged; the canvas has `touch-action: pan-y pinch-zoom`, leaving vertical swipes to the page |
| `reduced-motion` | 1280 × 800 | With reduced motion the camera landed on the Vikings step, arrows drawn and card shown, within 300 ms of the scroll, with no card animation or pin transition |
| `reduced-no-spin` | 1280 × 800 | With reduced motion, `data-spinning` never appeared in 3.5 s at Today |

The flights are measured from where the pins are drawn on every frame, since the page writes its zoom only when the camera lands. In an exploration session before the runs, at 1280 × 800, the zoom went from 6.20 to 5.55 on the near move, from 15.56 down to 1.53 on the way to America, and from 1.53 down to 0.88 and back up to 1.06 on the far move. The recovered camera centres matched `data-camera-center` on landing.

The Playwright browser contract ran in full against the flag-on server of run `1792285299813-60102` with `CONTRACT_TARGET=local` and `CONTRACT_BASE_URL=http://127.0.0.1:3008`: 42 passed, 10 skipped, 8 failed. The Language Spread spec and the metadata spec passed, including the sitemap listing `/language-spread`, once `CONTRACT_CANONICAL_ORIGIN=http://127.0.0.1:4173` matched the `SITE_URL` in this checkout's `.dev.vars`; the local target expects `http://localhost:3000`. Seven transcription tests failed because the server lookup has no database here (`Database is unavailable` in `server.log`). `toggles diphthongs on the vowel chart` failed because it clicks **Show diphthongs**, while the committed vowel chart has a **Diphthongs** button. Neither is part of this page. The flag-off Language Spread checks passed against the flag-off server of run `1792285697020-65515` with `CONTRACT_TARGET=cloudflare-production` (2 passed, 3 skipped).

### Findings

- Printing to America is not a far move. America's camera frames the whole North Atlantic (-90 to 5 degrees of longitude), so the camera only zooms out from England and lands at about 1.5 over the mid-Atlantic, not near Virginia. The pull-back to the whole globe happens on the next step, America to Around the world. The unit tests check England to Virginia with a tighter Virginia frame than the story uses.
- In run `1792280875653-65392`, Tab from the theme button at printing focused the Germanic pin, drawn at x 1299 to 1381, wholly outside the 1269 px map, so its focus couldn't be seen (`tab-lands-on-offscreen-germanic` capture). The off-map rule now measures each pin head, and run `1792281080266-72843` confirms Tab lands on a pin inside the map.
- After Escape returns focus to a pin, the pin keeps its focus ring and name label on later steps until focus moves on. That is expected focus behaviour, but it shows in the America screenshot.
- After hydration, every page checked (`/language-spread`, `/`, `/credits`, `/ipa-chart/frequency`) gains a second `og:url`, `og:image`, `twitter:image` and canonical link using `http://localhost:3000`, next to the server-rendered ones using `SITE_URL` (`http://127.0.0.1:4173` here). The server HTML has one of each, so the client builds its head with a different origin and adds tags instead of replacing them. It is site-wide and may only show when `SITE_URL` differs from the client's default; the journey's image check accepts either origin.
- On the phone, after the touch swipe, the Old Norse pin's name is cut off at the map's left edge. The off-map rule keeps a pin while at least half its head fits, so this is expected, but it shows in the `phone-spin` screenshot.
- After any synthetic key press, headless Chrome here runs almost no page tasks (1 to 80 MessageChannel tasks in 500 ms instead of about 300,000) while a script runs every animation frame. This happened on `/credits` and `about:blank` too, and a page load clears it. React then can't commit step changes during a scripted scroll, which failed `fast-scroll` twice before it moved to a fresh page. It comes from the browser automation, not the app.
- In the screenshot taken right after opening details, the panel is still in its entrance animation, as on the earlier page.

### Earlier runs, kept as evidence

| Run | Result | What happened |
| --- | --- | --- |
| `1792279316865-39750` | Failed, 11 of 14 checkpoints passed | The journey measured card placement against the window, but the page's 11 px scrollbar narrows the map region and the fixed card frame to 1269 px. The cards sat 24 px inside the region as designed. The journey now measures against the region. The app's review fixes landed during this run |
| `1792280074932-48011` | Blocked, both checkpoints passed | The flag-off recipe in the feature map did not start a trace, and this journey requires one. The recipe now starts it |
| `1792283284799-93649` | Failed, 24 of 26 checkpoints passed | `atlantic-flight` compared a fitted camera centre, which England's tight cluster of pins can't fix once off-map pins are hidden; the journey now compares pin positions. `fast-scroll` was time-based and ran in two frames; it now counts frames. No in-between card showed |
| `1792283496957-96162` | Failed, 25 of 26 checkpoints passed | `fast-scroll`: the page scrolled every frame but the active step didn't change until the scroll ended |
| `1792283660448-98764` | Failed, 25 of 26 checkpoints passed | Same `fast-scroll` failure, with a per-frame log. The investigation in this session traced it to the key-press effect in Findings |

## Retired: the world story on the flat map

Everything below covers the earlier version of the page: the 25-step world story over a tilted flat SVG map. It is kept as a record; that page no longer exists.

### Final runs

| Run | Journey | Revision | Result |
| --- | --- | --- | --- |
| `1792267449968-43728` | `language-spread` (flag on) | `920fddf` | Passed: all 9 checkpoints, at 1280 × 800, at 390 × 844 and with reduced motion. This is the last code change (the unblurred cards); later commits only update these records. Earlier passes are on `d3d0579` (`1792267091900-41437`) and `2866327` (`1792262893730-3216`). An earlier pass on `2b32408` is `1792262234154-90253`, and one on `52c9ad5` is `1792262804141-2352`. After that run, the phone's top inset was raised so pins clear the era indicator |
| `1792267042875-40964` | `language-spread-off` (`FLAG_LANGUAGE_SPREAD=0`) | `eab1521` | Passed: `/language-spread` returns 404 with the shared not-found page, and the nav has no Language Spread link. An earlier pass on `a975e12` is `1792262388621-92381` |

Checkpoints in the flag-on run: `intro`, `out-of-africa`, `earlier-pin-mid-story` (opening the Sino-Tibetan pin while on the Austronesian step), `details-closed` (Escape returns focus to the pin), `chip-keyboard`, `scroll-back` (later pins hidden again, arrows undrawn, camera back on Africa), `today` (all 49 pins and 80 arrows), `mobile` and `reduced-motion` (the camera lands within 300 ms). Neither run had browser errors, console errors or unexpected failed requests.

The Playwright browser contract (`packages/browser-contract/e2e/language-spread.spec.ts`) also passed against the local target: the enabled-flag checks for the nav link, the map and era on load, and the era advancing on scroll. Its disabled-flag checks (the 404 and the hidden nav link) passed against the same flag-off server on `eab1521`, run with the production target and `CONTRACT_BASE_URL=http://127.0.0.1:3001`.

### Earlier runs, kept as evidence

| Run | Result | What happened |
| --- | --- | --- |
| `1792260850021-61344` | Blocked after 5 passing checkpoints | Launched with `--disable-gpu-vsync,--disable-frame-rate-limit`. The uncapped renderer ran at full CPU and browser commands timed out |
| `1792261166851-63273` | Blocked after `intro` | The full-page screenshot stretched the pinned map to the document height (about 30,000 px) and timed out. Journeys can now ask for viewport screenshots |
| `1792261352903-65379` | Blocked after 5 passing checkpoints | Sampling the renderer showed its main thread busy recording DevTools trace events. The same steps landed in 5 s without a trace, so this journey now declares that it skips the trace |
| `1792261989225-81466` | Blocked, all 9 checkpoints passed | The helper refused a pass without a trace; the skip had not been declared yet |
| `1792262303776-91865` | Failed, both checkpoints passed | The page's expected 404 was counted as a failed request. Journeys can now declare expected responses |

### Environment notes

- On a Mac, headless Chrome's frame clock follows the display's vsync. When the display sleeps, `requestAnimationFrame` stops and the story never advances. Keeping the display awake with `caffeinate -u` fixed it with the default launch flags.
- In the screenshots taken right after a click, the details panel is still in its 350 ms entrance animation, so the map shows through it. A separate live check 1.5 s after the click showed the panel fully opaque and on top.

### Performance

These checks were made in the same headless Chrome (software rendering, Apple Silicon); they are not a phone measurement:

- No main-thread long tasks over 50 ms at any step change, forward or back, at 1280 × 800 or at 390 × 844.
- With the frame rate uncapped, a camera flight cost well under 1 ms of main-thread time per frame at 1280 × 800, and about 5 ms at 390 × 844.
- Emulated mid-range phone: a production build in Playwright's Chromium at 390 × 844 with 3× pixel density and the CPU throttled 4× (Lighthouse's mobile setting), flying through 9 steps forward and back. Median frame 16.6 ms (60 fps), 95th percentile 33.4 ms, 5% of frames over 33 ms, and one long task per step change, at most about 92 ms. A timeline trace of one step change put its slowest task at about 41 ms, mostly style recalculation as transitions start and the per-frame stroke scale updates the SVG. Memoizing the cards, pins and routes made no measurable difference, so it was not kept.
- The same throttled run at 1280 × 800 had a median of 17.5 ms but a 95th percentile of about 49 ms; 19% of frames ran over 33 ms. Removing the backdrop blur from the cards and era dial cut that to a median of 16.6 ms, a 95th percentile of 41 ms and 9.5% of frames over 33 ms. On the phone, slow frames fell to 4.4%. The blur was dropped, and the glass made more opaque so text stays legible over the map.
- No real phone has been measured, and GPU raster is software-emulated in these runs.

To keep the map light, the tilted plane is sized to cover the screen exactly (`plane.ts`), nothing on or over the map uses a backdrop blur, and nothing animates while the page is idle.

### Independent code review

A model from another provider (Codex, GPT-6.1-Sol) reviewed the diff from `10fb05d` read-only. All findings were fixed:

| Finding | Fix |
| --- | --- |
| Staging and preview built with the flag off: Vite inlines it at build time, and Wrangler vars never reach the bundle | Every deploy workflow and the manual staging deploy set `FLAG_LANGUAGE_SPREAD` to match its Worker; `flag-config.test.ts` keeps them in step |
| A resize during a camera flight was overwritten by the flight, which landed at the old scale | The resize cancels the flight and settles on the new fit |
| Scrolling back could make the focused pin inert and lose keyboard focus | Focus moves to the active card; closing details falls back to it |
| Opening a card's sources on a phone left the camera framing stale | The active card's height is observed and the camera refits |

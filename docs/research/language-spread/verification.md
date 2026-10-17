# Language spread: verification record

Browser verification of `/language-spread` with the verify-phonaria skill, run on 2026-10-17 against a local dev server. The full evidence (checkpoint screenshots, page snapshots, `diagnostics.json`, `commands.jsonl`, `server.log`, and `report.md`/`report.json`) is under the git-ignored `test-results/verification/<run>/` in the checkout where the runs were made. This file records the outcomes so they survive outside that folder.

The journeys, their checkpoints and their limits are described in [the feature map](../../../.agents/skills/verify-phonaria/references/feature-map.md#language-spread).

## Final runs

| Run | Journey | Revision | Result |
| --- | --- | --- | --- |
| `1792267091900-41437` | `language-spread` (flag on) | `d3d0579` | Passed: all 9 checkpoints, at 1280 × 800, at 390 × 844 and with reduced motion. This was run on the latest commit before this record was added. An earlier pass on `2866327` is `1792262893730-3216`. An earlier pass on `2b32408` is `1792262234154-90253`, and one on `52c9ad5` is `1792262804141-2352`. After that run, the phone's top inset was raised so pins clear the era indicator |
| `1792267042875-40964` | `language-spread-off` (`FLAG_LANGUAGE_SPREAD=0`) | `eab1521` | Passed: `/language-spread` returns 404 with the shared not-found page, and the nav has no Language Spread link. An earlier pass on `a975e12` is `1792262388621-92381` |

Checkpoints in the flag-on run: `intro`, `out-of-africa`, `earlier-pin-mid-story` (opening the Sino-Tibetan pin while on the Austronesian step), `details-closed` (Escape returns focus to the pin), `chip-keyboard`, `scroll-back` (later pins hidden again, arrows undrawn, camera back on Africa), `today` (all 49 pins and 80 arrows), `mobile` and `reduced-motion` (the camera lands within 300 ms). Neither run had browser errors, console errors or unexpected failed requests.

The Playwright browser contract (`packages/browser-contract/e2e/language-spread.spec.ts`) also passed against the local target: the enabled-flag checks for the nav link, the map and era on load, and the era advancing on scroll. Its disabled-flag checks (the 404 and the hidden nav link) passed against the same flag-off server on `eab1521`, run with the production target and `CONTRACT_BASE_URL=http://127.0.0.1:3001`.

## Earlier runs, kept as evidence

| Run | Result | What happened |
| --- | --- | --- |
| `1792260850021-61344` | Blocked after 5 passing checkpoints | Launched with `--disable-gpu-vsync,--disable-frame-rate-limit`. The uncapped renderer ran at full CPU and browser commands timed out |
| `1792261166851-63273` | Blocked after `intro` | The full-page screenshot stretched the pinned map to the document height (about 30,000 px) and timed out. Journeys can now ask for viewport screenshots |
| `1792261352903-65379` | Blocked after 5 passing checkpoints | Sampling the renderer showed its main thread busy recording DevTools trace events. The same steps landed in 5 s without a trace, so this journey now declares that it skips the trace |
| `1792261989225-81466` | Blocked, all 9 checkpoints passed | The helper refused a pass without a trace; the skip had not been declared yet |
| `1792262303776-91865` | Failed, both checkpoints passed | The page's expected 404 was counted as a failed request. Journeys can now declare expected responses |

## Environment notes

- On a Mac, headless Chrome's frame clock follows the display's vsync. When the display sleeps, `requestAnimationFrame` stops and the story never advances. Keeping the display awake with `caffeinate -u` fixed it with the default launch flags.
- In the screenshots taken right after a click, the details panel is still in its 350 ms entrance animation, so the map shows through it. A separate live check 1.5 s after the click showed the panel fully opaque and on top.

## Performance

These checks were made in the same headless Chrome (software rendering, Apple Silicon); they are not a phone measurement:

- No main-thread long tasks over 50 ms at any step change, forward or back, at 1280 × 800 or at 390 × 844.
- With the frame rate uncapped, a camera flight cost well under 1 ms of main-thread time per frame at 1280 × 800, and about 5 ms at 390 × 844.
- Emulated mid-range phone: a production build in Playwright's Chromium at 390 × 844 with 3× pixel density and the CPU throttled 4× (Lighthouse's mobile setting), flying through 9 steps forward and back. Median frame 16.6 ms (60 fps), 95th percentile 33.4 ms, 5% of frames over 33 ms, and one long task per step change, at most about 92 ms. A timeline trace of one step change put its slowest task at about 41 ms, mostly style recalculation as transitions start and the per-frame stroke scale updates the SVG. Memoizing the cards, pins and routes made no measurable difference, so it was not kept.
- The same throttled run at 1280 × 800 had a median of 17.5 ms but a 95th percentile of about 49 ms; 19% of frames ran over 33 ms. Removing the backdrop blur from the cards and era dial cut that to a median of 16.6 ms, a 95th percentile of 41 ms and 9.5% of frames over 33 ms. On the phone, slow frames fell to 4.4%. The blur was dropped, and the glass made more opaque so text stays legible over the map.
- No real phone has been measured, and GPU raster is software-emulated in these runs.

To keep the map light, the tilted plane is sized to cover the screen exactly (`plane.ts`), nothing on or over the map uses a backdrop blur, and nothing animates while the page is idle.

## Independent code review

A model from another provider (Codex, GPT-6.1-Sol) reviewed the diff from `10fb05d` read-only. All findings were fixed:

| Finding | Fix |
| --- | --- |
| Staging and preview built with the flag off: Vite inlines it at build time, and Wrangler vars never reach the bundle | Every deploy workflow and the manual staging deploy set `FLAG_LANGUAGE_SPREAD` to match its Worker; `flag-config.test.ts` keeps them in step |
| A resize during a camera flight was overwritten by the flight, which landed at the old scale | The resize cancels the flight and settles on the new fit |
| Scrolling back could make the focused pin inert and lose keyboard focus | Focus moves to the active card; closing details falls back to it |
| Opening a card's sources on a phone left the camera framing stale | The active card's height is observed and the camera refits |

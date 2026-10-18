# Language spread: handoff

State of the Language Spread page as of 2026-10-17, for whoever picks it up next.

## Where it is

- Branch `t3/language-spread-atlas`. The globe and English story are uncommitted work on top of `ceaddbc`, the last commit of the world story on the flat map. Nothing is pushed, there is no upstream and no PR.
- `bun lint:check`, `bunx tsc --noEmit` and the language spread tests pass. The verify journeys and the Playwright contract pass locally; see [verification.md](verification.md).
- The page lives at `/language-spread`, behind `FLAG_LANGUAGE_SPREAD`: on in local development, staging and preview, off in production. When the flag is off, the route returns 404 and the "Language Spread" header link is hidden. When it is on, the page follows the site-wide indexing setting (indexed in production, `noindex` on staging and preview) and is listed in the sitemap.

## What the page is

A scroll-driven story of English, in 11 steps with 9 pins: its Indo-European ancestor, the Germanic branch, settlers crossing the North Sea, the Vikings, the Norman Conquest, the Great Vowel Shift, printing in London, Jamestown, Sydney and the world, and English today. The story sits over a globe. Scrolling moves the camera to each step's region: a short move pans and zooms, while a long one pulls back to about the whole globe, turns, and zooms in again. Arrows draw along smooth curves, and pins stand on the globe and hide when they turn behind it. Scrolling back reverses all of it.

The globe can be dragged in every step: mouse and pen turn it freely, touch spins it east–west so vertical swipes still scroll, and a Recenter button flies back to the step's framing once the reader has moved away. The next step flies from wherever the globe was left.

Each step's card is fixed over the globe and fades in where the step places it (left or right side, top, middle or bottom), so it never covers that step's places; on phones it sits at the bottom. The outgoing card leaves at once, and the next one enters when the globe starts revealing its step (`onReveal`, about 60% into a flight), so it lands with its pins and arrows. An era dial at the top has one tick per step and Previous/Next buttons, which announce the new step to screen readers and move focus to its card. Any revealed pin opens a panel with its description, rough area and sources. Reduced motion skips the flights and the drawing.

## Why it changed

The owner found the world story hard to follow across so many branches, so the page now follows one language. The tilted flat map became a globe, the camera pans only for short moves and zooms out and back in for long ones, cards fade instead of scrolling into view, and the text is smaller throughout. The world story's research is kept: the regional notes and the retired tables in [README.md](README.md) still record every claim and source, for future stories about other languages.

## File map

| Path | What it holds |
| --- | --- |
| `apps/phonaria/src/lib/language-spread/story.ts` | All content: `STOPS`, `STEPS` (cards, card placement, camera bounds, routes), `SOURCES`, `MAIN_SOURCES` |
| `…/language-spread/types.ts`, `era.ts`, `metadata.ts`, `structured-data.ts` | Story types (`CardPlacement`; `StopKind` includes `change` for the vowel shift); date formatting; search title, description and social image; the `Article` JSON-LD built from the story |
| `…/language-spread/sphere.ts`, `camera.ts`, `tween.ts`, `drag.ts` | Spherical maths, fitting a region into the area the cards leave free, flights (near or far, great-circle turns, zoom pull-back), and drag-to-rotate with its glide |
| `…/language-spread/route-path.ts`, `scene.ts` | Arrows as centripetal Catmull-Rom curves on the sphere, sampled once; how much of each step's arrows and areas is drawn |
| `…/language-spread/land.ts`, `land-codec.ts`, `world-land.ts` | Land polygons, their compact encoding, and the generated Natural Earth 1:50m data at two levels of detail (`apps/phonaria/scripts/generate-world-map.ts`, about 96 KB, 67 KB gzipped) |
| `…/language-spread/covered-insets.ts`, `scroll-step.ts` | The area cards and the dial cover, for the camera; the scroll-to-step mapping |
| `apps/phonaria/src/components/language-spread/` | `language-spread-content.tsx` (layout, focus, announcements), `story-card.tsx`, `story-timeline.tsx` (era dial), `stop-details.tsx` (details panel and pin marks), `spread-map.tsx` (globe and pins), `use-globe.ts` (rAF loop, flights, dragging and recentering, resize, theme and pixel-density changes), `globe-painter.ts` (canvas drawing), `use-active-step.ts` |
| `apps/phonaria/src/routes/language-spread.tsx` | Route and flag gate |
| `apps/phonaria/public/og/language-spread.jpg` | Social card (1200 × 630): the Atlantic step in the dark theme with the title, captured from the page |
| `packages/ui/src/styles/globals.css` | `--map-*` tokens (land, water, space, graticule, atmosphere, limb, routes), `--glass*` and `--shadow-float` |
| `docs/research/language-spread/` | [english.md](english.md) for this story, the regional notes for the world story, the `README.md` index with both fact-check records, and [verification.md](verification.md) |
| `.agents/skills/verify-phonaria/scripts/language-spread.ts` | `language-spread` (25 checkpoints) and `language-spread-off` journeys; recipes are in `references/feature-map.md` |
| `packages/browser-contract/e2e/language-spread.spec.ts` | Playwright contract; targets declare `languageSpreadEnabled` |

The flag is set in `src/lib/flags.ts`, `vite.config.mts` (a build-time define), `wrangler.jsonc`, every `.github/workflows/*` build and `scripts/deploy-staging.ts`. It is inlined when the app is built, so a deployed environment needs it in its build environment as well as in its Worker vars. `flag-config.test.ts` keeps these in step.

## Things to know before changing it

- **Data integrity tests.** `story.test.ts` requires every stop to appear in exactly one step, steps to be in time order by their start date, every stop and source to be cited and used, every id to be listed in the research index, and copy to stay within length limits. The step and stop tables in `README.md` were generated from `story.ts`; regenerate them whenever steps or stops change.
- **Time order.** Ranges order by their start, which is why the Great Vowel Shift (from about 1400) comes before printing (1476). Its card points ahead to printing as the reason spelling stopped following the sounds.
- **Card placement.** Each step's `card` and `camera` values were tuned in a browser at 1280 × 800 and 390 × 844 so the card, dial and details panel stay clear of that step's places. Recheck both sizes after changing either.
- **Near and far moves.** A move is far when its distance is more than 1.5 times the visible radius of the more zoomed-out view; then the camera pulls back to about the whole globe mid-flight. In this story only america → around-the-world pulls back. Printing → america just zooms out, because the america step frames the whole Atlantic crossing.
- **Coastline detail.** The fine 1:50m coastline holds up to about the England framing. A step framed tighter than that, such as London alone, would need a regional higher-detail inset.
- **No backdrop blur** on or over the globe: it roughly doubled slow frames on the flat map. The cards and dial use a mostly opaque `--glass`.
- **Browser verification on this Mac.** Keep the display awake (`caffeinate -u -t 3600 &`) or headless Chrome produces no animation frames. Don't start a DevTools trace for this page, and use viewport screenshots. The journey already declares this, and `SKILL.md` explains why.

## Open questions

- Nothing is committed. The work could ship as one commit, or as separate ones for the globe engine, the cards and the English story.
- The globe hasn't been measured on a real phone, nor under CPU throttling as the flat map was. In local headless Chrome the median and 95th-percentile frame were 16.7 ms at both sizes, with no long tasks.
- English in India and Africa has no step, because no dated source was found ([english.md](english.md) lists what was tried).

## How to look at it

```bash
bun install
bun run dev   # http://localhost:3000/language-spread
```

To run the verify journeys, follow the "Language Spread" section of `.agents/skills/verify-phonaria/references/feature-map.md`. Results of past runs are in [verification.md](verification.md); their raw evidence is in the git-ignored `test-results/verification/`.

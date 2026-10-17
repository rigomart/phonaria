# Language spread: handoff

State of the Language Spread page as of 2026-10-17, for whoever picks it up next. The owner plans to shift the page's direction, so read this as a description of what exists and of what will survive any rework, not as a plan.

## Where it is

- Branch `t3/language-spread-atlas`, 14 local commits on top of `10fb05d`, the last one adding this handoff. Nothing is pushed, there is no upstream and no PR.
- `bun lint:check`, `bun check-types` and `bun run test` all pass on the last commit.
- The page lives at `/language-spread`, behind `FLAG_LANGUAGE_SPREAD`: on in local development, on in staging and preview, off in production. When the flag is off, the route returns 404 and the "Language Spread" header link is hidden.

## What the page is

A scroll-driven story of how languages spread, in 25 steps with 49 pins. It runs from modern humans leaving Africa (and the plain statement that nobody knows where or when language began) through language families worldwide and colonial spread to today. Story cards scroll over a pinned map, which is tilted in 3D like a tabletop atlas. Scrolling flies the camera to each region, draws spread arrows and stands up pins, and scrolling back reverses it. Any revealed pin opens a panel with its description, its rough area and its sources. An era readout with one tick per step stays visible. Reduced motion skips the flights and the drawing.

## File map

| Path | What it holds |
| --- | --- |
| `apps/phonaria/src/lib/language-spread/story.ts` | All content: `STOPS`, `STEPS` (cards, camera bounds, routes), `SOURCES`, `MAIN_SOURCES` |
| `…/language-spread/types.ts`, `era.ts` | Story types; date ranges and formatting (`~4000 BCE`, "no agreed date") |
| `…/language-spread/projection.ts`, `world-land.ts` | Gall stereographic projection, and the generated Natural Earth land path (`apps/phonaria/scripts/generate-world-map.ts`) |
| `…/language-spread/camera.ts`, `plane.ts`, `route-path.ts`, `scroll-step.ts` | Pure logic: fitting regions into the area the cards leave free, flights, map copies across the Pacific, tilted-plane size, arrow curves, the scroll-to-step mapping |
| `apps/phonaria/src/components/language-spread/` | `language-spread-content.tsx` (layout, cards, sources, focus), `spread-map.tsx` (map, pins, era dial, details), `use-map-camera.ts` (rAF flights writing straight to the DOM), `use-active-step.ts` |
| `apps/phonaria/src/routes/language-spread.tsx` | Route and flag gate |
| `packages/ui/src/styles/globals.css` | `--map-*`, `--glass*` and `--shadow-float` tokens |
| `docs/research/language-spread/` | Research notes per region, the `README.md` index (every step and stop mapped to notes and sources, plus the fact-check record), and `verification.md` |
| `.agents/skills/verify-phonaria/scripts/language-spread.ts` | `language-spread` and `language-spread-off` journeys; recipes are in `references/feature-map.md` |
| `packages/browser-contract/e2e/language-spread.spec.ts` | Playwright contract; targets declare `languageSpreadEnabled` |

The flag is set in `src/lib/flags.ts`, `vite.config.mts` (a build-time define), `wrangler.jsonc`, every `.github/workflows/*` build and `scripts/deploy-staging.ts`. It is inlined when the app is built, so a deployed environment needs it in its build environment as well as in its Worker vars. `flag-config.test.ts` keeps these in step.

## What carries over to a new direction

- **Research.** Every claim has per-claim citations, weak claims are marked, and the copy went through an independent fact-check whose findings were all applied. Ethnologue figures were confirmed from archived copies of its own pages.
- **Map engine.** The projection, map copies, camera fitting and flights work independently of the tilted presentation and of the story data, and are covered by unit tests.
- **Gating, contract and verify journeys.** These change only if the route or flag name changes.

## Things to know before changing it

- **Data integrity tests.** `story.test.ts` requires every stop to appear in exactly one step, steps to be in time order, every stop and source to be cited and used, every id to be listed in the research index, and copy to stay within length limits. The tables in `docs/research/language-spread/README.md` were generated from `story.ts`; regenerate them whenever stops change.
- **The 3D tilt.** Markers are HTML buttons inside the tilted plane, turned back to face the reader. The plane is sized by `tiltedPlaneOverflow`. Avoid `backdrop-filter` on the map and on anything floating over it: inside the plane it is expensive and renders see-through in headless Chrome, and over the moving map it roughly doubled slow frames, so the cards and era dial use a mostly opaque `--glass` instead.
- **Browser verification on this Mac.** Keep the display awake (`caffeinate -u -t 3600 &`), or headless Chrome produces no animation frames. Don't start a DevTools trace for this page, because it stalls the renderer. Use viewport screenshots, because a full-page capture stretches the pinned map. The journey already declares the trace and screenshot options, and `SKILL.md` explains why.
- **Screenshot timing.** Screenshots taken right after a click can catch panels mid-entrance (350 ms).

## Open questions

- The direction change hasn't been decided.
- The manual staging deploy (`scripts/deploy-staging.ts`) now defaults both `FLAG_PRACTICE` and `FLAG_LANGUAGE_SPREAD` to on, matching the staging Worker. Before this, a manual deploy built Practice off.
- The tilted map hasn't been measured on a real phone; device access is off in this environment. Under emulation (production build, 4× CPU throttling) it holds 60 fps at the median on a phone and a desktop viewport. About 4% of phone frames and 10% of desktop frames exceed 33 ms, with one hitch of up to about 90 ms at each step change. The details are in [verification.md](verification.md).

## How to look at it

```bash
bun install
bun run dev   # http://localhost:3000/language-spread
```

To run the verify journeys, follow the "Language Spread" section of `.agents/skills/verify-phonaria/references/feature-map.md`. Results of past runs are in `verification.md`; their raw evidence is in the git-ignored `test-results/verification/` of the original checkout.

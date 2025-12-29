---
name: Phoneme Search (DB)
overview: Ship a DB-backed phoneme-to-word search with an ultra-basic UI first, then iterate in small UI phases (chips/autocomplete, then click-to-IPA).
todos:
  - id: ps-index
    content: Confirm/adjust indexing for `words.phoneme_key` prefix search (optional `text_pattern_ops`).
    status: completed
  - id: ps-api
    content: "Implement `GET /api/phoneme-search` using Neon/Drizzle: validate path, query matches, totalCount, nextPhonemes aggregation, rate limit."
    status: completed
  - id: ps-ui-v0
    content: "Add `/[locale]/phoneme-search` ultra-basic page: path input, search, results list, next-phoneme buttons, clear."
    status: pending
  - id: ps-url
    content: Add URL sync with nuqs for `?path=` and wire initial fetch + back/forward.
    status: pending
  - id: ps-ui-chips
    content: Iterate UI to chips + guided selection (no autocomplete yet).
    status: pending
  - id: ps-ui-autocomplete
    content: Add phoneme autocomplete that adds chips; match by IPA or ARPABET.
    status: pending
  - id: ps-ui-ipa-click
    content: Click word → fetch G2P → show IPA inline/popover.
    status: pending
  - id: ps-i18n-docs
    content: Add i18n messages and update docs to the DB-backed + phased UI plan.
    status: pending
---

# Phoneme Search (DB-Backed) — Phased Plan

## Phase 0 — Data + indexing readiness

- Confirm `words.phoneme_key` exists and is populated as **standard ARPABET labels joined by `-`** (e.g. `K-AE-T`).
- Confirm indexing is sufficient for prefix search; if needed add a `text_pattern_ops` index for `LIKE 'prefix%'` performance.

Files:

- [`apps/web/src/db/schema.ts`](apps/web/src/db/schema.ts)
- (Optional) new migration via Drizzle

## Phase 1 — Backend API (DB-backed phoneme search)

Create a new endpoint:

- **Route**: [`apps/web/src/app/api/phoneme-search/route.ts`](apps/web/src/app/api/phoneme-search/route.ts)
- **Method**: `GET`
- **Params**:
- `path`: comma-separated ARPABET labels (e.g. `K,AE,T`)
- `limit`: default 50, max 200
- **Response**:
- `words: string[]`
- `totalCount: number`
- `nextPhonemes: { arpabet: string; ipa: string; count: number }[]`
- `path: string[]`

## Phase 2 — Ultra-basic UI (lowest complexity)

Ship a functional page with minimal components:

- **Route**: [`apps/web/src/app/[locale]/phoneme-search/page.tsx`](apps/web/src/app/[locale]/phoneme-search/page.tsx)
- UI:
- A plain text input: “Path (comma-separated ARPABET): e.g. `K,AE,T`”
- A Search button (or fetch on debounce)
- Results list + count
- Next-phoneme suggestions as a simple list of buttons (click appends token to the input)
- Clear button
- No autocomplete, no tag UI, no per-word IPA fetch yet.

Files:

- [`apps/web/src/app/[locale]/phoneme-search/page.tsx`](apps/web/src/app/[locale]/phoneme-search/page.tsx)
- `apps/web/src/app/[locale]/phoneme-search/_components/*` (minimal)

## Phase 3 — URL sync (still simple)

Add shareable URL state:

- Use `nuqs` to store `path` as `?path=K,AE,T`.
- Page load reads `path` and fetches immediately.
- Back/forward works.

## Phase 4 — UI iteration 1 (chips + guided selection)

Replace raw comma input with a simpler guided interaction:

- Selected phonemes rendered as removable “chips”.
- “Next phonemes” list becomes primary navigation (click adds chip).
- Keep a lightweight fallback text input for direct edits.

## Phase 5 — UI iteration 2 (autocomplete)

Add optional phoneme autocomplete:

- Matches by IPA or ARPABET.
- Selecting an option adds a chip.
- Still keep next-phoneme suggestions.

## Phase 6 — Word click → IPA (integration polish)

- Clicking a word calls existing G2P endpoint to show IPA inline/popover.
# G2P Status & External Link Plan

## Goals
- Replace the implicit `source` flag with an explicit status that tells the frontend whether a transcription came from CMUDict or is missing.
- Always provide a trusted dictionary link so learners can verify pronunciations outside our dataset.
- Surface the status and link in the UI at a high level without introducing unreliable fallback IPA strings.

## Scope
Touches the G2P API route and schema, the web client's G2P API client/types, and UI surfaces that show word details (transcription display, dictionary dialog). Helper scripts are unaffected.

## Workstreams

### 1. API & Data Contract
- Update `apps/web/src/app/api/g2p/_schemas/g2p-api.schema.ts` to replace `source` with `status: "dictionary" | "missing"` and add `externalLookupUrl: string`.
- Adjust `apps/web/src/app/api/g2p/route.ts`:
  - When CMUDict returns variants, set `status: "dictionary"`, keep variants, and attach the external link.
  - When no entry exists, set `status: "missing"`, return an empty `variants` array, and attach the external link.
  - Ensure missing words are logged/observable for future dictionary enrichment.
- Regenerate or update any shared type exports to reflect the new schema.

### 2. Frontend Data Layer
- Mirror the schema changes in `apps/web/src/app/[locale]/(g2p)/_lib/g2p-schema.ts` and `_types/g2p.ts`.
- Update `transformG2PResponse` in `apps/web/src/app/[locale]/(g2p)/_lib/g2p-client.ts` so `TranscribedWord` carries the new `status` and `externalLookupUrl` fields.
- Adjust stores/selectors that referenced `source` (e.g., `useG2PStore`) to use the new status.

### 3. UI Integration (High Level)
- Transcription display: visually distinguish words based on status; dictionary words continue to show IPA, missing words show a clear placeholder or message instead of phonemes.
- Word definition dialog/details: surface the external link prominently so learners can jump to the trusted dictionary, regardless of status.
- Provide a gentle global notice when any word is missing so users understand why IPA may be absent.

### 4. Testing & QA
- Add schema/unit tests to confirm status and link generation in the API route.
- Update existing frontend tests (if any) that assert on the word shape.
- Manual QA checklist: dictionary hit renders IPA; missing word shows placeholder plus external link in the word details dialog; global notice appears when expected.

## Rollout
1. Land backend schema + route changes with tests.
2. Update frontend types, client transformation, and stores.
3. Implement high-level UI adjustments in the transcription display and word details dialog.
4. Verify end-to-end in development, then run `pnpm lint`, `pnpm check-types`, and relevant Vitest suites before shipping.

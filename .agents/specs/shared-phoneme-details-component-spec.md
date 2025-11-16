# Feature: Shared Phoneme Details Component

## 1. Problem
- ESL learners jump between contrasts, G2P, and IPA tools without a single authoritative phoneme reference inside each flow.
- Current UIs surface partial data (audio, symbol, or examples) forcing learners to hunt for production guidance and consistent examples elsewhere.
- As we roll out multi-context pronunciation guidance, the absence of a reusable component blocks consistent instruction and slows iteration.

## 2. Goal
After this feature exists:
- Learners encounter a consistent, compact phoneme overview regardless of entry point (contrasts, G2P, IPA reference).
- Audio playback at normal and slow rates is available for phonemes and sample words with clear crediting.
- Production guidance and pitfalls are surfaced inline so learners can self-correct without leaving the flow.

## 3. Actors
- ESL Learner: Consumes phoneme guidance, plays audio, and follows cross-links.
- Content Maintainer: Ensures phoneme data (audio, examples, guidance) is populated in shared data sources.
- Host Flow Container (Contrasts, G2P, IPA Reference): Embeds the shared component and passes the selected phoneme id.

## 4. Requirements
- R1. ESL Learner can view the phoneme symbol and human-friendly name for the selected phoneme in the component header.
- R2. ESL Learner can play phoneme audio at normal and fixed slow playback speeds, using a single underlying audio asset, with visible playback state and a credit link pointing to the global credits page.
- R3. ESL Learner can view a concise production guide that includes a static sagittal view image sized for the component and a short textual description.
- R4. ESL Learner can view common pitfalls or coaching tips that explain typical learner mistakes for the phoneme.
- R5. ESL Learner can review a short list of example words, each showing orthography plus phonemic transcription, and play example audio at normal and slow speeds using the same audio file.
- R6. ESL Learner can preview up to a limited number of contrasts (e.g., top 3 minimal pairs or key distinctions) with a CTA linking out to the dedicated contrasts page for deeper practice.
- R7. ESL Learner does not see empty sections; the component hides any section without data for the phoneme.
- R8. Host Flow Container can configure the component width (e.g., sidebar, modal) without the component exceeding recommended vertical height or overflowing horizontally.
- R9. Host Flow Container cannot modify the credit link destination or the playback rate constants exposed by the component.

## 5. Constraints
- Must render cleanly inside non–full-width layouts and avoid excessive vertical growth; prioritize collapsible or concise sectioning.
- Must source phoneme metadata, audio paths, and imagery from `packages/shared-data` (or its extensions) to stay in sync across flows.
- Must reuse the same audio file for both normal and slow playback modes by altering playback rate at runtime.
- Must credit audio generation consistently via the provided credits link.

## 6. Success Signals
- 90%+ of phoneme detail views across contrasts, G2P, and IPA reference use the shared component with no fallbacks.
- At least 70% of phoneme detail sessions trigger an audio playback event (normal or slow) without user confusion reports.
- Support requests about “where to find pronunciation guidance for phoneme X” decline compared to baseline after rollout.

## 7. Assumptions
- Required audio assets, sagittal images, example words, and pitfalls will be available via `packages/shared-data` before embedding.
- Host flows can supply the relevant phoneme identifier and handle navigation to full contrast pages.
- Slow playback uses a fixed rate (e.g., 0.75x) deemed intelligible from existing audio assets.

## 8. Open Questions
- None.

## 9. Out of Scope
- Additional accessibility telemetry or analytics beyond existing global instrumentation.
- New audio recording workflows or dynamic generation of missing assets.
- Cross-links to related phonemes beyond the specified contrast preview.

# Feature: Phoneme Details Component

## 1. Problem / Why Now
- ESL learners inside Phonaria lack a single surface that combines phoneme identity, production coaching, spelling bridges, and contrast cues, so they jump between tools without building reliable muscle memory.
- The current phoneme flows scatter audio, articulation guidance, and spelling information, forcing learners to improvise study aids and slowing down pronunciation gains.
- Roadmapped features (dictionary lookups, IPA quizzes, contrast practice) have no authoritative detail view to link to, delaying downstream work and creating repetitive requests for clearer guidance.

## 2. Goal (End State)
After this feature exists:
- Learners can open one component to understand what the phoneme is, how it sounds, how to produce it, and where it appears in words.
- Learners can hear the phoneme (and its major variations) with normal and slow playback and match those sounds to spelling patterns and example words.
- Learners receive actionable tips, common mistake warnings, and quick contrast cues without feeling overwhelmed.
- Other Phonaria surfaces can deep-link to this component, confident it covers the canonical phoneme knowledge.

## 3. Actors
- ESL Learner: Self-directed learner consuming the component’s content; can trigger audio and reveal optional sections.
- Phoneme Detail Host: The page or flow embedding the component; passes the relevant phoneme metadata and optional context word.
- Audio Delivery Service: Provides the primary, slow, and variation-specific recordings referenced by the component.

## 4. Functional Requirements
- R1. The ESL Learner can view an identity snapshot showing the phoneme symbol, phonetic category, and a single descriptive sentence whenever the component loads.
- R2. The ESL Learner can play a primary studio-quality recording of the phoneme and see clear playback states and labels during playback.
- R3. The ESL Learner can trigger a fixed-speed slow playback of the same phoneme audio with identical accessibility cues.
- R4. The ESL Learner can read a concise, ordered list of production steps explaining articulation for the phoneme.
- R5. The component displays a static production visual (e.g., sagittal diagram) with descriptive text so the ESL Learner can interpret the image.
- R6. The ESL Learner can see at least one common mistake callout and one sensory cue that reinforce correct production for the phoneme.
- R7. The ESL Learner can review high-frequency grapheme patterns that map to the phoneme, including highlighted notable exceptions.
- R8. The ESL Learner can expand or collapse spelling bridge content when the list would otherwise overwhelm the default view.
- R9. The ESL Learner can inspect documented variations or allophones, each with a short explanation and an indicator showing whether alternate audio is available.
- R10. The ESL Learner can reveal additional variation entries via a “show more” mechanism whenever the host supplies more than a handful of variations.
- R11. The ESL Learner can browse an example library showing distinct positional contexts (initial, medial, final when available) with each entry displaying the orthographic word, IPA fragment with stress, and audio playback when that word-level audio exists.
- R12. When example word audio is missing, the component still shows the entry but omits the audio control rather than substituting the base phoneme audio.
- R13. The component can optionally highlight a source word (provided by the host flow) without altering the core ordering of examples.
- R14. The ESL Learner can view a contrast preview that lists frequently confused phonemes, each with a distinguishing cue and optional sample pair snippet.
- R15. The ESL Learner can use a single handoff action that opens the dedicated contrast experience in an external destination configured by the host.
- R16. The ESL Learner can explore each tip or micro-practice prompt individually so tips never overwhelm the initial layout.
- R17. Whenever required content for a section is absent for a phoneme, the component hides that entire section so learners never see placeholder or “missing” states.

## 5. Constraints & Rules
- Hidden sections must not leave empty containers or placeholder text; the layout should collapse seamlessly when data is absent.
- Audio controls must expose accessible labels, state changes, and are limited to studio-quality recordings supplied in the phoneme metadata.
- Static visuals (e.g., sagittal diagrams) must include captions or descriptive text for screen-reader support.
- Tone of all copy must remain instructional, calm, and jargon is defined inline or via tooltips.
- Collapse/expand patterns must enforce progressive disclosure to prevent cognitive overload.
- The contrast handoff link must open an external page provided by the host configuration (new tab or window as appropriate).
- Component behavior must stay host-agnostic; no assumptions about surrounding navigation, lessons, or assessments.

## 6. Evidence of Success
- Learners stop requesting ad-hoc guidance for “how to make this sound” because the component already reveals articulation, cues, and pitfalls.
- Dictionary lookups and IPA practice flows can link to the component without needing supplementary phoneme explanations.
- Usage analytics show learners trigger both normal and slow playback plus at least one example word per visit, indicating engagement across sections.
- Support tickets citing confusion over spelling patterns or contrast partners for a phoneme decline after adoption.

## 7. Assumptions / Tradeoffs
- We assume curated metadata (audio variants, production steps, spelling patterns, variations, examples, contrasts, tips, visuals) exists or will be produced outside this feature.
- We assume the host flow supplies the configurable URL for the external contrast experience.
- We assume per-section collapse thresholds (e.g., number of items before "show more") will be resolved in UX design later.
- We accept that phoneme-specific customization (colors, bespoke layouts) is out of scope; the component uses a consistent structure across phonemes.

## 8. Open Questions (Blocking)
None.

## 9. Out of Scope / Future Ideas
- Defining exact UI patterns, microcopy, or visual design for collapse/expand controls.
- Building authoring tools to create or edit the underlying phoneme metadata.
- Running contrast drills or practice sessions within the component itself.
- Auto-generating word-level audio when it is missing.

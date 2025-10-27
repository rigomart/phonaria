# UI Plan: Phoneme Details Component

## Scope & Goal

**Scope**: Feature  
**Primary Goal**: Enable ESL learners to understand a phoneme's identity, sound, production technique, and usage contexts in a single cohesive view.  
**Constraints**: Audio limited to studio-quality recordings from metadata; must support progressive disclosure to prevent cognitive overload; contrast handoff opens external page; component remains host-agnostic.  
**Existing Patterns**: Builds on Phonaria's phoneme-first learning approach; extends current scattered audio/articulation/spelling flows into unified surface.

## Legend

**Layers:**
- **L1**: Immediately visible on page load (minimal set to start primary task)
- **L2**: Hidden by default, revealed through user action (secondary/optional content)

**Patterns:** See glossary at `.agents/reference/ui-planner-glossary.md` for detailed definitions.

**Principles:** Cognitive and accessibility principles cited from catalog in UI Planner documentation.

---

## UI Structure

- **Phoneme Identity Section**
  - Purpose: Display phoneme symbol, phonetic category, and descriptive sentence to establish what the phoneme is.
  - Layer: L1
  - Why: Essential orientation before any learning can begin. Users need immediate context for "what am I learning?" Supports orientation and infoScent principles—learners must know what they're studying before engaging with production or examples.
  - Principles: orientation, infoScent, cognitiveLoad
  - Accessibility:
    - Screen readers: Announce symbol, category, and description as landmark heading
  - Notes: Include IPA symbol, category label (e.g., "Vowel - Front, High"), and single-sentence description

- **Audio Playback Controls**
  - Purpose: Play primary studio recording at normal and slow speeds to let learners hear the target sound.
  - Layer: L1
  - Why: Auditory model is prerequisite for pronunciation learning—learners cannot produce what they haven't heard. Immediate access to both speeds supports affordance and feedback principles. Slow playback aids noticing for learners who struggle with native speed.
  - Principles: affordance, feedback, noticing
  - Interactions:
    - Click Normal Speed button → plays primary audio, button shows playing state
    - Click Slow Speed button → plays slow audio (fixed speed), button shows playing state
    - Playback completes → button returns to default state
    - One audio plays at a time (clicking another stops current)
  - Accessibility:
    - Keyboard: Space or Enter activates playback
    - Screen readers: Announce button labels ("Play Normal Speed", "Play Slow Speed") and state changes ("Playing", "Stopped")
    - Focus: Clear focus indicator on buttons
  - Notes: Display both controls prominently; ensure clear labeling and visual feedback during playback

- **Production Guidance Section**
  - Purpose: Teach articulatory technique through ordered steps, visual diagram, and reinforcement cues.
  - Layer: L1
  - Why: Core instructional content enabling accurate production—the "how to make this sound" learners need immediately. Chunking articulation into steps reduces cognitive load. Visual + textual reinforcement supports diverse learning styles. Combining steps, diagram, mistakes, and sensory cues in one section maintains focus rather than scattering guidance.
  - Principles: chunking, cognitiveLoad, affordance, feedback
  - Accessibility:
    - Screen readers: Provide descriptive alt text for sagittal diagram explaining tongue/lip positions
    - Keyboard: Standard navigation through text content
  - Notes: Contains production steps list, sagittal diagram with caption, common mistake callout, and sensory cue item

- **Example Words Section**
  - Purpose: Show phoneme in authentic word contexts across positions (initial, medial, final) with audio playback.
  - Layer: L1
  - Why: Essential grounding—learners need to see phoneme in real usage immediately to connect abstract symbol to concrete words. Positional variety supports noticing of context-dependent patterns. Supports retrievalPractice and affordance principles by providing immediate practice opportunities.
  - Principles: retrievalPractice, noticing, affordance
  - Pattern: list
  - Interactions:
    - Click word audio button → plays word-level recording, button shows playing state
    - Highlight source word (if provided by host) → visually distinguished without reordering
    - Words without audio → show entry but omit audio control
  - Accessibility:
    - Keyboard: Tab through audio buttons, Space/Enter plays
    - Screen readers: Announce word, IPA transcription with stress marks, and audio availability
    - Focus: Clear indicators on audio buttons
  - Notes: Display orthographic word, IPA fragment with stress, positional context (Initial/Medial/Final); show reasonable initial set (6-9 examples covering positions)

- **Extended Learning Content**
  - Purpose: Provide deeper phoneme knowledge through spelling patterns, variations, and contrasts for learners ready to extend beyond core production.
  - Layer: L2
  - Why: Secondary content that clarifies and extends primary learning without overwhelming initial view. Progressive disclosure keeps cognitive load manageable while ensuring comprehensive coverage. Tabbed organization enables switching between related knowledge categories that learners frequently compare (spelling vs variations vs contrasts).
  - Principles: progressiveDisclosure, cognitiveLoad, chunking, patternConsistency
  - Pattern: tabs
  - Accessibility:
    - Keyboard: Arrow keys navigate tabs, Tab enters tab panel content, Shift+Tab exits
    - Screen readers: Announce tab list role, selected tab, and panel content
    - Focus: Maintain focus on selected tab, move focus into panel on activation
  - Notes: Tabs enable related content exploration without scrolling through stacked sections; users can quickly switch between spelling, variations, and contrasts during study

  - **Spelling Patterns Tab**
    - Purpose: Map phoneme to high-frequency grapheme patterns and notable exceptions to bridge sound and spelling.
    - Layer: L1 (within Extended Learning)
    - Why: Critical for reading/writing transfer—ESL learners need explicit spelling connections that native speakers intuit. Highlighting exceptions reduces future errors through noticing principle. Supports retrieval practice when learners encounter these patterns in text.
    - Principles: noticing, retrievalPractice, chunking
    - Notes: List grapheme patterns in frequency order; visually distinguish exceptions

  - **Variations & Allophones Tab**
    - Purpose: Document phoneme variations with explanations and audio availability indicators, using show-more for long lists.
    - Layer: L1 (within Extended Learning)
    - Why: Advanced understanding—learners benefit from knowing regional or contextual variants but don't need this to start producing the phoneme. Progressive disclosure via show-more prevents overwhelming learners with extensive allophone lists while preserving completeness.
    - Principles: progressiveDisclosure, cognitiveLoad, chunking
    - Interactions:
      - Initial display → shows first 3-5 variations
      - Click "Show More" → reveals remaining variations
      - Audio available indicator → clear visual cue (no audio playback embedded yet)
    - Accessibility:
      - Keyboard: Tab to "Show More" button, Enter expands
      - Screen readers: Announce variation description and audio availability
    - Notes: Each variation entry shows short explanation plus audio availability indicator

  - **Contrast & Practice Tab**
    - Purpose: Preview frequently confused phonemes with distinguishing cues and handoff to dedicated contrast practice.
    - Layer: L1 (within Extended Learning)
    - Why: Addresses common confusion points explicitly—supporting noticing and interleaving principles by highlighting differences learners often miss. Handoff to external contrast experience maintains component scope while enabling deeper practice. Separation into preview (here) vs full practice (external) follows progressive disclosure.
    - Principles: noticing, interleaving, affordance, progressiveDisclosure
    - Pattern: list (contrast preview items)
    - Interactions:
      - Display contrast list → shows confused phoneme, distinguishing cue, optional sample pair
      - Click contrast handoff action → opens external contrast page (new tab/window)
    - Accessibility:
      - Keyboard: Tab to handoff link/button, Enter activates
      - Screen readers: Announce link purpose ("Open contrast practice for /ɪ/ vs /i:/")
    - Notes: Limit preview to 3-5 frequently confused phonemes; handoff action clearly labeled

  - **Tips & Guidance Tab**
    - Purpose: Offer optional micro-practice prompts and tips for learners seeking additional reinforcement.
    - Layer: L1 (within Extended Learning)
    - Why: Optional guidance that extends learning without cluttering core view. Supports progressiveDisclosure and affordance—learners discover tips when ready. Prevents cognitive overload by isolating exploratory content from essential production steps.
    - Principles: progressiveDisclosure, affordance, cognitiveLoad
    - Notes: Individual tip items; each tip is self-contained and can be explored independently

---

## Key Decisions

| Area | Principles Applied | Rationale |
|------|-------------------|-----------|
| **L1 vs L2 Assignment** | progressiveDisclosure, cognitiveLoad | L1 limited to identity, audio, production, and examples—the minimal set to START learning the phoneme. Spelling, variations, contrasts, and tips moved to L2 to prevent overwhelming initial view. This honors cognitive load principle (limit simultaneous novelty) while ensuring essential content remains immediately visible. |
| **Example Words in L1** | retrievalPractice, affordance, noticing | Unlike other optional content, examples provide essential grounding—learners need concrete word contexts immediately to connect abstract phoneme to usage. Evidence of success confirms learners engage with examples on every visit, justifying L1 placement. |
| **Extended Learning Tabs** | chunking, progressiveDisclosure, patternConsistency | Four related L2 sections (spelling, variations, contrasts, tips) organized as tabs rather than independent collapsibles or accordion. Tabs chosen because categories are equally important and learners frequently switch between them during study (e.g., comparing spelling patterns while reviewing variations). Maintains context better than stacked sections. Rejected accordion (users benefit from keeping multiple tabs open mentally) and rejected independent collapsibles (increases scrolling and reduces sense of relationship). |
| **Production Section Grouping** | chunking, cognitiveLoad | Combined articulation steps, visual diagram, common mistakes, and sensory cues into single L1 section rather than splitting. Grouping related production content reduces navigation and maintains instructional flow. Keeps cognitive load manageable by presenting complete production knowledge in one coherent unit. |
| **Conditional Section Hiding** | affordance, orientation | Sections with missing required content are entirely hidden rather than shown as empty states. Prevents confusion and maintains clean information scent—learners see only applicable content. Supports affordance principle by avoiding UI elements that don't lead to useful outcomes. |
| **Audio Controls Prominence** | affordance, feedback | Normal and slow playback controls placed in L1 with clear labels and playing states. Auditory input is prerequisite for pronunciation learning—learners cannot produce what they haven't heard. Immediate, obvious access supports affordance; state feedback (playing/stopped) supports feedback principle. |

---

## Implementation Guidance

### Accessibility

**Keyboard Navigation:**
- Tab through all interactive elements (audio buttons, tabs, links) in logical top-to-bottom order
- Space or Enter activates audio playback and buttons
- Arrow keys navigate between tabs; Tab enters tab panel content
- Escape closes expanded "show more" variations if implemented as overlay

**Screen Reader Support:**
- Announce phoneme identity section as landmark heading with symbol, category, description
- Announce audio button states ("Play Normal Speed", "Playing", "Stopped")
- Announce example word entries with orthographic word, IPA transcription, stress, and audio availability
- Announce tab list role, selected tab state, and panel content on activation
- Announce variation descriptions and audio availability indicators
- Announce contrast preview items with phoneme pair and distinguishing cue

**Focus Management:**
- Maintain clear focus indicators on all interactive elements (audio buttons, tabs, links)
- Tab navigation maintains logical reading order within each section
- When expanding tabs, focus moves to first interactive element in panel (or panel itself if none)
- Contrast handoff link opens external page without losing current component context

**Touch Targets:**
- Ensure all interactive elements (buttons, tabs, links) meet minimum touch target sizes for mobile usability

### Interaction Patterns

**Audio Playback:**
- Only one audio plays at a time (starting new audio stops current)
- Visual state changes clearly indicate playing vs stopped
- Buttons return to default state on completion

**Progressive Disclosure (Extended Learning):**
- Initial load: Extended Learning content hidden (L2)
- User trigger: Click/tap to reveal tabs, select tab to view content
- Variations "show more": Initially shows 3-5 variations, expands on demand

**Conditional Rendering:**
- Sections with missing required metadata are completely hidden (not shown as empty states)
- Example words without audio show entry but omit audio control

**Source Word Highlighting:**
- If host provides source word, visually distinguish it in example list without reordering
- Maintain original positional ordering (initial → medial → final)

### Layer Strategy

**L1 (Immediately Visible):**
- Phoneme Identity Section (symbol, category, description)
- Audio Playback Controls (normal + slow speeds)
- Production Guidance Section (steps, visual, mistakes, cues)
- Example Words Section (initial set covering positions)

**L2 (On-Demand via Extended Learning Tabs):**
- Spelling Patterns Tab (graphemes with exceptions)
- Variations & Allophones Tab (with show-more for long lists)
- Contrast & Practice Tab (preview + handoff)
- Tips & Guidance Tab (optional micro-practice)

### Development Phasing

**Core/MVP:**
- L1 sections: Identity, Audio, Production, Examples
- Basic L2 structure with at least Spelling and Variations tabs
- Conditional section hiding logic
- Keyboard and screen reader support for all interactive elements

**Phase 2:**
- Complete all Extended Learning tabs (Contrast, Tips)
- "Show more" variations expansion
- Source word highlighting from host context
- Enhanced audio state feedback

**Future:**
- Inline tip interactivity (micro-quizzes within tips)
- Variation audio playback (currently only shows availability)
- Collapsible production substeps for complex phonemes

### Notes

**Component Boundaries:**
- Component receives phoneme metadata bundle from host (identity, audio URLs, production content, spelling data, variations, examples, contrasts, tips, visuals)
- Component receives optional source word context from host for highlighting
- Component receives contrast handoff URL configuration from host
- Component emits no events—purely presentational with self-contained audio interactions
- Component handles conditional rendering based on metadata completeness

**Tone & Copy:**
- Instructional, calm, jargon-free
- Define technical terms inline or via tooltips
- Production steps use clear imperative language ("Place tongue...", "Round lips...")
- Error states (if needed) use supportive language without blame

**Data Dependencies:**
- All content sourced from curated phoneme metadata
- Audio files must exist at provided URLs (component doesn't generate or fallback)
- Sagittal diagrams must include descriptive captions for accessibility
- Example words require IPA transcription with stress marks

---

## Open Questions

- Should "show more" variations use inline expansion or overlay (popover/dialog) for very long lists?
- If phoneme has 15+ example words, should Example Words section implement pagination or limit initial display with "show more"?
- Should Tips tab support any interactivity (e.g., marking tips as "completed" or "helpful") or remain purely informational?
- For source word highlighting, should component scroll to that word in Example Words section when component loads?

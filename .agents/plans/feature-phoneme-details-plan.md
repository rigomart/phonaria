# UI Plan: Phoneme Details Component

## Scope & Goal

**Scope**: Feature
**Primary Goal**: Provide comprehensive phoneme learning materials combining identity, audio, production technique, reference materials, and practice support in a single focused view.
**Constraints**: 
- Progressive disclosure required to prevent cognitive overload
- Host-agnostic design (no assumptions about embedding context)
- Audio controls limited to studio-quality recordings from metadata
- All visual content requires descriptive text for accessibility
- External contrast experience opens in new tab/window

**Existing Patterns**: Collapsible sections, tabs for reference materials

## Legend

**Layers:**
- L1: Immediately visible on page load (minimal set to start primary task)
- L2: Hidden by default, revealed through user action (secondary/optional content)

**Patterns:** See glossary at `.agents/reference/ui-planner-glossary.md` for detailed definitions.

**Principles:** Cognitive and accessibility principles cited from catalog in this document.

## UI Structure

- **Phoneme Identity Snapshot**
  - Purpose: Display phoneme symbol, phonetic category, and descriptive sentence to establish what sound learner is studying.
  - Layer: L1
  - Why: Essential orientation providing immediate context for all subsequent learning. Users cannot engage meaningfully with production or examples without knowing which phoneme they're studying. Supports orientation principle by answering "what am I looking at" before any other interaction.
  - Principles: orientation, cognitiveLoad, chunking
  - Notes: Contains IPA symbol, category label (e.g., "Voiceless alveolar stop"), and single descriptive sentence

- **Primary Audio Playback**
  - Purpose: Play studio-quality recording of isolated phoneme at normal speed with visible playback state.
  - Layer: L1
  - Why: Core learning requirement allowing immediate sound exposure. Hearing the phoneme is prerequisite for all articulation and discrimination work. Visible playback state provides feedback and reinforces control affordance.
  - Principles: affordance, feedback, cognitiveLoad
  - Pattern: Audio control
  - Interactions:
    - Click play button → audio plays, button shows playing state
    - During playback → progress indication visible
    - Click pause → audio stops, button returns to play state
    - Playback completes → button returns to play state
  - Accessibility:
    - Keyboard: Space or Enter toggles playback
    - Screen readers: Announce playback state changes ("playing", "paused", "stopped")
    - Focus: Visible focus indicator on play button

- **Slow Playback Control**
  - Purpose: Play fixed-speed slowed version of phoneme audio for detailed listening.
  - Layer: L2
  - Why: Refinement tool for learners needing more granular sound perception. Optional because primary audio suffices for initial exposure. Progressive disclosure prevents overwhelming beginners while serving advanced needs.
  - Principles: progressiveDisclosure, affordance, feedback
  - Pattern: Audio control
  - Interactions: Identical to primary playback (play/pause, state indication)
  - Accessibility: Same keyboard and screen reader support as primary playback
  - Notes: Uses same interaction pattern as primary audio for consistency

- **Production Guidance Section**
  - Purpose: Teach articulation technique through ordered steps, visual diagram, and error prevention cues.
  - Layer: L2
  - Pattern: collapsible
  - Why: Detailed how-to content supporting learners who need explicit technique instruction. L2 placement prevents overwhelming users who prefer auditory learning or already know articulation. Collapsible pattern allows quick access without cluttering initial view.
  - Principles: progressiveDisclosure, chunking, cognitiveLoad
  - Interactions:
    - Click section header → expands to reveal content
    - Click again → collapses section
  - Accessibility:
    - Keyboard: Enter or Space toggles expansion
    - Screen readers: Announce expanded/collapsed state
    - Focus: Visible indicator on header

  - **Articulation Steps List**
    - Purpose: Present ordered production instructions for making the phoneme sound.
    - Layer: L1
    - Why: Core teaching content within Production section. Ordered list supports sequential learning and reduces cognitive load by breaking complex motor task into manageable steps. Chunking principle applied through numbered progression.
    - Principles: chunking, cognitiveLoad
    - Notes: Concise ordered list (e.g., "1. Place tongue tip behind upper teeth, 2. Build air pressure, 3. Release quickly")

  - **Production Visual**
    - Purpose: Display sagittal diagram or articulation image with descriptive caption.
    - Layer: L1
    - Why: Visual reinforcement supporting learners who benefit from spatial understanding of tongue/lip placement. Complements textual steps through dual coding. Descriptive text ensures accessibility for screen reader users.
    - Principles: chunking, affordance
    - Accessibility:
      - Screen readers: Descriptive text alternative explains diagram content
    - Notes: Static image with descriptive caption, not interactive

  - **Common Mistakes Callout**
    - Purpose: Alert learners to typical articulation errors for this phoneme.
    - Layer: L1
    - Why: Error prevention reduces frustration and accelerates learning by addressing predictable failure modes. Positioning within Production section maintains relevance while chunking keeps callouts distinct from instruction steps.
    - Principles: chunking, feedback, noticing
    - Notes: One or more brief callouts (e.g., "Don't let tongue touch teeth", "Avoid adding vowel sound")

  - **Sensory Cues**
    - Purpose: Provide tactile or kinesthetic feedback hints for confirming correct production.
    - Layer: L1
    - Why: Sensory feedback helps learners self-correct during solo practice. Noticing principle applied by directing attention to physical sensations often overlooked. Complements visual and textual instruction through multi-sensory approach.
    - Principles: noticing, feedback
    - Notes: Brief sensory descriptions (e.g., "Feel air burst against hand", "Tongue should vibrate slightly")

- **Learning Reference Tabs**
  - Purpose: Organize related reference materials for spelling, variations, and usage examples in switchable views.
  - Layer: L2
  - Pattern: tabs
  - Why: Three reference materials users switch between while studying phoneme usage patterns. Tabs reduce scrolling and maintain consistent vertical position, supporting orientation by keeping learner anchored in one UI location while exploring different facets. L2 placement keeps initial view focused on identity and sound.
  - Principles: chunking, progressiveDisclosure, orientation, patternConsistency
  - Interactions:
    - Click tab header → switches to that tab's content
    - Tab content updates without page scroll
  - Accessibility:
    - Keyboard: Arrow keys navigate between tabs, Tab key moves focus into active panel
    - Screen readers: Announce selected tab and total tab count
    - Focus: Clear focus indicator on tab headers and logical flow into panel content

  - **Spelling Patterns Tab**
    - Purpose: Show high-frequency grapheme patterns that map to this phoneme with notable exceptions.
    - Layer: L1
    - Why: Critical reference for bridging orthographic knowledge to pronunciation. Learners need this to recognize phoneme in written text. Exceptions highlighted through noticing principle to prevent overgeneralization errors.
    - Principles: chunking, noticing, infoScent
    - Notes: List common patterns (e.g., "ph" → /f/, "gh" → /f/) with exception callouts (e.g., "Exceptions: 'shepherd'")

  - **Variations Tab**
    - Purpose: Document allophones or phoneme variations with explanations and audio availability indicators.
    - Layer: L1
    - Why: Advanced content for learners encountering dialectal or contextual variation. Grouped here rather than independent section to reduce L2 clutter. Show more pattern prevents overwhelming users when many variations exist.
    - Principles: progressiveDisclosure, chunking, patternConsistency
    - Interactions:
      - View initial variation entries (typically 3-5)
      - Click "Show more" → reveals additional entries
    - Notes: Each entry shows variation description, context, and audio icon (if available)

  - **Example Words Tab**
    - Purpose: Display word examples grouped by phoneme position with IPA transcription and audio playback.
    - Layer: L1
    - Why: Essential for connecting isolated phoneme to real usage. Positional grouping (initial/medial/final) supports pattern recognition and prepares for minimal pair work. Chunking by position reduces cognitive load while covering comprehensive usage.
    - Principles: chunking, retrievalPractice, patternConsistency
    - Interactions:
      - Browse examples grouped by position (Initial, Medial, Final)
      - Click word audio button → plays word-level recording
      - Highlighted source word (if provided by host) visually distinct but maintains position-based order
    - Accessibility:
      - Keyboard: Tab through example words, Enter/Space plays audio
      - Screen readers: Announce word, IPA transcription, position category
      - Focus: Clear focus indicator on playable words
    - Notes: Each example shows orthographic word, IPA fragment with stress marks, position label. Audio control only visible when word-level audio exists. Missing audio omits control entirely (no placeholder).

- **Contrasts Preview**
  - Purpose: List frequently confused phonemes with distinguishing cues and link to dedicated contrast practice.
  - Layer: L2
  - Pattern: collapsible
  - Why: Comparison tool for discrimination practice. L2 placement appropriate because contrasts serve learners who've mastered isolation and are ready for distinction work. Preview format with external handoff prevents scope creep while directing users to specialized practice tool.
  - Principles: progressiveDisclosure, interleaving, infoScent, affordance
  - Interactions:
    - Click section header → expands to show confused phonemes list
    - Click "Practice contrasts" link → opens external contrast experience in new tab
  - Accessibility:
    - Keyboard: Enter/Space toggles expansion, Tab reaches handoff link, Enter opens link
    - Screen readers: Announce link destination and new window behavior
    - Focus: Clear focus indicator on header and link
  - Notes: Lists 3-5 commonly confused phonemes with brief distinguishing cues (e.g., "/s/ vs /θ/ — /s/ is hissing, /θ/ has tongue visible"). Sample word pairs optional if metadata provides them.

- **Practice Tips**
  - Purpose: Offer individual micro-practice prompts or learning suggestions for this phoneme.
  - Layer: L2
  - Pattern: collapsible
  - Why: Optional enhancement for motivated learners seeking additional practice ideas. L2 placement prevents overwhelming users with too many options initially. Individual reveal (if multiple tips) applies progressive disclosure within section.
  - Principles: progressiveDisclosure, cognitiveLoad, retrievalPractice
  - Interactions:
    - Click section header → expands to show tips
    - If multiple tips, each visible individually or via show more pattern
  - Accessibility:
    - Keyboard: Enter/Space toggles expansion
    - Screen readers: Announce expanded state
  - Notes: Tips might include retrieval prompts, recording suggestions, or contextual practice ideas

## Key Decisions

| Area | Principles Applied | Rationale |
|------|-------------------|-----------|
| **L1 minimal set** | cognitiveLoad, progressiveDisclosure, orientation | Only Identity Snapshot and Primary Audio visible initially. This represents absolute minimum to start learning (what + sound). Production, examples, and reference materials deferred to L2 to prevent overwhelming first encounter. Alternative rejected: showing examples L1 would create dense initial view. |
| **Slow audio as L2** | progressiveDisclosure, cognitiveLoad | Refinement tool for advanced needs. Primary audio suffices for initial exposure; slow playback serves learners who need granular listening. L2 prevents cluttering audio controls for users who don't need it. |
| **Reference materials as tabs** | chunking, orientation, patternConsistency | Spelling, Variations, and Examples are related reference materials users switch between while studying. Tabs reduce scrolling and maintain consistent vertical position, supporting orientation. Alternative rejected: independent collapsibles would create long vertical stack with lost context during scrolling. Tabs chosen over accordion because users frequently switch between references (not sequential exploration). |
| **Production as independent section** | chunking, progressiveDisclosure | Production serves distinct purpose (technique teaching) separate from reference materials. Keeping it independent from tabs maintains clear separation between "how to make sound" (doing) and "where sound appears" (reference). Collapsible pattern allows quick access without permanent space consumption. |
| **Contrasts as preview + handoff** | progressiveDisclosure, infoScent, affordance | Spec indicates contrast practice belongs in dedicated external experience. Preview lists confused phonemes with brief cues to support infoScent (users know what to expect), then handoff link provides clear affordance for deeper practice. Prevents scope creep while maintaining discovery path. |
| **Examples within tabs** | chunking, patternConsistency | Examples are reference material (where phoneme appears) rather than core identity/audio. Grouping with Spelling and Variations reduces L2 section count while maintaining logical relationship (all three answer "how/where is this phoneme used in language"). |
| **Conditional section hiding** | affordance, cognitiveLoad | When metadata lacks content for a section (e.g., no variations documented), entire section hidden rather than showing empty state. Reduces clutter and prevents learner confusion about missing data. Reinforces affordance by showing only actionable content. |

## Implementation Guidance

### Accessibility

**Keyboard Navigation:**
- Tab key moves through interactive elements in logical top-to-bottom order
- Audio controls respond to Space and Enter for play/pause
- Collapsible sections toggle with Enter or Space on header
- Tab navigation within tabs: Arrow keys switch tabs, Tab key enters active panel
- Contrast handoff link opens with Enter (new tab behavior announced)

**Screen Reader Support:**
- Identity snapshot read as landmark heading with phoneme symbol and category
- Audio controls announce state changes (playing, paused, stopped, loading)
- Collapsible sections announce expanded/collapsed state when toggled
- Tab selection announces active tab name and total count
- Example words announce orthographic form, IPA transcription, and position category
- Contrast handoff link announces destination and new window behavior
- Dynamic content updates (example audio playback, tab switches) announced without stealing focus

**Focus Management:**
- All interactive elements have visible focus indicators
- Focus order follows visual top-to-bottom layout
- Collapsible sections maintain focus on header after toggle
- Tab switches move focus to selected tab header, then user tabs into panel
- Audio controls maintain focus on play button during and after playback
- Modal/overlay patterns (if needed for future enhancements) trap focus and restore to trigger on close

**Touch Targets:**
- All interactive elements meet minimum touch target sizing for mobile accessibility

### Interaction Patterns

**Audio Playback:**
- Consistent play/pause toggle pattern for primary and slow audio
- Visual state indication during playback (progress, playing state)
- Single audio instance plays at a time (playing new audio stops previous)
- Example word audio uses same playback pattern for consistency

**Progressive Disclosure:**
- Collapsible sections initially collapsed (L2 content hidden)
- Section headers clearly indicate expandable nature
- Tabs start with first tab active (Spelling)
- Show more pattern (Variations) reveals additional content inline without navigation

**Handoff Pattern:**
- Contrast handoff link opens external practice tool in new tab
- Clear affordance through link styling and "opens in new tab" indication
- Link positioned after preview content to maintain information → action flow

### Component Structure

Consider decomposing into logical sub-components:

**Core Structure:**
- Phoneme Details Container (orchestrates layout, receives phoneme metadata)
  - Identity Snapshot (symbol, category, description)
  - Audio Controls Section (primary + slow playback)
  - Production Guidance Section (collapsible)
    - Steps List
    - Visual with Caption
    - Mistakes Callouts
    - Sensory Cues
  - Learning Reference Tabs
    - Spelling Patterns Tab Panel
    - Variations Tab Panel (with show more)
    - Examples Tab Panel (grouped by position)
  - Contrasts Preview (collapsible with handoff link)
  - Practice Tips (collapsible)

**Reusable Components:**
- Audio Player Control (reused for primary, slow, example words)
- Collapsible Section (reused for Production, Contrasts, Tips)
- Tab Container (custom implementation for reference materials)
- Example Word Entry (reused within Examples tab)

**Conditional Rendering:**
- Each section checks for required metadata before rendering
- Missing content results in section omission (no empty states shown)
- Audio controls only appear when audio URLs exist in metadata
- Show more button appears only when variation count exceeds threshold

### Layer Strategy

**L1 (Immediately Visible):**
- Phoneme Identity Snapshot: Establishes context (what am I studying?)
- Primary Audio Playback: Immediate sound exposure (how does it sound?)

These two elements represent minimum viable learning surface. Everything else builds on this foundation.

**L2 (On-Demand):**
- Slow Audio: Refinement for granular listening
- Production Guidance: Detailed articulation technique
- Learning Reference Tabs: Spelling, variations, examples reference
- Contrasts Preview: Discrimination preparation and handoff
- Practice Tips: Optional enhancement for motivated learners

L2 content revealed through user action (expanding sections, switching tabs) prevents cognitive overload while maintaining comprehensive coverage.

### Development Phasing

**Phase 1 (Core/MVP):**
- Identity snapshot
- Primary audio playback
- Production guidance (collapsible)
- Basic example words (without audio)
- Conditional section hiding

**Phase 2 (Enhancement):**
- Slow audio playback
- Learning reference tabs (Spelling, Variations, Examples)
- Example word audio integration
- Show more pattern for variations
- Contrasts preview with handoff

**Phase 3 (Polish):**
- Practice tips section
- Source word highlighting in examples
- Enhanced accessibility (screen reader optimization)
- Mobile-specific touch optimizations

### Notes

**Metadata Requirements:**
- Component expects comprehensive phoneme metadata including identity, audio URLs, production steps, visual URLs, spelling patterns, variations, examples, contrasts, tips
- Missing sections gracefully hidden (no error states)
- Host provides phoneme identifier, optional context word, contrast handoff URL

**Host Integration:**
- Component host-agnostic (embeddable in dictionary, IPA chart, practice flows)
- Host responsible for loading metadata, providing contrast handoff URL
- Optional source word prop highlights that word in examples without reordering

**Audio Management:**
- Only one audio instance plays at a time across all controls
- Audio files assumed pre-generated at normal and slow speeds
- Example word audio optional (controls hidden when absent)
- No fallback audio (don't substitute phoneme audio for missing word audio)

**Progressive Enhancement:**
- Core content (identity, audio, production) works without JavaScript
- Interactive features (collapsibles, tabs, show more) degrade gracefully
- Audio controls require JavaScript for playback state management

## Open Questions

None

## Summary
- mode: specify
- startLevel: component
- userGoal: Help ESL learners internalize a phoneme's sound, production, spelling, and contrasts through a focused detail surface
- constraints: audio-first-feedback, progressive-disclosure, accessible-labeling, flow-agnostic-embedding
- existingPatterns: Phonaria audio control semantics, IPA identity chips, drill-style practice blocks

## Key Decisions & Principles
| Scope | Principles | Rationale |
|-------|------------|-----------|
| PhonemeDetails | chunking, pedagogicalUX | Keeps all phoneme learning tasks in one coherent component so learners move from orientation to practice without context switching. |
| SoundPlayback | dualCoding, interactionForUnderstanding | Prioritizes auditory controls with clear state feedback to reinforce recognition through active listening. |
| ProductionGuidance | pedagogicalUX, dualCoding | Couples sequential articulation steps with visuals and cues to bridge explanation and embodied practice. |
| ExampleLibrary | chunking, dualCoding | Groups positional examples with IPA and audio so learners connect spelling, transcription, and sound in one pass. |
| ContrastPreview | informationScent, progressiveDisclosure | Surfaces the most confusing neighbors while routing extended work to a dedicated flow. |
| TipsPractice | progressiveDisclosure, pedagogicalUX | Packages drills as individually expandable prompts to minimize clutter yet support ongoing practice. |

## Accessibility & Interaction Notes
- Audio controls reuse existing button and switch semantics with `aria-status` updates and focus-visible states for every playback mode.
- Expandable regions (spelling, variations, tips) expose toggle buttons reachable via `Tab` and activatable with `Space` or `Enter`, preserving disclosure context.
- Lists (steps, patterns, variations, examples) declare list roles for screen reader navigation and keep items under seven to aid scanability.
- Static visuals in production guidance require descriptive text or captions keyed to their related steps.
- Handoff links and practice controls return focus to the triggering element after navigation or collapse to support keyboard loops.

## UI Structure (JSON)
```json
{
  "artifactVersion": "1.2",
  "mode": "specify",
  "source": { "type": "file", "value": "docs/phoneme-details-component-spec.md" },
  "startLevel": "component",
  "summary": {
    "userGoal": "Help ESL learners internalize a phoneme's sound, production, spelling, and contrasts through a focused detail view",
    "constraints": [
      "audio-first-feedback",
      "progressive-disclosure",
      "accessible-labeling",
      "flow-agnostic-embedding"
    ]
  },
  "tree": {
    "level": "component",
    "name": "PhonemeDetails",
    "priority": "P1",
    "layer": "L1",
    "purpose": ["orientation","instruction"],
    "why": "Bundle all phoneme instruction tasks into a single coherent component so learners can move from recognition to practice without leaving context.",
    "principles": ["chunking","pedagogicalUX"],
    "presentation": { "grouping": { "method": "heading", "emphasis": "medium", "rationale": "Establishes the component as a recognizable learning block without implying layout." } },
    "interactions": [],
    "accessibility": { "role": "region", "keyboard": [] },
    "children": [
      {
        "level": "container",
        "name": "IdentitySnapshot",
        "priority": "P1",
        "layer": "L1",
        "purpose": ["display","orientation"],
        "why": "Expose symbol, category, and mnemonic sentence immediately to anchor the learner before deeper exploration.",
        "principles": ["chunking","informationScent"],
        "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps identity cues grouped without heavy chrome." } },
        "accessibility": { "role": "group", "keyboard": [] },
        "children": [],
        "content": ["PhonemeSymbol","CategoryBadge","LearnerDescription"]
      },
      {
        "level": "container",
        "name": "SoundPlayback",
        "priority": "P1",
        "layer": "L1",
        "purpose": ["control","feedback"],
        "why": "Provide immediate auditory reinforcement with multiple playback modes so learners can compare and self-monitor.",
        "principles": ["dualCoding","interactionForUnderstanding"],
        "presentation": { "grouping": { "method": "divider", "emphasis": "medium", "rationale": "Separates active audio controls from static content while remaining lightweight." } },
        "interactions": [
          { "event": "play", "feedback": ["state-toggle","focus-visible","aria-status"] },
          { "event": "slow-play", "feedback": ["state-toggle","focus-visible","aria-status"] },
          { "event": "loop-toggle", "feedback": ["state-toggle","focus-visible"] },
          { "event": "word-clip-play", "feedback": ["state-toggle","focus-visible","aria-status"] }
        ],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Tab"], "action": "move across controls" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "PrimaryPlaybackControl",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["control"],
            "why": "Delivers the canonical audio reference at native speed for immediate recognition practice.",
            "principles": ["dualCoding","feedback"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps the primary control uncluttered for quick activation." } },
            "interactions": [
              { "event": "play", "feedback": ["state-toggle","progress-indicator"] },
              { "event": "pause", "feedback": ["state-toggle"] }
            ],
            "accessibility": {
              "role": "button",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "activate playback" }
              ]
            },
            "children": [],
            "content": ["PlayPauseButton","WaveformIndicator","DurationLabel"]
          },
          {
            "level": "component",
            "name": "SlowPlaybackControl",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["control","feedback"],
            "why": "Fixed slow playback helps learners perceive articulatory detail without added decision load.",
            "principles": ["dualCoding","interactionForUnderstanding"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps alternate playback adjacent while signaling secondary emphasis." } },
            "interactions": [
              { "event": "play", "feedback": ["state-toggle","focus-visible"] }
            ],
            "accessibility": {
              "role": "button",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "trigger slow playback" }
              ]
            },
            "children": [],
            "content": ["SlowPlayButton","SpeedLabel"]
          },
          {
            "level": "component",
            "name": "LoopToggle",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["control"],
            "why": "Looping enables repeated listening without extra navigation, supporting deliberate practice.",
            "principles": ["interactionForUnderstanding","feedback"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps the toggle visually tied to the playback cluster." } },
            "interactions": [
              { "event": "toggle", "feedback": ["state-toggle","focus-visible"] }
            ],
            "accessibility": {
              "role": "switch",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "toggle looping" }
              ]
            },
            "children": [],
            "content": ["LoopToggleButton","LoopStateLabel"]
          },
          {
            "level": "component",
            "name": "WordClipList",
            "priority": "P2",
            "layer": "L2",
            "purpose": ["control","reference"],
            "why": "Pairs the phoneme with word-level examples to transfer recognition into context without overwhelming the primary view.",
            "principles": ["dualCoding","progressiveDisclosure"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps optional clips lightweight and scannable." } },
            "accessibility": {
              "role": "list",
              "keyboard": [
                { "keys": ["Tab"], "action": "cycle through word clip triggers" }
              ],
              "notes": ["Each clip trigger reuses global audio-button semantics."]
            },
            "children": [],
            "content": ["WordClipItem"]
          }
        ]
      },
      {
        "level": "container",
        "name": "ProductionGuidance",
        "priority": "P1",
        "layer": "L1",
        "purpose": ["instruction"],
        "why": "Guides learners through articulatory steps with multimodal cues so they can reproduce the phoneme accurately.",
        "principles": ["pedagogicalUX","dualCoding"],
        "presentation": { "grouping": { "method": "heading", "emphasis": "medium", "rationale": "Signals shift into step-by-step instruction without dictating layout." } },
        "accessibility": { "role": "region", "keyboard": [] },
        "children": [
          {
            "level": "component",
            "name": "ArticulationSequence",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["instruction"],
            "why": "Breaks production into digestible sequential steps to lower cognitive load.",
            "principles": ["chunking","pedagogicalUX"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps steps distinct yet related for easy scanning." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["StepItem","StepSequenceIndicator","StepInstructionText"]
          },
          {
            "level": "component",
            "name": "StaticVisualSupport",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["visualAid"],
            "why": "Pairs each step with sagittal stills to strengthen audio-to-visual mapping.",
            "principles": ["dualCoding","informationScent"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Aligns visuals with text while minimizing clutter." } },
            "accessibility": { "role": "group", "keyboard": [], "notes": ["Provide alt text or captions describing articulator positions."] },
            "children": [],
            "content": ["DiagramStill","DiagramCaption"]
          },
          {
            "level": "component",
            "name": "MistakeCallout",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["feedback"],
            "why": "Surfaces a common error so learners can compare their attempt against a known pitfall.",
            "principles": ["interactionForUnderstanding","pedagogicalUX"],
            "presentation": { "grouping": { "method": "tint", "emphasis": "medium", "rationale": "Highlights cautionary guidance without feeling alarmist." } },
            "accessibility": { "role": "note", "keyboard": [] },
            "children": [],
            "content": ["MistakeLabel","MistakeDescription"]
          },
          {
            "level": "component",
            "name": "SensoryCue",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["instruction"],
            "why": "Provides a sensory marker learners can feel or hear to confirm correct production.",
            "principles": ["dualCoding","pedagogicalUX"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps cue adjacent to steps while remaining optionally scannable." } },
            "accessibility": { "role": "note", "keyboard": [] },
            "children": [],
            "content": ["CueLabel","CueDescription"]
          }
        ]
      },
      {
        "level": "container",
        "name": "SpellingBridges",
        "priority": "P1",
        "layer": "L2",
        "purpose": ["reference","instruction"],
        "why": "Connects sounds to common graphemes so learners map listening to spelling patterns.",
        "principles": ["informationScent","progressiveDisclosure"],
        "presentation": { "grouping": { "method": "divider", "emphasis": "low", "rationale": "Maintains separation from pronunciation guidance while staying compact." } },
        "interactions": [
          { "event": "expand", "feedback": ["inline-status","focus-visible"] }
        ],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Space","Enter"], "action": "toggle extended patterns" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "GraphemePatternList",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["reference"],
            "why": "Organizes high-frequency spellings for quick scanning and recall.",
            "principles": ["chunking","informationScent"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps each pattern discrete to aid comparison." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["PatternItem","PatternFrequencyTag"]
          },
          {
            "level": "component",
            "name": "ExceptionCallout",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["feedback"],
            "why": "Flags irregular spellings so learners avoid overgeneralization.",
            "principles": ["pedagogicalUX","progressiveDisclosure"],
            "presentation": { "grouping": { "method": "tint", "emphasis": "low", "rationale": "Differentiates exceptions without overpowering core patterns." } },
            "accessibility": { "role": "note", "keyboard": [] },
            "children": [],
            "content": ["ExceptionLabel","ExceptionDescription"]
          }
        ]
      },
      {
        "level": "container",
        "name": "VariationContext",
        "priority": "P1",
        "layer": "L2",
        "purpose": ["reference"],
        "why": "Documents allophones and situational shifts so learners anticipate contextual changes.",
        "principles": ["progressiveDisclosure","informationScent"],
        "presentation": { "grouping": { "method": "divider", "emphasis": "low", "rationale": "Keeps variations distinct while aligning with surrounding references." } },
        "interactions": [
          { "event": "expand", "feedback": ["inline-status","focus-visible"] }
        ],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Space","Enter"], "action": "reveal additional variations" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "VariationList",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["reference"],
            "why": "Clusters contextual variants with concise descriptors for comparative understanding.",
            "principles": ["chunking","informationScent"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps each variation scannable with optional audio indicators." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["VariationItem","VariationDescription","VariationAudioIndicator"]
          },
          {
            "level": "component",
            "name": "VariationShowMore",
            "priority": "P2",
            "layer": "L3",
            "purpose": ["control"],
            "why": "Handles longer variation sets without overwhelming the default view.",
            "principles": ["progressiveDisclosure","affordance"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps the control lightweight and aligned with list flow." } },
            "interactions": [
              { "event": "activate", "feedback": ["inline-status","focus-visible"] }
            ],
            "accessibility": {
              "role": "button",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "load more variations" }
              ]
            },
            "children": [],
            "content": ["ShowMoreTrigger","RemainingCountLabel"]
          }
        ]
      },
      {
        "level": "container",
        "name": "ExampleLibrary",
        "priority": "P1",
        "layer": "L1",
        "purpose": ["practice","reference"],
        "why": "Provides word examples across positions so learners connect perception with orthography and IPA.",
        "principles": ["pedagogicalUX","dualCoding"],
        "presentation": { "grouping": { "method": "heading", "emphasis": "medium", "rationale": "Signals a practice-focused cluster that remains independent from instruction blocks." } },
        "interactions": [],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Tab"], "action": "navigate example list" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "ExampleList",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["reference","practice"],
            "why": "Organizes examples by positional context to reinforce contrast.",
            "principles": ["chunking","pedagogicalUX"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps items uniform for quick comparison." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["ExampleItem"]
          },
          {
            "level": "component",
            "name": "ExampleItem",
            "priority": "P1",
            "layer": "L1",
            "purpose": ["practice"],
            "why": "Each item bundles orthography, IPA fragment, stress, and audio trigger for deliberate drilling.",
            "principles": ["dualCoding","interactionForUnderstanding"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps multi-part data aligned without over-formatting." } },
            "interactions": [
              { "event": "play", "feedback": ["state-toggle","aria-status"] }
            ],
            "accessibility": {
              "role": "group",
              "keyboard": [
                { "keys": ["Tab"], "action": "reach audio control" },
                { "keys": ["Space","Enter"], "action": "play example audio" }
              ],
              "notes": ["Ensure focus order exposes orthographic word before controls."]
            },
            "children": [],
            "content": ["ContextLabel","WordOrthography","IPAFragment","StressMarker","ExampleAudioButton"]
          },
          {
            "level": "component",
            "name": "SourceHighlight",
            "priority": "P3",
            "layer": "L3",
            "purpose": ["context"],
            "why": "Optionally identifies a host-provided source word without coupling to external flows.",
            "principles": ["informationScent","progressiveDisclosure"],
            "presentation": { "grouping": { "method": "tint", "emphasis": "low", "rationale": "Subtly mark contextual highlight when present." } },
            "accessibility": { "role": "note", "keyboard": [] },
            "children": [],
            "content": ["SourceLabel","SourceWord"]
          }
        ]
      },
      {
        "level": "container",
        "name": "ContrastPreview",
        "priority": "P1",
        "layer": "L2",
        "purpose": ["reference","navigation"],
        "why": "Surfaces commonly confused phonemes with distinguishing cues and routes learners to deeper contrast practice.",
        "principles": ["informationScent","pedagogicalUX"],
        "presentation": { "grouping": { "method": "divider", "emphasis": "medium", "rationale": "Distinguishes contrast preview from example practice while maintaining cohesion." } },
        "interactions": [
          { "event": "navigate", "feedback": ["focus-visible"] }
        ],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Tab"], "action": "enter contrast list" },
            { "keys": ["Space","Enter"], "action": "activate handoff link" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "ConfusableList",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["reference"],
            "why": "Lists key contrasts with cues so learners prime for differences.",
            "principles": ["chunking","informationScent"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps each contrast pair concise and comparable." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["ContrastItem","DistinguishingCue","SamplePairSnippet"]
          },
          {
            "level": "component",
            "name": "ContrastHandoffAction",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["navigation"],
            "why": "Offers a single configurable link to launch extended contrast practice without embedding sessions here.",
            "principles": ["progressiveDisclosure","affordance"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps action prominent yet lightweight." } },
            "interactions": [
              { "event": "activate", "feedback": ["focus-visible","visited-state"] }
            ],
            "accessibility": {
              "role": "link",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "follow link" }
              ]
            },
            "children": [],
            "content": ["ContrastLinkLabel","TargetUrlToken"]
          }
        ]
      },
      {
        "level": "container",
        "name": "TipsPractice",
        "priority": "P1",
        "layer": "L2",
        "purpose": ["instruction","practice"],
        "why": "Bundles actionable drills and mnemonics so learners can self-direct practice without cluttering the main flow.",
        "principles": ["progressiveDisclosure","pedagogicalUX"],
        "presentation": { "grouping": { "method": "divider", "emphasis": "low", "rationale": "Maintains separation while preserving compactness." } },
        "interactions": [
          { "event": "expand", "feedback": ["inline-status","focus-visible"] }
        ],
        "accessibility": {
          "role": "region",
          "keyboard": [
            { "keys": ["Space","Enter"], "action": "open individual tip" }
          ]
        },
        "children": [
          {
            "level": "component",
            "name": "TipList",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["instruction"],
            "why": "Holds micro-prompts learners can open one at a time.",
            "principles": ["progressiveDisclosure","chunking"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps tips discrete to avoid overload." } },
            "accessibility": { "role": "list", "keyboard": [] },
            "children": [],
            "content": ["TipCard"]
          },
          {
            "level": "component",
            "name": "TipCard",
            "priority": "P1",
            "layer": "L2",
            "purpose": ["instruction","practice"],
            "why": "Each card presents a single drill or mnemonic with optional audio to support dual coding.",
            "principles": ["dualCoding","pedagogicalUX"],
            "presentation": { "grouping": { "method": "spacing", "emphasis": "low", "rationale": "Keeps content compact and individually focusable." } },
            "interactions": [
              { "event": "expand", "feedback": ["inline-status","focus-visible"] },
              { "event": "play", "feedback": ["state-toggle","aria-status"] }
            ],
            "accessibility": {
              "role": "group",
              "keyboard": [
                { "keys": ["Space","Enter"], "action": "toggle tip disclosure" },
                { "keys": ["Tab"], "action": "reach tip audio control" }
              ],
              "notes": ["Ensure focus returns to the disclosure trigger after collapse."]
            },
            "children": [],
            "content": ["TipHeader","TipBody","TipAudioButton","SelfCheckPrompt"]
          }
        ]
      }
    ]
  }
}
```

## Open Questions & Assumptions
- Assume curated sagittal diagrams and descriptive text are available for each production step.
- Assume phoneme datasets provide variation audio indicators and example metadata, including position labels and stress marks.
- Assume host surfaces supply the target URL for deeper contrast exploration and an optional source word identifier.

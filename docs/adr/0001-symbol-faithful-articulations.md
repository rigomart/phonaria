# ADR 0001: Keep articulation features faithful to IPA symbols

- Status: Accepted
- Date: 2026-08-31
- Related issues: [#188](https://github.com/rigomart/phonaria/issues/188),
  [#184](https://github.com/rigomart/phonaria/issues/184)

## Context

Phonaria's [articulation registry][registry] supports charts that teach learners how IPA symbols
relate to the vowel space. Every diphthong endpoint is therefore authored at the canonical IPA
position of its constituent glyph. For example, the `AI` /aɪ/ and `AU` /aʊ/ diphthongs both
begin at the open-front position represented by ⟨a⟩.

This creates an intentional overlap between `AI` and `AU`. It also differs from narrow phonetic
descriptions of General American English, which can place the PRICE vowel's onset centrally and
transcribe it as [äɪ]. Work by Kenyon, Ladefoged, and Boberg supports that central realization;
the *Atlas of North American English* separately describes the MOUTH vowel's onset as front of
centre. Those descriptions are useful accounts of accent-specific pronunciation, but they answer
a different question from the registry.

Encoding a narrow General American realization for `AI` would move one endpoint away from the
canonical position of its written IPA glyph. The resulting chart would no longer agree with the
official IPA vowel chart that learners use as a reference, and the data would mix two different
levels of phonetic detail.

## Decision

Articulation features encode the canonical IPA position of each symbol, not narrow measurements
of how a particular accent realizes that sound.

When symbol-faithful positions overlap, the rendering must make each sound and trajectory
understandable. We do not separate overlapping sounds by changing their articulation data.

## Consequences

- `AI` and `AU` share their open-front start point by design.
- Charts and other learning tools remain consistent with the canonical IPA symbols they display.
- Visual collisions are a rendering concern and may require offsets, distinct paths, or another
  presentation treatment.
- Narrow-phonetic accuracy for a particular accent is deliberately outside the articulation
  registry's scope. A future feature that teaches accent-specific realizations will need a
  separate data model rather than changes to these symbol-faithful features.

[registry]: ../../packages/phonetics-data/src/languages/en/articulations.ts

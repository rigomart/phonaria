---
description: Project overview for Phonix
globs:
alwaysApply: true
---

Phonix is a learner-first pronunciation toolkit for people studying English as a second language. Rather than a single curriculum, it gathers the core resources learners need to understand how English sounds work, explore spelling and phoneme patterns, and connect what they read with how it should sound.

# Learner Challenges We Address

1. **English spelling unpredictability** – Learners regularly meet words whose pronunciation cannot be guessed from spelling alone.
2. **Limited approachable references** – Most IPA charts and phonetic explanations feel academic, static, or scattered across multiple sites.
3. **Fragmented tooling** – Transcription, dictionary lookup, and contrast practice typically live in separate apps, forcing constant context switching.

# Core Toolkit

## Grapheme-to-Phoneme Studio
- **Instant transcription** – Paste any sentence or passage to see an IPA rendering with stress markers.
- **Clickable insights** – Select individual phonemes for articulation detail, example words, and comparison notes.
- **Dictionary bridge** – Jump straight from a word in the transcription to concise definitions and usage notes.

## IPA Reference Hub
- **Interactive chart** – Browse General American consonants, vowels, and diphthongs through a responsive grid.
- **Articulation guidance** – Review step-by-step production notes, visual diagrams, and learner-friendly descriptions.
- **Example library** – Access curated word lists with audio so learners can hear each sound in context.

## Sound Contrast Explorer
- **Minimal pair collections** – Study curated sets that highlight frequently confused sounds.
- **Listening-first drills** – Play word-level audio, compare IPA transcriptions, and note takeaways for future review.
- **Articulation cross-reference** – Surface cues from both sounds to reinforce what makes each distinct.

## Dictionary Lookup
- **In-context definitions** – Request meanings for any word without leaving the workspace.
- **Pronunciation confirmation** – Cross-check the dictionary’s audio with the transcription result for added confidence.
- **Clear states** – Designed for fast retries, helpful errors, and obvious “no results” messaging.

# Learning Experience Principles

1. **Toolbox over coursework** – Learners can enter through any feature and combine tools based on their immediate problem.
2. **Approachable language** – Plain-language explanations demystify IPA, minimal pairs, and articulation terms.
3. **Audio-first feedback** – High-quality recordings reinforce what learners read on screen.
4. **Progressive disclosure** – Guidance appears when a learner is new to a surface and recedes as they explore.
5. **No user tracking** – Phonix focuses on utility, not personalization or progress scoring.

# Technical Philosophy

## Modern Web Standards
- **Performance-first** – Low-latency interactions across desktop and mobile devices.
- **Responsive surfaces** – Every tool adapts gracefully from phones to large displays.

## Development Standards
- **Monorepo architecture** – Shared data, helper scripts, and the web app live together for tight iteration.
- **Type safety** – Strict TypeScript adoption keeps the toolchain reliable.
- **Composable UI** – Reusable components power multiple surfaces without duplication.
- **Data-driven layouts** – Feature sections render from structured phoneme and contrast metadata.
- **Modern tooling** – Next.js, React, Tailwind CSS, and shadcn/ui form the foundation.

# Upcoming Features

## Spelling Pattern Explorer
- **Predictable chunks** – Explain recurring pronunciation outcomes for endings such as `-tion`, `-able`, or silent “magic e” patterns.
- **Cross-tool links** – Highlight patterns found in user transcriptions and connect them back to relevant IPA entries and contrasts.
- **Learner strategy prompts** – Offer practical tips on when patterns hold and how to spot exceptions.

## Pronunciation History & Context
- **Accessible timeline** – Summarize pivotal events like the Great Vowel Shift that shaped modern English sounds.
- **Cross-language comparisons** – Contrast English unpredictability with languages such as Spanish to frame expectations.
- **Cultural insights** – Show how historical change, borrowing, and regional variation influence today’s pronunciation norms.

# Out of Scope
- Personal progress dashboards, adaptive lesson plans, and personalization engines are intentionally excluded. Phonix is built to be a reliable, free resource learners can revisit on their own terms.

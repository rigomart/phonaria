# G2P Enhancement Plan

A high-level plan to make the G2P (grapheme-to-phoneme) system fast, accurate, and edge-friendly—without AI—while keeping it maintainable.

---

## Overview

- **Goal:** Deterministic, low-latency G2P for General American English, prioritizing dictionary accuracy with a robust rule-based fallback.
- **Approach:** Multi-layer pipeline using globally cached lexicon lookups, context disambiguation, and strong grapheme-to-phoneme rules.

---

## High-Level Architecture

### 1. Client (Next.js UI)
- Debounced input sent to `/api/g2p` (Edge).
- Displays IPA transcription with per-phoneme links to the chart and indicators for confidence/alternatives.
- Optionally, a lightweight UI for disambiguation when ambiguity remains (user can pick pronunciation, persisted to user settings).

### 2. Edge API (Coordinator)
- **Pipeline per request:**
  1. Normalize, tokenize, and segment (words, numbers, acronyms, punctuation).
  2. Batch dictionary lookup (multi-get) against a globally replicated KV store.
  3. Ambiguity resolution (homographs, "the" before vowels, stress-shifting noun/verb pairs).
  4. Morphological derive-and-lookup (remove ’s, -s/-es, -ed, -ing, -er/-est, etc.).
  5. Rule-based fallback G2P for unknown tokens.
  6. Post-process (syllabification, stress marks, optional schwa reduction).
- **Returns structured results:**
  - `tokens`: Array of objects with fields like `surface`, `normalized`, `ipaSelected`, `ipaAlternatives`, `source`, `confidence`, `syllables`, `stressPattern`, `notes`.
  - `meta`: Includes `durationMs`, `cacheHits`, `ruleCoverage`, `dialect`.

### 3. Data/Infra Layer
- **Primary lexicon:** CMU-derived IPA, stored in Vercel KV (Upstash) or as sharded static JSON over CDN.
- **Secondary:** Small "Ambiguity Lexicon" with context rules for homographs.
- **Rulesets:** Deterministic letter-to-sound rules (JSON), morphological rules, number/acronym rules.
- **Caching:** CDN cache of entire API responses for identical inputs; KV read cache at edge.

---

## CMUdict Storage (Avoiding Large Downloads)

- **Preferred:** Vercel KV (Upstash Redis)
  - Preload: `word → [IPA variants with tags]`
  - O(1) lookups, multi-get per request, globally replicated, very low latency.
  - Store IPA directly to avoid runtime ARPABET→IPA conversion.
- **Alternative:** Sharded static assets on Vercel
  - Preprocess into 2- or 3-letter shards (e.g., `/data/cmu_ipa_shards/re.json`).
  - Fetch only needed shards per request; results cached at Vercel edge CDN.
- **Optional:** Tiny "hot set" in Vercel Edge Config (top 5k words for sub-millisecond lookup).
- **Note:** Do not fetch from GitHub at runtime. Treat the dictionary as a published artifact served from your infra.

---

## Dictionary Data Model (High-Level)

- **Key:** Lowercased, normalized word.
- **Value:**
  ```json
  {
    "ipa": ["ˈrɛkərd", "rɪˈkɔrd"],
    "posHints": ["N", "V"],
    "notes": { "special": "the_variant", "freqRank": 5234 }
  }
  ```
- Store IPA directly, with primary and alternative forms, to avoid runtime conversions.

---

## Robust Fallback: Layered Letter-to-Sound Rules

### 1. Pre-normalization
- Lowercase except for proper nouns (leading cap after sentence boundary).
- Strip punctuation; handle possessives and hyphens.
- Convert numbers and dates to words before G2P.
- Acronyms: ALL-CAPS (length ≥ 2) → letter names (A = eɪ, B = bi, etc.), plus special cases (NASA, SQL).

### 2. Morphological Handling (Before Rules)
- Try base forms: remove -s/-es, -ed, -ing, -er/-est, -’s; apply e-dropping, y→i rules.
- If base is found in dictionary, apply suffix phonology deterministically:
  - -s/-es: /s/ after voiceless, /z/ after voiced, /ɪz/ after sibilants.
  - -ed: /t/ after voiceless, /d/ after voiced, /ɪd/ after /t|d/.
  - -ing: base + ɪŋ, with silent-e handling.
  - Common derivational patterns: -tion/-sion → ʃən/ʒən; -cial/-tial → ʃəl; -ph → f; -que/-gue → k/g.

### 3. Grapheme Segmentation
- Handle multigraphs first: ch, sh, th, ph, gh, ng, qu, ck, wh, tion/sion, tch, eau, etc.
- Vowel teams: ee, ea, ai, ay, oa, oe, oo, ou, ow, au, aw, oi, oy, ie, ue, ui, ei, ey.
- Context rules:
  - c → s before e, i, y; else k.
  - g → dʒ before e, i, y; else g.
  - x → ks generally, gz before stressed vowel onset in some contexts (e.g., "exact").
  - s → z between vowels.
  - y as vowel in syllable nucleus (ɪ/i), y as consonant at onset (j).
  - magic-e: a_e → eɪ, i_e → aɪ (or i in some systems), o_e → oʊ, u_e → ju/u contextually.
  - gh: silent in most environments; -ough pattern list (though/through/rough/ought/cough/borough).
  - kn-/wr- initial letter silent; mb final b silent; lk/lt after a → l often dark but keep /l/.
  - qu → kw; wh → w in GA (except "who" → hu).

### 4. Syllabification and Stress Heuristics
- Sonority-based syllable parsing with maximal onset.
- Stress rules:
  - Suffix-driven (e.g., -ation: ˈeɪʃən with antepenultimate stress).
  - -ity/-ety: stress antepenult.
  - -ic/-sion/-tion: penultimate stress.
  - -graphy/-logy/-meter: antepenult or standard lexeme patterns.
  - Two-syllable noun/verb alternation: nouns/adjectives → stress first; verbs → stress second.
  - Compound nouns: primary stress on first element.
- Unstressed vowel reduction to ə/ɪ where appropriate (phonemic target for GA).

### 5. Post-processing
- Keep phonemic (do not add allophones like flapping).
- Apply rhotic GA consistently (keep /r/ in coda).
- Confidence score based on rule matches and exceptions.

---

## Handling Homographs and Context

- Maintain a small, curated "Ambiguity Lexicon" with deterministic rules:
  - "the" → ðə before consonant sounds, ði before vowel sounds.
  - Words like "record", "present", "project", etc.: noun/adj → 1st-syllable stress; verb → 2nd-syllable stress.
  - Homographs: "lead" (metal vs verb), "read" (present vs past), "wind", "live", "bow", "bass", "tear", "close".
  - "Polish" vs "polish": capitalization rule.
- Lightweight POS/tagging heuristics (no ML):
  - Simple patterns: DET + WORD → likely noun; PRON + WORD → likely verb/adj; "to" + WORD → likely verb; modal + WORD → verb; preposition + WORD → noun; "-ly" followers → adjective before adverb; sentence-initial capitalization vs mid-sentence.
  - Suffix cues: -ment/-tion/-ness → noun; -able/-al/-ive → adj; -ize/-ise/-ify → verb.
- If still ambiguous:
  - Use frequency-based default (from lexicon metadata).
  - Return alternatives to the client and allow user selection.
  - Persist user choice for that word/context for future lookups.

---

## Performance Plan (Edge-First)

- Batch and deduplicate tokens per request.
- KV multi-get (single network round trip).
- Cache layers:
  - Response cache: hash of normalized input → full result, CDN cached with s-maxage and stale-while-revalidate.
  - Token-level cache: optional KV of recent token→result.
  - Shard prefetch: if using static shards, only fetch shards needed for current tokens; leverage CDN.
- Keep bundle small: rules and ambiguity tables as compact JSON; CMU kept out of function bundle.
- Rate limiting and graceful degradation: if KV unavailable, fallback to shards; if shards unavailable, rules-only mode with a "lower confidence" flag.

---

## Data Pipeline (Build-Time)

- Pull CMUdict, convert to IPA (GA choices), normalize, compress.
- Generate:
  - KV preload dataset (word → IPA variants + metadata).
  - Optional shard files for CDN.
  - Ambiguity Lexicon table (hand-curated, evolving).
  - Rule tables for G2P fallback.
- Run integrity checks: duplicates, illegal IPA, stress marks.
- Publish and version the artifacts; include checksum in the API for observability.

---

## UX Considerations for Learners

- Show per-word confidence and alternatives when applicable.
- Click any phoneme to open the articulation guide.
- Toggle "show syllable boundaries/stress" to reinforce learning.
- Offer a "dialect: General American" tag; allow future dialect switch.
- When rules are used, show "how we derived this" for transparency.

---

## Observability and Quality

- **Metrics:** p50/p95 latency, KV hit rate, fallback rate (% not found in dict), homograph disambiguation rate, error rate.
- **Sampling:** Log a small percent of requests with anonymized tokens and chosen pathway (dict vs rules) to a private dataset for improving rules/ambiguity list.
- **Accuracy review loop:** Maintain a growing exceptions list for tough patterns (e.g., ough, proper names).

---

## Phased Delivery Plan

1. **Phase 1: Foundations**
   - Build-time pipeline: CMU→IPA, KV preloader, artifact versioning.
   - Edge API skeleton with tokenization, KV lookups, response caching.
   - Basic UI wiring and clickable IPA integration.

2. **Phase 2: Morphology + Fallback Rules**
   - Suffix handling, multigraph segmentation, core context rules, syllabification, stress heuristics.
   - Confidence scoring, notes, and rule trace.

3. **Phase 3: Ambiguity + Context**
   - Ambiguity Lexicon and rule-based POS heuristics.
   - "The" rule and common noun/verb alternations.
   - UI for alternative selection and persistence.

4. **Phase 4: Performance + Hardening**
   - KV multi-get, CDN tuning, shard fallback path, rate limiting.
   - Metrics, logging, and QA against test corpus.

5. **Phase 5: Polish for Learning Experience**
   - Syllable/stress toggles, tooltips, examples, confidence hints.
   - Personal dictionary overrides (user profile).

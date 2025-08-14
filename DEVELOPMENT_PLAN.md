# Phonix — Phased Development Plan

This phased plan focuses on **building the most valuable, technically viable features first**, while allowing for expansion into more advanced capabilities as resources and user feedback grow.  
Each phase builds on the previous one, minimizing rework and ensuring continuous improvement.

---

## Phase 1 — Core MVP (Phoneme-Level Learning)

**Goal:** Deliver a usable, accurate, and engaging phoneme-learning experience for ESL learners, with minimal dependencies and low technical risk.

**Key Features:**
1. **Interactive IPA Chart**  
   - Displays English phonemes (General American in v1).  
   - Clickable phonemes show:  
     - Articulation guide (place, manner, voicing for consonants; height, backness, rounding for vowels).  
     - Example words with audio.  
   - Static but well-designed; data-driven so new phonemes can be added easily.

2. **Static Articulation Guides**  
   - Text + diagrams showing tongue/lip position, airflow, and voicing.  
   - Pre-recorded audio for each phoneme.  
   - No speech recognition yet.

3. **Basic Phonemic Transcription Tool**  
   - User inputs a word or short phrase → system outputs phonemic transcription using:  
     - **Primary:** Pre-built G2P model for accuracy.  
     - **Fallback:** Simple deterministic mapping for unknown words.  
   - Clickable phonemes in transcription link to IPA chart details.

4. **Responsive Web App**  
   - Accessible on mobile and desktop.  
   - Minimal but clear UI for learners of varying tech literacy.

**Why This Order?**  
We start with the **phoneme awareness foundation** — without this, advanced features like speech recognition won't have clear educational value.

---

## Phase 2 — Interactive Practice

**Goal:** Introduce basic user interaction to reinforce learning, without heavy real-time processing demands.

**Key Features:**
1. **Listen & Identify**  
   - Play a phoneme audio → user chooses the correct IPA symbol from multiple choices.  
   - Tracks simple scores for motivation.

2. **Minimal Pairs Game**  
   - Show two similar words differing in one phoneme (e.g., “ship” vs “sheep”).  
   - Play one word’s audio → user identifies which word was spoken.

3. **User Progress Tracking (Local)**  
   - Store simple stats (accuracy, phonemes practiced) in local storage.  
   - No account system yet.

**Why This Order?**  
Adds engagement and self-testing while avoiding complex backend needs.

---

## Phase 3 — Speech Input & Feedback (Lightweight)

**Goal:** Enable learners to produce sounds and receive basic feedback using off-the-shelf speech recognition APIs.

**Key Features:**
1. **Phoneme Pronunciation Check**  
   - User records a single phoneme or short word.  
   - Speech recognition API → compare transcription against target phoneme.  
   - Give basic pass/fail feedback (not detailed acoustic analysis yet).

2. **Word Repetition Mode**  
   - Show a word, user repeats → system confirms if it was correctly recognized.  
   - Focuses on confidence-building, not full accuracy scoring.

3. **Feedback on Confusions**  
   - If wrong, suggest the correct phoneme and link to IPA chart.

**Why This Order?**  
We leverage existing cloud APIs to avoid building complex phonetic scoring engines from scratch.

---

## Phase 4 — Intelligent Feedback & Customization

**Goal:** Move towards personalized learning paths and better phoneme accuracy analysis.

**Key Features:**
1. **Phoneme-Level Error Analysis**  
   - Use forced alignment or fine-tuned ASR models to detect common learner substitutions.  
   - Show which phonemes need more work.

2. **Personalized Practice Lists**  
   - Generate a custom set of minimal pairs and words based on user’s weak phonemes.

3. **User Accounts & Cloud Sync**  
   - Allow learners to save progress across devices.  
   - Enable teachers to monitor class progress.

**Why This Order?**  
By now, we have enough user data to justify more advanced personalization.

---

## Phase 5 — Advanced Features (Optional Expansion)

**Goal:** Enhance engagement and depth for advanced learners.

**Possible Features:**
- **Connected Speech & Prosody Training** (linking words, stress, intonation).  
- **Contextual Pronunciation Challenges** (practice phonemes inside sentences).  
- **Gamified Learning Path** with badges, levels, and streaks.  
- **Teacher Dashboard** for class-based learning.

---

## Technical Notes & Priorities

- **G2P Model:** Prefer a lightweight model (CMUdict + rules for unknown words) for Phase 1, with an option to integrate fine-tuned models later.  
- **Speech Recognition:** Phase 3 can start with Google Speech-to-Text or Whisper API, then move to custom phoneme-aware scoring in Phase 4.  
- **Performance:** Keep IPA chart and transcription instant; avoid long API calls where possible.  
- **Scalability:** Ensure Phase 1 data structure supports adding other English accents or even other languages in the future.

---

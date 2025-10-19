# Minimal Pairs Feature Development Plan

This document outlines the phased development plan for the Minimal Pairs feature in Phonaria, an interactive pronunciation learning platform for ESL learners. The feature focuses on phoneme-level mastery by helping users distinguish and practice similar sounds (e.g., /ɪ/ vs. /i/ in "ship" vs. "sheep"). Each phase delivers a functional, iterable product, progressing from core functionality to advanced enhancements, integrating with existing IPA chart and G2P transcription tools. The plan prioritizes a phoneme-first approach, interactive discovery, and evidence-based ESL practices.

## Phase 1: Core Listening Discrimination

### Objective
Create a foundational tool for users to compare and distinguish minimal pairs through listening, focusing on auditory and visual contrast without gamified elements, to build phoneme perception skills.

### Access Points
- **Navbar Link**: Add "Minimal Pairs" to the app's top-level navigation, alongside "IPA Chart" and "G2P Tool," for direct access to the feature.
- **Phoneme Details**: In the IPA chart or G2P analysis phoneme detail views, include a "Differentiate with X" section listing 2-3 common contrasts (e.g., for /ɪ/, suggest /i/ with "ship/sheep"), with buttons to launch focused pair sessions.

### Core Functionality
- **Predefined Pair Sets**: Curate 20-30 minimal pairs, categorized by contrast type (vowels, consonants) and searchable via dropdowns on the Minimal Pairs page.
- **ESL-Specific Sets**: Include pairs addressing common challenges, such as:
  - /θ/ vs. /s/ (e.g., think/sink) for Arabic/Spanish speakers.
  - /r/ vs. /l/ (e.g., rice/lice) for Japanese/Korean learners.
  - /æ/ vs. /ɛ/ (e.g., bat/bet) for broad vowel confusion.
  - Add brief notes on typical L1 interferences (e.g., "Confused by languages without 'th' sounds").
- **Pair Display**:
  - Show pairs side-by-side with words and G2P transcriptions, highlighting the differing phoneme.
  - Include contrasting articulation details (place, manner, voicing), mouth/tongue illustrations, and step-by-step production tips from IPA guides.
  - Provide audio playback for each word and isolated phoneme using prerecorded native speaker files (preferred for quality) or Web Speech Synthesis API as fallback.
  - Add replay buttons for self-comparison.
- **Session Structure**: Present 5-10 pairs per session, with toggles to zoom illustrations or view detailed articulation.

### User Flow
1. Access via navbar or phoneme details.
2. Select a pair set or specific contrast.
3. View/hear pairs, explore differences (transcription, articulation, visuals).
4. Self-assess distinctions manually, no automated feedback.

### Outcomes
- Delivers a standalone listening tool for phoneme discrimination.
- Testable for usability and engagement; iterate on pair selection, UI clarity, or audio quality based on user feedback.

## Phase 2: Integrated Production Practice

### Objective
Extend Phase 1 with speaking exercises to create full perception-to-production cycles, enabling users to practice pronouncing minimal pairs with basic feedback.

### Access Points
- Retain navbar and phoneme details access, with sessions now offering "Listening Only" or "Mixed" modes.

### Core Functionality
- **Production Prompts**: After viewing a pair, prompt users to speak one word (cued with text and transcription).
- **Speech Feedback**: Use Web Speech API for basic pass/fail feedback on the target phoneme, with retry options.
- **Enhanced Feedback**: For incorrect attempts, show side-by-side articulation contrasts and links to IPA guides for detailed instructions.
- **Contextual Expansion**: Use existing pair sets, optionally embedding pairs in short sentences (e.g., "The ship is here" vs. "The sheep is here") for real-world practice, with G2P highlighting the contrast.
- **Fallback**: Support manual repetition mode (mimic audio without recognition) for devices without mic access.

### User Flow
1. Select a session mode and pair set.
2. Alternate listening (compare pairs) and speaking (pronounce one word).
3. Receive feedback with articulation guidance for errors.
4. Complete 10-15 items per session.

### Outcomes
- Provides a complete practice tool for perception and production.
- Testable for feedback accuracy and user confidence; iterate on speech recognition tuning or prompt variety.

## Phase 3: Progress Tracking and Recommendations

### Objective
Add personalization to guide learning, tracking performance and integrating with G2P for targeted practice suggestions.

### Access Points
- Retain prior access points; add a "Progress" link in the navbar for a dashboard view.

### Core Functionality
- **Session Logging**: Record accuracy (from recognition or manual notes) per contrast.
- **Progress Dashboard**: Display mastered vs. weak contrasts with simple visuals (e.g., progress bars, accuracy percentages).
- **Recommendations**: Suggest repeating low-scoring pairs (<70% accuracy) or advancing to related contrasts (e.g., from vowels to diphthongs).
- **G2P Integration**: In G2P transcription results, highlight challenging phonemes and link to relevant minimal pair sessions.
- **Customization**: Allow users to set goals (e.g., focus on consonant clusters) or filter pairs by L1 language profile.

### User Flow
1. Complete sessions; view post-session summaries feeding into the dashboard.
2. Check progress and select recommended or goal-based sessions.
3. Access pairs from G2P results for targeted practice.

### Outcomes
- Creates an adaptive learning path for long-term mastery.
- Testable for user retention; iterate on dashboard usability or recommendation algorithms.

## Phase 4: Enhanced Engagement Variations

### Objective
Introduce optional, engaging elements to increase replayability and depth, appealing to diverse learners.

### Access Points
- Retain prior access; dashboard suggests advanced modes for returning users.

### Core Functionality
- **Exercise Variations**:
  - "Odd-one-out": Hear three words (two the same), identify the different one.
  - Timed comparisons for speed practice.
  - User-generated pairs via G2P (input a word to find contrasts).
- **Rewards**: Add streaks, badges (e.g., "Vowel Master" for 90% accuracy), and progress-sharing options.
- **Advanced Options**: Filter by difficulty (e.g., basic vs. noisy audio) or explore community-shared sets.

### User Flow
1. Toggle enhanced modes in sessions.
2. Earn rewards and track progress in the dashboard.
3. Share achievements or explore user-generated pairs.

### Outcomes
- Delivers a polished, engaging feature set.
- Testable for increased session time and enjoyment; iterate on balancing educational value with fun.

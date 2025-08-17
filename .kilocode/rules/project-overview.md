# PROJECT OVERVIEW

Phonix is an interactive pronunciation learning platform focused on phoneme-level mastery for English as a Second Language (ESL) learners. It addresses the lack of accessible tools that teach how to physically articulate individual sounds rather than only practicing words or sentences, enabling users to understand, identify, and produce target phonemes accurately for improved long-term pronunciation skills.

## The Problem We're Solving

### Primary Problem: Lack of Phoneme-Level Articulation Instruction
Traditional pronunciation tools teach "repeat after me" without explaining how sounds are physically produced, leaving learners guessing at proper mouth, tongue, and lip positioning. This creates a foundational weakness where learners struggle with pronunciation because they don't understand the building blocks of English speech sounds.

### Secondary Problems
1. **IPA Intimidation**: The International Phonetic Alphabet seems complex and academic to many learners
2. **Limited Interactive Tools**: Most IPA resources are static charts without engaging, clickable exploration
3. **Disconnected Learning**: Phoneme instruction isn't connected to real word usage and examples
4. **Generic Feedback**: No personalized learning paths based on individual pronunciation difficulties

## Core Features & Learning Experience

### 1. Interactive IPA Chart
- **Visual, clickable chart** of English phonemes (General American focus initially)
- **Comprehensive phoneme details**: Each phoneme provides articulation guides, example words, and audio playback
- **Visual articulation aids**: Place and manner of articulation for consonants; height, backness, and rounding for vowels
- **Accessibility focus**: Mobile and desktop responsive with clear, learner-friendly interface

### 2. Phonemic Transcription Tool
- **Text-to-phonemes conversion**: User inputs words or phrases → system outputs phonemic transcription
- **Clickable transcription**: Each phoneme in the transcription links to detailed articulation information
- **Dual approach**: Primary G2P model for accuracy with deterministic fallback for unknown words
- **Real-world application**: Helps learners understand pronunciation of new vocabulary

### 3. Articulation Guides
- **Step-by-step instructions** for producing each phoneme
- **Visual diagrams** of mouth and tongue positions
- **Native speaker recordings** with example words
- **Multi-modal learning**: Text, visual, and audio instruction combined

### 4. Search & Filtering Capabilities
- **Multiple search methods**: Find phonemes by sound, spelling pattern, or articulation category
- **Advanced filtering**: Filter IPA chart by vowel/consonant, place of articulation, voicing, etc.
- **Learning exploration**: Encourages discovery-based learning rather than linear instruction

### 5. Interactive Practice Features
- **Minimal Pair Practice**: Interactive exercises contrasting similar phonemes with listening and speaking challenges
- **Listen & Identify**: Audio-based phoneme recognition with multiple choice responses and score tracking
- **Speech Input & Feedback**: Phoneme pronunciation checking with basic pass/fail feedback using speech recognition APIs
- **Word Repetition Mode**: Confidence-building exercises where users repeat words for recognition verification

### 6. Learning Path Support
- **Suggested progression** for mastering phonemes based on difficulty and common learner challenges
- **Personalized recommendations** based on user progress and identified pronunciation difficulties
- **Fallback accuracy layer**: Deterministic rule-based approach ensures reasonable results when primary systems can't confidently process input

## User Experience Philosophy

### Core Learning Flow
1. **Discover**: Users explore an interactive IPA chart where each phoneme is immediately accessible
2. **Learn**: Clicking reveals detailed articulation instructions, visual guides, and example words with audio
3. **Practice**: Text input provides phonemic transcription with each phoneme linking back to articulation details
4. **Progress**: Personalized practice based on identified pronunciation challenges and learning patterns

### Key Design Principles
- **Phoneme-first approach**: Everything starts with understanding individual sounds
- **Interactive discovery**: Learning through exploration rather than linear lessons
- **Immediate feedback**: Audio examples and visual guides available instantly
- **Real-world connection**: All phonemes connected to actual English words and usage
- **Approachable**: Makes IPA friendly and non-academic for everyday learners
- **Progressive enhancement**: Core functionality accessible to all, enhanced features for capable devices

## Target Users & Use Cases

### Primary Users: ESL Learners
- **Beginners**: Can explore IPA chart without intimidation, understand basic sound production
- **Intermediate**: Use transcription tool to understand pronunciation of new vocabulary
- **Advanced**: Identify specific phonemes causing pronunciation difficulties and target practice

### Secondary Users: ESL Teachers
- **Classroom integration**: Visual aid for phoneme-focused instruction
- **Lesson planning**: Reference tool for articulation-based pronunciation lessons
- **Student support**: Help students understand individual sound production challenges
- **Progress monitoring**: (Future) Track class pronunciation improvement and common difficulties

## Phased Development Strategy

The development follows a strategic phased approach that builds the most valuable, technically viable features first while allowing for expansion based on user feedback and resources.

### Phase 1: Core MVP (Foundation)
**Goal**: Deliver a usable, accurate, and engaging phoneme-learning experience with minimal dependencies and low technical risk.

**Key Features**:
- Interactive IPA Chart with clickable phonemes showing articulation guides and example words
- Static articulation guides with text, diagrams, and pre-recorded audio
- Basic phonemic transcription tool using G2P model with deterministic fallback
- Responsive web app accessible on mobile and desktop

### Phase 2: Interactive Practice (Engagement)
**Goal**: Introduce basic user interaction to reinforce learning without heavy real-time processing demands.

**Key Features**:
- Listen & Identify games with phoneme audio and multiple choice responses
- Minimal Pairs exercises contrasting similar phonemes
- Local progress tracking without account requirements

### Phase 3: Speech Input & Feedback (Interaction)
**Goal**: Enable learners to produce sounds and receive basic feedback using speech recognition APIs.

**Key Features**:
- Phoneme pronunciation checking with pass/fail feedback
- Word repetition mode for confidence building
- Feedback system that suggests correct phonemes and links to IPA chart

### Phase 4: Intelligent Feedback & Customization (Personalization)
**Goal**: Move towards personalized learning paths and better phoneme accuracy analysis.

**Key Features**:
- Phoneme-level error analysis using forced alignment or fine-tuned ASR models
- Personalized practice lists based on user's weak phonemes
- User accounts with cloud sync for cross-device progress

### Phase 5: Advanced Features (Enhancement)
**Goal**: Enhance engagement and depth for advanced learners and classroom integration.

**Possible Features**:
- Connected speech and prosody training (linking words, stress, intonation)
- Contextual pronunciation challenges within sentences
- Gamified learning paths with badges, levels, and streaks
- Teacher dashboard for class-based learning and progress monitoring

## Success Metrics & Goals

### Learning Outcomes
- Users can identify and describe how to produce unfamiliar phonemes
- Learners successfully use transcription tool for new vocabulary understanding
- Improved pronunciation accuracy in targeted phonemes
- Increased confidence in approaching unfamiliar English words

### User Experience Metrics
- Intuitive navigation of IPA chart without intimidation
- Regular use of transcription tool for vocabulary learning
- Engagement with articulation guides and audio examples
- Progressive improvement in phoneme recognition and production

### Accessibility Goals
- WCAG compliance for users with disabilities
- Keyboard navigation support
- Screen reader compatibility
- Mobile-first responsive design
- Works across varying technical literacy levels

## Technical Architecture Philosophy

### Modern Web Standards
- **Performance-first**: Instant IPA chart interaction, minimal loading times
- **Responsive design**: Mobile-first approach for learners using phones and tablets

### Scalability Considerations
- **Multi-accent support**: Architecture supports adding British English, Australian, etc.
- **Multi-language potential**: Data structure can extend beyond English phonemes
- **Modular components**: Easy to add new features without architectural changes
- **API-ready**: Backend architecture supports future mobile apps or integrations
- **Performance optimization**: Efficient handling of 40+ phonemes with instant interactions

### Development Standards
- **Monorepo architecture**: Clear separation between web app, API, shared data, and utilities
- **Type safety**: Full TypeScript implementation with strict settings
- **Component composition**: Reusable UI elements with compound component patterns
- **Data-driven UI**: Grid layouts generated from comprehensive phoneme data structures
- **Modern tooling**: Vite, React 19, TanStack Router, Tailwind CSS v4, shadcn/ui

---

*Phonix transforms pronunciation learning by making the International Phonetic Alphabet accessible, interactive, and immediately practical for ESL learners. By focusing on phoneme-level understanding, learners build a solid foundation for accurate English pronunciation that goes beyond word-by-word practice.*

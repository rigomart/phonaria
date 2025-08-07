---
applyTo: '**'
---


# Phonix

## Why This Project Exists

Phonix addresses a critical gap in English language learning: the lack of accessible, phoneme-focused pronunciation tools for ESL learners. Traditional pronunciation apps often focus on word-level practice or conversation, missing the foundational phoneme awareness that drives lasting pronunciation improvement.

## Problems It Solves

### 1. **Phoneme Blindness**
Most ESL learners struggle with individual English sounds because they can't hear or produce phonemes they don't know exist. Phonix makes these invisible building blocks visible through IPA.

### 2. **IPA Intimidation**
The International Phonetic Alphabet appears overwhelming to learners. Phonix presents IPA in a friendly, interactive format that builds confidence rather than confusion.

### 3. **Context Isolation**
Traditional phoneme practice happens in isolation. Phonix connects individual phonemes to real sentences, showing how sounds change in context.

### 4. **Feedback Gap**
Without a teacher, learners struggle to know if they're pronouncing correctly. While Phonix doesn't analyze speech, it provides clear audio models and detailed articulation guides.

## How It Should Work

### Learning Flow
1. **Discovery**: Learners explore the interactive IPA chart to understand English phonemes
2. **Practice**: Sentence analysis shows how phonemes combine in real speech
3. **Reinforcement**: Audio models and articulation guides support self-practice

### Pedagogical Approach
- **Phonemic Focus**: Emphasizes meaning-distinguishing sounds over allophonic detail
- **Contextual Learning**: Connects individual phonemes to sentence-level pronunciation

## User Experience Goals

### Primary User: Intermediate ESL Learner
- **Goal**: Improve pronunciation for professional or academic contexts
- **Challenge**: Knows vocabulary but struggles with accent clarity
- **Motivation**: Wants systematic, self-paced improvement

### Experience Principles
- **Approachable**: No prior IPA knowledge required
- **Efficient**: Maximum learning value per interaction
- **Practical**: Focus on sounds that impact intelligibility
- **Mobile-First**: Practice anywhere, anytime

### Success Indicators
- Users can identify and produce target phonemes after practice
- Users report improved confidence in pronunciation
- Users return regularly for continued practice

## Core Requirements
- **Target Audience:** Intermediate-to-advanced ESL learners
- **Learning Focus:** Individual phonemes using International Phonetic Alphabet (IPA)
- **Pedagogical Philosophy:** Effective learning over strict phonetic accuracy
- **MVP Scope:** Interactive IPA chart + Sentence analysis with AI-generated pronunciation

## Key Constraints
- **Accent:** Only American English (General American)
- **Language:** English UI only
- **Authentication:** None required
- **Progress Tracking:** Not included
- **Speech Analysis:** No AI-based user speech analysis for now

## Success Criteria
- Functional interactive IPA chart with 40 English phonemes
- Sentence analysis with G2P conversion
- AI-generated pronunciation audio
- Clean, responsive dark mode interface
- Mobile-first design

## Technical Boundaries
- **Frontend:** React + TypeScript + shadcn/ui
- **Backend:** Hono.js for API/LLM integration
- **LLM:** Fine tuned OpenAI model for G2P conversion
- **Audio:** Each phoneme has two corresponding audio files for the example words
- **Architecture:** Monorepo with pnpm workspaces

# Data Layer Architecture Redesign

This document outlines the transition from the current oRPC + TanStack Query architecture to Server Actions with tiered client-side data.

## Motivation

### Why Migrate?

The current architecture works, but has friction points that will compound as Phonaria grows:

- **Layer complexity** - Requests flow through TanStack Query → oRPC client → HTTP → oRPC server → service. Server Actions collapse this to a direct function call.

- **Every lookup hits the server** - Common words like "the", "hello", "cat" require network round-trips. ESL learners mostly use high-frequency vocabulary that could be resolved instantly on the client.

- **Bundle overhead** - oRPC client + TanStack Query add ~20-30KB to the client bundle for patterns we don't fully leverage (TanStack Query caching is underused since most data is user-input driven).

- **Library coupling** - Direct imports from oRPC throughout the codebase. If the library changes or becomes unmaintained, migration is painful.

- **Future apps blocked** - Adding an IPA Wordle game or other apps to the monorepo would require duplicating the oRPC setup or over-engineering a shared API layer.

### What We Gain

| Aspect | Improvement |
|--------|-------------|
| Simplicity | Server Actions are just async functions |
| Performance | 80-95% of word lookups resolved client-side |
| Bundle size | Remove ~20KB of client dependencies |
| Flexibility | Abstraction layer makes library swappable |
| Future-ready | Tiered data enables offline mode, new apps |

### Trade-offs

- Migration effort across three features (G2P, Find by Sound, Dictionary)
- next-safe-action is a smaller library (maintenance risk mitigated by abstraction)
- Tiered data requires generating and maintaining curated word lists

## Overview

### Current State

```
┌─────────────────────────────────────────────────────────┐
│                    Client Component                     │
│                          │                              │
│                          ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │            TanStack Query                        │   │
│  │   useMutation / useQuery                         │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    │                                    │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │            oRPC Client                           │   │
│  │   orpc.g2p.transcribe.mutationOptions()         │   │
│  └─────────────────┬───────────────────────────────┘   │
└────────────────────┼────────────────────────────────────┘
                     │ HTTP
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  /api/* Routes                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  oRPC Server (procedures, middleware)           │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service Layer                                   │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgreSQL (130k CMUDict words)                │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Target State

```
┌─────────────────────────────────────────────────────────┐
│                    Client Component                     │
│                          │                              │
│            ┌─────────────┴─────────────┐               │
│            ▼                           ▼               │
│  ┌──────────────────┐       ┌──────────────────┐      │
│  │  Tiered Lookup   │       │  useAction Hook  │      │
│  │  (client data)   │       │  (abstraction)   │      │
│  └────────┬─────────┘       └────────┬─────────┘      │
│           │                          │                 │
│     ┌─────┴─────┐                    │                 │
│     ▼           ▼                    │                 │
│  ┌─────┐    ┌──────┐                 │                 │
│  │ 1k  │    │ 10k  │                 │                 │
│  │words│    │words │                 │                 │
│  └─────┘    └──────┘                 │                 │
│     │           │                    │                 │
│     └─────┬─────┘                    │                 │
│           │ miss                     │                 │
│           ▼                          ▼                 │
│  ┌─────────────────────────────────────────────────┐  │
│  │              Server Actions                      │  │
│  │         (next-safe-action abstraction)          │  │
│  └─────────────────┬───────────────────────────────┘  │
└────────────────────┼────────────────────────────────────┘
                     │ Direct call
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │  Service Layer (unchanged)                       │   │
│  └─────────────────┬───────────────────────────────┘   │
│                    ▼                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  PostgreSQL (full CMUDict, Find by Sound)       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### What's Changing

| Component | Current | Target |
|-----------|---------|--------|
| API layer | oRPC procedures + API routes | Server Actions |
| Data fetching | TanStack Query | useAction hook + tiered lookup |
| Client data | None (always server) | 1k/10k word chunks |
| Middleware | oRPC middleware chain | next-safe-action middleware |

### What's NOT Changing

- **PostgreSQL database** - Required for Find by Sound feature which uses `LIKE 'prefix%'` queries across 130k words. Client-side alternatives (static files, KV stores) don't support efficient prefix matching.
- **`@phonaria/phonetics-data` package** - Registries and types remain the source of truth for phoneme metadata.
- **Service layer logic** - `processG2P`, `searchPhonemes`, etc. stay unchanged; only the calling layer changes.
- **Zustand stores** - Complex client state (variant selections, UI state) continues using Zustand.
- **Zod schemas** - Validation schemas are reused in Server Actions.

---

## Core Decisions

### 0. Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| External API consumers | None planned | All `/api/*` routes can be removed in Phase 4 |
| Rate limiting | Same Upstash approach | Reuse existing `@upstash/ratelimit` in action middleware |
| Frequency data source | wordfreq | CC-BY-SA 4.0, combines spoken + written English |

### 1. Server Actions with Abstraction Layer

Use `next-safe-action` as the implementation, but wrap it in an abstraction layer to allow future replacement if the library becomes unmaintained.

**Principle:** Consumer code never imports from `next-safe-action` directly.

```
lib/actions/
├── index.ts           # Public API
├── types.ts           # Interfaces we control
├── client.ts          # Re-exports from impl
├── hooks.ts           # useAction wrapper
└── impl/
    └── next-safe-action.ts   # Swappable implementation
```

#### Types (Our Contract)

```typescript
// lib/actions/types.ts
export interface ActionMetadata {
  actionName: string;
}

export type ActionResult<TData> =
  | { success: true; data: TData }
  | { success: false; error: ActionError };

export interface ActionError {
  code: string;
  message: string;
  details?: unknown;
}

export interface UseActionResult<TInput, TData> {
  execute: (input: TInput) => void;
  executeAsync: (input: TInput) => Promise<ActionResult<TData>>;
  result: ActionResult<TData> | undefined;
  isIdle: boolean;
  isExecuting: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}
```

#### Action Client Pattern

```typescript
// lib/actions/clients.ts
import { createActionClient } from "@/lib/actions";

export const actionClient = createActionClient({
  handleServerError: (e) => ({
    code: "SERVER_ERROR",
    message: e.message,
  }),
});

export const rateLimitedAction = actionClient.use(async ({ next }) => {
  const rateLimit = await checkRateLimit();
  if (!rateLimit.success) {
    throw new Error("Rate limited");
  }
  return next();
});
```

#### Action Definition Pattern

```typescript
// app/[locale]/transcription/_actions/transcribe.ts
"use server";

import { rateLimitedAction } from "@/lib/actions/clients";
import { g2pRequestSchema } from "@/lib/g2p/model";
import { processG2P } from "@/lib/g2p/service";

export const transcribeAction = rateLimitedAction
  .metadata({ actionName: "transcribe" })
  .inputSchema(g2pRequestSchema)
  .action(async ({ parsedInput }) => {
    return processG2P(parsedInput.text);
  });
```

#### Client Consumption Pattern

```typescript
// Component usage
"use client";

import { useAction } from "@/lib/actions";
import { transcribeAction } from "../_actions/transcribe";

export function TranscriptionForm() {
  const { execute, isExecuting, result } = useAction(transcribeAction, {
    onSuccess: (data) => { /* handle success */ },
    onError: (error) => { /* handle error */ },
  });

  const handleSubmit = (text: string) => {
    execute({ text });
  };

  // ...
}
```

### 2. State Management

- **Remove TanStack Query** - `useAction` hook provides loading/error states
- **Keep Zustand** - For complex state that needs to persist across components (e.g., g2p-store for variant selections)
- **Use useState** - For simple component-local state

### 3. Tiered Client-Side Data

Progressive lookup through client-cached data before hitting the server.

```
Lookup: "hello"
         │
         ▼
┌─────────────────────────────────────────┐
│ Tier 1: Top 1,000 words                 │
│ - Bundled inline (~22 KB)               │
│ - Zero latency                          │
│ - Covers ~80% of everyday usage         │
└────────────────┬────────────────────────┘
                 │ miss
                 ▼
┌─────────────────────────────────────────┐
│ Tier 2: Top 10,000 words                │
│ - Lazy-loaded chunk (~273 KB)           │
│ - Cached after first load               │
│ - Covers ~95% of learner vocabulary     │
└────────────────┬────────────────────────┘
                 │ miss
                 ▼
┌─────────────────────────────────────────┐
│ Tier 3: Server Action                   │
│ - Full 130k CMUDict via PostgreSQL      │
│ - Network round-trip                    │
│ - Rare words, proper nouns, technical   │
└─────────────────────────────────────────┘
```

#### Data Structure

The curated chunks store minimal data - just word → CMU ARPABET mappings. IPA conversion, syllabification, and phoneme key generation are handled at runtime using existing TypeScript utilities (`cmuVariantToIpa`, etc.).

```typescript
// packages/phonetics-data/data/curated/top-1k.json
{
  "meta": {
    "version": "1.0.0",
    "tier": "1k",
    "wordCount": 1000,
    "license": "CC-BY-SA-4.0",
    "attribution": "Derived from wordfreq...",
    "sources": { "wordfreq": "...", "cmudict": "..." }
  },
  "words": {
    "hello": "HH AH0 L OW1",
    "world": "W ER1 L D",
    "language": "L AE1 NG G W AH0 JH"
  }
}
```

#### Lookup Service

```typescript
// lib/phoneme-lookup/index.ts
import { cmuVariantToIpa } from "@phonaria/phonetics-data";
import top1k from "@phonaria/phonetics-data/curated/top-1k.json";

let top10k: typeof top1k | null = null;

export type LookupSource = "tier1" | "tier2" | "server";

export interface LookupResult {
  cmu: string | null;      // "HH AH0 L OW1"
  source: LookupSource;
}

export async function lookupWord(word: string): Promise<LookupResult> {
  const normalized = word.toLowerCase().trim();

  // Tier 1: Inline bundle
  if (top1k.words[normalized]) {
    return { cmu: top1k.words[normalized], source: "tier1" };
  }

  // Tier 2: Lazy-loaded
  if (!top10k) {
    top10k = (await import("@phonaria/phonetics-data/curated/top-10k.json")).default;
  }
  if (top10k.words[normalized]) {
    return { cmu: top10k.words[normalized], source: "tier2" };
  }

  // Tier 3: Server fallback
  const result = await lookupWordAction(normalized);
  return { cmu: result.data ?? null, source: "server" };
}

// Convert to IPA at runtime
function toIpa(cmu: string): string {
  return cmuVariantToIpa(cmu);
}

// Batch lookup for G2P (check client tiers first, batch server calls)
export async function batchLookup(words: string[]): Promise<BatchLookupResult> {
  // ... check tier1, tier2, return missing for server
}
```

---

## Data Generation Pipeline

### Curated Chunks (Already Generated)

Word chunks have been generated from CMUDict + wordfreq frequency data.

```
Input:
├── CMUDict (packages/phonetics-data/data/dict/cmudict.json)
└── wordfreq library (Python, installed via pip)

Script: packages/helper-scripts/generate-curated-chunks.py

Output:
└── packages/phonetics-data/data/curated/
    ├── top-1k.json   (1,000 words, ~22 KB)
    └── top-10k.json  (10,000 words, ~273 KB)
```

#### Frequency Data Source: wordfreq

**Decision:** Use [wordfreq](https://github.com/rspeer/wordfreq) by Robyn Speer.

| Aspect | Details |
|--------|---------|
| License | Apache 2.0 (code), CC-BY-SA 4.0 (data) |
| Sources | Google Books Ngrams, OpenSubtitles, SUBTLEX, Wikipedia, Reddit, Twitter |
| Coverage | 97.3% overlap with NGSL (ESL word list) - no need for separate NGSL source |
| CMUDict match | 98.3% of top 10k words have CMUDict pronunciations |

**Why wordfreq over alternatives:**
- Combines spoken English (subtitles) + written English - ideal for ESL learners
- MIT-compatible licensing allows redistribution
- Python library with clean API (`top_n_list('en', 10000)`)
- Single source for both tiers (consistency)

#### Licensing Requirements

The generated files (`top-1k.json`, `top-10k.json`) are licensed under **CC-BY-SA 4.0**.

Required attribution (see `phonetics-data/README.md` for full text):
> Word frequency data derived from wordfreq by Robyn Speer (CC-BY-SA 4.0), incorporating data from Google Books Ngrams, OpenSubtitles, SUBTLEX (Brysbaert et al.), and Wikipedia. Pronunciations from CMUDict (Public Domain).

#### Regenerating Chunks

```bash
cd packages/helper-scripts
pip install wordfreq
python generate-curated-chunks.py
```

---

## Migration Phases

### Phase 1: Foundation

Set up the abstraction layer while keeping existing code working.

- Create `lib/actions/` structure
- Implement types and wrappers around next-safe-action
- No changes to existing oRPC code yet

### Phase 2: Actions Migration

Convert oRPC procedures to Server Actions one feature at a time.

**Order:**
1. Find by Sound (simplest, isolated)
2. G2P Transcription (core feature)
3. Dictionary Lookup (external API passthrough)

For each:
- Create Server Action using abstraction
- Update component to use `useAction`
- Remove oRPC usage from that feature
- Test thoroughly

### Phase 3: Data Tiers

Implement client-side tiered lookup.

- ~~Choose and acquire frequency list source~~ (Done: wordfreq)
- ~~Create `generate-curated-chunks` helper script~~ (Done: Python script)
- ~~Generate top-1k.json and top-10k.json~~ (Done: files in `data/curated/`)
- Implement `lib/phoneme-lookup/` service
- Integrate with G2P for client-first lookups

### Phase 4: Cleanup

Remove deprecated dependencies.

- Delete all `/api/*` routes (no external consumers planned)
- Remove oRPC packages (@orpc/server, @orpc/client, @orpc/tanstack-query)
- Remove TanStack Query (@tanstack/react-query)
- Update package.json
- Final testing

---

## Dependency Changes

### Remove

```
@orpc/server
@orpc/client
@orpc/tanstack-query
@tanstack/react-query
```

### Add

```
next-safe-action
```

### Keep

```
zustand
zod
@upstash/ratelimit (for rate limiting middleware)
```

---

## File Organization After Migration

```
apps/web/src/
├── lib/
│   ├── actions/                    # NEW: Action abstraction
│   │   ├── index.ts
│   │   ├── types.ts
│   │   ├── client.ts
│   │   ├── hooks.ts
│   │   ├── clients.ts              # rateLimitedAction, etc.
│   │   └── impl/
│   │       └── next-safe-action.ts
│   │
│   ├── phoneme-lookup/             # NEW: Tiered lookup
│   │   ├── index.ts
│   │   └── batch.ts
│   │
│   ├── g2p/                        # MOVED from api/g2p/
│   │   ├── service.ts
│   │   ├── model.ts
│   │   └── ...
│   │
│   └── phoneme-search/             # MOVED from api/phoneme-search/
│       ├── service.ts
│       └── ...
│
├── app/
│   ├── [locale]/
│   │   ├── transcription/
│   │   │   ├── _actions/           # NEW: Co-located actions
│   │   │   │   └── transcribe.ts
│   │   │   ├── _components/
│   │   │   └── ...
│   │   │
│   │   └── find-by-sound/
│   │       ├── _actions/
│   │       │   └── search.ts
│   │       └── ...
│   │
│   └── api/                        # REMOVED (no external consumers)

packages/phonetics-data/
├── data/
│   ├── dict/
│   │   └── cmudict.json            # Existing
│   └── curated/                    # DONE
│       ├── top-1k.json             # 1,000 words, ~22 KB
│       └── top-10k.json            # 10,000 words, ~273 KB
```

---

## Future Considerations

### Additional Apps in Monorepo

The abstraction layer and `@phonaria/phonetics-data` package are designed to support multiple apps:

- Server Actions are app-specific (not shared)
- Curated word chunks can be consumed by any app
- Phoneme registries remain shared

### Replacing next-safe-action

If the library becomes unmaintained:

1. Only `lib/actions/impl/next-safe-action.ts` needs to change
2. Options: fork the library, switch to alternative, or implement minimal version
3. Consumer code (actions, components) remains unchanged

### Offline Support

The tiered data architecture enables future offline support:

- Tier 1 + Tier 2 cover 95%+ of learner vocabulary
- Could add Service Worker for full offline mode
- IndexedDB for persistent caching of Tier 2

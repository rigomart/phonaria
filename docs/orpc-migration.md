# ORPC Migration Specification

## Overview

This document outlines the migration from Elysia + Eden Treaty to ORPC with Next.js Adapter for the Phonaria web application. The migration will be multi-phased, maintaining backward compatibility with existing endpoints until final cleanup.

**Goals:**
- Replace Elysia + Eden Treaty with ORPC
- Maintain end-to-end type safety
- Optimize SSR with server-side direct calls
- Keep transformation logic appropriate to each layer
- Zero downtime during migration

**Scope:**
- G2P (Grapheme-to-Phoneme) transcription endpoint
- Dictionary lookup endpoint
- Phoneme search endpoint
- All associated client-side hooks and components

---

## Architecture Decisions

### 1. Endpoint Routing

- **Current:** Elysia app mounted at `/api` with individual routes at `/api/g2p`, `/api/dictionary`, `/api/phoneme-search`
- **Target:** ORPC router mounted at `/api/rpc` using Next.js catch-all route `app/api/rpc/[[...rest]]/route.ts`
- **Backward Compatibility:** Keep existing Elysia routes operational until Phase 11

### 2. Context Management

ORPC uses a two-tier context model:

**Initial Context:** Static dependencies passed when invoking procedures
- Example: `{ request: Request }` passed in route handler

**Execution Context:** Dynamic context computed by middleware
- Example: `{ pending: Promise<void> }` added by rate limit middleware
- Example: `{ headers: Headers }` added by Next.js headers middleware

**Decision:** Pass `Request` object as initial context in route handler. Use middleware to inject rate limit `pending` promise and other runtime data.

### 3. Middleware Strategy

Create dedicated middleware modules for cross-cutting concerns:

- **Rate Limiting:** Checks Upstash Redis, throws `RateLimitExceededError`, injects `pending` promise
- **Error Handling:** Logs errors with `onError` interceptor
- **Context Injection:** Optional future middleware for auth, headers, etc.

Middleware is applied per-router for granular control, or at handler level for global behavior.

### 4. Data Transformation Philosophy

**Rule:** Transformations should be placed where they conceptually belong:

| Transformation Type | Layer | Rationale |
|-------------------|--------|------------|
| Data enrichment with phonetics data | API (service layer) | Phonetics registry is backend concern |
| UI-specific metadata (indexes, timestamps) | Frontend (client hooks) | Belongs to UI state management |
| Response normalization for client consumption | API (procedures) | Ensures consistent contract |
| Light formatting (dates, text) | Either | Case-by-case decision |

**Current G2P Analysis:**
- `wordIndex`, `phonemeIndex`: UI-specific, keep in frontend
- `selectedVariantIndex`: UI state, keep in frontend
- `originalText`, `timestamp`: Client-side metadata, keep in frontend
- **Conclusion:** Current structure is appropriate. Refactor for code organization only.

### 5. Type-Safe Errors

Define error types as first-class constructs:

- `RateLimitExceededError`: 429 status, "Too many requests"
- `NotFoundError`: 404 status, "Resource not found"
- `ValidationError`: 400 status, "Invalid input"

Use `isDefinedError()` on client to detect and handle specific error types with full type safety.

---

## Migration Phases

### Phase 1: Foundation Setup

**Objective:** Establish ORPC infrastructure without touching existing code.

**Deliverables:**
1. Install packages: `@orpc/server`, `@orpc/tanstack-query`, `@orpc/client/standard`, `@orpc/server/fetch`
2. Create ORPC router structure:
   - `app/api/rpc/router.ts` - Base router with context definitions
   - `app/api/rpc/index.ts` - Public exports
3. Create middleware:
   - `app/api/rpc/middleware/rate-limit.ts` - Wraps existing `checkRateLimit`
   - `app/api/rpc/middleware/error-handler.ts` - Global error logging
4. Create route handler:
   - `app/api/rpc/[[...rest]]/route.ts` - Next.js catch-all with RPCHandler
5. Enable SSR optimization:
   - `lib/orpc.server.ts` - Server-side client
   - Import in root layout: `app/[locale]/layout.tsx`

**Validation:** Route handler responds to requests, errors are logged, server client initializes without errors.

---

### Phase 2: Create ORPC Procedures

**Objective:** Implement ORPC procedures using existing service logic.

**Deliverables:**
1. G2P procedure (`app/api/rpc/g2p/router.ts`)
   - Input: `text` (1-200 chars, validated with existing regex)
   - Output: Words array with variants, phonemes, stress, source
   - Middleware: Rate limiting
   - Service: Reuse `processG2P` from existing service

2. Dictionary procedure (`app/api/rpc/dictionary/router.ts`)
   - Input: `word` (1-64 chars)
   - Output: Normalized definition with phonetics, meanings, audio
   - Middleware: Rate limiting
   - Service: Reuse `fetchWordDefinition` from existing service

3. Phoneme search procedure (`app/api/rpc/phoneme-search/router.ts`)
   - Input: `path` (array of ARPABET tokens), `limit` (1-200, default 50)
   - Output: Words array, total count, next phoneme suggestions
   - Middleware: Rate limiting
   - Service: Reuse `searchPhonemes` from existing service

**Schemas:** Import existing Zod schemas from `app/api/[[...slugs]]/*/model.ts`. Do not redefine.

**Validation:** Each procedure responds to manual requests (curl/Postman) with correct data shapes and rate limit enforcement.

---

### Phase 3: ORPC Client Setup

**Objective:** Create isomorphic client with SSR optimization.

**Deliverables:**
1. Client client (`lib/orpc.ts`)
   - Uses `RPCLink` for browser requests
   - Falls back to global server client when on server
   - URL: `/api/rpc`

2. Server client (`lib/orpc.server.ts`)
   - Uses `createRouterClient` for direct procedure calls
   - Imports Next.js headers for context
   - Cached globally via `globalThis.$orpcClient`

**Validation:** Server client works in server components without HTTP requests. Browser client makes requests to `/api/rpc`.

---

### Phase 4: TanStack Query Integration

**Objective:** Replace custom client functions with ORPC TanStack Query utilities.

**Deliverables:**
1. Query utilities (`lib/orpc/query-utils.ts`)
   - Create with `createTanstackQueryUtils(orpc)`
   - Configure default options:
     - Dictionary: 1hr stale, 24hr GC, no refetch
     - Phoneme search: 15s stale
     - G2P: Error handling defaults

2. RPC JSON serializer (`lib/orpc/serializer.ts`)
   - `StandardRPCJsonSerializer` for hydration support
   - Add custom serializers if needed (Date objects, etc.)

3. Query client update (`app/[locale]/_hooks/get-query-client.ts`)
   - Integrate serializer into `queryKeyHashFn`
   - Integrate serializer into `dehydrate.serializeData`
   - Integrate serializer into `hydrate.deserializeData`

**Validation:** Query client starts without errors, hydration passes custom types correctly.

---

### Phase 5: Migrate G2P Hooks

**Objective:** Replace G2P client with ORPC calls.

**Deliverables:**
1. Refactor `g2p-client.ts`
   - Export `transformToTranscriptionResult` function
   - Keep transformation logic (indexes, timestamps)
   - Document: These are UI-specific transformations

2. Update `use-g2p.ts`
   - Replace `transcribeText` call with `api.g2p.transcribe.mutationOptions`
   - Apply transformation on success
   - Update query data with transformed result

**Validation:** Transcription feature works end-to-end, variant selection works, phoneme clicks work.

---

### Phase 6: Migrate Dictionary Hooks

**Objective:** Replace dictionary client with ORPC calls.

**Deliverables:**
1. Update `use-dictionary.ts`
   - Replace `fetchDefinition` call with `api.dictionary.lookup.queryOptions`
   - Use `skipToken` for conditional queries (when `word` is null)
   - Remove custom retry logic (ORPC handles)

**Validation:** Dictionary lookups work, 404s are handled correctly, rate limit errors display appropriately.

---

### Phase 7: Migrate Phoneme Search

**Objective:** Replace phoneme search client with ORPC calls.

**Deliverables:**
1. Update `phoneme-search-client.tsx`
   - Replace `fetchPhonemeSearch` call with `api.phonemeSearch.search.queryOptions`
   - Use `skipToken` for conditional queries (when path is empty)
   - Access `searchQuery.data` directly (shape is same)

**Validation:** Phoneme path builder works, results display correctly, next phoneme suggestions work.

---

### Phase 8: Testing & Validation

**Objective:** Comprehensive testing before cleanup.

**Deliverables:**
1. Manual API testing
   - Test each procedure with valid and invalid inputs
   - Verify rate limit headers and behavior
   - Verify error responses

2. Client integration testing
   - Test all features end-to-end (transcription, dictionary, phoneme search)
   - Test error handling (rate limits, 404s, validation errors)
   - Test browser and server contexts

3. Quality checks
   - `bun check-types`: No type errors
   - `bun lint`: Code passes all linter rules
   - `bun test`: All tests pass

**Validation:** All features work, no regressions, code quality standards met.

---

### Phase 9: Data Transformation Review

**Objective:** Ensure transformations are appropriately placed.

**Deliverables:**
1. Transformation audit
   - Document all transformations currently in `g2p-client.ts`
   - Categorize as API responsibility vs UI responsibility
   - Identify any missing transformations that should move to API

2. Refactoring (if needed)
   - Move any backend-appropriate transformations to procedures
   - Keep UI-specific transformations in client hooks
   - Ensure clear separation in code comments

**Current Assessment:** No major transformations need to move. Refactor only for organization and documentation.

**Validation:** Transformation logic is clear, documented, and appropriately placed.

---

### Phase 10: Type-Safe Error Handling

**Objective:** Replace string errors with typed error constructs.

**Deliverables:**
1. Define error types (`app/api/rpc/errors.ts`)
   - `RateLimitExceededError` (429)
   - `NotFoundError` (404)
   - `ValidationError` (400)

2. Update middleware
   - Throw `RateLimitExceededError` in rate limit middleware

3. Update procedures
   - Throw `NotFoundError` when dictionary returns null
   - Throw `ValidationError` for phoneme search errors

4. Update client hooks
   - Use `isDefinedError()` to detect specific errors
   - Handle each error type appropriately (toast messages, user feedback)

**Validation:** All errors are type-safe, error handling is consistent across endpoints.

---

### Phase 11: Cleanup

**Objective:** Remove deprecated code and dependencies.

**Deliverables:**
1. Delete old routes
   - `app/api/[[...slugs]]/g2p/index.ts`
   - `app/api/[[...slugs]]/dictionary/index.ts`
   - `app/api/[[...slugs]]/phoneme-search/index.ts`
   - `app/api/[[...slugs]]/route.ts`

2. Delete old client files
   - `lib/eden/client.ts`
   - `lib/eden/server.ts`

3. Remove Elysia dependencies
   - `bun remove elysia @elysiajs/eden`
   - Verify no other code imports from Elysia

4. Keep service layer
   - Retain all `service.ts` and `model.ts` files
   - These contain reusable business logic
   - Consider moving to `app/api/shared/` for clarity (optional)

5. Final verification
   - Run full application test suite
   - Verify no runtime errors
   - Check for any remaining Elysia references

**Validation:** Application runs without Elysia, old endpoints are gone, all features work.

---

## File Structure

### New Files to Create

```
apps/web/
├── app/api/rpc/
│   ├── router.ts                          # Main router with base context
│   ├── index.ts                           # Public exports
│   ├── [[...rest]]/
│   │   └── route.ts                      # Next.js route handler
│   ├── middleware/
│   │   ├── rate-limit.ts                  # Rate limiting middleware
│   │   └── error-handler.ts              # Error logging middleware
│   ├── g2p/
│   │   └── router.ts                     # G2P procedures
│   ├── dictionary/
│   │   └── router.ts                     # Dictionary procedures
│   ├── phoneme-search/
│   │   └── router.ts                     # Phoneme search procedures
│   └── errors.ts                         # Type-safe error definitions
├── lib/
│   ├── orpc.ts                           # Isomorphic client
│   ├── orpc.server.ts                     # Server-side client
│   ├── orpc/
│   │   ├── query-utils.ts                # TanStack Query utilities
│   │   └── serializer.ts               # RPC JSON serializer
```

### Files to Modify

```
apps/web/
├── app/[locale]/
│   ├── layout.tsx                         # Import orpc.server
│   ├── _hooks/
│   │   └── get-query-client.ts           # Add serializer
│   └── transcription/
│       ├── _hooks/
│       │   ├── use-g2p.ts               # Use ORPC + transform
│       │   └── use-dictionary.ts        # Use ORPC
│       └── _lib/
│           └── g2p-client.ts            # Export transform function
└── app/[locale]/phoneme-search/
    └── _components/
        └── phoneme-search-client.tsx   # Use ORPC
```

### Files to Delete (Phase 11)

```
apps/web/
├── app/api/[[...slugs]]/                # Old Elysia routes
│   ├── g2p/index.ts
│   ├── dictionary/index.ts
│   ├── phoneme-search/index.ts
│   └── route.ts
└── lib/eden/                             # Old Eden clients
    ├── client.ts
    └── server.ts
```

### Files to Keep (Service Layer)

```
apps/web/
└── app/api/[[...slugs]]/                  # Business logic
    ├── g2p/
    │   ├── service.ts                    # Keep
    │   ├── model.ts                     # Keep
    │   └── (other utility files)        # Keep
    ├── dictionary/
    │   ├── service.ts                    # Keep
    │   └── model.ts                     # Keep
    ├── phoneme-search/
    │   ├── service.ts                    # Keep
    │   └── model.ts                     # Keep
    └── _shared/
        └── rate-limit.ts                # Keep
```

---

## Key Implementation Notes

### Rate Limiting Middleware

The `checkRateLimit` function returns a `pending` promise that must be awaited for analytics. Design pattern:

```typescript
// In middleware
const { isRateLimited, pending } = await checkRateLimit(request)
if (isRateLimited) {
  await pending  // Ensure analytics complete
  throw RateLimitExceededError()
}

// Pass pending to procedure
return next({
  context: { pending }
})

// In procedure
const result = await processG2P(input.text)
await context.pending  // Ensure analytics complete
return result
```

### Query Key Management

ORPC automatically generates query keys. No manual management needed:

```typescript
// Old way
queryKey: ['dictionary', word]

// New way (automatic)
api.dictionary.lookup.key({ input: { word } })
```

### Conditional Queries with skipToken

Use TanStack Query's `skipToken` for conditional queries instead of `enabled: false`:

```typescript
// Old way
useQuery({
  queryKey: ['dictionary', word],
  queryFn: () => fetchDefinition(word),
  enabled: !!word,
})

// New way
useQuery(
  api.dictionary.lookup.queryOptions({
    input: word ? { word } : skipToken,
  })
)
```

### Error Handling Pattern

Use `isDefinedError` for type-safe error detection:

```typescript
import { isDefinedError } from '@orpc/client'
import { RateLimitExceededError, NotFoundError } from '@/app/api/rpc/errors'

const mutation = useMutation(
  api.g2p.transcribe.mutationOptions({
    onError: (error) => {
      if (isDefinedError(error, RateLimitExceededError)) {
        // Handle specifically
      } else if (isDefinedError(error, NotFoundError)) {
        // Handle specifically
      } else {
        // Generic fallback
      }
    },
  })
)
```

---

## Rollback Plan

If issues arise during migration:

1. **Phase 1-4 (Infrastructure only):** No impact on existing features. Safe to rollback completely.

2. **Phase 5-7 (Hook migration):** Old Elysia endpoints still active. If ORPC has issues:
   - Revert hooks to use old client functions
   - Keep old client files
   - ORPC procedures and handlers can remain dormant

3. **Phase 8-10 (Enhancements):** If type-safe errors cause issues:
   - Revert to string errors in procedures
   - Client error handling can stay generic

4. **Phase 11 (Cleanup):** Highest risk point. Before cleanup:
   - Verify all features work with ORPC only
   - Remove Elysia routes in staging first
   - Monitor for any issues in production

---

## Success Criteria

Migration is complete when:

- [ ] All endpoints respond via `/api/rpc` with correct types
- [ ] All client hooks use ORPC TanStack Query utilities
- [ ] SSR optimization works (server client makes direct calls)
- [ ] No Elysia code remains in codebase
- [ ] Type safety is maintained end-to-end
- [ ] All tests pass
- [ ] All features work as expected
- [ ] No runtime errors in browser console
- [ ] No performance regressions
- [ ] Documentation is updated

---

## References

- [ORPC Documentation](https://orpc.dev)
- [Next.js Adapter](https://orpc.dev/docs/adapters/next)
- [TanStack Query Integration](https://orpc.dev/docs/integrations/tanstack-query)
- [Middleware](https://orpc.dev/docs/middleware)
- [Context](https://orpc.dev/docs/context)
- [Type-Safe Errors](https://orpc.dev/docs/error-handling)

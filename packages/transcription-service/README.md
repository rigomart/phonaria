# @phonaria/transcription-service

Framework-neutral transcription service for Phonaria. Provides grapheme-to-phoneme (G2P) conversion with database lookups and fallback generation.

## Features

- **Framework-agnostic**: Works with Next.js, TanStack Start, or any other framework
- **Lazy database configuration**: No production secrets required at import time
- **Type-safe contracts**: Input/output validation with Zod
- **Testable**: Supports dependency injection for database clients

## Usage

```typescript
import { transcribeWords, type TranscriptionInput } from '@phonaria/transcription-service';
import { createDbClient } from '@phonaria/transcription-service/db';

// Create a database client (only when needed)
const dbClient = createDbClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Transcribe words
const input: TranscriptionInput = {
  words: ['hello', 'world'],
};

const result = await transcribeWords(input, { dbClient });
```

## Testing

### Unit Tests

Run unit tests with mocked database:

```bash
bun test
```

### Integration Tests (Read-Only)

The service includes read-only integration tests that connect to a real Turso database.
These tests verify the service works with an actual database but **do not mutate any data**.

To run integration tests:

```bash
export INTEGRATION_TEST_TURSO_URL="libsql://your-test-db.turso.io"
export INTEGRATION_TEST_TURSO_TOKEN="your-test-token"
bun test
```

Integration tests are skipped by default if environment variables are not set.

**Important**: Use a test database or read-only credentials. The tests only perform SELECT queries but you should still use a dedicated test environment.

## Architecture

- `contract.ts`: Input/output types and Zod schemas
- `service.ts`: Core transcription logic
- `db/client.ts`: Lazy database client factory
- `db/repository.ts`: Database query abstraction
- `syllabifier.ts`: CMU token to syllable conversion
- `phonotactics.ts`: English phonotactic constraints
- `text-processing.ts`: Text normalization utilities
- `phoneme-generator.ts`: Fallback pronunciation generator

## Lazy Database Configuration

The service uses lazy initialization for database connections. This means:

1. **No secrets at import time**: You can import the service without having `TURSO_DATABASE_URL` set
2. **Explicit configuration**: Pass a database client to `transcribeWords()` or let it use the default
3. **Testable**: Mock the database client in tests without needing production credentials

Example of lazy configuration:

```typescript
// This is fine - no error even if TURSO_DATABASE_URL is not set
import { transcribeWords } from '@phonaria/transcription-service';

// Database client is only created when you call this
import { getDefaultDbClient } from '@phonaria/transcription-service/db';

// This throws TranscriptionConfigError if env var is missing
const dbClient = getDefaultDbClient();
```

## Error Handling

The service provides typed errors for different failure modes:

- `TranscriptionValidationError`: Invalid input (wrong format, too many words, etc.)
- `TranscriptionDatabaseError`: Database query failed
- `TranscriptionConfigError`: Missing or invalid database configuration

```typescript
import {
  transcribeWords,
  TranscriptionValidationError,
  TranscriptionDatabaseError,
} from '@phonaria/transcription-service';

try {
  const result = await transcribeWords(input);
} catch (error) {
  if (error instanceof TranscriptionValidationError) {
    // Handle validation errors
    console.error('Invalid input:', error.validationErrors);
  } else if (error instanceof TranscriptionDatabaseError) {
    // Handle database errors
    console.error('Database error:', error.cause);
  }
}
```

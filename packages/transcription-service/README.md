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

The service supports explicit database configuration for testing:

```typescript
import { transcribeWords } from '@phonaria/transcription-service';
import { createDbClient } from '@phonaria/transcription-service/db';

// Use a test database
const testDbClient = createDbClient({
  url: 'file:test.db',
  authToken: undefined,
});

const result = await transcribeWords(input, { dbClient: testDbClient });
```

## Architecture

- `contract.ts`: Input/output types and Zod schemas
- `service.ts`: Core transcription logic
- `db/client.ts`: Lazy database client factory
- `db/repository.ts`: Database query abstraction

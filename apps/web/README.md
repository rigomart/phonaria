# Phonix Next.js Application

This is the main Next.js application for Phonix, a phoneme-first ESL pronunciation learning platform. It combines both the frontend user interface and the backend API into a single, unified Next.js application using the App Router.

## Features

- **Interactive IPA Charts**: Explore English phonemes with clickable charts
- **G2P Transcription**: Convert text to phonemic transcription using CMU Dictionary
- **Word Definitions**: Click a word in results to view definitions in a side panel
- **Pronunciation Audio**: Play dictionary audio for words when available
- **Dark/Light Theme**: Built-in theme switching with next-themes
- **Responsive Design**: Mobile-first approach with shadcn/ui components
- **Type Safety**: Full TypeScript implementation with strict settings

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom theme colors
- **UI Components**: shadcn/ui with Radix UI primitives
- **TypeScript**: Strict configuration with path aliases
- **Linting**: Biome (extends root workspace configuration)
- **Package Manager**: pnpm with workspace support

## API Routes

- `GET /api/health` - Health check endpoint
- `POST /api/g2p` - Convert text to phonemic transcription
- `GET /api/dictionary?word=<word>` - Fetch dictionary definition for a word

## Development

### Prerequisites

- Node.js (see root package.json for version)
- pnpm

### Local Development

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter and formatter
- `pnpm typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   ├── globals.css        # Global styles and theme variables
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Home page (G2P transcription)
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── g2p/              # G2P-specific components
│   ├── chart/            # IPA chart components
│   └── core/             # Core phoneme components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── g2p/              # G2P service and utilities
│   └── shared/           # Shared utilities
└── types/                # TypeScript type definitions
```

## Key Dependencies

- `shared-data` - Shared phoneme data and utilities
- `@tanstack/react-query` - (Optional) Data fetching and caching
- `next-themes` - Theme switching functionality
- `zod` - Runtime type validation
- `lucide-react` - Icon library
- `sonner` - Toast notifications

## G2P and CMUDict (Design & Rationale)

### What powers G2P

- **Source**: CMU Pronouncing Dictionary (compact JSON) at `apps/web/data/cmudict.json` (~4.5MB)
- **Loader**: `apps/web/src/app/api/g2p/_lib/cmudict.ts`
- **API**: `POST /api/g2p` (see `apps/web/src/app/api/g2p/route.ts`)

### Why static JSON import (not FS or network)

- **Reliability on Vercel**: Avoids path resolution issues (e.g., ENOENT) that occur when reading from `process.cwd()` within serverless bundles.
- **Zero network on hot path**: No fetch from `public/` or external bucket; keeps the request path fast and predictable.
- **Bundled with the server**: Ensures the dictionary ships with the function and is available at cold start. It's also using the Node.js runtime to make sure it has enough memory to load the dictionary.

### One-time load, safe for concurrency

- `cmudict.ts` maintains module-level state:
  - `loaded` flag and a shared `loadPromise`.
  - First request triggers the load; concurrent requests await the same promise (prevents duplicate work).
  - After load, the dictionary lives in memory for the lifetime of the instance and is reused across requests.
- This plays well with Vercel Fluid Compute: multiple concurrent requests on the same instance share the loaded data.

### Performance characteristics

- Cold start does the initial JSON parse and phoneme mapping, then all lookups are in-memory.
- No per-request file I/O or network I/O.
- If cold-start CPU becomes a concern, consider an alternative strategy:
  - Store ARPABET variants in memory, convert to IPA on demand, and cache per word.
  - Or shard the JSON by first letter and lazily import only needed shards.
  - Or use Redis to store records for highly requested words.

### Regenerating `cmudict.json`

- Use the helper script in `packages/helper-scripts` (see that package's README) to download and convert CMUDict to JSON.
- Place the output at `apps/web/data/cmudict.json` to be bundled with the app.

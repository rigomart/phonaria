# Architecture

## System Architecture

Phonix is built as a **monorepo** using pnpm workspaces, with clear separation between the web application, shared data, and utility packages. The architecture follows modern React patterns with strong TypeScript typing and component composition.

### High-Level Structure
```
phonix/
├── apps/web/                    # Main React application
├── packages/shared-data/        # Core phoneme data and utilities
├── packages/tts-generate/       # Audio generation tooling
└── pnpm-workspace.yaml         # Workspace configuration
```

## Source Code Paths

### Web Application (`apps/web/`)
- **Entry Point**: [`src/main.tsx`](apps/web/src/main.tsx) - React app bootstrapping with TanStack Router
- **Root Layout**: [`src/routes/__root.tsx`](apps/web/src/routes/__root.tsx) - App shell with navigation and theme provider
- **Core Pages**:
  - [`src/routes/index.tsx`](apps/web/src/routes/index.tsx) - Home page
  - [`src/routes/(charts)/ipa-chart.tsx`](apps/web/src/routes/(charts)/ipa-chart.tsx) - Main IPA chart view
- **Chart Components**: [`src/routes/(charts)/-components/chart/`](apps/web/src/routes/(charts)/-components/chart/)
  - [`consonant-chart.tsx`](apps/web/src/routes/(charts)/-components/chart/consonant-chart.tsx) - Interactive consonant grid
  - [`vowel-chart.tsx`](apps/web/src/routes/(charts)/-components/chart/vowel-chart.tsx) - Interactive vowel chart
  - [`phoneme-dialog.tsx`](apps/web/src/routes/(charts)/-components/chart/phoneme-dialog.tsx) - Detailed phoneme information modal
- **UI Components**: [`src/components/ui/`](apps/web/src/components/ui/) - shadcn/ui components
- **Utilities**: [`src/lib/phoneme-helpers.ts`](apps/web/src/lib/phoneme-helpers.ts) - Grid building and helper functions

### Shared Data Package (`packages/shared-data/`)
- **Core Types**: [`src/types.ts`](packages/shared-data/src/types.ts) - TypeScript interfaces for phonemes
- **Data Files**:
  - [`src/consonants.ts`](packages/shared-data/src/consonants.ts) - 24 consonant phonemes with detailed metadata
  - [`src/vowels.ts`](packages/shared-data/src/vowels.ts) - 16 vowel phonemes including diphthongs and rhotic vowels
  - [`src/articulation.ts`](packages/shared-data/src/articulation.ts) - Place and manner articulation metadata
- **Utilities**: [`src/utils/`](packages/shared-data/src/utils/) - Audio URL generation, IPA formatting, slugification

## Key Technical Decisions

### 1. **Monorepo with pnpm Workspaces**
- **Decision**: Use pnpm workspaces for package management
- **Rationale**: Efficient dependency sharing, clear separation of concerns, easy cross-package imports
- **Implementation**: [`pnpm-workspace.yaml`](pnpm-workspace.yaml) configures packages and apps

### 2. **TanStack Router for Type-Safe Routing**
- **Decision**: Use TanStack Router instead of React Router
- **Rationale**: Full TypeScript support, file-based routing, better developer experience
- **Implementation**: Auto-generated [`routeTree.gen.ts`](apps/web/src/routeTree.gen.ts) from file structure

### 3. **Shared Data Package Architecture**
- **Decision**: Extract phoneme data into separate package
- **Rationale**: Reusability across apps, clear data ownership, potential for multiple consumers
- **Implementation**: Workspace dependency `"shared-data": "workspace:*"`

### 4. **Component Composition Patterns**
- **Decision**: Use compound components for complex UI (PhonemeDialog)
- **Rationale**: Better API design, improved maintainability, clear component relationships
- **Implementation**: [`PhonemeDialog`](apps/web/src/routes/(charts)/-components/chart/phoneme-dialog.tsx) exports object with sub-components

## Design Patterns in Use

### 1. **Data-Driven UI Generation**
- **Pattern**: Grid layouts generated from data structures
- **Implementation**: [`useConsonantGrid()`](apps/web/src/routes/(charts)/-hooks/use-consonant-grid.ts) transforms flat arrays into 2D grids
- **Benefits**: Scalable, maintainable, easy to add new phonemes

### 2. **Compound Components**
- **Pattern**: Related components grouped as properties of a main component
- **Example**: `PhonemeDialog.Root`, `PhonemeDialog.Content`, `PhonemeDialog.Header`
- **Benefits**: Clear API, flexible composition, better IntelliSense

### 3. **Hook-Based State Management**
- **Pattern**: Custom hooks for complex state logic
- **Example**: [`useConsonantGrid()`](apps/web/src/routes/(charts)/-hooks/use-consonant-grid.ts) for grid generation and sorting
- **Benefits**: Reusable logic, easier testing, clear separation of concerns

### 4. **Utility-First Styling**
- **Pattern**: Tailwind CSS v4 with component composition
- **Implementation**: [`tailwind.config.js`](apps/web/tailwind.config.js) + [`index.css`](apps/web/src/index.css)
- **Benefits**: Consistent design system, rapid development, responsive design

## Component Relationships

### Core Component Hierarchy
```
App (__root.tsx)
├── ThemeProvider
├── Header (navigation)
└── Outlet
    └── IpaChart (ipa-chart.tsx)
        ├── Tabs (consonants/vowels)
        ├── ConsonantChart
        │   ├── Table with articulation grid
        │   ├── ConsonantCell components
        │   └── PhonemeDialog
        └── VowelChart
            ├── Visual vowel space
            ├── VowelCell components
            └── PhonemeDialog (shared)
```

### Data Flow
1. **Phoneme Data**: [`shared-data`](packages/shared-data/) → imported by components
2. **Grid Generation**: Data transformed by hooks → rendered as interactive grids
3. **User Interaction**: Click events → modal dialog → detailed phoneme information
4. **Audio Playback**: Word examples → audio URLs → [`AudioButton`](apps/web/src/components/audio/audio-button.tsx)

## Critical Implementation Paths

### 1. **Phoneme Data Model**
- **Entry Point**: [`packages/shared-data/src/index.ts`](packages/shared-data/src/index.ts)
- **Key Files**: [`types.ts`](packages/shared-data/src/types.ts), [`consonants.ts`](packages/shared-data/src/consonants.ts), [`vowels.ts`](packages/shared-data/src/vowels.ts)
- **Critical**: Type safety, comprehensive metadata, extensible structure

### 2. **Interactive Chart Rendering**
- **Entry Point**: [`ipa-chart.tsx`](apps/web/src/routes/(charts)/ipa-chart.tsx)
- **Key Components**: Chart components, grid hooks, cell rendering
- **Critical**: Performance with 40+ phonemes, responsive design, accessibility

### 3. **Audio Integration System**
- **Generation**: [`packages/tts-generate/generate.ts`](packages/tts-generate/generate.ts)
- **Consumption**: [`phonixUtils.getExampleAudioUrl()`](packages/shared-data/src/utils/audio.ts)
- **Critical**: Fallback handling, loading states, accessibility

### 4. **Theme and Styling System**
- **Provider**: [`ThemeProvider`](apps/web/src/components/theme-provider.tsx)
- **Implementation**: Tailwind CSS v4 + CSS variables
- **Critical**: Dark mode support, consistent design tokens, mobile responsiveness
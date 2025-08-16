# Tech

## Technologies Used

### Core Stack
- **Runtime**: Node.js (specified in package.json engines)
- **Package Manager**: pnpm v10.14.0 (with workspaces)
- **Language**: TypeScript ~5.8.3
- **Framework**: React v19.1.1 + React DOM v19.1.1
- **Build Tool**: Vite v7.1.0 with SWC plugin
- **Styling**: Tailwind CSS v4.1.11
- **Routing**: TanStack Router v1.131.2

### Web Application (`apps/web`)
- **UI Library**: shadcn/ui (New York style)
- **Component Primitives**: Radix UI (@radix-ui/react-*)
- **Icons**: Lucide React v0.537.0
- **Theme System**: next-themes v0.4.6
- **Notifications**: Sonner v2.0.7
- **Utility Libraries**:
  - clsx v2.1.1 + tailwind-merge v3.3.1 (conditional classes)
  - class-variance-authority v0.7.1 (component variants)
  - zod v4.0.16 (schema validation)

### Development Tools
- **Linter/Formatter**: Biome v2.1.3 (replaces ESLint + Prettier)
- **Type Checking**: TypeScript compiler with strict settings
- **Dev Server**: Vite with hot module replacement
- **Router Plugin**: @tanstack/router-plugin v1.131.2 (auto-generates routes)
- **Build Optimization**: @vitejs/plugin-react-swc v3.11.0

### Audio Generation (`packages/tts-generate`)
- **TTS Service**: ElevenLabs API (@elevenlabs/elevenlabs-js v2.6.0)
- **Environment**: dotenv v17.2.0
- **Build**: TypeScript compiler + tsx v4.20.3 for execution

## Development Setup

### Project Structure
```bash
phonix/
├── pnpm-workspace.yaml    # Workspace configuration
├── package.json          # Root package with shared scripts
├── biome.json           # Shared linting/formatting rules
└── apps/web/            # Main React application
    ├── components.json  # shadcn/ui configuration
    ├── vite.config.ts   # Vite build configuration
    └── src/
└── packages/
    ├── shared-data/     # Core data and utilities
    └── tts-generate/    # Audio generation tooling
```

### Key Configuration Files
- **[`pnpm-workspace.yaml`](pnpm-workspace.yaml)**: Defines workspace packages
- **[`biome.json`](biome.json)**: Unified linting and formatting (tab indentation, 100 char line width)
- **[`apps/web/vite.config.ts`](apps/web/vite.config.ts)**: Build configuration with path aliases
- **[`apps/web/components.json`](apps/web/components.json)**: shadcn/ui component configuration

### Development Commands
```bash
# Install all dependencies
pnpm install

# Run web app in development
pnpm -C apps/web dev
# OR
pnpm --filter web dev

# Build all packages
pnpm build

# Lint and format all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Generate TTS audio files (requires API key)
pnpm -C packages/tts-generate generate
```

## Technical Constraints

### Performance Considerations
- **Bundle Size**: Tailwind CSS v4 for smaller production builds
- **React 19**: Latest React with concurrent features
- **Code Splitting**: TanStack Router auto-splits routes
- **SWC**: Fast TypeScript/JSX compilation instead of Babel

### Browser Support
- **Modern Browsers**: ES2020+ features assumed
- **CSS**: Tailwind CSS v4 requires modern CSS feature support
- **Audio**: Web Audio API for phoneme playback
- **Responsive**: Mobile-first design with Tailwind breakpoints

### API Dependencies
- **ElevenLabs**: Optional TTS generation (dev-time only)
- **No Runtime APIs**: Core app works offline after initial load

## Dependencies

### Production Dependencies (apps/web)
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "@tanstack/react-router": "^1.131.2",
  "shared-data": "workspace:*",
  "@radix-ui/react-*": "Various versions",
  "tailwind-merge": "^3.3.1",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "lucide-react": "^0.537.0",
  "next-themes": "^0.4.6",
  "sonner": "^2.0.7",
  "zod": "^4.0.16"
}
```

### Development Dependencies
```json
{
  "@biomejs/biome": "^2.1.3",
  "@tailwindcss/vite": "^4.1.11",
  "@tanstack/router-plugin": "^1.131.2",
  "@vitejs/plugin-react-swc": "^3.11.0",
  "typescript": "~5.8.3",
  "vite": "^7.1.0"
}
```

## Tool Usage Patterns

### Component Development
- **shadcn/ui**: Install components via CLI (`pnpm dlx shadcn@latest add <component>`)
- **Compound Components**: Export objects with sub-components (see [`PhonemeDialog`](apps/web/src/routes/(charts)/-components/chart/phoneme-dialog.tsx))
- **Tailwind Variants**: Use `cva` for component variants and conditional styling

### Data Management
- **Workspace Imports**: Import shared data via `"shared-data"` workspace dependency
- **Type Safety**: All phoneme data strongly typed with TypeScript interfaces
- **Immutable Data**: Phoneme data is static, generated at build time

### Styling Approach
- **Tailwind CSS v4**: Utility-first with CSS custom properties
- **Component Composition**: Compose UI from primitive components
- **Theme System**: CSS variables + next-themes for dark mode
- **Mobile First**: Responsive design with Tailwind breakpoints

### Development Workflow
1. **File-based Routing**: TanStack Router generates routes from file structure
2. **Type Generation**: Router types auto-generated in [`routeTree.gen.ts`](apps/web/src/routeTree.gen.ts)
3. **Hot Reload**: Vite provides instant feedback during development
4. **Linting**: Biome handles code formatting and linting consistently

### Audio Asset Management
- **Generation**: [`packages/tts-generate/generate.ts`](packages/tts-generate/generate.ts) creates audio files
- **Storage**: Audio files stored in [`apps/web/public/audio/examples/`](apps/web/public/audio/examples/)
- **URL Generation**: [`phonixUtils.getExampleAudioUrl()`](packages/shared-data/src/utils/audio.ts) provides consistent URL patterns
- **Fallback**: Graceful handling when audio files are missing
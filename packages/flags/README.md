# @phonaria/flags

Env-backed feature flags so modules can ship to production dark and be enabled per environment. Framework-agnostic and source-imported (no build step) — Next.js apps must list it in `transpilePackages`.

## Usage

Each app declares its own registry, typically in `src/lib/flags.ts`:

```ts
import { createFlags } from "@phonaria/flags";

export const flags = createFlags({
	practice: {
		envVar: "FLAG_PRACTICE",
		// Visible locally, hidden in production builds until the env var opts in.
		enabledByDefault: process.env.NODE_ENV !== "production",
	},
});
```

- `flags.isEnabled(name)` — evaluate one flag.
- `flags.snapshot()` — plain `Record<name, boolean>` of every flag, safe to pass from a server component to client components (e.g. so navigation can hide links).

Gating a new module is one new entry in the registry plus whatever gate the app applies (a route layout that calls `notFound()`, a hidden nav link, etc.).

## Conventions

- Env vars are named `FLAG_*`. The Turborepo build task passes `FLAG_*` through, so new flags affect build caching without touching `turbo.json`.
- Accepted "on" values: `1` or `true` (case-insensitive). Anything else is off. Unset or empty falls back to the flag's `enabledByDefault`.
- Flags are read from `process.env`, so statically generated routes bake the value in at build time — flipping a flag on Vercel requires a redeploy.

## Rollout on Vercel

- **Production**: leave the env var unset → flag falls back to its default (off, for unreleased modules).
- **Preview / Development**: set e.g. `FLAG_PRACTICE=true` to keep the module testable there.

# @phonaria/flags

Env-backed feature flags so modules can ship to production dark and be enabled per environment. Framework-agnostic and source-imported (no build step).

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
- `createFlags(definitions, env?)` — optional second argument is a live env map (`process.env` by default). TanStack Start or tests can pass a different source without changing flag semantics.

Gating a new module is one new entry in the registry plus whatever gate the app applies (a route layout that calls `notFound()`, a hidden nav link, etc.).

## Conventions

- Env vars are named `FLAG_*`. The Turborepo build task passes `FLAG_*` through, so new flags affect build caching without touching `turbo.json`.
- Accepted "on" values: `1` or `true` (case-insensitive). Anything else is off. Unset or empty falls back to the flag's `enabledByDefault`.
- Flags are read from `process.env`, so prerendered routes bake the value in at build time — flipping a flag requires a redeploy.

## Rollout

Lab reads flags from Cloudflare Worker `vars`, declared per environment in
`apps/lab/wrangler.jsonc`.

- **Production**: leave the flag off → unreleased modules stay dark.
- **Staging / Preview**: set e.g. `FLAG_PRACTICE="1"` to keep the module testable there.

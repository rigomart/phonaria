# @phonaria/flags

Small, environment-backed feature flags. The app defines its flags in `apps/phonaria/src/lib/flags.ts` and uses `src/lib/require-flag.ts` to gate routes.

```ts
import { createFlags } from "@phonaria/flags";

const flags = createFlags({
  practice: { envVar: "FLAG_PRACTICE", enabledByDefault: false },
});

flags.isEnabled("practice");
flags.snapshot(); // { practice: boolean }
```

`createFlags(definitions, env?)` accepts an optional environment map for tests or apps with another configuration source. Values `1` and `true` (case-insensitive) enable a flag; an unset or empty value uses `enabledByDefault`.

Phonaria has three flags: `FLAG_PRACTICE`, `FLAG_LANGUAGE_SPREAD` and `FLAG_SPEECH`. Each deployed environment sets them in its `vars` in `apps/phonaria/wrangler.jsonc` and in the build environment of its deploy workflow (`apps/phonaria/scripts/deploy-staging.ts` for a manual staging deploy). All three are off in production and on in staging and preview. The app also enables them by default during local development.

The app reads every flag at build time. `apps/phonaria/vite.config.mts` replaces each `process.env.FLAG_*` read with the value in the build environment, so the Worker and the browser see the same value. Changing a deployed flag needs a rebuild and redeploy. A new flag needs an entry, with its own getter, in `src/lib/flags.ts`, and a line in the Vite config's `definePublicAppFlags`.

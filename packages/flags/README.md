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

Phonaria sets `FLAG_PRACTICE` in `apps/phonaria/wrangler.jsonc` by environment. Practice is off in production and on in staging and preview. The app also enables it by default during local development. Flags used by prerendered pages are fixed at build time, so changing a deployed flag requires a rebuild and redeploy.

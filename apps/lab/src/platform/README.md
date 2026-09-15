# Lab platform boundary

Framework-neutral contracts for the Lab shell, plus explicit TanStack Start
adapters. The neutral barrel must not resolve router implementations.

| Module | Role |
| --- | --- |
| `image.tsx` | Portable image renderer (native `img`) |
| `fonts.ts` / `fonts.css` | Fontsource variable Sora and Noto Sans (`wght.css`) plus CSS variables |
| `runtime-config.ts` | Re-export of env-backed site and asset configuration |
| `link.tsx` | Portable `Link` + `LinkProvider` (no framework import) |
| `theme.tsx` | Portable `useTheme` contract |
| `tanstack/` | TanStack Link, navigation, flag gate, theme, and `TanStackPlatformProvider` |

Application chrome should import `Link` from `@/platform/link` and `useTheme`
from `@/platform/theme`. Route files import `notFound` / `redirect` /
`requireFlag` from `@/platform/tanstack`.

Worker bindings, sanitized logs, and other request-time Cloudflare adapters
live under `src/server/cloudflare`. Transcription on Start uses a server
function in `src/server/transcribe.ts` with `@libsql/client/web` and
request-time Turso secrets. `wrangler.jsonc` remains the source of
truth for Worker configuration.

Route files stay thin adapters. TanStack Start owns `src/routes`,
`src/router.tsx`, and `vite.config.mts`.

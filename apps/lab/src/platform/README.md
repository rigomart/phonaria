# Lab platform boundary

Framework-neutral contracts for the Lab shell, plus explicit Next.js and
TanStack Start adapters. Each route root selects its target; the neutral
barrel must not resolve `next/*`, `next-themes`, or TanStack implementations.

| Module | Role |
| --- | --- |
| `image.tsx` | Portable image renderer (native `img`) |
| `fonts.ts` / `fonts.css` | Fontsource variable Sora and Noto Sans (`wght.css`) plus CSS variables |
| `runtime-config.ts` | Re-export of env-backed site and asset configuration |
| `link.tsx` | Portable `Link` + `LinkProvider` (no framework import) |
| `theme.tsx` | Portable `useTheme` contract (no `next-themes`) |
| `next/` | Next.js Link, navigation, flag gate, theme, and `NextPlatformProvider` |
| `tanstack/` | TanStack Link, navigation, flag gate, theme, and `TanStackPlatformProvider` |

Application chrome should import `Link` from `@/platform/link` and `useTheme`
from `@/platform/theme`. Next route files import `notFound` / `redirect` /
`requireFlag` from `@/platform/next`. Start route files import the same
helpers from `@/platform/tanstack`.

Worker bindings, sanitized logs, and other request-time Cloudflare adapters
live under `src/server/cloudflare`. `wrangler.jsonc` remains the source of
truth for Worker configuration.

Route files stay thin adapters: Next.js owns `src/app` until #207; TanStack
Start owns `src/routes`, `src/router.tsx`, and `vite.config.mts`.

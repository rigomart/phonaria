# Lab platform boundary

Framework-neutral contracts for the Lab shell, plus the Next.js adapters that
implement them today. TanStack Start should reuse the contracts and replace
only the files under `next/`.

| Module | Role |
| --- | --- |
| `image.tsx` | Portable image renderer (native `img`) |
| `fonts.ts` / `fonts.css` | Fontsource variable Sora and Noto Sans (`wght.css`) plus CSS variables |
| `runtime-config.ts` | Re-export of env-backed site and asset configuration |
| `next/link.tsx` | Next.js `Link` adapter |
| `next/navigation.ts` | Next.js `notFound` / `redirect` adapter |
| `next/require-flag.ts` | Flag gate that maps disabled flags to Next.js `notFound()` |
| `next/theme.tsx` | `next-themes` adapter for class-based theme switching |

Application code should import from `@/platform` rather than `next/link`,
`next/image`, `next/font/google`, or `next-themes` directly. Theme hooks live
on `@/platform/next/theme` so the server-safe barrel does not pull a client
module into route layouts.

Route files (`page.tsx`, `layout.tsx`, `robots.ts`, `sitemap.ts`) remain
Next.js App Router adapters until the TanStack Start migration.

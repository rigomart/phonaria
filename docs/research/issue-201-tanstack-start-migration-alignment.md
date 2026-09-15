# Issue #201: TanStack Start migration alignment

**Scope.** Validate the proposed first TanStack Start slice in `apps/lab` against
TanStack's official Next.js migration guide and its official hosting and environment
documentation. This is an implementation decision note, not a migration plan.

## Decision

The proposal is directionally correct with one important boundary: Next.js and
TanStack Start may coexist temporarily in the same **workspace/package directory**,
but they are two independently built and started applications. They must not share a
router, route conventions, or deployment adapter. Start owns `src/routes` and its
Vite/Workers configuration; Next continues to own `src/app` and `next.config.ts`
until cutover.

## Alignment and required adjustments

| Proposal | Alignment | Adjustment |
| --- | --- | --- |
| Keep Next and Start temporarily in `apps/lab`. | **Aligned.** The migration guide says to keep Next runnable until migrated routes pass checks; its reference runs Next and Start on different ports. | Give each framework an explicit script and port (for example, `dev:next` and `dev:start`). Do not make the existing `dev` script ambiguously start one or both. Build and test both during the transition. |
| Keep current Next routes in `src/app`; add Start `src/routes`, `src/router.tsx`, and root `vite.config.ts`. | **Aligned, with a separation requirement.** Start does not read Next routes or config. Its generated route tree is based on `src/routes`; that directory is not a URL prefix. | Keep `src/app` exclusively Next-owned and `src/routes` exclusively Start-owned. Add Start's generated `src/routeTree.gen.ts` to the source layout/tooling. Translate the first route deliberately: `app/layout.tsx` maps to `routes/__root.tsx`, while `app/credits/page.tsx` maps to `routes/credits.tsx`. |
| Leave shared product modules in `src/components`, `src/hooks`, and `src/lib`. | **Aligned in principle.** The existing Lab shell already makes components portable for images, fonts, and much of navigation. | Treat shared modules as framework-neutral only. Move route files, Next `Metadata`, `next/*` imports, server actions, and framework-specific providers out of the shared surface or behind a target adapter. The current `src/app/layout.tsx` and `src/app/credits/page.tsx` are Next adapters, not reusable Start route modules. |
| Put framework adapters in `src/platform/next` and `src/platform/tanstack`. | **Aligned and extends an existing convention.** `src/platform/next` already contains link, navigation, flag, and theme adapters. | Do **not** retain `src/platform/index.ts` as a supposedly neutral barrel if it re-exports Next implementations (it does today). Expose framework-specific entry points, or inject small contracts from each route root, so Start bundles never resolve `next/*`. Move `next-themes` behind the same target-specific boundary even though it is React-generic. |
| Add Cloudflare adapters in `src/platform/cloudflare` and `wrangler.jsonc`. | **Partly aligned.** TanStack's official Workers setup uses `@cloudflare/vite-plugin`, `wrangler`, a root `wrangler.jsonc`, `nodejs_compat`, and the generated Start server entry. | Keep `wrangler.jsonc` as the deploy/runtime source of truth; `src/platform/cloudflare` should contain only application-facing runtime bindings/helpers, not a second copy of Worker configuration. Use the Workers Vite plugin order documented by TanStack: `cloudflare({ viteEnvironment: { name: "ssr" } })`, `tanstackStart()`, then `viteReact()`. |

## Current repository fit

- `apps/lab` is currently a Next 16 package: its `dev`, `build`, and `start`
  scripts invoke Next, it has `next.config.ts`, and TypeScript includes the Next
  compiler plugin and `.next` type output. Adding Start therefore also needs a
  Vite-aware TypeScript setup (including Vite environment types) without removing
  the existing Next setup during the transition.
- `apps/lab/src/platform/README.md` explicitly anticipates replacing only
  `platform/next` adapters. That is a useful starting point, but its current
  `platform/index.ts` exports `Link`, `notFound`, `redirect`, and `requireFlag`
  from `platform/next`; it cannot be imported by shared Start code unchanged.
- The Credits page is a suitable first slice because its content is local and it
  only has a page-level Next `Metadata` export. Still, its document metadata,
  provider tree, header/footer, root document attributes, and CSS must be composed
  into Start's `__root.tsx`, which must render `HeadContent` and `Scripts`.
- The current public Vercel Lab can remain unchanged: a Cloudflare Start slice has
  a separate Vite/Workers build and deployment path. A Next deployment adapter does
  not become a Start adapter merely by installing Start packages.

## Migration constraints to carry into implementation

- Do not move privileged database or secret-bearing code from a Next Server
  Component into an ordinary Start loader. Put it in a server function and return
  only browser-safe data.
- Do not assume `revalidatePath`, cache tags, `generateStaticParams`, `next/font`,
  `next/image`, metadata file conventions, or Next middleware transfer unchanged.
  For this slice, test title/description/canonical/robots and direct `/credits`
  responses before and after client navigation.
- For Workers, read environment values per request in handlers/middleware. On edge
  SSR runtimes, module-scope `process.env` can run before bindings are available;
  only `VITE_` variables are client-visible in Vite. This matters for the existing
  env-backed site configuration and for keeping staging secrets private.
- Issue #201's approved pins and Workers choices remain additional project
  requirements: use its specified Start/Router, Vite, Cloudflare plugin, and
  Wrangler versions; retain `nodejs_compat`, the generated server entry, Workers
  Static Assets handling, and Workers Logs. The official migration guide validates
  the framework shape; it does not replace those issue-specific acceptance criteria.

## Minimum transition checks

1. Start Next and Start separately; keep the public Vercel Lab on the current Next
   deployment while exercising the Start Credits route in private Cloudflare staging.
2. Build both applications and run the shared browser contract against the Start
   staging URL. Compare status, HTML head, canonical/robots, assets, theme, header,
   footer, and direct navigation to `/credits`.
3. Before any later cutover, preserve compatible database/schema behavior, record a
   rollback route, and remove Next configuration only after the migrated behavior is
   verified.

## Sources

- [TanStack Start: Migrate from Next.js](https://tanstack.com/start/latest/docs/framework/react/migrate-from-next-js)
- [TanStack Start: Hosting (Cloudflare Workers)](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [TanStack Start: Environment variables](https://tanstack.com/start/latest/docs/framework/react/guide/environment-variables)
- [Issue #201 requirements](https://github.com/rigomart/phonaria/issues/201)

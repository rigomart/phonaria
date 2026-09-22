# ADR 0002: Serve Phonaria as one application on Cloudflare Workers

- Status: Accepted
- Date: 2026-09-16
- Related issues: [#254](https://github.com/rigomart/phonaria/issues/254),
  [#182](https://github.com/rigomart/phonaria/issues/182),
  [#179](https://github.com/rigomart/phonaria/issues/179),
  [#178](https://github.com/rigomart/phonaria/issues/178)

## Context

Phonaria ran as two applications for the length of the TanStack Start migration. `apps/web` was a
Next.js App Router application on Vercel, backed by Neon PostgreSQL for dictionary lookups and
Upstash Redis for rate limiting, with locale-prefixed routes for English and Spanish. `apps/lab`
(now `apps/phonaria`) was a TanStack Start application on Cloudflare Workers, built to take over.

By the end of the migration that Start application carried transcription, the IPA charts, Credits, and
Practice, and it had its own SEO metadata, observability, and a deployed-browser contract. Both
applications drew their phoneme data from the same `packages/phonetics-data`, so the duplication
was in delivery, not in domain data.

Keeping both had an ongoing cost: two hosting providers, two datastores, two rate-limiting
mechanisms, two CI paths, and documentation that had to explain which surface a reader was
looking at. The legacy application had no meaningful user traffic, which removed the usual reason
to run a long, traffic-preserving migration.

Issue #179 moved `phonaria.rigos.dev` onto the Worker and switched the public identity from
"Phonaria Lab" to "Phonaria". This ADR records the removal that followed.

## Decision

Phonaria is one application: `apps/phonaria`, TanStack Start on Cloudflare Workers, serving
`phonaria.rigos.dev`. The Next.js application, its Vercel project, and its dedicated data services
are retired rather than kept on a secondary hostname.

The application directory is `apps/phonaria` (`@phonaria/app`). The Cloudflare Worker is still
named `phonaria-lab`; [#254](https://github.com/rigomart/phonaria/issues/254) still has to rename
GitHub settings and Worker scripts. "Lab" is no longer a product term — see `CONTEXT.md`.

## Consequences

- Capabilities that existed only in the Next.js application are dropped, deliberately and without
  a replacement plan attached to this decision:
  - **Dictionary lookup** — word definitions and usage notes shown next to a transcription.
  - **Find-by-sound** — browsing words by the sounds they contain.
  - **Insights** — the CMUDict coverage statistics page. The underlying
    `cmudict-stats` generator is retained in `packages/helper-scripts`.
  - **Spanish UI and Spanish G2P** — locale-prefixed routing and Spanish transcription. Spanish
    articulation data remains in `packages/phonetics-data` and is still reachable through the
    target-accent model.
  - **The legacy overview page** — the marketing-style landing surface that preceded the current
    transcription-first home page.
- Neon PostgreSQL and Upstash Redis leave the architecture. Tier-3 transcription reads Turso
  (libSQL) through a TanStack server function, and rate limiting uses a Cloudflare
  `TRANSCRIPTION_RATE_LIMIT` binding.
- `next-intl` and locale-prefixed routes are gone. Reintroducing a second interface language means
  choosing an i18n approach for TanStack Start, not restoring the old one.
- Playwright now runs only as `packages/browser-contract`, against a deployed origin. There is no
  in-repo E2E suite that boots an application server.
- A small set of legacy URLs redirect to their current equivalents; exhaustive legacy URL
  preservation was explicitly out of scope, and retired tools return the normal not-found page.
- Reviving any dropped capability is new work against the TanStack Start application. The removed
  implementation stays available in git history at the commit that precedes this removal.

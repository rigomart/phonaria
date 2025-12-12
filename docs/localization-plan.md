# Localization Implementation Plan (Updated)

This plan details the steps to upgrade the project to **Next.js 16**, replace `next-international` with **`next-intl`**, and implement Spanish localization.

## User Review Required

> [!IMPORTANT] 
> **Major Migration**: This plan replaces the previous Phase 1. We will **uninstall** `next-international` and remove its config before setting up `next-intl`.
> **Data Strategy**: We will continue with the **Localized Data Module** strategy (separate `.ts` files) for `phoneme-details`, as it works independently of the i18n library and provides superior type safety for complex data.

## Proposed Changes

### Phase 1: Upgrade & Migrate
Upgrade framework and switch i18n libraries.

#### [Steps]
1.  **Upgrade Next.js**: Run `bun update next@latest react@latest react-dom@latest eslint-config-next@latest`.
2.  **Uninstall Old Lib**: Run `bun remove next-international`.
3.  **Install New Lib**: Run `bun add next-intl`.
4.  **Clean Up**: Delete `locales/client.ts`, `locales/server.ts`, and `middleware.ts` (to rewrite it).

#### [NEW] [apps/web/src/i18n/request.ts](file:///Users/rigos/projects/phonaria/apps/web/src/i18n/request.ts)
- Create the standard `next-intl` request configuration.
- Import messages from `locales/{locale}/index.ts`.

#### [NEW] [apps/web/src/middleware.ts](file:///Users/rigos/projects/phonaria/apps/web/src/middleware.ts)
- Create new middleware using `createMiddleware` from `next-intl`.
- Configure routing (locales: `['en', 'es']`, default: `en`).

#### [MODIFY] [apps/web/next.config.ts](file:///Users/rigos/projects/phonaria/apps/web/next.config.ts)
- Wrap configuration with `withNextIntl`.

### Phase 2: Localize Phoneme Data
Implement the "Separate Objects per Language" strategy.

#### [RENAME] `apps/web/src/data/phoneme-details.ts` -> `apps/web/src/data/phoneme-details/en.ts`
- Move existing data to a subfolder/module.

#### [NEW] [apps/web/src/data/phoneme-details/es.ts](file:///Users/rigos/projects/phonaria/apps/web/src/data/phoneme-details/es.ts)
- Create Spanish counterpart (clone of EN initially).

#### [NEW] [apps/web/src/data/phoneme-details/index.ts](file:///Users/rigos/projects/phonaria/apps/web/src/data/phoneme-details/index.ts)
- Create `getPhonemeDetails(locale)` helper.
- **Integration**: In `next-intl`, we can get the locale via `await getLocale()` (server) or `useLocale()` (client) and pass it to this helper.

### Phase 3: Language Selector & UI
Add the ability for users to switch languages.

#### [NEW] [apps/web/src/components/language-switcher.tsx](file:///Users/rigos/projects/phonaria/apps/web/src/components/language-switcher.tsx)
- Use `usePathname`, `useRouter` from `next-intl/client` to implement switching.

### Phase 4: Hardcoded Strings
Sweep the codebase for remaining hardcoded strings.

#### [MODIFY] Component Files
- Replace `useI18n` (old) with `useTranslations` (next-intl).
- Example: `const t = useTranslations('phoneme-details');`

## Verification Plan

### Automated Tests
- `bun run build` to verify Next.js 16 compatibility and `next-intl` setup.

### Manual Verification
1.  **Boot check**: Server starts with Next.js 16.
2.  **Locale Routing**: User is redirected to `/en` (or default) and can navigate to `/es`.
3.  **Data Loaded**: Phoneme details load correctly via the new `getPhonemeDetails` helper.

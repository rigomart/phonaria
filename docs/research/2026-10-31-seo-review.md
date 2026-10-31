# SEO review (2026-10-31)

A point-in-time review of how well search engines can find and rank Phonaria, a week after #391
added indexable sound pages (`/sounds/<slug>`) and minimal-pair contrast pages
(`/minimal-pairs/<contrast>`). It lists what is broken or missing, then what would help, each with
its evidence, a proposed fix and a rough size. Nothing here is implemented.

Sizes: **XS** is a config or one-line change, **S** a small PR, **M** a PR with new UI or data
wiring, **L** new written content or a new build step.

## How this was checked

- The code at `cb269acd` (main, 2026-10-31): `apps/phonaria/src/lib/document-head.ts`, `site.ts`,
  `indexing.ts`, `sound-pages.ts`, `src/start.ts`, `src/components/site-nav.ts`, the routes, and
  `wrangler.jsonc`.
- The live site, `https://phonaria.rigos.dev`, fetched with `curl` on 2026-10-31: status codes,
  response headers, the server-rendered HTML of 10 pages (head tags, headings, links, visible
  text), `robots.txt`, `sitemap.xml`, and the size of the JS and CSS a sound page loads. No browser
  was used, so nothing here measures Core Web Vitals.
- Web searches for "how to pronounce th sound", "schwa sound", "ship vs sheep
  pronunciation" and "IPA chart American English with audio", to see what kind of page ranks. They
  say nothing about Phonaria's own rankings.
- Google's docs on [favicons in Search](https://developers.google.com/search/docs/appearance/favicon-in-search)
  (updated 2026-10-27, read in full) and [site names](https://developers.google.com/search/docs/appearance/site-names)
  (read as a summary).

Not checked: Search Console (no access), field Core Web Vitals, and whether the production Worker
also answers on a `*.workers.dev` hostname.

## What already works

- Every indexable page is server-rendered with its content in the HTML, a self-referencing
  canonical, a page-specific title and description, `robots: index, follow`, and Open Graph and
  Twitter tags (`document-head.ts:169-191`, `332-361`).
- `robots.txt` allows everything and points to the sitemap. The sitemap lists 74 URLs: home, the
  three chart pages, credits, `/minimal-pairs` and its 27 contrast pages, `/sounds` and its 40
  sound pages (`indexing.ts:24-35`).
- Flag-gated pages behave: `/history` and `/practice` return 404 in production, Practice is
  `noindex, follow` even where its flag is on (`document-head.ts:255`), and History joins the
  sitemap only when its flag is on.
- Staging and preview builds set `SITE_INDEXING_ENABLED=0`, so every page there says
  `noindex, follow` and `robots.txt` lists no sitemap (`indexing.ts:42-50`).
- `phonaria-lab.rigos.dev` sends a 308 to the same path on `phonaria.rigos.dev`
  (`curl -I https://phonaria-lab.rigos.dev/sounds/schwa` → `308`, `location:
  https://phonaria.rigos.dev/sounds/schwa`), and the old `/en/...` and `/es/...` paths 308 to
  their new homes (`start.ts:12-44`).
- Unknown sound slugs return a real 404 (`/sounds/nope` → `404`).
- Hashed assets are cached for a year (`cache-control: public, max-age=31536000, immutable`) and
  HTML is served with Brotli (a sound page is 5.2 KB compressed).
- Chart tiles are real links: `/ipa-chart/consonants` links all 24 consonant pages.

## Fixes: broken or missing

Ranked by how much each holds back search traffic.

### 1. Sound and minimal-pair pages are missing from the site navigation

The header shows only Transcription and IPA Chart in production. The Minimal pairs link is hidden
unless the `speech` flag is on (`site-nav.ts:67-73`), and `speech` is off in production
(`wrangler.jsonc`, `env.production.vars`). There is no Sounds link at all. #391 decided the
contrast pages work without `speech`, but the nav still treats them as gated.

Live, the home page links to four places: `/`, `/ipa-chart/consonants`, `/credits` and GitHub. So
`/sounds` is reached only through a sound page's "All sounds" link, and `/minimal-pairs` only
through a contrast page's "All pairs" link. Crawlers get there through chart tiles, three or four
clicks deep, and visitors almost never do. Search engines also tend to treat pages linked from
every page's header as more important than pages a few clicks down.

**Fix:** show Minimal pairs in the nav in every build (the say-a-word part stays behind `speech`
inside the page), and add a Sounds item linking `/sounds`. **Size: S.**

### 2. The schwa page never says "schwa"

`/sounds/schwa` has the slug, but the word "schwa" appears nowhere in its HTML (`grep -c schwa` →
0). Its title is "The /ə/ sound (a in 'sofa'): how to pronounce it", its h1 is "Mid central
unrounded vowel", and its description doesn't name it either. People search "schwa", "schwa
sound" and "what is schwa"; every page ranking for those uses the word in its title.

The same gap, smaller, on other sounds: the titles come from `soundPageTitle()`
(`sound-pages.ts:119-121`), which uses the IPA symbol and an example word, never the name people
type. "How to pronounce th" pages call it "the TH sound" and split it into "voiced" and
"voiceless"; Phonaria's `/sounds/th-thin` title says "The /θ/ sound (th in 'thin')" and its h1
says "Voiceless dental fricative".

**Fix:** give each sound an optional everyday name in `sound-pages.ts`, next to its slug (schwa,
voiceless th, voiced th, short i, long e, short a, and so on), and use it in the title, the h1 and
the description. For example: "Schwa /ə/: how to pronounce the schwa sound (a in 'sofa')", and
"Voiceless TH /θ/ as in 'thin': how to pronounce it". **Size: S.**

This adds a short label per sound, which brushes against #391's "no new written content per
sound". It is a name, not content, but the call is yours.

### 3. The home page's title and description are generic

The home page is the transcription tool, but its title is just "Phonaria" and its description is
the site tagline, "Pronunciation tools for exploring speech sounds and IPA."
(`document-head.ts:193-204`, `site.ts:14`). The rendered page has 56 words and an h1 of
"Phonaria". Nothing tells a search engine that this page turns English text into IPA, which is
what people search for ("English to IPA", "IPA transcription", "phonetic transcription American
English").

**Fix:** a title like "Phonaria: English to IPA transcription and pronunciation", a description
that says what the tool does, and one or two sentences under the input with links to Sounds,
Minimal pairs and the IPA chart. **Size: S.**

### 4. Plain HTTP serves the site instead of redirecting

`curl -I http://phonaria.rigos.dev/sounds/th-thin` returns `HTTP/1.1 200 OK` with the full page,
not a redirect to HTTPS, and no response sets `Strict-Transport-Security`. The canonical tags
point to HTTPS, so search engines mostly fold the two together, but links shared over HTTP stay
on HTTP and split signals.

**Fix:** turn on Cloudflare's "Always Use HTTPS" for the `rigos.dev` zone, or 301 HTTP requests in
`start.ts`, and add an HSTS header next to the CSP. **Size: XS.**

### 5. Two redirects are temporary instead of permanent

- `/ipa-chart` → `307` to `/ipa-chart/consonants` (`routes/ipa-chart/index.tsx:7`, using the
  default status in `lib/navigation.ts:10`).
- A trailing slash, like `/sounds/th-thin/` → `307` to `/sounds/th-thin`.

A 307 tells search engines the move may not last, so they may keep the old URL. `/ipa-chart` is
the URL people would guess and link for "IPA chart".

**Fix:** pass `308` for the `/ipa-chart` redirect, and find where the trailing-slash 307 comes from
(probably the router's trailing-slash handling, not verified) and make it 308. **Size: XS.**

### 6. Google can't use the favicon

The only `rel="icon"` is `/favicon.svg` (`document-head.ts:152`). Google's favicon guidelines list
BMP, GIF, ICO, PNG, JPEG, PPM and TIFF, not SVG, and require a square icon; `favicon.svg` has a
`246 × 256` viewBox. Google may fall back to the 180 × 180 `apple-touch-icon.png`, which its
guidelines also accept, but that isn't guaranteed. `/favicon.ico` returns 404.

**Fix:** add a square PNG of at least 48 × 48 (96 or 192 is common) as a second `rel="icon"`,
keeping the SVG for browsers. **Size: XS.** This belongs with the new logo and favicon work; see
[Work in flight](#work-in-flight-that-affects-seo).

### 7. The 404 page says "index" and points its og:url at the home page

`/sounds/nope` returns 404 with `robots: index, follow`, `og:url` set to the home page, and the
home page's title and description, because only the root head (`document-head.ts:138-156`) runs
for the not-found page. The 404 status already keeps it out of the index, so the harm is small:
a shared broken link previews as the home page.

**Fix:** give the not-found component its own head with `noindex` and a "Page not found" title,
and drop `og:url` from the root head. **Size: XS.**

## Enhancements

Ranked by expected gain.

### 1. Sound pages are thin

A sound page is close to a list of links. The visible text of `/sounds/th-thin` is 85 words,
`/sounds/schwa` 57. "How it's made" is a diagram for consonants and a chart dot for vowels, with no
sentence explaining it (`components/phoneme-details/articulation.tsx:22-61`). The pages that rank
for "how to pronounce th" explain tongue placement, voiced versus voiceless, a practice trick and
common mistakes in a few hundred words.

Some of that is already in `@phonaria/phonetics-data` but not shown:

- `EnglishPhonemeAllophones` (`languages/en/allophones.ts`): aspirated /pʰ/ in "pin" vs /p/ in
  "spin", the flap in "water", the glottal stop in "button". The app never renders it.
- Articulation features (place, manner, voicing, tongue height and backness) that the h1 states as
  a technical label but never in plain words.

**Proposal, in two steps:**

1. Render what the data holds: an allophones section, and one generated plain-language sentence
   from the features ("Your tongue touches the back of your top teeth and air passes through
   without your voice"). **Size: M.**
2. A short hand-written how-to per sound (where the tongue and lips go, a practice tip, the usual
   mistake). This is the largest gain and the largest cost, and #391 ruled new written content out
   of scope, so it needs its own decision. **Size: L** (40 sounds).

### 2. Contrast pages lead with the wrong pair for search

The `/i/` vs `/ɪ/` page is titled "/i/ vs /ɪ/: minimal pairs like seat and sit" because the title
uses the first pair in the catalog (`document-head.ts:287-296`, catalog order in
`phonetics-data/src/languages/en/contrasts.ts:291-295`). People search "ship vs sheep"; that pair
is second in the list. The h1 is only "/i/ vs /ɪ/", with no words.

**Fix:** let a contrast name its headline pair (or put the best-known pair first in the catalog),
use the words in the title and h1, and add the sounds' readable names, for example:
"Sheep vs ship: /i/ vs /ɪ/ (ee vs ih), 15 minimal pairs with audio". **Size: S.**

### 3. The IPA chart pages don't target "IPA chart"

Titles are `Consonants — IPA Chart - Phonaria` and `Vowels — IPA Chart - Phonaria`; descriptions
are one short sentence ("Interactive IPA chart for American English consonants.",
`ipa-chart-metadata.ts:6-14`); each page's only heading is "Consonants" or "Vowels". Pages that
rank for "American English IPA chart" say American English, audio and examples up front. The
natural URL, `/ipa-chart`, is only a redirect (fix 5).

**Fix:** titles like "American English IPA chart: consonants, with audio and examples", fuller
descriptions, and a sentence of intro under the h1. Later, consider making `/ipa-chart` a real page
that shows consonants and vowels together, since "IPA chart" searches expect one page. **Size: S**
for the copy, **M** for a combined page.

### 4. Structured data: site name and breadcrumbs

Only History emits JSON-LD (`document-head.ts:299-318`), and History is off in production, so no
live page has any.

- **`WebSite` on the home page**, with `name` and `url`. Google uses it to choose the site name
  shown above results. **Size: XS.**
- **`BreadcrumbList` on sound and contrast pages** (Sounds › /θ/, Minimal pairs › /i/ vs /ɪ/),
  which Google can show in place of the raw URL. **Size: S.**

There is no Google rich result for "a speech sound" or "a word pair", so types like `DefinedTerm`
or `LearningResource` are optional and low value.

### 5. Link related sounds to each other

Sound pages link only to their minimal-pair contrasts. `/sounds/th-thin` doesn't link
`/sounds/th-this`, though both are spelled "th" and searchers look for them together. `/sounds/schwa`
has no contrasts, so it links to nothing but the charts.

**Fix:** a "Related sounds" line on each page: the same spelling (th → /θ/ and /ð/), the voiced or
voiceless partner (/s/–/z/, /f/–/v/), and for vowels their chart neighbours. **Size: S.**

### 6. One social image for every page

Every page except History shares `/opengraph-image.jpg` (`document-head.ts:321`). A link to
`/sounds/schwa` or `/minimal-pairs/i-ix` in a chat or a post shows the generic card. This doesn't
change rankings, but it helps people click shared links.

**Fix:** generate a 1200 × 630 card per sound (the big IPA symbol and its example word) and per
contrast (the headline pair) at build time. **Size: M.**

### 7. Page speed

- HTML isn't cached at the edge: pages have no `cache-control` and the Worker renders each request.
  From South America, responses took 0.2 to 0.6 s. Sound, contrast and chart pages only change on
  deploy, so they could be cached. **Size: S**, with care for flag-dependent content.
- A sound page loads 24 JS and CSS files, 258 KB with Brotli, for 85 words of content. The biggest
  are `index-*.js` (128 KB) and `flags-*.js` (45 KB), and it also loads `topics-*.js` (13 KB),
  which looks like Practice code on a page with no Practice. Worth one look with a bundle analyzer
  to see what reaches every page. **Size: S** to investigate.

Field Core Web Vitals weren't measured. PageSpeed Insights or Search Console's report would say
whether any of this matters for ranking. The content is all in the HTML, so crawling doesn't
depend on the JS.

### 8. Smaller items

- **Sitemap `lastmod`.** Entries have only `<loc>` (`indexing.ts:67-69`). A `lastmod` from the
  build date or the data files' last change helps search engines recrawl updated pages. **XS.**
- **`lang="en-US"`.** The root sets `lang="en"` (`routes/__root.tsx:39`). All indexable content is
  American English, so `en-US` is more precise. No `hreflang` is needed while there is one
  language. **XS.**
- **Search Console.** The live HTML has no `google-site-verification` tag, and production CI
  doesn't set `GOOGLE_SITE_VERIFICATION` (`.github/workflows/production.yml`). If the site isn't
  verified some other way (DNS), verify it and submit the sitemap, to see which of the new pages
  are indexed. **XS.**
- **Title separators.** Titles mix an em dash and a hyphen as separators (`Consonants — IPA Chart - Phonaria`).
  Pick one. **XS.**

## Work in flight that affects SEO

- **New logo and favicon.** Ship a square icon, a PNG or ICO of at least 48 × 48 linked with
  `rel="icon"` next to the SVG (fix 6), and a new `apple-touch-icon.png`. Regenerate
  `public/opengraph-image.jpg` if it shows the old logo, since every page uses it. Keep the icon
  URLs stable once Google picks them up; its guidelines ask for that.
- **About page.** Helps searchers and search engines see who makes Phonaria and why to trust it.
  For it to count: add its path to `UNFLAGGED_INDEXABLE_PATHS` in `indexing.ts` (or the
  flag-gated list, like History, if it ships behind a flag), give it a head through
  `buildPageHead()`, link it from the footer, and add it to `run_worker_first` in
  `wrangler.jsonc`. It is also the natural place for a `Person` or `Organization` JSON-LD with a
  `sameAs` link to the GitHub repo.

## Follow-up tasks

| # | Task | Kind | Size |
| --- | --- | --- | --- |
| 1 | Show Minimal pairs in the nav in every build and add a Sounds nav item | Fix | S |
| 2 | Give each sound an everyday name (schwa, voiceless th, short i) and use it in title, h1 and description | Fix | S |
| 3 | Give the home page a title, description and short intro that say it transcribes English to IPA | Fix | S |
| 4 | Redirect HTTP to HTTPS and send HSTS | Fix | XS |
| 5 | Make the `/ipa-chart` and trailing-slash redirects 308 | Fix | XS |
| 6 | Add a square PNG favicon of 48 × 48 or more (with the logo work) | Fix | XS |
| 7 | Give the 404 page a `noindex` head and drop `og:url` from the root head | Fix | XS |
| 8 | Show allophones and a plain-language "how it's made" sentence on sound pages | Enhancement | M |
| 9 | Decide on a hand-written how-to per sound | Decision | L |
| 10 | Lead contrast titles and h1s with the best-known pair and readable names | Enhancement | S |
| 11 | Rewrite IPA chart titles and descriptions for "American English IPA chart"; consider a combined `/ipa-chart` page | Enhancement | S / M |
| 12 | Add `WebSite` JSON-LD on home and `BreadcrumbList` on sound and contrast pages | Enhancement | S |
| 13 | Add a "Related sounds" line to sound pages | Enhancement | S |
| 14 | Generate per-sound and per-contrast social images at build time | Enhancement | M |
| 15 | Cache rendered HTML at the edge; check what JS reaches every page | Enhancement | S |
| 16 | Sitemap `lastmod`, `lang="en-US"`, Search Console check, one title separator | Enhancement | XS |

## Open

- Whether the trailing-slash 307 comes from TanStack Router or the Worker: not verified.
- Whether the production Worker also answers on `*.workers.dev`: not checked. If it does, its
  canonical tags point to `phonaria.rigos.dev`, so the risk is low.
- How Google currently treats the site (indexed pages, queries, favicon shown): needs Search
  Console.
- Core Web Vitals: not measured; no browser was available.

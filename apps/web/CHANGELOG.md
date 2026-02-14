# Changelog

## [1.3.0](https://github.com/rigomart/phonaria/compare/phonaria-v1.2.1...phonaria-v1.3.0) (2026-02-13)


### Features

* **multilingual:** wire target language through IPA chart and phoneme details ([#104](https://github.com/rigomart/phonaria/issues/104)) ([394135c](https://github.com/rigomart/phonaria/commit/394135c724060e5bde7bc1c3976fe5db10b3614a))
* **test:** add Playwright E2E testing infrastructure ([#101](https://github.com/rigomart/phonaria/issues/101)) ([462e27f](https://github.com/rigomart/phonaria/commit/462e27f8d3c67ed0b56e362c486a81c420332015))
* **transcription:** add rule-based Spanish G2P engine ([#108](https://github.com/rigomart/phonaria/issues/108)) ([d2e4079](https://github.com/rigomart/phonaria/commit/d2e40793df15d135f859a92c77721b16ba2b4b46))
* **ui:** accent-grouped tool navigation on overview hero ([#114](https://github.com/rigomart/phonaria/issues/114)) ([ddf3511](https://github.com/rigomart/phonaria/commit/ddf3511457877ec888a4dd87e10a21a12e895ef1))
* **ui:** add per-route accent fallback with disabled selector options ([#113](https://github.com/rigomart/phonaria/issues/113)) ([492fde4](https://github.com/rigomart/phonaria/commit/492fde4dfb0c74e0f1b666131145d914a3bde805)), closes [#112](https://github.com/rigomart/phonaria/issues/112)
* **ui:** persist target language selection with Zustand store ([#107](https://github.com/rigomart/phonaria/issues/107)) ([6901963](https://github.com/rigomart/phonaria/commit/6901963f93e88077b45b7ccba32eababf456c23b))
* **ui:** redesign homepage with 3-zone layout ([#105](https://github.com/rigomart/phonaria/issues/105)) ([053a7d3](https://github.com/rigomart/phonaria/commit/053a7d3de3bd4f1d9918051e9c78c0cca7fe54e0))


### Bug Fixes

* **multilingual:** wire IPA chart to route locale and add Spanish vowel IDs ([#102](https://github.com/rigomart/phonaria/issues/102)) ([a82a2d8](https://github.com/rigomart/phonaria/commit/a82a2d8a09ea43d7eddddf3aaa6e40dcc7e7cdb8))

## [1.2.1](https://github.com/rigomart/phonaria/compare/phonaria-v1.2.0...phonaria-v1.2.1) (2026-01-25)


### Bug Fixes

* **ui:** increase IPA symbol prominence in overview section ([#98](https://github.com/rigomart/phonaria/issues/98)) ([77086b1](https://github.com/rigomart/phonaria/commit/77086b1b4e1466a62ba683be47e2c712a94b78b1)), closes [#96](https://github.com/rigomart/phonaria/issues/96)

## [1.2.0](https://github.com/rigomart/phonaria/compare/phonaria-v1.1.0...phonaria-v1.2.0) (2026-01-16)


### Features

* **ipa-chart:** add educational intro section for SEO ([#94](https://github.com/rigomart/phonaria/issues/94)) ([0480a4e](https://github.com/rigomart/phonaria/commit/0480a4ee4f4b4f141d37edb2713fab88e12053b6))
* migrate phoneme IDs from verbose to short alphanumeric format ([#95](https://github.com/rigomart/phonaria/issues/95)) ([fac401a](https://github.com/rigomart/phonaria/commit/fac401a177befbb9233a9e355cb2557bb7621c8d))


### Bug Fixes

* **seo:** add noindex to credits page ([#91](https://github.com/rigomart/phonaria/issues/91)) ([9f63c43](https://github.com/rigomart/phonaria/commit/9f63c43e9d96efc6139c583d5c0322d969194973)), closes [#88](https://github.com/rigomart/phonaria/issues/88)

## [1.1.0](https://github.com/rigomart/phonaria/compare/phonaria-v1.0.0...phonaria-v1.1.0) (2026-01-13)


### Features

* **credits:** Add wordfreq attribution ([#79](https://github.com/rigomart/phonaria/issues/79)) ([d0dd914](https://github.com/rigomart/phonaria/commit/d0dd9141e6f3a63e8d8c008e6d8d2218d14f01ed))
* **header:** enhance navigation with a navigation menu component ([#81](https://github.com/rigomart/phonaria/issues/81)) ([c1a5e2c](https://github.com/rigomart/phonaria/commit/c1a5e2c3da21cf60617415ac20b77f6c95b9f2a4))
* **overview:** redesign landing page with interactive phonetics education ([#76](https://github.com/rigomart/phonaria/issues/76)) ([c30bc66](https://github.com/rigomart/phonaria/commit/c30bc666ec8b191ef229c976dddc12c30c7ac357))
* **transcription:** redesign page to match overview style ([#82](https://github.com/rigomart/phonaria/issues/82)) ([b1f02ae](https://github.com/rigomart/phonaria/commit/b1f02ae562fa8671a9a3dbcf00d8b5ba5a1a75ce))


### Bug Fixes

* **transcription:** improve info disclaimers and navigation menu UX ([#83](https://github.com/rigomart/phonaria/issues/83)) ([09b23b5](https://github.com/rigomart/phonaria/commit/09b23b5483e266fb24fdfd5aea927af4f9968e29))

## [1.0.0](https://github.com/rigomart/phonaria/compare/phonaria-v0.6.1...phonaria-v1.0.0) (2026-01-09)


### ⚠ BREAKING CHANGES

* **api:** API routes removed, all data fetching via server actions

### Features

* **api:** migrate to server actions with tiered lookup ([#70](https://github.com/rigomart/phonaria/issues/70)) ([0d0a0d4](https://github.com/rigomart/phonaria/commit/0d0a0d4554a28a54e5741b6b83f46da6a304ba4e))


### Bug Fixes

* **i18n:** add audio player error messages in English and Spanish ([#65](https://github.com/rigomart/phonaria/issues/65)) ([99c12eb](https://github.com/rigomart/phonaria/commit/99c12ebdbf10051d18c453b03ea68f1792989c51))

## [0.6.1](https://github.com/rigomart/phonaria/compare/app-v0.6.0...app-v0.6.1) (2026-01-07)


### Bug Fixes

* **i18n:** add audio player error messages in English and Spanish ([#65](https://github.com/rigomart/phonaria/issues/65)) ([99c12eb](https://github.com/rigomart/phonaria/commit/99c12ebdbf10051d18c453b03ea68f1792989c51))

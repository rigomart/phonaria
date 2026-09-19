# Wiktionary definition parser probe

Date: 2026-09-18

## Summary

The visible corruption in the definition for **the** is reproducible from the
live Wiktionary response. It has two independent causes:

1. The REST response's `en` bucket is not guaranteed to contain only English
   entries. The current parser ignores each entry's `language` field.
2. Some `definition` strings are HTML fragments containing nested definition
   lists and `<style>` elements. `stripDefinitionHtml()` removes tags but keeps
   descendant text, so it merges nested senses into the parent and exposes CSS.

These are recurring patterns, not a one-word exception. In this 67-word
sample, 22 words had a Translingual entry inside `en`, 27 had nested lists in a
definition, and 16 had a `<style>` element in a definition or example.

The parser should remain deliberately bounded rather than try to reproduce the
whole Wiktionary page. Filter to `language === "English"`, parse HTML as a
fragment, remove known non-content subtrees and nested sense lists, extract
plain text, then deduplicate and cap the result.

## Method

I requested the live first-party endpoint
`https://en.wiktionary.org/api/rest_v1/page/definition/{term}` with JSON accept
headers and a descriptive API user agent. The endpoint is documented in
Wiktionary's [REST API explorer](https://en.wiktionary.org/api/rest_v1/#/Page%20content/get_page_definition__term_).

- Successful term responses: **67/67**
- Final failed term responses: **0**
- Initial operational error: a parallel attempt triggered HTTP 429. Repeating
  the missing requests sequentially with a two-second delay succeeded.
- `en`-bucket entries inspected: **298**
- definition objects inspected: **1,896**
- Scope: the `en` bucket only, because that is exactly what
  `parseWiktionaryPayload()` reads.
- Counts describe this dated sample, not a stable Wiktionary contract. Entries
  are community-edited and the live results can change.

The sample intentionally covers:

| Class | Terms |
| --- | --- |
| Common function words | `the`, `a`, `an`, `and`, `of`, `to`, `in`, `that`, `as`, `for` |
| Highly polysemous words | `set`, `run`, `bank`, `light`, `round`, `lead`, `bear`, `well`, `right`, `mean`, `spring`, `match`, `sound`, `point`, `line` |
| Contractions | `don't`, `can't`, `won't`, `i'm`, `it's`, `they're`, `should've` |
| Hyphenated words | `well-known`, `mother-in-law`, `up-to-date`, `state-of-the-art`, `e-mail` |
| Abbreviations | `US`, `UK`, `Dr`, `Mr`, `AI`, `TV`, `OK`, `vs`, `St` |
| Cross-language homographs | `no`, `si`, `la`, `die`, `chat`, `coin`, `pie`, `pan`, `gift`, `angel` |
| Markup/technical probes | `water`, `letter`, `number`, `foot`, `circle`, `sex`, `mercury`, `pi`, `infinity`, `HTML`, `C++` |

Representative source responses:
[the](https://en.wiktionary.org/api/rest_v1/page/definition/the),
[set](https://en.wiktionary.org/api/rest_v1/page/definition/set),
[a](https://en.wiktionary.org/api/rest_v1/page/definition/a),
[UK](https://en.wiktionary.org/api/rest_v1/page/definition/UK),
[point](https://en.wiktionary.org/api/rest_v1/page/definition/point), and
[number](https://en.wiktionary.org/api/rest_v1/page/definition/number).

I compared the raw fragments with the current functions in
`apps/lab/src/lib/definition/normalize.ts`. This was read-only probing; no
product code was changed.

## Findings

### 1. `en` is a page bucket, not an entry-language guarantee

There were **31 Translingual entries across 22 words**: 10.4% of all inspected
`en` entries and 32.8% of sampled words. Every affected word placed at least
one Translingual entry before its English entries. All 22 also had a genuine
English entry later in the array.

Affected words:

`AI`, `St`, `TV`, `UK`, `US`, `a`, `an`, `and`, `as`, `for`, `in`, `la`, `no`,
`pan`, `pi`, `pie`, `round`, `run`, `set`, `si`, `the`, `to`.

For example, the first object in the live [`set`
response](https://en.wiktionary.org/api/rest_v1/page/definition/set) is:

```json
{"partOfSpeech":"Symbol","language":"Translingual","definitions":[...]}
```

The current parser renders its first definition as “ISO 639-3 language code
for Sentani.” The same issue is more damaging for `a`: early Translingual
Letter/Symbol/Noun groups consume the six-sense display budget before the
ordinary English article can be shown.

The existing test named “reads English senses and ignores other languages”
only checks a separate top-level `fr` bucket. Its fixture omits entry-level
`language`, so it cannot detect this failure.

### 2. Nested lists are common and are already expanded into later objects

**80 definition fields across 27 words** contained `<ol>` or `<ul>` (40.3% of
sampled words). The words were `a`, `an`, `and`, `angel`, `as`, `bear`, `chat`,
`circle`, `die`, `in`, `la`, `lead`, `light`, `line`, `match`, `mean`, `mercury`,
`no`, `of`, `pan`, `point`, `round`, `run`, `spring`, `that`, `the`, and `water`.

The [`the` response](https://en.wiktionary.org/api/rest_v1/page/definition/the)
starts an English Article definition approximately like this:

```html
<span>Used before a noun phrase...</span>
<ol><li><span>The definite grammatical article...</span>
<ol><li><span>...because it has already been mentioned...</span>
```

The API also emits the child and grandchild as later definition objects. The
current regex preserves every descendant's text, producing:

> Used before a noun phrase ... The definite grammatical article ... because
> it has already been mentioned ...

The next displayed sense repeats the child and grandchild. This is the mixing
visible in the reported UI.

A fragment parser can solve this without reconstructing the hierarchy: remove
nested `ol` and `ul` subtrees from each definition before taking its text. The
API's later objects retain those child senses independently.

### 3. Style contents leak because only the tags are removed

There were **25 definition fields** with `<style>`, plus one example duplicated
in both `parsedExamples` and `examples`, across **16 words** (23.9% of the
sample). No `<script>` occurred.

For example, the [`UK`
response](https://en.wiktionary.org/api/rest_v1/page/definition/UK) contains:

```html
Initialism of ... United Kingdom ...
<style>.mw-parser-output .defdate{font-size:smaller}</style>
```

Current output:

> Initialism of United Kingdom .mw-parser-output
> .defdate{font-size:smaller}

The `a` response also embeds a much larger `.texhtml{...}` stylesheet in an
example. Removing only the opening and closing tags necessarily exposes the
CSS. `style`, `script`, `template`, and `noscript` must be removed with their
entire contents before text extraction.

### 4. References, media, comments, and metadata need explicit policy

| Pattern in inspected text fields | Fields | Words | Current effect |
| --- | ---: | ---: | --- |
| `<link>`/`<meta>` metadata | 273 | 48 | Tags have no text and usually disappear cleanly, but are non-content nodes. |
| HTML comments | 25 | 11 | Usually removed by the regex; a real parser is safer for unusual comment contents. |
| Reference/citation markup | 1 | 1 (`the`) | Becomes a full bibliography entry presented as a definition. |
| Media markup | 1 | 1 (`point`) | Figure caption text is appended to the definition. |
| Math markup | 2 mirrored example fields | 1 (`number`) | Readable but formatting is flattened, e.g. `eiπ+1=0`. |
| Tables | 0 | 0 | Not observed; still reasonable to drop as unbounded layout content. |
| Scripts | 0 | 0 | Not observed; still must be removed defensively. |

Wiktionary transclusion metadata such as `about="#mwt..."` or
`typeof="mw:Transclusion"` appeared in **1,171 fields across 65 words**. These
attributes are common and not themselves a reason to reject a definition. The
parser should select useful text structurally, not try to enumerate every
Wiktionary class or template attribute.

### 5. The JSON schema was regular, with useful edge cases

In this sample:

- All 298 entries were objects with a string `language`, a string
  `partOfSpeech`, and an array `definitions`.
- Every one of the 1,896 definition items was an object with a string
  `definition`.
- **160 definitions across 48 words were empty strings.** These appear to be
  hierarchy/formatting placeholders. The current parser correctly skips them.
- 1,033 items contained only `definition`.
- 863 contained `definition`, `parsedExamples`, and `examples`.
- In all 863, `parsedExamples` was an object array and `examples` was a string
  array. They represented the same 1,651 example strings.
- `parsedExamples` sometimes carried extra keys: 15 items added `translation`,
  four added `footer`, and two added `qualifier`. Every item still had a string
  `example`; the current choice to read only `example` is a good bounded rule.

No missing/unknown field types occurred in the live sample. Runtime validation
should nevertheless keep skipping malformed individual entries or senses
rather than fail the whole word.

The English entries used 16 part-of-speech labels. Besides the common labels,
valid English entries included `Letter`, `Symbol`, and `Numeral`. A narrow POS
allowlist would therefore drop legitimate definitions. Language filtering
eliminates almost all noisy Symbol entries while preserving the one genuine
English Symbol entry sampled.

### 6. Entity handling did not expose a new live failure

The sample contained only the named entities `&nbsp;` and `&amp;`, both already
handled by `decodeBasicEntities()`. Two `&#x2D;` numeric entities appeared inside
an HTML comment. No malformed entity was found.

This is not evidence that the hand-written entity list is complete. A
standards-compliant fragment parser should perform entity decoding. Synthetic
tests should cover unknown and malformed entities because a live-only test
cannot guarantee those cases remain available.

## Recommended bounded parser

Apply these stages in order:

1. **Validate the envelope.** Require an object payload and an array at `en`.
   Skip malformed entries and senses independently.
2. **Filter entry language first.** Accept only entries whose `language` is
   exactly `English`. Treat a missing language as unusable rather than guessing.
3. **Parse each definition/example as an HTML fragment.** Do not use regex as
   the HTML parser.
4. **Remove non-content subtrees.** At minimum remove `style`, `script`,
   `template`, `noscript`, `link`, `meta`, comments, reference blocks, and media
   elements. Remove tables unless a future product requirement gives them a
   text representation.
5. **Remove nested `ol`/`ul` from definitions only.** This keeps the current
   sense's own text and avoids copying descendants that the API supplies as
   later definition objects. Do not apply this rule blindly to examples.
6. **Extract and normalize text.** Preserve sensible spaces at block and line
   boundaries, decode entities through the parser, convert non-breaking spaces
   to ordinary spaces, collapse Unicode whitespace, and trim.
7. **Keep simple math text, drop media.** Inline math text can remain when it is
   intelligible; image captions and controls should not become definitions.
8. **Drop empty output and exact duplicates.** Empty placeholders and comments
   should not consume display slots. Deduplicate after cleaning, within a POS.
9. **Bound work and output.** Limit inspected entries, definitions, example
   candidates, input fragment length, and final definition/example length.
   Keep the existing two-per-POS and six-total limits, applied after language
   filtering and cleaning.
10. **Keep POS handling permissive but bounded.** Accept a short non-empty
    string, normalize whitespace for display, and fall back to `unknown` only
    when missing. Do not reject `Letter`, `Symbol`, or `Numeral` wholesale.

This is content normalization, not HTML rendering: the final value should stay
plain text and React should continue escaping it normally.

## Regression coverage to add

Small hand-maintained fixtures are preferable to checking in entire mutable
live responses:

- Mixed `en` entries with Translingual first and English second (`set` or
  `the` shape).
- A parent definition with two nested list levels, followed by the child
  definition objects (`the` shape).
- `<style>` in a definition and in an example (`UK` and `a` shapes).
- Comment-only examples and empty definition placeholders (`AI` shape).
- Reference and figure subtrees (`the` and `point` shapes).
- Math markup whose textual fallback remains understandable (`number` shape).
- `parsedExamples` objects with `translation`, `footer`, and `qualifier`.
- Legitimate English `Letter`, `Symbol`, and `Numeral` entries.
- Synthetic script, table, malformed entity, missing-field, wrong-type, very
  deep HTML, and overlong-string cases, since the live sample did not supply
  all of these.

Keep one small live smoke test for reachability and broad contract drift, but
do not make exact live Wiktionary wording or markup part of deterministic test
expectations.

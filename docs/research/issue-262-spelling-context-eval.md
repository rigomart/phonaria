# Context-aware spelling suggestion eval (issue #262, finding 1)

A point-in-time record of the live check behind `FLAG_SPELLING_CONTEXT`. Issue #262 measured
Jev with one question per call and the full sentence. The shipped path differs in three ways,
so this run repeats those cases through it:

- One Jev call per sentence, with one `choice` question per missed token.
- A whole-word excerpt capped at 300 characters (`SPELLING_CONTEXT_MAX_CHARS`). The
  transcription box allows 200, so in practice the whole input is sent.
- The "no answer" option is keyed `none_of_these`, because `none` is itself a dictionary
  neighbour of tokens such as `nome`.

Run on 2026-09-25 through OpenRouter (`jev-latest`), with the Worker's 1.5 s timeout, 8
requests in flight, and picks below 0.7 confidence treated as silence.

Reproduce with a key in the gitignored `apps/phonaria/.env.local`:

```
bun --cwd apps/phonaria ./scripts/eval-spelling-context.ts
bun --cwd apps/phonaria ./scripts/eval-spelling-context.ts --dry-run   # print one request
```

## Results

38 hand-labeled sentences: the 34 from issue #262 plus four with two or three misses each.

| | right | wrong | missed |
| --- | --- | --- | --- |
| frequency rule alone | 31 | 2 | 5 |
| context, rule as fallback | 38 | 0 | 0 |

- The rule misses `adress`, `wnat`, `bg` and `cn`, because it can't see the sentence.
- The rule's two wrong offers: it rewrote `Pune` to `June`, and in "Teh dog cn run" it
  offered `The` but left `cn`. The context path stays silent on `Pune` and fixes both words.
- The multi-miss sentences (`I wnat a bg cake.`, `We wrk frm home.`) were all right,
  answered in one call each.
- No call timed out or fell back. Latency: p50 372 ms, p90 615 ms over 34 calls.

As in issue #262, the sentences and labels were written by hand. Treat these numbers as
signal, not benchmarks.

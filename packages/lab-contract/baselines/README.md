# Lab contract performance baselines

These files are the comparison point for page-load and transcription latency
across Lab deployment targets. They are **not** pass/fail gates for the
functional contract.

## Collection conditions

Recorded by `bun e2e:lab:baseline` with:

- Browser: Chromium Desktop Chrome
- Viewport: 1280x720
- Runs: 1 cold plus 5 warm navigations of `/`, measured as wall-clock time around `page.goto({ waitUntil: "load" })`
- Transcription: 5 submissions of `hello` on a reloaded landing page, measured from the submit click until the word label is visible
- Network: the machine running Playwright, over the public internet unless otherwise noted

A repeatable slowdown greater than roughly 20% versus the committed median is
an investigation trigger for qualification and cutover tickets. Ordinary
run-to-run variance does not fail this suite.

## Updating a committed baseline

```bash
LAB_CONTRACT_TARGET=vercel-production LAB_CONTRACT_WRITE_BASELINE=1 bun e2e:lab:baseline
```

Commit the updated `baselines/<target>.json` only when collection conditions
are documented and the change is intentional.

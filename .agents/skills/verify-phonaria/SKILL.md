---
name: verify-phonaria
description: Verify Phonaria user-facing behavior in the running app with agent-browser, using the project feature map and saved evidence. Use for reproducing UI reports or checking a changed feature; keep existing Playwright checks for CI regressions.
---

# Verify Phonaria

Exercise the real application and compare observable behavior with explicit expectations. A successful browser command, passing unit tests, or a screenshot alone does not prove a feature works.

## Choose the journey

Read [the feature map](references/feature-map.md) for routes, controls, prerequisites, and current coverage. Choose a journey relevant to the task and define its expected behavior before interacting. Include the important success, failure, or persistence behavior for that feature; a report only covers the behavior actually exercised.

Run `bun run verify list` to discover registered journeys. If none covers the request, add a scoped TypeScript journey using the feature map's extension instructions. Keep its controls, observations, expected values, and limits with that feature. Ground expectations in product requirements or independent reference data, rather than calling the same application helper that produces the UI.

Work from the repository root. Prerequisites: workspace dependencies, Bun, `agent-browser`, and its Chrome browser. The helpers are TypeScript run directly by Bun. Check `agent-browser --version`; these helpers were exercised with 0.38.1. Read installed command help when its capabilities differ. Missing tools, port permission, credentials, or required services are **blocked**, not passed. Do not switch to production to claim that local edits work.

## Start and inspect

1. Run `bun run verify init <feature> [origin]` using the chosen registered journey. The default origin is `http://127.0.0.1:3000`. Record the printed absolute evidence directory as `VERIFY_RUN` for subsequent commands. Each run owns a unique browser session and records the feature, checkout revision, working-tree status, target, and CLI version.
2. For the default local target, run `bun run verify serve "$VERIFY_RUN"` in a persistent terminal/tool process. Keep its process handle. It refuses an occupied port, starts Vite with a strict port, and saves `server.log`. Wait for Vite's ready message. Stop only this process when finished; do not kill an unrelated server. If the sandbox blocks local ports, use the normal tool permission mechanism.
3. Use `bun run verify browser "$VERIFY_RUN" <agent-browser command...>` to operate the session and record commands. Open `about:blank`, start `trace start`, then open the feature's entry route at the recorded origin. Set and record a viewport appropriate to the journey.
4. Take `snapshot -i` before interacting. Use accessible labels/roles, or refs from the latest snapshot. Re-snapshot after submission, navigation, and popup changes; refs are not persistent feature identifiers. Wait for the requested UI state instead of sleeping or waiting for all network activity to stop.

The isolated browser also writes its session sockets outside the repository. If a command reports a socket-directory permission error, use the normal tool permission mechanism for browser commands and evidence helpers. Preserve the failed command in the run log and explain the permission retry in the report.

An explicit origin can select a deployed target. It does not deploy, configure authentication, or verify unshipped local changes. Never print or save credentials in evidence.

## Observe, change, repeat

Follow the selected journey's actions. `bun run verify observe "$VERIFY_RUN" <checkpoint>` loads the feature recorded in the run, waits for and compares rendered DOM observations against maintained literal expectations, records expected/actual values, and captures a screenshot, page snapshot, and diagnostics. Each observation also checks the actual page origin. Exit 1 means the checkpoint failed or could not be captured: inspect the saved evidence before proceeding.

For a code-change task, establish a baseline first, inspect discrepancies, make the authorized change, and start a **new run**. Preserve the earlier run, including failures. Keep related lint, types, unit tests, and CI browser checks as separate implementation evidence.

Use `bun run verify capture "$VERIFY_RUN" <name>` for extra screenshots/snapshots/diagnostics while investigating. `browser ... profiler start/stop` can collect performance evidence when the task requires it; this skill does not imply a performance threshold or measure performance from screenshots.

## Finish with evidence

Inspect relevant PNGs with an image viewer and review snapshots, assertions, and diagnostics. Browser errors, console errors, and failed HTTP requests prevent a clean pass; investigate and report them. A visible or enabled control proves its state, not that its action succeeded; check the resulting behavior when that action is in scope.

Run `bun run verify finish "$VERIFY_RUN" passed|failed|blocked "Evidence review and findings"`. This captures final evidence, saves a Chrome DevTools trace when started, and closes only the owned browser session. A requested pass is refused when checkpoints or diagnostics are missing, a checkpoint failed, errors were recorded, or evidence capture is incomplete. The command writes `report.md` and `report.json` even for failed/blocked runs. If no browser could start, finish as blocked; evidence capture errors remain in the report. If closing the browser failed, retry `bun run verify browser "$VERIFY_RUN" close`; cleanup remains available on finished runs. Stop the owned server using its retained process handle.

Report the observed outcome, feature, target, revision/working tree, checked behavior, evidence links, and material coverage limits. Say what remains unverified. Update only the relevant feature-map entry/checkpoint when an intentional UI change makes its instructions stale; do not weaken expectations simply to make a failing run pass.

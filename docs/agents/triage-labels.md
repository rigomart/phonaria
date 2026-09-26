# Issue Labels

Every issue gets exactly one type label. The type says what kind of issue it is, which also says what to do with it next.

| Label  | Meaning                                                              | Body shape                                   |
| ------ | -------------------------------------------------------------------- | -------------------------------------------- |
| `idea` | A rough idea: a problem worth solving, not ready to build            | Problem, angles, open questions              |
| `spec` | What to build and why, with acceptance criteria. A PRD is a spec.    | Problem, scope, acceptance criteria          |
| `task` | One buildable slice, usually a sub-issue of a spec                   | What to change, how to check it              |
| `bug`  | Something broken                                                     | Steps to reproduce, expected vs actual       |

Add `human-only` to a `task` an agent cannot do: secrets, dashboards, manual deploys. Tasks without it are ready for an agent.

## Flow

1. An `idea` is refined by grilling or prototyping until it can be specified.
2. The `spec` is a new issue that links to the idea; close the idea when the spec is filed.
3. The spec is split into `task` issues attached as GitHub sub-issues.

A small idea can skip the spec and become a single `task`.

To drop an issue, close it as **not planned**. There is no `wontfix` label.

Reference issues that are not work items, such as research records, get no type label.

## Other labels

- `released`, `autorelease: pending`, `autorelease: tagged`: owned by release tooling. Do not apply them by hand.
- `codex`: not part of this scheme. Leave it as is.

## Mapping for skills that use triage roles

Some skills speak in terms of five canonical triage roles. Use this mapping when a skill mentions one.

| Role              | In this repo                                                |
| ----------------- | ----------------------------------------------------------- |
| `needs-triage`    | `idea`                                                      |
| `needs-info`      | `idea`, with the missing information asked for in a comment |
| `ready-for-agent` | `task`                                                      |
| `ready-for-human` | `task` + `human-only`                                       |
| `wontfix`         | Close as not planned                                        |

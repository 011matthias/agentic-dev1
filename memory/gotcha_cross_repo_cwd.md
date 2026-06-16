---
name: gotcha_cross_repo_cwd
description: In an ops-rooted session driving agentic-dev1, never `cd` into dev1; drive by git -C / gh -R / uv run --directory / absolute paths.
metadata:
  type: reference
---

When a session is rooted in agentic-ops1 but doing agentic-dev1 work, the active
PreToolUse hooks are ops's, resolved by cwd-relative path. The moment the shell
cwd moves into agentic-dev1, the ops-only hooks (instantly-invasive-gate,
reference-anchor-gate) fail to resolve and fail closed, dead-locking both Bash and
Write/Edit. The Bash working directory persists across calls, so a single stray
`cd` poisons every later call until reset.

Rules:
- Keep the harness cwd at the ops root. Drive dev1 by ABSOLUTE paths and
  `git -C <dev1>`, `gh -R 011matthias/agentic-dev1`, `uv run --directory <dev1>`,
  `npm --prefix <dev1>`. `gh -R` needs no cwd, so a `cd` before it is always
  needless.
- `cd-guard` now catches a leading `cd X` chained by `&&`, `;`, `|`, or `&`,
  with or without a space before the separator (widened 2026-06-16 from a
  space-requiring trailing group to a zero-width boundary lookahead). It still
  does NOT catch a `cd` that is not at a statement boundary (e.g. inside a
  subshell `( cd X && ... )`, which is the safe form anyway). The carried reflex
  stands regardless: never lead with `cd`; use git -C / gh -R / absolute paths.
- If a hook error reports `can't open file ...agentic-dev1\.claude\hooks\<x>.py`,
  the cwd drifted; reset with PowerShell `Set-Location "<ops root>"` (PowerShell
  shares the harness cwd and is not gated by the Bash PreToolUse hooks).

Structural kill: launch dev1 sessions from ~/Repo/agentic-dev1 so dev1's own hooks
resolve and its floor gate fires. This memory is the recall fallback for sessions
that are nonetheless ops-rooted. Recurred once (a needless `cd` before `gh`,
self-recovered) which is why it graduated from a friction row to a memory.

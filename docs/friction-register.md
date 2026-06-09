# Friction Register

Self-annealing log for agentic-dev1. One row per friction event: something the owner
had to correct, something the agent should have automated, or a gate that should have
fired and did not. `tools/friction-watch.py` reads this table at session start and
surfaces concentration / recurrence / stale patterns.

Types: `agent-deferred`, `missed-tool`, `verification-theater`, `skipped-gate`,
`over-literal`, `strategic-gap`, `scope-creep`, `slow-path`, `missed-memory-recall`,
`infrastructure-deferred`.

| Date | Scope | Type | Description | Resolved | Fix |
|------|-------|------|-------------|----------|-----|
| 2026-06-07 | harness | infrastructure-deferred | seeded gate-skip-detector + post-action-gate don't recognize tools/verify.py as a validation step, so a push after verify.py false-fires the pre-publish advisory in dev1 sessions | No | add verify.py to gate-skip VALIDATE_PATTERNS + READONLY_PATTERNS in the next harness pass |
| 2026-06-09 | harness | slow-path | dev1 build session launched from the agentic-ops repo: ops PreToolUse hooks resolve `.claude/hooks/*` by cwd-relative path, so a `cd` into dev1 made the ops-only hooks (instantly-invasive-gate, reference-anchor-gate) fail-closed and dead-lock both Bash and Write/Edit; ~5 calls to diagnose | Yes (workaround) | pin the harness cwd to the launch repo (Set-Location is shared across tools) and drive the target by absolute paths + git -C / npm --prefix / uv run --directory, never cd-ing in. Structural kill: launch dev1 sessions from ~/Repo/agentic-dev1 so dev1's own hooks resolve and its floor gate actually fires. Promote to a gotcha memory if it recurs |

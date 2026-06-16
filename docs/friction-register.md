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
| 2026-06-07 | harness | infrastructure-deferred | seeded gate-skip-detector + post-action-gate don't recognize tools/verify.py as a validation step, so a push after verify.py false-fires the pre-publish advisory in dev1 sessions | Yes (PR #8) | Cycle 2: verify.py added to gate-skip VALIDATE_PATTERNS + READONLY_PATTERNS and to post-action BUILD_TEST_PATTERNS + EXEMPT_PATTERNS (recognized as verification, exempt from the 3x streak). Pinned by tools/tests/test_gate_skip_and_post_action.py incl. end-to-end push-after-verify check |
| 2026-06-09 | harness | slow-path | dev1 build session launched from the agentic-ops repo: ops PreToolUse hooks resolve `.claude/hooks/*` by cwd-relative path, so a `cd` into dev1 made the ops-only hooks (instantly-invasive-gate, reference-anchor-gate) fail-closed and dead-lock both Bash and Write/Edit; ~5 calls to diagnose | Yes (workaround) | pin the harness cwd to the launch repo (Set-Location is shared across tools) and drive the target by absolute paths + git -C / npm --prefix / uv run --directory, never cd-ing in. Structural kill: launch dev1 sessions from ~/Repo/agentic-dev1 so dev1's own hooks resolve and its floor gate actually fires. Promote to a gotcha memory if it recurs |
| 2026-06-09 | harness | slow-path | RECURRENCE of the row above (cycles 2-5.1 build session): a `cd <dev1> ; gh pr create ...` slipped into one command and leaked the shell cwd into dev1 (gh -R needs no cwd, so the cd was needless). Self-caught, recovered via PowerShell Set-Location; no deadlock this time. cd-guard only matches the `cd X && ...` form, not `cd X ; ...`, so it did not fire | Yes | cd-guard widened (2026-06-16): the path-boundary trailing group required a space before `;`, so it caught `cd X ; cmd` but not the no-space `cd X; cmd`. Replaced with a zero-width `(?=[\s;&|]|$)` lookahead, so both `;`/`|`/`&` forms are blocked with or without a leading space (main()'s `rest` check still distinguishes bare vs chained). Pinned by test_cd_guard semicolon cases (spaced + tight). Carried reflex unchanged: git -C / gh -R / uv run --directory / absolute paths, never a leading cd. See [[gotcha_cross_repo_cwd]] |

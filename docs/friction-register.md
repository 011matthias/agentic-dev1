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

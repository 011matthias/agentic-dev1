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

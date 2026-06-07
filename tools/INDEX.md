# Tools Manifest

Utility scripts for the agentic-dev1 harness. Every `tools/*.py` and `tools/*.sh`
must have a row here; `check-index.py` enforces it in CI and via the pre-commit
hook. Add a one-line row when you add a tool.

| Tool | When to use |
|------|-------------|
| `check-index.py` | CI gate: assert every script in `tools/` has a row in this file. Run `uv run tools/check-index.py`. |
| `friction-watch.py [--format json] [--quiet] [--once-per-day]` | Surface friction-register patterns (concentration, recurrence, stale backlog, memory-sprawl) that should trigger a self-improvement pass. Runs at SessionStart. |
| `session_state.py [--status]` | Shared session-state store: tool/file counters for the session-pressure meter, plus friction candidates queued for the checkpoint drain. |
| `strip-em-dash.py <file>` | Mechanically replace em-dashes with `; ` in a file. Paired with the `em-dash-strip-gate` hook (anti-slop voice discipline). |
| `wire-hooks.py [--check\|--ensure\|--write]` | Idempotently wire or repair the canonical 9-hook enforcement block into `.claude/settings.local.json`. The cross-device recurrence kill (tracked file is the single source of truth). |

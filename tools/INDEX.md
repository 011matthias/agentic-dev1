# Tools Manifest

Utility scripts for the agentic-dev1 harness. Every `tools/*.py` and `tools/*.sh`
must have a row here; `check-index.py` enforces it in CI and via the pre-commit
hook. Add a one-line row when you add a tool.

| Tool | When to use |
|------|-------------|
| `check-architecture.py` | Understand-before-change gate: assert every `products/<name>/` has `ARCHITECTURE.md` + `README.md`, and every concrete product-relative path the map names in backticks exists on disk (the map stays true to the tree). Run `uv run tools/check-architecture.py`. See `rule_dev_loop.md` non-negotiable 1. |
| `check-index.py` | CI gate: assert every script in `tools/` has a row in this file. Run `uv run tools/check-index.py`. |
| `friction-watch.py [--format json] [--quiet] [--once-per-day]` | Surface friction-register patterns (concentration, recurrence, stale backlog, memory-sprawl) that should trigger a self-improvement pass. Runs at SessionStart. |
| `scaffold.py <archetype> <name> [--title T] [--dry-run]` | Stamp a template archetype (website \| app \| game) into `products/<name>`: overlays `templates/_shared` then `templates/<archetype>`, substitutes the product tokens, refuses an existing product or a stub archetype. The Cycle-7 spine; pairs with `comd_new-product`. Run `uv run tools/scaffold.py game my-game`. |
| `session_state.py [--status]` | Shared session-state store: tool/file counters for the session-pressure meter, plus friction candidates queued for the checkpoint drain. |
| `strip-em-dash.py <file>` | Mechanically replace em-dashes with `; ` in a file. Paired with the `em-dash-strip-gate` hook (anti-slop voice discipline). |
| `verify.py [scope] [--json] [--list]` | Behavioral verification bar. Run before claiming a unit of work done and cite the result. `harness` = ruff + INDEX + architecture + pytest; `<product>` = its npm build/verify; `all` (default) = both. `--list` prints discovered product names for the product-discovering CI. See `rule_dev_loop.md` non-negotiable 2. |
| `wire-hooks.py [--check\|--ensure\|--write]` | Idempotently wire or repair the canonical 9-hook enforcement block into `.claude/settings.local.json`. The cross-device recurrence kill (tracked file is the single source of truth). |

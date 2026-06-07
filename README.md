# agentic-dev1

Software-products hub: a single-owner workspace for building and shipping several
products, each self-contained under `products/`. It carries a self-annealing
governance and CI harness (enforcement hooks, a pytest test gate, and a
friction-driven improvement loop) seeded from the agentic-ops system and re-pointed at
software engineering.

See [CLAUDE.md](CLAUDE.md) for the full charter.

## Products

- **[crew](products/crew/)** — single-device pass-and-play party game (Vite + React +
  TypeScript PWA).

## Harness

- `tools/wire-hooks.py` wires the enforcement hooks (self-heals at session start).
- `.github/workflows/ci.yml` runs ruff + the `tools/INDEX.md` gate + the enforcement
  pytest suite, and builds each product.
- `docs/friction-register.md` + `tools/friction-watch.py` drive the self-annealing loop.

## Development

```
uv run --no-project --with pytest pytest tools/tests   # harness tests
uv run tools/wire-hooks.py --check                     # verify hooks wired
cd products/crew && npm install && npm run dev         # run CREW
```

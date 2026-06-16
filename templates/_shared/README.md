# {{PRODUCT_TITLE}}

A `{{ARCHETYPE}}` product scaffolded from the agentic-dev1 catalyzer. Self-contained:
its own source, dependencies, tests, and build live here under `products/{{PRODUCT_NAME}}/`.

## Quickstart

```
npm install        # first time
npm run dev        # local dev server
npm run verify     # the behavioral bar CI runs (typecheck + build + archetype checks)
```

From the repo root, `uv run tools/verify.py {{PRODUCT_NAME}}` runs the same `verify`
script the product-discovering CI runs.

## What this is

See `PRODUCT.md` for the brief (what / who / success metric / scope cut) and
`ARCHITECTURE.md` for the module map and invariants. Fill both before building;
they are the understand-before-change contract `rule_dev_loop` checks.

---
description: Scaffold a new product from a template archetype (the Cycle-7 spine entry point).
---

# /comd_new-product

Bring a new product into being. Wraps `tools/scaffold.py` with the brief-first
discipline so a scaffold starts from a decided spec, not an empty dir. The
Specify phase of `rule_dev_loop`, made the first concrete step.

Usage: `/comd_new-product <archetype> <name>` where archetype is `website`,
`app`, or `game` and name is a lowercase kebab-case slug.

Steps:

1. **Resolve the archetype.** website (Astro), app (Vite + React + TS PWA; also
   DOM games), game (Vite + TS canvas). If the named archetype is still a stub
   (no `templates/<archetype>/package.json`), say so and stop; do not hand-roll
   around it.
2. **Take the brief before scaffolding.** Ask the four PRODUCT.md questions:
   what / who / single success metric (the measured signal + threshold + where
   logged, CREW's measurement-first pattern) / scope cut. A one-line answer each
   is enough; the point is a decided spec, not a form.
3. **Scaffold:** `uv run tools/scaffold.py <archetype> <name> --title "<Title>"`.
   It overlays `templates/_shared` then the archetype into `products/<name>`,
   substitutes the tokens, and refuses to overwrite an existing product.
4. **Fill the brief.** Write the step-2 answers into the scaffolded `PRODUCT.md`,
   and note any stack divergence in `ARCHITECTURE.md`. These are the
   understand-before-change contract the gates check.
5. **Prove it once.** `cd products/<name> && npm install && npm run verify`, then
   cite the PASS. A scaffolded product builds green before its first commit.
6. **Branch and commit.** `product/<name>/scaffold`, first commit, push, open the
   PR. The product-discovering CI picks it up with no yaml edit (it globs
   `products/*/package.json`). Reversible, so it runs autonomously per
   `rule_operating`; only deploy/release sits at the floor.

Scaffolding a product is reversible (delete the dir), so this is autonomous work.
The brief is the gate that keeps a new product from starting unscoped.

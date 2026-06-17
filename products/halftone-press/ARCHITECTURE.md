# Halftone Press: architecture

The module map and the rules that hold across changes. Keep it true to the tree:
`tools/check-architecture.py` gates that every concrete path named here in
backticks exists, so update this in the same change as the code.

## Stack

`website` archetype defaults (see `docs/blueprint.md` for why each was
pre-decided). Record any divergence from the default here with a one-line reason.

## Module map

Fill with the real entry points once they exist. Use concrete backticked paths
(`src/<entry>`) so the freshness gate can check them; leave globs (`src/*`) for
sets that are intentionally open.

| Path | Responsibility |
|------|----------------|
| `src/<entry>` | app entry / mount |

## Blast radius

Before changing a shared module, name every dependent here. A change to a shared
primitive is a change to every user of it (`rule_dev_loop` non-negotiable 1).

## Invariants

The properties that must survive every change. State each as a rule a reviewer
can check, with the reason it exists (the CREW pattern: anonymity rule, no
`StrictMode` double-fire, pure-CSS press-squash, measurement schema). An invariant
without a test is a candidate for one.

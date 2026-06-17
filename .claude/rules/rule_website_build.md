# Website Build (the website specialization of rule_dev_loop)

The always-on constraint for any `website`-archetype work. `rule_dev_loop` says how
one change is built; this says how a SITE is built, naming where design judgment,
the quality bar, and the gates fire. It promotes `docs/website-build-workflow.md`
(the loop, written first for review) into a rule, and is entered via
`/comd_build-site`.

## The one rule that governs the rest

Two things stay separated and never blur:

- **Shared, identical every build:** the quality floor, the tooling, this workflow,
  and the token ARCHITECTURE (`contract.css` roles + scales + the `@theme` binding,
  the primitives, the gate suite). How good and how fast we are is standardized.
- **Fresh, decided per build from the subject:** the palette, the type pairing, the
  layout concept, the one signature element, the copy (the VALUES in `brand.css` +
  the `experimental.fonts` pairing).

The failure mode this rule exists to prevent is infrastructure that becomes a look.
If output starts converging on a house style, the toolkit has failed; that is an
anneal, not an acceptable default. Distinctiveness is the easy path by design: the
brand tokens are decided fresh, `skil_website-design`'s pass-2 critique is
mandatory, and `design-reviewer` is adversarial about template-genericness.

## The loop (maps onto rule_dev_loop)

Intake (Understand+Specify) -> Direction (Plan) -> Compose (Implement) -> Gates
(Verify) -> Visual review (Review) -> Ship (Integrate) -> Anneal (Learn). The full
table, roles, and owner checkpoints are in `docs/website-build-workflow.md`; the
walked steps are in `/comd_build-site`.

## What clears before a site is done

Both halves of the floor, every build:

- **Mechanical** (`npm run verify` static in CI; `verify:full` browser tier
  locally): astro check + build, head/OG/sitemap + links, dead-token, no-raw-values,
  html-validate, axe (0 serious/critical), Lighthouse (perf >= 90, a11y >= 95). The
  per-gate detail + the definition of done are in `templates/website/verify/
  README.md` and `docs/website-build-workflow.md`.
- **Agent-judged** (at Review): `design-reviewer` returns OK or every blocker/major
  is resolved, and `skil_website-quality` scores the web-platform rubric. Design is
  not gated by CI (a judgment is not a pattern match); it is gated by review.

## Roles

- `skil_website-design` decides identity (the process: direction plan + the "would
  I produce this for any other brief?" critique against `docs/website-reference.md`).
- `skil_website-quality` verifies web-platform adequacy (SEO, a11y, CWV, content).
- `design-reviewer` is the independent adversarial visual read of the running build.
- The gate suite (`templates/website/verify/`) is the deterministic floor.
- `frontend-design` (vendored) is the underlying taste authority the design skill
  operationalizes.

## Status

Written 2026-06-17 (website infrastructure, piece 6), promoting
`docs/website-build-workflow.md` to a rule once the infrastructure it orchestrates
(tokens, primitives, both skills, the gate suite, the asset pipeline) was built and
merged. Entered via `/comd_build-site`. Pairs with `rule_dev_loop` (the spine it
specializes), `rule_testing` (the Verify phase per archetype), and `rule_code_review`
(the human review side).

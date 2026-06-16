# Testing (the Verify phase, made concrete per archetype)

`rule_dev_loop` non-negotiable 2 states the principle: verify behavior, not
state; cite an executed check. `rule_code_review` covers the correctness-REVIEW
side of the same phase. This rule covers the testing side: what a check must do
to count, which verification layer each property belongs in, and the
per-archetype verify profile that wires it so `tools/verify.py` and the
product-discovering CI pick it up with no central edit.

It pairs with `skil_crew-verify`, which is its first concrete instance, and the
`design-reviewer` agent, which is the agent-judged half.

## What counts as a test

A check earns its place only if it would FAIL when the behavior regresses. A
green check that cannot catch the failure mode is verification theater, and it is
worse than no check: it certifies a property it never tested.

- **Assert behavior, not state.** "It compiled", "the file wrote", "the build is
  green" are state. The test must exercise the behavior and read the result: the
  logged event, the rendered DOM, the persisted value. `skil_crew-verify` drives
  a real Confessions round and reads `crew_logs_v1`; it does not grep the source
  for the anonymity rule.
- **Prove the test bites.** For anything load-bearing (an invariant a user pays
  for, a privacy rule, a measurement schema), confirm the test fails on a real
  regression before trusting it green: inject the violation, watch it go red,
  revert. The `skil_crew-verify` anonymity assertion was mutation-tested this way
  (a novel leak key, a re-enabled StrictMode, a double-log all tripped it). A
  test you have only ever seen pass is an untested test.
- **Tight assertions over loose ones.** Assert the reveal payload keys are within
  the allow-set, not merely that the count looks plausible. A loose check passes
  through the regression it was meant to stop.

## Two layers: mechanical and agent-judged

Most properties have a deterministic pass/fail and belong in the mechanical layer.
Some do not, and forcing them into a green/red gate produces theater; they belong
in the agent-judged layer instead.

- **Mechanical** (`tools/verify.py` profiles + CI): typecheck, build, the
  behavioral round, schema and invariant assertions, Lighthouse budgets, link
  checks. Deterministic, runs unattended, blocks the merge in CI.
- **Agent-judged** (a skill or agent, run at Review): game feel
  (`skil_game-feel-review`) and visual design (`design-reviewer`). These score a
  running build against a rubric a regex cannot encode. They report; a human
  acts. They do not gate CI, because a judgment is not a pattern match.

Put each property in the lower layer that can hold it. A property that can be a
deterministic assertion should be one, not an agent's opinion.

## Per-archetype verify profiles

Each template's npm `verify` script is pre-wired so a scaffolded product joins the
bar and CI with no central edit (the `skil_crew-verify` registration pattern,
generalized). The floor for every archetype is install, typecheck, build; each
adds the behavioral layer its shape needs:

- **website**: plus a Lighthouse budget (performance >= 90, accessibility >= 95),
  a link check, and meta/OG presence. Visual taste is `design-reviewer`'s, not the
  budget's.
- **app**: plus a Playwright smoke (boots, the core flow clicks through) and a
  valid PWA manifest.
- **game**: plus a Playwright smoke; game feel stays agent-judged via
  `skil_game-feel-review`, never forced into a numeric gate.

## Registration and portability

A product self-registers by carrying an npm `verify` script; `verify.py` runs it
in place of `build`, and the CI `products` job discovers it by globbing
`products/*/package.json`. There is no list to keep in sync.

A verify profile that needs a heavy optional dependency (a headless browser) must
degrade, not break the bar everywhere the dependency is absent. The
`skil_crew-verify` pattern is the reference: the browser-driven tier SKIPs loudly
when chromium is missing while the static tier still gates, so `verify.py` stays
runnable and CI (node + uv, no browser) passes the static checks without a
browser-install step. The full behavioral proof runs locally and on demand, where
a browser exists. A SKIP is announced, never silent; a failure after the
dependency IS present is a real FAIL, never a skip.

## Calibration

- **Trivial** (a typo, a one-line localized change): the existing profile is the
  test; no new check is owed.
- **Standard** (a feature, a flow): a behavioral assertion that exercises the new
  path, added to the product's verify or its smoke.
- **High-stakes** (an invariant a user pays for, a privacy rule, a measurement or
  persisted-data schema): a mechanical assertion that is mutation-proven to bite,
  plus the relevant agent-judged review at Review.

## Status

Written 2026-06-16 (Cycle 8), with the `design-reviewer` agent. Makes
`rule_dev_loop` non-negotiable 2 concrete per archetype and names the test-adequacy
bar (`prove it bites`) the `skil_crew-verify` build established. Pairs with
`rule_code_review` (the correctness-review side of the Verify phase),
`skil_crew-verify` (the reference mechanical instance), and `skil_game-feel-review`
plus `design-reviewer` (the agent-judged layer). The per-archetype profiles attach
to `tools/scaffold.py`'s templates as each archetype is filled.

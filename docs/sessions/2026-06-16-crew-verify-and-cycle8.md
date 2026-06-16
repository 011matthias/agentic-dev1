# Checkpoint 2026-06-16: skil_crew-verify + Cycle-8 quality (+ a parallel-session collision)

Scope: harness + products/crew | Band: autonomous throughout (feature branch ->
PR -> CI-green merge; floor untouched). Run from a dev1-rooted session, so the
hooks were live (9/9). A second session shared this checkout for the first half;
that collision and its recovery are recorded below and already annealed.

## Done (all merged green on main `d106651`)

- **PR #20**: landed the prior session's dangling Cycle-6 checkpoint (session log
  + PowerShell friction row) that was committed-but-unpushed on a stale branch.
- **PR #21: skil_crew-verify** (CURATION action 4, closes the Cycle-4 anonymity
  anneal). `products/crew/verify/round.py` drives a real headless Confessions
  round (webapp-testing approach, inline vite dev server) and asserts the
  rule_code_review invariants from the persisted `crew_logs_v1`: Confessions
  anonymity (no per-player vector logged; reveal keys within the aggregate
  allow-set), no measurement double-fire (exact event counts), schema. Plus
  browser-free static tripwires (StrictMode absent, press-squash CSS +
  useButtonJuice class-free, the three localStorage keys + snapshot `v`, the event
  vocabulary). Two tiers: the runtime tier SKIPs cleanly without chromium so the
  bar stays portable. Wired as products/crew npm `verify`; verify.py auto-discovers
  it. Each substantive assertion mutation-tested to bite (a novel leak key, a
  re-enabled StrictMode, a double-log). SKILL.md is the recipe.
- **PR #22: anneal** of the parallel-worktree collision (gotcha_shared_worktree
  memory + 2 friction rows).
- **PR #25: Cycle-8 quality** (the agent-judged + discipline half). `rule_testing`
  (the Verify phase made concrete: test adequacy "prove it bites", the mechanical
  vs agent-judged layers, the per-archetype verify profiles) and the
  `design-reviewer` agent (the visual twin of code-reviewer: boots the running
  product, screenshots it, judges adversarially against frontend-design).
  rules/README.md refreshed to the accurate written set.

## Verified

- `verify.py all` PASS 5/5 locally on the unified main (harness + crew behavioral
  round with browser). `verify.py harness` PASS 4/4 after the Cycle-8 docs.
- CI green on unified main (all 3 jobs). The **cross-PR seam** the Cycle-7 session
  flagged (its product-discovering CI runs `verify.py crew` = the Playwright round
  on a node+uv runner with no chromium) is RESOLVED by design: round.py SKIPs the
  runtime tier without a browser, static still gates, exit 0. Confirmed by reading
  the CI `products` job log and by a local no-browser simulation
  (`PLAYWRIGHT_BROWSERS_PATH` to an empty dir -> SKIP, exit 0). No CI
  browser-install step is needed.
- design-reviewer validated by driving its method on the running CREW build
  (desktop + mobile screenshots, judged against the lenses): produced a real
  review (2 majors: secondary-text contrast at arm's length, muted hero/wordmark
  for a party game; 2 minors). NOT yet invoked as a registered agent type (see
  friction: project agents load at session start).

## Current state (main `d106651`)

- No open PRs. Working tree clean, worktree uncontested (the parallel session
  finished + shipped Cycle 7 in #23/#24 and cleared its WIP). Friction register:
  6 rows; the 3 from this session resolved.
- Both work streams (my crew-verify/Cycle-8 + the parallel Cycle-7 spine) are
  integrated and verified together on one green main.

## Next steps (Cycle 8 tail -> Cycle 9)

The next arc is a genuine fork; pick by priority (the Cycle-8 agents half is done):

1. **Fill the `app` template** (unblocked by skil_crew-verify; no Workflow opt-in):
   extract products/crew into a clean Vite+React+TS PWA skeleton + package.json
   (so scaffold.py accepts it) + a generalized Playwright-smoke verify profile
   modeled on round.py. Directly continues the verify-profile thread.
2. **Fill the `website` template**: closest to the revenue north star (Cycle-10 =
   CREW's landing page = a website), but the blueprint sources it from the
   un-run Cycle-6 GitHub harvest (Astro starters); needs either a Workflow
   (multi-agent) opt-in for the harvest, or a from-scratch Astro+Tailwind build.
3. **skil_website-quality** (the other Cycle-8 quality skill: SEO, OG, a11y, perf);
   most useful once a website template exists.
4. design-reviewer is invocable as an agent type from the NEXT session start.

## Decisions

- Built skil_crew-verify product-local (`products/crew/verify/round.py`) rather
  than under the skill dir, so the product owns its test and npm `verify`
  references a local path; the skill is the recipe/knowledge doc.
- Wired the heavy Playwright round into npm `verify` (not a separate manual path)
  but made it degrade gracefully, so verify.py stays portable and CI needs no
  browser. Chose this over a static-only wired check (too weak for the anonymity
  anneal) and over a browser-in-CI step (unnecessary given the SKIP).
- design (visual) stays an agent-judged review (design-reviewer), never a CI gate;
  rule_testing puts each property in the lowest layer that can hold it.
- Checkpointed at high context after the Cycle-8 arc rather than starting the next
  big arc, to avoid a sprawling late-session build; the next arc starts fresh.

## Strategic feedback

- **Worked**: the lean-autonomous ship chain ran clean across 4 merges; the
  push-by-SHA-then-guarded-disentangle recovery turned a shared-worktree HEAD-stomp
  into zero data loss; mutation-testing the verifier (proving it bites) caught the
  one real gap (a too-loose press-squash check) before merge.
- **Suggestion**: when running two sessions, give each its own `git worktree` from
  the start (per gotcha_shared_worktree); the collision cost ~4 calls to recover
  even handled well.
- **Health**: main green and fully integrated; worktree uncontested; one transient
  infra hiccup (the model classifier was briefly unavailable for Write/Agent twice,
  self-recovered on retry), no process failure.
